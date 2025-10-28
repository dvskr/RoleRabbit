'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import PageHeader from '../../components/layout/PageHeader';
import Home from '../../components/Home';
import Profile from '../../components/Profile';
import CloudStorage from '../../components/CloudStorage';
import ResumeEditor from '../../components/features/ResumeEditor';
import AIPanel from '../../components/features/AIPanel';
import Templates from '../../components/Templates';
import JobTracker from '../../components/JobTracker';
import Discussion from '../../components/Discussion';
import Email from '../../components/Email';
import CoverLetterGenerator from '../../components/CoverLetterGenerator';
import PortfolioGenerator from '../../components/portfolio-generator/PortfolioGeneratorV2';
import LearningHub from '../../components/LearningHub';
import AIAgents from '../../components/AIAgents';
import { Eye, EyeOff, Sparkles, GripVertical, Trash2, Plus, X, Cloud, Upload, Download, Briefcase, FolderOpen, Mail, FileText, Globe, LayoutTemplate, User as UserIcon, GraduationCap, MessageSquare, Users, Home as HomeIcon } from 'lucide-react';
import { 
  CustomField, 
  ExperienceItem, 
  ProjectItem, 
  EducationItem, 
  CertificationItem, 
  ResumeData, 
  CustomSection, 
  AIMessage, 
  SectionVisibility 
} from '../../types/resume';
import { useResumeData } from '../../hooks/useResumeData';
import { useModals } from '../../hooks/useModals';
import { useAI } from '../../hooks/useAI';
import { resumeHelpers } from '../../utils/resumeHelpers';
import * as exportHelpers from '../../utils/exportHelpers';
import { aiHelpers } from '../../utils/aiHelpers';
import { resumeTemplates } from '../../data/templates';
import { logger } from '../../utils/logger';
import ResumeSharing from '../../components/features/ResumeSharing';
import CoverLetterAnalytics from '../../components/CoverLetterAnalytics';
import EmailAnalytics from '../../components/email/EmailAnalytics';
import ApplicationAnalytics from '../../components/ApplicationAnalytics';
import {
  ExportModal,
  ImportModal,
  AddSectionModal,
  AddFieldModal,
  NewResumeModal,
  MobileMenuModal,
  AIGenerateModal
} from '../../components/modals';
import { ResumeFile } from '../../types/cloudStorage';
import {
  SummarySection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  ProjectsSection,
  CertificationsSection
} from '../../components/sections';

export default function DashboardPage() {
  // Use custom hooks for state management
  const resumeDataHook = useResumeData();
  const modalsHook = useModals();
  const aiHook = useAI();
  
  // Dashboard-specific state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resumePanelCollapsed, setResumePanelCollapsed] = useState(false); // Separate state for Resume Editor panel
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [previousSidebarState, setPreviousSidebarState] = useState(false); // For Resume Editor panel
  const [previousMainSidebarState, setPreviousMainSidebarState] = useState(false); // For main navigation sidebar
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('ats-classic');
  const [addedTemplates, setAddedTemplates] = useState<string[]>(['ats-classic', 'ats-modern']);
  
  // Cloud Storage State
  const [showSaveToCloudModal, setShowSaveToCloudModal] = useState(false);
  const [showImportFromCloudModal, setShowImportFromCloudModal] = useState(false);
  const [cloudResumes, setCloudResumes] = useState<ResumeFile[]>([]);

  // New Features State
  const [showResumeSharing, setShowResumeSharing] = useState(false);
  const [showCoverLetterAnalytics, setShowCoverLetterAnalytics] = useState(false);
  const [showEmailAnalytics, setShowEmailAnalytics] = useState(false);
  const [showApplicationAnalytics, setShowApplicationAnalytics] = useState(false);

  // Cloud Storage Handlers
  const handleSaveToCloud = () => {
    setShowSaveToCloudModal(true);
  };

  const handleImportFromCloud = () => {
    // Load cloud resumes
    const cloudStorage = localStorage.getItem('cloudStorage');
    if (cloudStorage) {
      try {
        const storage = JSON.parse(cloudStorage);
        const resumes = storage.files?.filter((f: ResumeFile) => f.type === 'resume') || [];
        setCloudResumes(resumes);
      } catch (e) {
        logger.debug('Error loading cloud files:', e);
      }
    }
    setShowImportFromCloudModal(true);
  };

  const handleConfirmSaveToCloud = (fileName: string, description: string, tags: string[]) => {
    // Load current cloud storage
    const cloudStorage = localStorage.getItem('cloudStorage');
    let storage = cloudStorage ? JSON.parse(cloudStorage) : { files: [] };

    // Create new file
    const newFile: ResumeFile = {
      id: `resume_${Date.now()}`,
      name: fileName,
      type: 'resume',
      size: `${(JSON.stringify(resumeData).length / 1024).toFixed(2)} KB`,
      lastModified: new Date().toISOString().split('T')[0],
      isPublic: false,
      tags: tags,
      version: 1,
      owner: 'current-user@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 0,
      viewCount: 0,
      isStarred: false,
      isArchived: false,
      description: description
    };

    // Store the full resume data separately
    localStorage.setItem(`cloudFileContent_${newFile.id}`, JSON.stringify({
      resumeData,
      customSections,
      resumeFileName,
      fontFamily,
      fontSize,
      lineSpacing,
      sectionSpacing,
      margins,
      headingStyle,
      bulletStyle
    }));

    // Add to storage
    storage.files.push(newFile);
    localStorage.setItem('cloudStorage', JSON.stringify(storage));
    
    logger.debug('Saved resume to cloud:', newFile);
    setShowSaveToCloudModal(false);
  };

  const handleLoadFromCloud = (file: ResumeFile) => {
    // Load the file content
    const fileContent = localStorage.getItem(`cloudFileContent_${file.id}`);
    if (fileContent) {
      const data = JSON.parse(fileContent);
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
      logger.debug('Loaded resume from cloud:', file);
    }
    setShowImportFromCloudModal(false);
  };

  const handleFileSelected = (file: File) => {
    logger.debug('File selected:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Try to parse as JSON
        const data = JSON.parse(text);
        if (data.resumeData) {
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
          logger.debug('Loaded resume from file:', data);
        }
      } catch (e) {
        logger.debug('Error parsing file:', e);
      }
    };
    reader.readAsText(file);
    setShowImportModal(false);
  };

  const handleDuplicateResume = () => {
    logger.debug('Duplicating resume');
    
    // Get current timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newFileName = `${resumeFileName} - Copy`;
    
    // Duplicate all resume state
    const duplicatedResumeData = JSON.parse(JSON.stringify(resumeData));
    const duplicatedCustomSections = JSON.parse(JSON.stringify(customSections));
    const duplicatedSectionOrder = [...sectionOrder];
    const duplicatedSectionVisibility = {...sectionVisibility};
    
    // Update all states with duplicated data
    setResumeFileName(newFileName);
    setResumeData(duplicatedResumeData);
    setCustomSections(duplicatedCustomSections);
    setSectionOrder(duplicatedSectionOrder);
    setSectionVisibility(duplicatedSectionVisibility);
    
    // Reset history for the new resume
    const newHistory = [duplicatedResumeData];
    setHistory(newHistory);
    setHistoryIndex(0);
    
    logger.debug('Resume duplicated successfully');
  };

  const handleRemoveDuplicates = () => {
    logger.debug('Removing duplicates from resume');
    
    const cleanedResumeData = { ...resumeData };
    let removedCount = 0;
    
    // Remove duplicate experiences
    if (cleanedResumeData.experience && cleanedResumeData.experience.length > 0) {
      const seen = new Set();
      const unique = cleanedResumeData.experience.filter((exp: any) => {
        const key = `${exp.company}-${exp.position}-${exp.period}`;
        if (seen.has(key)) {
          removedCount++;
          return false;
        }
        seen.add(key);
        return true;
      });
      cleanedResumeData.experience = unique;
    }
    
    // Remove duplicate skills
    if (cleanedResumeData.skills && cleanedResumeData.skills.length > 0) {
      const uniqueSkills = Array.from(new Set(cleanedResumeData.skills));
      removedCount += cleanedResumeData.skills.length - uniqueSkills.length;
      cleanedResumeData.skills = uniqueSkills;
    }
    
    // Remove duplicate education
    if (cleanedResumeData.education && cleanedResumeData.education.length > 0) {
      const seen = new Set();
      const unique = cleanedResumeData.education.filter((edu: any) => {
        const key = `${edu.school}-${edu.degree}`;
        if (seen.has(key)) {
          removedCount++;
          return false;
        }
        seen.add(key);
        return true;
      });
      cleanedResumeData.education = unique;
    }
    
    // Remove duplicate projects
    if (cleanedResumeData.projects && cleanedResumeData.projects.length > 0) {
      const seen = new Set();
      const unique = cleanedResumeData.projects.filter((proj: any) => {
        const key = `${proj.name}-${proj.description}`;
        if (seen.has(key)) {
          removedCount++;
          return false;
        }
        seen.add(key);
        return true;
      });
      cleanedResumeData.projects = unique;
    }
    
    // Remove duplicate certifications
    if (cleanedResumeData.certifications && cleanedResumeData.certifications.length > 0) {
      const seen = new Set();
      const unique = cleanedResumeData.certifications.filter((cert: any) => {
        const key = `${cert.name}-${cert.issuer}`;
        if (seen.has(key)) {
          removedCount++;
          return false;
        }
        seen.add(key);
        return true;
      });
      cleanedResumeData.certifications = unique;
    }
    
    if (removedCount > 0) {
      setResumeData(cleanedResumeData);
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

  // Helper functions
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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
    
    const newField: CustomField = {
      id: `custom-field-${Date.now()}`,
      name: newFieldName.trim()
    };
    
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
        <div className="mb-6 p-2 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">{customSection.name.toUpperCase()}</h3>
            <button 
              onClick={() => deleteCustomSection(customSection.id)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete Section"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <textarea
            value={customSection.content}
            onChange={(e) => updateCustomSection(customSection.id, e.target.value)}
            className="w-full h-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none break-words overflow-wrap-anywhere"
            placeholder={`Add your ${customSection.name.toLowerCase()} content here...`}
          />
        </div>
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
          <Home 
            enableMissionControl={true}
            onQuickAction={(actionId) => {
              logger.debug('Quick action:', actionId);
              // Handle quick actions - could navigate to specific tabs
              switch (actionId) {
                case '1': // Start New Application
                  handleTabChange('tracker');
                  break;
                case '2': // Send Follow-up
                  handleTabChange('email');
                  break;
                case '3': // Update Resume
                  handleTabChange('editor');
                  break;
                case '4': // Research Companies
                  handleTabChange('discussion');
                  break;
                default:
                  break;
              }
            }}
            onNavigateToTab={(tab) => {
              handleTabChange(tab);
            }}
            onOpenApplicationAnalytics={() => setShowApplicationAnalytics(true)}
          />
        );
      case 'profile':
        return <Profile />;
      case 'storage':
        return <CloudStorage />;
      case 'editor':
        // Helper function to get template-specific classes
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

          // Apply template styles
          const colorScheme = template.colorScheme;
          const layout = template.layout;

          let containerClass = '';
          let headerClass = '';
          let nameColor = 'text-gray-900';
          let titleColor = 'text-gray-700';
          let sectionColor = 'text-gray-900';
          let accentColor = 'text-gray-700';

          // Apply color scheme
          switch (colorScheme) {
            case 'blue':
              containerClass = 'bg-white';
              headerClass = 'border-b-2 border-blue-500';
              nameColor = 'text-gray-900';
              titleColor = 'text-blue-600';
              sectionColor = 'text-blue-600';
              accentColor = 'text-blue-600';
              break;
            case 'green':
              containerClass = 'bg-white';
              headerClass = 'border-b-2 border-green-500';
              nameColor = 'text-gray-900';
              titleColor = 'text-green-600';
              sectionColor = 'text-green-600';
              accentColor = 'text-green-600';
              break;
            case 'purple':
              containerClass = 'bg-white';
              headerClass = 'border-b-2 border-purple-500';
              nameColor = 'text-gray-900';
              titleColor = 'text-purple-600';
              sectionColor = 'text-purple-600';
              accentColor = 'text-purple-600';
              break;
            case 'red':
              containerClass = 'bg-white';
              headerClass = 'border-b-2 border-red-500';
              nameColor = 'text-gray-900';
              titleColor = 'text-red-600';
              sectionColor = 'text-red-600';
              accentColor = 'text-red-600';
              break;
            case 'orange':
              containerClass = 'bg-white';
              headerClass = 'border-b-2 border-orange-500';
              nameColor = 'text-gray-900';
              titleColor = 'text-orange-600';
              sectionColor = 'text-orange-600';
              accentColor = 'text-orange-600';
              break;
            default: // monochrome
              containerClass = 'bg-white';
              headerClass = 'border-b border-gray-300';
              break;
          }

          // Apply layout (could affect padding, margins, etc.)
          if (layout === 'two-column') {
            containerClass += ' p-12';
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
              className={`max-w-[8.5in] mx-auto mt-8 mb-12 shadow-2xl p-[1in] print:p-0 ${getTemplateClasses().container}`} 
              style={{ minHeight: '11in' }}
            >
              {/* Document Header */}
              <div className={`mb-6 pb-4 ${getTemplateClasses().header}`}>
                <h1 className={`text-3xl font-bold mb-1 ${getTemplateClasses().nameColor}`} style={{ fontFamily: fontFamily === 'arial' ? 'Arial' : fontFamily === 'times' ? 'Times New Roman' : fontFamily === 'verdana' ? 'Verdana' : 'Arial' }}>
                  {resumeData.name}
                </h1>
                <p className={`text-lg font-medium ${getTemplateClasses().titleColor}`}>{resumeData.title}</p>
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
                      <h2 className={`text-xl font-bold uppercase mb-1 ${getTemplateClasses().sectionColor}`} style={{ fontSize: fontSize }}>
                        {resumeData.summary ? 'Professional Summary' : 'Summary'}
                      </h2>
                      <p className="text-gray-800" style={{ lineHeight: lineSpacing, fontSize: fontSize }}>
                        {resumeData.summary}
                      </p>
                    </div>
                  ),
                  skills: (
                    <div className="mb-4">
                      <h2 className={`text-xl font-bold uppercase mb-2 ${getTemplateClasses().sectionColor}`} style={{ fontSize: fontSize }}>
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
                      <h2 className={`text-xl font-bold uppercase mb-2 ${getTemplateClasses().sectionColor}`} style={{ fontSize: fontSize }}>
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
                      <h2 className={`text-xl font-bold uppercase mb-2 ${getTemplateClasses().sectionColor}`} style={{ fontSize: fontSize }}>
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
                      <h2 className={`text-xl font-bold uppercase mb-2 ${getTemplateClasses().sectionColor}`} style={{ fontSize: fontSize }}>
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
                      <h2 className={`text-xl font-bold uppercase mb-2 ${getTemplateClasses().sectionColor}`} style={{ fontSize: fontSize }}>
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
                setAddedTemplates(addedTemplates.filter(id => id !== templateId));
              } else {
                alert('You must have at least one template in the editor');
              }
            }}
            onAddTemplates={(templateIds) => {
              // Add multiple templates at once
              setAddedTemplates([...addedTemplates, ...templateIds]);
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
            if (!addedTemplates.includes(templateId)) {
              setAddedTemplates([...addedTemplates, templateId]);
            }
            logger.debug('Template added to editor:', templateId);
          }}
          addedTemplates={addedTemplates}
          onRemoveTemplate={(templateId) => {
            setAddedTemplates(addedTemplates.filter(id => id !== templateId));
          }}
        />;
      case 'tracker':
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
        return <AIAgents />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          onTabChange={handleTabChange}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
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
          ) : (
            <PageHeader
              title={
                activeTab === 'storage' ? 'Storage' :
                activeTab === 'tracker' ? 'Job Tracker' :
                activeTab === 'discussion' ? 'Community' :
                activeTab === 'email' ? 'Email Hub' :
                activeTab === 'cover-letter' ? 'Cover Letter' :
                activeTab === 'portfolio' ? 'Portfolio' :
                activeTab === 'templates' ? 'Templates' :
                activeTab === 'profile' ? 'Profile' :
                activeTab === 'agents' ? 'AI Agents' :
                 activeTab === 'learning' ? 'Learning Hub' :
                 activeTab === 'dashboard' ? 'Dashboard' : 'RoleReady'
              }
              subtitle={
                activeTab === 'dashboard' ? 'Overview of your job search journey' :
                activeTab === 'storage' ? 'Manage your files and documents' :
                activeTab === 'tracker' ? 'Track your job applications' :
                activeTab === 'discussion' ? 'Connect with the community' :
                activeTab === 'email' ? 'Manage your emails and contacts' :
                activeTab === 'cover-letter' ? 'Create professional cover letters' :
                activeTab === 'portfolio' ? 'Build your online portfolio' :
                activeTab === 'templates' ? 'Browse resume templates' :
                activeTab === 'profile' ? 'Manage your profile settings' :
                activeTab === 'agents' ? 'Automate your job search' :
                activeTab === 'learning' ? 'Learn new skills' : undefined
              }
              icon={(() => {
                switch(activeTab) {
                  case 'dashboard': return HomeIcon;
                  case 'storage': return FolderOpen;
                  case 'tracker': return Briefcase;
                  case 'discussion': return MessageSquare;
                  case 'email': return Mail;
                  case 'cover-letter': return FileText;
                  case 'portfolio': return Globe;
                  case 'templates': return LayoutTemplate;
                  case 'profile': return UserIcon;
                  case 'agents': return Sparkles;
                  case 'learning': return GraduationCap;
                  default: return undefined;
                }
              })()}
              iconColor={(() => {
                switch(activeTab) {
                  case 'dashboard': return 'text-blue-600';
                  case 'storage': return 'text-blue-600';
                  case 'tracker': return 'text-green-600';
                  case 'discussion': return 'text-indigo-600';
                  case 'email': return 'text-purple-600';
                  case 'cover-letter': return 'text-orange-600';
                  case 'portfolio': return 'text-rose-600';
                  case 'templates': return 'text-violet-600';
                  case 'profile': return 'text-slate-600';
                  case 'agents': return 'text-purple-600';
                  case 'learning': return 'text-sky-600';
                  default: return 'text-blue-600';
                }
              })()}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden relative">
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {/* Render all tabs but hide inactive ones - mounted but hidden */}
              <div className={`absolute inset-0 h-full ${activeTab === 'dashboard' ? '' : 'hidden'}`}>
                <Home 
                  enableMissionControl={true}
                  onQuickAction={(actionId) => {
                    logger.debug('Quick action:', actionId);
                    switch (actionId) {
                      case '1': handleTabChange('tracker'); break;
                      case '2': handleTabChange('email'); break;
                      case '3': handleTabChange('editor'); break;
                      case '4': handleTabChange('discussion'); break;
                      default: break;
                    }
                  }}
                  onNavigateToTab={(tab) => handleTabChange(tab)}
                  onOpenApplicationAnalytics={() => setShowApplicationAnalytics(true)}
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
          setShowAIGenerateModal
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

// Resume Save to Cloud Modal Component
function ResumeSaveToCloudModal({ 
  onClose, 
  onConfirm,
  defaultFileName 
}: { 
  onClose: () => void; 
  onConfirm: (fileName: string, description: string, tags: string[]) => void;
  defaultFileName: string;
}) {
  const [fileName, setFileName] = useState(defaultFileName);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Cloud size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Save Resume to Cloud</h3>
              <p className="text-sm text-gray-600">Store your resume securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Resume name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your resume"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(fileName, description, tags)}
            disabled={!fileName.trim()}
            className={`flex-1 px-4 py-2 text-white rounded-lg ${
              !fileName.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Save to Cloud
          </button>
        </div>
      </div>
    </div>
  );
}

// Resume Import from Cloud Modal Component
function ResumeImportFromCloudModal({ 
  files, 
  onClose,
  onLoad 
}: { 
  files: ResumeFile[];
  onClose: () => void;
  onLoad: (file: ResumeFile) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Import Resume from Cloud</h3>
              <p className="text-sm text-gray-600">Select a resume to load</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resumes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No resumes found</p>
            </div>
          ) : (
            filteredFiles.map(file => (
              <div
                key={file.id}
                onClick={() => onLoad(file)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{file.name}</h4>
                    <p className="text-sm text-gray-600">{file.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Modified: {file.lastModified}</span>
                      <span>Size: {file.size}</span>
                      <span>Version: {file.version}</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Download size={18} className="text-purple-600" />
                  </button>
                </div>
                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {file.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}