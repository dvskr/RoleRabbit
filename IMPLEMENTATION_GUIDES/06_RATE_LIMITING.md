# Rate Limiting Implementation Guide

## Overview
Implement rate limiting to prevent abuse of file upload endpoints (10 uploads/minute per user).

## Implementation Steps

### Step 1: Install Rate Limiting Package
```bash
cd apps/api
npm install @fastify/rate-limit
```

### Step 2: Create Rate Limit Configuration
Create `apps/api/config/rateLimits.js`:

```javascript
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis client for distributed rate limiting (production)
let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    redisClient = new Redis(redisUrl);
    logger.info('✅ Redis connected for rate limiting');
  }

  return redisClient;
}

// Rate limit configurations
const rateLimits = {
  // File uploads: 10 per minute per user
  fileUpload: {
    max: 10,
    timeWindow: '1 minute',
    allowList: (req) => {
      // Premium users get higher limits
      return req.user?.subscriptionTier === 'PREMIUM' ? 50 : undefined;
    },
    keyGenerator: (req) => {
      // Rate limit per user
      return `upload:${req.user?.userId || req.user?.id || req.ip}`;
    },
    errorResponseBuilder: (req, context) => {
      return {
        error: 'Rate limit exceeded',
        message: `Too many upload attempts. Please wait ${Math.ceil(context.ttl / 1000)} seconds.`,
        retryAfter: Math.ceil(context.ttl / 1000),
        limit: context.max,
        remaining: context.remaining
      };
    },
    // Use Redis if available (production), otherwise in-memory (development)
    redis: getRedisClient()
  },

  // File downloads: 100 per minute per user
  fileDownload: {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => {
      return `download:${req.user?.userId || req.user?.id || req.ip}`;
    },
    redis: getRedisClient()
  },

  // API calls: 1000 per minute per user
  general: {
    max: 1000,
    timeWindow: '1 minute',
    keyGenerator: (req) => {
      return `api:${req.user?.userId || req.user?.id || req.ip}`;
    },
    redis: getRedisClient()
  }
};

module.exports = rateLimits;
```

### Step 3: Apply Rate Limiting to Upload Endpoint
Update `apps/api/routes/storage.routes.js`:

```javascript
const rateLimit = require('@fastify/rate-limit');
const rateLimits = require('../config/rateLimits');

async function storageRoutes(fastify, _options) {
  // Register rate limiter plugin
  await fastify.register(rateLimit, {
    global: false, // Don't apply globally, apply per-route
  });

  // File Upload with rate limiting
  fastify.post('/files/upload', {
    preHandler: [authenticate],
    config: {
      rateLimit: rateLimits.fileUpload
    }
  }, async (request, reply) => {
    // Upload handler...
  });

  // File Download with rate limiting
  fastify.get('/files/:id/download', {
    preHandler: [authenticate],
    config: {
      rateLimit: rateLimits.fileDownload
    }
  }, async (request, reply) => {
    // Download handler...
  });
}
```

### Step 4: Add Redis for Production
Install Redis client:
```bash
npm install ioredis
```

Add to `.env`:
```env
REDIS_URL=redis://localhost:6379
# Or for production:
# REDIS_URL=redis://user:password@redis-host:6379
```

### Step 5: Setup Redis (Production)
```bash
# Docker
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Or use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
```

### Step 6: Add Rate Limit Headers
Update response to include rate limit info:

```javascript
// In rate limit errorResponseBuilder
reply.header('X-RateLimit-Limit', context.max);
reply.header('X-RateLimit-Remaining', context.remaining);
reply.header('X-RateLimit-Reset', new Date(Date.now() + context.ttl).toISOString());
reply.header('Retry-After', Math.ceil(context.ttl / 1000));
```

### Step 7: Custom Rate Limits by Subscription Tier
```javascript
const getRateLimitForUser = (user) => {
  const tier = user?.subscriptionTier;

  const limits = {
    FREE: { uploads: 10, downloads: 50 },
    PRO: { uploads: 50, downloads: 200 },
    PREMIUM: { uploads: 200, downloads: 1000 }
  };

  return limits[tier] || limits.FREE;
};

// In rate limit config
allowList: (req) => {
  const limits = getRateLimitForUser(req.user);
  return limits.uploads;
}
```

### Step 8: Monitor Rate Limit Violations
```javascript
const logger = require('./logger');

// Log rate limit violations
onExceeding: (req) => {
  logger.warn('Rate limit warning', {
    userId: req.user?.userId,
    endpoint: req.url,
    ip: req.ip,
    remaining: req.rateLimit.remaining
  });
},

onExceeded: (req) => {
  logger.error('Rate limit exceeded', {
    userId: req.user?.userId,
    endpoint: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Optional: Send alert to monitoring service
  // sentry.captureMessage('Rate limit exceeded', { extra: { userId, ip } });
}
```

### Step 9: Frontend Integration
Update frontend to handle rate limits:

```typescript
// apps/web/src/services/apiService.ts

async handleRateLimitError(response: Response) {
  const retryAfter = response.headers.get('Retry-After');
  const resetTime = response.headers.get('X-RateLimit-Reset');

  if (retryAfter) {
    const seconds = parseInt(retryAfter);
    throw new Error(
      `Rate limit exceeded. Please wait ${seconds} seconds before trying again.`
    );
  }
}
```

### Step 10: Testing
```javascript
describe('Rate Limiting', () => {
  test('should limit uploads to 10 per minute', async () => {
    // Make 10 successful uploads
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/api/storage/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', buffer, 'test.pdf');

      expect(response.status).toBe(201);
    }

    // 11th upload should be rate limited
    const response = await request(app)
      .post('/api/storage/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, 'test.pdf');

    expect(response.status).toBe(429);
    expect(response.body.error).toContain('Rate limit exceeded');
  });
});
```

## Performance Impact
- Redis lookup: ~1-2ms per request
- In-memory: <1ms per request
- Minimal overhead

## Cost Estimate
- Redis Cloud (500MB): $15/month
- AWS ElastiCache (t3.micro): $12/month
- Self-hosted: Free

## Estimated Implementation Time
- Setup: 1 hour
- Integration: 2 hours
- Testing: 1 hour
- **Total: 4 hours**
