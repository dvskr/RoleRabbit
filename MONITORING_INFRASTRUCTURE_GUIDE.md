# RoleRabbit Monitoring & Infrastructure Guide

## Overview

Complete monitoring and infrastructure setup for the RoleRabbit Templates system, providing comprehensive observability, alerting, logging, and uptime monitoring.

**Stack Components:**
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: OpenTelemetry + Jaeger
- **Alerting**: Prometheus AlertManager
- **Uptime**: Custom Monitor + Blackbox Exporter
- **Offline Support**: Service Workers (PWA)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prometheus & AlertManager](#prometheus--alertmanager)
3. [Grafana Dashboards](#grafana-dashboards)
4. [ELK Stack (Logging)](#elk-stack-logging)
5. [Distributed Tracing](#distributed-tracing)
6. [Uptime Monitoring](#uptime-monitoring)
7. [Usage Analytics Dashboard](#usage-analytics-dashboard)
8. [Offline Support (PWA)](#offline-support-pwa)
9. [Rollback Plan](#rollback-plan)

---

## Quick Start

### Deploy Entire Monitoring Stack

```bash
# 1. Set environment variables
cp .env.example .env
nano .env  # Configure passwords and endpoints

# 2. Start monitoring stack
cd monitoring
docker-compose up -d

# 3. Verify services
docker-compose ps

# 4. Access dashboards
# - Grafana: http://localhost:3000 (admin/admin)
# - Prometheus: http://localhost:9090
# - Kibana: http://localhost:5601
# - Jaeger UI: http://localhost:16686
# - AlertManager: http://localhost:9093
# - Uptime Kuma: http://localhost:3001
```

### Verify Monitoring

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health'

# Check Grafana datasource
curl -u admin:admin http://localhost:3000/api/datasources

# Check Elasticsearch
curl -u elastic:changeme http://localhost:9200/_cluster/health

# Check Jaeger
curl http://localhost:16686/api/services
```

---

## Prometheus & AlertManager

### Prometheus Configuration

**Location**: `monitoring/prometheus/prometheus.yml`

**Key Features:**
- 15-second scrape interval
- 30-day metric retention
- Auto-discovery for Kubernetes pods
- Remote write for long-term storage

**Monitored Services:**
- RoleRabbit API (port 3000)
- RoleRabbit Web (port 3001)
- PostgreSQL (via exporter)
- Redis (via exporter)
- Nginx (via exporter)
- System metrics (Node Exporter)
- Container metrics (cAdvisor)

### Alert Rules

**Location**: `monitoring/prometheus/alerts.yml`

**Alert Categories:**

1. **Application Health** (14 alerts)
   - High error rate
   - API latency high
   - Service down
   - High memory/CPU usage
   - Disk space low

2. **Template Operations** (4 alerts)
   - Upload failure rate
   - Export queue backlog
   - Approval workflow stalled
   - Search performance degraded

3. **Database** (4 alerts)
   - Connection pool exhausted
   - Slow queries
   - Replication lag
   - Disk usage high

4. **Redis Cache** (4 alerts)
   - Low cache hit rate
   - High memory usage
   - High connection count
   - Redis down

5. **WebSocket** (3 alerts)
   - High connection count
   - Message backlog
   - High disconnect rate

6. **Business Metrics** (4 alerts)
   - Download rate drop
   - Low signups
   - Payment failures
   - High churn rate

7. **Security** (3 alerts)
   - Unauthorized access attempts
   - Suspicious activity
   - Rate limit exceeded

### AlertManager Configuration

**Location**: `monitoring/prometheus/alertmanager.yml`

**Notification Channels:**
- **Critical alerts**: PagerDuty + Slack
- **Warnings**: Slack only
- **Security alerts**: Email + Slack
- **Payment alerts**: PagerDuty + Slack + Email

**Inhibition Rules:**
- Suppress warnings when critical alert active
- Suppress downstream alerts when service down

**Example Alert Routing:**

```yaml
# Critical alerts -> PagerDuty
- match:
    severity: critical
  receiver: 'pagerduty-critical'
  repeat_interval: 30m

# Backend team alerts -> #team-backend-alerts
- match:
    team: backend
  receiver: 'slack-backend'
```

### Custom Metrics

Add custom metrics to your application:

```javascript
const promClient = require('prom-client');

// Counter
const templateDownloads = new promClient.Counter({
  name: 'template_downloads_total',
  help: 'Total template downloads',
  labelNames: ['template_id', 'category'],
});

templateDownloads.inc({ template_id: 'tpl_123', category: 'ATS' });

// Histogram
const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

requestDuration.observe({ method: 'GET', route: '/api/templates', status: 200 }, 0.234);
```

---

## Grafana Dashboards

### Pre-built Dashboards

**Location**: `monitoring/grafana/dashboards/`

1. **Application Overview** (`application-overview.json`)
   - Request rate, error rate, latency
   - Template operations (views, downloads, favorites)
   - Cache performance
   - Database metrics
   - WebSocket connections

**Access**: http://localhost:3000/d/application-overview

### Create Custom Dashboard

```bash
# 1. Create dashboard in Grafana UI
# 2. Export JSON
curl -u admin:admin http://localhost:3000/api/dashboards/uid/your-dashboard | jq '.dashboard' > custom-dashboard.json

# 3. Add to version control
cp custom-dashboard.json monitoring/grafana/dashboards/

# 4. Provision automatically on startup
# (Already configured in docker-compose.yml)
```

### Key Metrics to Monitor

**Golden Signals:**
- **Latency**: P50, P95, P99 response times
- **Traffic**: Requests per second
- **Errors**: Error rate percentage
- **Saturation**: CPU, memory, disk usage

**Business Metrics:**
- Template views/downloads
- User signups
- Subscription conversions
- Payment success rate
- Active users

---

## ELK Stack (Logging)

### Architecture

```
Application Logs → Filebeat → Logstash → Elasticsearch → Kibana
                                    ↓
                            Structured Indexes
```

### Logstash Pipeline

**Location**: `monitoring/elk/logstash/logstash.conf`

**Processing Steps:**
1. Parse JSON logs
2. Extract log levels
3. Parse timestamps
4. Grok parsing for structured data
5. Extract error stack traces
6. GeoIP lookup for client IPs
7. Security event detection
8. Remove sensitive data

**Output Indexes:**
- `rolerabbit-logs-YYYY.MM.DD` - All logs
- `rolerabbit-errors-YYYY.MM.DD` - Error logs only
- `rolerabbit-security-YYYY.MM.DD` - Security events
- `rolerabbit-performance-YYYY.MM.DD` - Slow requests

### Filebeat Configuration

**Location**: `monitoring/elk/filebeat/filebeat.yml`

**Log Sources:**
- Application logs (`/var/log/rolerabbit/*.log`)
- Nginx access/error logs
- PostgreSQL logs
- Redis logs
- Docker container logs
- System logs

**Processors:**
- Add host metadata
- Add cloud metadata
- Add Docker metadata
- Drop debug logs in production
- Remove sensitive fields

### Kibana Queries

**Access**: http://localhost:5601

**Common Queries:**

```
# All errors in last hour
level: ERROR AND @timestamp:[now-1h TO now]

# Slow API requests
response_time > 1000 AND path: "/api/*"

# Failed authentication attempts
status: 401 OR status: 403

# Template download events
event_type: "template_download"

# User-specific logs
user_id: "usr_123"

# Security alerts
tags: "security_alert"
```

### Log Retention

- **Hot data**: 7 days (fast SSD)
- **Warm data**: 30 days (standard storage)
- **Cold data**: 90 days (archive storage)
- **Deletion**: After 90 days

---

## Distributed Tracing

### OpenTelemetry Setup

**Location**: `apps/api/instrumentation/opentelemetry.js`

**Auto-Instrumentation:**
- HTTP requests
- Express middleware
- PostgreSQL queries
- Redis operations
- DNS lookups

### Usage in Application

```javascript
const { traceFunction, traceQuery, traceCache } = require('./instrumentation/opentelemetry');

// Trace function execution
await traceFunction('processTemplate', async () => {
  // Your code here
}, { template_id: 'tpl_123' });

// Trace database query
await traceQuery('SELECT', query, params);

// Trace cache operation
await traceCache('GET', cacheKey, async () => {
  return await redis.get(cacheKey);
});
```

### Jaeger UI

**Access**: http://localhost:16686

**Features:**
- Trace search by service, operation, tags
- Trace timeline visualization
- Service dependency graph
- Performance analysis
- Error tracking

**Example Traces:**
- Full request flow: Client → API → Database → Cache
- Template download flow
- Authentication flow
- Payment processing flow

---

## Uptime Monitoring

### Custom Uptime Monitor

**Location**: `monitoring/uptime/uptime-monitor.js`

**Monitored Endpoints:**
- Web Application (https://rolerabbit.com)
- API Health (https://api.rolerabbit.com/health)
- API Templates Endpoint
- Database Connection
- Redis Connection
- WebSocket Service
- S3 Storage
- Email Service

**Features:**
- HTTP/HTTPS monitoring
- WebSocket monitoring
- Database connectivity checks
- Custom health checks
- Response time tracking
- Uptime percentage calculation
- Alert on consecutive failures

### Start Uptime Monitor

```bash
# As standalone service
node monitoring/uptime/uptime-monitor.js

# OR as part of application
const { startMonitoring } = require('./monitoring/uptime/uptime-monitor');
startMonitoring();
```

### Uptime API

```javascript
const { getSystemStatus, getUptimeStats } = require('./uptime-monitor');

// Get overall system status
const status = getSystemStatus();
console.log(status.status); // 'healthy', 'degraded', or 'critical'

// Get specific service stats
const apiStats = getUptimeStats('API Health');
console.log(`Uptime: ${apiStats.uptime}%`);
console.log(`Avg response time: ${apiStats.avgResponseTime}ms`);
```

### Blackbox Exporter

Prometheus-integrated uptime monitoring via HTTP probes:

```yaml
# prometheus.yml
- job_name: 'blackbox'
  metrics_path: /probe
  params:
    module: [http_2xx]
  static_configs:
    - targets:
        - https://rolerabbit.com
        - https://api.rolerabbit.com/health
```

---

## Usage Analytics Dashboard

### Frontend Dashboard

**Location**: `apps/web/src/components/analytics/UsageAnalyticsDashboard.tsx`

**Features:**
- Real-time metrics (auto-refresh every 30s)
- Time range selector (24h, 7d, 30d, 90d)
- Interactive charts (views, downloads, revenue)
- Top templates table
- Category distribution (pie chart)
- User activity by hour
- Conversion funnel visualization

**Access**: http://localhost:3001/analytics

### Backend Analytics API

```javascript
// apps/api/routes/analytics.js
app.get('/api/analytics/usage', async (req, res) => {
  const { range = '7d' } = req.query;

  const data = {
    overview: {
      totalUsers: await getUserCount(),
      activeUsers: await getActiveUserCount(),
      totalTemplates: await getTemplateCount(),
      totalDownloads: await getDownloadCount(),
      avgRating: await getAverageRating(),
      revenue: await getRevenue(range),
    },
    timeSeries: await getTimeSeries(range),
    topTemplates: await getTopTemplates(10),
    categoryDistribution: await getCategoryDistribution(),
    userActivity: await getUserActivityByHour(),
    conversionFunnel: await getConversionFunnel(),
  };

  res.json(data);
});
```

### Metrics Tracked

**User Metrics:**
- Total users
- Active users (last 30 days)
- New signups
- User retention rate

**Template Metrics:**
- Total templates
- Templates by category
- Views per template
- Downloads per template
- Average rating
- Conversion rate (views → downloads)

**Business Metrics:**
- Revenue (total, by period)
- Subscription conversions
- Payment success rate
- Churn rate

---

## Offline Support (PWA)

### Service Worker

**Location**: `apps/web/public/service-worker.js`

**Caching Strategies:**

1. **Cache First** (static assets)
   - Images: 30-day cache
   - Fonts: 1-year cache
   - Applies to: PNG, JPG, WOFF, WOFF2

2. **Network First** (dynamic content)
   - Template details
   - User data
   - Falls back to cache on network failure

3. **Stale While Revalidate** (semi-static)
   - Template lists
   - CSS/JS files
   - Serves cache immediately, updates in background

**Offline Features:**
- Offline page when network unavailable
- Cached template browsing
- Offline placeholder images
- Push notifications support

### Register Service Worker

```javascript
// pages/_app.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

### PWA Manifest

```json
// public/manifest.json
{
  "name": "RoleRabbit Templates",
  "short_name": "RoleRabbit",
  "description": "Professional resume templates",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Test Offline Functionality

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Reload page
4. Verify offline page appears
5. Navigate to cached pages
6. Verify cached content loads

---

## Rollback Plan

**Location**: `ROLLBACK_PLAN.md`

### Quick Rollback

```bash
# Emergency one-command rollback
./scripts/emergency-rollback.sh --version v2.0.5

# Kubernetes rollback
kubectl rollout undo deployment/rolerabbit-api

# Verify rollback
./scripts/verify-rollback.sh
```

### Rollback Scenarios

1. **Application Rollback** (~13 minutes)
   - Stop traffic
   - Rollback deployment
   - Verify health
   - Restore traffic

2. **Database Rollback** (variable time)
   - Rollback migrations
   - OR restore from backup
   - OR point-in-time recovery

3. **Service-Specific Rollback**
   - API, Web, WebSocket, Workers

### Rollback Testing

Monthly rollback drill schedule:
- First Friday of each month
- 2:00 PM EST
- Staging environment
- Document results

---

## Monitoring Checklist

### Daily

- [ ] Check Grafana dashboards for anomalies
- [ ] Review AlertManager alerts
- [ ] Check error rates in Kibana
- [ ] Verify all services are healthy
- [ ] Review uptime statistics

### Weekly

- [ ] Review slow query logs
- [ ] Analyze cache hit rates
- [ ] Review top templates metrics
- [ ] Check disk space utilization
- [ ] Review security alerts

### Monthly

- [ ] Perform rollback drill
- [ ] Review and update alerts
- [ ] Analyze long-term trends
- [ ] Update monitoring documentation
- [ ] Review SLO/SLA compliance

---

## Troubleshooting

### Prometheus Not Scraping Targets

```bash
# Check target configuration
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# Check application metrics endpoint
curl http://api:3000/metrics

# Verify network connectivity
docker exec prometheus ping api
```

### Grafana Dashboard Not Loading

```bash
# Check Grafana logs
docker logs grafana

# Verify datasource connection
curl -u admin:admin http://localhost:3000/api/datasources/1/health

# Restart Grafana
docker-compose restart grafana
```

### Elasticsearch Not Indexing

```bash
# Check cluster health
curl -u elastic:changeme http://localhost:9200/_cluster/health

# Check index status
curl -u elastic:changeme http://localhost:9200/_cat/indices?v

# Check Logstash logs
docker logs logstash

# Verify Filebeat is shipping
docker logs filebeat
```

### Jaeger Not Receiving Traces

```bash
# Check Jaeger health
curl http://localhost:14269/health

# Verify application is instrumented
grep -r "OpenTelemetry" apps/api/

# Check OTLP endpoint
curl http://localhost:4318/v1/traces

# Restart Jaeger
docker-compose restart jaeger
```

---

## Performance Tuning

### Prometheus

```yaml
# Increase retention
--storage.tsdb.retention.time=90d

# Reduce scrape interval for less critical targets
scrape_interval: 30s

# Enable remote write for long-term storage
remote_write:
  - url: https://prometheus-remote-storage.example.com
```

### Elasticsearch

```bash
# Increase heap size
ES_JAVA_OPTS="-Xms2g -Xmx2g"

# Enable index lifecycle management
PUT _ilm/policy/rolerabbit-policy
{
  "policy": {
    "phases": {
      "hot": { "actions": { "rollover": { "max_size": "50GB" } } },
      "warm": { "min_age": "7d", "actions": { "shrink": { "number_of_shards": 1 } } },
      "delete": { "min_age": "90d", "actions": { "delete": {} } }
    }
  }
}
```

### Grafana

```ini
# grafana.ini
[database]
# Use PostgreSQL for better performance
type = postgres

[dashboards]
# Enable dashboard caching
min_refresh_interval = 10s
```

---

## Security Best Practices

1. **Change Default Passwords**
   ```bash
   # Update .env file
   GRAFANA_ADMIN_PASSWORD=<strong-password>
   ELASTICSEARCH_PASSWORD=<strong-password>
   ```

2. **Enable Authentication**
   - Prometheus: Use reverse proxy with auth
   - Grafana: Enable OAuth/LDAP
   - Kibana: Configure authentication

3. **Network Security**
   - Use internal networks for monitoring stack
   - Expose only necessary ports
   - Use TLS for external access

4. **Access Control**
   - Implement role-based access
   - Limit admin access
   - Audit access logs

---

## Cost Optimization

### Storage

- Reduce Prometheus retention to 15 days
- Use remote write to cheaper long-term storage
- Implement Elasticsearch ILM policies
- Compress old logs

### Resources

- Right-size container resources
- Use spot instances for non-critical monitoring
- Scale down in non-peak hours
- Use log sampling for high-volume endpoints

### Monitoring

- Monitor monitoring costs!
- Set up billing alerts
- Review unused dashboards/alerts
- Optimize metric cardinality

---

## Support & Resources

**Documentation:**
- Prometheus: https://prometheus.io/docs
- Grafana: https://grafana.com/docs
- ELK: https://www.elastic.co/guide
- Jaeger: https://www.jaegertracing.io/docs

**Community:**
- #monitoring Slack channel
- Weekly monitoring review meetings
- Runbooks: https://docs.rolerabbit.com/runbooks

**On-Call:**
- Primary: SRE Team
- Escalation: Backend Team Lead
- Emergency: See ROLLBACK_PLAN.md

---

**Last Updated**: November 14, 2024
**Next Review**: December 14, 2024
**Maintained By**: SRE Team
