const crypto = require('crypto');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/db');

/**
 * A/B Testing Service for Prompt Optimization
 * Allows testing different prompt variations to optimize AI performance
 */

// Operation types
const OPERATIONS = {
  TAILORING: 'tailoring',
  ATS_ANALYSIS: 'ats_analysis',
  CONTENT_GENERATION: 'content_generation',
  SKILL_EXTRACTION: 'skill_extraction'
};

// Traffic allocation strategies
const ALLOCATION_STRATEGIES = {
  RANDOM: 'random',           // Random distribution
  WEIGHTED: 'weighted',       // Weighted based on performance
  ROUND_ROBIN: 'round_robin', // Sequential rotation
  USER_HASH: 'user_hash'      // Consistent per user
};

/**
 * Generate hash from input data for grouping similar tests
 * @param {Object} input - Input data
 * @returns {string} Hash
 */
function generateInputHash(input) {
  const hash = crypto.createHash('md5');
  hash.update(JSON.stringify(input));
  return hash.digest('hex');
}

/**
 * Get active prompt variants for an operation
 * @param {string} operation - Operation type
 * @returns {Promise<Array>} Active variants
 */
async function getActiveVariants(operation) {
  try {
    const variants = await prisma.promptVariant.findMany({
      where: {
        operation,
        isActive: true
      },
      orderBy: { createdAt: 'asc' }
    });

    if (variants.length === 0) {
      logger.warn('[AB_TEST] No active variants found', { operation });
      return [];
    }

    return variants;
  } catch (error) {
    logger.error('[AB_TEST] Failed to get active variants', {
      operation,
      error: error.message
    });
    return [];
  }
}

/**
 * Select variant using random allocation
 * @param {Array} variants - Available variants
 * @returns {Object} Selected variant
 */
function selectRandomVariant(variants) {
  const randomIndex = Math.floor(Math.random() * variants.length);
  return variants[randomIndex];
}

/**
 * Select variant using weighted allocation based on performance
 * @param {Array} variants - Available variants
 * @param {Object} stats - Performance statistics
 * @returns {Object} Selected variant
 */
function selectWeightedVariant(variants, stats) {
  // Calculate weights based on success rate and quality score
  const weights = variants.map(v => {
    const variantStats = stats[v.id] || { successRate: 0.5, avgQualityScore: 50 };
    // Weight = (success_rate * 0.5) + (quality_score/100 * 0.5)
    return (variantStats.successRate * 0.5) + (variantStats.avgQualityScore / 100 * 0.5);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < variants.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return variants[i];
    }
  }

  return variants[variants.length - 1];
}

/**
 * Select variant using round-robin allocation
 * @param {Array} variants - Available variants
 * @param {string} operation - Operation type
 * @returns {Object} Selected variant
 */
async function selectRoundRobinVariant(variants, operation) {
  // Get last used variant from cache or database
  const lastTest = await prisma.promptTest.findFirst({
    where: { operation },
    orderBy: { createdAt: 'desc' },
    select: { variantId: true }
  });

  if (!lastTest) {
    return variants[0];
  }

  const lastIndex = variants.findIndex(v => v.id === lastTest.variantId);
  const nextIndex = (lastIndex + 1) % variants.length;
  return variants[nextIndex];
}

/**
 * Select variant using user hash (consistent per user)
 * @param {Array} variants - Available variants
 * @param {string} userId - User ID
 * @returns {Object} Selected variant
 */
function selectUserHashVariant(variants, userId) {
  const hash = crypto.createHash('md5');
  hash.update(userId);
  const hashInt = parseInt(hash.digest('hex').substring(0, 8), 16);
  const index = hashInt % variants.length;
  return variants[index];
}

/**
 * Get variant statistics for weighted allocation
 * @param {Array} variants - Variants to get stats for
 * @returns {Promise<Object>} Statistics by variant ID
 */
async function getVariantStatistics(variants) {
  try {
    const variantIds = variants.map(v => v.id);
    
    const tests = await prisma.promptTest.findMany({
      where: {
        variantId: { in: variantIds }
      },
      select: {
        variantId: true,
        success: true,
        qualityScore: true
      }
    });

    const stats = {};
    
    for (const variant of variants) {
      const variantTests = tests.filter(t => t.variantId === variant.id);
      
      if (variantTests.length === 0) {
        stats[variant.id] = {
          successRate: 0.5,
          avgQualityScore: 50,
          totalTests: 0
        };
        continue;
      }

      const successCount = variantTests.filter(t => t.success).length;
      const qualityScores = variantTests
        .filter(t => t.qualityScore !== null)
        .map(t => t.qualityScore);
      
      stats[variant.id] = {
        successRate: successCount / variantTests.length,
        avgQualityScore: qualityScores.length > 0
          ? qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length
          : 50,
        totalTests: variantTests.length
      };
    }

    return stats;
  } catch (error) {
    logger.error('[AB_TEST] Failed to get variant statistics', {
      error: error.message
    });
    return {};
  }
}

/**
 * Select prompt variant for A/B testing
 * @param {string} operation - Operation type
 * @param {string} userId - User ID
 * @param {string} strategy - Allocation strategy (default: random)
 * @returns {Promise<Object|null>} Selected variant
 */
async function selectPromptVariant(operation, userId, strategy = ALLOCATION_STRATEGIES.RANDOM) {
  try {
    const variants = await getActiveVariants(operation);
    
    if (variants.length === 0) {
      logger.debug('[AB_TEST] No variants available, using default prompt', { operation });
      return null;
    }

    // If only one variant, return it
    if (variants.length === 1) {
      return variants[0];
    }

    let selectedVariant;

    switch (strategy) {
      case ALLOCATION_STRATEGIES.WEIGHTED:
        const stats = await getVariantStatistics(variants);
        selectedVariant = selectWeightedVariant(variants, stats);
        break;
      
      case ALLOCATION_STRATEGIES.ROUND_ROBIN:
        selectedVariant = await selectRoundRobinVariant(variants, operation);
        break;
      
      case ALLOCATION_STRATEGIES.USER_HASH:
        selectedVariant = selectUserHashVariant(variants, userId);
        break;
      
      case ALLOCATION_STRATEGIES.RANDOM:
      default:
        selectedVariant = selectRandomVariant(variants);
        break;
    }

    logger.debug('[AB_TEST] Variant selected', {
      operation,
      userId,
      strategy,
      variant: selectedVariant.variant,
      variantId: selectedVariant.id
    });

    return selectedVariant;

  } catch (error) {
    logger.error('[AB_TEST] Failed to select variant', {
      operation,
      userId,
      error: error.message
    });
    return null;
  }
}

/**
 * Record A/B test result
 * @param {Object} testData - Test data
 * @returns {Promise<Object>} Created test record
 */
async function recordTestResult(testData) {
  try {
    const {
      userId,
      variantId,
      operation,
      variant,
      input,
      success,
      durationMs,
      tokensUsed,
      costUsd,
      qualityScore,
      outputMetrics,
      error
    } = testData;

    const inputHash = generateInputHash(input);

    const test = await prisma.promptTest.create({
      data: {
        userId,
        variantId,
        operation,
        variant,
        inputHash,
        success,
        durationMs,
        tokensUsed,
        costUsd,
        qualityScore,
        outputMetrics: JSON.stringify(outputMetrics || {}),
        error
      }
    });

    logger.info('[AB_TEST] Test result recorded', {
      userId,
      operation,
      variant,
      success,
      qualityScore
    });

    return test;

  } catch (error) {
    logger.error('[AB_TEST] Failed to record test result', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Get A/B test results for an operation
 * @param {string} operation - Operation type
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Test results and statistics
 */
async function getTestResults(operation, options = {}) {
  try {
    const { startDate, endDate, minTests = 10 } = options;

    const where = { operation };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const tests = await prisma.promptTest.findMany({
      where,
      include: {
        variant: {
          select: {
            id: true,
            name: true,
            variant: true,
            isControl: true
          }
        }
      }
    });

    // Group by variant
    const variantGroups = {};
    
    for (const test of tests) {
      const variantId = test.variantId;
      if (!variantGroups[variantId]) {
        variantGroups[variantId] = {
          variant: test.variant,
          tests: []
        };
      }
      variantGroups[variantId].tests.push(test);
    }

    // Calculate statistics for each variant
    const results = Object.entries(variantGroups).map(([variantId, group]) => {
      const tests = group.tests;
      const successfulTests = tests.filter(t => t.success);
      const qualityScores = tests.filter(t => t.qualityScore !== null).map(t => t.qualityScore);
      const durations = tests.map(t => t.durationMs);
      const costs = tests.filter(t => t.costUsd !== null).map(t => t.costUsd);
      const tokens = tests.filter(t => t.tokensUsed !== null).map(t => t.tokensUsed);

      return {
        variantId,
        variant: group.variant,
        totalTests: tests.length,
        successCount: successfulTests.length,
        successRate: (successfulTests.length / tests.length * 100).toFixed(2),
        avgQualityScore: qualityScores.length > 0
          ? (qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length).toFixed(2)
          : null,
        avgDurationMs: (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(0),
        avgCostUsd: costs.length > 0
          ? (costs.reduce((sum, c) => sum + c, 0) / costs.length).toFixed(6)
          : null,
        avgTokensUsed: tokens.length > 0
          ? Math.round(tokens.reduce((sum, t) => sum + t, 0) / tokens.length)
          : null,
        minQualityScore: qualityScores.length > 0 ? Math.min(...qualityScores) : null,
        maxQualityScore: qualityScores.length > 0 ? Math.max(...qualityScores) : null,
        minDurationMs: Math.min(...durations),
        maxDurationMs: Math.max(...durations)
      };
    });

    // Sort by success rate and quality score
    results.sort((a, b) => {
      const scoreA = parseFloat(a.successRate) + (parseFloat(a.avgQualityScore) || 0);
      const scoreB = parseFloat(b.successRate) + (parseFloat(b.avgQualityScore) || 0);
      return scoreB - scoreA;
    });

    // Find control variant
    const controlVariant = results.find(r => r.variant.isControl);

    // Calculate statistical significance (if enough tests)
    const hasEnoughData = results.every(r => r.totalTests >= minTests);

    return {
      operation,
      totalTests: tests.length,
      variants: results,
      controlVariant,
      hasEnoughData,
      minTestsRequired: minTests,
      recommendation: hasEnoughData ? results[0] : null
    };

  } catch (error) {
    logger.error('[AB_TEST] Failed to get test results', {
      operation,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get winner variant (best performing)
 * @param {string} operation - Operation type
 * @param {number} minTests - Minimum tests required (default: 30)
 * @returns {Promise<Object|null>} Winner variant
 */
async function getWinnerVariant(operation, minTests = 30) {
  try {
    const results = await getTestResults(operation, { minTests });

    if (!results.hasEnoughData) {
      logger.warn('[AB_TEST] Not enough data to determine winner', {
        operation,
        minTests,
        totalTests: results.totalTests
      });
      return null;
    }

    const winner = results.variants[0];

    logger.info('[AB_TEST] Winner determined', {
      operation,
      variant: winner.variant.variant,
      successRate: winner.successRate,
      avgQualityScore: winner.avgQualityScore,
      totalTests: winner.totalTests
    });

    return winner;

  } catch (error) {
    logger.error('[AB_TEST] Failed to get winner variant', {
      operation,
      error: error.message
    });
    return null;
  }
}

/**
 * Promote variant to control (make it the default)
 * @param {string} variantId - Variant ID to promote
 * @returns {Promise<Object>} Updated variant
 */
async function promoteToControl(variantId) {
  try {
    // Get the variant
    const variant = await prisma.promptVariant.findUnique({
      where: { id: variantId }
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    // Demote current control
    await prisma.promptVariant.updateMany({
      where: {
        operation: variant.operation,
        isControl: true
      },
      data: { isControl: false }
    });

    // Promote new control
    const updatedVariant = await prisma.promptVariant.update({
      where: { id: variantId },
      data: { isControl: true }
    });

    logger.info('[AB_TEST] Variant promoted to control', {
      variantId,
      operation: variant.operation,
      variant: variant.variant
    });

    return updatedVariant;

  } catch (error) {
    logger.error('[AB_TEST] Failed to promote variant', {
      variantId,
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  OPERATIONS,
  ALLOCATION_STRATEGIES,
  selectPromptVariant,
  recordTestResult,
  getTestResults,
  getWinnerVariant,
  promoteToControl,
  generateInputHash
};

