/**
 * JobTable toolbar component - handles search, filters, view modes, and actions
 */

import React, { useState } from 'react';
import { Search, Calendar, FilterIcon, TrashIcon, RotateCcw, Trash2, BarChart3, Columns, List, Grid, Download, Upload, Settings } from 'lucide-react';
import { JobFilters, ViewMode } from '../../../types/job';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Column, ColumnKey } from '../types/jobTable.types';
import JobTableColumnPicker from './JobTableColumnPicker';

interface JobTableToolbarProps {
  // Filters
  tableFilters: JobFilters;
  setTableFilters: (filters: JobFilters) => void;
  onFiltersChange?: (filters: JobFilters) => void;
  showDeleted: boolean;
  showFiltersModal: boolean;
  setShowFiltersModal: (show: boolean) => void;
  onShowFilters?: () => void;
  
  // Selection
  selectedJobs: string[];
  
  // View mode
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  
  // Bulk actions
  onBulkDelete?: (permanent?: boolean) => void;
  onBulkRestore?: () => void;
  
  // Export/Import
  onExport: () => void;
  onImport: () => void;
  
  // Columns
  columns: Column[];
  toggleColumn: (key: ColumnKey) => void;
}

export default function JobTableToolbar({
  tableFilters,
  setTableFilters,
  onFiltersChange,
  showDeleted,
  showFiltersModal,
  setShowFiltersModal,
  onShowFilters,
  selectedJobs,
  viewMode = 'table',
  onViewModeChange,
  onBulkDelete,
  onBulkRestore,
  onExport,
  onImport,
  columns,
  toggleColumn,
}: JobTableToolbarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const handleFilterChange = (newFilters: JobFilters) => {
    setTableFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  return (
    <div 
      className="px-4 py-2.5 flex items-center justify-between gap-3 flex-shrink-0 relative"
      style={{
        borderBottom: `1px solid ${colors.border}`,
        background: colors.toolbarBackground,
      }}
    >
      {/* Left Side - Search and Quick Filters */}
      <div className="flex items-center gap-2 flex-1">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: colors.tertiaryText }}
          />
          <input
            type="text"
            placeholder="Search jobs..."
            value={tableFilters.searchTerm || ''}
            onChange={(e) => {
              handleFilterChange({ ...tableFilters, searchTerm: e.target.value });
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm transition-all outline-none"
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
        
        {/* Quick Filter Buttons: All, Date, Filters */}
        <button
          onClick={() => {
            handleFilterChange({ ...tableFilters, status: 'all', priority: undefined, location: undefined, dateRange: undefined });
          }}
          className="px-3 py-1.5 rounded-md text-sm transition-all"
          style={{
            background: tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange
              ? colors.badgePurpleBg
              : colors.inputBackground,
            border: `1px solid ${
              tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange
                ? colors.badgePurpleBorder
                : colors.border
            }`,
            color: tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange
              ? colors.activeText
              : colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            if (!(tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange)) {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }
          }}
          onMouseLeave={(e) => {
            if (!(tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange)) {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }
          }}
          title="Show All"
        >
          All
        </button>

        <button
          onClick={() => {
            handleFilterChange({ ...tableFilters, sortBy: 'date' });
          }}
          className="px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5"
          style={{
            background: tableFilters.sortBy === 'date'
              ? colors.badgePurpleBg
              : colors.inputBackground,
            border: `1px solid ${
              tableFilters.sortBy === 'date'
                ? colors.badgePurpleBorder
                : colors.border
            }`,
            color: tableFilters.sortBy === 'date'
              ? colors.activeText
              : colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            if (tableFilters.sortBy !== 'date') {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }
          }}
          onMouseLeave={(e) => {
            if (tableFilters.sortBy !== 'date') {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }
          }}
          title="Sort by Date"
        >
          <Calendar size={14} />
          Date
        </button>

        <button
          onClick={() => {
            setShowFiltersModal(true);
            if (onShowFilters) onShowFilters();
          }}
          className="px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5"
          style={{
            background: showFiltersModal
              ? colors.badgePurpleBg
              : colors.inputBackground,
            border: `1px solid ${
              showFiltersModal
                ? colors.badgePurpleBorder
                : colors.border
            }`,
            color: showFiltersModal
              ? colors.activeText
              : colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            if (!showFiltersModal) {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }
          }}
          onMouseLeave={(e) => {
            if (!showFiltersModal) {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }
          }}
          title="Filters & Views"
        >
          <FilterIcon size={14} />
          Filters
        </button>

        {/* Recycle Bin Button */}
        <button
          onClick={() => {
            handleFilterChange({ ...tableFilters, showDeleted: !tableFilters.showDeleted });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
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
        >
          <TrashIcon size={14} />
          <span>Recycle Bin</span>
        </button>
      </div>

      {/* Center - Bulk Actions (when items are selected) */}
      {selectedJobs.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: colors.secondaryText }}>
            {selectedJobs.length} selected
          </span>
          {showDeleted && onBulkRestore && (
            <button
              onClick={() => onBulkRestore()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.badgeSuccessText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.badgeSuccessBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }}
              title="Restore Selected"
            >
              <RotateCcw size={14} />
              <span>Restore</span>
            </button>
          )}
          {onBulkDelete && (
            <button
              onClick={() => onBulkDelete(showDeleted)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.badgeErrorText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.badgeErrorBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }}
              title={showDeleted ? 'Permanently Delete Selected' : 'Delete Selected'}
            >
              <Trash2 size={14} />
              <span>{showDeleted ? 'Delete Forever' : 'Delete'}</span>
            </button>
          )}
        </div>
      )}

      {/* Right Side - View Mode Toggles and Actions */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggles */}
        <div 
          className="flex items-center rounded-md overflow-hidden"
          style={{ border: `1px solid ${colors.border}` }}
        >
          <button
            onClick={() => onViewModeChange && onViewModeChange('table')}
            className="p-1.5 transition-all"
            style={{
              background: viewMode === 'table' ? colors.badgePurpleBg : 'transparent',
              color: viewMode === 'table' ? colors.activeText : colors.tertiaryText,
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'table') {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'table') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title="Table View"
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => onViewModeChange && onViewModeChange('kanban')}
            className="p-1.5 transition-all"
            style={{
              background: viewMode === 'kanban' ? colors.badgePurpleBg : 'transparent',
              color: viewMode === 'kanban' ? colors.activeText : colors.tertiaryText,
              borderLeft: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'kanban') {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'kanban') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title="Kanban View"
          >
            <Columns size={16} />
          </button>
          <button
            onClick={() => onViewModeChange && onViewModeChange('list')}
            className="p-1.5 transition-all"
            style={{
              background: viewMode === 'list' ? colors.badgePurpleBg : 'transparent',
              color: viewMode === 'list' ? colors.activeText : colors.tertiaryText,
              borderLeft: `1px solid ${colors.border}`,
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
            title="List View"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => onViewModeChange && onViewModeChange('grid')}
            className="p-1.5 transition-all"
            style={{
              background: viewMode === 'grid' ? colors.badgePurpleBg : 'transparent',
              color: viewMode === 'grid' ? colors.activeText : colors.tertiaryText,
              borderLeft: `1px solid ${colors.border}`,
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
            title="Grid View"
          >
            <Grid size={16} />
          </button>
        </div>

        {/* Action Icons: Download, Upload, Settings */}
        <div className="flex items-center gap-1">
          <button
            onClick={onExport}
            className="p-1.5 rounded transition-all"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.tertiaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Export Jobs"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onImport}
            className="p-1.5 rounded transition-all"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.tertiaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Import Jobs"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            className="p-1.5 rounded transition-all relative"
            style={{
              background: showColumnPicker ? colors.badgePurpleBg : colors.inputBackground,
              border: `1px solid ${showColumnPicker ? colors.badgePurpleBorder : colors.border}`,
              color: showColumnPicker ? colors.activeText : colors.tertiaryText,
            }}
            onMouseEnter={(e) => {
              if (!showColumnPicker) {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }
            }}
            onMouseLeave={(e) => {
              if (!showColumnPicker) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.color = colors.tertiaryText;
              }
            }}
            title="Column Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Column Picker Dropdown */}
      {showColumnPicker && (
        <JobTableColumnPicker
          columns={columns}
          toggleColumn={toggleColumn}
          onClose={() => setShowColumnPicker(false)}
        />
      )}
    </div>
  );
}

