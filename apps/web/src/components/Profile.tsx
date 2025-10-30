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
  LucideIcon,
  LogOut
} from 'lucide-react';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
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
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Comprehensive user data for career platform
  const [userData, setUserData] = useState<UserData | null>(null);

  // Load user profile from API on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUserProfile();
      if (response && response.user) {
        // Map API response to UserData format and ensure analytics properties exist
        const userProfile = response.user as UserData;
        
        // Ensure analytics properties have default values if missing
        const userDataWithDefaults: UserData = {
          ...userProfile,
          profileViews: userProfile.profileViews || 0,
          applicationsSent: userProfile.applicationsSent || 0,
          interviewsScheduled: userProfile.interviewsScheduled || 0,
          offersReceived: userProfile.offersReceived || 0,
          successRate: userProfile.successRate || 0,
          profileCompleteness: userProfile.profileCompleteness || 0,
          skillMatchRate: userProfile.skillMatchRate || 0,
          avgResponseTime: userProfile.avgResponseTime || 0,
        };
        
        setUserData(userDataWithDefaults);
      }
    } catch (error) {
      logger.error('Failed to load user profile:', error);
      // Fallback to default demo data
      setUserData({
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
    professionalSummary: {
      overview: 'Seasoned full-stack engineer with expertise in modern web technologies, cloud infrastructure, and scalable system design.',
      keyStrengths: ['Full-stack development', 'System architecture', 'Cloud infrastructure', 'Team leadership'],
      currentFocus: 'Leading migration to microservices architecture and optimizing application performance',
      achievements: ['Reduced app load time by 60%', 'Led team of 5 engineers', 'Deployed 100+ production releases'],
      lookingFor: 'Tech lead role in a innovative product company'
    },
    
    // Skills & Expertise (Enhanced with Proficiency)
    skills: [
      { name: 'JavaScript', proficiency: 'Expert', yearsOfExperience: 5, verified: true },
      { name: 'React', proficiency: 'Advanced', yearsOfExperience: 4, verified: true },
      { name: 'Node.js', proficiency: 'Advanced', yearsOfExperience: 4, verified: true },
      { name: 'Python', proficiency: 'Intermediate', yearsOfExperience: 3, verified: true },
      { name: 'AWS', proficiency: 'Advanced', yearsOfExperience: 3, verified: true },
      { name: 'Docker', proficiency: 'Advanced', yearsOfExperience: 3, verified: true }
    ],
    certifications: [
      { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023-01-15', credentialUrl: 'https://aws.amazon.com/verification', verified: true },
      { name: 'Google Cloud Professional', issuer: 'Google Cloud', date: '2022-08-20', verified: true }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Fluent' },
      { name: 'French', proficiency: 'Conversational' }
    ],
    
    // Education History
    education: [
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2015-09',
        endDate: '2019-06',
        gpa: '3.8',
        honors: 'Dean\'s List, Cum Laude',
        description: 'Focused on software engineering and distributed systems'
      }
    ],
    
    // Career Goals (Enhanced)
    careerGoals: [
      { title: 'Become a Tech Lead', description: 'Lead engineering teams and drive technical strategy', targetDate: '2025-12', progress: 60, category: 'Role' },
      { title: 'Join Google', description: 'Secure a senior role at Google', targetDate: '2025-06', progress: 30, category: 'Company' }
    ],
    targetRoles: ['Tech Lead', 'Senior Developer', 'Architect'],
    targetCompanies: ['Google', 'Microsoft', 'Apple'],
    relocationWillingness: 'Open to relocation',
    
    // Portfolio & Links (Enhanced)
    portfolio: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.com',
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
      { platform: 'GitHub', url: 'https://github.com/johndoe' },
      { platform: 'Twitter', url: 'https://twitter.com/johndoe' },
      { platform: 'Medium', url: 'https://medium.com/@johndoe' }
    ],
    projects: [
      {
        title: 'E-Commerce Platform',
        description: 'Built a scalable e-commerce platform handling 10K+ daily transactions',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        link: 'https://example.com/ecommerce',
        github: 'https://github.com/johndoe/ecommerce',
        date: '2023-01'
      },
      {
        title: 'Real-time Collaboration Tool',
        description: 'Developed a real-time document collaboration tool with WebSocket',
        technologies: ['React', 'Socket.io', 'PostgreSQL', 'AWS'],
        github: 'https://github.com/johndoe/collab-tool',
        date: '2022-08'
      }
    ],
    achievements: [
      { title: 'Employee of the Year', description: 'Recognized for outstanding contributions', date: '2023-12', type: 'Award', link: '#' },
      { title: 'Tech Conference Speaker', description: 'Spoke at React Summit 2023', date: '2023-06', type: 'Speaking', link: 'https://reactsummit.com' }
    ],
    
    // Career Timeline
    careerTimeline: [
      { id: '1', title: 'Joined Tech Corp', description: 'Started as Senior Software Engineer', date: '2023-01', type: 'Work', icon: 'briefcase', color: 'blue' },
      { id: '2', title: 'AWS Certification', description: 'Earned AWS Certified Developer credential', date: '2023-01', type: 'Certification', icon: 'certificate', color: 'green' },
      { id: '3', title: 'Graduated Stanford', description: 'BS in Computer Science', date: '2019-06', type: 'Education', icon: 'graduation', color: 'purple' }
    ],
    
    // Preferences
    jobAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    privacyLevel: 'Professional',
    profileVisibility: 'Public',
    
    // Analytics & Insights (Enhanced)
    profileViews: 1247,
    applicationsSent: 23,
    interviewsScheduled: 8,
    offersReceived: 2,
    successRate: 8.7,
    profileCompleteness: 85,
    skillMatchRate: 92,
    avgResponseTime: 2.5
      } as UserData);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save user profile via API
      await apiService.updateUserProfile(userData);
      logger.debug('Profile saved via API:', userData);
      setIsSaving(false);
      setIsEditing(false);
    } catch (error) {
      logger.error('Failed to save profile:', error);
      setIsSaving(false);
      // Still exit edit mode on error
      setIsEditing(false);
    }
  };

  const handleUserDataChange = (data: Partial<UserData>) => {
    setUserData((prev: UserData | null) => prev ? ({ ...prev, ...data }) : null);
  };

  const handleChangePhoto = () => {
    // Handle profile picture change
  };

  // Show loading state while fetching
  if (isLoading || !userData) {
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

    // Apply all updates
    if (Object.keys(updates).length > 0) {
      handleUserDataChange(updates);
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      userData: userData!, // Safe because we check for null above
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
        return <AnalyticsTab userData={userData!} />;
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
