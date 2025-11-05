/**
 * Hook for calculating profile completeness
 * @module components/profile/hooks/useProfileCompleteness
 */

import { useMemo } from 'react';
import { UserData } from '../types/profile';
import { normalizeToArray } from '../utils/dataSanitizer';

/**
 * Calculate profile completeness percentage
 * @param {UserData} data - User profile data
 * @returns {number} Completeness percentage (0-100)
 */
function calculateCompleteness(data: UserData): number {
  let completed = 0;
  
  // Helper function to safely parse JSON arrays
  const safeParseArray = (data: any): any[] => normalizeToArray(data);
  
  // Personal Information (8 points)
  const personalInfo = {
    firstName: !!data.firstName,
    lastName: !!data.lastName,
    email: !!data.email,
    phone: !!data.phone,
    location: !!data.location,
    bio: !!(((data.professionalBio ?? data.bio) || '').length > 50),
    profilePicture: !!data.profilePicture,
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
}

interface UseProfileCompletenessOptions {
  apiCompleteness?: number | null;
  displayData: UserData;
}

/**
 * Hook for calculating profile completeness
 * Uses API-provided value if available, otherwise calculates locally
 * 
 * @param {UseProfileCompletenessOptions} options - Options for completeness calculation
 * @returns {number} Profile completeness percentage (0-100)
 */
export function useProfileCompleteness({
  apiCompleteness,
  displayData
}: UseProfileCompletenessOptions): number {
  return useMemo(() => {
    // Use API-provided profileCompleteness instead of calculating locally
    // The backend calculates this using the updated formula (100% max)
    return apiCompleteness ?? calculateCompleteness(displayData);
  }, [apiCompleteness, displayData]);
}

