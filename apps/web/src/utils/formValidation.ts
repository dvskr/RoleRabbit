/**
 * Form Validation Utilities
 * Comprehensive validation functions for portfolio builder forms
 */

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

export const VALIDATION_LIMITS = {
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  EMAIL: {
    MIN: 3,
    MAX: 254,
  },
  ROLE: {
    MIN: 1,
    MAX: 100,
  },
  TAGLINE: {
    MIN: 0,
    MAX: 200,
  },
  BIO: {
    MIN: 0,
    MAX: 5000,
  },
  PROJECT_DESCRIPTION: {
    MIN: 0,
    MAX: 1000,
  },
  SKILL_NAME: {
    MIN: 1,
    MAX: 50,
  },
  ACHIEVEMENT_DESCRIPTION: {
    MIN: 0,
    MAX: 500,
  },
  SUBDOMAIN: {
    MIN: 3,
    MAX: 63,
  },
  FILE: {
    RESUME_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    IMAGE_MAX_SIZE: 5 * 1024 * 1024,   // 5MB
  },
};

export const ALLOWED_FILE_TYPES = {
  RESUME: ['.pdf', '.doc', '.docx'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const ALLOWED_MIME_TYPES = {
  RESUME: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  IMAGE: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
} as const;

// Reserved subdomains that cannot be used
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'blog',
  'dashboard',
  'mail',
  'ftp',
  'cdn',
  'assets',
  'static',
  'staging',
  'dev',
  'test',
  'demo',
  'beta',
  'alpha',
  'support',
  'help',
  'docs',
  'status',
  'about',
  'contact',
  'login',
  'register',
  'signup',
  'signin',
  'logout',
  'account',
  'profile',
  'settings',
  'config',
  'server',
  'ns',
  'dns',
  'whois',
  'smtp',
  'pop',
  'imap',
  'webmail',
  'secure',
  'ssl',
  'tls',
];

// Common profanity/inappropriate words for subdomain filtering
const PROFANITY_LIST = [
  'admin',
  'root',
  'system',
  'null',
  'undefined',
  'test',
  'spam',
  'abuse',
  'hack',
  'phish',
  'scam',
  'fraud',
  // Add more as needed
];

// ========================================
// VALIDATION ERROR TYPES
// ========================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  value: string;
  isValid: boolean;
  error?: string;
  charCount?: number;
  maxChars?: number;
}

// ========================================
// REGEX PATTERNS
// ========================================

// Email validation - RFC 5322 compliant
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// URL validation - must include https://
export const URL_REGEX = /^https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Subdomain validation - lowercase alphanumeric + hyphens
export const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

// ========================================
// XSS SANITIZATION
// ========================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text input (removes scripts, excessive whitespace)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// ========================================
// REQUIRED FIELD VALIDATION
// ========================================

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  const trimmed = value?.trim() || '';

  if (!trimmed) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
}

// ========================================
// EMAIL VALIDATION
// ========================================

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email?.trim() || '';

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  if (trimmed.length < VALIDATION_LIMITS.EMAIL.MIN) {
    return {
      isValid: false,
      error: `Email must be at least ${VALIDATION_LIMITS.EMAIL.MIN} characters`,
    };
  }

  if (trimmed.length > VALIDATION_LIMITS.EMAIL.MAX) {
    return {
      isValid: false,
      error: `Email must be at most ${VALIDATION_LIMITS.EMAIL.MAX} characters`,
    };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
}

// ========================================
// URL VALIDATION
// ========================================

/**
 * Validate URL format (must include https://)
 */
export function validateURL(url: string, fieldName: string = 'URL', required: boolean = false): ValidationResult {
  const trimmed = url?.trim() || '';

  // If not required and empty, it's valid
  if (!required && !trimmed) {
    return { isValid: true };
  }

  if (required && !trimmed) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (!URL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: `Please enter a valid URL (including https://)`,
    };
  }

  return { isValid: true };
}

// ========================================
// CHARACTER LIMIT VALIDATION
// ========================================

/**
 * Validate character length with limits
 */
export function validateLength(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number,
  required: boolean = false
): FieldValidation {
  const trimmed = value?.trim() || '';
  const length = trimmed.length;

  if (required && length === 0) {
    return {
      value: trimmed,
      isValid: false,
      error: `${fieldName} is required`,
      charCount: length,
      maxChars: maxLength,
    };
  }

  if (length > 0 && length < minLength) {
    return {
      value: trimmed,
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
      charCount: length,
      maxChars: maxLength,
    };
  }

  if (length > maxLength) {
    return {
      value: trimmed,
      isValid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
      charCount: length,
      maxChars: maxLength,
    };
  }

  return {
    value: trimmed,
    isValid: true,
    charCount: length,
    maxChars: maxLength,
  };
}

/**
 * Validate name field
 */
export function validateName(name: string): FieldValidation {
  return validateLength(name, 'Name', VALIDATION_LIMITS.NAME.MIN, VALIDATION_LIMITS.NAME.MAX, true);
}

/**
 * Validate role field
 */
export function validateRole(role: string): FieldValidation {
  return validateLength(role, 'Role', VALIDATION_LIMITS.ROLE.MIN, VALIDATION_LIMITS.ROLE.MAX, true);
}

/**
 * Validate tagline field
 */
export function validateTagline(tagline: string): FieldValidation {
  return validateLength(tagline, 'Tagline', VALIDATION_LIMITS.TAGLINE.MIN, VALIDATION_LIMITS.TAGLINE.MAX, false);
}

/**
 * Validate bio field
 */
export function validateBio(bio: string): FieldValidation {
  return validateLength(bio, 'Bio', VALIDATION_LIMITS.BIO.MIN, VALIDATION_LIMITS.BIO.MAX, false);
}

/**
 * Validate project description
 */
export function validateProjectDescription(description: string): FieldValidation {
  return validateLength(
    description,
    'Project description',
    VALIDATION_LIMITS.PROJECT_DESCRIPTION.MIN,
    VALIDATION_LIMITS.PROJECT_DESCRIPTION.MAX,
    false
  );
}

/**
 * Validate skill name
 */
export function validateSkillName(skill: string): FieldValidation {
  return validateLength(skill, 'Skill', VALIDATION_LIMITS.SKILL_NAME.MIN, VALIDATION_LIMITS.SKILL_NAME.MAX, true);
}

/**
 * Validate achievement description
 */
export function validateAchievementDescription(description: string): FieldValidation {
  return validateLength(
    description,
    'Achievement description',
    VALIDATION_LIMITS.ACHIEVEMENT_DESCRIPTION.MIN,
    VALIDATION_LIMITS.ACHIEVEMENT_DESCRIPTION.MAX,
    false
  );
}

// ========================================
// SUBDOMAIN VALIDATION
// ========================================

/**
 * Validate subdomain format
 */
export function validateSubdomain(subdomain: string): ValidationResult {
  const trimmed = subdomain?.trim().toLowerCase() || '';

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Subdomain is required',
    };
  }

  if (trimmed.length < VALIDATION_LIMITS.SUBDOMAIN.MIN) {
    return {
      isValid: false,
      error: `Subdomain must be at least ${VALIDATION_LIMITS.SUBDOMAIN.MIN} characters`,
    };
  }

  if (trimmed.length > VALIDATION_LIMITS.SUBDOMAIN.MAX) {
    return {
      isValid: false,
      error: `Subdomain must be at most ${VALIDATION_LIMITS.SUBDOMAIN.MAX} characters`,
    };
  }

  if (!SUBDOMAIN_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Subdomain must contain only lowercase letters, numbers, and hyphens',
    };
  }

  if (trimmed.includes('--')) {
    return {
      isValid: false,
      error: 'Subdomain cannot contain consecutive hyphens',
    };
  }

  if (RESERVED_SUBDOMAINS.includes(trimmed)) {
    return {
      isValid: false,
      error: 'This subdomain is reserved',
    };
  }

  // Check for profanity
  if (PROFANITY_LIST.some(word => trimmed.includes(word))) {
    return {
      isValid: false,
      error: 'This subdomain contains inappropriate content',
    };
  }

  return { isValid: true };
}

// ========================================
// FILE UPLOAD VALIDATION
// ========================================

/**
 * Validate file extension
 */
function validateFileExtension(fileName: string, allowedExtensions: readonly string[]): boolean {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  return allowedExtensions.includes(extension);
}

/**
 * Validate file MIME type
 */
function validateFileMimeType(fileType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(fileType);
}

/**
 * Validate resume file upload
 */
export function validateResumeFile(file: File): ValidationResult {
  // Check file size
  if (file.size > VALIDATION_LIMITS.FILE.RESUME_MAX_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${VALIDATION_LIMITS.FILE.RESUME_MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file extension
  if (!validateFileExtension(file.name, ALLOWED_FILE_TYPES.RESUME)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.RESUME.join(', ')}`,
    };
  }

  // Check MIME type
  if (!validateFileMimeType(file.type, ALLOWED_MIME_TYPES.RESUME)) {
    return {
      isValid: false,
      error: `Invalid file type. Please upload a PDF or Word document`,
    };
  }

  return { isValid: true };
}

/**
 * Validate image file upload
 */
export function validateImageFile(file: File): ValidationResult {
  // Check file size
  if (file.size > VALIDATION_LIMITS.FILE.IMAGE_MAX_SIZE) {
    return {
      isValid: false,
      error: `Image size must be less than ${VALIDATION_LIMITS.FILE.IMAGE_MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file extension
  if (!validateFileExtension(file.name, ALLOWED_FILE_TYPES.IMAGE)) {
    return {
      isValid: false,
      error: `Image type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.IMAGE.join(', ')}`,
    };
  }

  // Check MIME type
  if (!validateFileMimeType(file.type, ALLOWED_MIME_TYPES.IMAGE)) {
    return {
      isValid: false,
      error: `Invalid image type. Please upload JPG, PNG, or WebP`,
    };
  }

  return { isValid: true };
}

// ========================================
// FORM VALIDATION HELPERS
// ========================================

/**
 * Collect all form errors
 */
export function collectFormErrors(validations: Record<string, ValidationResult | FieldValidation>): string[] {
  const errors: string[] = [];

  Object.values(validations).forEach(validation => {
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  });

  return errors;
}

/**
 * Check if form is valid
 */
export function isFormValid(validations: Record<string, ValidationResult | FieldValidation>): boolean {
  return Object.values(validations).every(validation => validation.isValid);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// DUPLICATE VALIDATION
// ========================================

/**
 * Check for duplicate portfolio name
 * This would typically call an API endpoint to check existing portfolios
 */
export async function checkDuplicatePortfolioName(
  name: string,
  existingPortfolios: Array<{ name: string }> = []
): Promise<ValidationResult> {
  const trimmed = name?.trim() || '';

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Portfolio name is required',
    };
  }

  const isDuplicate = existingPortfolios.some(
    portfolio => portfolio.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: 'A portfolio with this name already exists',
    };
  }

  return { isValid: true };
}

// ========================================
// EXPORT UTILITY FUNCTIONS
// ========================================

export const formValidation = {
  // Sanitization
  sanitizeHTML,
  sanitizeText,

  // Required fields
  validateRequired,

  // Specific validations
  validateEmail,
  validateURL,
  validateName,
  validateRole,
  validateTagline,
  validateBio,
  validateProjectDescription,
  validateSkillName,
  validateAchievementDescription,
  validateSubdomain,

  // File validation
  validateResumeFile,
  validateImageFile,

  // Form helpers
  collectFormErrors,
  isFormValid,
  checkDuplicatePortfolioName,

  // Utilities
  formatFileSize,

  // Constants
  VALIDATION_LIMITS,
  ALLOWED_FILE_TYPES,
  RESERVED_SUBDOMAINS,
};

export default formValidation;
