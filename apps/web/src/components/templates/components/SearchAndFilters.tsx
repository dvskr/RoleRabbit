/**
 * SearchAndFilters - Search bar, sort, view mode, and filter toggle
 */

import React from 'react';
import type { ThemeColors } from '../types';
import { Search, Filter, Grid, List, RefreshCw } from 'lucide-react';
import type { ThemeColors } from '../types';
import { TemplateSortBy, TemplateViewMode } from '../types';
import type { ThemeColors } from '../types';
import { SORT_OPTIONS } from '../constants';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: TemplateSortBy;
  setSortBy: (sortBy: TemplateSortBy) => void;
  viewMode: TemplateViewMode;
  setViewMode: (viewMode: TemplateViewMode) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  colors: ThemeColors;
}

export default function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  colors,
}: SearchAndFiltersProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={16}
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
          style={{ color: colors.tertiaryText }}
        />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-sm"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.borderFocused;
            e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.outline = 'none';
          }}
        />
      </div>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as TemplateSortBy)}
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: colors.inputBackground,
          border: `1px solid ${colors.border}`,
          color: colors.primaryText,
        }}
        aria-label="Sort templates by"
        title="Sort templates"
      >
        {SORT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* View Mode */}
      <div
        className="flex items-center rounded-lg p-0.5"
        style={{ border: `1px solid ${colors.border}` }}
      >
        <button
          onClick={() => setViewMode('grid')}
          className="p-1.5 rounded-md transition-colors"
          style={{
            background: viewMode === 'grid' ? colors.badgeInfoBg : 'transparent',
            color: viewMode === 'grid' ? colors.badgeInfoText : colors.tertiaryText,
          }}
          onMouseEnter={(e) => {
            if (viewMode !== 'grid') {
              e.currentTarget.style.background = colors.hoverBackground;
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== 'grid') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
          aria-label="Grid view"
          title="Grid view"
        >
          <Grid size={16} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className="p-1.5 rounded-md transition-colors"
          style={{
            background: viewMode === 'list' ? colors.badgeInfoBg : 'transparent',
            color: viewMode === 'list' ? colors.badgeInfoText : colors.tertiaryText,
          }}
          onMouseEnter={(e) => {
            if (viewMode !== 'list') {
              e.currentTarget.style.background = colors.hoverBackground;
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== 'list') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
          aria-label="List view"
          title="List view"
        >
          <List size={16} />
        </button>
      </div>

      {/* Filters Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-3 py-2 rounded-lg border transition-colors text-sm"
        style={{
          background: showFilters ? colors.badgeInfoBg : 'transparent',
          border: `1px solid ${showFilters ? colors.badgeInfoBorder : colors.border}`,
          color: showFilters ? colors.badgeInfoText : colors.secondaryText,
        }}
        onMouseEnter={(e) => {
          if (!showFilters) {
            e.currentTarget.style.background = colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (!showFilters) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
        aria-label="Toggle filters"
      >
        <Filter size={16} className="inline mr-1" />
        Filters
      </button>

      {/* Refresh Button */}
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-2 rounded-lg transition-colors text-sm border"
        style={{
          border: `1px solid ${colors.border}`,
          color: colors.secondaryText,
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Refresh"
        title="Refresh"
      >
        <RefreshCw size={14} className="inline mr-1" />
        Refresh
      </button>
    </div>
  );
}

