const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const { prisma } = require('../utils/db');
const {
  listBaseResumes,
  createBaseResume,
  activateBaseResume,
  deleteBaseResume,
  getPlanLimits,
  countBaseResumes,
  getBaseResume,
  updateBaseResume
} = require('../services/baseResumeService');

module.exports = async function baseResumeRoutes(fastify) {
  fastify.get('/api/base-resumes', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const [resumes, user] = await Promise.all([
        listBaseResumes(userId),
        prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionTier: true, activeBaseResumeId: true }
        })
      ]);

      return reply.send({
        success: true,
        resumes,
        limits: getPlanLimits(user),
        activeBaseResumeId: user?.activeBaseResumeId || null
      });
    } catch (error) {
      logger.error('Failed to list base resumes', { error: error.message });
      return reply.status(500).send({ success: false, error: 'Failed to list base resumes' });
    }
  });

  fastify.post('/api/base-resumes', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { name, data, formatting, metadata } = request.body || {};
      const resume = await createBaseResume({ userId, name, data, formatting, metadata });
      return reply.status(201).send({ success: true, resume });
    } catch (error) {
      if (error.code === 'SLOT_LIMIT_REACHED') {
        return reply.status(403).send({ success: false, error: error.message, meta: error.meta });
      }
      logger.error('Failed to create base resume', { error: error.message });
      return reply.status(500).send({ success: false, error: 'Failed to create base resume' });
    }
  });

  fastify.get('/api/base-resumes/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      const resume = await getBaseResume({ userId, baseResumeId });
      if (!resume) {
        return reply.status(404).send({ success: false, error: 'Base resume not found' });
      }
      return reply.send({ success: true, resume });
    } catch (error) {
      logger.error('Failed to fetch base resume', { error: error.message });
      return reply.status(500).send({ success: false, error: 'Failed to fetch base resume' });
    }
  });

  fastify.patch('/api/base-resumes/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      const {
        name,
        data,
        formatting,
        metadata,
        lastKnownServerUpdatedAt
      } = request.body || {};

      const updated = await updateBaseResume({
        userId,
        baseResumeId,
        name,
        data,
        formatting,
        metadata,
        lastKnownServerUpdatedAt
      });

      return reply.send({ success: true, resume: updated });
    } catch (error) {
      if (error.code === 'BASE_RESUME_NOT_FOUND') {
        return reply.status(404).send({ success: false, error: error.message });
      }
      if (error.code === 'RESUME_CONFLICT') {
        return reply.status(409).send({ success: false, error: error.message });
      }
      logger.error('Failed to update base resume', { error: error.message });
      return reply.status(500).send({ success: false, error: 'Failed to update base resume' });
    }
  });

  fastify.post('/api/base-resumes/:id/activate', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      await activateBaseResume({ userId, baseResumeId });
      return reply.send({ success: true });
    } catch (error) {
      if (error.code === 'BASE_RESUME_NOT_FOUND') {
        return reply.status(404).send({ success: false, error: error.message });
      }
      logger.error('Failed to activate base resume', { error: error.message });
      return reply.status(500).send({ success: false, error: 'Failed to activate base resume' });
    }
  });

  fastify.delete('/api/base-resumes/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      await deleteBaseResume({ userId, baseResumeId });
      const remaining = await countBaseResumes(userId);
      return reply.send({ success: true, remaining });
    } catch (error) {
      if (error.code === 'BASE_RESUME_NOT_FOUND') {
        return reply.status(404).send({ success: false, error: error.message });
      }
      logger.error('Failed to delete base resume', { error: error.message });
      return reply.status(500).send({ success: false, error: 'Failed to delete base resume' });
    }
  });
};
