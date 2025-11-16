/**
 * Enhanced validation utilities
 * Additional validation functions for comprehensive client-side validation
 */

import { MAX_LENGTHS, FORMATTING_RANGES, validateEmail, validatePhone, validateURL } from './validation';

/**
 * Validates date range (start date must be before end date)
 */
export const validateDateRange = (
  startDate: string,
  endDate: string
): { isValid: boolean; error?: string } => {
  if (!startDate || !endDate || endDate.toLowerCase() === 'present') {
    return { isValid: true };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: true }; // Invalid dates, let them pass
  }

  if (start > end) {
    return {
      isValid: false,
      error: 'End date must be after start date'
    };
  }

  return { isValid: true };
};

/**
 * Validates future dates (warns if date is too far in future)
 */
export const validateFutureDate = (
  date: string,
  allowPresent: boolean = true
): { isValid: boolean; warning?: string } => {
  if (!date || (allowPresent && date.toLowerCase() === 'present')) {
    return { isValid: true };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: true };
  }

  const now = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(now.getFullYear() + 2);

  if (dateObj > twoYearsFromNow) {
    return {
      isValid: true,
      warning: 'Date seems far in the future. Please verify.'
    };
  }

  return { isValid: true };
};

/**
 * Validates duplicate skills (case-insensitive)
 */
export const validateDuplicateSkill = (
  skill: string,
  existingSkills: string[]
): { isValid: boolean; error?: string } => {
  const normalized = skill.trim().toLowerCase();
  const isDuplicate = existingSkills.some(
    (s) => s.trim().toLowerCase() === normalized
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: 'This skill is already added'
    };
  }

  return { isValid: true };
};

/**
 * Validates duplicate experience entries
 */
export const validateDuplicateExperience = (
  newEntry: { company?: string; position?: string; period?: string; endPeriod?: string },
  existingEntries: Array<{ company?: string; position?: string; period?: string; endPeriod?: string }>
): { isValid: boolean; warning?: string } => {
  const isDuplicate = existingEntries.some((entry) => {
    return (
      entry.company?.trim().toLowerCase() === newEntry.company?.trim().toLowerCase() &&
      entry.position?.trim().toLowerCase() === newEntry.position?.trim().toLowerCase() &&
      entry.period?.trim() === newEntry.period?.trim() &&
      entry.endPeriod?.trim() === newEntry.endPeriod?.trim()
    );
  });

  if (isDuplicate) {
    return {
      isValid: true,
      warning: 'This looks like a duplicate. Did you mean to add it?'
    };
  }

  return { isValid: true };
};

/**
 * Validates custom section name
 */
export const validateCustomSectionName = (
  name: string,
  existingNames: string[]
): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'Section name cannot be empty'
    };
  }

  if (name.length > MAX_LENGTHS.CUSTOM_SECTION_NAME) {
    return {
      isValid: false,
      error: `Section name must be ${MAX_LENGTHS.CUSTOM_SECTION_NAME} characters or less`
    };
  }

  if (/[<>{}[\]\\\/]/.test(name)) {
    return {
      isValid: false,
      error: 'Section name contains invalid characters'
    };
  }

  const normalized = name.trim().toLowerCase();
  const isDuplicate = existingNames.some(
    (n) => n.trim().toLowerCase() === normalized
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: 'A section with this name already exists'
    };
  }

  return { isValid: true };
};

/**
 * Validates font size
 */
export const validateFontSize = (size: number): { isValid: boolean; error?: string } => {
  const { min, max, unit } = FORMATTING_RANGES.FONT_SIZE;

  if (size < min || size > max) {
    return {
      isValid: false,
      error: `Font size must be between ${min}${unit} and ${max}${unit}`
    };
  }

  return { isValid: true };
};

/**
 * Validates margins
 */
export const validateMargins = (margin: number): { isValid: boolean; error?: string } => {
  const { min, max, unit } = FORMATTING_RANGES.MARGINS;

  if (margin < min || margin > max) {
    return {
      isValid: false,
      error: `Margins must be between ${min}${unit} and ${max}${unit}`
    };
  }

  return { isValid: true };
};

/**
 * Validates line spacing
 */
export const validateLineSpacing = (spacing: number): { isValid: boolean; error?: string } => {
  const { min, max } = FORMATTING_RANGES.LINE_SPACING;

  if (spacing < min || spacing > max) {
    return {
      isValid: false,
      error: `Line spacing must be between ${min} and ${max}`
    };
  }

  return { isValid: true };
};

/**
 * Validates file upload
 */
export const validateFileUpload = (
  file: File
): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF, DOCX, and TXT files are allowed'
    };
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'Invalid file extension. Only .pdf, .docx, and .txt are allowed'
    };
  }

  const mimeExtensionMap: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  };

  const expectedExtensions = mimeExtensionMap[file.type] || [];
  if (expectedExtensions.length > 0 && !expectedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'File type does not match file extension'
    };
  }

  return { isValid: true };
};

/**
 * Validates required fields for resume save
 */
export const validateRequiredFields = (
  resumeData: any
): { isValid: boolean; errors: Record<string, string>; missingFields: string[] } => {
  const errors: Record<string, string> = {};
  const missingFields: string[] = [];

  if (!resumeData?.name || resumeData.name.trim() === '') {
    errors.name = 'Name is required';
    missingFields.push('Name');
  }

  if (!resumeData?.email || resumeData.email.trim() === '') {
    errors.email = 'Email is required';
    missingFields.push('Email');
  }

  if (!resumeData?.phone || resumeData.phone.trim() === '') {
    errors.phone = 'Phone number is required';
    missingFields.push('Phone');
  }

  return {
    isValid: missingFields.length === 0,
    errors,
    missingFields
  };
};

/**
 * Comprehensive validation for resume data before save
 */
export const validateResumeBeforeSave = (
  resumeData: any
): { isValid: boolean; errors: Record<string, string>; warnings: Record<string, string> } => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Required fields
  const requiredValidation = validateRequiredFields(resumeData);
  Object.assign(errors, requiredValidation.errors);

  // Email format
  if (resumeData?.email) {
    const emailValidation = validateEmail(resumeData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error || 'Invalid email format';
    }
  }

  // Phone format
  if (resumeData?.phone) {
    const phoneValidation = validatePhone(resumeData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || 'Invalid phone format';
    }
  }

  // URL validations
  ['linkedin', 'github', 'website'].forEach((field) => {
    if (resumeData?.[field] && resumeData[field].trim() !== '') {
      const urlValidation = validateURL(resumeData[field]);
      if (!urlValidation.isValid) {
        errors[field] = urlValidation.error || 'Invalid URL format';
      }
    }
  });

  // Max length validations
  if (resumeData?.name && resumeData.name.length > MAX_LENGTHS.NAME) {
    errors.name = `Name must be ${MAX_LENGTHS.NAME} characters or less`;
  }

  if (resumeData?.title && resumeData.title.length > MAX_LENGTHS.TITLE) {
    errors.title = `Title must be ${MAX_LENGTHS.TITLE} characters or less`;
  }

  if (resumeData?.summary && resumeData.summary.length > MAX_LENGTHS.SUMMARY) {
    errors.summary = `Summary must be ${MAX_LENGTHS.SUMMARY} characters or less`;
  }

  // Validate experience entries
  if (Array.isArray(resumeData?.experience)) {
    resumeData.experience.forEach((exp: any, index: number) => {
      if (exp.period && exp.endPeriod) {
        const dateValidation = validateDateRange(exp.period, exp.endPeriod);
        if (!dateValidation.isValid) {
          errors[`experience_${index}_dates`] = dateValidation.error || 'Invalid date range';
        }
      }

      if (exp.endPeriod && exp.endPeriod.toLowerCase() !== 'present') {
        const futureValidation = validateFutureDate(exp.endPeriod);
        if (futureValidation.warning) {
          warnings[`experience_${index}_endDate`] = futureValidation.warning;
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

