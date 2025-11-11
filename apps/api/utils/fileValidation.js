/**
 * File Operation Validation Utilities
 *
 * Provides validation functions for file-related operations to prevent
 * security vulnerabilities, data corruption, and invalid inputs.
 *
 * @module fileValidation
 */

const logger = require('./logger');

/**
 * Validate email address format
 * Prevents email injection attacks and ensures valid format
 *
 * @param {string} email - Email address to validate
 * @returns {{valid: boolean, error?: string, sanitized?: string}}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  // Check for email header injection attempts
  if (trimmed.includes('\n') || trimmed.includes('\r') || trimmed.includes('\0')) {
    logger.warn('Email injection attempt detected:', email);
    return { valid: false, error: 'Invalid email address' };
  }

  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check length constraints
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email address too long' };
  }

  const [localPart, domain] = trimmed.split('@');
  if (localPart.length > 64) {
    return { valid: false, error: 'Email local part too long' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate share permission level
 *
 * @param {string} permission - Permission level to validate
 * @returns {{valid: boolean, error?: string, sanitized?: string}}
 */
function validatePermission(permission) {
  const validPermissions = ['view', 'comment', 'edit', 'admin'];
  const normalized = permission ? permission.toLowerCase().trim() : 'view';

  if (!validPermissions.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid permission. Must be one of: ${validPermissions.join(', ')}`
    };
  }

  return { valid: true, sanitized: normalized };
}

/**
 * Validate expiration date
 * Ensures date is valid, in the future, and not too far in the future
 *
 * @param {string|Date} expiresAt - Expiration date to validate
 * @param {number} maxYears - Maximum years in future (default: 1)
 * @returns {{valid: boolean, error?: string, sanitized?: Date}}
 */
function validateExpirationDate(expiresAt, maxYears = 1) {
  if (!expiresAt) {
    return { valid: true, sanitized: null }; // null is valid (no expiration)
  }

  let date;
  try {
    date = new Date(expiresAt);
  } catch (error) {
    return { valid: false, error: 'Invalid date format' };
  }

  // Check if valid date
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  const now = new Date();

  // Check if future date
  if (date <= now) {
    return { valid: false, error: 'Expiration date must be in the future' };
  }

  // Check max expiration
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + maxYears);

  if (date > maxDate) {
    return {
      valid: false,
      error: `Expiration date cannot be more than ${maxYears} year(s) in the future`
    };
  }

  return { valid: true, sanitized: date };
}

/**
 * Validate maxDownloads value
 *
 * @param {number|string} maxDownloads - Maximum downloads to validate
 * @param {number} max - Maximum allowed value (default: 10000)
 * @returns {{valid: boolean, error?: string, sanitized?: number}}
 */
function validateMaxDownloads(maxDownloads, max = 10000) {
  if (maxDownloads === null || maxDownloads === undefined || maxDownloads === '') {
    return { valid: true, sanitized: null }; // null is valid (no limit)
  }

  const parsed = parseInt(maxDownloads, 10);

  if (isNaN(parsed)) {
    return { valid: false, error: 'maxDownloads must be a number' };
  }

  if (parsed < 1) {
    return { valid: false, error: 'maxDownloads must be at least 1' };
  }

  if (parsed > max) {
    return { valid: false, error: `maxDownloads cannot exceed ${max}` };
  }

  return { valid: true, sanitized: parsed };
}

/**
 * Escape HTML special characters to prevent XSS
 *
 * @param {string} unsafe - Unsafe string that may contain HTML
 * @returns {string} - HTML-safe string
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';

  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate file type based on MIME type
 *
 * @param {string} mimeType - MIME type to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types (default: all)
 * @returns {{valid: boolean, error?: string}}
 */
function validateFileType(mimeType, allowedTypes = null) {
  if (!mimeType) {
    return { valid: false, error: 'MIME type is required' };
  }

  // If no restrictions, allow all
  if (!allowedTypes || allowedTypes.length === 0) {
    return { valid: true };
  }

  // Check against allowed types (support wildcards like 'image/*')
  const isAllowed = allowedTypes.some(allowed => {
    if (allowed.endsWith('/*')) {
      const category = allowed.split('/')[0];
      return mimeType.startsWith(category + '/');
    }
    return mimeType === allowed;
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 *
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {{valid: boolean, error?: string}}
 */
function validateFileSize(size, maxSize) {
  if (typeof size !== 'number' || size < 0) {
    return { valid: false, error: 'Invalid file size' };
  }

  if (size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxMB} MB`
    };
  }

  return { valid: true };
}

/**
 * Validate file name
 * Prevents path traversal and invalid characters
 *
 * @param {string} filename - File name to validate
 * @returns {{valid: boolean, error?: string, sanitized?: string}}
 */
function validateFileName(filename) {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'File name is required' };
  }

  const trimmed = filename.trim();

  // Check for empty after trim
  if (trimmed.length === 0) {
    return { valid: false, error: 'File name cannot be empty' };
  }

  // Check length
  if (trimmed.length > 255) {
    return { valid: false, error: 'File name too long (max 255 characters)' };
  }

  // Check for path traversal attempts
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    logger.warn('Path traversal attempt in filename:', filename);
    return { valid: false, error: 'Invalid file name' };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  if (invalidChars.test(trimmed)) {
    return { valid: false, error: 'File name contains invalid characters' };
  }

  // Check for reserved names (Windows)
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  const nameWithoutExt = trimmed.split('.')[0];
  if (reserved.test(nameWithoutExt)) {
    return { valid: false, error: 'File name is reserved' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate folder name
 * Similar to file name but allows different rules
 *
 * @param {string} folderName - Folder name to validate
 * @returns {{valid: boolean, error?: string, sanitized?: string}}
 */
function validateFolderName(folderName) {
  if (!folderName || typeof folderName !== 'string') {
    return { valid: false, error: 'Folder name is required' };
  }

  const trimmed = folderName.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Folder name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Folder name too long (max 100 characters)' };
  }

  // Check for path traversal
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    return { valid: false, error: 'Invalid folder name' };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  if (invalidChars.test(trimmed)) {
    return { valid: false, error: 'Folder name contains invalid characters' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate pagination parameters
 *
 * @param {number|string} limit - Items per page
 * @param {string} cursor - Cursor for next page
 * @param {number} maxLimit - Maximum allowed limit (default: 100)
 * @returns {{valid: boolean, error?: string, sanitized?: {limit: number, cursor: string}}}
 */
function validatePagination(limit, cursor, maxLimit = 100) {
  const result = { limit: 50, cursor: null }; // defaults

  // Validate limit
  if (limit !== undefined && limit !== null && limit !== '') {
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedLimit)) {
      return { valid: false, error: 'Limit must be a number' };
    }

    if (parsedLimit < 1) {
      return { valid: false, error: 'Limit must be at least 1' };
    }

    if (parsedLimit > maxLimit) {
      return { valid: false, error: `Limit cannot exceed ${maxLimit}` };
    }

    result.limit = parsedLimit;
  }

  // Validate cursor (must be a valid ID if provided)
  if (cursor && typeof cursor === 'string') {
    const trimmed = cursor.trim();
    if (trimmed.length > 0) {
      result.cursor = trimmed;
    }
  }

  return { valid: true, sanitized: result };
}

/**
 * Validate hex color code
 *
 * @param {string} color - Color code to validate
 * @returns {{valid: boolean, error?: string, sanitized?: string}}
 */
function validateColor(color) {
  if (!color) {
    return { valid: true, sanitized: '#4F46E5' }; // default color
  }

  const trimmed = color.trim();

  // Check hex format
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexPattern.test(trimmed)) {
    return { valid: false, error: 'Invalid color format. Must be hex code (e.g., #4F46E5)' };
  }

  return { valid: true, sanitized: trimmed.toUpperCase() };
}

/**
 * Sanitize and validate file metadata update
 *
 * @param {object} updates - Object containing file updates
 * @returns {{valid: boolean, errors?: object, sanitized?: object}}
 */
function validateFileMetadataUpdate(updates) {
  const sanitized = {};
  const errors = {};

  // Validate name
  if (updates.name !== undefined) {
    const nameValidation = validateFileName(updates.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    } else {
      sanitized.name = nameValidation.sanitized;
    }
  }

  // Validate starred (boolean)
  if (updates.starred !== undefined) {
    if (typeof updates.starred !== 'boolean') {
      errors.starred = 'starred must be a boolean';
    } else {
      sanitized.starred = updates.starred;
    }
  }

  // Validate archived (boolean)
  if (updates.archived !== undefined) {
    if (typeof updates.archived !== 'boolean') {
      errors.archived = 'archived must be a boolean';
    } else {
      sanitized.archived = updates.archived;
    }
  }

  // Validate description (optional text)
  if (updates.description !== undefined) {
    if (typeof updates.description === 'string') {
      const trimmed = updates.description.trim();
      if (trimmed.length > 5000) {
        errors.description = 'Description too long (max 5000 characters)';
      } else {
        sanitized.description = trimmed || null;
      }
    } else if (updates.description === null) {
      sanitized.description = null;
    } else {
      errors.description = 'Description must be a string';
    }
  }

  const valid = Object.keys(errors).length === 0;

  return valid ? { valid: true, sanitized } : { valid: false, errors };
}

module.exports = {
  validateEmail,
  validatePermission,
  validateExpirationDate,
  validateMaxDownloads,
  escapeHtml,
  validateFileType,
  validateFileSize,
  validateFileName,
  validateFolderName,
  validatePagination,
  validateColor,
  validateFileMetadataUpdate
};
