/**
 * Hook for managing profile data state and synchronization
 * @module components/profile/hooks/useProfileData
 */

import { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { UserData } from '../types/profile';

/**
 * Default empty user data structure
 */
export const defaultUserData: UserData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  professionalBio: '',
  profilePicture: null,
  skills: [],
  certifications: [],
  languages: [],
  education: [],
  portfolio: '',
  linkedin: '',
  github: '',
  website: '',
  socialLinks: [],
  projects: [],
  workExperiences: [],
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

interface UseProfileDataOptions {
  isSaving?: boolean;
  isSaved?: boolean;
  isEditing?: boolean;
}

/**
 * Hook for managing profile data state
 * Handles synchronization between context and local editing state
 * 
 * @param {UseProfileDataOptions} options - Options for controlling sync behavior
 * @returns {Object} Profile data state and utilities
 */
export function useProfileData(options: UseProfileDataOptions = {}) {
  const { isSaving = false, isSaved = false, isEditing = false } = options;
  const { userData: contextUserData, isLoading: contextLoading, updateProfileData } = useProfile();
  
  // Local state for editing - allows immediate updates while typing
  const [localProfileData, setLocalProfileData] = useState<UserData | null>(null);

  // Determine which data to use (local if editing, context otherwise)
  const userData = isEditing && localProfileData ? localProfileData : (contextUserData || defaultUserData);
  const isLoading = contextLoading;

  // Use local state if editing, otherwise use context data or defaults
  // Initialize local state when userData loads or when entering edit mode
  useEffect(() => {
    // CRITICAL: Don't update localProfileData during save operation or after save
    // This prevents data from vanishing when updateProfileData is called
    if (isSaving || isSaved) {
      return;
    }
    
    // Always sync with context data when available
    if (contextUserData) {
      // Only sync when NOT editing to preserve user's unsaved changes
      // Initialize if missing, but don't overwrite if user is actively editing
      if (!localProfileData) {
        // First time load - initialize
        setLocalProfileData(contextUserData);
      } else if (!isEditing) {
        // Only sync when not editing to get latest data from server
        // But ONLY if localProfileData doesn't have more work experiences
        // This prevents clearing data that was just saved
        const localWorkExpCount = localProfileData.workExperiences?.length || 0;
        const contextWorkExpCount = contextUserData.workExperiences?.length || 0;
        
        // CRITICAL: Never overwrite if local has more items (user just saved)
        // Also check if arrays actually differ to avoid unnecessary updates
        if (localWorkExpCount > contextWorkExpCount) {
          // Local has more data - don't overwrite (user just saved)
          return;
        }
        
        // Only update if context has more or equal data, and data is actually different
        const hasChanges = JSON.stringify(localProfileData.workExperiences) !== JSON.stringify(contextUserData.workExperiences) ||
                          JSON.stringify(localProfileData.education) !== JSON.stringify(contextUserData.education) ||
                          JSON.stringify(localProfileData.certifications) !== JSON.stringify(contextUserData.certifications);
        
        if (hasChanges && localWorkExpCount <= contextWorkExpCount) {
          setLocalProfileData(contextUserData);
        }
      }
      // When editing, preserve localProfileData to keep user's unsaved changes
    } else if (!isLoading && localProfileData === null) {
      // Initialize with defaults if no data available
      setLocalProfileData(defaultUserData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextUserData, isLoading, isEditing, isSaving, isSaved]);

  // Update local profile data (for editing)
  const updateLocalData = (updates: Partial<UserData>) => {
    setLocalProfileData(prev => {
      if (!prev) {
        return { ...defaultUserData, ...updates } as UserData;
      }
      return { ...prev, ...updates };
    });
  };

  // Reset local data to context data (when canceling edit)
  const resetLocalData = () => {
    setLocalProfileData(contextUserData || null);
  };

  // Get current data for saving
  const getDataForSave = (): UserData => {
    return localProfileData || contextUserData || defaultUserData;
  };

  return {
    userData,
    isLoading,
    localProfileData,
    updateLocalData,
    resetLocalData,
    getDataForSave,
    updateProfileData, // Expose context's updateProfileData for optimistic updates
  };
}

