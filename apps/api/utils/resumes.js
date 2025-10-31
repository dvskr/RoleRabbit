/**
 * Resumes API utilities
 * Handles database operations for resume management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

/**
 * Get all resumes for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of resumes
 */
async function getResumesByUserId(userId) {
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return resumes;
  } catch (error) {
    logger.error('Error fetching resumes:', error);
    throw error;
  }
}

/**
 * Get a single resume by ID
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} Resume object
 */
async function getResumeById(resumeId) {
  try {
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId
      }
    });
    return resume;
  } catch (error) {
    logger.error('Error fetching resume:', error);
    throw error;
  }
}

/**
 * Create a new resume
 * @param {string} userId - User ID
 * @param {Object} resumeData - Resume data
 * @returns {Promise<Object>} Created resume
 */
async function createResume(userId, resumeData) {
  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        name: resumeData.name || 'Untitled Resume',
        data: typeof resumeData.data === 'string' 
          ? resumeData.data 
          : JSON.stringify(resumeData.data || {}),
        templateId: resumeData.templateId,
        fileName: resumeData.fileName
      }
    });
    return resume;
  } catch (error) {
    logger.error('Error creating resume:', error);
    throw error;
  }
}

/**
 * Update a resume
 * @param {string} resumeId - Resume ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated resume
 */
async function updateResume(resumeId, updates) {
  try {
    // Filter out undefined fields and stringify data if it's an object
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

    const resume = await prisma.resume.update({
      where: {
        id: resumeId
      },
      data: cleanUpdates
    });
    return resume;
  } catch (error) {
    logger.error('Error updating resume:', error);
    throw error;
  }
}

/**
 * Delete a resume
 * @param {string} resumeId - Resume ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteResume(resumeId) {
  try {
    await prisma.resume.delete({
      where: {
        id: resumeId
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting resume:', error);
    throw error;
  }
}

module.exports = {
  getResumesByUserId,
  getResumeById,
  createResume,
  updateResume,
  deleteResume
};

