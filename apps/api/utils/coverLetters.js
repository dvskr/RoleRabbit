/**
 * Cover Letters API utilities
 * Handles database operations for cover letter management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

/**
 * Get all cover letters for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cover letters
 */
async function getCoverLettersByUserId(userId) {
  try {
    const coverLetters = await prisma.coverLetter.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return coverLetters;
  } catch (error) {
    logger.error('Error fetching cover letters:', error);
    throw error;
  }
}

/**
 * Get a single cover letter by ID
 * @param {string} coverLetterId - Cover Letter ID
 * @returns {Promise<Object>} Cover letter object
 */
async function getCoverLetterById(coverLetterId) {
  try {
    const coverLetter = await prisma.coverLetter.findUnique({
      where: {
        id: coverLetterId
      }
    });
    return coverLetter;
  } catch (error) {
    logger.error('Error fetching cover letter:', error);
    throw error;
  }
}

/**
 * Create a new cover letter
 * @param {string} userId - User ID
 * @param {Object} coverLetterData - Cover letter data
 * @returns {Promise<Object>} Created cover letter
 */
async function createCoverLetter(userId, coverLetterData) {
  try {
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        title: coverLetterData.title || 'Untitled Cover Letter',
        content: coverLetterData.content || '',
        jobId: coverLetterData.jobId || null,
        templateId: coverLetterData.templateId
      }
    });
    return coverLetter;
  } catch (error) {
    logger.error('Error creating cover letter:', error);
    throw error;
  }
}

/**
 * Update a cover letter
 * @param {string} coverLetterId - Cover Letter ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated cover letter
 */
async function updateCoverLetter(coverLetterId, updates) {
  try {
    // Filter out undefined fields
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });

    const coverLetter = await prisma.coverLetter.update({
      where: {
        id: coverLetterId
      },
      data: cleanUpdates
    });
    return coverLetter;
  } catch (error) {
    logger.error('Error updating cover letter:', error);
    throw error;
  }
}

/**
 * Delete a cover letter
 * @param {string} coverLetterId - Cover Letter ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteCoverLetter(coverLetterId) {
  try {
    await prisma.coverLetter.delete({
      where: {
        id: coverLetterId
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting cover letter:', error);
    throw error;
  }
}

/**
 * Get cover letters by job ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} Array of cover letters
 */
async function getCoverLettersByJobId(jobId) {
  try {
    const coverLetters = await prisma.coverLetter.findMany({
      where: {
        jobId: jobId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return coverLetters;
  } catch (error) {
    logger.error('Error fetching cover letters by job:', error);
    throw error;
  }
}

module.exports = {
  getCoverLettersByUserId,
  getCoverLetterById,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  getCoverLettersByJobId
};

