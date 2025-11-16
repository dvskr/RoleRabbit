/**
 * BE-051: CORS origin validation
 * Verifies request origin matches allowed origins
 */

const logger = require('./logger');

// Allowed origins from environment
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);

// Add default localhost origins for development
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001');
}

/**
 * Validate CORS origin
 * BE-051: CORS origin validation
 */
function validateOrigin(origin) {
  if (!origin) {
    return {
      valid: false,
      error: 'Origin header is missing'
    };
  }

  // Check if origin is in allowed list
  if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    logger.warn(`CORS validation failed: origin ${origin} not in allowed list`);
    return {
      valid: false,
      error: `Origin ${origin} is not allowed`
    };
  }

  return {
    valid: true
  };
}

/**
 * Get allowed origins
 */
function getAllowedOrigins() {
  return ALLOWED_ORIGINS;
}

module.exports = {
  validateOrigin,
  getAllowedOrigins
};

