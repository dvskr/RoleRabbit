'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter as FilterIcon, List, Grid, Columns, BarChart3, Trash2, Download, Upload, Settings } from 'lucide-react';
import { JobFilters as JobFiltersType, ViewMode } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';
import { debounce } from '../../utils/performance';

interface JobMergedToolbarProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedJobsCount: number;
  onBulkUpdateStatus: (status: 'applied' | 'interview' | 'offer' | 'rejected') => void;
  onBulkDelete: (permanent?: boolean) => void;
  onBulkRestore?: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowSettings: () => void;
}

export default function JobMergedToolbar({
  filters,
  onFiltersChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  viewMode,
  onViewModeChange,
  selectedJobsCount,
  onBulkUpdateStatus,
  onBulkDelete,
  onBulkRestore,
  onClearSelection,
  onExport,
  onImport,
  onShowSettings
}: JobMergedToolbarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Local state for search input (for instant UI feedback)
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');

  // Debounced filter update for search
  const debouncedUpdateFilters = useCallback(
    debounce((searchValue: string) => {
      onFiltersChange({
        ...filters,
        searchTerm: searchValue
      });
    }, 300),
    [filters, onFiltersChange]
  );

  // Update local state when filters prop changes externally
  useEffect(() => {
    setLocalSearchTerm(filters.searchTerm || '');
  }, [filters.searchTerm]);

  // Debounce search term changes
  useEffect(() => {
    if (localSearchTerm !== filters.searchTerm) {
      debouncedUpdateFilters(localSearchTerm);
    }
  }, [localSearchTerm, filters.searchTerm, debouncedUpdateFilters]);

  const handleFilterChange = (key: keyof JobFiltersType, value: any) => {
    if (key === 'searchTerm') {
      // Update local state immediately for instant UI feedback
      setLocalSearchTerm(value);
    } else {
      // For non-search filters, update immediately
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  return (
    <div 
      className="px-4 py-2.5 border-b"
      style={{
        background: colors.toolbarBackground,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {/* Main Toolbar Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side - Search and Filters */}
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2" 
              style={{ color: colors.tertiaryText }}
            />
            <input
              type="text"
              placeholder="Search jobs..."
              value={localSearchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm"
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
          
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs transition-all appearance-none cursor-pointer"
            title="Filter by status"
            aria-label="Filter by status"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <option value="all" style={{ background: colors.background, color: colors.secondaryText }}>All</option>
            <option value="applied" style={{ background: colors.background, color: colors.secondaryText }}>Applied</option>
            <option value="interview" style={{ background: colors.background, color: colors.secondaryText }}>Interview</option>
            <option value="offer" style={{ background: colors.background, color: colors.secondaryText }}>Offer</option>
            <option value="rejected" style={{ background: colors.background, color: colors.secondaryText }}>Rejected</option>
          </select>
          
          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs transition-all appearance-none cursor-pointer"
            title="Sort by field"
            aria-label="Sort by field"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <option value="date" style={{ background: colors.background, color: colors.secondaryText }}>Date</option>
            <option value="company" style={{ background: colors.background, color: colors.secondaryText }}>Company</option>
            <option value="priority" style={{ background: colors.background, color: colors.secondaryText }}>Priority</option>
          </select>
          
          {/* Advanced Filters Toggle */}
          <button
            onClick={onToggleAdvancedFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
            style={{
              background: showAdvancedFilters 
                ? colors.badgePurpleBg 
                : colors.inputBackground,
              border: showAdvancedFilters 
                ? `1px solid ${colors.badgePurpleBorder}` 
                : `1px solid ${colors.border}`,
              color: showAdvancedFilters ? colors.activeText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!showAdvancedFilters) {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!showAdvancedFilters) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
          >
            <FilterIcon size={13} />
            <span>Filters</span>
          </button>
        </div>

        {/* Center - Bulk Actions */}
        {selectedJobsCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: colors.secondaryText }}>
              {selectedJobsCount} selected
            </span>
            
            <select
              onChange={(e) => onBulkUpdateStatus(e.target.value as 'applied' | 'interview' | 'offer' | 'rejected')}
              className="px-2 py-1 rounded text-xs transition-all"
              title="Update status for selected jobs"
              aria-label="Update status for selected jobs"
              style={{
                background: colors.badgeInfoBg,
                color: colors.badgeInfoText,
                border: `1px solid ${colors.badgeInfoBorder}`,
              }}
            >
              <option value="" style={{ background: colors.background, color: colors.secondaryText }}>Update Status</option>
              <option value="applied" style={{ background: colors.background, color: colors.secondaryText }}>Applied</option>
              <option value="interview" style={{ background: colors.background, color: colors.secondaryText }}>Interview</option>
              <option value="offer" style={{ background: colors.background, color: colors.secondaryText }}>Offer</option>
              <option value="rejected" style={{ background: colors.background, color: colors.secondaryText }}>Rejected</option>
            </select>
            
            {filters.showDeleted && onBulkRestore && (
              <button
                onClick={onBulkRestore}
                className="p-1 rounded transition-all"
                style={{ color: colors.badgeSuccessText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeSuccessBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Restore Selected"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={() => onBulkDelete(filters.showDeleted)}
              className="p-1 rounded transition-all"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeErrorBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title={filters.showDeleted ? "Permanently Delete Selected" : "Delete Selected"}
            >
              {filters.showDeleted ? <Trash size={14} /> : <Trash2 size={14} />}
            </button>
            
            <button
              onClick={onClearSelection}
              className="text-xs px-2 py-1 rounded transition-all"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Right Side - View Controls and Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div 
            className="flex items-center rounded-md overflow-hidden"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <button
              onClick={() => onViewModeChange('table')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'table' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'table' ? colors.activeText : colors.tertiaryText,
              }}
              title="Table View"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'kanban' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'kanban' ? colors.activeText : colors.tertiaryText,
                borderLeft: `1px solid ${colors.border}`,
              }}
              title="Kanban View"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'list' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'list' ? colors.activeText : colors.tertiaryText,
                borderLeft: `1px solid ${colors.border}`,
              }}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'grid' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'grid' ? colors.activeText : colors.tertiaryText,
                borderLeft: `1px solid ${colors.border}`,
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              className="p-1.5 rounded transition-all"
              style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.tertiaryText;
              }}
              title="Export Jobs"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onImport}
              className="p-1.5 rounded transition-all"
              style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.tertiaryText;
              }}
              title="Import Jobs"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={onShowSettings}
              className="p-1.5 rounded transition-all"
              style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.tertiaryText;
              }}
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div 
          className="mt-2.5 pt-2.5"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            {/* Group By */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs" style={{ color: colors.tertiaryText }}>Group by:</label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                className="px-2 py-1 rounded-md text-xs transition-all appearance-none cursor-pointer"
                title="Group by field"
                aria-label="Group by field"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.secondaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <option value="status" style={{ background: colors.background, color: colors.secondaryText }}>Status</option>
                <option value="company" style={{ background: colors.background, color: colors.secondaryText }}>Company</option>
                <option value="priority" style={{ background: colors.background, color: colors.secondaryText }}>Priority</option>
                <option value="date" style={{ background: colors.background, color: colors.secondaryText }}>Date</option>
              </select>
            </div>

            {/* Show Archived */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="showArchived"
                checked={filters.showArchived}
                onChange={(e) => handleFilterChange('showArchived', e.target.checked)}
                className="rounded transition-all"
                style={{
                  accentColor: colors.primaryBlue,
                  cursor: 'pointer',
                }}
              />
              <label htmlFor="showArchived" className="text-xs cursor-pointer" style={{ color: colors.secondaryText }}>
                Show Archived
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
