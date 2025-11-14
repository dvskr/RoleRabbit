const { AIAction, SubscriptionTier } = require('@prisma/client');
const { prisma } = require('../../utils/db');
const { calculateCost } = require('../../utils/openAI');
const logger = require('../../utils/logger');

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// ============================================
// SPENDING CAPS (Cost Control)
// ============================================
// Daily spending limits per subscription tier (in USD)
const DAILY_SPENDING_CAPS = {
  [SubscriptionTier.FREE]: 1.00,      // $1/day
  [SubscriptionTier.PRO]: 10.00,      // $10/day
  [SubscriptionTier.PREMIUM]: 100.00  // $100/day
};

// Warning threshold (percentage of cap)
const SPENDING_WARNING_THRESHOLD = 0.80; // 80%

// Admin override flag (can be set per user in database)
const ADMIN_OVERRIDE_USERS = new Set(
  (process.env.ADMIN_OVERRIDE_USERS || '').split(',').filter(Boolean)
);

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

/**
 * Calculate total spending for a user in the last 24 hours
 */
async function getDailySpending(userId) {
  const since = new Date(Date.now() - DAY_MS);
  
  try {
    const result = await prisma.aIRequestLog.aggregate({
      where: {
        userId,
        createdAt: { gte: since },
        status: 'success', // Only count successful requests
        costUsd: { not: null }
      },
      _sum: {
        costUsd: true
      }
    });
    
    return parseFloat(result._sum.costUsd || 0);
  } catch (error) {
    logger.error('Failed to calculate daily spending', { error: error.message, userId });
    return 0;
  }
}

/**
 * Check if user has exceeded their daily spending cap
 */
async function ensureWithinSpendingCap({ userId, tier, estimatedCost = 0 }) {
  // Check if user has admin override
  if (ADMIN_OVERRIDE_USERS.has(userId)) {
    logger.info('Spending cap bypassed for admin user', { userId });
    return { allowed: true, spending: 0, cap: Infinity, percentUsed: 0 };
  }
  
  const cap = DAILY_SPENDING_CAPS[tier] || DAILY_SPENDING_CAPS[SubscriptionTier.FREE];
  const currentSpending = await getDailySpending(userId);
  const projectedSpending = currentSpending + estimatedCost;
  const percentUsed = (currentSpending / cap) * 100;
  
  // Log spending info
  logger.info('Spending check', {
    userId,
    tier,
    currentSpending: `$${currentSpending.toFixed(4)}`,
    cap: `$${cap.toFixed(2)}`,
    percentUsed: `${percentUsed.toFixed(1)}%`,
    estimatedCost: `$${estimatedCost.toFixed(4)}`,
    projectedSpending: `$${projectedSpending.toFixed(4)}`
  });
  
  // Check if projected spending would exceed cap
  if (projectedSpending > cap) {
    logger.warn('Daily spending cap exceeded', {
      userId,
      tier,
      currentSpending: `$${currentSpending.toFixed(4)}`,
      cap: `$${cap.toFixed(2)}`,
      percentUsed: `${percentUsed.toFixed(1)}%`
    });
    
    throw new AIUsageError(
      `Daily spending limit reached ($${cap.toFixed(2)}). Your limit will reset in ${getTimeUntilReset()}. Upgrade your plan for higher limits.`,
      429
    );
  }
  
  // Warn if approaching cap (80%)
  if (percentUsed >= SPENDING_WARNING_THRESHOLD * 100 && percentUsed < 100) {
    logger.warn('Approaching daily spending cap', {
      userId,
      tier,
      currentSpending: `$${currentSpending.toFixed(4)}`,
      cap: `$${cap.toFixed(2)}`,
      percentUsed: `${percentUsed.toFixed(1)}%`
    });
  }
  
  return {
    allowed: true,
    spending: currentSpending,
    cap,
    percentUsed,
    remaining: cap - currentSpending
  };
}

/**
 * Get time until spending cap resets (midnight UTC)
 */
function getTimeUntilReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  const msUntilReset = tomorrow - now;
  const hoursUntilReset = Math.floor(msUntilReset / HOUR_MS);
  const minutesUntilReset = Math.floor((msUntilReset % HOUR_MS) / (60 * 1000));
  
  if (hoursUntilReset > 0) {
    return `${hoursUntilReset}h ${minutesUntilReset}m`;
  }
  return `${minutesUntilReset}m`;
}

/**
 * Get spending summary for a user
 */
async function getSpendingSummary(userId, tier) {
  const currentSpending = await getDailySpending(userId);
  const cap = DAILY_SPENDING_CAPS[tier] || DAILY_SPENDING_CAPS[SubscriptionTier.FREE];
  const percentUsed = (currentSpending / cap) * 100;
  const hasAdminOverride = ADMIN_OVERRIDE_USERS.has(userId);
  
  return {
    currentSpending,
    cap,
    percentUsed,
    remaining: cap - currentSpending,
    resetTime: getTimeUntilReset(),
    hasAdminOverride,
    status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'ok'
  };
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
  ensureWithinSpendingCap,
  getDailySpending,
  getSpendingSummary,
  recordAIRequest,
  DAILY_SPENDING_CAPS
};
