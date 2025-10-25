'use client';

import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Briefcase,
  Award,
  Target,
  FileText,
  BarChart3,
  LucideIcon
} from 'lucide-react';

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
  UserData,
  ProfileTabConfig
} from './profile/index';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Comprehensive user data for career platform
  const [userData, setUserData] = useState<UserData>({
    // Basic Info
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Experienced software engineer with 5+ years of experience in full-stack development.',
    profilePicture: null,
    
    // Professional Info
    currentRole: 'Senior Software Engineer',
    currentCompany: 'Tech Corp',
    experience: '5+ years',
    industry: 'Technology',
    jobLevel: 'Senior',
    employmentType: 'Full-time',
    availability: 'Open to opportunities',
    salaryExpectation: '$120,000 - $150,000',
    workPreference: 'Hybrid',
    
    // Skills & Expertise
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
    languages: ['English (Native)', 'Spanish (Fluent)', 'French (Conversational)'],
    
    // Career Goals
    careerGoals: 'Looking to transition into a tech lead role',
    targetRoles: ['Tech Lead', 'Senior Developer', 'Architect'],
    targetCompanies: ['Google', 'Microsoft', 'Apple'],
    relocationWillingness: 'Open to relocation',
    
    // Portfolio & Links
    portfolio: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.com',
    
    // Preferences
    jobAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    privacyLevel: 'Professional',
    profileVisibility: 'Public',
    
    // Analytics & Insights
    profileViews: 1247,
    applicationsSent: 23,
    interviewsScheduled: 8,
    offersReceived: 2,
    successRate: 8.7
  });

  const tabs: ProfileTabConfig[] = [
    { id: 'profile', label: 'Profile', icon: User },
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

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleUserDataChange = (data: Partial<UserData>) => {
    setUserData((prev: UserData) => ({ ...prev, ...data }));
  };

  const handleChangePhoto = () => {
    // Handle profile picture change
    console.log('Change photo clicked');
  };

  const renderTabContent = () => {
    const commonProps = {
      userData,
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
        return <AnalyticsTab userData={userData} />;
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
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col overflow-hidden">
      {/* Enhanced Header */}
      <ProfileHeader
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
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
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}