const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const {
  getSuccessRateReport,
  getSuccessRateTrends,
  checkSuccessRatesAndAlert,
  SUCCESS_RATE_TARGETS,
  RESPONSE_TIME_TARGETS
} = require('../services/monitoring/successRateMonitor');

/**
 * Success Rate Monitoring API Routes
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

module.exports = async function monitoringRoutes(fastify) {
  /**
   * GET /api/monitoring/success-rates
   * Get comprehensive success rate report
   */
  fastify.get('/api/monitoring/success-rates', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { period = 'day' } = request.query;
      
      const report = await getSuccessRateReport({ period });
      
      return reply.send({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Failed to get success rate report', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve success rate report'
      });
    }
  });

  /**
   * GET /api/monitoring/trends
   * Get success rate trends over time
   */
  fastify.get('/api/monitoring/trends', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { days = 7, feature = null } = request.query;
      
      const trends = await getSuccessRateTrends({
        days: parseInt(days),
        feature
      });
      
      return reply.send({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Failed to get success rate trends', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve success rate trends'
      });
    }
  });

  /**
   * POST /api/monitoring/check-alerts
   * Manually trigger alert check
   */
  fastify.post('/api/monitoring/check-alerts', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const report = await checkSuccessRatesAndAlert();
      
      return reply.send({
        success: true,
        data: {
          alertCount: report.alerts.length,
          alerts: report.alerts,
          healthScore: report.overview.healthScore,
          status: report.overview.status
        }
      });
    } catch (error) {
      logger.error('Failed to check alerts', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to check alerts'
      });
    }
  });

  /**
   * GET /api/monitoring/targets
   * Get configured success rate and response time targets
   */
  fastify.get('/api/monitoring/targets', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      return reply.send({
        success: true,
        data: {
          successRates: SUCCESS_RATE_TARGETS,
          responseTimes: RESPONSE_TIME_TARGETS
        }
      });
    } catch (error) {
      logger.error('Failed to get targets', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve targets'
      });
    }
  });

  /**
   * GET /api/monitoring/health
   * Get overall system health based on success rates
   */
  fastify.get('/api/monitoring/health', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const report = await getSuccessRateReport({ period: 'hour' });
      
      return reply.send({
        success: true,
        data: {
          healthScore: report.overview.healthScore,
          status: report.overview.status,
          avgSuccessRate: report.overview.avgSuccessRate,
          featuresAboveTarget: report.overview.featuresAboveTarget,
          totalFeatures: report.overview.totalFeatures,
          criticalAlerts: report.alerts.filter(a => a.severity === 'critical').length,
          warningAlerts: report.alerts.filter(a => a.severity === 'warning').length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get system health', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve system health'
      });
    }
  });
};

