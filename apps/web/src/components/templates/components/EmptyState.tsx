/**
 * EmptyState - Displayed when no templates match filters
 * Provides helpful suggestions and quick actions
 */

import React from 'react';
import { Search, Sparkles, Filter, Tag, Layout } from 'lucide-react';
import type { ThemeColors } from '../types';

interface EmptyStateProps {
  onClearFilters: () => void;
  colors?: ThemeColors;
}

export default function EmptyState({ onClearFilters, colors }: EmptyStateProps) {
  const suggestions = [
    { icon: Filter, text: 'Try removing some filters', tip: 'You may have too many filters applied' },
    { icon: Tag, text: 'Search by tags', tip: 'Templates have tags like "ATS", "modern", "creative"' },
    { icon: Layout, text: 'Try different layouts', tip: 'Switch between single-column, two-column, or hybrid' },
    { icon: Sparkles, text: 'Browse all templates', tip: 'Clear filters to see our full collection' },
  ];

  return (
    <div className="text-center py-12 px-4 max-w-2xl mx-auto">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{
          background: colors?.inputBackground || '#f3f4f6',
          border: `1px solid ${colors?.border || '#e5e7eb'}`,
        }}
      >
        <Search size={28} style={{ color: colors?.tertiaryText || '#9ca3af' }} />
      </div>

      {/* Title and Description */}
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: colors?.primaryText || '#1f2937' }}
      >
        No templates found
      </h3>
      <p
        className="text-sm mb-6"
        style={{ color: colors?.secondaryText || '#6b7280' }}
      >
        We couldn't find any templates matching your criteria
      </p>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <div
              key={index}
              className="p-3 rounded-lg text-left"
              style={{
                background: colors?.cardBackground || '#ffffff',
                border: `1px solid ${colors?.border || '#e5e7eb'}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: `${colors?.primaryBlue || '#3b82f6'}15` }}
                >
                  <Icon size={16} style={{ color: colors?.primaryBlue || '#3b82f6' }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: colors?.primaryText || '#1f2937' }}
                  >
                    {suggestion.text}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors?.tertiaryText || '#9ca3af' }}
                  >
                    {suggestion.tip}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="px-4 py-2 rounded-lg font-semibold transition-all text-sm"
        style={{
          background: colors?.primaryBlue || '#3b82f6',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        Clear All Filters
      </button>

      {/* Popular Categories Hint */}
      <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${colors?.border || '#e5e7eb'}` }}>
        <p
          className="text-xs mb-2"
          style={{ color: colors?.tertiaryText || '#9ca3af' }}
        >
          Popular categories:
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['ATS-Friendly', 'Modern', 'Creative', 'Executive'].map((category) => (
            <span
              key={category}
              className="px-2 py-1 rounded text-xs"
              style={{
                background: colors?.inputBackground || '#f3f4f6',
                color: colors?.secondaryText || '#6b7280',
              }}
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

