/**
 * File Upload Validation Utilities
 *
 * Provides comprehensive file validation for secure uploads.
 * Prevents malicious files, validates types/sizes, and ensures data integrity.
 *
 * Security Features:
 * - File type validation (MIME type + extension)
 * - File size limits
 * - File name sanitization
 * - Malicious file detection
 * - Content type verification
 *
 * Usage:
 * ```ts
 * const result = await validateResumeFile(file);
 * if (!result.valid) {
 *   console.error(result.errors);
 *   return;
 * }
 * // File is safe to upload
 * ```
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Allowed MIME types for resume uploads
 */
export const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain', // .txt
] as const;

/**
 * Allowed file extensions for resume uploads
 */
export const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'] as const;

/**
 * Maximum file size (10 MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

/**
 * Minimum file size (1 KB)
 */
export const MIN_FILE_SIZE = 1024; // 1 KB in bytes

/**
 * Maximum filename length
 */
export const MAX_FILENAME_LENGTH = 255;

/**
 * Dangerous file extensions that should never be uploaded
 */
export const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.scr',
  '.js',
  '.vbs',
  '.jar',
  '.msi',
  '.app',
  '.deb',
  '.rpm',
  '.sh',
  '.ps1',
] as const;

// ============================================================================
// TYPES
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

export interface FileValidationOptions {
  maxSize?: number;
  minSize?: number;
  allowedTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  checkContent?: boolean;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate file extension
 *
 * @param filename - File name to check
 * @param allowedExtensions - Array of allowed extensions
 * @returns true if extension is allowed
 */
export function isValidExtension(
  filename: string,
  allowedExtensions: readonly string[]
): boolean {
  if (!filename) return false;

  const extension = getFileExtension(filename);
  if (!extension) return false;

  return allowedExtensions.some(
    (allowed) => allowed.toLowerCase() === extension.toLowerCase()
  );
}

/**
 * Get file extension from filename
 *
 * @param filename - File name
 * @returns Extension with dot (e.g., '.pdf') or empty string
 */
export function getFileExtension(filename: string): string {
  if (!filename) return '';

  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }

  return filename.substring(lastDotIndex);
}

/**
 * Check if file extension is dangerous
 *
 * @param filename - File name to check
 * @returns true if extension is dangerous
 */
export function isDangerousExtension(filename: string): boolean {
  if (!filename) return false;

  const extension = getFileExtension(filename);
  if (!extension) return false;

  return DANGEROUS_EXTENSIONS.some(
    (dangerous) => dangerous.toLowerCase() === extension.toLowerCase()
  );
}

/**
 * Validate file MIME type
 *
 * @param mimeType - MIME type to check
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if MIME type is allowed
 */
export function isValidMimeType(
  mimeType: string,
  allowedTypes: readonly string[]
): boolean {
  if (!mimeType) return false;

  return allowedTypes.some(
    (allowed) => allowed.toLowerCase() === mimeType.toLowerCase()
  );
}

/**
 * Validate file size
 *
 * @param size - File size in bytes
 * @param options - Validation options
 * @returns Object with valid flag and error message
 */
export function validateFileSize(
  size: number,
  options: { maxSize?: number; minSize?: number } = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize ?? MAX_FILE_SIZE;
  const minSize = options.minSize ?? MIN_FILE_SIZE;

  if (size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
    };
  }

  if (size < minSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(size)}) is below minimum required size (${formatFileSize(minSize)})`,
    };
  }

  return { valid: true };
}

/**
 * Validate filename
 *
 * Checks for:
 * - Length
 * - Special characters
 * - Path traversal attempts
 * - Null bytes
 *
 * @param filename - File name to validate
 * @returns Object with valid flag and error message
 */
export function validateFilename(
  filename: string
): { valid: boolean; error?: string } {
  if (!filename) {
    return { valid: false, error: 'Filename is empty' };
  }

  // Check length
  if (filename.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Filename too long (max ${MAX_FILENAME_LENGTH} characters)`,
    };
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return { valid: false, error: 'Filename contains null bytes' };
  }

  // Check for path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: 'Filename contains invalid path characters' };
  }

  // Check for control characters
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(filename)) {
    return { valid: false, error: 'Filename contains control characters' };
  }

  return { valid: true };
}

/**
 * Sanitize filename
 *
 * Removes dangerous characters and limits length
 *
 * @param filename - File name to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'file';

  let sanitized = filename;

  // Remove path separators
  sanitized = sanitized.replace(/[/\\]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Replace multiple dots with single dot
  sanitized = sanitized.replace(/\.{2,}/g, '.');

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');

  // Limit length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const extension = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(0, sanitized.length - extension.length);
    const maxNameLength = MAX_FILENAME_LENGTH - extension.length;
    sanitized = nameWithoutExt.substring(0, maxNameLength) + extension;
  }

  return sanitized || 'file';
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Read file as ArrayBuffer (for content validation)
 *
 * @param file - File to read
 * @param maxBytes - Maximum bytes to read (default: 1024)
 * @returns Promise with ArrayBuffer
 */
export function readFileHeader(file: File, maxBytes = 1024): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as ArrayBuffer);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    const slice = file.slice(0, maxBytes);
    reader.readAsArrayBuffer(slice);
  });
}

/**
 * Validate file by magic bytes (file signature)
 *
 * Checks the first few bytes of the file to verify actual file type
 *
 * @param file - File to validate
 * @returns Promise with validation result
 */
export async function validateFileSignature(file: File): Promise<{
  valid: boolean;
  detectedType?: string;
  error?: string;
}> {
  try {
    const buffer = await readFileHeader(file, 512);
    const bytes = new Uint8Array(buffer);

    // PDF signature: %PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { valid: true, detectedType: 'application/pdf' };
    }

    // DOC signature: D0 CF 11 E0 A1 B1 1A E1 (OLE Compound File)
    if (
      bytes[0] === 0xd0 &&
      bytes[1] === 0xcf &&
      bytes[2] === 0x11 &&
      bytes[3] === 0xe0 &&
      bytes[4] === 0xa1 &&
      bytes[5] === 0xb1 &&
      bytes[6] === 0x1a &&
      bytes[7] === 0xe1
    ) {
      return { valid: true, detectedType: 'application/msword' };
    }

    // DOCX signature: 50 4B 03 04 (ZIP archive - need to check further)
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      // DOCX is a ZIP file, check if it contains word/ folder
      // For now, accept as valid DOCX
      return {
        valid: true,
        detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }

    // Plain text (no specific signature, check for printable ASCII)
    const isPrintableText = bytes
      .slice(0, 100)
      .every((byte) => byte === 0x09 || byte === 0x0a || byte === 0x0d || (byte >= 0x20 && byte <= 0x7e));

    if (isPrintableText) {
      return { valid: true, detectedType: 'text/plain' };
    }

    return {
      valid: false,
      error: 'File type could not be verified. File may be corrupted or not a valid resume format.',
    };
  } catch (error) {
    return {
      valid: false,
      error: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validate resume file upload
 *
 * Performs comprehensive validation:
 * - Filename validation
 * - File size validation
 * - Extension validation
 * - MIME type validation
 * - Dangerous extension check
 * - Optional: File signature validation
 *
 * @param file - File to validate
 * @param options - Validation options
 * @returns Promise with validation result
 *
 * @example
 * ```ts
 * const result = await validateResumeFile(file);
 * if (!result.valid) {
 *   alert(result.errors.join('\n'));
 *   return;
 * }
 * // File is valid, proceed with upload
 * ```
 */
export async function validateResumeFile(
  file: File | null | undefined,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors, warnings };
  }

  const {
    maxSize = MAX_FILE_SIZE,
    minSize = MIN_FILE_SIZE,
    allowedTypes = ALLOWED_RESUME_MIME_TYPES,
    allowedExtensions = ALLOWED_RESUME_EXTENSIONS,
    checkContent = true,
  } = options;

  // Validate filename
  const filenameValidation = validateFilename(file.name);
  if (!filenameValidation.valid) {
    errors.push(filenameValidation.error!);
  }

  // Check for dangerous extension
  if (isDangerousExtension(file.name)) {
    errors.push(
      `Dangerous file type detected (${getFileExtension(file.name)}). This file type is not allowed.`
    );
  }

  // Validate extension
  if (!isValidExtension(file.name, allowedExtensions)) {
    const extension = getFileExtension(file.name) || 'unknown';
    errors.push(
      `Invalid file extension: ${extension}. Allowed: ${allowedExtensions.join(', ')}`
    );
  }

  // Validate MIME type
  if (file.type && !isValidMimeType(file.type, allowedTypes)) {
    warnings.push(
      `File MIME type "${file.type}" doesn't match expected types. File may not be valid.`
    );
  }

  // Validate file size
  const sizeValidation = validateFileSize(file.size, { maxSize, minSize });
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error!);
  }

  // Validate file signature (content)
  if (checkContent && errors.length === 0) {
    try {
      const signatureValidation = await validateFileSignature(file);
      if (!signatureValidation.valid) {
        errors.push(signatureValidation.error || 'Invalid file content');
      } else if (signatureValidation.detectedType && file.type !== signatureValidation.detectedType) {
        warnings.push(
          `File extension and content don't match. Detected type: ${signatureValidation.detectedType}`
        );
      }
    } catch (error) {
      warnings.push('Could not verify file content');
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getFileExtension(file.name),
    },
  };
}

/**
 * Validate multiple files
 *
 * @param files - Array of files to validate
 * @param options - Validation options
 * @returns Promise with array of validation results
 */
export async function validateMultipleFiles(
  files: File[],
  options: FileValidationOptions = {}
): Promise<FileValidationResult[]> {
  return Promise.all(files.map((file) => validateResumeFile(file, options)));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Main validation
  validateResumeFile,
  validateMultipleFiles,

  // Individual validators
  isValidExtension,
  isValidMimeType,
  validateFileSize,
  validateFilename,
  validateFileSignature,

  // Utilities
  getFileExtension,
  isDangerousExtension,
  sanitizeFilename,
  formatFileSize,
  readFileHeader,

  // Constants
  ALLOWED_RESUME_MIME_TYPES,
  ALLOWED_RESUME_EXTENSIONS,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE,
  MAX_FILENAME_LENGTH,
  DANGEROUS_EXTENSIONS,
};
