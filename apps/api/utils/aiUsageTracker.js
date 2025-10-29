/**
 * AI Usage Tracker
 * Tracks AI API calls, costs, and usage for users
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Track AI usage
 */
async function trackAIUsage(userId, model, tokens, cost) {
  try {
    const usage = await prisma.aIUsage.create({
      data: {
        userId,
        model,
        tokensUsed: tokens,
        cost,
        timestamp: new Date()
      }
    });

    // Update user's total usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalAIUsage: {
          increment: tokens
        }
      }
    });

    return usage;
  } catch (error) {
    logger.error('Failed to track AI usage', error);
    throw error;
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

