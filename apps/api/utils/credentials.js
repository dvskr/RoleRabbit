/**
 * Credentials API utilities
 * Handles database operations for credential management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

/**
 * Get all credentials for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of credentials
 */
async function getCredentialsByUserId(userId) {
  try {
    const credentials = await prisma.credential.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return credentials;
  } catch (error) {
    logger.error('Error fetching credentials:', error);
    throw error;
  }
}

/**
 * Get a single credential by ID
 * @param {string} credentialId - Credential ID
 * @returns {Promise<Object>} Credential object
 */
async function getCredentialById(credentialId) {
  try {
    const credential = await prisma.credential.findUnique({
      where: {
        id: credentialId
      }
    });
    return credential;
  } catch (error) {
    logger.error('Error fetching credential:', error);
    throw error;
  }
}

/**
 * Create a new credential
 * @param {string} userId - User ID
 * @param {Object} credentialData - Credential data
 * @returns {Promise<Object>} Created credential
 */
async function createCredential(userId, credentialData) {
  try {
    const credential = await prisma.credential.create({
      data: {
        userId,
        credentialType: credentialData.credentialType,
        issuer: credentialData.issuer,
        name: credentialData.name,
        issuedDate: new Date(credentialData.issuedDate),
        expirationDate: credentialData.expirationDate ? new Date(credentialData.expirationDate) : null,
        credentialId: credentialData.credentialId,
        verificationStatus: credentialData.verificationStatus || 'pending',
        verificationUrl: credentialData.verificationUrl,
        qrCode: credentialData.qrCode,
        description: credentialData.description
      }
    });
    return credential;
  } catch (error) {
    logger.error('Error creating credential:', error);
    throw error;
  }
}

/**
 * Update a credential
 * @param {string} credentialId - Credential ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated credential
 */
async function updateCredential(credentialId, updates) {
  try {
    // Handle date conversions
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.issuedDate) {
      cleanedUpdates.issuedDate = new Date(cleanedUpdates.issuedDate);
    }
    if (cleanedUpdates.expirationDate !== undefined) {
      cleanedUpdates.expirationDate = cleanedUpdates.expirationDate ? new Date(cleanedUpdates.expirationDate) : null;
    }

    const credential = await prisma.credential.update({
      where: {
        id: credentialId
      },
      data: cleanedUpdates
    });
    return credential;
  } catch (error) {
    logger.error('Error updating credential:', error);
    throw error;
  }
}

/**
 * Delete a credential
 * @param {string} credentialId - Credential ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteCredential(credentialId) {
  try {
    await prisma.credential.delete({
      where: {
        id: credentialId
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting credential:', error);
    throw error;
  }
}

/**
 * Get credentials by type
 * @param {string} userId - User ID
 * @param {string} type - Credential type
 * @returns {Promise<Array>} Array of credentials
 */
async function getCredentialsByType(userId, type) {
  try {
    const credentials = await prisma.credential.findMany({
      where: {
        userId: userId,
        credentialType: type
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return credentials;
  } catch (error) {
    logger.error('Error fetching credentials by type:', error);
    throw error;
  }
}

/**
 * Get expiring credentials
 * @param {string} userId - User ID
 * @param {number} daysAhead - Days to look ahead
 * @returns {Promise<Array>} Array of expiring credentials
 */
async function getExpiringCredentials(userId, daysAhead = 90) {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const credentials = await prisma.credential.findMany({
      where: {
        userId: userId,
        expirationDate: {
          not: null,
          lte: futureDate
        },
        verificationStatus: {
          not: 'expired'
        }
      },
      orderBy: {
        expirationDate: 'asc'
      }
    });
    return credentials;
  } catch (error) {
    logger.error('Error fetching expiring credentials:', error);
    throw error;
  }
}

module.exports = {
  getCredentialsByUserId,
  getCredentialById,
  createCredential,
  updateCredential,
  deleteCredential,
  getCredentialsByType,
  getExpiringCredentials
};

