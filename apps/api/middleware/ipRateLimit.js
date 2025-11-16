/**
 * IP-Based Rate Limiting Middleware
 * 
 * Implements rate limiting based on IP address:
 * - Login attempts: 5 per 15 minutes
 * - API requests: 100 per minute per IP
 * - Signup attempts: 3 per hour per IP
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Rate limit configurations
const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many signup attempts. Please try again in 1 hour.'
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please try again in a minute.'
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset attempts. Please try again in 1 hour.'
  }
};

/**
 * Get client IP address from request
 * 
 * @param {Object} req - Express request
 * @returns {string} - IP address
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Check rate limit for IP address
 * 
 * @param {string} ipAddress - IP address
 * @param {string} action - Action type ('login', 'signup', 'api', etc.)
 * @returns {Object} - { allowed: boolean, remaining: number, resetAt: Date }
 */
async function checkRateLimit(ipAddress, action) {
  const config = RATE_LIMITS[action] || RATE_LIMITS.api;
  const windowStart = new Date(Date.now() - config.windowMs);
  
  try {
    // Count attempts in current window
    const attempts = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM login_attempts
      WHERE ip_address = '${ipAddress}'
        AND attempted_at >= '${windowStart.toISOString()}'
    `);
    
    const count = parseInt(attempts[0]?.count || 0);
    const remaining = Math.max(0, config.maxAttempts - count);
    const allowed = count < config.maxAttempts;
    
    const resetAt = new Date(Date.now() + config.windowMs);
    
    return {
      allowed,
      remaining,
      resetAt,
      limit: config.maxAttempts
    };
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    // Fail open: allow request if rate limit check fails
    return {
      allowed: true,
      remaining: config.maxAttempts,
      resetAt: new Date(Date.now() + config.windowMs),
      limit: config.maxAttempts
    };
  }
}

/**
 * Log login attempt
 * 
 * @param {Object} params - Parameters
 * @param {string} params.email - Email address
 * @param {string} params.userId - User ID (if successful)
 * @param {string} params.ipAddress - IP address
 * @param {boolean} params.success - Whether attempt was successful
 * @param {string} params.failureReason - Reason for failure
 */
async function logLoginAttempt({ email, userId, ipAddress, success, failureReason }) {
  try {
    await prisma.$executeRaw`
      INSERT INTO login_attempts (
        id, email, user_id, ip_address, success, failure_reason, attempted_at
      ) VALUES (
        ${crypto.randomUUID()},
        ${email},
        ${userId},
        ${ipAddress},
        ${success},
        ${failureReason},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

/**
 * Middleware: Rate limit login attempts
 */
function rateLimitLogin() {
  return async (req, res, next) => {
    const ipAddress = getClientIP(req);
    const { email } = req.body;
    
    try {
      const rateLimit = await checkRateLimit(ipAddress, 'login');
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimit.limit);
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toISOString());
      
      if (!rateLimit.allowed) {
        // Log failed attempt due to rate limit
        await logLoginAttempt({
          email,
          userId: null,
          ipAddress,
          success: false,
          failureReason: 'rate_limit_exceeded'
        });
        
        return res.status(429).json({
          success: false,
          error: RATE_LIMITS.login.message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((rateLimit.resetAt - new Date()) / 1000)
        });
      }
      
      // Attach rate limit info to request
      req.rateLimit = rateLimit;
      req.clientIP = ipAddress;
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Fail open: allow request if middleware fails
      next();
    }
  };
}

/**
 * Middleware: Rate limit signup attempts
 */
function rateLimitSignup() {
  return async (req, res, next) => {
    const ipAddress = getClientIP(req);
    
    try {
      const rateLimit = await checkRateLimit(ipAddress, 'signup');
      
      res.setHeader('X-RateLimit-Limit', rateLimit.limit);
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toISOString());
      
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: RATE_LIMITS.signup.message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((rateLimit.resetAt - new Date()) / 1000)
        });
      }
      
      req.rateLimit = rateLimit;
      req.clientIP = ipAddress;
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next();
    }
  };
}

/**
 * Middleware: Rate limit API requests
 */
function rateLimitAPI() {
  return async (req, res, next) => {
    const ipAddress = getClientIP(req);
    
    try {
      const rateLimit = await checkRateLimit(ipAddress, 'api');
      
      res.setHeader('X-RateLimit-Limit', rateLimit.limit);
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toISOString());
      
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: RATE_LIMITS.api.message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((rateLimit.resetAt - new Date()) / 1000)
        });
      }
      
      req.rateLimit = rateLimit;
      req.clientIP = ipAddress;
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next();
    }
  };
}

/**
 * Middleware: Rate limit password reset attempts
 */
function rateLimitPasswordReset() {
  return async (req, res, next) => {
    const ipAddress = getClientIP(req);
    
    try {
      const rateLimit = await checkRateLimit(ipAddress, 'passwordReset');
      
      res.setHeader('X-RateLimit-Limit', rateLimit.limit);
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toISOString());
      
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: RATE_LIMITS.passwordReset.message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((rateLimit.resetAt - new Date()) / 1000)
        });
      }
      
      req.rateLimit = rateLimit;
      req.clientIP = ipAddress;
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next();
    }
  };
}

/**
 * Clean up old login attempts
 * 
 * @returns {number} - Number of attempts deleted
 */
async function cleanupOldLoginAttempts() {
  try {
    // Keep last 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM login_attempts
      WHERE attempted_at < '${cutoffDate.toISOString()}'
    `);
    
    console.log(`Cleaned up ${result} old login attempts`);
    return result;
  } catch (error) {
    console.error('Failed to cleanup old login attempts:', error);
    return 0;
  }
}

module.exports = {
  RATE_LIMITS,
  getClientIP,
  checkRateLimit,
  logLoginAttempt,
  rateLimitLogin,
  rateLimitSignup,
  rateLimitAPI,
  rateLimitPasswordReset,
  cleanupOldLoginAttempts
};
