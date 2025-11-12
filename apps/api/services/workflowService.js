/**
 * Workflow Service
 * Business logic for workflow management
 */

const { PrismaClient } = require('@prisma/client');
const WorkflowExecutor = require('./workflows/workflowExecutor');
const NodeRegistry = require('./workflows/nodeRegistry');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const executor = new WorkflowExecutor();
const nodeRegistry = new NodeRegistry();

// ============================================
// WORKFLOW CRUD OPERATIONS
// ============================================

/**
 * Create a new workflow
 */
async function createWorkflow(userId, workflowData) {
  try {
    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name: workflowData.name,
        description: workflowData.description,
        triggerType: workflowData.triggerType || 'MANUAL',
        triggerConfig: workflowData.triggerConfig || {},
        nodes: workflowData.nodes || [],
        connections: workflowData.connections || [],
        status: workflowData.status || 'DRAFT',
        isTemplate: workflowData.isTemplate || false,
        maxConcurrentExecutions: workflowData.maxConcurrentExecutions || 1,
        timeoutSeconds: workflowData.timeoutSeconds || 300,
        retryOnFailure: workflowData.retryOnFailure !== undefined ? workflowData.retryOnFailure : true,
        maxRetries: workflowData.maxRetries || 3
      }
    });

    logger.info('Workflow created', { workflowId: workflow.id, userId });
    return workflow;
  } catch (error) {
    logger.error('Failed to create workflow', { error: error.message, userId });
    throw new Error('Failed to create workflow: ' + error.message);
  }
}

/**
 * Get workflow by ID
 */
async function getWorkflow(workflowId, userId) {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId
      },
      include: {
        executions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        schedules: true,
        webhooks: true
      }
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    return workflow;
  } catch (error) {
    logger.error('Failed to get workflow', { error: error.message, workflowId, userId });
    throw error;
  }
}

/**
 * List all workflows for a user
 */
async function listWorkflows(userId, filters = {}) {
  try {
    const where = { userId };

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.triggerType) {
      where.triggerType = filters.triggerType;
    }
    if (filters.isTemplate !== undefined) {
      where.isTemplate = filters.isTemplate;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const workflows = await prisma.workflow.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        _count: {
          select: { executions: true }
        }
      }
    });

    const total = await prisma.workflow.count({ where });

    return {
      workflows,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0
    };
  } catch (error) {
    logger.error('Failed to list workflows', { error: error.message, userId });
    throw new Error('Failed to list workflows: ' + error.message);
  }
}

/**
 * Update workflow
 */
async function updateWorkflow(workflowId, userId, updates) {
  try {
    // Verify ownership
    const existing = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!existing) {
      throw new Error('Workflow not found');
    }

    // Prevent updating templates
    if (existing.isTemplate && !updates.isTemplate) {
      throw new Error('Cannot modify template workflows');
    }

    const workflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        name: updates.name,
        description: updates.description,
        triggerType: updates.triggerType,
        triggerConfig: updates.triggerConfig,
        nodes: updates.nodes,
        connections: updates.connections,
        status: updates.status,
        maxConcurrentExecutions: updates.maxConcurrentExecutions,
        timeoutSeconds: updates.timeoutSeconds,
        retryOnFailure: updates.retryOnFailure,
        maxRetries: updates.maxRetries,
        updatedAt: new Date()
      }
    });

    logger.info('Workflow updated', { workflowId, userId });
    return workflow;
  } catch (error) {
    logger.error('Failed to update workflow', { error: error.message, workflowId, userId });
    throw error;
  }
}

/**
 * Delete workflow
 */
async function deleteWorkflow(workflowId, userId) {
  try {
    // Verify ownership
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Prevent deleting templates
    if (workflow.isTemplate) {
      throw new Error('Cannot delete template workflows');
    }

    // Check for active executions
    const activeExecutions = await prisma.workflowExecution.count({
      where: {
        workflowId,
        status: { in: ['QUEUED', 'RUNNING'] }
      }
    });

    if (activeExecutions > 0) {
      throw new Error('Cannot delete workflow with active executions');
    }

    // Delete associated data
    await prisma.$transaction([
      prisma.workflowExecutionLog.deleteMany({
        where: {
          execution: { workflowId }
        }
      }),
      prisma.workflowExecution.deleteMany({
        where: { workflowId }
      }),
      prisma.workflowSchedule.deleteMany({
        where: { workflowId }
      }),
      prisma.workflowWebhook.deleteMany({
        where: { workflowId }
      }),
      prisma.workflow.delete({
        where: { id: workflowId }
      })
    ]);

    logger.info('Workflow deleted', { workflowId, userId });
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete workflow', { error: error.message, workflowId, userId });
    throw error;
  }
}

// ============================================
// WORKFLOW EXECUTION
// ============================================

/**
 * Execute a workflow
 */
async function executeWorkflow(workflowId, userId, input = {}, triggeredBy = 'manual') {
  try {
    // Verify ownership and status
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
        status: { in: ['ACTIVE', 'DRAFT'] }
      }
    });

    if (!workflow) {
      throw new Error('Workflow not found or not active');
    }

    // Check concurrent execution limit
    const runningExecutions = await prisma.workflowExecution.count({
      where: {
        workflowId,
        status: { in: ['QUEUED', 'RUNNING'] }
      }
    });

    if (runningExecutions >= (workflow.maxConcurrentExecutions || 1)) {
      throw new Error('Maximum concurrent executions reached');
    }

    // Execute workflow
    const result = await executor.executeWorkflow(workflowId, userId, input, triggeredBy);

    logger.info('Workflow execution started', { workflowId, executionId: result.executionId, userId });
    return result;
  } catch (error) {
    logger.error('Failed to execute workflow', { error: error.message, workflowId, userId });
    throw error;
  }
}

/**
 * Get execution status
 */
async function getExecution(executionId, userId) {
  try {
    const execution = await prisma.workflowExecution.findFirst({
      where: {
        id: executionId,
        userId
      },
      include: {
        workflow: {
          select: { id: true, name: true }
        },
        logs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    return execution;
  } catch (error) {
    logger.error('Failed to get execution', { error: error.message, executionId, userId });
    throw error;
  }
}

/**
 * List workflow executions
 */
async function listExecutions(userId, filters = {}) {
  try {
    const where = { userId };

    if (filters.workflowId) {
      where.workflowId = filters.workflowId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.triggeredBy) {
      where.triggeredBy = filters.triggeredBy;
    }

    const executions = await prisma.workflowExecution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        workflow: {
          select: { id: true, name: true }
        }
      }
    });

    const total = await prisma.workflowExecution.count({ where });

    return {
      executions,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0
    };
  } catch (error) {
    logger.error('Failed to list executions', { error: error.message, userId });
    throw new Error('Failed to list executions: ' + error.message);
  }
}

/**
 * Cancel execution
 */
async function cancelExecution(executionId, userId) {
  try {
    const execution = await prisma.workflowExecution.findFirst({
      where: {
        id: executionId,
        userId,
        status: { in: ['QUEUED', 'RUNNING'] }
      }
    });

    if (!execution) {
      throw new Error('Execution not found or already completed');
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
        error: { message: 'Cancelled by user' }
      }
    });

    logger.info('Execution cancelled', { executionId, userId });
    return { success: true };
  } catch (error) {
    logger.error('Failed to cancel execution', { error: error.message, executionId, userId });
    throw error;
  }
}

// ============================================
// TEMPLATES
// ============================================

/**
 * Get workflow templates
 */
async function getTemplates(filters = {}) {
  try {
    const where = { isTemplate: true };

    if (filters.triggerType) {
      where.triggerType = filters.triggerType;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const templates = await prisma.workflow.findMany({
      where,
      orderBy: { totalExecutions: 'desc' },
      take: filters.limit || 20
    });

    return templates;
  } catch (error) {
    logger.error('Failed to get templates', { error: error.message });
    throw new Error('Failed to get templates: ' + error.message);
  }
}

/**
 * Create workflow from template
 */
async function createFromTemplate(templateId, userId, customization = {}) {
  try {
    const template = await prisma.workflow.findFirst({
      where: {
        id: templateId,
        isTemplate: true
      }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Create new workflow from template
    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name: customization.name || template.name,
        description: customization.description || template.description,
        triggerType: template.triggerType,
        triggerConfig: customization.triggerConfig || template.triggerConfig,
        nodes: template.nodes,
        connections: template.connections,
        status: 'DRAFT',
        isTemplate: false,
        maxConcurrentExecutions: template.maxConcurrentExecutions,
        timeoutSeconds: template.timeoutSeconds,
        retryOnFailure: template.retryOnFailure,
        maxRetries: template.maxRetries
      }
    });

    logger.info('Workflow created from template', { workflowId: workflow.id, templateId, userId });
    return workflow;
  } catch (error) {
    logger.error('Failed to create from template', { error: error.message, templateId, userId });
    throw error;
  }
}

// ============================================
// NODE METADATA
// ============================================

/**
 * Get all available node types and metadata
 */
async function getNodeMetadata() {
  try {
    const metadata = nodeRegistry.getAllNodeMetadata();
    return metadata;
  } catch (error) {
    logger.error('Failed to get node metadata', { error: error.message });
    throw new Error('Failed to get node metadata: ' + error.message);
  }
}

/**
 * Test a single node with provided input
 */
async function testNode(userId, nodeData, testInput = {}) {
  try {
    logger.info('Testing node', { userId, nodeType: nodeData.type });

    // Get node executor from registry
    const nodeExecutor = nodeRegistry.getNodeExecutor(nodeData.type);

    if (!nodeExecutor) {
      throw new Error(`No executor found for node type: ${nodeData.type}`);
    }

    // Create a minimal execution context for testing
    const testContext = {
      userId,
      variables: {},
      executionId: 'test_' + Date.now(),
      workflowId: 'test',
      input: testInput
    };

    // Execute the node
    const startTime = Date.now();
    const result = await nodeExecutor.execute(nodeData, testInput, testContext);
    const duration = Date.now() - startTime;

    logger.info('Node test completed', {
      userId,
      nodeType: nodeData.type,
      duration,
      success: true
    });

    return {
      success: true,
      result,
      duration,
      executedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Node test failed', {
      error: error.message,
      userId,
      nodeType: nodeData?.type
    });

    return {
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      },
      executedAt: new Date().toISOString()
    };
  }
}

// ============================================
// SCHEDULES
// ============================================

/**
 * Create workflow schedule
 */
async function createSchedule(workflowId, userId, scheduleData) {
  try {
    // Verify workflow ownership
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const schedule = await prisma.workflowSchedule.create({
      data: {
        workflowId,
        cronExpression: scheduleData.cronExpression,
        timezone: scheduleData.timezone || 'UTC',
        isActive: scheduleData.isActive !== undefined ? scheduleData.isActive : true,
        input: scheduleData.input || {}
      }
    });

    logger.info('Schedule created', { scheduleId: schedule.id, workflowId, userId });
    return schedule;
  } catch (error) {
    logger.error('Failed to create schedule', { error: error.message, workflowId, userId });
    throw error;
  }
}

/**
 * Update workflow schedule
 */
async function updateSchedule(scheduleId, userId, updates) {
  try {
    // Verify ownership
    const schedule = await prisma.workflowSchedule.findFirst({
      where: {
        id: scheduleId,
        workflow: { userId }
      }
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const updated = await prisma.workflowSchedule.update({
      where: { id: scheduleId },
      data: {
        cronExpression: updates.cronExpression,
        timezone: updates.timezone,
        isActive: updates.isActive,
        input: updates.input
      }
    });

    logger.info('Schedule updated', { scheduleId, userId });
    return updated;
  } catch (error) {
    logger.error('Failed to update schedule', { error: error.message, scheduleId, userId });
    throw error;
  }
}

/**
 * Delete workflow schedule
 */
async function deleteSchedule(scheduleId, userId) {
  try {
    // Verify ownership
    const schedule = await prisma.workflowSchedule.findFirst({
      where: {
        id: scheduleId,
        workflow: { userId }
      }
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    await prisma.workflowSchedule.delete({
      where: { id: scheduleId }
    });

    logger.info('Schedule deleted', { scheduleId, userId });
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete schedule', { error: error.message, scheduleId, userId });
    throw error;
  }
}

// ============================================
// WEBHOOKS
// ============================================

/**
 * Create workflow webhook
 */
async function createWebhook(workflowId, userId) {
  try {
    // Verify workflow ownership
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Generate unique webhook URL
    const webhookId = require('crypto').randomBytes(16).toString('hex');

    const webhook = await prisma.workflowWebhook.create({
      data: {
        workflowId,
        url: `/api/workflows/webhook/${webhookId}`,
        method: 'POST',
        isActive: true
      }
    });

    logger.info('Webhook created', { webhookId: webhook.id, workflowId, userId });
    return webhook;
  } catch (error) {
    logger.error('Failed to create webhook', { error: error.message, workflowId, userId });
    throw error;
  }
}

/**
 * Delete workflow webhook
 */
async function deleteWebhook(webhookId, userId) {
  try {
    // Verify ownership
    const webhook = await prisma.workflowWebhook.findFirst({
      where: {
        id: webhookId,
        workflow: { userId }
      }
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    await prisma.workflowWebhook.delete({
      where: { id: webhookId }
    });

    logger.info('Webhook deleted', { webhookId, userId });
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete webhook', { error: error.message, webhookId, userId });
    throw error;
  }
}

/**
 * Execute workflow via webhook
 */
async function executeViaWebhook(webhookPath, payload) {
  try {
    // Find webhook by URL
    const webhook = await prisma.workflowWebhook.findFirst({
      where: {
        url: { endsWith: webhookPath },
        isActive: true
      },
      include: {
        workflow: true
      }
    });

    if (!webhook) {
      throw new Error('Webhook not found or inactive');
    }

    // Increment webhook usage
    await prisma.workflowWebhook.update({
      where: { id: webhook.id },
      data: {
        lastTriggeredAt: new Date(),
        totalTriggers: { increment: 1 }
      }
    });

    // Execute workflow
    const result = await executor.executeWorkflow(
      webhook.workflowId,
      webhook.workflow.userId,
      payload,
      'webhook'
    );

    logger.info('Workflow triggered via webhook', {
      webhookId: webhook.id,
      workflowId: webhook.workflowId,
      executionId: result.executionId
    });

    return result;
  } catch (error) {
    logger.error('Failed to execute via webhook', { error: error.message, webhookPath });
    throw error;
  }
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get workflow statistics
 */
async function getWorkflowStats(userId) {
  try {
    const stats = await prisma.workflow.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: {
        totalExecutions: true,
        successfulExecutions: true,
        failedExecutions: true
      }
    });

    const activeExecutions = await prisma.workflowExecution.count({
      where: {
        userId,
        status: { in: ['QUEUED', 'RUNNING'] }
      }
    });

    const recentExecutions = await prisma.workflowExecution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        workflow: {
          select: { name: true }
        }
      }
    });

    return {
      totalWorkflows: stats._count.id || 0,
      totalExecutions: stats._sum.totalExecutions || 0,
      successfulExecutions: stats._sum.successfulExecutions || 0,
      failedExecutions: stats._sum.failedExecutions || 0,
      activeExecutions,
      successRate: stats._sum.totalExecutions > 0
        ? ((stats._sum.successfulExecutions || 0) / stats._sum.totalExecutions * 100).toFixed(2)
        : 0,
      recentExecutions
    };
  } catch (error) {
    logger.error('Failed to get workflow stats', { error: error.message, userId });
    throw new Error('Failed to get workflow stats: ' + error.message);
  }
}

module.exports = {
  // CRUD
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,

  // Execution
  executeWorkflow,
  getExecution,
  listExecutions,
  cancelExecution,

  // Templates
  getTemplates,
  createFromTemplate,

  // Node metadata
  getNodeMetadata,
  testNode,

  // Schedules
  createSchedule,
  updateSchedule,
  deleteSchedule,

  // Webhooks
  createWebhook,
  deleteWebhook,
  executeViaWebhook,

  // Stats
  getWorkflowStats
};
