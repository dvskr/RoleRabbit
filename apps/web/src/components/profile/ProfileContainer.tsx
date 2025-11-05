/**
 * ProfileContainer - Container component for Profile logic
 * Handles all state management, hooks, and business logic
 * Separated from presentation for better testability and maintainability
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Briefcase,
  Award,
  Settings,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { logger } from '@/utils/logger';
import {
  UserData,
  ProfileTabConfig
} from './types/profile';
import {
  normalizeToArray,
  sanitizeWorkExperiences,
  sanitizeSkills,
  sanitizeLanguages,
  sanitizeEducation,
  sanitizeCertifications,
} from './utils/dataSanitizer';
import { useProfileData } from './hooks/useProfileData';
import { useProfileDisplayData } from './hooks/useProfileDisplayData';
import { useProfileCompleteness } from './hooks/useProfileCompleteness';
import { useProfileSave } from './hooks/useProfileSave';

const ARRAY_FIELD_KEYS: Array<keyof UserData | string> = [
  'skills',
  'certifications',
  'languages',
  'education',
  'socialLinks',
  'projects',
  'workExperiences'
];

interface ProfileContainerProps {
  children: (props: ProfileContainerRenderProps) => React.ReactNode;
}

export interface ProfileContainerRenderProps {
  // State
  activeTab: string;
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isSaved: boolean;
  saveMessage: { type: 'success' | 'error'; text: string } | null;
  displayData: UserData;
  profileCompleteness: number;
  
  // Handlers
  setActiveTab: (tab: string) => void;
  setIsEditing: (editing: boolean) => void;
  handleUserDataChange: (data: Partial<UserData>) => void;
  handleChangePhoto: (newPictureUrl: string | null) => Promise<void>;
  handleSave: () => Promise<void>;
  handleEdit: () => void;
  handleCancel: () => void;
  clearSaveMessage: () => void;
  
  // Config
  tabs: ProfileTabConfig[];
  isAuthenticated: boolean;
}

/**
 * ProfileContainer - Manages all Profile component logic
 */
export function ProfileContainer({ children }: ProfileContainerProps) {
  const { userData: contextUserData, isLoading: contextLoading, refreshProfile, updateProfileData } = useProfile();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
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
  
  // Use profile data hook for state management
  const {
    userData,
    isLoading,
    localProfileData,
    updateLocalData,
    resetLocalData,
    updateProfileData: updateContextProfileData
  } = useProfileData({
    isSaving: false, // Will be managed by useProfileSave
    isSaved: false, // Will be managed by useProfileSave
    isEditing
  });

  // Use display data hook for sanitized display data
  const displayData = useProfileDisplayData({
    userData: contextUserData,
    localProfileData,
    isEditing
  });

  // Use profile completeness hook
  const profileCompleteness = useProfileCompleteness({
    apiCompleteness: contextUserData?.profileCompleteness,
    displayData
  });

  // Use profile save hook
  const {
    isSaving,
    isSaved,
    saveMessage,
    handleSave,
    clearSaveMessage
  } = useProfileSave({
    updateProfileData: updateContextProfileData,
    setLocalProfileData: (data: UserData | null | ((prev: UserData | null) => UserData | null)) => {
      if (typeof data === 'function') {
        const newData = data(localProfileData);
        if (newData) {
          updateLocalData(newData);
        }
      } else if (data) {
        updateLocalData(data);
      } else {
        resetLocalData();
      }
    },
    localProfileData,
    displayData
  });

  const handleUserDataChange = (data: Partial<UserData>) => {
    // Guard: Only allow authenticated users to modify profile data
    if (!isAuthenticated) {
      return;
    }
    
    const normalizedChange: Partial<UserData> = {};
    (Object.keys(data) as Array<keyof UserData>).forEach((key) => {
      const value = data[key];
      if (key === 'workExperiences') {
        normalizedChange[key] = sanitizeWorkExperiences(value) as UserData['workExperiences'];
      } else if (key === 'education') {
        normalizedChange[key] = sanitizeEducation(value) as UserData['education'];
      } else if (key === 'skills') {
        normalizedChange[key] = sanitizeSkills(value) as UserData['skills'];
      } else if (key === 'languages') {
        normalizedChange[key] = sanitizeLanguages(value) as UserData['languages'];
      } else if (key === 'certifications') {
        normalizedChange[key] = sanitizeCertifications(value) as UserData['certifications'];
      } else if (ARRAY_FIELD_KEYS.includes(key)) {
        normalizedChange[key] = normalizeToArray(value) as UserData[typeof key];
      } else {
        normalizedChange[key] = value;
      }
    });

    // Update local state immediately for responsive typing
    updateLocalData(normalizedChange);

    // Also update context for consistency (but don't rely on it for local edits)
    const contextUpdate: Partial<UserData> = {};
    (Object.keys(normalizedChange) as Array<keyof UserData>).forEach((key) => {
      if (key === 'workExperiences') {
        contextUpdate[key] = sanitizeWorkExperiences(normalizedChange[key]) as UserData['workExperiences'];
      } else if (key === 'education') {
        contextUpdate[key] = sanitizeEducation(normalizedChange[key]) as UserData['education'];
      } else if (key === 'skills') {
        contextUpdate[key] = sanitizeSkills(normalizedChange[key]) as UserData['skills'];
      } else if (key === 'languages') {
        contextUpdate[key] = sanitizeLanguages(normalizedChange[key]) as UserData['languages'];
      } else if (key === 'certifications') {
        contextUpdate[key] = sanitizeCertifications(normalizedChange[key]) as UserData['certifications'];
      } else {
        contextUpdate[key] = normalizedChange[key];
      }
    });
    if (Object.keys(contextUpdate).length > 0) {
      updateContextProfileData(contextUpdate);
    }
  };

  const handleChangePhoto = async (newPictureUrl: string | null) => {
    try {
      // Update the profile picture in local state
      updateContextProfileData({ profilePicture: newPictureUrl });
      // Refresh profile to get the latest data
      await refreshProfile();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to update profile picture:', errorMessage);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize local state when entering edit mode
    if (userData) {
      updateLocalData(userData);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset local state to match context when canceling (no refresh needed - just discard changes)
    resetLocalData();
  };

  // Tab configuration
  const tabs: ProfileTabConfig[] = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills and Education', icon: Award },
    { id: 'preferences', label: 'Preferences & Security', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Render props pattern - pass all props to children render function
  return (
    <>
      {children({
        activeTab,
        isEditing,
        isLoading,
        isSaving,
        isSaved,
        saveMessage,
        displayData,
        profileCompleteness,
        setActiveTab,
        setIsEditing,
        handleUserDataChange,
        handleChangePhoto,
        handleSave,
        handleEdit,
        handleCancel,
        clearSaveMessage,
        tabs,
        isAuthenticated: isAuthenticated && !authLoading
      })}
    </>
  );
}

