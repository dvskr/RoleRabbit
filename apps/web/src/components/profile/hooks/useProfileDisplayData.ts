/**
 * Hook for computing display data with proper sanitization
 * @module components/profile/hooks/useProfileDisplayData
 */

import { useMemo } from 'react';
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
import { defaultUserData } from './useProfileData';

interface UseProfileDisplayDataOptions {
  userData: UserData | null;
  localProfileData: UserData | null;
  isEditing: boolean;
}

/**
 * Hook for computing display data with proper sanitization
 * Ensures arrays are always defined and properly formatted
 * 
 * @param {UseProfileDisplayDataOptions} options - Options for display data
 * @returns {UserData} Sanitized display data
 */
export function useProfileDisplayData({
  userData,
  localProfileData,
  isEditing
}: UseProfileDisplayDataOptions): UserData {
  return useMemo(() => {
    // Use localProfileData if available during editing to prevent flashing
    // CRITICAL: Ensure arrays are always defined (never undefined/null)
    if (isEditing) {
      if (localProfileData !== null && localProfileData !== undefined) {
        // Ensure arrays exist - if they're missing, use defaults or empty arrays
        return {
          ...defaultUserData,
          ...localProfileData,
          workExperiences: sanitizeWorkExperiences(localProfileData.workExperiences),
          education: sanitizeEducation(localProfileData.education),
          certifications: sanitizeCertifications(localProfileData.certifications),
          skills: sanitizeSkills(localProfileData.skills),
          languages: sanitizeLanguages(localProfileData.languages),
          projects: sanitizeProjects(localProfileData.projects),
          socialLinks: normalizeToArray(localProfileData.socialLinks),
        };
      }
      // Fallback to userData if localProfileData is null
      if (userData) {
        return {
          ...defaultUserData,
          ...userData,
          workExperiences: sanitizeWorkExperiences(userData.workExperiences),
          education: sanitizeEducation(userData.education),
          certifications: sanitizeCertifications(userData.certifications),
          skills: sanitizeSkills(userData.skills),
          languages: sanitizeLanguages(userData.languages),
          projects: sanitizeProjects(userData.projects),
          socialLinks: normalizeToArray(userData.socialLinks),
        };
      }
      return defaultUserData;
    }
    // Not editing - use userData from context
    if (userData) {
      return {
        ...defaultUserData,
        ...userData,
        workExperiences: sanitizeWorkExperiences(userData.workExperiences),
        education: sanitizeEducation(userData.education),
        certifications: sanitizeCertifications(userData.certifications),
        skills: sanitizeSkills(userData.skills),
        languages: sanitizeLanguages(userData.languages),
          projects: sanitizeProjects(userData.projects),
          socialLinks: normalizeToArray(userData.socialLinks),
      };
    }
    return defaultUserData;
  }, [userData, localProfileData, isEditing]);
}

