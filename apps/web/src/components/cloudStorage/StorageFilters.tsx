'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Grid, List, Columns } from 'lucide-react';
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
  onDeleteSelected
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

  return (
    <div className="flex items-center gap-3 mb-2">
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
          >
            <option value="all" style={{ background: colors.background, color: colors.secondaryText }}>All Files</option>
            <option value="resume" style={{ background: colors.background, color: colors.secondaryText }}>Resumes</option>
            <option value="template" style={{ background: colors.background, color: colors.secondaryText }}>Templates</option>
            <option value="backup" style={{ background: colors.background, color: colors.secondaryText }}>Backups</option>
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
          >
            <Columns size={14} />
          </button>
        </div>
      </div>

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
