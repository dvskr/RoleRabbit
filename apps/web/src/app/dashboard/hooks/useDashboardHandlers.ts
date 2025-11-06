/**
 * Custom hook for dashboard handler functions
 * Consolidates handler logic for better organization
 */

import { useCallback } from 'react';
import type {
  ResumeData,
  CustomSection,
  SectionVisibility,
} from '../../../types/resume';
import { resumeHelpers } from '../../../utils/resumeHelpers';
import { aiHelpers } from '../../../utils/aiHelpers';
import { createCustomField } from '../utils/dashboardHandlers';
import {
  removeDuplicateResumeEntries,
  duplicateResumeState,
} from '../utils/resumeDataHelpers';
import { logger } from '../../../utils/logger';
import apiService from '../../../services/apiService';

export interface UseDashboardHandlersParams {
  // Resume data
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  sectionOrder: string[];
  setSectionOrder: (order: string[] | ((prev: string[]) => string[])) => void;
  sectionVisibility: SectionVisibility;
  setSectionVisibility: (visibility: SectionVisibility | ((prev: SectionVisibility) => SectionVisibility)) => void;
  customSections: CustomSection[];
  setCustomSections: (sections: CustomSection[] | ((prev: CustomSection[]) => CustomSection[])) => void;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  currentResumeId: string | null;
  setCurrentResumeId: (id: string | null) => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  setSaveError: (error: string | null) => void;
  lastSavedAt: Date | null;
  setLastSavedAt: (date: Date | null) => void;
  lastServerUpdatedAt: string | null;
  setLastServerUpdatedAt: (value: string | null) => void;
  selectedTemplateId?: string | null;
  history: ResumeData[];
  setHistory: (history: ResumeData[] | ((prev: ResumeData[]) => ResumeData[])) => void;
  historyIndex: number;
  setHistoryIndex: (index: number | ((prev: number) => number)) => void;
  
  // Formatting
  fontFamily: string;
  setFontFamily: (family: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;
  sectionSpacing: string;
  setSectionSpacing: (spacing: string) => void;
  margins: string;
  setMargins: (margins: string) => void;
  headingStyle: string;
  setHeadingStyle: (style: string) => void;
  bulletStyle: string;
  setBulletStyle: (style: string) => void;
  
  // Modal states
  newSectionName: string;
  setNewSectionName: (name: string) => void;
  newSectionContent: string;
  setNewSectionContent: (content: string) => void;
  setShowAddSectionModal: (show: boolean) => void;
  newFieldName: string;
  setNewFieldName: (name: string) => void;
  newFieldIcon: string;
  setNewFieldIcon: (icon: string) => void;
  customFields: any[];
  setCustomFields: (fields: any[] | ((prev: any[]) => any[])) => void;
  setShowAddFieldModal: (show: boolean) => void;
  
  // AI states
  aiGenerateSection: string;
  setAiGenerateSection: (section: string) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  writingTone: string;
  setWritingTone: (tone: string) => void;
  contentLength: string;
  setContentLength: (length: string) => void;
  setShowAIGenerateModal: (show: boolean) => void;
  
  // Other handlers
  jobDescription: string;
  setIsAnalyzing: (analyzing: boolean) => void;
  setMatchScore: (score: number) => void;
  setMatchedKeywords: (keywords: string[]) => void;
  setMissingKeywords: (keywords: string[]) => void;
  setAiRecommendations: (recommendations: string[]) => void;
  aiRecommendations: string[];
  aiConversation: any[];
  setAiConversation: (conversation: any[] | ((prev: any[]) => any[])) => void;
}

export interface UseDashboardHandlersReturn {
  // Resume operations
  toggleSection: (section: string) => void;
  moveSection: (index: number, direction: 'up' | 'down') => void;
  generateSmartFileName: () => string;
  resetToDefault: () => void;
  addCustomSection: () => void;
  deleteCustomSection: (id: string) => void;
  updateCustomSection: (id: string, content: string) => void;
  addCustomField: () => void;
  handleDuplicateResume: () => void;
  handleRemoveDuplicates: () => void;
  
  // AI operations
  openAIGenerateModal: (section: string) => void;
  hideSection: (section: string) => void;
  analyzeJobDescription: () => void;
  applyAIRecommendations: () => void;
  sendAIMessage: () => void;
  
  // Other
  saveResume: () => void;
  undo: () => void;
  redo: () => void;
}

/**
 * Hook for dashboard handler functions
 */
export function useDashboardHandlers(params: UseDashboardHandlersParams): UseDashboardHandlersReturn {
  const {
    resumeData,
    setResumeData,
    sectionOrder,
    setSectionOrder,
    sectionVisibility,
    setSectionVisibility,
    customSections,
    setCustomSections,
    resumeFileName,
    setResumeFileName,
    currentResumeId,
    setCurrentResumeId,
    hasChanges,
    setHasChanges,
    isSaving,
    setIsSaving,
    setSaveError,
    lastSavedAt,
    setLastSavedAt,
    lastServerUpdatedAt,
    setLastServerUpdatedAt,
    selectedTemplateId,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing,
    sectionSpacing,
    setSectionSpacing,
    margins,
    setMargins,
    headingStyle,
    setHeadingStyle,
    bulletStyle,
    setBulletStyle,
    newSectionName,
    setNewSectionName,
    newSectionContent,
    setNewSectionContent,
    setShowAddSectionModal,
    newFieldName,
    setNewFieldName,
    newFieldIcon,
    setNewFieldIcon,
    customFields,
    setCustomFields,
    setShowAddFieldModal,
    aiGenerateSection,
    setAiGenerateSection,
    aiPrompt,
    setAiPrompt,
    writingTone,
    setWritingTone,
    contentLength,
    setContentLength,
    setShowAIGenerateModal,
    jobDescription,
    setIsAnalyzing,
    setMatchScore,
    setMatchedKeywords,
    setMissingKeywords,
    setAiRecommendations,
    aiRecommendations,
    aiConversation,
    setAiConversation,
  } = params;

  const toggleSection = useCallback((section: string) => {
    resumeHelpers.toggleSection(section, sectionVisibility, setSectionVisibility);
  }, [sectionVisibility, setSectionVisibility]);

  const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
    resumeHelpers.moveSection(index, direction, sectionOrder, setSectionOrder);
  }, [sectionOrder, setSectionOrder]);

  const generateSmartFileName = useCallback(() => {
    return resumeHelpers.generateSmartFileName(resumeData);
  }, [resumeData]);

  const resetToDefault = useCallback(() => {
    const defaults = resumeHelpers.resetToDefault();
    setFontFamily(defaults.fontFamily);
    setFontSize(defaults.fontSize);
    setLineSpacing(defaults.lineSpacing);
    setSectionSpacing(defaults.sectionSpacing);
    setMargins(defaults.margins);
    setHeadingStyle(defaults.headingStyle);
    setBulletStyle(defaults.bulletStyle);
  }, [setFontFamily, setFontSize, setLineSpacing, setSectionSpacing, setMargins, setHeadingStyle, setBulletStyle]);

  const addCustomSection = useCallback(() => {
    resumeHelpers.addCustomSection(
      newSectionName,
      newSectionContent,
      customSections,
      setCustomSections,
      setSectionOrder,
      setSectionVisibility,
      setNewSectionName,
      setNewSectionContent,
      setShowAddSectionModal
    );
  }, [
    newSectionName,
    newSectionContent,
    customSections,
    setCustomSections,
    setSectionOrder,
    setSectionVisibility,
    setNewSectionName,
    setNewSectionContent,
    setShowAddSectionModal,
  ]);

  const deleteCustomSection = useCallback((id: string) => {
    resumeHelpers.deleteCustomSection(id, customSections, setCustomSections, setSectionOrder, setSectionVisibility);
  }, [customSections, setCustomSections, setSectionOrder, setSectionVisibility]);

  const updateCustomSection = useCallback((id: string, content: string) => {
    resumeHelpers.updateCustomSection(id, content, customSections, setCustomSections);
  }, [customSections, setCustomSections]);

  const addCustomField = useCallback(() => {
    if (!newFieldName.trim()) return;
    
    const newField = createCustomField(newFieldName);
    setCustomFields(prev => [...prev, newField]);
    setNewFieldName('');
    setNewFieldIcon('link');
    setShowAddFieldModal(false);
  }, [newFieldName, setCustomFields, setNewFieldName, setNewFieldIcon, setShowAddFieldModal]);

  const handleDuplicateResume = useCallback(() => {
    logger.debug('Duplicating resume');
    
    const duplicated = duplicateResumeState(
      resumeFileName,
      resumeData,
      customSections,
      sectionOrder,
      sectionVisibility
    );
    
    // Update all states with duplicated data
    setResumeFileName(duplicated.resumeFileName);
    setResumeData(duplicated.resumeData);
    setCustomSections(duplicated.customSections);
    setSectionOrder(duplicated.sectionOrder);
    setSectionVisibility(duplicated.sectionVisibility);
    
    // Reset history for the new resume
    const newHistory = [duplicated.resumeData];
    setHistory(newHistory);
    setHistoryIndex(0);
    
    logger.debug('Resume duplicated successfully');
  }, [
    resumeFileName,
    resumeData,
    customSections,
    sectionOrder,
    sectionVisibility,
    setResumeFileName,
    setResumeData,
    setCustomSections,
    setSectionOrder,
    setSectionVisibility,
    setHistory,
    setHistoryIndex,
  ]);

  const handleRemoveDuplicates = useCallback(() => {
    logger.debug('Removing duplicates from resume');
    
    const { data, removedCount } = removeDuplicateResumeEntries(resumeData);
    
    if (removedCount > 0) {
      setResumeData(data);
      alert(`Removed ${removedCount} duplicate ${removedCount === 1 ? 'entry' : 'entries'}`);
      logger.debug(`Removed ${removedCount} duplicates`);
    } else {
      alert('No duplicates found!');
    }
  }, [resumeData, setResumeData]);

  const openAIGenerateModal = useCallback((section: string) => {
    aiHelpers.openAIGenerateModal(section, setAiGenerateSection, setShowAIGenerateModal);
  }, [setAiGenerateSection, setShowAIGenerateModal]);

  const hideSection = useCallback((section: string) => {
    resumeHelpers.hideSection(section, sectionVisibility, setSectionVisibility);
  }, [sectionVisibility, setSectionVisibility]);

  const analyzeJobDescription = useCallback(() => {
    aiHelpers.analyzeJobDescription(
      jobDescription,
      setIsAnalyzing,
      setMatchScore,
      setMatchedKeywords,
      setMissingKeywords,
      setAiRecommendations
    );
  }, [
    jobDescription,
    setIsAnalyzing,
    setMatchScore,
    setMatchedKeywords,
    setMissingKeywords,
    setAiRecommendations,
  ]);

  const applyAIRecommendations = useCallback(() => {
    aiHelpers.applyAIRecommendations(aiRecommendations, setAiRecommendations);
  }, [aiRecommendations, setAiRecommendations]);

  const sendAIMessage = useCallback(() => {
    aiHelpers.sendAIMessage(aiPrompt, setAiPrompt, aiConversation, setAiConversation);
  }, [aiPrompt, setAiPrompt, aiConversation, setAiConversation]);

  const saveResume = useCallback(async () => {
    if (isSaving) {
      return;
    }

    if (!hasChanges && currentResumeId) {
      setSaveError(null);
      setLastSavedAt(new Date());
       setHasChanges(false);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const sanitizedName = resumeFileName && resumeFileName.trim().length > 0
      ? resumeFileName.trim()
      : 'Untitled Resume';

    const payload: any = {
      name: sanitizedName,
      fileName: sanitizedName,
      templateId: selectedTemplateId || null,
      data: {
        resumeData,
        sectionOrder,
        sectionVisibility,
        customSections,
        customFields,
        formatting: {
          fontFamily,
          fontSize,
          lineSpacing,
          sectionSpacing,
          margins,
          headingStyle,
          bulletStyle,
        },
        metadata: {
          savedAt: new Date().toISOString(),
        },
      },
      lastKnownServerUpdatedAt: lastServerUpdatedAt,
    };

    try {
      const response = currentResumeId
        ? await apiService.updateResume(currentResumeId, payload)
        : await apiService.createResume({
          fileName: sanitizedName,
          templateId: selectedTemplateId || null,
          data: payload.data
        });

      // Handle response - check both success flag and resume object
      if (response?.success === false) {
        throw new Error(response?.error || 'Failed to save resume');
      }
      
      const savedResume = response?.resume;
      if (savedResume) {
        if (!currentResumeId) {
          setCurrentResumeId(savedResume.id);
        }
        if (savedResume.name && savedResume.name !== resumeFileName) {
          setResumeFileName(savedResume.name);
        }
        setLastServerUpdatedAt(savedResume.lastUpdated || null);
        // Always set lastSavedAt on successful save
        setLastSavedAt(new Date(savedResume.lastUpdated || new Date()));
        // Clear hasChanges after successful save
        setHasChanges(false);
      } else {
        // If no resume in response but no error, still mark as saved
        logger.warn('Save response missing resume object:', response);
        setLastSavedAt(new Date());
        setHasChanges(false);
      }
    } catch (error: any) {
      logger.error('Failed to save resume:', error);
      if (error?.statusCode === 409) {
        setSaveError('Resume has been updated elsewhere. Please reload to sync changes.');
      } else {
        setSaveError(error?.message || 'Failed to save resume');
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    hasChanges,
    resumeFileName,
    selectedTemplateId,
    resumeData,
    sectionOrder,
    sectionVisibility,
    customSections,
    customFields,
    fontFamily,
    fontSize,
    lineSpacing,
    sectionSpacing,
    margins,
    headingStyle,
    bulletStyle,
    lastServerUpdatedAt,
    currentResumeId,
    setCurrentResumeId,
    setResumeFileName,
    setLastServerUpdatedAt,
    setLastSavedAt,
    setHasChanges,
    setSaveError,
    setIsSaving,
  ]);

  const undo = useCallback(() => {
    resumeHelpers.undo(history, historyIndex, setHistoryIndex, setResumeData);
  }, [history, historyIndex, setHistoryIndex, setResumeData]);

  const redo = useCallback(() => {
    resumeHelpers.redo(history, historyIndex, setHistoryIndex, setResumeData);
  }, [history, historyIndex, setHistoryIndex, setResumeData]);

  return {
    toggleSection,
    moveSection,
    generateSmartFileName,
    resetToDefault,
    addCustomSection,
    deleteCustomSection,
    updateCustomSection,
    addCustomField,
    handleDuplicateResume,
    handleRemoveDuplicates,
    openAIGenerateModal,
    hideSection,
    analyzeJobDescription,
    applyAIRecommendations,
    sendAIMessage,
    saveResume,
    undo,
    redo,
  };
}

