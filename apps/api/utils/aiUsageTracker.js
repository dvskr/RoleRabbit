/**
 * AI Usage Tracker
 * Tracks AI API calls, costs, and usage for users
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Track AI usage
 */
async function trackAIUsage(userId, modelOrUsage, tokensArg, costArg) {
  // Support legacy signature trackAIUsage(userId, model, tokens, cost)
  // and new signature trackAIUsage(userId, { model, tokens, cost, endpoint })
  const usage =
    modelOrUsage && typeof modelOrUsage === 'object' && !Array.isArray(modelOrUsage)
      ? {
          model: modelOrUsage.model ?? 'unknown',
          tokens: modelOrUsage.tokens ?? modelOrUsage.tokensUsed ?? 0,
          cost: modelOrUsage.cost ?? modelOrUsage.costUsd ?? 0,
          endpoint: modelOrUsage.endpoint,
        }
      : {
          model: modelOrUsage ?? 'unknown',
          tokens: tokensArg ?? 0,
          cost: costArg ?? 0,
          endpoint: undefined,
        };

  const tokensUsed = Number.isFinite(usage.tokens) ? usage.tokens : 0;
  const cost = Number.isFinite(usage.cost) ? usage.cost : 0;

  if (!userId) {
    logger.debug('trackAIUsage skipped: missing userId', { model: usage.model, tokensUsed, cost });
    return;
  }

  try {
    if (!prisma?.aIUsage?.create) {
      logger.debug('AI usage persistence disabled or model missing; logging only', {
        userId,
        model: usage.model,
        tokensUsed,
        cost,
      });
      return;
    }

    const usageRecord = await prisma.aIUsage.create({
      data: {
        userId,
        model: usage.model,
        tokensUsed,
        cost,
        endpoint: usage.endpoint,
        timestamp: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalAIUsage: {
          increment: tokensUsed,
        },
      },
    });

    return usageRecord;
  } catch (error) {
    logger.error('Failed to track AI usage', { error: error.message, userId, model: usage.model });
    // Swallow errors so AI flows do not fail due to usage logging
    return;
  }
}

/**
 * Get user's AI usage
 */
async function getUserAIUsage(userId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usage = await prisma.aIUsage.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const totalTokens = usage.reduce((sum, u) => sum + u.tokensUsed, 0);
    const totalCost = usage.reduce((sum, u) => sum + u.cost, 0);

    return {
      usage,
      totalTokens,
      totalCost,
      count: usage.length,
      period: days
    };
  } catch (error) {
    logger.error('Failed to get AI usage', error);
    throw error;
  }
}

/**
 * Check if user has exceeded AI limits
 */
async function hasExceededAILimit(userId, limit = 100000) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    return (user?.totalAIUsage || 0) >= limit;
  } catch (error) {
    logger.error('Failed to check AI limits', error);
    return false;
  }
}

/**
 * Get AI cost estimates
 */
function getAICostEstimate(tokens, model) {
  // Pricing per 1K tokens (as of 2024)
  const pricing = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 }, // per million
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 } // per million
  };

  const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
  
  // Estimate: 50% input, 50% output tokens
  const inputTokens = tokens * 0.5;
  const outputTokens = tokens * 0.5;

  const cost = (inputTokens / 1000000 * modelPricing.input) + 
               (outputTokens / 1000000 * modelPricing.output);

  return Math.round(cost * 10000) / 10000; // Round to 4 decimals
}

/**
 * Get daily AI usage stats
 */
async function getDailyAIStats(userId) {
  try {
    const usage = await prisma.aIUsage.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Group by day
    const dailyStats = {};
    usage.forEach(u => {
      const day = new Date(u.timestamp).toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { tokens: 0, cost: 0, count: 0 };
      }
      dailyStats[day].tokens += u.tokensUsed;
      dailyStats[day].cost += u.cost;
      dailyStats[day].count++;
    });

    return dailyStats;
  } catch (error) {
    logger.error('Failed to get daily AI stats', error);
    throw error;
  }
}

module.exports = {
  trackAIUsage,
  getUserAIUsage,
  hasExceededAILimit,
  getAICostEstimate,
  getDailyAIStats
};

