/**
 * EnhancedSearchBar Component
 * Advanced search bar with autocomplete and suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Clock, TrendingUp } from 'lucide-react';
import { useAdvancedSearch } from '../../hooks/useAdvancedSearch';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';

interface EnhancedSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (resultId: string) => void;
  autoFocus?: boolean;
  className?: string;
  showRecentSearches?: boolean;
  showTrending?: boolean;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder = 'Search templates, categories, tags...',
  onSearch,
  onResultSelect,
  autoFocus = false,
  className = '',
  showRecentSearches = true,
  showTrending = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    suggestions,
    recentSearches,
    loading,
    updateQuery,
    executeSearch,
    clearSearch,
    removeRecentSearch,
  } = useAdvancedSearch({
    debounceMs: 300,
    minQueryLength: 2,
    maxSuggestions: 8,
  });

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateQuery(value);

    if (value.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      executeSearch();
      setShowSuggestions(false);
      onSearch?.(query);
      inputRef.current?.blur();
    }
  };

  // Handle clear
  const handleClear = () => {
    clearSearch();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle suggestion select
  const handleSuggestionSelect = (suggestion: { id: string; text: string }) => {
    updateQuery(suggestion.text);
    executeSearch();
    setShowSuggestions(false);
    onSearch?.(suggestion.text);

    if (suggestion.id) {
      onResultSelect?.(suggestion.id);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchQuery: string) => {
    updateQuery(searchQuery);
    executeSearch();
    setShowSuggestions(false);
    onSearch?.(searchQuery);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (query.length === 0 && (showRecentSearches || showTrending)) {
      setShowSuggestions(true);
    } else if (query.length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Show suggestions if we have query with results, or empty with recent/trending
  const shouldShowSuggestions =
    showSuggestions &&
    (suggestions.length > 0 ||
      (query.length === 0 && (recentSearches.length > 0 || showTrending)));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="text-gray-400 animate-spin" size={20} />
          ) : (
            <Search className="text-gray-400" size={20} />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-400 transition-all ${
            isFocused
              ? 'border-blue-500 ring-4 ring-blue-100'
              : 'border-gray-300 hover:border-gray-400'
          } focus:outline-none`}
        />

        {/* Clear Button */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {shouldShowSuggestions && (
        <SearchSuggestionsDropdown
          suggestions={suggestions}
          recentSearches={showRecentSearches && query.length === 0 ? recentSearches : []}
          onSuggestionSelect={handleSuggestionSelect}
          onRecentSearchClick={handleRecentSearchClick}
          onRecentSearchRemove={removeRecentSearch}
          highlightQuery={query}
          loading={loading}
        />
      )}

      {/* Search Tips (when empty and focused) */}
      {isFocused && query.length === 0 && !shouldShowSuggestions && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Search Tips</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Search size={14} className="mt-0.5 flex-shrink-0" />
              <span>Search by template name, category, or tags</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp size={14} className="mt-0.5 flex-shrink-0" />
              <span>Use fuzzy matching to find similar results</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5 flex-shrink-0" />
              <span>Recent searches are saved for quick access</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
