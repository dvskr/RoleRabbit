'use client';

import React, { useState } from 'react';
import { X, Filter as FilterIcon, Save, FileText, Trash as TrashIcon } from 'lucide-react';
import { JobFilters, SavedView } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';

interface JobFiltersPanelProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onClose: () => void;
  savedViews?: SavedView[];
  onSaveView?: (view: Omit<SavedView, 'id' | 'createdAt'>) => void;
  onDeleteView?: (viewId: string) => void;
  onLoadView?: (view: SavedView) => void;
}

export default function JobFiltersPanel({
  filters,
  onFiltersChange,
  onClose,
  savedViews = [],
  onSaveView,
  onDeleteView,
  onLoadView
}: JobFiltersPanelProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [viewName, setViewName] = useState('');
  const [showSaveView, setShowSaveView] = useState(false);

  const handleFilterChange = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    handleFilterChange('dateRange', {
      ...filters.dateRange,
      [field]: value || undefined
    });
  };

  const handleSaveCurrentView = () => {
    if (viewName.trim() && onSaveView) {
      onSaveView({
        name: viewName.trim(),
        filters: { ...filters },
        columns: [] // Could be enhanced to save column visibility
      });
      setViewName('');
      setShowSaveView(false);
    }
  };

  const handleLoadView = (view: SavedView) => {
    if (onLoadView) {
      onLoadView(view);
    }
  };

  return (
    <div 
      className="fixed inset-y-0 right-0 z-[100] flex flex-col shadow-2xl"
      style={{
        width: '380px',
        maxWidth: '90vw',
        background: colors.cardBackground,
        borderLeft: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
        top: 0,
        bottom: 0,
        animation: 'slideInFromRight 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
        style={{ 
          borderBottom: `1px solid ${colors.border}`,
          background: colors.toolbarBackground,
        }}
      >
        <div className="flex items-center gap-2">
          <FilterIcon size={18} style={{ color: colors.primaryBlue }} />
          <h2 
            className="text-base font-semibold"
            style={{ color: colors.primaryText }}
          >
            Filters & Views
          </h2>
        </div>
        <button
          onClick={onClose}
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
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${colors.border} transparent` }}>
        <div className="p-4 space-y-6">
          {/* Saved Views Section */}
          {savedViews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.tertiaryText }}
                >
                  Saved Views
                </p>
                <button
                  onClick={() => setShowSaveView(true)}
                  className="p-1 rounded transition-all"
                  style={{ color: colors.primaryBlue }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Save current view"
                >
                  <Save size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {savedViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between px-3 py-2 rounded transition-all group"
                    style={{
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <button
                      onClick={() => handleLoadView(view)}
                      className="flex-1 text-left text-sm flex items-center gap-2"
                      style={{ color: colors.secondaryText }}
                    >
                      <FileText size={14} />
                      <span>{view.name}</span>
                    </button>
                    {onDeleteView && (
                      <button
                        onClick={() => onDeleteView(view.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: colors.badgeErrorText }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.hoverBackground;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Delete view"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save View Input */}
          {showSaveView && (
            <div className="space-y-2 p-3 rounded"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <input
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="View name..."
                className="w-full px-3 py-2 rounded text-sm transition-all outline-none"
                style={{
                  background: colors.background,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCurrentView();
                  } else if (e.key === 'Escape') {
                    setShowSaveView(false);
                    setViewName('');
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCurrentView}
                  className="px-3 py-1.5 rounded text-sm transition-all flex-1"
                  style={{
                    background: colors.primaryBlue,
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.primaryBlueHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.primaryBlue;
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveView(false);
                    setViewName('');
                  }}
                  className="px-3 py-1.5 rounded text-sm transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.secondaryText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {savedViews.length === 0 && !showSaveView && (
            <div className="text-center py-4">
              <button
                onClick={() => setShowSaveView(true)}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm transition-all mx-auto"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.secondaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <Save size={14} />
                <span>Save current view</span>
              </button>
            </div>
          )}

          {/* Filters Section */}
          <div className="space-y-4">
            <p 
              className="text-xs font-semibold uppercase tracking-wider block"
              style={{ color: colors.tertiaryText }}
            >
              Filters
            </p>

            {/* Status Filter */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
                htmlFor="job-filters-panel-status"
              >
                Status
              </label>
              <select
                id="job-filters-panel-status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm transition-all"
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
                title="Filter by status"
                aria-label="Filter by status"
              >
                <option value="all" style={{ background: colors.background, color: colors.secondaryText }}>All Statuses</option>
                <option value="applied" style={{ background: colors.background, color: colors.secondaryText }}>Applied</option>
                <option value="interview" style={{ background: colors.background, color: colors.secondaryText }}>Interview</option>
                <option value="offer" style={{ background: colors.background, color: colors.secondaryText }}>Offer</option>
                <option value="rejected" style={{ background: colors.background, color: colors.secondaryText }}>Rejected</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
                htmlFor="job-filters-panel-priority"
              >
                Priority
              </label>
              <select
                id="job-filters-panel-priority"
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm transition-all"
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
                title="Filter by priority"
                aria-label="Filter by priority"
              >
                <option value="all" style={{ background: colors.background, color: colors.secondaryText }}>All Priorities</option>
                <option value="high" style={{ background: colors.background, color: colors.secondaryText }}>High</option>
                <option value="medium" style={{ background: colors.background, color: colors.secondaryText }}>Medium</option>
                <option value="low" style={{ background: colors.background, color: colors.secondaryText }}>Low</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
                htmlFor="job-filters-panel-location"
              >
                Location (contains)
              </label>
              <input
                id="job-filters-panel-location"
                type="text"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                placeholder="e.g., San Francisco, Remote"
                className="w-full px-3 py-2 rounded-md text-sm transition-all outline-none"
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

            {/* Date Range */}
            <div>
              <p 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
              >
                Date Range
              </p>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-sm" style={{ color: colors.secondaryText }}>
                  <span>Start</span>
                  <input
                    id="job-filters-panel-start-date"
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full px-3 py-2 rounded-md text-sm transition-all outline-none"
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
                    title="Start date"
                    aria-label="Start date"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm" style={{ color: colors.secondaryText }}>
                  <span>End</span>
                  <input
                    id="job-filters-panel-end-date"
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full px-3 py-2 rounded-md text-sm transition-all outline-none"
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
                    title="End date"
                    aria-label="End date"
                  />
                </label>
              </div>
            </div>

            {/* Group By */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
                htmlFor="job-filters-panel-group-by"
              >
                Group By
              </label>
              <select
                id="job-filters-panel-group-by"
                value={filters.groupBy || 'status'}
                onChange={(e) => handleFilterChange('groupBy', e.target.value as JobFilters['groupBy'])}
                className="w-full px-3 py-2 rounded-md text-sm transition-all"
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
                title="Group by field"
                aria-label="Group by field"
              >
                <option value="status" style={{ background: colors.background, color: colors.secondaryText }}>Status</option>
                <option value="company" style={{ background: colors.background, color: colors.secondaryText }}>Company</option>
                <option value="priority" style={{ background: colors.background, color: colors.secondaryText }}>Priority</option>
                <option value="date" style={{ background: colors.background, color: colors.secondaryText }}>Date</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
                htmlFor="job-filters-panel-sort-by"
              >
                Sort By
              </label>
              <select
                id="job-filters-panel-sort-by"
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as JobFilters['sortBy'])}
                className="w-full px-3 py-2 rounded-md text-sm transition-all"
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
                title="Sort by field"
                aria-label="Sort by field"
              >
                <option value="date" style={{ background: colors.background, color: colors.secondaryText }}>Date</option>
                <option value="company" style={{ background: colors.background, color: colors.secondaryText }}>Company</option>
                <option value="priority" style={{ background: colors.background, color: colors.secondaryText }}>Priority</option>
                <option value="title" style={{ background: colors.background, color: colors.secondaryText }}>Title</option>
              </select>
            </div>

            {/* Additional Options */}
            <div className="space-y-2 pt-2 border-t" style={{ borderTop: `1px solid ${colors.border}` }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showArchived || false}
                  onChange={(e) => handleFilterChange('showArchived', e.target.checked)}
                  className="rounded transition-all"
                  style={{
                    accentColor: colors.primaryBlue,
                    cursor: 'pointer',
                  }}
                />
                <span className="text-sm" style={{ color: colors.secondaryText }}>
                  Show Archived
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="px-4 py-3 border-t flex items-center justify-between gap-3 flex-shrink-0"
        style={{ 
          borderTop: `1px solid ${colors.border}`,
          background: colors.toolbarBackground,
        }}
      >
        <button
          onClick={() => {
            onFiltersChange({
              status: 'all',
              searchTerm: '',
              sortBy: 'date',
              groupBy: 'status',
              showArchived: false,
              priority: undefined,
              location: undefined,
              dateRange: undefined,
              showDeleted: false,
            });
          }}
          className="px-4 py-2 rounded-md text-sm transition-all"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.inputBackground;
          }}
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm transition-all font-medium flex-1"
          style={{
            background: colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primaryBlueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primaryBlue;
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

