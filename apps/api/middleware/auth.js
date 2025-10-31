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
    await request.jwtVerify();
    // Authentication successful, continue to route handler
  } catch (err) {
    // Authentication failed, send 401 response
    // Most routes use { error: 'Unauthorized' } format
    reply.status(401).send({ error: 'Unauthorized' });
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

