/**
 * Rate limiting utilities for different endpoints
 * @module utils/rateLimiter
 */

/**
 * Create rate limiter configuration for profile endpoints
 * @param {number} max - Maximum requests per time window
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {Object} Rate limiter configuration
 */
function createRateLimiter(max, timeWindow) {
  return {
    max,
    timeWindow,
    skip: (request) => {
      // Skip rate limiting for localhost in development
      if (process.env.NODE_ENV !== 'production') {
        const isLocalhost = request.ip === '127.0.0.1' || 
                           request.ip === '::1' || 
                           request.ip === '::ffff:127.0.0.1' || 
                           request.hostname === 'localhost';
        if (isLocalhost) {
          return true;
        }
      }
      return false;
    },
    errorResponseBuilder: (request, context) => {
      return {
        error: 'Rate limit exceeded. Please try again later.',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(context.ttl / 1000)
      };
    }
  };
}

// Profile GET endpoint: 60 requests per minute
const profileGetLimiter = createRateLimiter(60, 60 * 1000);

// Profile PUT endpoint: 10 requests per minute
const profilePutLimiter = createRateLimiter(10, 60 * 1000);

// Profile picture upload: 5 requests per minute
const profilePictureLimiter = createRateLimiter(5, 60 * 1000);

module.exports = {
  profileGetLimiter,
  profilePutLimiter,
  profilePictureLimiter,
  createRateLimiter
};
