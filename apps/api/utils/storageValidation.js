/**
 * Storage Validation Utilities
 * Validates file uploads, folder names, and storage operations
 */

const path = require('path');


// Allowed file types (MIME types)
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'text/csv',
  'application/rtf',
  
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  
  // Other
  'application/json',
  'application/xml',
  'text/html'
];

// Allowed file extensions (for additional security)
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.rtf',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.zip', '.rar', '.7z',
  '.json', '.xml', '.html'
];

// Maximum file size (default: 10MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

// Maximum filename length
const MAX_FILENAME_LENGTH = 255;

/**
 * Validate file upload
 */
async function validateFileUpload(fileStream, fileName, contentType, fileSize) {
  const errors = [];
  const warnings = [];

  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    errors.push(
      `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`
    );
  }

  // Check file extension
  const fileExtension = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errors.push(`File extension "${fileExtension}" is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Check MIME type
  if (contentType && !ALLOWED_MIME_TYPES.includes(contentType)) {
    errors.push(`File type "${contentType}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  // Validate filename
  if (!fileName || fileName.trim().length === 0) {
    errors.push('Filename cannot be empty');
  }

  if (fileName.length > MAX_FILENAME_LENGTH) {
    errors.push(`Filename exceeds maximum length of ${MAX_FILENAME_LENGTH} characters`);
  }

  // Check for dangerous characters in filename
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    errors.push('Filename contains invalid or dangerous characters');
  }

  // Check for executable extensions (additional security)
  const executableExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.sh'];
  if (executableExtensions.includes(fileExtension)) {
    errors.push('Executable files are not allowed');
  }

  // Warn about very large files
  if (fileSize > MAX_FILE_SIZE * 0.8) {
    warnings.push(`File is large (${(fileSize / 1024 / 1024).toFixed(2)}MB). Consider compressing.`);
  }

  // Validate that extension matches MIME type (basic check)
  const extensionToMimeMap = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.txt': 'text/plain'
  };

  if (contentType && extensionToMimeMap[fileExtension]) {
    if (extensionToMimeMap[fileExtension] !== contentType) {
      warnings.push(`File extension doesn't match MIME type. Extension suggests: ${extensionToMimeMap[fileExtension]}, but got: ${contentType}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedFileName: sanitizeFileName(fileName)
  };
}

/**
 * Sanitize filename for safe storage
 */
function sanitizeFileName(fileName) {
  // Remove directory separators and dangerous characters
  let sanitized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .trim();

  // Limit length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = path.extname(sanitized);
    const nameWithoutExt = sanitized.slice(0, MAX_FILENAME_LENGTH - ext.length);
    sanitized = nameWithoutExt + ext;
  }

  // Ensure filename is not empty
  if (!sanitized || sanitized.length === 0) {
    sanitized = `file_${Date.now()}`;
  }

  return sanitized;
}

/**
 * Validate folder name
 */
function validateFolderName(name) {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Folder name cannot be empty');
    return {
      valid: false,
      errors
    };
  }

  if (name.length > 100) {
    errors.push('Folder name must be less than 100 characters');
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    errors.push('Folder name contains invalid characters: < > : " / \\ | ? *');
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];

  if (reservedNames.includes(name.toUpperCase())) {
    errors.push('Folder name is a reserved system name');
  }

  // Check for trailing spaces/dots (Windows issue)
  if (name.endsWith('.') || name.endsWith(' ')) {
    errors.push('Folder name cannot end with a dot or space');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedName: name.trim()
  };
}

/**
 * Validate file type for storage
 */
function validateFileType(fileType) {
  const allowedTypes = [
    'resume',
    'template',
    'backup',
    'cover_letter',
    'transcript',
    'certification',
    'reference',
    'portfolio',
    'work_sample',
    'document'
  ];

  if (!allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: `File type "${fileType}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return {
    valid: true
  };
}

/**
 * Validate storage path (prevent directory traversal)
 */
function validateStoragePath(storagePath, userId) {
  // Ensure path starts with userId
  if (!storagePath.startsWith(userId)) {
    return {
      valid: false,
      error: 'Invalid storage path'
    };
  }

  // Check for directory traversal attempts
  if (storagePath.includes('..') || storagePath.includes('//')) {
    return {
      valid: false,
      error: 'Invalid storage path: directory traversal detected'
    };
  }

  return {
    valid: true
  };
}

/**
 * Get file size category for quota calculation
 */
function getFileSizeCategory(size) {
  if (size < 1024) return 'bytes';
  if (size < 1024 * 1024) return 'kb';
  if (size < 1024 * 1024 * 1024) return 'mb';
  return 'gb';
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  validateFileUpload,
  validateFolderName,
  validateFileType,
  validateStoragePath,
  sanitizeFileName,
  getFileSizeCategory,
  formatFileSize,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILENAME_LENGTH
};

