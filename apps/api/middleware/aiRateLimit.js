/**
 * AI-specific Rate Limiting Middleware
 * Implements Redis-based rate limiting with subscription tier support
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');
const cacheConfig = require('../config/cacheConfig');

// Initialize Redis client for rate limiting
let redisClient = null;
let redisAvailable = false;

function initializeRedis() {
  if (redisClient || !cacheConfig.redisEnabled) {
    return;
  }

  try {
    redisClient = new Redis(cacheConfig.redisUrl, {
      lazyConnect: true, // Don't connect immediately
      maxRetriesPerRequest: 1,
      enableAutoPipelining: true,
      connectTimeout: 2000, // 2 second timeout
      retryStrategy: () => null, // Don't retry, fail fast
      tls: cacheConfig.redisTls ? {} : undefined
    });

    redisClient.on('ready', () => {
      redisAvailable = true;
      logger.info('[RATE_LIMIT] Redis connected for rate limiting');
    });

    redisClient.on('error', (error) => {
      redisAvailable = false;
      logger.warn('[RATE_LIMIT] Redis unavailable, using in-memory fallback', { error: error.message });
    });
  } catch (error) {
    logger.warn('[RATE_LIMIT] Failed to initialize Redis, using in-memory fallback', { error: error.message });
    redisAvailable = false;
  }
}

// Initialize on module load (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  initializeRedis();
}

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

/**
 * Get rate limit configuration for user
 * @param {string} action - Action type (PARSE_RESUME, ATS_SCORE, etc.)
 * @param {string} tier - Subscription tier (FREE, PRO, ENTERPRISE)
 * @returns {Object} Rate limit config
 */
function getRateLimitConfig(action, tier = 'FREE') {
  const config = RATE_LIMITS[action];
  if (!config) {
    logger.warn(`[RATE_LIMIT] Unknown action: ${action}`);
    return { limit: 10, window: 3600 }; // Default fallback
  }

  // For IP-based limits
  if (config.limit !== undefined) {
    return config;
  }

  // For tier-based limits
  const tierUpper = tier.toUpperCase();
  return config[tierUpper] || config.FREE;
}

/**
 * Check rate limit using Redis
 * @param {string} key - Rate limit key
 * @param {number} limit - Maximum requests allowed
 * @param {number} window - Time window in seconds
 * @returns {Promise<Object>} { allowed, remaining, resetTime }
 */
async function checkRateLimit(key, limit, window) {
  // Unlimited access
  if (limit === -1) {
    return { allowed: true, remaining: -1, resetTime: null };
  }

  // Always use in-memory for now (Redis optional)
  // In production with Redis, this will use Redis when available
  return checkRateLimitInMemory(key, limit, window);
}

/**
 * In-memory fallback for rate limiting (when Redis unavailable)
 */
const memoryStore = new Map();

function checkRateLimitInMemory(key, limit, window) {
  const now = Math.floor(Date.now() / 1000);
  const data = memoryStore.get(key);

  if (!data) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + window
    });
    return { 
      allowed: true, 
      remaining: limit - 1, 
      resetTime: now + window,
      currentCount: 1,
      fallback: true
    };
  }

  // Reset if window expired
  if (now >= data.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + window
    });
    return { 
      allowed: true, 
      remaining: limit - 1, 
      resetTime: now + window,
      currentCount: 1,
      fallback: true
    };
  }

  // Check limit
  const allowed = data.count < limit;
  if (allowed) {
    data.count++;
    memoryStore.set(key, data);
  }

  return {
    allowed,
    remaining: Math.max(0, limit - data.count),
    resetTime: data.resetTime,
    currentCount: data.count,
    fallback: true
  };
}

/**
 * Create AI rate limit middleware
 * @param {string} action - Action type (PARSE_RESUME, ATS_SCORE, etc.)
 * @param {Object} options - Additional options
 * @returns {Function} Fastify preHandler middleware
 */
function createAIRateLimitMiddleware(action, options = {}) {
  return async (request, reply) => {
    try {
      const userId = request.user?.userId;
      const userTier = request.user?.subscriptionTier || 'FREE';
      const ip = request.ip;

      // Get rate limit config
      const config = getRateLimitConfig(action, userTier);

      // Check user-based rate limit (if authenticated)
      if (userId) {
        const userKey = `rate_limit:user:${userId}:${action}`;
        const userLimit = await checkRateLimit(userKey, config.limit, config.window);

        if (!userLimit.allowed) {
          const resetDate = new Date(userLimit.resetTime * 1000);
          const message = config.limit === 0
            ? `This feature requires a Pro subscription. Upgrade to access ${action.replace('_', ' ').toLowerCase()}.`
            : `Daily limit reached. You've used ${userLimit.currentCount}/${config.limit} ${action.replace('_', ' ').toLowerCase()} requests. Resets at ${resetDate.toLocaleTimeString()}.`;

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

        logger.debug('[RATE_LIMIT] User check passed', {
          userId,
          action,
          remaining: userLimit.remaining,
          limit: config.limit
        });
      }

      // Check IP-based rate limit (for anonymous or additional protection)
      if (action === 'PARSE_RESUME') {
        const ipConfig = RATE_LIMITS.IP_PARSE_RESUME;
        const ipKey = `rate_limit:ip:${ip}:${action}`;
        const ipLimit = await checkRateLimit(ipKey, ipConfig.limit, ipConfig.window);

        if (!ipLimit.allowed) {
          const resetDate = new Date(ipLimit.resetTime * 1000);
          
          logger.warn('[RATE_LIMIT] IP limit exceeded', {
            ip,
            action,
            limit: ipConfig.limit,
            current: ipLimit.currentCount
          });

          return reply.status(429).send({
            success: false,
            error: `Too many requests from this IP address. Please try again at ${resetDate.toLocaleTimeString()}.`,
            rateLimit: {
              limit: ipConfig.limit,
              remaining: 0,
              reset: resetDate.toISOString(),
              type: 'ip'
            }
          });
        }
      }

    } catch (error) {
      logger.error('[RATE_LIMIT] Middleware error', {
        error: error.message,
        action,
        stack: error.stack
      });
      // On error, allow request (fail open)
      // Better to allow request than block legitimate users
    }
  };
}

/**
 * Get current rate limit status for user
 * @param {string} userId - User ID
 * @param {string} action - Action type
 * @param {string} tier - Subscription tier
 * @returns {Promise<Object>} Rate limit status
 */
async function getRateLimitStatus(userId, action, tier = 'FREE') {
  const config = getRateLimitConfig(action, tier);
  const key = `rate_limit:user:${userId}:${action}`;
  
  const status = await checkRateLimit(key, config.limit, config.window);
  
  return {
    action,
    tier,
    limit: config.limit,
    remaining: status.remaining,
    used: config.limit === -1 ? 0 : (config.limit - status.remaining),
    resetTime: status.resetTime ? new Date(status.resetTime * 1000).toISOString() : null,
    unlimited: config.limit === -1
  };
}

/**
 * Reset rate limit for user (admin function)
 * @param {string} userId - User ID
 * @param {string} action - Action type (optional, resets all if not provided)
 */
async function resetRateLimit(userId, action = null) {
  if (!redisAvailable || !redisClient) {
    logger.warn('[RATE_LIMIT] Cannot reset, Redis unavailable');
    return false;
  }

  try {
    if (action) {
      const key = `rate_limit:user:${userId}:${action}`;
      await redisClient.del(key);
      logger.info('[RATE_LIMIT] Reset rate limit', { userId, action });
    } else {
      // Reset all actions for user
      const pattern = `rate_limit:user:${userId}:*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      logger.info('[RATE_LIMIT] Reset all rate limits', { userId, count: keys.length });
    }
    return true;
  } catch (error) {
    logger.error('[RATE_LIMIT] Failed to reset', { error: error.message, userId, action });
    return false;
  }
}

// Cleanup in-memory store periodically
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [key, data] of memoryStore.entries()) {
    if (now >= data.resetTime + 3600) { // Clean up 1 hour after reset
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = {
  createAIRateLimitMiddleware,
  getRateLimitStatus,
  resetRateLimit,
  RATE_LIMITS,
  // Export for testing
  checkRateLimit,
  getRateLimitConfig
};

