# Error Tracking Guide - RoleRabbit Frontend

## Overview

The frontend error tracking system provides comprehensive error monitoring and reporting for the RoleRabbit application. It integrates with:
- **Backend API** - Error logs stored in database
- **Sentry** (optional) - Error tracking and performance monitoring
- **LogRocket** (optional) - Session replay and error tracking

---

## Features

✅ **Automatic Error Capture**
- Uncaught errors
- Unhandled promise rejections
- React error boundaries
- API errors

✅ **Rich Context**
- User information
- Component stack traces
- Breadcrumbs
- Custom tags and metadata

✅ **Multiple Integrations**
- Backend API logging
- Sentry integration
- LogRocket integration
- Console logging (development)

✅ **Configuration**
- Environment-based settings
- Error sampling
- Ignore list for known errors
- Graceful degradation

---

## Quick Start

### 1. Basic Setup (Backend Only)

Enable error tracking with backend logging only:

```bash
# apps/web/.env.local
NEXT_PUBLIC_ERROR_TRACKING_ENABLED=true
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Initialize Error Tracking

In your app's root component or layout:

```typescript
import { useEffect } from 'react';
import errorTracking from '@/services/errorTracking';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize error tracking
    errorTracking.initialize({
      id: user?.id,
      email: user?.email
    });
  }, [user]);

  return <>{children}</>;
}
```

### 3. Use Error Boundaries

Wrap components with error boundaries:

```typescript
import { TemplatesErrorBoundary } from '@/components/templates/components/TemplatesErrorBoundary';

function MyComponent() {
  return (
    <TemplatesErrorBoundary>
      <YourComponent />
    </TemplatesErrorBoundary>
  );
}
```

---

## Sentry Integration

### Installation

```bash
cd apps/web
npm install @sentry/nextjs
```

### Configuration

1. Create Sentry project at https://sentry.io
2. Get your DSN (Data Source Name)
3. Add to environment variables:

```bash
# apps/web/.env.local
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@o123456.ingest.sentry.io/123456
```

### Initialize Sentry

Error tracking service will automatically initialize Sentry if DSN is provided.

### Sentry Configuration File (Optional)

Create `apps/web/sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,

  beforeSend(event) {
    // Don't send in development
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      return null;
    }
    return event;
  },

  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],
});
```

---

## LogRocket Integration

### Installation

```bash
cd apps/web
npm install logrocket
```

### Configuration

1. Create LogRocket account at https://logrocket.com
2. Create a project
3. Get your App ID
4. Add to environment variables:

```bash
# apps/web/.env.local
NEXT_PUBLIC_LOGROCKET_APP_ID=your-app/project-name
```

### Initialize LogRocket

Error tracking service will automatically initialize LogRocket if App ID is provided.

---

## Usage Examples

### Capture Error Manually

```typescript
import { captureError } from '@/services/errorTracking';

try {
  // Some risky operation
  await riskyOperation();
} catch (error) {
  captureError(error, {
    tags: { feature: 'templates', action: 'preview' },
    extra: { templateId: 'tpl_123' },
    level: 'error'
  });

  // Show user-friendly message
  toast.error('Failed to preview template');
}
```

### Capture Message (Non-Error)

```typescript
import { captureMessage } from '@/services/errorTracking';

// Log important events
captureMessage('User upgraded to premium', {
  tags: { feature: 'billing' },
  extra: { plan: 'premium', userId: user.id },
  level: 'info'
});
```

### Set User Context

```typescript
import { setUser } from '@/services/errorTracking';

// After user logs in
setUser({
  id: user.id,
  email: user.email
});

// After user logs out
setUser(null);
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/services/errorTracking';

// Track user actions
addBreadcrumb('Template selected', 'user-action', {
  templateId: 'tpl_123',
  category: 'ATS'
});

addBreadcrumb('Filter applied', 'user-action', {
  filter: 'category',
  value: 'CREATIVE'
});
```

### Use in Hooks

```typescript
import { captureError } from '@/services/errorTracking';

function useTemplates() {
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTemplates(filters);
      setTemplates(response.data);
    } catch (error) {
      // Track error
      captureError(error, {
        tags: { feature: 'templates', action: 'fetch' },
        extra: { filters }
      });

      // Set error state
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { fetchTemplates, templates, loading, error };
}
```

---

## Backend API Integration

### Error Logging Endpoint

The frontend sends errors to the backend API:

```
POST /api/errors/log
Content-Type: application/json

{
  "message": "Template not found",
  "stack": "Error: Template not found\n    at ...",
  "category": "NETWORK",
  "component": "TemplatesErrorBoundary",
  "url": "https://app.rolerabbit.com/templates",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-11-14T10:30:00.000Z",
  "context": {
    "user": { "id": "user_123" },
    "tags": { "feature": "templates" },
    "extra": { "templateId": "tpl_456" }
  }
}
```

### Backend Implementation (Example)

Create `apps/api/routes/errors.routes.js`:

```javascript
const { logTemplateError } = require('../middleware/templateLogging');
const { logAuditEvent, AuditActions } = require('../utils/auditLogger');

fastify.post('/api/errors/log', async (request, reply) => {
  const {
    message,
    stack,
    category,
    component,
    url,
    userAgent,
    timestamp,
    context
  } = request.body;

  try {
    // Log to Winston
    logTemplateError('Frontend Error', {
      message,
      stack,
      category,
      component,
      url
    }, context?.extra || {});

    // Save to audit log
    await logAuditEvent({
      userId: context?.user?.id || null,
      action: AuditActions.SYSTEM_ERROR,
      resource: 'FRONTEND_ERROR',
      resourceId: component,
      details: {
        message,
        stack,
        category,
        url,
        tags: context?.tags
      },
      ip: request.ip,
      userAgent
    });

    reply.send({ success: true });
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log frontend error:', error);
    reply.send({ success: false });
  }
});
```

---

## Environment Configuration

### Development

```bash
# apps/web/.env.local
NEXT_PUBLIC_ERROR_TRACKING_ENABLED=false  # Disabled in dev
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ERROR_SAMPLE_RATE=1.0
```

### Staging

```bash
# apps/web/.env.staging
NEXT_PUBLIC_ERROR_TRACKING_ENABLED=true
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_API_URL=https://api-staging.rolerabbit.com
NEXT_PUBLIC_SENTRY_DSN=https://staging-dsn@sentry.io/staging
NEXT_PUBLIC_ERROR_SAMPLE_RATE=1.0
```

### Production

```bash
# apps/web/.env.production
NEXT_PUBLIC_ERROR_TRACKING_ENABLED=true
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://api.rolerabbit.com
NEXT_PUBLIC_SENTRY_DSN=https://production-dsn@sentry.io/production
NEXT_PUBLIC_LOGROCKET_APP_ID=rolerabbit/production
NEXT_PUBLIC_ERROR_SAMPLE_RATE=0.5  # Sample 50% to reduce costs
```

---

## Error Categories

The error tracking system categorizes errors for better organization:

```typescript
enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AI_SERVICE = 'AI_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN'
}
```

---

## Ignored Errors

Some errors are automatically ignored to reduce noise:

```typescript
const ignoreErrors = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
];
```

Add more to the configuration as needed.

---

## Best Practices

### 1. Always Provide Context

```typescript
// ❌ Bad
captureError(error);

// ✅ Good
captureError(error, {
  tags: { feature: 'templates', action: 'create' },
  extra: { templateData, userId },
  level: 'error'
});
```

### 2. Use Appropriate Error Levels

```typescript
// Critical errors
captureError(error, { level: 'error' });

// Warnings
captureError(error, { level: 'warning' });

// Informational
captureMessage('User action completed', { level: 'info' });

// Debug info
captureMessage('API response received', { level: 'debug' });
```

### 3. Set User Context Early

```typescript
// In auth callback or app initialization
useEffect(() => {
  if (user) {
    setUser({ id: user.id, email: user.email });
  }
}, [user]);
```

### 4. Add Breadcrumbs for Complex Flows

```typescript
async function complexOperation() {
  addBreadcrumb('Started complex operation', 'process');

  addBreadcrumb('Step 1: Fetching data', 'process');
  const data = await fetchData();

  addBreadcrumb('Step 2: Processing data', 'process');
  const processed = processData(data);

  addBreadcrumb('Step 3: Saving result', 'process');
  await saveResult(processed);

  addBreadcrumb('Completed complex operation', 'process');
}
```

### 5. Don't Track Sensitive Data

```typescript
// ❌ Bad - exposes sensitive data
captureError(error, {
  extra: {
    password: user.password,  // Never!
    creditCard: user.card,    // Never!
    ssn: user.ssn            // Never!
  }
});

// ✅ Good - only non-sensitive data
captureError(error, {
  extra: {
    userId: user.id,
    email: user.email,
    subscriptionPlan: user.plan
  }
});
```

---

## Monitoring & Alerts

### Sentry Alerts

Configure alerts in Sentry dashboard:
1. Go to Settings → Alerts
2. Create alert rule
3. Set conditions (e.g., >10 errors in 5 minutes)
4. Add notification channels (email, Slack, PagerDuty)

### Backend Alerts

Use Prometheus metrics for backend error monitoring:

```yaml
alert: FrontendErrorRateHigh
expr: rate(frontend_errors_total[5m]) > 0.1
for: 5m
labels:
  severity: warning
annotations:
  summary: High frontend error rate detected
```

---

## Troubleshooting

### Errors Not Being Tracked

1. Check environment variables:
   ```bash
   echo $NEXT_PUBLIC_ERROR_TRACKING_ENABLED
   ```

2. Verify initialization:
   ```typescript
   console.log('Error tracking initialized:', errorTracking.initialized);
   ```

3. Check browser console for tracking errors

### Sentry Not Receiving Errors

1. Verify DSN is correct
2. Check network tab for blocked requests
3. Verify environment is not 'development' (if filtered)
4. Check Sentry sample rate

### Too Many Errors

1. Increase sample rate:
   ```bash
   NEXT_PUBLIC_ERROR_SAMPLE_RATE=0.1  # Track only 10%
   ```

2. Add more errors to ignore list
3. Fix recurring errors first

---

## Testing

### Test Error Tracking

```typescript
// Create test error
import { captureError } from '@/services/errorTracking';

function testErrorTracking() {
  try {
    throw new Error('Test error tracking');
  } catch (error) {
    captureError(error, {
      tags: { test: 'true' },
      extra: { timestamp: Date.now() }
    });
  }
}
```

### Test Error Boundary

```typescript
// Create component that throws
function ErrorComponent() {
  throw new Error('Test error boundary');
}

// Wrap in error boundary
<TemplatesErrorBoundary>
  <ErrorComponent />
</TemplatesErrorBoundary>
```

---

## Cost Optimization

### Sentry

- Use error sampling (0.5 = 50% of errors)
- Set quotas in Sentry dashboard
- Filter out noisy errors
- Use performance sampling selectively

### LogRocket

- Limit session recording to important users/pages
- Set shorter session durations
- Use conditional recording

```typescript
// Only record for premium users
if (user.isPremium) {
  LogRocket.init(config.logRocketAppId);
}
```

---

## Resources

### Internal Files
- `apps/web/src/services/errorTracking.ts` - Error tracking service
- `apps/web/src/utils/errorHandler.ts` - Error handling utilities
- `apps/web/src/components/templates/components/TemplatesErrorBoundary.tsx` - Error boundary
- `apps/web/.env.errortracking.example` - Environment variables example

### External Documentation
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [LogRocket React](https://docs.logrocket.com/docs/react)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**Last Updated:** November 14, 2025
**Maintained By:** Development Team
