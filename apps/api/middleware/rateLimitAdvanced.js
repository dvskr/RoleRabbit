/**
 * Advanced Rate Limiting
 * 
 * Per-user and global rate limiting with Redis backend
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

/**
 * Redis client for rate limiting
 */
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  enableOfflineQueue: false
});

/**
 * Global rate limit (all requests)
 * 10,000 requests per minute across all users
 */
const globalRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10000, // 10,000 requests
  message: {
    success: false,
    error: 'Too many requests from this server. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED_GLOBAL'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED_GLOBAL',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

/**
 * Per-user rate limit
 * 60 requests per minute per user
 */
const perUserRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED_USER'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = res.getHeader('Retry-After');
    res.status(429).json({
      success: false,
      error: 'You have exceeded the rate limit. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED_USER',
      retryAfter,
      limit: 60,
      window: '1 minute'
    });
  }
});

/**
 * AI operations rate limit
 * 10 requests per minute per user (more restrictive)
 */
const aiRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'AI operation rate limit exceeded. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED_AI'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'You have exceeded the AI operation rate limit.',
      code: 'RATE_LIMIT_EXCEEDED_AI',
      retryAfter: res.getHeader('Retry-After'),
      limit: 10,
      window: '1 minute',
      suggestion: 'Consider upgrading to a premium plan for higher limits'
    });
  }
});

/**
 * File upload rate limit
 * 5 uploads per minute per user
 */
const uploadRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'File upload rate limit exceeded.',
    code: 'RATE_LIMIT_EXCEEDED_UPLOAD'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Export rate limit
 * 10 exports per minute per user
 */
const exportRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:export:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 exports
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'Export rate limit exceeded.',
    code: 'RATE_LIMIT_EXCEEDED_EXPORT'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Tier-based rate limiting
 * Different limits for free, pro, and premium users
 */
function tierBasedRateLimit(limits) {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:tier:'
    }),
    windowMs: 60 * 1000, // 1 minute
    max: (req) => {
      const tier = req.user?.tier || 'free';
      return limits[tier] || limits.free;
    },
    keyGenerator: (req) => `${req.user?.tier || 'free'}:${req.user?.id || req.ip}`,
    message: {
      success: false,
      error: 'Rate limit exceeded for your tier.',
      code: 'RATE_LIMIT_EXCEEDED_TIER'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const tier = req.user?.tier || 'free';
      const limit = limits[tier] || limits.free;
      
      res.status(429).json({
        success: false,
        error: 'You have exceeded the rate limit for your tier.',
        code: 'RATE_LIMIT_EXCEEDED_TIER',
        retryAfter: res.getHeader('Retry-After'),
        currentTier: tier,
        limit,
        suggestion: tier === 'free' ? 'Upgrade to Pro for higher limits' : undefined
      });
    }
  });
}

/**
 * Custom rate limit for specific operations
 */
function createRateLimit(options) {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: options.prefix || 'rl:custom:'
    }),
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 60,
    keyGenerator: options.keyGenerator || ((req) => req.user?.id || req.ip),
    message: options.message || {
      success: false,
      error: 'Rate limit exceeded.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: options.handler
  });
}

/**
 * Get rate limit status for a user
 */
async function getRateLimitStatus(userId, prefix = 'rl:user:') {
  try {
    const key = `${prefix}${userId}`;
    const ttl = await redisClient.ttl(key);
    const count = await redisClient.get(key);
    
    return {
      remaining: count ? 60 - parseInt(count) : 60,
      resetIn: ttl > 0 ? ttl : 60,
      limit: 60
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return null;
  }
}

module.exports = {
  globalRateLimit,
  perUserRateLimit,
  aiRateLimit,
  uploadRateLimit,
  exportRateLimit,
  tierBasedRateLimit,
  createRateLimit,
  getRateLimitStatus
};

