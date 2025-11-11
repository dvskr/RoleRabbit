/**
 * Workflow Execution Engine
 * Executes workflows node by node, handles data passing, conditions, and errors
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const NodeRegistry = require('./nodeRegistry');
const { logger } = require('../../utils/logger');

class WorkflowExecutor {
  constructor() {
    this.nodeRegistry = new NodeRegistry();
    this.activeExecutions = new Map(); // executionId -> execution context
  }

  /**
   * Execute a workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} userId - User ID
   * @param {object} input - Input data for the workflow
   * @param {string} triggeredBy - How the workflow was triggered
   * @returns {Promise<object>} - Execution result
   */
  async executeWorkflow(workflowId, userId, input = {}, triggeredBy = 'manual') {
    logger.info(`Starting workflow execution: ${workflowId}`);

    // Load workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status !== 'ACTIVE' && workflow.status !== 'DRAFT') {
      throw new Error(`Workflow is not active: ${workflow.status}`);
    }

    // Check concurrent execution limit
    const runningExecutions = await prisma.workflowExecution.count({
      where: {
        workflowId,
        status: 'RUNNING'
      }
    });

    if (runningExecutions >= (workflow.maxConcurrentExecutions || 1)) {
      throw new Error(`Max concurrent executions reached: ${workflow.maxConcurrentExecutions}`);
    }

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId,
        status: 'QUEUED',
        input,
        triggeredBy,
        metadata: {
          workflowName: workflow.name,
          workflowVersion: workflow.updatedAt
        }
      }
    });

    // Store execution context
    const context = {
      executionId: execution.id,
      workflowId,
      userId,
      workflow,
      input,
      output: {},
      variables: {}, // Store intermediate results
      completedNodes: [],
      failedNodes: [],
      currentNodeId: null,
      startTime: Date.now()
    };

    this.activeExecutions.set(execution.id, context);

    // Start execution (async)
    this._executeAsync(context).catch(err => {
      logger.error(`Workflow execution error: ${execution.id}`, err);
    });

    return {
      executionId: execution.id,
      status: 'QUEUED',
      message: 'Workflow execution started'
    };
  }

  /**
   * Internal async execution
   */
  async _executeAsync(context) {
    try {
      // Update status to RUNNING
      await prisma.workflowExecution.update({
        where: { id: context.executionId },
        data: {
          status: 'RUNNING',
          startedAt: new Date()
        }
      });

      // Execute nodes
      const result = await this._executeNodes(context);

      // Calculate duration
      const duration = Date.now() - context.startTime;

      // Update execution record - SUCCESS
      await prisma.workflowExecution.update({
        where: { id: context.executionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          duration,
          output: result,
          completedNodes: context.completedNodes,
          failedNodes: context.failedNodes
        }
      });

      // Update workflow statistics
      await prisma.workflow.update({
        where: { id: context.workflowId },
        data: {
          totalExecutions: { increment: 1 },
          successfulExecutions: { increment: 1 },
          lastExecutedAt: new Date()
        }
      });

      logger.info(`Workflow execution completed: ${context.executionId} in ${duration}ms`);

    } catch (error) {
      logger.error(`Workflow execution failed: ${context.executionId}`, error);

      const duration = Date.now() - context.startTime;

      // Update execution record - FAILED
      await prisma.workflowExecution.update({
        where: { id: context.executionId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          duration,
          error: {
            message: error.message,
            stack: error.stack,
            nodeId: context.currentNodeId
          },
          completedNodes: context.completedNodes,
          failedNodes: context.failedNodes
        }
      });

      // Update workflow statistics
      await prisma.workflow.update({
        where: { id: context.workflowId },
        data: {
          totalExecutions: { increment: 1 },
          failedExecutions: { increment: 1 },
          lastExecutedAt: new Date()
        }
      });

      // Retry if configured
      if (context.workflow.retryOnFailure && !context.retryAttempt) {
        const maxRetries = context.workflow.maxRetries || 3;
        logger.info(`Retrying workflow (max ${maxRetries} retries)`);
        // TODO: Implement retry logic with backoff
      }

    } finally {
      // Clean up
      this.activeExecutions.delete(context.executionId);
    }
  }

  /**
   * Execute workflow nodes in order
   */
  async _executeNodes(context) {
    const { workflow } = context;
    const nodes = workflow.nodes || [];
    const connections = workflow.connections || [];

    if (nodes.length === 0) {
      throw new Error('Workflow has no nodes');
    }

    // Find trigger node (starting point)
    const triggerNode = nodes.find(n =>
      n.type.startsWith('TRIGGER_') || n.isStart
    );

    if (!triggerNode) {
      throw new Error('Workflow has no trigger node');
    }

    // Execute from trigger node
    const result = await this._executeNode(context, triggerNode.id, context.input);

    // Find next nodes and execute them
    await this._executeNextNodes(context, triggerNode.id, result);

    return context.output;
  }

  /**
   * Execute a single node
   */
  async _executeNode(context, nodeId, input) {
    const { workflow, executionId } = context;
    const node = workflow.nodes.find(n => n.id === nodeId);

    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    context.currentNodeId = nodeId;

    const startTime = Date.now();

    // Log node start
    await this._logNodeExecution(executionId, node, 'info', 'Node execution started', {
      input,
      startTime: new Date()
    });

    try {
      // Get node executor from registry
      const nodeExecutor = this.nodeRegistry.getNodeExecutor(node.type);

      if (!nodeExecutor) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      // Execute node
      const result = await nodeExecutor.execute(node, input, context);

      const duration = Date.now() - startTime;

      // Log node success
      await this._logNodeExecution(executionId, node, 'info', 'Node execution completed', {
        output: result,
        duration,
        success: true
      });

      // Store result in variables
      if (node.outputVariable) {
        context.variables[node.outputVariable] = result;
      }

      // Mark as completed
      context.completedNodes.push(nodeId);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Log node failure
      await this._logNodeExecution(executionId, node, 'error', `Node execution failed: ${error.message}`, {
        error: {
          message: error.message,
          stack: error.stack
        },
        duration,
        success: false
      });

      // Mark as failed
      context.failedNodes.push(nodeId);

      throw error;
    }
  }

  /**
   * Find and execute next nodes based on connections
   */
  async _executeNextNodes(context, fromNodeId, previousOutput) {
    const { workflow } = context;
    const connections = workflow.connections || [];

    // Find outgoing connections from this node
    const outgoingConnections = connections.filter(c => c.from === fromNodeId);

    if (outgoingConnections.length === 0) {
      // No more nodes to execute
      context.output = previousOutput;
      return;
    }

    // Execute next nodes
    for (const connection of outgoingConnections) {
      const nextNodeId = connection.to;

      // Check if this is a conditional connection
      if (connection.condition) {
        const conditionMet = await this._evaluateCondition(connection.condition, previousOutput, context);
        if (!conditionMet) {
          continue; // Skip this branch
        }
      }

      // Execute next node
      const result = await this._executeNode(context, nextNodeId, previousOutput);

      // Continue to nodes after this one
      await this._executeNextNodes(context, nextNodeId, result);
    }
  }

  /**
   * Evaluate a condition
   */
  async _evaluateCondition(condition, data, context) {
    // Simple condition evaluation
    // Format: { field: 'score', operator: '>=', value: 7 }
    const { field, operator, value } = condition;

    const fieldValue = this._getNestedValue(data, field);

    switch (operator) {
      case '==':
      case '===':
        return fieldValue === value;
      case '!=':
      case '!==':
        return fieldValue !== value;
      case '>':
        return fieldValue > value;
      case '>=':
        return fieldValue >= value;
      case '<':
        return fieldValue < value;
      case '<=':
        return fieldValue <= value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'startsWith':
        return String(fieldValue).startsWith(value);
      case 'endsWith':
        return String(fieldValue).endsWith(value);
      default:
        return true;
    }
  }

  /**
   * Get nested value from object
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Log node execution
   */
  async _logNodeExecution(executionId, node, level, message, data = {}) {
    try {
      await prisma.workflowExecutionLog.create({
        data: {
          executionId,
          nodeId: node.id,
          nodeName: node.name || node.label,
          nodeType: node.type,
          level,
          message,
          data,
          startedAt: data.startTime,
          completedAt: data.duration ? new Date(Date.now()) : null,
          duration: data.duration,
          success: data.success
        }
      });
    } catch (error) {
      logger.error('Failed to log node execution:', error);
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        logs: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return execution;
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId) {
    const context = this.activeExecutions.get(executionId);

    if (context) {
      context.cancelled = true;
      this.activeExecutions.delete(executionId);
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
    });

    return { success: true, message: 'Execution cancelled' };
  }
}

module.exports = WorkflowExecutor;
