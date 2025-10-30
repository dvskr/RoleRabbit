'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { DiscussionFilters, Community } from '../../types/discussion';
import { useTheme } from '../../contexts/ThemeContext';
import { debounce } from '../../utils/performance';

interface DiscussionHeaderProps {
  filters: DiscussionFilters;
  communities: Community[];
  onUpdateFilters: (filters: Partial<DiscussionFilters>) => void;
  onShowFilters: () => void;
  onRefresh: () => void;
}

export default function DiscussionHeader({
  filters,
  communities,
  onUpdateFilters,
  onShowFilters,
  onRefresh
}: DiscussionHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Local state for search input (for instant UI feedback)
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery || '');

  // Debounced filter update for search
  const debouncedUpdateFilters = useCallback(
    debounce((searchValue: string) => {
      onUpdateFilters({ searchQuery: searchValue });
    }, 300),
    [onUpdateFilters]
  );

  // Update local state when filters prop changes externally
  useEffect(() => {
    setLocalSearchQuery(filters.searchQuery || '');
  }, [filters.searchQuery]);

  // Debounce search term changes
  useEffect(() => {
    if (localSearchQuery !== filters.searchQuery) {
      debouncedUpdateFilters(localSearchQuery);
    }
  }, [localSearchQuery, filters.searchQuery, debouncedUpdateFilters]);

  // Inject styles for select dropdown options to support dark theme
  useEffect(() => {
    const styleId = 'discussion-header-select-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Ensure high contrast text color - use brightest available text color
    const optionTextColor = theme.mode === 'dark' ? '#f1f5f9' : colors.primaryText;
    
    styleElement.textContent = `
      select[id="community-filter-select"] {
        background-color: ${colors.inputBackground} !important;
        color: ${optionTextColor} !important;
      }
      select[id="community-filter-select"] option {
        background-color: ${colors.inputBackground} !important;
        background: ${colors.inputBackground} !important;
        color: ${optionTextColor} !important;
        padding: 8px 12px !important;
        font-weight: 400 !important;
      }
      select[id="community-filter-select"] option:checked,
      select[id="community-filter-select"] option:focus,
      select[id="community-filter-select"] option[selected],
      select[id="community-filter-select"] option:hover {
        background-color: ${colors.primaryBlue} !important;
        background: ${colors.primaryBlue} !important;
        color: #ffffff !important;
      }
      select[id="community-filter-select"]:focus option {
        background-color: ${colors.inputBackground} !important;
        background: ${colors.inputBackground} !important;
        color: ${optionTextColor} !important;
      }
      select[id="community-filter-select"]:focus option:checked,
      select[id="community-filter-select"]:focus option[selected],
      select[id="community-filter-select"]:focus option:hover {
        background-color: ${colors.primaryBlue} !important;
        background: ${colors.primaryBlue} !important;
        color: #ffffff !important;
      }
    `;

    return () => {
      // Cleanup is handled by React, but we keep the style element for theme updates
    };
  }, [colors, theme.mode]);

  return (
    <div className="px-4 py-2.5 flex-shrink-0" style={{ background: colors.headerBackground, borderBottom: `1px solid ${colors.border}` }}>
      {/* Consolidated Layout: Search bar with everything inline */}
      <div className="flex items-center gap-3">
        {/* Tagline - compact inline */}
        <p className="text-xs whitespace-nowrap" style={{ color: colors.secondaryText }}>Connect & learn</p>
        
        {/* Divider */}
        <div className="h-6 w-px" style={{ background: colors.border }} />
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.tertiaryText }} />
          <input
            type="text"
            placeholder="Search discussions..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
          />
        </div>
        
        {/* Community Filter - inline */}
        <select
          id="community-filter-select"
          value={filters.selectedCommunity || ''}
          onChange={(e) => onUpdateFilters({ selectedCommunity: e.target.value || null })}
          className="px-3 py-2 rounded-lg transition-colors text-sm"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = colors.inputBackground; }}
          onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
          aria-label="Filter by community"
          title="Filter by community"
        >
          <option value="">All Communities</option>
          {communities.map(community => (
            <option key={community.id} value={community.name}>
              {community.name}
            </option>
          ))}
        </select>
        
        {/* Filters Button */}
        <button
          onClick={onShowFilters}
          className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Filter size={16} />
          <span className="text-sm">Filters</span>
        </button>
        
        {/* Refresh Button - inline */}
        <button 
          onClick={onRefresh}
          className="px-2.5 py-2 rounded-lg transition-colors"
          style={{ color: colors.secondaryText }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          title="Refresh"
          aria-label="Refresh discussions"
        >
          <RefreshCw size={16} className="inline" />
        </button>
      </div>
    </div>
  );
}
