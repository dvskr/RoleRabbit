/**
 * BE-056: Duplicate file detection based on fileHash
 * Offers to reuse existing file instead of uploading duplicate
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Check if file with same hash already exists
 * BE-056: Duplicate file detection based on fileHash
 */
async function findDuplicateFile(fileHash, userId) {
  if (!fileHash) {
    return null;
  }

  try {
    // Find file with same hash for the same user
    const duplicate = await prisma.storage_files.findFirst({
      where: {
        fileHash,
        userId,
        deletedAt: null // Only check non-deleted files
      },
      select: {
        id: true,
        name: true,
        fileName: true,
        size: true,
        contentType: true,
        createdAt: true
      }
    });

    return duplicate;
  } catch (error) {
    logger.error('Error checking for duplicate file:', error);
    return null;
  }
}

/**
 * Check if file should be considered duplicate (same hash, same user)
 */
async function isDuplicateFile(fileHash, userId) {
  const duplicate = await findDuplicateFile(fileHash, userId);
  return duplicate !== null;
}

module.exports = {
  findDuplicateFile,
  isDuplicateFile
};

