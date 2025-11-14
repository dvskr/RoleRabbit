/**
 * TemplateHeader - Complete header section combining search, filters, and category tabs
 */

import React, { RefObject } from 'react';
import SearchAndFilters from './SearchAndFilters';
import CategoryTabs from './CategoryTabs';
import AdvancedFilters from './AdvancedFilters';
import type { ThemeColors } from '../types';
import { TemplateSortBy, TemplateViewMode } from '../types';

interface TemplateHeaderProps {
  // Search and filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: TemplateSortBy;
  setSortBy: (sortBy: TemplateSortBy) => void;
  viewMode: TemplateViewMode;
  setViewMode: (viewMode: TemplateViewMode) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters?: boolean;
  activeFilterCount?: number;
  searchInputRef?: RefObject<HTMLInputElement>;

  // Category
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Advanced filters
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedLayout: string;
  setSelectedLayout: (layout: string) => void;
  selectedColorScheme: string;
  setSelectedColorScheme: (colorScheme: string) => void;
  showFreeOnly: boolean;
  setShowFreeOnly: (show: boolean) => void;
  showPremiumOnly: boolean;
  setShowPremiumOnly: (show: boolean) => void;

  colors: any;
}

export default function TemplateHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  activeFilterCount,
  searchInputRef,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedLayout,
  setSelectedLayout,
  selectedColorScheme,
  setSelectedColorScheme,
  showFreeOnly,
  setShowFreeOnly,
  showPremiumOnly,
  setShowPremiumOnly,
  colors,
}: TemplateHeaderProps) {
  return (
    <div
      className="px-4 py-4 sm:py-5 flex-shrink-0"
      style={{
        background: colors.headerBackground,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        searchInputRef={searchInputRef}
        colors={colors}
      />

      {/* Category Tabs */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        colors={colors}
      />

      {/* Advanced Filters */}
      {showFilters && (
        <AdvancedFilters
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedLayout={selectedLayout}
          setSelectedLayout={setSelectedLayout}
          selectedColorScheme={selectedColorScheme}
          setSelectedColorScheme={setSelectedColorScheme}
          showFreeOnly={showFreeOnly}
          setShowFreeOnly={setShowFreeOnly}
          showPremiumOnly={showPremiumOnly}
          setShowPremiumOnly={setShowPremiumOnly}
          colors={colors}
        />
      )}
    </div>
  );
}

