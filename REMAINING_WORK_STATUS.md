# Remaining Work Status

## ✅ COMPLETED

### 1. ✅ Upload Form Fields (REMAIN-001)
**Status:** COMPLETED
**Changes Made:**
- Updated `UploadQueueItem` interface to include `tags` and `expiresAt`
- Updated `uploadFileWithProgress` to send tags and expiresAt in FormData
- Updated `handleUpload` to pass tags and expiresAt to onUpload callback
- Updated `UploadPayload` type in `useFileOperations.ts` to include tags and expiresAt
- Updated `handleUploadFile` in `useFileOperations.ts` to append tags and expiresAt to FormData
- Removed "(Requires backend support)" labels from tags and expiration date fields

**Files Modified:**
- `apps/web/src/components/cloudStorage/UploadModal.tsx`
- `apps/web/src/hooks/useCloudStorage/hooks/useFileOperations.ts`

---

## 🔄 IN PROGRESS

### 2. File ACL System Decision (REMAIN-002)
**Status:** NEEDS DECISION
**Issue:** `fileACL.js` exists but routes use `filePermissions.js` instead
**Options:**
1. **Remove ACL system** - Keep using `filePermissions.js` (simpler)
2. **Integrate ACL system** - Use `fileACL.js` for more granular permissions

**Recommendation:** Remove `fileACL.js` since `filePermissions.js` already handles all permission checks and is integrated throughout the codebase.

---

## 📋 REMAINING TASKS

### 3. File Encryption Setup Documentation (REMAIN-003)
**Status:** PENDING
**Action:** Create documentation for:
- Encryption key generation
- Environment variable setup
- Enabling encryption in production

### 4. Secure Deletion Cloud Storage Limitation (REMAIN-004)
**Status:** PENDING
**Action:** Document that secure deletion (overwrite) only works for local storage, not cloud storage

### 5. Frontend Component Verification (REMAIN-005)
**Status:** PENDING
**Action:** Verify all frontend components are:
- Actually used in the UI
- Properly wired up to backend
- Functional end-to-end

---

## 📊 PROGRESS

**Completed:** 1/5 (20%)
**In Progress:** 1/5 (20%)
**Pending:** 3/5 (60%)

---

## 🎯 NEXT STEPS

1. ✅ Complete upload form fields (DONE)
2. Decide on ACL system (remove or integrate)
3. Create encryption documentation
4. Document secure deletion limitation
5. Verify frontend components

