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

  // Setters
  setSelectedTemplate: (id: string | null) => void;
  setShowPreviewModal: (show: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  setUploadedFile: (file: File | null) => void;
  setUploadSource: (source: 'cloud' | 'system') => void;

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSource, setUploadSource] = useState<'cloud' | 'system'>('cloud');

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
    uploadSource,

    // Setters
    setSelectedTemplate,
    setShowPreviewModal,
    setShowUploadModal,
    setUploadedFile,
    setUploadSource,

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

