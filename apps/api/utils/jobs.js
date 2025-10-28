/**
 * Jobs API utilities
 * Handles database operations for job tracking
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all jobs for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of jobs
 */
async function getJobsByUserId(userId) {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

/**
 * Get a single job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job object
 */
async function getJobById(jobId) {
  try {
    const job = await prisma.job.findUnique({
      where: {
        id: jobId
      }
    });
    return job;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
}

/**
 * Create a new job
 * @param {string} userId - User ID
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Created job
 */
async function createJob(userId, jobData) {
  try {
    const job = await prisma.job.create({
      data: {
        userId,
        title: jobData.title,
        company: jobData.company,
        status: jobData.status || 'applied',
        position: jobData.position,
        location: jobData.location,
        salaryRange: jobData.salaryRange,
        notes: jobData.notes,
        source: jobData.source,
        appliedDate: jobData.appliedDate ? new Date(jobData.appliedDate) : new Date(),
      }
    });
    return job;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

/**
 * Update a job
 * @param {string} jobId - Job ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated job
 */
async function updateJob(jobId, updates) {
  try {
    // Filter out undefined fields
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'appliedDate' && updates[key]) {
          cleanUpdates[key] = new Date(updates[key]);
        } else {
          cleanUpdates[key] = updates[key];
        }
      }
    });

    const job = await prisma.job.update({
      where: {
        id: jobId
      },
      data: cleanUpdates
    });
    return job;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

/**
 * Delete a job
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteJob(jobId) {
  try {
    await prisma.job.delete({
      where: {
        id: jobId
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

/**
 * Get jobs by status
 * @param {string} userId - User ID
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of jobs
 */
async function getJobsByStatus(userId, status) {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        userId: userId,
        status: status
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs by status:', error);
    throw error;
  }
}

module.exports = {
  getJobsByUserId,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByStatus
};

