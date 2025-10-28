/**
 * Emails API utilities
 * Handles database operations for email management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all emails for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of emails
 */
async function getEmailsByUserId(userId) {
  try {
    const emails = await prisma.email.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

/**
 * Get a single email by ID
 * @param {string} emailId - Email ID
 * @returns {Promise<Object>} Email object
 */
async function getEmailById(emailId) {
  try {
    const email = await prisma.email.findUnique({
      where: {
        id: emailId
      }
    });
    return email;
  } catch (error) {
    console.error('Error fetching email:', error);
    throw error;
  }
}

/**
 * Create a new email
 * @param {string} userId - User ID
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} Created email
 */
async function createEmail(userId, emailData) {
  try {
    const email = await prisma.email.create({
      data: {
        userId,
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        type: emailData.type || 'followup',
        status: emailData.status || 'draft',
        jobId: emailData.jobId || null
      }
    });
    return email;
  } catch (error) {
    console.error('Error creating email:', error);
    throw error;
  }
}

/**
 * Update an email
 * @param {string} emailId - Email ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated email
 */
async function updateEmail(emailId, updates) {
  try {
    // Filter out undefined fields
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });

    const email = await prisma.email.update({
      where: {
        id: emailId
      },
      data: cleanUpdates
    });
    return email;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
}

/**
 * Delete an email
 * @param {string} emailId - Email ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteEmail(emailId) {
  try {
    await prisma.email.delete({
      where: {
        id: emailId
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
}

/**
 * Get emails by job ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} Array of emails
 */
async function getEmailsByJobId(jobId) {
  try {
    const emails = await prisma.email.findMany({
      where: {
        jobId: jobId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return emails;
  } catch (error) {
    console.error('Error fetching emails by job:', error);
    throw error;
  }
}

module.exports = {
  getEmailsByUserId,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail,
  getEmailsByJobId
};

