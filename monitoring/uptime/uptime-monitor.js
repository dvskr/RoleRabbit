/**
 * Uptime Monitoring Service
 * Comprehensive health checking and uptime monitoring for all services
 */

const http = require('http');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

const prisma = new PrismaClient();

// Monitoring configuration
const MONITORS = [
  {
    name: 'Web Application',
    type: 'http',
    url: 'https://rolerabbit.com',
    method: 'GET',
    timeout: 5000,
    interval: 60000, // 1 minute
    expectedStatus: 200,
    critical: true,
  },
  {
    name: 'API Health',
    type: 'http',
    url: 'https://api.rolerabbit.com/health',
    method: 'GET',
    timeout: 3000,
    interval: 30000, // 30 seconds
    expectedStatus: 200,
    critical: true,
  },
  {
    name: 'API Templates Endpoint',
    type: 'http',
    url: 'https://api.rolerabbit.com/api/templates',
    method: 'GET',
    timeout: 5000,
    interval: 120000, // 2 minutes
    expectedStatus: 200,
    critical: false,
  },
  {
    name: 'Database Connection',
    type: 'database',
    check: async () => {
      await prisma.$queryRaw`SELECT 1`;
    },
    interval: 30000,
    timeout: 3000,
    critical: true,
  },
  {
    name: 'Redis Connection',
    type: 'redis',
    check: async () => {
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      await redis.quit();
    },
    interval: 30000,
    timeout: 3000,
    critical: true,
  },
  {
    name: 'WebSocket Service',
    type: 'websocket',
    url: 'wss://api.rolerabbit.com/ws',
    interval: 60000,
    timeout: 5000,
    critical: false,
  },
  {
    name: 'S3 Storage',
    type: 'custom',
    check: async () => {
      // Check S3 connectivity
      const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
      const client = new S3Client({ region: process.env.AWS_REGION });
      await client.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET }));
    },
    interval: 300000, // 5 minutes
    timeout: 10000,
    critical: false,
  },
  {
    name: 'Email Service',
    type: 'custom',
    check: async () => {
      // Verify email service connectivity
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
      });
      await transporter.verify();
    },
    interval: 300000,
    timeout: 10000,
    critical: false,
  },
];

// Health check results storage
const healthStatus = new Map();
const uptimeMetrics = new Map();

/**
 * Perform HTTP health check
 */
async function checkHttp(monitor) {
  return new Promise((resolve, reject) => {
    const url = new URL(monitor.url);
    const protocol = url.protocol === 'https:' ? https : http;

    const startTime = Date.now();

    const req = protocol.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: monitor.method || 'GET',
        timeout: monitor.timeout,
        headers: {
          'User-Agent': 'RoleRabbit-Uptime-Monitor/1.0',
        },
      },
      (res) => {
        const responseTime = Date.now() - startTime;

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const success = res.statusCode === monitor.expectedStatus;

          resolve({
            success,
            statusCode: res.statusCode,
            responseTime,
            message: success ? 'OK' : `Unexpected status code: ${res.statusCode}`,
          });
        });
      }
    );

    req.on('error', (error) => {
      reject({
        success: false,
        responseTime: Date.now() - startTime,
        message: error.message,
        error,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        success: false,
        responseTime: monitor.timeout,
        message: 'Request timeout',
      });
    });

    req.end();
  });
}

/**
 * Perform WebSocket health check
 */
async function checkWebSocket(monitor) {
  return new Promise((resolve, reject) => {
    const WebSocket = require('ws');
    const startTime = Date.now();

    const ws = new WebSocket(monitor.url, {
      handshakeTimeout: monitor.timeout,
    });

    const timeout = setTimeout(() => {
      ws.terminate();
      reject({
        success: false,
        responseTime: monitor.timeout,
        message: 'WebSocket connection timeout',
      });
    }, monitor.timeout);

    ws.on('open', () => {
      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;
      ws.close();

      resolve({
        success: true,
        responseTime,
        message: 'WebSocket connection successful',
      });
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject({
        success: false,
        responseTime: Date.now() - startTime,
        message: error.message,
        error,
      });
    });
  });
}

/**
 * Perform custom health check
 */
async function checkCustom(monitor) {
  const startTime = Date.now();

  try {
    await Promise.race([
      monitor.check(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), monitor.timeout)
      ),
    ]);

    return {
      success: true,
      responseTime: Date.now() - startTime,
      message: 'OK',
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      message: error.message,
      error,
    };
  }
}

/**
 * Execute health check
 */
async function executeHealthCheck(monitor) {
  try {
    let result;

    switch (monitor.type) {
      case 'http':
        result = await checkHttp(monitor);
        break;
      case 'websocket':
        result = await checkWebSocket(monitor);
        break;
      case 'database':
      case 'redis':
      case 'custom':
        result = await checkCustom(monitor);
        break;
      default:
        throw new Error(`Unknown monitor type: ${monitor.type}`);
    }

    // Update health status
    const now = Date.now();
    const previousStatus = healthStatus.get(monitor.name);

    healthStatus.set(monitor.name, {
      ...result,
      timestamp: now,
      monitor: monitor.name,
      critical: monitor.critical,
    });

    // Update uptime metrics
    if (!uptimeMetrics.has(monitor.name)) {
      uptimeMetrics.set(monitor.name, {
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        totalResponseTime: 0,
        lastCheck: null,
        lastSuccess: null,
        lastFailure: null,
        consecutiveFailures: 0,
      });
    }

    const metrics = uptimeMetrics.get(monitor.name);
    metrics.totalChecks++;
    metrics.lastCheck = now;

    if (result.success) {
      metrics.successfulChecks++;
      metrics.totalResponseTime += result.responseTime;
      metrics.lastSuccess = now;
      metrics.consecutiveFailures = 0;
    } else {
      metrics.failedChecks++;
      metrics.lastFailure = now;
      metrics.consecutiveFailures++;

      // Alert on critical service failure
      if (monitor.critical && metrics.consecutiveFailures >= 3) {
        await sendAlert(monitor, result, metrics);
      }
    }

    // Log status change
    if (
      !previousStatus ||
      previousStatus.success !== result.success
    ) {
      console.log(
        `[${new Date().toISOString()}] ${monitor.name}: ${result.success ? 'UP' : 'DOWN'} - ${result.message}`
      );
    }

    return result;
  } catch (error) {
    console.error(`Error checking ${monitor.name}:`, error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
}

/**
 * Send alert for service failure
 */
async function sendAlert(monitor, result, metrics) {
  const alert = {
    monitor: monitor.name,
    status: 'DOWN',
    message: result.message,
    consecutiveFailures: metrics.consecutiveFailures,
    lastSuccess: metrics.lastSuccess,
    timestamp: Date.now(),
  };

  console.error(`🚨 ALERT: ${monitor.name} is DOWN!`, alert);

  // Send to alerting service (e.g., PagerDuty, Slack)
  try {
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Service Alert: ${monitor.name} is DOWN`,
        attachments: [
          {
            color: 'danger',
            fields: [
              {
                title: 'Service',
                value: monitor.name,
                short: true,
              },
              {
                title: 'Status',
                value: 'DOWN',
                short: true,
              },
              {
                title: 'Consecutive Failures',
                value: metrics.consecutiveFailures.toString(),
                short: true,
              },
              {
                title: 'Error',
                value: result.message,
                short: false,
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Error sending alert:', error);
  }
}

/**
 * Get uptime statistics
 */
function getUptimeStats(monitorName) {
  const metrics = uptimeMetrics.get(monitorName);
  if (!metrics) return null;

  const uptime = metrics.totalChecks > 0
    ? (metrics.successfulChecks / metrics.totalChecks) * 100
    : 0;

  const avgResponseTime = metrics.successfulChecks > 0
    ? metrics.totalResponseTime / metrics.successfulChecks
    : 0;

  return {
    uptime: uptime.toFixed(2),
    totalChecks: metrics.totalChecks,
    successfulChecks: metrics.successfulChecks,
    failedChecks: metrics.failedChecks,
    avgResponseTime: avgResponseTime.toFixed(2),
    lastCheck: metrics.lastCheck,
    lastSuccess: metrics.lastSuccess,
    lastFailure: metrics.lastFailure,
    consecutiveFailures: metrics.consecutiveFailures,
  };
}

/**
 * Get overall system status
 */
function getSystemStatus() {
  const statuses = Array.from(healthStatus.values());
  const allUp = statuses.every((s) => s.success);
  const criticalDown = statuses.some((s) => !s.success && s.critical);

  return {
    status: allUp ? 'healthy' : criticalDown ? 'critical' : 'degraded',
    services: statuses,
    timestamp: Date.now(),
  };
}

/**
 * Start monitoring
 */
function startMonitoring() {
  console.log(`Starting uptime monitoring for ${MONITORS.length} services...`);

  MONITORS.forEach((monitor) => {
    // Execute initial check
    executeHealthCheck(monitor);

    // Schedule periodic checks
    setInterval(() => {
      executeHealthCheck(monitor);
    }, monitor.interval);
  });

  // Log summary every 5 minutes
  setInterval(() => {
    const summary = MONITORS.map((m) => ({
      name: m.name,
      stats: getUptimeStats(m.name),
    }));

    console.log('\n=== Uptime Summary ===');
    summary.forEach((s) => {
      if (s.stats) {
        console.log(
          `${s.name}: ${s.stats.uptime}% uptime (${s.stats.successfulChecks}/${s.stats.totalChecks} checks)`
        );
      }
    });
    console.log('=====================\n');
  }, 300000);
}

// Export monitoring API
module.exports = {
  startMonitoring,
  getSystemStatus,
  getUptimeStats,
  healthStatus,
  uptimeMetrics,
};

// Start monitoring if run directly
if (require.main === module) {
  startMonitoring();
}
