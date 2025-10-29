'use client';

import React, { useState } from 'react';
import { X, FileText, DollarSign, Building2, UserPlus, ClipboardList, Bell } from 'lucide-react';
import { logger } from '../../utils/logger';
import { Job } from '../../types/job';
import { 
  InterviewTracker, 
  SalaryTracker, 
  CompanyInsights, 
  ReferralTracker, 
  NotesPanel, 
  RemindersPanel 
} from './index';
import { useTheme } from '../../contexts/ThemeContext';

interface JobDetailViewProps {
  job: Job;
  onClose: () => void;
}

type TabType = 'interview' | 'salary' | 'company' | 'referral' | 'notes' | 'reminders';

export default function JobDetailView({ job, onClose }: JobDetailViewProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  const tabs = [
    { id: 'notes' as TabType, label: 'Notes', icon: ClipboardList },
    { id: 'interview' as TabType, label: 'Interview', icon: FileText },
    { id: 'salary' as TabType, label: 'Salary', icon: DollarSign },
    { id: 'company' as TabType, label: 'Company', icon: Building2 },
    { id: 'referral' as TabType, label: 'Referral', icon: UserPlus },
    { id: 'reminders' as TabType, label: 'Reminders', icon: Bell },
  ];

  const handleAddInterviewNote = (jobId: string, note: any) => {
    logger.debug('Add interview note:', jobId, note);
    // TODO: Implement actual state management
  };

  const handleDeleteInterviewNote = (jobId: string, noteId: string) => {
    logger.debug('Delete interview note:', jobId, noteId);
    // TODO: Implement actual state management
  };

  const handleAddSalaryOffer = (jobId: string, offer: any) => {
    logger.debug('Add salary offer:', jobId, offer);
    // TODO: Implement actual state management
  };

  const handleDeleteSalaryOffer = (jobId: string, offerId: string) => {
    logger.debug('Delete salary offer:', jobId, offerId);
    // TODO: Implement actual state management
  };

  const handleAddCompanyInsight = (jobId: string, insight: any) => {
    logger.debug('Add company insight:', jobId, insight);
    // TODO: Implement actual state management
  };

  const handleDeleteCompanyInsight = (jobId: string, insightId: string) => {
    logger.debug('Delete company insight:', jobId, insightId);
    // TODO: Implement actual state management
  };

  const handleAddReferral = (jobId: string, referral: any) => {
    logger.debug('Add referral:', jobId, referral);
    // TODO: Implement actual state management
  };

  const handleDeleteReferral = (jobId: string, referralId: string) => {
    logger.debug('Delete referral:', jobId, referralId);
    // TODO: Implement actual state management
  };

  const handleAddNote = (jobId: string, note: any) => {
    logger.debug('Add note:', jobId, note);
    // TODO: Implement actual state management
  };

  const handleDeleteNote = (jobId: string, noteId: string) => {
    logger.debug('Delete note:', jobId, noteId);
    // TODO: Implement actual state management
  };

  const handleAddReminder = (jobId: string, reminder: any) => {
    logger.debug('Add reminder:', jobId, reminder);
    // TODO: Implement actual state management
  };

  const handleDeleteReminder = (jobId: string, reminderId: string) => {
    logger.debug('Delete reminder:', jobId, reminderId);
    // TODO: Implement actual state management
  };

  const handleToggleComplete = (jobId: string, reminderId: string) => {
    logger.debug('Toggle reminder:', jobId, reminderId);
    // TODO: Implement actual state management
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
    >
      <div 
        className="rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col pointer-events-auto shadow-2xl"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div 
          className="p-4 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
            color: 'white',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 
              className="text-lg font-bold"
              style={{ color: 'white' }}
            >
              {job.title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded transition-all"
              style={{ color: 'white' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={20} />
            </button>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {job.company} • {job.location || 'Location not specified'}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', marginTop: '4px' }}>
            {job.salary ? `Salary: ${job.salary}` : 'Salary not specified'}
          </p>
        </div>

        {/* Tabs */}
        <div 
          className="px-6 flex-shrink-0"
          style={{
            background: colors.toolbarBackground,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2.5 flex items-center gap-2 transition-all"
                  style={{
                    borderBottom: `2px solid ${isActive ? colors.primaryBlue : 'transparent'}`,
                    color: isActive ? colors.primaryBlue : colors.secondaryText,
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = colors.primaryText;
                      e.currentTarget.style.background = colors.hoverBackground;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = colors.secondaryText;
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={16} />
                  <span className="whitespace-nowrap text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6"
          style={{ background: colors.background }}
        >
          {activeTab === 'interview' && (
            <InterviewTracker
              jobId={job.id}
              notes={[]}
              onAddNote={(note) => handleAddInterviewNote(job.id, note)}
              onDeleteNote={(noteId) => handleDeleteInterviewNote(job.id, noteId)}
            />
          )}

          {activeTab === 'salary' && (
            <SalaryTracker
              jobId={job.id}
              offers={[]}
              onAddOffer={(offer) => handleAddSalaryOffer(job.id, offer)}
              onDeleteOffer={(offerId) => handleDeleteSalaryOffer(job.id, offerId)}
            />
          )}

          {activeTab === 'company' && (
            <CompanyInsights
              jobId={job.id}
              insights={[]}
              onAddInsight={(insight) => handleAddCompanyInsight(job.id, insight)}
              onDeleteInsight={(insightId) => handleDeleteCompanyInsight(job.id, insightId)}
            />
          )}

          {activeTab === 'referral' && (
            <ReferralTracker
              jobId={job.id}
              referrals={[]}
              onAddReferral={(referral) => handleAddReferral(job.id, referral)}
              onDeleteReferral={(referralId) => handleDeleteReferral(job.id, referralId)}
            />
          )}

          {activeTab === 'notes' && (
            <NotesPanel
              jobId={job.id}
              notes={[]}
              onAddNote={(note) => handleAddNote(job.id, note)}
              onDeleteNote={(noteId) => handleDeleteNote(job.id, noteId)}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersPanel
              jobId={job.id}
              reminders={[]}
              onAddReminder={(reminder) => handleAddReminder(job.id, reminder)}
              onDeleteReminder={(reminderId) => handleDeleteReminder(job.id, reminderId)}
              onToggleReminder={(reminderId) => handleToggleComplete(job.id, reminderId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

