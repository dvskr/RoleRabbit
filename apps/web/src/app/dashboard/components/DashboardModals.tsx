'use client';

import React from 'react';
import { ResumeData, SectionVisibility, CustomSection } from '../../../types/resume';
import { CustomField } from '../../../types/resume';
import { ResumeFile } from '../../../types/cloudStorage';
import { DashboardTab } from '../constants/dashboard.constants';

// Lazy load modals
import dynamic from 'next/dynamic';
const ExportModal = dynamic(() => import('../../../components/modals').then(mod => mod.ExportModal), { ssr: false });
const ImportModal = dynamic(() => import('../../../components/modals').then(mod => mod.ImportModal), { ssr: false });
const AddSectionModal = dynamic(() => import('../../../components/modals').then(mod => mod.AddSectionModal), { ssr: false });
const AddFieldModal = dynamic(() => import('../../../components/modals').then(mod => mod.AddFieldModal), { ssr: false });
const NewResumeModal = dynamic(() => import('../../../components/modals').then(mod => mod.NewResumeModal), { ssr: false });
const MobileMenuModal = dynamic(() => import('../../../components/modals').then(mod => mod.MobileMenuModal), { ssr: false });
const AIGenerateModal = dynamic(() => import('../../../components/modals').then(mod => mod.AIGenerateModal), { ssr: false });
const ResumeSaveToCloudModal = dynamic(() => import('../../../components/modals').then(mod => mod.ResumeSaveToCloudModal), { ssr: false });
const ResumeImportFromCloudModal = dynamic(() => import('../../../components/modals').then(mod => mod.ResumeImportFromCloudModal), { ssr: false });
const CoverLetterAnalytics = dynamic(() => import('../../../components/CoverLetterAnalytics'), { ssr: false });
const EmailAnalytics = dynamic(() => import('../../../components/email/EmailAnalytics'), { ssr: false });
const ApplicationAnalytics = dynamic(() => import('../../../components/ApplicationAnalytics'), { ssr: false });

interface DashboardModalsProps {
  // Modal visibility states
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  showAddSectionModal: boolean;
  setShowAddSectionModal: (show: boolean) => void;
  showAddFieldModal: boolean;
  setShowAddFieldModal: (show: boolean) => void;
  showNewResumeModal: boolean;
  setShowNewResumeModal: (show: boolean) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  showAIGenerateModal: boolean;
  setShowAIGenerateModal: (show: boolean) => void;
  showSaveToCloudModal: boolean;
  setShowSaveToCloudModal: (show: boolean) => void;
  showImportFromCloudModal: boolean;
  setShowImportFromCloudModal: (show: boolean) => void;
  showCoverLetterAnalytics: boolean;
  setShowCoverLetterAnalytics: (show: boolean) => void;
  showEmailAnalytics: boolean;
  setShowEmailAnalytics: (show: boolean) => void;
  showApplicationAnalytics: boolean;
  setShowApplicationAnalytics: (show: boolean) => void;

  // Modal data
  importMethod: string;
  setImportMethod: (method: string) => void;
  importJsonData: string;
  setImportJsonData: (data: string) => void;
  newSectionName: string;
  setNewSectionName: (name: string) => void;
  newSectionContent: string;
  setNewSectionContent: (content: string) => void;
  newFieldName: string;
  setNewFieldName: (name: string) => void;
  newFieldIcon: string;
  setNewFieldIcon: (icon: string) => void;
  aiGenerateSection: string;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  writingTone: string;
  setWritingTone: (tone: string) => void;
  contentLength: string;
  setContentLength: (length: string) => void;

  // Resume data
  resumeFileName: string;
  resumeData: ResumeData;
  customSections: CustomSection[];
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  selectedTemplateId: string | null;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  sectionSpacing: string;
  margins: string;
  headingStyle: string;
  bulletStyle: string;
  customFields: CustomField[];
  setCustomFields: (fields: CustomField[]) => void;
  cloudResumes: ResumeFile[];

  // Navigation
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab | string) => void;

  // Handlers
  onExport: (format: string) => void;
  onSaveToCloud: () => void;
  onImport: () => void;
  onImportFromCloud: () => void;
  onFileSelected: (file: File) => void;
  onAddSection: () => void;
  onOpenAIGenerateModal: (section: string) => void;
  onAddField: () => void;
  onNewResume: () => void;
  onGenerateAIContent: () => void;
  onConfirmSaveToCloud: (fileName: string, description: string) => void;
  onLoadFromCloud: (file: ResumeFile) => void;
  DEFAULT_TEMPLATE_ID: string;
}

export function DashboardModals(props: DashboardModalsProps) {
  const {
    showExportModal,
    setShowExportModal,
    showImportModal,
    setShowImportModal,
    showAddSectionModal,
    setShowAddSectionModal,
    showAddFieldModal,
    setShowAddFieldModal,
    showNewResumeModal,
    setShowNewResumeModal,
    showMobileMenu,
    setShowMobileMenu,
    showAIGenerateModal,
    setShowAIGenerateModal,
    showSaveToCloudModal,
    setShowSaveToCloudModal,
    showImportFromCloudModal,
    setShowImportFromCloudModal,
    showCoverLetterAnalytics,
    setShowCoverLetterAnalytics,
    showEmailAnalytics,
    setShowEmailAnalytics,
    showApplicationAnalytics,
    setShowApplicationAnalytics,
    importMethod,
    setImportMethod,
    importJsonData,
    setImportJsonData,
    newSectionName,
    setNewSectionName,
    newSectionContent,
    setNewSectionContent,
    newFieldName,
    setNewFieldName,
    newFieldIcon,
    setNewFieldIcon,
    aiGenerateSection,
    aiPrompt,
    setAiPrompt,
    writingTone,
    setWritingTone,
    contentLength,
    setContentLength,
    resumeFileName,
    resumeData,
    customSections,
    sectionOrder,
    sectionVisibility,
    selectedTemplateId,
    fontFamily,
    fontSize,
    lineSpacing,
    sectionSpacing,
    margins,
    headingStyle,
    bulletStyle,
    customFields,
    cloudResumes,
    activeTab,
    onTabChange,
    onExport,
    onSaveToCloud,
    onImport,
    onImportFromCloud,
    onFileSelected,
    onAddSection,
    onOpenAIGenerateModal,
    onAddField,
    onNewResume,
    onGenerateAIContent,
    onConfirmSaveToCloud,
    onLoadFromCloud,
    DEFAULT_TEMPLATE_ID,
  } = props;

  return (
    <>
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
        onExport={onExport}
        onSaveToCloud={onSaveToCloud}
      />

      {/* Import Resume Modal */}
      <ImportModal
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        importMethod={importMethod}
        setImportMethod={setImportMethod}
        importJsonData={importJsonData}
        setImportJsonData={setImportJsonData}
        onImport={onImport}
        onImportFromCloud={onImportFromCloud}
        onFileSelected={onFileSelected}
      />

      {/* Add Custom Section Modal */}
      <AddSectionModal
        showAddSectionModal={showAddSectionModal}
        setShowAddSectionModal={setShowAddSectionModal}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        newSectionContent={newSectionContent}
        setNewSectionContent={setNewSectionContent}
        onAddSection={onAddSection}
        onOpenAIGenerateModal={onOpenAIGenerateModal}
      />

      {/* Add Custom Field Modal */}
      <AddFieldModal
        showAddFieldModal={showAddFieldModal}
        setShowAddFieldModal={setShowAddFieldModal}
        newFieldName={newFieldName}
        setNewFieldName={setNewFieldName}
        newFieldIcon={newFieldIcon}
        setNewFieldIcon={setNewFieldIcon}
        onAddField={onAddField}
      />

      {/* New Resume Modal */}
      <NewResumeModal
        showNewResumeModal={showNewResumeModal}
        setShowNewResumeModal={setShowNewResumeModal}
        onNewResume={onNewResume}
      />

      {/* Mobile Menu Modal */}
      <MobileMenuModal
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        activeTab={activeTab}
        onTabChange={onTabChange}
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
        onGenerate={onGenerateAIContent}
      />

      {/* Save to Cloud Modal */}
      {showSaveToCloudModal && (
        <ResumeSaveToCloudModal
          onClose={() => setShowSaveToCloudModal(false)}
          onConfirm={onConfirmSaveToCloud}
          defaultFileName={resumeFileName}
        />
      )}

      {/* Import from Cloud Modal */}
      {showImportFromCloudModal && (
        <ResumeImportFromCloudModal
          files={cloudResumes}
          onClose={() => setShowImportFromCloudModal(false)}
          onLoad={onLoadFromCloud}
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

