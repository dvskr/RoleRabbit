/**
 * Analytics API utilities
 * Handles database operations for analytics tracking
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all analytics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of analytics
 */
async function getAnalyticsByUserId(userId) {
  try {
    const analytics = await prisma.analytics.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return analytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

/**
 * Get a single analytics entry by ID
 * @param {string} analyticsId - Analytics ID
 * @returns {Promise<Object>} Analytics object
 */
async function getAnalyticsById(analyticsId) {
  try {
    const analytics = await prisma.analytics.findUnique({
      where: {
        id: analyticsId
      }
    });
    return analytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

/**
 * Create a new analytics entry
 * @param {string} userId - User ID
 * @param {Object} analyticsData - Analytics data
 * @returns {Promise<Object>} Created analytics entry
 */
async function createAnalytics(userId, analyticsData) {
  try {
    const analytics = await prisma.analytics.create({
      data: {
        userId,
        type: analyticsData.type || 'application_analytics',
        data: typeof analyticsData.data === 'string' 
          ? analyticsData.data 
          : JSON.stringify(analyticsData.data || {}),
        date: analyticsData.date ? new Date(analyticsData.date) : new Date()
      }
    });
    return analytics;
  } catch (error) {
    console.error('Error creating analytics:', error);
    throw error;
  }
}

/**
 * Update an analytics entry
 * @param {string} analyticsId - Analytics ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated analytics entry
 */
async function updateAnalytics(analyticsId, updates) {
  try {
    // Filter out undefined fields
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'data' && typeof updates[key] === 'object') {
          cleanUpdates[key] = JSON.stringify(updates[key]);
        } else if (key === 'date') {
          cleanUpdates[key] = new Date(updates[key]);
        } else {
          cleanUpdates[key] = updates[key];
        }
      }
    });

    const analytics = await prisma.analytics.update({
      where: {
        id: analyticsId
      },
      data: cleanUpdates
    });
    return analytics;
  } catch (error) {
    console.error('Error updating analytics:', error);
    throw error;
  }
}

/**
 * Delete an analytics entry
 * @param {string} analyticsId - Analytics ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteAnalytics(analyticsId) {
  try {
    await prisma.analytics.delete({
      where: {
        id: analyticsId
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting analytics:', error);
    throw error;
  }
}

/**
 * Get analytics by type
 * @param {string} userId - User ID
 * @param {string} type - Analytics type
 * @returns {Promise<Array>} Array of analytics
 */
async function getAnalyticsByType(userId, type) {
  try {
    const analytics = await prisma.analytics.findMany({
      where: {
        userId: userId,
        type: type
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return analytics;
  } catch (error) {
    console.error('Error fetching analytics by type:', error);
    throw error;
  }
}

module.exports = {
  getAnalyticsByUserId,
  getAnalyticsById,
  createAnalytics,
  updateAnalytics,
  deleteAnalytics,
  getAnalyticsByType
};

