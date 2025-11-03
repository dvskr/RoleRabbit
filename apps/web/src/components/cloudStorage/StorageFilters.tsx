'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Grid, List, Columns, Star, Archive, Share2, Clock, Globe, Trash2, RotateCcw } from 'lucide-react';
import { FileType, SortBy, ViewMode } from '../../types/cloudStorage';
import { useTheme } from '../../contexts/ThemeContext';

interface StorageFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: FileType;
  setFilterType: (type: FileType) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedFiles: string[];
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  quickFilters?: {
    starred?: boolean;
    archived?: boolean;
    shared?: boolean;
    recent?: boolean;
    public?: boolean;
  };
  setQuickFilters?: (filters: {
    starred?: boolean;
    archived?: boolean;
    shared?: boolean;
    recent?: boolean;
    public?: boolean;
  }) => void;
  showDeleted?: boolean;
  setShowDeleted?: (show: boolean) => void;
}

export default function StorageFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedFiles,
  onSelectAll,
  onDeleteSelected,
  quickFilters = {},
  setQuickFilters,
  showDeleted = false,
  setShowDeleted
}: StorageFiltersProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Local state for search input to debounce
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);

  // Sync with external searchTerm changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  }, []);

  const toggleQuickFilter = useCallback((filterType: keyof typeof quickFilters) => {
    if (!setQuickFilters) return;
    
    setQuickFilters({
      ...quickFilters,
      [filterType]: quickFilters[filterType] ? undefined : true
    });
  }, [quickFilters, setQuickFilters]);

  // Clear all quick filters
  const clearQuickFilters = useCallback(() => {
    if (!setQuickFilters) return;
    setQuickFilters({});
  }, [setQuickFilters]);

  const hasActiveQuickFilters = Object.values(quickFilters).some(v => v !== undefined);

  return (
    <div className="flex flex-col gap-2 mb-2" data-testid="storage-filters">
      {/* Unified compact search/filter bar */}
      <div className="flex items-center gap-2 flex-1">
        {/* Search */}
        <div className="relative flex-1">
          <Search 
            size={14} 
            className="absolute left-2.5 top-2" 
            style={{ color: colors.tertiaryText }}
          />
          <input
            type="text"
            value={localSearchTerm}
            onChange={handleSearchChange}
            placeholder="Search files..."
            className="pl-9 pr-3 py-1.5 rounded-lg focus:outline-none w-full text-sm transition-all"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
            data-testid="storage-search-input"
          />
        </div>

        {/* Compact Filter & Sort */}
        <div className="flex items-center gap-1">
          <Filter size={14} style={{ color: colors.secondaryText }} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FileType)}
            className="px-2.5 py-1.5 rounded-lg focus:outline-none text-sm transition-all"
            aria-label="Filter by file type"
            title="Filter by file type"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
            data-testid="storage-filter-select"
          >
            <option value="all" style={{ background: colors.background, color: colors.secondaryText }}>All Files</option>
            <option value="resume" style={{ background: colors.background, color: colors.secondaryText }}>Resumes</option>
            <option value="template" style={{ background: colors.background, color: colors.secondaryText }}>Templates</option>
            <option value="backup" style={{ background: colors.background, color: colors.secondaryText }}>Backups</option>
            <option value="document" style={{ background: colors.background, color: colors.secondaryText }}>Documents</option>
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-2.5 py-1.5 rounded-lg focus:outline-none text-sm transition-all"
          aria-label="Sort files"
          title="Sort files"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
          }}
          data-testid="storage-sort-select"
        >
          <option value="date" style={{ background: colors.background, color: colors.secondaryText }}>Date</option>
          <option value="name" style={{ background: colors.background, color: colors.secondaryText }}>Name</option>
          <option value="size" style={{ background: colors.background, color: colors.secondaryText }}>Size</option>
        </select>

        {/* View Mode Toggle */}
        <div 
          className="flex items-center rounded-lg p-0.5"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            onClick={() => setViewMode('list')}
            className="p-1 rounded-md transition-colors"
            style={{
              background: viewMode === 'list' ? colors.cardBackground : 'transparent',
              color: viewMode === 'list' ? colors.primaryText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'list') {
                e.currentTarget.style.color = colors.primaryText;
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'list') {
                e.currentTarget.style.color = colors.secondaryText;
              }
            }}
            title="List view"
            data-testid="storage-view-list"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className="p-1 rounded-md transition-colors"
            style={{
              background: viewMode === 'grid' ? colors.cardBackground : 'transparent',
              color: viewMode === 'grid' ? colors.primaryText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.color = colors.primaryText;
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.color = colors.secondaryText;
              }
            }}
            title="Grid view"
            data-testid="storage-view-grid"
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className="p-1 rounded-md transition-colors"
            style={{
              background: viewMode === 'compact' ? colors.cardBackground : 'transparent',
              color: viewMode === 'compact' ? colors.primaryText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'compact') {
                e.currentTarget.style.color = colors.primaryText;
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'compact') {
                e.currentTarget.style.color = colors.secondaryText;
              }
            }}
            title="Compact view"
            data-testid="storage-view-compact"
          >
            <Columns size={14} />
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      {setQuickFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toggleQuickFilter('starred')}
            className={`px-2 py-1 rounded-lg transition-colors text-xs font-medium flex items-center gap-1`}
            style={{
              background: quickFilters.starred ? colors.badgeInfoBg : colors.inputBackground,
              color: quickFilters.starred ? colors.primaryBlue : colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (!quickFilters.starred) {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!quickFilters.starred) {
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
          >
            <Star size={12} fill={quickFilters.starred ? colors.primaryBlue : 'none'} />
            Starred
          </button>

          <button
            onClick={() => toggleQuickFilter('recent')}
            className={`px-2 py-1 rounded-lg transition-colors text-xs font-medium flex items-center gap-1`}
            style={{
              background: quickFilters.recent ? colors.badgeInfoBg : colors.inputBackground,
              color: quickFilters.recent ? colors.primaryBlue : colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (!quickFilters.recent) {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!quickFilters.recent) {
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
          >
            <Clock size={12} />
            Recent
          </button>

          <button
            onClick={() => toggleQuickFilter('shared')}
            className={`px-2 py-1 rounded-lg transition-colors text-xs font-medium flex items-center gap-1`}
            style={{
              background: quickFilters.shared ? colors.badgeInfoBg : colors.inputBackground,
              color: quickFilters.shared ? colors.primaryBlue : colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (!quickFilters.shared) {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!quickFilters.shared) {
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
          >
            <Share2 size={12} />
            Shared
          </button>

          <button
            onClick={() => toggleQuickFilter('archived')}
            className={`px-2 py-1 rounded-lg transition-colors text-xs font-medium flex items-center gap-1`}
            style={{
              background: quickFilters.archived ? colors.badgeInfoBg : colors.inputBackground,
              color: quickFilters.archived ? colors.primaryBlue : colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (!quickFilters.archived) {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!quickFilters.archived) {
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
          >
            <Archive size={12} />
            Archived
          </button>

          <button
            onClick={() => toggleQuickFilter('public')}
            className={`px-2 py-1 rounded-lg transition-colors text-xs font-medium flex items-center gap-1`}
            style={{
              background: quickFilters.public ? colors.badgeInfoBg : colors.inputBackground,
              color: quickFilters.public ? colors.primaryBlue : colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (!quickFilters.public) {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!quickFilters.public) {
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
          >
            <Globe size={12} />
            Public
          </button>

          {hasActiveQuickFilters && (
            <button
              onClick={clearQuickFilters}
              className="px-2 py-1 rounded-lg transition-colors text-xs font-medium"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.color = colors.primaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.secondaryText;
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Recycle Bin Toggle */}
      {setShowDeleted && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5"
            style={{
              background: showDeleted ? colors.badgeErrorBg : colors.inputBackground,
              border: `1px solid ${showDeleted ? colors.badgeErrorBorder : colors.border}`,
              color: showDeleted ? colors.badgeErrorText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!showDeleted) {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!showDeleted) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title={showDeleted ? 'Hide Recycle Bin' : 'Show Recycle Bin'}
            data-testid="storage-show-deleted-toggle"
          >
            {showDeleted ? <RotateCcw size={14} /> : <Trash2 size={14} />}
            <span>Recycle Bin</span>
          </button>
        </div>
      )}

      {/* Bulk Actions - Inline */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span 
            className="text-xs"
            style={{ color: colors.secondaryText }}
          >
            {selectedFiles.length} selected
          </span>
          <button
            onClick={onSelectAll}
            className="text-xs font-medium transition-colors"
            style={{ color: colors.primaryBlue }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Clear
          </button>
          <button
            onClick={onDeleteSelected}
            className="px-2.5 py-1 rounded-lg transition-colors text-xs font-medium"
            style={{
              background: colors.badgeErrorBg,
              color: colors.errorRed,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
