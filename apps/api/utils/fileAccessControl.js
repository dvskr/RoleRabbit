/**
 * SEC-003: Access control lists (ACLs) for file access
 * SEC-009: Enforce file ownership checks
 * SEC-010: Enforce share permission checks
 * SEC-011: Enforce share expiration checks
 * SEC-012: Enforce max downloads limit for share links
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * SEC-003: ACL structure
 */
class FileACL {
  constructor(file, userId) {
    this.file = file;
    this.userId = userId;
    this.permissions = {
      view: false,
      comment: false,
      edit: false,
      delete: false,
      admin: false,
    };
  }

  /**
   * SEC-009: Check if user is owner
   */
  isOwner() {
    return this.file.userId === this.userId;
  }

  /**
   * SEC-010: Check share permissions
   */
  async checkSharePermissions() {
    if (this.isOwner()) {
      // Owner has all permissions
      this.permissions = {
        view: true,
        comment: true,
        edit: true,
        delete: true,
        admin: true,
      };
      return;
    }

    // Check if file is public
    if (this.file.isPublic) {
      this.permissions.view = true;
      this.permissions.comment = true;
      return;
    }

    // Check shares
    const share = await prisma.fileShare.findFirst({
      where: {
        fileId: this.file.id,
        sharedWith: this.userId,
        // SEC-011: Filter expired shares
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (share) {
      switch (share.permission) {
        case 'admin':
          this.permissions.admin = true;
          this.permissions.delete = true;
          this.permissions.edit = true;
          this.permissions.comment = true;
          this.permissions.view = true;
          break;
        case 'edit':
          this.permissions.edit = true;
          this.permissions.comment = true;
          this.permissions.view = true;
          break;
        case 'comment':
          this.permissions.comment = true;
          this.permissions.view = true;
          break;
        case 'view':
          this.permissions.view = true;
          break;
      }
    }
  }

  /**
   * SEC-012: Check share link access
   */
  async checkShareLinkAccess(token, password = null) {
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        fileId: this.file.id,
        token,
        // SEC-011: Check expiration
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!shareLink) {
      return { allowed: false, reason: 'Share link not found or expired' };
    }

    // Check password if required
    if (shareLink.passwordHash) {
      if (!password) {
        return { allowed: false, reason: 'Password required', requiresPassword: true };
      }
      const bcrypt = require('bcrypt');
      const passwordValid = await bcrypt.compare(password, shareLink.passwordHash);
      if (!passwordValid) {
        return { allowed: false, reason: 'Invalid password' };
      }
    }

    // SEC-012: Check max downloads
    if (shareLink.maxDownloads !== null && shareLink.downloadCount >= shareLink.maxDownloads) {
      return { allowed: false, reason: 'Maximum downloads reached' };
    }

    // Update download count
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Set permissions based on share link permission
    switch (shareLink.permission) {
      case 'edit':
        this.permissions.edit = true;
        this.permissions.comment = true;
        this.permissions.view = true;
        break;
      case 'comment':
        this.permissions.comment = true;
        this.permissions.view = true;
        break;
      case 'view':
        this.permissions.view = true;
        break;
    }

    return { allowed: true, shareLink };
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission) {
    return this.permissions[permission] === true;
  }

  /**
   * Get all permissions
   */
  getPermissions() {
    return { ...this.permissions };
  }
}

/**
 * SEC-009: Verify file ownership
 */
async function verifyFileOwnership(fileId, userId) {
  const file = await prisma.storage_files.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    return { valid: false, error: 'File not found' };
  }

  if (file.userId !== userId) {
    return { valid: false, error: 'File ownership verification failed' };
  }

  return { valid: true, file };
}

/**
 * SEC-010: Check file permission with ACL
 */
async function checkFilePermissionWithACL(fileId, userId, requiredPermission) {
  const file = await prisma.storage_files.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    return { allowed: false, reason: 'File not found' };
  }

  const acl = new FileACL(file, userId);
  await acl.checkSharePermissions();

  if (!acl.hasPermission(requiredPermission)) {
    return {
      allowed: false,
      reason: `Permission denied: ${requiredPermission} required`,
      permissions: acl.getPermissions(),
    };
  }

  return {
    allowed: true,
    file,
    permissions: acl.getPermissions(),
  };
}

module.exports = {
  FileACL,
  verifyFileOwnership,
  checkFilePermissionWithACL,
};

