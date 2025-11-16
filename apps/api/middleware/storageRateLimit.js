/**
 * BE-039: Per-route rate limiting middleware for storage endpoints
 */

const { getStorageRateLimiter } = require('../utils/storageRateLimiter');
const { sendErrorResponse, ERROR_CODES } = require('../utils/errorResponse');
const logger = require('../utils/logger');

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map(); // key -> { count, resetTime }

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Create rate limiting middleware for storage endpoint
 * BE-039: Rate limiting per endpoint
 */
function createStorageRateLimitMiddleware(endpoint) {
  return async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      if (!userId) {
        // If not authenticated, skip rate limiting (auth middleware will handle it)
        return;
      }

      const rateLimiter = getStorageRateLimiter(endpoint);
      const key = `${endpoint}:${userId}`;
      const now = Date.now();

      // Get or create rate limit data
      let limitData = rateLimitStore.get(key);
      
      if (!limitData || now > limitData.resetTime) {
        // Initialize or reset
        limitData = {
          count: 0,
          resetTime: now + rateLimiter.timeWindow
        };
        rateLimitStore.set(key, limitData);
      }

      // Check if limit exceeded
      if (limitData.count >= rateLimiter.max) {
        const timeLeft = Math.ceil((limitData.resetTime - now) / 1000);
        logger.warn(`Rate limit exceeded for user ${userId} on endpoint ${endpoint}`);
        return sendErrorResponse(
          reply,
          429,
          ERROR_CODES.RATE_LIMIT_EXCEEDED,
          `Rate limit exceeded for ${endpoint}. Maximum ${rateLimiter.max} requests per ${rateLimiter.timeWindow / 1000} seconds. Please try again in ${timeLeft} seconds.`,
          {
            resetTime: limitData.resetTime,
            retryAfter: timeLeft
          }
        );
      }

      // Increment count
      limitData.count++;
      rateLimitStore.set(key, limitData);

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', rateLimiter.max);
      reply.header('X-RateLimit-Remaining', Math.max(0, rateLimiter.max - limitData.count));
      reply.header('X-RateLimit-Reset', Math.ceil(limitData.resetTime / 1000));
    } catch (error) {
      // Don't fail the request if rate limiting check fails
      logger.error('Rate limiting middleware error:', error);
    }
  };
}

module.exports = {
  createStorageRateLimitMiddleware
};

