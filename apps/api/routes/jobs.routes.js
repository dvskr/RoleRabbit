'use strict';

const { authenticate } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const logger = require('../utils/logger');

module.exports = async function jobsRoutes(fastify) {
  // GET /api/jobs - Fetch all jobs for the authenticated user
  fastify.get('/api/jobs', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'User not authenticated', jobs: [] });
      }

      // Fetch jobs from database
      const jobs = await prisma.job.findMany({
        where: { userId },
        orderBy: { appliedDate: 'desc' }
      });

      logger.debug('Jobs fetched from database', { userId, count: jobs.length });

      return {
        success: true,
        jobs,
      };
    } catch (error) {
      logger.error('Failed to fetch jobs', { error: error.message, stack: error.stack });
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch jobs',
        jobs: []
      });
    }
  });

  // POST /api/jobs - Create a new job entry
  fastify.post('/api/jobs', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'User not authenticated' });
      }

      const payload = request.body || {};

      // Create job in database
      const newJob = await prisma.job.create({
        data: {
          userId,
          title: payload.title || 'Untitled Job',
          company: payload.company || '',
          location: payload.location || '',
          status: payload.status || 'applied',
          appliedDate: payload.appliedDate || new Date().toISOString().split('T')[0],
          priority: payload.priority || 'medium',
          salary: payload.salary || null,
          description: payload.description || null,
          url: payload.url || null,
          notes: payload.notes || null,
          contact: payload.contact || {},
          requirements: Array.isArray(payload.requirements) ? payload.requirements : [],
          benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
          remote: !!payload.remote,
          companySize: payload.companySize || null,
          industry: payload.industry || null,
          nextStep: payload.nextStep || null,
          nextStepDate: payload.nextStepDate || null,
          deletedAt: payload.deletedAt ? new Date(payload.deletedAt) : null,
        }
      });

      logger.debug('Job created in database', { userId, jobId: newJob.id });

      return reply.status(201).send({
        success: true,
        job: {
          ...newJob,
          lastUpdated: newJob.lastUpdated.toISOString(),
          createdAt: newJob.createdAt.toISOString(),
          deletedAt: newJob.deletedAt?.toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to create job', { error: error.message, stack: error.stack });
      return reply.status(500).send({
        success: false,
        error: 'Failed to create job'
      });
    }
  });

  // PUT /api/jobs/:id - Update an existing job
  fastify.put('/api/jobs/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'User not authenticated' });
      }

      const { id } = request.params;
      const updates = request.body || {};

      // Check if job exists and belongs to user
      const existingJob = await prisma.job.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingJob) {
        return reply.status(404).send({
          success: false,
          error: 'Job not found'
        });
      }

      // Prepare update data
      const updateData = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.appliedDate !== undefined) updateData.appliedDate = updates.appliedDate;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.salary !== undefined) updateData.salary = updates.salary;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.url !== undefined) updateData.url = updates.url;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.contact !== undefined) updateData.contact = updates.contact;
      if (updates.requirements !== undefined) updateData.requirements = updates.requirements;
      if (updates.benefits !== undefined) updateData.benefits = updates.benefits;
      if (updates.remote !== undefined) updateData.remote = updates.remote;
      if (updates.companySize !== undefined) updateData.companySize = updates.companySize;
      if (updates.industry !== undefined) updateData.industry = updates.industry;
      if (updates.nextStep !== undefined) updateData.nextStep = updates.nextStep;
      if (updates.nextStepDate !== undefined) updateData.nextStepDate = updates.nextStepDate;
      if (updates.deletedAt !== undefined) {
        updateData.deletedAt = updates.deletedAt ? new Date(updates.deletedAt) : null;
      }

      // Update job in database
      const updatedJob = await prisma.job.update({
        where: { id },
        data: updateData
      });

      logger.debug('Job updated in database', { userId, jobId: id });

      return {
        success: true,
        job: {
          ...updatedJob,
          lastUpdated: updatedJob.lastUpdated.toISOString(),
          createdAt: updatedJob.createdAt.toISOString(),
          deletedAt: updatedJob.deletedAt?.toISOString()
        }
      };
    } catch (error) {
      logger.error('Failed to update job', { error: error.message, stack: error.stack });
      return reply.status(500).send({
        success: false,
        error: 'Failed to update job'
      });
    }
  });

  // DELETE /api/jobs/:id - Permanently delete a job
  fastify.delete('/api/jobs/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'User not authenticated' });
      }

      const { id } = request.params;

      // Check if job exists and belongs to user
      const existingJob = await prisma.job.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingJob) {
        return reply.status(404).send({
          success: false,
          error: 'Job not found'
        });
      }

      // Delete job from database
      await prisma.job.delete({
        where: { id }
      });

      logger.debug('Job deleted from database', { userId, jobId: id });

      return { success: true };
    } catch (error) {
      logger.error('Failed to delete job', { error: error.message, stack: error.stack });
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete job'
      });
    }
  });
};
