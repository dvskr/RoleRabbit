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

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg shadow-2xl w-full max-w-md mx-4"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-2">
            <FilterIcon size={18} style={{ color: colors.primaryBlue }} />
            <h2 
              className="text-lg font-semibold"
              style={{ color: colors.primaryText }}
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
            >
              Status
            </label>
            <select
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
            >
              Priority
            </label>
            <select
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
            >
              Location (contains)
            </label>
            <input
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
              >
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
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
              >
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
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
  );
}

