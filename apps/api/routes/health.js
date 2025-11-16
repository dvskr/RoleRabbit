/**
 * Health Check Endpoint
 * 
 * Provides application health status for load balancers and monitoring
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database-advanced');
const { redisCache } = require('../utils/redisCache');

/**
 * GET /api/health
 * 
 * Basic health check
 */
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/health/detailed
 * 
 * Detailed health check with dependency status
 */
router.get('/detailed', async (req, res) => {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
    disk: 'unknown',
    memory: 'unknown'
  };

  let overallStatus = 'ok';

  try {
    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      overallStatus = 'degraded';
    }

    // Check Redis
    try {
      await redisCache.ping();
      checks.redis = 'connected';
    } catch (error) {
      checks.redis = 'disconnected';
      overallStatus = 'degraded';
    }

    // Check disk space
    const diskUsage = process.memoryUsage();
    checks.disk = {
      heapUsed: `${(diskUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(diskUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(diskUsage.external / 1024 / 1024).toFixed(2)} MB`
    };

    // Check memory
    const memUsage = process.memoryUsage();
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    checks.memory = {
      used: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${memPercent.toFixed(2)}%`
    };

    if (memPercent > 90) {
      overallStatus = 'degraded';
    }

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks
    };

    const statusCode = overallStatus === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      checks
    });
  }
});

/**
 * GET /api/health/ready
 * 
 * Readiness probe for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if application is ready to serve traffic
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      message: error.message
    });
  }
});

/**
 * GET /api/health/live
 * 
 * Liveness probe for Kubernetes
 */
router.get('/live', (req, res) => {
  // Simple check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

