/**
 * Middleware utilities
 * Provides reusable middleware functions
 */

const logger = require('./logger');

/**
 * Request sanitization middleware
 */
function sanitizeRequest(request, reply, next) {
  // Sanitize query parameters
  if (request.query) {
    Object.keys(request.query).forEach(key => {
      if (typeof request.query[key] === 'string') {
        request.query[key] = sanitizeString(request.query[key]);
      }
    });
  }

  // Sanitize body parameters
  if (request.body && typeof request.body === 'object') {
    sanitizeObject(request.body);
  }

  next();
}

/**
 * Sanitize a string
 */
function sanitizeString(str) {
  return str
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * Request logging middleware
 */
function logRequest(request, reply, next) {
  const start = Date.now();
  
  reply.addHook('onSend', (request, reply, payload, done) => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });
    
    done();
  });
  
  next();
}

/**
 * Add security headers
 */
async function addSecurityHeaders(request, reply) {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  reply.header('Content-Security-Policy', "default-src 'self'");
}

/**
 * Validate request content type
 */
function validateContentType(request, reply, next) {
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers['content-type'];
    
    if (contentType && !contentType.includes('application/json') && 
        !contentType.includes('multipart/form-data')) {
      return reply.status(415).send({
        error: 'Unsupported Content-Type. Expected application/json'
      });
    }
  }
  
  next();
}

module.exports = {
  sanitizeRequest,
  logRequest,
  addSecurityHeaders,
  validateContentType
};

