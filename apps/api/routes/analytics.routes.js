const { authenticate } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const logger = require('../utils/logger');
const {
  getFeatureUsageStats,
  getUserJourneyFunnel,
  getRetentionMetrics
} = require('../services/analytics/analyticsService');

/**
 * Analytics API Routes
 * 
 * Provides analytics data for admin dashboard
 */

// Middleware to check if user is admin
async function requireAdmin(request, reply) {
  const userId = request.user.userId;
  
  const adminUsers = (process.env.ADMIN_USERS || '').split(',').filter(Boolean);
  
  if (!adminUsers.includes(userId)) {
    return reply.status(403).send({
      success: false,
      error: 'Admin access required'
    });
  }
}

module.exports = async function analyticsRoutes(fastify) {
  /**
   * GET /api/analytics/features
   * Get feature usage statistics
   */
  fastify.get('/api/analytics/features', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { period = 'week' } = request.query;
      
      let startDate;
      const endDate = new Date();
      
      switch (period) {
        case 'day':
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'week':
        default:
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      const stats = await getFeatureUsageStats({ startDate, endDate });
      
      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get feature usage stats', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve feature usage statistics'
      });
    }
  });

  /**
   * GET /api/analytics/funnel
   * Get user journey funnel
   */
  fastify.get('/api/analytics/funnel', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { period = 'week' } = request.query;
      
      let startDate;
      const endDate = new Date();
      
      switch (period) {
        case 'day':
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'week':
        default:
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      const funnel = await getUserJourneyFunnel({ startDate, endDate });
      
      return reply.send({
        success: true,
        data: funnel
      });
    } catch (error) {
      logger.error('Failed to get user journey funnel', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve user journey funnel'
      });
    }
  });

  /**
   * GET /api/analytics/retention
   * Get retention metrics
   */
  fastify.get('/api/analytics/retention', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { cohortWeeks = 4 } = request.query;
      
      const cohortEndDate = new Date();
      const cohortStartDate = new Date(cohortEndDate);
      cohortStartDate.setDate(cohortStartDate.getDate() - (parseInt(cohortWeeks) * 7));
      
      const retention = await getRetentionMetrics({ cohortStartDate, cohortEndDate });
      
      return reply.send({
        success: true,
        data: retention
      });
    } catch (error) {
      logger.error('Failed to get retention metrics', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve retention metrics'
      });
    }
  });

  /**
   * GET /api/analytics/user/:userId
   * Get analytics for a specific user
   */
  fastify.get('/api/analytics/user/:userId', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const { period = 'month' } = request.query;
      
      let startDate;
      const endDate = new Date();
      
      switch (period) {
        case 'week':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
        default:
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      const stats = await getFeatureUsageStats({ startDate, endDate, userId });
      
      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get user analytics', {
        error: error.message,
        userId: request.params.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve user analytics'
      });
    }
  });

  /**
   * GET /api/analytics/events
   * Get recent events (for debugging/monitoring)
   */
  fastify.get('/api/analytics/events', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { limit = 100, event = null } = request.query;
      
      const where = {};
      if (event) {
        where.event = event;
      }
      
      const events = await prisma.analyticsEvent.findMany({
        where,
        take: parseInt(limit),
        orderBy: {
          timestamp: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              subscriptionTier: true
            }
          }
        }
      });
      
      return reply.send({
        success: true,
        data: events.map(e => ({
          ...e,
          properties: JSON.parse(e.properties)
        }))
      });
    } catch (error) {
      logger.error('Failed to get analytics events', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve analytics events'
      });
    }
  });
};

