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
  deleteJob 
} = require('../utils/jobs');
const { validateJobApplication } = require('../utils/validation');
const { getJobAnalytics, getSuccessMetrics } = require('../utils/jobAnalytics');
const { authenticate } = require('../middleware/auth');

/**
 * Register all job routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function jobRoutes(fastify, options) {
  // Get all jobs for user
  fastify.get('/api/jobs', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const jobs = await getJobsByUserId(userId);
      return { jobs };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new job application
  fastify.post('/api/jobs', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const jobData = request.body;
      
      // Validate job application data
      const validation = validateJobApplication(jobData);
      if (!validation.isValid) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid job application data',
          details: validation.errors
        });
      }
      
      const job = await createJob(userId, jobData);
      return { 
        success: true, 
        job 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single job by ID
  fastify.get('/api/jobs/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const job = await getJobById(id);
      
      if (!job) {
        reply.status(404).send({ error: 'Job not found' });
        return;
      }
      
      // Verify job belongs to user
      if (job.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { job };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Job Analytics endpoint for specific job
  fastify.post('/api/jobs/:id/analytics', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { dateRange = 30 } = request.body;
      
      const job = await getJobById(id);
      
      if (!job || job.userId !== request.user.userId) {
        return reply.status(403).send({ error: 'Job not found or access denied' });
      }
      
      // Get analytics for this job
      const analytics = await getJobAnalytics(request.user.userId, parseInt(dateRange));
      
      reply.send({
        success: true,
        analytics
      });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // General job analytics summary
  fastify.get('/api/jobs/analytics/summary', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { days = 30 } = request.query;
      
      const metrics = await getSuccessMetrics(request.user.userId);
      
      reply.send({
        success: true,
        metrics
      });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update job
  fastify.put('/api/jobs/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      // Verify job exists and belongs to user
      const existingJob = await getJobById(id);
      if (!existingJob) {
        reply.status(404).send({ error: 'Job not found' });
        return;
      }
      if (existingJob.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const job = await updateJob(id, updates);
      return { 
        success: true, 
        job 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete job
  fastify.delete('/api/jobs/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Verify job exists and belongs to user
      const existingJob = await getJobById(id);
      if (!existingJob) {
        reply.status(404).send({ error: 'Job not found' });
        return;
      }
      if (existingJob.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteJob(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = jobRoutes;

