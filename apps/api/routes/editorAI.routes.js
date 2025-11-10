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
  generateCoverLetter,
  generatePortfolio
} = require('../services/ai/tailorService');
const { recordAIRequest, AIUsageError, ensureActionAllowed } = require('../services/ai/usageService');
const cacheConfig = require('../config/cacheConfig');
const { scoreResumeAgainstJob, hashJobDescription } = require('../services/ats/atsScoringService');
const { scoreResumeWorldClass } = require('../services/ats/worldClassATS');
const { AIAction } = require('@prisma/client');
const { atsScoreCounter, atsScoreGauge } = require('../observability/metrics');

function validateGeneratePayload(body) {
  const required = ['resumeId', 'sectionPath', 'sectionType'];
  for (const field of required) {
    if (!body || body[field] == null || body[field] === '') {
      return `Missing required field: ${field}`;
    }
  }
  if (typeof body.sectionPath !== 'string') {
    return 'sectionPath must be a string path (e.g., experience[0].summary)';
  }
  return null;
}

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

  fastify.options('/api/editor/ai/ats-check', allowCorsPreflight);
  fastify.options('/api/editor/ai/tailor', allowCorsPreflight);
  fastify.options('/api/editor/ai/apply-recommendations', allowCorsPreflight);
  fastify.options('/api/editor/ai/cover-letter', allowCorsPreflight);
  fastify.options('/api/editor/ai/portfolio', allowCorsPreflight);
  fastify.options('/api/editor/ai/generate-content', allowCorsPreflight);
  fastify.options('/api/editor/ai/apply-draft', allowCorsPreflight);

  fastify.post('/api/editor/ai/generate-content', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const validationError = validateGeneratePayload(request.body);
      if (validationError) {
        return reply.status(400).send({ success: false, error: validationError });
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
      } = request.body;

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
      return reply.status(500).send({ success: false, error: 'Failed to generate AI content.' });
    }
  });

  fastify.post('/api/editor/ai/apply-draft', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const { draftId } = request.body || {};
      if (!draftId) {
        return reply.status(400).send({ success: false, error: 'draftId is required' });
      }
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
      const { resumeId, jobDescription } = request.body || {};
      if (!resumeId) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'resumeId is required' });
      }
      if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'jobDescription must be at least 10 characters' });
      }

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      ensureActionAllowed(user.subscriptionTier, AIAction.ATS_SCORE);

      const jobHash = hashJobDescription(jobDescription);
      const cacheKeyParts = [userId, resumeId, jobHash];

      const { value: cachedValue, hit } = await cacheManager.wrap({
        namespace: CACHE_NAMESPACES.ATS_SCORE,
        keyParts: cacheKeyParts,
        ttl: cacheConfig.atsScoreTtlMs,
        fetch: async () => {
          const resume = await prisma.baseResume.findFirst({
            where: { id: resumeId, userId },
            select: { id: true, data: true, isActive: true, updatedAt: true }
          });
          if (!resume) {
            throw new Error('Base resume not found');
          }
          if (!resume.isActive) {
            throw new AIUsageError('You can only run AI features on the active resume.', 400);
          }
          
          // 🌟 USE WORLD-CLASS ATS SYSTEM (with AI if available)
          let analysis;
          try {
            analysis = await scoreResumeWorldClass({ 
              resumeData: resume.data, 
              jobDescription,
              useAI: true // Enable AI-powered semantic matching
            });
          } catch (worldClassError) {
            logger.error('World-class ATS failed, using fallback', { error: worldClassError.message });
            // Fallback to basic scoring if world-class fails
            const { scoreResumeAgainstJob } = require('../services/ats/atsScoringService');
            analysis = scoreResumeAgainstJob({ 
              resumeData: resume.data, 
              jobDescription 
            });
          }
          
          analysis.generatedAt = new Date().toISOString();
          analysis.resumeUpdatedAt = resume.updatedAt;
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
      logger.error('Failed to run ATS analysis', { error: error.message });
      setCorsHeaders(request, reply);
      return reply.status(500).send({ success: false, error: 'Failed to run ATS analysis.' });
    }
  });

  fastify.post('/api/editor/ai/tailor', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const {
        resumeId,
        jobDescription,
        mode,
        tone,
        length
      } = request.body || {};

      if (!resumeId) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'resumeId is required' });
      }
      if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'jobDescription must be at least 10 characters' });
      }

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
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
      setCorsHeaders(request, reply);
      return reply.status(500).send({ success: false, error: 'Failed to tailor resume.' });
    }
  });

  fastify.post('/api/editor/ai/apply-recommendations', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const {
        resumeId,
        jobDescription,
        focusAreas,
        tone
      } = request.body || {};

      if (!resumeId) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'resumeId is required' });
      }
      if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'jobDescription must be at least 10 characters' });
      }

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
      setCorsHeaders(request, reply);
      return reply.status(500).send({ success: false, error: 'Failed to apply AI recommendations.' });
    }
  });

  fastify.post('/api/editor/ai/cover-letter', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const {
        resumeId,
        jobTitle,
        company,
        jobDescription,
        tone
      } = request.body || {};

      if (!resumeId) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'resumeId is required' });
      }
      if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
        setCorsHeaders(request, reply);
        return reply.status(400).send({ success: false, error: 'jobDescription must be at least 10 characters' });
      }

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
      setCorsHeaders(request, reply);
      return reply.status(500).send({ success: false, error: 'Failed to generate cover letter.' });
    }
  });

  fastify.post('/api/editor/ai/portfolio', { preHandler: authenticate }, async (request, reply) => {
    try {
      setCorsHeaders(request, reply);
      const { resumeId, tone } = request.body || {};
      if (!resumeId) {
        return reply.status(400).send({ success: false, error: 'resumeId is required' });
      }

      const userId = request.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscriptionTier: true }
      });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      const result = await generatePortfolio({
        user,
        resumeId,
        tone
      });

      return reply.send({ success: true, ...result });
    } catch (error) {
      if (error instanceof AIUsageError) {
        return reply.status(error.statusCode || 403).send({ success: false, error: error.message });
      }
      logger.error('Failed to generate portfolio draft', { error: error.message });
      return reply.status(500).send({ success: false, error: 'Failed to generate portfolio draft.' });
    }
  });
};
