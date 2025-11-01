/**
 * Cloud Folders API utilities
 * Handles database operations for cloud folder management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

/**
 * Get all cloud folders for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cloud folders
 */
async function getCloudFoldersByUserId(userId, includeDeleted = false) {
  try {
    const whereClause = {
      userId: userId
    };
    
    // Only show non-deleted folders by default
    if (!includeDeleted) {
      whereClause.deletedAt = null;
    }
    
    const folders = await prisma.cloudFolder.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { files: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Add fileCount to each folder
    return folders.map(folder => ({
      ...folder,
      fileCount: folder._count.files
    }));
  } catch (error) {
    logger.error('Error fetching cloud folders:', error);
    throw error;
  }
}

/**
 * Get a single cloud folder by ID
 * @param {string} folderId - Folder ID
 * @returns {Promise<Object>} Cloud folder object
 */
async function getCloudFolderById(folderId) {
  try {
    const folder = await prisma.cloudFolder.findUnique({
      where: {
        id: folderId
      },
      include: {
        _count: {
          select: { files: true }
        }
      }
    });
    
    if (folder) {
      return {
        ...folder,
        fileCount: folder._count.files
      };
    }
    return folder;
  } catch (error) {
    logger.error('Error fetching cloud folder:', error);
    throw error;
  }
}

/**
 * Create a new cloud folder
 * @param {string} userId - User ID
 * @param {Object} folderData - Folder data
 * @returns {Promise<Object>} Created cloud folder
 */
async function createCloudFolder(userId, folderData) {
  try {
    const folder = await prisma.cloudFolder.create({
      data: {
        userId,
        name: folderData.name || 'Untitled Folder',
        color: folderData.color,
        parentId: folderData.parentId
      },
      include: {
        _count: {
          select: { files: true }
        }
      }
    });
    
    return {
      ...folder,
      fileCount: folder._count.files
    };
  } catch (error) {
    logger.error('Error creating cloud folder:', error);
    throw error;
  }
}

/**
 * Update a cloud folder
 * @param {string} folderId - Folder ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated cloud folder
 */
async function updateCloudFolder(folderId, updates) {
  try {
    const folder = await prisma.cloudFolder.update({
      where: {
        id: folderId
      },
      data: updates,
      include: {
        _count: {
          select: { files: true }
        }
      }
    });
    
    return {
      ...folder,
      fileCount: folder._count.files
    };
  } catch (error) {
    logger.error('Error updating cloud folder:', error);
    throw error;
  }
}

/**
 * Soft delete a cloud folder (moves to recycle bin)
 * @param {string} folderId - Folder ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteCloudFolder(folderId) {
  try {
    await prisma.cloudFolder.update({
      where: {
        id: folderId
      },
      data: {
        deletedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting cloud folder:', error);
    throw error;
  }
}

/**
 * Permanently delete a cloud folder
 * @param {string} folderId - Folder ID
 * @returns {Promise<boolean>} Success status
 */
async function permanentlyDeleteCloudFolder(folderId) {
  try {
    // Check if folder has children
    const children = await prisma.cloudFolder.findMany({
      where: {
        parentId: folderId
      }
    });
    
    if (children.length > 0) {
      throw new Error('Cannot delete folder with subfolders. Please delete or move subfolders first.');
    }
    
    // Check if folder has files
    const files = await prisma.cloudFile.findMany({
      where: {
        folderId: folderId
      }
    });
    
    if (files.length > 0) {
      // Move files to root (folderId = null)
      await prisma.cloudFile.updateMany({
        where: {
          folderId: folderId
        },
        data: {
          folderId: null
        }
      });
    }
    
    await prisma.cloudFolder.delete({
      where: {
        id: folderId
      }
    });
    
    return true;
  } catch (error) {
    logger.error('Error permanently deleting cloud folder:', error);
    throw error;
  }
}

/**
 * Restore a deleted cloud folder from recycle bin
 * @param {string} folderId - Folder ID
 * @returns {Promise<Object>} Restored cloud folder
 */
async function restoreCloudFolder(folderId) {
  try {
    const folder = await prisma.cloudFolder.update({
      where: {
        id: folderId
      },
      data: {
        deletedAt: null
      },
      include: {
        _count: {
          select: { files: true }
        }
      }
    });
    return {
      ...folder,
      fileCount: folder._count.files
    };
  } catch (error) {
    logger.error('Error restoring cloud folder:', error);
    throw error;
  }
}

/**
 * Get folders by parent
 * @param {string} userId - User ID
 * @param {string} parentId - Parent folder ID
 * @returns {Promise<Array>} Array of cloud folders
 */
async function getCloudFoldersByParent(userId, parentId, includeDeleted = false) {
  try {
    const whereClause = {
      userId: userId,
      parentId: parentId || null
    };
    
    // Only show non-deleted folders by default
    if (!includeDeleted) {
      whereClause.deletedAt = null;
    }
    
    const folders = await prisma.cloudFolder.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { files: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return folders.map(folder => ({
      ...folder,
      fileCount: folder._count.files
    }));
  } catch (error) {
    logger.error('Error fetching cloud folders by parent:', error);
    throw error;
  }
}

module.exports = {
  getCloudFoldersByUserId,
  getCloudFolderById,
  createCloudFolder,
  updateCloudFolder,
  deleteCloudFolder,
  permanentlyDeleteCloudFolder,
  restoreCloudFolder,
  getCloudFoldersByParent
};

