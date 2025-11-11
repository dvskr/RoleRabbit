# File Sharing Security Audit & Edge Cases

## Audit Date: 2025-11-11
## Status: **CRITICAL ISSUES FOUND** ⚠️

---

## Executive Summary

Reviewed all file sharing endpoints in `storage.routes.js` for security vulnerabilities and edge case handling. **Found 12 critical issues** that need immediate attention.

---

## Critical Issues Found

### 1. **Email Injection Vulnerability** 🔴 CRITICAL
**Location**: POST `/files/:id/share` (line 1277-1282)
**Issue**: No email validation - allows arbitrary email input
**Risk**: Email header injection, spam relay, phishing

```javascript
// CURRENT CODE - VULNERABLE
const { userEmail, permission = 'view', expiresAt, maxDownloads } = request.body || {};
if (!userEmail) {
  return reply.status(400).send({
    error: 'Bad Request',
    message: 'userEmail is required'
  });
}
// Missing: Email format validation
// Missing: Email domain whitelist check
// Missing: Email injection prevention
```

**Fix Required**:
```javascript
// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(userEmail)) {
  return reply.status(400).send({
    error: 'Bad Request',
    message: 'Invalid email format'
  });
}

// Sanitize email - prevent header injection
const sanitizedEmail = userEmail.toLowerCase().trim();
if (sanitizedEmail.includes('\n') || sanitizedEmail.includes('\r')) {
  return reply.status(400).send({
    error: 'Bad Request',
    message: 'Invalid email address'
  });
}
```

---

### 2. **Permission Enumeration** 🔴 CRITICAL
**Location**: POST `/files/:id/share` (line 1275)
**Issue**: No validation of `permission` parameter
**Risk**: Users can set arbitrary permission levels

```javascript
// CURRENT CODE - VULNERABLE
const { userEmail, permission = 'view', expiresAt, maxDownloads } = request.body || {};
// Missing: Permission whitelist validation
```

**Fix Required**:
```javascript
const validPermissions = ['view', 'edit', 'admin'];
const sanitizedPermission = permission || 'view';

if (!validPermissions.includes(sanitizedPermission)) {
  return reply.status(400).send({
    error: 'Bad Request',
    message: `Invalid permission. Must be one of: ${validPermissions.join(', ')}`
  });
}
```

---

### 3. **Race Condition on Duplicate Shares** 🟡 HIGH
**Location**: POST `/files/:id/share` (line 1315-1332)
**Issue**: No check for existing shares - can create duplicates
**Risk**: Database bloat, inconsistent permissions, confusion

```javascript
// CURRENT CODE - MISSING CHECK
share = await prisma.fileShare.create({
  data: {
    fileId,
    userId,
    sharedWith: sharedUser.id,
    permission,
    expiresAt: expiresAt ? new Date(expiresAt) : null
  },
  // ...
});
// Missing: Check if share already exists
```

**Fix Required**:
```javascript
// Check for existing share
const existingShare = await prisma.fileShare.findFirst({
  where: {
    fileId,
    userId,
    sharedWith: sharedUser.id
  }
});

if (existingShare) {
  // Update existing share instead of creating duplicate
  share = await prisma.fileShare.update({
    where: { id: existingShare.id },
    data: {
      permission: sanitizedPermission,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    },
    include: { /* ... */ }
  });
} else {
  share = await prisma.fileShare.create({ /* ... */ });
}
```

---

### 4. **No Maximum Shares Limit** 🟡 HIGH
**Location**: POST `/files/:id/share`
**Issue**: No limit on shares per file
**Risk**: Resource exhaustion, spam, DOS

**Fix Required**:
```javascript
// Check share count before creating
const shareCount = await prisma.fileShare.count({
  where: { fileId, userId }
});

if (shareCount >= 100) { // Configurable limit
  return reply.status(429).send({
    error: 'Too Many Shares',
    message: 'Maximum share limit reached for this file (100)'
  });
}
```

---

### 5. **XSS in Email HTML** 🔴 CRITICAL
**Location**: POST `/files/:id/share` (lines 1387-1390)
**Issue**: Unescaped user input in email HTML
**Risk**: Cross-site scripting via email

```javascript
// CURRENT CODE - VULNERABLE
const emailHtml = `
  <p><strong>${fileOwner?.name || 'Someone'}</strong> has shared a file with you.</p>
  <div class="file-info">
    <p><strong>File:</strong> ${file.name}</p>
    // ^^ No HTML escaping
```

**Fix Required**:
```javascript
// Add HTML escaping function
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const emailHtml = `
  <p><strong>${escapeHtml(fileOwner?.name || 'Someone')}</strong> has shared a file with you.</p>
  <div class="file-info">
    <p><strong>File:</strong> ${escapeHtml(file.name)}</p>
```

---

### 6. **Invalid Date Handling** 🟡 HIGH
**Location**: POST `/files/:id/share` (line 1321)
**Issue**: No validation of `expiresAt` date format
**Risk**: Invalid dates cause crashes

```javascript
// CURRENT CODE - NO VALIDATION
expiresAt: expiresAt ? new Date(expiresAt) : null
// Missing: Date validation
// Missing: Future date check
```

**Fix Required**:
```javascript
let validatedExpiresAt = null;
if (expiresAt) {
  const expiryDate = new Date(expiresAt);

  // Check if valid date
  if (isNaN(expiryDate.getTime())) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Invalid expiration date format'
    });
  }

  // Check if future date
  if (expiryDate <= new Date()) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Expiration date must be in the future'
    });
  }

  // Check max expiration (e.g., 1 year)
  const maxExpiry = new Date();
  maxExpiry.setFullYear(maxExpiry.getFullYear() + 1);
  if (expiryDate > maxExpiry) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Expiration date cannot be more than 1 year in the future'
    });
  }

  validatedExpiresAt = expiryDate;
}
```

---

### 7. **Share Self-Owned Files** 🟢 LOW
**Location**: POST `/files/:id/share` (line 1277)
**Issue**: Can share file with self
**Risk**: Confusing UX, database bloat

**Fix Required**:
```javascript
// After getting sharedUser
if (sharedUser && sharedUser.id === userId) {
  return reply.status(400).send({
    error: 'Bad Request',
    message: 'Cannot share file with yourself'
  });
}
```

---

### 8. **No Rate Limiting** 🔴 CRITICAL
**Location**: All share endpoints
**Issue**: No rate limiting on share operations
**Risk**: Spam, email bombing, resource exhaustion

**Fix Required**:
```javascript
// Add rate limiter to storage.routes.js
const rateLimit = require('@fastify/rate-limit');

// Register rate limiter for share endpoints
fastify.register(rateLimit, {
  max: 20, // 20 shares
  timeWindow: '15 minutes',
  cache: 10000,
  keyGenerator: (request) => request.user?.userId || request.ip,
  routes: [
    '/api/storage/files/:id/share',
    '/api/storage/files/:id/share-link'
  ]
});
```

---

### 9. **CSRF Token Missing** 🔴 CRITICAL
**Location**: All POST/PUT/DELETE endpoints
**Issue**: No CSRF protection
**Risk**: Cross-site request forgery attacks

**Fix Required**:
```javascript
// Add CSRF protection in server.js
const csrf = require('@fastify/csrf-protection');

fastify.register(csrf, {
  cookieOpts: { signed: true, sameSite: 'strict' },
  sessionPlugin: '@fastify/cookie'
});

// Or use double-submit cookie pattern
// All mutation endpoints should verify CSRF token
```

---

### 10. **Missing Audit Logging** 🟡 HIGH
**Location**: All share operations
**Issue**: No audit trail for file sharing
**Risk**: Cannot track security incidents

**Fix Required**:
```javascript
// Create audit log entry
await prisma.auditLog.create({
  data: {
    userId,
    action: 'FILE_SHARE_CREATED',
    resourceType: 'file',
    resourceId: fileId,
    metadata: {
      sharedWith: userEmail,
      permission,
      expiresAt: expiresAt?.toISOString(),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    },
    timestamp: new Date()
  }
});
```

---

### 11. **Integer Overflow on maxDownloads** 🟡 HIGH
**Location**: POST `/files/:id/share` (line 1350)
**Issue**: No validation of `maxDownloads` value
**Risk**: Integer overflow, negative values, excessive downloads

```javascript
// CURRENT CODE - NO VALIDATION
maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
```

**Fix Required**:
```javascript
let validatedMaxDownloads = null;
if (maxDownloads !== null && maxDownloads !== undefined) {
  const downloads = parseInt(maxDownloads, 10);

  if (isNaN(downloads) || downloads < 1 || downloads > 10000) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'maxDownloads must be between 1 and 10000'
    });
  }

  validatedMaxDownloads = downloads;
}
```

---

### 12. **Token Predictability** 🟡 HIGH
**Location**: POST `/files/:id/share` (line 1339-1340)
**Issue**: Using `crypto.randomBytes(32)` is good, but no verification

**Current Implementation**:
```javascript
const shareToken = crypto.randomBytes(32).toString('hex');
```

**Recommendation**: Add token uniqueness check
```javascript
// Ensure token is unique (very unlikely collision, but safety first)
let shareToken;
let attempts = 0;
do {
  shareToken = crypto.randomBytes(32).toString('hex');
  const exists = await prisma.shareLink.findUnique({
    where: { token: shareToken }
  });
  if (!exists) break;
  attempts++;
} while (attempts < 5);

if (attempts >= 5) {
  throw new Error('Failed to generate unique share token');
}
```

---

## Edge Cases to Handle

### 1. **Shared File Deletion**
- What happens when owner deletes a shared file?
- Should shares be invalidated?
- Current: May cause dangling references

### 2. **Share Expiration**
- Are expired shares cleaned up?
- What happens when accessing expired share?
- Current: No automated cleanup visible

### 3. **Permission Escalation**
- Can recipient re-share with higher permissions?
- Current: Not checked

### 4. **Concurrent Share Updates**
- Multiple users sharing same file simultaneously
- Current: No transaction handling visible

### 5. **Email Service Failure**
- Email fails but share created
- Current: Handled gracefully with warning ✅

---

## Recommendations Priority

### Immediate (Fix in Next Release)
1. ✅ Add email validation and sanitization
2. ✅ Add permission whitelist validation
3. ✅ Fix XSS in email HTML
4. ✅ Add CSRF protection
5. ✅ Add rate limiting

### High Priority (Fix This Sprint)
6. ✅ Add duplicate share checking
7. ✅ Add date validation for expiresAt
8. ✅ Add maxDownloads validation
9. ✅ Add audit logging
10. ✅ Add maximum shares limit

### Medium Priority (Next Sprint)
11. ✅ Prevent self-sharing
12. ✅ Add token uniqueness verification
13. ✅ Implement share cleanup job for expired shares
14. ✅ Add share permission cascade rules

---

## Testing Recommendations

1. **Penetration Testing**
   - Email injection attempts
   - XSS payloads in file names
   - CSRF attacks
   - Rate limit bypass attempts

2. **Edge Case Testing**
   - Share with invalid emails
   - Share with expired dates
   - Share with negative maxDownloads
   - Concurrent share operations
   - Delete file with active shares

3. **Load Testing**
   - 100+ shares per file
   - 1000+ share operations per minute
   - Email service failure scenarios

---

## Files to Modify

1. `/apps/api/routes/storage.routes.js` - Add validation and security checks
2. `/apps/api/utils/validation.js` - Create validation utilities
3. `/apps/api/utils/emailService.js` - Add HTML escaping
4. `/apps/api/server.js` - Add CSRF and rate limiting
5. `/apps/api/prisma/schema.prisma` - Add audit log model (if missing)

---

**Next Steps**: Implement critical fixes before PR merge.
