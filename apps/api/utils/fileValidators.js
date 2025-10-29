/**
 * File Validators Utility
 * Validates file types, sizes, and content
 */

const allowedMimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  text: ['text/plain', 'text/csv'],
  archive: ['application/zip', 'application/x-rar-compressed']
};

const maxFileSizes = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  text: 2 * 1024 * 1024, // 2MB
  archive: 50 * 1024 * 1024 // 50MB
};

/**
 * Validate file type
 */
function validateFileType(mimeType, category) {
  const allowed = allowedMimeTypes[category];
  if (!allowed) return false;
  return allowed.includes(mimeType);
}

/**
 * Validate file size
 */
function validateFileSize(size, category) {
  const maxSize = maxFileSizes[category];
  if (!maxSize) return false;
  return size <= maxSize;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Check if file is image
 */
function isImageFile(mimeType) {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is document
 */
function isDocumentFile(mimeType) {
  return ['application/pdf', 'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType);
}

/**
 * Validate resume file
 */
function validateResumeFile(file) {
  const errors = [];
  
  if (!isDocumentFile(file.mimetype)) {
    errors.push('Resume must be a PDF or Word document');
  }
  
  if (file.size > maxFileSizes.document) {
    errors.push(`File size must be less than ${maxFileSizes.document / 1024 / 1024}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateFileType,
  validateFileSize,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  validateResumeFile,
  allowedMimeTypes,
  maxFileSizes
};
