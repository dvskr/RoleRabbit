/**
 * Advanced Validation Utilities
 * BE-011 through BE-025: Input validation and business rules
 */

const crypto = require('crypto');
const logger = require('./logger');

// BE-015: Email format validation (RFC 5322 compliant)
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// BE-016: Valid permission values
const VALID_PERMISSIONS = ['view', 'comment', 'edit', 'admin'];

// BE-021: Hex color regex
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// BE-022: File size limits per subscription tier (in bytes)
const FILE_SIZE_LIMITS = {
  FREE: 10 * 1024 * 1024,      // 10 MB
  PRO: 50 * 1024 * 1024,       // 50 MB
  PREMIUM: 100 * 1024 * 1024   // 100 MB
};

// BE-023: File count limits per subscription tier
const FILE_COUNT_LIMITS = {
  FREE: 100,
  PRO: 1000,
  PREMIUM: Infinity // Unlimited
};

// BE-019: Description length limit
const MAX_DESCRIPTION_LENGTH = 1000;

// BE-020: Comment length limit
const MAX_COMMENT_LENGTH = 5000;

// BE-024: Magic bytes for file type detection
const MAGIC_BYTES = {
  // PDF
  'application/pdf': [
    Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF
  ],
  // DOCX (ZIP-based)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    Buffer.from([0x50, 0x4B, 0x03, 0x04]), // PK.. (ZIP signature)
    Buffer.from([0x50, 0x4B, 0x05, 0x06])  // PK.. (ZIP signature)
  ],
  // DOC (OLE2)
  'application/msword': [
    Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]) // OLE2 signature
  ],
  // PNG
  'image/png': [
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) // PNG signature
  ],
  // JPEG
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF]) // JPEG signature
  ],
  // GIF
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38]) // GIF8
  ],
  // ZIP
  'application/zip': [
    Buffer.from([0x50, 0x4B, 0x03, 0x04]), // PK..
    Buffer.from([0x50, 0x4B, 0x05, 0x06]), // PK..
    Buffer.from([0x50, 0x4B, 0x07, 0x08])  // PK..
  ]
};

/**
 * BE-015: Validate email format using regex
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email is required'
    };
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Email cannot be empty'
    };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid email format'
    };
  }

  return {
    valid: true,
    email: trimmed
  };
}

/**
 * BE-016: Validate permission enum
 */
// DB-021, DB-026: Validate permission and return FilePermission enum value
function validatePermission(permission) {
  if (!permission || typeof permission !== 'string') {
    return {
      valid: false,
      error: 'Permission is required'
    };
  }

  if (!VALID_PERMISSIONS.includes(permission.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid permission. Must be one of: ${VALID_PERMISSIONS.join(', ')}`
    };
  }

  // DB-021, DB-026: Return uppercase enum value for FilePermission enum
  return {
    valid: true,
    permission: permission.toUpperCase() // Return VIEW, COMMENT, EDIT, ADMIN for enum
  };
}

/**
 * BE-017: Validate expiration date (ISO 8601 format and future date)
 */
function validateExpirationDate(expiresAt) {
  if (!expiresAt) {
    return {
      valid: true, // Optional field
      expiresAt: null
    };
  }

  if (typeof expiresAt !== 'string') {
    return {
      valid: false,
      error: 'Expiration date must be a string in ISO 8601 format'
    };
  }

  // Check ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD)
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!iso8601Regex.test(expiresAt)) {
    return {
      valid: false,
      error: 'Expiration date must be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)'
    };
  }

  const expirationDate = new Date(expiresAt);
  if (isNaN(expirationDate.getTime())) {
    return {
      valid: false,
      error: 'Invalid date'
    };
  }

  // Check if date is in the future
  if (expirationDate <= new Date()) {
    return {
      valid: false,
      error: 'Expiration date must be in the future'
    };
  }

  return {
    valid: true,
    expiresAt: expirationDate.toISOString()
  };
}

/**
 * BE-018: Validate max downloads (must be > 0 if provided)
 */
function validateMaxDownloads(maxDownloads) {
  if (maxDownloads === null || maxDownloads === undefined) {
    return {
      valid: true, // Optional field
      maxDownloads: null
    };
  }

  const num = Number(maxDownloads);
  if (isNaN(num) || !Number.isInteger(num)) {
    return {
      valid: false,
      error: 'Max downloads must be an integer'
    };
  }

  if (num <= 0) {
    return {
      valid: false,
      error: 'Max downloads must be greater than 0'
    };
  }

  return {
    valid: true,
    maxDownloads: num
  };
}

/**
 * BE-019: Validate file description length
 */
function validateDescription(description) {
  if (!description) {
    return {
      valid: true, // Optional field
      description: null
    };
  }

  if (typeof description !== 'string') {
    return {
      valid: false,
      error: 'Description must be a string'
    };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`
    };
  }

  return {
    valid: true,
    description: description.trim()
  };
}

/**
 * BE-020: Validate comment content length
 */
function validateCommentContent(content) {
  if (!content || typeof content !== 'string') {
    return {
      valid: false,
      error: 'Comment content is required'
    };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Comment content cannot be empty'
    };
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return {
      valid: false,
      error: `Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters`
    };
  }

  return {
    valid: true,
    content: trimmed
  };
}

/**
 * BE-021: Validate folder color (hex color code)
 */
function validateFolderColor(color) {
  if (!color) {
    return {
      valid: true, // Optional field
      color: null
    };
  }

  if (typeof color !== 'string') {
    return {
      valid: false,
      error: 'Folder color must be a string'
    };
  }

  if (!HEX_COLOR_REGEX.test(color)) {
    return {
      valid: false,
      error: 'Folder color must be a valid hex color code (e.g., #FF0000 or #F00)'
    };
  }

  return {
    valid: true,
    color: color.toUpperCase()
  };
}

/**
 * BE-022: Get file size limit for subscription tier
 */
function getFileSizeLimit(subscriptionTier) {
  const tier = subscriptionTier?.toUpperCase() || 'FREE';
  return FILE_SIZE_LIMITS[tier] || FILE_SIZE_LIMITS.FREE;
}

/**
 * BE-022: Validate file size against subscription tier limit
 */
function validateFileSizeByTier(fileSize, subscriptionTier) {
  const limit = getFileSizeLimit(subscriptionTier);
  
  if (fileSize > limit) {
    const tier = subscriptionTier?.toUpperCase() || 'FREE';
    const limitMB = (limit / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(2)}MB) exceeds ${tier} tier limit of ${limitMB}MB`
    };
  }

  return {
    valid: true
  };
}

/**
 * BE-023: Get file count limit for subscription tier
 */
function getFileCountLimit(subscriptionTier) {
  const tier = subscriptionTier?.toUpperCase() || 'FREE';
  return FILE_COUNT_LIMITS[tier] || FILE_COUNT_LIMITS.FREE;
}

/**
 * BE-023: Validate file count against subscription tier limit
 */
async function validateFileCountByTier(userId, subscriptionTier, prisma) {
  const limit = getFileCountLimit(subscriptionTier);
  
  if (limit === Infinity) {
    return {
      valid: true
    };
  }

  const currentCount = await prisma.storage_files.count({
    where: {
      userId,
      deletedAt: null
    }
  });

  if (currentCount >= limit) {
    const tier = subscriptionTier?.toUpperCase() || 'FREE';
    return {
      valid: false,
      error: `File count (${currentCount}) exceeds ${tier} tier limit of ${limit} files`
    };
  }

  return {
    valid: true,
    currentCount,
    remaining: limit - currentCount
  };
}

/**
 * BE-024: Verify MIME type using magic bytes
 */
function verifyMimeTypeWithMagicBytes(fileBuffer, expectedMimeType) {
  if (!fileBuffer || fileBuffer.length === 0) {
    return {
      valid: false,
      error: 'File buffer is empty'
    };
  }

  const signatures = MAGIC_BYTES[expectedMimeType];
  if (!signatures || signatures.length === 0) {
    // If we don't have magic bytes for this type, skip verification
    return {
      valid: true,
      warning: `Magic bytes verification not available for ${expectedMimeType}`
    };
  }

  // Check if file starts with any of the expected signatures
  const matches = signatures.some(signature => {
    if (fileBuffer.length < signature.length) {
      return false;
    }
    return signature.equals(fileBuffer.slice(0, signature.length));
  });

  if (!matches) {
    return {
      valid: false,
      error: `File content does not match expected MIME type ${expectedMimeType}. File may be corrupted or incorrectly labeled.`
    };
  }

  return {
    valid: true
  };
}

/**
 * BE-025: Validate file content structure
 */
function validateFileStructure(fileBuffer, mimeType) {
  if (!fileBuffer || fileBuffer.length === 0) {
    return {
      valid: false,
      error: 'File buffer is empty'
    };
  }

  try {
    switch (mimeType) {
      case 'application/pdf':
        return validatePDFStructure(fileBuffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return validateDOCXStructure(fileBuffer);
      
      case 'application/msword':
        return validateDOCStructure(fileBuffer);
      
      case 'image/png':
        return validatePNGStructure(fileBuffer);
      
      case 'image/jpeg':
        return validateJPEGStructure(fileBuffer);
      
      default:
        // For other types, just verify magic bytes
        return verifyMimeTypeWithMagicBytes(fileBuffer, mimeType);
    }
  } catch (error) {
    logger.error('Error validating file structure:', error);
    return {
      valid: false,
      error: `Failed to validate file structure: ${error.message}`
    };
  }
}

/**
 * Validate PDF structure
 */
function validatePDFStructure(buffer) {
  // Check PDF header
  const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
  if (!buffer.slice(0, 4).equals(pdfHeader)) {
    return {
      valid: false,
      error: 'Invalid PDF structure: missing PDF header'
    };
  }

  // Check for PDF footer (%%EOF)
  const pdfFooter = Buffer.from([0x25, 0x25, 0x45, 0x4F, 0x46]); // %%EOF
  const lastBytes = buffer.slice(-5);
  if (!lastBytes.equals(pdfFooter) && !buffer.slice(-6, -1).equals(pdfFooter)) {
    // Some PDFs have %%EOF\n or %%EOF\r\n
    const hasFooter = buffer.slice(-10).toString('ascii').includes('%%EOF');
    if (!hasFooter) {
      return {
        valid: false,
        error: 'Invalid PDF structure: missing PDF footer'
      };
    }
  }

  return {
    valid: true
  };
}

/**
 * Validate DOCX structure (ZIP-based)
 */
function validateDOCXStructure(buffer) {
  // DOCX is a ZIP file, check ZIP signature
  const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // PK..
  if (!buffer.slice(0, 4).equals(zipSignature)) {
    return {
      valid: false,
      error: 'Invalid DOCX structure: not a valid ZIP archive'
    };
  }

  // Check for required DOCX files inside ZIP
  // This is a simplified check - in production, you might want to unzip and verify
  const hasWordDir = buffer.toString('binary').includes('word/');
  if (!hasWordDir) {
    return {
      valid: false,
      error: 'Invalid DOCX structure: missing word/ directory'
    };
  }

  return {
    valid: true
  };
}

/**
 * Validate DOC structure (OLE2)
 */
function validateDOCStructure(buffer) {
  // DOC files use OLE2 format
  const ole2Signature = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
  if (!buffer.slice(0, 8).equals(ole2Signature)) {
    return {
      valid: false,
      error: 'Invalid DOC structure: not a valid OLE2 document'
    };
  }

  return {
    valid: true
  };
}

/**
 * Validate PNG structure
 */
function validatePNGStructure(buffer) {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  if (!buffer.slice(0, 8).equals(pngSignature)) {
    return {
      valid: false,
      error: 'Invalid PNG structure: missing PNG signature'
    };
  }

  // Check for IEND chunk at the end
  const iendChunk = Buffer.from([0x49, 0x45, 0x4E, 0x44]); // IEND
  if (!buffer.slice(-12, -8).equals(iendChunk)) {
    return {
      valid: false,
      error: 'Invalid PNG structure: missing IEND chunk'
    };
  }

  return {
    valid: true
  };
}

/**
 * Validate JPEG structure
 */
function validateJPEGStructure(buffer) {
  // JPEG starts with FF D8 FF
  const jpegStart = Buffer.from([0xFF, 0xD8, 0xFF]);
  if (!buffer.slice(0, 3).equals(jpegStart)) {
    return {
      valid: false,
      error: 'Invalid JPEG structure: missing JPEG signature'
    };
  }

  // JPEG ends with FF D9
  const jpegEnd = Buffer.from([0xFF, 0xD9]);
  if (!buffer.slice(-2).equals(jpegEnd)) {
    return {
      valid: false,
      error: 'Invalid JPEG structure: missing JPEG end marker'
    };
  }

  return {
    valid: true
  };
}

module.exports = {
  validateEmail,
  validatePermission,
  validateExpirationDate,
  validateMaxDownloads,
  validateDescription,
  validateCommentContent,
  validateFolderColor,
  getFileSizeLimit,
  validateFileSizeByTier,
  getFileCountLimit,
  validateFileCountByTier,
  verifyMimeTypeWithMagicBytes,
  validateFileStructure,
  FILE_SIZE_LIMITS,
  FILE_COUNT_LIMITS,
  MAX_DESCRIPTION_LENGTH,
  MAX_COMMENT_LENGTH
};

