# Feature Usage Analytics - Integration Guide

## Overview

This guide provides complete instructions for integrating analytics tracking into the application. The backend infrastructure is ready - this document shows how to track events and view analytics.

## Backend Implementation Status

✅ **COMPLETE** - Ready to use

**Components:**
- `apps/api/services/analytics/analyticsService.js` - Analytics service
- `apps/api/routes/analytics.routes.js` - Analytics API routes
- `apps/api/prisma/schema.prisma` - AnalyticsEvent model added
- Database migration required (see below)

## Database Migration

### Step 1: Generate Migration

```bash
cd apps/api
npx prisma migrate dev --name add_analytics_events
```

This will create the `analytics_events` table with the following schema:

```sql
CREATE TABLE "analytics_events" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "properties" TEXT DEFAULT '{}',
  "sessionId" TEXT,
  "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");
CREATE INDEX "analytics_events_event_idx" ON "analytics_events"("event");
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");
CREATE INDEX "analytics_events_userId_timestamp_idx" ON "analytics_events"("userId", "timestamp");
CREATE INDEX "analytics_events_event_timestamp_idx" ON "analytics_events"("event", "timestamp");
```

### Step 2: Apply Migration

```bash
npx prisma migrate deploy
```

## Event Tracking Integration

### 1. Resume Parsing Flow

**File:** `apps/api/routes/resume.routes.js`

```javascript
const {
  trackResumeUpload,
  trackResumeParseStart,
  trackResumeParseSuccess,
  trackResumeParseFailed
} = require('../services/analytics/analyticsService');

// In resume upload endpoint
fastify.post('/api/resumes/parse', async (request, reply) => {
  const userId = request.user.userId;
  const file = await request.file();
  
  // Track upload
  await trackResumeUpload({
    userId,
    fileName: file.filename,
    fileSize: file.file.bytesRead,
    fileType: file.mimetype,
    sessionId: request.headers['x-session-id']
  });
  
  // Track parse start
  await trackResumeParseStart({
    userId,
    resumeId: newResume.id,
    method: 'gpt-4o',
    sessionId: request.headers['x-session-id']
  });
  
  const startTime = Date.now();
  
  try {
    // ... parsing logic ...
    
    // Track success
    await trackResumeParseSuccess({
      userId,
      resumeId: newResume.id,
      duration: Date.now() - startTime,
      method: 'gpt-4o',
      sessionId: request.headers['x-session-id']
    });
  } catch (error) {
    // Track failure
    await trackResumeParseFailed({
      userId,
      error: error.message,
      method: 'gpt-4o',
      sessionId: request.headers['x-session-id']
    });
  }
});
```

### 2. ATS Analysis Flow

**File:** `apps/api/routes/editorAI.routes.js`

```javascript
const {
  trackATSCheckStart,
  trackATSCheckSuccess,
  trackATSCheckFailed
} = require('../services/analytics/analyticsService');

// In ATS check endpoint
fastify.post('/api/editor/ai/ats-check', async (request, reply) => {
  const userId = request.user.userId;
  const { resumeId } = request.body;
  
  // Track start
  await trackATSCheckStart({
    userId,
    resumeId,
    sessionId: request.headers['x-session-id']
  });
  
  const startTime = Date.now();
  
  try {
    const result = await analyzeATSScore({ ... });
    
    // Track success
    await trackATSCheckSuccess({
      userId,
      resumeId,
      score: result.overall,
      duration: Date.now() - startTime,
      sessionId: request.headers['x-session-id']
    });
    
    return reply.send({ success: true, ...result });
  } catch (error) {
    // Track failure
    await trackATSCheckFailed({
      userId,
      resumeId,
      error: error.message,
      sessionId: request.headers['x-session-id']
    });
    
    throw error;
  }
});
```

### 3. Tailoring Flow

**File:** `apps/api/routes/editorAI.routes.js`

```javascript
const {
  trackTailoringStart,
  trackTailoringSuccess,
  trackTailoringFailed,
  trackTailoringApplied,
  trackTailoringDiscarded
} = require('../services/analytics/analyticsService');

// In tailor endpoint
fastify.post('/api/editor/ai/tailor', async (request, reply) => {
  const userId = request.user.userId;
  const { resumeId, mode } = request.body;
  
  // Track start
  await trackTailoringStart({
    userId,
    resumeId,
    mode,
    sessionId: request.headers['x-session-id']
  });
  
  const startTime = Date.now();
  
  try {
    const result = await tailorResume({ ... });
    
    // Track success
    await trackTailoringSuccess({
      userId,
      resumeId,
      mode,
      duration: Date.now() - startTime,
      scoreImprovement: result.estimatedScoreImprovement,
      sessionId: request.headers['x-session-id']
    });
    
    return reply.send({ success: true, ...result });
  } catch (error) {
    // Track failure
    await trackTailoringFailed({
      userId,
      resumeId,
      mode,
      error: error.message,
      sessionId: request.headers['x-session-id']
    });
    
    throw error;
  }
});

// In apply changes endpoint
fastify.post('/api/editor/ai/apply-draft', async (request, reply) => {
  const userId = request.user.userId;
  const { resumeId } = request.body;
  
  // Track applied
  await trackTailoringApplied({
    userId,
    resumeId,
    sessionId: request.headers['x-session-id']
  });
  
  // ... apply logic ...
});

// In discard changes endpoint
fastify.post('/api/editor/ai/discard-draft', async (request, reply) => {
  const userId = request.user.userId;
  const { resumeId } = request.body;
  
  // Track discarded
  await trackTailoringDiscarded({
    userId,
    resumeId,
    sessionId: request.headers['x-session-id']
  });
  
  // ... discard logic ...
});
```

### 4. Session ID Generation (Frontend)

**File:** `apps/web/src/utils/sessionId.ts`

```typescript
/**
 * Generate or retrieve session ID for analytics tracking
 */
export function getSessionId(): string {
  const SESSION_KEY = 'analytics_session_id';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  
  const stored = sessionStorage.getItem(SESSION_KEY);
  const timestamp = sessionStorage.getItem(`${SESSION_KEY}_timestamp`);
  
  if (stored && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < SESSION_DURATION) {
      return stored;
    }
  }
  
  // Generate new session ID
  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  sessionStorage.setItem(SESSION_KEY, sessionId);
  sessionStorage.setItem(`${SESSION_KEY}_timestamp`, Date.now().toString());
  
  return sessionId;
}
```

**Usage in API calls:**

```typescript
import { getSessionId } from '@/utils/sessionId';

// In API service
async function callAPI(endpoint: string, data: any) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Session-Id': getSessionId() // Add session ID
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

## Analytics API Endpoints

### 1. Feature Usage Statistics

**Endpoint:** `GET /api/analytics/features?period=day|week|month`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-11-07T00:00:00.000Z",
      "endDate": "2024-11-14T00:00:00.000Z"
    },
    "overview": {
      "totalEvents": 1250,
      "uniqueUsers": 45
    },
    "features": {
      "parsing": {
        "total": 120,
        "success": 115,
        "failed": 5,
        "successRate": "95.8%"
      },
      "atsCheck": {
        "total": 200,
        "success": 198,
        "failed": 2,
        "successRate": "99.0%"
      },
      "tailoring": {
        "total": 150,
        "success": 145,
        "failed": 5,
        "successRate": "96.7%",
        "applied": 120,
        "discarded": 25,
        "applyRate": "82.8%"
      }
    },
    "eventBreakdown": [
      { "event": "resume_uploaded", "count": 120 },
      { "event": "ats_check_success", "count": 198 }
    ]
  }
}
```

### 2. User Journey Funnel

**Endpoint:** `GET /api/analytics/funnel?period=day|week|month`

**Response:**
```json
{
  "success": true,
  "data": {
    "funnel": [
      {
        "stage": "Resume Uploaded",
        "users": 120,
        "percentage": 100,
        "dropoff": 0
      },
      {
        "stage": "Resume Parsed",
        "users": 115,
        "percentage": 95.8,
        "dropoff": 5
      },
      {
        "stage": "ATS Check",
        "users": 100,
        "percentage": 83.3,
        "dropoff": 15
      },
      {
        "stage": "Tailoring",
        "users": 85,
        "percentage": 70.8,
        "dropoff": 15
      },
      {
        "stage": "Changes Applied",
        "users": 70,
        "percentage": 58.3,
        "dropoff": 15
      }
    ],
    "conversionRate": "58.3%"
  }
}
```

### 3. Retention Metrics

**Endpoint:** `GET /api/analytics/retention?cohortWeeks=4`

**Response:**
```json
{
  "success": true,
  "data": {
    "cohortSize": 50,
    "cohortPeriod": {
      "start": "2024-10-14T00:00:00.000Z",
      "end": "2024-11-14T00:00:00.000Z"
    },
    "retention": [
      { "week": 0, "activeUsers": 50, "retentionRate": "100.0%" },
      { "week": 1, "activeUsers": 42, "retentionRate": "84.0%" },
      { "week": 2, "activeUsers": 38, "retentionRate": "76.0%" },
      { "week": 3, "activeUsers": 35, "retentionRate": "70.0%" },
      { "week": 4, "activeUsers": 32, "retentionRate": "64.0%" }
    ]
  }
}
```

### 4. User-Specific Analytics

**Endpoint:** `GET /api/analytics/user/:userId?period=week|month|year`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-10-14T00:00:00.000Z",
      "endDate": "2024-11-14T00:00:00.000Z"
    },
    "overview": {
      "totalEvents": 45,
      "uniqueUsers": 1
    },
    "features": {
      "parsing": {
        "total": 5,
        "success": 5,
        "failed": 0,
        "successRate": "100.0%"
      },
      "atsCheck": {
        "total": 8,
        "success": 8,
        "failed": 0,
        "successRate": "100.0%"
      },
      "tailoring": {
        "total": 6,
        "success": 6,
        "failed": 0,
        "successRate": "100.0%",
        "applied": 5,
        "discarded": 1,
        "applyRate": "83.3%"
      }
    }
  }
}
```

### 5. Recent Events (Debugging)

**Endpoint:** `GET /api/analytics/events?limit=100&event=resume_parse_success`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123",
      "userId": "user-123",
      "event": "resume_parse_success",
      "properties": {
        "resumeId": "resume-456",
        "duration": 3200,
        "method": "gpt-4o"
      },
      "sessionId": "1699900000_abc123",
      "timestamp": "2024-11-14T10:30:00.000Z",
      "user": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "subscriptionTier": "PRO"
      }
    }
  ]
}
```

## Frontend Dashboard (Optional)

### Analytics Dashboard Component

**File:** `apps/web/src/app/admin/analytics/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, funnelRes] = await Promise.all([
        fetch(`/api/analytics/features?period=${period}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/analytics/funnel?period=${period}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const statsData = await statsRes.json();
      const funnelData = await funnelRes.json();

      if (statsData.success) setStats(statsData.data);
      if (funnelData.success) setFunnel(funnelData.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.overview.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.overview.uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parse Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.features.parsing.successRate}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{funnel?.conversionRate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Stats */}
      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Parsing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>Total: {stats?.features.parsing.total}</div>
                  <div>Success: {stats?.features.parsing.success}</div>
                  <div>Failed: {stats?.features.parsing.failed}</div>
                  <div className="text-lg font-semibold">
                    Success Rate: {stats?.features.parsing.successRate}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ATS Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>Total: {stats?.features.atsCheck.total}</div>
                  <div>Success: {stats?.features.atsCheck.success}</div>
                  <div>Failed: {stats?.features.atsCheck.failed}</div>
                  <div className="text-lg font-semibold">
                    Success Rate: {stats?.features.atsCheck.successRate}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Tailoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>Total: {stats?.features.tailoring.total}</div>
                  <div>Success: {stats?.features.tailoring.success}</div>
                  <div>Applied: {stats?.features.tailoring.applied}</div>
                  <div>Discarded: {stats?.features.tailoring.discarded}</div>
                  <div className="text-lg font-semibold">
                    Apply Rate: {stats?.features.tailoring.applyRate}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnel?.funnel.map((stage, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 font-semibold">{stage.stage}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 flex items-center justify-center text-white text-sm"
                          style={{ width: `${stage.percentage}%` }}
                        >
                          {stage.users} users ({stage.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    {stage.dropoff > 0 && (
                      <div className="text-red-500 text-sm">-{stage.dropoff}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Privacy & Compliance

### GDPR Compliance

1. **Data Minimization:** Only track necessary events
2. **User Consent:** Add analytics consent in privacy policy
3. **Data Retention:** Implement automatic cleanup (see below)
4. **Right to Deletion:** Provide endpoint to delete user analytics

### Data Retention Policy

**File:** `apps/api/scripts/cleanup-analytics.js`

```javascript
const { prisma } = require('../utils/db');
const logger = require('../utils/logger');

async function cleanupOldAnalytics() {
  const retentionDays = parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const deleted = await prisma.analyticsEvent.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate
      }
    }
  });

  logger.info(`Cleaned up ${deleted.count} analytics events older than ${retentionDays} days`);
}

cleanupOldAnalytics().catch(console.error);
```

**Cron job (daily):**
```bash
0 2 * * * cd /path/to/app && node apps/api/scripts/cleanup-analytics.js
```

## Environment Variables

```env
# Analytics
LOG_ANALYTICS_EVENTS=false # Set to true for debugging
ANALYTICS_RETENTION_DAYS=90 # Keep analytics for 90 days
ADMIN_USERS=user-id-1,user-id-2 # Admin users who can view analytics
```

## Testing

### Manual Testing

1. **Upload a resume** - Check `analytics_events` table for `resume_uploaded` event
2. **Run ATS check** - Check for `ats_check_success` event
3. **Tailor resume** - Check for `tailoring_success` event
4. **Apply changes** - Check for `tailoring_applied` event
5. **View analytics** - Access `/api/analytics/features` endpoint

### Automated Testing

```javascript
// Test analytics tracking
describe('Analytics Tracking', () => {
  test('should track resume upload', async () => {
    await trackResumeUpload({
      userId: 'test-user',
      fileName: 'resume.pdf',
      fileSize: 1024,
      fileType: 'application/pdf'
    });

    const event = await prisma.analyticsEvent.findFirst({
      where: {
        userId: 'test-user',
        event: 'resume_uploaded'
      }
    });

    expect(event).toBeTruthy();
    expect(JSON.parse(event.properties).fileName).toBe('resume.pdf');
  });
});
```

## Summary

**Backend:** ✅ Complete
- Analytics service implemented
- API routes created
- Database schema defined

**Integration Required:**
1. Run database migration
2. Add tracking calls to existing endpoints
3. Add session ID to frontend API calls
4. (Optional) Create analytics dashboard

**Next Steps:**
1. Run `npx prisma migrate dev --name add_analytics_events`
2. Integrate tracking calls into resume, ATS, and tailoring endpoints
3. Test event tracking
4. View analytics via API endpoints
5. (Optional) Build frontend dashboard

---

**Last Updated**: November 14, 2024  
**Version**: 1.0.0

