/**
 * Resumes API utilities - REFACTORED with Generic CRUD Service
 * Handles database operations for resume management
 * 
 * Uses CrudService base class to eliminate duplicate code
 */

const CrudService = require('./crudService');

// Create resumes CRUD service instance
const resumesService = new CrudService('resume', {
  userIdField: 'userId',
  orderBy: 'createdAt',
  orderDirection: 'desc'
});

/**
 * Get all resumes for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of resumes
 */
async function getResumesByUserId(userId) {
  return resumesService.getAllByUserId(userId);
}

/**
 * Get a single resume by ID
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} Resume object
 */
async function getResumeById(resumeId) {
  return resumesService.getById(resumeId);
}

/**
 * Create a new resume
 * @param {string} userId - User ID
 * @param {Object} resumeData - Resume data
 * @returns {Promise<Object>} Created resume
 */
async function createResume(userId, resumeData) {
  return resumesService.create(userId, resumeData, (userId, data) => {
    return {
      userId,
      name: data.name || 'Untitled Resume',
      data: typeof data.data === 'string' 
        ? data.data 
        : JSON.stringify(data.data || {}),
      templateId: data.templateId,
      fileName: data.fileName
    };
  });
}

/**
 * Update a resume
 * @param {string} resumeId - Resume ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated resume
 */
async function updateResume(resumeId, updates) {
  return resumesService.update(resumeId, updates, (cleanUpdates) => {
    // Stringify data if it's an object
    if (cleanUpdates.data && typeof cleanUpdates.data === 'object') {
      cleanUpdates.data = JSON.stringify(cleanUpdates.data);
    }
    return cleanUpdates;
  });
}

/**
 * Delete a resume
 * @param {string} resumeId - Resume ID
 * @returns {Promise<void>}
 */
async function deleteResume(resumeId) {
  return resumesService.delete(resumeId);
}

module.exports = {
  getResumesByUserId,
  getResumeById,
  createResume,
  updateResume,
  deleteResume
};

