/**
 * Custom hook for template actions (preview, use, download, share, favorites)
 */

import { useState, useMemo, useCallback } from 'react';
import { logger } from '../../../utils/logger';
import { resumeTemplates } from '../../../data/templates';
import { getTemplateDownloadHTML, downloadTemplateAsHTML, shareTemplate } from '../utils/templateHelpers';
import { SUCCESS_ANIMATION_DURATION } from '../constants';

interface UseTemplateActionsOptions {
  onAddToEditor?: (templateId: string) => void;
  onRemoveTemplate?: (templateId: string) => void;
  onError?: (error: Error, action: string) => void;
}

interface UseTemplateActionsReturn {
  // State
  selectedTemplate: string | null;
  showPreviewModal: boolean;
  showUploadModal: boolean;
  addedTemplateId: string | null;
  favorites: string[];
  uploadedFile: File | null;
  uploadSource: 'cloud' | 'system';
  error: string | null;
  isLoading: boolean;

  // Setters
  setSelectedTemplate: (id: string | null) => void;
  setShowPreviewModal: (show: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  setUploadedFile: (file: File | null) => void;
  setUploadSource: (source: 'cloud' | 'system') => void;
  clearError: () => void;

  // Actions
  handlePreviewTemplate: (templateId: string) => void;
  handleUseTemplate: (templateId: string) => void;
  handleDownloadTemplate: () => void;
  handleShareTemplate: () => Promise<void>;
  toggleFavorite: (templateId: string) => void;
  handleSelectTemplate: (templateId: string) => void;

  // Computed
  currentSelectedTemplate: typeof resumeTemplates[0] | null;
}

export const useTemplateActions = (
  options: UseTemplateActionsOptions = {}
): UseTemplateActionsReturn => {
  const { onAddToEditor, onRemoveTemplate, onError } = options;

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [addedTemplateId, setAddedTemplateId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSource, setUploadSource] = useState<'cloud' | 'system'>('cloud');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const currentSelectedTemplate = useMemo(() => {
    return selectedTemplate
      ? resumeTemplates.find(t => t.id === selectedTemplate) || null
      : null;
  }, [selectedTemplate]);

  const handleSelectTemplate = useCallback((templateId: string) => {
    logger.debug('Selected template:', templateId);
    // Additional logic can be added here
  }, []);

  const handlePreviewTemplate = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    setShowPreviewModal(true);
  }, []);

  const handleUseTemplate = useCallback(
    (templateId: string) => {
      try {
        logger.debug('Adding template to editor:', templateId);

        // Validate template exists
        const template = resumeTemplates.find(t => t.id === templateId);
        if (!template) {
          throw new Error(`Template with ID "${templateId}" not found`);
        }

        if (onAddToEditor) {
          onAddToEditor(templateId);
        }

        // Clear any previous errors
        setError(null);

        // Set animation state
        setAddedTemplateId(templateId);

        // Show success animation
        setTimeout(() => {
          setAddedTemplateId(null);
        }, SUCCESS_ANIMATION_DURATION);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add template');
        logger.error('Error adding template to editor:', error);
        setError(error.message);
        if (onError) {
          onError(error, 'useTemplate');
        }
      }
    },
    [onAddToEditor, onError]
  );

  const handleDownloadTemplate = useCallback(() => {
    try {
      if (!currentSelectedTemplate) {
        throw new Error('No template selected for download');
      }

      logger.debug('Downloading template:', currentSelectedTemplate.name);
      setIsLoading(true);
      setError(null);

      const htmlContent = getTemplateDownloadHTML(currentSelectedTemplate);
      downloadTemplateAsHTML(currentSelectedTemplate, htmlContent);

      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to download template');
      logger.error('Error downloading template:', error);
      setError(error.message);
      setIsLoading(false);
      if (onError) {
        onError(error, 'downloadTemplate');
      }
    }
  }, [currentSelectedTemplate, onError]);

  const handleShareTemplate = useCallback(async () => {
    try {
      if (!currentSelectedTemplate) {
        throw new Error('No template selected for sharing');
      }

      logger.debug('Sharing template:', currentSelectedTemplate.name);
      setIsLoading(true);
      setError(null);

      await shareTemplate({
        name: currentSelectedTemplate.name,
        description: currentSelectedTemplate.description,
      });

      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to share template');
      logger.error('Error sharing template:', error);
      setError(error.message);
      setIsLoading(false);
      if (onError) {
        onError(error, 'shareTemplate');
      }
    }
  }, [currentSelectedTemplate, onError]);

  const toggleFavorite = useCallback((templateId: string) => {
    try {
      // Validate template exists
      const template = resumeTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template with ID "${templateId}" not found`);
      }

      setFavorites(prev =>
        prev.includes(templateId)
          ? prev.filter(id => id !== templateId)
          : [...prev, templateId]
      );

      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle favorite');
      logger.error('Error toggling favorite:', error);
      setError(error.message);
      if (onError) {
        onError(error, 'toggleFavorite');
      }
    }
  }, [onError]);

  return {
    // State
    selectedTemplate,
    showPreviewModal,
    showUploadModal,
    addedTemplateId,
    favorites,
    uploadedFile,
    uploadSource,
    error,
    isLoading,

    // Setters
    setSelectedTemplate,
    setShowPreviewModal,
    setShowUploadModal,
    setUploadedFile,
    setUploadSource,
    clearError,

    // Actions
    handlePreviewTemplate,
    handleUseTemplate,
    handleDownloadTemplate,
    handleShareTemplate,
    toggleFavorite,
    handleSelectTemplate,

    // Computed
    currentSelectedTemplate,
  };
};

