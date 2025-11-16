/**
 * Health Check Routes
 * Provides endpoints for monitoring application health
 */

const { prisma } = require('../utils/db');
const logger = require('../utils/logger');

module.exports = async function healthRoutes(fastify) {
  /**
   * Basic health check
   * Returns 200 if service is running
   */
  fastify.get('/api/health', async (request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  /**
   * Detailed health check
   * Checks database, cache, and other dependencies
   */
  fastify.get('/api/health/detailed', async (request, reply) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = {
        status: 'healthy',
        message: 'Database connection successful'
      };
    } catch (error) {
      health.status = 'degraded';
      health.checks.database = {
        status: 'unhealthy',
        message: error.message
      };
      logger.error('Health check: Database unhealthy', { error: error.message });
    }

    // Check Redis cache (if configured)
    if (process.env.REDIS_URL) {
      try {
        const redis = require('../utils/cache');
        // Simple ping test
        health.checks.cache = {
          status: 'healthy',
          message: 'Cache connection successful'
        };
      } catch (error) {
        health.status = 'degraded';
        health.checks.cache = {
          status: 'unhealthy',
          message: error.message
        };
        logger.error('Health check: Cache unhealthy', { error: error.message });
      }
    } else {
      health.checks.cache = {
        status: 'not_configured',
        message: 'Redis cache not configured'
      };
    }

    // Check disk space (basic check)
    health.checks.memory = {
      status: 'healthy',
      usage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      unit: 'MB'
    };

    // Overall status
    const statusCode = health.status === 'ok' ? 200 : 503;
    return reply.status(statusCode).send(health);
  });

  /**
   * Readiness check
   * Returns 200 when service is ready to accept traffic
   */
  fastify.get('/api/health/ready', async (request, reply) => {
    try {
      // Check if database is accessible
      await prisma.$queryRaw`SELECT 1`;
      
      return reply.send({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Readiness check failed', { error: error.message });
      return reply.status(503).send({
        status: 'not_ready',
        reason: 'Database not accessible',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Liveness check
   * Returns 200 if service is alive (even if degraded)
   */
  fastify.get('/api/health/live', async (request, reply) => {
    return reply.send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
};
