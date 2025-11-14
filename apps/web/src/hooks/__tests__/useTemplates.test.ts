/**
 * Unit Tests for useTemplates Hook
 * Tests template fetching, filtering, pagination, and sorting
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplates } from '../useTemplates';
import { apiService } from '../../services/apiService';

// Mock apiService
jest.mock('../../services/apiService', () => ({
  apiService: {
    getTemplates: jest.fn(),
    getTemplate: jest.fn(),
    searchTemplates: jest.fn(),
    getTemplateStats: jest.fn(),
    trackTemplateUsage: jest.fn()
  }
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useTemplates Hook', () => {
  const mockTemplates = [
    {
      id: 'tpl_1',
      name: 'Professional Resume',
      category: 'ATS',
      description: 'ATS-friendly template',
      preview: 'preview1.png',
      features: ['Clean layout', 'ATS optimized'],
      difficulty: 'BEGINNER',
      industry: ['Technology'],
      layout: 'SINGLE_COLUMN',
      colorScheme: 'BLUE',
      isPremium: false,
      rating: 4.5,
      downloads: 1000,
      author: 'John Doe',
      tags: ['professional', 'ats']
    },
    {
      id: 'tpl_2',
      name: 'Creative Portfolio',
      category: 'CREATIVE',
      description: 'Standout creative template',
      preview: 'preview2.png',
      features: ['Bold design', 'Eye-catching'],
      difficulty: 'INTERMEDIATE',
      industry: ['Design'],
      layout: 'TWO_COLUMN',
      colorScheme: 'GREEN',
      isPremium: true,
      rating: 4.8,
      downloads: 500,
      author: 'Jane Smith',
      tags: ['creative', 'design']
    }
  ];

  const mockPagination = {
    page: 1,
    limit: 12,
    total: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.getTemplates.mockResolvedValue({
      success: true,
      data: mockTemplates,
      pagination: mockPagination,
      filters: {}
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      expect(result.current.templates).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.limit).toBe(12);
      expect(result.current.filters.sortBy).toBe('popular');
      expect(result.current.filters.sortOrder).toBe('desc');
    });

    it('should initialize with custom page and limit', () => {
      const { result } = renderHook(() =>
        useTemplates({ initialPage: 2, initialLimit: 20, autoFetch: false })
      );

      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.limit).toBe(20);
    });

    it('should auto-fetch templates when autoFetch is true', async () => {
      renderHook(() => useTemplates({ autoFetch: true }));

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalled();
      });
    });

    it('should not auto-fetch templates when autoFetch is false', () => {
      renderHook(() => useTemplates({ autoFetch: false }));

      expect(mockApiService.getTemplates).not.toHaveBeenCalled();
    });
  });

  describe('Fetching Templates', () => {
    it('should fetch templates successfully', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchTemplates();
      });

      await waitFor(() => {
        expect(result.current.templates).toEqual(mockTemplates);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should set loading state while fetching', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      let loadingDuringFetch = false;

      act(() => {
        result.current.fetchTemplates().then(() => {
          // Check if loading was true at some point
        });
        loadingDuringFetch = result.current.loading;
      });

      expect(loadingDuringFetch).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle fetch errors', async () => {
      mockApiService.getTemplates.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchTemplates();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should update pagination from response', async () => {
      const customPagination = {
        page: 2,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true
      };

      mockApiService.getTemplates.mockResolvedValue({
        success: true,
        data: mockTemplates,
        pagination: customPagination,
        filters: {}
      });

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchTemplates();
      });

      await waitFor(() => {
        expect(result.current.pagination.totalCount).toBe(100);
        expect(result.current.pagination.totalPages).toBe(5);
        expect(result.current.pagination.hasNextPage).toBe(true);
        expect(result.current.pagination.hasPrevPage).toBe(true);
      });
    });

    it('should fetch specific page', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchTemplates(3);
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 3
          })
        );
      });
    });
  });

  describe('Filtering', () => {
    it('should update filters', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.updateFilters({ category: 'ATS' });
      });

      expect(result.current.filters.category).toBe('ATS');
    });

    it('should reset to page 1 when filters change', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      // Set to page 2
      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.pagination.page).toBe(2);

      // Change filter - should reset to page 1
      act(() => {
        result.current.updateFilters({ category: 'CREATIVE' });
      });

      expect(result.current.pagination.page).toBe(1);
    });

    it('should pass filters to API call', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.updateFilters({
          category: 'ATS',
          difficulty: 'BEGINNER',
          isPremium: false
        });
      });

      await act(async () => {
        await result.current.fetchTemplates();
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'ATS',
            difficulty: 'BEGINNER',
            isPremium: false
          })
        );
      });
    });

    it('should handle search filter', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.updateFilters({ search: 'professional' });
      });

      await act(async () => {
        await result.current.fetchTemplates();
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'professional'
          })
        );
      });
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.updateFilters({
          category: 'ATS',
          difficulty: 'BEGINNER',
          search: 'test'
        });
      });

      expect(result.current.filters.category).toBe('ATS');

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.category).toBe('');
      expect(result.current.filters.difficulty).toBe('');
      expect(result.current.filters.search).toBe('');
    });
  });

  describe('Sorting', () => {
    it('should update sort preference', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.updateFilters({ sortBy: 'newest' });
      });

      expect(result.current.filters.sortBy).toBe('newest');

      await act(async () => {
        await result.current.fetchTemplates();
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'newest'
          })
        );
      });
    });

    it('should support all sort options', async () => {
      const sortOptions = ['popular', 'newest', 'rating', 'downloads', 'name'] as const;

      for (const sortBy of sortOptions) {
        const { result } = renderHook(() => useTemplates({ autoFetch: false }));

        act(() => {
          result.current.updateFilters({ sortBy });
        });

        expect(result.current.filters.sortBy).toBe(sortBy);
      }
    });

    it('should update sort order', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.updateFilters({ sortOrder: 'asc' });
      });

      expect(result.current.filters.sortOrder).toBe('asc');
    });
  });

  describe('Pagination', () => {
    it('should go to next page', async () => {
      mockApiService.getTemplates.mockResolvedValue({
        success: true,
        data: mockTemplates,
        pagination: { ...mockPagination, page: 2, hasNextPage: false, hasPrevPage: true },
        filters: {}
      });

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      await act(async () => {
        await result.current.nextPage();
      });

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(2);
      });
    });

    it('should go to previous page', async () => {
      mockApiService.getTemplates.mockResolvedValue({
        success: true,
        data: mockTemplates,
        pagination: { ...mockPagination, page: 1, hasNextPage: true, hasPrevPage: false },
        filters: {}
      });

      const { result } = renderHook(() =>
        useTemplates({ initialPage: 2, autoFetch: false })
      );

      await act(async () => {
        await result.current.prevPage();
      });

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(1);
      });
    });

    it('should go to specific page', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.pagination.page).toBe(5);
    });

    it('should not go to page less than 1', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.goToPage(0);
      });

      expect(result.current.pagination.page).toBe(1);

      act(() => {
        result.current.goToPage(-5);
      });

      expect(result.current.pagination.page).toBe(1);
    });

    it('should change page limit', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.changeLimit(24);
      });

      expect(result.current.pagination.limit).toBe(24);
      expect(result.current.pagination.page).toBe(1); // Should reset to page 1
    });
  });

  describe('Get Single Template', () => {
    it('should get template by ID', async () => {
      const mockTemplate = mockTemplates[0];
      mockApiService.getTemplate.mockResolvedValue({
        success: true,
        data: mockTemplate
      });

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      let fetchedTemplate;
      await act(async () => {
        fetchedTemplate = await result.current.getTemplate('tpl_1');
      });

      expect(fetchedTemplate).toEqual(mockTemplate);
      expect(mockApiService.getTemplate).toHaveBeenCalledWith('tpl_1');
    });

    it('should handle errors when getting template', async () => {
      mockApiService.getTemplate.mockRejectedValue(
        new Error('Template not found')
      );

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      await act(async () => {
        await expect(result.current.getTemplate('invalid')).rejects.toThrow(
          'Template not found'
        );
      });
    });
  });

  describe('Template Statistics', () => {
    it('should get template stats', async () => {
      const mockStats = {
        total: 44,
        byCategory: { ATS: 10, CREATIVE: 8 },
        avgRating: 4.5
      };

      mockApiService.getTemplateStats.mockResolvedValue({
        success: true,
        data: mockStats
      });

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      let stats;
      await act(async () => {
        stats = await result.current.getStats();
      });

      expect(stats).toEqual(mockStats);
      expect(mockApiService.getTemplateStats).toHaveBeenCalled();
    });
  });

  describe('Track Usage', () => {
    it('should track template usage', async () => {
      mockApiService.trackTemplateUsage.mockResolvedValue({
        success: true,
        message: 'Usage tracked'
      });

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      await act(async () => {
        await result.current.trackUsage('tpl_1', 'PREVIEW', { source: 'grid' });
      });

      expect(mockApiService.trackTemplateUsage).toHaveBeenCalledWith(
        'tpl_1',
        'PREVIEW',
        { source: 'grid' }
      );
    });

    it('should handle tracking errors gracefully', async () => {
      mockApiService.trackTemplateUsage.mockRejectedValue(
        new Error('Tracking failed')
      );

      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      // Should not throw, just log error
      await act(async () => {
        await result.current.trackUsage('tpl_1', 'PREVIEW');
      });

      expect(mockApiService.trackTemplateUsage).toHaveBeenCalled();
    });
  });

  describe('Refresh', () => {
    it('should refresh templates on current page', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      // Go to page 3
      act(() => {
        result.current.goToPage(3);
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 3
          })
        );
      });
    });
  });

  describe('Auto-fetch on Filter Changes', () => {
    it('should auto-fetch when filters change', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: true }));

      // Clear initial fetch call
      mockApiService.getTemplates.mockClear();

      await act(async () => {
        result.current.updateFilters({ category: 'CREATIVE' });
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'CREATIVE'
          })
        );
      });
    });

    it('should auto-fetch when page changes', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: true }));

      mockApiService.getTemplates.mockClear();

      await act(async () => {
        result.current.goToPage(2);
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalled();
      });
    });
  });

  describe('Complex Filter Combinations', () => {
    it('should handle multiple filters at once', async () => {
      const { result } = renderHook(() => useTemplates({ autoFetch: false }));

      act(() => {
        result.current.updateFilters({
          category: 'ATS',
          difficulty: 'BEGINNER',
          layout: 'SINGLE_COLUMN',
          isPremium: false,
          minRating: 4.0,
          sortBy: 'rating'
        });
      });

      await act(async () => {
        await result.current.fetchTemplates();
      });

      await waitFor(() => {
        expect(mockApiService.getTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'ATS',
            difficulty: 'BEGINNER',
            layout: 'SINGLE_COLUMN',
            isPremium: false,
            minRating: 4.0,
            sortBy: 'rating'
          })
        );
      });
    });
  });
});
