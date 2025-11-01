/**
 * Cloud Files API utilities
 * Handles database operations for cloud storage management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

/**
 * Get all cloud files for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cloud files
 */
async function getCloudFilesByUserId(userId, includeDeleted = false) {
  try {
    const whereClause = {
      userId: userId
    };
    
    // Only show non-deleted files by default
    if (!includeDeleted) {
      whereClause.deletedAt = null;
    }
    
    const files = await prisma.cloudFile.findMany({
      where: whereClause,
      include: {
        shares: true,
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return files;
  } catch (error) {
    logger.error('Error fetching cloud files:', error);
    throw error;
  }
}

/**
 * Get a single cloud file by ID
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} Cloud file object
 */
async function getCloudFileById(fileId) {
  try {
    const file = await prisma.cloudFile.findUnique({
      where: {
        id: fileId
      },
      include: {
        shares: true,
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    return file;
  } catch (error) {
    logger.error('Error fetching cloud file:', error);
    throw error;
  }
}

/**
 * Create a new cloud file
 * @param {string} userId - User ID
 * @param {Object} fileData - File data
 * @returns {Promise<Object>} Created cloud file
 */
async function createCloudFile(userId, fileData) {
  try {
    const file = await prisma.cloudFile.create({
      data: {
        userId,
        name: fileData.name || fileData.fileName || 'untitled',
        type: fileData.type || 'document',
        size: fileData.size || 0,
        contentType: fileData.contentType || 'application/octet-stream',
        data: typeof fileData.data === 'string' 
          ? fileData.data 
          : JSON.stringify(fileData.data || ''),
        folderId: fileData.folderId,
        tags: fileData.tags,
        description: fileData.description,
        isPublic: fileData.isPublic || false,
        isStarred: fileData.isStarred || false,
        isArchived: fileData.isArchived || false
      },
      include: {
        shares: true,
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    return file;
  } catch (error) {
    logger.error('Error creating cloud file:', error);
    throw error;
  }
}

/**
 * Update a cloud file
 * @param {string} fileId - File ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated cloud file
 */
async function updateCloudFile(fileId, updates) {
  try {
    // Filter out undefined fields
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'data' && typeof updates[key] === 'object') {
          cleanUpdates[key] = JSON.stringify(updates[key]);
        } else {
          cleanUpdates[key] = updates[key];
        }
      }
    });

    const file = await prisma.cloudFile.update({
      where: {
        id: fileId
      },
      data: cleanUpdates,
      include: {
        shares: true,
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    return file;
  } catch (error) {
    logger.error('Error updating cloud file:', error);
    throw error;
  }
}

/**
 * Soft delete a cloud file (moves to recycle bin)
 * @param {string} fileId - File ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteCloudFile(fileId) {
  try {
    await prisma.cloudFile.update({
      where: {
        id: fileId
      },
      data: {
        deletedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting cloud file:', error);
    throw error;
  }
}

/**
 * Permanently delete a cloud file
 * @param {string} fileId - File ID
 * @returns {Promise<boolean>} Success status
 */
async function permanentlyDeleteCloudFile(fileId) {
  try {
    await prisma.cloudFile.delete({
      where: {
        id: fileId
      }
    });
    return true;
  } catch (error) {
    logger.error('Error permanently deleting cloud file:', error);
    throw error;
  }
}

/**
 * Restore a deleted cloud file from recycle bin
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} Restored cloud file
 */
async function restoreCloudFile(fileId) {
  try {
    const file = await prisma.cloudFile.update({
      where: {
        id: fileId
      },
      data: {
        deletedAt: null
      },
      include: {
        shares: true,
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    return file;
  } catch (error) {
    logger.error('Error restoring cloud file:', error);
    throw error;
  }
}

/**
 * Get cloud files by folder
 * @param {string} userId - User ID
 * @param {string} folder - Folder name
 * @returns {Promise<Array>} Array of cloud files
 */
async function getCloudFilesByFolder(userId, folderId, includeDeleted = false) {
  try {
    const whereClause = {
      userId: userId,
      folderId: folderId
    };
    
    // Only show non-deleted files by default
    if (!includeDeleted) {
      whereClause.deletedAt = null;
    }
    
    const files = await prisma.cloudFile.findMany({
      where: whereClause,
      include: {
        shares: true,
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return files;
  } catch (error) {
    logger.error('Error fetching cloud files by folder:', error);
    throw error;
  }
}

module.exports = {
  getCloudFilesByUserId,
  getCloudFileById,
  createCloudFile,
  updateCloudFile,
  deleteCloudFile,
  permanentlyDeleteCloudFile,
  restoreCloudFile,
  getCloudFilesByFolder
};

