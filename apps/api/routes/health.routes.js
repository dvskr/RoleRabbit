/**
 * Health Check Endpoints
 * Provides health status for load balancers and monitoring systems
 */

const { prisma } = require('../utils/db');
const logger = require('../utils/logger');
const { checkRedisHealth } = require('../utils/cacheManager');

/**
 * Register health check routes
 * @param {FastifyInstance} fastify
 */
async function healthRoutes(fastify, options) {
  
  /**
   * Basic health check
   * Returns 200 if server is running
   * Used by load balancers for quick checks
   */
  fastify.get('/health', async (request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'roleready-api'
    });
  });

  /**
   * Detailed health check
   * Checks all critical dependencies
   * Used for comprehensive monitoring
   */
  fastify.get('/health/detailed', async (request, reply) => {
    const startTime = Date.now();
    const checks = {
      server: { status: 'ok', responseTime: 0 },
      database: { status: 'unknown', responseTime: 0 },
      redis: { status: 'unknown', responseTime: 0 },
      openai: { status: 'unknown', responseTime: 0 }
    };

    // Check database connection
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.database.status = 'ok';
      checks.database.responseTime = Date.now() - dbStart;
    } catch (error) {
      checks.database.status = 'error';
      checks.database.error = error.message;
      logger.error('[HEALTH] Database check failed', { error: error.message });
    }

    // Check Redis connection
    try {
      const redisStart = Date.now();
      const redisHealth = await checkRedisHealth();
      checks.redis.status = redisHealth.status === 'healthy' ? 'ok' : redisHealth.status;
      checks.redis.responseTime = redisHealth.responseTime ? parseInt(redisHealth.responseTime) : Date.now() - redisStart;
      if (redisHealth.error) {
        checks.redis.error = redisHealth.error;
      }
      if (redisHealth.memoryUsed) {
        checks.redis.memoryUsed = redisHealth.memoryUsed;
      }
    } catch (error) {
      checks.redis.status = 'error';
      checks.redis.error = error.message;
      logger.error('[HEALTH] Redis check failed', { error: error.message });
    }

    // Check OpenAI API (lightweight check - just verify key is set)
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey && openaiKey.length > 0) {
        checks.openai.status = 'ok';
        checks.openai.note = 'API key configured (not tested)';
      } else {
        checks.openai.status = 'error';
        checks.openai.error = 'API key not configured';
      }
    } catch (error) {
      checks.openai.status = 'error';
      checks.openai.error = error.message;
    }

    // Calculate overall status
    const hasError = Object.values(checks).some(check => check.status === 'error');
    const overallStatus = hasError ? 'degraded' : 'healthy';
    const totalResponseTime = Date.now() - startTime;

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalResponseTime,
      service: 'roleready-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks
    };

    // Return 503 if any critical service is down
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    return reply.status(statusCode).send(response);
  });

  /**
   * Readiness check
   * Returns 200 only if app is ready to serve traffic
   * Used by Kubernetes readiness probes
   */
  fastify.get('/health/ready', async (request, reply) => {
    try {
      // Check if database is accessible
      await prisma.$queryRaw`SELECT 1`;
      
      return reply.status(200).send({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('[HEALTH] Readiness check failed', { error: error.message });
      return reply.status(503).send({
        status: 'not_ready',
        error: 'Database not accessible',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Liveness check
   * Returns 200 if app is alive (not deadlocked)
   * Used by Kubernetes liveness probes
   */
  fastify.get('/health/live', async (request, reply) => {
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  /**
   * Metrics endpoint (Prometheus format)
   * Returns basic metrics for monitoring
   */
  fastify.get('/health/metrics', async (request, reply) => {
    const metrics = {
      uptime_seconds: process.uptime(),
      memory_usage_bytes: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
      timestamp: Date.now()
    };

    // Format as Prometheus metrics
    const prometheusFormat = `
# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${metrics.uptime_seconds}

# HELP nodejs_memory_heap_used_bytes Heap used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${metrics.memory_usage_bytes.heapUsed}

# HELP nodejs_memory_heap_total_bytes Heap total in bytes
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${metrics.memory_usage_bytes.heapTotal}

# HELP nodejs_memory_external_bytes External memory in bytes
# TYPE nodejs_memory_external_bytes gauge
nodejs_memory_external_bytes ${metrics.memory_usage_bytes.external}

# HELP nodejs_memory_rss_bytes Resident set size in bytes
# TYPE nodejs_memory_rss_bytes gauge
nodejs_memory_rss_bytes ${metrics.memory_usage_bytes.rss}
`.trim();

    return reply
      .header('Content-Type', 'text/plain; version=0.0.4')
      .send(prometheusFormat);
  });
}

module.exports = healthRoutes;

