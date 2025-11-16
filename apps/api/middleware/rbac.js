/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * User Roles:
 * - admin: Full access to all resources, can view all resumes
 * - user: Access to own resources only
 * 
 * Resume Sharing Permissions:
 * - owner: Full access (read, write, delete)
 * - editor: Can read and edit, cannot delete
 * - viewer: Read-only access
 * 
 * Usage:
 *   router.get('/api/admin/resumes', requireRole('admin'), handler);
 *   router.patch('/api/base-resumes/:id', requirePermission('editor'), handler);
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User roles
const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Resume permissions
const PERMISSIONS = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

/**
 * Check if user has required role
 * @param {string} requiredRole - Required role
 * @returns {Function} Express middleware
 */
function requireRole(requiredRole) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        });
      }
      
      // Get user role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Check role
      if (user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${requiredRole}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      // Attach role to request
      req.userRole = user.role;
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify role',
        code: 'ROLE_CHECK_FAILED'
      });
    }
  };
}

/**
 * Check if user has required permission for a resume
 * @param {string} minPermission - Minimum required permission (owner, editor, viewer)
 * @returns {Function} Express middleware
 */
function requirePermission(minPermission) {
  const permissionLevels = {
    viewer: 1,
    editor: 2,
    owner: 3
  };
  
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const resumeId = req.params.id || req.body.resumeId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        });
      }
      
      if (!resumeId) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID required',
          code: 'RESUME_ID_REQUIRED'
        });
      }
      
      // Get user role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      // Admins have full access
      if (user?.role === ROLES.ADMIN) {
        req.permission = PERMISSIONS.OWNER;
        req.userRole = ROLES.ADMIN;
        return next();
      }
      
      // Check if user owns the resume
      const resume = await prisma.baseResume.findUnique({
        where: { id: resumeId },
        select: { userId: true }
      });
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          error: 'Resume not found',
          code: 'RESUME_NOT_FOUND'
        });
      }
      
      // Owner has full access
      if (resume.userId === userId) {
        req.permission = PERMISSIONS.OWNER;
        return next();
      }
      
      // Check shared permissions
      const sharedPermission = await getSharedPermission(resumeId, userId);
      
      if (!sharedPermission) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You do not have permission to access this resume.',
          code: 'ACCESS_DENIED'
        });
      }
      
      // Check if user has sufficient permission level
      const userLevel = permissionLevels[sharedPermission];
      const requiredLevel = permissionLevels[minPermission];
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required: ${minPermission}, You have: ${sharedPermission}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      // Attach permission to request
      req.permission = sharedPermission;
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify permissions',
        code: 'PERMISSION_CHECK_FAILED'
      });
    }
  };
}

/**
 * Get shared permission for a resume
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Permission level or null
 */
async function getSharedPermission(resumeId, userId) {
  try {
    // Check resume_share_permissions table
    const permission = await prisma.$queryRawUnsafe(`
      SELECT permission FROM resume_share_permissions
      WHERE resume_id = '${resumeId}'
        AND user_id = '${userId}'
        AND is_active = true
      LIMIT 1
    `);
    
    return permission && permission.length > 0 ? permission[0].permission : null;
  } catch (error) {
    console.error('Failed to get shared permission:', error);
    return null;
  }
}

/**
 * Share resume with another user
 * @param {Object} params - Share parameters
 * @param {string} params.resumeId - Resume ID
 * @param {string} params.ownerId - Owner user ID
 * @param {string} params.sharedWithUserId - User to share with
 * @param {string} params.permission - Permission level (owner, editor, viewer)
 * @returns {Promise<Object>} Share record
 */
async function shareResume({ resumeId, ownerId, sharedWithUserId, permission }) {
  try {
    // Verify owner
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: { userId: true }
    });
    
    if (!resume || resume.userId !== ownerId) {
      throw new Error('Not authorized to share this resume');
    }
    
    // Verify permission level
    if (!Object.values(PERMISSIONS).includes(permission)) {
      throw new Error('Invalid permission level');
    }
    
    // Create or update share permission
    const crypto = require('crypto');
    const shareId = crypto.randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO resume_share_permissions (
        id, resume_id, user_id, permission, shared_by, is_active, created_at, updated_at
      ) VALUES (
        ${shareId},
        ${resumeId},
        ${sharedWithUserId},
        ${permission},
        ${ownerId},
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (resume_id, user_id) DO UPDATE
      SET permission = ${permission},
          is_active = true,
          updated_at = NOW()
    `;
    
    return {
      id: shareId,
      resumeId,
      sharedWithUserId,
      permission,
      sharedBy: ownerId
    };
  } catch (error) {
    console.error('Failed to share resume:', error);
    throw error;
  }
}

/**
 * Revoke resume sharing
 * @param {string} resumeId - Resume ID
 * @param {string} ownerId - Owner user ID
 * @param {string} sharedWithUserId - User to revoke access from
 * @returns {Promise<boolean>} Success
 */
async function revokeResumeAccess(resumeId, ownerId, sharedWithUserId) {
  try {
    // Verify owner
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: { userId: true }
    });
    
    if (!resume || resume.userId !== ownerId) {
      throw new Error('Not authorized to revoke access to this resume');
    }
    
    await prisma.$executeRawUnsafe(`
      UPDATE resume_share_permissions
      SET is_active = false, updated_at = NOW()
      WHERE resume_id = '${resumeId}'
        AND user_id = '${sharedWithUserId}'
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to revoke resume access:', error);
    throw error;
  }
}

/**
 * Get all users who have access to a resume
 * @param {string} resumeId - Resume ID
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<Array>} List of users with access
 */
async function getResumeAccessList(resumeId, ownerId) {
  try {
    // Verify owner
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: { userId: true }
    });
    
    if (!resume || resume.userId !== ownerId) {
      throw new Error('Not authorized to view access list');
    }
    
    const accessList = await prisma.$queryRawUnsafe(`
      SELECT 
        rsp.user_id,
        rsp.permission,
        rsp.created_at,
        u.email,
        u.name
      FROM resume_share_permissions rsp
      JOIN users u ON rsp.user_id = u.id
      WHERE rsp.resume_id = '${resumeId}'
        AND rsp.is_active = true
      ORDER BY rsp.created_at DESC
    `);
    
    return accessList;
  } catch (error) {
    console.error('Failed to get resume access list:', error);
    throw error;
  }
}

/**
 * Check if user is admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if admin
 */
async function isAdmin(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role === ROLES.ADMIN;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

module.exports = {
  ROLES,
  PERMISSIONS,
  requireRole,
  requirePermission,
  shareResume,
  revokeResumeAccess,
  getResumeAccessList,
  isAdmin,
  getSharedPermission
};

