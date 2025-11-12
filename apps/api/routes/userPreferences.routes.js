const { authenticate } = require('../middleware/auth');
const {
  getUserTailoringPreferences,
  updateUserTailoringPreferences,
  resetUserTailoringPreferences,
  getUserPreferences,
} = require('../services/userPreferencesService');

module.exports = async function (fastify) {
  /**
   * GET /api/user/preferences/tailoring
   * Get user's tailoring preferences
   */
  fastify.get('/api/user/preferences/tailoring', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const preferences = await getUserTailoringPreferences(userId);
      
      return reply.send({
        success: true,
        preferences,
      });
    } catch (error) {
      fastify.log.error('Failed to get tailoring preferences:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get tailoring preferences',
      });
    }
  });

  /**
   * PUT /api/user/preferences/tailoring
   * Update user's tailoring preferences
   */
  fastify.put('/api/user/preferences/tailoring', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { mode, tone, length } = request.body;

      if (!mode && !tone && !length) {
        return reply.status(400).send({
          success: false,
          error: 'At least one preference (mode, tone, or length) must be provided',
        });
      }

      const preferences = await updateUserTailoringPreferences(userId, { mode, tone, length });
      
      return reply.send({
        success: true,
        preferences,
      });
    } catch (error) {
      fastify.log.error('Failed to update tailoring preferences:', error);
      return reply.status(400).send({
        success: false,
        error: error.message || 'Failed to update tailoring preferences',
      });
    }
  });

  /**
   * POST /api/user/preferences/tailoring/reset
   * Reset user's tailoring preferences to defaults
   */
  fastify.post('/api/user/preferences/tailoring/reset', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const preferences = await resetUserTailoringPreferences(userId);
      
      return reply.send({
        success: true,
        preferences,
      });
    } catch (error) {
      fastify.log.error('Failed to reset tailoring preferences:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to reset tailoring preferences',
      });
    }
  });

  /**
   * GET /api/user/preferences
   * Get all user preferences
   */
  fastify.get('/api/user/preferences', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const preferences = await getUserPreferences(userId);
      
      return reply.send({
        success: true,
        preferences,
      });
    } catch (error) {
      fastify.log.error('Failed to get user preferences:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get user preferences',
      });
    }
  });
};

