/**
 * Health Check Utility
 * Provides system health status
 */

const { prisma, getPoolStats } = require('./db');
const { checkRedisHealth, getStats: getCacheStats } = require('./cacheManager');
const logger = require('./logger');

/**
 * Check database health
 */
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', responseTime: null };
  } catch (error) {
    logger.error('Database health check failed', error);
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Check memory usage
 */
function checkMemoryHealth() {
  const usage = process.memoryUsage();
  const usedMb = usage.heapUsed / 1024 / 1024;
  const totalMb = usage.heapTotal / 1024 / 1024;
  
  const percentage = (usedMb / totalMb) * 100;
  
  return {
    heapUsed: `${Math.round(usedMb)}MB`,
    heapTotal: `${Math.round(totalMb)}MB`,
    percentage: `${Math.round(percentage)}%`,
    status: percentage > 90 ? 'warning' : 'healthy'
  };
}

/**
 * Get comprehensive health status
 */
async function getHealthStatus() {
  const startTime = Date.now();
  
  const [dbHealth, memory, poolStats, redisHealth, cacheStats] = await Promise.all([
    checkDatabaseHealth(),
    Promise.resolve(checkMemoryHealth()),
    Promise.resolve(getPoolStats()),
    checkRedisHealth(),
    Promise.resolve(getCacheStats())
  ]);
  
  const responseTime = Date.now() - startTime;
  
  // Overall status is healthy only if critical components are healthy
  // Redis is not critical (app works without it, just slower)
  const overallStatus = dbHealth.status === 'healthy' && memory.status === 'healthy' 
    ? 'healthy' 
    : 'degraded';
  
  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.API_VERSION || '1.0.0',
    responseTime: `${responseTime}ms`,
    checks: {
      database: {
        ...dbHealth,
        responseTime: dbHealth.responseTime || `${responseTime}ms`,
        pool: {
          connectionLimit: poolStats.config.connectionLimit,
          poolTimeout: poolStats.config.poolTimeout,
          connectTimeout: poolStats.config.connectTimeout,
          pgbouncer: poolStats.config.pgbouncer,
          isConnected: poolStats.isConnected,
          reconnectAttempts: poolStats.reconnectAttempts
        }
      },
      memory,
      redis: redisHealth,
      cache: cacheStats
    }
  };
}

/**
 * Check if system is healthy
 */
async function isHealthy() {
  const health = await getHealthStatus();
  return health.status === 'healthy';
}

/**
 * Kubernetes Liveness Probe
 * Checks if the application is alive and should not be restarted
 */
async function getLivenessStatus() {
  // Basic check: Is the process running and responsive?
  return {
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}

/**
 * Kubernetes Readiness Probe
 * Checks if the application is ready to receive traffic
 */
async function getReadinessStatus() {
  try {
    // Check critical dependencies
    const dbHealth = await checkDatabaseHealth();
    
    const isReady = dbHealth.status === 'healthy';
    
    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealth.status
      }
    };
  } catch (error) {
    logger.error('Readiness check failed', error);
    return {
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  checkDatabaseHealth,
  checkMemoryHealth,
  getHealthStatus,
  isHealthy,
  getLivenessStatus,
  getReadinessStatus
};
