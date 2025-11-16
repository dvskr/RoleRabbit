const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Get user's tailoring preferences
 * @param {string} userId 
 * @returns {Promise<{mode: string, tone: string, length: string}>}
 */
async function getUserTailoringPreferences(userId) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        tailorPreferredMode: true,
        tailorPreferredTone: true,
        tailorPreferredLength: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      mode: (user.tailorPreferredMode || 'PARTIAL').toLowerCase(),
      tone: user.tailorPreferredTone || 'professional',
      length: user.tailorPreferredLength || 'thorough',
    };
  } catch (error) {
    logger.error('Failed to get user tailoring preferences', { userId, error: error.message });
    // Return defaults on error
    return {
      mode: 'partial',
      tone: 'professional',
      length: 'thorough',
    };
  }
}

/**
 * Update user's tailoring preferences
 * @param {string} userId 
 * @param {Object} preferences 
 * @param {string} [preferences.mode] - 'partial' or 'full'
 * @param {string} [preferences.tone] - 'professional', 'technical', 'creative', 'casual'
 * @param {string} [preferences.length] - 'concise' or 'thorough'
 * @returns {Promise<{mode: string, tone: string, length: string}>}
 */
async function updateUserTailoringPreferences(userId, preferences) {
  try {
    // Validate inputs
    const updates = {};

    if (preferences.mode) {
      const normalizedMode = preferences.mode.toUpperCase();
      if (!['PARTIAL', 'FULL'].includes(normalizedMode)) {
        throw new Error(`Invalid mode: ${preferences.mode}. Must be 'partial' or 'full'`);
      }
      updates.tailorPreferredMode = normalizedMode;
    }

    if (preferences.tone) {
      const validTones = ['professional', 'technical', 'creative', 'casual'];
      if (!validTones.includes(preferences.tone.toLowerCase())) {
        throw new Error(`Invalid tone: ${preferences.tone}. Must be one of: ${validTones.join(', ')}`);
      }
      updates.tailorPreferredTone = preferences.tone.toLowerCase();
    }

    if (preferences.length) {
      const validLengths = ['concise', 'thorough'];
      if (!validLengths.includes(preferences.length.toLowerCase())) {
        throw new Error(`Invalid length: ${preferences.length}. Must be 'concise' or 'thorough'`);
      }
      updates.tailorPreferredLength = preferences.length.toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid preferences provided to update');
    }

    // Update user preferences
    const user = await prisma.users.update({
      where: { id: userId },
      data: updates,
      select: {
        tailorPreferredMode: true,
        tailorPreferredTone: true,
        tailorPreferredLength: true,
      }
    });

    logger.info('User tailoring preferences updated', { userId, updates });

    return {
      mode: (user.tailorPreferredMode || 'PARTIAL').toLowerCase(),
      tone: user.tailorPreferredTone || 'professional',
      length: user.tailorPreferredLength || 'thorough',
    };
  } catch (error) {
    logger.error('Failed to update user tailoring preferences', { userId, preferences, error: error.message });
    throw error;
  }
}

/**
 * Reset user's tailoring preferences to defaults
 * @param {string} userId 
 * @returns {Promise<{mode: string, tone: string, length: string}>}
 */
async function resetUserTailoringPreferences(userId) {
  try {
    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        tailorPreferredMode: 'PARTIAL',
        tailorPreferredTone: 'professional',
        tailorPreferredLength: 'thorough',
      },
      select: {
        tailorPreferredMode: true,
        tailorPreferredTone: true,
        tailorPreferredLength: true,
      }
    });

    logger.info('User tailoring preferences reset to defaults', { userId });

    return {
      mode: 'partial',
      tone: 'professional',
      length: 'thorough',
    };
  } catch (error) {
    logger.error('Failed to reset user tailoring preferences', { userId, error: error.message });
    throw error;
  }
}

/**
 * Get all user preferences (for future expansion)
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
async function getUserPreferences(userId) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        tailorPreferredMode: true,
        tailorPreferredTone: true,
        tailorPreferredLength: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      emailNotifications: user.emailNotifications,
      tailoring: {
        mode: (user.tailorPreferredMode || 'PARTIAL').toLowerCase(),
        tone: user.tailorPreferredTone || 'professional',
        length: user.tailorPreferredLength || 'thorough',
      },
    };
  } catch (error) {
    logger.error('Failed to get user preferences', { userId, error: error.message });
    throw error;
  }
}

module.exports = {
  getUserTailoringPreferences,
  updateUserTailoringPreferences,
  resetUserTailoringPreferences,
  getUserPreferences,
};

