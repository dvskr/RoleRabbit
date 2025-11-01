'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Shield, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Briefcase,
  Award,
  Target,
  FileText,
  BarChart3,
  LogOut
} from 'lucide-react';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

import {
  ProfileHeader,
  ProfileSidebar,
  ProfileTab,
  ProfessionalTab,
  SkillsTab,
  CareerTab,
  PortfolioTab,
  AnalyticsTab,
  SecurityTab,
  BillingTab,
  PreferencesTab,
  SupportTab,
  ResumeImport,
  UserData,
  ProfileTabConfig
} from './profile/index';

export default function Profile() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { userData: contextUserData, isLoading: contextLoading, refreshProfile, updateProfileData } = useProfile();
  const { isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use profile data from context (loaded once at app startup)
  const userData = contextUserData;
  const isLoading = contextLoading;

  const tabs: ProfileTabConfig[] = [
    { id: 'profile', label: 'Personal Information', icon: UserCircle },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills & Expertise', icon: Award },
    { id: 'career', label: 'Career Goals', icon: Target },
    { id: 'portfolio', label: 'Portfolio', icon: FileText },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Create default empty data for first-time users
  const defaultUserData: UserData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profilePicture: null,
    currentRole: '',
    currentCompany: '',
    experience: '',
    industry: '',
    jobLevel: '',
    employmentType: '',
    availability: '',
    salaryExpectation: '',
    workPreference: '',
    skills: [],
    certifications: [],
    languages: [],
    education: [],
    careerGoals: [],
    targetRoles: [],
    targetCompanies: [],
    relocationWillingness: '',
    portfolio: '',
    linkedin: '',
    github: '',
    website: '',
    socialLinks: [],
    projects: [],
    achievements: [],
    careerTimeline: [],
    jobAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    privacyLevel: 'Professional',
    profileVisibility: 'Public',
    profileViews: 0,
    applicationsSent: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    successRate: 0,
    profileCompleteness: 0,
    skillMatchRate: 0,
    avgResponseTime: 0,
  };

  // Use userData if available, otherwise use default empty data
  const displayData = userData || defaultUserData;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save user profile via API using displayData
      await apiService.updateUserProfile(displayData);
      logger.debug('Profile saved via API:', displayData);
      // Refresh profile data from context after saving
      await refreshProfile();
      setIsSaving(false);
      setIsEditing(false);
    } catch (error) {
      logger.error('Failed to save profile:', error);
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleUserDataChange = (data: Partial<UserData>) => {
    // Update profile data in context
    updateProfileData(data);
  };

  const handleChangePhoto = () => {
    // Handle profile picture change
  };

  // Show loading state only when actually loading
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }


  const handleResumeImport = (parsedData: any) => {
    // Auto-fill profile data from resume
    const updates: Partial<UserData> = {};

    if (parsedData.personalInfo) {
      if (parsedData.personalInfo.firstName) updates.firstName = parsedData.personalInfo.firstName;
      if (parsedData.personalInfo.lastName) updates.lastName = parsedData.personalInfo.lastName;
      if (parsedData.personalInfo.email) updates.email = parsedData.personalInfo.email;
      if (parsedData.personalInfo.phone) updates.phone = parsedData.personalInfo.phone;
      if (parsedData.personalInfo.location) updates.location = parsedData.personalInfo.location;
    }

    if (parsedData.professionalSummary) {
      updates.professionalSummary = parsedData.professionalSummary;
    }

    if (parsedData.skills && parsedData.skills.length > 0) {
      updates.skills = parsedData.skills;
    }

    if (parsedData.education && parsedData.education.length > 0) {
      updates.education = parsedData.education;
    }

    if (parsedData.certifications && parsedData.certifications.length > 0) {
      updates.certifications = parsedData.certifications;
    }

    // Apply all updates to context
    if (Object.keys(updates).length > 0) {
      updateProfileData(updates);
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      userData: displayData,
      isEditing,
      onUserDataChange: handleUserDataChange
    };

    switch (activeTab) {
      case 'profile':
        return <ProfileTab {...commonProps} onChangePhoto={handleChangePhoto} />;
      case 'professional':
        return <ProfessionalTab {...commonProps} />;
      case 'skills':
        return <SkillsTab {...commonProps} />;
      case 'career':
        return <CareerTab {...commonProps} />;
      case 'portfolio':
        return <PortfolioTab {...commonProps} />;
      case 'analytics':
        return <AnalyticsTab userData={displayData} />;
      case 'security':
        return <SecurityTab />;
      case 'billing':
        return <BillingTab />;
      case 'preferences':
        return <PreferencesTab {...commonProps} />;
      case 'support':
        return <SupportTab />;
      default:
        return (
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">This section is coming soon...</p>
                  </div>
        );
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* Enhanced Header */}
      <ProfileHeader
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
        resumeImportButton={<ResumeImport onResumeImport={handleResumeImport} />}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Enhanced Sidebar with Proper Spacing */}
        <ProfileSidebar
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={setActiveTab}
        />

        {/* Enhanced Main Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4">
            <div className="max-w-6xl mx-auto">
              {renderTabContent()}
                      </div>
          </div>
        </div>
      </div>
    </div>
  );
}
