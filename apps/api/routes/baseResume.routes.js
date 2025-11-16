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
const {
  asyncHandler,
  assertExists,
  assertOwnership,
  NotFoundError,
  ForbiddenError
} = require('../utils/errorHandler');
const { validateResumeData } = require('../schemas/resumeData.schema');
const { sanitizeTemplateId } = require('../utils/templateValidator');

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

  fastify.post('/api/base-resumes/:id/deactivate', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      
      logger.info('🔄 Deactivating BaseResume', { userId, baseResumeId });
      
      // Verify the resume exists and belongs to the user
      const resume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        }
      });

      if (!resume) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Resume not found or does not belong to you' 
        });
      }
      
      // Set activeBaseResumeId to null in the database
      await prisma.user.update({
        where: { id: userId },
        data: { activeBaseResumeId: null }
      });
      
      logger.info('✅ BaseResume deactivated successfully', { userId, baseResumeId });
      
      return reply.send({ success: true });
    } catch (error) {
      logger.error('❌ Failed to deactivate base resume', { error: error.message, stack: error.stack });
      return reply.status(500).send({ success: false, error: 'Failed to deactivate base resume' });
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

  // Get resume analytics
  fastify.get('/api/base-resumes/:id/analytics', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      
      logger.info('📊 Fetching resume analytics', { userId, baseResumeId });
      
      // Verify ownership
      const resume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        }
      });
      
      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found or you do not have permission to view its analytics'
        });
      }
      
      // Try to get analytics (table might not exist yet)
      let analytics = null;
      try {
        analytics = await prisma.resumeAnalytics.findUnique({
          where: {
            resumeId: baseResumeId
          }
        });
      } catch (error) {
        if (error.code === 'P2021' || error.message?.includes('resumeAnalytics')) {
          logger.warn('ResumeAnalytics table does not exist yet', { baseResumeId });
        } else {
          throw error;
        }
      }
      
      // Get tailored versions count
      const tailorCount = await prisma.tailoredVersion.count({
        where: {
          baseResumeId: baseResumeId
        }
      });
      
      // Get share links count
      let shareCount = 0;
      let totalViews = 0;
      try {
        const shareLinks = await prisma.resumeShareLink.findMany({
          where: {
            baseResumeId: baseResumeId
          },
          select: {
            viewCount: true
          }
        });
        shareCount = shareLinks.length;
        totalViews = shareLinks.reduce((sum, link) => sum + (link.viewCount || 0), 0);
      } catch (error) {
        if (error.code !== 'P2021' && !error.message?.includes('resumeShareLink')) {
          throw error;
        }
      }
      
      // Format response
      const formattedAnalytics = {
        resumeId: baseResumeId,
        resumeName: resume.name,
        viewCount: analytics?.viewCount || totalViews,
        exportCount: analytics?.exportCount || 0,
        tailorCount: tailorCount,
        shareCount: shareCount,
        shareViews: totalViews,
        lastViewed: analytics?.lastViewedAt?.toISOString() || null,
        lastExported: analytics?.lastExportedAt?.toISOString() || null,
        lastShared: analytics?.lastSharedAt?.toISOString() || null,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
        lastAIAccessed: resume.lastAIAccessedAt?.toISOString() || null
      };
      
      logger.info('✅ Resume analytics fetched', {
        userId,
        baseResumeId,
        tailorCount,
        shareCount
      });
      
      return reply.send({
        success: true,
        analytics: formattedAnalytics
      });
      
    } catch (error) {
      logger.error('❌ Failed to fetch resume analytics', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch resume analytics'
      });
    }
  });

  // Restore resume from tailored version
  fastify.post('/api/base-resumes/:id/restore/:versionId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      const versionId = request.params.versionId;
      
      logger.info('🔄 Restoring resume from version', { userId, baseResumeId, versionId });
      
      // Verify user owns the base resume
      const baseResume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        }
      });
      
      if (!baseResume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found or you do not have permission to restore it'
        });
      }
      
      // Get the tailored version
      const tailoredVersion = await prisma.tailoredVersion.findFirst({
        where: {
          id: versionId,
          baseResumeId: baseResumeId,
          userId: userId
        }
      });
      
      if (!tailoredVersion) {
        return reply.status(404).send({
          success: false,
          error: 'Version not found or does not belong to this resume'
        });
      }
      
      // Create a new tailored version as a backup of current state before restoring
      const backupVersion = await prisma.tailoredVersion.create({
        data: {
          userId: userId,
          baseResumeId: baseResumeId,
          jobTitle: `Backup before restore (${new Date().toLocaleDateString()})`,
          company: null,
          jobDescriptionHash: null,
          mode: 'PARTIAL',
          tone: null,
          data: baseResume.data,
          diff: null,
          atsScoreBefore: null,
          atsScoreAfter: null,
          isPromoted: false
        }
      });
      
      // Update base resume with tailored version data
      const updatedResume = await prisma.baseResume.update({
        where: { id: baseResumeId },
        data: {
          data: tailoredVersion.data,
          metadata: {
            ...(baseResume.metadata || {}),
            restoredFrom: versionId,
            restoredAt: new Date().toISOString(),
            backupVersionId: backupVersion.id,
            previousJobTitle: tailoredVersion.jobTitle
          },
          updatedAt: new Date()
        },
        select: {
          id: true,
          userId: true,
          slotNumber: true,
          name: true,
          isActive: true,
          data: true,
          formatting: true,
          metadata: true,
          lastAIAccessedAt: true,
          parsingConfidence: true,
          storageFileId: true,
          fileHash: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      // Update working draft if it exists
      const workingDraft = await prisma.workingDraft.findUnique({
        where: { baseResumeId: baseResumeId }
      });
      
      if (workingDraft) {
        await prisma.workingDraft.update({
          where: { baseResumeId: baseResumeId },
          data: {
            data: tailoredVersion.data,
            updatedAt: new Date()
          }
        });
      }
      
      logger.info('✅ Resume restored from version', {
        userId,
        baseResumeId,
        versionId,
        backupVersionId: backupVersion.id,
        jobTitle: tailoredVersion.jobTitle
      });
      
      return reply.send({
        success: true,
        resume: updatedResume,
        backupVersionId: backupVersion.id,
        message: `Resume restored from "${tailoredVersion.jobTitle || 'version'}". A backup of the previous state was created.`
      });
      
    } catch (error) {
      logger.error('❌ Failed to restore resume', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to restore resume from version'
      });
    }
  });

  // Get resume history (tailored versions)
  fastify.get('/api/base-resumes/:id/history', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      
      logger.info('📜 Fetching resume history', { userId, baseResumeId });
      
      // Verify user owns the resume
      const resume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        }
      });
      
      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found or you do not have permission to view its history'
        });
      }
      
      // Get all tailored versions for this resume
      const versions = await prisma.tailoredVersion.findMany({
        where: {
          baseResumeId: baseResumeId,
          userId: userId
        },
        select: {
          id: true,
          jobTitle: true,
          company: true,
          mode: true,
          tone: true,
          atsScoreBefore: true,
          atsScoreAfter: true,
          isPromoted: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Format response
      const formattedVersions = versions.map(v => ({
        id: v.id,
        type: 'tailored',
        jobTitle: v.jobTitle || 'Untitled Position',
        company: v.company || null,
        mode: v.mode,
        tone: v.tone,
        atsScoreBefore: v.atsScoreBefore,
        atsScoreAfter: v.atsScoreAfter,
        improvement: v.atsScoreBefore && v.atsScoreAfter 
          ? v.atsScoreAfter - v.atsScoreBefore 
          : null,
        isPromoted: v.isPromoted,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString()
      }));
      
      logger.info('✅ Resume history fetched', {
        userId,
        baseResumeId,
        versionCount: formattedVersions.length
      });
      
      return reply.send({
        success: true,
        versions: formattedVersions,
        count: formattedVersions.length
      });
      
    } catch (error) {
      logger.error('❌ Failed to fetch resume history', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch resume history'
      });
    }
  });

  // Duplicate base resume
  fastify.post('/api/base-resumes/:id/duplicate', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      
      logger.info('📋 Duplicating BaseResume', { userId, baseResumeId });
      
      // Get source resume
      const sourceResume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        }
      });
      
      if (!sourceResume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found or you do not have permission to duplicate it'
        });
      }
      
      // Check slot limit
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true }
      });
      
      const limits = getPlanLimits(user);
      const currentCount = await countBaseResumes(userId);
      
      if (currentCount >= limits.maxSlots) {
        return reply.status(403).send({
          success: false,
          error: `You have reached the limit of ${limits.maxSlots} resumes for your plan.`,
          meta: { maxSlots: limits.maxSlots, currentCount }
        });
      }
      
      // Find next available slot number
      const existingResumes = await prisma.baseResume.findMany({
        where: { userId },
        select: { slotNumber: true },
        orderBy: { slotNumber: 'asc' }
      });
      
      const usedSlots = existingResumes.map(r => r.slotNumber);
      let nextSlot = 1;
      for (let i = 1; i <= limits.maxSlots; i++) {
        if (!usedSlots.includes(i)) {
          nextSlot = i;
          break;
        }
      }
      
      // Create duplicate with "(Copy)" suffix
      const newName = `${sourceResume.name} (Copy)`;
      
      const duplicatedResume = await prisma.baseResume.create({
        data: {
          userId: userId,
          slotNumber: nextSlot,
          name: newName,
          isActive: false, // Don't activate the copy
          data: sourceResume.data,
          formatting: sourceResume.formatting,
          metadata: {
            ...(sourceResume.metadata || {}),
            duplicatedFrom: baseResumeId,
            duplicatedAt: new Date().toISOString()
          },
          parsingConfidence: sourceResume.parsingConfidence,
          // Don't copy: storageFileId, fileHash, embedding, workingDraft
        },
        select: {
          id: true,
          userId: true,
          slotNumber: true,
          name: true,
          isActive: true,
          data: true,
          formatting: true,
          metadata: true,
          lastAIAccessedAt: true,
          parsingConfidence: true,
          storageFileId: true,
          fileHash: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      logger.info('✅ BaseResume duplicated successfully', {
        userId,
        sourceId: baseResumeId,
        duplicateId: duplicatedResume.id,
        name: newName
      });
      
      return reply.status(201).send({
        success: true,
        resume: duplicatedResume,
        message: 'Resume duplicated successfully'
      });
      
    } catch (error) {
      logger.error('❌ Failed to duplicate base resume', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to duplicate resume'
      });
    }
  });

  // Parse resume by ID
  fastify.post('/api/base-resumes/:id/parse', { preHandler: authenticate }, async (request, reply) => {
    const startTime = Date.now();
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

      // Parse the resume with timeout
      const { parseResumeByFileHash } = require('../services/resumeParser');
      const { normalizeResumePayload } = require('../services/baseResumeService');
      
      // Add 2-minute timeout for parsing
      const parsePromise = parseResumeByFileHash({
        userId,
        fileHash: resume.fileHash,
        storageFileId: resume.storageFileId
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Parsing timeout after 2 minutes')), 120000)
      );
      
      logger.info('⏳ Starting parse operation...');
      const parseResult = await Promise.race([parsePromise, timeoutPromise]);

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

      const duration = Date.now() - startTime;
      logger.info('✅ Resume parsed successfully', {
        userId,
        baseResumeId,
        method: parseResult.method,
        confidence: parseResult.confidence,
        cacheHit: parseResult.cacheHit,
        draftCreated: true,
        durationMs: duration
      });

      return reply.send({
        success: true,
        message: 'Resume parsed successfully',
        confidence: parseResult.confidence,
        method: parseResult.method,
        durationMs: duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('❌ Failed to parse resume', {
        error: error.message,
        stack: error.stack,
        durationMs: duration
      });
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to parse resume',
        durationMs: duration
      });
    }
  });
};
