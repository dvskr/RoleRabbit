/**
 * Success Rate Monitoring Service
 * 
 * Monitors success rates for AI features and triggers alerts when thresholds are breached
 */

const { prisma } = require('../../utils/db');
const logger = require('../../utils/logger');

/**
 * Success rate targets for each feature
 */
const SUCCESS_RATE_TARGETS = {
  PARSING: 95.0,      // 95%
  ATS_CHECK: 98.0,    // 98%
  TAILORING: 90.0,    // 90%
  GENERATE_CONTENT: 92.0  // 92%
};

/**
 * Alert thresholds (percentage points below target)
 */
const ALERT_THRESHOLDS = {
  WARNING: 5,   // Alert if 5% below target
  CRITICAL: 10  // Critical alert if 10% below target
};

/**
 * Response time targets (in milliseconds)
 */
const RESPONSE_TIME_TARGETS = {
  PARSING: 30000,        // 30 seconds
  ATS_CHECK: 45000,      // 45 seconds
  TAILORING_PARTIAL: 60000,   // 60 seconds
  TAILORING_FULL: 120000,     // 120 seconds
  GENERATE_CONTENT: 15000     // 15 seconds
};

/**
 * Calculate success rate for a feature
 */
async function calculateSuccessRate(feature, startDate, endDate) {
  const successEvents = {
    PARSING: 'resume_parse_success',
    ATS_CHECK: 'ats_check_success',
    TAILORING: 'tailoring_success',
    GENERATE_CONTENT: 'generate_content_success'
  };

  const failureEvents = {
    PARSING: 'resume_parse_failed',
    ATS_CHECK: 'ats_check_failed',
    TAILORING: 'tailoring_failed',
    GENERATE_CONTENT: 'generate_content_failed'
  };

  const where = {
    timestamp: {
      gte: startDate,
      lte: endDate
    }
  };

  const [successCount, failureCount] = await Promise.all([
    prisma.analyticsEvent.count({
      where: {
        ...where,
        event: successEvents[feature]
      }
    }),
    prisma.analyticsEvent.count({
      where: {
        ...where,
        event: failureEvents[feature]
      }
    })
  ]);

  const total = successCount + failureCount;
  const successRate = total > 0 ? (successCount / total) * 100 : 0;

  return {
    feature,
    successCount,
    failureCount,
    total,
    successRate: parseFloat(successRate.toFixed(2)),
    target: SUCCESS_RATE_TARGETS[feature],
    meetsTarget: successRate >= SUCCESS_RATE_TARGETS[feature]
  };
}

/**
 * Calculate average response time for a feature
 */
async function calculateAverageResponseTime(feature, startDate, endDate) {
  const successEvents = {
    PARSING: 'resume_parse_success',
    ATS_CHECK: 'ats_check_success',
    TAILORING: 'tailoring_success',
    GENERATE_CONTENT: 'generate_content_success'
  };

  const events = await prisma.analyticsEvent.findMany({
    where: {
      event: successEvents[feature],
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      properties: true
    }
  });

  if (events.length === 0) {
    return {
      feature,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      sampleSize: 0
    };
  }

  const durations = events
    .map(e => {
      try {
        const props = JSON.parse(e.properties);
        return props.duration || 0;
      } catch {
        return 0;
      }
    })
    .filter(d => d > 0)
    .sort((a, b) => a - b);

  if (durations.length === 0) {
    return {
      feature,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      sampleSize: 0
    };
  }

  const sum = durations.reduce((a, b) => a + b, 0);
  const avg = sum / durations.length;

  return {
    feature,
    avgResponseTime: Math.round(avg),
    minResponseTime: durations[0],
    maxResponseTime: durations[durations.length - 1],
    p50: durations[Math.floor(durations.length * 0.50)] || 0,
    p95: durations[Math.floor(durations.length * 0.95)] || 0,
    p99: durations[Math.floor(durations.length * 0.99)] || 0,
    sampleSize: durations.length,
    target: getResponseTimeTarget(feature),
    meetsTarget: avg <= getResponseTimeTarget(feature)
  };
}

function getResponseTimeTarget(feature) {
  if (feature === 'TAILORING') {
    return RESPONSE_TIME_TARGETS.TAILORING_PARTIAL; // Default to partial
  }
  return RESPONSE_TIME_TARGETS[feature] || 30000;
}

/**
 * Get comprehensive success rate report
 */
async function getSuccessRateReport({ period = 'day' } = {}) {
  let startDate;
  const endDate = new Date();

  switch (period) {
    case 'hour':
      startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
  }

  const features = ['PARSING', 'ATS_CHECK', 'TAILORING', 'GENERATE_CONTENT'];

  const [successRates, responseTimes] = await Promise.all([
    Promise.all(features.map(f => calculateSuccessRate(f, startDate, endDate))),
    Promise.all(features.map(f => calculateAverageResponseTime(f, startDate, endDate)))
  ]);

  // Calculate overall health score
  const avgSuccessRate = successRates.reduce((sum, r) => sum + r.successRate, 0) / successRates.length;
  const featuresAboveTarget = successRates.filter(r => r.meetsTarget).length;
  const healthScore = (avgSuccessRate + (featuresAboveTarget / features.length) * 100) / 2;

  return {
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: period
    },
    overview: {
      avgSuccessRate: parseFloat(avgSuccessRate.toFixed(2)),
      featuresAboveTarget,
      totalFeatures: features.length,
      healthScore: parseFloat(healthScore.toFixed(2)),
      status: healthScore >= 95 ? 'excellent' : healthScore >= 90 ? 'good' : healthScore >= 80 ? 'fair' : 'poor'
    },
    successRates,
    responseTimes,
    alerts: generateAlerts(successRates, responseTimes)
  };
}

/**
 * Generate alerts based on success rates and response times
 */
function generateAlerts(successRates, responseTimes) {
  const alerts = [];

  // Check success rate alerts
  for (const rate of successRates) {
    const target = rate.target;
    const actual = rate.successRate;
    const diff = target - actual;

    if (diff >= ALERT_THRESHOLDS.CRITICAL) {
      alerts.push({
        type: 'success_rate',
        severity: 'critical',
        feature: rate.feature,
        message: `${rate.feature} success rate (${actual}%) is ${diff.toFixed(1)}% below target (${target}%)`,
        metric: 'success_rate',
        actual,
        target,
        timestamp: new Date().toISOString()
      });
    } else if (diff >= ALERT_THRESHOLDS.WARNING) {
      alerts.push({
        type: 'success_rate',
        severity: 'warning',
        feature: rate.feature,
        message: `${rate.feature} success rate (${actual}%) is ${diff.toFixed(1)}% below target (${target}%)`,
        metric: 'success_rate',
        actual,
        target,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Check response time alerts
  for (const time of responseTimes) {
    if (time.sampleSize === 0) continue;

    const target = time.target;
    const actual = time.avgResponseTime;

    if (actual > target * 1.5) { // 50% over target
      alerts.push({
        type: 'response_time',
        severity: 'critical',
        feature: time.feature,
        message: `${time.feature} avg response time (${actual}ms) is 50%+ over target (${target}ms)`,
        metric: 'response_time',
        actual,
        target,
        timestamp: new Date().toISOString()
      });
    } else if (actual > target * 1.2) { // 20% over target
      alerts.push({
        type: 'response_time',
        severity: 'warning',
        feature: time.feature,
        message: `${time.feature} avg response time (${actual}ms) is 20%+ over target (${target}ms)`,
        metric: 'response_time',
        actual,
        target,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

/**
 * Get success rate trends over time
 */
async function getSuccessRateTrends({ days = 7, feature = null } = {}) {
  const trends = [];
  const now = new Date();

  const features = feature ? [feature] : ['PARSING', 'ATS_CHECK', 'TAILORING', 'GENERATE_CONTENT'];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayRates = await Promise.all(
      features.map(f => calculateSuccessRate(f, dayStart, dayEnd))
    );

    trends.push({
      date: dayStart.toISOString().split('T')[0],
      features: dayRates.reduce((acc, rate) => {
        acc[rate.feature] = {
          successRate: rate.successRate,
          total: rate.total,
          meetsTarget: rate.meetsTarget
        };
        return acc;
      }, {})
    });
  }

  return {
    period: `${days} days`,
    trends
  };
}

/**
 * Log alert (can be extended to send notifications)
 */
function logAlert(alert) {
  const logLevel = alert.severity === 'critical' ? 'error' : 'warn';
  logger[logLevel]('Success rate alert', alert);

  // TODO: Send to notification service (email, Slack, PagerDuty, etc.)
  // Example:
  // if (alert.severity === 'critical') {
  //   await sendSlackAlert(alert);
  //   await sendEmailAlert(alert);
  // }
}

/**
 * Check success rates and trigger alerts
 */
async function checkSuccessRatesAndAlert() {
  try {
    const report = await getSuccessRateReport({ period: 'hour' });

    if (report.alerts.length > 0) {
      logger.warn(`Found ${report.alerts.length} success rate alerts`, {
        alerts: report.alerts
      });

      for (const alert of report.alerts) {
        logAlert(alert);
      }
    } else {
      logger.info('All success rates within targets', {
        healthScore: report.overview.healthScore,
        avgSuccessRate: report.overview.avgSuccessRate
      });
    }

    return report;
  } catch (error) {
    logger.error('Failed to check success rates', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  SUCCESS_RATE_TARGETS,
  RESPONSE_TIME_TARGETS,
  calculateSuccessRate,
  calculateAverageResponseTime,
  getSuccessRateReport,
  getSuccessRateTrends,
  checkSuccessRatesAndAlert,
  generateAlerts
};

