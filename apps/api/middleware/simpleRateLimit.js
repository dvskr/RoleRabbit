/**
 * Simple In-Memory Rate Limiting
 * Production-ready rate limiting without Redis dependency
 */

const logger = require('../utils/logger');

/**
 * Rate limit configuration by subscription tier and action
 */
const RATE_LIMITS = {
  // Resume Parsing
  PARSE_RESUME: {
    FREE: { limit: 10, window: 3600 }, // 10 per hour
    PRO: { limit: 50, window: 3600 },  // 50 per hour
    ENTERPRISE: { limit: -1, window: 3600 } // Unlimited
  },
  
  // ATS Score Analysis
  ATS_SCORE: {
    FREE: { limit: 10, window: 86400 },      // 10 per day
    PRO: { limit: 50, window: 86400 },       // 50 per day
    ENTERPRISE: { limit: -1, window: 86400 } // Unlimited
  },
  
  // Resume Tailoring - PARTIAL mode
  TAILOR_PARTIAL: {
    FREE: { limit: 3, window: 86400 },       // 3 per day
    PRO: { limit: 20, window: 86400 },       // 20 per day
    ENTERPRISE: { limit: -1, window: 86400 } // Unlimited
  },
  
  // Resume Tailoring - FULL mode
  TAILOR_FULL: {
    FREE: { limit: 0, window: 86400 },       // 0 per day (must upgrade)
    PRO: { limit: 10, window: 86400 },       // 10 per day
    ENTERPRISE: { limit: -1, window: 86400 } // Unlimited
  },
  
  // IP-based limits (prevent anonymous abuse)
  IP_PARSE_RESUME: {
    limit: 3,
    window: 3600 // 3 per hour per IP
  }
};

// In-memory store
const store = new Map();

/**
 * Get rate limit configuration
 */
function getRateLimitConfig(action, tier = 'FREE') {
  const config = RATE_LIMITS[action];
  if (!config) {
    return { limit: 10, window: 3600 };
  }
  if (config.limit !== undefined) {
    return config;
  }
  const tierUpper = tier.toUpperCase();
  return config[tierUpper] || config.FREE;
}

/**
 * Check rate limit
 */
function checkRateLimit(key, limit, window) {
  // Unlimited access
  if (limit === -1) {
    return { allowed: true, remaining: -1, resetTime: null, currentCount: 0 };
  }

  const now = Math.floor(Date.now() / 1000);
  const data = store.get(key);

  if (!data) {
    store.set(key, {
      count: 1,
      resetTime: now + window
    });
    return { 
      allowed: true, 
      remaining: limit - 1, 
      resetTime: now + window,
      currentCount: 1
    };
  }

  // Reset if window expired
  if (now >= data.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + window
    });
    return { 
      allowed: true, 
      remaining: limit - 1, 
      resetTime: now + window,
      currentCount: 1
    };
  }

  // Check limit
  const allowed = data.count < limit;
  if (allowed) {
    data.count++;
    store.set(key, data);
  }

  return {
    allowed,
    remaining: Math.max(0, limit - data.count),
    resetTime: data.resetTime,
    currentCount: data.count
  };
}

/**
 * Create rate limit middleware
 */
function createAIRateLimitMiddleware(action) {
  return async (request, reply) => {
    try {
      const userId = request.user?.userId;
      const userTier = request.user?.subscriptionTier || 'FREE';
      const ip = request.ip;

      // Get rate limit config
      const config = getRateLimitConfig(action, userTier);

      // Check user-based rate limit
      if (userId) {
        const userKey = `rate_limit:user:${userId}:${action}`;
        const userLimit = checkRateLimit(userKey, config.limit, config.window);

        if (!userLimit.allowed) {
          const resetDate = new Date(userLimit.resetTime * 1000);
          const message = config.limit === 0
            ? `This feature requires a Pro subscription. Upgrade to access ${action.replace('_', ' ').toLowerCase()}.`
            : `Daily limit reached. You've used ${userLimit.currentCount}/${config.limit} requests. Resets at ${resetDate.toLocaleTimeString()}.`;

          logger.warn('[RATE_LIMIT] User limit exceeded', {
            userId,
            action,
            tier: userTier,
            limit: config.limit,
            current: userLimit.currentCount
          });

          return reply.status(429).send({
            success: false,
            error: message,
            rateLimit: {
              limit: config.limit,
              remaining: 0,
              reset: resetDate.toISOString(),
              tier: userTier
            }
          });
        }

        // Add rate limit headers
        reply.header('X-RateLimit-Limit', config.limit);
        reply.header('X-RateLimit-Remaining', userLimit.remaining);
        reply.header('X-RateLimit-Reset', userLimit.resetTime);
      }

      // Check IP-based rate limit for parsing
      if (action === 'PARSE_RESUME') {
        const ipConfig = RATE_LIMITS.IP_PARSE_RESUME;
        const ipKey = `rate_limit:ip:${ip}:${action}`;
        const ipLimit = checkRateLimit(ipKey, ipConfig.limit, ipConfig.window);

        if (!ipLimit.allowed) {
          const resetDate = new Date(ipLimit.resetTime * 1000);
          
          logger.warn('[RATE_LIMIT] IP limit exceeded', {
            ip,
            action,
            limit: ipConfig.limit
          });

          return reply.status(429).send({
            success: false,
            error: `Too many requests from this IP. Try again at ${resetDate.toLocaleTimeString()}.`,
            rateLimit: {
              limit: ipConfig.limit,
              remaining: 0,
              reset: resetDate.toISOString()
            }
          });
        }
      }
    } catch (error) {
      logger.error('[RATE_LIMIT] Error', { error: error.message });
      // Fail open - allow request on error
    }
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [key, data] of store.entries()) {
    if (now >= data.resetTime + 3600) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  createAIRateLimitMiddleware,
  checkRateLimit,
  getRateLimitConfig,
  RATE_LIMITS
};

