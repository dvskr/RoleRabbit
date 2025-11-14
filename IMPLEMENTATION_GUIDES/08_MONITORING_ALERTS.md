# Monitoring & Alerts Setup Guide

## Overview
Implement comprehensive monitoring and alerting using Sentry for error tracking, plus custom metrics for file storage operations.

## 1. Sentry Error Tracking Setup

### Step 1: Install Sentry
```bash
cd apps/api
npm install @sentry/node @sentry/profiling-node

cd apps/web
npm install @sentry/react @sentry/tracing
```

### Step 2: Initialize Sentry (Backend)
Create `apps/api/utils/sentry.js`:

```javascript
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

function initSentry(app) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        // Enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // Enable Fastify tracing
        new Sentry.Integrations.Fastify({ app }),
        // Enable profiling
        new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Profiling
      profilesSampleRate: 0.1,
      // Set sampling rate for errors
      sampleRate: 1.0,
      // Release tracking
      release: process.env.GIT_COMMIT_SHA,
      // Filter sensitive data
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        return event;
      }
    });

    console.log('✅ Sentry initialized');
  } else {
    console.warn('⚠️  Sentry DSN not configured');
  }
}

// Error handler middleware for Fastify
function sentryErrorHandler(error, request, reply) {
  Sentry.withScope((scope) => {
    scope.setUser({
      id: request.user?.userId,
      email: request.user?.email
    });
    scope.setContext('request', {
      method: request.method,
      url: request.url,
      query: request.query,
      headers: request.headers
    });
    Sentry.captureException(error);
  });

  // Continue with normal error handling
  reply.status(error.statusCode || 500).send({
    error: error.message,
    statusCode: error.statusCode || 500
  });
}

module.exports = { initSentry, sentryErrorHandler };
```

### Step 3: Integrate into Fastify Server
Update `apps/api/server.js`:

```javascript
const { initSentry, sentryErrorHandler } = require('./utils/sentry');
const Sentry = require('@sentry/node');

// Initialize Sentry
initSentry(fastify);

// Add Sentry request handler
fastify.addHook('onRequest', Sentry.Handlers.requestHandler());

// Add Sentry tracing
fastify.addHook('onRequest', Sentry.Handlers.tracingHandler());

// Add Sentry error handler
fastify.setErrorHandler(sentryErrorHandler);

// Add Sentry error handler (should be last)
fastify.addHook('onError', Sentry.Handlers.errorHandler());
```

### Step 4: Initialize Sentry (Frontend)
Update `apps/web/src/app/layout.tsx`:

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## 2. Custom Metrics for File Storage

### Step 1: Create Metrics Service
Create `apps/api/utils/metrics.js`:

```javascript
const { prisma } = require('./db');
const logger = require('./logger');

class MetricsService {
  constructor() {
    this.metrics = {
      uploads: { success: 0, failed: 0, totalBytes: 0 },
      downloads: { count: 0, totalBytes: 0 },
      storage: { totalFiles: 0, totalSize: 0 }
    };
  }

  /**
   * Track file upload
   */
  async trackUpload(success, fileSize = 0, error = null) {
    if (success) {
      this.metrics.uploads.success++;
      this.metrics.uploads.totalBytes += fileSize;
      logger.info('📊 Upload success', { fileSize });
    } else {
      this.metrics.uploads.failed++;
      logger.error('📊 Upload failed', { error: error?.message });

      // Send to Sentry for failed uploads
      const Sentry = require('@sentry/node');
      Sentry.captureException(error, {
        tags: { operation: 'file_upload' },
        extra: { fileSize }
      });
    }
  }

  /**
   * Track file download
   */
  async trackDownload(fileSize) {
    this.metrics.downloads.count++;
    this.metrics.downloads.totalBytes += fileSize;
    logger.info('📊 Download tracked', { fileSize });
  }

  /**
   * Get current storage usage
   */
  async getStorageMetrics() {
    try {
      const result = await prisma.storageFile.aggregate({
        _count: { id: true },
        _sum: { size: true },
        where: { deletedAt: null }
      });

      this.metrics.storage.totalFiles = result._count.id;
      this.metrics.storage.totalSize = Number(result._sum.size || 0);

      return this.metrics.storage;
    } catch (error) {
      logger.error('Failed to get storage metrics:', error);
      return null;
    }
  }

  /**
   * Get metrics summary
   */
  async getMetricsSummary() {
    const storage = await this.getStorageMetrics();

    return {
      uploads: this.metrics.uploads,
      downloads: this.metrics.downloads,
      storage,
      uploadSuccessRate: this.getSuccessRate(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate upload success rate
   */
  getSuccessRate() {
    const total = this.metrics.uploads.success + this.metrics.uploads.failed;
    if (total === 0) return 100;
    return ((this.metrics.uploads.success / total) * 100).toFixed(2);
  }

  /**
   * Reset metrics (called daily)
   */
  reset() {
    this.metrics = {
      uploads: { success: 0, failed: 0, totalBytes: 0 },
      downloads: { count: 0, totalBytes: 0 },
      storage: { totalFiles: 0, totalSize: 0 }
    };
    logger.info('📊 Metrics reset');
  }
}

const metricsService = new MetricsService();

// Reset metrics daily
setInterval(() => {
  metricsService.reset();
}, 24 * 60 * 60 * 1000);

module.exports = metricsService;
```

### Step 2: Integrate Metrics into Upload Route
```javascript
const metricsService = require('../utils/metrics');

// In upload handler
try {
  const result = await storageHandler.upload(...);
  await metricsService.trackUpload(true, fileSize);
  // ...
} catch (error) {
  await metricsService.trackUpload(false, fileSize, error);
  throw error;
}
```

### Step 3: Create Metrics Dashboard Endpoint
```javascript
// In storage.routes.js
fastify.get('/metrics', {
  preHandler: [authenticate, adminOnly]
}, async (request, reply) => {
  const metrics = await metricsService.getMetricsSummary();
  return reply.send({ success: true, metrics });
});
```

## 3. Alerts Configuration

### Step 1: Create Alert Service
Create `apps/api/utils/alerts.js`:

```javascript
const logger = require('./logger');
const { sendEmail } = require('./emailService');

class AlertService {
  constructor() {
    this.alertThresholds = {
      uploadFailureRate: 10, // Alert if >10% failures
      storageUsage: 90, // Alert if >90% quota used
      downloadErrors: 50, // Alert if >50 download errors/hour
      virusDetections: 1, // Alert on any virus
    };
  }

  /**
   * Send alert via multiple channels
   */
  async sendAlert(alert) {
    const { level, title, message, context } = alert;

    logger.error(`🚨 ALERT [${level}]: ${title}`, context);

    // 1. Send to Sentry
    const Sentry = require('@sentry/node');
    Sentry.captureMessage(title, {
      level: level === 'critical' ? 'error' : 'warning',
      tags: { alert_type: alert.type },
      extra: context
    });

    // 2. Send email to admins
    if (level === 'critical') {
      await this.sendEmailAlert(title, message, context);
    }

    // 3. Send to Slack
    await this.sendSlackAlert(title, message, level);

    // 4. Log to monitoring service
    await this.logToMonitoring(alert);
  }

  async sendEmailAlert(title, message, context) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    try {
      await sendEmail({
        to: adminEmail,
        subject: `🚨 [${process.env.NODE_ENV}] ${title}`,
        html: `
          <h2>${title}</h2>
          <p>${message}</p>
          <h3>Context:</h3>
          <pre>${JSON.stringify(context, null, 2)}</pre>
        `
      });
    } catch (error) {
      logger.error('Failed to send email alert:', error);
    }
  }

  async sendSlackAlert(title, message, level) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const emoji = level === 'critical' ? '🚨' : '⚠️';
    const color = level === 'critical' ? '#ff0000' : '#ffaa00';

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emoji} ${title}`,
          attachments: [{
            color,
            text: message,
            fields: [
              { title: 'Environment', value: process.env.NODE_ENV, short: true },
              { title: 'Level', value: level, short: true }
            ]
          }]
        })
      });
    } catch (error) {
      logger.error('Failed to send Slack alert:', error);
    }
  }

  async logToMonitoring(alert) {
    // Send to DataDog, New Relic, etc.
    // Implementation depends on your monitoring service
  }

  /**
   * Check upload failure rate and alert if threshold exceeded
   */
  async checkUploadFailureRate(metrics) {
    const total = metrics.uploads.success + metrics.uploads.failed;
    if (total === 0) return;

    const failureRate = (metrics.uploads.failed / total) * 100;

    if (failureRate > this.alertThresholds.uploadFailureRate) {
      await this.sendAlert({
        level: 'warning',
        type: 'upload_failures',
        title: 'High Upload Failure Rate',
        message: `Upload failure rate is ${failureRate.toFixed(1)}% (threshold: ${this.alertThresholds.uploadFailureRate}%)`,
        context: {
          successCount: metrics.uploads.success,
          failureCount: metrics.uploads.failed,
          failureRate: `${failureRate.toFixed(1)}%`
        }
      });
    }
  }

  /**
   * Check storage quota usage
   */
  async checkStorageQuota(userId) {
    const quota = await prisma.storageQuota.findUnique({
      where: { userId }
    });

    if (!quota) return;

    const usagePercent = (Number(quota.usedBytes) / Number(quota.limitBytes)) * 100;

    if (usagePercent > this.alertThresholds.storageUsage) {
      await this.sendAlert({
        level: 'warning',
        type: 'storage_quota',
        title: 'Storage Quota Near Limit',
        message: `User ${userId} is at ${usagePercent.toFixed(1)}% storage capacity`,
        context: {
          userId,
          usedGB: (Number(quota.usedBytes) / (1024 ** 3)).toFixed(2),
          limitGB: (Number(quota.limitBytes) / (1024 ** 3)).toFixed(2),
          usagePercent: `${usagePercent.toFixed(1)}%`
        }
      });
    }
  }

  /**
   * Alert on virus detection
   */
  async alertVirusDetected(userId, fileName, viruses) {
    await this.sendAlert({
      level: 'critical',
      type: 'virus_detected',
      title: '🦠 VIRUS DETECTED IN UPLOAD',
      message: `Malware detected in file upload`,
      context: {
        userId,
        fileName,
        viruses,
        timestamp: new Date().toISOString()
      }
    });
  }
}

const alertService = new AlertService();

module.exports = alertService;
```

### Step 2: Integrate Alerts
```javascript
// In virus scanner
if (!scanResult.safe) {
  await alertService.alertVirusDetected(userId, fileName, scanResult.viruses);
}

// In upload route
try {
  // upload...
} catch (error) {
  await metricsService.trackUpload(false, fileSize, error);
  await alertService.checkUploadFailureRate(
    await metricsService.getMetricsSummary()
  );
}

// In quota check
if (quota.usedBytes + newFileSize > quota.limitBytes) {
  await alertService.checkStorageQuota(userId);
}
```

## 4. Health Check Endpoint

Create `apps/api/routes/health.routes.js`:

```javascript
async function healthRoutes(fastify) {
  fastify.get('/health', async (request, reply) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {}
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Check storage
    try {
      const storageType = storageHandler.getStorageType();
      health.checks.storage = storageHandler.isSupabase() ? 'healthy' : 'degraded';
    } catch (error) {
      health.checks.storage = 'unhealthy';
      health.status = 'degraded';
    }

    // Check Redis (if used)
    if (process.env.REDIS_URL) {
      try {
        await redis.ping();
        health.checks.redis = 'healthy';
      } catch (error) {
        health.checks.redis = 'unhealthy';
      }
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return reply.status(statusCode).send(health);
  });

  // Readiness check (for Kubernetes)
  fastify.get('/ready', async (request, reply) => {
    return reply.send({ ready: true });
  });

  // Liveness check (for Kubernetes)
  fastify.get('/live', async (request, reply) => {
    return reply.send({ alive: true });
  });
}

module.exports = healthRoutes;
```

## 5. Dashboard Setup (Optional)

Use Grafana + Prometheus for visualization:

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 6. Environment Variables

Add to `.env`:
```env
# Sentry
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production

# Alerts
ADMIN_EMAIL=admin@yourdomain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Monitoring
NEW_RELIC_LICENSE_KEY=your-key-here
DATADOG_API_KEY=your-key-here
```

## 7. Cost Estimate

- **Sentry:** $26/month (Team plan)
- **DataDog:** Free tier → $15-31/month
- **Slack:** Free
- **Email alerts:** Free (using existing SMTP)
- **Total: $26-57/month**

## Implementation Time
- Sentry setup: 2 hours
- Custom metrics: 3 hours
- Alerts: 2 hours
- Testing: 1 hour
- **Total: 8 hours**
