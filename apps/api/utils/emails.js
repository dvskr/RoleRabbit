/**
 * Emails API utilities - REFACTORED with Generic CRUD Service
 * Handles database operations for email management
 * 
 * Uses CrudService base class to eliminate duplicate code
 */

const CrudService = require('./crudService');

// Create emails CRUD service instance
const emailsService = new CrudService('email', {
  userIdField: 'userId',
  orderBy: 'createdAt',
  orderDirection: 'desc'
});

/**
 * Get all emails for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of emails
 */
async function getEmailsByUserId(userId) {
  return emailsService.getAllByUserId(userId);
}

/**
 * Get a single email by ID
 * @param {string} emailId - Email ID
 * @returns {Promise<Object>} Email object
 */
async function getEmailById(emailId) {
  return emailsService.getById(emailId);
}

/**
 * Create a new email
 * @param {string} userId - User ID
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} Created email
 */
async function createEmail(userId, emailData) {
  return emailsService.create(userId, emailData, (userId, data) => {
    return {
      userId,
      to: data.to,
      subject: data.subject,
      body: data.body,
      type: data.type || 'followup',
      status: data.status || 'draft',
      jobId: data.jobId || null
    };
  });
}

/**
 * Update an email
 * @param {string} emailId - Email ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated email
 */
async function updateEmail(emailId, updates) {
  return emailsService.update(emailId, updates);
}

/**
 * Delete an email
 * @param {string} emailId - Email ID
 * @returns {Promise<void>}
 */
async function deleteEmail(emailId) {
  return emailsService.delete(emailId);
}

/**
 * Get emails by job ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} Array of emails
 */
async function getEmailsByJobId(jobId) {
  return emailsService.getByField('jobId', jobId);
}

module.exports = {
  getEmailsByUserId,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail,
  getEmailsByJobId
};

