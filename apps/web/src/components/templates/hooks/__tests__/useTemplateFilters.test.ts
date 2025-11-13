/**
 * useTemplateFilters Hook Tests
 * Tests the template filtering and search functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplateFilters } from '../useTemplateFilters';
import { resumeTemplates } from '../../../../data/templates';

// Mock the debounce utility
jest.mock('../../../../utils/performance', () => ({
  debounce: (fn: Function) => {
    const debounced: any = (...args: any[]) => fn(...args);
    debounced.cancel = jest.fn();
    return debounced;
  },
}));

describe('useTemplateFilters Hook', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => useTemplateFilters());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedCategory).toBe('all');
    expect(result.current.sortBy).toBe('popular');
    expect(result.current.selectedDifficulty).toBe('all');
    expect(result.current.selectedLayout).toBe('all');
    expect(result.current.selectedColorScheme).toBe('all');
    expect(result.current.showPremiumOnly).toBe(false);
    expect(result.current.showFreeOnly).toBe(false);
  });

  test('should initialize with custom options', () => {
    const { result } = renderHook(() =>
      useTemplateFilters({
        initialCategory: 'ats',
        initialSortBy: 'newest',
        initialDifficulty: 'beginner',
        initialLayout: 'single-column',
        initialColorScheme: 'blue',
      })
    );

    expect(result.current.selectedCategory).toBe('ats');
    expect(result.current.sortBy).toBe('newest');
    expect(result.current.selectedDifficulty).toBe('beginner');
    expect(result.current.selectedLayout).toBe('single-column');
    expect(result.current.selectedColorScheme).toBe('blue');
  });

  test('should update search query', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSearchQuery('developer');
    });

    expect(result.current.searchQuery).toBe('developer');
  });

  test('should update category filter', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSelectedCategory('creative');
    });

    expect(result.current.selectedCategory).toBe('creative');
  });

  test('should update sort order', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSortBy('rating');
    });

    expect(result.current.sortBy).toBe('rating');
  });

  test('should update difficulty filter', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSelectedDifficulty('advanced');
    });

    expect(result.current.selectedDifficulty).toBe('advanced');
  });

  test('should update layout filter', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSelectedLayout('two-column');
    });

    expect(result.current.selectedLayout).toBe('two-column');
  });

  test('should update color scheme filter', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSelectedColorScheme('purple');
    });

    expect(result.current.selectedColorScheme).toBe('purple');
  });

  test('should toggle premium only filter', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setShowPremiumOnly(true);
    });

    expect(result.current.showPremiumOnly).toBe(true);

    act(() => {
      result.current.setShowPremiumOnly(false);
    });

    expect(result.current.showPremiumOnly).toBe(false);
  });

  test('should toggle free only filter', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setShowFreeOnly(true);
    });

    expect(result.current.showFreeOnly).toBe(true);
  });

  test('should return all templates when no filters applied', () => {
    const { result } = renderHook(() => useTemplateFilters());

    expect(result.current.filteredTemplates.length).toBe(resumeTemplates.length);
  });

  test('should filter by category', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSelectedCategory('ats');
    });

    const atsTemplates = result.current.filteredTemplates;
    expect(atsTemplates.every(t => t.category === 'ats')).toBe(true);
  });

  test('should filter by difficulty', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSelectedDifficulty('beginner');
    });

    const beginnerTemplates = result.current.filteredTemplates;
    expect(beginnerTemplates.every(t => t.difficulty === 'beginner')).toBe(true);
  });

  test('should filter by premium status', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setShowPremiumOnly(true);
    });

    const premiumTemplates = result.current.filteredTemplates;
    expect(premiumTemplates.every(t => t.isPremium === true)).toBe(true);
  });

  test('should filter by free status', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setShowFreeOnly(true);
    });

    const freeTemplates = result.current.filteredTemplates;
    expect(freeTemplates.every(t => t.isPremium === false)).toBe(true);
  });

  test('should sort by popular (downloads)', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSortBy('popular');
    });

    const templates = result.current.filteredTemplates;
    for (let i = 0; i < templates.length - 1; i++) {
      expect(templates[i].downloads >= templates[i + 1].downloads).toBe(true);
    }
  });

  test('should sort by rating', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSortBy('rating');
    });

    const templates = result.current.filteredTemplates;
    for (let i = 0; i < templates.length - 1; i++) {
      expect(templates[i].rating >= templates[i + 1].rating).toBe(true);
    }
  });

  test('should sort by name alphabetically', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSortBy('name');
    });

    const templates = result.current.filteredTemplates;
    for (let i = 0; i < templates.length - 1; i++) {
      expect(templates[i].name.localeCompare(templates[i + 1].name) <= 0).toBe(true);
    }
  });

  test('should apply multiple filters simultaneously', () => {
    const { result } = renderHook(() => useTemplateFilters());

    act(() => {
      result.current.setSelectedCategory('ats');
      result.current.setSelectedDifficulty('beginner');
      result.current.setShowFreeOnly(true);
    });

    const filteredTemplates = result.current.filteredTemplates;
    expect(
      filteredTemplates.every(
        t =>
          t.category === 'ats' &&
          t.difficulty === 'beginner' &&
          t.isPremium === false
      )
    ).toBe(true);
  });
});
