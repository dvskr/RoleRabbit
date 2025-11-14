// Template Favorites Service - Manage user favorite templates
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Add a template to user's favorites
 * @param {string} userId - User ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Created favorite record
 */
async function addFavorite(userId, templateId) {
  try {
    if (!userId || !templateId) {
      throw new Error('User ID and Template ID are required');
    }

    // Check if template exists and is active
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, isActive: true, isApproved: true, name: true }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.isActive || !template.isApproved) {
      throw new Error('Template is not available');
    }

    // Check if already favorited
    const existing = await prisma.userTemplateFavorite.findUnique({
      where: {
        userId_templateId: {
          userId,
          templateId
        }
      }
    });

    if (existing) {
      // Already favorited, return existing record
      return existing;
    }

    // Create favorite
    const favorite = await prisma.userTemplateFavorite.create({
      data: {
        userId,
        templateId
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            preview: true,
            isPremium: true
          }
        }
      }
    });

    console.log(`✅ Favorite added: User ${userId} favorited template ${template.name}`);
    return favorite;
  } catch (error) {
    console.error('Error in addFavorite:', error);
    throw new Error(`Failed to add favorite: ${error.message}`);
  }
}

/**
 * Remove a template from user's favorites
 * @param {string} userId - User ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Deleted favorite record
 */
async function removeFavorite(userId, templateId) {
  try {
    if (!userId || !templateId) {
      throw new Error('User ID and Template ID are required');
    }

    // Check if favorite exists
    const existing = await prisma.userTemplateFavorite.findUnique({
      where: {
        userId_templateId: {
          userId,
          templateId
        }
      }
    });

    if (!existing) {
      throw new Error('Favorite not found');
    }

    // Delete favorite
    const favorite = await prisma.userTemplateFavorite.delete({
      where: {
        userId_templateId: {
          userId,
          templateId
        }
      }
    });

    console.log(`✅ Favorite removed: User ${userId} unfavorited template ${templateId}`);
    return favorite;
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    throw new Error(`Failed to remove favorite: ${error.message}`);
  }
}

/**
 * Get all favorite templates for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {boolean} options.includeInactive - Include inactive templates (default: false)
 * @param {string} options.sortBy - Sort by field (newest, oldest, name)
 * @param {number} options.limit - Limit results
 * @returns {Promise<Array>} User's favorite templates
 */
async function getUserFavorites(userId, options = {}) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const {
      includeInactive = false,
      sortBy = 'newest',
      limit
    } = options;

    // Build where clause for template
    const templateWhere = includeInactive ? {} : {
      isActive: true,
      isApproved: true
    };

    // Build orderBy clause
    let orderBy = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { template: { name: 'asc' } };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const queryOptions = {
      where: {
        userId,
        template: templateWhere
      },
      orderBy,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            preview: true,
            features: true,
            difficulty: true,
            industry: true,
            layout: true,
            colorScheme: true,
            isPremium: true,
            rating: true,
            downloads: true,
            tags: true,
            _count: {
              select: {
                favorites: true
              }
            }
          }
        }
      }
    };

    if (limit) {
      queryOptions.take = Math.min(100, parseInt(limit));
    }

    const favorites = await prisma.userTemplateFavorite.findMany(queryOptions);

    // Extract templates from favorites
    const templates = favorites.map(fav => ({
      ...fav.template,
      favoritedAt: fav.createdAt
    }));

    return templates;
  } catch (error) {
    console.error('Error in getUserFavorites:', error);
    throw new Error(`Failed to get user favorites: ${error.message}`);
  }
}

/**
 * Check if a template is favorited by a user
 * @param {string} userId - User ID
 * @param {string} templateId - Template ID
 * @returns {Promise<boolean>} True if favorited, false otherwise
 */
async function isFavorite(userId, templateId) {
  try {
    if (!userId || !templateId) {
      return false;
    }

    const favorite = await prisma.userTemplateFavorite.findUnique({
      where: {
        userId_templateId: {
          userId,
          templateId
        }
      }
    });

    return !!favorite;
  } catch (error) {
    console.error('Error in isFavorite:', error);
    return false;
  }
}

/**
 * Get favorite template IDs for a user (lightweight query)
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of template IDs
 */
async function getFavoriteIds(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const favorites = await prisma.userTemplateFavorite.findMany({
      where: { userId },
      select: { templateId: true }
    });

    return favorites.map(fav => fav.templateId);
  } catch (error) {
    console.error('Error in getFavoriteIds:', error);
    throw new Error(`Failed to get favorite IDs: ${error.message}`);
  }
}

/**
 * Get favorite count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of favorites
 */
async function getFavoriteCount(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const count = await prisma.userTemplateFavorite.count({
      where: { userId }
    });

    return count;
  } catch (error) {
    console.error('Error in getFavoriteCount:', error);
    throw new Error(`Failed to get favorite count: ${error.message}`);
  }
}

/**
 * Sync favorites from localStorage to database (one-time migration)
 * @param {string} userId - User ID
 * @param {Array<string>} localFavoriteIds - Array of template IDs from localStorage
 * @returns {Promise<Object>} Sync result with counts
 */
async function syncFavoritesFromLocal(userId, localFavoriteIds = []) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!Array.isArray(localFavoriteIds) || localFavoriteIds.length === 0) {
      return {
        added: 0,
        skipped: 0,
        errors: 0,
        message: 'No local favorites to sync'
      };
    }

    console.log(`🔄 Syncing ${localFavoriteIds.length} favorites from localStorage for user ${userId}`);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const templateId of localFavoriteIds) {
      try {
        // Check if template exists
        const template = await prisma.resumeTemplate.findUnique({
          where: { id: templateId },
          select: { id: true, isActive: true, isApproved: true }
        });

        if (!template || !template.isActive || !template.isApproved) {
          console.warn(`⚠️  Template ${templateId} not found or inactive, skipping`);
          skipped++;
          continue;
        }

        // Check if already favorited
        const existing = await prisma.userTemplateFavorite.findUnique({
          where: {
            userId_templateId: {
              userId,
              templateId
            }
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create favorite
        await prisma.userTemplateFavorite.create({
          data: {
            userId,
            templateId
          }
        });

        added++;
      } catch (error) {
        console.error(`Error syncing favorite ${templateId}:`, error.message);
        errors++;
      }
    }

    const message = `Sync complete: ${added} added, ${skipped} skipped, ${errors} errors`;
    console.log(`✅ ${message}`);

    return {
      added,
      skipped,
      errors,
      message
    };
  } catch (error) {
    console.error('Error in syncFavoritesFromLocal:', error);
    throw new Error(`Failed to sync favorites: ${error.message}`);
  }
}

/**
 * Remove all favorites for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of favorites removed
 */
async function removeAllFavorites(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const result = await prisma.userTemplateFavorite.deleteMany({
      where: { userId }
    });

    console.log(`✅ Removed ${result.count} favorites for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Error in removeAllFavorites:', error);
    throw new Error(`Failed to remove favorites: ${error.message}`);
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorite,
  getFavoriteIds,
  getFavoriteCount,
  syncFavoritesFromLocal,
  removeAllFavorites
};
