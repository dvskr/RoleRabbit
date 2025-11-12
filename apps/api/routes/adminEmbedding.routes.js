// ============================================================
// ADMIN EMBEDDING ROUTES
// ============================================================
// API endpoints for managing embedding generation jobs

const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const {
  generateEmbeddingsForAllResumes,
  generateEmbeddingForResume,
  getJobStatus,
  stopJob,
  getEmbeddingCoverageStats
} = require('../services/embeddings/embeddingJobService');

module.exports = async function adminEmbeddingRoutes(fastify) {
  // CORS helpers
  const allowCorsPreflight = (request, reply) => {
    const origin = request.headers.origin || process.env.CORS_ORIGIN || 'http://localhost:3000';
    const requestHeaders = request.headers['access-control-request-headers'] || 'content-type, authorization, x-csrf-token';
    reply
      .header('Access-Control-Allow-Origin', origin)
      .header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      .header('Access-Control-Allow-Headers', requestHeaders)
      .header('Access-Control-Allow-Credentials', 'true')
      .status(204)
      .send();
  };

  const setCorsHeaders = (request, reply) => {
    const origin = request.headers.origin || process.env.CORS_ORIGIN || 'http://localhost:3000';
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
  };

  // OPTIONS endpoints
  fastify.options('/api/admin/embeddings/generate-all', allowCorsPreflight);
  fastify.options('/api/admin/embeddings/generate-one', allowCorsPreflight);
  fastify.options('/api/admin/embeddings/status', allowCorsPreflight);
  fastify.options('/api/admin/embeddings/stop', allowCorsPreflight);
  fastify.options('/api/admin/embeddings/stats', allowCorsPreflight);

  /**
   * GET /api/admin/embeddings/stats
   * Get embedding coverage statistics
   */
  fastify.get('/api/admin/embeddings/stats', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);

      // Check if user is admin (you may want to add a proper admin check)
      // For now, any authenticated user can view stats
      
      const stats = await getEmbeddingCoverageStats();

      logger.info('Embedding coverage stats retrieved', {
        userId: request.user?.userId,
        stats
      });

      return reply.send({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Failed to get embedding stats', {
        error: error.message,
        userId: request.user?.userId
      });

      setCorsHeaders(request, reply);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve embedding statistics'
      });
    }
  });

  /**
   * GET /api/admin/embeddings/status
   * Get current job status
   */
  fastify.get('/api/admin/embeddings/status', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);

      const status = getJobStatus();

      return reply.send({
        success: true,
        status
      });

    } catch (error) {
      logger.error('Failed to get job status', {
        error: error.message,
        userId: request.user?.userId
      });

      setCorsHeaders(request, reply);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve job status'
      });
    }
  });

  /**
   * POST /api/admin/embeddings/generate-all
   * Start background job to generate embeddings for all resumes
   * 
   * Body:
   * {
   *   batchSize?: number,        // Number of resumes per batch (default: 10)
   *   delayBetweenBatches?: number, // Delay in ms (default: 1000)
   *   skipExisting?: boolean,    // Skip resumes with embeddings (default: true)
   *   resumeFrom?: string        // Resume ID to start from (for resuming)
   * }
   */
  fastify.post('/api/admin/embeddings/generate-all', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);

      // TODO: Add proper admin authorization check
      // For now, require authentication only
      if (!request.user?.userId) {
        return reply.status(401).send({
          success: false,
          error: 'Authentication required'
        });
      }

      const {
        batchSize = 10,
        delayBetweenBatches = 1000,
        skipExisting = true,
        resumeFrom = null
      } = request.body || {};

      logger.info('Starting embedding generation job', {
        userId: request.user.userId,
        batchSize,
        delayBetweenBatches,
        skipExisting,
        resumeFrom
      });

      // Start the job (non-blocking - runs in background)
      generateEmbeddingsForAllResumes({
        batchSize,
        delayBetweenBatches,
        skipExisting,
        resumeFrom
      })
        .then(results => {
          logger.info('Embedding generation job completed successfully', {
            userId: request.user.userId,
            results
          });
        })
        .catch(error => {
          logger.error('Embedding generation job failed', {
            userId: request.user.userId,
            error: error.message
          });
        });

      // Return immediately with job started status
      return reply.send({
        success: true,
        message: 'Background embedding generation job started',
        jobStarted: true,
        options: {
          batchSize,
          delayBetweenBatches,
          skipExisting,
          resumeFrom
        }
      });

    } catch (error) {
      logger.error('Failed to start embedding generation job', {
        error: error.message,
        userId: request.user?.userId
      });

      setCorsHeaders(request, reply);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to start background job'
      });
    }
  });

  /**
   * POST /api/admin/embeddings/generate-one
   * Generate embedding for a specific resume
   * 
   * Body:
   * {
   *   resumeId: string  // Required
   * }
   */
  fastify.post('/api/admin/embeddings/generate-one', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);

      const { resumeId } = request.body || {};

      if (!resumeId) {
        return reply.status(400).send({
          success: false,
          error: 'resumeId is required'
        });
      }

      logger.info('Generating embedding for specific resume', {
        userId: request.user?.userId,
        resumeId
      });

      const result = await generateEmbeddingForResume(resumeId);

      return reply.send({
        success: true,
        message: 'Embedding generated successfully',
        result
      });

    } catch (error) {
      logger.error('Failed to generate embedding for resume', {
        error: error.message,
        userId: request.user?.userId,
        resumeId: request.body?.resumeId
      });

      setCorsHeaders(request, reply);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to generate embedding'
      });
    }
  });

  /**
   * POST /api/admin/embeddings/stop
   * Stop the currently running background job
   */
  fastify.post('/api/admin/embeddings/stop', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);

      logger.info('Stopping embedding generation job', {
        userId: request.user?.userId
      });

      const stopped = stopJob();

      if (!stopped) {
        return reply.send({
          success: false,
          message: 'No job is currently running'
        });
      }

      return reply.send({
        success: true,
        message: 'Background job stopped successfully',
        stopped: true
      });

    } catch (error) {
      logger.error('Failed to stop embedding generation job', {
        error: error.message,
        userId: request.user?.userId
      });

      setCorsHeaders(request, reply);
      return reply.status(500).send({
        success: false,
        error: 'Failed to stop background job'
      });
    }
  });
};

