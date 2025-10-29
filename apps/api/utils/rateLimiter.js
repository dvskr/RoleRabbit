/**
 * Rate Limiting Utility
 * Implements per-IP and per-user rate limiting
 */

const { getFromCache, setToCache } = require('./cache');
const logger = require('./logger');

/**
 * Check if request is within rate limit
 */
async function checkRateLimit(identifier, limit, windowMs) {
  try {
    const key = `ratelimit:${identifier}`;
    const current = parseInt(getFromCache(key) || '0');
    
    if (current >= limit) {
      logger.warn(`Rate limit exceeded for ${identifier}`);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + windowMs
      };
    }
    
    // Increment counter
    const newCount = current + 1;
    setToCache(key, newCount.toString(), windowMs);
    
    return {
      allowed: true,
      remaining: limit - newCount,
      resetTime: Date.now() + windowMs
    };
  } catch (error) {
    logger.error('Rate limit check failed', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: limit,
      resetTime: Date.now() + windowMs
    };
  }
}

/**
 * Get client identifier (IP address or user ID)
 */
function getClientIdentifier(request) {
  // Prioritize user ID if authenticated
  if (request.user?.userId) {
    return `user:${request.user.userId}`;
  }
  
  // Fall back to IP address
  return `ip:${request.ip || request.socket.remoteAddress}`;
}

/**
 * Apply rate limiting based on endpoint and user type
 */
function getRateLimitConfig(path) {
  // Strict limits for authentication endpoints
  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')) {
    return { limit: 5, windowMs: 15 * 60 * 1000 }; // 5 requests per 15 minutes
  }
  
  // Password reset endpoints
  if (path.startsWith('/api/auth/reset-password') || path.startsWith('/api/auth/forgot-password')) {
    return { limit: 3, windowMs: 60 * 60 * 1000 }; // 3 requests per hour
  }
  
  // General API endpoints
  if (path.startsWith('/api/')) {
    return { limit: 100, windowMs: 60 * 1000 }; // 100 requests per minute
  }
  
  // Default: very lenient
  return { limit: 1000, windowMs: 60 * 1000 };
}

/**
 * Rate limiting middleware factory
 */
function rateLimitMiddleware(options = {}) {
  const defaultOptions = {
    identifier: getClientIdentifier,
    getConfig: getRateLimitConfig
  };
  
  const config = { ...defaultOptions, ...options };
  
  return async (request, reply, done) => {
    try {
      const identifier = config.identifier(request);
      const rateConfig = config.getConfig(request.url);
      
      const result = await checkRateLimit(
        identifier,
        rateConfig.limit,
        rateConfig.windowMs
      );
      
      // Set rate limit headers
      reply.header('X-RateLimit-Limit', rateConfig.limit);
      reply.header('X-RateLimit-Remaining', result.remaining);
      reply.header('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      if (!result.allowed) {
        reply.code(429).send({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
        return;
      }
      
      done();
    } catch (error) {
      logger.error('Rate limiting middleware error', error);
      // On error, allow the request
      done();
    }
  };
}

module.exports = {
  checkRateLimit,
  getClientIdentifier,
  getRateLimitConfig,
  rateLimitMiddleware
};

