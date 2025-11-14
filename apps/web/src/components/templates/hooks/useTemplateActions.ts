/**
 * Custom hook for template actions (preview, use, download, share, favorites)
 * Includes localStorage persistence for favorites
 * Enhanced with Zod validation for runtime safety
 * Enhanced with usage history tracking
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { logger } from '../../../utils/logger';
import { resumeTemplates } from '../../../data/templates';
import { getTemplateDownloadHTML, downloadTemplateAsHTML, shareTemplate } from '../utils/templateHelpers';
import { SUCCESS_ANIMATION_DURATION } from '../constants';
import { validateTemplate } from '../validation';
import { useTemplateHistory } from './useTemplateHistory';
import {
  trackTemplatePreview,
  trackTemplateAdd,
  trackTemplateRemove,
  trackTemplateFavorite,
  trackTemplateDownload,
  trackError,
} from '../utils/analytics';

// localStorage key for favorites persistence
const FAVORITES_STORAGE_KEY = 'template_favorites';

/**
 * Load favorites from localStorage
 * Validates that favorites are valid template IDs
 */
function loadFavoritesFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Validate that parsed data is an array of strings
    if (!Array.isArray(parsed)) {
      console.warn('Invalid favorites format in localStorage, expected array');
      return [];
    }

    // Filter out any non-string values and validate template IDs exist
    const validFavorites = parsed.filter(id => {
      if (typeof id !== 'string') return false;
      return resumeTemplates.some(t => t.id === id);
    });

    return validFavorites;
  } catch (error) {
    console.warn('Failed to load favorites from localStorage:', error);
    return [];
  }
}

/**
 * Save favorites to localStorage
 */
function saveFavoritesToStorage(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Failed to save favorites to localStorage:', error);
  }
}

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
  const [favorites, setFavorites] = useState<string[]>(() => loadFavoritesFromStorage());
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSource, setUploadSource] = useState<'cloud' | 'system'>('cloud');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Usage history tracking
  const { addToHistory } = useTemplateHistory();

  // Save favorites to localStorage when they change
  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);

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
    const template = resumeTemplates.find(t => t.id === templateId);
    setSelectedTemplate(templateId);
    setShowPreviewModal(true);
    // Track preview in history
    addToHistory(templateId, 'preview');
    // Track analytics
    if (template) {
      trackTemplatePreview(templateId, template.name);
    }
  }, [addToHistory]);

  const handleUseTemplate = useCallback(
    (templateId: string) => {
      try {
        logger.debug('Adding template to editor:', templateId);

        // Validate template exists
        const template = resumeTemplates.find(t => t.id === templateId);
        if (!template) {
          throw new Error(`Template with ID "${templateId}" not found`);
        }

        // Validate template data structure
        const validationResult = validateTemplate(template);
        if (!validationResult.success) {
          logger.error('Template validation failed:', validationResult.error);
          throw new Error(
            `Template data is invalid: ${validationResult.error?.issues[0]?.message || 'Unknown validation error'}`
          );
        }

        if (onAddToEditor) {
          onAddToEditor(templateId);
        }

        // Track usage in history
        addToHistory(templateId, 'use');

        // Track analytics
        trackTemplateAdd(template.id, template.name);

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
        // Track error
        trackError(error.message, error.stack, 'useTemplate');
        if (onError) {
          onError(error, 'useTemplate');
        }
      }
    },
    [onAddToEditor, onError, addToHistory]
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

      // Track download in history
      addToHistory(currentSelectedTemplate.id, 'download');

      // Track analytics
      trackTemplateDownload(currentSelectedTemplate.id, currentSelectedTemplate.name);

      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to download template');
      logger.error('Error downloading template:', error);
      setError(error.message);
      setIsLoading(false);
      // Track error
      trackError(error.message, error.stack, 'downloadTemplate');
      if (onError) {
        onError(error, 'downloadTemplate');
      }
    }
  }, [currentSelectedTemplate, onError, addToHistory]);

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
      // Track error
      trackError(error.message, error.stack, 'shareTemplate');
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

      // Validate template data structure
      const validationResult = validateTemplate(template);
      if (!validationResult.success) {
        logger.error('Template validation failed:', validationResult.error);
        throw new Error(
          `Template data is invalid: ${validationResult.error?.issues[0]?.message || 'Unknown validation error'}`
        );
      }

      const isFavorited = !favorites.includes(templateId);

      setFavorites(prev =>
        prev.includes(templateId)
          ? prev.filter(id => id !== templateId)
          : [...prev, templateId]
      );

      // Track analytics
      trackTemplateFavorite(template.id, template.name, isFavorited);

      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle favorite');
      logger.error('Error toggling favorite:', error);
      setError(error.message);
      // Track error
      trackError(error.message, error.stack, 'toggleFavorite');
      if (onError) {
        onError(error, 'toggleFavorite');
      }
    }
  }, [onError, favorites]);

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

