/**
 * CSRF Protection Utility
 * Generates and validates CSRF tokens
 */

const crypto = require('crypto');

/**
 * Generate a CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Store CSRF token in session/cookie
 */
const { getFromCache, setToCache } = require('./cache');

function setCsrfToken(sessionId, token) {
  const key = `csrf:${sessionId}`;
  // Store with 24 hour expiry
  return setToCache(key, token, 24 * 60 * 60 * 1000);
}

/**
 * Validate CSRF token
 */
async function validateCsrfToken(sessionId, token) {
  if (!sessionId || !token) {
    return false;
  }
  
  const key = `csrf:${sessionId}`;
  const storedToken = getFromCache(key);
  
  return storedToken === token;
}

/**
 * Middleware to generate and inject CSRF token
 */
function csrfMiddleware(request, reply, done) {
  // Only apply to state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return done();
  }
  
  const sessionId = request.cookies?.sessionId;
  const csrfToken = request.headers['x-csrf-token'];
  
  if (!sessionId || !csrfToken) {
    reply.status(403).send({ error: 'CSRF token missing' });
    return;
  }
  
  // For Fastify, we need to make this async-compatible
  validateCsrfToken(sessionId, csrfToken).then(isValid => {
    if (!isValid) {
      reply.code(403).send({ error: 'Invalid CSRF token' });
      return;
    }
    done();
  }).catch(() => {
    reply.code(403).send({ error: 'CSRF validation failed' });
  });
}

module.exports = {
  generateCsrfToken,
  setCsrfToken,
  validateCsrfToken,
  csrfMiddleware
};

