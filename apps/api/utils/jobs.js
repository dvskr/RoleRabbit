/**
 * Jobs API utilities - REFACTORED with Generic CRUD Service
 * Handles database operations for job tracking
 * 
 * Uses CrudService base class to eliminate duplicate code
 */

const CrudService = require('./crudService');

// Create jobs CRUD service instance
const jobsService = new CrudService('job', {
  userIdField: 'userId',
  orderBy: 'appliedDate',
  orderDirection: 'desc'
});

/**
 * Get all jobs for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of jobs
 */
async function getJobsByUserId(userId) {
  return jobsService.getAllByUserId(userId);
}

/**
 * Get a single job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job object
 */
async function getJobById(jobId) {
  return jobsService.getById(jobId);
}

/**
 * Create a new job
 * @param {string} userId - User ID
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Created job
 */
async function createJob(userId, jobData) {
  return jobsService.create(userId, jobData, (userId, data) => {
    return {
      userId,
      title: data.title,
      company: data.company,
      status: data.status || 'applied',
      position: data.position,
      location: data.location,
      salaryRange: data.salaryRange,
      notes: data.notes,
      source: data.source,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : new Date(),
    };
  });
}

/**
 * Update a job
 * @param {string} jobId - Job ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated job
 */
async function updateJob(jobId, updates) {
  return jobsService.update(jobId, updates, (cleanUpdates) => {
    // Transform date fields
    if (cleanUpdates.appliedDate) {
      cleanUpdates.appliedDate = new Date(cleanUpdates.appliedDate);
    }
    return cleanUpdates;
  });
}

/**
 * Delete a job
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
async function deleteJob(jobId) {
  return jobsService.delete(jobId);
}

/**
 * Get jobs by status
 * @param {string} userId - User ID
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of jobs
 */
async function getJobsByStatus(userId, status) {
  return jobsService.getAllByUserId(userId, { status });
}

module.exports = {
  getJobsByUserId,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByStatus
};

