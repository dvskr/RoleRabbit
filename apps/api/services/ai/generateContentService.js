const { AIAction } = require('@prisma/client');
const { prisma } = require('../../utils/db');
const { generateText } = require('../../utils/openAI');
const { buildGenerateContentPrompt } = require('./promptBuilder');
const { createDraft } = require('./draftService');
const { ensureActionAllowed, ensureWithinRateLimit, recordAIRequest, AIUsageError } = require('./usageService');
const logger = require('../../utils/logger');
const { aiActionCounter, aiActionLatency } = require('../../observability/metrics');

function parseGenerateResponse(text) {
  if (!text) {
    throw new Error('AI response was empty.');
  }
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const payload = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    if (!payload || typeof payload !== 'object') {
      throw new Error('AI response is not a JSON object');
    }
    if (!('rewrittenContent' in payload)) {
      throw new Error('AI response missing rewrittenContent');
    }
    payload.keyPointsAdded = Array.isArray(payload.keyPointsAdded) ? payload.keyPointsAdded : [];
    payload.warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
    payload.confidence = typeof payload.confidence === 'number' ? payload.confidence : 0.6;
    return payload;
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

async function getResumeForEditing({ userId, resumeId }) {
  const resume = await prisma.baseResume.findFirst({
    where: { id: resumeId, userId },
    select: { id: true, data: true, metadata: true, isActive: true }
  });
  if (!resume) {
    throw new Error('Base resume not found');
  }
  if (!resume.isActive) {
    throw new AIUsageError('You can only run AI features on the active resume.', 400);
  }
  return resume;
}

async function generateSectionDraft({
  user,
  resumeId,
  sectionPath,
  sectionType,
  currentContent,
  jobContext,
  tone,
  length,
  instructions
}) {
  ensureActionAllowed(user.subscriptionTier, AIAction.GENERATE_CONTENT);
  await ensureWithinRateLimit({ userId: user.id, action: AIAction.GENERATE_CONTENT, tier: user.subscriptionTier });

  const resume = await getResumeForEditing({ userId: user.id, resumeId });

  const prompt = buildGenerateContentPrompt({
    sectionType,
    sectionPath,
    currentContent,
    resumeSnapshot: resume.data,
    jobContext,
    tone,
    length,
    instructions
  });

  const stopTimer = aiActionLatency.startTimer({ action: 'generate_content', model: 'gpt-4o-mini' });
  try {
    const response = await generateText(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 900
    });

    const parsed = parseGenerateResponse(response.text);

    const draftPayload = {
      patch: {
        path: sectionPath,
        value: parsed.rewrittenContent
      },
      rawAiResponse: parsed,
      sectionPath,
      sectionType,
      tone,
      length,
      jobContextProvided: Boolean(jobContext)
    };

    const draft = await createDraft({
      userId: user.id,
      baseResumeId: resume.id,
      action: AIAction.GENERATE_CONTENT,
      payload: draftPayload,
      metadata: {
        warnings: parsed.warnings,
        confidence: parsed.confidence
      },
      ttlMs: 15 * 60 * 1000
    });

    aiActionCounter.inc({ action: 'generate_content', tier: user.subscriptionTier });
    stopTimer();

    await recordAIRequest({
      userId: user.id,
      baseResumeId: resume.id,
      action: AIAction.GENERATE_CONTENT,
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
      metadata: {
        sectionPath,
        tone,
        length,
        warnings: parsed.warnings,
        confidence: parsed.confidence
      }
    });

    logger.info('AI generate content completed', {
      userId: user.id,
      resumeId,
      sectionPath,
      sectionType,
      tone,
      length,
      warnings: parsed.warnings.length,
      model: response.model,
      tokensUsed: response.usage?.total_tokens
    });

    return {
      draft,
      ai: parsed,
      usage: response.usage
    };
  } catch (error) {
    stopTimer();
    logger.error('AI generate content failed', {
      userId: user.id,
      resumeId,
      sectionPath,
      sectionType,
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  generateSectionDraft
};
