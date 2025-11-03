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
  PortfolioTab,
  SecurityTab,
  PreferencesTab,
  SupportTab,
  UserData,
  ProfileTabConfig
} from './profile/index';

export default function Profile() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { userData: contextUserData, isLoading: contextLoading, refreshProfile, updateProfileData } = useProfile();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Guard: Only allow authenticated users to access profile
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: colors.errorRed }}>
            You must be signed in to access your profile.
          </p>
        </div>
      </div>
    );
  }
  
  // Persist active tab across page refreshes
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('profileActiveTab');
      return savedTab || 'profile';
    }
    return 'profile';
  });
  
  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', activeTab);
    }
  }, [activeTab]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Use profile data from context (loaded once at app startup)
  const userData = contextUserData;
  const isLoading = contextLoading;
  
  // Local state for editing - allows immediate updates while typing
  const [localProfileData, setLocalProfileData] = useState<UserData | null>(null);

  const tabs: ProfileTabConfig[] = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills & Expertise', icon: Award },
    { id: 'portfolio', label: 'Portfolio', icon: FileText },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
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
      workExperiences: [],
      volunteerExperiences: [],
      recommendations: [],
      publications: [],
      patents: [],
      organizations: [],
      testScores: [],
    emailNotifications: true,
    smsNotifications: false,
    privacyLevel: 'Professional',
    profileVisibility: 'Public',
    profileViews: 0,
    successRate: 0,
    profileCompleteness: 0,
    skillMatchRate: 0,
    avgResponseTime: 0,
  };

  // Use local state if editing, otherwise use context data or defaults
  // Initialize local state when userData loads or when entering edit mode
  useEffect(() => {
    // Don't update localProfileData during save operation to prevent flashing
    if (isSaving || isSaved) {
      return;
    }
    
    // Always sync with context data when available
    if (userData) {
      // Initialize if missing, or sync when not editing
      if (!localProfileData || !isEditing) {
        setLocalProfileData(userData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, isEditing, isSaving, isSaved]);

  // Use localProfileData if available during editing to prevent flashing
  // Only fall back to userData if localProfileData is explicitly null (not just undefined)
  const displayData = isEditing 
    ? (localProfileData !== null ? (localProfileData || defaultUserData) : (userData || defaultUserData))
    : (userData || defaultUserData);

  // Calculate profile completeness
  const calculateCompleteness = (): number => {
    const data = displayData;
    let completed = 0;
    
    // Helper function to safely parse JSON arrays
    const safeParseArray = (data: any): any[] => {
      if (Array.isArray(data)) return data;
      if (typeof data === 'string' && data) {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };
    
    // Personal Information (8 points)
    const personalInfo = {
      firstName: !!data.firstName,
      lastName: !!data.lastName,
      email: !!data.email,
      phone: !!data.phone,
      location: !!data.location,
      bio: !!(data.bio && data.bio.length > 50),
      profilePicture: !!data.profilePicture,
      currentRole: !!data.currentRole
    };
    const personalCompleted = Object.values(personalInfo).filter(Boolean).length;
    completed += personalCompleted;
    
    // Skills (1 point if at least 3 skills)
    const skills = safeParseArray(data.skills);
    if (skills.length >= 3) completed++;
    
    // Certifications (1 point if at least 1)
    const certs = safeParseArray(data.certifications);
    if (certs.length >= 1) completed++;
    
    // Languages (1 point if at least 1)
    const languages = safeParseArray(data.languages);
    if (languages.length >= 1) completed++;
    
    // Work Experience (1 point if at least 1)
    const workExp = safeParseArray(data.workExperiences);
    if (workExp.length >= 1) completed++;
    
    // Projects (1 point if at least 1)
    const projects = safeParseArray(data.projects);
    if (projects.length >= 1) completed++;
    
    
    // Education (1 point if present)
    const education = safeParseArray(data.education);
    if (education.length >= 1) completed++;
    
    // Social Links (1 point if at least 1)
    const socialLinks = safeParseArray(data.socialLinks);
    if (socialLinks.length >= 1) completed++;
    
    // Total: 8 (personal) + 8 (other sections) = 16 points max
    const total = 16;
    return Math.round((completed / total) * 100);
  };

  const profileCompleteness = calculateCompleteness();

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // Save user profile via API using displayData (which has latest local edits)
      const dataToSave = localProfileData || displayData;
      
      // Clean up data before sending - remove null/undefined values and ensure arrays are arrays
      // Also exclude large base64 profile pictures (those should be uploaded separately)
      // Exclude email field - login email cannot be changed
      const cleanedData: Partial<UserData> = {};
      Object.keys(dataToSave).forEach(key => {
        const value = (dataToSave as any)[key];
        // Skip email field - login email cannot be changed
        if (key === 'email') {
          return;
        }
        // Skip profile picture if it's a large base64 string (upload separately)
        if (key === 'profilePicture' && typeof value === 'string' && value.startsWith('data:') && value.length > 10000) {
          // Profile picture will be uploaded separately, skip from general update
          return;
        }
        if (value !== null && value !== undefined) {
          // Ensure arrays are arrays, not null/undefined
          if (Array.isArray(value)) {
            cleanedData[key as keyof UserData] = value as any;
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle objects
            cleanedData[key as keyof UserData] = value as any;
          } else {
            cleanedData[key as keyof UserData] = value as any;
          }
        }
      });
      
      logger.debug('Saving profile data:', cleanedData);
      
      await apiService.updateUserProfile(cleanedData);
      logger.debug('Profile saved successfully via API');
      
      // Batch all state updates together to prevent flashing
      // Update localProfileData with saved data immediately to keep UI stable
      const updatedLocalData = localProfileData ? { ...localProfileData, ...cleanedData } : localProfileData;
      
      // Update all states in one batch using React's automatic batching
      setIsSaving(false);
      setIsSaved(true);
      if (updatedLocalData) {
        setLocalProfileData(updatedLocalData);
      }
      
      // Don't refresh profile - it causes flashing. Data is already updated locally.
      // Profile will be refreshed when user manually exits edit mode or on next page load.
      
      // Reset saved status after 3 seconds but stay in edit mode to prevent flashing
      // User can manually exit edit mode when ready
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error: any) {
      logger.error('Failed to save profile:', error);
      setIsSaving(false);
      
      // Provide more helpful error message
      let errorMessage = 'Failed to save profile. Please try again.';
      if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Cannot connect to server. Please ensure the API server is running on http://localhost:3001';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Session expired. Please log in again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSaveMessage({ 
        type: 'error', 
        text: errorMessage
      });
      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleUserDataChange = (data: Partial<UserData>) => {
    // Guard: Only allow authenticated users to modify profile data
    if (!isAuthenticated) {
      setSaveMessage({ 
        type: 'error', 
        text: 'You must be signed in to modify your profile.' 
      });
      setTimeout(() => setSaveMessage(null), 5000);
      return;
    }
    
    // Update local state immediately for responsive typing
    if (localProfileData) {
      setLocalProfileData({ ...localProfileData, ...data });
    } else {
      // Initialize local state if it doesn't exist
      const currentData = userData || defaultUserData;
      setLocalProfileData({ ...currentData, ...data });
    }
    // Also update context for consistency
    updateProfileData(data);
  };

  const handleChangePhoto = async (newPictureUrl: string | null) => {
    try {
      // Update the profile picture in local state
      updateProfileData({ profilePicture: newPictureUrl });
      // Refresh profile to get the latest data
      await refreshProfile();
      const message = newPictureUrl ? 'Profile picture updated successfully!' : 'Profile picture removed successfully!';
      setSaveMessage({ type: 'success', text: message });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      logger.error('Failed to update profile picture:', error);
      setSaveMessage({ 
        type: 'error', 
        text: 'Failed to update profile picture. Please try again.' 
      });
      setTimeout(() => setSaveMessage(null), 5000);
    }
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
      case 'portfolio':
        return <PortfolioTab {...commonProps} />;
      case 'security':
        return <SecurityTab />;
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
      {/* Error Message Only (Success shown in button) */}
      {saveMessage && saveMessage.type === 'error' && (
        <div 
          className="mx-4 mt-4 p-4 rounded-xl shadow-lg flex items-center justify-between bg-red-50 border border-red-200"
        >
          <p className="text-sm font-medium text-red-800">
            {saveMessage.text}
          </p>
          <button
            onClick={() => setSaveMessage(null)}
            className="ml-4 text-lg font-bold text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Enhanced Header */}
      <ProfileHeader
        isEditing={isEditing}
        isSaving={isSaving}
        isSaved={isSaved}
        profileCompleteness={profileCompleteness}
        onEdit={() => {
          setIsEditing(true);
          setIsSaved(false); // Reset saved state when entering edit mode
          setIsSaving(false); // Reset saving state
          // Initialize local state when entering edit mode
          if (userData) {
            setLocalProfileData(userData);
          }
        }}
        onCancel={() => {
          setIsEditing(false);
          setIsSaved(false); // Reset saved state when canceling
          setIsSaving(false); // Reset saving state
          // Reset local state to match context when canceling (no refresh needed - just discard changes)
          setLocalProfileData(null);
        }}
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
