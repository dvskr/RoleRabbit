/**
 * Cover Letters API utilities - REFACTORED with Generic CRUD Service
 * Handles database operations for cover letter management
 * 
 * Uses CrudService base class to eliminate duplicate code
 */

const CrudService = require('./crudService');

// Create cover letters CRUD service instance
const coverLettersService = new CrudService('coverLetter', {
  userIdField: 'userId',
  orderBy: 'createdAt',
  orderDirection: 'desc'
});

/**
 * Get all cover letters for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cover letters
 */
async function getCoverLettersByUserId(userId) {
  return coverLettersService.getAllByUserId(userId);
}

/**
 * Get a single cover letter by ID
 * @param {string} coverLetterId - Cover Letter ID
 * @returns {Promise<Object>} Cover letter object
 */
async function getCoverLetterById(coverLetterId) {
  return coverLettersService.getById(coverLetterId);
}

/**
 * Create a new cover letter
 * @param {string} userId - User ID
 * @param {Object} coverLetterData - Cover letter data
 * @returns {Promise<Object>} Created cover letter
 */
async function createCoverLetter(userId, coverLetterData) {
  return coverLettersService.create(userId, coverLetterData, (userId, data) => {
    return {
      userId,
      title: data.title || 'Untitled Cover Letter',
      content: data.content || '',
      jobId: data.jobId || null,
      templateId: data.templateId
    };
  });
}

/**
 * Update a cover letter
 * @param {string} coverLetterId - Cover Letter ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated cover letter
 */
async function updateCoverLetter(coverLetterId, updates) {
  return coverLettersService.update(coverLetterId, updates);
}

/**
 * Delete a cover letter
 * @param {string} coverLetterId - Cover Letter ID
 * @returns {Promise<void>}
 */
async function deleteCoverLetter(coverLetterId) {
  return coverLettersService.delete(coverLetterId);
}

/**
 * Get cover letters by job ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} Array of cover letters
 */
async function getCoverLettersByJobId(jobId) {
  return coverLettersService.getByField('jobId', jobId);
}

module.exports = {
  getCoverLettersByUserId,
  getCoverLetterById,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  getCoverLettersByJobId
};

