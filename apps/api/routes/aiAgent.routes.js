const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const { prisma } = require('../utils/db');
const {
  getOrCreateSettings,
  updateSettings,
  toggleCapability,
  getActiveTasks,
  getAllTasks,
  getTaskById,
  createTask,
  cancelTask,
  deleteTask,
  getHistory,
  getMetrics,
  getChatHistory,
  sendChatMessage,
  createOrUpdateConversation
} = require('../services/aiAgentService');

module.exports = async function aiAgentRoutes(fastify) {
  // ============================================
  // SETTINGS ROUTES
  // ============================================

  /**
   * GET /api/ai-agent/settings
   * Get user's AI Agent settings
   */
  fastify.get('/api/ai-agent/settings', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const settings = await getOrCreateSettings(userId);

      return reply.send({
        success: true,
        settings
      });
    } catch (error) {
      logger.error('Failed to get AI agent settings', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve AI agent settings'
      });
    }
  });

  /**
   * PATCH /api/ai-agent/settings
   * Update AI Agent settings
   */
  fastify.patch('/api/ai-agent/settings', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const updates = request.body;

      const settings = await updateSettings(userId, updates);

      return reply.send({
        success: true,
        settings
      });
    } catch (error) {
      logger.error('Failed to update AI agent settings', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to update AI agent settings'
      });
    }
  });

  /**
   * POST /api/ai-agent/settings/toggle
   * Toggle a specific capability
   */
  fastify.post('/api/ai-agent/settings/toggle', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { capability } = request.body;

      if (!capability) {
        return reply.status(400).send({
          success: false,
          error: 'Capability name is required'
        });
      }

      const settings = await toggleCapability(userId, capability);

      return reply.send({
        success: true,
        settings
      });
    } catch (error) {
      logger.error('Failed to toggle capability', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to toggle capability'
      });
    }
  });

  // ============================================
  // TASK ROUTES
  // ============================================

  /**
   * GET /api/ai-agent/tasks
   * Get all tasks with optional filters
   */
  fastify.get('/api/ai-agent/tasks', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { status, type, limit = 50, offset = 0 } = request.query;

      const tasks = await getAllTasks(userId, {
        status,
        type,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return reply.send({
        success: true,
        tasks,
        count: tasks.length
      });
    } catch (error) {
      logger.error('Failed to get tasks', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve tasks'
      });
    }
  });

  /**
   * GET /api/ai-agent/tasks/active
   * Get all active (in-progress) tasks
   */
  fastify.get('/api/ai-agent/tasks/active', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const tasks = await getActiveTasks(userId);

      return reply.send({
        success: true,
        tasks,
        count: tasks.length
      });
    } catch (error) {
      logger.error('Failed to get active tasks', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve active tasks'
      });
    }
  });

  /**
   * GET /api/ai-agent/tasks/:id
   * Get a specific task by ID
   */
  fastify.get('/api/ai-agent/tasks/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const taskId = request.params.id;

      const task = await getTaskById(userId, taskId);

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'Task not found'
        });
      }

      return reply.send({
        success: true,
        task
      });
    } catch (error) {
      logger.error('Failed to get task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve task'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks
   * Create a new task (generic endpoint)
   */
  fastify.post('/api/ai-agent/tasks', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const taskData = request.body;

      // Validate required fields
      if (!taskData.type) {
        return reply.status(400).send({
          success: false,
          error: 'Task type is required'
        });
      }

      const task = await createTask(userId, taskData);

      return reply.status(201).send({
        success: true,
        task
      });
    } catch (error) {
      if (error.code === 'USAGE_LIMIT_EXCEEDED') {
        return reply.status(403).send({
          success: false,
          error: error.message
        });
      }
      logger.error('Failed to create task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create task'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks/resume-generation
   * Create a resume generation task
   */
  fastify.post('/api/ai-agent/tasks/resume-generation', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { jobDescription, jobTitle, company, jobUrl, baseResumeId, tone, length } = request.body;

      if (!jobDescription) {
        return reply.status(400).send({
          success: false,
          error: 'Job description is required'
        });
      }

      const taskData = {
        type: 'RESUME_GENERATION',
        jobDescription,
        jobTitle,
        company,
        jobUrl,
        baseResumeId,
        tone,
        length
      };

      const task = await createTask(userId, taskData);

      return reply.status(201).send({
        success: true,
        task
      });
    } catch (error) {
      if (error.code === 'USAGE_LIMIT_EXCEEDED') {
        return reply.status(403).send({
          success: false,
          error: error.message
        });
      }
      logger.error('Failed to create resume generation task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create resume generation task'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks/cover-letter
   * Create a cover letter generation task
   */
  fastify.post('/api/ai-agent/tasks/cover-letter', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { jobDescription, jobTitle, company, baseResumeId, tone } = request.body;

      if (!jobDescription || !jobTitle || !company) {
        return reply.status(400).send({
          success: false,
          error: 'Job description, title, and company are required'
        });
      }

      const taskData = {
        type: 'COVER_LETTER_GENERATION',
        jobDescription,
        jobTitle,
        company,
        baseResumeId,
        tone
      };

      const task = await createTask(userId, taskData);

      return reply.status(201).send({
        success: true,
        task
      });
    } catch (error) {
      logger.error('Failed to create cover letter task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create cover letter task'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks/company-research
   * Create a company research task
   */
  fastify.post('/api/ai-agent/tasks/company-research', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { company } = request.body;

      if (!company) {
        return reply.status(400).send({
          success: false,
          error: 'Company name is required'
        });
      }

      const taskData = {
        type: 'COMPANY_RESEARCH',
        company
      };

      const task = await createTask(userId, taskData);

      return reply.status(201).send({
        success: true,
        task
      });
    } catch (error) {
      logger.error('Failed to create company research task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create company research task'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks/bulk-apply
   * Create bulk job application tasks
   */
  fastify.post('/api/ai-agent/tasks/bulk-apply', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { jobs, baseResumeId } = request.body;

      if (!Array.isArray(jobs) || jobs.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Jobs array is required and cannot be empty'
        });
      }

      // Create tasks for each job
      const taskPromises = jobs.map(job => {
        return createTask(userId, {
          type: 'RESUME_GENERATION',
          jobDescription: job.jobDescription,
          jobTitle: job.jobTitle,
          company: job.company,
          jobUrl: job.jobUrl,
          baseResumeId
        });
      });

      const tasks = await Promise.all(taskPromises);

      return reply.status(201).send({
        success: true,
        tasks,
        count: tasks.length
      });
    } catch (error) {
      if (error.code === 'USAGE_LIMIT_EXCEEDED') {
        return reply.status(403).send({
          success: false,
          error: error.message
        });
      }
      logger.error('Failed to create bulk tasks', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create bulk tasks'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks/:id/cancel
   * Cancel a task
   */
  fastify.post('/api/ai-agent/tasks/:id/cancel', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const taskId = request.params.id;

      const task = await cancelTask(userId, taskId);

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'Task not found'
        });
      }

      return reply.send({
        success: true,
        task
      });
    } catch (error) {
      logger.error('Failed to cancel task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to cancel task'
      });
    }
  });

  /**
   * DELETE /api/ai-agent/tasks/:id
   * Delete a task
   */
  fastify.delete('/api/ai-agent/tasks/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const taskId = request.params.id;

      await deleteTask(userId, taskId);

      return reply.send({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      if (error.code === 'TASK_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      logger.error('Failed to delete task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete task'
      });
    }
  });

  // ============================================
  // HISTORY & METRICS ROUTES
  // ============================================

  /**
   * GET /api/ai-agent/history
   * Get task history
   */
  fastify.get('/api/ai-agent/history', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { days = 7 } = request.query;

      const history = await getHistory(userId, parseInt(days));

      return reply.send({
        success: true,
        history
      });
    } catch (error) {
      logger.error('Failed to get history', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve history'
      });
    }
  });

  /**
   * GET /api/ai-agent/metrics
   * Get performance metrics
   */
  fastify.get('/api/ai-agent/metrics', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { days = 30 } = request.query;

      const metrics = await getMetrics(userId, parseInt(days));

      return reply.send({
        success: true,
        metrics
      });
    } catch (error) {
      logger.error('Failed to get metrics', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve metrics'
      });
    }
  });

  // ============================================
  // CHAT ROUTES
  // ============================================

  /**
   * GET /api/ai-agent/chat/history
   * Get chat conversation history
   */
  fastify.get('/api/ai-agent/chat/history', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const chatHistory = await getChatHistory(userId);

      return reply.send({
        success: true,
        conversation: chatHistory
      });
    } catch (error) {
      logger.error('Failed to get chat history', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve chat history'
      });
    }
  });

  /**
   * POST /api/ai-agent/chat
   * Send a chat message and get AI response
   */
  fastify.post('/api/ai-agent/chat', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { message, conversationHistory } = request.body;

      if (!message || typeof message !== 'string') {
        return reply.status(400).send({
          success: false,
          error: 'Message is required and must be a string'
        });
      }

      const response = await sendChatMessage(userId, message, conversationHistory);

      return reply.send({
        success: true,
        response: response.message,
        suggestedActions: response.suggestedActions,
        conversation: response.conversation
      });
    } catch (error) {
      if (error.code === 'AI_SERVICE_ERROR') {
        return reply.status(503).send({
          success: false,
          error: 'AI service temporarily unavailable'
        });
      }
      logger.error('Failed to process chat message', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to process chat message'
      });
    }
  });
};
