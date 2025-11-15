/**
 * Validation Utilities
 * Section 2.8: Input Validation & Schema Definitions
 *
 * Helper functions for validation, error formatting, and data sanitization
 */

import { z, ZodError } from 'zod';

// ============================================================================
// ERROR FORMATTING
// ============================================================================

/**
 * Format Zod validation errors into user-friendly messages
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Convert ZodError to structured validation errors
 */
export function formatValidationErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Get first validation error message
 */
export function getFirstErrorMessage(error: ZodError): string {
  const firstError = error.errors[0];
  if (!firstError) return 'Validation failed';

  const field = firstError.path.join('.');
  return field ? `${field}: ${firstError.message}` : firstError.message;
}

/**
 * Group validation errors by field
 */
export function groupErrorsByField(error: ZodError): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const err of error.errors) {
    const field = err.path.join('.') || '_root';
    if (!grouped[field]) {
      grouped[field] = [];
    }
    grouped[field].push(err.message);
  }

  return grouped;
}

// ============================================================================
// SAFE VALIDATION HELPERS
// ============================================================================

/**
 * Safely validate data and return result with error handling
 */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): {
  success: true;
  data: z.infer<T>;
} | {
  success: false;
  error: ZodError;
  errors: ValidationError[];
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error,
    errors: formatValidationErrors(result.error),
  };
}

/**
 * Validate or throw with formatted error
 */
export function validateOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  errorMessage?: string
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = errorMessage || getFirstErrorMessage(error);
      throw new ValidationException(message, formatValidationErrors(error));
    }
    throw error;
  }
}

/**
 * Custom validation exception
 */
export class ValidationException extends Error {
  constructor(
    message: string,
    public readonly errors: ValidationError[]
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

// ============================================================================
// DATA SANITIZATION
// ============================================================================

/**
 * Remove null/undefined values from object
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        result[key] = removeNullish(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Deep clone object (JSON-safe)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sanitize string input (trim, remove extra spaces)
 */
export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize object strings recursively
 */
export function sanitizeObjectStrings<T extends Record<string, any>>(obj: T): T {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' ? sanitizeObjectStrings(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObjectStrings(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ============================================================================
// URL VALIDATION HELPERS
// ============================================================================

/**
 * Normalize URL (ensure protocol, remove trailing slash)
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add https:// if no protocol
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, '');

  return normalized;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if URL is from allowed domain
 */
export function isAllowedDomain(url: string, allowedDomains: string[]): boolean {
  const domain = extractDomain(url);
  if (!domain) return false;

  return allowedDomains.some((allowed) =>
    domain === allowed || domain.endsWith(`.${allowed}`)
  );
}

// ============================================================================
// SLUG VALIDATION HELPERS
// ============================================================================

/**
 * Generate unique slug with timestamp suffix
 */
export function generateUniqueSlug(baseSlug: string): string {
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}

/**
 * Validate slug uniqueness (factory function)
 */
export function createSlugUniquenessValidator(
  checkExists: (slug: string) => Promise<boolean>
) {
  return async (slug: string): Promise<boolean> => {
    const exists = await checkExists(slug);
    return !exists;
  };
}

// ============================================================================
// FILE VALIDATION HELPERS
// ============================================================================

/**
 * Check file extension
 */
export function hasValidExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext || null;
}

/**
 * Validate file size
 */
export function isFileSizeValid(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ============================================================================
// DATE VALIDATION HELPERS
// ============================================================================

/**
 * Check if date string is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Check if date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date.getTime() > Date.now();
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date.getTime() < Date.now();
}

/**
 * Validate date range (start before end)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start.getTime() <= end.getTime();
}

// ============================================================================
// ARRAY VALIDATION HELPERS
// ============================================================================

/**
 * Check if array has duplicates
 */
export function hasDuplicates<T>(arr: T[]): boolean {
  return new Set(arr).size !== arr.length;
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Check if array is within size limit
 */
export function isArraySizeValid<T>(arr: T[], maxSize: number): boolean {
  return arr.length <= maxSize;
}

// ============================================================================
// PASSWORD VALIDATION HELPERS
// ============================================================================

/**
 * Validate password strength
 */
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-5
  feedback: string[];
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length < 8) feedback.push('Password should be at least 8 characters');

  // Complexity checks
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z\d]/.test(password)) score++;
  else feedback.push('Include special characters');

  // Common patterns
  if (/^(.)\1+$/.test(password)) {
    score = 0;
    feedback.push('Avoid repeated characters');
  }

  if (/^(123|abc|qwerty)/i.test(password)) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  return {
    isValid: score >= 3,
    score: Math.min(5, score),
    feedback,
  };
}

// ============================================================================
// EMAIL VALIDATION HELPERS
// ============================================================================

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string | null {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : null;
}

/**
 * Check if email is from allowed domain
 */
export function isEmailFromDomain(email: string, allowedDomains: string[]): boolean {
  const domain = getEmailDomain(email);
  return domain ? allowedDomains.includes(domain) : false;
}

/**
 * Check if email is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
  ];

  const domain = getEmailDomain(email);
  return domain ? disposableDomains.includes(domain) : false;
}

// ============================================================================
// PHONE NUMBER HELPERS
// ============================================================================

/**
 * Format phone number to E.164 format
 */
export function formatPhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Format phone number to display format
 */
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

// ============================================================================
// COLOR VALIDATION HELPERS
// ============================================================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Check color contrast ratio (WCAG)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check if colors meet WCAG AA standard
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // AA standard for normal text
}

/**
 * Check if colors meet WCAG AAA standard
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 7; // AAA standard for normal text
}

// ============================================================================
// SUBDOMAIN VALIDATION HELPERS
// ============================================================================

/**
 * Reserved subdomain list
 */
export const RESERVED_SUBDOMAINS = [
  'www', 'api', 'admin', 'app', 'blog', 'dashboard', 'mail', 'ftp',
  'localhost', 'staging', 'dev', 'test', 'prod', 'production', 'demo',
  'docs', 'help', 'support', 'status', 'about', 'contact', 'login',
  'signup', 'register', 'auth', 'oauth', 'settings', 'account', 'profile',
  'cdn', 'static', 'assets', 'media', 'images', 'uploads', 'downloads',
  'files', 'webhooks', 'analytics',
];

/**
 * Check if subdomain is reserved
 */
export function isSubdomainReserved(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

/**
 * Suggest alternative subdomain if taken
 */
export function suggestAlternativeSubdomain(subdomain: string): string[] {
  const suggestions: string[] = [];

  // Add numeric suffix
  for (let i = 1; i <= 3; i++) {
    suggestions.push(`${subdomain}${i}`);
  }

  // Add year suffix
  const year = new Date().getFullYear();
  suggestions.push(`${subdomain}${year}`);

  // Add random suffix
  const random = Math.random().toString(36).substring(2, 5);
  suggestions.push(`${subdomain}-${random}`);

  return suggestions;
}
