/**
 * Unit Tests for Template Favorites Service
 * Tests add, remove, list favorites functionality
 */

const {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorite,
  syncFavoritesFromLocal,
} = require('../services/templateFavoritesService');

// Mock Prisma
jest.mock('../utils/db', () => ({
  prisma: {
    userTemplateFavorite: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    resumeTemplate: {
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = require('../utils/db');

describe('TemplateFavoritesService', () => {
  const mockUserId = 'user_123';
  const mockTemplateId = 'tpl_456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a template to favorites successfully', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        name: 'Test Template',
        isActive: true,
      };

      const mockFavorite = {
        userId: mockUserId,
        templateId: mockTemplateId,
        createdAt: new Date(),
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.userTemplateFavorite.findUnique.mockResolvedValue(null);
      prisma.userTemplateFavorite.create.mockResolvedValue(mockFavorite);

      const result = await addFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(true);
      expect(result.message).toContain('added to favorites');
      expect(prisma.userTemplateFavorite.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          templateId: mockTemplateId,
        },
      });
    });

    it('should return error if template does not exist', async () => {
      prisma.resumeTemplate.findUnique.mockResolvedValue(null);

      const result = await addFavorite(mockUserId, 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
      expect(prisma.userTemplateFavorite.create).not.toHaveBeenCalled();
    });

    it('should return error if template is inactive', async () => {
      const mockInactiveTemplate = {
        id: mockTemplateId,
        name: 'Inactive Template',
        isActive: false,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockInactiveTemplate);

      const result = await addFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not available');
      expect(prisma.userTemplateFavorite.create).not.toHaveBeenCalled();
    });

    it('should return error if template is already favorited', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        name: 'Test Template',
        isActive: true,
      };

      const existingFavorite = {
        userId: mockUserId,
        templateId: mockTemplateId,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.userTemplateFavorite.findUnique.mockResolvedValue(existingFavorite);

      const result = await addFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already in favorites');
      expect(prisma.userTemplateFavorite.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        isActive: true,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.userTemplateFavorite.findUnique.mockResolvedValue(null);
      prisma.userTemplateFavorite.create.mockRejectedValue(
        new Error('Database error')
      );

      const result = await addFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('removeFavorite', () => {
    it('should remove a template from favorites successfully', async () => {
      const mockFavorite = {
        userId: mockUserId,
        templateId: mockTemplateId,
      };

      prisma.userTemplateFavorite.findUnique.mockResolvedValue(mockFavorite);
      prisma.userTemplateFavorite.delete.mockResolvedValue(mockFavorite);

      const result = await removeFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(true);
      expect(result.message).toContain('removed from favorites');
      expect(prisma.userTemplateFavorite.delete).toHaveBeenCalledWith({
        where: {
          userId_templateId: {
            userId: mockUserId,
            templateId: mockTemplateId,
          },
        },
      });
    });

    it('should return error if favorite does not exist', async () => {
      prisma.userTemplateFavorite.findUnique.mockResolvedValue(null);

      const result = await removeFavorite(mockUserId, 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not in favorites');
      expect(prisma.userTemplateFavorite.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockFavorite = {
        userId: mockUserId,
        templateId: mockTemplateId,
      };

      prisma.userTemplateFavorite.findUnique.mockResolvedValue(mockFavorite);
      prisma.userTemplateFavorite.delete.mockRejectedValue(
        new Error('Database error')
      );

      const result = await removeFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getUserFavorites', () => {
    it('should return user favorites with templates', async () => {
      const mockFavorites = [
        {
          userId: mockUserId,
          templateId: 'tpl_1',
          createdAt: new Date('2024-01-01'),
          template: {
            id: 'tpl_1',
            name: 'Template 1',
            category: 'ATS',
            isActive: true,
          },
        },
        {
          userId: mockUserId,
          templateId: 'tpl_2',
          createdAt: new Date('2024-01-02'),
          template: {
            id: 'tpl_2',
            name: 'Template 2',
            category: 'CREATIVE',
            isActive: true,
          },
        },
      ];

      prisma.userTemplateFavorite.findMany.mockResolvedValue(mockFavorites);

      const result = await getUserFavorites(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.data[0].template.name).toBe('Template 1');
      expect(prisma.userTemplateFavorite.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: expect.objectContaining({
          template: true,
        }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if user has no favorites', async () => {
      prisma.userTemplateFavorite.findMany.mockResolvedValue([]);

      const result = await getUserFavorites(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(0);
    });

    it('should sort favorites by newest', async () => {
      prisma.userTemplateFavorite.findMany.mockResolvedValue([]);

      await getUserFavorites(mockUserId, { sortBy: 'newest' });

      expect(prisma.userTemplateFavorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should sort favorites by oldest', async () => {
      prisma.userTemplateFavorite.findMany.mockResolvedValue([]);

      await getUserFavorites(mockUserId, { sortBy: 'oldest' });

      expect(prisma.userTemplateFavorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        })
      );
    });

    it('should limit the number of favorites returned', async () => {
      const mockFavorites = Array(5).fill(null).map((_, i) => ({
        userId: mockUserId,
        templateId: `tpl_${i}`,
        template: { id: `tpl_${i}`, name: `Template ${i}` },
      }));

      prisma.userTemplateFavorite.findMany.mockResolvedValue(
        mockFavorites.slice(0, 3)
      );

      const result = await getUserFavorites(mockUserId, { limit: 3 });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(3);
      expect(prisma.userTemplateFavorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
        })
      );
    });

    it('should handle database errors', async () => {
      prisma.userTemplateFavorite.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const result = await getUserFavorites(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('isFavorite', () => {
    it('should return true if template is favorited', async () => {
      const mockFavorite = {
        userId: mockUserId,
        templateId: mockTemplateId,
      };

      prisma.userTemplateFavorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await isFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(true);
      expect(result.data.isFavorited).toBe(true);
    });

    it('should return false if template is not favorited', async () => {
      prisma.userTemplateFavorite.findUnique.mockResolvedValue(null);

      const result = await isFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(true);
      expect(result.data.isFavorited).toBe(false);
    });

    it('should handle database errors', async () => {
      prisma.userTemplateFavorite.findUnique.mockRejectedValue(
        new Error('Database error')
      );

      const result = await isFavorite(mockUserId, mockTemplateId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('syncFavoritesFromLocal', () => {
    it('should sync multiple favorites from localStorage', async () => {
      const localFavoriteIds = ['tpl_1', 'tpl_2', 'tpl_3'];

      // Mock all templates exist and are active
      prisma.resumeTemplate.findUnique.mockResolvedValue({
        id: 'tpl_1',
        isActive: true,
      });

      // Mock none are already favorited
      prisma.userTemplateFavorite.findUnique.mockResolvedValue(null);

      // Mock successful creation
      prisma.userTemplateFavorite.create.mockResolvedValue({
        userId: mockUserId,
        templateId: 'tpl_1',
      });

      const result = await syncFavoritesFromLocal(mockUserId, localFavoriteIds);

      expect(result.success).toBe(true);
      expect(result.data.added).toBe(3);
      expect(result.data.skipped).toBe(0);
      expect(result.data.errors).toBe(0);
    });

    it('should skip already favorited templates', async () => {
      const localFavoriteIds = ['tpl_1', 'tpl_2'];

      let callCount = 0;
      prisma.resumeTemplate.findUnique.mockResolvedValue({
        id: 'tpl_1',
        isActive: true,
      });

      // First template already favorited, second not
      prisma.userTemplateFavorite.findUnique.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? { userId: mockUserId, templateId: 'tpl_1' } : null;
      });

      prisma.userTemplateFavorite.create.mockResolvedValue({
        userId: mockUserId,
        templateId: 'tpl_2',
      });

      const result = await syncFavoritesFromLocal(mockUserId, localFavoriteIds);

      expect(result.success).toBe(true);
      expect(result.data.added).toBe(1);
      expect(result.data.skipped).toBe(1);
    });

    it('should handle invalid template IDs', async () => {
      const localFavoriteIds = ['tpl_1', 'invalid_id', 'tpl_2'];

      let callCount = 0;
      prisma.resumeTemplate.findUnique.mockImplementation(() => {
        callCount++;
        // Second template doesn't exist
        return callCount === 2 ? null : { id: `tpl_${callCount}`, isActive: true };
      });

      prisma.userTemplateFavorite.findUnique.mockResolvedValue(null);
      prisma.userTemplateFavorite.create.mockResolvedValue({
        userId: mockUserId,
        templateId: 'tpl_1',
      });

      const result = await syncFavoritesFromLocal(mockUserId, localFavoriteIds);

      expect(result.success).toBe(true);
      expect(result.data.added).toBe(2);
      expect(result.data.errors).toBe(1);
    });

    it('should return success with no changes for empty array', async () => {
      const result = await syncFavoritesFromLocal(mockUserId, []);

      expect(result.success).toBe(true);
      expect(result.data.added).toBe(0);
      expect(result.data.skipped).toBe(0);
      expect(result.data.errors).toBe(0);
    });

    it('should handle sync errors gracefully', async () => {
      const localFavoriteIds = ['tpl_1'];

      prisma.resumeTemplate.findUnique.mockRejectedValue(
        new Error('Database connection lost')
      );

      const result = await syncFavoritesFromLocal(mockUserId, localFavoriteIds);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection lost');
    });
  });
});
