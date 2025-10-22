'use client';

import React from 'react';
import { useSidebar } from '../hooks/useSidebar';
import { useResumeData } from '../hooks/useResumeData';
import { useModals } from '../hooks/useModals';
import Sidebar from './layout/Sidebar';
import MainContent from './layout/MainContent';

export default function RoleReadyRefactored() {
  const {
    sidebarCollapsed,
    activeTab,
    handleTabChange,
    toggleSidebar
  } = useSidebar();

  const {
    resumeData,
    updateResumeData,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
    addEducation,
    updateEducation,
    removeEducation,
    addCertification,
    updateCertification,
    removeCertification,
    addSkill,
    removeSkill
  } = useResumeData();

  const {
    showNewResumeModal,
    showAIOptimize,
    showAIGenerate,
    showAIGenerateModal,
    showVersionManager,
    showCreateVersion,
    showCompareVersions,
    showRightPanel,
    showATSScore,
    showAIConfirmation,
    showTailorConfirmation,
    openModal,
    closeModal,
    closeAllModals
  } = useModals();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        onTabChange={handleTabChange}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Content Area */}
      <MainContent
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        resumeData={resumeData}
        onUpdateResumeData={updateResumeData}
        onAddExperience={addExperience}
        onUpdateExperience={updateExperience}
        onRemoveExperience={removeExperience}
        onAddProject={addProject}
        onUpdateProject={updateProject}
        onRemoveProject={removeProject}
        onAddEducation={addEducation}
        onUpdateEducation={updateEducation}
        onRemoveEducation={removeEducation}
        onAddCertification={addCertification}
        onUpdateCertification={updateCertification}
        onRemoveCertification={removeCertification}
        onAddSkill={addSkill}
        onRemoveSkill={removeSkill}
      />
    </div>
  );
}
