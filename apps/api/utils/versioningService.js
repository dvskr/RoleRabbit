/**
 * File Versioning Service
 * Handles creating, retrieving, and managing file versions
 */

const { prisma } = require('./db');
const storageHandler = require('./storageHandler');
const logger = require('./logger');
const crypto = require('crypto');

/**
 * Generate SHA-256 hash of file buffer
 */
function generateFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Create a new version when file is updated
 * @param {string} fileId - File ID
 * @param {string} userId - User ID
 * @param {Buffer} newFileBuffer - New file content
 * @param {string} changeNote - Optional note about changes
 */
async function createVersion(fileId, userId, newFileBuffer, changeNote = null) {
  try {
    // Get current file
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
      include: { _count: { select: { versions: true } } }
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Get next version number
    const nextVersion = (file._count.versions || 0) + 1;

    // Generate hash for new version
    const fileHash = generateFileHash(newFileBuffer);

    // Check if content actually changed (prevent duplicate versions)
    if (file.fileHash === fileHash) {
      logger.info('File content unchanged, skipping version creation');
      return null;
    }

    // Create version storage path
    const versionStoragePath = `${file.storagePath}.v${nextVersion}`;

    // Upload version to storage
    const { Readable } = require('stream');
    const stream = Readable.from(newFileBuffer);
    await storageHandler.upload(
      stream,
      userId,
      `${file.fileName}.v${nextVersion}`,
      file.contentType
    );

    // Create version record
    const version = await prisma.fileVersion.create({
      data: {
        fileId,
        userId,
        version: nextVersion,
        storagePath: versionStoragePath,
        size: BigInt(newFileBuffer.length),
        fileHash,
        changeNote,
        createdBy: userId
      }
    });

    logger.info(`✅ Created version ${nextVersion} for file ${fileId}`);

    return version;
  } catch (error) {
    logger.error('Failed to create file version:', error);
    throw error;
  }
}

/**
 * Get all versions of a file
 */
async function getFileVersions(fileId, userId) {
  try {
    const versions = await prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: { version: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return versions.map(v => ({
      id: v.id,
      version: v.version,
      size: Number(v.size),
      fileHash: v.fileHash,
      changeNote: v.changeNote,
      createdAt: v.createdAt.toISOString(),
      createdBy: {
        id: v.creator.id,
        name: v.creator.name,
        email: v.creator.email
      }
    }));
  } catch (error) {
    logger.error('Failed to get file versions:', error);
    throw error;
  }
}

/**
 * Restore a specific version
 */
async function restoreVersion(fileId, versionNumber, userId) {
  try {
    // Get version
    const version = await prisma.fileVersion.findFirst({
      where: {
        fileId,
        version: versionNumber
      }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    // Download version content
    const versionBuffer = await storageHandler.downloadAsBuffer(version.storagePath);

    // Create new version from current file before restoring
    const currentFile = await prisma.storageFile.findUnique({
      where: { id: fileId }
    });

    if (currentFile) {
      const currentBuffer = await storageHandler.downloadAsBuffer(currentFile.storagePath);
      await createVersion(fileId, userId, currentBuffer, `Before restoring to v${versionNumber}`);
    }

    // Upload restored content as current file
    const { Readable } = require('stream');
    const stream = Readable.from(versionBuffer);
    const uploadResult = await storageHandler.upload(
      stream,
      userId,
      currentFile.fileName,
      currentFile.contentType
    );

    // Update file record
    await prisma.storageFile.update({
      where: { id: fileId },
      data: {
        storagePath: uploadResult.path,
        size: BigInt(versionBuffer.length),
        fileHash: version.fileHash,
        updatedAt: new Date()
      }
    });

    logger.info(`✅ Restored file ${fileId} to version ${versionNumber}`);

    return {
      success: true,
      restoredVersion: versionNumber,
      message: `File restored to version ${versionNumber}`
    };
  } catch (error) {
    logger.error('Failed to restore version:', error);
    throw error;
  }
}

/**
 * Delete old versions (keep last N versions)
 */
async function pruneOldVersions(fileId, keepCount = 10) {
  try {
    const versions = await prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: { version: 'desc' }
    });

    if (versions.length <= keepCount) {
      return { deleted: 0, kept: versions.length };
    }

    const versionsToDelete = versions.slice(keepCount);

    // Delete from storage
    for (const version of versionsToDelete) {
      try {
        await storageHandler.deleteFile(version.storagePath);
      } catch (error) {
        logger.warn(`Failed to delete version ${version.version} from storage:`, error);
      }
    }

    // Delete from database
    await prisma.fileVersion.deleteMany({
      where: {
        id: { in: versionsToDelete.map(v => v.id) }
      }
    });

    logger.info(`Pruned ${versionsToDelete.length} old versions for file ${fileId}`);

    return {
      deleted: versionsToDelete.length,
      kept: keepCount
    };
  } catch (error) {
    logger.error('Failed to prune versions:', error);
    throw error;
  }
}

module.exports = {
  createVersion,
  getFileVersions,
  restoreVersion,
  pruneOldVersions,
  generateFileHash
};
