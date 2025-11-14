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
  jobDeleteLimiter,
  jobBulkOperationLimiter
} = require('../utils/rateLimiter');
const logger = require('../utils/logger');

// Create rate limit middleware instances
const jobGetRateLimit = createRateLimitMiddleware(jobGetLimiter);
const jobPostRateLimit = createRateLimitMiddleware(jobPostLimiter);
const jobPutRateLimit = createRateLimitMiddleware(jobPutLimiter);
const jobDeleteRateLimit = createRateLimitMiddleware(jobDeleteLimiter);
const jobBulkOperationRateLimit = createRateLimitMiddleware(jobBulkOperationLimiter);

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
  logger.info('   → POST   /api/jobs/:id/restore');
  logger.info('   → POST   /api/jobs/:id/favorite');
  logger.info('   → DELETE /api/jobs/:id/favorite');
  logger.info('   → POST   /api/jobs/bulk-delete');
  logger.info('   → POST   /api/jobs/bulk-restore');
  logger.info('   → PUT    /api/jobs/bulk-status');

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
   * Soft delete job (sets deletedAt timestamp)
   * Job can be restored later via POST /api/jobs/:id/restore
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
              userId,
              deletedAt: null // Only find non-deleted jobs
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

        // Soft delete: set deletedAt timestamp
        const deletedJob = await safeQuery(async () => {
          return await prisma.job.update({
            where: { id },
            data: {
              deletedAt: new Date()
            }
          });
        });

        logger.info('Job soft-deleted successfully', { userId, jobId: id });

        return reply.send({
          success: true,
          message: 'Job deleted successfully',
          job: deletedJob
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

  /**
   * POST /api/jobs/:id/restore
   * Restore a soft-deleted job (clears deletedAt timestamp)
   */
  fastify.post(
    '/api/jobs/:id/restore',
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

        const { id } = request.params;

        // Check if job exists, belongs to user, and is deleted
        const existingJob = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: {
              id,
              userId,
              deletedAt: { not: null } // Only find deleted jobs
            }
          });
        });

        if (!existingJob) {
          logger.warn('Deleted job not found or unauthorized', { userId, jobId: id });
          return reply.status(404).send({
            success: false,
            error: 'Deleted job not found'
          });
        }

        // Restore: clear deletedAt timestamp
        const restoredJob = await safeQuery(async () => {
          return await prisma.job.update({
            where: { id },
            data: {
              deletedAt: null
            }
          });
        });

        logger.info('Job restored successfully', { userId, jobId: id, title: restoredJob.title });

        return reply.send({
          success: true,
          message: 'Job restored successfully',
          job: restoredJob
        });
      } catch (error) {
        logger.error('Failed to restore job:', error);

        if (error.code === 'P2025') {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to restore job. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/jobs/bulk-delete
   * Soft delete multiple jobs at once
   * Request body: { jobIds: string[] }
   */
  fastify.post(
    '/api/jobs/bulk-delete',
    {
      preHandler: [authenticate, jobBulkOperationRateLimit]
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

        const { jobIds } = request.body || {};

        // Validate input
        if (!Array.isArray(jobIds) || jobIds.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'jobIds must be a non-empty array'
          });
        }

        // Limit bulk operations to reasonable size (max 100 jobs at once)
        if (jobIds.length > 100) {
          return reply.status(400).send({
            success: false,
            error: 'Cannot delete more than 100 jobs at once'
          });
        }

        // Verify all IDs are strings
        if (!jobIds.every(id => typeof id === 'string')) {
          return reply.status(400).send({
            success: false,
            error: 'All job IDs must be strings'
          });
        }

        // Soft delete all jobs that belong to user and are not already deleted
        const result = await safeQuery(async () => {
          return await prisma.job.updateMany({
            where: {
              id: { in: jobIds },
              userId,
              deletedAt: null
            },
            data: {
              deletedAt: new Date()
            }
          });
        });

        logger.info('Bulk delete completed', {
          userId,
          requestedCount: jobIds.length,
          deletedCount: result.count
        });

        return reply.send({
          success: true,
          message: `${result.count} job(s) deleted successfully`,
          deletedCount: result.count,
          requestedCount: jobIds.length
        });
      } catch (error) {
        logger.error('Failed to bulk delete jobs:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete jobs. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/jobs/bulk-restore
   * Restore multiple soft-deleted jobs at once
   * Request body: { jobIds: string[] }
   */
  fastify.post(
    '/api/jobs/bulk-restore',
    {
      preHandler: [authenticate, jobBulkOperationRateLimit]
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

        const { jobIds } = request.body || {};

        // Validate input
        if (!Array.isArray(jobIds) || jobIds.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'jobIds must be a non-empty array'
          });
        }

        // Limit bulk operations to reasonable size (max 100 jobs at once)
        if (jobIds.length > 100) {
          return reply.status(400).send({
            success: false,
            error: 'Cannot restore more than 100 jobs at once'
          });
        }

        // Verify all IDs are strings
        if (!jobIds.every(id => typeof id === 'string')) {
          return reply.status(400).send({
            success: false,
            error: 'All job IDs must be strings'
          });
        }

        // Restore all jobs that belong to user and are deleted
        const result = await safeQuery(async () => {
          return await prisma.job.updateMany({
            where: {
              id: { in: jobIds },
              userId,
              deletedAt: { not: null }
            },
            data: {
              deletedAt: null
            }
          });
        });

        logger.info('Bulk restore completed', {
          userId,
          requestedCount: jobIds.length,
          restoredCount: result.count
        });

        return reply.send({
          success: true,
          message: `${result.count} job(s) restored successfully`,
          restoredCount: result.count,
          requestedCount: jobIds.length
        });
      } catch (error) {
        logger.error('Failed to bulk restore jobs:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to restore jobs. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/bulk-status
   * Update status for multiple jobs at once
   * Request body: { jobIds: string[], status: JobStatus }
   */
  fastify.put(
    '/api/jobs/bulk-status',
    {
      preHandler: [authenticate, jobBulkOperationRateLimit]
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

        const { jobIds, status } = request.body || {};

        // Validate input
        if (!Array.isArray(jobIds) || jobIds.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'jobIds must be a non-empty array'
          });
        }

        // Limit bulk operations to reasonable size (max 100 jobs at once)
        if (jobIds.length > 100) {
          return reply.status(400).send({
            success: false,
            error: 'Cannot update more than 100 jobs at once'
          });
        }

        // Verify all IDs are strings
        if (!jobIds.every(id => typeof id === 'string')) {
          return reply.status(400).send({
            success: false,
            error: 'All job IDs must be strings'
          });
        }

        // Validate status field
        const validStatuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];
        if (!status || !validStatuses.includes(status)) {
          return reply.status(400).send({
            success: false,
            error: 'status must be one of: APPLIED, INTERVIEW, OFFER, REJECTED'
          });
        }

        // Update status for all jobs that belong to user and are not deleted
        const result = await safeQuery(async () => {
          return await prisma.job.updateMany({
            where: {
              id: { in: jobIds },
              userId,
              deletedAt: null
            },
            data: {
              status
            }
          });
        });

        logger.info('Bulk status update completed', {
          userId,
          status,
          requestedCount: jobIds.length,
          updatedCount: result.count
        });

        return reply.send({
          success: true,
          message: `${result.count} job(s) updated to ${status}`,
          updatedCount: result.count,
          requestedCount: jobIds.length,
          newStatus: status
        });
      } catch (error) {
        logger.error('Failed to bulk update job status:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update jobs. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/jobs/:id/favorite
   * Mark a job as favorite
   */
  fastify.post(
    '/api/jobs/:id/favorite',
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

        // Check if job exists and belongs to user
        const existingJob = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: {
              id,
              userId,
              deletedAt: null
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

        // Mark as favorite
        const updatedJob = await safeQuery(async () => {
          return await prisma.job.update({
            where: { id },
            data: {
              isFavorite: true
            }
          });
        });

        logger.info('Job marked as favorite', { userId, jobId: id, title: updatedJob.title });

        return reply.send({
          success: true,
          message: 'Job marked as favorite',
          job: updatedJob
        });
      } catch (error) {
        logger.error('Failed to favorite job:', error);

        if (error.code === 'P2025') {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to favorite job. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id/favorite
   * Remove favorite mark from a job
   */
  fastify.delete(
    '/api/jobs/:id/favorite',
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

        // Check if job exists and belongs to user
        const existingJob = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: {
              id,
              userId,
              deletedAt: null
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

        // Remove favorite mark
        const updatedJob = await safeQuery(async () => {
          return await prisma.job.update({
            where: { id },
            data: {
              isFavorite: false
            }
          });
        });

        logger.info('Job unfavorited', { userId, jobId: id, title: updatedJob.title });

        return reply.send({
          success: true,
          message: 'Job removed from favorites',
          job: updatedJob
        });
      } catch (error) {
        logger.error('Failed to unfavorite job:', error);

        if (error.code === 'P2025') {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to unfavorite job. Please try again.',
          message: error.message
        });
      }
    }
  );
};
