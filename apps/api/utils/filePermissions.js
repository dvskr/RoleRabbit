/**
 * Permission checking utility for file operations
 * Checks if a user has permission to perform actions on a file
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Permission levels hierarchy:
 * - view: Can only view/download file
 * - comment: Can view and add comments
 * - edit: Can view, comment, and edit file metadata
 * - admin: Can view, comment, edit, delete, and manage shares
 */

/**
 * Check if user has permission to perform an action on a file
 * @param {string} userId - User ID requesting access
 * @param {string} fileId - File ID
 * @param {string} action - Action to check: 'view', 'comment', 'edit', 'delete', 'admin'
 * @returns {Promise<{allowed: boolean, reason?: string, file?: object, permission?: string}>}
 */
async function checkFilePermission(userId, fileId, action) {
  try {
    // Get file with owner info
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
      include: {
        shares: {
          where: {
            sharedWith: userId,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          select: {
            permission: true,
            expiresAt: true
          }
        }
      }
    });

    if (!file) {
      return { allowed: false, reason: 'File not found' };
    }

    // Don't allow access to deleted files (except for owner to restore)
    if (file.deletedAt && file.userId !== userId) {
      return { allowed: false, reason: 'File has been deleted' };
    }

    // File owner has all permissions
    if (file.userId === userId) {
      return { allowed: true, file, permission: 'admin' };
    }

    // Check if user has a share
    const share = file.shares && file.shares.length > 0 ? file.shares[0] : null;
    
    if (!share) {
      return { allowed: false, reason: 'No access to file' };
    }

    const userPermission = share.permission;

    // Permission hierarchy check
    const permissionHierarchy = {
      'view': 1,
      'comment': 2,
      'edit': 3,
      'admin': 4
    };

    const actionHierarchy = {
      'view': 1,
      'comment': 2,
      'edit': 3,
      'delete': 4,
      'admin': 4
    };

    const userLevel = permissionHierarchy[userPermission] || 0;
    const requiredLevel = actionHierarchy[action] || 999;

    if (userLevel >= requiredLevel) {
      return { allowed: true, file, permission: userPermission };
    } else {
      return { 
        allowed: false, 
        reason: `Requires '${action}' permission, but user has '${userPermission}' permission`,
        permission: userPermission
      };
    }
  } catch (error) {
    logger.error('Error checking file permission:', error);
    return { allowed: false, reason: 'Error checking permissions' };
  }
}

/**
 * Get user's permission level for a file
 * @param {string} userId - User ID
 * @param {string} fileId - File ID
 * @returns {Promise<string|null>} - Permission level or null if no access
 */
async function getUserFilePermission(userId, fileId) {
  try {
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
      select: { userId: true }
    });

    if (!file) return null;

    // Owner has admin permission
    if (file.userId === userId) {
      return 'admin';
    }

    // Check share
    const share = await prisma.fileShare.findFirst({
      where: {
        fileId,
        sharedWith: userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      select: { permission: true }
    });

    return share ? share.permission : null;
  } catch (error) {
    logger.error('Error getting user file permission:', error);
    return null;
  }
}

module.exports = {
  checkFilePermission,
  getUserFilePermission
};

