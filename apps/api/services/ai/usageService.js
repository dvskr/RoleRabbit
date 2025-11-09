const { PrismaClient, AIAction, SubscriptionTier } = require('@prisma/client');
const { prisma } = require('../../utils/db');
const { calculateCost } = require('../../utils/openAI');
const logger = require('../../utils/logger');

const HOUR_MS = 60 * 60 * 1000;

const ACTION_ALLOWLIST = {
  [SubscriptionTier.FREE]: new Set([
    AIAction.GENERATE_CONTENT,
    AIAction.ATS_SCORE,
    AIAction.JD_ANALYSIS
  ]),
  [SubscriptionTier.PRO]: new Set([
    AIAction.GENERATE_CONTENT,
    AIAction.TAILOR_PARTIAL,
    AIAction.APPLY_RECOMMENDATIONS,
    AIAction.COVER_LETTER,
    AIAction.ATS_SCORE,
    AIAction.JD_ANALYSIS
  ]),
  [SubscriptionTier.PREMIUM]: new Set([
    AIAction.GENERATE_CONTENT,
    AIAction.TAILOR_PARTIAL,
    AIAction.TAILOR_FULL,
    AIAction.APPLY_RECOMMENDATIONS,
    AIAction.COVER_LETTER,
    AIAction.PORTFOLIO,
    AIAction.ATS_SCORE,
    AIAction.JD_ANALYSIS
  ])
};

const RATE_LIMITS_PER_HOUR = {
  [SubscriptionTier.FREE]: {
    [AIAction.GENERATE_CONTENT]: 5,
    [AIAction.ATS_SCORE]: 3,
    [AIAction.JD_ANALYSIS]: 3
  },
  [SubscriptionTier.PRO]: {
    [AIAction.GENERATE_CONTENT]: 30,
    [AIAction.TAILOR_PARTIAL]: 15,
    [AIAction.APPLY_RECOMMENDATIONS]: 10,
    [AIAction.COVER_LETTER]: 10,
    [AIAction.ATS_SCORE]: 15,
    [AIAction.JD_ANALYSIS]: 15
  },
  [SubscriptionTier.PREMIUM]: {
    [AIAction.GENERATE_CONTENT]: 60,
    [AIAction.TAILOR_PARTIAL]: 40,
    [AIAction.TAILOR_FULL]: 20,
    [AIAction.APPLY_RECOMMENDATIONS]: 25,
    [AIAction.COVER_LETTER]: 25,
    [AIAction.PORTFOLIO]: 15,
    [AIAction.ATS_SCORE]: 40,
    [AIAction.JD_ANALYSIS]: 40
  }
};

class AIUsageError extends Error {
  constructor(message, statusCode = 403) {
    super(message);
    this.statusCode = statusCode;
  }
}

function ensureActionAllowed(tier, action) {
  const allow = ACTION_ALLOWLIST[tier] || ACTION_ALLOWLIST[SubscriptionTier.FREE];
  if (!allow.has(action)) {
    throw new AIUsageError('Your current subscription does not include this AI feature.', 402);
  }
}

async function ensureWithinRateLimit({ userId, action, tier }) {
  const tierLimits = RATE_LIMITS_PER_HOUR[tier] || {};
  const limit = tierLimits[action];
  if (!limit) {
    return;
  }
  const since = new Date(Date.now() - HOUR_MS);
  const count = await prisma.aIRequestLog.count({
    where: {
      userId,
      action,
      createdAt: { gte: since }
    }
  });
  if (count >= limit) {
    throw new AIUsageError('AI rate limit reached. Please wait before trying again.', 429);
  }
}

async function recordAIRequest({
  userId,
  baseResumeId,
  action,
  provider = 'openai',
  model,
  tokensUsed,
  status = 'success',
  errorMessage,
  metadata
}) {
  try {
    const costUsd = tokensUsed ? calculateCost(tokensUsed, model || 'gpt-4o-mini') : null;
    await prisma.aIRequestLog.create({
      data: {
        userId,
        baseResumeId,
        action,
        provider,
        model,
        tokensUsed: tokensUsed ?? null,
        costUsd,
        status,
        errorMessage,
        metadata
      }
    });
  } catch (error) {
    logger.error('Failed to record AI request log', { error: error.message, userId, action });
  }
}

module.exports = {
  AIUsageError,
  ensureActionAllowed,
  ensureWithinRateLimit,
  recordAIRequest
};
