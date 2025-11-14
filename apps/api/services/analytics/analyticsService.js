/**
 * Feature Usage Analytics Service
 * 
 * Tracks user interactions with AI features for insights and optimization
 */

const { prisma } = require('../../utils/db');
const logger = require('../../utils/logger');

/**
 * Event types for tracking
 */
const AnalyticsEvent = {
  // Resume Upload & Parsing
  RESUME_UPLOADED: 'resume_uploaded',
  RESUME_PARSE_STARTED: 'resume_parse_started',
  RESUME_PARSE_SUCCESS: 'resume_parse_success',
  RESUME_PARSE_FAILED: 'resume_parse_failed',
  
  // ATS Analysis
  ATS_CHECK_STARTED: 'ats_check_started',
  ATS_CHECK_SUCCESS: 'ats_check_success',
  ATS_CHECK_FAILED: 'ats_check_failed',
  
  // Resume Tailoring
  TAILORING_STARTED: 'tailoring_started',
  TAILORING_SUCCESS: 'tailoring_success',
  TAILORING_FAILED: 'tailoring_failed',
  TAILORING_APPLIED: 'tailoring_applied',
  TAILORING_DISCARDED: 'tailoring_discarded',
  
  // User Actions
  DRAFT_SAVED: 'draft_saved',
  DRAFT_DISCARDED: 'draft_discarded',
  RESUME_ACTIVATED: 'resume_activated',
  RESUME_DEACTIVATED: 'resume_deactivated',
  
  // Feature Usage
  GENERATE_CONTENT_STARTED: 'generate_content_started',
  GENERATE_CONTENT_SUCCESS: 'generate_content_success',
  GENERATE_CONTENT_FAILED: 'generate_content_failed',
  
  // User Journey
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_SUBSCRIPTION_UPGRADED: 'user_subscription_upgraded',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred'
};

/**
 * Track an analytics event
 * 
 * @param {Object} params - Event parameters
 * @param {string} params.userId - User ID
 * @param {string} params.event - Event name (from AnalyticsEvent)
 * @param {Object} params.properties - Event properties
 * @param {string} params.sessionId - Optional session ID
 * @returns {Promise<void>}
 */
async function trackEvent({ userId, event, properties = {}, sessionId = null }) {
  try {
    // Store in database for persistent analytics
    await prisma.analyticsEvent.create({
      data: {
        userId,
        event,
        properties: JSON.stringify(properties),
        sessionId,
        timestamp: new Date()
      }
    });
    
    // Log for debugging (can be disabled in production)
    if (process.env.LOG_ANALYTICS_EVENTS === 'true') {
      logger.info('Analytics event tracked', {
        userId,
        event,
        properties,
        sessionId
      });
    }
  } catch (error) {
    // Don't throw errors for analytics - fail silently
    logger.error('Failed to track analytics event', {
      error: error.message,
      userId,
      event
    });
  }
}

/**
 * Track resume parsing flow
 */
async function trackResumeUpload({ userId, fileName, fileSize, fileType, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.RESUME_UPLOADED,
    properties: { fileName, fileSize, fileType },
    sessionId
  });
}

async function trackResumeParseStart({ userId, resumeId, method, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.RESUME_PARSE_STARTED,
    properties: { resumeId, method },
    sessionId
  });
}

async function trackResumeParseSuccess({ userId, resumeId, duration, method, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.RESUME_PARSE_SUCCESS,
    properties: { resumeId, duration, method },
    sessionId
  });
}

async function trackResumeParseFailed({ userId, error, method, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.RESUME_PARSE_FAILED,
    properties: { error, method },
    sessionId
  });
}

/**
 * Track ATS analysis flow
 */
async function trackATSCheckStart({ userId, resumeId, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.ATS_CHECK_STARTED,
    properties: { resumeId },
    sessionId
  });
}

async function trackATSCheckSuccess({ userId, resumeId, score, duration, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.ATS_CHECK_SUCCESS,
    properties: { resumeId, score, duration },
    sessionId
  });
}

async function trackATSCheckFailed({ userId, resumeId, error, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.ATS_CHECK_FAILED,
    properties: { resumeId, error },
    sessionId
  });
}

/**
 * Track tailoring flow
 */
async function trackTailoringStart({ userId, resumeId, mode, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.TAILORING_STARTED,
    properties: { resumeId, mode },
    sessionId
  });
}

async function trackTailoringSuccess({ userId, resumeId, mode, duration, scoreImprovement, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.TAILORING_SUCCESS,
    properties: { resumeId, mode, duration, scoreImprovement },
    sessionId
  });
}

async function trackTailoringFailed({ userId, resumeId, mode, error, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.TAILORING_FAILED,
    properties: { resumeId, mode, error },
    sessionId
  });
}

async function trackTailoringApplied({ userId, resumeId, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.TAILORING_APPLIED,
    properties: { resumeId },
    sessionId
  });
}

async function trackTailoringDiscarded({ userId, resumeId, sessionId }) {
  await trackEvent({
    userId,
    event: AnalyticsEvent.TAILORING_DISCARDED,
    properties: { resumeId },
    sessionId
  });
}

/**
 * Get feature usage statistics
 */
async function getFeatureUsageStats({ startDate, endDate, userId = null }) {
  const where = {
    timestamp: {
      gte: startDate,
      lte: endDate
    }
  };
  
  if (userId) {
    where.userId = userId;
  }
  
  // Get event counts by type
  const eventCounts = await prisma.analyticsEvent.groupBy({
    by: ['event'],
    where,
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  });
  
  // Get unique users
  const uniqueUsers = await prisma.analyticsEvent.findMany({
    where,
    select: {
      userId: true
    },
    distinct: ['userId']
  });
  
  // Calculate success rates
  const parseSuccess = eventCounts.find(e => e.event === AnalyticsEvent.RESUME_PARSE_SUCCESS)?._count.id || 0;
  const parseFailed = eventCounts.find(e => e.event === AnalyticsEvent.RESUME_PARSE_FAILED)?._count.id || 0;
  const parseTotal = parseSuccess + parseFailed;
  const parseSuccessRate = parseTotal > 0 ? (parseSuccess / parseTotal) * 100 : 0;
  
  const atsSuccess = eventCounts.find(e => e.event === AnalyticsEvent.ATS_CHECK_SUCCESS)?._count.id || 0;
  const atsFailed = eventCounts.find(e => e.event === AnalyticsEvent.ATS_CHECK_FAILED)?._count.id || 0;
  const atsTotal = atsSuccess + atsFailed;
  const atsSuccessRate = atsTotal > 0 ? (atsSuccess / atsTotal) * 100 : 0;
  
  const tailorSuccess = eventCounts.find(e => e.event === AnalyticsEvent.TAILORING_SUCCESS)?._count.id || 0;
  const tailorFailed = eventCounts.find(e => e.event === AnalyticsEvent.TAILORING_FAILED)?._count.id || 0;
  const tailorTotal = tailorSuccess + tailorFailed;
  const tailorSuccessRate = tailorTotal > 0 ? (tailorSuccess / tailorTotal) * 100 : 0;
  
  const tailorApplied = eventCounts.find(e => e.event === AnalyticsEvent.TAILORING_APPLIED)?._count.id || 0;
  const tailorDiscarded = eventCounts.find(e => e.event === AnalyticsEvent.TAILORING_DISCARDED)?._count.id || 0;
  const tailorApplyRate = (tailorApplied + tailorDiscarded) > 0 
    ? (tailorApplied / (tailorApplied + tailorDiscarded)) * 100 
    : 0;
  
  return {
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    },
    overview: {
      totalEvents: eventCounts.reduce((sum, e) => sum + e._count.id, 0),
      uniqueUsers: uniqueUsers.length
    },
    features: {
      parsing: {
        total: parseTotal,
        success: parseSuccess,
        failed: parseFailed,
        successRate: `${parseSuccessRate.toFixed(1)}%`
      },
      atsCheck: {
        total: atsTotal,
        success: atsSuccess,
        failed: atsFailed,
        successRate: `${atsSuccessRate.toFixed(1)}%`
      },
      tailoring: {
        total: tailorTotal,
        success: tailorSuccess,
        failed: tailorFailed,
        successRate: `${tailorSuccessRate.toFixed(1)}%`,
        applied: tailorApplied,
        discarded: tailorDiscarded,
        applyRate: `${tailorApplyRate.toFixed(1)}%`
      }
    },
    eventBreakdown: eventCounts.map(e => ({
      event: e.event,
      count: e._count.id
    }))
  };
}

/**
 * Get user journey funnel
 */
async function getUserJourneyFunnel({ startDate, endDate }) {
  const where = {
    timestamp: {
      gte: startDate,
      lte: endDate
    }
  };
  
  // Count users at each stage
  const usersUploaded = await prisma.analyticsEvent.findMany({
    where: {
      ...where,
      event: AnalyticsEvent.RESUME_UPLOADED
    },
    select: { userId: true },
    distinct: ['userId']
  });
  
  const usersParsed = await prisma.analyticsEvent.findMany({
    where: {
      ...where,
      event: AnalyticsEvent.RESUME_PARSE_SUCCESS
    },
    select: { userId: true },
    distinct: ['userId']
  });
  
  const usersATS = await prisma.analyticsEvent.findMany({
    where: {
      ...where,
      event: AnalyticsEvent.ATS_CHECK_SUCCESS
    },
    select: { userId: true },
    distinct: ['userId']
  });
  
  const usersTailored = await prisma.analyticsEvent.findMany({
    where: {
      ...where,
      event: AnalyticsEvent.TAILORING_SUCCESS
    },
    select: { userId: true },
    distinct: ['userId']
  });
  
  const usersApplied = await prisma.analyticsEvent.findMany({
    where: {
      ...where,
      event: AnalyticsEvent.TAILORING_APPLIED
    },
    select: { userId: true },
    distinct: ['userId']
  });
  
  const uploadedCount = usersUploaded.length;
  const parsedCount = usersParsed.length;
  const atsCount = usersATS.length;
  const tailoredCount = usersTailored.length;
  const appliedCount = usersApplied.length;
  
  return {
    funnel: [
      {
        stage: 'Resume Uploaded',
        users: uploadedCount,
        percentage: 100,
        dropoff: 0
      },
      {
        stage: 'Resume Parsed',
        users: parsedCount,
        percentage: uploadedCount > 0 ? (parsedCount / uploadedCount) * 100 : 0,
        dropoff: uploadedCount - parsedCount
      },
      {
        stage: 'ATS Check',
        users: atsCount,
        percentage: uploadedCount > 0 ? (atsCount / uploadedCount) * 100 : 0,
        dropoff: parsedCount - atsCount
      },
      {
        stage: 'Tailoring',
        users: tailoredCount,
        percentage: uploadedCount > 0 ? (tailoredCount / uploadedCount) * 100 : 0,
        dropoff: atsCount - tailoredCount
      },
      {
        stage: 'Changes Applied',
        users: appliedCount,
        percentage: uploadedCount > 0 ? (appliedCount / uploadedCount) * 100 : 0,
        dropoff: tailoredCount - appliedCount
      }
    ],
    conversionRate: uploadedCount > 0 ? `${((appliedCount / uploadedCount) * 100).toFixed(1)}%` : '0%'
  };
}

/**
 * Get retention metrics
 */
async function getRetentionMetrics({ cohortStartDate, cohortEndDate }) {
  // Get users who signed up in the cohort period
  const cohortUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: cohortStartDate,
        lte: cohortEndDate
      }
    },
    select: {
      id: true,
      createdAt: true
    }
  });
  
  if (cohortUsers.length === 0) {
    return {
      cohortSize: 0,
      retention: []
    };
  }
  
  // Calculate retention for each week
  const retention = [];
  const now = new Date();
  
  for (let week = 0; week < 12; week++) {
    const weekStart = new Date(cohortEndDate);
    weekStart.setDate(weekStart.getDate() + (week * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    if (weekStart > now) break;
    
    // Count how many cohort users were active this week
    const activeUsers = await prisma.analyticsEvent.findMany({
      where: {
        userId: {
          in: cohortUsers.map(u => u.id)
        },
        timestamp: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    
    const retentionRate = (activeUsers.length / cohortUsers.length) * 100;
    
    retention.push({
      week,
      activeUsers: activeUsers.length,
      retentionRate: `${retentionRate.toFixed(1)}%`
    });
  }
  
  return {
    cohortSize: cohortUsers.length,
    cohortPeriod: {
      start: cohortStartDate.toISOString(),
      end: cohortEndDate.toISOString()
    },
    retention
  };
}

module.exports = {
  AnalyticsEvent,
  trackEvent,
  
  // Resume parsing
  trackResumeUpload,
  trackResumeParseStart,
  trackResumeParseSuccess,
  trackResumeParseFailed,
  
  // ATS analysis
  trackATSCheckStart,
  trackATSCheckSuccess,
  trackATSCheckFailed,
  
  // Tailoring
  trackTailoringStart,
  trackTailoringSuccess,
  trackTailoringFailed,
  trackTailoringApplied,
  trackTailoringDiscarded,
  
  // Analytics queries
  getFeatureUsageStats,
  getUserJourneyFunnel,
  getRetentionMetrics
};

