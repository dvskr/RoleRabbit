/**
 * File Shares API utilities
 * Handles database operations for file sharing management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

/**
 * Get all shares for a file
 * @param {string} fileId - File ID
 * @returns {Promise<Array>} Array of shares
 */
async function getFileShares(fileId) {
  try {
    const shares = await prisma.fileShare.findMany({
      where: {
        fileId: fileId
      },
      orderBy: {
        grantedAt: 'desc'
      }
    });
    return shares;
  } catch (error) {
    logger.error('Error fetching file shares:', error);
    throw error;
  }
}

/**
 * Get a single share by ID
 * @param {string} shareId - Share ID
 * @returns {Promise<Object>} Share object
 */
async function getFileShareById(shareId) {
  try {
    const share = await prisma.fileShare.findUnique({
      where: {
        id: shareId
      }
    });
    return share;
  } catch (error) {
    logger.error('Error fetching file share:', error);
    throw error;
  }
}

/**
 * Create a new file share
 * @param {Object} shareData - Share data
 * @returns {Promise<Object>} Created share
 */
async function createFileShare(shareData) {
  try {
    const share = await prisma.fileShare.create({
      data: {
        fileId: shareData.fileId,
        userId: shareData.userId,
        userEmail: shareData.userEmail,
        userName: shareData.userName,
        permission: shareData.permission,
        grantedBy: shareData.grantedBy,
        expiresAt: shareData.expiresAt ? new Date(shareData.expiresAt) : null
      }
    });
    return share;
  } catch (error) {
    logger.error('Error creating file share:', error);
    throw error;
  }
}

/**
 * Update a file share
 * @param {string} shareId - Share ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated share
 */
async function updateFileShare(shareId, updates) {
  try {
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.expiresAt !== undefined) {
      cleanedUpdates.expiresAt = cleanedUpdates.expiresAt ? new Date(cleanedUpdates.expiresAt) : null;
    }

    const share = await prisma.fileShare.update({
      where: {
        id: shareId
      },
      data: cleanedUpdates
    });
    return share;
  } catch (error) {
    logger.error('Error updating file share:', error);
    throw error;
  }
}

/**
 * Delete a file share
 * @param {string} shareId - Share ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteFileShare(shareId) {
  try {
    await prisma.fileShare.delete({
      where: {
        id: shareId
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting file share:', error);
    throw error;
  }
}

/**
 * Get all shares for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of shares
 */
async function getUserShares(userId) {
  try {
    const shares = await prisma.fileShare.findMany({
      where: {
        userId: userId
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            type: true,
            size: true,
            contentType: true,
            createdAt: true,
            userId: true
          }
        }
      },
      orderBy: {
        grantedAt: 'desc'
      }
    });
    return shares;
  } catch (error) {
    logger.error('Error fetching user shares:', error);
    throw error;
  }
}

/**
 * Check if user has access to a file
 * @param {string} fileId - File ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Share object or null
 */
async function checkFileAccess(fileId, userId) {
  try {
    const share = await prisma.fileShare.findFirst({
      where: {
        fileId: fileId,
        userId: userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    return share;
  } catch (error) {
    logger.error('Error checking file access:', error);
    throw error;
  }
}

module.exports = {
  getFileShares,
  getFileShareById,
  createFileShare,
  updateFileShare,
  deleteFileShare,
  getUserShares,
  checkFileAccess
};

