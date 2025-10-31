/**
 * Job Routes Module
 * 
 * Handles all job-related routes including:
 * - CRUD operations for job applications
 * - Job analytics and metrics
 */

const { 
  getJobsByUserId, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob,
  getJobsByStatus
} = require('../utils/jobs');
const { validateJobApplication } = require('../utils/validation');
const { getJobAnalytics, getSuccessMetrics } = require('../utils/jobAnalytics');
const { authenticate } = require('../middleware/auth');
const { errorHandler, requireOwnership, validateRequired } = require('../utils/errorMiddleware');
const { ApiError } = require('../utils/errorHandler');
const CrudService = require('../utils/crudService');

const jobsService = new CrudService('job');

/**
 * Register all job routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function jobRoutes(fastify, options) {
  // Get all jobs for user
  fastify.get('/api/jobs', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const { status } = request.query;

    const jobs = status 
      ? await getJobsByStatus(userId, status)
      : await getJobsByUserId(userId);

    return { jobs };
  }));

  // Create new job application
  fastify.post('/api/jobs', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const jobData = request.body;

    // Validate required fields
    validateRequired(['title', 'company'], jobData);

      // Validate job application data
      const validation = validateJobApplication(jobData);
      if (!validation.isValid) {
        throw new ApiError(400, 'Invalid job application data', true, {
          details: validation.errors
        });
      }

    const job = await createJob(userId, jobData);
    return { 
      success: true, 
      job 
    };
  }));

  // Get single job by ID
  fastify.get('/api/jobs/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(jobsService, id, userId);
    const job = await getJobById(id);

    return { job };
  }));

  // Update job
  fastify.put('/api/jobs/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;
    const updates = request.body;

    // Verify ownership
    await requireOwnership(jobsService, id, userId);

    const job = await updateJob(id, updates);
    return { 
      success: true, 
      job 
    };
  }));

  // Delete job
  fastify.delete('/api/jobs/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(jobsService, id, userId);

    await deleteJob(id);
    return { success: true };
  }));

  // Job Analytics endpoint for specific job
  fastify.post('/api/jobs/:id/analytics', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const { dateRange = 30 } = request.body;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(jobsService, id, userId);

    const analytics = await getJobAnalytics(userId, parseInt(dateRange));
    return {
      success: true,
      analytics
    };
  }));

  // General job analytics summary
  fastify.get('/api/jobs/analytics/summary', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const metrics = await getSuccessMetrics(userId);

    return {
      success: true,
      metrics
    };
  }));
}

module.exports = jobRoutes;

