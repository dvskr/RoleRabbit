/**
 * Validation utilities for form inputs
 */

// Maximum length constants for resume fields
export const MAX_LENGTHS = {
  RESUME_NAME: 100,
  NAME: 100,
  TITLE: 100,
  EMAIL: 254,
  PHONE: 20,
  SUMMARY: 1000,
  LOCATION: 100,
  EXPERIENCE_BULLET: 500,
  EXPERIENCE_DESCRIPTION: 1000,
  PROJECT_DESCRIPTION: 1000,
  EDUCATION_DESCRIPTION: 500,
  CERTIFICATION_DESCRIPTION: 500,
  CUSTOM_FIELD: 200,
  CUSTOM_SECTION_NAME: 50,
  CUSTOM_SECTION_CONTENT: 5000,
} as const;

// Font size, margin, and spacing validation ranges
export const FORMATTING_RANGES = {
  FONT_SIZE: { min: 8, max: 18, unit: 'px' },
  MARGINS: { min: 0.25, max: 2, unit: 'in' },
  LINE_SPACING: { min: 1.0, max: 2.5, unit: '' },
  SECTION_SPACING: { min: 0, max: 3, unit: 'rem' },
} as const;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
// Matches: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +1 123 456 7890, etc.
const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Validates email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  if (!EMAIL_REGEX.test(email.trim())) {
    return { 
      isValid: false, 
      error: 'Please enter a valid email address (e.g., name@example.com)' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates phone number format
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  // Remove common formatting characters for validation
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it's all digits (with optional + prefix)
  if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid phone number (e.g., (123) 456-7890 or +1 123 456 7890)' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates URL format
 */
export const validateURL = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const trimmed = url.trim();
  
  // If it doesn't start with http:// or https://, try to validate as domain
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    // Try adding https:// for validation
    if (URL_REGEX.test(`https://${trimmed}`)) {
      return { isValid: true };
    }
  }
  
  if (!URL_REGEX.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid URL (e.g., https://example.com or example.com)' 
    };
  }
  
  return { isValid: true };
};

/**
 * Normalizes URL by adding https:// if missing
 */
export const normalizeURL = (url: string): string => {
  if (!url || url.trim() === '') {
    return url;
  }
  
  const trimmed = url.trim();
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // If it starts with //, assume https
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  
  // Otherwise, add https://
  return `https://${trimmed}`;
};

/**
 * Validates text length
 */
export const validateMaxLength = (
  text: string, 
  maxLength: number
): { isValid: boolean; error?: string; remaining?: number } => {
  const length = text.length;
  const remaining = maxLength - length;
  
  if (length > maxLength) {
    return { 
      isValid: false, 
      error: `Maximum ${maxLength} characters allowed (${length - maxLength} over limit)`,
      remaining: 0
    };
  }
  
  return { isValid: true, remaining };
};

/**
 * Sanitizes HTML to prevent XSS attacks
 * Removes all HTML tags and returns plain text
 * For more advanced sanitization, consider using DOMPurify library
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  if (typeof window === 'undefined') {
    // Server-side: just remove HTML tags using regex (basic sanitization)
    return html.replace(/<[^>]*>/g, '');
  }
  
  // Client-side: use DOM to safely extract text content
  try {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  } catch (e) {
    // Fallback to regex if DOM manipulation fails
    return html.replace(/<[^>]*>/g, '');
  }
};

/**
 * Sanitizes user input to remove potentially dangerous characters
 * Use this before storing user input in the database
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Validates required field
 */
export const validateRequired = (
  value: string | null | undefined, 
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } => {
  if (!value || value.trim() === '') {
    return { 
      isValid: false, 
      error: `${fieldName} is required` 
    };
  }
  
  return { isValid: true };
};

/**
 * Parses a date string (flexible format)
 * Supports: "Jan 2020", "January 2020", "2020-01", "01/2020", "Present", "Current", etc.
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }
  
  const trimmed = dateStr.trim().toLowerCase();
  
  // Handle "Present", "Current", "Now", etc.
  if (['present', 'current', 'now', 'ongoing'].includes(trimmed)) {
    return new Date(); // Return current date
  }
  
  // Try parsing as ISO date first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // Try parsing common formats
  // Format: "Jan 2020", "January 2020"
  const monthYearMatch = dateStr.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIndex = monthNames.findIndex(m => monthYearMatch[1].toLowerCase().startsWith(m));
    if (monthIndex !== -1) {
      return new Date(parseInt(monthYearMatch[2]), monthIndex, 1);
    }
  }
  
  // Format: "2020-01", "2020/01"
  const yearMonthMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})$/);
  if (yearMonthMatch) {
    return new Date(parseInt(yearMonthMatch[1]), parseInt(yearMonthMatch[2]) - 1, 1);
  }
  
  // Format: "01/2020", "01-2020"
  const monthYearNumMatch = dateStr.match(/^(\d{1,2})[-\/](\d{4})$/);
  if (monthYearNumMatch) {
    return new Date(parseInt(monthYearNumMatch[2]), parseInt(monthYearNumMatch[1]) - 1, 1);
  }
  
  // Format: "2020" (year only)
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1]), 0, 1);
  }
  
  return null;
};

/**
 * Validates date range (start date must be before end date)
 */
export const validateDateRange = (
  startDate: string, 
  endDate: string
): { isValid: boolean; error?: string; warning?: string } => {
  if (!startDate || !endDate) {
    return { isValid: true }; // Empty dates are valid (optional)
  }
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) {
    return { isValid: true }; // If we can't parse, don't show error (user might be typing)
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
 * Validates future date (warns if date is too far in the future)
 */
export const validateFutureDate = (
  dateStr: string,
  allowPresent: boolean = true
): { isValid: boolean; warning?: string } => {
  if (!dateStr) {
    return { isValid: true }; // Empty is valid
  }
  
  const trimmed = dateStr.trim().toLowerCase();
  
  // "Present" is always valid if allowed
  if (allowPresent && ['present', 'current', 'now', 'ongoing'].includes(trimmed)) {
    return { isValid: true };
  }
  
  const date = parseDate(dateStr);
  if (!date) {
    return { isValid: true }; // Can't parse, don't warn
  }
  
  const now = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(now.getFullYear() + 2);
  
  if (date > twoYearsFromNow) {
    return { 
      isValid: true, // Still valid, just a warning
      warning: 'Date seems far in the future. Please verify.' 
    };
  }
  
  return { isValid: true };
};

/**
 * Checks if two experience entries are duplicates
 * Considers company, position, and dates
 */
export const isDuplicateExperience = (
  exp1: { company?: string; position?: string; period?: string; endPeriod?: string },
  exp2: { company?: string; position?: string; period?: string; endPeriod?: string }
): boolean => {
  const normalize = (str: string | undefined) => (str || '').trim().toLowerCase();
  
  return (
    normalize(exp1.company) === normalize(exp2.company) &&
    normalize(exp1.position) === normalize(exp2.position) &&
    normalize(exp1.period) === normalize(exp2.period) &&
    normalize(exp1.endPeriod) === normalize(exp2.endPeriod)
  );
};

/**
 * Validates custom section name
 * Rules: No empty strings, no duplicates, no special characters that break rendering, max 50 characters
 */
export const validateCustomSectionName = (
  name: string,
  existingNames: string[] = []
): { isValid: boolean; error?: string } => {
  // Check if empty
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'Section name cannot be empty'
    };
  }
  
  const trimmedName = name.trim();
  
  // Check max length
  if (trimmedName.length > MAX_LENGTHS.CUSTOM_SECTION_NAME) {
    return {
      isValid: false,
      error: `Section name must be ${MAX_LENGTHS.CUSTOM_SECTION_NAME} characters or less`
    };
  }
  
  // Check for duplicates (case-insensitive)
  const isDuplicate = existingNames.some(
    existing => existing.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (isDuplicate) {
    return {
      isValid: false,
      error: 'A section with this name already exists'
    };
  }
  
  // Check for special characters that could break rendering
  // Allow letters, numbers, spaces, hyphens, and common punctuation
  const invalidCharsRegex = /[<>{}[\]\\\/|`~]/;
  if (invalidCharsRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Section name contains invalid characters'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates resume data before saving
 * Returns validation result with errors for each invalid field
 */
export const validateResumeData = (resumeData: any): { 
  isValid: boolean; 
  errors: Record<string, string> 
} => {
  const errors: Record<string, string> = {};
  
  // ❌ REMOVED: Name validation - not required for auto-save
  // Auto-save should work even with empty/partial data
  
  // Validate email if provided
  if (resumeData?.email && resumeData.email.trim() !== '') {
    const emailValidation = validateEmail(resumeData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error || 'Invalid email format';
    }
  }
  
  // Validate phone if provided
  if (resumeData?.phone && resumeData.phone.trim() !== '') {
    const phoneValidation = validatePhone(resumeData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || 'Invalid phone format';
    }
  }
  
  // Validate URLs if provided
  if (resumeData?.linkedin && resumeData.linkedin.trim() !== '') {
    const urlValidation = validateURL(resumeData.linkedin);
    if (!urlValidation.isValid) {
      errors.linkedin = urlValidation.error || 'Invalid URL format';
    }
  }
  
  if (resumeData?.github && resumeData.github.trim() !== '') {
    const urlValidation = validateURL(resumeData.github);
    if (!urlValidation.isValid) {
      errors.github = urlValidation.error || 'Invalid URL format';
    }
  }
  
  if (resumeData?.website && resumeData.website.trim() !== '') {
    const urlValidation = validateURL(resumeData.website);
    if (!urlValidation.isValid) {
      errors.website = urlValidation.error || 'Invalid URL format';
    }
  }
  
  // Validate max lengths
  if (resumeData?.name && resumeData.name.length > MAX_LENGTHS.NAME) {
    errors.name = `Name must be ${MAX_LENGTHS.NAME} characters or less`;
  }
  
  if (resumeData?.title && resumeData.title.length > MAX_LENGTHS.TITLE) {
    errors.title = `Title must be ${MAX_LENGTHS.TITLE} characters or less`;
  }
  
  if (resumeData?.summary && resumeData.summary.length > MAX_LENGTHS.SUMMARY) {
    errors.summary = `Summary must be ${MAX_LENGTHS.SUMMARY} characters or less`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Recursively sanitizes all string fields in an object
 * Use this before sending data to the backend to prevent XSS
 * Preserves non-string types (numbers, booleans, dates, etc.)
 */
export const sanitizeResumeData = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Preserve Date objects (they'll be serialized to ISO strings by JSON.stringify)
  if (data instanceof Date) {
    return data;
  }
  
  // Sanitize strings
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  // Preserve primitives (numbers, booleans, etc.)
  if (typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeResumeData(item));
  }
  
  // Handle objects (but skip certain built-in objects)
  if (data.constructor !== Object && data.constructor !== Array) {
    // For complex objects, try to extract their value or return as-is
    return data;
  }
  
  // Recursively sanitize object properties
  const sanitized: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      // Skip metadata fields that might contain Date objects - they'll be handled by JSON.stringify
      if (key === 'metadata' && typeof data[key] === 'object') {
        sanitized[key] = data[key];
      } else {
        sanitized[key] = sanitizeResumeData(data[key]);
      }
    }
  }
  return sanitized;
};

