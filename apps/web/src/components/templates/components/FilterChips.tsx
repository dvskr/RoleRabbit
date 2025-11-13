/**
 * FilterChips - Display active filters as dismissible chips
 * Provides visual feedback and quick filter removal
 */

import React from 'react';
import { X } from 'lucide-react';
import { TemplateSortBy } from '../types';

interface FilterChipsProps {
  // Filter values
  selectedCategory: string;
  selectedDifficulty: string;
  selectedLayout: string;
  selectedColorScheme: string;
  showFreeOnly: boolean;
  showPremiumOnly: boolean;
  sortBy: TemplateSortBy;

  // Setters
  setSelectedCategory: (value: string) => void;
  setSelectedDifficulty: (value: string) => void;
  setSelectedLayout: (value: string) => void;
  setSelectedColorScheme: (value: string) => void;
  setShowFreeOnly: (value: boolean) => void;
  setShowPremiumOnly: (value: boolean) => void;
  setSortBy: (value: TemplateSortBy) => void;

  // Utility
  clearAllFilters: () => void;
  colors: any;
}

interface FilterChip {
  label: string;
  value: string;
  onRemove: () => void;
}

export default function FilterChips({
  selectedCategory,
  selectedDifficulty,
  selectedLayout,
  selectedColorScheme,
  showFreeOnly,
  showPremiumOnly,
  sortBy,
  setSelectedCategory,
  setSelectedDifficulty,
  setSelectedLayout,
  setSelectedColorScheme,
  setShowFreeOnly,
  setShowPremiumOnly,
  setSortBy,
  clearAllFilters,
  colors,
}: FilterChipsProps) {
  // Build list of active filter chips
  const activeChips: FilterChip[] = [];

  // Category filter
  if (selectedCategory && selectedCategory !== 'all') {
    activeChips.push({
      label: `Category: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`,
      value: selectedCategory,
      onRemove: () => setSelectedCategory('all'),
    });
  }

  // Difficulty filter
  if (selectedDifficulty && selectedDifficulty !== 'all') {
    activeChips.push({
      label: `Difficulty: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}`,
      value: selectedDifficulty,
      onRemove: () => setSelectedDifficulty('all'),
    });
  }

  // Layout filter
  if (selectedLayout && selectedLayout !== 'all') {
    const layoutLabel = selectedLayout.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    activeChips.push({
      label: `Layout: ${layoutLabel}`,
      value: selectedLayout,
      onRemove: () => setSelectedLayout('all'),
    });
  }

  // Color scheme filter
  if (selectedColorScheme && selectedColorScheme !== 'all') {
    activeChips.push({
      label: `Color: ${selectedColorScheme.charAt(0).toUpperCase() + selectedColorScheme.slice(1)}`,
      value: selectedColorScheme,
      onRemove: () => setSelectedColorScheme('all'),
    });
  }

  // Premium filter
  if (showPremiumOnly) {
    activeChips.push({
      label: 'Premium Only',
      value: 'premium',
      onRemove: () => setShowPremiumOnly(false),
    });
  }

  // Free filter
  if (showFreeOnly) {
    activeChips.push({
      label: 'Free Only',
      value: 'free',
      onRemove: () => setShowFreeOnly(false),
    });
  }

  // Sort filter (only show if not default)
  if (sortBy && sortBy !== 'popular') {
    const sortLabels: Record<TemplateSortBy, string> = {
      popular: 'Most Popular',
      newest: 'Newest First',
      rating: 'Highest Rated',
      name: 'Alphabetical',
    };
    activeChips.push({
      label: `Sort: ${sortLabels[sortBy]}`,
      value: sortBy,
      onRemove: () => setSortBy('popular'),
    });
  }

  // Don't render if no active filters
  if (activeChips.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 mb-3 pb-3"
      style={{ borderBottom: `1px solid ${colors.border}` }}
      role="region"
      aria-label="Active filters"
    >
      <span
        className="text-sm font-medium"
        style={{ color: colors.secondaryText }}
      >
        Active Filters:
      </span>

      {activeChips.map((chip, index) => (
        <button
          key={`${chip.value}-${index}`}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
          style={{
            background: colors.badgeInfoBg,
            color: colors.badgeInfoText,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          aria-label={`Remove filter: ${chip.label}`}
          title={`Click to remove ${chip.label}`}
        >
          <span>{chip.label}</span>
          <X size={12} />
        </button>
      ))}

      {activeChips.length > 1 && (
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all hover:scale-105"
          style={{
            background: colors.badgeErrorBg,
            color: colors.errorRed,
            border: `1px solid ${colors.errorRed}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          aria-label="Clear all filters"
          title="Clear all filters"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
