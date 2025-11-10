/**
 * Authentication Middleware
 * Reusable middleware for JWT authentication
 * Ensures consistent authentication handling across all protected routes
 */

/**
 * Authenticate request using JWT
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<void>}
 */
async function authenticate(request, reply) {
  try {
    // Allow CORS preflight requests to pass through without authentication
    if (request.method === 'OPTIONS') {
      return;
    }
    // The hook in server.js already sets Authorization header from cookie if needed
    // So jwtVerify() should work for both cookie and header tokens
    await request.jwtVerify();
    // Authentication successful - jwtVerify sets request.user automatically
  } catch (err) {
    // Debug logging - always log in development
    const authDebug = {
      method: request.method,
      url: request.url,
      hasCookie: !!request.cookies?.auth_token,
      cookieValue: request.cookies?.auth_token ? `${request.cookies.auth_token.substring(0, 20)}...` : 'none',
      hasAuthHeader: !!request.headers.authorization,
      authHeaderValue: request.headers.authorization ? `${request.headers.authorization.substring(0, 20)}...` : 'none',
      error: err.message,
      errorCode: err.code
    };
    
    // Use logger instead of console.log for production readiness
    const logger = require('../utils/logger');
    logger.debug(`[Auth] Authentication failed:`, authDebug);
    
    const origin = request.headers.origin || process.env.CORS_ORIGIN || 'http://localhost:3000';
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
    
    // Authentication failed, send 401 response
    let errorMessage = 'Unauthorized';
    if (err.message) {
      if (err.message.includes('expired')) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.message.includes('No authorization') || err.message.includes('missing or malformed')) {
        errorMessage = 'No authentication token provided. Please log in.';
      } else if (err.message.includes('invalid') || err.message.includes('malformed')) {
        errorMessage = 'Invalid authentication token. Please log in again.';
      }
    }
    reply.status(401).send({ error: errorMessage });
  }
}

/**
 * Optional authentication - doesn't fail if token is missing
 * Useful for routes that work with or without authentication
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<void>}
 */
async function optionalAuthenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    // Don't fail, just continue without setting request.user
    // Route handler can check if request.user exists
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate
};

