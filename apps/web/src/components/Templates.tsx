'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { TemplatesProps, TemplateViewMode } from './templates/types';
import { useTemplateFilters } from './templates/hooks/useTemplateFilters';
import { useTemplatePagination } from './templates/hooks/useTemplatePagination';
import { useTemplateActions } from './templates/hooks/useTemplateActions';
import { useKeyboardShortcuts } from './templates/hooks/useKeyboardShortcuts';
import TemplateHeader from './templates/components/TemplateHeader';
import TemplateStats from './templates/components/TemplateStats';
import TemplateCard from './templates/components/TemplateCard';
import TemplateCardList from './templates/components/TemplateCardList';
import TemplateCardSkeleton from './templates/components/TemplateCardSkeleton';
import TemplateCardListSkeleton from './templates/components/TemplateCardListSkeleton';
import TemplatePreviewModal from './templates/components/TemplatePreviewModal';
import UploadTemplateModal from './templates/components/UploadTemplateModal';
import PaginationControls from './templates/components/PaginationControls';
import EmptyState from './templates/components/EmptyState';
import TemplatesErrorBoundary from './templates/components/TemplatesErrorBoundary';
import FilterChips from './templates/components/FilterChips';
import KeyboardShortcutsHelp from './templates/components/KeyboardShortcutsHelp';
import { trackViewModeChange } from './templates/utils/analytics';
import { resumeTemplates } from '../data/templates';

/**
 * TemplatesInternal Component
 *
 * Main template browsing and management component with comprehensive filtering,
 * search, pagination, and template action capabilities.
 *
 * @component
 * @example
 * ```tsx
 * <Templates
 *   onAddToEditor={(templateId) => console.log('Added:', templateId)}
 *   addedTemplates={['template-1', 'template-2']}
 *   onRemoveTemplate={(templateId) => console.log('Removed:', templateId)}
 * />
 * ```
 *
 * Features:
 * - Template browsing with grid/list view modes
 * - Advanced filtering (category, difficulty, layout, color, price)
 * - Real-time search with debouncing (300ms)
 * - Pagination with scroll-to-top
 * - Favorites management with localStorage persistence
 * - Template preview modal with full details
 * - Keyboard shortcuts for power users
 * - Usage history tracking
 * - Mobile-responsive design
 * - Accessible with ARIA labels and keyboard navigation
 *
 * Architecture:
 * - Uses custom hooks for separation of concerns:
 *   - useTemplateFilters: Search and filter logic
 *   - useTemplatePagination: Pagination state and controls
 *   - useTemplateActions: Template actions (preview, add, favorite, etc.)
 *   - useKeyboardShortcuts: Keyboard navigation and shortcuts
 * - Components organized by responsibility:
 *   - Header: Search, filters, category tabs
 *   - Stats: Template statistics dashboard
 *   - Cards: Template display (grid/list views)
 *   - Modals: Preview and upload functionality
 *   - Controls: Pagination and filter chips
 *
 * @param {TemplatesProps} props - Component props
 * @param {(templateId: string) => void} props.onAddToEditor - Callback when template is added to editor
 * @param {string[]} props.addedTemplates - Array of template IDs currently added to editor (max 10)
 * @param {(templateId: string) => void} [props.onRemoveTemplate] - Optional callback when template is removed
 *
 * @returns {JSX.Element} The Templates component with error boundary wrapper
 */
function TemplatesInternal({
  onAddToEditor,
  addedTemplates = [],
  onRemoveTemplate,
}: TemplatesProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [viewMode, setViewMode] = useState<TemplateViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Templates are loaded from static data, so no loading state needed
  const isLoading = false;

  // Use extracted hooks
  const filterState = useTemplateFilters();
  const paginationState = useTemplatePagination({
    templates: filterState.filteredTemplates,
  });
  const actionsState = useTemplateActions({
    onAddToEditor,
    onRemoveTemplate,
  });

  // Keyboard shortcuts callbacks
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowKeyboardHelp(true);
  }, []);

  const handleViewModeChange = useCallback((mode: TemplateViewMode) => {
    trackViewModeChange(mode);
    setViewMode(mode);
  }, []);

  const handleNextPage = useCallback(() => {
    if (paginationState.currentPage < paginationState.totalPages) {
      paginationState.setCurrentPage(paginationState.currentPage + 1);
    }
  }, [paginationState]);

  const handlePrevPage = useCallback(() => {
    if (paginationState.currentPage > 1) {
      paginationState.setCurrentPage(paginationState.currentPage - 1);
    }
  }, [paginationState]);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef,
    onClearFilters: filterState.clearAllFilters,
    onToggleFilters: handleToggleFilters,
    onChangeViewMode: handleViewModeChange,
    onShowHelp: handleShowHelp,
    onNextPage: handleNextPage,
    onPrevPage: handlePrevPage,
    currentPage: paginationState.currentPage,
    totalPages: paginationState.totalPages,
    isModalOpen: actionsState.showPreviewModal || actionsState.showUploadModal || showKeyboardHelp,
  });

  // Separate added and not-added templates
  // Sort added templates by their order in addedTemplates array (most recent first)
  const addedTemplatesList = useMemo(
    () => {
      const added = filterState.filteredTemplates.filter(t => addedTemplates.includes(t.id));

      // Sort by order in addedTemplates array (most recently added first)
      return added.sort((a, b) => {
        const indexA = addedTemplates.indexOf(a.id);
        const indexB = addedTemplates.indexOf(b.id);
        // Reverse order - most recent (higher index) first
        return indexB - indexA;
      });
    },
    [filterState.filteredTemplates, addedTemplates]
  );

  // Filter out added templates from the main list to avoid duplication
  const notAddedTemplatesList = useMemo(
    () =>
      filterState.filteredTemplates.filter(t => !addedTemplates.includes(t.id)),
    [filterState.filteredTemplates, addedTemplates]
  );

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* Header */}
      <TemplateHeader
        searchQuery={filterState.searchQuery}
        setSearchQuery={filterState.setSearchQuery}
        sortBy={filterState.sortBy}
        setSortBy={filterState.setSortBy}
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={filterState.hasActiveFilters}
        activeFilterCount={filterState.activeFilterCount}
        selectedCategory={filterState.selectedCategory}
        setSelectedCategory={filterState.setSelectedCategory}
        selectedDifficulty={filterState.selectedDifficulty}
        setSelectedDifficulty={filterState.setSelectedDifficulty}
        selectedLayout={filterState.selectedLayout}
        setSelectedLayout={filterState.setSelectedLayout}
        selectedColorScheme={filterState.selectedColorScheme}
        setSelectedColorScheme={filterState.setSelectedColorScheme}
        showFreeOnly={filterState.showFreeOnly}
        setShowFreeOnly={filterState.setShowFreeOnly}
        showPremiumOnly={filterState.showPremiumOnly}
        setShowPremiumOnly={filterState.setShowPremiumOnly}
        searchInputRef={searchInputRef}
        colors={colors}
      />

      {/* Error Banner */}
      {actionsState.error && (
        <div
          className="mx-4 mt-3 p-3 rounded-lg flex items-start gap-3"
          style={{
            background: `${colors.errorRed}15`,
            border: `1px solid ${colors.errorRed}40`
          }}
        >
          <AlertCircle size={20} style={{ color: colors.errorRed, flexShrink: 0 }} />
          <div className="flex-1">
            <p style={{ color: colors.errorRed }} className="text-sm font-medium">
              {actionsState.error}
            </p>
          </div>
          <button
            onClick={actionsState.clearError}
            className="p-1 rounded hover:bg-black/5 transition-colors"
            style={{ color: colors.errorRed }}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div
        className="flex-1 overflow-y-auto p-2 force-scrollbar"
        role="main"
        aria-label="Template gallery"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.tertiaryText} ${colors.background}`,
        }}
      >
        {/* Stats */}
        <TemplateStats
          colors={colors}
          favorites={actionsState.favorites}
          filteredCount={filterState.filteredTemplates.length}
        />

        {/* Filter Chips */}
        <FilterChips
          selectedCategory={filterState.selectedCategory}
          selectedDifficulty={filterState.selectedDifficulty}
          selectedLayout={filterState.selectedLayout}
          selectedColorScheme={filterState.selectedColorScheme}
          showFreeOnly={filterState.showFreeOnly}
          showPremiumOnly={filterState.showPremiumOnly}
          sortBy={filterState.sortBy}
          setSelectedCategory={filterState.setSelectedCategory}
          setSelectedDifficulty={filterState.setSelectedDifficulty}
          setSelectedLayout={filterState.setSelectedLayout}
          setSelectedColorScheme={filterState.setSelectedColorScheme}
          setShowFreeOnly={filterState.setShowFreeOnly}
          setShowPremiumOnly={filterState.setShowPremiumOnly}
          setSortBy={filterState.setSortBy}
          clearAllFilters={filterState.clearAllFilters}
          colors={colors}
        />

        {/* Added Templates Section */}
        {addedTemplatesList.length > 0 && (
          <div className="mb-3" role="region" aria-labelledby="added-templates-heading">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} style={{ color: colors.successGreen }} />
              <h2
                id="added-templates-heading"
                className="text-base font-bold"
                style={{ color: colors.primaryText }}
              >
                Added Templates ({addedTemplatesList.length}/10)
              </h2>
              <div
                className="h-1 flex-1 rounded"
                style={{ background: colors.border }}
              />
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              role="list"
              aria-label="Added templates grid"
            >
              {addedTemplatesList.map(template => (
                <TemplateCard
                  key={template.id} 
                  template={template}
                  isAdded={true}
                  isFavorite={actionsState.favorites.includes(template.id)}
                  addedTemplateId={actionsState.addedTemplateId}
                  colors={colors}
                  onFavorite={actionsState.toggleFavorite}
                  onPreview={actionsState.handlePreviewTemplate}
                  onUse={actionsState.handleUseTemplate}
                  onRemove={onRemoveTemplate}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        {viewMode === 'grid' ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6"
            role="list"
            aria-label="All available templates in grid view"
          >
            {paginationState.currentTemplates.map(template => (
              <TemplateCard
                key={template.id} 
                template={template}
                isAdded={addedTemplates.includes(template.id)}
                isFavorite={actionsState.favorites.includes(template.id)}
                addedTemplateId={actionsState.addedTemplateId}
                colors={colors}
                onFavorite={actionsState.toggleFavorite}
                onPreview={actionsState.handlePreviewTemplate}
                onUse={actionsState.handleUseTemplate}
                onRemove={onRemoveTemplate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {/* Added Templates List View */}
            {addedTemplatesList.length > 0 && (
              <div className="mb-8" role="region" aria-labelledby="added-templates-list-heading">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} style={{ color: colors.successGreen }} />
                  <h2
                    id="added-templates-list-heading"
                    className="text-lg font-bold"
                    style={{ color: colors.primaryText }}
                  >
                    Added Templates to Resume Editor ({addedTemplatesList.length}/10)
                  </h2>
                  <div
                    className="h-1 flex-1 rounded"
                    style={{ background: colors.border }}
                  />
                </div>
                <div className="space-y-4" role="list" aria-label="Added templates list">
                  {addedTemplatesList.map(template => (
                    <TemplateCardList
                      key={template.id} 
                      template={template}
                      isAdded={true}
                      isFavorite={actionsState.favorites.includes(template.id)}
                      addedTemplateId={actionsState.addedTemplateId}
                      colors={colors}
                      onFavorite={actionsState.toggleFavorite}
                      onPreview={actionsState.handlePreviewTemplate}
                      onUse={actionsState.handleUseTemplate}
                      onRemove={onRemoveTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates List View */}
            {isLoading ? (
              // Show skeleton loaders during initial load
              Array.from({ length: 6 }).map((_, index) => (
                <TemplateCardListSkeleton key={`skeleton-list-${index}`} colors={colors} />
              ))
            ) : (
              paginationState.currentTemplates.map(template => (
                <TemplateCardList
                  key={template.id}
                  template={template}
                  isAdded={addedTemplates.includes(template.id)}
                  isFavorite={actionsState.favorites.includes(template.id)}
                  addedTemplateId={actionsState.addedTemplateId}
                  colors={colors}
                  onFavorite={actionsState.toggleFavorite}
                  onPreview={actionsState.handlePreviewTemplate}
                  onUse={actionsState.handleUseTemplate}
                  onRemove={onRemoveTemplate}
                />
              ))
            )}
                      </div>
        )}

        {/* Pagination */}
        {!isLoading && (
          <PaginationControls
            currentPage={paginationState.currentPage}
            totalPages={paginationState.totalPages}
            onPageChange={paginationState.setCurrentPage}
            colors={colors}
          />
        )}

        {/* Empty State */}
        {filterState.filteredTemplates.length === 0 && (
          <EmptyState onClearFilters={filterState.clearAllFilters} colors={colors} />
        )}
      </div>

      {/* Modals */}
      <TemplatePreviewModal
        isOpen={actionsState.showPreviewModal}
        template={actionsState.currentSelectedTemplate}
        allTemplates={resumeTemplates}
        isFavorite={
          actionsState.currentSelectedTemplate
            ? actionsState.favorites.includes(actionsState.currentSelectedTemplate.id)
            : false
        }
        addedTemplateId={actionsState.addedTemplateId}
        colors={colors}
        onClose={() => actionsState.setShowPreviewModal(false)}
        onFavorite={actionsState.toggleFavorite}
        onShare={actionsState.handleShareTemplate}
        onDownload={actionsState.handleDownloadTemplate}
        onUse={actionsState.handleUseTemplate}
        onOpenUpload={() => actionsState.setShowUploadModal(true)}
        onPreview={actionsState.handlePreviewTemplate}
      />

      <UploadTemplateModal
        isOpen={actionsState.showUploadModal}
        template={actionsState.currentSelectedTemplate}
        uploadedFile={actionsState.uploadedFile}
        colors={colors}
        onClose={() => actionsState.setShowUploadModal(false)}
        onFileSelect={actionsState.setUploadedFile}
        onFileRemove={() => actionsState.setUploadedFile(null)}
      />

      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        colors={colors}
      />
    </div>
  );
}

/**
 * Templates Component with Error Boundary
 * Exported wrapper that provides error handling
 */
export default function Templates(props: TemplatesProps) {
  return (
    <TemplatesErrorBoundary>
      <TemplatesInternal {...props} />
    </TemplatesErrorBoundary>
  );
}
