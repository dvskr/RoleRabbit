const { AIAction, TailorMode, GeneratedDocType } = require('@prisma/client');
const { prisma } = require('../../utils/db');
const { generateText } = require('../../utils/openAI');
const cacheManager = require('../../utils/cacheManager');
const { CACHE_NAMESPACES } = require('../../utils/cacheKeys');
const {
  aiActionCounter,
  aiActionLatency,
  atsScoreGauge
} = require('../../observability/metrics');
const {
  ensureActionAllowed,
  ensureWithinRateLimit,
  recordAIRequest,
  AIUsageError
} = require('./usageService');
const {
  buildTailorResumePrompt,
  buildApplyRecommendationsPrompt,
  buildCoverLetterPrompt,
  buildPortfolioPrompt
} = require('./promptBuilder');
const { scoreResumeAgainstJob } = require('../ats/atsScoringService');
const logger = require('../../utils/logger');
const { normalizeResumeData } = require('@roleready/resume-normalizer');
const { jsonrepair } = require('jsonrepair');

function parseJsonResponse(rawText, description) {
  if (!rawText) {
    logger.error(`${description} response was empty`);
    throw new Error(`${description} response was empty.`);
  }
  try {
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      logger.error(`No JSON payload found in ${description} response`, {
        responseLength: rawText.length,
        responsePreview: rawText.substring(0, 200)
      });
      throw new Error('No JSON payload found');
    }
    const jsonString = rawText.slice(jsonStart, jsonEnd + 1);
    logger.info(`Attempting to parse JSON for ${description}`, {
      jsonLength: jsonString.length,
      jsonPreview: jsonString.substring(0, 200)
    });
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      logger.warn(`Failed to parse ${description} JSON, attempting jsonrepair`, {
        error: parseError.message,
        jsonPreview: jsonString.substring(0, 200)
      });
      const repaired = jsonrepair(jsonString);
      return JSON.parse(repaired);
    }
  } catch (error) {
    logger.error(`Failed to parse ${description} response`, {
      error: error.message,
      rawTextLength: rawText?.length,
      rawTextPreview: rawText?.substring(0, 500)
    });
    throw new Error(`Failed to parse ${description} response: ${error.message}`);
  }
}

async function getActiveResumeOrThrow({ userId, resumeId }) {
  const resume = await prisma.baseResume.findFirst({
    where: { id: resumeId, userId },
    select: { id: true, userId: true, isActive: true, data: true, metadata: true }
  });
  if (!resume) {
    throw new Error('Base resume not found');
  }
  if (!resume.isActive) {
    throw new AIUsageError('You can only run AI features on the active resume.', 400);
  }
  return resume;
}

function normalizeTailoredMode(mode) {
  if (typeof mode === 'string' && mode.toUpperCase() === TailorMode.FULL) {
    return TailorMode.FULL;
  }
  return TailorMode.PARTIAL;
}

async function tailorResume({
  user,
  resumeId,
  jobDescription,
  mode = TailorMode.PARTIAL,
  tone = 'professional',
  length = 'thorough'
}) {
  const tailorMode = normalizeTailoredMode(mode);
  const action = tailorMode === TailorMode.FULL ? AIAction.TAILOR_FULL : AIAction.TAILOR_PARTIAL;

  ensureActionAllowed(user.subscriptionTier, action);
  await ensureWithinRateLimit({ userId: user.id, action, tier: user.subscriptionTier });

  const resume = await getActiveResumeOrThrow({ userId: user.id, resumeId });

  const atsBefore = scoreResumeAgainstJob({ resumeData: resume.data, jobDescription });

  const prompt = buildTailorResumePrompt({
    resumeSnapshot: resume.data,
    jobDescription,
    mode: tailorMode,
    tone,
    length
  });

  const stopTimer = aiActionLatency.startTimer({
    action: action === AIAction.TAILOR_FULL ? 'tailor_full' : 'tailor_partial',
    model: tailorMode === TailorMode.FULL ? 'gpt-4o' : 'gpt-4o-mini'
  });

  try {
    logger.info('Starting AI tailoring', {
      userId: user.id,
      resumeId,
      mode: tailorMode,
      tone,
      length,
      promptLength: prompt.length
    });

    const response = await generateText(prompt, {
      model: tailorMode === TailorMode.FULL ? 'gpt-4o' : 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: tailorMode === TailorMode.FULL ? 1600 : 1100,
      timeout: 120000, // 2 minutes timeout
      userId: user.id
    });

    logger.info('AI tailoring response received', {
      userId: user.id,
      responseLength: response.text?.length || 0,
      tokensUsed: response.usage?.total_tokens
    });

    const payload = parseJsonResponse(response.text, 'tailor resume');
    if (!payload.tailoredResume || typeof payload.tailoredResume !== 'object') {
      throw new Error('Tailor response missing tailoredResume payload');
    }
    if (!Array.isArray(payload.diff)) {
      payload.diff = [];
    }
    if (!Array.isArray(payload.recommendedKeywords)) {
      payload.recommendedKeywords = [];
    }
    if (!Array.isArray(payload.warnings)) {
      payload.warnings = [];
    }

    // Normalize the tailored resume data to convert objects with numeric keys to arrays
    const normalizedTailoredResume = normalizeResumeData(payload.tailoredResume);

    const atsAfter = scoreResumeAgainstJob({ resumeData: normalizedTailoredResume, jobDescription });

    const tailoredVersion = await prisma.tailoredVersion.create({
      data: {
        userId: user.id,
        baseResumeId: resume.id,
        jobTitle: null,
        company: null,
        jobDescriptionHash: atsAfter.jobDescriptionHash,
        mode: tailorMode,
        tone,
        data: normalizedTailoredResume,
        diff: payload.diff,
        atsScoreBefore: atsBefore.overall,
        atsScoreAfter: atsAfter.overall
      }
    });

    await recordAIRequest({
      userId: user.id,
      baseResumeId: resume.id,
      action,
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
      metadata: {
        warnings: payload.warnings,
        recommendedKeywords: payload.recommendedKeywords,
        mode: tailorMode,
        atsBefore: atsBefore.overall,
        atsAfter: atsAfter.overall
      }
    });

    aiActionCounter.inc({
      action: action === AIAction.TAILOR_FULL ? 'tailor_full' : 'tailor_partial',
      tier: user.subscriptionTier
    });
    stopTimer();
    atsScoreGauge.set({ userId: user.id, resumeId }, atsAfter.overall);

    logger.info('AI tailoring completed', {
      userId: user.id,
      resumeId,
      jobDescriptionHash: atsAfter.jobDescriptionHash,
      mode: tailorMode,
      tone,
      atsBefore: atsBefore.overall,
      atsAfter: atsAfter.overall,
      warnings: payload.warnings.length,
      diffCount: payload.diff.length
    });

    return {
      tailoredVersion,
      tailoredResume: normalizedTailoredResume,
      diff: payload.diff,
      recommendedKeywords: payload.recommendedKeywords,
      warnings: payload.warnings,
      ats: { before: atsBefore, after: atsAfter },
      confidence: typeof payload.confidence === 'number' ? payload.confidence : null
    };
  } catch (error) {
    stopTimer();
    logger.error('AI tailoring failed', {
      userId: user.id,
      resumeId,
      mode: tailorMode,
      error: error.message
    });
    throw error;
  }
}

async function applyRecommendations({
  user,
  resumeId,
  jobDescription,
  focusAreas,
  tone = 'professional'
}) {
  ensureActionAllowed(user.subscriptionTier, AIAction.APPLY_RECOMMENDATIONS);
  await ensureWithinRateLimit({
    userId: user.id,
    action: AIAction.APPLY_RECOMMENDATIONS,
    tier: user.subscriptionTier
  });

  const resume = await getActiveResumeOrThrow({ userId: user.id, resumeId });

  const atsBefore = scoreResumeAgainstJob({ resumeData: resume.data, jobDescription });

  const prompt = buildApplyRecommendationsPrompt({
    resumeSnapshot: resume.data,
    jobDescription,
    focusAreas,
    tone
  });

  const stopTimer = aiActionLatency.startTimer({ action: 'apply_recommendations', model: 'gpt-4o-mini' });

  try {
    logger.info('Starting apply recommendations', {
      userId: user.id,
      resumeId,
      focusAreas: focusAreas?.length || 0,
      promptLength: prompt.length
    });

    const response = await generateText(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.25,
      max_tokens: 1000,
      timeout: 90000, // 90 seconds timeout
      userId: user.id
    });

    logger.info('Apply recommendations response received', {
      userId: user.id,
      responseLength: response.text?.length || 0,
      tokensUsed: response.usage?.total_tokens
    });

    const payload = parseJsonResponse(response.text, 'apply recommendations');
    const { updatedResume, appliedRecommendations = [], warnings = [] } = payload;
    if (!updatedResume || typeof updatedResume !== 'object') {
      throw new Error('Apply recommendations response missing updatedResume payload');
    }

    // Normalize the updated resume data to convert objects with numeric keys to arrays
    const normalizedUpdatedResume = normalizeResumeData(updatedResume);

    const updatedRecord = await prisma.baseResume.update({
      where: { id: resume.id },
      data: {
        data: normalizedUpdatedResume,
        lastAIAccessedAt: new Date()
      },
      select: { id: true, userId: true, data: true, metadata: true, updatedAt: true, name: true }
    });

    await Promise.all([
      cacheManager.invalidateNamespace(CACHE_NAMESPACES.JOB_ANALYSIS, [user.id, resume.id]),
      cacheManager.invalidateNamespace(CACHE_NAMESPACES.ATS_SCORE, [user.id, resume.id])
    ]).catch((error) => {
      logger.warn('Failed to invalidate caches after applyRecommendations', { error: error.message });
    });

    const atsAfter = scoreResumeAgainstJob({ resumeData: normalizedUpdatedResume, jobDescription });

    await recordAIRequest({
      userId: user.id,
      baseResumeId: resume.id,
      action: AIAction.APPLY_RECOMMENDATIONS,
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
      metadata: {
        recommendationsCount: appliedRecommendations.length,
        warnings,
        atsBefore: atsBefore.overall,
        atsAfter: atsAfter.overall
      }
    });

    aiActionCounter.inc({ action: 'apply_recommendations', tier: user.subscriptionTier });
    stopTimer();
    atsScoreGauge.set({ userId: user.id, resumeId }, atsAfter.overall);

    logger.info('AI recommendations applied', {
      userId: user.id,
      resumeId,
      recommendations: appliedRecommendations.length,
      atsBefore: atsBefore.overall,
      atsAfter: atsAfter.overall,
      warnings: warnings.length
    });

    return {
      updatedResume: updatedRecord,
      appliedRecommendations,
      warnings,
      ats: {
        before: atsBefore,
        after: atsAfter
      },
      confidence: typeof payload.confidence === 'number' ? payload.confidence : null
    };
  } catch (error) {
    stopTimer();
    logger.error('AI apply recommendations failed', {
      userId: user.id,
      resumeId,
      error: error.message
    });
    throw error;
  }
}

async function generateCoverLetter({
  user,
  resumeId,
  jobTitle,
  company,
  jobDescription,
  tone = 'professional'
}) {
  ensureActionAllowed(user.subscriptionTier, AIAction.COVER_LETTER);
  await ensureWithinRateLimit({
    userId: user.id,
    action: AIAction.COVER_LETTER,
    tier: user.subscriptionTier
  });

  const resume = await getActiveResumeOrThrow({ userId: user.id, resumeId });

  const prompt = buildCoverLetterPrompt({
    resumeSnapshot: resume.data,
    jobDescription,
    jobTitle,
    company,
    tone
  });

  const stopTimer = aiActionLatency.startTimer({ action: 'cover_letter', model: 'gpt-4o-mini' });

  try {
    logger.info('Starting cover letter generation', {
      userId: user.id,
      resumeId,
      jobTitle,
      company,
      promptLength: prompt.length
    });

    const response = await generateText(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 900,
      timeout: 90000, // 90 seconds timeout
      userId: user.id
    });

    logger.info('Cover letter response received', {
      userId: user.id,
      responseLength: response.text?.length || 0,
      tokensUsed: response.usage?.total_tokens
    });

    const payload = parseJsonResponse(response.text, 'cover letter generation');
    if (!payload.bodyParagraphs || !Array.isArray(payload.bodyParagraphs)) {
      throw new Error('Cover letter payload missing bodyParagraphs array');
    }

    const generatedDoc = await prisma.generatedDocument.create({
      data: {
        userId: user.id,
        baseResumeId: resume.id,
        type: GeneratedDocType.COVER_LETTER,
        jobTitle,
        company,
        tone,
        data: payload
      }
    });

    await recordAIRequest({
      userId: user.id,
      baseResumeId: resume.id,
      action: AIAction.COVER_LETTER,
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
      metadata: { jobTitle, company }
    });

    aiActionCounter.inc({ action: 'cover_letter', tier: user.subscriptionTier });
    stopTimer();

    logger.info('AI cover letter generated', {
      userId: user.id,
      resumeId,
      jobTitle,
      company,
      paragraphs: payload.bodyParagraphs.length
    });

    return {
      document: generatedDoc,
      content: payload
    };
  } catch (error) {
    stopTimer();
    logger.error('AI cover letter generation failed', {
      userId: user.id,
      resumeId,
      jobTitle,
      company,
      error: error.message
    });
    throw error;
  }
}

async function generatePortfolio({
  user,
  resumeId,
  tone = 'professional'
}) {
  ensureActionAllowed(user.subscriptionTier, AIAction.PORTFOLIO);
  await ensureWithinRateLimit({
    userId: user.id,
    action: AIAction.PORTFOLIO,
    tier: user.subscriptionTier
  });

  const resume = await getActiveResumeOrThrow({ userId: user.id, resumeId });

  const prompt = buildPortfolioPrompt({
    resumeSnapshot: resume.data,
    tone
  });

  const stopTimer = aiActionLatency.startTimer({ action: 'portfolio', model: 'gpt-4o-mini' });

  try {
    logger.info('Starting portfolio generation', {
      userId: user.id,
      resumeId,
      promptLength: prompt.length
    });

    const response = await generateText(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 1000,
      timeout: 90000, // 90 seconds timeout
      userId: user.id
    });

    logger.info('Portfolio response received', {
      userId: user.id,
      responseLength: response.text?.length || 0,
      tokensUsed: response.usage?.total_tokens
    });

    const payload = parseJsonResponse(response.text, 'portfolio generation');
    if (!payload.headline || !payload.tagline) {
      throw new Error('Portfolio payload missing headline or tagline');
    }

    const generatedDoc = await prisma.generatedDocument.create({
      data: {
        userId: user.id,
        baseResumeId: resume.id,
        type: GeneratedDocType.PORTFOLIO,
        tone,
        data: payload
      }
    });

    await recordAIRequest({
      userId: user.id,
      baseResumeId: resume.id,
      action: AIAction.PORTFOLIO,
      model: response.model,
      tokensUsed: response.usage?.total_tokens
    });

    aiActionCounter.inc({ action: 'portfolio', tier: user.subscriptionTier });
    stopTimer();

    logger.info('AI portfolio outline generated', {
      userId: user.id,
      resumeId,
      highlights: Array.isArray(payload.highlights) ? payload.highlights.length : 0,
      projects: Array.isArray(payload.selectedProjects) ? payload.selectedProjects.length : 0
    });

    return {
      document: generatedDoc,
      content: payload
    };
  } catch (error) {
    stopTimer();
    logger.error('AI portfolio generation failed', {
      userId: user.id,
      resumeId,
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  tailorResume,
  applyRecommendations,
  generateCoverLetter,
  generatePortfolio
};
