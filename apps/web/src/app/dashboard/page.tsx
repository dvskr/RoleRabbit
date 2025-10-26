'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
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
import { Eye, Sparkles, GripVertical, Trash2, Plus, X, Cloud, Upload, Download } from 'lucide-react';
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
import ATSChecker from '../../components/features/ATSChecker';
import ResumeSharing from '../../components/features/ResumeSharing';
import CoverLetterAnalytics from '../../components/CoverLetterAnalytics';
import EmailAnalytics from '../../components/email/EmailAnalytics';
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
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [previousSidebarState, setPreviousSidebarState] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('ats-classic');
  const [addedTemplates, setAddedTemplates] = useState<string[]>(['ats-classic', 'ats-modern']);
  
  // Cloud Storage State
  const [showSaveToCloudModal, setShowSaveToCloudModal] = useState(false);
  const [showImportFromCloudModal, setShowImportFromCloudModal] = useState(false);
  const [cloudResumes, setCloudResumes] = useState<ResumeFile[]>([]);

  // New Features State
  const [showATSChecker, setShowATSChecker] = useState(false);
  const [showResumeSharing, setShowResumeSharing] = useState(false);
  const [showCoverLetterAnalytics, setShowCoverLetterAnalytics] = useState(false);
  const [showEmailAnalytics, setShowEmailAnalytics] = useState(false);

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
      case 'home':
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
          />
        );
      case 'profile':
        return <Profile />;
      case 'storage':
        return <CloudStorage />;
      case 'editor':
        return (
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
              onDuplicate={handleDuplicateResume}
              onSave={saveResume}
              onToggleAIPanel={() => setShowRightPanel(!showRightPanel)}
              onShowMobileMenu={() => setShowMobileMenu(true)}
              onShowATSChecker={() => setShowATSChecker(true)}
              onShowResumeSharing={() => setShowResumeSharing(true)}
              showRightPanel={showRightPanel}
              previousSidebarState={previousSidebarState}
              sidebarCollapsed={sidebarCollapsed}
              setPreviousSidebarState={setPreviousSidebarState}
              setSidebarCollapsed={setSidebarCollapsed}
              setShowRightPanel={setShowRightPanel}
            />
          ) : (
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'storage' ? 'Storage' : 
                 activeTab === 'tracker' ? 'Tracker' : 
                 activeTab === 'discussion' ? 'Discussion' :
                 activeTab === 'email' ? 'Email' :
                 activeTab === 'cover-letter' ? 'Cover Letter' :
                 activeTab === 'templates' ? 'Templates' :
                 activeTab === 'profile' ? 'Profile' : ''}
              </h1>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 h-full overflow-hidden">
              {renderActiveComponent()}
            </div>
            {/* AI Panel */}
            {activeTab === 'editor' && (
              <AIPanel
                showRightPanel={showRightPanel}
                setShowRightPanel={setShowRightPanel}
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
                onAnalyzeJobDescription={analyzeJobDescription}
                onApplyAIRecommendations={applyAIRecommendations}
                onSendAIMessage={sendAIMessage}
              />
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
          // TODO: Implement export functionality
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

      {/* ATS Checker Modal */}
      {showATSChecker && (
        <ATSChecker
          resumeData={resumeData}
          isOpen={showATSChecker}
          onClose={() => setShowATSChecker(false)}
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