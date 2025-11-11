/**
 * Workflow Routes
 * API endpoints for n8n-style workflow automation
 */

const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getExecution,
  listExecutions,
  cancelExecution,
  getTemplates,
  createFromTemplate,
  getNodeMetadata,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createWebhook,
  deleteWebhook,
  executeViaWebhook,
  getWorkflowStats
} = require('../services/workflowService');

module.exports = async function workflowRoutes(fastify) {
  // ============================================
  // WORKFLOW CRUD ROUTES
  // ============================================

  /**
   * POST /api/workflows
   * Create a new workflow
   */
  fastify.post('/api/workflows', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const workflowData = request.body;

      // Validate required fields
      if (!workflowData.name) {
        return reply.status(400).send({
          success: false,
          error: 'Workflow name is required'
        });
      }

      const workflow = await createWorkflow(userId, workflowData);

      return reply.status(201).send({
        success: true,
        workflow
      });
    } catch (error) {
      logger.error('Failed to create workflow', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create workflow'
      });
    }
  });

  /**
   * GET /api/workflows
   * List all workflows for the authenticated user
   */
  fastify.get('/api/workflows', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const filters = {
        status: request.query.status,
        triggerType: request.query.triggerType,
        isTemplate: request.query.isTemplate === 'true',
        search: request.query.search,
        limit: parseInt(request.query.limit) || 50,
        offset: parseInt(request.query.offset) || 0
      };

      const result = await listWorkflows(userId, filters);

      return reply.send({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Failed to list workflows', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to list workflows'
      });
    }
  });

  /**
   * GET /api/workflows/:id
   * Get a specific workflow by ID
   */
  fastify.get('/api/workflows/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const workflowId = request.params.id;

      const workflow = await getWorkflow(workflowId, userId);

      return reply.send({
        success: true,
        workflow
      });
    } catch (error) {
      logger.error('Failed to get workflow', { error: error.message, workflowId: request.params.id });
      return reply.status(error.message === 'Workflow not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to get workflow'
      });
    }
  });

  /**
   * PUT /api/workflows/:id
   * Update a workflow
   */
  fastify.put('/api/workflows/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const workflowId = request.params.id;
      const updates = request.body;

      const workflow = await updateWorkflow(workflowId, userId, updates);

      return reply.send({
        success: true,
        workflow
      });
    } catch (error) {
      logger.error('Failed to update workflow', { error: error.message, workflowId: request.params.id });
      return reply.status(error.message === 'Workflow not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to update workflow'
      });
    }
  });

  /**
   * DELETE /api/workflows/:id
   * Delete a workflow
   */
  fastify.delete('/api/workflows/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const workflowId = request.params.id;

      await deleteWorkflow(workflowId, userId);

      return reply.send({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete workflow', { error: error.message, workflowId: request.params.id });
      return reply.status(error.message === 'Workflow not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to delete workflow'
      });
    }
  });

  // ============================================
  // WORKFLOW EXECUTION ROUTES
  // ============================================

  /**
   * POST /api/workflows/:id/execute
   * Execute a workflow
   */
  fastify.post('/api/workflows/:id/execute', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const workflowId = request.params.id;
      const input = request.body.input || {};

      const result = await executeWorkflow(workflowId, userId, input, 'manual');

      return reply.status(202).send({
        success: true,
        executionId: result.executionId,
        status: result.status,
        message: 'Workflow execution started'
      });
    } catch (error) {
      logger.error('Failed to execute workflow', { error: error.message, workflowId: request.params.id });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to execute workflow'
      });
    }
  });

  /**
   * GET /api/workflows/executions/:executionId
   * Get execution status and details
   */
  fastify.get('/api/workflows/executions/:executionId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const executionId = request.params.executionId;

      const execution = await getExecution(executionId, userId);

      return reply.send({
        success: true,
        execution
      });
    } catch (error) {
      logger.error('Failed to get execution', { error: error.message, executionId: request.params.executionId });
      return reply.status(error.message === 'Execution not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to get execution'
      });
    }
  });

  /**
   * GET /api/workflows/executions
   * List workflow executions
   */
  fastify.get('/api/workflows/executions', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const filters = {
        workflowId: request.query.workflowId,
        status: request.query.status,
        triggeredBy: request.query.triggeredBy,
        limit: parseInt(request.query.limit) || 50,
        offset: parseInt(request.query.offset) || 0
      };

      const result = await listExecutions(userId, filters);

      return reply.send({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Failed to list executions', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to list executions'
      });
    }
  });

  /**
   * POST /api/workflows/executions/:executionId/cancel
   * Cancel a running execution
   */
  fastify.post('/api/workflows/executions/:executionId/cancel', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const executionId = request.params.executionId;

      await cancelExecution(executionId, userId);

      return reply.send({
        success: true,
        message: 'Execution cancelled successfully'
      });
    } catch (error) {
      logger.error('Failed to cancel execution', { error: error.message, executionId: request.params.executionId });
      return reply.status(error.message === 'Execution not found or already completed' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to cancel execution'
      });
    }
  });

  // ============================================
  // TEMPLATE ROUTES
  // ============================================

  /**
   * GET /api/workflows/templates
   * Get all workflow templates
   */
  fastify.get('/api/workflows/templates', { preHandler: authenticate }, async (request, reply) => {
    try {
      const filters = {
        triggerType: request.query.triggerType,
        search: request.query.search,
        limit: parseInt(request.query.limit) || 20
      };

      const templates = await getTemplates(filters);

      return reply.send({
        success: true,
        templates
      });
    } catch (error) {
      logger.error('Failed to get templates', { error: error.message });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get templates'
      });
    }
  });

  /**
   * POST /api/workflows/from-template/:templateId
   * Create a workflow from a template
   */
  fastify.post('/api/workflows/from-template/:templateId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const templateId = request.params.templateId;
      const customization = request.body || {};

      const workflow = await createFromTemplate(templateId, userId, customization);

      return reply.status(201).send({
        success: true,
        workflow
      });
    } catch (error) {
      logger.error('Failed to create from template', { error: error.message, templateId: request.params.templateId });
      return reply.status(error.message === 'Template not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to create from template'
      });
    }
  });

  // ============================================
  // NODE METADATA ROUTES
  // ============================================

  /**
   * GET /api/workflows/nodes/metadata
   * Get metadata for all available node types
   */
  fastify.get('/api/workflows/nodes/metadata', { preHandler: authenticate }, async (request, reply) => {
    try {
      const metadata = await getNodeMetadata();

      return reply.send({
        success: true,
        nodes: metadata
      });
    } catch (error) {
      logger.error('Failed to get node metadata', { error: error.message });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get node metadata'
      });
    }
  });

  // ============================================
  // SCHEDULE ROUTES
  // ============================================

  /**
   * POST /api/workflows/:id/schedules
   * Create a schedule for a workflow
   */
  fastify.post('/api/workflows/:id/schedules', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const workflowId = request.params.id;
      const scheduleData = request.body;

      // Validate cron expression
      if (!scheduleData.cronExpression) {
        return reply.status(400).send({
          success: false,
          error: 'Cron expression is required'
        });
      }

      const schedule = await createSchedule(workflowId, userId, scheduleData);

      return reply.status(201).send({
        success: true,
        schedule
      });
    } catch (error) {
      logger.error('Failed to create schedule', { error: error.message, workflowId: request.params.id });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create schedule'
      });
    }
  });

  /**
   * PUT /api/workflows/schedules/:scheduleId
   * Update a workflow schedule
   */
  fastify.put('/api/workflows/schedules/:scheduleId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const scheduleId = request.params.scheduleId;
      const updates = request.body;

      const schedule = await updateSchedule(scheduleId, userId, updates);

      return reply.send({
        success: true,
        schedule
      });
    } catch (error) {
      logger.error('Failed to update schedule', { error: error.message, scheduleId: request.params.scheduleId });
      return reply.status(error.message === 'Schedule not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to update schedule'
      });
    }
  });

  /**
   * DELETE /api/workflows/schedules/:scheduleId
   * Delete a workflow schedule
   */
  fastify.delete('/api/workflows/schedules/:scheduleId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const scheduleId = request.params.scheduleId;

      await deleteSchedule(scheduleId, userId);

      return reply.send({
        success: true,
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete schedule', { error: error.message, scheduleId: request.params.scheduleId });
      return reply.status(error.message === 'Schedule not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to delete schedule'
      });
    }
  });

  // ============================================
  // WEBHOOK ROUTES
  // ============================================

  /**
   * POST /api/workflows/:id/webhooks
   * Create a webhook for a workflow
   */
  fastify.post('/api/workflows/:id/webhooks', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const workflowId = request.params.id;

      const webhook = await createWebhook(workflowId, userId);

      return reply.status(201).send({
        success: true,
        webhook
      });
    } catch (error) {
      logger.error('Failed to create webhook', { error: error.message, workflowId: request.params.id });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create webhook'
      });
    }
  });

  /**
   * DELETE /api/workflows/webhooks/:webhookId
   * Delete a workflow webhook
   */
  fastify.delete('/api/workflows/webhooks/:webhookId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const webhookId = request.params.webhookId;

      await deleteWebhook(webhookId, userId);

      return reply.send({
        success: true,
        message: 'Webhook deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete webhook', { error: error.message, webhookId: request.params.webhookId });
      return reply.status(error.message === 'Webhook not found' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to delete webhook'
      });
    }
  });

  /**
   * POST /api/workflows/webhook/:webhookPath
   * Trigger a workflow via webhook (public endpoint)
   */
  fastify.post('/api/workflows/webhook/:webhookPath', async (request, reply) => {
    try {
      const webhookPath = request.params.webhookPath;
      const payload = request.body;

      const result = await executeViaWebhook(webhookPath, payload);

      return reply.status(202).send({
        success: true,
        executionId: result.executionId,
        status: result.status,
        message: 'Workflow triggered successfully'
      });
    } catch (error) {
      logger.error('Failed to trigger webhook', { error: error.message, webhookPath: request.params.webhookPath });
      return reply.status(error.message === 'Webhook not found or inactive' ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to trigger webhook'
      });
    }
  });

  // ============================================
  // STATISTICS ROUTES
  // ============================================

  /**
   * GET /api/workflows/stats
   * Get workflow statistics for the authenticated user
   */
  fastify.get('/api/workflows/stats', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const stats = await getWorkflowStats(userId);

      return reply.send({
        success: true,
        stats
      });
    } catch (error) {
      logger.error('Failed to get workflow stats', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get workflow stats'
      });
    }
  });
};
