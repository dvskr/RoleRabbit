/**
 * Custom hook for template filtering and search
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { debounce } from '../../../utils/performance';
import { resumeTemplates, getTemplatesByCategory, searchTemplates } from '../../../data/templates';
import { TemplateSortBy, TemplateDifficulty, TemplateLayout, TemplateColorScheme } from '../types';
import { DEBOUNCE_DELAY } from '../constants';
import type { ResumeTemplate } from '../../../data/templates';

interface UseTemplateFiltersOptions {
  initialCategory?: string;
  initialSortBy?: TemplateSortBy;
  initialDifficulty?: string;
  initialLayout?: string;
  initialColorScheme?: string;
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
  
  // Computed
  filteredTemplates: ResumeTemplate[];
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
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<TemplateSortBy>(initialSortBy);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [selectedLayout, setSelectedLayout] = useState(initialLayout);
  const [selectedColorScheme, setSelectedColorScheme] = useState(initialColorScheme);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Debounce search input
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, DEBOUNCE_DELAY),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);

    // Cleanup: cancel pending debounced call on unmount
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchQuery, debouncedSetSearch]);

  /**
   * Memoized filtered and sorted templates list
   *
   * This is the core filtering logic that processes all user-selected filters
   * and returns the final list of templates to display. Uses useMemo for
   * performance optimization - only re-computes when filter values change.
   *
   * **Filter Application Order:**
   * 1. Search (if query exists) - Uses searchTemplates() for fuzzy matching
   * 2. Category - Filters by template category (e.g., 'ats', 'creative')
   * 3. Difficulty - Filters by difficulty level ('beginner', 'intermediate', 'advanced')
   * 4. Layout - Filters by layout type ('single-column', 'two-column', 'hybrid')
   * 5. Color Scheme - Filters by color scheme ('monochrome', 'blue', 'green', etc.)
   * 6. Premium/Free - Filters by isPremium status (mutually exclusive)
   * 7. Sort - Final sort by selected criteria ('popular', 'newest', 'rating', 'name')
   *
   * **Progressive Filtering:**
   * Each filter narrows down the results from the previous filter. This approach
   * is more efficient than re-filtering all templates for each criteria.
   *
   * **Sorting Algorithms:**
   * - 'popular': Sort by downloads (descending) - shows most downloaded first
   * - 'newest': Sort by createdAt date (descending) - shows latest first
   * - 'rating': Sort by rating (descending) - shows highest rated first
   * - 'name': Sort alphabetically (ascending) - uses localeCompare for proper sorting
   *
   * **Performance Notes:**
   * - Wrapped in useMemo to prevent unnecessary re-computation
   * - Only re-runs when filter dependencies change (tracked in dependency array)
   * - Search is debounced (DEBOUNCE_DELAY) to reduce filtering during typing
   * - In-place sort on mutable copy (doesn't create new arrays unnecessarily)
   *
   * @returns Filtered and sorted array of ResumeTemplate objects
   *
   * @example
   * ```typescript
   * // User selects: Category='ats', Difficulty='beginner', Sort='rating'
   * // 1. Start with all 50 templates
   * // 2. Filter category='ats' → 12 templates
   * // 3. Filter difficulty='beginner' → 5 templates
   * // 4. Sort by rating → [4.9, 4.8, 4.7, 4.5, 4.3]
   * // Returns: 5 templates sorted by rating
   * ```
   */
  const filteredTemplates = useMemo(() => {
    let templates = resumeTemplates;

    // Search filter - apply first if search query exists
    if (debouncedSearchQuery) {
      templates = searchTemplates(debouncedSearchQuery);
    }

    // Category filter - filter the existing set (don't replace it)
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
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
    
    // Computed
    filteredTemplates,
  };
};

