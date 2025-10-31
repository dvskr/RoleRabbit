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
const AIAgents = dynamic(() => import('../../components/AIAgents'), { ssr: false });
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

// Lazy load modals individually when they're actually opened
// Using named exports properly
const ExportModal = dynamic(() => import('../../components/modals').then(mod => mod.ExportModal), { ssr: false });
const ImportModal = dynamic(() => import('../../components/modals').then(mod => mod.ImportModal), { ssr: false });
const AddSectionModal = dynamic(() => import('../../components/modals').then(mod => mod.AddSectionModal), { ssr: false });
const AddFieldModal = dynamic(() => import('../../components/modals').then(mod => mod.AddFieldModal), { ssr: false });
const NewResumeModal = dynamic(() => import('../../components/modals').then(mod => mod.NewResumeModal), { ssr: false });
const MobileMenuModal = dynamic(() => import('../../components/modals').then(mod => mod.MobileMenuModal), { ssr: false });
const AIGenerateModal = dynamic(() => import('../../components/modals').then(mod => mod.AIGenerateModal), { ssr: false });
const ResumeSaveToCloudModal = dynamic(() => import('../../components/modals').then(mod => mod.ResumeSaveToCloudModal), { ssr: false });
const ResumeImportFromCloudModal = dynamic(() => import('../../components/modals').then(mod => mod.ResumeImportFromCloudModal), { ssr: false });

import { ResumeFile } from '../../types/cloudStorage';
import { useTheme } from '../../contexts/ThemeContext';
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
import { CustomSectionEditor } from './components/CustomSectionEditor';
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
      case 'dashboard':
        return (
          <DashboardFigma 
            onQuickAction={(actionId) => {
              logger.debug('Quick action:', actionId);
              // Handle quick actions
              switch (actionId) {
                case 'export':
                  // Trigger export functionality
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
            onNavigateToTab={(tab) => {
              handleTabChange(tab);
            }}
          />
        );
      case 'profile':
        return <Profile />;
      case 'storage':
        return <CloudStorage />;
      case 'editor':
        const templateClasses = getTemplateClasses(selectedTemplateId);

        return isPreviewMode ? (
          // Preview Mode - Document-style resume
          <div className="h-full bg-gray-100 overflow-auto">
            {/* Sticky Preview Header */}
            <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-3 z-10 flex items-center justify-between shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Preview: {resumeFileName}</h2>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <EyeOff size={16} />
                Exit Preview
              </button>
            </div>
            
            {/* Document Preview */}
            <div 
              className={`max-w-[8.5in] mx-auto mt-8 mb-12 shadow-2xl p-[1in] print:p-0 ${templateClasses.container}`} 
              style={{ minHeight: '11in' }}
            >
              {/* Document Header */}
              <div className={`mb-6 pb-4 ${templateClasses.header}`}>
                <h1 className={`text-3xl font-bold mb-1 ${templateClasses.nameColor}`} style={{ fontFamily: fontFamily === 'arial' ? 'Arial' : fontFamily === 'times' ? 'Times New Roman' : fontFamily === 'verdana' ? 'Verdana' : 'Arial' }}>
                  {resumeData.name}
                </h1>
                <p className={`text-lg font-medium ${templateClasses.titleColor}`}>{resumeData.title}</p>
                <div className="flex gap-3 mt-2 text-sm text-gray-600">
                  <span>{resumeData.email}</span>
                  <span>•</span>
                  <span>{resumeData.phone}</span>
                  <span>•</span>
                  <span>{resumeData.location}</span>
                </div>
              </div>

              {/* Render sections based on sectionOrder */}
              {sectionOrder.map((sectionId) => {
                if (!sectionVisibility[sectionId]) return null;
                
                const sectionMap: any = {
                  summary: (
                    <div className="mb-4">
                      <h2 className={`text-xl font-bold uppercase mb-1 ${templateClasses.sectionColor}`} style={{ fontSize: fontSize }}>
                        {resumeData.summary ? 'Professional Summary' : 'Summary'}
                      </h2>
                      <p className="text-gray-800" style={{ lineHeight: lineSpacing, fontSize: fontSize }}>
                        {resumeData.summary}
                      </p>
                    </div>
                  ),
                  skills: (
                    <div className="mb-4">
                      <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize: fontSize }}>
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills?.map((skill: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ),
                  experience: (
                    <div className="mb-4">
                      <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize: fontSize }}>
                        Professional Experience
                      </h2>
                      <div className="space-y-3">
                        {resumeData.experience?.map((exp: any, idx: number) => (
                          <div key={idx} className="mb-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-gray-900" style={{ fontSize: fontSize }}>
                                {exp.position}
                              </span>
                              <span className="text-sm text-gray-600">{exp.period} - {exp.endPeriod}</span>
                            </div>
                            <p className="text-gray-700 mb-1" style={{ fontSize: fontSize }}>
                              {exp.company} {exp.location && `• ${exp.location}`}
                            </p>
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul className="list-disc list-inside ml-2 text-gray-700" style={{ fontSize: fontSize }}>
                                {exp.bullets.map((bullet: string, i: number) => (
                                  <li key={i} className="mb-1">{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                  education: (
                    <div className="mb-4">
                      <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize: fontSize }}>
                        Education
                      </h2>
                      <div className="space-y-2">
                        {resumeData.education?.map((edu: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900" style={{ fontSize: fontSize }}>
                                {edu.degree}
                              </span>
                              <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
                            </div>
                            <p className="text-gray-700" style={{ fontSize: fontSize }}>
                              {edu.school}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                  projects: (
                    <div className="mb-4">
                      <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize: fontSize }}>
                        Projects
                      </h2>
                      <div className="space-y-3">
                        {resumeData.projects?.map((project: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-gray-900" style={{ fontSize: fontSize }}>
                                {project.name}
                              </span>
                              {project.link && (
                                <a href={project.link} className="text-sm text-blue-600 hover:underline">
                                  View Project
                                </a>
                              )}
                            </div>
                            <p className="text-gray-700 mb-1" style={{ fontSize: fontSize }}>
                              {project.description}
                            </p>
                            {project.bullets && project.bullets.length > 0 && (
                              <ul className="list-disc list-inside ml-2 text-gray-700" style={{ fontSize: fontSize }}>
                                {project.bullets.map((bullet: string, i: number) => (
                                  <li key={i} className="mb-1">{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                  certifications: (
                    <div className="mb-4">
                      <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize: fontSize }}>
                        Certifications
                      </h2>
                      <div className="space-y-2">
                        {resumeData.certifications?.map((cert: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900" style={{ fontSize: fontSize }}>
                                {cert.name}
                              </span>
                              {cert.link && (
                                <a href={cert.link} className="text-sm text-blue-600 hover:underline">
                                  Verify
                                </a>
                              )}
                            </div>
                            <p className="text-gray-700" style={{ fontSize: fontSize }}>
                              {cert.issuer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                };
                
                return sectionMap[sectionId] || null;
              })}
            </div>
          </div>
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
            selectedTemplateId={selectedTemplateId}
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
        return <JobTracker />;
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
        return <AIAgents />;
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
              {/* Render all tabs but hide inactive ones - mounted but hidden */}
              <div className={`absolute inset-0 h-full ${activeTab === 'dashboard' ? '' : 'hidden'}`}>
                <DashboardFigma 
                  onQuickAction={(actionId) => {
                    logger.debug('Quick action:', actionId);
                    switch (actionId) {
                      case 'export':
                        // Trigger export functionality
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
              <div className={`absolute inset-0 h-full ${activeTab === 'profile' ? '' : 'hidden'}`}>
                <Profile />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'storage' ? '' : 'hidden'}`}>
                <CloudStorage />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'tracker' ? '' : 'hidden'}`}>
                <JobTracker />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'templates' ? '' : 'hidden'}`}>
                <Templates />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'cover-letter' ? '' : 'hidden'}`}>
                <CoverLetterGenerator />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'portfolio' ? '' : 'hidden'}`}>
                <PortfolioGenerator />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'discussion' ? '' : 'hidden'}`}>
                <Discussion />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'email' ? '' : 'hidden'}`}>
                <Email />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'learning' ? '' : 'hidden'}`}>
                <LearningHub />
              </div>
              <div className={`absolute inset-0 h-full ${activeTab === 'agents' ? '' : 'hidden'}`}>
                <AIAgents />
              </div>
              {/* Editor is special and handles its own rendering */}
              <div className={`absolute inset-0 h-full ${activeTab === 'editor' ? '' : 'hidden'} ${showRightPanel && activeTab === 'editor' ? 'right-80' : ''}`}>
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

      {/* Export Resume Modal */}
      <ExportModal
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        resumeData={resumeData}
        customSections={customSections}
        resumeFileName={resumeFileName}
        fontFamily={fontFamily}
        fontSize={fontSize}
        lineSpacing={lineSpacing}
        sectionSpacing={sectionSpacing}
        margins={margins}
        headingStyle={headingStyle}
        bulletStyle={bulletStyle}
        onExport={(format) => {
          logger.debug('Export format:', format);
          
          // Helper function to generate HTML content
          const generateResumeHTML = () => {
            const getTemplateClasses = () => {
              const template = resumeTemplates.find(t => t.id === selectedTemplateId);
              if (!template) {
                return {
                  container: 'bg-white border-gray-300',
                  header: 'border-b border-gray-300',
                  nameColor: 'text-gray-900',
                  titleColor: 'text-gray-700',
                  sectionColor: 'text-gray-900',
                  accentColor: 'text-gray-700'
                };
              }

              const colorScheme = template.colorScheme;
              let containerClass = 'bg-white';
              let headerClass = 'border-b-2';
              let nameColor = 'text-gray-900';
              let titleColor = 'text-gray-700';
              let sectionColor = 'text-gray-900';
              let accentColor = 'text-gray-700';

              switch (colorScheme) {
                case 'blue':
                  containerClass = 'bg-white';
                  headerClass = 'border-b-2 border-blue-500';
                  titleColor = 'text-blue-600';
                  sectionColor = 'text-blue-600';
                  accentColor = 'text-blue-600';
                  break;
                case 'green':
                  containerClass = 'bg-white';
                  headerClass = 'border-b-2 border-green-500';
                  titleColor = 'text-green-600';
                  sectionColor = 'text-green-600';
                  accentColor = 'text-green-600';
                  break;
                default:
                  containerClass = 'bg-white';
                  headerClass = 'border-b border-gray-300';
                  break;
              }

              return {
                container: containerClass,
                header: headerClass,
                nameColor,
                titleColor,
                sectionColor,
                accentColor
              };
            };

            const classes = getTemplateClasses();
            const fontMap: Record<string, string> = {
              arial: 'Arial',
              calibri: 'Calibri',
              times: 'Times New Roman',
              helvetica: 'Helvetica'
            };
            const selectedFont = fontMap[fontFamily] || 'Arial';

            let html = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>${resumeFileName}</title>
                <style>
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  body {
                    font-family: '${selectedFont}', sans-serif;
                    font-size: ${fontSize};
                    line-height: ${lineSpacing};
                    color: #333;
                    max-width: 8.5in;
                    margin: 0 auto;
                    padding: 1in;
                    background: white;
                  }
                  .header {
                    border-bottom: 2px solid #ddd;
                    padding-bottom: 1rem;
                    margin-bottom: 1.5rem;
                  }
                  .name {
                    font-size: 2em;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                  }
                  .title {
                    font-size: 1.2em;
                    margin-bottom: 0.5rem;
                  }
                  .contact {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.9em;
                    margin-top: 0.5rem;
                  }
                  .section {
                    margin-bottom: 1.5rem;
                  }
                  .section-title {
                    font-size: 1.2em;
                    font-weight: bold;
                    text-transform: uppercase;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 0.5rem;
                    margin-bottom: 1rem;
                  }
                  .experience-item, .project-item, .education-item, .cert-item {
                    margin-bottom: 1rem;
                  }
                  .item-header {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                  }
                  .item-date {
                    color: #666;
                    font-weight: normal;
                  }
                  .bullets {
                    margin-left: 1.5rem;
                    margin-top: 0.5rem;
                  }
                  .skills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                  }
                  .skill-tag {
                    background: #f0f0f0;
                    padding: 0.3rem 0.8rem;
                    border-radius: 4px;
                  }
                  @media print {
                    body { padding: 0; }
                  }
                </style>
              </head>
              <body>
            `;

            // Header
            html += `
              <div class="header">
                <div class="name">${resumeData.name || 'Your Name'}</div>
                <div class="title">${resumeData.title || 'Your Title'}</div>
                <div class="contact">
                  <span>${resumeData.email || ''}</span>
                  <span>${resumeData.phone || ''}</span>
                  <span>${resumeData.location || ''}</span>
                </div>
              </div>
            `;

            // Render visible sections
            sectionOrder.forEach(sectionId => {
              if (!sectionVisibility[sectionId]) return;

              switch(sectionId) {
                case 'summary':
                  if (resumeData.summary) {
                    html += `
                      <div class="section">
                        <div class="section-title">Professional Summary</div>
                        <p>${resumeData.summary}</p>
                      </div>
                    `;
                  }
                  break;

                case 'skills':
                  if (resumeData.skills && resumeData.skills.length > 0) {
                    html += `
                      <div class="section">
                        <div class="section-title">Skills</div>
                        <div class="skills">
                          ${resumeData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                      </div>
                    `;
                  }
                  break;

                case 'experience':
                  if (resumeData.experience && resumeData.experience.length > 0) {
                    html += `
                      <div class="section">
                        <div class="section-title">Experience</div>
                        ${resumeData.experience.map(exp => `
                          <div class="experience-item">
                            <div class="item-header">
                              <span>${exp.position}</span>
                              <span class="item-date">${exp.period}</span>
                            </div>
                            <div>${exp.company} ${exp.location ? `• ${exp.location}` : ''}</div>
                            ${exp.bullets && exp.bullets.length > 0 ? `
                              <div class="bullets">
                                ${exp.bullets.map(bullet => `• ${bullet}<br>`).join('')}
                              </div>
                            ` : ''}
                          </div>
                        `).join('')}
                      </div>
                    `;
                  }
                  break;

                case 'education':
                  if (resumeData.education && resumeData.education.length > 0) {
                    html += `
                      <div class="section">
                        <div class="section-title">Education</div>
                        ${resumeData.education.map(edu => `
                          <div class="education-item">
                            <div class="item-header">
                              <span>${edu.degree}</span>
                              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
                            </div>
                            <div>${edu.school}</div>
                          </div>
                        `).join('')}
                      </div>
                    `;
                  }
                  break;

                case 'projects':
                  if (resumeData.projects && resumeData.projects.length > 0) {
                    html += `
                      <div class="section">
                        <div class="section-title">Projects</div>
                        ${resumeData.projects.map(project => `
                          <div class="project-item">
                            <div class="item-header">
                              <span>${project.name}</span>
                              ${project.link ? `<a href="${project.link}">View Project</a>` : ''}
                            </div>
                            <div>${project.description}</div>
                            ${project.bullets && project.bullets.length > 0 ? `
                              <div class="bullets">
                                ${project.bullets.map(bullet => `• ${bullet}<br>`).join('')}
                              </div>
                            ` : ''}
                          </div>
                        `).join('')}
                      </div>
                    `;
                  }
                  break;

                case 'certifications':
                  if (resumeData.certifications && resumeData.certifications.length > 0) {
                    html += `
                      <div class="section">
                        <div class="section-title">Certifications</div>
                        ${resumeData.certifications.map(cert => `
                          <div class="cert-item">
                            <div class="item-header">
                              <span>${cert.name}</span>
                              ${cert.link ? `<a href="${cert.link}">Verify</a>` : ''}
                            </div>
                            <div>${cert.issuer}</div>
                          </div>
                        `).join('')}
                      </div>
                    `;
                  }
                  break;
              }
            });

            html += `</body></html>`;
            return html;
          };

          // Handle different export formats
          switch(format) {
            case 'pdf':
              // Generate HTML content
              const htmlContent = generateResumeHTML();
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
              const wordContent = generateResumeHTML();
              const blob = new Blob([wordContent], { type: 'application/msword' });
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
              const printContent = generateResumeHTML();
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(printContent);
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
      />

      {/* Import Resume Modal */}
      <ImportModal
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        importMethod={importMethod}
        setImportMethod={setImportMethod}
        importJsonData={importJsonData}
        setImportJsonData={setImportJsonData}
        onImport={() => {
          logger.debug('Import triggered');
          // TODO: Implement import functionality
        }}
        onImportFromCloud={handleImportFromCloud}
        onFileSelected={handleFileSelected}
      />

      {/* Add Custom Section Modal */}
      <AddSectionModal
        showAddSectionModal={showAddSectionModal}
        setShowAddSectionModal={setShowAddSectionModal}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        newSectionContent={newSectionContent}
        setNewSectionContent={setNewSectionContent}
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
      />

      {/* Add Custom Field Modal */}
      <AddFieldModal
        showAddFieldModal={showAddFieldModal}
        setShowAddFieldModal={setShowAddFieldModal}
        newFieldName={newFieldName}
        setNewFieldName={setNewFieldName}
        newFieldIcon={newFieldIcon}
        setNewFieldIcon={setNewFieldIcon}
        onAddField={addCustomField}
      />

      {/* New Resume Modal */}
      <NewResumeModal
        showNewResumeModal={showNewResumeModal}
        setShowNewResumeModal={setShowNewResumeModal}
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
      />

      {/* Mobile Menu Modal */}
      <MobileMenuModal
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* AI Generate Modal */}
      <AIGenerateModal
        showAIGenerateModal={showAIGenerateModal}
        setShowAIGenerateModal={setShowAIGenerateModal}
        aiGenerateSection={aiGenerateSection}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        writingTone={writingTone}
        setWritingTone={setWritingTone}
        contentLength={contentLength}
        setContentLength={setContentLength}
        onGenerate={() => aiHelpers.generateAIContent(
          aiGenerateSection,
          aiPrompt,
          writingTone,
          contentLength,
          resumeData,
          setResumeData,
          setShowAIGenerateModal,
          aiGenerateSection === 'custom' ? setNewSectionContent : undefined
        )}
      />

      {/* Save to Cloud Modal */}
      {showSaveToCloudModal && (
        <ResumeSaveToCloudModal
          onClose={() => setShowSaveToCloudModal(false)}
          onConfirm={handleConfirmSaveToCloud}
          defaultFileName={resumeFileName}
        />
      )}

      {/* Import from Cloud Modal */}
      {showImportFromCloudModal && (
        <ResumeImportFromCloudModal
          files={cloudResumes}
          onClose={() => setShowImportFromCloudModal(false)}
          onLoad={handleLoadFromCloud}
        />
      )}

      {/* Resume Sharing Modal */}
      {showResumeSharing && (
        <ResumeSharing
          resumeId={`resume_${Date.now()}`}
          resumeName={resumeFileName}
          isOpen={showResumeSharing}
          onClose={() => setShowResumeSharing(false)}
        />
      )}

      {/* Cover Letter Analytics Modal */}
      {showCoverLetterAnalytics && (
        <CoverLetterAnalytics
          isOpen={showCoverLetterAnalytics}
          onClose={() => setShowCoverLetterAnalytics(false)}
        />
      )}

      {/* Email Analytics Modal */}
      {showEmailAnalytics && (
        <EmailAnalytics
          isOpen={showEmailAnalytics}
          onClose={() => setShowEmailAnalytics(false)}
        />
      )}

      {/* Application Analytics Modal */}
      {showApplicationAnalytics && (
        <ApplicationAnalytics
          isOpen={showApplicationAnalytics}
          onClose={() => setShowApplicationAnalytics(false)}
        />
      )}
    </>
  );
}
