/**
 * Readiness Health Check Endpoint (Section 4.6)
 *
 * Detailed health check with database, Redis, and queue connectivity
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '../../../database/client';
import { createRedisConnection } from '../../../lib/queue/queues';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: CheckStatus;
    redis: CheckStatus;
    memory: CheckStatus;
    cpu: CheckStatus;
  };
  timestamp: string;
  uptime: number;
  version: string;
}

interface CheckStatus {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
  details?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResult>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      checks: {
        database: { status: 'fail', message: 'Method not allowed' },
        redis: { status: 'fail' },
        memory: { status: 'fail' },
        cpu: { status: 'fail' },
      },
      timestamp: new Date().toISOString(),
      uptime: 0,
      version: '1.0.0',
    });
  }

  const checks: HealthCheckResult['checks'] = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: checkMemory(),
    cpu: checkCPU(),
  };

  // Determine overall status
  const failedChecks = Object.values(checks).filter((c) => c.status === 'fail').length;
  const warnChecks = Object.values(checks).filter((c) => c.status === 'warn').length;

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (failedChecks > 0) {
    overallStatus = 'unhealthy';
  } else if (warnChecks > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
  };

  // Set appropriate HTTP status
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  res.status(statusCode).json(result);
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<CheckStatus> {
  const startTime = Date.now();

  try {
    const supabase = createSupabaseServiceClient();

    // Simple query to check connection
    const { data, error } = await supabase
      .from('portfolios')
      .select('id')
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is OK
      return {
        status: 'fail',
        message: error.message,
        responseTime,
      };
    }

    // Warn if response time is slow
    if (responseTime > 1000) {
      return {
        status: 'warn',
        message: 'Database response time is slow',
        responseTime,
      };
    }

    return {
      status: 'pass',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Database connection failed',
      responseTime,
    };
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<CheckStatus> {
  const startTime = Date.now();

  try {
    const redis = createRedisConnection();

    // Ping Redis
    const result = await redis.ping();

    const responseTime = Date.now() - startTime;

    if (result !== 'PONG') {
      return {
        status: 'fail',
        message: 'Redis ping failed',
        responseTime,
      };
    }

    // Warn if response time is slow
    if (responseTime > 500) {
      return {
        status: 'warn',
        message: 'Redis response time is slow',
        responseTime,
      };
    }

    // Close connection
    await redis.quit();

    return {
      status: 'pass',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Redis connection failed',
      responseTime,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): CheckStatus {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const rss = Math.round(used.rss / 1024 / 1024);

  const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

  if (heapUsagePercent > 90) {
    return {
      status: 'fail',
      message: 'Memory usage critical',
      details: {
        heapUsedMB,
        heapTotalMB,
        rssMB: rss,
        heapUsagePercent: Math.round(heapUsagePercent),
      },
    };
  }

  if (heapUsagePercent > 80) {
    return {
      status: 'warn',
      message: 'Memory usage high',
      details: {
        heapUsedMB,
        heapTotalMB,
        rssMB: rss,
        heapUsagePercent: Math.round(heapUsagePercent),
      },
    };
  }

  return {
    status: 'pass',
    details: {
      heapUsedMB,
      heapTotalMB,
      rssMB: rss,
      heapUsagePercent: Math.round(heapUsagePercent),
    },
  };
}

/**
 * Check CPU usage (simplified - returns system load average)
 */
function checkCPU(): CheckStatus {
  const loadAvg = process.cpuUsage();
  const cpus = require('os').cpus().length;

  // Calculate CPU usage percentage (simplified)
  const userCPU = loadAvg.user / 1000000; // Convert to seconds
  const systemCPU = loadAvg.system / 1000000;
  const totalCPU = userCPU + systemCPU;

  return {
    status: 'pass',
    details: {
      cpus,
      userCPU: Math.round(userCPU * 100) / 100,
      systemCPU: Math.round(systemCPU * 100) / 100,
      totalCPU: Math.round(totalCPU * 100) / 100,
    },
  };
}
