'use client';

import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import type { SetStateAction } from 'react';
import dynamic from 'next/dynamic';

// Critical components - load immediately
import Sidebar from '../../components/layout/SidebarNew';
import Header from '../../components/layout/HeaderNew';
import DashboardHeader from '../../components/layout/DashboardHeader';
import PageHeader from '../../components/layout/PageHeader';

// Lazy load all heavy components to prevent blocking startup
const DashboardFigma = dynamic(() => import('../../components/DashboardFigma'), { ssr: false });
const Profile = dynamic(() => import('../../components/Profile'), { ssr: false });
const CloudStorage = dynamic(() => import('../../components/CloudStorage'), { ssr: false });
const ResumeEditor = dynamic(() => import('../../components/features/ResumeEditor').then(mod => ({ default: mod.default })), { 
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-400">Loading Resume Editor...</p>
      </div>
    </div>
  )
});
const AIPanel = dynamic(() => import('../../components/features/AIPanel'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-4"><div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>
});
const Templates = dynamic(() => import('../../components/Templates'), { ssr: false });
const JobTracker = dynamic(() => import('../../components/JobTracker'), { ssr: false });
const Discussion = dynamic(() => import('../../components/Discussion'), { ssr: false });
const Email = dynamic(() => import('../../components/Email'), { ssr: false });
const CoverLetterGenerator = dynamic(() => import('../../components/CoverLetterGenerator'), { ssr: false });
const PortfolioGenerator = dynamic(() => import('../../components/portfolio-generator/AIPortfolioBuilder'), { ssr: false });
import {
  ResumeData,
  CustomSection,
  SectionVisibility,
  CustomField
} from '../../types/resume';
import type { BaseResumeRecord } from '../../utils/resumeMapper';
import { useResumeData } from '../../hooks/useResumeData';
import { useBaseResumes } from '../../hooks/useBaseResumes';
import { useModals } from '../../hooks/useModals';
import { useAI } from '../../hooks/useAI';
import { useResumeApplyIndicator } from '../../hooks/useResumeApplyIndicator';
// Keep utils lazy - import only when actually needed
import { resumeHelpers } from '../../utils/resumeHelpers';
import { aiHelpers } from '../../utils/aiHelpers';
import { resumeTemplates } from '../../data/templates';
import { logger } from '../../utils/logger';
import { Loading } from '../../components/Loading';
import { useToasts, ToastContainer } from '../../components/Toast';
import { apiService } from '../../services/apiService';
import { useAIProgress } from '../../hooks/useAIProgress';
import { ConflictIndicator } from '../../components/ConflictIndicator';
import { DraftStatusIndicator } from '../../components/features/ResumeEditor/DraftStatusIndicator';
import { DraftDiffViewer } from '../../components/features/ResumeEditor/DraftDiffViewer';
import { PlusCircle, Upload, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
// Lazy load heavy analytics and modal components
const CoverLetterAnalytics = dynamic(() => import('../../components/CoverLetterAnalytics'), { ssr: false });
const EmailAnalytics = dynamic(() => import('../../components/email/EmailAnalytics'), { ssr: false });
const ApplicationAnalytics = dynamic(() => import('../../components/ApplicationAnalytics'), { ssr: false });

// Modals are now loaded in DashboardModals component

import { useTheme } from '../../contexts/ThemeContext';
import ErrorBoundary from '../../components/ErrorBoundary';
// Import dashboard constants
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_ADDED_TEMPLATES,
  DEFAULT_SIDEBAR_STATE,
  DEFAULT_PANEL_STATE,
  DEFAULT_PREVIEW_MODE,
  type DashboardTab,
} from './constants/dashboard.constants';
// Import dashboard helpers
import {
  getDashboardTabTitle,
  getDashboardTabSubtitle,
  getDashboardTabIcon,
  getDashboardTabIconColor,
  shouldHidePageHeader,
} from './utils/dashboardHelpers';
import { ResumePreview } from './components/ResumePreview';
import { CustomSectionEditor } from './components/CustomSectionEditor';
import { DashboardModals } from './components/DashboardModals';
// Import dashboard hooks
import { useDashboardUI } from './hooks/useDashboardUI';
import { useDashboardTemplates } from './hooks/useDashboardTemplates';
import { useDashboardCloudStorage } from './hooks/useDashboardCloudStorage';
import { useDashboardAnalytics } from './hooks/useDashboardAnalytics';
import { useDashboardTabChange } from './hooks/useDashboardTabChange';
import { useDashboardHandlers } from './hooks/useDashboardHandlers';
import { useDashboardExport } from './hooks/useDashboardExport';
import { useDashboardCloudSave } from './hooks/useDashboardCloudSave';

// Lazy load sections (only when Resume Editor is active) - use named exports from index
const SummarySection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.SummarySection })), { ssr: false });
const SkillsSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.SkillsSection })), { ssr: false });
const ExperienceSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.ExperienceSection })), { ssr: false });
const EducationSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.EducationSection })), { ssr: false });
const ProjectsSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.ProjectsSection })), { ssr: false });
const CertificationsSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.CertificationsSection })), { ssr: false });

interface DashboardPageClientProps {
  initialTab: DashboardTab;
}

export default function DashboardPageClient({ initialTab }: DashboardPageClientProps) {
  // Use custom hooks for state management
  const {
    showNewResumeModal,
    setShowNewResumeModal,
    showAddSectionModal,
    setShowAddSectionModal,
    newSectionName,
    setNewSectionName,
    newSectionContent,
    setNewSectionContent,
    showExportModal,
    setShowExportModal,
    showImportModal,
    setShowImportModal,
    importMethod,
    setImportMethod,
    importJsonData,
    setImportJsonData,
    showAddFieldModal,
    setShowAddFieldModal,
    newFieldName,
    setNewFieldName,
    newFieldIcon,
    setNewFieldIcon,
    customFields,
    setCustomFields: setCustomFieldsBase,
    showAIGenerateModal,
    setShowAIGenerateModal,
    aiGenerateSection,
    setAiGenerateSection,
    aiPrompt,
    setAiPrompt,
    writingTone,
    setWritingTone,
    contentLength,
    setContentLength,
    showMobileMenu,
    setShowMobileMenu,
  } = useModals();
  const aiHook = useAI();
  const { theme } = useTheme();
  const colors = theme.colors;
  const initializingCustomFieldsRef = useRef(false);
  
  // Dashboard-specific state hooks
  const dashboardUI = useDashboardUI(initialTab);
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    resumePanelCollapsed,
    setResumePanelCollapsed,
    showRightPanel,
    setShowRightPanel,
    previousSidebarState,
    setPreviousSidebarState,
    previousMainSidebarState,
    setPreviousMainSidebarState,
    isPreviewMode,
    setIsPreviewMode,
  } = dashboardUI;

  const dashboardTemplates = useDashboardTemplates();
  const {
    selectedTemplateId,
    setSelectedTemplateId,
    addedTemplates,
    setAddedTemplates,
  } = dashboardTemplates;

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToasts();

  // AI Progress tracking
  const atsProgressHook = useAIProgress();
  const tailorProgressHook = useAIProgress();

  const {
    state: resumeApplyState,
    message: resumeApplyMessage,
    onApplyStart: handleApplyStartIndicator,
    onApplySuccess: handleApplySuccessIndicator,
    onApplyError: handleApplyErrorIndicator,
    onApplyComplete: handleApplyCompleteIndicator,
  } = useResumeApplyIndicator();

  const handleResumeLoaded = useCallback(({ resume, snapshot }: { resume: any; snapshot: { customFields?: CustomField[] } }) => {
    initializingCustomFieldsRef.current = true;
    try {
      setCustomFieldsBase(snapshot.customFields ?? []);
    } finally {
      initializingCustomFieldsRef.current = false;
    }
    setSelectedTemplateId(resume?.templateId ?? null);
  }, [setCustomFieldsBase, setSelectedTemplateId]);

  const handleActiveResumeChange = useCallback(async (id: string | null) => {
    if (id) {
      setCurrentResumeId(id);
      // Load the active resume data into the editor
      // Note: we can't call loadResumeById here because resumeDataHook hasn't been initialized yet
      // The active resume will be loaded by the useEffect below that watches activeId
    }
  }, []);

  const resumeHook = useBaseResumes({
    onActiveChange: handleActiveResumeChange
  });

  const {
    resumes,
    activeId,
    limits,
    isLoading: isLoadingResumes,
    error: resumeError,
    createResume: createBaseResume,
    activateResume,
    deleteResume: deleteBaseResume,
    refresh: refreshBaseResumes,
    setActiveId: setLocalActiveBaseResumeId,
    upsertResume: upsertBaseResume
  } = resumeHook;

  // Memoize maxSlots to prevent unnecessary re-renders
  const maxSlots = useMemo(() => limits?.maxSlots ?? 1, [limits?.maxSlots]);

  const resumeDataHook = useResumeData({ onResumeLoaded: handleResumeLoaded });

  const dashboardCloudStorage = useDashboardCloudStorage();
  const {
    showSaveToCloudModal,
    setShowSaveToCloudModal,
    showImportFromCloudModal,
    setShowImportFromCloudModal,
    cloudResumes,
    setCloudResumes,
    handleSaveToCloud,
    handleImportFromCloud,
  } = dashboardCloudStorage;

  const dashboardAnalytics = useDashboardAnalytics();
  const {
    showCoverLetterAnalytics,
    setShowCoverLetterAnalytics,
    showEmailAnalytics,
    setShowEmailAnalytics,
    showApplicationAnalytics,
    setShowApplicationAnalytics,
  } = dashboardAnalytics;

  // Tab change handler
  const { handleTabChange } = useDashboardTabChange(setActiveTab);

  // Destructure hooks for easier access
  const {
    resumeFileName, setResumeFileName,
    currentResumeId, setCurrentResumeId,
    isLoading: resumeLoading,
    hasChanges, setHasChanges,
    isSaving, setIsSaving,
    saveError,
    setSaveError,
    lastSavedAt, setLastSavedAt,
    lastServerUpdatedAt, setLastServerUpdatedAt,
    hasConflict,
    setHasConflict,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    lineSpacing, setLineSpacing,
    sectionSpacing, setSectionSpacing,
    margins, setMargins,
    headingStyle, setHeadingStyle,
    bulletStyle, setBulletStyle,
    resumeData, setResumeData,
    sectionOrder, setSectionOrder,
    sectionVisibility, setSectionVisibility,
    customSections, setCustomSections,
    history, setHistory,
    historyIndex, setHistoryIndex,
    loadResumeById,
    applyBaseResume,
    // 🎯 NEW: Draft management
    commitDraft,
    discardDraft,
    getDraftStatus,
  } = resumeDataHook;
  const enforcedVisibilityRef = useRef<string | null>(null);

  useEffect(() => {
    const resumeKey = currentResumeId || '__default__';
    if (enforcedVisibilityRef.current !== resumeKey) {
      enforcedVisibilityRef.current = resumeKey;
      const hasHidden = Object.values(sectionVisibility || {}).some((visible) => visible === false);
      if (hasHidden) {
        setSectionVisibility((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            next[key] = true;
          });
          return next;
        });
      }
    }
  }, [currentResumeId, sectionVisibility, setSectionVisibility]);

  // ❌ REMOVED: Don't show toast for save errors
  // Auto-save should be silent - validation errors shouldn't block saving
  // useEffect(() => {
  //   if (saveError) {
  //     showToast(saveError, 'error', 8000);
  //   }
  // }, [saveError, showToast]);

  // 🎯 NEW: Draft state management
  const [hasDraft, setHasDraft] = React.useState(false);
  const [showDiffViewer, setShowDiffViewer] = React.useState(false);
  const [baseResumeData, setBaseResumeData] = React.useState<any>(null);
  const [isOnline, setIsOnline] = React.useState(true);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set hasDraft immediately when changes are made
  useEffect(() => {
    if (hasChanges && currentResumeId) {
      console.log('📋 [DRAFT] Changes detected, setting hasDraft to true');
      setHasDraft(true);
    }
  }, [hasChanges, currentResumeId]);

  // Check draft status on mount and periodically (but not on every change)
  useEffect(() => {
    const checkDraft = async () => {
      if (!currentResumeId || activeTab !== 'editor') {
        console.log('📋 [DRAFT] No draft - no resume ID or not on editor tab', { currentResumeId, activeTab });
        setHasDraft(false);
        return;
      }
      
      try {
        const status = await getDraftStatus();
        console.log('📋 [DRAFT] Draft status checked:', { 
          hasDraft: status?.hasDraft, 
          currentResumeId,
          status 
        });
        // Only update if we don't already have local changes
        if (!hasChanges) {
          setHasDraft(status?.hasDraft || false);
        }
      } catch (error) {
        // Silently fail - resume might have been deleted
        logger.debug('Draft status check failed (resume may be deleted)', { currentResumeId });
        console.log('📋 [DRAFT] Draft check failed:', error);
        // Don't change hasDraft if we have local changes
        if (!hasChanges) {
          setHasDraft(false);
        }
      }
    };
    
    checkDraft();
    
    // Re-check every 10 seconds (increased from 5), but only when on editor tab
    const interval = setInterval(checkDraft, 10000);
    return () => clearInterval(interval);
  }, [currentResumeId, getDraftStatus, activeTab]);

  // Draft handlers
  const handleCommitDraft = useCallback(async () => {
    try {
      const result = await commitDraft();
      if (result?.success) {
        showToast('Resume saved successfully!', 'success', 4000);
        setHasDraft(false);
      } else {
        showToast(result?.error || 'Failed to save resume', 'error', 6000);
      }
    } catch (error) {
      logger.error('Failed to commit draft', error);
      showToast('Failed to save resume', 'error', 6000);
    }
  }, [commitDraft, showToast]);

  const handleDiscardDraft = useCallback(async () => {
    if (!currentResumeId) {
      logger.warn('🎯 handleDiscardDraft: No current resume ID');
      return;
    }
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      '⚠️ Discard Draft?\n\n' +
      'This will permanently delete your draft and revert to the base resume.\n' +
      'This action cannot be undone.\n\n' +
      'Click OK to discard, or Cancel to keep your draft.'
    );
    
    if (!confirmed) {
      logger.info('🎯 handleDiscardDraft: User cancelled');
      return;
    }
    
    try {
      logger.info('🎯 handleDiscardDraft: User confirmed, discarding draft');
      const result = await discardDraft();
      if (result?.success) {
        showToast('Draft discarded, reverted to base resume', 'success', 4000);
        setHasDraft(false);
      } else {
        showToast(result?.error || 'Failed to discard draft', 'error', 6000);
      }
    } catch (error) {
      logger.error('❌ handleDiscardDraft: Failed to discard draft', error);
      showToast('Failed to discard draft', 'error', 6000);
    }
  }, [currentResumeId, discardDraft, showToast]);

  const handleConfirmDiscardDraft = useCallback(async () => {
    try {
      logger.info('🎯 handleConfirmDiscardDraft: User confirmed discard');
      const result = await discardDraft();
      if (result?.success) {
        showToast('Draft discarded, reverted to base resume', 'success', 4000);
        setHasDraft(false);
        setShowDiffViewer(false); // Close the diff viewer
      } else {
        showToast(result?.error || 'Failed to discard draft', 'error', 6000);
      }
    } catch (error) {
      logger.error('❌ handleConfirmDiscardDraft: Failed to discard draft', error);
      showToast('Failed to discard draft', 'error', 6000);
    }
  }, [discardDraft, showToast]);

  // Load resume data when active base resume changes
  // Use ref to track ongoing load to prevent race conditions
  const loadingResumeIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!activeId) {
      setCurrentResumeId(null);
      loadingResumeIdRef.current = null;
      return;
    }

    // Skip if we're already loading this resume or it's already loaded
    if (loadingResumeIdRef.current === activeId || currentResumeId === activeId) {
      return;
    }

    // Mark as loading to prevent concurrent loads
    loadingResumeIdRef.current = activeId;
    setCurrentResumeId(activeId);

    loadResumeById(activeId)
      .then(() => {
        // Success - clear loading ref
        if (loadingResumeIdRef.current === activeId) {
          loadingResumeIdRef.current = null;
        }
      })
      .catch((error: unknown) => {
        logger.error('Failed to load active resume', error);
        showToast('Failed to load selected resume', 'error', 6000);
        // Clear loading ref on error
        if (loadingResumeIdRef.current === activeId) {
          loadingResumeIdRef.current = null;
        }
      });
  }, [activeId, currentResumeId, setCurrentResumeId, loadResumeById, showToast]);

  const setCustomFieldsTracked = useCallback((value: SetStateAction<CustomField[]>) => {
    setCustomFieldsBase((prev) => {
      const next = typeof value === 'function' ? (value as (prev: CustomField[]) => CustomField[])(prev) : value;
      if (!initializingCustomFieldsRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setCustomFieldsBase, setHasChanges, setSaveError]);

  const handleCreateBaseResume = useCallback(async () => {
    if (resumes.length >= maxSlots) {
      showToast(`You've reached your plan limit of ${maxSlots} base resumes. Delete one or upgrade to add more slots.`, 'error', 6000);
      return false;
    }

    try {
      const created = await createBaseResume({});
      if (created?.id) {
        await activateResume(created.id);
      }
      showToast('Created a new base resume slot', 'success', 4000);
      return true;
    } catch (error: any) {
      logger.error('Failed to create base resume', error);
      const message = error?.meta?.maxSlots
        ? `You have reached the limit of ${error.meta.maxSlots} base resumes for your plan.`
        : error?.response?.data?.error || error?.message || 'Failed to create base resume';
      showToast(message, 'error', 6000);
      return false;
    }
  }, [resumes.length, maxSlots, createBaseResume, activateResume, showToast]);

  const handleActivateBaseResume = useCallback(async (id: string) => {
    try {
      await activateResume(id);
      showToast('Active resume updated', 'success', 3000);
    } catch (error: any) {
      logger.error('Failed to activate base resume', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to activate resume';
      showToast(message, 'error', 6000);
    }
  }, [activateResume, showToast]);

  const handleDeleteBaseResume = useCallback(async (id: string) => {
    try {
      await deleteBaseResume(id);
      showToast('Base resume deleted', 'success', 3000);
    } catch (error: any) {
      logger.error('Failed to delete base resume', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to delete resume';
      showToast(message, 'error', 6000);
    }
  }, [deleteBaseResume, showToast]);

  const handleResumeUpload = useCallback(async (file: File) => {
    if (resumes.length >= maxSlots) {
      showToast(`All ${maxSlots} base resume slots are filled. Delete an existing resume to import a new one.`, 'error', 6000);
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resumes/parse', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to parse resume');
      }

      const result = await response.json();
      if (!result?.success || !result?.structuredResume) {
        throw new Error(result?.error || 'Failed to parse resume');
      }

      const created = await createBaseResume({
        name: file.name.replace(/\.[^/.]+$/, ''),
        data: result.structuredResume,
        metadata: {
          parseConfidence: result.confidence,
          parseMethod: result.method,
          fileHash: result.fileHash
        }
      });

      if (created?.id) {
        await activateResume(created.id);
      }

      showToast('Resume uploaded and parsed successfully', 'success', 4000);
      setShowImportModal(false);
      return true;
    } catch (error: any) {
      logger.error('Failed to import resume', error);
      const message = error?.message || 'Failed to import resume';
      showToast(message, 'error', 6000);
      return false;
    }
  }, [resumes.length, maxSlots, createBaseResume, activateResume, showToast, setShowImportModal]);

  const handleOpenImportModal = useCallback(() => {
    // Always open the modal; slot gating is handled inside the modal by disabling actions
    setShowImportModal(true);
  }, [setShowImportModal]);

  const handleImportFromCloudWithSlotCheck = useCallback(() => {
    if (resumes.length >= maxSlots) {
      showToast(`All ${maxSlots} base resume slots are filled. Delete an existing resume or upgrade your plan to import from cloud.`, 'error', 6000);
      return;
    }
    handleImportFromCloud();
  }, [resumes.length, maxSlots, handleImportFromCloud, showToast]);

  const {
    aiMode, setAiMode,
    jobDescription, setJobDescription,
    isAnalyzing, setIsAnalyzing,
    matchScore, setMatchScore,
    showATSScore, setShowATSScore,
    matchedKeywords, setMatchedKeywords,
    missingKeywords, setMissingKeywords,
    aiRecommendations, setAiRecommendations,
    tailorEditMode, setTailorEditMode,
    selectedTone, setSelectedTone,
    selectedLength, setSelectedLength,
    tailorResult, setTailorResult,
    isTailoring, setIsTailoring,
    coverLetterDraft, setCoverLetterDraft,
    resetTailoringPreferences,
    isGeneratingCoverLetter, setIsGeneratingCoverLetter,
    portfolioDraft, setPortfolioDraft,
    isGeneratingPortfolio, setIsGeneratingPortfolio
  } = aiHook;

  // Save changes to history when resumeData changes
  useEffect(() => {
    if (historyIndex === history.length - 1) {
      // Only save to history if we're at the latest state (not during undo/redo)
      resumeHelpers.saveToHistory(resumeData, history, historyIndex, setHistory, setHistoryIndex);
    }
  }, [resumeData]);

  // Dashboard handlers hook
  const dashboardHandlers = useDashboardHandlers({
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
    setCustomFields: setCustomFieldsTracked,
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
    // AI Progress tracking
    atsProgress: atsProgressHook.progress,
    startATSProgress: atsProgressHook.startProgress,
    updateATSProgress: atsProgressHook.updateProgress,
    completeATSProgress: atsProgressHook.completeProgress,
    resetATSProgress: atsProgressHook.resetProgress,
    tailorProgress: tailorProgressHook.progress,
    startTailorProgress: tailorProgressHook.startProgress,
    updateTailorProgress: tailorProgressHook.updateProgress,
    completeTailorProgress: tailorProgressHook.completeProgress,
    resetTailorProgress: tailorProgressHook.resetProgress,
    // Toast notifications
    showToast,
    // UI state
    setShowRightPanel,
    setShowDiffBanner: aiHook.setShowDiffBanner
  });

  const {
    toggleSection,
    moveSection,
    generateSmartFileName,
    resetToDefault,
    addCustomSection,
    deleteCustomSection,
    updateCustomSection,
    addCustomField,
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
  } = dashboardHandlers;

  // Dashboard export hook
  const { handleExport } = useDashboardExport({
    resumeFileName,
    resumeData,
    customSections,
    sectionOrder,
    sectionVisibility,
    selectedTemplateId,
    fontFamily,
    fontSize,
    lineSpacing,
    setShowImportModal,
    setResumeData,
    setCustomSections,
    setResumeFileName,
    setFontFamily,
    setFontSize,
    setLineSpacing,
    setSectionSpacing,
    setMargins,
    setHeadingStyle,
    setBulletStyle,
  });

  // Dashboard cloud save hook
  const { handleConfirmSaveToCloud, handleLoadFromCloud } = useDashboardCloudSave({
    resumeData,
    customSections,
    resumeFileName,
    fontFamily,
    fontSize,
    lineSpacing,
    sectionSpacing,
    margins,
    headingStyle,
    bulletStyle,
    setResumeData,
    setCustomSections,
    setResumeFileName,
    setFontFamily,
    setFontSize,
    setLineSpacing,
    setSectionSpacing,
    setMargins,
    setHeadingStyle,
    setBulletStyle,
    setShowSaveToCloudModal,
    setShowImportFromCloudModal,
  });


  // Memoize renderSection to prevent unnecessary re-renders in ResumeEditor
  const renderSection = useCallback((section: string) => {
    if (!sectionVisibility[section]) return null;

    // Handle custom sections
    const customSection = customSections.find(s => s.id === section);
    if (customSection) {
      return (
        <CustomSectionEditor
          customSection={customSection}
          sectionVisibility={sectionVisibility}
          colors={colors}
          onHide={hideSection}
          onDelete={deleteCustomSection}
          onUpdate={updateCustomSection}
          onAIGenerate={openAIGenerateModal}
        />
      );
    }

    // Use extracted section components
    switch (section) {
      case 'summary':
        return (
          <SummarySection
            resumeData={resumeData}
            setResumeData={setResumeData}
            sectionVisibility={sectionVisibility}
            onHideSection={hideSection}
            onOpenAIGenerateModal={openAIGenerateModal}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            resumeData={resumeData}
            setResumeData={setResumeData}
            sectionVisibility={sectionVisibility}
            onHideSection={hideSection}
            onOpenAIGenerateModal={openAIGenerateModal}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            resumeData={resumeData}
            setResumeData={setResumeData}
            sectionVisibility={sectionVisibility}
            onHideSection={hideSection}
            onOpenAIGenerateModal={openAIGenerateModal}
          />
        );
      case 'education':
        return (
          <EducationSection
            resumeData={resumeData}
            setResumeData={setResumeData}
            sectionVisibility={sectionVisibility}
            onHideSection={hideSection}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            resumeData={resumeData}
            setResumeData={setResumeData}
            sectionVisibility={sectionVisibility}
            onHideSection={hideSection}
            onOpenAIGenerateModal={openAIGenerateModal}
          />
        );
      case 'certifications':
        return (
          <CertificationsSection
            resumeData={resumeData}
            setResumeData={setResumeData}
            sectionVisibility={sectionVisibility}
            onHideSection={hideSection}
          />
        );
      default:
        return null;
    }
  }, [sectionVisibility, customSections, colors, resumeData, setResumeData, hideSection, deleteCustomSection, updateCustomSection, openAIGenerateModal]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'storage':
        return <CloudStorage />;
      case 'editor':
        // Show loading state only on initial load, not on subsequent updates
        if (resumeLoading && !currentResumeId && resumes.length === 0) {
          return <Loading text="Loading Resume Editor..." />;
        }
        
        try {
          const resumeContent = isPreviewMode ? (
          <ResumePreview
            resumeFileName={resumeFileName}
            resumeData={resumeData}
            sectionOrder={sectionOrder}
            sectionVisibility={sectionVisibility}
            selectedTemplateId={selectedTemplateId || DEFAULT_TEMPLATE_ID}
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineSpacing={lineSpacing}
            sectionSpacing={sectionSpacing}
            margins={margins}
            headingStyle={headingStyle}
            bulletStyle={bulletStyle}
            onExitPreview={() => setIsPreviewMode(false)}
          />
        ) : (
          <ResumeEditor
            resumeFileName={resumeFileName}
            setResumeFileName={setResumeFileName}
            sectionOrder={sectionOrder}
            sectionVisibility={sectionVisibility}
            customSections={customSections}
            resumeData={resumeData}
            setResumeData={setResumeData}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            lineSpacing={lineSpacing}
            setLineSpacing={setLineSpacing}
            sectionSpacing={sectionSpacing}
            setSectionSpacing={setSectionSpacing}
            margins={margins}
            setMargins={setMargins}
            headingStyle={headingStyle}
            setHeadingStyle={setHeadingStyle}
            bulletStyle={bulletStyle}
            setBulletStyle={setBulletStyle}
            onToggleSection={toggleSection}
            onMoveSection={moveSection}
            onShowAddSectionModal={() => setShowAddSectionModal(true)}
            onGenerateSmartFileName={generateSmartFileName}
            onResetToDefault={resetToDefault}
            renderSection={renderSection}
            setShowAddFieldModal={setShowAddFieldModal}
            customFields={customFields}
            setCustomFields={setCustomFieldsTracked}
            // Diff highlighting
            showDiffBanner={aiHook.showDiffBanner}
            diffChanges={aiHook.tailorResult?.diffChanges}
            showDiffHighlighting={aiHook.showDiffHighlighting}
            onToggleDiffHighlighting={() => aiHook.setShowDiffHighlighting(!aiHook.showDiffHighlighting)}
            onCloseDiffBanner={() => aiHook.setShowDiffBanner(false)}
            onApplyDiffChanges={handleCommitDraft}
            atsScoreImprovement={
              aiHook.tailorResult?.ats?.before && aiHook.tailorResult?.ats?.after
                ? {
                    before: aiHook.tailorResult.ats.before.overall,
                    after: aiHook.tailorResult.ats.after.overall,
                    improvement: aiHook.tailorResult.ats.after.overall - aiHook.tailorResult.ats.before.overall,
                  }
                : undefined
            }
            selectedTemplateId={selectedTemplateId || DEFAULT_TEMPLATE_ID}
            onTemplateApply={(templateId) => {
              // Apply template styling
              setSelectedTemplateId(templateId);
              const template = resumeTemplates.find(t => t.id === templateId);
              if (template) {
                logger.debug('Applying template:', template.name);
              }
            }}
            addedTemplates={addedTemplates}
            onRemoveTemplate={(templateId) => {
              if (addedTemplates.length > 1) {
                dashboardTemplates.removeTemplate(templateId);
              } else {
                alert('You must have at least one template in the editor');
              }
            }}
            onAddTemplates={(templateIds) => {
              templateIds.forEach(id => dashboardTemplates.addTemplate(id));
              logger.debug('Templates added to editor:', templateIds);
            }}
            onNavigateToTemplates={() => {
              handleTabChange('templates');
            }}
            onGenerateSummary={() => openAIGenerateModal('summary')}
            onOpenAIGenerateModal={openAIGenerateModal}
            colors={colors}
            onToggleSidebar={() => setResumePanelCollapsed((prev) => !prev)}
            isSidebarCollapsed={resumePanelCollapsed}
            resumeLoading={resumeLoading}
          />
        );

          return resumeContent;
        } catch (error) {
          logger.error('Error rendering editor:', error);
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error loading editor. Please refresh the page.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Reload Page
                </button>
              </div>
            </div>
        );
        }
      case 'templates':
        return <Templates 
          onAddToEditor={(templateId) => {
            // Save template ID so editor can apply it
            setSelectedTemplateId(templateId);
            dashboardTemplates.addTemplate(templateId);
            logger.debug('Template added to editor:', templateId);
          }}
          addedTemplates={addedTemplates}
          onRemoveTemplate={dashboardTemplates.removeTemplate}
        />;
      case 'tracker':
      case 'jobs':
        return (
          <ErrorBoundary
            fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Error loading Job Tracker</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">
                    Refresh Page
                  </button>
                </div>
              </div>
            }
          >
            <JobTracker />
          </ErrorBoundary>
        );
      case 'discussion':
        return <Discussion />;
      case 'email':
        return <Email />;
      case 'cover-letter':
        return <CoverLetterGenerator />;
      case 'portfolio':
        return <PortfolioGenerator />;
      default:
        return <DashboardFigma onNavigateToTab={handleTabChange} />;
    }
  };

  const resumeApplyBackground =
    resumeApplyState.status === 'success'
      ? colors.successGreen
      : resumeApplyState.status === 'error'
      ? colors.errorRed
      : colors.activeBlueText;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 flex" style={{ background: colors.background }}>
        {activeTab === 'editor' && resumeApplyState.status !== 'idle' && resumeApplyMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium pointer-events-auto"
              style={{
                background: resumeApplyBackground,
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              }}
            >
              {resumeApplyState.status === 'loading' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : resumeApplyState.status === 'success' ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{resumeApplyMessage}</span>
            </div>
          </div>
        )}
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          onTabChange={handleTabChange}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Header */}
          {activeTab === 'editor' ? (
            <Header
              isMobile={false}
              isSaving={isSaving}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              lastSavedAt={lastSavedAt}
              hasChanges={hasChanges}
              hasDraft={hasDraft} // 🎯 NEW: Pass draft status
              onExport={() => setShowExportModal(true)}
              onUndo={undo}
              onRedo={redo}
              onClear={() => {
                if (confirm('Are you sure you want to clear all resume data? This action cannot be undone.')) {
                  // Clear all resume data
                  setResumeData({
                    name: '',
                    title: '',
                    email: '',
                    phone: '',
                    location: '',
                    linkedin: '', // 🔧 FIX: Added missing field
                    github: '', // 🔧 FIX: Added missing field
                    website: '', // 🔧 FIX: Added missing field
                    summary: '',
                    skills: [],
                    experience: [],
                    education: [],
                    projects: [],
                    certifications: [],
                  });
                  // Clear custom sections
                  setCustomSections([]);
                  // Reset section order to default
                  setSectionOrder(['summary', 'skills', 'experience', 'education', 'projects', 'certifications']);
                  // Reset section visibility to default (all visible)
                  setSectionVisibility({
                    summary: true,
                    skills: true,
                    experience: true,
                    education: true,
                    projects: true,
                    certifications: true,
                  });
                  // Clear history
                  setHistory([{
                    name: '',
                    title: '',
                    email: '',
                    phone: '',
                    location: '',
                    linkedin: '', // 🔧 FIX: Added missing field
                    github: '', // 🔧 FIX: Added missing field
                    website: '', // 🔧 FIX: Added missing field
                    summary: '',
                    skills: [],
                    experience: [],
                    education: [],
                    projects: [],
                    certifications: [],
                  }]);
                  setHistoryIndex(0);
                }
              }}
              onImport={handleOpenImportModal}
              onSave={handleCommitDraft}
              onDiscardDraft={handleDiscardDraft} // 🎯 NEW: Pass discard handler
              onToggleAIPanel={() => setShowRightPanel(!showRightPanel)}
              onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
              onShowMobileMenu={() => setShowMobileMenu(true)}
              showRightPanel={showRightPanel}
              previousSidebarState={previousSidebarState}
              sidebarCollapsed={resumePanelCollapsed}
              isPreviewMode={isPreviewMode}
              setPreviousSidebarState={setPreviousSidebarState}
              setSidebarCollapsed={setResumePanelCollapsed}
              setShowRightPanel={setShowRightPanel}
              onToggleSidebar={() => setResumePanelCollapsed(!resumePanelCollapsed)}
              mainSidebarCollapsed={sidebarCollapsed}
              setMainSidebarCollapsed={setSidebarCollapsed}
              previousMainSidebarState={previousMainSidebarState}
              setPreviousMainSidebarState={setPreviousMainSidebarState}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardHeader
              onSearch={(query) => {
                // Handle search functionality - filter dashboard content
                logger.debug('Dashboard search query:', { query });
                // You can add search state here and filter the dashboard content
              }}
            />
          ) : !shouldHidePageHeader(activeTab) ? (
            <PageHeader
              title={getDashboardTabTitle(activeTab)}
              subtitle={getDashboardTabSubtitle(activeTab)}
              icon={getDashboardTabIcon(activeTab)}
              iconColor={getDashboardTabIconColor(activeTab)}
            />
          ) : null}

          {/* Main Content */}
          <div className={`flex-1 min-h-0 flex ${activeTab === 'editor' ? 'overflow-hidden' : ''}`}>
            <div className={`flex-1 min-h-0 ${activeTab === 'editor' ? 'overflow-hidden' : 'overflow-y-auto'} transition-all duration-300`}>
              {renderActiveComponent()}
                </div>

            {/* AI Panel */}
            {activeTab === 'editor' && (
              <div
                className="min-h-0 transition-all duration-300 ease-in-out"
                style={{ 
                  width: showRightPanel ? 360 : 0,
                  opacity: showRightPanel ? 1 : 0,
                  pointerEvents: showRightPanel ? 'auto' : 'none',
                  borderLeft: showRightPanel ? `1px solid ${colors.border}` : 'none',
                  background: colors.sidebarBackground,
                  overflow: 'hidden'
                }}
              >
                {showRightPanel && (
                  <div className="h-full overflow-y-auto">
                <AIPanel
                showRightPanel={showRightPanel}
                setShowRightPanel={(show) => {
                  setShowRightPanel(show);
                  if (!show) {
                    // When closing AI panel, always open the main sidebar
                    setSidebarCollapsed(false);
                  }
                }}
                aiMode={aiMode}
                setAiMode={setAiMode}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                isAnalyzing={isAnalyzing}
                matchScore={matchScore}
                showATSScore={showATSScore}
                setShowATSScore={setShowATSScore}
                matchedKeywords={matchedKeywords}
                missingKeywords={missingKeywords}
                aiRecommendations={aiRecommendations}
                setAiRecommendations={setAiRecommendations}
                tailorEditMode={tailorEditMode}
                setTailorEditMode={setTailorEditMode}
                selectedTone={selectedTone}
                setSelectedTone={setSelectedTone}
                selectedLength={selectedLength}
                setSelectedLength={setSelectedLength}
                onResetTailoringPreferences={resetTailoringPreferences}
                isMobile={false}
                resumeData={resumeData}
                onAnalyzeJobDescription={analyzeJobDescription}
                onApplyAIRecommendations={applyAIRecommendations}
                      onTailorResume={tailorResumeForJob}
                      onGenerateCoverLetter={generateCoverLetterDraft}
                      onGeneratePortfolio={generatePortfolioDraft}
                      tailorResult={tailorResult}
                      setTailorResult={setTailorResult}
                      coverLetterDraft={coverLetterDraft}
                      setCoverLetterDraft={setCoverLetterDraft}
                      portfolioDraft={portfolioDraft}
                      setPortfolioDraft={setPortfolioDraft}
                      isTailoring={isTailoring}
                      onConfirmTailorChanges={confirmTailorResult}
                      isSavingResume={isSaving}
                      isGeneratingCoverLetter={isGeneratingCoverLetter}
                      isGeneratingPortfolio={isGeneratingPortfolio}
                      atsProgress={atsProgressHook.progress}
                      tailorProgress={tailorProgressHook.progress}
                onResumeUpdate={(updatedData) => {
                  setResumeData(updatedData);
                  // Add to history for undo/redo
                  const newHistory = [...history.slice(0, historyIndex + 1), updatedData];
                  setHistory(newHistory);
                  setHistoryIndex(newHistory.length - 1);
                }}
                />
                  </div>
                )}
                </div>
            )}
          </div>
        </div>
      </div>

      {/* All Modals */}
      <DashboardModals
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        showAddSectionModal={showAddSectionModal}
        setShowAddSectionModal={setShowAddSectionModal}
        showAddFieldModal={showAddFieldModal}
        setShowAddFieldModal={setShowAddFieldModal}
        showNewResumeModal={showNewResumeModal}
        setShowNewResumeModal={setShowNewResumeModal}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        showAIGenerateModal={showAIGenerateModal}
        setShowAIGenerateModal={setShowAIGenerateModal}
        showSaveToCloudModal={showSaveToCloudModal}
        setShowSaveToCloudModal={setShowSaveToCloudModal}
        showImportFromCloudModal={showImportFromCloudModal}
        setShowImportFromCloudModal={setShowImportFromCloudModal}
        showCoverLetterAnalytics={showCoverLetterAnalytics}
        setShowCoverLetterAnalytics={setShowCoverLetterAnalytics}
        showEmailAnalytics={showEmailAnalytics}
        setShowEmailAnalytics={setShowEmailAnalytics}
        showApplicationAnalytics={showApplicationAnalytics}
        setShowApplicationAnalytics={setShowApplicationAnalytics}
        importMethod={importMethod}
        setImportMethod={setImportMethod}
        importJsonData={importJsonData}
        setImportJsonData={setImportJsonData}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        newSectionContent={newSectionContent}
        setNewSectionContent={setNewSectionContent}
        newFieldName={newFieldName}
        setNewFieldName={setNewFieldName}
        newFieldIcon={newFieldIcon}
        setNewFieldIcon={setNewFieldIcon}
        aiGenerateSection={aiGenerateSection}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        writingTone={writingTone}
        setWritingTone={setWritingTone}
        contentLength={contentLength}
        setContentLength={setContentLength}
        resumeFileName={resumeFileName}
        resumeData={resumeData}
        customSections={customSections}
        sectionOrder={sectionOrder}
        sectionVisibility={sectionVisibility}
        selectedTemplateId={selectedTemplateId}
        fontFamily={fontFamily}
        fontSize={fontSize}
        lineSpacing={lineSpacing}
        sectionSpacing={sectionSpacing}
        margins={margins}
        headingStyle={headingStyle}
        bulletStyle={bulletStyle}
        customFields={customFields}
        setCustomFields={setCustomFieldsTracked}
        cloudResumes={cloudResumes}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onExport={handleExport}
        onSaveToCloud={handleSaveToCloud}
        onImportFromCloud={handleImportFromCloudWithSlotCheck}
        onFileSelected={handleResumeUpload}
        onCreateBlank={handleCreateBaseResume}
        slotsUsed={resumes.length}
        maxSlots={maxSlots}
        onResumeApplied={async (resumeId, resumeRecord) => {
          try {
            if (process.env.NODE_ENV !== 'production') {
              logger.debug('onResumeApplied called', { resumeId, hasRecord: !!resumeRecord });
            }
            if (resumeId) {
              setLocalActiveBaseResumeId(resumeId);
            }
            if (resumeRecord) {
              if (process.env.NODE_ENV !== 'production') {
                logger.debug('Applying resume record', { id: resumeRecord.id, dataKeys: Object.keys(resumeRecord.data || {}) });
              }
              applyBaseResume(resumeRecord as BaseResumeRecord);
              try {
                upsertBaseResume({
                  id: resumeRecord.id,
                  slotNumber: (resumeRecord as BaseResumeRecord)?.slotNumber ?? 0,
                  name: resumeRecord.name ?? resumeRecord.metadata?.originalFileName ?? 'Imported resume',
                  isActive: true,
                  data: resumeRecord.data,
                  formatting: resumeRecord.formatting ?? undefined,
                  metadata: resumeRecord.metadata ?? undefined,
                  createdAt: resumeRecord.createdAt ?? undefined,
                  updatedAt: resumeRecord.updatedAt ?? undefined
                });
              } catch (syncError) {
                if (process.env.NODE_ENV !== 'production') {
                  logger.warn('Failed to sync imported resume into dashboard list', syncError);
                }
              }
            }
            if (resumeId) {
              if (process.env.NODE_ENV !== 'production') {
                logger.debug('Refreshing resume from server', { resumeId });
              }
              const refreshPromise = refreshBaseResumes({ showSpinner: false }).catch((error: unknown) => {
                logger.warn('Failed to refresh base resumes after resume apply', error);
              });
              await loadResumeById(resumeId);
              await refreshPromise;
            }
            if (process.env.NODE_ENV !== 'production') {
              logger.debug('Resume applied successfully');
            }
          } catch (error) {
            logger.error('Failed to hydrate editor after resume import', error);
            showToast('Resume applied but the editor could not refresh automatically. Please reopen the editor.', 'error', 6000);
          }
        }}
        onApplyStart={handleApplyStartIndicator}
        onApplySuccess={handleApplySuccessIndicator}
        onApplyError={handleApplyErrorIndicator}
        onApplyComplete={handleApplyCompleteIndicator}
        onAddSection={addCustomSection}
        onOpenAIGenerateModal={openAIGenerateModal}
        onAddField={addCustomField}
        onNewResume={() => {
          setResumeData({
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '', // 🔧 FIX: Added missing field
            github: '', // 🔧 FIX: Added missing field
            website: '', // 🔧 FIX: Added missing field
            summary: '',
            skills: [],
            experience: [],
            education: [],
            projects: [],
            certifications: [],
          });
          setShowNewResumeModal(false);
        }}
        onGenerateAIContent={() => aiHelpers.generateAIContent({
          resumeId: currentResumeId,
          section: aiGenerateSection as any,
          instructions: aiPrompt,
          tone: writingTone,
          length: contentLength,
          resumeData,
          applyBaseResume,
          setResumeData,
          setShowAIGenerateModal,
          setCustomSectionContent: aiGenerateSection === 'custom' ? setNewSectionContent : undefined
        })}
        onConfirmSaveToCloud={handleConfirmSaveToCloud}
        onLoadFromCloud={handleLoadFromCloud}
        DEFAULT_TEMPLATE_ID={DEFAULT_TEMPLATE_ID}
      />
      {/* Conflict Indicator */}
      <ConflictIndicator
        conflictDetected={hasConflict}
        onRefresh={() => {
          if (currentResumeId && resumeDataHook.loadResumeById) {
            resumeDataHook.loadResumeById(currentResumeId).then(() => {
              setHasConflict(false);
              showToast('Resume refreshed successfully', 'success');
            });
          }
        }}
        onDismiss={() => setHasConflict(false)}
      />
      
          {/* 🎯 Draft Diff Viewer Modal (View Only) */}
          {showDiffViewer && baseResumeData && (
            <DraftDiffViewer
              draftData={resumeData}
              baseData={baseResumeData}
              onClose={() => setShowDiffViewer(false)}
            />
          )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ErrorBoundary>
  );
}
