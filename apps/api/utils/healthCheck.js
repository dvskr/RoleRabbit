/**
 * Health Check Utility
 * Provides system health status
 */

const { prisma } = require('./db');
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
  
  const [dbHealth, memory] = await Promise.all([
    checkDatabaseHealth(),
    Promise.resolve(checkMemoryHealth())
  ]);
  
  const responseTime = Date.now() - startTime;
  
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
        responseTime: dbHealth.responseTime || `${responseTime}ms`
      },
      memory
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

module.exports = {
  checkDatabaseHealth,
  checkMemoryHealth,
  getHealthStatus,
  isHealthy
};
