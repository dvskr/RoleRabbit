/**
 * SEC-012: Enforce max downloads limit for share links
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * SEC-012: Check share link access and enforce max downloads
 */
async function checkShareLinkAccess(token, password = null) {
  try {
    // Get share link
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        file: true,
      },
    });

    if (!shareLink) {
      return { allowed: false, reason: 'Share link not found' };
    }

    // Check expiration
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) <= new Date()) {
      return { allowed: false, reason: 'Share link has expired' };
    }

    // SEC-012: Check max downloads limit
    if (shareLink.maxDownloads !== null && shareLink.downloadCount >= shareLink.maxDownloads) {
      return { allowed: false, reason: 'Maximum download limit reached' };
    }

    // Check password if required
    // NOTE: Schema uses 'password' field (stores hashed password)
    if (shareLink.password) {
      if (!password) {
        return { allowed: false, reason: 'Password required', requiresPassword: true };
      }

      const bcrypt = require('bcrypt');
      const isValid = await bcrypt.compare(password, shareLink.password);
      if (!isValid) {
        return { allowed: false, reason: 'Invalid password' };
      }
    }

    return {
      allowed: true,
      shareLink,
      file: shareLink.file,
      permission: shareLink.permission,
    };
  } catch (error) {
    logger.error('Share link access check failed:', error);
    return { allowed: false, reason: 'Error checking share link access' };
  }
}

/**
 * SEC-012: Increment download count for share link
 */
async function incrementShareLinkDownloads(token) {
  try {
    await prisma.shareLink.update({
      where: { token },
      data: {
        downloadCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to increment share link downloads:', error);
    // Don't throw - this is not critical
  }
}

module.exports = {
  checkShareLinkAccess,
  incrementShareLinkDownloads,
};

