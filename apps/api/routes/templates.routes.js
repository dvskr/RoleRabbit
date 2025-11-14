// Template Routes - REST API endpoints for template management

// Import services
const templateService = require('../services/templateService');
const templateFavoritesService = require('../services/templateFavoritesService');
const templatePreferencesService = require('../services/templatePreferencesService');
const templateAnalyticsService = require('../services/templateAnalyticsService');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

module.exports = async function (fastify) {
  // ============================================================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================================================

  /**
   * GET /api/templates
   * Get all templates with filtering, search, pagination, and sorting
   */
  fastify.get('/api/templates', async (request, reply) => {
    try {
      const options = {
        search: request.query.search,
        category: request.query.category,
        difficulty: request.query.difficulty,
        layout: request.query.layout,
        colorScheme: request.query.colorScheme,
        isPremium: request.query.isPremium,
        industry: request.query.industry,
        minRating: request.query.minRating,
        maxRating: request.query.maxRating,
        sortBy: request.query.sortBy || 'popular',
        sortOrder: request.query.sortOrder || 'desc',
        page: request.query.page || 1,
        limit: request.query.limit || 12,
        activeOnly: request.query.activeOnly !== 'false'
      };

      const result = await templateService.getAllTemplates(options);

      return reply.send({
        success: true,
        data: result.templates,
        pagination: result.pagination,
        filters: result.filters
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/search
   * Search templates (dedicated search endpoint)
   */
  fastify.get('/api/templates/search', async (request, reply) => {
    try {
      const { q, limit } = request.query;

      if (!q || !q.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Search query is required'
        });
      }

      const templates = await templateService.searchTemplates(q, { limit });

      return reply.send({
        success: true,
        data: templates,
        count: templates.length
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/search:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/stats
   * Get template statistics (public aggregate data)
   */
  fastify.get('/api/templates/stats', async (request, reply) => {
    try {
      const stats = await templateService.getTemplateStats();

      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/stats:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/:id
   * Get a single template by ID
   */
  fastify.get('/api/templates/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const template = await templateService.getTemplateById(id);

      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Template not found'
        });
      }

      return reply.send({
        success: true,
        data: template
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // AUTHENTICATED ROUTES (Authentication required)
  // ============================================================================

  /**
   * POST /api/templates/:id/favorite
   * Add template to user's favorites
   */
  fastify.post('/api/templates/:id/favorite', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      const favorite = await templateFavoritesService.addFavorite(userId, id);

      return reply.status(201).send({
        success: true,
        data: favorite,
        message: 'Template added to favorites'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/:id/favorite:', error);

      if (error.message.includes('not found') || error.message.includes('not available')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/templates/:id/favorite
   * Remove template from user's favorites
   */
  fastify.delete('/api/templates/:id/favorite', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      const favorite = await templateFavoritesService.removeFavorite(userId, id);

      return reply.send({
        success: true,
        data: favorite,
        message: 'Template removed from favorites'
      });
    } catch (error) {
      fastify.log.error('Error in DELETE /api/templates/:id/favorite:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/favorites/list
   * Get user's favorite templates
   */
  fastify.get('/api/templates/favorites/list', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const options = {
        sortBy: request.query.sortBy || 'newest',
        limit: request.query.limit,
        includeInactive: request.query.includeInactive === 'true'
      };

      const favorites = await templateFavoritesService.getUserFavorites(userId, options);

      return reply.send({
        success: true,
        data: favorites,
        count: favorites.length
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/favorites/list:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/favorites/check/:id
   * Check if template is favorited by user
   */
  fastify.get('/api/templates/favorites/check/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      const isFavorited = await templateFavoritesService.isFavorite(userId, id);

      return reply.send({
        success: true,
        data: {
          templateId: id,
          isFavorited
        }
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/favorites/check/:id:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/favorites/sync
   * Sync favorites from localStorage to database
   */
  fastify.post('/api/templates/favorites/sync', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { favoriteIds } = request.body;

      if (!Array.isArray(favoriteIds)) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'favoriteIds must be an array'
        });
      }

      const result = await templateFavoritesService.syncFavoritesFromLocal(userId, favoriteIds);

      return reply.send({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/favorites/sync:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/:id/track
   * Track template usage action
   */
  fastify.post('/api/templates/:id/track', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const { action, metadata } = request.body;

      if (!action) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Action is required (PREVIEW, DOWNLOAD, USE, FAVORITE, SHARE)'
        });
      }

      const usage = await templateAnalyticsService.trackUsage(userId, id, action, metadata);

      return reply.status(201).send({
        success: true,
        data: usage,
        message: 'Usage tracked successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/:id/track:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('Invalid action')) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/analytics/popular
   * Get popular templates
   */
  fastify.get('/api/templates/analytics/popular', async (request, reply) => {
    try {
      const options = {
        limit: request.query.limit || 10,
        period: request.query.period || 'all',
        category: request.query.category,
        action: request.query.action
      };

      const popular = await templateAnalyticsService.getPopularTemplates(options);

      return reply.send({
        success: true,
        data: popular,
        count: popular.length
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/analytics/popular:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/analytics/trending
   * Get trending templates
   */
  fastify.get('/api/templates/analytics/trending', async (request, reply) => {
    try {
      const options = {
        limit: request.query.limit || 10,
        days: request.query.days || 7
      };

      const trending = await templateAnalyticsService.getTrendingTemplates(options);

      return reply.send({
        success: true,
        data: trending,
        count: trending.length
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/analytics/trending:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/analytics/history
   * Get user's template usage history
   */
  fastify.get('/api/templates/analytics/history', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const options = {
        limit: request.query.limit || 20,
        action: request.query.action,
        templateId: request.query.templateId
      };

      const history = await templateAnalyticsService.getUserHistory(userId, options);

      return reply.send({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/analytics/history:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/analytics/recent
   * Get user's recently used templates
   */
  fastify.get('/api/templates/analytics/recent', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const limit = request.query.limit || 5;

      const recent = await templateAnalyticsService.getRecentlyUsed(userId, limit);

      return reply.send({
        success: true,
        data: recent,
        count: recent.length
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/analytics/recent:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/preferences
   * Get user's template preferences
   */
  fastify.get('/api/templates/preferences', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;

      const preferences = await templatePreferencesService.getPreferences(userId);

      return reply.send({
        success: true,
        data: preferences
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/preferences:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/templates/preferences
   * Save or update user's template preferences
   */
  fastify.put('/api/templates/preferences', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const preferences = request.body;

      const saved = await templatePreferencesService.savePreferences(userId, preferences);

      return reply.send({
        success: true,
        data: saved,
        message: 'Preferences saved successfully'
      });
    } catch (error) {
      fastify.log.error('Error in PUT /api/templates/preferences:', error);

      if (error.message.includes('Invalid')) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/preferences/sync
   * Sync preferences from localStorage to database
   */
  fastify.post('/api/templates/preferences/sync', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const localPreferences = request.body;

      const synced = await templatePreferencesService.syncPreferencesFromLocal(userId, localPreferences);

      return reply.send({
        success: true,
        data: synced,
        message: 'Preferences synced successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/preferences/sync:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // ADMIN ROUTES (Admin access required)
  // ============================================================================

  /**
   * POST /api/templates
   * Create a new template (admin only)
   */
  fastify.post('/api/templates', { preHandler: [authenticate, requireAdmin] }, async (request, reply) => {
    try {
      const templateData = request.body;

      const template = await templateService.createTemplate(templateData);

      return reply.status(201).send({
        success: true,
        data: template,
        message: 'Template created successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates:', error);

      if (error.message.includes('Missing required field')) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/templates/:id
   * Update an existing template (admin only)
   */
  fastify.put('/api/templates/:id', { preHandler: [authenticate, requireAdmin] }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;

      const template = await templateService.updateTemplate(id, updateData);

      return reply.send({
        success: true,
        data: template,
        message: 'Template updated successfully'
      });
    } catch (error) {
      fastify.log.error('Error in PUT /api/templates/:id:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/templates/:id
   * Delete a template (admin only)
   * Query param: softDelete=true (default) or softDelete=false for hard delete
   */
  fastify.delete('/api/templates/:id', { preHandler: [authenticate, requireAdmin] }, async (request, reply) => {
    try {
      const { id } = request.params;
      const softDelete = request.query.softDelete !== 'false';

      const template = await templateService.deleteTemplate(id, softDelete);

      return reply.send({
        success: true,
        data: template,
        message: softDelete ? 'Template deactivated' : 'Template permanently deleted'
      });
    } catch (error) {
      fastify.log.error('Error in DELETE /api/templates/:id:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/analytics/dashboard
   * Get global analytics dashboard (admin only)
   */
  fastify.get('/api/templates/analytics/dashboard', { preHandler: [authenticate, requireAdmin] }, async (request, reply) => {
    try {
      const analytics = await templateAnalyticsService.getDashboardAnalytics();

      return reply.send({
        success: true,
        data: analytics
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/analytics/dashboard:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/:id/stats
   * Get detailed statistics for a specific template (admin only)
   */
  fastify.get('/api/templates/:id/stats', { preHandler: [authenticate, requireAdmin] }, async (request, reply) => {
    try {
      const { id } = request.params;

      const stats = await templateAnalyticsService.getTemplateStats(id);

      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/stats:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

};
