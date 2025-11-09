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
import { validateResumeData, sanitizeResumeData } from '../../../utils/validation';
import { formatErrorForDisplay } from '../../../utils/errorMessages';
import { mapEditorStateToBasePayload, BaseResumeRecord } from '../../../utils/resumeMapper';
import { TailorResult, CoverLetterDraft, PortfolioDraft } from '../../../types/ai';

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
  isAnalyzing: boolean;
  setShowATSScore: (show: boolean) => void;
  applyBaseResume?: (record?: BaseResumeRecord | null) => void;
  tailorEditMode: string;
  selectedTone: string;
  selectedLength: string;
  setTailorResult: (result: TailorResult | null) => void;
  setIsTailoring: (value: boolean) => void;
  setCoverLetterDraft: (draft: CoverLetterDraft | null) => void;
  setIsGeneratingCoverLetter: (value: boolean) => void;
  setPortfolioDraft: (draft: PortfolioDraft | null) => void;
  setIsGeneratingPortfolio: (value: boolean) => void;
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
  analyzeJobDescription: () => Promise<any | null>;
  applyAIRecommendations: () => Promise<any | null>;
  tailorResumeForJob: () => Promise<any | null>;
  generateCoverLetterDraft: () => Promise<any | null>;
  generatePortfolioDraft: () => Promise<any | null>;
  
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
    isAnalyzing,
    setShowATSScore,
    applyBaseResume,
    tailorEditMode,
    selectedTone,
    selectedLength,
    setTailorResult,
    setIsTailoring,
    setCoverLetterDraft,
    setIsGeneratingCoverLetter,
    setPortfolioDraft,
    setIsGeneratingPortfolio
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

  const analyzeJobDescription = useCallback(async () => {
    if (!jobDescription.trim()) {
      return null;
    }
    if (!currentResumeId) {
      setSaveError('Select a resume slot before running ATS analysis.');
      return null;
    }
    if (isAnalyzing) {
      return null;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiService.runATSCheck({
        resumeId: currentResumeId,
        jobDescription
      });
      const analysis = response?.analysis;
      if (analysis) {
        setMatchScore(analysis.overall ?? 0);
        setMatchedKeywords(response?.matchedKeywords ?? []);
        setMissingKeywords(response?.missingKeywords ?? []);
        setAiRecommendations(response?.improvements ?? []);
        setShowATSScore(true);
      }
      return response;
    } catch (error) {
      logger.error('ATS analysis failed', { error });
      const friendlyError = formatErrorForDisplay(error, {
        action: 'analyzing job description',
        feature: 'ATS analysis'
      });
      setSaveError(friendlyError);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    jobDescription,
    currentResumeId,
    isAnalyzing,
    setIsAnalyzing,
    setMatchScore,
    setMatchedKeywords,
    setMissingKeywords,
    setAiRecommendations,
    setShowATSScore,
    setSaveError
  ]);

  const applyAIRecommendations = useCallback(async () => {
    if (!currentResumeId) {
      setSaveError('Select an active resume before applying recommendations.');
      return null;
    }
    if (!jobDescription.trim()) {
      setSaveError('Provide a job description before applying recommendations.');
      return null;
    }

    try {
      const response = await apiService.applyAIRecommendations({
        resumeId: currentResumeId,
        jobDescription,
        focusAreas: aiRecommendations?.length ? ['summary', 'experience', 'skills'] : undefined,
        tone: writingTone
      });
      if (response?.updatedResume && applyBaseResume) {
        applyBaseResume(response.updatedResume as BaseResumeRecord);
      }
      if (response?.appliedRecommendations) {
        setAiRecommendations(response.appliedRecommendations);
      }
      if (response?.ats?.after?.overall !== undefined) {
        setMatchScore(response.ats.after.overall ?? 0);
        setShowATSScore(true);
      }
      return response;
    } catch (error) {
      logger.error('Failed to apply AI recommendations', { error });
      const friendlyError = formatErrorForDisplay(error, {
        action: 'applying AI recommendations',
        feature: 'ATS analysis'
      });
      setSaveError(friendlyError);
      return null;
    }
  }, [
    currentResumeId,
    jobDescription,
    aiRecommendations,
    writingTone,
    applyBaseResume,
    setAiRecommendations,
    setMatchScore,
    setShowATSScore,
    setSaveError
  ]);

  const tailorResumeForJob = useCallback(async () => {
    if (!currentResumeId) {
      setSaveError('Select an active resume before tailoring.');
      return null;
    }
    if (!jobDescription.trim()) {
      setSaveError('Provide a job description before tailoring your resume.');
      return null;
    }

    setTailorResult(null);
    setIsTailoring(true);
    try {
      const response = await apiService.tailorResume({
        resumeId: currentResumeId,
        jobDescription,
        mode: tailorEditMode?.toUpperCase() === 'FULL' ? 'FULL' : 'PARTIAL',
        tone: selectedTone,
        length: selectedLength
      });

      if (response?.tailoredResume) {
        const result: TailorResult = {
          tailoredResume: response.tailoredResume,
          diff: Array.isArray(response.diff) ? response.diff : [],
          warnings: Array.isArray(response.warnings) ? response.warnings : [],
          recommendedKeywords: Array.isArray(response.recommendedKeywords) ? response.recommendedKeywords : [],
          ats: response.ats ?? null,
          confidence: typeof response.confidence === 'number' ? response.confidence : null,
          mode: response.tailoredVersion?.mode ?? (tailorEditMode?.toUpperCase() === 'FULL' ? 'FULL' : 'PARTIAL')
        };
        setTailorResult(result);

        if (Array.isArray(response.recommendedKeywords) && response.recommendedKeywords.length) {
          setAiRecommendations(response.recommendedKeywords);
        }
        if (response.ats?.after?.overall !== undefined) {
          setMatchScore(response.ats.after.overall ?? 0);
          setShowATSScore(true);
        }
      }

      return response;
    } catch (error) {
      logger.error('Failed to tailor resume', { error });
      const friendlyError = formatErrorForDisplay(error, {
        action: 'tailoring resume',
        feature: 'resume tailoring'
      });
      setSaveError(friendlyError);
      return null;
    } finally {
      setIsTailoring(false);
    }
  }, [
    currentResumeId,
    jobDescription,
    tailorEditMode,
    selectedTone,
    selectedLength,
    setTailorResult,
    setAiRecommendations,
    setMatchScore,
    setShowATSScore,
    setSaveError,
    setIsTailoring
  ]);

  const generateCoverLetterDraft = useCallback(async () => {
    if (!currentResumeId) {
      setSaveError('Select an active resume before generating a cover letter.');
      return null;
    }
    if (!jobDescription.trim()) {
      setSaveError('Provide a job description before generating a cover letter.');
      return null;
    }

    setCoverLetterDraft(null);
    setIsGeneratingCoverLetter(true);
    try {
      const response = await apiService.generateCoverLetter({
        resumeId: currentResumeId,
        jobDescription,
        tone: selectedTone
      });

      if (response?.content) {
        const draft: CoverLetterDraft = {
          subject: response.content.subject || '',
          greeting: response.content.greeting || '',
          bodyParagraphs: Array.isArray(response.content.bodyParagraphs) ? response.content.bodyParagraphs : [],
          closing: response.content.closing || '',
          signature: response.content.signature || '',
          jobTitle: response.content.jobTitle ?? response.document?.jobTitle ?? null,
          company: response.content.company ?? response.document?.company ?? null,
          tone: selectedTone
        };
        setCoverLetterDraft(draft);
      }

      return response;
    } catch (error) {
      logger.error('Failed to generate cover letter', { error });
      const friendlyError = formatErrorForDisplay(error, {
        action: 'generating cover letter',
        feature: 'cover letter AI'
      });
      setSaveError(friendlyError);
      return null;
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  }, [
    currentResumeId,
    jobDescription,
    selectedTone,
    setCoverLetterDraft,
    setSaveError,
    setIsGeneratingCoverLetter
  ]);

  const generatePortfolioDraft = useCallback(async () => {
    if (!currentResumeId) {
      setSaveError('Select an active resume before generating a portfolio outline.');
      return null;
    }

    setPortfolioDraft(null);
    setIsGeneratingPortfolio(true);
    try {
      const response = await apiService.generatePortfolio({
        resumeId: currentResumeId,
        tone: selectedTone
      });

      if (response?.content) {
        const draft: PortfolioDraft = {
          headline: response.content.headline || '',
          tagline: response.content.tagline || '',
          about: response.content.about || '',
          highlights: Array.isArray(response.content.highlights) ? response.content.highlights : [],
          selectedProjects: Array.isArray(response.content.selectedProjects) ? response.content.selectedProjects : [],
          tone: selectedTone
        };
        setPortfolioDraft(draft);
      }

      return response;
    } catch (error) {
      logger.error('Failed to generate portfolio outline', { error });
      const friendlyError = formatErrorForDisplay(error, {
        action: 'generating portfolio outline',
        feature: 'portfolio generator'
      });
      setSaveError(friendlyError);
      return null;
    } finally {
      setIsGeneratingPortfolio(false);
    }
  }, [
    currentResumeId,
    selectedTone,
    setPortfolioDraft,
    setSaveError,
    setIsGeneratingPortfolio
  ]);

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

    // Pre-save validation
    const validation = validateResumeData(resumeData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      setSaveError(`Validation failed: ${errorMessages}. Please fix these errors before saving.`);
      setIsSaving(false);
      logger.warn('Resume save validation failed:', validation.errors);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const sanitizedName = resumeFileName && resumeFileName.trim().length > 0
      ? resumeFileName.trim()
      : 'Untitled Resume';

    const editorState = {
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
      name: sanitizedName
    };

    const mappedPayload = mapEditorStateToBasePayload(editorState);
    const payload = sanitizeResumeData(mappedPayload);

    try {
      const response = currentResumeId
        ? await apiService.updateBaseResume(currentResumeId, {
            ...payload,
            name: sanitizedName,
            lastKnownServerUpdatedAt: lastServerUpdatedAt
          })
        : await apiService.createBaseResume({
            name: sanitizedName,
            data: payload.data,
            metadata: payload.metadata,
            formatting: payload.formatting
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
        setLastServerUpdatedAt(savedResume.updatedAt || savedResume.lastUpdated || null);
        // Always set lastSavedAt on successful save
        setLastSavedAt(new Date(savedResume.updatedAt || savedResume.lastUpdated || new Date()));
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
      const friendlyError = formatErrorForDisplay(error, {
        action: 'saving resume',
        feature: 'resume builder',
      });
      setSaveError(friendlyError);
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
    tailorResumeForJob,
    generateCoverLetterDraft,
    generatePortfolioDraft,
    saveResume,
    undo,
    redo,
  };
}

