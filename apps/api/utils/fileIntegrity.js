/**
 * File Integrity and Corruption Detection
 * BE-031: File corruption detection (verify file hash after download)
 * BE-037: File not found in storage but exists in DB handling
 */

const crypto = require('crypto');
const logger = require('./logger');
const { ERROR_CODES } = require('./errorCodes');

/**
 * Calculate file hash
 */
function calculateFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Verify file hash matches expected hash
 * BE-031: File corruption detection
 */
function verifyFileHash(fileBuffer, expectedHash) {
  if (!expectedHash) {
    // If no hash is stored, we can't verify
    return {
      valid: true,
      warning: 'No hash stored for file, skipping verification'
    };
  }
  
  const actualHash = calculateFileHash(fileBuffer);
  
  if (actualHash !== expectedHash) {
    return {
      valid: false,
      error: 'File hash mismatch - file may be corrupted',
      expectedHash,
      actualHash
    };
  }
  
  return {
    valid: true,
    hash: actualHash
  };
}

/**
 * BE-037: Handle file not found in storage but exists in DB
 */
async function handleMissingStorageFile(fileId, fileRecord, prisma) {
  logger.error(`File ${fileId} exists in DB but not found in storage. Path: ${fileRecord.storagePath}`);
  
  // Mark file as corrupted
  try {
    await prisma.storageFile.update({
      where: { id: fileId },
      data: {
        // Add a flag or update description to indicate corruption
        description: fileRecord.description 
          ? `${fileRecord.description} [FILE CORRUPTED - NOT FOUND IN STORAGE]`
          : '[FILE CORRUPTED - NOT FOUND IN STORAGE]'
      }
    });
    
    logger.warn(`Marked file ${fileId} as corrupted in database`);
  } catch (error) {
    logger.error(`Failed to mark file ${fileId} as corrupted:`, error);
  }
  
  return {
    corrupted: true,
    message: 'File not found in storage. File has been marked as corrupted.'
  };
}

/**
 * Verify file integrity after download
 */
async function verifyFileIntegrity(fileBuffer, fileRecord) {
  const results = {
    hashValid: null,
    sizeValid: null,
    errors: [],
    warnings: []
  };
  
  // Verify hash if available
  if (fileRecord.fileHash) {
    const hashCheck = verifyFileHash(fileBuffer, fileRecord.fileHash);
    if (!hashCheck.valid) {
      results.hashValid = false;
      results.errors.push(hashCheck.error);
    } else {
      results.hashValid = true;
    }
  } else {
    results.warnings.push('No hash stored for file, skipping hash verification');
  }
  
  // Verify size
  const expectedSize = Number(fileRecord.size);
  const actualSize = fileBuffer.length;
  
  if (actualSize !== expectedSize) {
    results.sizeValid = false;
    results.errors.push(`File size mismatch: expected ${expectedSize} bytes, got ${actualSize} bytes`);
  } else {
    results.sizeValid = true;
  }
  
  results.valid = results.errors.length === 0;
  
  return results;
}

module.exports = {
  calculateFileHash,
  verifyFileHash,
  handleMissingStorageFile,
  verifyFileIntegrity
};

