const { authenticate } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const logger = require('../utils/logger');
const cacheManager = require('../utils/cacheManager');
const { CACHE_NAMESPACES } = require('../utils/cacheKeys');
const { generateSectionDraft } = require('../services/ai/generateContentService');
const { applyDraft: applyDraftService, getDraft } = require('../services/ai/draftService');
const {
  tailorResume,
  applyRecommendations,
  generateCoverLetter
} = require('../services/ai/tailorService');
const { recordAIRequest, AIUsageError, ensureActionAllowed } = require('../services/ai/usageService');
const cacheConfig = require('../config/cacheConfig');
const crypto = require('crypto');
const { AIAction } = require('@prisma/client');

// Hash function for job description caching
function hashJobDescription(jobDescription = '') {
  return crypto.createHash('sha256').update(jobDescription.trim().toLowerCase()).digest('hex');
}
const { atsScoreCounter, atsScoreGauge } = require('../observability/metrics');
const {
  generateContentRequestSchema,
  applyDraftRequestSchema,
  atsCheckRequestSchema,
  tailorRequestSchema,
  applyRecommendationsRequestSchema,
  coverLetterRequestSchema
} = require('../schemas/editorAI.schemas');
const { parseBodyOrSendError } = require('../utils/validationHelpers');

module.exports = async function editorAIRoutes(fastify) {
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

  const handleAIException = (request, reply, error, fallbackMessage) => {
    setCorsHeaders(request, reply);
    const statusCode = error?.statusCode || error?.status || 500;
    const responsePayload = {
      success: false,
      error: error?.isAIServiceError && error?.message ? error.message : fallbackMessage,
    };
    if (error?.code) {
      responsePayload.code = error.code;
    }
    return reply.status(statusCode).send(responsePayload);
  };

  fastify.options('/api/editor/ai/ats-check', allowCorsPreflight);
  fastify.options('/api/editor/ai/tailor', allowCorsPreflight);
  fastify.options('/api/editor/ai/apply-recommendations', allowCorsPreflight);
  fastify.options('/api/editor/ai/cover-letter', allowCorsPreflight);
  fastify.options('/api/editor/ai/generate-content', allowCorsPreflight);
  fastify.options('/api/editor/ai/apply-draft', allowCorsPreflight);

  fastify.post('/api/editor/ai/generate-content', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const payload = parseBodyOrSendError({
        schema: generateContentRequestSchema,
        payload: request.body,
        reply,
        setCorsHeaders: () => setCorsHeaders(request, reply)
      });
      if (!payload) {
        return;
      }
      const {
        resumeId,
        sectionPath,
        sectionType,
        currentContent,
        jobContext,
        tone,
        length,
        instructions
      } = payload;

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true, activeBaseResumeId: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }
      if (user.activeBaseResumeId !== resumeId) {
        return reply.status(400).send({
          success: false,
          error: 'AI actions are only available for the active resume.'
        });
      }

      const result = await generateSectionDraft({
        user,
        resumeId,
        sectionPath,
        sectionType,
        currentContent,
        jobContext,
        tone,
        length,
        instructions
      });

      setCorsHeaders(request, reply);
      return reply.send({
        success: true,
        draft: result.draft,
        ai: result.ai,
        usage: result.usage
      });
    } catch (error) {
      if (error instanceof AIUsageError) {
        return reply.status(error.statusCode || 403).send({ success: false, error: error.message });
      }
      logger.error('Failed to generate resume content with AI', { error: error.message, stack: error.stack });
      return handleAIException(request, reply, error, 'Failed to generate AI content.');
    }
  });

  fastify.post('/api/editor/ai/apply-draft', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const payload = parseBodyOrSendError({
        schema: applyDraftRequestSchema,
        payload: request.body,
        reply,
        setCorsHeaders: () => setCorsHeaders(request, reply)
      });
      if (!payload) {
        return;
      }
      const { draftId } = payload;
      const userId = request.user.userId;

      const draftRecord = await getDraft(draftId);
      if (!draftRecord) {
        return reply.status(404).send({ success: false, error: 'Draft not found or expired' });
      }
      if (draftRecord.userId !== userId) {
        return reply.status(403).send({ success: false, error: 'You cannot apply this draft' });
      }

      const result = await applyDraftService({ draftId, userId });

      await recordAIRequest({
        userId,
        baseResumeId: draftRecord.baseResumeId,
        action: draftRecord.action || AIAction.GENERATE_CONTENT,
        status: 'applied',
        metadata: { draftId }
      });

      await Promise.all([
        cacheManager.invalidateNamespace(CACHE_NAMESPACES.JOB_ANALYSIS, [userId, draftRecord.baseResumeId]),
        cacheManager.invalidateNamespace(CACHE_NAMESPACES.ATS_SCORE, [userId, draftRecord.baseResumeId])
      ]);

      return reply.send({
        success: true,
        resume: result.updatedResume,
        draft: result.draft
      });
    } catch (error) {
      if (error instanceof AIUsageError) {
        return reply.status(error.statusCode || 403).send({ success: false, error: error.message });
      }
      logger.error('Failed to apply AI draft', { error: error.message, stack: error.stack });
      return reply.status(500).send({ success: false, error: 'Failed to apply AI draft.' });
    }
  });

  fastify.post('/api/editor/ai/ats-check', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const payload = parseBodyOrSendError({
        schema: atsCheckRequestSchema,
        payload: request.body,
        reply,
        setCorsHeaders: () => setCorsHeaders(request, reply)
      });
      if (!payload) {
        return;
      }
      const { resumeId, jobDescription } = payload;

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true, activeBaseResumeId: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      // ✅ Check if the resume is activated
      if (user.activeBaseResumeId !== resumeId) {
        return reply.status(400).send({
          success: false,
          error: 'Please activate this resume before running ATS analysis.'
        });
      }

      ensureActionAllowed(user.subscriptionTier, AIAction.ATS_SCORE);

      const jobHash = hashJobDescription(jobDescription);
      const cacheKeyParts = [userId, resumeId, jobHash];

      const { value: cachedValue, hit } = await cacheManager.wrap({
        namespace: CACHE_NAMESPACES.ATS_SCORE,
        keyParts: cacheKeyParts,
        ttl: cacheConfig.atsScoreTtlMs,
        fetch: async () => {
          // 🎯 DRAFT-AWARE: Get current resume data (draft OR base)
          const { getCurrentResumeData } = require('../services/workingDraftService');
          const resumeData = await getCurrentResumeData(resumeId);
          
          if (!resumeData || !resumeData.data) {
            logger.warn('ATS requested resume data not found', {
              userId,
              requestedResumeId: resumeId,
              jobHash
            });
            throw new AIUsageError(
              'The selected resume could not be found. Please refresh your resumes and try again.',
              404
            );
          }
          
          logger.debug('ATS using resume data', {
            resumeId,
            isDraft: resumeData.isDraft,
            draftUpdatedAt: resumeData.draftUpdatedAt,
            baseUpdatedAt: resumeData.baseUpdatedAt
          });
          
          // 🌟 EMBEDDING-BASED ATS (Vector Similarity - Best Performance)
          let analysis;
          
          try {
            const { scoreResumeWithEmbeddings } = require('../services/embeddings/embeddingATSService');
            const embeddingResult = await scoreResumeWithEmbeddings({
              resumeData: resumeData.data,
              jobDescription,
              includeDetails: true
            });
            
            // Transform to match existing API format
            analysis = {
              overall: embeddingResult.overall,
              matchedKeywords: embeddingResult.matchedKeywords || [],
              missingKeywords: embeddingResult.missingKeywords || [],
              semanticScore: embeddingResult.semanticScore,
              similarity: embeddingResult.similarity,
              method: 'embedding',
              performance: embeddingResult.performance,
              isDraft: resumeData.isDraft // Include draft status in response
            };
            
            logger.info('Embedding-based ATS scoring complete', {
              resumeId,
              overall: analysis.overall,
              duration: embeddingResult.performance.duration,
              fromCache: embeddingResult.performance.fromCache,
              isDraft: resumeData.isDraft
            });
          } catch (embeddingError) {
            logger.error('Embedding-based ATS failed', { 
              error: embeddingError.message,
              stack: embeddingError.stack
            });
            
            // Return error response instead of fallback
            throw new Error(`ATS scoring failed: ${embeddingError.message}`);
          }
          
          analysis.generatedAt = new Date().toISOString();
          analysis.resumeUpdatedAt = resumeData.isDraft ? resumeData.draftUpdatedAt : resumeData.baseUpdatedAt;
          return analysis;
        }
      });

      await cacheManager.set(CACHE_NAMESPACES.JOB_ANALYSIS, cacheKeyParts, cachedValue, {
        ttl: cacheConfig.jobAnalysisTtlMs
      }).catch(() => {});

      await recordAIRequest({
        userId,
        baseResumeId: resumeId,
        action: AIAction.ATS_SCORE,
        provider: 'deterministic',
        model: 'rule-based',
        tokensUsed: 0,
        metadata: {
          matchedKeywords: cachedValue.matchedKeywords?.length || 0,
          missingKeywords: cachedValue.missingKeywords?.length || 0
        }
      });

      const scoreBucket = (() => {
        const score = Number(cachedValue.overall || 0);
        if (score >= 90) return '90_plus';
        if (score >= 75) return '75_89';
        if (score >= 60) return '60_74';
        return 'below_60';
      })();

      atsScoreCounter.inc({ result_bucket: scoreBucket });
      atsScoreGauge.set({ userId, resumeId }, Number(cachedValue.overall || 0));

      logger.info('ATS analysis completed', {
        userId,
        resumeId,
        score: cachedValue.overall,
        matchedKeywords: cachedValue.matchedKeywords?.length || 0,
        missingKeywords: cachedValue.missingKeywords?.length || 0,
        cacheHit: hit ? 'hit' : 'miss'
      });

      setCorsHeaders(request, reply);
      return reply.send({
        success: true,
        analysis: cachedValue,
        matchedKeywords: cachedValue.matchedKeywords || [],
        missingKeywords: cachedValue.missingKeywords || [],
        strengths: cachedValue.strengths || [],
        improvements: cachedValue.improvements || [],
        actionableTips: cachedValue.actionable_tips || [], // New: World-class actionable tips
        meta: cachedValue.meta || {} // New: Analysis metadata
      });
    } catch (error) {
      if (error instanceof AIUsageError) {
        setCorsHeaders(request, reply);
        return reply.status(error.statusCode || 403).send({ success: false, error: error.message });
      }
      logger.error('Failed to run ATS analysis', { error: error.message, stack: error.stack });
      return handleAIException(request, reply, error, 'Failed to run ATS analysis.');
    }
  });

  fastify.post('/api/editor/ai/tailor', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const payload = parseBodyOrSendError({
        schema: tailorRequestSchema,
        payload: request.body,
        reply,
        setCorsHeaders: () => setCorsHeaders(request, reply)
      });
      if (!payload) {
        return;
      }
      const {
        resumeId,
        jobDescription,
        mode,
        tone,
        length
      } = payload;

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true, activeBaseResumeId: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      // ✅ Check if the resume is activated
      if (user.activeBaseResumeId !== resumeId) {
        return reply.status(400).send({
          success: false,
          error: 'Please activate this resume before tailoring.'
        });
      }

      const result = await tailorResume({
        user,
        resumeId,
        jobDescription,
        mode,
        tone,
        length
      });

      setCorsHeaders(request, reply);
      return reply.send({
        success: true,
        ...result
      });
    } catch (error) {
      if (error instanceof AIUsageError) {
        setCorsHeaders(request, reply);
        return reply.status(error.statusCode || 403).send({ success: false, error: error.message });
      }
      logger.error('Failed to tailor resume', { error: error.message });
      return handleAIException(request, reply, error, 'Failed to tailor resume.');
    }
  });

  fastify.post('/api/editor/ai/apply-recommendations', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const payload = parseBodyOrSendError({
        schema: applyRecommendationsRequestSchema,
        payload: request.body,
        reply,
        setCorsHeaders: () => setCorsHeaders(request, reply)
      });
      if (!payload) {
        return;
      }
      const {
        resumeId,
        jobDescription,
        focusAreas,
        tone
      } = payload;

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      const result = await applyRecommendations({
        user,
        resumeId,
        jobDescription,
        focusAreas,
        tone
      });

      setCorsHeaders(request, reply);
      return reply.send({
        success: true,
        ...result
      });
    } catch (error) {
      if (error instanceof AIUsageError) {
        setCorsHeaders(request, reply);
        return reply.status(error.statusCode || 403).send({ success: false, error: error.message });
      }
      logger.error('Failed to apply AI recommendations', { error: error.message });
      return handleAIException(request, reply, error, 'Failed to apply AI recommendations.');
    }
  });

  fastify.post('/api/editor/ai/cover-letter', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const payload = parseBodyOrSendError({
        schema: coverLetterRequestSchema,
        payload: request.body,
        reply,
        setCorsHeaders: () => setCorsHeaders(request, reply)
      });
      if (!payload) {
        return;
      }
      const {
        resumeId,
        jobTitle,
        company,
        jobDescription,
        tone
      } = payload;

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      const result = await generateCoverLetter({
        user,
        resumeId,
        jobTitle,
        company,
        jobDescription,
        tone
      });

      setCorsHeaders(request, reply);
      return reply.send({ success: true, ...result });
    } catch (error) {
      if (error instanceof AIUsageError) {
        setCorsHeaders(request, reply);
        return reply.status(error.statusCode || 403).send({ success: false, error: error.message });
      }
      logger.error('Failed to generate cover letter', { error: error.message });
      return handleAIException(request, reply, error, 'Failed to generate cover letter.');
    }
  });
};
