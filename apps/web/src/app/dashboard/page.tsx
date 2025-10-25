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
import { Eye, Sparkles, GripVertical, Trash2, Plus, X } from 'lucide-react';
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
import { exportHelpers } from '../../utils/exportHelpers';
import { aiHelpers } from '../../utils/aiHelpers';
import {
  ExportModal,
  ImportModal,
  AddSectionModal,
  AddFieldModal,
  NewResumeModal,
  MobileMenuModal,
  AIGenerateModal
} from '../../components/modals';
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
    console.log('Rendering component for activeTab:', activeTab);
    switch (activeTab) {
      case 'home':
        return <Home />;
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
          />
        );
      case 'templates':
        return <Templates />;
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
              onSave={saveResume}
              onToggleAIPanel={() => setShowRightPanel(!showRightPanel)}
              onShowMobileMenu={() => setShowMobileMenu(true)}
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
                 activeTab === 'profile' ? 'Profile' : 'Home'}
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
        onExport={(format) => exportHelpers.exportResume(
          format,
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
        )}
      />

      {/* Import Resume Modal */}
      <ImportModal
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        importMethod={importMethod}
        setImportMethod={setImportMethod}
        importJsonData={importJsonData}
        setImportJsonData={setImportJsonData}
        onImport={() => exportHelpers.importResume(
          importMethod,
          importJsonData,
          setResumeData,
          setCustomSections,
          setSectionOrder,
          setSectionVisibility,
          setFontFamily,
          setFontSize,
          setLineSpacing,
          setSectionSpacing,
          setMargins,
          setHeadingStyle,
          setBulletStyle,
          setResumeFileName,
          setShowImportModal,
          setImportJsonData
        )}
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
    </>
  );
}