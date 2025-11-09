'use client';

import React from 'react';
import { X, Filter as FilterIcon, RotateCcw } from 'lucide-react';
import { JobFilters } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';

interface JobFiltersModalProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onClose: () => void;
}

export default function JobFiltersModal({
  filters,
  onFiltersChange,
  onClose
}: JobFiltersModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleFilterChange = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
  <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.7)] backdrop-blur focus:outline-none border-0 p-0"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose();
          }
        }}
        aria-label="Close job filters"
      />
      <div className="fixed inset-0 z-60 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div 
          className="rounded-lg shadow-2xl w-full max-w-md mx-4 pointer-events-auto"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: theme.mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-filters-modal-heading"
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderBottom: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}` }}
        >
          <div className="flex items-center gap-2">
            <FilterIcon size={18} style={{ color: colors.primaryBlue }} />
            <h2 
              className="text-lg font-semibold"
              style={{ color: colors.primaryText }}
              id="job-filters-modal-heading"
            >
              Filters
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

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondaryText }}
              htmlFor="job-filters-status"
            >
              Status
            </label>
            <select
              id="job-filters-status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              aria-label="Filter by status"
              title="Filter by status"
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
            >
              <option value="all" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>All Statuses</option>
              <option value="applied" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Applied</option>
              <option value="interview" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Interview</option>
              <option value="offer" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Offer</option>
              <option value="rejected" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondaryText }}
              htmlFor="job-filters-priority"
            >
              Priority
            </label>
            <select
              id="job-filters-priority"
              value={filters.priority || 'all'}
              aria-label="Filter by priority"
              title="Filter by priority"
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
            >
              <option value="all" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>All Priorities</option>
              <option value="high" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>High</option>
              <option value="medium" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Medium</option>
              <option value="low" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Low</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondaryText }}
              htmlFor="job-filters-location"
            >
              Location (contains)
            </label>
            <input
              id="job-filters-location"
              type="text"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
              placeholder="e.g., San Francisco, Remote"
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
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
                htmlFor="job-filters-start-date"
              >
                Start Date
              </label>
              <input
                id="job-filters-start-date"
                type="date"
                value={filters.dateRange?.start || ''}
                aria-label="Start date"
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value || undefined
                })}
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
              />
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.secondaryText }}
                htmlFor="job-filters-end-date"
              >
                End Date
              </label>
              <input
                id="job-filters-end-date"
                type="date"
                value={filters.dateRange?.end || ''}
                aria-label="End date"
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value || undefined
                })}
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
              />
            </div>
          </div>

          {/* Show Deleted / Recycle Bin */}
          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showDeleted"
                checked={filters.showDeleted || false}
                onChange={(e) => handleFilterChange('showDeleted', e.target.checked)}
                className="rounded transition-all"
                style={{
                  accentColor: colors.primaryBlue,
                  cursor: 'pointer',
                }}
              />
              <label 
                htmlFor="showDeleted" 
                className="text-sm cursor-pointer flex items-center gap-2"
                style={{ color: colors.secondaryText }}
              >
                <RotateCcw size={16} />
                Show Recycle Bin (Deleted Jobs)
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderTop: `1px solid ${colors.border}` }}
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
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm transition-all font-medium"
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
            Apply Filters
          </button>
        </div>
      </div>
      </div>
    </>
  );
}

