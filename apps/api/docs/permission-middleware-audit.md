# File Permission Middleware Audit

## Audit Date: 2025-11-11
## File: `/apps/api/utils/filePermissions.js`

---

## Summary

The file permission middleware provides a hierarchical permission system for file access control. Overall implementation is **good**, but found **3 issues** to address.

---

## Permission Hierarchy (As Designed)

```
Permission Levels:
1. view (level 1) - Can view/download
2. comment (level 2) - Can view + comment
3. edit (level 3) - Can view + comment + edit metadata
4. admin (level 4) - Full control (only owner has this)

Action Requirements:
- 'view' action → requires level 1+ (view, comment, edit, admin)
- 'comment' action → requires level 2+ (comment, edit, admin)
- 'edit' action → requires level 3+ (edit, admin)
- 'delete' action → requires level 4 (admin only - owner only)
- 'admin' action → requires level 4 (admin only - owner only)
```

✅ **Permission hierarchy is well-designed**

---

## Issues Found

### 1. **Missing 'download' Action Check** 🟡 MEDIUM
**Location**: Lines 77-83
**Severity**: MEDIUM

**Issue**:
- No explicit 'download' action in hierarchy
- Download operations may not be properly permission-checked
- Assumption that 'view' = 'download', but not explicit

**Current Code**:
```javascript
const actionHierarchy = {
  'view': 1,
  'comment': 2,
  'edit': 3,
  'delete': 4,
  'admin': 4
};
// Missing: 'download' action
```

**Fix Required**:
```javascript
const actionHierarchy = {
  'view': 1,
  'download': 1,  // Same as view
  'comment': 2,
  'edit': 3,
  'delete': 4,
  'admin': 4,
  'share': 4  // Only admin/owner can share
};
```

---

### 2. **No Check for ShareLink Access** 🟡 HIGH
**Location**: Lines 60-65
**Severity**: HIGH

**Issue**:
- Only checks `FileShare` (user-to-user shares)
- **Does NOT check `ShareLink`** (token-based public shares)
- Users with valid share links may be denied access

**Current Code**:
```javascript
// Check if user has a share
const share = file.shares && file.shares.length > 0 ? file.shares[0] : null;

if (!share) {
  return { allowed: false, reason: 'No access to file' };
}
// Missing: Check for ShareLink token access
```

**Fix Required**:
```javascript
/**
 * Updated function signature to accept optional shareToken
 * @param {string} userId - User ID requesting access (can be null for public shares)
 * @param {string} fileId - File ID
 * @param {string} action - Action to check
 * @param {string} shareToken - Optional share link token for public access
 */
async function checkFilePermission(userId, fileId, action, shareToken = null) {
  try {
    // ... existing file fetch code ...

    // File owner has all permissions
    if (userId && file.userId === userId) {
      return { allowed: true, file, permission: 'admin' };
    }

    // Check ShareLink access if token provided
    if (shareToken) {
      const shareLink = await prisma.shareLink.findFirst({
        where: {
          fileId,
          token: shareToken,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      if (shareLink) {
        // Check download limit
        if (shareLink.maxDownloads && shareLink.downloadCount >= shareLink.maxDownloads) {
          return { allowed: false, reason: 'Download limit exceeded for this share link' };
        }

        // Check password if required
        if (shareLink.password && !request.body?.password) {
          return { allowed: false, reason: 'Password required for this share link', requiresPassword: true };
        }

        if (shareLink.password) {
          const bcrypt = require('bcrypt');
          const validPassword = await bcrypt.compare(request.body.password, shareLink.password);
          if (!validPassword) {
            return { allowed: false, reason: 'Invalid password' };
          }
        }

        // ShareLink permission check
        const userLevel = permissionHierarchy[shareLink.permission] || 0;
        const requiredLevel = actionHierarchy[action] || 999;

        if (userLevel >= requiredLevel) {
          return { allowed: true, file, permission: shareLink.permission, viaShareLink: true };
        }
      }
    }

    // Check user-to-user FileShare
    if (userId) {
      const share = file.shares && file.shares.length > 0 ? file.shares[0] : null;

      if (share) {
        const userLevel = permissionHierarchy[share.permission] || 0;
        const requiredLevel = actionHierarchy[action] || 999;

        if (userLevel >= requiredLevel) {
          return { allowed: true, file, permission: share.permission };
        } else {
          return {
            allowed: false,
            reason: `Requires '${action}' permission, but user has '${share.permission}' permission`,
            permission: share.permission
          };
        }
      }
    }

    return { allowed: false, reason: 'No access to file' };
  } catch (error) {
    logger.error('Error checking file permission:', error);
    return { allowed: false, reason: 'Error checking permissions' };
  }
}
```

---

### 3. **Deleted File Access Bypass** 🟢 LOW
**Location**: Lines 50-53
**Severity**: LOW

**Current Code**:
```javascript
// Don't allow access to deleted files (except for owner to restore)
if (file.deletedAt && file.userId !== userId) {
  return { allowed: false, reason: 'File has been deleted' };
}
```

**Issue**:
- Allows owner to access deleted files for ANY action
- Should only allow 'view' and 'restore' on deleted files
- Owner could potentially edit/share deleted files (edge case)

**Fix Required**:
```javascript
// Don't allow access to deleted files
if (file.deletedAt) {
  // Owner can only view or restore deleted files
  if (file.userId === userId) {
    const allowedActionsOnDeleted = ['view', 'restore'];
    if (!allowedActionsOnDeleted.includes(action)) {
      return {
        allowed: false,
        reason: `Cannot '${action}' on deleted file. Only 'view' and 'restore' are allowed.`
      };
    }
  } else {
    // Non-owners cannot access deleted files at all
    return { allowed: false, reason: 'File has been deleted' };
  }
}
```

---

## Edge Cases to Test

### 1. **Multiple Active Shares**
**Current Code**:
```javascript
const share = file.shares && file.shares.length > 0 ? file.shares[0] : null;
```

**Issue**: If a user has multiple shares with different permissions (shouldn't happen, but database allows it), only the first one is checked.

**Recommendation**: Add unique constraint in database or handle multiple shares:
```javascript
// Get highest permission if multiple shares exist
const shares = file.shares || [];
if (shares.length > 1) {
  logger.warn(`User ${userId} has multiple shares for file ${fileId}`);
}

const share = shares.reduce((highest, current) => {
  if (!highest) return current;
  const currentLevel = permissionHierarchy[current.permission] || 0;
  const highestLevel = permissionHierarchy[highest.permission] || 0;
  return currentLevel > highestLevel ? current : highest;
}, null);
```

---

### 2. **Expired Shares**
**Status**: ✅ **Properly Handled**
```javascript
OR: [
  { expiresAt: null },
  { expiresAt: { gt: new Date() } }
]
```
Expired shares are correctly filtered out.

---

### 3. **Invalid Action Parameter**
**Current Code**:
```javascript
const requiredLevel = actionHierarchy[action] || 999;
```

**Status**: ✅ **Safe Fallback**
- Unknown actions default to level 999 (deny all)
- Good defensive programming

---

### 4. **Null/Undefined User ID**
**Issue**: No explicit handling of null/undefined `userId`
**Risk**: Could cause database errors

**Fix Required**:
```javascript
async function checkFilePermission(userId, fileId, action, shareToken = null) {
  // Validate inputs
  if (!fileId) {
    return { allowed: false, reason: 'File ID is required' };
  }

  if (!userId && !shareToken) {
    return { allowed: false, reason: 'Authentication required' };
  }

  if (!action) {
    return { allowed: false, reason: 'Action parameter is required' };
  }

  // ... rest of function
}
```

---

### 5. **Permission Case Sensitivity**
**Current Code**: Assumes exact case match
**Risk**: 'ADMIN' !== 'admin'

**Recommendation**:
```javascript
const userPermission = share.permission.toLowerCase();
const normalizedAction = action.toLowerCase();

const userLevel = permissionHierarchy[userPermission] || 0;
const requiredLevel = actionHierarchy[normalizedAction] || 999;
```

---

## Strengths ✅

1. **Clear Permission Hierarchy** - Easy to understand and maintain
2. **Expiration Handling** - Properly checks share expiration
3. **Owner Override** - Correctly gives owner full permissions
4. **Error Handling** - Catches and logs errors
5. **Detailed Error Messages** - Returns specific reasons for denial
6. **Defensive Default** - Unknown actions denied by default

---

## Recommendations

### Immediate (Fix Before Release)
1. ✅ Add ShareLink token support
2. ✅ Add input validation for null/undefined parameters
3. ✅ Restrict actions on deleted files

### High Priority
4. ✅ Add 'download' and 'share' actions to hierarchy
5. ✅ Handle multiple shares scenario
6. ✅ Add case normalization for permissions

### Medium Priority
7. ✅ Add database unique constraint on (fileId, sharedWith)
8. ✅ Add performance monitoring
9. ✅ Consider caching permission checks (with TTL)

---

## Testing Checklist

- [ ] Owner access to all actions
- [ ] Shared user with 'view' permission
- [ ] Shared user with 'edit' permission
- [ ] Expired share access (should deny)
- [ ] Deleted file access (owner vs non-owner)
- [ ] Unknown action parameter
- [ ] Null userId parameter
- [ ] Share link token access
- [ ] Multiple shares for same user
- [ ] Case sensitivity in permissions

---

## Performance Considerations

**Current Query**:
```javascript
const file = await prisma.storageFile.findUnique({
  where: { id: fileId },
  include: {
    shares: {
      where: {
        sharedWith: userId,
        OR: [...]
      }
    }
  }
});
```

**Optimization**: Consider adding index:
```sql
CREATE INDEX idx_file_shares_user_expiry
ON file_shares(file_id, shared_with, expires_at);
```

---

## Overall Assessment

**Status**: ✅ **GOOD** with minor improvements needed

The permission middleware is well-designed and mostly secure. The main gap is ShareLink support, which is critical for public sharing functionality.

**Priority**: Implement ShareLink support before production release.
