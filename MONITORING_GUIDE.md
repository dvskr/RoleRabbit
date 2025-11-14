# Monitoring & Logging Guide - RoleRabbit Templates Feature

## Overview

The Templates feature includes comprehensive monitoring, logging, and observability capabilities using:
- **Winston** - Structured logging with file transports
- **Prometheus** - Metrics collection and monitoring
- **Audit Logging** - Database-persisted audit trail
- **Request Tracking** - HTTP request/response logging with performance metrics

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Template API Request                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Template Logging Middleware                     │
│  - Request logging                                       │
│  - Performance tracking                                  │
│  - Error logging                                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Winston  │  │Prometheus│  │  Audit   │
│  Logger  │  │ Metrics  │  │   Log    │
└──────────┘  └──────────┘  └──────────┘
     │              │              │
     ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│   File   │  │  Metrics │  │ Database │
│  Logs    │  │ Endpoint │  │  Table   │
└──────────┘  └──────────┘  └──────────┘
```

---

## Logging System

### Winston Logger (`utils/logger.js`)

**Features:**
- Structured JSON logging
- Multiple transports (console, file)
- Color-coded output
- Configurable log levels

**Log Levels:**
- `error` (0) - Critical errors
- `warn` (1) - Warning messages
- `info` (2) - Informational messages
- `http` (3) - HTTP request logs
- `debug` (4) - Debug information

**Log Files:**
```
apps/api/logs/
├── error.log       # Error-level logs only
└── combined.log    # All log levels
```

**Usage:**
```javascript
const logger = require('./utils/logger');

logger.info('Template fetched successfully', { templateId: 'tpl_123' });
logger.error('Failed to create template', { error: err.message });
logger.http('GET /api/templates - 200');
logger.debug('Filter parameters', { category: 'ATS', difficulty: 'BEGINNER' });
```

**Environment Variables:**
```bash
LOG_LEVEL=info  # Set log level (error, warn, info, http, debug)
```

---

## Prometheus Metrics

### Available Metrics

#### Template Request Metrics

**`rolerabbit_template_requests_total` (Counter)**
- Description: Total template API requests
- Labels: `endpoint`, `method`, `status`
- Example: `rolerabbit_template_requests_total{endpoint="/api/templates",method="GET",status="200"} 1523`

**`rolerabbit_template_request_duration_seconds` (Histogram)**
- Description: Duration of template API requests
- Labels: `endpoint`, `method`
- Buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
- Example: `rolerabbit_template_request_duration_seconds_sum{endpoint="/api/templates/:id"} 12.45`

#### Template Usage Metrics

**`rolerabbit_template_usage_total` (Counter)**
- Description: Total template usage events by action
- Labels: `action`, `templateId`, `category`
- Actions: `PREVIEW`, `DOWNLOAD`, `USE`, `FAVORITE`, `SHARE`
- Example: `rolerabbit_template_usage_total{action="PREVIEW",templateId="tpl_abc",category="ATS"} 89`

**`rolerabbit_template_favorites_count` (Gauge)**
- Description: Current number of favorites per template
- Labels: `templateId`
- Example: `rolerabbit_template_favorites_count{templateId="tpl_abc"} 42`

#### Error Metrics

**`rolerabbit_template_errors_total` (Counter)**
- Description: Total template API errors
- Labels: `endpoint`, `error_type`
- Error types: `client_error` (4xx), `server_error` (5xx)
- Example: `rolerabbit_template_errors_total{endpoint="/api/templates/:id",error_type="client_error"} 15`

### Accessing Metrics

**Metrics Endpoint:**
```
GET /metrics
```

**Response Format:** Prometheus text format

**Example Output:**
```
# HELP rolerabbit_template_requests_total Total template API requests
# TYPE rolerabbit_template_requests_total counter
rolerabbit_template_requests_total{endpoint="/api/templates",method="GET",status="200"} 1523

# HELP rolerabbit_template_request_duration_seconds Duration of template API requests
# TYPE rolerabbit_template_request_duration_seconds histogram
rolerabbit_template_request_duration_seconds_bucket{endpoint="/api/templates",method="GET",le="0.1"} 1200
rolerabbit_template_request_duration_seconds_sum{endpoint="/api/templates",method="GET"} 78.5
```

### Grafana Dashboard Setup

**Prometheus Configuration (`prometheus.yml`):**
```yaml
scrape_configs:
  - job_name: 'rolerabbit-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

**Useful Queries:**

Request rate (requests per second):
```promql
rate(rolerabbit_template_requests_total[5m])
```

Average response time:
```promql
rate(rolerabbit_template_request_duration_seconds_sum[5m]) /
rate(rolerabbit_template_request_duration_seconds_count[5m])
```

Error rate:
```promql
rate(rolerabbit_template_errors_total[5m])
```

Most popular templates:
```promql
topk(10, rolerabbit_template_usage_total{action="PREVIEW"})
```

---

## Audit Logging

### Database Schema

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  resource   String?
  resourceId String?
  details    String?  // JSON
  ip         String?
  userAgent  String?
  createdAt  DateTime @default(now())
}
```

### Template Actions

```javascript
// User actions
TEMPLATE_CREATE
TEMPLATE_UPDATE
TEMPLATE_DELETE
TEMPLATE_VIEW
TEMPLATE_PREVIEW
TEMPLATE_DOWNLOAD
TEMPLATE_USE
TEMPLATE_FAVORITE_ADD
TEMPLATE_FAVORITE_REMOVE
TEMPLATE_SHARE
TEMPLATE_PREFERENCES_UPDATE
```

### Usage

```javascript
const { logAuditEvent, AuditActions } = require('./utils/auditLogger');

// Log template creation
await logAuditEvent({
  userId: 'user_123',
  action: AuditActions.TEMPLATE_CREATE,
  resource: 'TEMPLATE',
  resourceId: 'tpl_456',
  details: { name: 'Professional ATS Resume', category: 'ATS' },
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

### Querying Audit Logs

```javascript
const { getUserAuditLogs, getResourceAuditLogs } = require('./utils/auditLogger');

// Get all actions by a user
const userLogs = await getUserAuditLogs('user_123', 100);

// Get all actions on a template
const templateLogs = await getResourceAuditLogs('TEMPLATE', 'tpl_456', 100);
```

**SQL Query Example:**
```sql
SELECT * FROM "AuditLog"
WHERE "userId" = 'user_123'
  AND "action" LIKE 'TEMPLATE_%'
  AND "createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC
LIMIT 100;
```

---

## Template Monitoring Utilities

### Helper Functions

**Track Template Usage:**
```javascript
const { trackTemplateUsage } = require('./utils/templateMonitoring');

await trackTemplateUsage({
  userId: 'user_123',
  templateId: 'tpl_456',
  action: 'PREVIEW',
  category: 'ATS',
  metadata: { source: 'search', query: 'professional' },
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

**Track Favorites:**
```javascript
const { trackFavoriteAdd, trackFavoriteRemove, updateFavoritesGauge } = require('./utils/templateMonitoring');

// Add favorite
await trackFavoriteAdd({
  userId: 'user_123',
  templateId: 'tpl_456',
  ip: request.ip,
  userAgent: request.headers['user-agent']
});

// Update metrics
updateFavoritesGauge('tpl_456', 42);
```

**Track CRUD Operations:**
```javascript
const { trackTemplateOperation } = require('./utils/templateMonitoring');

await trackTemplateOperation({
  operation: 'create',  // 'create', 'update', or 'delete'
  userId: 'admin_123',
  templateId: 'tpl_456',
  changes: { name: 'New Template', difficulty: 'INTERMEDIATE' },
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

**Track Preferences:**
```javascript
const { trackPreferencesUpdate } = require('./utils/templateMonitoring');

await trackPreferencesUpdate({
  userId: 'user_123',
  preferences: { sortPreference: 'newest', viewMode: 'grid' },
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

**Get Request Context:**
```javascript
const { getRequestContext } = require('./utils/templateMonitoring');

const context = getRequestContext(request);
// Returns: { userId, ip, userAgent }
```

---

## Request Logging Middleware

### Setup

Add to template routes:
```javascript
const { templateLoggingMiddleware } = require('../middleware/templateLogging');

// Register middleware
fastify.addHook('onRequest', templateLoggingMiddleware);
```

### What It Logs

**Request Start:**
```
[Template API] GET /api/templates
{
  userId: 'user_123',
  query: { category: 'ATS', page: 1 },
  params: {}
}
```

**Request Success:**
```
[Template API] GET /api/templates - 200
{
  userId: 'user_123',
  duration: 0.085,
  status: 200
}
```

**Request Error:**
```
[Template API] POST /api/templates/:id/favorite - 404
{
  userId: 'user_123',
  duration: 0.042,
  status: 404,
  error: { message: 'Template not found' }
}
```

---

## Monitoring Best Practices

### 1. Alert Configuration

**High Error Rate:**
```yaml
alert: TemplateAPIHighErrorRate
expr: rate(rolerabbit_template_errors_total[5m]) > 0.05
for: 5m
labels:
  severity: warning
annotations:
  summary: Template API error rate above 5%
```

**Slow Requests:**
```yaml
alert: TemplateAPISlowRequests
expr: histogram_quantile(0.95, rate(rolerabbit_template_request_duration_seconds_bucket[5m])) > 1
for: 5m
labels:
  severity: warning
annotations:
  summary: 95th percentile response time above 1 second
```

### 2. Log Retention

**File Logs:**
- Keep error logs for 90 days
- Keep combined logs for 30 days
- Rotate logs daily

**Audit Logs:**
- Keep in database for 1 year
- Archive older logs to cold storage

### 3. Metrics Retention

**Prometheus:**
- Short-term: 15 days (1-minute resolution)
- Long-term: 1 year (1-hour resolution via recording rules)

### 4. Dashboard Panels

**Recommended Grafana Panels:**
1. Request Rate (time series)
2. Error Rate (time series)
3. Average Response Time (time series)
4. P95/P99 Response Time (time series)
5. Top Templates by Usage (table)
6. Error Breakdown by Endpoint (pie chart)
7. Active Users (counter)
8. Favorites Trend (time series)

---

## Troubleshooting

### High Memory Usage

Check log file sizes:
```bash
du -sh apps/api/logs/*
```

Rotate logs manually:
```bash
logrotate -f /etc/logrotate.d/rolerabbit
```

### Missing Metrics

Verify metrics endpoint:
```bash
curl http://localhost:8000/metrics
```

Check Prometheus scrape status:
```bash
curl http://localhost:9090/api/v1/targets
```

### Audit Log Growth

Check audit log count:
```sql
SELECT COUNT(*) FROM "AuditLog";
```

Archive old logs:
```sql
DELETE FROM "AuditLog" WHERE "createdAt" < NOW() - INTERVAL '365 days';
```

---

## Testing

### Run Monitoring Tests

```bash
# Template logging middleware tests
npm test -- templateLogging.test.js

# Template monitoring utilities tests
npm test -- templateMonitoring.test.js
```

### Manual Testing

**Test Logging:**
```bash
# Watch logs in real-time
tail -f apps/api/logs/combined.log
```

**Test Metrics:**
```bash
# Trigger some requests
curl http://localhost:8000/api/templates

# Check metrics
curl http://localhost:8000/metrics | grep template
```

**Test Audit Logs:**
```javascript
// In Prisma Studio or psql
SELECT * FROM "AuditLog"
WHERE "action" LIKE 'TEMPLATE_%'
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## Integration Examples

### Route Integration

```javascript
const { templateLoggingMiddleware } = require('../middleware/templateLogging');
const { trackTemplateUsage, getRequestContext } = require('../utils/templateMonitoring');

// Add middleware
fastify.addHook('onRequest', templateLoggingMiddleware);

// Use monitoring in route
fastify.post('/api/templates/:id/track', async (request, reply) => {
  const { id } = request.params;
  const { action, metadata } = request.body;
  const context = getRequestContext(request);

  // Track usage
  await trackTemplateUsage({
    ...context,
    templateId: id,
    action,
    metadata
  });

  return { success: true };
});
```

### Service Integration

```javascript
const { logTemplateInfo, logTemplateError } = require('../middleware/templateLogging');
const { trackFavoriteAdd, updateFavoritesGauge } = require('../utils/templateMonitoring');

async function addFavorite(userId, templateId) {
  try {
    logTemplateInfo('Adding favorite', { userId, templateId });

    const favorite = await prisma.userTemplateFavorite.create({
      data: { userId, templateId }
    });

    // Track and update metrics
    await trackFavoriteAdd({ userId, templateId });

    const count = await prisma.userTemplateFavorite.count({
      where: { templateId }
    });
    updateFavoritesGauge(templateId, count);

    return { success: true, data: favorite };
  } catch (error) {
    logTemplateError('Failed to add favorite', error, { userId, templateId });
    return { success: false, error: error.message };
  }
}
```

---

## Resources

### Internal Files
- `apps/api/utils/logger.js` - Winston logger
- `apps/api/utils/auditLogger.js` - Audit logging
- `apps/api/observability/metrics.js` - Prometheus metrics
- `apps/api/middleware/templateLogging.js` - Request logging middleware
- `apps/api/utils/templateMonitoring.js` - Monitoring utilities

### External Documentation
- [Winston](https://github.com/winstonjs/winston)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [prom-client](https://github.com/siimon/prom-client)

---

**Last Updated:** November 14, 2025
**Maintained By:** Development Team
