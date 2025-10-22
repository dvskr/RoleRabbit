'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import UserProfileModal from '../UserProfileModal';
import JobTracker from '../JobTracker';
import Templates from '../Templates';
import Discussion from '../Discussion';
import Home from '../Home';
import Email from '../Email';
import ResumeEditor from '../editor/ResumeEditor';

interface MainContentProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  resumeData?: any;
  onUpdateResumeData?: (updates: any) => void;
  onAddExperience?: (experience: any) => void;
  onUpdateExperience?: (id: number, updates: any) => void;
  onRemoveExperience?: (id: number) => void;
  onAddProject?: (project: any) => void;
  onUpdateProject?: (id: number, updates: any) => void;
  onRemoveProject?: (id: number) => void;
  onAddEducation?: (education: any) => void;
  onUpdateEducation?: (id: number, updates: any) => void;
  onRemoveEducation?: (id: number) => void;
  onAddCertification?: (certification: any) => void;
  onUpdateCertification?: (id: number, updates: any) => void;
  onRemoveCertification?: (id: number) => void;
  onAddSkill?: (skill: string) => void;
  onRemoveSkill?: (skill: string) => void;
}

export default function MainContent({ 
  activeTab, 
  sidebarCollapsed,
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
}: MainContentProps) {
  return (
    <div className={`flex-1 overflow-hidden transition-all duration-300 ${
      sidebarCollapsed ? 'ml-0' : 'ml-0'
    }`}>
      {/* Resume Editor */}
      {activeTab === 'editor' && resumeData && onUpdateResumeData && (
        <div className="flex-1 overflow-hidden">
          <ResumeEditor
            resumeData={resumeData}
            onUpdateResumeData={onUpdateResumeData}
            onAddExperience={onAddExperience!}
            onUpdateExperience={onUpdateExperience!}
            onRemoveExperience={onRemoveExperience!}
            onAddProject={onAddProject!}
            onUpdateProject={onUpdateProject!}
            onRemoveProject={onRemoveProject!}
            onAddEducation={onAddEducation!}
            onUpdateEducation={onUpdateEducation!}
            onRemoveEducation={onRemoveEducation!}
            onAddCertification={onAddCertification!}
            onUpdateCertification={onUpdateCertification!}
            onRemoveCertification={onRemoveCertification!}
            onAddSkill={onAddSkill!}
            onRemoveSkill={onRemoveSkill!}
          />
        </div>
      )}

      {/* Home */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-hidden">
          <Home />
        </div>
      )}

      {/* Job Tracker */}
      {activeTab === 'tracker' && (
        <div className="flex-1 overflow-hidden">
          <JobTracker />
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="flex-1 overflow-hidden">
          <Templates />
        </div>
      )}

      {/* Discussion */}
      {activeTab === 'discussion' && (
        <div className="flex-1 overflow-hidden">
          <Discussion />
        </div>
      )}

      {/* Email */}
      {activeTab === 'email' && (
        <div className="flex-1 overflow-hidden">
          <Email />
        </div>
      )}

      {/* Cloud Storage */}
      {activeTab === 'storage' && (
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cloud Storage</h2>
              <p className="text-gray-600">Store and sync your resumes in the cloud</p>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon for other tabs */}
      {activeTab !== 'editor' && activeTab !== 'home' && activeTab !== 'tracker' && activeTab !== 'templates' && activeTab !== 'discussion' && activeTab !== 'email' && activeTab !== 'storage' && (
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Sparkles size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">This feature is under development</p>
          </div>
        </div>
      )}
    </div>
  );
}
