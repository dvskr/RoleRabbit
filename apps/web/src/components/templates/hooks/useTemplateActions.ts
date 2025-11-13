/**
 * Custom hook for template actions (preview, use, download, share, favorites)
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { logger } from '../../../utils/logger';
import { resumeTemplates } from '../../../data/templates';
import { getTemplateDownloadHTML, downloadTemplateAsHTML, shareTemplate } from '../utils/templateHelpers';
import { SUCCESS_ANIMATION_DURATION } from '../constants';

// localStorage key for favorites
const FAVORITES_STORAGE_KEY = 'template_favorites';

/**
 * Load favorites from localStorage with error handling
 */
const loadFavoritesFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that it's an array of strings
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed;
      }
      logger.warn('Invalid favorites data in localStorage, ignoring');
    }
  } catch (error) {
    logger.error('Error loading favorites from localStorage:', error);
  }
  return [];
};

/**
 * Save favorites to localStorage with error handling
 */
const saveFavoritesToStorage = (favorites: string[]): void => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    logger.error('Error saving favorites to localStorage:', error);
  }
};

interface UseTemplateActionsOptions {
  onAddToEditor?: (templateId: string) => void;
  onRemoveTemplate?: (templateId: string) => void;
}

interface UseTemplateActionsReturn {
  // State
  selectedTemplate: string | null;
  showPreviewModal: boolean;
  showUploadModal: boolean;
  addedTemplateId: string | null;
  favorites: string[];
  uploadedFile: File | null;

  // Setters
  setSelectedTemplate: (id: string | null) => void;
  setShowPreviewModal: (show: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  setUploadedFile: (file: File | null) => void;

  // Actions
  handlePreviewTemplate: (templateId: string) => void;
  handleUseTemplate: (templateId: string) => void;
  handleDownloadTemplate: () => void;
  handleShareTemplate: () => void;
  toggleFavorite: (templateId: string) => void;
  handleSelectTemplate: (templateId: string) => void;

  // Computed
  currentSelectedTemplate: typeof resumeTemplates[0] | null;
}

export const useTemplateActions = (
  options: UseTemplateActionsOptions = {}
): UseTemplateActionsReturn => {
  const { onAddToEditor, onRemoveTemplate } = options;

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [addedTemplateId, setAddedTemplateId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavoritesFromStorage());
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);

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
      logger.debug('Adding template to editor:', templateId);

      if (onAddToEditor) {
        onAddToEditor(templateId);
      }

      // Set animation state
      setAddedTemplateId(templateId);

      // Show success animation
      setTimeout(() => {
        setAddedTemplateId(null);
      }, SUCCESS_ANIMATION_DURATION);
    },
    [onAddToEditor]
  );

  const handleDownloadTemplate = useCallback(() => {
    if (!currentSelectedTemplate) return;
    logger.debug('Downloading template:', currentSelectedTemplate.name);

    const htmlContent = getTemplateDownloadHTML(currentSelectedTemplate);
    downloadTemplateAsHTML(currentSelectedTemplate, htmlContent);
  }, [currentSelectedTemplate]);

  const handleShareTemplate = useCallback(async () => {
    if (!currentSelectedTemplate) return;
    logger.debug('Sharing template:', currentSelectedTemplate.name);

    await shareTemplate({
      name: currentSelectedTemplate.name,
      description: currentSelectedTemplate.description,
    });
  }, [currentSelectedTemplate]);

  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  return {
    // State
    selectedTemplate,
    showPreviewModal,
    showUploadModal,
    addedTemplateId,
    favorites,
    uploadedFile,

    // Setters
    setSelectedTemplate,
    setShowPreviewModal,
    setShowUploadModal,
    setUploadedFile,

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

