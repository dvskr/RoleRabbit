// Security utilities for API
const bcrypt = require('bcrypt');

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Sanitize user input to prevent XSS attacks
 */
function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Remove script tags, iframes, and event handlers
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isStrongPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
}

/**
 * Generate a random JWT secret
 */
function generateJWTSecret() {
  return require('crypto').randomBytes(64).toString('hex');
}

/**
 * Rate limiter configuration
 */
function getRateLimitConfig() {
  return {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  sanitizeInput,
  isValidEmail,
  isStrongPassword,
  generateJWTSecret,
  getRateLimitConfig
};

