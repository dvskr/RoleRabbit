'use client';

import React, { useState } from 'react';
import { X, FileText, DollarSign, Building2, UserPlus, ClipboardList, Bell } from 'lucide-react';
import { Job } from '../../types/job';
import { 
  InterviewTracker, 
  SalaryTracker, 
  CompanyInsights, 
  ReferralTracker, 
  NotesPanel, 
  RemindersPanel 
} from './index';

interface JobDetailViewProps {
  job: Job;
  onClose: () => void;
}

type TabType = 'interview' | 'salary' | 'company' | 'referral' | 'notes' | 'reminders';

export default function JobDetailView({ job, onClose }: JobDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  const tabs = [
    { id: 'notes' as TabType, label: 'Notes', icon: ClipboardList },
    { id: 'interview' as TabType, label: 'Interview', icon: FileText },
    { id: 'salary' as TabType, label: 'Salary', icon: DollarSign },
    { id: 'company' as TabType, label: 'Company', icon: Building2 },
    { id: 'referral' as TabType, label: 'Referral', icon: UserPlus },
    { id: 'reminders' as TabType, label: 'Reminders', icon: Bell },
  ];

  const handleAddInterviewNote = (note: any) => {
    console.log('Add interview note:', note);
    // TODO: Implement actual state management
  };

  const handleUpdateInterviewNote = (noteId: string, updates: any) => {
    console.log('Update interview note:', noteId, updates);
    // TODO: Implement actual state management
  };

  const handleDeleteInterviewNote = (noteId: string) => {
    console.log('Delete interview note:', noteId);
    // TODO: Implement actual state management
  };

  const handleAddSalaryOffer = (offer: any) => {
    console.log('Add salary offer:', offer);
    // TODO: Implement actual state management
  };

  const handleUpdateSalaryOffer = (offerId: string, updates: any) => {
    console.log('Update salary offer:', offerId, updates);
    // TODO: Implement actual state management
  };

  const handleDeleteSalaryOffer = (offerId: string) => {
    console.log('Delete salary offer:', offerId);
    // TODO: Implement actual state management
  };

  const handleAddCompanyInsight = (insight: any) => {
    console.log('Add company insight:', insight);
    // TODO: Implement actual state management
  };

  const handleUpdateCompanyInsight = (insightId: string, updates: any) => {
    console.log('Update company insight:', insightId, updates);
    // TODO: Implement actual state management
  };

  const handleDeleteCompanyInsight = (insightId: string) => {
    console.log('Delete company insight:', insightId);
    // TODO: Implement actual state management
  };

  const handleAddReferral = (referral: any) => {
    console.log('Add referral:', referral);
    // TODO: Implement actual state management
  };

  const handleUpdateReferral = (referralId: string, updates: any) => {
    console.log('Update referral:', referralId, updates);
    // TODO: Implement actual state management
  };

  const handleDeleteReferral = (referralId: string) => {
    console.log('Delete referral:', referralId);
    // TODO: Implement actual state management
  };

  const handleAddNote = (note: any) => {
    console.log('Add note:', note);
    // TODO: Implement actual state management
  };

  const handleUpdateNote = (noteId: string, updates: any) => {
    console.log('Update note:', noteId, updates);
    // TODO: Implement actual state management
  };

  const handleDeleteNote = (noteId: string) => {
    console.log('Delete note:', noteId);
    // TODO: Implement actual state management
  };

  const handleAddReminder = (reminder: any) => {
    console.log('Add reminder:', reminder);
    // TODO: Implement actual state management
  };

  const handleUpdateReminder = (reminderId: string, updates: any) => {
    console.log('Update reminder:', reminderId, updates);
    // TODO: Implement actual state management
  };

  const handleDeleteReminder = (reminderId: string) => {
    console.log('Delete reminder:', reminderId);
    // TODO: Implement actual state management
  };

  const handleToggleComplete = (reminderId: string, isCompleted: boolean) => {
    console.log('Toggle reminder:', reminderId, isCompleted);
    // TODO: Implement actual state management
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">{job.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-blue-100">{job.company} • {job.location || 'Location not specified'}</p>
          <p className="text-blue-200 text-sm mt-1">
            {job.salary ? `Salary: ${job.salary}` : 'Salary not specified'}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 bg-gray-50 flex-shrink-0">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-medium bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'interview' && (
            <InterviewTracker
              jobId={job.id}
              interviewNotes={[]}
              onAddNote={handleAddInterviewNote}
              onUpdateNote={handleUpdateInterviewNote}
              onDeleteNote={handleDeleteInterviewNote}
            />
          )}

          {activeTab === 'salary' && (
            <SalaryTracker
              jobId={job.id}
              salaryOffers={[]}
              onAddOffer={handleAddSalaryOffer}
              onUpdateOffer={handleUpdateSalaryOffer}
              onDeleteOffer={handleDeleteSalaryOffer}
            />
          )}

          {activeTab === 'company' && (
            <CompanyInsights
              jobId={job.id}
              insights={[]}
              onAddInsight={handleAddCompanyInsight}
              onUpdateInsight={handleUpdateCompanyInsight}
              onDeleteInsight={handleDeleteCompanyInsight}
            />
          )}

          {activeTab === 'referral' && (
            <ReferralTracker
              jobId={job.id}
              referrals={[]}
              onAddReferral={handleAddReferral}
              onUpdateReferral={handleUpdateReferral}
              onDeleteReferral={handleDeleteReferral}
            />
          )}

          {activeTab === 'notes' && (
            <NotesPanel
              jobId={job.id}
              notes={[]}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersPanel
              jobId={job.id}
              reminders={[]}
              onAddReminder={handleAddReminder}
              onUpdateReminder={handleUpdateReminder}
              onDeleteReminder={handleDeleteReminder}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

