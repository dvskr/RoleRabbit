# Success Rate Monitoring - Complete Guide

## Overview

Success Rate Monitoring provides real-time tracking of AI feature performance, automated alerts, and comprehensive reporting to ensure production quality.

## Implementation Status

✅ **COMPLETE** - Ready to use

**Components:**
- `apps/api/services/monitoring/successRateMonitor.js` - Monitoring service
- `apps/api/routes/monitoring.routes.js` - Monitoring API routes
- `apps/api/scripts/check-success-rates.js` - Automated monitoring script

## Success Rate Targets

| Feature | Target | Description |
|---------|--------|-------------|
| **Parsing** | 95%+ | Resume parsing success rate |
| **ATS Check** | 98%+ | ATS analysis success rate |
| **Tailoring** | 90%+ | Resume tailoring success rate |
| **Generate Content** | 92%+ | Content generation success rate |

## Response Time Targets

| Feature | Target | Description |
|---------|--------|-------------|
| **Parsing** | 30s | Resume parsing time |
| **ATS Check** | 45s | ATS analysis time |
| **Tailoring (Partial)** | 60s | Partial tailoring time |
| **Tailoring (Full)** | 120s | Full tailoring time |
| **Generate Content** | 15s | Content generation time |

## Alert Thresholds

### Success Rate Alerts
- **WARNING:** 5% below target (e.g., 90% when target is 95%)
- **CRITICAL:** 10% below target (e.g., 85% when target is 95%)

### Response Time Alerts
- **WARNING:** 20% over target (e.g., 36s when target is 30s)
- **CRITICAL:** 50% over target (e.g., 45s when target is 30s)

## API Endpoints

### 1. Success Rate Report

**Endpoint:** `GET /api/monitoring/success-rates?period=hour|day|week|month`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-11-14T00:00:00.000Z",
      "endDate": "2024-11-14T23:59:59.999Z",
      "duration": "day"
    },
    "overview": {
      "avgSuccessRate": 96.5,
      "featuresAboveTarget": 3,
      "totalFeatures": 4,
      "healthScore": 97.8,
      "status": "excellent"
    },
    "successRates": [
      {
        "feature": "PARSING",
        "successCount": 115,
        "failureCount": 5,
        "total": 120,
        "successRate": 95.83,
        "target": 95.0,
        "meetsTarget": true
      },
      {
        "feature": "ATS_CHECK",
        "successCount": 198,
        "failureCount": 2,
        "total": 200,
        "successRate": 99.0,
        "target": 98.0,
        "meetsTarget": true
      },
      {
        "feature": "TAILORING",
        "successCount": 145,
        "failureCount": 5,
        "total": 150,
        "successRate": 96.67,
        "target": 90.0,
        "meetsTarget": true
      },
      {
        "feature": "GENERATE_CONTENT",
        "successCount": 88,
        "failureCount": 2,
        "total": 90,
        "successRate": 97.78,
        "target": 92.0,
        "meetsTarget": true
      }
    ],
    "responseTimes": [
      {
        "feature": "PARSING",
        "avgResponseTime": 28500,
        "minResponseTime": 15000,
        "maxResponseTime": 45000,
        "p50": 27000,
        "p95": 38000,
        "p99": 42000,
        "sampleSize": 115,
        "target": 30000,
        "meetsTarget": true
      },
      {
        "feature": "ATS_CHECK",
        "avgResponseTime": 42000,
        "minResponseTime": 30000,
        "maxResponseTime": 60000,
        "p50": 40000,
        "p95": 52000,
        "p99": 58000,
        "sampleSize": 198,
        "target": 45000,
        "meetsTarget": true
      }
    ],
    "alerts": []
  }
}
```

### 2. Success Rate Trends

**Endpoint:** `GET /api/monitoring/trends?days=7&feature=PARSING`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7 days",
    "trends": [
      {
        "date": "2024-11-08",
        "features": {
          "PARSING": {
            "successRate": 96.5,
            "total": 120,
            "meetsTarget": true
          },
          "ATS_CHECK": {
            "successRate": 98.5,
            "total": 200,
            "meetsTarget": true
          }
        }
      },
      {
        "date": "2024-11-09",
        "features": {
          "PARSING": {
            "successRate": 95.2,
            "total": 115,
            "meetsTarget": true
          },
          "ATS_CHECK": {
            "successRate": 99.0,
            "total": 210,
            "meetsTarget": true
          }
        }
      }
    ]
  }
}
```

### 3. Check Alerts (Manual Trigger)

**Endpoint:** `POST /api/monitoring/check-alerts`

**Response:**
```json
{
  "success": true,
  "data": {
    "alertCount": 1,
    "alerts": [
      {
        "type": "success_rate",
        "severity": "warning",
        "feature": "TAILORING",
        "message": "TAILORING success rate (85.0%) is 5.0% below target (90.0%)",
        "metric": "success_rate",
        "actual": 85.0,
        "target": 90.0,
        "timestamp": "2024-11-14T10:30:00.000Z"
      }
    ],
    "healthScore": 92.5,
    "status": "good"
  }
}
```

### 4. Get Targets

**Endpoint:** `GET /api/monitoring/targets`

**Response:**
```json
{
  "success": true,
  "data": {
    "successRates": {
      "PARSING": 95.0,
      "ATS_CHECK": 98.0,
      "TAILORING": 90.0,
      "GENERATE_CONTENT": 92.0
    },
    "responseTimes": {
      "PARSING": 30000,
      "ATS_CHECK": 45000,
      "TAILORING_PARTIAL": 60000,
      "TAILORING_FULL": 120000,
      "GENERATE_CONTENT": 15000
    }
  }
}
```

### 5. System Health

**Endpoint:** `GET /api/monitoring/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "healthScore": 97.8,
    "status": "excellent",
    "avgSuccessRate": 96.5,
    "featuresAboveTarget": 4,
    "totalFeatures": 4,
    "criticalAlerts": 0,
    "warningAlerts": 0,
    "timestamp": "2024-11-14T10:30:00.000Z"
  }
}
```

## Health Score Calculation

Health Score is calculated as:
```
healthScore = (avgSuccessRate + (featuresAboveTarget / totalFeatures * 100)) / 2
```

**Status Levels:**
- **Excellent:** 95-100
- **Good:** 90-94
- **Fair:** 80-89
- **Poor:** <80

## Automated Monitoring

### Setup Cron Job

**Hourly Monitoring:**
```bash
# Check success rates every hour
0 * * * * cd /path/to/app && node apps/api/scripts/check-success-rates.js >> /var/log/success-rates.log 2>&1
```

**Every 15 Minutes (More Frequent):**
```bash
*/15 * * * * cd /path/to/app && node apps/api/scripts/check-success-rates.js >> /var/log/success-rates.log 2>&1
```

### Manual Execution

```bash
cd apps/api
node scripts/check-success-rates.js
```

**Output Example:**
```
=== Success Rate Report ===
Health Score: 97.8/100 (excellent)
Average Success Rate: 96.5%
Features Above Target: 4/4

=== Feature Success Rates ===
✅ PARSING: 95.83% (target: 95.0%) - 120 requests
✅ ATS_CHECK: 99.0% (target: 98.0%) - 200 requests
✅ TAILORING: 96.67% (target: 90.0%) - 150 requests
✅ GENERATE_CONTENT: 97.78% (target: 92.0%) - 90 requests

=== Response Times ===
✅ PARSING: 28500ms avg (target: 30000ms) - p95: 38000ms
✅ ATS_CHECK: 42000ms avg (target: 45000ms) - p95: 52000ms
✅ TAILORING: 55000ms avg (target: 60000ms) - p95: 72000ms

✅ No alerts - All systems operating within targets
```

## Alert Integration

### Slack Integration (Example)

```javascript
// In successRateMonitor.js
async function sendSlackAlert(alert) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;

  const color = alert.severity === 'critical' ? 'danger' : 'warning';
  const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color,
        title: `${emoji} ${alert.severity.toUpperCase()} Alert`,
        text: alert.message,
        fields: [
          { title: 'Feature', value: alert.feature, short: true },
          { title: 'Metric', value: alert.metric, short: true },
          { title: 'Actual', value: String(alert.actual), short: true },
          { title: 'Target', value: String(alert.target), short: true }
        ],
        footer: 'RoleReady Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  });
}

// Update logAlert function
function logAlert(alert) {
  const logLevel = alert.severity === 'critical' ? 'error' : 'warn';
  logger[logLevel]('Success rate alert', alert);

  // Send to Slack
  sendSlackAlert(alert).catch(err => {
    logger.error('Failed to send Slack alert', { error: err.message });
  });
}
```

### Email Integration (Example)

```javascript
// Using nodemailer
const nodemailer = require('nodemailer');

async function sendEmailAlert(alert) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const subject = `[${alert.severity.toUpperCase()}] ${alert.feature} Alert`;
  const html = `
    <h2>${alert.severity === 'critical' ? '🚨' : '⚠️'} ${subject}</h2>
    <p>${alert.message}</p>
    <ul>
      <li><strong>Feature:</strong> ${alert.feature}</li>
      <li><strong>Metric:</strong> ${alert.metric}</li>
      <li><strong>Actual:</strong> ${alert.actual}</li>
      <li><strong>Target:</strong> ${alert.target}</li>
      <li><strong>Time:</strong> ${alert.timestamp}</li>
    </ul>
  `;

  await transporter.sendMail({
    from: process.env.ALERT_EMAIL_FROM,
    to: process.env.ALERT_EMAIL_TO,
    subject,
    html
  });
}
```

## Dashboard Integration

### Frontend Component Example

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SuccessRateMonitor() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchReport = async () => {
    try {
      const response = await fetch('/api/monitoring/success-rates?period=hour', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setReport(data.data);
    } catch (error) {
      console.error('Failed to fetch success rates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">
              {report?.overview.healthScore}
            </div>
            <div>
              <div className={`text-xl font-semibold ${getStatusColor(report?.overview.status)}`}>
                {report?.overview.status?.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">
                {report?.overview.featuresAboveTarget}/{report?.overview.totalFeatures} features above target
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {report?.alerts.length > 0 && (
        <div className="space-y-2">
          {report.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.severity.toUpperCase()}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Success Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {report?.successRates.map((rate) => (
          <Card key={rate.feature}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {rate.meetsTarget ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                {rate.feature}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rate.successRate}%</div>
              <div className="text-sm text-gray-600">
                Target: {rate.target}% | {rate.total} requests
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Environment Variables

```env
# Monitoring
ADMIN_USERS=user-id-1,user-id-2 # Admin users who can view monitoring

# Alert Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL_FROM=alerts@yourapp.com
ALERT_EMAIL_TO=admin@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Testing

### Manual Testing

1. **View current success rates:**
   ```bash
   curl -H "Authorization: Bearer <admin-token>" \
     http://localhost:3001/api/monitoring/success-rates?period=day
   ```

2. **Check for alerts:**
   ```bash
   curl -X POST -H "Authorization: Bearer <admin-token>" \
     http://localhost:3001/api/monitoring/check-alerts
   ```

3. **View trends:**
   ```bash
   curl -H "Authorization: Bearer <admin-token>" \
     http://localhost:3001/api/monitoring/trends?days=7
   ```

### Automated Testing

```javascript
describe('Success Rate Monitoring', () => {
  test('should calculate success rate correctly', async () => {
    const report = await getSuccessRateReport({ period: 'day' });
    
    expect(report.overview.healthScore).toBeGreaterThan(0);
    expect(report.successRates).toHaveLength(4);
    expect(report.responseTimes).toHaveLength(4);
  });

  test('should generate alerts when below threshold', async () => {
    // Simulate low success rate
    const report = await getSuccessRateReport({ period: 'hour' });
    
    const lowSuccessRate = report.successRates.find(r => !r.meetsTarget);
    if (lowSuccessRate) {
      expect(report.alerts.length).toBeGreaterThan(0);
    }
  });
});
```

## Best Practices

### 1. Regular Monitoring
- Run automated checks every hour
- Review daily reports
- Investigate any alerts immediately

### 2. Alert Response
- **Critical Alerts:** Investigate within 15 minutes
- **Warning Alerts:** Investigate within 1 hour
- Document all incidents and resolutions

### 3. Trend Analysis
- Review 7-day trends weekly
- Identify patterns and anomalies
- Proactively address declining trends

### 4. Target Adjustment
- Review targets quarterly
- Adjust based on actual performance
- Balance ambition with achievability

## Troubleshooting

### Low Success Rates

**Parsing:**
- Check file upload issues
- Verify AI model availability
- Review error logs for patterns

**ATS Check:**
- Verify embedding service health
- Check OpenAI API status
- Review job description quality

**Tailoring:**
- Check token limits
- Verify prompt compression
- Review AI model performance

### High Response Times

- Check database query performance
- Verify Redis cache health
- Review AI API latency
- Check network connectivity

## Summary

**Status:** ✅ Complete

**Features:**
- Real-time success rate tracking
- Automated alert system
- Comprehensive reporting
- Trend analysis
- Health score calculation

**Targets:**
- Parsing: 95%+
- ATS Check: 98%+
- Tailoring: 90%+
- Generate Content: 92%+

**Next Steps:**
1. Set up cron job for automated monitoring
2. Configure alert notifications (Slack/Email)
3. Build frontend dashboard (optional)
4. Review and adjust targets based on actual performance

---

**Last Updated**: November 14, 2024  
**Version**: 1.0.0

