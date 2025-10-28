/**
 * Cloud Files API utilities
 * Handles database operations for cloud storage management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all cloud files for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cloud files
 */
async function getCloudFilesByUserId(userId) {
  try {
    const files = await prisma.cloudFile.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return files;
  } catch (error) {
    console.error('Error fetching cloud files:', error);
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
      }
    });
    return file;
  } catch (error) {
    console.error('Error fetching cloud file:', error);
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
        fileName: fileData.fileName || 'untitled',
        size: fileData.size || 0,
        contentType: fileData.contentType || 'application/octet-stream',
        data: typeof fileData.data === 'string' 
          ? fileData.data 
          : JSON.stringify(fileData.data || ''),
        folder: fileData.folder,
        tags: fileData.tags,
        description: fileData.description,
        isPublic: fileData.isPublic || false,
        isStarred: fileData.isStarred || false
      }
    });
    return file;
  } catch (error) {
    console.error('Error creating cloud file:', error);
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
      data: cleanUpdates
    });
    return file;
  } catch (error) {
    console.error('Error updating cloud file:', error);
    throw error;
  }
}

/**
 * Delete a cloud file
 * @param {string} fileId - File ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteCloudFile(fileId) {
  try {
    await prisma.cloudFile.delete({
      where: {
        id: fileId
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting cloud file:', error);
    throw error;
  }
}

/**
 * Get cloud files by folder
 * @param {string} userId - User ID
 * @param {string} folder - Folder name
 * @returns {Promise<Array>} Array of cloud files
 */
async function getCloudFilesByFolder(userId, folder) {
  try {
    const files = await prisma.cloudFile.findMany({
      where: {
        userId: userId,
        folder: folder
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return files;
  } catch (error) {
    console.error('Error fetching cloud files by folder:', error);
    throw error;
  }
}

module.exports = {
  getCloudFilesByUserId,
  getCloudFileById,
  createCloudFile,
  updateCloudFile,
  deleteCloudFile,
  getCloudFilesByFolder
};

