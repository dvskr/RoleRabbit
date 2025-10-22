'use client';

import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import ResumeToolbar from './ResumeToolbar';
import ResumePreview from './ResumePreview';
import ContactSection from './sections/ContactSection';
import SummarySection from './sections/SummarySection';
import SkillsSection from './sections/SkillsSection';
import ExperienceSection from './sections/ExperienceSection';
import ProjectSection from './sections/ProjectSection';
import EducationSection from './sections/EducationSection';
import CertificationSection from './sections/CertificationSection';

interface ResumeEditorProps {
  resumeData: ResumeData;
  onUpdateResumeData: (updates: Partial<ResumeData>) => void;
  onAddExperience: (experience: any) => void;
  onUpdateExperience: (id: number, updates: any) => void;
  onRemoveExperience: (id: number) => void;
  onAddProject: (project: any) => void;
  onUpdateProject: (id: number, updates: any) => void;
  onRemoveProject: (id: number) => void;
  onAddEducation: (education: any) => void;
  onUpdateEducation: (id: number, updates: any) => void;
  onRemoveEducation: (id: number) => void;
  onAddCertification: (certification: any) => void;
  onUpdateCertification: (id: number, updates: any) => void;
  onRemoveCertification: (id: number) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export default function ResumeEditor({
  resumeData,
  onUpdateResumeData,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onAddCertification,
  onUpdateCertification,
  onRemoveCertification,
  onAddSkill,
  onRemoveSkill
}: ResumeEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('ats');
  const [layoutMode, setLayoutMode] = useState('one-column');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Resume Toolbar */}
      <ResumeToolbar
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
      />

      {/* Main Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 bg-white overflow-y-auto`}>
          <div className="p-6 space-y-6">
            {/* Contact Section */}
            <ContactSection
              contactData={{
                name: resumeData.name,
                title: resumeData.title,
                email: resumeData.email,
                phone: resumeData.phone,
                location: resumeData.location,
                linkedin: resumeData.linkedin,
                github: resumeData.github,
                website: resumeData.website
              }}
              onUpdate={(updates) => onUpdateResumeData(updates)}
            />

            {/* Summary Section */}
            <SummarySection
              summary={resumeData.summary}
              onUpdate={(summary) => onUpdateResumeData({ summary })}
            />

            {/* Skills Section */}
            <SkillsSection
              skills={resumeData.skills}
              onAddSkill={onAddSkill}
              onRemoveSkill={onRemoveSkill}
            />

            {/* Experience Section */}
            <ExperienceSection
              experiences={resumeData.experience}
              onAddExperience={onAddExperience}
              onUpdateExperience={onUpdateExperience}
              onRemoveExperience={onRemoveExperience}
            />

            {/* Projects Section */}
            <ProjectSection
              projects={resumeData.projects}
              onAddProject={onAddProject}
              onUpdateProject={onUpdateProject}
              onRemoveProject={onRemoveProject}
            />

            {/* Education Section */}
            <EducationSection
              education={resumeData.education}
              onAddEducation={onAddEducation}
              onUpdateEducation={onUpdateEducation}
              onRemoveEducation={onRemoveEducation}
            />

            {/* Certifications Section */}
            <CertificationSection
              certifications={resumeData.certifications}
              onAddCertification={onAddCertification}
              onUpdateCertification={onUpdateCertification}
              onRemoveCertification={onRemoveCertification}
            />
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 bg-gray-100 overflow-y-auto">
            <ResumePreview
              resumeData={resumeData}
              template={selectedTemplate}
              layoutMode={layoutMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}
