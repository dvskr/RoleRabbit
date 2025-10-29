/**
 * Analytics Utility
 * Tracks and aggregates user analytics
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Track user activity
 */
async function trackActivity(userId, activityType, metadata = {}) {
  try {
    await prisma.analytics.create({
      data: {
        userId,
        activityType,
        metadata: JSON.stringify(metadata),
        timestamp: new Date()
      }
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to track activity', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user analytics
 */
async function getUserAnalytics(userId, startDate, endDate) {
  try {
    const activities = await prisma.analytics.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    return activities;
  } catch (error) {
    logger.error('Failed to get user analytics', error);
    return [];
  }
}

/**
 * Get analytics summary
 */
async function getAnalyticsSummary(userId) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const activities = await prisma.analytics.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo }
      }
    });
    
    const summary = {
      totalActivities: activities.length,
      activitiesByType: {},
      dailyActivity: {}
    };
    
    activities.forEach(activity => {
      // Count by type
      summary.activitiesByType[activity.activityType] = 
        (summary.activitiesByType[activity.activityType] || 0) + 1;
      
      // Count by day
      const day = activity.timestamp.toISOString().split('T')[0];
      summary.dailyActivity[day] = (summary.dailyActivity[day] || 0) + 1;
    });
    
    return summary;
  } catch (error) {
    logger.error('Failed to get analytics summary', error);
    return null;
  }
}

module.exports = {
  trackActivity,
  getUserAnalytics,
  getAnalyticsSummary
};
