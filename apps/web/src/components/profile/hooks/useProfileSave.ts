/**
 * Hook for handling profile save operations
 * @module components/profile/hooks/useProfileSave
 */

import { useState } from 'react';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';
import { UserData } from '../types/profile';
import {
  normalizeToArray,
  sanitizeWorkExperiences,
  sanitizeSkills,
  sanitizeLanguages,
  sanitizeEducation,
  sanitizeCertifications,
  sanitizeProjects
} from '../utils/dataSanitizer';

const ARRAY_FIELD_KEYS: Array<keyof UserData | string> = [
  'skills',
  'certifications',
  'languages',
  'education',
  'socialLinks',
  'projects',
  'workExperiences'
];

interface UseProfileSaveOptions {
  updateProfileData: (data: Partial<UserData>) => void;
  setLocalProfileData: (data: UserData | null | ((prev: UserData | null) => UserData | null)) => void;
  localProfileData: UserData | null;
  displayData: UserData;
}

/**
 * Hook for handling profile save operations
 * Handles data cleaning, API calls, and state updates
 * 
 * @param {UseProfileSaveOptions} options - Options for save operation
 * @returns {Object} Save state and handler function
 */
export function useProfileSave({
  updateProfileData,
  setLocalProfileData,
  localProfileData,
  displayData
}: UseProfileSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Handle saving profile data
   */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // CRITICAL: Force sync any pending edits from child components before saving
      // This ensures technologies and other edits are included even if user hasn't blurred fields
      // Trigger blur events on all active input fields to sync their values
      if (typeof document !== 'undefined') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement instanceof HTMLElement) {
          // Blur active element to trigger any pending onChange/onBlur handlers
          activeElement.blur();
        }
        // Also trigger blur on all project technology inputs to ensure they're synced
        const techInputs = document.querySelectorAll('input[id*="project-"][id*="-technologies"]');
        techInputs.forEach(input => {
          if (input instanceof HTMLElement) {
            input.blur();
          }
        });
        // Small delay to allow blur handlers to process
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Save user profile via API using displayData (which has latest local edits)
      // CRITICAL: Use displayData as it reflects the current UI state
      // After blur, the localProfileData should be updated with synced technologies
      const dataToSave = displayData;
      
      // Save operation started
      logger.debug('Saving profile', {
        workExperiences: displayData.workExperiences?.length || 0,
        education: displayData.education?.length || 0,
        projects: displayData.projects?.length || 0
      });
      
      // Clean up data before sending - remove null/undefined values and ensure arrays are arrays
      // Also exclude large base64 profile pictures (those should be uploaded separately)
      // Exclude email field - login email cannot be changed
      // Exclude id and userId fields - these cannot be modified
      const cleanedData: Partial<UserData> = {};
      (Object.keys(dataToSave) as Array<keyof UserData>).forEach(key => {
        const value = dataToSave[key];
        // Skip email field - login email cannot be changed
        if (key === 'email') {
          return;
        }
        // Skip id and userId fields - these cannot be modified
        if (key === 'id' || key === 'userId') {
          return;
        }
        // Skip profile picture if it's a large base64 string (upload separately)
        if (key === 'profilePicture' && typeof value === 'string' && value.startsWith('data:') && value.length > 10000) {
          // Profile picture will be uploaded separately, skip from general update
          return;
        }
        // CRITICAL: Always include arrays, even if empty (they need to be sent to API to replace existing data)
        if (ARRAY_FIELD_KEYS.includes(key)) {
          if (key === 'workExperiences') {
            const sanitizedExperiences = sanitizeWorkExperiences(value, { keepDrafts: false });
            cleanedData[key] = sanitizedExperiences as UserData['workExperiences'];
          } else if (key === 'education') {
            const sanitizedEducation = sanitizeEducation(value, { keepDrafts: false });
            cleanedData[key] = sanitizedEducation as UserData['education'];
          } else if (key === 'skills') {
            const sanitizedSkills = sanitizeSkills(value, { keepDrafts: false });
            cleanedData[key] = sanitizedSkills as UserData['skills'];
          } else if (key === 'languages') {
            const sanitizedLanguages = sanitizeLanguages(value, { keepDrafts: false });
            cleanedData[key] = sanitizedLanguages as UserData['languages'];
          } else if (key === 'certifications') {
            const sanitizedCerts = sanitizeCertifications(value, { keepDrafts: false });
            cleanedData[key] = sanitizedCerts as UserData['certifications'];
          } else if (key === 'projects') {
            const sanitizedProjects = sanitizeProjects(value, { keepDrafts: false });
            cleanedData[key] = sanitizedProjects as UserData['projects'];
          } else {
            const normalizedArray = normalizeToArray(value);
            cleanedData[key] = normalizedArray as UserData[typeof key];
          }
        } else if (value !== null && value !== undefined) {
          // Handle objects and primitives
          cleanedData[key] = value as UserData[typeof key];
        }
      });
      
      // Data cleaned and ready to send
      logger.debug('Cleaned data ready', {
        keys: Object.keys(cleanedData),
        workExperiences: cleanedData.workExperiences?.length || 0,
        projects: cleanedData.projects?.length || 0
      });
      
      const response = await apiService.updateUserProfile(cleanedData);
      logger.debug('Profile saved successfully', {
        workExperiences: response?.user?.workExperiences?.length || 0,
        projects: response?.user?.projects?.length || 0
      });
      
      // Update local state with the response data (which includes nested arrays from DB)
      if (response && response.user) {
        const savedUserData = response.user as Partial<UserData>;
        
        // Extract data from API response structure
        // API returns: { user: { profile: { workExperiences: [...] }, workExperiences: [...], ... } }
        // The API response has workExperiences at both top level (user) and nested (user.profile)
        // We need to extract from the correct location based on API structure
        const profileData = savedUserData.profile || {};
        
        // Extract arrays - check both locations (top level and nested in profile)
        const apiWorkExperiences = savedUserData.workExperiences || profileData.workExperiences || [];
        const apiEducation = savedUserData.education || profileData.education || [];
        const apiCertifications = savedUserData.certifications || profileData.certifications || [];
        const apiSocialLinks = savedUserData.socialLinks || profileData.socialLinks || [];
        const apiProjects = savedUserData.projects || profileData.projects || [];
        const apiSkills = savedUserData.skills || profileData.skills || [];
        
        
        // Use the saved data from API response - it has the latest from DB
        // Merge with localProfileData to preserve any fields not in response
        // IMPORTANT: Spread savedUserData first, then override with arrays from correct location
        const updatedLocalData = localProfileData ? {
          ...localProfileData,
          ...savedUserData,
          ...profileData, // Spread profile data for fields like firstName, lastName, etc.
          // CRITICAL: Use arrays from API response (they come from DB)
          // Explicitly set arrays to ensure they're not lost in the spread
          workExperiences: apiWorkExperiences,
          education: apiEducation,
          certifications: apiCertifications,
          socialLinks: apiSocialLinks,
          projects: apiProjects,
          skills: apiSkills,
        } : {
          ...savedUserData,
          ...profileData,
          workExperiences: apiWorkExperiences,
          education: apiEducation,
          certifications: apiCertifications,
          socialLinks: apiSocialLinks,
          projects: apiProjects,
          skills: apiSkills,
        };
        
        
        // CRITICAL: Set local state FIRST to prevent flashing
        setLocalProfileData(updatedLocalData);
        
        // Update context with COMPLETE saved data from API response
        // CRITICAL: Pass the entire updatedLocalData, not just arrays, to ensure context has full data
        // This prevents the useEffect from overwriting with stale context data
        updateProfileData(updatedLocalData);
        
      } else {
        // Fallback: update with cleanedData if no response
        const updatedLocalData = localProfileData ? { ...localProfileData, ...cleanedData } : localProfileData;
        if (updatedLocalData) {
          setLocalProfileData(updatedLocalData);
          updateProfileData(cleanedData);
        }
      }
      
      // DON'T call refreshProfile() here - it causes flashing and overwrites local state
      // The API response already contains the saved data from DB
      
      // Update all states in one batch using React's automatic batching
      setIsSaving(false);
      setIsSaved(true);
      
      // Reset saved status after 3 seconds - faster transition back to "Save" button
      // This gives enough time to show "Saved" feedback but allows quick re-saving
      setTimeout(() => {
        setIsSaved(false);
      }, 3000); // Reduced to 3s for faster transition
    } catch (error: unknown) {
      logger.error('Failed to save profile:', error);
      setIsSaving(false);
      
      // Provide more helpful error message
      let errorMessage = 'Failed to save profile. Please try again.';
      if (error instanceof Error && error.message) {
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

  /**
   * Clear save message
   */
  const clearSaveMessage = () => {
    setSaveMessage(null);
  };

  return {
    isSaving,
    isSaved,
    saveMessage,
    handleSave,
    clearSaveMessage,
  };
}

