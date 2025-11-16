/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse by limiting the number of requests per user/IP.
 * Uses in-memory store or Redis for distributed systems.
 */

const { sendErrorResponse, ErrorCodes } = require('../utils/errorHandler');

/**
 * In-memory rate limit store
 * For production, use Redis
 */
class RateLimitStore {
  constructor() {
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  /**
   * Get current count for key
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      return { count: 0, resetTime: null };
    }

    // Check if expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return { count: 0, resetTime: null };
    }

    return entry;
  }

  /**
   * Increment count for key
   */
  increment(key, windowMs) {
    const entry = this.get(key);
    
    if (entry.count === 0) {
      // First request in window
      this.store.set(key, {
        count: 1,
        resetTime: Date.now() + windowMs
      });
      return { count: 1, resetTime: Date.now() + windowMs };
    }

    // Increment existing
    entry.count++;
    this.store.set(key, entry);
    return entry;
  }

  /**
   * Reset count for key
   */
  reset(key) {
    this.store.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy store
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Global rate limit store
const globalStore = new RateLimitStore();

/**
 * Create rate limiter middleware
 * 
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.keyGenerator - Function to generate key (default: userId)
 * @param {Function} options.skip - Function to skip rate limiting
 * @param {Object} options.store - Custom store (Redis, etc.)
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 60, // 60 requests per minute
    keyGenerator = (req) => req.user?.id || req.ip,
    skip = () => false,
    store = globalStore,
    message = 'Too many requests, please try again later'
  } = options;

  return async (req, res, next) => {
    try {
      // Skip if condition met
      if (skip(req)) {
        return next();
      }

      // Generate key
      const key = keyGenerator(req);
      if (!key) {
        console.warn('Rate limiter: No key generated, skipping');
        return next();
      }

      // Get current count
      const { count, resetTime } = store.increment(key, windowMs);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

      // Check if limit exceeded
      if (count > max) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);

        console.warn(`Rate limit exceeded for key: ${key}`, {
          count,
          max,
          resetTime: new Date(resetTime).toISOString()
        });

        return sendErrorResponse(
          res,
          ErrorCodes.AI_RATE_LIMIT,
          message,
          {
            limit: max,
            current: count,
            retryAfter
          }
        );
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Don't block request on rate limiter error
      next();
    }
  };
}

/**
 * Pre-configured rate limiters
 */

/**
 * Resume CRUD rate limiter
 * 60 requests per minute per user
 */
const resumeCRUDLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 60,
  message: 'Too many resume operations. Please wait a moment and try again.'
});

/**
 * AI operations rate limiter
 * 10 requests per minute per user (more restrictive)
 */
const aiOperationsLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10,
  message: 'Too many AI requests. Please wait a moment and try again.'
});

/**
 * Export operations rate limiter
 * 20 exports per minute per user
 */
const exportLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 20,
  message: 'Too many export requests. Please wait a moment and try again.'
});

/**
 * Authentication rate limiter
 * 5 login attempts per 15 minutes per IP
 */
const authLimiter = createRateLimiter({
  windowMs: 900000, // 15 minutes
  max: 5,
  keyGenerator: (req) => req.ip,
  message: 'Too many login attempts. Please try again in 15 minutes.'
});

/**
 * Global API rate limiter
 * 1000 requests per 15 minutes per user
 */
const globalLimiter = createRateLimiter({
  windowMs: 900000, // 15 minutes
  max: 1000,
  message: 'Too many requests. Please slow down.'
});

/**
 * Redis-based rate limiter (for production)
 */
class RedisRateLimitStore {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async get(key) {
    try {
      const value = await this.redis.get(`ratelimit:${key}`);
      if (!value) {
        return { count: 0, resetTime: null };
      }

      const data = JSON.parse(value);
      return data;
    } catch (error) {
      console.error('Redis rate limit get error:', error);
      return { count: 0, resetTime: null };
    }
  }

  async increment(key, windowMs) {
    try {
      const redisKey = `ratelimit:${key}`;
      const exists = await this.redis.exists(redisKey);

      if (!exists) {
        // First request
        const resetTime = Date.now() + windowMs;
        const data = { count: 1, resetTime };
        await this.redis.setex(
          redisKey,
          Math.ceil(windowMs / 1000),
          JSON.stringify(data)
        );
        return data;
      }

      // Increment existing
      const value = await this.redis.get(redisKey);
      const data = JSON.parse(value);
      data.count++;
      await this.redis.setex(
        redisKey,
        Math.ceil((data.resetTime - Date.now()) / 1000),
        JSON.stringify(data)
      );
      return data;
    } catch (error) {
      console.error('Redis rate limit increment error:', error);
      return { count: 0, resetTime: Date.now() + windowMs };
    }
  }

  async reset(key) {
    try {
      await this.redis.del(`ratelimit:${key}`);
    } catch (error) {
      console.error('Redis rate limit reset error:', error);
    }
  }
}

/**
 * Create Redis rate limiter
 */
function createRedisRateLimiter(redisClient, options = {}) {
  const store = new RedisRateLimitStore(redisClient);
  return createRateLimiter({ ...options, store });
}

/**
 * Rate limit bypass for admin users
 */
function skipForAdmin(req) {
  return req.user?.role === 'admin' || req.user?.isAdmin === true;
}

module.exports = {
  createRateLimiter,
  resumeCRUDLimiter,
  aiOperationsLimiter,
  exportLimiter,
  authLimiter,
  globalLimiter,
  RedisRateLimitStore,
  createRedisRateLimiter,
  skipForAdmin,
  RateLimitStore
};
