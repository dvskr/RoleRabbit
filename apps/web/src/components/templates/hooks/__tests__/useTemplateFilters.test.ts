/**
 * Tests for useTemplateFilters hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplateFilters } from '../useTemplateFilters';
import * as analytics from '../../utils/analytics';

// Mock analytics module
jest.mock('../../utils/analytics', () => ({
  trackSearch: jest.fn(),
  trackSearchClear: jest.fn(),
  trackFilterApply: jest.fn(),
  trackClearAllFilters: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useTemplateFilters', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTemplateFilters());

      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.sortBy).toBe('popular');
      expect(result.current.selectedDifficulty).toBe('all');
      expect(result.current.selectedLayout).toBe('all');
      expect(result.current.selectedColorScheme).toBe('all');
      expect(result.current.showPremiumOnly).toBe(false);
      expect(result.current.showFreeOnly).toBe(false);
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should initialize with custom initial values', () => {
      const { result } = renderHook(() =>
        useTemplateFilters({
          initialCategory: 'professional',
          initialSortBy: 'newest',
          initialDifficulty: 'beginner',
          initialLayout: 'single-column',
          initialColorScheme: 'blue',
          persistFilters: false,
        })
      );

      expect(result.current.selectedCategory).toBe('professional');
      expect(result.current.sortBy).toBe('newest');
      expect(result.current.selectedDifficulty).toBe('beginner');
      expect(result.current.selectedLayout).toBe('single-column');
      expect(result.current.selectedColorScheme).toBe('blue');
    });

    it('should load persisted filters from localStorage', () => {
      localStorage.setItem('template_filter_category', JSON.stringify('creative'));
      localStorage.setItem('template_filter_sortBy', JSON.stringify('rating'));

      const { result } = renderHook(() => useTemplateFilters({ persistFilters: true }));

      expect(result.current.selectedCategory).toBe('creative');
      expect(result.current.sortBy).toBe('rating');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('template_filter_category', 'invalid json {');

      const { result } = renderHook(() => useTemplateFilters({ persistFilters: true }));

      expect(result.current.selectedCategory).toBe('all'); // Falls back to default
    });
  });

  describe('Search functionality', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSearchQuery('developer');
      });

      expect(result.current.searchQuery).toBe('developer');
    });

    it('should debounce search query', async () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSearchQuery('dev');
      });

      // Search should not be debounced yet
      expect(result.current.debouncedSearchQuery).toBe('');

      // Wait for debounce (300ms + buffer)
      await waitFor(
        () => {
          expect(result.current.debouncedSearchQuery).toBe('dev');
        },
        { timeout: 500 }
      );
    });

    it('should track search analytics after debounce', async () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSearchQuery('professional');
      });

      await waitFor(
        () => {
          expect(analytics.trackSearch).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });

    it('should filter templates by search query', async () => {
      const { result } = renderHook(() => useTemplateFilters());

      const initialCount = result.current.filteredTemplates.length;

      act(() => {
        result.current.setSearchQuery('professional');
      });

      await waitFor(
        () => {
          expect(result.current.filteredTemplates.length).toBeLessThan(initialCount);
        },
        { timeout: 500 }
      );
    });

    it('should track search clear event', async () => {
      const { result } = renderHook(() => useTemplateFilters());

      // Set a search query first
      act(() => {
        result.current.setSearchQuery('test');
      });

      await waitFor(() => expect(result.current.debouncedSearchQuery).toBe('test'), {
        timeout: 500,
      });

      // Clear the search
      act(() => {
        result.current.setSearchQuery('');
      });

      await waitFor(() => {
        expect(analytics.trackSearchClear).toHaveBeenCalled();
      }, { timeout: 500 });
    });
  });

  describe('Filter functionality', () => {
    it('should filter by category', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSelectedCategory('professional');
      });

      expect(result.current.selectedCategory).toBe('professional');
      expect(result.current.hasActiveFilters).toBe(true);
      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should filter by difficulty', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSelectedDifficulty('beginner');
      });

      expect(result.current.selectedDifficulty).toBe('beginner');
      expect(result.current.filteredTemplates.every((t) => t.difficulty === 'beginner')).toBe(true);
    });

    it('should filter by layout', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSelectedLayout('single-column');
      });

      expect(result.current.selectedLayout).toBe('single-column');
      expect(
        result.current.filteredTemplates.every((t) => t.layout === 'single-column')
      ).toBe(true);
    });

    it('should filter by color scheme', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSelectedColorScheme('blue');
      });

      expect(result.current.selectedColorScheme).toBe('blue');
      expect(result.current.filteredTemplates.every((t) => t.colorScheme === 'blue')).toBe(
        true
      );
    });

    it('should filter premium only templates', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setShowPremiumOnly(true);
      });

      expect(result.current.showPremiumOnly).toBe(true);
      expect(result.current.filteredTemplates.every((t) => t.isPremium === true)).toBe(true);
    });

    it('should filter free only templates', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setShowFreeOnly(true);
      });

      expect(result.current.showFreeOnly).toBe(true);
      expect(result.current.filteredTemplates.every((t) => t.isPremium === false)).toBe(true);
    });

    it('should apply multiple filters simultaneously', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSelectedCategory('professional');
        result.current.setSelectedDifficulty('beginner');
        result.current.setShowFreeOnly(true);
      });

      expect(result.current.activeFilterCount).toBe(3);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should track filter apply analytics', async () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSelectedCategory('professional');
      });

      await waitFor(() => {
        expect(analytics.trackFilterApply).toHaveBeenCalledWith('category', 'professional');
      });
    });
  });

  describe('Sorting functionality', () => {
    it('should sort by popularity (default)', () => {
      const { result } = renderHook(() => useTemplateFilters());

      const templates = result.current.filteredTemplates;
      for (let i = 0; i < templates.length - 1; i++) {
        expect(templates[i].downloads).toBeGreaterThanOrEqual(templates[i + 1].downloads);
      }
    });

    it('should sort by newest', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSortBy('newest');
      });

      const templates = result.current.filteredTemplates;
      for (let i = 0; i < templates.length - 1; i++) {
        const date1 = new Date(templates[i].createdAt).getTime();
        const date2 = new Date(templates[i + 1].createdAt).getTime();
        expect(date1).toBeGreaterThanOrEqual(date2);
      }
    });

    it('should sort by rating', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSortBy('rating');
      });

      const templates = result.current.filteredTemplates;
      for (let i = 0; i < templates.length - 1; i++) {
        expect(templates[i].rating).toBeGreaterThanOrEqual(templates[i + 1].rating);
      }
    });

    it('should sort by name alphabetically', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSortBy('name');
      });

      const templates = result.current.filteredTemplates;
      for (let i = 0; i < templates.length - 1; i++) {
        expect(templates[i].name.localeCompare(templates[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('Clear filters', () => {
    it('should clear all filters', () => {
      const { result } = renderHook(() => useTemplateFilters());

      // Apply multiple filters
      act(() => {
        result.current.setSearchQuery('test');
        result.current.setSelectedCategory('professional');
        result.current.setSelectedDifficulty('beginner');
        result.current.setShowPremiumOnly(true);
        result.current.setSortBy('newest');
      });

      expect(result.current.hasActiveFilters).toBe(true);

      // Clear all
      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.selectedDifficulty).toBe('all');
      expect(result.current.selectedLayout).toBe('all');
      expect(result.current.selectedColorScheme).toBe('all');
      expect(result.current.showPremiumOnly).toBe(false);
      expect(result.current.showFreeOnly).toBe(false);
      expect(result.current.sortBy).toBe('popular');
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should track clear all filters analytics', () => {
      const { result } = renderHook(() => useTemplateFilters());

      // Apply filters
      act(() => {
        result.current.setSelectedCategory('professional');
        result.current.setSelectedDifficulty('beginner');
      });

      // Clear all
      act(() => {
        result.current.clearAllFilters();
      });

      expect(analytics.trackClearAllFilters).toHaveBeenCalledWith(2);
    });

    it('should clear filters from localStorage when persistFilters is true', () => {
      localStorage.setItem('template_filter_category', JSON.stringify('professional'));

      const { result } = renderHook(() => useTemplateFilters({ persistFilters: true }));

      act(() => {
        result.current.clearAllFilters();
      });

      expect(localStorage.getItem('template_filter_category')).toBeNull();
    });
  });

  describe('LocalStorage persistence', () => {
    it('should persist category filter to localStorage', async () => {
      const { result } = renderHook(() => useTemplateFilters({ persistFilters: true }));

      act(() => {
        result.current.setSelectedCategory('creative');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('template_filter_category');
        expect(JSON.parse(stored!)).toBe('creative');
      });
    });

    it('should persist sort by to localStorage', async () => {
      const { result } = renderHook(() => useTemplateFilters({ persistFilters: true }));

      act(() => {
        result.current.setSortBy('rating');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('template_filter_sortBy');
        expect(JSON.parse(stored!)).toBe('rating');
      });
    });

    it('should not persist filters when persistFilters is false', async () => {
      const { result } = renderHook(() => useTemplateFilters({ persistFilters: false }));

      act(() => {
        result.current.setSelectedCategory('creative');
      });

      // Wait a bit to ensure nothing was saved
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(localStorage.getItem('template_filter_category')).toBeNull();
    });
  });

  describe('Active filter count', () => {
    it('should count active filters correctly', () => {
      const { result } = renderHook(() => useTemplateFilters());

      expect(result.current.activeFilterCount).toBe(0);

      act(() => {
        result.current.setSelectedCategory('professional');
      });
      expect(result.current.activeFilterCount).toBe(1);

      act(() => {
        result.current.setSelectedDifficulty('beginner');
      });
      expect(result.current.activeFilterCount).toBe(2);

      act(() => {
        result.current.setShowPremiumOnly(true);
      });
      expect(result.current.activeFilterCount).toBe(3);
    });

    it('should not count "all" selections as active filters', () => {
      const { result } = renderHook(() => useTemplateFilters());

      act(() => {
        result.current.setSelectedCategory('all');
        result.current.setSelectedDifficulty('all');
      });

      expect(result.current.activeFilterCount).toBe(0);
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });
});
