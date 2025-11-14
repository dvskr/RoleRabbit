/**
 * Job Tracker Routes Module
 * Handles job application tracking with database persistence
 */

'use strict';

const { authenticate } = require('../middleware/auth');
const { createRateLimitMiddleware } = require('../middleware/rateLimit');
const { prisma, safeQuery } = require('../utils/db');
const { validateJobData } = require('../utils/jobValidation');
const {
  jobGetLimiter,
  jobPostLimiter,
  jobPutLimiter,
  jobDeleteLimiter
} = require('../utils/rateLimiter');
const logger = require('../utils/logger');

// Create rate limit middleware instances
const jobGetRateLimit = createRateLimitMiddleware(jobGetLimiter);
const jobPostRateLimit = createRateLimitMiddleware(jobPostLimiter);
const jobPutRateLimit = createRateLimitMiddleware(jobPutLimiter);
const jobDeleteRateLimit = createRateLimitMiddleware(jobDeleteLimiter);

/**
 * Register all job routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
module.exports = async function jobsRoutes(fastify) {
  // Log route registration
  logger.info('💼 Job Tracker routes registered: /api/jobs/*');
  logger.info('   → GET    /api/jobs');
  logger.info('   → POST   /api/jobs');
  logger.info('   → PUT    /api/jobs/:id');
  logger.info('   → DELETE /api/jobs/:id');

  /**
   * GET /api/jobs
   * Fetch all jobs for authenticated user
   */
  fastify.get(
    '/api/jobs',
    {
      preHandler: [authenticate, jobGetRateLimit]
    },
    async (request, reply) => {
      try {
        const userId = request.user?.userId || request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'User not authenticated'
          });
        }

        // Fetch jobs from database with retry logic
        const jobs = await safeQuery(async () => {
          return await prisma.job.findMany({
            where: {
              userId,
              deletedAt: null // Exclude soft-deleted jobs
            },
            orderBy: {
              createdAt: 'desc'
            }
          });
        });

        logger.debug('Jobs fetched for user', { userId, count: jobs.length });

        return reply.send({
          success: true,
          jobs
        });
      } catch (error) {
        logger.error('Failed to fetch jobs:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch jobs. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/jobs
   * Create new job application
   */
  fastify.post(
    '/api/jobs',
    {
      preHandler: [authenticate, jobPostRateLimit]
    },
    async (request, reply) => {
      try {
        const userId = request.user?.userId || request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'User not authenticated'
          });
        }

        const payload = request.body || {};

        // Validate input data
        const validation = validateJobData(payload);
        if (!validation.valid) {
          logger.warn('Job validation failed', { userId, errors: validation.errors });
          return reply.status(400).send({
            success: false,
            error: 'Validation failed',
            errors: validation.errors
          });
        }

        // Prepare job data for database
        const jobData = {
          userId,
          title: payload.title,
          company: payload.company,
          location: payload.location,
          status: payload.status || 'APPLIED',
          priority: payload.priority || 'MEDIUM',
          appliedDate: payload.appliedDate,
          salary: payload.salary || null,
          description: payload.description || null,
          url: payload.url || null,
          notes: payload.notes || null,
          nextStep: payload.nextStep || null,
          nextStepDate: payload.nextStepDate || null,
          contact: payload.contact || null,
          requirements: payload.requirements || [],
          benefits: payload.benefits || [],
          remote: payload.remote !== undefined ? !!payload.remote : false,
          companySize: payload.companySize || null,
          industry: payload.industry || null,
          isFavorite: payload.isFavorite !== undefined ? !!payload.isFavorite : false
        };

        // Create job in database with retry logic
        const job = await safeQuery(async () => {
          return await prisma.job.create({
            data: jobData
          });
        });

        logger.info('Job created successfully', { userId, jobId: job.id, title: job.title });

        return reply.status(201).send({
          success: true,
          job
        });
      } catch (error) {
        logger.error('Failed to create job:', error);

        // Check for specific Prisma errors
        if (error.code === 'P2002') {
          return reply.status(409).send({
            success: false,
            error: 'A job with these details already exists'
          });
        }

        if (error.code === 'P2003') {
          return reply.status(400).send({
            success: false,
            error: 'Invalid user reference'
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to create job. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/:id
   * Update existing job
   */
  fastify.put(
    '/api/jobs/:id',
    {
      preHandler: [authenticate, jobPutRateLimit]
    },
    async (request, reply) => {
      try {
        const userId = request.user?.userId || request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'User not authenticated'
          });
        }

        const { id } = request.params;
        const payload = request.body || {};

        // Check if job exists and belongs to user
        const existingJob = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: {
              id,
              userId
            }
          });
        });

        if (!existingJob) {
          logger.warn('Job not found or unauthorized', { userId, jobId: id });
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Validate update data (partial validation)
        if (Object.keys(payload).length > 0) {
          const validation = validateJobData({ ...existingJob, ...payload });
          if (!validation.valid) {
            logger.warn('Job update validation failed', { userId, jobId: id, errors: validation.errors });
            return reply.status(400).send({
              success: false,
              error: 'Validation failed',
              errors: validation.errors
            });
          }
        }

        // Prepare update data (only include fields that are present in payload)
        const updateData = {};
        const allowedFields = [
          'title', 'company', 'location', 'status', 'priority', 'appliedDate',
          'salary', 'description', 'url', 'notes', 'nextStep', 'nextStepDate',
          'contact', 'requirements', 'benefits', 'remote', 'companySize',
          'industry', 'isFavorite'
        ];

        allowedFields.forEach(field => {
          if (payload[field] !== undefined) {
            updateData[field] = payload[field];
          }
        });

        // Update job in database with retry logic
        const updatedJob = await safeQuery(async () => {
          return await prisma.job.update({
            where: { id },
            data: updateData
          });
        });

        logger.info('Job updated successfully', { userId, jobId: id });

        return reply.send({
          success: true,
          job: updatedJob
        });
      } catch (error) {
        logger.error('Failed to update job:', error);

        if (error.code === 'P2025') {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to update job. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id
   * Permanently delete job (hard delete)
   * Note: Soft delete is handled via PUT with deletedAt field
   */
  fastify.delete(
    '/api/jobs/:id',
    {
      preHandler: [authenticate, jobDeleteRateLimit]
    },
    async (request, reply) => {
      try {
        const userId = request.user?.userId || request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'User not authenticated'
          });
        }

        const { id } = request.params;

        // Check if job exists and belongs to user
        const existingJob = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: {
              id,
              userId
            }
          });
        });

        if (!existingJob) {
          logger.warn('Job not found or unauthorized', { userId, jobId: id });
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Permanently delete job from database with retry logic
        await safeQuery(async () => {
          return await prisma.job.delete({
            where: { id }
          });
        });

        logger.info('Job deleted permanently', { userId, jobId: id });

        return reply.send({
          success: true,
          message: 'Job deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete job:', error);

        if (error.code === 'P2025') {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to delete job. Please try again.',
          message: error.message
        });
      }
    }
  );
};
