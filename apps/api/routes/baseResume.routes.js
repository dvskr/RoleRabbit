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
      const { name, data, formatting, metadata, storageFileId, fileHash } = request.body || {};
      
      logger.info('📝 Creating BaseResume', { 
        userId, 
        name, 
        hasStorageFileId: !!storageFileId, 
        hasFileHash: !!fileHash 
      });
      
      const resume = await createBaseResume({ 
        userId, 
        name, 
        data, 
        formatting, 
        metadata,
        storageFileId,  // ✅ ADD: Link to uploaded file
        fileHash        // ✅ ADD: For caching/parsing
      });
      
      logger.info('✅ BaseResume created successfully', { 
        resumeId: resume.id, 
        name: resume.name,
        storageFileId: resume.storageFileId,
        fileHash: resume.fileHash
      });
      
      return reply.status(201).send({ success: true, resume });
    } catch (error) {
      if (error.code === 'SLOT_LIMIT_REACHED') {
        return reply.status(403).send({ success: false, error: error.message, meta: error.meta });
      }
      logger.error('❌ Failed to create base resume', { error: error.message, stack: error.stack });
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
      
      logger.info('🔄 Activating BaseResume', { userId, baseResumeId });
      
      await activateBaseResume({ userId, baseResumeId });
      
      logger.info('✅ BaseResume activated successfully', { userId, baseResumeId });
      
      return reply.send({ success: true });
    } catch (error) {
      if (error.code === 'BASE_RESUME_NOT_FOUND') {
        return reply.status(404).send({ success: false, error: error.message });
      }
      logger.error('❌ Failed to activate base resume', { error: error.message, stack: error.stack });
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

  // Parse resume by ID
  fastify.post('/api/base-resumes/:id/parse', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;

      // Get the resume
      const resume = await prisma.baseResume.findFirst({
        where: { id: baseResumeId, userId },
        select: {
          id: true,
          userId: true,
          fileHash: true,
          storageFileId: true,
          formatting: true,
          metadata: true
        }
      });

      if (!resume) {
        return reply.status(404).send({ success: false, error: 'Resume not found' });
      }

      if (!resume.fileHash && !resume.storageFileId) {
        return reply.status(400).send({ success: false, error: 'No file attached to this resume' });
      }

      logger.info('🔄 Parsing resume by ID', {
        userId,
        baseResumeId,
        fileHash: resume.fileHash,
        storageFileId: resume.storageFileId
      });

      // Parse the resume
      const { parseResumeByFileHash } = require('../services/resumeParser');
      const { normalizeResumePayload } = require('../services/baseResumeService');
      
      const parseResult = await parseResumeByFileHash({
        userId,
        fileHash: resume.fileHash,
        storageFileId: resume.storageFileId
      });

      // Update resume with parsed data
      const parsedData = normalizeResumePayload(parseResult.structuredResume);
      await prisma.baseResume.update({
        where: { id: baseResumeId },
        data: {
          data: parsedData,
          parsingConfidence: parseResult.confidence
        }
      });

      // Create a working draft immediately after parsing
      const { saveWorkingDraft } = require('../services/workingDraftService');
      await saveWorkingDraft({
        userId,
        baseResumeId,
        data: parsedData,
        formatting: resume.formatting || {},
        metadata: resume.metadata || {}
      });

      logger.info('✅ Resume parsed successfully', {
        userId,
        baseResumeId,
        method: parseResult.method,
        confidence: parseResult.confidence,
        cacheHit: parseResult.cacheHit,
        draftCreated: true
      });

      return reply.send({
        success: true,
        message: 'Resume parsed successfully',
        confidence: parseResult.confidence,
        method: parseResult.method
      });
    } catch (error) {
      logger.error('❌ Failed to parse resume', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to parse resume'
      });
    }
  });
};
