/**
 * Enhanced Rate Limiter
 * Token bucket algorithm with sliding window
 */

const cache = require('./cache');

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.algorithm = options.algorithm || 'token-bucket';
  }

  check(key) {
    const now = Date.now();
    const cacheKey = `rateLimit:${key}`;
    
    let tokens = cache.get(cacheKey);
    
    if (!tokens) {
      tokens = {
        count: this.maxRequests,
        resetTime: now + this.windowMs
      };
      cache.set(cacheKey, tokens, this.windowMs);
    }

    if (now > tokens.resetTime) {
      tokens.count = this.maxRequests;
      tokens.resetTime = now + this.windowMs;
    }

    if (tokens.count <= 0) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: tokens.resetTime
      };
    }

    tokens.count--;
    cache.set(cacheKey, tokens, this.windowMs);

    return {
      allowed: true,
      remaining: tokens.count,
      resetTime: tokens.resetTime
    };
  }

  reset(key) {
    const cacheKey = `rateLimit:${key}`;
    cache.delete(cacheKey);
  }
}

const rateLimiter = new RateLimiter();

module.exports = rateLimiter;

