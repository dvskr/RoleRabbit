/**
 * useTemplateActions v2 - Backward-compatible wrapper using TemplateContext
 *
 * This version delegates to the centralized TemplateContext for state management.
 * All template state is now managed in one place, preventing synchronization issues.
 *
 * MIGRATION NOTE: This hook now requires TemplateProvider in the component tree.
 * New code should use useTemplateContext() directly for better performance and clarity.
 */

import { useCallback } from 'react';
import { useTemplateContext } from '../../../contexts/TemplateContext';
import { getTemplateDownloadHTML, downloadTemplateAsHTML, shareTemplate } from '../utils/templateHelpers';
import { logger } from '../../../utils/logger';

export interface UseTemplateActionsOptions {
  onAddToEditor?: (templateId: string) => void;
  onRemoveTemplate?: (templateId: string) => void;
}

export interface UseTemplateActionsReturn {
  // State
  selectedTemplate: string | null;
  showPreviewModal: boolean;
  showUploadModal: boolean;
  addedTemplateId: string | null;
  favorites: string[];
  uploadedFile: File | null;
  error: string | null;

  // Setters
  setSelectedTemplate: (id: string | null) => void;
  setShowPreviewModal: (show: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  setUploadedFile: (file: File | null) => void;
  clearError: () => void;

  // Actions
  handlePreviewTemplate: (templateId: string) => void;
  handleUseTemplate: (templateId: string) => void;
  handleDownloadTemplate: () => void;
  handleShareTemplate: () => void;
  toggleFavorite: (templateId: string) => void;
  handleSelectTemplate: (templateId: string) => void;

  // Computed
  currentSelectedTemplate: ReturnType<typeof useTemplateContext>['selectedTemplate'];
}

/**
 * Backward-compatible hook that delegates to TemplateContext
 * @deprecated Use useTemplateContext() directly for new code
 */
export const useTemplateActions = (
  options: UseTemplateActionsOptions = {}
): UseTemplateActionsReturn => {
  const { onAddToEditor, onRemoveTemplate } = options;
  const context = useTemplateContext();

  const handleUseTemplate = useCallback(
    (templateId: string) => {
      context.useTemplate(templateId, onAddToEditor);

      // Also add to added templates if callback provided
      if (onAddToEditor) {
        context.addTemplate(templateId);
      }
    },
    [context, onAddToEditor]
  );

  const handleDownloadTemplate = useCallback(() => {
    if (!context.selectedTemplate) {
      context.setError('No template selected for download');
      return;
    }

    try {
      logger.debug('Downloading template:', context.selectedTemplate.name);
      const htmlContent = getTemplateDownloadHTML(context.selectedTemplate);
      downloadTemplateAsHTML(context.selectedTemplate, htmlContent);
      context.clearError();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download template';
      logger.error('Error downloading template:', err);
      context.setError(errorMessage);
    }
  }, [context]);

  const handleShareTemplate = useCallback(async () => {
    if (!context.selectedTemplate) {
      context.setError('No template selected for sharing');
      return;
    }

    try {
      logger.debug('Sharing template:', context.selectedTemplate.name);
      await shareTemplate({
        name: context.selectedTemplate.name,
        description: context.selectedTemplate.description,
      });
      context.clearError();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share template';
      logger.error('Error sharing template:', err);
      context.setError(errorMessage);
    }
  }, [context]);

  const handleSelectTemplate = useCallback((templateId: string) => {
    context.selectTemplate(templateId);
  }, [context]);

  const handleRemoveTemplate = useCallback((templateId: string) => {
    context.removeTemplate(templateId);
    if (onRemoveTemplate) {
      onRemoveTemplate(templateId);
    }
  }, [context, onRemoveTemplate]);

  return {
    // State - mapped from context
    selectedTemplate: context.selectedTemplateId,
    showPreviewModal: context.showPreviewModal,
    showUploadModal: context.showUploadModal,
    addedTemplateId: context.addedTemplateId,
    favorites: context.favorites,
    uploadedFile: context.uploadedFile,
    error: context.error,

    // Setters - mapped from context
    setSelectedTemplate: context.selectTemplate,
    setShowPreviewModal: context.setShowPreviewModal,
    setShowUploadModal: context.setShowUploadModal,
    setUploadedFile: context.setUploadedFile,
    clearError: context.clearError,

    // Actions
    handlePreviewTemplate: context.previewTemplate,
    handleUseTemplate,
    handleDownloadTemplate,
    handleShareTemplate,
    toggleFavorite: context.toggleFavorite,
    handleSelectTemplate,

    // Computed
    currentSelectedTemplate: context.selectedTemplate,
  };
};
