/**
 * A/B Testing Framework for Templates
 * Enables data-driven optimization through controlled experiments
 *
 * Features:
 * - Multi-variant testing
 * - Traffic splitting
 * - Metrics tracking
 * - Statistical significance calculation
 * - Automatic winner selection
 * - Segment-based testing
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

/**
 * Create A/B test
 */
async function createTest(testData, userId) {
  try {
    const {
      name,
      description,
      variants,
      metrics,
      targetAudience = {},
      trafficAllocation = 'equal',
      duration = 14, // days
    } = testData;

    // Validate variants
    if (!variants || variants.length < 2) {
      throw new Error('At least 2 variants required for A/B testing');
    }

    // Calculate traffic split
    const trafficSplit = calculateTrafficSplit(variants.length, trafficAllocation);

    // Create test
    const test = await prisma.abTest.create({
      data: {
        name,
        description,
        createdBy: userId,
        status: 'DRAFT',
        startDate: null,
        endDate: null,
        duration,
        targetAudience,
        metrics: metrics || ['views', 'clicks', 'downloads', 'ratings'],
        winnerId: null,
      },
    });

    // Create variants
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];

      await prisma.abTestVariant.create({
        data: {
          testId: test.id,
          name: variant.name || `Variant ${String.fromCharCode(65 + i)}`,
          description: variant.description || '',
          config: variant.config || {},
          trafficPercentage: trafficSplit[i],
          isControl: i === 0,
        },
      });
    }

    return {
      success: true,
      test,
      message: 'A/B test created successfully',
    };
  } catch (error) {
    console.error('Error creating A/B test:', error);
    throw error;
  }
}

/**
 * Start A/B test
 */
async function startTest(testId, userId) {
  try {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    if (test.createdBy !== userId) {
      throw new Error('You do not have permission to start this test');
    }

    if (test.status !== 'DRAFT') {
      throw new Error(`Cannot start test with status: ${test.status}`);
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + test.duration);

    await prisma.abTest.update({
      where: { id: testId },
      data: {
        status: 'RUNNING',
        startDate: new Date(),
        endDate,
      },
    });

    return {
      success: true,
      message: 'A/B test started successfully',
    };
  } catch (error) {
    console.error('Error starting test:', error);
    throw error;
  }
}

/**
 * Assign user to variant
 */
async function assignVariant(testId, userId = null, sessionId = null) {
  try {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test || test.status !== 'RUNNING') {
      return null;
    }

    // Check if user already assigned
    const identifier = userId || sessionId;

    if (!identifier) {
      throw new Error('User ID or Session ID required');
    }

    const existingAssignment = await prisma.abTestAssignment.findFirst({
      where: {
        testId,
        OR: [
          { userId: userId || undefined },
          { sessionId: sessionId || undefined },
        ],
      },
      include: { variant: true },
    });

    if (existingAssignment) {
      return existingAssignment.variant;
    }

    // Assign to variant based on traffic allocation
    const variant = selectVariant(test.variants, identifier);

    await prisma.abTestAssignment.create({
      data: {
        testId,
        variantId: variant.id,
        userId,
        sessionId,
        assignedAt: new Date(),
      },
    });

    return variant;
  } catch (error) {
    console.error('Error assigning variant:', error);
    return null;
  }
}

/**
 * Track event for A/B test
 */
async function trackEvent(testId, variantId, eventType, eventData = {}, userId = null) {
  try {
    await prisma.abTestEvent.create({
      data: {
        testId,
        variantId,
        userId,
        eventType,
        eventData,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error tracking A/B test event:', error);
  }
}

/**
 * Get test results
 */
async function getTestResults(testId) {
  try {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: {
        variants: {
          include: {
            _count: {
              select: {
                assignments: true,
                events: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    // Calculate metrics for each variant
    const variantResults = await Promise.all(
      test.variants.map(async (variant) => {
        const metrics = await calculateVariantMetrics(variant.id);

        return {
          id: variant.id,
          name: variant.name,
          isControl: variant.isControl,
          trafficPercentage: variant.trafficPercentage,
          assignments: variant._count.assignments,
          events: variant._count.events,
          metrics,
        };
      })
    );

    // Calculate statistical significance
    const significance = calculateStatisticalSignificance(variantResults);

    // Determine winner
    const winner = determineWinner(variantResults, significance);

    return {
      test: {
        id: test.id,
        name: test.name,
        status: test.status,
        startDate: test.startDate,
        endDate: test.endDate,
      },
      variants: variantResults,
      significance,
      winner,
    };
  } catch (error) {
    console.error('Error getting test results:', error);
    throw error;
  }
}

/**
 * Stop A/B test
 */
async function stopTest(testId, userId, reason = 'Manual stop') {
  try {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    if (test.createdBy !== userId) {
      throw new Error('You do not have permission to stop this test');
    }

    await prisma.abTest.update({
      where: { id: testId },
      data: {
        status: 'STOPPED',
        endDate: new Date(),
      },
    });

    return {
      success: true,
      message: `Test stopped: ${reason}`,
    };
  } catch (error) {
    console.error('Error stopping test:', error);
    throw error;
  }
}

/**
 * Select winner and complete test
 */
async function selectWinner(testId, userId, winnerId = null) {
  try {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    if (test.createdBy !== userId) {
      throw new Error('You do not have permission to select winner');
    }

    // Auto-select winner if not provided
    if (!winnerId) {
      const results = await getTestResults(testId);
      winnerId = results.winner?.id;
    }

    if (!winnerId) {
      throw new Error('No clear winner found. Please select manually.');
    }

    await prisma.abTest.update({
      where: { id: testId },
      data: {
        status: 'COMPLETED',
        winnerId,
        endDate: new Date(),
      },
    });

    return {
      success: true,
      winnerId,
      message: 'Winner selected successfully',
    };
  } catch (error) {
    console.error('Error selecting winner:', error);
    throw error;
  }
}

/**
 * Helper: Calculate traffic split
 */
function calculateTrafficSplit(variantCount, allocation = 'equal') {
  if (allocation === 'equal') {
    const percentage = 100 / variantCount;
    return Array(variantCount).fill(percentage);
  }

  // Custom allocation would be passed as an array
  return allocation;
}

/**
 * Helper: Select variant for user
 */
function selectVariant(variants, identifier) {
  // Use consistent hashing for stable assignment
  const hash = crypto.createHash('md5').update(identifier).digest('hex');
  const hashNumber = parseInt(hash.substring(0, 8), 16);
  const percentage = (hashNumber % 10000) / 100;

  let cumulative = 0;

  for (const variant of variants) {
    cumulative += variant.trafficPercentage;
    if (percentage < cumulative) {
      return variant;
    }
  }

  return variants[0];
}

/**
 * Helper: Calculate metrics for variant
 */
async function calculateVariantMetrics(variantId) {
  try {
    const [views, clicks, downloads, ratings] = await Promise.all([
      prisma.abTestEvent.count({
        where: {
          variantId,
          eventType: 'view',
        },
      }),
      prisma.abTestEvent.count({
        where: {
          variantId,
          eventType: 'click',
        },
      }),
      prisma.abTestEvent.count({
        where: {
          variantId,
          eventType: 'download',
        },
      }),
      prisma.abTestEvent.aggregate({
        where: {
          variantId,
          eventType: 'rating',
        },
        _avg: {
          eventData: true,
        },
      }),
    ]);

    const assignments = await prisma.abTestAssignment.count({
      where: { variantId },
    });

    return {
      views,
      clicks,
      downloads,
      clickThroughRate: assignments > 0 ? (clicks / assignments) * 100 : 0,
      conversionRate: assignments > 0 ? (downloads / assignments) * 100 : 0,
      averageRating: ratings._avg.eventData || 0,
    };
  } catch (error) {
    console.error('Error calculating variant metrics:', error);
    return {};
  }
}

/**
 * Helper: Calculate statistical significance
 */
function calculateStatisticalSignificance(variantResults) {
  if (variantResults.length < 2) return null;

  const control = variantResults.find((v) => v.isControl) || variantResults[0];
  const variants = variantResults.filter((v) => !v.isControl);

  const significance = variants.map((variant) => {
    // Simplified z-test for conversion rate
    const p1 = control.metrics.conversionRate / 100;
    const p2 = variant.metrics.conversionRate / 100;
    const n1 = control.assignments;
    const n2 = variant.assignments;

    if (n1 === 0 || n2 === 0) {
      return {
        variantId: variant.id,
        isSignificant: false,
        pValue: 1,
        confidenceLevel: 0,
      };
    }

    const pooled = (p1 * n1 + p2 * n2) / (n1 + n2);
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
    const z = Math.abs((p1 - p2) / se);

    // Simplified p-value calculation
    const pValue = 2 * (1 - normalCDF(z));
    const isSignificant = pValue < 0.05;
    const confidenceLevel = (1 - pValue) * 100;

    return {
      variantId: variant.id,
      isSignificant,
      pValue: pValue.toFixed(4),
      confidenceLevel: confidenceLevel.toFixed(2),
    };
  });

  return significance;
}

/**
 * Helper: Determine winner
 */
function determineWinner(variantResults, significance) {
  // Find variant with highest conversion rate and statistical significance
  let bestVariant = null;
  let bestConversionRate = 0;

  variantResults.forEach((variant) => {
    const sig = significance?.find((s) => s.variantId === variant.id);

    if (variant.metrics.conversionRate > bestConversionRate) {
      if (!sig || sig.isSignificant) {
        bestVariant = variant;
        bestConversionRate = variant.metrics.conversionRate;
      }
    }
  });

  return bestVariant;
}

/**
 * Helper: Normal CDF approximation
 */
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

module.exports = {
  createTest,
  startTest,
  stopTest,
  assignVariant,
  trackEvent,
  getTestResults,
  selectWinner,
};
