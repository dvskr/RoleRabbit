/**
 * SearchSuggestionsDropdown Component
 * Dropdown with search suggestions and fuzzy match highlighting
 */

import React from 'react';
import {
  FileText,
  FolderOpen,
  Tag,
  User,
  Clock,
  TrendingUp,
  X,
  ArrowUpRight,
} from 'lucide-react';
import type { SearchSuggestion } from '../../hooks/useAdvancedSearch';

interface SearchSuggestionsDropdownProps {
  suggestions: SearchSuggestion[];
  recentSearches?: string[];
  onSuggestionSelect: (suggestion: { id: string; text: string }) => void;
  onRecentSearchClick?: (query: string) => void;
  onRecentSearchRemove?: (query: string) => void;
  highlightQuery?: string;
  loading?: boolean;
}

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  suggestions,
  recentSearches = [],
  onSuggestionSelect,
  onRecentSearchClick,
  onRecentSearchRemove,
  highlightQuery = '',
  loading = false,
}) => {
  // Get icon for suggestion type
  const getTypeIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'template':
        return <FileText size={16} />;
      case 'category':
        return <FolderOpen size={16} />;
      case 'tag':
        return <Tag size={16} />;
      case 'user':
        return <User size={16} />;
      case 'recent':
        return <Clock size={16} />;
      default:
        return <Search size={16} />;
    }
  };

  // Get color for suggestion type
  const getTypeColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'template':
        return 'text-blue-600';
      case 'category':
        return 'text-purple-600';
      case 'tag':
        return 'text-green-600';
      case 'user':
        return 'text-orange-600';
      case 'recent':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  // Highlight matching parts of text
  const highlightText = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;

    const parts: React.ReactNode[] = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let lastIndex = 0;
    let currentIndex = lowerText.indexOf(lowerQuery, lastIndex);

    // Simple substring matching
    if (currentIndex >= 0) {
      while (currentIndex >= 0) {
        // Add non-matching part
        if (currentIndex > lastIndex) {
          parts.push(
            <span key={`${lastIndex}-${currentIndex}`}>{text.substring(lastIndex, currentIndex)}</span>
          );
        }

        // Add matching part (highlighted)
        const matchEnd = currentIndex + query.length;
        parts.push(
          <mark
            key={`highlight-${currentIndex}`}
            className="bg-yellow-200 text-gray-900 font-semibold rounded px-0.5"
          >
            {text.substring(currentIndex, matchEnd)}
          </mark>
        );

        lastIndex = matchEnd;
        currentIndex = lowerText.indexOf(lowerQuery, lastIndex);
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(<span key={`end-${lastIndex}`}>{text.substring(lastIndex)}</span>);
      }

      return <>{parts}</>;
    }

    // Fuzzy matching - highlight individual characters
    const queryChars = lowerQuery.split('');
    let queryCharIndex = 0;
    const fuzzyParts: React.ReactNode[] = [];

    for (let i = 0; i < text.length; i++) {
      if (queryCharIndex < queryChars.length && lowerText[i] === queryChars[queryCharIndex]) {
        fuzzyParts.push(
          <mark
            key={`fuzzy-${i}`}
            className="bg-yellow-200 text-gray-900 font-semibold rounded px-0.5"
          >
            {text[i]}
          </mark>
        );
        queryCharIndex++;
      } else {
        fuzzyParts.push(<span key={`char-${i}`}>{text[i]}</span>);
      }
    }

    return <>{fuzzyParts}</>;
  };

  return (
    <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase">Recent Searches</span>
          </div>
          <div className="py-1">
            {recentSearches.map((searchQuery, index) => (
              <div
                key={index}
                className="group flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <button
                  onClick={() => onRecentSearchClick?.(searchQuery)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Clock className="text-gray-400 flex-shrink-0" size={16} />
                  <span className="text-sm text-gray-700">{searchQuery}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRecentSearchRemove?.(searchQuery);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          {highlightQuery && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-600 uppercase">Suggestions</span>
            </div>
          )}
          <div className="py-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSuggestionSelect({ id: suggestion.id, text: suggestion.text })}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 ${getTypeColor(suggestion.type)}`}>
                  {getTypeIcon(suggestion.type)}
                </div>

                {/* Image (for templates) */}
                {suggestion.imageUrl && (
                  <img
                    src={suggestion.imageUrl}
                    alt={suggestion.text}
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                  />
                )}

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {highlightText(suggestion.text, highlightQuery)}
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {suggestion.description}
                    </div>
                  )}
                  {suggestion.count !== undefined && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {suggestion.count} {suggestion.count === 1 ? 'result' : 'results'}
                    </div>
                  )}
                </div>

                {/* Type Badge */}
                <div className="flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.type === 'template'
                        ? 'bg-blue-100 text-blue-700'
                        : suggestion.type === 'category'
                        ? 'bg-purple-100 text-purple-700'
                        : suggestion.type === 'tag'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {suggestion.type}
                  </span>
                </div>

                {/* Arrow Icon */}
                <ArrowUpRight
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  size={16}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && suggestions.length === 0 && (
        <div className="px-4 py-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Searching...
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading &&
        suggestions.length === 0 &&
        recentSearches.length === 0 &&
        highlightQuery.length >= 2 && (
          <div className="px-4 py-8 text-center">
            <TrendingUp className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-sm text-gray-600">No suggestions found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
    </div>
  );
};

export default SearchSuggestionsDropdown;
