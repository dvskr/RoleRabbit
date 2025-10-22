// Resume-related utility functions
import { ResumeData } from '../types/resume';

/**
 * Generate a smart filename for resume exports
 */
export const generateSmartFileName = (resumeData: ResumeData): string => {
  const name = resumeData.name || 'Resume';
  const title = resumeData.title || 'Professional';
  const currentDate = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  // Clean and format the name and title
  const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  
  return `${cleanName}_${cleanTitle}_${currentDate}`;
};

/**
 * Format URL to ensure it has proper protocol
 */
export const formatUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Generate a unique ID for resume items
 */
export const generateId = (): number => {
  return Date.now() + Math.random();
};

/**
 * Deep clone resume data to avoid mutations
 */
export const cloneResumeData = (resumeData: ResumeData): ResumeData => {
  return JSON.parse(JSON.stringify(resumeData));
};

/**
 * Get resume statistics
 */
export const getResumeStats = (resumeData: ResumeData) => {
  return {
    totalSections: 6, // Contact, Summary, Skills, Experience, Projects, Education, Certifications
    experienceCount: resumeData.experience.length,
    projectCount: resumeData.projects.length,
    educationCount: resumeData.education.length,
    certificationCount: resumeData.certifications.length,
    skillsCount: resumeData.skills.length,
    hasSummary: !!resumeData.summary?.trim(),
    hasContact: !!(resumeData.name && resumeData.email),
    completionPercentage: calculateCompletionPercentage(resumeData)
  };
};

/**
 * Calculate resume completion percentage
 */
const calculateCompletionPercentage = (resumeData: ResumeData): number => {
  const weights = {
    contact: 20,
    summary: 15,
    skills: 15,
    experience: 25,
    projects: 10,
    education: 10,
    certifications: 5
  };

  let score = 0;
  
  // Contact info
  if (resumeData.name && resumeData.email && resumeData.phone) {
    score += weights.contact;
  }
  
  // Summary
  if (resumeData.summary?.trim()) {
    score += weights.summary;
  }
  
  // Skills
  if (resumeData.skills.length > 0) {
    score += weights.skills;
  }
  
  // Experience
  if (resumeData.experience.length > 0) {
    score += weights.experience;
  }
  
  // Projects
  if (resumeData.projects.length > 0) {
    score += weights.projects;
  }
  
  // Education
  if (resumeData.education.length > 0) {
    score += weights.education;
  }
  
  // Certifications
  if (resumeData.certifications.length > 0) {
    score += weights.certifications;
  }
  
  return Math.round(score);
};

/**
 * Extract keywords from resume content
 */
export const extractKeywords = (resumeData: ResumeData): string[] => {
  const keywords = new Set<string>();
  
  // Extract from skills
  resumeData.skills.forEach(skill => {
    keywords.add(skill.toLowerCase());
  });
  
  // Extract from experience
  resumeData.experience.forEach(exp => {
    exp.skills?.forEach(skill => keywords.add(skill.toLowerCase()));
    exp.bullets?.forEach(bullet => {
      // Simple keyword extraction from bullet points
      const words = bullet.toLowerCase().match(/\b\w{3,}\b/g) || [];
      words.forEach(word => {
        if (word.length > 3 && !['the', 'and', 'for', 'with', 'from', 'this', 'that'].includes(word)) {
          keywords.add(word);
        }
      });
    });
  });
  
  // Extract from projects
  resumeData.projects.forEach(project => {
    project.skills?.forEach(skill => keywords.add(skill.toLowerCase()));
  });
  
  return Array.from(keywords);
};

/**
 * Check if resume is ATS-friendly
 */
export const checkATSCompatibility = (resumeData: ResumeData) => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for required sections
  if (!resumeData.name) issues.push('Missing name');
  if (!resumeData.email) issues.push('Missing email');
  if (!resumeData.phone) issues.push('Missing phone number');
  if (!resumeData.summary?.trim()) issues.push('Missing professional summary');
  
  // Check for skills
  if (resumeData.skills.length === 0) {
    issues.push('No skills listed');
  } else if (resumeData.skills.length < 5) {
    suggestions.push('Consider adding more technical skills');
  }
  
  // Check for experience
  if (resumeData.experience.length === 0) {
    issues.push('No work experience listed');
  }
  
  // Check for education
  if (resumeData.education.length === 0) {
    suggestions.push('Consider adding education information');
  }
  
  return {
    isATSCompatible: issues.length === 0,
    issues,
    suggestions,
    score: Math.max(0, 100 - (issues.length * 20) - (suggestions.length * 5))
  };
};
