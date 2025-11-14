/**
 * Template Sharing Service
 * Manages template sharing with customizable permissions
 *
 * Features:
 * - Share via link (public/private)
 * - Share with specific users
 * - Permission levels (view, edit, download)
 * - Expiring share links
 * - Share tracking and analytics
 * - Revoke sharing
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Share permission levels
const SHARE_PERMISSIONS = {
  VIEW: 'VIEW',
  DOWNLOAD: 'DOWNLOAD',
  EDIT: 'EDIT',
  FULL: 'FULL',
};

/**
 * Create a share link for a template
 */
async function createShareLink(templateId, userId, options = {}) {
  try {
    const {
      permission = SHARE_PERMISSIONS.VIEW,
      expiresIn = null, // days
      allowAnonymous = false,
      maxUses = null,
      requireAuth = true,
      sharedWith = [], // array of user IDs
    } = options;

    // Verify template ownership or edit permission
    const hasPermission = await verifyTemplatePermission(templateId, userId, 'EDIT');
    if (!hasPermission) {
      throw new Error('You do not have permission to share this template');
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(16).toString('hex');

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }

    // Create share record
    const share = await prisma.templateShare.create({
      data: {
        templateId,
        sharedBy: userId,
        shareToken,
        permission,
        expiresAt,
        allowAnonymous,
        maxUses,
        requireAuth,
        uses: 0,
        isActive: true,
      },
    });

    // If sharing with specific users, create user share records
    if (sharedWith.length > 0) {
      await prisma.templateUserShare.createMany({
        data: sharedWith.map((targetUserId) => ({
          shareId: share.id,
          userId: targetUserId,
          notified: false,
        })),
      });

      // Send notifications
      await notifyUsersAboutShare(share.id, sharedWith, userId);
    }

    const shareUrl = `${process.env.APP_URL}/templates/shared/${shareToken}`;

    return {
      success: true,
      share: {
        id: share.id,
        shareToken,
        shareUrl,
        permission,
        expiresAt,
        maxUses,
      },
      message: 'Share link created successfully',
    };
  } catch (error) {
    console.error('Error creating share link:', error);
    throw error;
  }
}

/**
 * Access template via share link
 */
async function accessSharedTemplate(shareToken, userId = null) {
  try {
    const share = await prisma.templateShare.findUnique({
      where: { shareToken },
      include: {
        template: true,
        sharedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!share) {
      throw new Error('Share link not found');
    }

    // Verify share is active
    if (!share.isActive) {
      throw new Error('This share link has been revoked');
    }

    // Check expiration
    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new Error('This share link has expired');
    }

    // Check max uses
    if (share.maxUses && share.uses >= share.maxUses) {
      throw new Error('This share link has reached its maximum number of uses');
    }

    // Check authentication requirement
    if (share.requireAuth && !userId) {
      throw new Error('Authentication required to access this template');
    }

    // Check if user is in allowed list (if specified)
    if (userId) {
      const userShare = await prisma.templateUserShare.findFirst({
        where: {
          shareId: share.id,
          userId,
        },
      });

      if (share.sharedWith && share.sharedWith.length > 0 && !userShare) {
        throw new Error('You do not have permission to access this shared template');
      }
    }

    // Increment use count
    await prisma.templateShare.update({
      where: { id: share.id },
      data: {
        uses: {
          increment: 1,
        },
        lastAccessedAt: new Date(),
      },
    });

    // Track access
    await trackShareAccess(share.id, userId);

    return {
      success: true,
      template: share.template,
      permission: share.permission,
      sharedBy: share.sharedByUser,
    };
  } catch (error) {
    console.error('Error accessing shared template:', error);
    throw error;
  }
}

/**
 * Get shares created by user
 */
async function getUserShares(userId, options = {}) {
  try {
    const { limit = 50, offset = 0, includeRevoked = false } = options;

    const where = {
      sharedBy: userId,
    };

    if (!includeRevoked) {
      where.isActive = true;
    }

    const [shares, total] = await Promise.all([
      prisma.templateShare.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              preview: true,
              category: true,
            },
          },
          _count: {
            select: {
              accesses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.templateShare.count({ where }),
    ]);

    return {
      shares,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching user shares:', error);
    throw error;
  }
}

/**
 * Get templates shared with user
 */
async function getSharedWithUser(userId, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    const userShares = await prisma.templateUserShare.findMany({
      where: {
        userId,
      },
      include: {
        share: {
          where: {
            isActive: true,
          },
          include: {
            template: true,
            sharedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { sharedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const shares = userShares
      .filter((us) => us.share !== null)
      .map((us) => ({
        ...us.share,
        sharedAt: us.sharedAt,
        hasViewed: us.hasViewed,
      }));

    return {
      shares,
      total: shares.length,
    };
  } catch (error) {
    console.error('Error fetching shared templates:', error);
    throw error;
  }
}

/**
 * Revoke share link
 */
async function revokeShare(shareId, userId) {
  try {
    const share = await prisma.templateShare.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new Error('Share not found');
    }

    if (share.sharedBy !== userId) {
      throw new Error('You do not have permission to revoke this share');
    }

    await prisma.templateShare.update({
      where: { id: shareId },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Share link revoked successfully',
    };
  } catch (error) {
    console.error('Error revoking share:', error);
    throw error;
  }
}

/**
 * Update share permissions
 */
async function updateSharePermissions(shareId, userId, newPermission) {
  try {
    const share = await prisma.templateShare.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new Error('Share not found');
    }

    if (share.sharedBy !== userId) {
      throw new Error('You do not have permission to update this share');
    }

    await prisma.templateShare.update({
      where: { id: shareId },
      data: {
        permission: newPermission,
      },
    });

    return {
      success: true,
      message: 'Share permissions updated successfully',
    };
  } catch (error) {
    console.error('Error updating share permissions:', error);
    throw error;
  }
}

/**
 * Get share analytics
 */
async function getShareAnalytics(shareId, userId) {
  try {
    const share = await prisma.templateShare.findUnique({
      where: { id: shareId },
      include: {
        accesses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { accessedAt: 'desc' },
          take: 100,
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!share) {
      throw new Error('Share not found');
    }

    if (share.sharedBy !== userId) {
      throw new Error('You do not have permission to view this share analytics');
    }

    // Analyze access patterns
    const uniqueUsers = new Set(
      share.accesses.filter((a) => a.userId).map((a) => a.userId)
    ).size;

    const anonymousAccesses = share.accesses.filter((a) => !a.userId).length;

    // Group by date
    const accessesByDate = {};
    share.accesses.forEach((access) => {
      const date = access.accessedAt.toISOString().split('T')[0];
      accessesByDate[date] = (accessesByDate[date] || 0) + 1;
    });

    return {
      share: {
        id: share.id,
        shareToken: share.shareToken,
        permission: share.permission,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        isActive: share.isActive,
      },
      template: share.template,
      analytics: {
        totalAccesses: share.uses,
        uniqueUsers,
        anonymousAccesses,
        accessesByDate,
        recentAccesses: share.accesses.slice(0, 10),
      },
    };
  } catch (error) {
    console.error('Error fetching share analytics:', error);
    throw error;
  }
}

/**
 * Helper: Verify template permission
 */
async function verifyTemplatePermission(templateId, userId, requiredPermission) {
  try {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return false;
    }

    // Owner has all permissions
    if (template.authorId === userId) {
      return true;
    }

    // Check if user has been granted permission
    const share = await prisma.templateShare.findFirst({
      where: {
        templateId,
        isActive: true,
        userShares: {
          some: {
            userId,
          },
        },
      },
    });

    if (share) {
      return checkPermissionLevel(share.permission, requiredPermission);
    }

    return false;
  } catch (error) {
    console.error('Error verifying permission:', error);
    return false;
  }
}

/**
 * Helper: Check if permission level is sufficient
 */
function checkPermissionLevel(userPermission, requiredPermission) {
  const permissionHierarchy = {
    VIEW: 1,
    DOWNLOAD: 2,
    EDIT: 3,
    FULL: 4,
  };

  return (
    permissionHierarchy[userPermission] >= permissionHierarchy[requiredPermission]
  );
}

/**
 * Helper: Track share access
 */
async function trackShareAccess(shareId, userId = null) {
  try {
    await prisma.shareAccess.create({
      data: {
        shareId,
        userId,
        accessedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error tracking share access:', error);
  }
}

/**
 * Helper: Notify users about share
 */
async function notifyUsersAboutShare(shareId, userIds, sharedBy) {
  try {
    const share = await prisma.templateShare.findUnique({
      where: { id: shareId },
      include: {
        template: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const userId of userIds) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'TEMPLATE_SHARED',
          title: 'Template Shared With You',
          message: `A template "${share.template.name}" has been shared with you`,
          relatedId: shareId,
          relatedType: 'SHARE',
          isRead: false,
        },
      });
    }

    await prisma.templateUserShare.updateMany({
      where: {
        shareId,
        userId: { in: userIds },
      },
      data: {
        notified: true,
      },
    });
  } catch (error) {
    console.error('Error notifying users:', error);
  }
}

module.exports = {
  SHARE_PERMISSIONS,
  createShareLink,
  accessSharedTemplate,
  getUserShares,
  getSharedWithUser,
  revokeShare,
  updateSharePermissions,
  getShareAnalytics,
};
