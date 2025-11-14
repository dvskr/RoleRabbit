/**
 * useAdvancedSearch Hook
 * Advanced search with autocomplete, fuzzy matching, and suggestions
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// Search suggestion type
export interface SearchSuggestion {
  id: string;
  type: 'template' | 'category' | 'tag' | 'user' | 'recent';
  text: string;
  description?: string;
  imageUrl?: string;
  count?: number;
}

// Search result type
export interface SearchResult {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  matches: {
    field: string;
    text: string;
    highlights: Array<{ start: number; end: number }>;
  }[];
}

// Search options
export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  fuzzy?: boolean;
  fields?: string[];
}

// Hook options
export interface UseAdvancedSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxSuggestions?: number;
  onSearchComplete?: (results: SearchResult[]) => void;
}

/**
 * Hook for advanced search functionality
 */
export function useAdvancedSearch(options?: UseAdvancedSearchOptions) {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxSuggestions = 10,
    onSearchComplete,
  } = options || {};

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  /**
   * Fetch search suggestions
   */
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setSuggestions([]);
        return;
      }

      try {
        // Cancel previous request
        abortController.current?.abort();
        abortController.current = new AbortController();

        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=${maxSuggestions}`,
          {
            credentials: 'include',
            signal: abortController.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore abort errors
        }
        console.error('Error fetching suggestions:', err);
      }
    },
    [minQueryLength, maxSuggestions]
  );

  /**
   * Perform search
   */
  const search = useCallback(
    async (searchOptions: SearchOptions): Promise<SearchResult[]> => {
      setLoading(true);
      setError(null);

      try {
        // Cancel previous request
        abortController.current?.abort();
        abortController.current = new AbortController();

        const params = new URLSearchParams({
          q: searchOptions.query,
          limit: String(searchOptions.limit || 50),
          offset: String(searchOptions.offset || 0),
          fuzzy: String(searchOptions.fuzzy !== false),
        });

        if (searchOptions.fields && searchOptions.fields.length > 0) {
          params.append('fields', searchOptions.fields.join(','));
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          credentials: 'include',
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        const searchResults = data.results || [];

        setResults(searchResults);
        onSearchComplete?.(searchResults);

        // Save to recent searches
        if (searchOptions.query.trim()) {
          const updated = [
            searchOptions.query,
            ...recentSearches.filter((s) => s !== searchOptions.query),
          ].slice(0, 10);
          setRecentSearches(updated);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
        }

        return searchResults;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return [];
        }

        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [recentSearches, onSearchComplete]
  );

  /**
   * Update query and fetch suggestions
   */
  const updateQuery = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Clear debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce suggestions fetch
      if (newQuery.length >= minQueryLength) {
        debounceTimer.current = setTimeout(() => {
          fetchSuggestions(newQuery);
        }, debounceMs);
      } else {
        setSuggestions([]);
      }
    },
    [debounceMs, minQueryLength, fetchSuggestions]
  );

  /**
   * Execute search for current query
   */
  const executeSearch = useCallback(() => {
    if (query.trim()) {
      search({
        query: query.trim(),
        fuzzy: true,
      });
    }
  }, [query, search]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setError(null);
    abortController.current?.abort();
  }, []);

  /**
   * Clear recent searches
   */
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  /**
   * Remove specific recent search
   */
  const removeRecentSearch = useCallback(
    (searchQuery: string) => {
      const updated = recentSearches.filter((s) => s !== searchQuery);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    },
    [recentSearches]
  );

  /**
   * Highlight matches in text
   */
  const highlightMatches = useCallback(
    (text: string, highlights: Array<{ start: number; end: number }>) => {
      if (!highlights || highlights.length === 0) {
        return [{ text, highlighted: false }];
      }

      const parts: Array<{ text: string; highlighted: boolean }> = [];
      let lastIndex = 0;

      highlights.forEach(({ start, end }) => {
        // Add non-highlighted part
        if (start > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, start),
            highlighted: false,
          });
        }

        // Add highlighted part
        parts.push({
          text: text.substring(start, end),
          highlighted: true,
        });

        lastIndex = end;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({
          text: text.substring(lastIndex),
          highlighted: false,
        });
      }

      return parts;
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      abortController.current?.abort();
    };
  }, []);

  return {
    // State
    query,
    suggestions,
    results,
    recentSearches,
    loading,
    error,

    // Actions
    updateQuery,
    search,
    executeSearch,
    clearSearch,
    clearRecentSearches,
    removeRecentSearch,

    // Utilities
    highlightMatches,
  };
}

export default useAdvancedSearch;
