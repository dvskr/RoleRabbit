/**
 * Admin Authorization Middleware
 * Ensures that only admin users can access protected routes
 * Must be used AFTER authenticate middleware
 */

/**
 * Require admin role for route access
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<void>}
 */
async function requireAdmin(request, reply) {
  try {
    // Ensure user is authenticated first
    if (!request.user || !request.user.id) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    // This checks multiple possible locations where role might be stored
    const userRole = request.user.role || request.user.userRole;
    const isAdmin = userRole === 'ADMIN' || userRole === 'admin';

    if (!isAdmin) {
      const logger = require('../utils/logger');
      logger.warn(`[AdminAuth] Non-admin user ${request.user.id} attempted to access admin route: ${request.method} ${request.url}`);

      return reply.status(403).send({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    // User is admin, continue to route handler
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('[AdminAuth] Error in admin authorization:', err);

    return reply.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to verify admin access'
    });
  }
}

module.exports = {
  requireAdmin
};
