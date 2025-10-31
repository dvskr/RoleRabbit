/**
 * Analytics Routes Module
 * 
 * Handles all analytics-related routes
 */

const { 
  getAnalyticsByUserId,
  getAnalyticsById,
  createAnalytics,
  updateAnalytics,
  deleteAnalytics,
  getAnalyticsByType
} = require('../utils/analytics');
const { authenticate } = require('../middleware/auth');

/**
 * Register all analytics routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function analyticsRoutes(fastify, options) {
  // Get all analytics for user
  fastify.get('/api/analytics', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const type = request.query.type;
      
      const analytics = type 
        ? await getAnalyticsByType(userId, type)
        : await getAnalyticsByUserId(userId);
      
      return { analytics };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new analytics entry
  fastify.post('/api/analytics', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const analyticsData = request.body;
      
      const analytics = await createAnalytics(userId, analyticsData);
      return { success: true, analytics };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single analytics by ID
  fastify.get('/api/analytics/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const analytics = await getAnalyticsById(id);
      
      if (!analytics) {
        reply.status(404).send({ error: 'Analytics not found' });
        return;
      }
      
      if (analytics.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { analytics };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update analytics
  fastify.put('/api/analytics/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      const existingAnalytics = await getAnalyticsById(id);
      if (!existingAnalytics) {
        reply.status(404).send({ error: 'Analytics not found' });
        return;
      }
      if (existingAnalytics.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const analytics = await updateAnalytics(id, updates);
      return { success: true, analytics };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete analytics
  fastify.delete('/api/analytics/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingAnalytics = await getAnalyticsById(id);
      if (!existingAnalytics) {
        reply.status(404).send({ error: 'Analytics not found' });
        return;
      }
      if (existingAnalytics.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteAnalytics(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = analyticsRoutes;

