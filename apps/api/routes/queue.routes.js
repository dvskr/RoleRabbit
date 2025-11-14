const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const {
  addJob,
  getJobStatus,
  cancelJob,
  getQueueStats,
  getAllQueueStats,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  getFailedJobs,
  retryFailedJob
} = require('../services/queue/queueManager');

/**
 * Queue Management API Routes
 */

// Middleware to check if user is admin
async function requireAdmin(request, reply) {
  const userId = request.user.userId;
  const adminUsers = (process.env.ADMIN_USERS || '').split(',').filter(Boolean);
  
  if (!adminUsers.includes(userId)) {
    return reply.status(403).send({
      success: false,
      error: 'Admin access required'
    });
  }
}

module.exports = async function queueRoutes(fastify) {
  /**
   * GET /api/queue/job/:queueType/:jobId
   * Get job status
   */
  fastify.get('/api/queue/job/:queueType/:jobId', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const { queueType, jobId } = request.params;
      
      const status = await getJobStatus(queueType, jobId);
      
      return reply.send({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Failed to get job status', {
        error: error.message,
        params: request.params
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve job status'
      });
    }
  });

  /**
   * DELETE /api/queue/job/:queueType/:jobId
   * Cancel a job
   */
  fastify.delete('/api/queue/job/:queueType/:jobId', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const { queueType, jobId } = request.params;
      
      const result = await cancelJob(queueType, jobId);
      
      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to cancel job', {
        error: error.message,
        params: request.params
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to cancel job'
      });
    }
  });

  /**
   * GET /api/queue/stats
   * Get all queue statistics (Admin only)
   */
  fastify.get('/api/queue/stats', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const stats = await getAllQueueStats();
      
      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get queue stats', {
        error: error.message
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve queue statistics'
      });
    }
  });

  /**
   * GET /api/queue/stats/:queueType
   * Get specific queue statistics (Admin only)
   */
  fastify.get('/api/queue/stats/:queueType', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { queueType } = request.params;
      
      const stats = await getQueueStats(queueType);
      
      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get queue stats', {
        error: error.message,
        queueType: request.params.queueType
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve queue statistics'
      });
    }
  });

  /**
   * POST /api/queue/clean/:queueType
   * Clean old jobs from queue (Admin only)
   */
  fastify.post('/api/queue/clean/:queueType', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { queueType } = request.params;
      const { grace = 24 * 3600 * 1000 } = request.body || {};
      
      const result = await cleanQueue(queueType, grace);
      
      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to clean queue', {
        error: error.message,
        queueType: request.params.queueType
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to clean queue'
      });
    }
  });

  /**
   * POST /api/queue/pause/:queueType
   * Pause queue (Admin only)
   */
  fastify.post('/api/queue/pause/:queueType', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { queueType } = request.params;
      
      const result = await pauseQueue(queueType);
      
      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to pause queue', {
        error: error.message,
        queueType: request.params.queueType
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to pause queue'
      });
    }
  });

  /**
   * POST /api/queue/resume/:queueType
   * Resume queue (Admin only)
   */
  fastify.post('/api/queue/resume/:queueType', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { queueType } = request.params;
      
      const result = await resumeQueue(queueType);
      
      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to resume queue', {
        error: error.message,
        queueType: request.params.queueType
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to resume queue'
      });
    }
  });

  /**
   * GET /api/queue/failed/:queueType
   * Get failed jobs (Admin only)
   */
  fastify.get('/api/queue/failed/:queueType', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { queueType } = request.params;
      const { limit = 50 } = request.query;
      
      const failedJobs = await getFailedJobs(queueType, parseInt(limit));
      
      return reply.send({
        success: true,
        data: failedJobs
      });
    } catch (error) {
      logger.error('Failed to get failed jobs', {
        error: error.message,
        queueType: request.params.queueType
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve failed jobs'
      });
    }
  });

  /**
   * POST /api/queue/retry/:queueType/:jobId
   * Retry failed job (Admin only)
   */
  fastify.post('/api/queue/retry/:queueType/:jobId', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { queueType, jobId } = request.params;
      
      const result = await retryFailedJob(queueType, jobId);
      
      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to retry job', {
        error: error.message,
        params: request.params
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retry job'
      });
    }
  });
};

