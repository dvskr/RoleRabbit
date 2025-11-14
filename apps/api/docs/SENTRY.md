# Sentry Error Tracking

This document describes the Sentry error tracking integration for production monitoring and debugging.

## Overview

Sentry provides real-time error tracking, performance monitoring, and crash reporting for the RoleRabbit API. It helps identify and fix issues in production by capturing exceptions, stack traces, and contextual information.

## Features

- **Automatic Error Capture**: All unhandled errors are automatically captured
- **Performance Monitoring**: Track slow API endpoints and database queries
- **Breadcrumbs**: See user actions leading up to errors
- **User Context**: Associate errors with specific users
- **Sensitive Data Filtering**: Automatically removes passwords, tokens, and PII
- **Environment Separation**: Separate tracking for dev/staging/production
- **Release Tracking**: Track errors by application version

## Setup

### 1. Create Sentry Account

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (select Node.js as platform)
3. Copy your DSN (Data Source Name)

### 2. Configure Environment Variables

Add to `.env`:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ENABLED=true  # Set to false to disable
SENTRY_ENVIRONMENT=production  # or staging, development
SENTRY_RELEASE=rolerabbit-api@1.0.0  # Optional: track by version

# Optional: Fine-tune sampling rates
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions (performance)
SENTRY_PROFILES_SAMPLE_RATE=0.1  # 10% of transactions (profiling)

# Debug mode (logs Sentry SDK info)
SENTRY_DEBUG=false  # Set to true for debugging
```

### 3. Installation

Dependencies are already added to `package.json`:

```bash
npm install @sentry/node@^8.40.0 @sentry/profiling-node@^8.40.0
```

## What Gets Tracked

### Automatically Captured

1. **Server Errors (5xx)**
   - 500 Internal Server Error
   - 503 Service Unavailable
   - Database connection errors
   - Unhandled exceptions

2. **Unhandled Rejections**
   - Promise rejections without `.catch()`
   - Async/await errors without try-catch

3. **Uncaught Exceptions**
   - Synchronous errors not caught by try-catch

### NOT Captured

- **Client Errors (4xx)** - These are user errors, not bugs
- **Premature Close Errors** - Known Fastify artifact
- **Rate Limit Errors** - Expected behavior
- **Validation Errors** - User input issues

## Captured Context

For each error, Sentry captures:

```javascript
{
  // Error details
  message: "Database connection failed",
  stack: "Error: ...",
  type: "DatabaseError",

  // Request context
  url: "/api/storage/files",
  method: "POST",
  query: { page: 1, limit: 50 },
  params: { id: "file_123" },
  headers: {
    "user-agent": "Mozilla/5.0...",
    "content-type": "application/json"
    // auth headers are filtered
  },

  // User context (if authenticated)
  user: {
    id: "user_123",
    email: "user@example.com",
    username: "John Doe"
  },

  // Tags for filtering
  tags: {
    path: "/api/storage/files",
    method: "POST",
    statusCode: 500,
    environment: "production"
  },

  // Breadcrumbs (recent actions)
  breadcrumbs: [
    { message: "User logged in", timestamp: ... },
    { message: "Uploaded file", timestamp: ... },
    { message: "Database query executed", timestamp: ... }
  ]
}
```

## Sensitive Data Protection

The integration automatically filters sensitive data:

### Removed from Request Headers
- `authorization`
- `cookie`
- `x-api-key`

### Removed from Query Parameters
- `token=...` → `token=[FILTERED]`
- `password=...` → `password=[FILTERED]`
- `api_key=...` → `api_key=[FILTERED]`

### Removed from Request Body
- `password`: `[FILTERED]`
- `token`: `[FILTERED]`
- `apiKey`: `[FILTERED]`
- `secret`: `[FILTERED]`
- `creditCard`: `[FILTERED]`

## Sampling Rates

To reduce costs and noise, we sample a percentage of events:

### Performance Monitoring (Traces)
- **Production**: 10% (0.1) - Sample 1 in 10 transactions
- **Staging**: 50% (0.5) - Sample 1 in 2 transactions
- **Development**: 100% (1.0) - Sample all transactions

### Profiling
- **Production**: 10% (0.1) - Profile 1 in 10 transactions
- **Staging**: 50% (0.5) - Profile 1 in 2 transactions
- **Development**: 100% (1.0) - Profile all transactions

**Note**: All errors are always captured (100%), regardless of sampling rates.

## Usage Examples

### Manual Error Capture

```javascript
const sentry = require('./utils/sentry');

try {
  // Risky operation
  await processPayment(userId, amount);
} catch (error) {
  // Manually capture error with context
  sentry.captureException(error, {
    tags: {
      feature: 'payment',
      userId
    },
    extra: {
      amount,
      currency: 'USD',
      timestamp: Date.now()
    }
  });

  throw error; // Re-throw or handle
}
```

### Capture Messages

```javascript
// Capture info/warning messages
sentry.captureMessage('Payment processing started', 'info', {
  tags: { feature: 'payment' },
  extra: { orderId: '123' }
});

// Severity levels: fatal, error, warning, info, debug
sentry.captureMessage('Critical threshold exceeded', 'warning');
```

### Set User Context

```javascript
// Automatically done in error handler, but you can set manually
sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
  ip_address: request.ip
});

// Clear user context
sentry.clearUser();
```

### Add Breadcrumbs

```javascript
// Track user actions for debugging
sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
  data: {
    userId: user.id,
    method: '2FA'
  }
});

sentry.addBreadcrumb({
  category: 'file',
  message: 'File uploaded',
  level: 'info',
  data: {
    fileId: 'file_123',
    size: '2.5MB'
  }
});
```

### Performance Monitoring

```javascript
// Track slow operations
const transaction = sentry.startTransaction('file-processing', 'task');

try {
  // Do work
  await processLargeFile(fileId);

  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Custom Tags

```javascript
// Set tags for filtering in Sentry UI
sentry.setTag('feature', 'file-upload');
sentry.setTag('plan', 'premium');
sentry.setTag('region', 'us-east-1');
```

### Custom Context

```javascript
// Add extra context data
sentry.setExtra('fileDetails', {
  id: fileId,
  size: fileSize,
  type: fileType
});
```

## Sentry Dashboard

### Viewing Errors

1. Go to [sentry.io](https://sentry.io)
2. Select your project
3. View **Issues** tab for error list
4. Click any issue to see:
   - Stack trace
   - Request/user context
   - Breadcrumbs
   - Frequency graph
   - Affected users

### Performance Monitoring

1. Go to **Performance** tab
2. See:
   - Slowest endpoints
   - Database query times
   - External API call times
   - Apdex score (user satisfaction)

### Alerts

Set up alerts for:
- New error types
- Error spike (e.g., 10+ errors in 1 minute)
- Performance regression (e.g., endpoint > 1 second)
- User impact (e.g., 100+ affected users)

Configure in **Alerts** → **Create Alert Rule**

## Environments

Separate errors by environment for clarity:

```bash
# Production
SENTRY_ENVIRONMENT=production

# Staging
SENTRY_ENVIRONMENT=staging

# Development
SENTRY_ENVIRONMENT=development
```

In Sentry UI, filter by environment to see only relevant errors.

## Releases

Track errors by application version:

```bash
# Set in .env or CI/CD pipeline
SENTRY_RELEASE=rolerabbit-api@1.2.3

# Or use git commit hash
SENTRY_RELEASE=$(git rev-parse --short HEAD)
```

Benefits:
- Track when errors were introduced
- See error counts per release
- Associate errors with specific deploys
- Identify regression issues

## Troubleshooting

### Sentry Not Capturing Errors

**Problem**: Errors aren't showing up in Sentry

**Solutions**:
1. Check DSN is correct: `echo $SENTRY_DSN`
2. Verify Sentry is enabled: `SENTRY_ENABLED=true`
3. Check environment matches: `SENTRY_ENVIRONMENT=production`
4. Enable debug mode: `SENTRY_DEBUG=true` and check logs
5. Test manually:
   ```javascript
   const sentry = require('./utils/sentry');
   sentry.captureMessage('Test from API');
   ```

### Too Many Events

**Problem**: Sentry quota exceeded

**Solutions**:
1. Reduce sampling rates:
   ```bash
   SENTRY_TRACES_SAMPLE_RATE=0.05  # 5% instead of 10%
   ```

2. Add more ignored errors in `sentry.js`:
   ```javascript
   ignoreErrors: [
     'YourNonCriticalError',
     /RegexPattern/
   ]
   ```

3. Use Sentry's spike protection (auto-enabled)

### Performance Overhead

**Problem**: Sentry causing slowdowns

**Solutions**:
1. Reduce profiling sample rate:
   ```bash
   SENTRY_PROFILES_SAMPLE_RATE=0.01  # 1%
   ```

2. Disable in development:
   ```bash
   SENTRY_ENABLED=false  # Or don't set DSN
   ```

3. Performance impact is typically < 1% with 10% sampling

## Best Practices

### DO

✅ **Set user context** for easier debugging
✅ **Add breadcrumbs** for important actions
✅ **Use custom tags** to categorize errors
✅ **Configure alerts** for critical errors
✅ **Review errors weekly** and fix patterns
✅ **Set up releases** to track regressions
✅ **Filter sensitive data** (auto-done)
✅ **Test in staging** before production

### DON'T

❌ **Don't capture client errors (4xx)** - These aren't bugs
❌ **Don't send PII** - Use filtering, not raw data
❌ **Don't ignore all errors** - Fix root causes
❌ **Don't use 100% sampling** in production - Too expensive
❌ **Don't disable Sentry** without alternative monitoring
❌ **Don't commit DSN to git** - Use environment variables

## Cost Optimization

Sentry pricing is based on events and data volume:

### Free Tier
- 5,000 errors/month
- 10,000 performance events/month
- 1 user
- 30-day retention

### Cost-Saving Tips

1. **Smart Sampling**:
   ```bash
   # Only sample 5% in production
   SENTRY_TRACES_SAMPLE_RATE=0.05
   SENTRY_PROFILES_SAMPLE_RATE=0.05
   ```

2. **Ignore Non-Critical Errors**:
   ```javascript
   ignoreErrors: [
     'NetworkError',
     'ChunkLoadError',
     'ResizeObserver loop',
   ]
   ```

3. **Use Source Maps** - Minified code reduces data size

4. **Set Retention** - Keep only 30-90 days of history

5. **Monitor Usage** - Check Sentry dashboard for quota status

## Integration with Other Tools

### Slack Notifications

1. Go to Sentry **Settings** → **Integrations**
2. Enable Slack integration
3. Configure channel for alerts
4. Set alert rules to notify Slack

### GitHub Integration

1. Enable GitHub integration in Sentry
2. Link errors to commits
3. Create GitHub issues from Sentry
4. Track which commit introduced errors

### PagerDuty

1. Enable PagerDuty integration
2. Route critical errors to on-call engineer
3. Set up escalation policies

## Security Considerations

### Sensitive Data

- **Never log passwords**, even in errors
- **Filter API keys** and tokens (auto-done)
- **Remove PII** from custom context
- **Use Sentry's data scrubbing** features

### Access Control

- **Limit Sentry access** to dev team only
- **Use separate projects** for different environments
- **Enable 2FA** on Sentry account
- **Rotate DSN** if compromised

### Compliance

- **GDPR**: Sentry is GDPR-compliant, but ensure you:
  - Don't send unnecessary PII
  - Have data processing agreement
  - Honor user deletion requests

- **SOC 2**: Sentry is SOC 2 Type II certified

## Performance Impact

Typical impact on API performance:

- **Initialization**: < 50ms on startup
- **Error Capture**: < 5ms per error
- **Performance Tracking** (10% sampling): < 1ms overhead
- **Memory**: ~10MB additional RAM
- **Network**: Batched uploads (minimal impact)

**Overall**: < 1% performance overhead with recommended settings

## Monitoring Sentry Itself

Check Sentry health:

```bash
# View Sentry status
curl https://status.sentry.io/api/v2/status.json

# Check if events are being sent
# Look for logs like:
# "✅ Sentry error tracking initialized"
```

## Advanced Features

### Source Maps

Upload source maps for better stack traces:

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Upload source maps after build
sentry-cli releases new $SENTRY_RELEASE
sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps ./dist
sentry-cli releases finalize $SENTRY_RELEASE
```

### Custom Fingerprinting

Group similar errors together:

```javascript
Sentry.init({
  beforeSend(event) {
    // Custom grouping logic
    if (event.exception) {
      event.fingerprint = ['database-error', event.exception.type];
    }
    return event;
  }
});
```

### Performance Profiling

Enable CPU/memory profiling:

```javascript
const transaction = sentry.startTransaction('expensive-operation');
const span = transaction.startChild({ op: 'db.query' });

// ... do work

span.finish();
transaction.finish();
```

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Node.js SDK Guide](https://docs.sentry.io/platforms/node/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Alerts Guide](https://docs.sentry.io/product/alerts/)
- [Best Practices](https://docs.sentry.io/product/best-practices/)

## Support

For Sentry-specific issues:
- [Sentry Support](https://sentry.io/support/)
- [Community Forum](https://forum.sentry.io/)
- [GitHub Issues](https://github.com/getsentry/sentry-javascript)

For RoleRabbit Sentry integration:
- Check this documentation
- Review `apps/api/utils/sentry.js`
- Contact the development team
