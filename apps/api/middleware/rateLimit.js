/**
 * Rate limiting middleware for specific routes
 * @module middleware/rateLimit
 */

const { profileGetLimiter, profilePutLimiter, profilePictureLimiter } = require('../utils/rateLimiter');

/**
 * Create rate limit middleware
 * @param {Object} limiterConfig - Rate limiter configuration
 * @returns {Function} Fastify preHandler middleware
 */
function createRateLimitMiddleware(limiterConfig) {
  return async (request, reply) => {
    // Skip if in development and localhost
    if (limiterConfig.skip && limiterConfig.skip(request)) {
      return;
    }

    // Simple in-memory rate limiting (for production, use Redis)
    const key = `rate_limit:${request.ip}:${request.routerPath}`;
    const now = Date.now();
    
    // Get or initialize rate limit data
    if (!request.server.rateLimitStore) {
      request.server.rateLimitStore = new Map();
    }
    
    const store = request.server.rateLimitStore;
    const limitData = store.get(key);
    
    if (limitData) {
      // Check if time window has passed
      if (now - limitData.resetTime > limiterConfig.timeWindow) {
        // Reset counter
        store.set(key, {
          count: 1,
          resetTime: now
        });
        return;
      }
      
      // Check if limit exceeded
      if (limitData.count >= limiterConfig.max) {
        const ttl = limiterConfig.timeWindow - (now - limitData.resetTime);
        return reply.status(429).send(limiterConfig.errorResponseBuilder(request, { ttl }));
      }
      
      // Increment counter
      limitData.count++;
      store.set(key, limitData);
    } else {
      // First request
      store.set(key, {
        count: 1,
        resetTime: now
      });
    }
    
    // Clean up old entries periodically (every 5 minutes)
    if (!request.server.rateLimitCleanup) {
      request.server.rateLimitCleanup = setInterval(() => {
        const store = request.server.rateLimitStore;
        if (store) {
          const now = Date.now();
          for (const [key, data] of store.entries()) {
            if (now - data.resetTime > limiterConfig.timeWindow * 2) {
              store.delete(key);
            }
          }
        }
      }, 5 * 60 * 1000);
    }
  };
}

/**
 * Rate limit middleware for profile GET endpoint (60 req/min)
 */
const profileGetRateLimit = createRateLimitMiddleware(profileGetLimiter);

/**
 * Rate limit middleware for profile PUT endpoint (10 req/min)
 */
const profilePutRateLimit = createRateLimitMiddleware(profilePutLimiter);

/**
 * Rate limit middleware for profile picture upload (5 req/min)
 */
const profilePictureRateLimit = createRateLimitMiddleware(profilePictureLimiter);

module.exports = {
  profileGetRateLimit,
  profilePutRateLimit,
  profilePictureRateLimit,
  createRateLimitMiddleware
};

