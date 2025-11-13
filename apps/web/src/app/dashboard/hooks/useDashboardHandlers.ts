/**
 * Custom hook for dashboard handler functions
 * Consolidates handler logic for better organization
 */

import { useCallback, Dispatch, SetStateAction } from 'react';
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
  mergeTailoredResume,
} from '../utils/resumeDataHelpers';
import { logger } from '../../../utils/logger';
import apiService from '../../../services/apiService';
import { validateResumeData, sanitizeResumeData } from '../../../utils/validation';
import { formatErrorForDisplay } from '../../../utils/errorMessages';
import {
  mapEditorStateToBasePayload,
  BaseResumeRecord,
  normalizedDataToResumeData,
} from '../../../utils/resumeMapper';
import { TailorResult, CoverLetterDraft, PortfolioDraft, ATSAnalysisResult } from '../../../types/ai';

const buildATSFromScore = (
  score: number,
  previous?: ATSAnalysisResult | null
): ATSAnalysisResult => {
  const base: ATSAnalysisResult = previous
    ? { ...previous, overall: score }
    : {
        overall: score,
        keywords: 0,
        content: 0,
        experience: 0,
        format: 0,
        improvements: [],
        strengths: [],
        matchedKeywords: [],
        missingKeywords: [],
      };
  base.overall = score;
  return base;
};

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
  setMatchScore: Dispatch<SetStateAction<ATSAnalysisResult | null>>;
  setMatchedKeywords: (keywords: string[]) => void;
  setMissingKeywords: (keywords: string[]) => void;
  setAiRecommendations: (recommendations: string[]) => void;
  aiRecommendations: string[];
  isAnalyzing: boolean;
  setShowATSScore: (show: boolean) => void;
  applyBaseResume?: (record?: BaseResumeRecord | null) => void;
  loadResumeById: (id: string) => Promise<any>;
  tailorEditMode: string;
  selectedTone: string;
  selectedLength: string;
  tailorResult: TailorResult | null;
  setTailorResult: (result: TailorResult | null) => void;
  setIsTailoring: (value: boolean) => void;
  setCoverLetterDraft: (draft: CoverLetterDraft | null) => void;
  setIsGeneratingCoverLetter: (value: boolean) => void;
  setPortfolioDraft: (draft: PortfolioDraft | null) => void;
  setIsGeneratingPortfolio: (value: boolean) => void;
  
  // AI Progress tracking
  atsProgress?: any;
  startATSProgress?: (operation: any, estimatedTime?: number) => void;
  updateATSProgress?: (stage: string, progress: number, message?: string) => void;
  completeATSProgress?: () => void;
  resetATSProgress?: () => void;
  tailorProgress?: any;
  startTailorProgress?: (operation: any, estimatedTime?: number) => void;
  updateTailorProgress?: (stage: string, progress: number, message?: string) => void;
  completeTailorProgress?: () => void;
  resetTailorProgress?: () => void;
  
  // Toast notifications
  showToast?: (type: string, title: string, options?: any) => void;
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
  saveResume: () => Promise<boolean>;
  confirmTailorResult: () => Promise<boolean>;
  undo: () => void;
  redo: () => void;
}

export interface ConfirmTailorResultOptions {
  tailorResult: TailorResult | null;
  saveResume: () => Promise<boolean>;
  clearTailorResult: () => void;
}

export const applyTailoredResumeChanges = async ({
  tailorResult,
  saveResume,
  clearTailorResult,
}: ConfirmTailorResultOptions): Promise<boolean> => {
  if (!tailorResult) {
    return false;
  }

  // Note: The tailored content is already saved to the working draft by the backend
  // and the editor has already been reloaded with the tailored data via loadResumeById
  // This "Apply Changes" button just confirms the user wants to keep these changes
  // and clears the tailor result UI (no need to save again)
  
  clearTailorResult();
  return true;
};

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
    loadResumeById,
    tailorEditMode,
    selectedTone,
    selectedLength,
    tailorResult,
    setTailorResult,
    setIsTailoring,
    setCoverLetterDraft,
    setIsGeneratingCoverLetter,
    setPortfolioDraft,
    setIsGeneratingPortfolio,
    // AI Progress tracking (optional)
    startATSProgress,
    completeATSProgress,
    startTailorProgress,
    completeTailorProgress,
    showToast
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
    logger.debug('ATS analyzeJobDescription invoked', {
      currentResumeId,
      hasJobDescription: !!jobDescription?.trim(),
      jobDescriptionLength: jobDescription?.length ?? 0,
      isAnalyzing
    });
    if (!jobDescription.trim()) {
      return null;
    }
    const effectiveResumeId = resumeData?.id || currentResumeId;
    if (!effectiveResumeId) {
      logger.warn('ATS analysis blocked - no active resume id');
      setSaveError('Select a resume slot before running ATS analysis.');
      return null;
    }
    if (isAnalyzing) {
      return null;
    }

    setIsAnalyzing(true);
    // Start progress tracking
    startATSProgress?.('ats', 45); // 45 seconds estimated
    
    // Clear previous scores to prevent showing stale data
    setMatchScore(null);
    setMatchedKeywords([]);
    setMissingKeywords([]);
    setShowATSScore(false);
    
    try {
      const response = await apiService.runATSCheck({
        resumeId: effectiveResumeId,
        jobDescription
      });
      
      logger.debug('ATS response received', { 
        hasAnalysis: !!response?.analysis,
        overallScore: response?.analysis?.overall,
        matchedCount: response?.matchedKeywords?.length || response?.analysis?.matchedKeywords?.length || 0
      });
      
      const analysis: ATSAnalysisResult | null = response?.analysis ?? null;
      if (analysis) {
        // Ensure we have a valid overall score
        if (typeof analysis.overall !== 'number') {
          logger.error('Invalid ATS response - missing overall score', { analysis });
          throw new Error('Invalid ATS response format');
        }
        
        setMatchScore(analysis);
        setMatchedKeywords(response?.matchedKeywords ?? analysis.matchedKeywords ?? []);
        setMissingKeywords(response?.missingKeywords ?? analysis.missingKeywords ?? []);
        const actionable = analysis.actionable_tips ?? analysis.actionableTips ?? [];
        const improvements = response?.improvements ?? analysis.improvements ?? [];
        const recommendationStrings = [
          ...improvements,
          ...actionable.map((tip) => (typeof tip === 'string' ? tip : tip.action)),
        ].filter(Boolean);
        setAiRecommendations(recommendationStrings);
        setShowATSScore(true);
        
        logger.debug('ATS state updated', {
          overall: analysis.overall,
          matchedKeywords: (response?.matchedKeywords ?? analysis.matchedKeywords ?? []).length,
          missingKeywords: (response?.missingKeywords ?? analysis.missingKeywords ?? []).length
        });
        
        // Complete progress and show success toast
        completeATSProgress?.();
        showToast?.('success', 'ATS Check Complete!', {
          message: `Score: ${analysis.overall}/100`,
          duration: 5000
        });
      }
      return response;
    } catch (error) {
      // Complete progress on error
      completeATSProgress?.();
      logger.error('ATS analysis failed', { error });
      const friendlyError = formatErrorForDisplay(error, {
        action: 'analyzing job description',
        feature: 'ATS analysis'
      });
      setSaveError(friendlyError);
      // Clear scores on error
      setMatchScore(null);
      setShowATSScore(false);
      
      // Show error toast
      showToast?.('error', 'ATS Check Failed', {
        message: friendlyError,
        duration: 7000
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    jobDescription,
    currentResumeId,
    resumeData,
    isAnalyzing,
    startATSProgress,
    completeATSProgress,
    showToast,
    setIsAnalyzing,
    setMatchScore,
    setMatchedKeywords,
    setMissingKeywords,
    setAiRecommendations,
    setShowATSScore,
    setSaveError
  ]);

  const applyAIRecommendations = useCallback(async () => {
    const effectiveResumeId = resumeData?.id || currentResumeId;
    if (!effectiveResumeId) {
      setSaveError('Select an active resume before applying recommendations.');
      return null;
    }
    if (!jobDescription.trim()) {
      setSaveError('Provide a job description before applying recommendations.');
      return null;
    }

    try {
      const response = await apiService.applyAIRecommendations({
        resumeId: effectiveResumeId,
        jobDescription,
        focusAreas: aiRecommendations?.length ? ['summary', 'experience', 'skills'] : undefined,
        tone: writingTone
      });
      if (response?.updatedResume && applyBaseResume) {
        applyBaseResume(response.updatedResume as BaseResumeRecord);
      }
      setAiRecommendations(response?.appliedRecommendations ?? []);
      if (response?.ats?.after) {
        const afterAnalysis = response.ats.after as ATSAnalysisResult;
        setMatchScore(afterAnalysis);
        setMatchedKeywords(afterAnalysis.matchedKeywords ?? []);
        setMissingKeywords(afterAnalysis.missingKeywords ?? []);
        setShowATSScore(true);
      } else if (typeof response?.atsScoreAfter === 'number') {
        setMatchScore((prev) => buildATSFromScore(response.atsScoreAfter as number, prev));
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
    resumeData,
    aiRecommendations,
    writingTone,
    applyBaseResume,
    setAiRecommendations,
    setMatchScore,
    setShowATSScore,
    setSaveError
  ]);

  const tailorResumeForJob = useCallback(async () => {
    const effectiveResumeId = resumeData?.id || currentResumeId;
    if (!effectiveResumeId) {
      setSaveError('Select an active resume before tailoring.');
      return null;
    }
    if (!jobDescription.trim()) {
      setSaveError('Provide a job description before tailoring your resume.');
      return null;
    }

    setTailorResult(null);
    setIsTailoring(true);
    // Start progress tracking (longer for FULL mode)
    const isFullMode = tailorEditMode?.toUpperCase() === 'FULL';
    startTailorProgress?.('tailor', isFullMode ? 60 : 45); // 60s for FULL, 45s for PARTIAL
    
    try {
      const response = await apiService.tailorResume({
        resumeId: effectiveResumeId,
        jobDescription,
        mode: isFullMode ? 'FULL' : 'PARTIAL',
        tone: selectedTone,
        length: selectedLength
      });

      if (response?.tailoredResume) {
        // Convert tailored resume to editor format (for TailorResult only)
        const tailoredEditorData = normalizedDataToResumeData(response.tailoredResume as any);
        const merged = mergeTailoredResume(resumeData, tailoredEditorData);
        const mergedResume = removeDuplicateResumeEntries(merged).data;
        
        // DON'T call setResumeData() - we'll force a full reload from backend instead
        // This ensures the editor shows the exact data that was saved to the database
        
        const result: TailorResult = {
          tailoredResume: mergedResume,
          diff: Array.isArray(response.diff) ? response.diff : [],
          warnings: Array.isArray(response.warnings) ? response.warnings : [],
          recommendedKeywords: Array.isArray(response.recommendedKeywords) ? response.recommendedKeywords : [],
          ats: response.ats ?? null,
          confidence: typeof response.confidence === 'number' ? response.confidence : null,
          mode: response.tailoredVersion?.mode ?? (tailorEditMode?.toUpperCase() === 'FULL' ? 'FULL' : 'PARTIAL'),
          tailoredVersionId: response.tailoredVersion?.id
        };
        setTailorResult(result);

        setAiRecommendations(Array.isArray(response.recommendedKeywords) ? response.recommendedKeywords : []);
        const afterAnalysis = response.ats?.after as ATSAnalysisResult | undefined;
        if (afterAnalysis) {
          setMatchScore(afterAnalysis);
          setMatchedKeywords(afterAnalysis.matchedKeywords ?? response.recommendedKeywords ?? []);
          setMissingKeywords(afterAnalysis.missingKeywords ?? []);
          setShowATSScore(true);
        } else if (typeof response.atsScoreAfter === 'number') {
          setMatchScore((prev) => buildATSFromScore(response.atsScoreAfter as number, prev));
          setShowATSScore(true);
        }
        
        // Complete progress and show success toast
        completeTailorProgress?.();
        const beforeScore = response.ats?.before?.overall || response.atsScoreBefore || 0;
        const afterScore = afterAnalysis?.overall || response.atsScoreAfter || 0;
        const improvement = afterScore - beforeScore;
        showToast?.('success', 'Resume Tailored!', {
          message: `Score improved from ${beforeScore} to ${afterScore} (+${improvement} points)`,
          duration: 7000
        });
        
        // Force a complete reload from the backend
        console.log('🔄 [TAILOR] Force reloading resume data from backend after tailoring...');
        console.log('🔄 [TAILOR] Resume ID:', effectiveResumeId);
        
        // Directly call loadResumeById to force a fresh fetch from the backend
        // This bypasses the useEffect guard that prevents reloading the same resume
        try {
          await loadResumeById(effectiveResumeId);
          console.log('✅ [TAILOR] Resume reloaded successfully from backend!');
        } catch (reloadError) {
          console.error('❌ [TAILOR] Failed to reload resume:', reloadError);
        }
      }

      return response;
    } catch (error) {
      // Complete progress on error
      completeTailorProgress?.();
      logger.error('Failed to tailor resume', { error });
      const friendlyError = formatErrorForDisplay(error, {
        action: 'tailoring resume',
        feature: 'resume tailoring'
      });
      setSaveError(friendlyError);
      
      // Show error toast
      showToast?.('error', 'Tailoring Failed', {
        message: friendlyError,
        duration: 7000
      });
      return null;
    } finally {
      setIsTailoring(false);
    }
  }, [
    currentResumeId,
    jobDescription,
    resumeData,
    tailorEditMode,
    selectedTone,
    selectedLength,
    resumeData,
    setResumeData,
    setHasChanges,
    setTailorResult,
    setAiRecommendations,
    setMatchScore,
    setShowATSScore,
    setSaveError,
    setIsTailoring,
    startTailorProgress,
    completeTailorProgress,
    showToast
  ]);

  const generateCoverLetterDraft = useCallback(async () => {
    const effectiveResumeId = resumeData?.id || currentResumeId;
    if (!effectiveResumeId) {
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
        resumeId: effectiveResumeId,
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
    resumeData,
    selectedTone,
    setCoverLetterDraft,
    setSaveError,
    setIsGeneratingCoverLetter
  ]);

  const generatePortfolioDraft = useCallback(async () => {
    const effectiveResumeId = resumeData?.id || currentResumeId;
    if (!effectiveResumeId) {
      setSaveError('Select an active resume before generating a portfolio outline.');
      return null;
    }

    setPortfolioDraft(null);
    setIsGeneratingPortfolio(true);
    try {
      const response = await apiService.generatePortfolio({
        resumeId: effectiveResumeId,
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
    resumeData,
    selectedTone,
    setPortfolioDraft,
    setSaveError,
    setIsGeneratingPortfolio
  ]);

  const saveResume = useCallback(async (): Promise<boolean> => {
    if (isSaving) {
      return false;
    }

    if (!hasChanges && currentResumeId) {
      setSaveError(null);
      setLastSavedAt(new Date());
      setHasChanges(false);
      return true;
    }

    // Pre-save validation
    const validation = validateResumeData(resumeData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      setSaveError(`Validation failed: ${errorMessages}. Please fix these errors before saving.`);
      logger.warn('Resume save validation failed:', validation.errors);
      return false;
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
      return true;
    } catch (error: any) {
      logger.error('Failed to save resume:', error);
      const friendlyError = formatErrorForDisplay(error, {
        action: 'saving resume',
        feature: 'resume builder',
      });
      setSaveError(friendlyError);
      return false;
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

  const confirmTailorResult = useCallback(() => {
    return applyTailoredResumeChanges({
      tailorResult,
      saveResume,
      clearTailorResult: () => setTailorResult(null),
    });
  }, [tailorResult, saveResume, setTailorResult]);

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
    confirmTailorResult,
    undo,
    redo,
  };
}

