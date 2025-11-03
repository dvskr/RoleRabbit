/**
 * Field Limits and Validation Constants
 * Defines character limits and validation rules for profile fields
 */

export const FIELD_LIMITS = {
  // Personal Info
  firstName: 100,
  lastName: 100,
  email: 254, // RFC 5321 standard
  phone: 30,
  location: 200,
  bio: 5000, // Increased to accommodate comprehensive professional summaries
  
  // Work Experience
  company: 200,
  role: 200,
  workDescription: 10000, // Increased significantly to capture full resume descriptions
  achievement: 1000, // Increased for detailed achievements
  
  // Education
  institution: 300,
  degree: 200,
  field: 200,
  educationDescription: 3000, // Increased for detailed education descriptions
  
  // Skills
  skillName: 100,
  maxSkills: 100, // Increased limit for extensive skill lists
  
  // Projects
  projectTitle: 200,
  projectDescription: 5000, // Increased for comprehensive project descriptions
  
  // Certifications
  certificationName: 300,
  issuer: 200,
  
  // General
  maxBulletPoints: 50, // Increased for extensive achievement lists
  maxWorkExperiences: 100, // Increased for long careers
  maxEducation: 50, // Increased for multiple degrees/certifications
  maxProjects: 100, // Increased for extensive portfolios
  maxCertifications: 100 // Increased for professional certifications
} as const;

export const FIELD_VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: 'Please enter a valid phone number'
  },
  url: {
    pattern: /^https?:\/\/.+/i,
    message: 'Please enter a valid URL (starting with http:// or https://)'
  },
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'Please enter date in YYYY-MM-DD format'
  }
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a field value
 */
export function validateField(fieldName: keyof typeof FIELD_LIMITS | keyof typeof FIELD_VALIDATION, value: string): ValidationResult {
  const limits = FIELD_LIMITS[fieldName as keyof typeof FIELD_LIMITS];
  const validation = FIELD_VALIDATION[fieldName as keyof typeof FIELD_VALIDATION];
  
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Check length
  if (limits && value.length > limits) {
    result.isValid = false;
    result.errors.push(`Maximum ${limits} characters allowed`);
  }
  
  // Check pattern
  if (validation && value) {
    if (!validation.pattern.test(value)) {
      result.isValid = false;
      result.errors.push(validation.message);
    }
  }
  
  // Warnings for near-limit
  if (limits && value.length > limits * 0.9) {
    result.warnings.push(`Approaching character limit (${value.length}/${limits})`);
  }
  
  return result;
}

