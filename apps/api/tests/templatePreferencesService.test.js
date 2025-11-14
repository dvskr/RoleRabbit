/**
 * Unit Tests for Template Preferences Service
 * Tests save, get, update preferences functionality
 */

const {
  savePreferences,
  getPreferences,
  syncPreferencesFromLocal,
} = require('../services/templatePreferencesService');

// Mock Prisma
jest.mock('../utils/db', () => ({
  prisma: {
    userTemplatePreferences: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const { prisma } = require('../utils/db');

describe('TemplatePreferencesService', () => {
  const mockUserId = 'user_123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savePreferences', () => {
    it('should create new preferences for first-time user', async () => {
      const preferences = {
        filterSettings: {
          category: 'ATS',
          difficulty: 'BEGINNER',
        },
        sortPreference: 'popular',
        viewMode: 'grid',
      };

      const mockSavedPreferences = {
        userId: mockUserId,
        ...preferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockSavedPreferences);

      const result = await savePreferences(mockUserId, preferences);

      expect(result.success).toBe(true);
      expect(result.data.filterSettings.category).toBe('ATS');
      expect(result.data.sortPreference).toBe('popular');
      expect(result.data.viewMode).toBe('grid');
      expect(prisma.userTemplatePreferences.upsert).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        update: expect.objectContaining({
          filterSettings: preferences.filterSettings,
          sortPreference: 'popular',
          viewMode: 'grid',
        }),
        create: expect.objectContaining({
          userId: mockUserId,
          filterSettings: preferences.filterSettings,
        }),
      });
    });

    it('should update existing preferences', async () => {
      const updates = {
        sortPreference: 'newest',
        viewMode: 'list',
      };

      const mockUpdatedPreferences = {
        userId: mockUserId,
        filterSettings: { category: 'ATS' },
        ...updates,
        updatedAt: new Date(),
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockUpdatedPreferences);

      const result = await savePreferences(mockUserId, updates);

      expect(result.success).toBe(true);
      expect(result.data.sortPreference).toBe('newest');
      expect(result.data.viewMode).toBe('list');
    });

    it('should handle partial filter settings updates', async () => {
      const partialUpdate = {
        filterSettings: {
          isPremium: true,
        },
      };

      const mockPreferences = {
        userId: mockUserId,
        filterSettings: {
          category: 'ATS',
          isPremium: true,
        },
        sortPreference: 'popular',
        viewMode: 'grid',
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockPreferences);

      const result = await savePreferences(mockUserId, partialUpdate);

      expect(result.success).toBe(true);
      expect(result.data.filterSettings.isPremium).toBe(true);
    });

    it('should validate sort preference options', async () => {
      const invalidPreferences = {
        sortPreference: 'invalid_sort',
      };

      const result = await savePreferences(mockUserId, invalidPreferences);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid sort preference');
      expect(prisma.userTemplatePreferences.upsert).not.toHaveBeenCalled();
    });

    it('should validate view mode options', async () => {
      const invalidPreferences = {
        viewMode: 'invalid_mode',
      };

      const result = await savePreferences(mockUserId, invalidPreferences);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid view mode');
      expect(prisma.userTemplatePreferences.upsert).not.toHaveBeenCalled();
    });

    it('should handle empty preferences object', async () => {
      const mockPreferences = {
        userId: mockUserId,
        filterSettings: {},
        sortPreference: 'popular',
        viewMode: 'grid',
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockPreferences);

      const result = await savePreferences(mockUserId, {});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle database errors', async () => {
      const preferences = {
        sortPreference: 'popular',
      };

      prisma.userTemplatePreferences.upsert.mockRejectedValue(
        new Error('Database error')
      );

      const result = await savePreferences(mockUserId, preferences);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences if they exist', async () => {
      const mockPreferences = {
        userId: mockUserId,
        filterSettings: {
          category: 'ATS',
          difficulty: 'BEGINNER',
          isPremium: false,
        },
        sortPreference: 'popular',
        viewMode: 'grid',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.userTemplatePreferences.findUnique.mockResolvedValue(mockPreferences);

      const result = await getPreferences(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.filterSettings.category).toBe('ATS');
      expect(result.data.sortPreference).toBe('popular');
      expect(result.data.viewMode).toBe('grid');
      expect(prisma.userTemplatePreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    it('should return default preferences if none exist', async () => {
      prisma.userTemplatePreferences.findUnique.mockResolvedValue(null);

      const result = await getPreferences(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.filterSettings).toEqual({});
      expect(result.data.sortPreference).toBe('popular');
      expect(result.data.viewMode).toBe('grid');
    });

    it('should handle database errors', async () => {
      prisma.userTemplatePreferences.findUnique.mockRejectedValue(
        new Error('Database connection lost')
      );

      const result = await getPreferences(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection lost');
    });
  });

  describe('syncPreferencesFromLocal', () => {
    it('should sync preferences from localStorage', async () => {
      const localPreferences = {
        category: 'ATS',
        difficulty: 'BEGINNER',
        sortBy: 'popular',
        viewMode: 'grid',
      };

      const mockSyncedPreferences = {
        userId: mockUserId,
        filterSettings: {
          category: 'ATS',
          difficulty: 'BEGINNER',
        },
        sortPreference: 'popular',
        viewMode: 'grid',
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockSyncedPreferences);

      const result = await syncPreferencesFromLocal(mockUserId, localPreferences);

      expect(result.success).toBe(true);
      expect(result.data.filterSettings.category).toBe('ATS');
      expect(result.data.sortPreference).toBe('popular');
      expect(prisma.userTemplatePreferences.upsert).toHaveBeenCalled();
    });

    it('should transform localStorage keys to database format', async () => {
      const localPreferences = {
        category: 'CREATIVE',
        sortBy: 'newest', // localStorage uses 'sortBy'
        viewMode: 'list',
      };

      const mockPreferences = {
        userId: mockUserId,
        filterSettings: { category: 'CREATIVE' },
        sortPreference: 'newest', // Database uses 'sortPreference'
        viewMode: 'list',
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockPreferences);

      const result = await syncPreferencesFromLocal(mockUserId, localPreferences);

      expect(result.success).toBe(true);
      expect(result.data.sortPreference).toBe('newest');
    });

    it('should handle empty local preferences', async () => {
      const mockPreferences = {
        userId: mockUserId,
        filterSettings: {},
        sortPreference: 'popular',
        viewMode: 'grid',
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockPreferences);

      const result = await syncPreferencesFromLocal(mockUserId, {});

      expect(result.success).toBe(true);
      expect(result.message).toContain('No local preferences to sync');
    });

    it('should filter out invalid preference keys', async () => {
      const localPreferences = {
        category: 'ATS',
        invalidKey: 'should be ignored',
        anotherInvalid: 123,
        sortBy: 'popular',
      };

      const mockPreferences = {
        userId: mockUserId,
        filterSettings: { category: 'ATS' },
        sortPreference: 'popular',
        viewMode: 'grid',
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue(mockPreferences);

      const result = await syncPreferencesFromLocal(mockUserId, localPreferences);

      expect(result.success).toBe(true);
      // Should only sync valid keys
      expect(result.data.filterSettings).not.toHaveProperty('invalidKey');
    });

    it('should handle sync errors', async () => {
      const localPreferences = {
        category: 'ATS',
      };

      prisma.userTemplatePreferences.upsert.mockRejectedValue(
        new Error('Sync failed')
      );

      const result = await syncPreferencesFromLocal(mockUserId, localPreferences);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });

    it('should merge new preferences with existing ones', async () => {
      const localPreferences = {
        category: 'CREATIVE',
        layout: 'TWO_COLUMN',
      };

      // User already has some preferences
      const existingPreferences = {
        userId: mockUserId,
        filterSettings: {
          difficulty: 'INTERMEDIATE',
        },
        sortPreference: 'rating',
        viewMode: 'list',
      };

      const mergedPreferences = {
        userId: mockUserId,
        filterSettings: {
          category: 'CREATIVE',
          layout: 'TWO_COLUMN',
          difficulty: 'INTERMEDIATE', // Existing preference preserved
        },
        sortPreference: 'rating',
        viewMode: 'list',
      };

      prisma.userTemplatePreferences.findUnique.mockResolvedValue(existingPreferences);
      prisma.userTemplatePreferences.upsert.mockResolvedValue(mergedPreferences);

      const result = await syncPreferencesFromLocal(mockUserId, localPreferences);

      expect(result.success).toBe(true);
      expect(result.data.filterSettings.category).toBe('CREATIVE');
      expect(result.data.filterSettings.difficulty).toBe('INTERMEDIATE');
    });
  });

  describe('Preference Validation', () => {
    it('should accept all valid sort preferences', async () => {
      const validSortOptions = ['popular', 'newest', 'rating', 'downloads', 'name'];

      for (const sortBy of validSortOptions) {
        prisma.userTemplatePreferences.upsert.mockResolvedValue({
          userId: mockUserId,
          sortPreference: sortBy,
        });

        const result = await savePreferences(mockUserId, { sortPreference: sortBy });
        expect(result.success).toBe(true);
      }
    });

    it('should accept all valid view modes', async () => {
      const validViewModes = ['grid', 'list'];

      for (const viewMode of validViewModes) {
        prisma.userTemplatePreferences.upsert.mockResolvedValue({
          userId: mockUserId,
          viewMode,
        });

        const result = await savePreferences(mockUserId, { viewMode });
        expect(result.success).toBe(true);
      }
    });

    it('should validate filter settings structure', async () => {
      const validFilterSettings = {
        category: 'ATS',
        difficulty: 'BEGINNER',
        layout: 'SINGLE_COLUMN',
        colorScheme: 'BLUE',
        isPremium: true,
        industry: ['Technology', 'Finance'],
        minRating: 4.0,
        maxRating: 5.0,
      };

      prisma.userTemplatePreferences.upsert.mockResolvedValue({
        userId: mockUserId,
        filterSettings: validFilterSettings,
      });

      const result = await savePreferences(mockUserId, {
        filterSettings: validFilterSettings,
      });

      expect(result.success).toBe(true);
      expect(result.data.filterSettings).toMatchObject(validFilterSettings);
    });
  });
});
