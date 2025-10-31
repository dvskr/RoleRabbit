'use client';

import React, { useState, useEffect } from 'react';
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
const ResumeEditor = dynamic(() => import('../../components/features/ResumeEditor'), { ssr: false });
const AIPanel = dynamic(() => import('../../components/features/AIPanel'), { ssr: false });
const Templates = dynamic(() => import('../../components/Templates'), { ssr: false });
const JobTracker = dynamic(() => import('../../components/JobTracker'), { ssr: false });
const Discussion = dynamic(() => import('../../components/Discussion'), { ssr: false });
const Email = dynamic(() => import('../../components/Email'), { ssr: false });
const CoverLetterGenerator = dynamic(() => import('../../components/CoverLetterGenerator'), { ssr: false });
const PortfolioGenerator = dynamic(() => import('../../components/portfolio-generator/AIPortfolioBuilder'), { ssr: false });
const LearningHub = dynamic(() => import('../../components/LearningHub'), { ssr: false });
const AIAgents = dynamic(() => import('../../components/AIAgents/index'), { ssr: false });
import { EyeOff, Sparkles, Plus, X, Cloud, Upload, Download, Briefcase, FolderOpen, Mail, FileText, Globe, LayoutTemplate, User as UserIcon, GraduationCap, MessageSquare, Home as HomeIcon, GripVertical, Eye, Trash2 } from 'lucide-react';
import { 
  CustomField, 
  ResumeData, 
  CustomSection, 
  SectionVisibility 
} from '../../types/resume';
import { useResumeData } from '../../hooks/useResumeData';
import { useModals } from '../../hooks/useModals';
import { useAI } from '../../hooks/useAI';
// Keep utils lazy - import only when actually needed
import { resumeHelpers } from '../../utils/resumeHelpers';
import { aiHelpers } from '../../utils/aiHelpers';
import { resumeTemplates } from '../../data/templates';
import { logger } from '../../utils/logger';
// Lazy load heavy analytics and modal components
const ResumeSharing = dynamic(() => import('../../components/features/ResumeSharing'), { ssr: false });
const CoverLetterAnalytics = dynamic(() => import('../../components/CoverLetterAnalytics'), { ssr: false });
const EmailAnalytics = dynamic(() => import('../../components/email/EmailAnalytics'), { ssr: false });
const ApplicationAnalytics = dynamic(() => import('../../components/ApplicationAnalytics'), { ssr: false });

// Modals are now loaded in DashboardModals component

import { ResumeFile } from '../../types/cloudStorage';
import { useTheme } from '../../contexts/ThemeContext';
import ErrorBoundary from '../../components/ErrorBoundary';
// Import dashboard constants
import {
  DEFAULT_TAB,
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
import {
  loadCloudResumes,
  saveResumeToCloud,
  loadResumeFromCloud,
  parseResumeFile,
} from './utils/cloudStorageHelpers';
import {
  mapTabName,
  duplicateData,
  createCustomField,
  generateDuplicateFileName,
  findDuplicateResumes,
  removeDuplicateResumes,
} from './utils/dashboardHandlers';
import {
  removeDuplicateResumeEntries,
  duplicateResumeState,
} from './utils/resumeDataHelpers';
import { getTemplateClasses } from './utils/templateClassesHelper';
import { ResumePreview } from './components/ResumePreview';
import { generateResumeHTML } from './utils/exportHtmlGenerator';
import { CustomSectionEditor } from './components/CustomSectionEditor';
import { DashboardModals } from './components/DashboardModals';
// Import dashboard hooks
import { useDashboardUI } from './hooks/useDashboardUI';
import { useDashboardTemplates } from './hooks/useDashboardTemplates';
import { useDashboardCloudStorage } from './hooks/useDashboardCloudStorage';
import { useDashboardAnalytics } from './hooks/useDashboardAnalytics';
import { useDashboardTabChange } from './hooks/useDashboardTabChange';

// Lazy load sections (only when Resume Editor is active) - use named exports from index
const SummarySection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.SummarySection })), { ssr: false });
const SkillsSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.SkillsSection })), { ssr: false });
const ExperienceSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.ExperienceSection })), { ssr: false });
const EducationSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.EducationSection })), { ssr: false });
const ProjectsSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.ProjectsSection })), { ssr: false });
const CertificationsSection = dynamic(() => import('../../components/sections').then(mod => ({ default: mod.CertificationsSection })), { ssr: false });

export default function DashboardPage() {
  // Use custom hooks for state management
  const resumeDataHook = useResumeData();
  const modalsHook = useModals();
  const aiHook = useAI();
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Dashboard-specific state hooks
  const dashboardUI = useDashboardUI();
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
    showResumeSharing,
    setShowResumeSharing,
    showCoverLetterAnalytics,
    setShowCoverLetterAnalytics,
    showEmailAnalytics,
    setShowEmailAnalytics,
    showApplicationAnalytics,
    setShowApplicationAnalytics,
  } = dashboardAnalytics;

  // Tab change handler
  const { handleTabChange } = useDashboardTabChange(setActiveTab);

  const handleConfirmSaveToCloud = (fileName: string, description: string, tags: string[]) => {
    saveResumeToCloud(
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
      fileName,
      description,
      tags
    );
    setShowSaveToCloudModal(false);
  };

  const handleLoadFromCloud = (file: ResumeFile) => {
    const data = loadResumeFromCloud(file);
    if (data) {
      setResumeData(data.resumeData);
      setCustomSections(data.customSections || []);
      setResumeFileName(data.resumeFileName || file.name);
      setFontFamily(data.fontFamily || 'Arial');
      setFontSize(data.fontSize || '12pt');
      setLineSpacing(data.lineSpacing || '1.5');
      setSectionSpacing(data.sectionSpacing || 'normal');
      setMargins(data.margins || 'medium');
      setHeadingStyle(data.headingStyle || 'bold');
      setBulletStyle(data.bulletStyle || 'disc');
    }
    setShowImportFromCloudModal(false);
  };

  const handleFileSelected = (file: File) => {
    logger.debug('File selected:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseResumeFile(text);
      if (data) {
        setResumeData(data.resumeData);
        setCustomSections(data.customSections || []);
        setResumeFileName(data.resumeFileName || file.name);
        setFontFamily(data.fontFamily || 'Arial');
        setFontSize(data.fontSize || '12pt');
        setLineSpacing(data.lineSpacing || '1.5');
        setSectionSpacing(data.sectionSpacing || 'normal');
        setMargins(data.margins || 'medium');
        setHeadingStyle(data.headingStyle || 'bold');
        setBulletStyle(data.bulletStyle || 'disc');
      }
    };
    reader.readAsText(file);
    setShowImportModal(false);
  };

  const handleDuplicateResume = () => {
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
  };

  const handleRemoveDuplicates = () => {
    logger.debug('Removing duplicates from resume');
    
    const { data, removedCount } = removeDuplicateResumeEntries(resumeData);
    
    if (removedCount > 0) {
      setResumeData(data);
      alert(`Removed ${removedCount} duplicate ${removedCount === 1 ? 'entry' : 'entries'}`);
      logger.debug(`Removed ${removedCount} duplicates`);
    } else {
      alert('No duplicates found!');
    }
  };

  // Destructure hooks for easier access
  const {
    resumeFileName, setResumeFileName,
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
    historyIndex, setHistoryIndex
  } = resumeDataHook;

  const {
    showNewResumeModal, setShowNewResumeModal,
    showAddSectionModal, setShowAddSectionModal,
    newSectionName, setNewSectionName,
    newSectionContent, setNewSectionContent,
    showExportModal, setShowExportModal,
    showImportModal, setShowImportModal,
    importMethod, setImportMethod,
    importJsonData, setImportJsonData,
    showAddFieldModal, setShowAddFieldModal,
    newFieldName, setNewFieldName,
    newFieldIcon, setNewFieldIcon,
    customFields, setCustomFields,
    showAIGenerateModal, setShowAIGenerateModal,
    aiGenerateSection, setAiGenerateSection,
    aiPrompt, setAiPrompt,
    writingTone, setWritingTone,
    contentLength, setContentLength,
    showMobileMenu, setShowMobileMenu
  } = modalsHook;

  const {
    aiMode, setAiMode,
    selectedModel, setSelectedModel,
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
    aiConversation, setAiConversation
  } = aiHook;

  // Save changes to history when resumeData changes
  useEffect(() => {
    if (historyIndex === history.length - 1) {
      // Only save to history if we're at the latest state (not during undo/redo)
      resumeHelpers.saveToHistory(resumeData, history, historyIndex, setHistory, setHistoryIndex);
    }
  }, [resumeData]);

  const toggleSection = (section: string) => {
    resumeHelpers.toggleSection(section, sectionVisibility, setSectionVisibility);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    resumeHelpers.moveSection(index, direction, sectionOrder, setSectionOrder);
  };

  const generateSmartFileName = () => {
    return resumeHelpers.generateSmartFileName(resumeData);
  };

  const resetToDefault = () => {
    const defaults = resumeHelpers.resetToDefault();
    setFontFamily(defaults.fontFamily);
    setFontSize(defaults.fontSize);
    setLineSpacing(defaults.lineSpacing);
    setSectionSpacing(defaults.sectionSpacing);
    setMargins(defaults.margins);
    setHeadingStyle(defaults.headingStyle);
    setBulletStyle(defaults.bulletStyle);
  };

  const addCustomSection = () => {
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
  };

  const deleteCustomSection = (id: string) => {
    resumeHelpers.deleteCustomSection(id, customSections, setCustomSections, setSectionOrder, setSectionVisibility);
  };

  const updateCustomSection = (id: string, content: string) => {
    resumeHelpers.updateCustomSection(id, content, customSections, setCustomSections);
  };

  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    
    const newField = createCustomField(newFieldName);
    setCustomFields(prev => [...prev, newField]);
    setNewFieldName('');
    setNewFieldIcon('link');
    setShowAddFieldModal(false);
  };

  const openAIGenerateModal = (section: string) => {
    aiHelpers.openAIGenerateModal(section, setAiGenerateSection, setShowAIGenerateModal);
  };

  const hideSection = (section: string) => {
    resumeHelpers.hideSection(section, sectionVisibility, setSectionVisibility);
  };

  const handleTemplateSelect = (template: string) => {
    resumeHelpers.handleTemplateSelect(template);
  };

  const undo = () => {
    resumeHelpers.undo(history, historyIndex, setHistoryIndex, setResumeData);
  };

  const redo = () => {
    resumeHelpers.redo(history, historyIndex, setHistoryIndex, setResumeData);
  };

  const saveResume = () => {
    resumeHelpers.saveResume();
  };

  const analyzeJobDescription = () => {
    aiHelpers.analyzeJobDescription(
      jobDescription,
      setIsAnalyzing,
      setMatchScore,
      setMatchedKeywords,
      setMissingKeywords,
      setAiRecommendations
    );
  };

  const applyAIRecommendations = () => {
    aiHelpers.applyAIRecommendations(aiRecommendations, setAiRecommendations);
  };

  const sendAIMessage = () => {
    aiHelpers.sendAIMessage(aiPrompt, setAiPrompt, aiConversation, setAiConversation);
  };

  const renderSection = (section: string) => {
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
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'storage':
        return <CloudStorage />;
      case 'editor':
        return isPreviewMode ? (
          <ResumePreview
            resumeFileName={resumeFileName}
            resumeData={resumeData}
            sectionOrder={sectionOrder}
            sectionVisibility={sectionVisibility}
            selectedTemplateId={selectedTemplateId || DEFAULT_TEMPLATE_ID}
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineSpacing={lineSpacing}
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
            onDeleteCustomSection={deleteCustomSection}
            onUpdateCustomSection={updateCustomSection}
            onGenerateSmartFileName={generateSmartFileName}
            onResetToDefault={resetToDefault}
            renderSection={renderSection}
            showAddFieldModal={showAddFieldModal}
            setShowAddFieldModal={setShowAddFieldModal}
            customFields={customFields}
            setCustomFields={setCustomFields}
            newFieldName={newFieldName}
            setNewFieldName={setNewFieldName}
            newFieldIcon={newFieldIcon}
            setNewFieldIcon={setNewFieldIcon}
            onAddCustomField={addCustomField}
            selectedTemplateId={selectedTemplateId || DEFAULT_TEMPLATE_ID}
            onTemplateApply={(templateId) => {
              // Apply template styling
              setSelectedTemplateId(templateId);
              
              // Get the template from the templates data
              const template = resumeTemplates.find(t => t.id === templateId);
              if (template) {
                // Apply template-specific styling
                logger.debug('Applying template:', template.name);
                
                // Apply color scheme
                if (template.colorScheme === 'blue') {
                  // Could apply blue theme
                } else if (template.colorScheme === 'green') {
                  // Could apply green theme
                } else if (template.colorScheme === 'monochrome') {
                  // Could apply monochrome theme
                }
                
                // Apply layout style
                if (template.layout === 'two-column') {
                  // Could apply two-column layout
                } else if (template.layout === 'single-column') {
                  // Could apply single-column layout
                }
              }
            }}
            addedTemplates={addedTemplates}
            onRemoveTemplate={(templateId) => {
              // Prevent removing the last template
              if (addedTemplates.length > 1) {
                dashboardTemplates.removeTemplate(templateId);
              } else {
                alert('You must have at least one template in the editor');
              }
            }}
            onAddTemplates={(templateIds) => {
              // Add multiple templates at once
              templateIds.forEach(id => dashboardTemplates.addTemplate(id));
              logger.debug('Templates added to editor:', templateIds);
            }}
            onNavigateToTemplates={() => {
              handleTabChange('templates');
            }}
            isSidebarCollapsed={resumePanelCollapsed}
            onToggleSidebar={() => setResumePanelCollapsed(!resumePanelCollapsed)}
          />
        );
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
      case 'learning':
        return <LearningHub />;
      case 'agents':
      case 'ai-agents':
        return (
          <ErrorBoundary
            fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Error loading AI Auto-Apply</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">
                    Refresh Page
                  </button>
                </div>
              </div>
            }
          >
            <AIAgents />
          </ErrorBoundary>
        );
      default:
        return <DashboardFigma onNavigateToTab={handleTabChange} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex" style={{ background: colors.background }}>
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          onTabChange={handleTabChange}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Header */}
          {activeTab === 'editor' ? (
            <Header
              isMobile={false}
              isSaving={false}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onExport={() => setShowExportModal(true)}
              onUndo={undo}
              onRedo={redo}
              onImport={() => setShowImportModal(true)}
              onSave={saveResume}
              onToggleAIPanel={() => setShowRightPanel(!showRightPanel)}
              onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
              onShowMobileMenu={() => setShowMobileMenu(true)}
              onShowResumeSharing={() => setShowResumeSharing(true)}
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
                console.log('Search query:', query);
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
          <div className="flex-1 flex overflow-hidden relative">
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {/* Render all tabs but hide inactive ones - keeps components mounted to preserve state */}
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'dashboard') ? 'block' : 'none' }}
              >
                  <DashboardFigma 
                    onQuickAction={(actionId) => {
                      logger.debug('Quick action:', actionId);
                      switch (actionId) {
                        case 'export':
                          setShowExportModal(true);
                          break;
                        case 'customize':
                          // Open customization modal
                          break;
                        case 'themes':
                          // Open theme selector
                          break;
                        default:
                          break;
                      }
                    }}
                    onNavigateToTab={(tab) => handleTabChange(tab)}
                  />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'profile') ? 'block' : 'none' }}
              >
                  <Profile />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'storage') ? 'block' : 'none' }}
              >
                  <CloudStorage />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'tracker' || activeTab === 'jobs') ? 'block' : 'none' }}
              >
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
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'templates') ? 'block' : 'none' }}
              >
                  <Templates 
                    onAddToEditor={(templateId) => {
                      setSelectedTemplateId(templateId);
                      dashboardTemplates.addTemplate(templateId);
                      logger.debug('Template added to editor:', templateId);
                    }}
                    addedTemplates={addedTemplates}
                    onRemoveTemplate={dashboardTemplates.removeTemplate}
                  />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'cover-letter') ? 'block' : 'none' }}
              >
                  <CoverLetterGenerator />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'portfolio') ? 'block' : 'none' }}
              >
                  <PortfolioGenerator />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'discussion') ? 'block' : 'none' }}
              >
                  <Discussion />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'email') ? 'block' : 'none' }}
              >
                  <Email />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'learning') ? 'block' : 'none' }}
              >
                  <LearningHub />
                </div>
              <div 
                className="absolute inset-0 h-full w-full"
                style={{ display: (activeTab === 'agents' || activeTab === 'ai-agents') ? 'block' : 'none' }}
              >
                <ErrorBoundary
                  fallback={
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-red-600 mb-4">Error loading AI Auto-Apply</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  }
                >
                  <AIAgents />
                </ErrorBoundary>
                </div>
              {/* Editor is special and handles its own rendering */}
              <div 
                className="absolute inset-0 h-full"
                style={{ 
                  display: (activeTab === 'editor') ? 'block' : 'none',
                  right: showRightPanel ? '320px' : '0',
                  width: showRightPanel ? 'calc(100% - 320px)' : '100%',
                  transition: 'right 0.3s ease, width 0.3s ease',
                }}
              >
                  {renderActiveComponent()}
                </div>
            </div>
            {/* AI Panel */}
            {activeTab === 'editor' && showRightPanel && (
              <div className="absolute top-0 right-0 bottom-0 w-80 z-50">
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
                aiConversation={aiConversation}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                isMobile={false}
                resumeData={resumeData}
                onAnalyzeJobDescription={analyzeJobDescription}
                onApplyAIRecommendations={applyAIRecommendations}
                onSendAIMessage={sendAIMessage}
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
        showResumeSharing={showResumeSharing}
        setShowResumeSharing={setShowResumeSharing}
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
        setCustomFields={setCustomFields}
        cloudResumes={cloudResumes}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onExport={(format) => {
          logger.debug('Export format:', format);
          
          // Generate HTML content using extracted utility
          const htmlContent = generateResumeHTML({
            resumeFileName,
            resumeData,
            customSections,
            sectionOrder,
            sectionVisibility,
            selectedTemplateId: selectedTemplateId || DEFAULT_TEMPLATE_ID,
            fontFamily,
            fontSize,
            lineSpacing,
          });

          // Handle different export formats
          switch(format) {
            case 'pdf':
              // Generate PDF via print dialog
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(htmlContent);
                newWindow.document.close();
                // Wait for content to load
                setTimeout(() => {
                  newWindow.print();
                }, 250);
              }
              logger.debug('PDF export initiated');
              break;

            case 'word':
              // Export as HTML (Word can open HTML files)
              const blob = new Blob([htmlContent], { type: 'application/msword' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${resumeFileName || 'resume'}.doc`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              logger.debug('Word export initiated');
              break;

            case 'print':
              // Open print dialog
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                setTimeout(() => {
                  printWindow.print();
                }, 250);
              }
              logger.debug('Print initiated');
              break;

            default:
              logger.debug('Unsupported format:', format);
          }
          
          setShowExportModal(false);
        }}
        onSaveToCloud={handleSaveToCloud}
        onImportFromCloud={handleImportFromCloud}
        onFileSelected={handleFileSelected}
        onAddSection={() => resumeHelpers.addCustomSection(
          newSectionName,
          newSectionContent,
          customSections,
          setCustomSections,
          setSectionOrder,
          setSectionVisibility,
          setNewSectionName,
          setNewSectionContent,
          setShowAddSectionModal
        )}
        onOpenAIGenerateModal={openAIGenerateModal}
        onAddField={addCustomField}
        onNewResume={() => {
          setResumeData({
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
            skills: [],
            experience: [],
            education: [],
            projects: [],
            certifications: []
          });
          setShowNewResumeModal(false);
        }}
        onGenerateAIContent={() => aiHelpers.generateAIContent(
          aiGenerateSection,
          aiPrompt,
          writingTone,
          contentLength,
          resumeData,
          setResumeData,
          setShowAIGenerateModal,
          aiGenerateSection === 'custom' ? setNewSectionContent : undefined
        )}
        onConfirmSaveToCloud={handleConfirmSaveToCloud}
        onLoadFromCloud={handleLoadFromCloud}
        DEFAULT_TEMPLATE_ID={DEFAULT_TEMPLATE_ID}
      />
    </>
  );
}
