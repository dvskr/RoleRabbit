// Validation utility functions
import { ResumeData, Experience, Project, Education, Certification } from '../types/resume';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate entire resume data
 */
export const validateResumeData = (resumeData: ResumeData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate contact information
  const contactValidation = validateContactInfo(resumeData);
  errors.push(...contactValidation.errors);
  warnings.push(...contactValidation.warnings);
  
  // Validate summary
  const summaryValidation = validateSummary(resumeData.summary);
  errors.push(...summaryValidation.errors);
  warnings.push(...summaryValidation.warnings);
  
  // Validate skills
  const skillsValidation = validateSkills(resumeData.skills);
  errors.push(...skillsValidation.errors);
  warnings.push(...skillsValidation.warnings);
  
  // Validate experience
  resumeData.experience.forEach((exp, index) => {
    const expValidation = validateExperience(exp);
    expValidation.errors.forEach(error => errors.push(`Experience ${index + 1}: ${error}`));
    expValidation.warnings.forEach(warning => warnings.push(`Experience ${index + 1}: ${warning}`));
  });
  
  // Validate projects
  resumeData.projects.forEach((project, index) => {
    const projectValidation = validateProject(project);
    projectValidation.errors.forEach(error => errors.push(`Project ${index + 1}: ${error}`));
    projectValidation.warnings.forEach(warning => warnings.push(`Project ${index + 1}: ${warning}`));
  });
  
  // Validate education
  resumeData.education.forEach((edu, index) => {
    const eduValidation = validateEducation(edu);
    eduValidation.errors.forEach(error => errors.push(`Education ${index + 1}: ${error}`));
    eduValidation.warnings.forEach(warning => warnings.push(`Education ${index + 1}: ${warning}`));
  });
  
  // Validate certifications
  resumeData.certifications.forEach((cert, index) => {
    const certValidation = validateCertification(cert);
    certValidation.errors.forEach(error => errors.push(`Certification ${index + 1}: ${error}`));
    certValidation.warnings.forEach(warning => warnings.push(`Certification ${index + 1}: ${warning}`));
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate contact information
 */
export const validateContactInfo = (resumeData: ResumeData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!resumeData.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!resumeData.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(resumeData.email)) {
    errors.push('Invalid email format');
  }
  
  if (!resumeData.phone?.trim()) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(resumeData.phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (!resumeData.location?.trim()) {
    warnings.push('Location is recommended');
  }
  
  if (!resumeData.title?.trim()) {
    warnings.push('Job title is recommended');
  }
  
  if (resumeData.linkedin && !isValidUrl(resumeData.linkedin)) {
    warnings.push('LinkedIn URL format may be invalid');
  }
  
  if (resumeData.github && !isValidUrl(resumeData.github)) {
    warnings.push('GitHub URL format may be invalid');
  }
  
  if (resumeData.website && !isValidUrl(resumeData.website)) {
    warnings.push('Website URL format may be invalid');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate professional summary
 */
export const validateSummary = (summary: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!summary?.trim()) {
    warnings.push('Professional summary is recommended');
    return { isValid: true, errors, warnings };
  }
  
  const wordCount = summary.trim().split(/\s+/).length;
  
  if (wordCount < 20) {
    warnings.push('Summary is quite short (less than 20 words)');
  }
  
  if (wordCount > 200) {
    warnings.push('Summary is quite long (more than 200 words)');
  }
  
  if (wordCount < 10) {
    errors.push('Summary is too short (less than 10 words)');
  }
  
  if (wordCount > 300) {
    errors.push('Summary is too long (more than 300 words)');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate skills
 */
export const validateSkills = (skills: string[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (skills.length === 0) {
    warnings.push('No skills listed');
    return { isValid: true, errors, warnings };
  }
  
  if (skills.length < 3) {
    warnings.push('Consider adding more skills (less than 3 listed)');
  }
  
  if (skills.length > 20) {
    warnings.push('Consider reducing skills (more than 20 listed)');
  }
  
  // Check for duplicate skills
  const uniqueSkills = new Set(skills.map(skill => skill.toLowerCase().trim()));
  if (uniqueSkills.size !== skills.length) {
    warnings.push('Duplicate skills detected');
  }
  
  // Check for empty skills
  const emptySkills = skills.filter(skill => !skill.trim());
  if (emptySkills.length > 0) {
    errors.push('Some skills are empty');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate experience entry
 */
export const validateExperience = (experience: Experience): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!experience.company?.trim()) {
    errors.push('Company name is required');
  }
  
  if (!experience.role?.trim()) {
    errors.push('Job title is required');
  }
  
  if (!experience.period?.trim()) {
    errors.push('Start date is required');
  }
  
  if (!experience.endPeriod?.trim()) {
    warnings.push('End date is recommended');
  }
  
  if (!experience.location?.trim()) {
    warnings.push('Location is recommended');
  }
  
  if (experience.bullets.length === 0) {
    warnings.push('No bullet points listed');
  }
  
  if (experience.bullets.length > 8) {
    warnings.push('Consider reducing bullet points (more than 8 listed)');
  }
  
  // Check for empty bullets
  const emptyBullets = experience.bullets.filter(bullet => !bullet.trim());
  if (emptyBullets.length > 0) {
    errors.push('Some bullet points are empty');
  }
  
  // Check bullet point length
  experience.bullets.forEach((bullet, index) => {
    if (bullet.length > 200) {
      warnings.push(`Bullet point ${index + 1} is quite long`);
    }
    if (bullet.length < 10) {
      warnings.push(`Bullet point ${index + 1} is quite short`);
    }
  });
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate project entry
 */
export const validateProject = (project: Project): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!project.name?.trim()) {
    errors.push('Project name is required');
  }
  
  if (!project.description?.trim()) {
    warnings.push('Project description is recommended');
  }
  
  if (project.link && !isValidUrl(project.link)) {
    warnings.push('Project link format may be invalid');
  }
  
  if (project.skills.length === 0) {
    warnings.push('No skills listed for project');
  }
  
  if (project.bullets.length === 0) {
    warnings.push('No bullet points listed for project');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate education entry
 */
export const validateEducation = (education: Education): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!education.school?.trim()) {
    errors.push('School name is required');
  }
  
  if (!education.degree?.trim()) {
    errors.push('Degree is required');
  }
  
  if (!education.startDate?.trim()) {
    warnings.push('Start date is recommended');
  }
  
  if (!education.endDate?.trim()) {
    warnings.push('End date is recommended');
  }
  
  if (!education.location?.trim()) {
    warnings.push('Location is recommended');
  }
  
  if (education.gpa && !isValidGPA(education.gpa)) {
    warnings.push('GPA format may be invalid');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate certification entry
 */
export const validateCertification = (certification: Certification): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!certification.name?.trim()) {
    errors.push('Certification name is required');
  }
  
  if (!certification.issuer?.trim()) {
    errors.push('Issuing organization is required');
  }
  
  if (certification.link && !isValidUrl(certification.link)) {
    warnings.push('Certification link format may be invalid');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

// Helper validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidGPA = (gpa: string): boolean => {
  const gpaRegex = /^[0-4]\.\d{1,2}$/;
  return gpaRegex.test(gpa);
};

/**
 * Get validation summary for display
 */
export const getValidationSummary = (validation: ValidationResult): string => {
  if (validation.isValid && validation.warnings.length === 0) {
    return 'Resume is valid and complete!';
  }
  
  if (validation.isValid) {
    return `Resume is valid with ${validation.warnings.length} warning(s)`;
  }
  
  return `Resume has ${validation.errors.length} error(s) and ${validation.warnings.length} warning(s)`;
};

/**
 * Check if resume is ready for export
 */
export const isResumeExportReady = (resumeData: ResumeData): boolean => {
  const validation = validateResumeData(resumeData);
  
  // Resume is export-ready if it has no errors and at least basic information
  return validation.isValid && 
         !!resumeData.name && 
         !!resumeData.email && 
         !!resumeData.title &&
         (resumeData.experience.length > 0 || resumeData.projects.length > 0);
};
