/**
 * SEC-013: Role-based access control (RBAC) for admin operations
 * SEC-021: Admin role check for file management operations
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * User roles
 */
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

/**
 * SEC-013, SEC-021: Check if user has admin role
 */
async function isAdmin(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === ROLES.ADMIN;
  } catch (error) {
    logger.error('Failed to check admin role:', error);
    return false;
  }
}

/**
 * SEC-013, SEC-021: Check if user has moderator role
 */
async function isModerator(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === ROLES.MODERATOR || user?.role === ROLES.ADMIN;
  } catch (error) {
    logger.error('Failed to check moderator role:', error);
    return false;
  }
}

/**
 * SEC-013, SEC-021: Require admin role middleware
 */
async function requireAdmin(userId) {
  const admin = await isAdmin(userId);
  if (!admin) {
    throw new Error('Admin access required');
  }
  return true;
}

/**
 * SEC-013, SEC-021: Require moderator or admin role middleware
 */
async function requireModerator(userId) {
  const moderator = await isModerator(userId);
  if (!moderator) {
    throw new Error('Moderator or admin access required');
  }
  return true;
}

/**
 * SEC-025: Check if user can grant permission
 * Users can't grant permissions they don't have
 */
async function canGrantPermission(grantorId, fileId, permission) {
  try {
    // Admin can grant any permission
    if (await isAdmin(grantorId)) {
      return true;
    }

    // Check if grantor owns the file
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
      select: { userId: true },
    });

    if (file?.userId === grantorId) {
      return true; // Owner can grant any permission
    }

    // Check if grantor has the permission they're trying to grant
    const permissionCheck = await require('./filePermissions').checkFilePermission(grantorId, fileId, permission);
    
    return permissionCheck.allowed;
  } catch (error) {
    logger.error('Failed to check grant permission:', error);
    return false;
  }
}

module.exports = {
  isAdmin,
  isModerator,
  requireAdmin,
  requireModerator,
  canGrantPermission,
  ROLES,
};

