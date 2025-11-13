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

