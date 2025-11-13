/**
 * EmptyState - Displayed when no templates match filters
 * Enhanced with better messaging, visual elements, and theme support
 */

import React from 'react';
import { Search, Filter, RefreshCw, FileQuestion, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
  colors?: any;
}

export default function EmptyState({ onClearFilters, colors }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label="No templates found"
    >
      {/* Illustration - Stacked Icons */}
      <div className="relative mb-6">
        {/* Background circles for depth */}
        <div
          className="absolute inset-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
          style={{ background: colors?.borderFocused || '#8b5cf6' }}
        />

        {/* Main icon container */}
        <div
          className="relative w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: colors?.inputBackground || '#f3f4f6',
            borderColor: colors?.border || '#e5e7eb',
            borderWidth: '2px',
            borderStyle: 'solid',
          }}
        >
          <Search
            size={40}
            style={{ color: colors?.tertiaryText || '#9ca3af' }}
            strokeWidth={1.5}
          />
        </div>

        {/* Floating accent icons */}
        <div
          className="absolute -top-2 -right-2 w-10 h-10 rounded-lg flex items-center justify-center shadow-md animate-float"
          style={{
            background: colors?.badgeWarningBg || '#fef3c7',
          }}
        >
          <Filter
            size={16}
            style={{ color: colors?.badgeWarningText || '#f59e0b' }}
          />
        </div>

        <div
          className="absolute -bottom-2 -left-2 w-10 h-10 rounded-lg flex items-center justify-center shadow-md animate-float-delayed"
          style={{
            background: colors?.badgeInfoBg || '#dbeafe',
          }}
        >
          <FileQuestion
            size={16}
            style={{ color: colors?.badgeInfoText || '#3b82f6' }}
          />
        </div>
      </div>

      {/* Heading */}
      <h3
        className="text-2xl font-bold mb-2"
        style={{ color: colors?.primaryText || '#111827' }}
      >
        No Templates Found
      </h3>

      {/* Description */}
      <p
        className="text-base mb-6 max-w-md text-center leading-relaxed"
        style={{ color: colors?.secondaryText || '#6b7280' }}
      >
        We couldn't find any templates matching your current filters and search criteria.
        Try adjusting your selections or explore all templates.
      </p>

      {/* Suggestions list */}
      <div
        className="mb-6 p-4 rounded-lg max-w-md w-full"
        style={{
          background: colors?.cardBackground || '#ffffff',
          border: `1px solid ${colors?.border || '#e5e7eb'}`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles
            size={16}
            style={{ color: colors?.badgeInfoText || '#3b82f6' }}
          />
          <h4
            className="text-sm font-semibold"
            style={{ color: colors?.primaryText || '#111827' }}
          >
            Suggestions to find templates:
          </h4>
        </div>
        <ul
          className="space-y-2 text-sm"
          style={{ color: colors?.secondaryText || '#6b7280' }}
        >
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: colors?.borderFocused || '#8b5cf6' }} />
            <span>Remove some filters to see more results</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: colors?.borderFocused || '#8b5cf6' }} />
            <span>Try a different category or difficulty level</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: colors?.borderFocused || '#8b5cf6' }} />
            <span>Use broader search terms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: colors?.borderFocused || '#8b5cf6' }} />
            <span>Check both free and premium templates</span>
          </li>
        </ul>
      </div>

      {/* Action button */}
      <button
        onClick={onClearFilters}
        className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
        style={{
          background: colors?.borderFocused || '#8b5cf6',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.opacity = '1';
        }}
        aria-label="Clear all filters and show all templates"
      >
        <RefreshCw size={18} />
        Clear All Filters
      </button>

      {/* Additional help text */}
      <p
        className="text-xs mt-4 opacity-75"
        style={{ color: colors?.tertiaryText || '#9ca3af' }}
      >
        Still need help? Browse all {' '}
        <button
          onClick={onClearFilters}
          className="underline hover:no-underline font-medium"
          style={{ color: colors?.borderFocused || '#8b5cf6' }}
          aria-label="Show all templates"
        >
          available templates
        </button>
      </p>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  );
}

