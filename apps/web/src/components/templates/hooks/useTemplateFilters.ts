/**
 * useTemplateFilters Hook
 *
 * Custom hook for template filtering, search, and sorting with localStorage persistence.
 *
 * @module useTemplateFilters
 *
 * Features:
 * - Multi-dimensional filtering (category, difficulty, layout, color, price)
 * - Real-time search with debouncing (300ms delay)
 * - Sort by popularity, date, rating, or name
 * - localStorage persistence with Zod validation for runtime safety
 * - SSR-safe with window checks
 * - Computed properties for active filter state
 * - "Clear all" functionality
 *
 * Filter Persistence:
 * - All filter selections are automatically saved to localStorage
 * - Filters are restored on component mount
 * - Validation ensures loaded data matches expected types
 * - Can be disabled via persistFilters option
 *
 * Performance:
 * - Search is debounced (300ms) to reduce filtering operations
 * - Memoized filtered results to prevent unnecessary recalculations
 * - Efficient filter composition with early returns
 *
 * @example
 * ```tsx
 * function TemplatesPage() {
 *   const {
 *     searchQuery,
 *     setSearchQuery,
 *     filteredTemplates,
 *     clearAllFilters,
 *     hasActiveFilters,
 *     activeFilterCount
 *   } = useTemplateFilters({
 *     initialCategory: 'professional',
 *     persistFilters: true
 *   });
 *
 *   return (
 *     <>
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *       />
 *       {hasActiveFilters && (
 *         <button onClick={clearAllFilters}>
 *           Clear {activeFilterCount} filters
 *         </button>
 *       )}
 *       {filteredTemplates.map(template => (
 *         <TemplateCard key={template.id} template={template} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 *
 * @param {UseTemplateFiltersOptions} options - Configuration options
 * @param {string} [options.initialCategory='all'] - Initial category filter
 * @param {TemplateSortBy} [options.initialSortBy='popular'] - Initial sort option
 * @param {string} [options.initialDifficulty='all'] - Initial difficulty filter
 * @param {string} [options.initialLayout='all'] - Initial layout filter
 * @param {string} [options.initialColorScheme='all'] - Initial color scheme filter
 * @param {boolean} [options.persistFilters=true] - Enable localStorage persistence
 *
 * @returns {UseTemplateFiltersReturn} Filter state and controls
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { debounce } from '../../../utils/performance';
import { resumeTemplates, getTemplatesByCategory, searchTemplates } from '../../../data/templates';
import { TemplateSortBy, TemplateDifficulty, TemplateLayout, TemplateColorScheme } from '../types';
import { DEBOUNCE_DELAY } from '../constants';
import type { ResumeTemplate } from '../../../data/templates';
import { safeParseWithDefault, templateSortBySchema, templateDifficultySchema, templateLayoutSchema, templateColorSchemeSchema } from '../validation';
import { z } from 'zod';

// localStorage keys for filter persistence
const STORAGE_KEYS = {
  CATEGORY: 'template_filter_category',
  SORT_BY: 'template_filter_sortBy',
  DIFFICULTY: 'template_filter_difficulty',
  LAYOUT: 'template_filter_layout',
  COLOR_SCHEME: 'template_filter_colorScheme',
  PREMIUM_ONLY: 'template_filter_premiumOnly',
  FREE_ONLY: 'template_filter_freeOnly',
} as const;

/**
 * Load filter value from localStorage with fallback and validation
 */
function loadFromStorage<T>(key: string, fallback: T, schema?: z.ZodSchema<T>): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;

    const parsed = JSON.parse(stored);

    // If schema is provided, validate the parsed value
    if (schema) {
      return safeParseWithDefault(schema, parsed, fallback);
    }

    return parsed;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return fallback;
  }
}

/**
 * Save filter value to localStorage
 */
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
}

/**
 * Clear all template filters from localStorage
 */
function clearFiltersFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear filters from localStorage:', error);
  }
}

interface UseTemplateFiltersOptions {
  initialCategory?: string;
  initialSortBy?: TemplateSortBy;
  initialDifficulty?: string;
  initialLayout?: string;
  initialColorScheme?: string;
  persistFilters?: boolean; // Enable/disable filter persistence
}

interface UseTemplateFiltersReturn {
  // State
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedCategory: string;
  sortBy: TemplateSortBy;
  selectedDifficulty: string;
  selectedLayout: string;
  selectedColorScheme: string;
  showPremiumOnly: boolean;
  showFreeOnly: boolean;

  // Setters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sortBy: TemplateSortBy) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setSelectedLayout: (layout: string) => void;
  setSelectedColorScheme: (colorScheme: string) => void;
  setShowPremiumOnly: (show: boolean) => void;
  setShowFreeOnly: (show: boolean) => void;
  clearAllFilters: () => void;

  // Computed
  filteredTemplates: ResumeTemplate[];
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export const useTemplateFilters = (
  options: UseTemplateFiltersOptions = {}
): UseTemplateFiltersReturn => {
  const {
    initialCategory = 'all',
    initialSortBy = 'popular',
    initialDifficulty = 'all',
    initialLayout = 'all',
    initialColorScheme = 'all',
    persistFilters = true, // Enable persistence by default
  } = options;

  // Initialize state from localStorage or use defaults with validation
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() =>
    persistFilters
      ? loadFromStorage(STORAGE_KEYS.CATEGORY, initialCategory, z.string())
      : initialCategory
  );
  const [sortBy, setSortBy] = useState<TemplateSortBy>(() =>
    persistFilters
      ? loadFromStorage(STORAGE_KEYS.SORT_BY, initialSortBy, templateSortBySchema)
      : initialSortBy
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(() =>
    persistFilters
      ? loadFromStorage(STORAGE_KEYS.DIFFICULTY, initialDifficulty, z.string())
      : initialDifficulty
  );
  const [selectedLayout, setSelectedLayout] = useState(() =>
    persistFilters
      ? loadFromStorage(STORAGE_KEYS.LAYOUT, initialLayout, z.string())
      : initialLayout
  );
  const [selectedColorScheme, setSelectedColorScheme] = useState(() =>
    persistFilters
      ? loadFromStorage(STORAGE_KEYS.COLOR_SCHEME, initialColorScheme, z.string())
      : initialColorScheme
  );
  const [showPremiumOnly, setShowPremiumOnly] = useState(() =>
    persistFilters
      ? loadFromStorage(STORAGE_KEYS.PREMIUM_ONLY, false, z.boolean())
      : false
  );
  const [showFreeOnly, setShowFreeOnly] = useState(() =>
    persistFilters
      ? loadFromStorage(STORAGE_KEYS.FREE_ONLY, false, z.boolean())
      : false
  );

  // Save filters to localStorage when they change
  useEffect(() => {
    if (persistFilters) {
      saveToStorage(STORAGE_KEYS.CATEGORY, selectedCategory);
    }
  }, [selectedCategory, persistFilters]);

  useEffect(() => {
    if (persistFilters) {
      saveToStorage(STORAGE_KEYS.SORT_BY, sortBy);
    }
  }, [sortBy, persistFilters]);

  useEffect(() => {
    if (persistFilters) {
      saveToStorage(STORAGE_KEYS.DIFFICULTY, selectedDifficulty);
    }
  }, [selectedDifficulty, persistFilters]);

  useEffect(() => {
    if (persistFilters) {
      saveToStorage(STORAGE_KEYS.LAYOUT, selectedLayout);
    }
  }, [selectedLayout, persistFilters]);

  useEffect(() => {
    if (persistFilters) {
      saveToStorage(STORAGE_KEYS.COLOR_SCHEME, selectedColorScheme);
    }
  }, [selectedColorScheme, persistFilters]);

  useEffect(() => {
    if (persistFilters) {
      saveToStorage(STORAGE_KEYS.PREMIUM_ONLY, showPremiumOnly);
    }
  }, [showPremiumOnly, persistFilters]);

  useEffect(() => {
    if (persistFilters) {
      saveToStorage(STORAGE_KEYS.FREE_ONLY, showFreeOnly);
    }
  }, [showFreeOnly, persistFilters]);

  // Debounce search input
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, DEBOUNCE_DELAY),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  // Clear all filters and localStorage
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedLayout('all');
    setSelectedColorScheme('all');
    setShowPremiumOnly(false);
    setShowFreeOnly(false);
    setSortBy('popular');

    if (persistFilters) {
      clearFiltersFromStorage();
    }
  }, [persistFilters]);

  const filteredTemplates = useMemo(() => {
    let templates = resumeTemplates;

    // Search filter
    if (debouncedSearchQuery) {
      templates = searchTemplates(debouncedSearchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      templates = templates.filter(t => t.difficulty === selectedDifficulty);
    }

    // Layout filter
    if (selectedLayout !== 'all') {
      templates = templates.filter(t => t.layout === selectedLayout);
    }

    // Color scheme filter
    if (selectedColorScheme !== 'all') {
      templates = templates.filter(t => t.colorScheme === selectedColorScheme);
    }

    // Premium/Free filter
    if (showPremiumOnly) {
      templates = templates.filter(t => t.isPremium);
    }
    if (showFreeOnly) {
      templates = templates.filter(t => !t.isPremium);
    }

    // Sort templates
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return templates;
  }, [
    debouncedSearchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedLayout,
    selectedColorScheme,
    showPremiumOnly,
    showFreeOnly,
    sortBy,
  ]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== 'all' ||
      selectedDifficulty !== 'all' ||
      selectedLayout !== 'all' ||
      selectedColorScheme !== 'all' ||
      showPremiumOnly ||
      showFreeOnly ||
      debouncedSearchQuery.length > 0
    );
  }, [
    selectedCategory,
    selectedDifficulty,
    selectedLayout,
    selectedColorScheme,
    showPremiumOnly,
    showFreeOnly,
    debouncedSearchQuery,
  ]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedDifficulty !== 'all') count++;
    if (selectedLayout !== 'all') count++;
    if (selectedColorScheme !== 'all') count++;
    if (showPremiumOnly) count++;
    if (showFreeOnly) count++;
    if (debouncedSearchQuery.length > 0) count++;
    return count;
  }, [
    selectedCategory,
    selectedDifficulty,
    selectedLayout,
    selectedColorScheme,
    showPremiumOnly,
    showFreeOnly,
    debouncedSearchQuery,
  ]);

  return {
    // State
    searchQuery,
    debouncedSearchQuery,
    selectedCategory,
    sortBy,
    selectedDifficulty,
    selectedLayout,
    selectedColorScheme,
    showPremiumOnly,
    showFreeOnly,

    // Setters
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setSelectedDifficulty,
    setSelectedLayout,
    setSelectedColorScheme,
    setShowPremiumOnly,
    setShowFreeOnly,
    clearAllFilters,

    // Computed
    filteredTemplates,
    hasActiveFilters,
    activeFilterCount,
  };
};

