# Delete Operations Security Audit

## Audit Date: 2025-11-11
## Scope: Soft Delete, Hard Delete, and Restore Operations

---

## Summary

Audited three file deletion endpoints:
1. **Soft Delete**: `DELETE /files/:id` - Moves to recycle bin
2. **Permanent Delete**: `DELETE /files/:id/permanent` - Hard delete
3. **Restore**: `POST /files/:id/restore` - Restore from recycle bin

**Status**: ⚠️ **6 Critical Issues Found**

---

## Critical Issues

### 1. **Permanent Delete Bypasses Permission Check** 🔴 CRITICAL
**Location**: `DELETE /files/:id/permanent` (line 1109-1122)
**Severity**: CRITICAL

```javascript
// CURRENT CODE - VULNERABLE
const file = await prisma.storageFile.findFirst({
  where: {
    id: fileId,
    userId  // Only checks ownership, not permission system
  }
});
```

**Issue**:
- Soft delete uses `checkFilePermission()` with 'delete' permission ✅
- Permanent delete only checks `userId` match ❌
- **Inconsistent permission enforcement**

**Impact**:
- Users with 'edit' permission on shared files could potentially exploit this
- Bypasses the permission middleware entirely

**Fix Required**:
```javascript
// Use same permission check as soft delete
const permissionCheck = await checkFilePermission(userId, fileId, 'delete');
if (!permissionCheck.allowed) {
  return reply.status(403).send({
    error: 'Forbidden',
    message: permissionCheck.reason || 'You do not have permission to permanently delete this file. Only file owners can permanently delete files.'
  });
}

const file = permissionCheck.file;

// Also verify file is already soft-deleted (in recycle bin)
if (!file.deletedAt) {
  return reply.status(400).send({
    error: 'Bad Request',
    message: 'File must be in recycle bin before permanent deletion'
  });
}
```

---

### 2. **No Cascade Delete for Related Data** 🔴 CRITICAL
**Location**: `DELETE /files/:id/permanent` (line 1133-1136)
**Severity**: CRITICAL

```javascript
// CURRENT CODE - LEAVES ORPHANED DATA
await prisma.storageFile.delete({
  where: { id: fileId }
});
// Missing: Delete related shares, comments, activities
```

**Impact**:
- Leaves orphaned records in:
  - `FileShare` table
  - `ShareLink` table
  - `FileComment` table
  - `FileActivity` table (if exists)
- Database integrity violations
- Privacy issue: shares remain after file deletion

**Fix Required**:
```javascript
// Delete in transaction to ensure atomicity
await prisma.$transaction(async (tx) => {
  // Delete all shares
  await tx.fileShare.deleteMany({
    where: { fileId }
  });

  // Delete all share links
  await tx.shareLink.deleteMany({
    where: { fileId }
  });

  // Delete all comments
  await tx.fileComment.deleteMany({
    where: { fileId }
  });

  // Delete file
  await tx.storageFile.delete({
    where: { id: fileId }
  });

  logger.info(`✅ File and all related data permanently deleted: ${fileId}`);
});
```

**Alternative**: Use Prisma cascade delete in schema:
```prisma
model StorageFile {
  id String @id
  shares FileShare[] @relation(onDelete: Cascade)
  shareLinks ShareLink[] @relation(onDelete: Cascade)
  comments FileComment[] @relation(onDelete: Cascade)
}
```

---

### 3. **Storage File Deletion Failure Handling** 🟡 HIGH
**Location**: `DELETE /files/:id/permanent` (line 1124-1131)
**Severity**: HIGH

```javascript
// CURRENT CODE - CONTINUES ON FAILURE
try {
  await storageHandler.deleteFile(file.storagePath);
  logger.info(`✅ File deleted from storage: ${file.storagePath}`);
} catch (storageError) {
  logger.warn('⚠️ Failed to delete file from storage (continuing with database delete):', storageError.message);
  // Continue with database delete even if storage delete fails
}
```

**Issue**:
- Database record deleted even if physical file deletion fails
- Creates **orphaned files** in storage (wasted space)
- No way to track or clean up orphaned files

**Severity Assessment**:
- **Medium Risk**: Leads to storage bloat over time
- **High Impact**: Impossible to match files to database after inconsistency

**Recommended Fix**:
```javascript
// Option 1: Fail the operation if storage deletion fails
try {
  await storageHandler.deleteFile(file.storagePath);
  logger.info(`✅ File deleted from storage: ${file.storagePath}`);
} catch (storageError) {
  logger.error('❌ Failed to delete file from storage:', storageError.message);
  return reply.status(500).send({
    error: 'Storage Deletion Failed',
    message: 'Failed to delete physical file. Please try again or contact support.'
  });
}

// Option 2: Create orphaned file tracking for cleanup job
catch (storageError) {
  logger.error('❌ Failed to delete file from storage:', storageError.message);

  // Track orphaned file for cleanup
  await prisma.orphanedFile.create({
    data: {
      storagePath: file.storagePath,
      originalFileId: fileId,
      originalFileName: file.name,
      size: file.size,
      failureReason: storageError.message,
      createdAt: new Date()
    }
  });

  return reply.status(500).send({
    error: 'Storage Deletion Failed',
    message: 'Failed to delete physical file. Our team has been notified.'
  });
}
```

---

### 4. **No Auto-Cleanup of Old Deleted Files** 🟡 HIGH
**Location**: All delete operations
**Severity**: HIGH

**Issue**:
- Soft-deleted files stay in recycle bin forever
- No automatic cleanup after X days
- Database and storage bloat over time

**Recommendation**: Implement cleanup job
```javascript
// Create scheduled job (e.g., daily cron)
// apps/api/jobs/cleanup-deleted-files.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

async function cleanupOldDeletedFiles() {
  const RETENTION_DAYS = 30; // Configurable
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  logger.info(`🗑️ Starting cleanup of files deleted before ${cutoffDate.toISOString()}`);

  try {
    // Find files in recycle bin older than retention period
    const filesToDelete = await prisma.storageFile.findMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
          not: null
        }
      },
      select: {
        id: true,
        storagePath: true,
        name: true,
        userId: true
      }
    });

    logger.info(`Found ${filesToDelete.length} files to permanently delete`);

    let deleted = 0;
    let failed = 0;

    for (const file of filesToDelete) {
      try {
        // Delete from storage
        await storageHandler.deleteFile(file.storagePath);

        // Delete from database (with cascades)
        await prisma.$transaction(async (tx) => {
          await tx.fileShare.deleteMany({ where: { fileId: file.id } });
          await tx.shareLink.deleteMany({ where: { fileId: file.id } });
          await tx.fileComment.deleteMany({ where: { fileId: file.id } });
          await tx.storageFile.delete({ where: { id: file.id } });
        });

        deleted++;
        logger.info(`✅ Permanently deleted old file: ${file.name} (${file.id})`);
      } catch (error) {
        failed++;
        logger.error(`❌ Failed to delete file ${file.id}:`, error);
      }
    }

    logger.info(`✅ Cleanup complete: ${deleted} deleted, ${failed} failed`);
    return { deleted, failed, total: filesToDelete.length };
  } catch (error) {
    logger.error('❌ Cleanup job failed:', error);
    throw error;
  }
}

module.exports = { cleanupOldDeletedFiles };
```

**Schedule in server.js**:
```javascript
// Run cleanup daily at 2 AM
const cron = require('node-cron');
const { cleanupOldDeletedFiles } = require('./jobs/cleanup-deleted-files');

cron.schedule('0 2 * * *', async () => {
  logger.info('🕐 Running daily deleted files cleanup...');
  try {
    await cleanupOldDeletedFiles();
  } catch (error) {
    logger.error('Cleanup job failed:', error);
  }
});
```

---

### 5. **Quota Update Race Condition** 🟡 HIGH
**Location**: `DELETE /files/:id/permanent` (line 1140-1162)
**Severity**: HIGH

```javascript
// CURRENT CODE - POTENTIAL RACE CONDITION
const quota = await prisma.storageQuota.findUnique({
  where: { userId }
});

if (quota) {
  const currentUsed = Number(quota.usedBytes);
  const fileSize = Number(file.size);
  const newUsed = Math.max(0, currentUsed - fileSize);

  await prisma.storageQuota.update({
    where: { userId },
    data: {
      usedBytes: BigInt(newUsed)
    }
  });
}
```

**Issue**:
- Read-then-update pattern creates race condition
- Multiple concurrent deletes can cause incorrect quota
- Quota could become negative or incorrect

**Fix Required**:
```javascript
// Use atomic decrement
await prisma.storageQuota.update({
  where: { userId },
  data: {
    usedBytes: {
      decrement: BigInt(file.size)
    }
  }
});

// Or use transaction with FOR UPDATE lock
await prisma.$executeRaw`
  UPDATE storage_quota
  SET used_bytes = GREATEST(0, used_bytes - ${file.size})
  WHERE user_id = ${userId}
`;
```

---

### 6. **No Confirmation for Permanent Delete** 🟡 MEDIUM
**Location**: `DELETE /files/:id/permanent`
**Severity**: MEDIUM

**Issue**:
- No double-confirmation mechanism
- Easy to accidentally permanently delete files
- No grace period

**Recommendation**:
```javascript
// Option 1: Require confirmation token
const { confirmationToken } = request.body;
const expectedToken = crypto.createHash('sha256')
  .update(`${userId}:${fileId}:delete`)
  .digest('hex')
  .slice(0, 16);

if (confirmationToken !== expectedToken) {
  return reply.status(400).send({
    error: 'Confirmation Required',
    message: 'Permanent deletion requires confirmation token',
    confirmationToken: expectedToken // Return token for client to re-submit
  });
}

// Option 2: Require password re-entry
const { password } = request.body;
if (!password) {
  return reply.status(400).send({
    error: 'Password Required',
    message: 'Please enter your password to confirm permanent deletion'
  });
}

const user = await prisma.user.findUnique({ where: { id: userId } });
const validPassword = await bcrypt.compare(password, user.passwordHash);
if (!validPassword) {
  return reply.status(401).send({
    error: 'Invalid Password',
    message: 'Incorrect password'
  });
}
```

---

## Edge Cases to Handle

### 1. **Restore Already-Restored File**
**Current Behavior**:
```javascript
if (!file.deletedAt) {
  return reply.status(400).send({
    error: 'Bad Request',
    message: 'File is not in recycle bin'
  });
}
```
✅ **Handled correctly**

---

### 2. **Delete File That's Being Uploaded**
**Current Behavior**: No check for upload in progress
**Risk**: Could delete partially uploaded file

**Fix Required**:
```javascript
// Check if file upload is complete
if (file.uploadStatus === 'in_progress') {
  return reply.status(409).send({
    error: 'Conflict',
    message: 'Cannot delete file while upload is in progress'
  });
}
```

---

### 3. **Delete File with Active Shares**
**Current Behavior**: No warning when deleting shared files
**Risk**: Breaks access for shared users

**Recommended Fix**:
```javascript
// Check for active shares before soft delete
const shareCount = await prisma.fileShare.count({
  where: { fileId, expiresAt: { gte: new Date() } }
});

if (shareCount > 0) {
  return reply.status(409).send({
    error: 'File is Shared',
    message: `This file is currently shared with ${shareCount} user(s). Delete anyway?`,
    requiresConfirmation: true,
    shareCount
  });
}
```

---

### 4. **Concurrent Delete Operations**
**Current Behavior**: No locking mechanism
**Risk**: Race conditions between soft/hard delete

**Fix Required**:
```javascript
// Add row-level locking
const file = await prisma.$queryRaw`
  SELECT * FROM storage_files
  WHERE id = ${fileId}
  FOR UPDATE
`;
```

---

### 5. **Delete Non-Existent File**
**Current Behavior**: Returns 404 ✅
**Status**: Handled correctly

---

## Recommended Actions

### Immediate (Critical - Fix Before Release)
1. ✅ Add permission check to permanent delete
2. ✅ Implement cascade delete for related data
3. ✅ Fix quota update race condition

### High Priority (Fix This Sprint)
4. ✅ Improve storage deletion failure handling
5. ✅ Add confirmation mechanism for permanent delete
6. ✅ Check for active shares before delete
7. ✅ Add upload status check

### Medium Priority (Next Sprint)
8. ✅ Implement auto-cleanup job for old deleted files
9. ✅ Add orphaned file tracking and cleanup
10. ✅ Add row-level locking for concurrent operations

---

## Testing Checklist

- [ ] Delete file with active shares
- [ ] Delete file being uploaded
- [ ] Concurrent delete operations
- [ ] Permanent delete without permission
- [ ] Restore file that's not deleted
- [ ] Delete with storage service down
- [ ] Quota update with concurrent operations
- [ ] Cleanup job with 1000+ deleted files

---

## Files to Modify

1. `/apps/api/routes/storage.routes.js` - Fix permission checks and cascade deletes
2. `/apps/api/prisma/schema.prisma` - Add cascade delete relations
3. `/apps/api/jobs/cleanup-deleted-files.js` - NEW: Create cleanup job
4. `/apps/api/server.js` - Schedule cleanup job
5. `/apps/api/utils/storageHandler.js` - Improve error handling

---

**Status**: Critical fixes required before production deployment.
