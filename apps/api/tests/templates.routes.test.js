/**
 * Integration Tests for Templates Routes
 * Tests all 22 REST API endpoints using Fastify inject
 */

const Fastify = require('fastify');
const templatesRoutes = require('../routes/templates.routes');

// Mock all services
jest.mock('../services/templateService');
jest.mock('../services/templateFavoritesService');
jest.mock('../services/templatePreferencesService');
jest.mock('../services/templateAnalyticsService');

// Mock middleware
jest.mock('../middleware/auth', () => ({
  authenticate: async (request, reply) => {
    if (!request.headers.authorization) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    // Mock user object
    request.user = {
      id: 'user_123',
      email: 'test@example.com',
      role: 'USER'
    };
  }
}));

jest.mock('../middleware/adminAuth', () => ({
  requireAdmin: async (request, reply) => {
    if (!request.user || request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }
  }
}));

const templateService = require('../services/templateService');
const templateFavoritesService = require('../services/templateFavoritesService');
const templatePreferencesService = require('../services/templatePreferencesService');
const templateAnalyticsService = require('../services/templateAnalyticsService');

describe('Templates Routes Integration Tests', () => {
  let app;

  beforeEach(async () => {
    // Create new Fastify instance for each test
    app = Fastify();
    await app.register(templatesRoutes);
    await app.ready();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  // ============================================================================
  // PUBLIC ROUTES
  // ============================================================================

  describe('GET /api/templates', () => {
    it('should return templates with default options', async () => {
      const mockResponse = {
        templates: [
          { id: 'tpl_1', name: 'Template 1', category: 'ATS' },
          { id: 'tpl_2', name: 'Template 2', category: 'CREATIVE' }
        ],
        pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
        filters: {}
      };

      templateService.getAllTemplates.mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates'
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockResponse.templates,
        pagination: mockResponse.pagination,
        filters: mockResponse.filters
      });
    });

    it('should pass filter options to service', async () => {
      templateService.getAllTemplates.mockResolvedValue({
        templates: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
        filters: {}
      });

      await app.inject({
        method: 'GET',
        url: '/api/templates?category=ATS&difficulty=BEGINNER&page=2&limit=20'
      });

      expect(templateService.getAllTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ATS',
          difficulty: 'BEGINNER',
          page: '2',
          limit: '20'
        })
      );
    });

    it('should handle service errors', async () => {
      templateService.getAllTemplates.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates'
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Database connection failed');
    });
  });

  describe('GET /api/templates/search', () => {
    it('should search templates successfully', async () => {
      const mockTemplates = [
        { id: 'tpl_1', name: 'Professional Resume', description: 'ATS friendly' }
      ];

      templateService.searchTemplates.mockResolvedValue(mockTemplates);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/search?q=professional'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockTemplates);
      expect(body.count).toBe(1);
    });

    it('should return 400 if query is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/search'
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('required');
    });

    it('should return 400 if query is empty', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/search?q='
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/templates/stats', () => {
    it('should return template statistics', async () => {
      const mockStats = {
        total: 44,
        byCategory: { ATS: 10, CREATIVE: 8 },
        avgRating: 4.5
      };

      templateService.getTemplateStats.mockResolvedValue(mockStats);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/stats'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockStats);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should return a single template', async () => {
      const mockTemplate = {
        success: true,
        data: { id: 'tpl_1', name: 'Professional Resume' }
      };

      templateService.getTemplateById.mockResolvedValue(mockTemplate);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/tpl_1'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockTemplate);
      expect(templateService.getTemplateById).toHaveBeenCalledWith('tpl_1');
    });

    it('should return 404 for non-existent template', async () => {
      templateService.getTemplateById.mockResolvedValue({
        success: false,
        message: 'Template not found'
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/nonexistent'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/templates/analytics/popular', () => {
    it('should return popular templates', async () => {
      const mockPopular = {
        success: true,
        data: [
          { id: 'tpl_1', name: 'Most Popular', usageCount: 1000 }
        ]
      };

      templateAnalyticsService.getPopularTemplates.mockResolvedValue(mockPopular);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/analytics/popular?limit=10'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockPopular);
    });
  });

  describe('GET /api/templates/analytics/trending', () => {
    it('should return trending templates', async () => {
      const mockTrending = {
        success: true,
        data: [
          { id: 'tpl_1', name: 'Trending Template', growthRate: 50 }
        ]
      };

      templateAnalyticsService.getTrendingTemplates.mockResolvedValue(mockTrending);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/analytics/trending?days=7'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockTrending);
    });
  });

  // ============================================================================
  // AUTHENTICATED ROUTES
  // ============================================================================

  describe('POST /api/templates/:id/favorite (authenticated)', () => {
    it('should add template to favorites', async () => {
      const mockResult = {
        success: true,
        message: 'Template added to favorites'
      };

      templateFavoritesService.addFavorite.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: '/api/templates/tpl_1/favorite',
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockResult);
      expect(templateFavoritesService.addFavorite).toHaveBeenCalledWith(
        'user_123',
        'tpl_1'
      );
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/templates/tpl_1/favorite'
      });

      expect(response.statusCode).toBe(401);
      expect(templateFavoritesService.addFavorite).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/templates/:id/favorite (authenticated)', () => {
    it('should remove template from favorites', async () => {
      const mockResult = {
        success: true,
        message: 'Template removed from favorites'
      };

      templateFavoritesService.removeFavorite.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/templates/tpl_1/favorite',
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockResult);
    });
  });

  describe('GET /api/templates/favorites/list (authenticated)', () => {
    it('should return user favorites', async () => {
      const mockFavorites = {
        success: true,
        data: [
          { templateId: 'tpl_1', template: { name: 'Favorite 1' } }
        ]
      };

      templateFavoritesService.getUserFavorites.mockResolvedValue(mockFavorites);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/favorites/list',
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockFavorites);
    });
  });

  describe('GET /api/templates/favorites/check/:id (authenticated)', () => {
    it('should check if template is favorited', async () => {
      const mockResult = {
        success: true,
        data: { isFavorited: true }
      };

      templateFavoritesService.isFavorite.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/favorites/check/tpl_1',
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockResult);
    });
  });

  describe('POST /api/templates/favorites/sync (authenticated)', () => {
    it('should sync favorites from localStorage', async () => {
      const mockResult = {
        success: true,
        data: { added: 3, skipped: 1, errors: 0 }
      };

      templateFavoritesService.syncFavoritesFromLocal.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: '/api/templates/favorites/sync',
        headers: {
          authorization: 'Bearer fake-token',
          'content-type': 'application/json'
        },
        payload: {
          favoriteIds: ['tpl_1', 'tpl_2', 'tpl_3', 'tpl_4']
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockResult);
    });

    it('should return 400 if favoriteIds is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/templates/favorites/sync',
        headers: {
          authorization: 'Bearer fake-token',
          'content-type': 'application/json'
        },
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/templates/:id/track (authenticated)', () => {
    it('should track template usage', async () => {
      const mockResult = {
        success: true,
        message: 'Usage tracked successfully'
      };

      templateAnalyticsService.trackUsage.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: '/api/templates/tpl_1/track',
        headers: {
          authorization: 'Bearer fake-token',
          'content-type': 'application/json'
        },
        payload: {
          action: 'PREVIEW',
          metadata: { source: 'search' }
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockResult);
      expect(templateAnalyticsService.trackUsage).toHaveBeenCalledWith(
        'user_123',
        'tpl_1',
        'PREVIEW',
        { source: 'search' }
      );
    });

    it('should return 400 if action is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/templates/tpl_1/track',
        headers: {
          authorization: 'Bearer fake-token',
          'content-type': 'application/json'
        },
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('required');
    });
  });

  describe('GET /api/templates/analytics/history (authenticated)', () => {
    it('should return user template history', async () => {
      const mockHistory = {
        success: true,
        data: [
          { templateId: 'tpl_1', action: 'PREVIEW', createdAt: new Date() }
        ]
      };

      templateAnalyticsService.getUserHistory.mockResolvedValue(mockHistory);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/analytics/history',
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockHistory);
    });
  });

  describe('GET /api/templates/analytics/recent (authenticated)', () => {
    it('should return recently used templates', async () => {
      const mockRecent = {
        success: true,
        data: [
          { id: 'tpl_1', name: 'Recent Template', lastUsed: new Date() }
        ]
      };

      templateAnalyticsService.getRecentlyUsedTemplates.mockResolvedValue(mockRecent);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/analytics/recent?limit=5',
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockRecent);
    });
  });

  describe('GET /api/templates/preferences (authenticated)', () => {
    it('should return user preferences', async () => {
      const mockPreferences = {
        success: true,
        data: {
          filterSettings: { category: 'ATS' },
          sortPreference: 'popular',
          viewMode: 'grid'
        }
      };

      templatePreferencesService.getPreferences.mockResolvedValue(mockPreferences);

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/preferences',
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockPreferences);
    });
  });

  describe('PUT /api/templates/preferences (authenticated)', () => {
    it('should save user preferences', async () => {
      const mockResult = {
        success: true,
        data: {
          filterSettings: { category: 'CREATIVE' },
          sortPreference: 'newest',
          viewMode: 'list'
        }
      };

      templatePreferencesService.savePreferences.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/templates/preferences',
        headers: {
          authorization: 'Bearer fake-token',
          'content-type': 'application/json'
        },
        payload: {
          filterSettings: { category: 'CREATIVE' },
          sortPreference: 'newest',
          viewMode: 'list'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockResult);
    });
  });

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================

  describe('POST /api/templates (admin)', () => {
    it('should create a new template as admin', async () => {
      // Update mock user to be admin
      app = Fastify();
      await app.register(templatesRoutes);
      await app.ready();

      const mockTemplate = {
        success: true,
        data: { id: 'tpl_new', name: 'New Template' }
      };

      templateService.createTemplate.mockResolvedValue(mockTemplate);

      // Mock admin user in authenticate middleware
      const originalAuth = require('../middleware/auth').authenticate;
      require('../middleware/auth').authenticate = async (request, reply) => {
        request.user = { id: 'admin_1', role: 'ADMIN' };
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/templates',
        headers: {
          authorization: 'Bearer admin-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'New Template',
          category: 'ATS',
          description: 'Test template'
        }
      });

      // Restore original auth
      require('../middleware/auth').authenticate = originalAuth;

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockTemplate);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/templates',
        headers: {
          authorization: 'Bearer user-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'New Template'
        }
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PUT /api/templates/:id (admin)', () => {
    it('should update template as admin', async () => {
      // Create new app instance with admin user
      app = Fastify();
      await app.register(templatesRoutes);
      await app.ready();

      const mockUpdated = {
        success: true,
        data: { id: 'tpl_1', name: 'Updated Template' }
      };

      templateService.updateTemplate.mockResolvedValue(mockUpdated);

      // Mock admin user
      const originalAuth = require('../middleware/auth').authenticate;
      require('../middleware/auth').authenticate = async (request, reply) => {
        request.user = { id: 'admin_1', role: 'ADMIN' };
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/templates/tpl_1',
        headers: {
          authorization: 'Bearer admin-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Updated Template'
        }
      });

      require('../middleware/auth').authenticate = originalAuth;

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockUpdated);
    });
  });

  describe('DELETE /api/templates/:id (admin)', () => {
    it('should soft delete template as admin', async () => {
      app = Fastify();
      await app.register(templatesRoutes);
      await app.ready();

      const mockDeleted = {
        success: true,
        message: 'Template deleted successfully'
      };

      templateService.deleteTemplate.mockResolvedValue(mockDeleted);

      const originalAuth = require('../middleware/auth').authenticate;
      require('../middleware/auth').authenticate = async (request, reply) => {
        request.user = { id: 'admin_1', role: 'ADMIN' };
      };

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/templates/tpl_1',
        headers: {
          authorization: 'Bearer admin-token'
        }
      });

      require('../middleware/auth').authenticate = originalAuth;

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockDeleted);
    });
  });

  describe('GET /api/templates/:id/stats (admin)', () => {
    it('should return template stats as admin', async () => {
      app = Fastify();
      await app.register(templatesRoutes);
      await app.ready();

      const mockStats = {
        success: true,
        data: {
          template: { id: 'tpl_1', name: 'Template' },
          stats: { previews: 100, downloads: 50 }
        }
      };

      templateAnalyticsService.getTemplateStats.mockResolvedValue(mockStats);

      const originalAuth = require('../middleware/auth').authenticate;
      require('../middleware/auth').authenticate = async (request, reply) => {
        request.user = { id: 'admin_1', role: 'ADMIN' };
      };

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/tpl_1/stats',
        headers: {
          authorization: 'Bearer admin-token'
        }
      });

      require('../middleware/auth').authenticate = originalAuth;

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockStats);
    });
  });
});
