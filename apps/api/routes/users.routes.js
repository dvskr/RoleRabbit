/**
 * User Routes Module
 * 
 * Handles user profile and user-related routes
 */

const { getUserById } = require('../auth');
const { authenticate } = require('../middleware/auth');
const { validateEmail } = require('../utils/validation');
const { errorHandler } = require('../utils/errorMiddleware');

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

  // Update user profile
  fastify.put('/api/users/profile', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const updates = request.body;
    
    // Get user first
    const user = await getUserById(userId);
    if (!user) {
      reply.status(404).send({ error: 'User not found' });
      return;
    }

    // Update user fields (only allow safe fields that exist in schema)
    const allowedFields = ['name', 'email', 'profilePicture'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // If email is being updated, validate it
    if (updateData.email && !validateEmail(updateData.email)) {
      reply.status(400).send({ error: 'Invalid email format' });
      return;
    }

    // Update in database
    const { prisma } = require('../utils/db');
    
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return { user: updatedUser, success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      reply.status(500).send({ error: 'Failed to update profile', details: error.message });
      return;
    }
  }));
}

module.exports = userRoutes;

