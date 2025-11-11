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
  createOrUpdateConversation,
  checkBatchUsageLimits,
  incrementUsageCounter
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
      if (error.code === 'USAGE_LIMIT_EXCEEDED') {
        return reply.status(403).send({
          success: false,
          error: error.message
        });
      }
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
      if (error.code === 'USAGE_LIMIT_EXCEEDED') {
        return reply.status(403).send({
          success: false,
          error: error.message
        });
      }
      logger.error('Failed to create company research task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create company research task'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks/interview-prep
   * Create an interview preparation task
   */
  fastify.post('/api/ai-agent/tasks/interview-prep', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { jobDescription, jobTitle, company, baseResumeId } = request.body;

      if (!jobDescription || !company) {
        return reply.status(400).send({
          success: false,
          error: 'Job description and company are required'
        });
      }

      const taskData = {
        type: 'INTERVIEW_PREP',
        jobDescription,
        jobTitle,
        company,
        baseResumeId
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
      logger.error('Failed to create interview prep task', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create interview prep task'
      });
    }
  });

  /**
   * POST /api/ai-agent/tasks/bulk-apply
   * Create bulk job application tasks with proper validation and error handling
   */
  fastify.post('/api/ai-agent/tasks/bulk-apply', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { jobs, baseResumeId, tone, length } = request.body;

      // ✅ 1. Validate batch size
      const MAX_BATCH_SIZE = 50;

      if (!Array.isArray(jobs) || jobs.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Jobs array is required and cannot be empty'
        });
      }

      if (jobs.length > MAX_BATCH_SIZE) {
        return reply.status(400).send({
          success: false,
          error: `Batch size cannot exceed ${MAX_BATCH_SIZE} jobs. You submitted ${jobs.length} jobs.`
        });
      }

      // ✅ 2. Validate all job objects upfront
      const validationErrors = [];
      jobs.forEach((job, index) => {
        if (!job.jobDescription || typeof job.jobDescription !== 'string' || job.jobDescription.trim() === '') {
          validationErrors.push(`Job ${index + 1}: Missing or invalid job description`);
        }
        if (!job.company || typeof job.company !== 'string' || job.company.trim() === '') {
          validationErrors.push(`Job ${index + 1}: Missing or invalid company name`);
        }
        if (!job.jobTitle || typeof job.jobTitle !== 'string' || job.jobTitle.trim() === '') {
          validationErrors.push(`Job ${index + 1}: Missing or invalid job title`);
        }
      });

      if (validationErrors.length > 0) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed for some jobs',
          errors: validationErrors
        });
      }

      // ✅ 3. Check usage limits UPFRONT for entire batch (atomic check)
      try {
        await checkBatchUsageLimits(userId, jobs.length);
      } catch (error) {
        if (error.code === 'USAGE_LIMIT_EXCEEDED') {
          return reply.status(403).send({
            success: false,
            error: error.message
          });
        }
        throw error;
      }

      // ✅ 4. Generate batchId BEFORE creating tasks
      const batchId = `batch_${Date.now()}_${userId.slice(0, 8)}`;

      // ✅ 5. Use Promise.allSettled for partial success handling
      const taskPromises = jobs.map(job =>
        createTask(userId, {
          type: 'RESUME_GENERATION',
          jobDescription: job.jobDescription,
          jobTitle: job.jobTitle,
          company: job.company,
          jobUrl: job.jobUrl,
          baseResumeId,
          tone: tone || 'professional',
          length: length || 'medium',
          batchId // ✅ Store correlation ID
        }, { skipUsageCheck: true }) // Skip individual checks since we checked the batch upfront
      );

      const results = await Promise.allSettled(taskPromises);

      // ✅ 6. Separate successes from failures
      const successful = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      const failed = results
        .map((r, i) => ({ result: r, index: i, job: jobs[i] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ result, index, job }) => ({
          index: index + 1,
          company: job.company,
          jobTitle: job.jobTitle,
          error: result.reason?.message || 'Unknown error'
        }));

      // ✅ 7. Increment usage counter by actual successful count
      if (successful.length > 0) {
        await incrementUsageCounter(userId, successful.length);
      }

      // ✅ 8. Log with correlation ID and detailed breakdown
      logger.info('Bulk tasks processed', {
        userId,
        batchId,
        totalRequested: jobs.length,
        successful: successful.length,
        failed: failed.length,
        tone: tone || 'professional',
        length: length || 'medium',
        failureDetails: failed.length > 0 ? failed : undefined
      });

      // ✅ 9. Return detailed breakdown with appropriate status code
      const statusCode = failed.length === 0 ? 201 : (successful.length > 0 ? 207 : 500);

      return reply.status(statusCode).send({
        success: failed.length === 0,
        batchId,
        summary: {
          total: jobs.length,
          successful: successful.length,
          failed: failed.length
        },
        tasks: successful,
        failures: failed.length > 0 ? failed : undefined,
        message: failed.length === 0
          ? `Successfully started processing all ${successful.length} job${successful.length !== 1 ? 's' : ''}`
          : `Processed ${successful.length} out of ${jobs.length} jobs. ${failed.length} job${failed.length !== 1 ? 's' : ''} failed.`
      });

    } catch (error) {
      logger.error('Bulk apply error', {
        error: error.message,
        stack: error.stack,
        userId: request.user.userId
      });

      return reply.status(500).send({
        success: false,
        error: 'Failed to process bulk request. Please try again.'
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

  // ============================================
  // EXPORT ROUTES
  // ============================================

  /**
   * POST /api/ai-agent/tasks/:id/export
   * Export task result to PDF, DOCX, or TXT
   */
  fastify.post('/api/ai-agent/tasks/:id/export', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const taskId = request.params.id;
      const { format = 'pdf' } = request.body;

      // Validate format
      if (!['pdf', 'docx', 'txt'].includes(format.toLowerCase())) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid format. Supported formats: pdf, docx, txt'
        });
      }

      // Verify task belongs to user
      const task = await prisma.aIAgentTask.findFirst({
        where: { id: taskId, userId }
      });

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'Task not found'
        });
      }

      if (task.status !== 'COMPLETED') {
        return reply.status(400).send({
          success: false,
          error: 'Task must be completed before exporting'
        });
      }

      // Import resumeExporter service
      const resumeExporter = require('../services/resumeExporter');

      // Export and save
      const storageFile = await resumeExporter.exportAndSaveResume(taskId, format);

      return reply.send({
        success: true,
        file: {
          id: storageFile.id,
          name: storageFile.name,
          size: storageFile.size,
          mimeType: storageFile.mimeType,
          downloadUrl: `/api/storage/files/${storageFile.id}/download`
        }
      });

    } catch (error) {
      logger.error('Failed to export task result', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to export resume'
      });
    }
  });

  /**
   * GET /api/ai-agent/tasks/:id/export/:format
   * Export and directly download task result
   */
  fastify.get('/api/ai-agent/tasks/:id/export/:format', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const taskId = request.params.id;
      const format = request.params.format.toLowerCase();

      // Validate format
      if (!['pdf', 'docx', 'txt'].includes(format)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid format. Supported formats: pdf, docx, txt'
        });
      }

      // Verify task belongs to user
      const task = await prisma.aIAgentTask.findFirst({
        where: { id: taskId, userId },
        include: { user: true }
      });

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'Task not found'
        });
      }

      if (task.status !== 'COMPLETED') {
        return reply.status(400).send({
          success: false,
          error: 'Task must be completed before exporting'
        });
      }

      // Import services
      const resumeExporter = require('../services/resumeExporter');
      const path = require('path');
      const fs = require('fs');

      // Create temp file
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const filename = `resume_${task.company || 'untitled'}_${timestamp}.${format}`;
      const tempPath = path.join(tempDir, filename);

      const resumeData = task.resultData?.data;
      if (!resumeData) {
        return reply.status(400).send({
          success: false,
          error: 'No resume data available'
        });
      }

      // Export based on format
      let filePath;
      switch (format) {
        case 'pdf':
          filePath = await resumeExporter.exportToPDF(resumeData, tempPath);
          break;
        case 'docx':
          filePath = await resumeExporter.exportToDOCX(resumeData, tempPath);
          break;
        case 'txt':
          filePath = await resumeExporter.exportToPlainText(resumeData, tempPath);
          break;
      }

      // Set appropriate headers
      const mimeTypes = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain'
      };

      reply.header('Content-Type', mimeTypes[format]);
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream file
      const fileStream = fs.createReadStream(filePath);

      fileStream.on('end', () => {
        // Clean up temp file after streaming
        fs.unlinkSync(filePath);
      });

      return reply.send(fileStream);

    } catch (error) {
      logger.error('Failed to download exported resume', { error: error.message, userId: request.user.userId });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to export resume'
      });
    }
  });
};
