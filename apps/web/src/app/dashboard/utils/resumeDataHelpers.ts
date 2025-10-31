/**
 * Resume data manipulation helper functions
 */

import { ResumeData, SectionVisibility } from '../../../types/resume';
import { logger } from '../../../utils/logger';

export interface DuplicateResumeState {
  resumeFileName: string;
  resumeData: ResumeData;
  customSections: any[];
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
}

/**
 * Remove duplicate entries from resume data
 */
export function removeDuplicateResumeEntries(resumeData: ResumeData): { data: ResumeData; removedCount: number } {
  const cleanedResumeData = { ...resumeData };
  let removedCount = 0;
  
  // Remove duplicate experiences
  if (cleanedResumeData.experience && cleanedResumeData.experience.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.experience.filter((exp: any) => {
      const key = `${exp.company}-${exp.position}-${exp.period}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.experience = unique;
  }
  
  // Remove duplicate skills
  if (cleanedResumeData.skills && cleanedResumeData.skills.length > 0) {
    const uniqueSkills = Array.from(new Set(cleanedResumeData.skills));
    removedCount += cleanedResumeData.skills.length - uniqueSkills.length;
    cleanedResumeData.skills = uniqueSkills;
  }
  
  // Remove duplicate education
  if (cleanedResumeData.education && cleanedResumeData.education.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.education.filter((edu: any) => {
      const key = `${edu.school}-${edu.degree}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.education = unique;
  }
  
  // Remove duplicate projects
  if (cleanedResumeData.projects && cleanedResumeData.projects.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.projects.filter((proj: any) => {
      const key = `${proj.name}-${proj.description}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.projects = unique;
  }
  
  // Remove duplicate certifications
  if (cleanedResumeData.certifications && cleanedResumeData.certifications.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.certifications.filter((cert: any) => {
      const key = `${cert.name}-${cert.issuer}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.certifications = unique;
  }
  
  return { data: cleanedResumeData, removedCount };
}

/**
 * Duplicate resume state for creating a copy
 */
export function duplicateResumeState(
  resumeFileName: string,
  resumeData: ResumeData,
  customSections: any[],
  sectionOrder: string[],
  sectionVisibility: SectionVisibility
): DuplicateResumeState {
  return {
    resumeFileName: `${resumeFileName} - Copy`,
    resumeData: JSON.parse(JSON.stringify(resumeData)),
    customSections: JSON.parse(JSON.stringify(customSections)),
    sectionOrder: [...sectionOrder],
    sectionVisibility: { ...sectionVisibility },
  };
}

