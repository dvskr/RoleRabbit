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
  jobBulkOperationLimiter,
  jobViewsLimiter,
  jobTrackingPostLimiter,
  jobTrackingModifyLimiter
} = require('../utils/rateLimiter');
const logger = require('../utils/logger');

// Create rate limit middleware instances
const jobGetRateLimit = createRateLimitMiddleware(jobGetLimiter);
const jobPostRateLimit = createRateLimitMiddleware(jobPostLimiter);
const jobPutRateLimit = createRateLimitMiddleware(jobPutLimiter);
const jobDeleteRateLimit = createRateLimitMiddleware(jobDeleteLimiter);
const jobBulkOperationRateLimit = createRateLimitMiddleware(jobBulkOperationLimiter);
const jobViewsRateLimit = createRateLimitMiddleware(jobViewsLimiter);
const jobTrackingPostRateLimit = createRateLimitMiddleware(jobTrackingPostLimiter);
const jobTrackingModifyRateLimit = createRateLimitMiddleware(jobTrackingModifyLimiter);

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
  logger.info('   → GET    /api/jobs/favorites');
  logger.info('   → POST   /api/jobs/bulk-delete');
  logger.info('   → POST   /api/jobs/bulk-restore');
  logger.info('   → PUT    /api/jobs/bulk-status');
  logger.info('   → POST   /api/jobs/views');
  logger.info('   → GET    /api/jobs/views');
  logger.info('   → DELETE /api/jobs/views/:id');
  logger.info('   → POST   /api/jobs/:id/interview-notes');
  logger.info('   → PUT    /api/jobs/:id/interview-notes/:noteId');
  logger.info('   → DELETE /api/jobs/:id/interview-notes/:noteId');
  logger.info('   → POST   /api/jobs/:id/salary-offers');
  logger.info('   → PUT    /api/jobs/:id/salary-offers/:offerId');
  logger.info('   → DELETE /api/jobs/:id/salary-offers/:offerId');
  logger.info('   → POST   /api/jobs/:id/company-insights');
  logger.info('   → PUT    /api/jobs/:id/company-insights/:insightId');
  logger.info('   → DELETE /api/jobs/:id/company-insights/:insightId');
  logger.info('   → POST   /api/jobs/:id/referrals');
  logger.info('   → PUT    /api/jobs/:id/referrals/:referralId');
  logger.info('   → DELETE /api/jobs/:id/referrals/:referralId');
  logger.info('   → POST   /api/jobs/:id/notes');
  logger.info('   → PUT    /api/jobs/:id/notes/:noteId');
  logger.info('   → DELETE /api/jobs/:id/notes/:noteId');
  logger.info('   → POST   /api/jobs/:id/reminders');
  logger.info('   → PUT    /api/jobs/:id/reminders/:reminderId');
  logger.info('   → DELETE /api/jobs/:id/reminders/:reminderId');

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

  /**
   * GET /api/jobs/favorites
   * Fetch all favorited jobs for authenticated user
   */
  fastify.get(
    '/api/jobs/favorites',
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

        // Fetch favorited jobs from database
        const jobs = await safeQuery(async () => {
          return await prisma.job.findMany({
            where: {
              userId,
              deletedAt: null,
              isFavorite: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          });
        });

        logger.debug('Favorited jobs fetched for user', { userId, count: jobs.length });

        return reply.send({
          success: true,
          jobs,
          count: jobs.length
        });
      } catch (error) {
        logger.error('Failed to fetch favorited jobs:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch favorited jobs. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/jobs/views
   * Save a custom filter view
   * Request body: { name: string, filters: object, columns?: string[] }
   */
  fastify.post(
    '/api/jobs/views',
    {
      preHandler: [authenticate, jobViewsRateLimit]
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

        const { name, filters, columns } = request.body || {};

        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'name is required and must be a non-empty string'
          });
        }

        if (!filters || typeof filters !== 'object') {
          return reply.status(400).send({
            success: false,
            error: 'filters is required and must be an object'
          });
        }

        if (columns && !Array.isArray(columns)) {
          return reply.status(400).send({
            success: false,
            error: 'columns must be an array if provided'
          });
        }

        // Create saved view
        const savedView = await safeQuery(async () => {
          return await prisma.savedView.create({
            data: {
              userId,
              name: name.trim(),
              filters,
              columns: columns || []
            }
          });
        });

        logger.info('Saved view created', { userId, viewId: savedView.id, name: savedView.name });

        return reply.status(201).send({
          success: true,
          view: savedView
        });
      } catch (error) {
        logger.error('Failed to create saved view:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create saved view. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/jobs/views
   * Fetch all saved views for authenticated user
   */
  fastify.get(
    '/api/jobs/views',
    {
      preHandler: [authenticate, jobViewsRateLimit]
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

        // Fetch all saved views
        const views = await safeQuery(async () => {
          return await prisma.savedView.findMany({
            where: {
              userId
            },
            orderBy: {
              createdAt: 'desc'
            }
          });
        });

        logger.debug('Saved views fetched for user', { userId, count: views.length });

        return reply.send({
          success: true,
          views,
          count: views.length
        });
      } catch (error) {
        logger.error('Failed to fetch saved views:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch saved views. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/views/:id
   * Delete a saved view
   */
  fastify.delete(
    '/api/jobs/views/:id',
    {
      preHandler: [authenticate, jobViewsRateLimit]
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

        // Check if view exists and belongs to user
        const existingView = await safeQuery(async () => {
          return await prisma.savedView.findFirst({
            where: {
              id,
              userId
            }
          });
        });

        if (!existingView) {
          logger.warn('Saved view not found or unauthorized', { userId, viewId: id });
          return reply.status(404).send({
            success: false,
            error: 'Saved view not found'
          });
        }

        // Delete saved view
        await safeQuery(async () => {
          return await prisma.savedView.delete({
            where: { id }
          });
        });

        logger.info('Saved view deleted', { userId, viewId: id, name: existingView.name });

        return reply.send({
          success: true,
          message: 'Saved view deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete saved view:', error);

        if (error.code === 'P2025') {
          return reply.status(404).send({
            success: false,
            error: 'Saved view not found'
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to delete saved view. Please try again.',
          message: error.message
        });
      }
    }
  );

  // ============================================================
  // Interview Notes Endpoints
  // ============================================================

  /**
   * POST /api/jobs/:id/interview-notes
   * Create interview note for a job
   */
  fastify.post(
    '/api/jobs/:id/interview-notes',
    {
      preHandler: [authenticate, jobTrackingPostRateLimit]
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

        const { id: jobId } = request.params;
        const { type, date, interviewer, notes, questions, feedback, rating } = request.body || {};

        // Verify job exists and belongs to user
        const job = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: { id: jobId, userId, deletedAt: null }
          });
        });

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Create interview note
        const interviewNote = await safeQuery(async () => {
          return await prisma.interviewNote.create({
            data: {
              jobId,
              userId,
              type: type || 'other',
              date: date || new Date().toISOString().split('T')[0],
              interviewer,
              notes: notes || '',
              questions: questions || [],
              feedback,
              rating
            }
          });
        });

        logger.info('Interview note created', { userId, jobId, noteId: interviewNote.id });

        return reply.status(201).send({
          success: true,
          interviewNote
        });
      } catch (error) {
        logger.error('Failed to create interview note:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create interview note. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/:id/interview-notes/:noteId
   * Update interview note
   */
  fastify.put(
    '/api/jobs/:id/interview-notes/:noteId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { noteId } = request.params;
        const updateData = request.body || {};

        // Verify note exists and belongs to user
        const existingNote = await safeQuery(async () => {
          return await prisma.interviewNote.findFirst({
            where: { id: noteId, userId }
          });
        });

        if (!existingNote) {
          return reply.status(404).send({
            success: false,
            error: 'Interview note not found'
          });
        }

        // Update note
        const updatedNote = await safeQuery(async () => {
          return await prisma.interviewNote.update({
            where: { id: noteId },
            data: updateData
          });
        });

        logger.info('Interview note updated', { userId, noteId });

        return reply.send({
          success: true,
          interviewNote: updatedNote
        });
      } catch (error) {
        logger.error('Failed to update interview note:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update interview note. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id/interview-notes/:noteId
   * Delete interview note
   */
  fastify.delete(
    '/api/jobs/:id/interview-notes/:noteId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { noteId } = request.params;

        // Verify note exists and belongs to user
        const existingNote = await safeQuery(async () => {
          return await prisma.interviewNote.findFirst({
            where: { id: noteId, userId }
          });
        });

        if (!existingNote) {
          return reply.status(404).send({
            success: false,
            error: 'Interview note not found'
          });
        }

        // Delete note
        await safeQuery(async () => {
          return await prisma.interviewNote.delete({
            where: { id: noteId }
          });
        });

        logger.info('Interview note deleted', { userId, noteId });

        return reply.send({
          success: true,
          message: 'Interview note deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete interview note:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete interview note. Please try again.',
          message: error.message
        });
      }
    }
  );

  // ============================================================
  // Salary Offers Endpoints
  // ============================================================

  /**
   * POST /api/jobs/:id/salary-offers
   * Create salary offer for a job
   */
  fastify.post(
    '/api/jobs/:id/salary-offers',
    {
      preHandler: [authenticate, jobTrackingPostRateLimit]
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

        const { id: jobId } = request.params;
        const { amount, currency, equity, benefits, notes, date, status } = request.body || {};

        // Verify job exists
        const job = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: { id: jobId, userId, deletedAt: null }
          });
        });

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Create salary offer
        const salaryOffer = await safeQuery(async () => {
          return await prisma.salaryOffer.create({
            data: {
              jobId,
              userId,
              amount: amount || 0,
              currency: currency || 'USD',
              equity,
              benefits: benefits || [],
              notes,
              date: date || new Date().toISOString().split('T')[0],
              status: status || 'initial'
            }
          });
        });

        logger.info('Salary offer created', { userId, jobId, offerId: salaryOffer.id });

        return reply.status(201).send({
          success: true,
          salaryOffer
        });
      } catch (error) {
        logger.error('Failed to create salary offer:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create salary offer. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/:id/salary-offers/:offerId
   * Update salary offer
   */
  fastify.put(
    '/api/jobs/:id/salary-offers/:offerId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { offerId } = request.params;
        const updateData = request.body || {};

        // Verify offer exists
        const existingOffer = await safeQuery(async () => {
          return await prisma.salaryOffer.findFirst({
            where: { id: offerId, userId }
          });
        });

        if (!existingOffer) {
          return reply.status(404).send({
            success: false,
            error: 'Salary offer not found'
          });
        }

        // Update offer
        const updatedOffer = await safeQuery(async () => {
          return await prisma.salaryOffer.update({
            where: { id: offerId },
            data: updateData
          });
        });

        logger.info('Salary offer updated', { userId, offerId });

        return reply.send({
          success: true,
          salaryOffer: updatedOffer
        });
      } catch (error) {
        logger.error('Failed to update salary offer:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update salary offer. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id/salary-offers/:offerId
   * Delete salary offer
   */
  fastify.delete(
    '/api/jobs/:id/salary-offers/:offerId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { offerId } = request.params;

        // Verify offer exists
        const existingOffer = await safeQuery(async () => {
          return await prisma.salaryOffer.findFirst({
            where: { id: offerId, userId }
          });
        });

        if (!existingOffer) {
          return reply.status(404).send({
            success: false,
            error: 'Salary offer not found'
          });
        }

        // Delete offer
        await safeQuery(async () => {
          return await prisma.salaryOffer.delete({
            where: { id: offerId }
          });
        });

        logger.info('Salary offer deleted', { userId, offerId });

        return reply.send({
          success: true,
          message: 'Salary offer deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete salary offer:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete salary offer. Please try again.',
          message: error.message
        });
      }
    }
  );

  // ============================================================
  // Company Insights Endpoints
  // ============================================================

  /**
   * POST /api/jobs/:id/company-insights
   * Create company insight for a job
   */
  fastify.post(
    '/api/jobs/:id/company-insights',
    {
      preHandler: [authenticate, jobTrackingPostRateLimit]
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

        const { id: jobId } = request.params;
        const { type, title, content, source, date } = request.body || {};

        // Verify job exists
        const job = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: { id: jobId, userId, deletedAt: null }
          });
        });

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Create insight
        const insight = await safeQuery(async () => {
          return await prisma.companyInsight.create({
            data: {
              jobId,
              userId,
              type: type || 'other',
              title: title || '',
              content: content || '',
              source,
              date: date || new Date().toISOString().split('T')[0]
            }
          });
        });

        logger.info('Company insight created', { userId, jobId, insightId: insight.id });

        return reply.status(201).send({
          success: true,
          companyInsight: insight
        });
      } catch (error) {
        logger.error('Failed to create company insight:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create company insight. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/:id/company-insights/:insightId
   * Update company insight
   */
  fastify.put(
    '/api/jobs/:id/company-insights/:insightId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { insightId } = request.params;
        const updateData = request.body || {};

        // Verify insight exists
        const existingInsight = await safeQuery(async () => {
          return await prisma.companyInsight.findFirst({
            where: { id: insightId, userId }
          });
        });

        if (!existingInsight) {
          return reply.status(404).send({
            success: false,
            error: 'Company insight not found'
          });
        }

        // Update insight
        const updatedInsight = await safeQuery(async () => {
          return await prisma.companyInsight.update({
            where: { id: insightId },
            data: updateData
          });
        });

        logger.info('Company insight updated', { userId, insightId });

        return reply.send({
          success: true,
          companyInsight: updatedInsight
        });
      } catch (error) {
        logger.error('Failed to update company insight:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update company insight. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id/company-insights/:insightId
   * Delete company insight
   */
  fastify.delete(
    '/api/jobs/:id/company-insights/:insightId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { insightId } = request.params;

        // Verify insight exists
        const existingInsight = await safeQuery(async () => {
          return await prisma.companyInsight.findFirst({
            where: { id: insightId, userId }
          });
        });

        if (!existingInsight) {
          return reply.status(404).send({
            success: false,
            error: 'Company insight not found'
          });
        }

        // Delete insight
        await safeQuery(async () => {
          return await prisma.companyInsight.delete({
            where: { id: insightId }
          });
        });

        logger.info('Company insight deleted', { userId, insightId });

        return reply.send({
          success: true,
          message: 'Company insight deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete company insight:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete company insight. Please try again.',
          message: error.message
        });
      }
    }
  );

  // ============================================================
  // Referral Contacts Endpoints
  // ============================================================

  /**
   * POST /api/jobs/:id/referrals
   * Create referral contact for a job
   */
  fastify.post(
    '/api/jobs/:id/referrals',
    {
      preHandler: [authenticate, jobTrackingPostRateLimit]
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

        const { id: jobId } = request.params;
        const { name, position, relationship, contacted, date, notes } = request.body || {};

        // Verify job exists
        const job = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: { id: jobId, userId, deletedAt: null }
          });
        });

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Create referral
        const referral = await safeQuery(async () => {
          return await prisma.referralContact.create({
            data: {
              jobId,
              userId,
              name: name || '',
              position: position || '',
              relationship: relationship || '',
              contacted: contacted || false,
              date: date || new Date().toISOString().split('T')[0],
              notes
            }
          });
        });

        logger.info('Referral contact created', { userId, jobId, referralId: referral.id });

        return reply.status(201).send({
          success: true,
          referralContact: referral
        });
      } catch (error) {
        logger.error('Failed to create referral contact:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create referral contact. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/:id/referrals/:referralId
   * Update referral contact
   */
  fastify.put(
    '/api/jobs/:id/referrals/:referralId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { referralId } = request.params;
        const updateData = request.body || {};

        // Verify referral exists
        const existingReferral = await safeQuery(async () => {
          return await prisma.referralContact.findFirst({
            where: { id: referralId, userId }
          });
        });

        if (!existingReferral) {
          return reply.status(404).send({
            success: false,
            error: 'Referral contact not found'
          });
        }

        // Update referral
        const updatedReferral = await safeQuery(async () => {
          return await prisma.referralContact.update({
            where: { id: referralId },
            data: updateData
          });
        });

        logger.info('Referral contact updated', { userId, referralId });

        return reply.send({
          success: true,
          referralContact: updatedReferral
        });
      } catch (error) {
        logger.error('Failed to update referral contact:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update referral contact. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id/referrals/:referralId
   * Delete referral contact
   */
  fastify.delete(
    '/api/jobs/:id/referrals/:referralId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { referralId } = request.params;

        // Verify referral exists
        const existingReferral = await safeQuery(async () => {
          return await prisma.referralContact.findFirst({
            where: { id: referralId, userId }
          });
        });

        if (!existingReferral) {
          return reply.status(404).send({
            success: false,
            error: 'Referral contact not found'
          });
        }

        // Delete referral
        await safeQuery(async () => {
          return await prisma.referralContact.delete({
            where: { id: referralId }
          });
        });

        logger.info('Referral contact deleted', { userId, referralId });

        return reply.send({
          success: true,
          message: 'Referral contact deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete referral contact:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete referral contact. Please try again.',
          message: error.message
        });
      }
    }
  );

  // ============================================================
  // Job Notes Endpoints
  // ============================================================

  /**
   * POST /api/jobs/:id/notes
   * Create job note
   */
  fastify.post(
    '/api/jobs/:id/notes',
    {
      preHandler: [authenticate, jobTrackingPostRateLimit]
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

        const { id: jobId } = request.params;
        const { title, content, tags, date, category } = request.body || {};

        // Verify job exists
        const job = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: { id: jobId, userId, deletedAt: null }
          });
        });

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Create note
        const note = await safeQuery(async () => {
          return await prisma.jobNote.create({
            data: {
              jobId,
              userId,
              title: title || '',
              content: content || '',
              tags: tags || [],
              date: date || new Date().toISOString().split('T')[0],
              category: category || 'other'
            }
          });
        });

        logger.info('Job note created', { userId, jobId, noteId: note.id });

        return reply.status(201).send({
          success: true,
          jobNote: note
        });
      } catch (error) {
        logger.error('Failed to create job note:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create job note. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/:id/notes/:noteId
   * Update job note
   */
  fastify.put(
    '/api/jobs/:id/notes/:noteId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { noteId } = request.params;
        const updateData = request.body || {};

        // Verify note exists
        const existingNote = await safeQuery(async () => {
          return await prisma.jobNote.findFirst({
            where: { id: noteId, userId }
          });
        });

        if (!existingNote) {
          return reply.status(404).send({
            success: false,
            error: 'Job note not found'
          });
        }

        // Update note
        const updatedNote = await safeQuery(async () => {
          return await prisma.jobNote.update({
            where: { id: noteId },
            data: updateData
          });
        });

        logger.info('Job note updated', { userId, noteId });

        return reply.send({
          success: true,
          jobNote: updatedNote
        });
      } catch (error) {
        logger.error('Failed to update job note:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update job note. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id/notes/:noteId
   * Delete job note
   */
  fastify.delete(
    '/api/jobs/:id/notes/:noteId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { noteId } = request.params;

        // Verify note exists
        const existingNote = await safeQuery(async () => {
          return await prisma.jobNote.findFirst({
            where: { id: noteId, userId }
          });
        });

        if (!existingNote) {
          return reply.status(404).send({
            success: false,
            error: 'Job note not found'
          });
        }

        // Delete note
        await safeQuery(async () => {
          return await prisma.jobNote.delete({
            where: { id: noteId }
          });
        });

        logger.info('Job note deleted', { userId, noteId });

        return reply.send({
          success: true,
          message: 'Job note deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete job note:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete job note. Please try again.',
          message: error.message
        });
      }
    }
  );

  // ============================================================
  // Job Reminders Endpoints
  // ============================================================

  /**
   * POST /api/jobs/:id/reminders
   * Create job reminder
   */
  fastify.post(
    '/api/jobs/:id/reminders',
    {
      preHandler: [authenticate, jobTrackingPostRateLimit]
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

        const { id: jobId } = request.params;
        const { title, description, dueDate, completed, priority, type } = request.body || {};

        // Verify job exists
        const job = await safeQuery(async () => {
          return await prisma.job.findFirst({
            where: { id: jobId, userId, deletedAt: null }
          });
        });

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found'
          });
        }

        // Create reminder
        const reminder = await safeQuery(async () => {
          return await prisma.jobReminder.create({
            data: {
              jobId,
              userId,
              title: title || '',
              description: description || '',
              dueDate: dueDate || new Date().toISOString().split('T')[0],
              completed: completed || false,
              priority: priority || 'MEDIUM',
              type: type || 'other'
            }
          });
        });

        logger.info('Job reminder created', { userId, jobId, reminderId: reminder.id });

        return reply.status(201).send({
          success: true,
          jobReminder: reminder
        });
      } catch (error) {
        logger.error('Failed to create job reminder:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create job reminder. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * PUT /api/jobs/:id/reminders/:reminderId
   * Update job reminder
   */
  fastify.put(
    '/api/jobs/:id/reminders/:reminderId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { reminderId } = request.params;
        const updateData = request.body || {};

        // Verify reminder exists
        const existingReminder = await safeQuery(async () => {
          return await prisma.jobReminder.findFirst({
            where: { id: reminderId, userId }
          });
        });

        if (!existingReminder) {
          return reply.status(404).send({
            success: false,
            error: 'Job reminder not found'
          });
        }

        // Update reminder
        const updatedReminder = await safeQuery(async () => {
          return await prisma.jobReminder.update({
            where: { id: reminderId },
            data: updateData
          });
        });

        logger.info('Job reminder updated', { userId, reminderId });

        return reply.send({
          success: true,
          jobReminder: updatedReminder
        });
      } catch (error) {
        logger.error('Failed to update job reminder:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update job reminder. Please try again.',
          message: error.message
        });
      }
    }
  );

  /**
   * DELETE /api/jobs/:id/reminders/:reminderId
   * Delete job reminder
   */
  fastify.delete(
    '/api/jobs/:id/reminders/:reminderId',
    {
      preHandler: [authenticate, jobTrackingModifyRateLimit]
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

        const { reminderId } = request.params;

        // Verify reminder exists
        const existingReminder = await safeQuery(async () => {
          return await prisma.jobReminder.findFirst({
            where: { id: reminderId, userId }
          });
        });

        if (!existingReminder) {
          return reply.status(404).send({
            success: false,
            error: 'Job reminder not found'
          });
        }

        // Delete reminder
        await safeQuery(async () => {
          return await prisma.jobReminder.delete({
            where: { id: reminderId }
          });
        });

        logger.info('Job reminder deleted', { userId, reminderId });

        return reply.send({
          success: true,
          message: 'Job reminder deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete job reminder:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete job reminder. Please try again.',
          message: error.message
        });
      }
    }
  );
};
