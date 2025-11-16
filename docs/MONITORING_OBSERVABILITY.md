# Monitoring & Observability Guide

Comprehensive guide for monitoring RoleRabbit infrastructure (Sections 4.5-4.6)

## Table of Contents

- [Overview](#overview)
- [Scaling Configuration](#scaling-configuration)
- [Metrics Collection](#metrics-collection)
- [Logging](#logging)
- [Error Tracking](#error-tracking)
- [Health Checks](#health-checks)
- [Alerting](#alerting)
- [Dashboards](#dashboards)
- [On-Call](#on-call)
- [Troubleshooting](#troubleshooting)

## Overview

RoleRabbit uses a comprehensive observability stack:

- **Metrics**: Prometheus + Grafana
- **Logging**: Winston (JSON structured logs)
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Health check endpoints
- **Alerting**: Prometheus Alertmanager + PagerDuty/Slack

## Scaling Configuration

### Horizontal Scaling

#### API Servers

Minimum 2 instances behind load balancer:

```yaml
# Kubernetes HPA Configuration
minReplicas: 2
maxReplicas: 10
metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Scale up when >70%
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Auto-scaling Behavior**:
- Scale up when CPU >70% for 5 minutes
- Scale down when CPU <30% for 15 minutes
- Maximum 50% increase per minute
- Maximum 25% decrease per minute

#### Background Workers

Separately scalable from API servers:

```yaml
# Deployment Workers
minReplicas: 2
maxReplicas: 8
averageCPUUtilization: 75%

# PDF Workers
minReplicas: 1
maxReplicas: 5
averageCPUUtilization: 80%
```

### Load Balancer Configuration

Nginx with sticky sessions and health checks:

```nginx
upstream api_backend {
    least_conn;  # Load balancing algorithm

    server api-1:3000 max_fails=3 fail_timeout=30s;
    server api-2:3000 max_fails=3 fail_timeout=30s;

    ip_hash;  # Sticky sessions
    keepalive 32;
}
```

### Database Connection Pooling

Connection pool limits for scaled instances:

```bash
# Per instance
DB_POOL_MIN=5
DB_POOL_MAX=25

# Total calculation
Total Max Connections = Instances × Pool Size
Example: 4 instances × 25 = 100 connections
```

**Ensure database max_connections > total pool size**:

```sql
-- Check PostgreSQL max connections
SHOW max_connections;

-- Recommended: Set to at least 150 for production
ALTER SYSTEM SET max_connections = 150;
```

### Session Management

Use Redis for session storage (required for multi-instance):

```typescript
// next-auth configuration
import { RedisAdapter } from '@next-auth/redis-adapter';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

export const authOptions = {
  adapter: RedisAdapter(redis),
  session: {
    strategy: 'database',  // Store in Redis, not in-memory
  },
};
```

## Metrics Collection

### Prometheus Metrics

#### Portfolio Metrics

```typescript
import { metrics } from '../lib/monitoring/metrics';

// Record portfolio creation
metrics.recordPortfolioCreation('modern', 'free');

// Record portfolio view
metrics.recordPortfolioView(portfolioId, subdomain);

// Record deployment
metrics.recordPortfolioDeployment('success', 'modern');
metrics.recordPortfolioBuildDuration(42.5, 'modern', 'success');
```

#### API Metrics

```typescript
// Record HTTP request (use middleware)
export function metricsMiddleware(req, res, next) {
  const startTime = Date.now();

  metrics.incrementInFlightRequests();

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;

    metrics.recordHttpRequest(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      duration
    );

    metrics.decrementInFlightRequests();
  });

  next();
}
```

#### Queue Metrics

```typescript
// In worker processor
const startTime = Date.now();

try {
  await processJob(job);
  const duration = (Date.now() - startTime) / 1000;

  metrics.recordQueueJobCompletion('deployment', 'deploy-portfolio', duration);
} catch (error) {
  metrics.recordQueueJobFailure('deployment', 'deploy-portfolio', 'build_error');
}
```

### Available Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `rolerabbit_portfolio_creations_total` | Counter | Total portfolios created |
| `rolerabbit_portfolio_deployments_total` | Counter | Total deployments |
| `rolerabbit_portfolio_build_duration_seconds` | Histogram | Build duration |
| `rolerabbit_portfolio_views_total` | Counter | Total portfolio views |
| `rolerabbit_http_requests_total` | Counter | HTTP requests |
| `rolerabbit_http_request_duration_seconds` | Histogram | Request duration |
| `rolerabbit_database_connections_active` | Gauge | Active DB connections |
| `rolerabbit_queue_jobs_waiting` | Gauge | Jobs in queue |
| `rolerabbit_deployment_queue_length` | Gauge | Deployment backlog |
| `rolerabbit_errors_total` | Counter | Application errors |

### Scraping Configuration

Prometheus scrapes metrics every 30 seconds:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'rolerabbit-api'
    static_configs:
      - targets: ['api-1:3000', 'api-2:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

## Logging

### Structured JSON Logging

All logs use JSON format with standard fields:

```typescript
import { logger, setRequestContext } from '../lib/monitoring/logger';

// Set request context (automatically added to all logs)
setRequestContext({
  correlationId: generateCorrelationId(),
  userId: user.id,
  requestId: req.id,
});

// Log with context
logger.info('Portfolio created', {
  portfolioId,
  template: 'modern',
  duration: 1.2,
});

// Log errors
logger.error('Deployment failed', error, {
  portfolioId,
  deploymentId,
});
```

### Log Format

```json
{
  "timestamp": "2025-01-15 10:30:45.123",
  "level": "info",
  "message": "Portfolio created",
  "service": "rolerabbit",
  "environment": "production",
  "correlationId": "1705315845123-abc123",
  "userId": "user_123",
  "portfolioId": "portfolio_456",
  "template": "modern",
  "duration": 1.2
}
```

### Log Levels

- `error`: Errors requiring attention
- `warn`: Warning conditions
- `info`: General informational messages
- `http`: HTTP request logs
- `debug`: Detailed debugging information

### Log Aggregation

#### Option A: ELK Stack

```bash
# Install Filebeat to ship logs to Elasticsearch
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/rolerabbit/*.log
    json.keys_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "rolerabbit-logs-%{+yyyy.MM.dd}"
```

#### Option B: CloudWatch Logs

```bash
# Install CloudWatch agent
sudo yum install amazon-cloudwatch-agent

# Configure log groups
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/rolerabbit/combined.log",
            "log_group_name": "/rolerabbit/api",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

#### Option C: Loki (with Grafana)

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: rolerabbit
    static_configs:
      - targets:
          - localhost
        labels:
          job: rolerabbit
          __path__: /var/log/rolerabbit/*.log
```

## Error Tracking

### Sentry Integration

#### Initialization

```typescript
// Auto-initialized if SENTRY_DSN is set
import { sentry } from '../lib/monitoring/sentry';

// Manual initialization
sentry.initialize({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

#### Capturing Errors

```typescript
// Set user context
sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Capture exception
try {
  await deployPortfolio(portfolioId);
} catch (error) {
  sentry.captureDeploymentError(
    error,
    portfolioId,
    deploymentId,
    'modern'
  );
  throw error;
}

// Add breadcrumbs
sentry.addBreadcrumb('Starting deployment', 'deployment', 'info', {
  portfolioId,
  template: 'modern',
});
```

#### Error Filtering

Sentry automatically filters:
- Development environment errors
- Bot/crawler errors
- Sensitive data (passwords, tokens, etc.)

#### Sentry Dashboard

Access at: https://sentry.io/organizations/rolerabbit/issues/

**Key Features**:
- Error grouping by fingerprint
- Stack traces with source maps
- User context and breadcrumbs
- Release tracking
- Performance monitoring

## Health Checks

### Basic Health Check

```bash
# Load balancer health check
curl http://localhost:3000/api/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:45.123Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

### Readiness Check

```bash
# Kubernetes readiness probe
curl http://localhost:3000/api/health/ready

# Response
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "pass",
      "responseTime": 42
    },
    "redis": {
      "status": "pass",
      "responseTime": 15
    },
    "memory": {
      "status": "pass",
      "details": {
        "heapUsedMB": 256,
        "heapTotalMB": 512,
        "heapUsagePercent": 50
      }
    },
    "cpu": {
      "status": "pass",
      "details": {
        "cpus": 4,
        "userCPU": 1.23,
        "systemCPU": 0.45
      }
    }
  },
  "timestamp": "2025-01-15T10:30:45.123Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Uptime Monitoring

#### UptimeRobot Configuration

```
Monitor Type: HTTP(s)
Friendly Name: RoleRabbit API
URL: https://api.rolerabbit.com/api/health
Monitoring Interval: 5 minutes
Alert Contacts: Email, SMS, Slack
```

#### Pingdom Configuration

```
Check Name: RoleRabbit API Health
Check Type: HTTP
URL: https://api.rolerabbit.com/api/health
Check Interval: 5 minutes
Alert Threshold: Down for 5 minutes
Notifications: Email, SMS, PagerDuty
```

### Synthetic Monitoring

End-to-end portfolio creation test:

```typescript
// scripts/synthetic-test.ts
import { test, expect } from '@playwright/test';

test('portfolio creation flow', async ({ page }) => {
  // Login
  await page.goto('https://rolerabbit.com/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('[type=submit]');

  // Create portfolio
  await page.goto('https://rolerabbit.com/portfolios/new');
  await page.fill('[name=name]', 'Test Portfolio');
  await page.selectOption('[name=template]', 'modern');
  await page.click('[data-testid=create-button]');

  // Wait for deployment
  await page.waitForSelector('[data-testid=deployment-complete]', {
    timeout: 60000,
  });

  // Verify deployment
  const deployedUrl = await page.textContent('[data-testid=deployed-url]');
  expect(deployedUrl).toBeTruthy();

  // Visit deployed portfolio
  await page.goto(deployedUrl);
  await expect(page.locator('h1')).toContainText('Test Portfolio');
});
```

**Run with cron**:

```bash
# Run synthetic test every 15 minutes
*/15 * * * * cd /app && npm run synthetic-test && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/your-uuid
```

## Alerting

### Alert Rules

Configured in `infrastructure/prometheus/alerts.yml`:

| Alert | Condition | Threshold | Duration |
|-------|-----------|-----------|----------|
| HighDeploymentFailureRate | Deployment failures | >10% | 5min |
| HighAPIErrorRate | API 5xx errors | >5% | 5min |
| HighDatabaseConnections | DB connection pool | >80% | 5min |
| QueueStalled | No job completions | 0 jobs/5min | 10min |
| HighMemoryUsage | Memory usage | >90% | 5min |
| InstanceDown | Instance unavailable | - | 5min |

### Alert Routing

```yaml
# Critical alerts → PagerDuty
severity: critical
→ PagerDuty on-call

# Warning alerts → Slack
severity: warning
→ #alerts-warnings

# Component-specific
component: api → #alerts-api
component: deployment → #alerts-deployments
component: database → #alerts-database
component: queue → #alerts-queue
```

### Alert Response Times

| Severity | Response Time | Escalation |
|----------|--------------|------------|
| Critical | 15 minutes | Escalate to manager after 30min |
| Warning | 1 hour | Escalate to team after 4h |
| Info | Best effort | No escalation |

## Dashboards

### Grafana Dashboards

Access at: http://monitoring.rolerabbit.com:3001

#### 1. Portfolio Operations Dashboard

**Panels**:
- Portfolio creations (last 24h)
- Deployment success rate (%)
- Average build time (seconds)
- View count (last 7 days)
- Deployment queue length
- Failed deployments by template

**Query Examples**:

```promql
# Portfolio creations per hour
rate(rolerabbit_portfolio_creations_total[1h])

# Deployment success rate
(
  sum(rate(rolerabbit_deployment_success_total[5m])) /
  sum(rate(rolerabbit_portfolio_deployments_total[5m]))
) * 100

# 95th percentile build time
histogram_quantile(0.95,
  sum(rate(rolerabbit_portfolio_build_duration_seconds_bucket[5m])) by (le)
)

# Deployment queue length
rolerabbit_deployment_queue_length
```

#### 2. API Performance Dashboard

**Panels**:
- Request rate (req/s)
- 95th percentile response time
- Error rate (%)
- Requests in flight
- Top endpoints by traffic
- Slowest endpoints

**Query Examples**:

```promql
# Request rate
sum(rate(rolerabbit_http_requests_total[5m]))

# 95th percentile response time
histogram_quantile(0.95,
  sum(rate(rolerabbit_http_request_duration_seconds_bucket[5m])) by (le, route)
)

# Error rate
(
  sum(rate(rolerabbit_http_requests_total{status_code=~"5.."}[5m])) /
  sum(rate(rolerabbit_http_requests_total[5m]))
) * 100
```

#### 3. Infrastructure Dashboard

**Panels**:
- CPU usage per instance
- Memory usage per instance
- Database connections
- Redis memory usage
- Network I/O
- Disk usage

#### 4. Queue Dashboard

**Panels**:
- Jobs waiting per queue
- Job completion rate
- Job failure rate
- Average job duration
- Queue throughput

### Dashboard Setup

1. Import dashboard JSON from `infrastructure/grafana/dashboards/`
2. Configure Prometheus data source
3. Set refresh interval to 30s
4. Enable auto-refresh

## On-Call

### On-Call Rotation

**Schedule**: 24/7 coverage, 1-week rotations

**Responsibilities**:
- Monitor PagerDuty for critical alerts
- Respond within 15 minutes
- Escalate to manager if unable to resolve within 1 hour
- Document incidents in postmortem

### Escalation Policy

```
Level 1: On-call engineer (0-15 minutes)
Level 2: Senior engineer (15-30 minutes)
Level 3: Engineering manager (30-60 minutes)
Level 4: CTO (>60 minutes)
```

### Incident Response

1. **Acknowledge**: Acknowledge alert in PagerDuty within 5 minutes
2. **Assess**: Check dashboards, logs, and metrics
3. **Communicate**: Post in #incidents channel
4. **Mitigate**: Take action to restore service
5. **Resolve**: Mark incident as resolved
6. **Document**: Write postmortem within 48 hours

### Postmortem Template

```markdown
# Incident Postmortem: [Title]

**Date**: YYYY-MM-DD
**Duration**: X hours
**Severity**: Critical/High/Medium
**Impact**: X users affected, Y% error rate

## Timeline
- HH:MM - Incident started
- HH:MM - Alert fired
- HH:MM - On-call acknowledged
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Root Cause
[Detailed explanation]

## Resolution
[What was done to fix it]

## Action Items
- [ ] Item 1 (Owner: Name, Due: Date)
- [ ] Item 2 (Owner: Name, Due: Date)

## Lessons Learned
- What went well
- What could be improved
```

## Troubleshooting

### High Error Rate

```bash
# Check recent errors
curl http://localhost:3000/api/metrics | grep rolerabbit_errors_total

# Check Sentry for error details
# Go to: https://sentry.io

# Check logs
tail -f /var/log/rolerabbit/error.log | jq
```

### Slow Deployments

```bash
# Check deployment queue
curl http://localhost:3000/api/metrics | grep deployment_queue_length

# Check worker status
pm2 list

# Check worker logs
pm2 logs deployment-worker
```

### Database Connection Issues

```bash
# Check connection pool
curl http://localhost:3000/api/metrics | grep database_connections

# Check PostgreSQL connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
psql -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;"
```

### Memory Leaks

```bash
# Check memory usage
curl http://localhost:3000/api/health/ready | jq '.checks.memory'

# Take heap snapshot
kill -USR2 $(pgrep -f "node.*api")

# Analyze with Chrome DevTools
```

## Best Practices

1. **Metrics**: Instrument all critical paths
2. **Logging**: Use structured JSON with correlation IDs
3. **Alerts**: Set actionable thresholds, avoid alert fatigue
4. **Dashboards**: Keep focused, one purpose per dashboard
5. **On-Call**: Document everything, learn from incidents
6. **Testing**: Run synthetic tests to catch issues early
7. **Performance**: Monitor 95th percentile, not just averages

## Support

For monitoring issues:
- Slack: #monitoring
- Email: devops@rolerabbit.com
- PagerDuty: https://rolerabbit.pagerduty.com
