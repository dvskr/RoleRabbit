/**
 * useAdvancedFilters Hook
 * Advanced filtering with presets and multi-dimensional filters
 */

import { useState, useCallback, useEffect } from 'react';

// Filter configuration
export interface FilterConfig {
  categories: string[];
  difficulty: [number, number]; // Min-Max (1-5)
  rating: [number, number]; // Min-Max (0-5)
  premium: boolean | null; // null = both, true = premium only, false = free only
  industries: string[];
  tags: string[];
  priceRange?: [number, number]; // Min-Max price
  sortBy?: 'popular' | 'recent' | 'rating' | 'downloads' | 'price';
  sortOrder?: 'asc' | 'desc';
}

// Filter preset
export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterConfig;
  isDefault?: boolean;
  createdAt: string;
}

// Available options
export interface FilterOptions {
  categories: Array<{ value: string; label: string; count: number }>;
  industries: Array<{ value: string; label: string; count: number }>;
  tags: Array<{ value: string; label: string; count: number }>;
}

// Hook options
export interface UseAdvancedFiltersOptions {
  onFiltersChange?: (filters: FilterConfig) => void;
  defaultFilters?: Partial<FilterConfig>;
}

// Default filter configuration
const defaultFilterConfig: FilterConfig = {
  categories: [],
  difficulty: [1, 5],
  rating: [0, 5],
  premium: null,
  industries: [],
  tags: [],
  sortBy: 'popular',
  sortOrder: 'desc',
};

/**
 * Hook for advanced filtering functionality
 */
export function useAdvancedFilters(options?: UseAdvancedFiltersOptions) {
  const { onFiltersChange, defaultFilters } = options || {};

  const [filters, setFilters] = useState<FilterConfig>({
    ...defaultFilterConfig,
    ...defaultFilters,
  });
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    industries: [],
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load presets from localStorage and API
  useEffect(() => {
    loadPresets();
    loadFilterOptions();
  }, []);

  // Notify on filter changes
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  /**
   * Load filter presets
   */
  const loadPresets = useCallback(async () => {
    try {
      // Load from localStorage
      const stored = localStorage.getItem('filterPresets');
      if (stored) {
        const localPresets = JSON.parse(stored);
        setPresets(localPresets);
      }

      // Load from API (premium feature)
      const response = await fetch('/api/filters/presets', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.presets) {
          setPresets((prev) => {
            // Merge local and remote presets
            const localIds = new Set(prev.map((p) => p.id));
            const remote = data.presets.filter((p: FilterPreset) => !localIds.has(p.id));
            return [...prev, ...remote];
          });
        }
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
    }
  }, []);

  /**
   * Load available filter options
   */
  const loadFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/filters/options', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((updates: Partial<FilterConfig>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setActivePreset(null); // Clear active preset when manually changing filters
  }, []);

  /**
   * Reset filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters({ ...defaultFilterConfig, ...defaultFilters });
    setActivePreset(null);
  }, [defaultFilters]);

  /**
   * Save preset (local or remote based on user plan)
   */
  const savePreset = useCallback(
    async (name: string, isPremium: boolean = false): Promise<FilterPreset | null> => {
      const preset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name,
        filters: { ...filters },
        createdAt: new Date().toISOString(),
      };

      try {
        if (isPremium) {
          // Save to API (premium)
          const response = await fetch('/api/filters/presets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name, filters }),
          });

          if (!response.ok) {
            throw new Error('Failed to save preset');
          }

          const data = await response.json();
          const savedPreset = data.preset;

          setPresets((prev) => [...prev, savedPreset]);
          return savedPreset;
        } else {
          // Save to localStorage (free)
          const updated = [...presets, preset];
          setPresets(updated);
          localStorage.setItem('filterPresets', JSON.stringify(updated));
          return preset;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save preset';
        setError(errorMessage);
        return null;
      }
    },
    [filters, presets]
  );

  /**
   * Delete preset
   */
  const deletePreset = useCallback(
    async (presetId: string) => {
      try {
        // Try to delete from API first
        const response = await fetch(`/api/filters/presets/${presetId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok || response.status === 404) {
          // Remove from state
          const updated = presets.filter((p) => p.id !== presetId);
          setPresets(updated);
          localStorage.setItem('filterPresets', JSON.stringify(updated));

          if (activePreset === presetId) {
            setActivePreset(null);
          }
        }
      } catch (err) {
        // If API fails, try to remove from localStorage anyway
        const updated = presets.filter((p) => p.id !== presetId);
        setPresets(updated);
        localStorage.setItem('filterPresets', JSON.stringify(updated));
      }
    },
    [presets, activePreset]
  );

  /**
   * Apply preset
   */
  const applyPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters);
    setActivePreset(preset.id);
  }, []);

  /**
   * Toggle category
   */
  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
    setActivePreset(null);
  }, []);

  /**
   * Toggle industry
   */
  const toggleIndustry = useCallback((industry: string) => {
    setFilters((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }));
    setActivePreset(null);
  }, []);

  /**
   * Set difficulty range
   */
  const setDifficulty = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, difficulty: range }));
    setActivePreset(null);
  }, []);

  /**
   * Set rating range
   */
  const setRating = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, rating: range }));
    setActivePreset(null);
  }, []);

  /**
   * Set premium filter
   */
  const setPremium = useCallback((premium: boolean | null) => {
    setFilters((prev) => ({ ...prev, premium }));
    setActivePreset(null);
  }, []);

  /**
   * Get active filter count
   */
  const getActiveFilterCount = useCallback(() => {
    let count = 0;

    if (filters.categories.length > 0) count++;
    if (filters.industries.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.difficulty[0] !== 1 || filters.difficulty[1] !== 5) count++;
    if (filters.rating[0] !== 0 || filters.rating[1] !== 5) count++;
    if (filters.premium !== null) count++;
    if (filters.priceRange) count++;

    return count;
  }, [filters]);

  /**
   * Check if filters are default
   */
  const isDefault = useCallback(() => {
    return JSON.stringify(filters) === JSON.stringify({ ...defaultFilterConfig, ...defaultFilters });
  }, [filters, defaultFilters]);

  return {
    // State
    filters,
    presets,
    activePreset,
    filterOptions,
    loading,
    error,

    // Actions
    updateFilters,
    resetFilters,
    savePreset,
    deletePreset,
    applyPreset,

    // Specific setters
    toggleCategory,
    toggleIndustry,
    setDifficulty,
    setRating,
    setPremium,

    // Utilities
    getActiveFilterCount,
    isDefault,
    loadFilterOptions,
  };
}

export default useAdvancedFilters;
