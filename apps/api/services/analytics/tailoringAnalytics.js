/**
 * Tailoring Analytics Service
 * Tracks and analyzes tailoring effectiveness
 */

const { prisma } = require('../../utils/db');
const logger = require('../../utils/logger');

/**
 * Track tailoring operation
 */
async function trackTailoringOperation({
  userId,
  resumeId,
  mode,
  scoreBefore,
  scoreAfter,
  targetScore,
  tokensUsed,
  durationMs,
  confidence,
  warnings,
  diffCount,
  keywordsAdded
}) {
  try {
    const improvement = scoreAfter - scoreBefore;
    const targetMet = scoreAfter >= targetScore;
    const improvementRate = scoreBefore > 0 ? (improvement / scoreBefore) * 100 : 0;

    const analytics = {
      userId,
      resumeId,
      mode,
      scoreBefore,
      scoreAfter,
      improvement,
      improvementRate,
      targetScore,
      targetMet,
      tokensUsed,
      durationMs,
      confidence: confidence || 0,
      warningCount: warnings?.length || 0,
      changeCount: diffCount || 0,
      keywordsAddedCount: keywordsAdded?.length || 0,
      costEstimate: calculateCost(tokensUsed, mode),
      timestamp: new Date()
    };

    // Store in database (create analytics table if needed)
    await prisma.tailoringAnalytics.create({
      data: analytics
    }).catch(err => {
      // Table might not exist yet, log to file instead
      logger.info('Tailoring analytics', analytics);
    });

    return analytics;

  } catch (error) {
    logger.error('Failed to track tailoring analytics', { error: error.message });
    return null;
  }
}

/**
 * Get tailoring effectiveness metrics
 */
async function getTailoringEffectiveness({
  userId,
  startDate,
  endDate,
  mode
}) {
  try {
    const where = {
      userId,
      timestamp: {
        gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        lte: endDate || new Date()
      }
    };

    if (mode) {
      where.mode = mode;
    }

    const operations = await prisma.tailoringAnalytics.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    }).catch(() => []);

    if (operations.length === 0) {
      return null;
    }

    // Calculate aggregated metrics
    const metrics = {
      totalOperations: operations.length,
      avgImprovement: average(operations.map(o => o.improvement)),
      avgImprovementRate: average(operations.map(o => o.improvementRate)),
      avgScoreBefore: average(operations.map(o => o.scoreBefore)),
      avgScoreAfter: average(operations.map(o => o.scoreAfter)),
      targetMetRate: (operations.filter(o => o.targetMet).length / operations.length) * 100,
      avgDurationMs: average(operations.map(o => o.durationMs)),
      avgTokensUsed: average(operations.map(o => o.tokensUsed)),
      avgConfidence: average(operations.map(o => o.confidence)),
      totalCost: sum(operations.map(o => o.costEstimate)),
      modeDistribution: getModeDistribution(operations),
      improvementTrend: getImprovementTrend(operations),
      performanceByMode: getPerformanceByMode(operations)
    };

    return metrics;

  } catch (error) {
    logger.error('Failed to get tailoring effectiveness', { error: error.message });
    return null;
  }
}

/**
 * Get user engagement metrics
 */
async function getUserEngagementMetrics(userId, days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      tailorCount,
      resumeCount,
      aiRequests,
      lastActivity
    ] = await Promise.all([
      prisma.tailoredVersion.count({
        where: { userId, createdAt: { gte: startDate } }
      }),
      prisma.baseResume.count({
        where: { userId, createdAt: { gte: startDate } }
      }),
      prisma.aiRequest.count({
        where: { userId, createdAt: { gte: startDate } }
      }),
      prisma.tailoredVersion.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    return {
      tailoringCount: tailorCount,
      resumesCreated: resumeCount,
      totalAIRequests: aiRequests,
      lastActivityAt: lastActivity?.createdAt,
      daysSinceLastActivity: lastActivity 
        ? Math.floor((Date.now() - lastActivity.createdAt.getTime()) / (24 * 60 * 60 * 1000))
        : null,
      avgRequestsPerDay: aiRequests / days,
      engagementLevel: calculateEngagementLevel(tailorCount, aiRequests, days)
    };

  } catch (error) {
    logger.error('Failed to get user engagement metrics', { error: error.message });
    return null;
  }
}

/**
 * Get system-wide analytics
 */
async function getSystemAnalytics(days = 7) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalTailoring,
      totalAIRequests,
      avgImprovement
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          baseResumes: {
            some: {
              tailoredVersions: {
                some: {
                  createdAt: { gte: startDate }
                }
              }
            }
          }
        }
      }),
      prisma.tailoredVersion.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.aiRequest.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.tailoredVersion.aggregate({
        where: { createdAt: { gte: startDate } },
        _avg: {
          atsScoreAfter: true,
          atsScoreBefore: true
        }
      })
    ]);

    const avgImprovementCalc = avgImprovement._avg.atsScoreAfter 
      ? avgImprovement._avg.atsScoreAfter - (avgImprovement._avg.atsScoreBefore || 0)
      : 0;

    return {
      period: `${days} days`,
      users: {
        total: totalUsers,
        active: activeUsers,
        activeRate: (activeUsers / totalUsers) * 100
      },
      operations: {
        totalTailoring,
        totalAIRequests,
        avgPerUser: totalTailoring / activeUsers
      },
      performance: {
        avgScoreImprovement: avgImprovementCalc,
        avgScoreBefore: avgImprovement._avg.atsScoreBefore,
        avgScoreAfter: avgImprovement._avg.atsScoreAfter
      },
      timestamp: new Date()
    };

  } catch (error) {
    logger.error('Failed to get system analytics', { error: error.message });
    return null;
  }
}

/**
 * Track feature usage
 */
async function trackFeatureUsage(userId, feature, metadata = {}) {
  try {
    logger.info('Feature usage', {
      userId,
      feature,
      ...metadata,
      timestamp: new Date().toISOString()
    });

    // Could store in dedicated feature_usage table if needed
    
  } catch (error) {
    logger.error('Failed to track feature usage', { error: error.message });
  }
}

/**
 * Get A/B test results
 */
async function getABTestResults(testName, startDate, endDate) {
  try {
    // Placeholder for A/B testing framework
    // Can be extended with actual A/B test tracking

    return {
      testName,
      variants: [],
      message: 'A/B testing framework not yet implemented'
    };

  } catch (error) {
    logger.error('Failed to get A/B test results', { error: error.message });
    return null;
  }
}

// Helper functions

function calculateCost(tokens, mode) {
  // GPT-4o: $5.00 / 1M input tokens, $15.00 / 1M output tokens
  // GPT-4o-mini: $0.150 / 1M input tokens, $0.600 / 1M output tokens
  
  const rates = mode === 'FULL'
    ? { input: 5.00, output: 15.00 } // GPT-4o
    : { input: 0.150, output: 0.600 }; // GPT-4o-mini
  
  // Rough estimate: 60% input, 40% output
  const inputTokens = tokens * 0.6;
  const outputTokens = tokens * 0.4;
  
  return ((inputTokens * rates.input) + (outputTokens * rates.output)) / 1000000;
}

function average(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + (n || 0), 0) / numbers.length;
}

function sum(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + (n || 0), 0);
}

function getModeDistribution(operations) {
  const distribution = {};
  operations.forEach(op => {
    distribution[op.mode] = (distribution[op.mode] || 0) + 1;
  });
  return distribution;
}

function getImprovementTrend(operations) {
  // Group by week and calculate average improvement
  const weeks = {};
  operations.forEach(op => {
    const weekKey = getWeekKey(op.timestamp);
    if (!weeks[weekKey]) weeks[weekKey] = [];
    weeks[weekKey].push(op.improvement);
  });

  return Object.entries(weeks).map(([week, improvements]) => ({
    week,
    avgImprovement: average(improvements),
    count: improvements.length
  }));
}

function getPerformanceByMode(operations) {
  const modes = ['PARTIAL', 'FULL'];
  return modes.map(mode => {
    const filtered = operations.filter(o => o.mode === mode);
    if (filtered.length === 0) return { mode, count: 0 };

    return {
      mode,
      count: filtered.length,
      avgImprovement: average(filtered.map(o => o.improvement)),
      avgDuration: average(filtered.map(o => o.durationMs)),
      avgCost: average(filtered.map(o => o.costEstimate)),
      targetMetRate: (filtered.filter(o => o.targetMet).length / filtered.length) * 100
    };
  });
}

function getWeekKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = Math.ceil(((d - new Date(year, 0, 1)) / 86400000 + 1) / 7);
  return `${year}-W${week}`;
}

function calculateEngagementLevel(tailorCount, aiRequests, days) {
  const avgDaily = (tailorCount + aiRequests) / days;
  
  if (avgDaily >= 5) return 'HIGH';
  if (avgDaily >= 2) return 'MEDIUM';
  if (avgDaily >= 0.5) return 'LOW';
  return 'INACTIVE';
}

module.exports = {
  trackTailoringOperation,
  getTailoringEffectiveness,
  getUserEngagementMetrics,
  getSystemAnalytics,
  trackFeatureUsage,
  getABTestResults
};

