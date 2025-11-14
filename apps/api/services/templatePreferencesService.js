// Template Preferences Service - Manage user template preferences
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get user template preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User preferences or null if not found
 */
async function getPreferences(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const preferences = await prisma.userTemplatePreferences.findUnique({
      where: { userId }
    });

    // Return default preferences if none exist
    if (!preferences) {
      return {
        userId,
        filterSettings: {},
        sortPreference: 'popular',
        viewMode: 'grid',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return preferences;
  } catch (error) {
    console.error('Error in getPreferences:', error);
    throw new Error(`Failed to get preferences: ${error.message}`);
  }
}

/**
 * Save or update user template preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences to save
 * @param {Object} preferences.filterSettings - Filter settings (category, difficulty, etc.)
 * @param {string} preferences.sortPreference - Sort preference (popular, newest, rating, downloads)
 * @param {string} preferences.viewMode - View mode (grid, list)
 * @returns {Promise<Object>} Saved preferences
 */
async function savePreferences(userId, preferences) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validate preferences
    const validSortOptions = ['popular', 'newest', 'rating', 'downloads', 'name'];
    const validViewModes = ['grid', 'list'];

    if (preferences.sortPreference && !validSortOptions.includes(preferences.sortPreference)) {
      throw new Error(`Invalid sort preference. Must be one of: ${validSortOptions.join(', ')}`);
    }

    if (preferences.viewMode && !validViewModes.includes(preferences.viewMode)) {
      throw new Error(`Invalid view mode. Must be one of: ${validViewModes.join(', ')}`);
    }

    // Prepare data for upsert
    const data = {};
    if (preferences.filterSettings !== undefined) {
      data.filterSettings = preferences.filterSettings;
    }
    if (preferences.sortPreference) {
      data.sortPreference = preferences.sortPreference;
    }
    if (preferences.viewMode) {
      data.viewMode = preferences.viewMode;
    }
    data.updatedAt = new Date();

    // Upsert preferences
    const saved = await prisma.userTemplatePreferences.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        filterSettings: preferences.filterSettings || {},
        sortPreference: preferences.sortPreference || 'popular',
        viewMode: preferences.viewMode || 'grid'
      }
    });

    console.log(`✅ Preferences saved for user ${userId}`);
    return saved;
  } catch (error) {
    console.error('Error in savePreferences:', error);
    throw new Error(`Failed to save preferences: ${error.message}`);
  }
}

/**
 * Update user filter settings (partial update)
 * @param {string} userId - User ID
 * @param {Object} filterSettings - Filter settings to update
 * @returns {Promise<Object>} Updated preferences
 */
async function updateFilterSettings(userId, filterSettings) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get current preferences
    const current = await getPreferences(userId);

    // Merge with new filter settings
    const merged = {
      ...current.filterSettings,
      ...filterSettings
    };

    // Save updated preferences
    return await savePreferences(userId, {
      filterSettings: merged,
      sortPreference: current.sortPreference,
      viewMode: current.viewMode
    });
  } catch (error) {
    console.error('Error in updateFilterSettings:', error);
    throw new Error(`Failed to update filter settings: ${error.message}`);
  }
}

/**
 * Update user sort preference
 * @param {string} userId - User ID
 * @param {string} sortPreference - Sort preference (popular, newest, rating, downloads)
 * @returns {Promise<Object>} Updated preferences
 */
async function updateSortPreference(userId, sortPreference) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const current = await getPreferences(userId);

    return await savePreferences(userId, {
      ...current,
      sortPreference
    });
  } catch (error) {
    console.error('Error in updateSortPreference:', error);
    throw new Error(`Failed to update sort preference: ${error.message}`);
  }
}

/**
 * Update user view mode
 * @param {string} userId - User ID
 * @param {string} viewMode - View mode (grid, list)
 * @returns {Promise<Object>} Updated preferences
 */
async function updateViewMode(userId, viewMode) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const current = await getPreferences(userId);

    return await savePreferences(userId, {
      ...current,
      viewMode
    });
  } catch (error) {
    console.error('Error in updateViewMode:', error);
    throw new Error(`Failed to update view mode: ${error.message}`);
  }
}

/**
 * Reset user preferences to defaults
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Reset preferences
 */
async function resetPreferences(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const reset = await prisma.userTemplatePreferences.upsert({
      where: { userId },
      update: {
        filterSettings: {},
        sortPreference: 'popular',
        viewMode: 'grid',
        updatedAt: new Date()
      },
      create: {
        userId,
        filterSettings: {},
        sortPreference: 'popular',
        viewMode: 'grid'
      }
    });

    console.log(`✅ Preferences reset to defaults for user ${userId}`);
    return reset;
  } catch (error) {
    console.error('Error in resetPreferences:', error);
    throw new Error(`Failed to reset preferences: ${error.message}`);
  }
}

/**
 * Sync preferences from localStorage to database (one-time migration)
 * @param {string} userId - User ID
 * @param {Object} localPreferences - Preferences from localStorage
 * @returns {Promise<Object>} Synced preferences
 */
async function syncPreferencesFromLocal(userId, localPreferences = {}) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`🔄 Syncing preferences from localStorage for user ${userId}`);

    // Check if user already has preferences in database
    const existing = await prisma.userTemplatePreferences.findUnique({
      where: { userId }
    });

    if (existing) {
      console.log(`⚠️  User ${userId} already has preferences in database, skipping sync`);
      return existing;
    }

    // Extract and validate localStorage preferences
    const filterSettings = {};
    const validFilterKeys = [
      'category', 'difficulty', 'layout', 'colorScheme',
      'isPremium', 'industry', 'minRating', 'maxRating'
    ];

    // Build filter settings from individual localStorage keys
    for (const key of validFilterKeys) {
      if (localPreferences[key] !== undefined && localPreferences[key] !== null) {
        filterSettings[key] = localPreferences[key];
      }
    }

    const sortPreference = localPreferences.sortBy || localPreferences.sortPreference || 'popular';
    const viewMode = localPreferences.viewMode || 'grid';

    // Save to database
    const synced = await savePreferences(userId, {
      filterSettings,
      sortPreference,
      viewMode
    });

    console.log(`✅ Preferences synced from localStorage for user ${userId}`);
    return synced;
  } catch (error) {
    console.error('Error in syncPreferencesFromLocal:', error);
    throw new Error(`Failed to sync preferences: ${error.message}`);
  }
}

/**
 * Delete user preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deleted preferences
 */
async function deletePreferences(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const deleted = await prisma.userTemplatePreferences.delete({
      where: { userId }
    });

    console.log(`✅ Preferences deleted for user ${userId}`);
    return deleted;
  } catch (error) {
    // If preferences don't exist, that's okay
    if (error.code === 'P2025') {
      console.log(`ℹ️  No preferences found for user ${userId}`);
      return null;
    }
    console.error('Error in deletePreferences:', error);
    throw new Error(`Failed to delete preferences: ${error.message}`);
  }
}

/**
 * Get preferences for multiple users (batch operation)
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Map>} Map of userId to preferences
 */
async function getBatchPreferences(userIds = []) {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new Map();
    }

    const preferences = await prisma.userTemplatePreferences.findMany({
      where: {
        userId: {
          in: userIds
        }
      }
    });

    // Create map for easy lookup
    const map = new Map();
    preferences.forEach(pref => {
      map.set(pref.userId, pref);
    });

    return map;
  } catch (error) {
    console.error('Error in getBatchPreferences:', error);
    throw new Error(`Failed to get batch preferences: ${error.message}`);
  }
}

module.exports = {
  getPreferences,
  savePreferences,
  updateFilterSettings,
  updateSortPreference,
  updateViewMode,
  resetPreferences,
  syncPreferencesFromLocal,
  deletePreferences,
  getBatchPreferences
};
