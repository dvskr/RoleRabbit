/**
 * User Routes Module
 * 
 * Handles user profile and user-related routes
 */

const { getUserById } = require('../auth');
const { authenticate } = require('../middleware/auth');

/**
 * Register all user routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function userRoutes(fastify, options) {
  // Get user profile
  fastify.get('/api/users/profile', {
    preHandler: authenticate
  }, async (request, reply) => {
    const userId = request.user.userId;
    const user = await getUserById(userId);
    
    if (!user) {
      reply.status(404).send({ error: 'User not found' });
      return;
    }
    
    return { user };
  });
}

module.exports = userRoutes;

