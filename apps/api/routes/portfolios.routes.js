/**
 * Portfolio Routes Module
 * 
 * Handles all portfolio-related routes
 */

const { 
  getPortfoliosByUserId,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
} = require('../utils/portfolios');
const { authenticate } = require('../middleware/auth');

/**
 * Register all portfolio routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function portfolioRoutes(fastify, options) {
  // Get all portfolios for user
  fastify.get('/api/portfolios', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const portfolios = await getPortfoliosByUserId(userId);
      return { portfolios };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new portfolio
  fastify.post('/api/portfolios', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const portfolioData = request.body;
      
      const portfolio = await createPortfolio(userId, portfolioData);
      return { 
        success: true, 
        portfolio 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single portfolio by ID
  fastify.get('/api/portfolios/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const portfolio = await getPortfolioById(id);
      
      if (!portfolio) {
        reply.status(404).send({ error: 'Portfolio not found' });
        return;
      }
      
      // Verify portfolio belongs to user
      if (portfolio.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { portfolio };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update portfolio
  fastify.put('/api/portfolios/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      // Verify portfolio exists and belongs to user
      const existingPortfolio = await getPortfolioById(id);
      if (!existingPortfolio) {
        reply.status(404).send({ error: 'Portfolio not found' });
        return;
      }
      if (existingPortfolio.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const portfolio = await updatePortfolio(id, updates);
      return { 
        success: true, 
        portfolio 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete portfolio
  fastify.delete('/api/portfolios/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Verify portfolio exists and belongs to user
      const existingPortfolio = await getPortfolioById(id);
      if (!existingPortfolio) {
        reply.status(404).send({ error: 'Portfolio not found' });
        return;
      }
      if (existingPortfolio.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deletePortfolio(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = portfolioRoutes;

