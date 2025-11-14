/**
 * File Upload Security Middleware
 * Validates and sanitizes file uploads to prevent malicious files
 */

const logger = require('../utils/logger');

// Allowed MIME types for resume uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain', // .txt
  'image/png',
  'image/jpeg',
  'image/jpg'
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Minimum file size (100 bytes - prevents empty files)
const MIN_FILE_SIZE = 100;

/**
 * Validate file upload
 * @param {Object} file - Uploaded file object
 * @returns {Object} { valid, error }
 */
function validateFileUpload(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  const fileSize = file.file?.bytesRead || file.size || 0;
  
  if (fileSize > MAX_FILE_SIZE) {
    logger.warn('[FILE_SECURITY] File too large', {
      filename: file.filename,
      size: fileSize,
      maxSize: MAX_FILE_SIZE
    });
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  if (fileSize < MIN_FILE_SIZE) {
    logger.warn('[FILE_SECURITY] File too small', {
      filename: file.filename,
      size: fileSize
    });
    return {
      valid: false,
      error: 'File is empty or too small'
    };
  }

  // Check MIME type
  const mimeType = file.mimetype || file.type;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    logger.warn('[FILE_SECURITY] Invalid MIME type', {
      filename: file.filename,
      mimeType,
      allowed: ALLOWED_MIME_TYPES
    });
    return {
      valid: false,
      error: `Invalid file type. Allowed types: PDF, DOCX, DOC, TXT, PNG, JPG`
    };
  }

  // Check file extension
  const filename = file.filename || '';
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    logger.warn('[FILE_SECURITY] Invalid file extension', {
      filename,
      extension,
      allowed: ALLOWED_EXTENSIONS
    });
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Check for suspicious filenames
  if (isSuspiciousFilename(filename)) {
    logger.warn('[FILE_SECURITY] Suspicious filename detected', {
      filename
    });
    return {
      valid: false,
      error: 'Invalid filename'
    };
  }

  logger.info('[FILE_SECURITY] File validation passed', {
    filename,
    mimeType,
    size: fileSize
  });

  return { valid: true };
}

/**
 * Check for suspicious filenames
 * @param {string} filename - Filename to check
 * @returns {boolean} True if suspicious
 */
function isSuspiciousFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return true;
  }

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return true;
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return true;
  }

  // Check for extremely long filenames
  if (filename.length > 255) {
    return true;
  }

  // Check for executable extensions (even if disguised)
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar',
    '.app', '.deb', '.rpm', '.dmg', '.pkg', '.msi', '.scr', '.com'
  ];

  const lowerFilename = filename.toLowerCase();
  for (const ext of dangerousExtensions) {
    if (lowerFilename.includes(ext)) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  if (!filename) {
    return `upload_${Date.now()}.pdf`;
  }

  // Remove path components
  filename = filename.replace(/^.*[\\\/]/, '');

  // Remove dangerous characters
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (filename.length > 100) {
    const extension = filename.slice(filename.lastIndexOf('.'));
    filename = filename.slice(0, 100 - extension.length) + extension;
  }

  return filename;
}

/**
 * File upload security middleware for Fastify
 */
async function fileUploadSecurityMiddleware(request, reply) {
  try {
    // This middleware runs before file is fully uploaded
    // Validation happens in the route handler after file is received
    
    // Add security headers
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    
  } catch (error) {
    logger.error('[FILE_SECURITY] Middleware error', {
      error: error.message
    });
    // Fail open - allow request to continue
  }
}

/**
 * Validate buffer content (basic checks)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - Expected MIME type
 * @returns {Object} { valid, error }
 */
function validateBufferContent(buffer, mimeType) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { valid: false, error: 'Invalid buffer' };
  }

  // Check for minimum content
  if (buffer.length < MIN_FILE_SIZE) {
    return { valid: false, error: 'File content too small' };
  }

  // Check for maximum content
  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: 'File content too large' };
  }

  // Basic magic number checks
  const magicNumbers = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04], // PK (ZIP)
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/jpeg': [0xFF, 0xD8, 0xFF]
  };

  const magic = magicNumbers[mimeType];
  if (magic) {
    for (let i = 0; i < magic.length; i++) {
      if (buffer[i] !== magic[i]) {
        logger.warn('[FILE_SECURITY] Magic number mismatch', {
          mimeType,
          expected: magic,
          actual: Array.from(buffer.slice(0, magic.length))
        });
        return {
          valid: false,
          error: 'File content does not match declared type'
        };
      }
    }
  }

  return { valid: true };
}

module.exports = {
  validateFileUpload,
  sanitizeFilename,
  fileUploadSecurityMiddleware,
  validateBufferContent,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE
};

