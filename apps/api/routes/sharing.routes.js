/**
 * Resume Sharing Routes
 * 
 * Endpoints for sharing resumes with other users
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission, shareResume, revokeResumeAccess, getResumeAccessList } = require('../middleware/rbac');

/**
 * Share resume with another user
 * POST /api/sharing/share
 */
router.post('/share', authenticateToken, async (req, res) => {
  const { resumeId, email, permission } = req.body;
  const ownerId = req.user.userId;
  
  try {
    // Validate input
    if (!resumeId || !email || !permission) {
      return res.status(400).json({
        success: false,
        error: 'resumeId, email, and permission are required',
        code: 'INVALID_INPUT'
      });
    }
    
    // Find user by email
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const sharedWithUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    });
    
    if (!sharedWithUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found with that email',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Cannot share with yourself
    if (sharedWithUser.id === ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot share resume with yourself',
        code: 'INVALID_SHARE'
      });
    }
    
    // Share resume
    const share = await shareResume({
      resumeId,
      ownerId,
      sharedWithUserId: sharedWithUser.id,
      permission
    });
    
    res.json({
      success: true,
      share: {
        ...share,
        sharedWith: {
          id: sharedWithUser.id,
          email: sharedWithUser.email,
          name: sharedWithUser.name
        }
      }
    });
  } catch (error) {
    console.error('Share resume error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to share resume',
      code: 'SHARE_FAILED'
    });
  }
});

/**
 * Revoke resume access
 * POST /api/sharing/revoke
 */
router.post('/revoke', authenticateToken, async (req, res) => {
  const { resumeId, userId } = req.body;
  const ownerId = req.user.userId;
  
  try {
    if (!resumeId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'resumeId and userId are required',
        code: 'INVALID_INPUT'
      });
    }
    
    await revokeResumeAccess(resumeId, ownerId, userId);
    
    res.json({
      success: true,
      message: 'Access revoked successfully'
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to revoke access',
      code: 'REVOKE_FAILED'
    });
  }
});

/**
 * Get resume access list
 * GET /api/sharing/:resumeId/access-list
 */
router.get('/:resumeId/access-list', authenticateToken, async (req, res) => {
  const { resumeId } = req.params;
  const ownerId = req.user.userId;
  
  try {
    const accessList = await getResumeAccessList(resumeId, ownerId);
    
    res.json({
      success: true,
      accessList
    });
  } catch (error) {
    console.error('Get access list error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get access list',
      code: 'ACCESS_LIST_FAILED'
    });
  }
});

/**
 * Get resumes shared with me
 * GET /api/sharing/shared-with-me
 */
router.get('/shared-with-me', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const sharedResumes = await prisma.$queryRawUnsafe(`
      SELECT 
        br.id,
        br.name,
        br.created_at,
        br.updated_at,
        rsp.permission,
        rsp.created_at as shared_at,
        u.email as owner_email,
        u.name as owner_name
      FROM resume_share_permissions rsp
      JOIN base_resumes br ON rsp.resume_id = br.id
      JOIN users u ON br.user_id = u.id
      WHERE rsp.user_id = '${userId}'
        AND rsp.is_active = true
      ORDER BY rsp.created_at DESC
    `);
    
    res.json({
      success: true,
      sharedResumes
    });
  } catch (error) {
    console.error('Get shared resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get shared resumes',
      code: 'SHARED_RESUMES_FAILED'
    });
  }
});

module.exports = router;

