'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { TemplatesProps, TemplateViewMode } from './templates/types';
import { useTemplateFilters } from './templates/hooks/useTemplateFilters';
import { useTemplatePagination } from './templates/hooks/useTemplatePagination';
import { useTemplateActions } from './templates/hooks/useTemplateActions';
import { useKeyboardShortcuts } from './templates/hooks/useKeyboardShortcuts';
// Backend-integrated hooks
import { useTemplates } from '../hooks/useTemplates';
import { useTemplateFavorites } from '../hooks/useTemplateFavorites';
import { useTemplatePreferences } from '../hooks/useTemplatePreferences';
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
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Templates are loaded from static data, so no loading state needed
  const isLoading = false;

  // Backend-integrated hooks
  const templatesHook = useTemplates({ autoFetch: true });
  const favoritesHook = useTemplateFavorites({ autoFetch: true, autoSync: true });
  const preferencesHook = useTemplatePreferences({ autoFetch: true, autoSave: true });

  // Use legacy hooks as fallback for local state (localStorage-based)
  const filterState = useTemplateFilters();
  const actionsState = useTemplateActions({
    onAddToEditor,
    onRemoveTemplate,
  });

  // Sync view mode from preferences
  const [viewMode, setViewMode] = useState<TemplateViewMode>(() => {
    return (preferencesHook.preferences?.viewMode as TemplateViewMode) || 'grid';
  });

  // Update view mode when preferences change
  useEffect(() => {
    if (preferencesHook.preferences?.viewMode) {
      setViewMode(preferencesHook.preferences.viewMode as TemplateViewMode);
    }
  }, [preferencesHook.preferences?.viewMode]);

  // Update backend templates hook filters when local filters change
  useEffect(() => {
    const filterSettings = {
      category: filterState.selectedCategory !== 'all' ? filterState.selectedCategory : undefined,
      difficulty: filterState.selectedDifficulty !== 'all' ? filterState.selectedDifficulty : undefined,
      layout: filterState.selectedLayout !== 'all' ? filterState.selectedLayout : undefined,
      colorScheme: filterState.selectedColorScheme !== 'all' ? filterState.selectedColorScheme : undefined,
      isPremium: filterState.showPremiumOnly ? true : filterState.showFreeOnly ? false : undefined,
    };

    templatesHook.updateFilters({
      ...filterSettings,
      sortBy: filterState.sortBy,
      search: filterState.searchQuery,
    });
  }, [
    filterState.selectedCategory,
    filterState.selectedDifficulty,
    filterState.selectedLayout,
    filterState.selectedColorScheme,
    filterState.showPremiumOnly,
    filterState.showFreeOnly,
    filterState.sortBy,
    filterState.searchQuery,
  ]);

  // Use backend templates if available, otherwise fall back to local filtered templates
  const templates = templatesHook.templates.length > 0
    ? templatesHook.templates
    : filterState.filteredTemplates;

  const paginationState = useTemplatePagination({
    templates: templates,
  });

  // Use backend favorites if available, otherwise fall back to local favorites
  const favorites = favoritesHook.favoriteIds.size > 0
    ? Array.from(favoritesHook.favoriteIds)
    : actionsState.favorites;

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
    // Update backend preferences
    preferencesHook.updateViewMode(mode);
  }, [preferencesHook]);

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

  // Integrated favorites toggle handler
  const handleToggleFavorite = useCallback(async (templateId: string) => {
    // Use backend favorites if available
    if (favoritesHook.favoriteIds.size > 0 || !favoritesHook.error) {
      await favoritesHook.toggleFavorite(templateId);
    } else {
      // Fall back to local favorites
      actionsState.toggleFavorite(templateId);
    }
  }, [favoritesHook, actionsState]);

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
      templates.filter(t => addedTemplates.includes(t.id)),
    [templates, addedTemplates]
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
          favorites={favorites}
          filteredCount={templates.length}
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
                  isFavorite={favorites.includes(template.id)}
                  addedTemplateId={actionsState.addedTemplateId}
                  colors={colors}
                  onFavorite={handleToggleFavorite}
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
                isFavorite={favorites.includes(template.id)}
                addedTemplateId={actionsState.addedTemplateId}
                colors={colors}
                onFavorite={handleToggleFavorite}
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
                      isFavorite={favorites.includes(template.id)}
                      addedTemplateId={actionsState.addedTemplateId}
                      colors={colors}
                      onFavorite={handleToggleFavorite}
                      onPreview={actionsState.handlePreviewTemplate}
                      onUse={actionsState.handleUseTemplate}
                      onRemove={onRemoveTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates List View */}
            {paginationState.currentTemplates.map(template => (
              <TemplateCardList
                key={template.id}
                template={template}
                isAdded={addedTemplates.includes(template.id)}
                isFavorite={favorites.includes(template.id)}
                addedTemplateId={actionsState.addedTemplateId}
                colors={colors}
                onFavorite={handleToggleFavorite}
                onPreview={actionsState.handlePreviewTemplate}
                onUse={actionsState.handleUseTemplate}
                onRemove={onRemoveTemplate}
              />
                        ))}
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
        {templates.length === 0 && !templatesHook.loading && (
          <EmptyState onClearFilters={filterState.clearAllFilters} colors={colors} />
        )}

        {/* Loading State */}
        {templatesHook.loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p style={{ color: colors.secondaryText }}>Loading templates...</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TemplatePreviewModal
        isOpen={actionsState.showPreviewModal}
        template={actionsState.currentSelectedTemplate}
        allTemplates={resumeTemplates}
        isFavorite={
          actionsState.currentSelectedTemplate
            ? favorites.includes(actionsState.currentSelectedTemplate.id)
            : false
        }
        addedTemplateId={actionsState.addedTemplateId}
        colors={colors}
        onClose={() => actionsState.setShowPreviewModal(false)}
        onFavorite={handleToggleFavorite}
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
