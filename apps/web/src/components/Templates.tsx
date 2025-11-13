'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { TemplatesProps, TemplateViewMode } from './templates/types';
import { useTemplateFilters } from './templates/hooks/useTemplateFilters';
import { useTemplatePagination } from './templates/hooks/useTemplatePagination';
import { useTemplateActions } from './templates/hooks/useTemplateActions';
import TemplateHeader from './templates/components/TemplateHeader';
import TemplateStats from './templates/components/TemplateStats';
import TemplateCard from './templates/components/TemplateCard';
import TemplateCardList from './templates/components/TemplateCardList';
import TemplatePreviewModal from './templates/components/TemplatePreviewModal';
import UploadTemplateModal from './templates/components/UploadTemplateModal';
import PaginationControls from './templates/components/PaginationControls';
import EmptyState from './templates/components/EmptyState';
import TemplatesErrorBoundary from './templates/components/TemplatesErrorBoundary';

/**
 * Templates Component (Internal)
 * Main template browsing and management component
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

  // Use extracted hooks
  const filterState = useTemplateFilters();
  const paginationState = useTemplatePagination({
    templates: filterState.filteredTemplates,
  });
  const actionsState = useTemplateActions({
    onAddToEditor,
    onRemoveTemplate,
  });
  
  // Separate added and not-added templates
  const addedTemplatesList = useMemo(
    () =>
      filterState.filteredTemplates.filter(t => addedTemplates.includes(t.id)),
    [filterState.filteredTemplates, addedTemplates]
  );

  const clearAllFilters = () => {
    filterState.setSearchQuery('');
    filterState.setSelectedCategory('all');
    filterState.setSelectedDifficulty('all');
    filterState.setSelectedLayout('all');
    filterState.setSelectedColorScheme('all');
    filterState.setShowPremiumOnly(false);
    filterState.setShowFreeOnly(false);
  };

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
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
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
        colors={colors}
      />

      {/* Main Content */}
      <div
        className="flex-1 overflow-y-auto p-2 force-scrollbar"
            style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.tertiaryText} ${colors.background}`,
        }}
      >
        {/* Stats */}
        <TemplateStats colors={colors} />

        {/* Added Templates Section */}
        {addedTemplatesList.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} style={{ color: colors.successGreen }} />
              <h2
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
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
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} style={{ color: colors.successGreen }} />
                  <h2
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
                <div className="space-y-4">
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
            {paginationState.currentTemplates.map(template => (
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
                        ))}
                      </div>
        )}

        {/* Pagination */}
        <PaginationControls
          currentPage={paginationState.currentPage}
          totalPages={paginationState.totalPages}
          onPageChange={paginationState.setCurrentPage}
          colors={colors}
        />

        {/* Empty State */}
        {filterState.filteredTemplates.length === 0 && (
          <EmptyState onClearFilters={clearAllFilters} colors={colors} />
        )}
      </div>

      {/* Modals */}
      <TemplatePreviewModal
        isOpen={actionsState.showPreviewModal}
        template={actionsState.currentSelectedTemplate}
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
