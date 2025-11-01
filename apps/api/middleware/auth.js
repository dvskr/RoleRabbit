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
    // The hook in server.js already sets Authorization header from cookie if needed
    // So jwtVerify() should work for both cookie and header tokens
    await request.jwtVerify();
    // Authentication successful - jwtVerify sets request.user automatically
  } catch (err) {
    // Debug logging
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth] Authentication failed for ${request.method} ${request.url}:`, {
        hasCookie: !!request.cookies?.auth_token,
        hasAuthHeader: !!request.headers.authorization,
        error: err.message
      });
    }
    
    // Authentication failed, send 401 response
    let errorMessage = 'Unauthorized';
    if (err.message) {
      if (err.message.includes('expired')) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.message.includes('No authorization') || err.message.includes('missing or malformed')) {
        errorMessage = 'No authentication token provided. Please log in.';
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

