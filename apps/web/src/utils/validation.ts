/**
 * Comprehensive Validation Utilities
 * FE-021 through FE-030
 */

// Constants
export const MAX_FILENAME_LENGTH = 255;
export const MAX_FOLDER_NAME_LENGTH = 100;
export const MAX_COMMENT_LENGTH = 5000;
export const MAX_DESCRIPTION_LENGTH = 1000;

// Resume field max lengths
export const MAX_LENGTHS = {
  NAME: 100, // Maximum length for resume name field
  TITLE: 100, // Maximum length for job title
  SUMMARY: 2000, // Maximum length for summary section
  COMPANY: 100, // Maximum length for company name
  SCHOOL: 100, // Maximum length for school name
  DEGREE: 100, // Maximum length for degree
  SKILL: 50, // Maximum length for individual skill
  BULLET: 500, // Maximum length for bullet point
} as const;

// Default max file size (10MB) - can be overridden by env or API
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File type restrictions per category
export const FILE_TYPE_RESTRICTIONS: Record<string, string[]> = {
  resume: ['.pdf', '.doc', '.docx'],
  cover_letter: ['.pdf', '.doc', '.docx', '.txt'],
  template: ['.pdf', '.doc', '.docx'],
  transcript: ['.pdf', '.doc', '.docx'],
  certification: ['.pdf', '.jpg', '.jpeg', '.png'],
  reference: ['.pdf', '.doc', '.docx'],
  portfolio: ['.pdf', '.jpg', '.jpeg', '.png', '.zip'],
  work_sample: ['.pdf', '.doc', '.docx', '.zip'],
  document: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'],
  backup: ['.zip', '.rar', '.tar', '.gz'],
};

// Dangerous filename characters
export const DANGEROUS_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;
export const RESERVED_FILENAME_PATTERNS = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;

// Email validation regex (RFC 5322 compliant)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// MIME type to extension mapping
export const MIME_TO_EXTENSION: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-tar': ['.tar'],
  'application/gzip': ['.gz'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

// Magic bytes (file signatures) for validation
export const FILE_SIGNATURES: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  jpg: [[0xFF, 0xD8, 0xFF]],
  png: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  gif: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]], // GIF87a or GIF89a
  zip: [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06], [0x50, 0x4B, 0x07, 0x08]],
  doc: [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]], // OLE2 (old Word format)
  docx: [[0x50, 0x4B, 0x03, 0x04]], // ZIP-based (new Word format)
  txt: [], // Text files don't have a signature
};

/**
 * FE-021: Validate file size
 */
export interface FileSizeValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileSize(
  file: File,
  maxSize?: number
): FileSizeValidationResult {
  const maxFileSize = maxSize || DEFAULT_MAX_FILE_SIZE;
  
  if (file.size > maxFileSize) {
    const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB} MB) exceeds maximum allowed size (${maxSizeMB} MB)`,
    };
  }
  
  return { valid: true };
}

/**
 * FE-022: Validate MIME type using file.type and magic bytes
 */
export interface MimeTypeValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: string;
}

export async function validateMimeType(
  file: File,
  allowedTypes?: string[]
): Promise<MimeTypeValidationResult> {
  // Read first bytes for magic number detection
  const arrayBuffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Check magic bytes
  let detectedSignature: string | null = null;
  for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (signature.length === 0) continue; // Skip empty signatures
      if (bytes.length >= signature.length) {
        const matches = signature.every((byte, index) => bytes[index] === byte);
        if (matches) {
          detectedSignature = type;
          break;
        }
      }
    }
    if (detectedSignature) break;
  }
  
  // Get file extension
  const fileName = file.name.toLowerCase();
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  
  // If we have allowed types, validate against them
  if (allowedTypes && allowedTypes.length > 0) {
    const allowedExtensions = allowedTypes.map(t => t.toLowerCase());
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File type ${extension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }
  
  // Validate MIME type matches extension
  const declaredMimeType = file.type;
  if (declaredMimeType && MIME_TO_EXTENSION[declaredMimeType]) {
    const expectedExtensions = MIME_TO_EXTENSION[declaredMimeType];
    if (!expectedExtensions.some(ext => fileName.endsWith(ext))) {
      return {
        valid: false,
        error: `File MIME type (${declaredMimeType}) does not match file extension (${extension})`,
        detectedType: detectedSignature || undefined,
      };
    }
  }
  
  // If magic bytes detected but don't match extension, warn
  if (detectedSignature && extension !== `.${detectedSignature}`) {
    // This is a warning, not an error - file might still be valid
    return {
      valid: true,
      detectedType: detectedSignature,
    };
  }
  
  return { valid: true };
}

/**
 * FE-023 & FE-024: Validate and sanitize filename
 */
export interface FilenameValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

export function validateFilename(
  filename: string,
  maxLength: number = MAX_FILENAME_LENGTH
): FilenameValidationResult {
  if (!filename || filename.trim().length === 0) {
    return {
      valid: false,
      error: 'Filename cannot be empty',
    };
  }
  
  if (filename.length > maxLength) {
    return {
      valid: false,
      error: `Filename exceeds maximum length of ${maxLength} characters`,
    };
  }
  
  // Check for dangerous characters
  if (DANGEROUS_FILENAME_CHARS.test(filename)) {
    const sanitized = filename.replace(DANGEROUS_FILENAME_CHARS, '_');
    return {
      valid: false,
      error: 'Filename contains invalid characters',
      sanitized,
    };
  }
  
  // Check for reserved names (Windows)
  if (RESERVED_FILENAME_PATTERNS.test(filename)) {
    return {
      valid: false,
      error: 'Filename is a reserved system name',
    };
  }
  
  // Check for leading/trailing spaces or dots
  if (filename.trim() !== filename || filename.startsWith('.') || filename.endsWith('.')) {
    const sanitized = filename.trim().replace(/^\.+|\.+$/g, '');
    if (sanitized.length === 0) {
      return {
        valid: false,
        error: 'Filename cannot be empty after sanitization',
      };
    }
    return {
      valid: false,
      error: 'Filename cannot start or end with spaces or dots',
      sanitized,
    };
  }
  
  return { valid: true };
}

/**
 * Sanitize filename (remove dangerous characters)
 */
export function sanitizeFilename(filename: string): string {
  let sanitized = filename
    .replace(DANGEROUS_FILENAME_CHARS, '_')
    .trim()
    .replace(/^\.+|\.+$/g, '');
  
  // Ensure it's not empty
  if (sanitized.length === 0) {
    sanitized = 'file';
  }
  
  // Truncate if too long
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = name.substring(0, MAX_FILENAME_LENGTH - ext.length) + ext;
  }
  
  return sanitized;
}

/**
 * FE-025: Validate file type restrictions per category
 */
export interface FileTypeRestrictionResult {
  valid: boolean;
  error?: string;
  allowedExtensions?: string[];
}

export function validateFileTypeRestriction(
  file: File,
  category: string
): FileTypeRestrictionResult {
  const allowedExtensions = FILE_TYPE_RESTRICTIONS[category];
  
  if (!allowedExtensions || allowedExtensions.length === 0) {
    // No restrictions for this category
    return { valid: true };
  }
  
  const fileName = file.name.toLowerCase();
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File type ${extension} is not allowed for category "${category}". Allowed types: ${allowedExtensions.join(', ')}`,
      allowedExtensions,
    };
  }
  
  return { valid: true, allowedExtensions };
}

/**
 * FE-026: Validate email format
 */
export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      valid: false,
      error: 'Email address is required',
    };
  }
  
  const trimmedEmail = email.trim();
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      valid: false,
      error: 'Please enter a valid email address',
    };
  }
  
  // Additional checks
  if (trimmedEmail.length > 254) {
    return {
      valid: false,
      error: 'Email address is too long (maximum 254 characters)',
    };
  }
  
  const [localPart, domain] = trimmedEmail.split('@');
  if (localPart.length > 64) {
    return {
      valid: false,
      error: 'Email local part is too long (maximum 64 characters)',
    };
  }
  
  return { valid: true };
}

/**
 * FE-027: Validate folder name
 */
export interface FolderNameValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

export function validateFolderName(name: string): FolderNameValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Folder name cannot be empty',
    };
  }
  
  if (name.length > MAX_FOLDER_NAME_LENGTH) {
    return {
      valid: false,
      error: `Folder name exceeds maximum length of ${MAX_FOLDER_NAME_LENGTH} characters`,
    };
  }
  
  // Check for dangerous characters
  if (DANGEROUS_FILENAME_CHARS.test(name)) {
    const sanitized = name.replace(DANGEROUS_FILENAME_CHARS, '_');
    return {
      valid: false,
      error: 'Folder name contains invalid characters',
      sanitized,
    };
  }
  
  // Check for reserved names
  if (RESERVED_FILENAME_PATTERNS.test(name)) {
    return {
      valid: false,
      error: 'Folder name is a reserved system name',
    };
  }
  
  // Check for leading/trailing spaces or dots
  if (name.trim() !== name || name.startsWith('.') || name.endsWith('.')) {
    const sanitized = name.trim().replace(/^\.+|\.+$/g, '');
    if (sanitized.length === 0) {
      return {
        valid: false,
        error: 'Folder name cannot be empty after sanitization',
      };
    }
    return {
      valid: false,
      error: 'Folder name cannot start or end with spaces or dots',
      sanitized,
    };
  }
  
  return { valid: true };
}

/**
 * FE-028: Validate comment content length
 */
export interface CommentValidationResult {
  valid: boolean;
  error?: string;
  remaining?: number;
}

export function validateComment(content: string): CommentValidationResult {
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      error: 'Comment cannot be empty',
    };
  }
  
  if (content.length > MAX_COMMENT_LENGTH) {
    return {
      valid: false,
      error: `Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters`,
      remaining: MAX_COMMENT_LENGTH - content.length,
    };
  }
  
  return {
    valid: true,
    remaining: MAX_COMMENT_LENGTH - content.length,
  };
}

/**
 * FE-029: Validate file description length
 */
export interface DescriptionValidationResult {
  valid: boolean;
  error?: string;
  remaining?: number;
}

export function validateDescription(description: string): DescriptionValidationResult {
  // Description is optional, so empty is valid
  if (!description || description.trim().length === 0) {
    return { valid: true, remaining: MAX_DESCRIPTION_LENGTH };
  }
  
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`,
      remaining: MAX_DESCRIPTION_LENGTH - description.length,
    };
  }
  
  return {
    valid: true,
    remaining: MAX_DESCRIPTION_LENGTH - description.length,
  };
}

/**
 * FE-030: Check storage quota before upload
 */
export interface QuotaCheckResult {
  allowed: boolean;
  error?: string;
  warning?: string;
  usedBytes: number;
  limitBytes: number;
  availableBytes: number;
  percentage: number;
}

export function checkStorageQuota(
  fileSize: number,
  usedBytes: number,
  limitBytes: number
): QuotaCheckResult {
  const newUsed = usedBytes + fileSize;
  const percentage = limitBytes > 0 ? (newUsed / limitBytes) * 100 : 0;
  const availableBytes = limitBytes - usedBytes;
  
  if (newUsed > limitBytes) {
    return {
      allowed: false,
      error: `Uploading this file would exceed your storage limit. Available: ${formatBytes(availableBytes)}, Required: ${formatBytes(fileSize)}`,
      usedBytes,
      limitBytes,
      availableBytes,
      percentage,
    };
  }
  
  if (percentage > 90) {
    return {
      allowed: true,
      warning: `Warning: You're using ${percentage.toFixed(1)}% of your storage. Consider freeing up space.`,
      usedBytes,
      limitBytes,
      availableBytes: limitBytes - newUsed,
      percentage,
    };
  }
  
  return {
    allowed: true,
    usedBytes,
    limitBytes,
    availableBytes: limitBytes - newUsed,
    percentage,
  };
}

/**
 * Helper function to format bytes
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate max length for text fields
 */
export interface MaxLengthValidationResult {
  valid: boolean;
  error?: string;
  remaining?: number;
}

export function validateMaxLength(
  value: string,
  maxLength: number
): MaxLengthValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      valid: true,
      remaining: maxLength,
    };
  }
  
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `Text exceeds maximum length of ${maxLength} characters`,
      remaining: maxLength - value.length,
    };
  }
  
  return {
    valid: true,
    remaining: maxLength - value.length,
  };
}

/**
 * FE-XXX: Validate phone number format
 */
export interface PhoneValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePhone(phone: string): PhoneValidationResult {
  if (!phone || phone.trim().length === 0) {
    return {
      valid: true, // Phone is optional
    };
  }
  
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      error: 'Phone number contains invalid characters',
    };
  }
  
  if (digitsOnly.length < 10) {
    return {
      valid: false,
      error: 'Phone number must contain at least 10 digits',
    };
  }
  
  if (digitsOnly.length > 15) {
    return {
      valid: false,
      error: 'Phone number is too long (maximum 15 digits)',
    };
  }
  
  return { valid: true };
}

/**
 * FE-XXX: Validate URL format
 */
export interface URLValidationResult {
  valid: boolean;
  error?: string;
}

export function validateURL(url: string): URLValidationResult {
  if (!url || url.trim().length === 0) {
    return {
      valid: true, // URL is optional
    };
  }
  
  try {
    // Try to create URL object - this will validate the format
    const urlObj = new URL(url);
    
    // Ensure it's http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        valid: false,
        error: 'URL must use http:// or https:// protocol',
      };
    }
    
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL (e.g., https://example.com)',
    };
  }
}

/**
 * FE-XXX: Normalize URL (add protocol if missing)
 */
export function normalizeURL(url: string): string {
  if (!url || url.trim().length === 0) {
    return '';
  }
  
  const trimmed = url.trim();
  
  // If it already has a protocol, return as-is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // If it starts with www., add https://
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  
  // Otherwise, add https://
  return `https://${trimmed}`;
}

/**
 * FE-XXX: Validate resume data structure
 */
export interface ResumeDataValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateResumeData(resumeData: any): ResumeDataValidationResult {
  const errors: string[] = [];
  
  if (!resumeData || typeof resumeData !== 'object') {
    return {
      valid: false,
      errors: ['Resume data is required'],
    };
  }
  
  // Validate name (required)
  if (!resumeData.name || typeof resumeData.name !== 'string' || resumeData.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (resumeData.name.length > MAX_LENGTHS.NAME) {
    errors.push(`Name exceeds maximum length of ${MAX_LENGTHS.NAME} characters`);
  }
  
  // Validate title (optional but must be within length if provided)
  if (resumeData.title && typeof resumeData.title === 'string' && resumeData.title.length > MAX_LENGTHS.TITLE) {
    errors.push(`Title exceeds maximum length of ${MAX_LENGTHS.TITLE} characters`);
  }
  
  // Validate email (optional but must be valid if provided)
  if (resumeData.email) {
    const emailValidation = validateEmail(resumeData.email);
    if (!emailValidation.valid) {
      errors.push(emailValidation.error || 'Invalid email format');
    }
  }
  
  // Validate phone (optional but must be valid if provided)
  if (resumeData.phone) {
    const phoneValidation = validatePhone(resumeData.phone);
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.error || 'Invalid phone format');
    }
  }
  
  // Validate LinkedIn URL (optional but must be valid if provided)
  if (resumeData.linkedin) {
    const linkedinValidation = validateURL(resumeData.linkedin);
    if (!linkedinValidation.valid) {
      errors.push('Invalid LinkedIn URL');
    }
  }
  
  // Validate GitHub URL (optional but must be valid if provided)
  if (resumeData.github) {
    const githubValidation = validateURL(resumeData.github);
    if (!githubValidation.valid) {
      errors.push('Invalid GitHub URL');
    }
  }
  
  // Validate website URL (optional but must be valid if provided)
  if (resumeData.website) {
    const websiteValidation = validateURL(resumeData.website);
    if (!websiteValidation.valid) {
      errors.push('Invalid website URL');
    }
  }
  
  // Validate summary (optional but must be within length if provided)
  if (resumeData.summary && typeof resumeData.summary === 'string' && resumeData.summary.length > MAX_LENGTHS.SUMMARY) {
    errors.push(`Summary exceeds maximum length of ${MAX_LENGTHS.SUMMARY} characters`);
  }
  
  // Validate skills array
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    resumeData.skills.forEach((skill: any, index: number) => {
      if (typeof skill !== 'string') {
        errors.push(`Skill at index ${index} must be a string`);
      } else if (skill.length > MAX_LENGTHS.SKILL) {
        errors.push(`Skill "${skill.substring(0, 20)}..." exceeds maximum length of ${MAX_LENGTHS.SKILL} characters`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * FE-XXX: Sanitize resume data
 */
export function sanitizeResumeData(resumeData: any): any {
  if (!resumeData || typeof resumeData !== 'object') {
    return resumeData;
  }
  
  const sanitized = { ...resumeData };
  
  // Sanitize string fields
  const stringFields = ['name', 'title', 'email', 'phone', 'location', 'summary'];
  stringFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
      // Remove HTML tags
      sanitized[field] = sanitized[field].replace(/<[^>]*>/g, '');
    }
  });
  
  // Normalize URLs
  const urlFields = ['linkedin', 'github', 'website'];
  urlFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string' && sanitized[field].trim().length > 0) {
      sanitized[field] = normalizeURL(sanitized[field].trim());
    }
  });
  
  // Sanitize skills array
  if (sanitized.skills && Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills
      .filter((skill: any) => typeof skill === 'string')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0 && skill.length <= MAX_LENGTHS.SKILL);
  }
  
  // Sanitize experience array
  if (sanitized.experience && Array.isArray(sanitized.experience)) {
    sanitized.experience = sanitized.experience.map((exp: any) => {
      if (!exp || typeof exp !== 'object') return exp;
      const sanitizedExp = { ...exp };
      
      // Sanitize string fields in experience
      ['company', 'position', 'period', 'location', 'description'].forEach(field => {
        if (sanitizedExp[field] && typeof sanitizedExp[field] === 'string') {
          sanitizedExp[field] = sanitizedExp[field].trim().replace(/<[^>]*>/g, '');
          if (field === 'company' && sanitizedExp[field].length > MAX_LENGTHS.COMPANY) {
            sanitizedExp[field] = sanitizedExp[field].substring(0, MAX_LENGTHS.COMPANY);
          }
          if (field === 'position' && sanitizedExp[field].length > MAX_LENGTHS.TITLE) {
            sanitizedExp[field] = sanitizedExp[field].substring(0, MAX_LENGTHS.TITLE);
          }
        }
      });
      
      // Sanitize bullet points
      if (sanitizedExp.bullets && Array.isArray(sanitizedExp.bullets)) {
        sanitizedExp.bullets = sanitizedExp.bullets
          .map((bullet: any) => {
            if (typeof bullet !== 'string') return '';
            const sanitized = bullet.trim().replace(/<[^>]*>/g, '');
            return sanitized.length > MAX_LENGTHS.BULLET ? sanitized.substring(0, MAX_LENGTHS.BULLET) : sanitized;
          })
          .filter((bullet: string) => bullet.length > 0);
      }
      
      return sanitizedExp;
    }).filter((exp: any) => exp && typeof exp === 'object');
  }
  
  // Sanitize education array
  if (sanitized.education && Array.isArray(sanitized.education)) {
    sanitized.education = sanitized.education.map((edu: any) => {
      if (!edu || typeof edu !== 'object') return edu;
      const sanitizedEdu = { ...edu };
      
      ['school', 'degree', 'field', 'period', 'location'].forEach(field => {
        if (sanitizedEdu[field] && typeof sanitizedEdu[field] === 'string') {
          sanitizedEdu[field] = sanitizedEdu[field].trim().replace(/<[^>]*>/g, '');
          if (field === 'school' && sanitizedEdu[field].length > MAX_LENGTHS.SCHOOL) {
            sanitizedEdu[field] = sanitizedEdu[field].substring(0, MAX_LENGTHS.SCHOOL);
          }
          if (field === 'degree' && sanitizedEdu[field].length > MAX_LENGTHS.DEGREE) {
            sanitizedEdu[field] = sanitizedEdu[field].substring(0, MAX_LENGTHS.DEGREE);
          }
        }
      });
      
      return sanitizedEdu;
    }).filter((edu: any) => edu && typeof edu === 'object');
  }
  
  // Sanitize projects array (similar to experience)
  if (sanitized.projects && Array.isArray(sanitized.projects)) {
    sanitized.projects = sanitized.projects.map((proj: any) => {
      if (!proj || typeof proj !== 'object') return proj;
      const sanitizedProj = { ...proj };
      
      ['name', 'description', 'technologies', 'url'].forEach(field => {
        if (sanitizedProj[field]) {
          if (typeof sanitizedProj[field] === 'string') {
            sanitizedProj[field] = sanitizedProj[field].trim().replace(/<[^>]*>/g, '');
            if (field === 'url' && sanitizedProj[field].length > 0) {
              sanitizedProj[field] = normalizeURL(sanitizedProj[field]);
            }
          }
        }
      });
      
      return sanitizedProj;
    }).filter((proj: any) => proj && typeof proj === 'object');
  }
  
  return sanitized;
}