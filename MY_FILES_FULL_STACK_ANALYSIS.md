# My Files Feature - Complete Full-Stack Analysis & Production TODO Checklist

**Analysis Date:** Fresh analysis based on comprehensive codebase review  
**Purpose:** Exhaustive end-to-end analysis of the My Files feature across frontend, backend, and database layers

---

## EXECUTIVE SUMMARY

This document provides a **complete, exhaustive full-stack analysis** of the "My Files" feature in the RoleReady application. The analysis covers:

- **Frontend**: Components, hooks, state management, API calls, validation, UI/UX
- **Backend**: Endpoints, handlers, business logic, validation, security, error handling
- **Database**: Schema, relationships, constraints, indexes, data integrity
- **Cross-layer**: Data flow tracing, field mappings, gap identification

**Analysis Approach:**
1. Systematic exploration of frontend codebase (React/TypeScript)
2. Comprehensive review of backend routes and business logic (Fastify/Node.js)
3. Database schema analysis (PostgreSQL/Prisma)
4. End-to-end data flow tracing
5. Gap identification and production-readiness assessment

**Key Findings:**
- ✅ **Extensively implemented**: Many production-grade features exist (rate limiting, security scanning, quota management, bulk operations)
- ✅ **GET /api/storage/files/:id endpoint EXISTS** (line 3394 in storage.routes.js) - previously marked as missing
- ⚠️ **Partially implemented**: Some features exist but need consistency (file hash verification, access logging)
- ❌ **Critical gaps**: Share link password hashing, file versioning endpoints, comprehensive testing, API documentation

**Document Structure:**
- Part 1: Detailed analysis by layer (Frontend → Backend → Database → Cross-layer)
- Part 2: Complete production-grade TODO checklist organized by category

---

## KEY FINDINGS FROM FRESH ANALYSIS

### ✅ IMPLEMENTED FEATURES (Previously Marked as Missing)

1. **GET /api/storage/files/:id** - EXISTS (line 3394)
   - Returns complete file metadata with relations
   - Includes folder, shares, comments
   - Frontend should add `getFileById()` method to use this

2. **All Bulk Operations Endpoints** - ALL EXIST
   - `POST /api/storage/files/bulk-delete` (line 3561)
   - `POST /api/storage/files/bulk-restore` (line 3650)
   - `POST /api/storage/files/bulk-move` (line 3786)

3. **Advanced Features** - ALL IMPLEMENTED
   - File duplication endpoint (line 3917)
   - File version history endpoint (line 4075)
   - Storage statistics endpoint (line 4152)
   - Access logs endpoint (line 4269)
   - Thumbnail upload/get endpoints (lines 4346, 4599)
   - File activity timeline endpoint (line 4461)

### ⚠️ FRONTEND-BACKEND GAPS (Backend Exists, Frontend Missing)

**Missing Frontend API Service Methods:**
- `bulkRestoreFiles()` - Backend endpoint exists, frontend should add
- `getFileById()` - Backend endpoint exists, frontend should use instead of filtering list
- `duplicateFile()` - Backend endpoint exists, frontend should add
- `getFileStats()` - Backend endpoint exists, frontend should add
- `getFileAccessLogs()` - Backend endpoint exists, frontend should add
- `uploadThumbnail()` / `getThumbnail()` - Backend endpoints exist, frontend should add
- `getFileActivity()` - Backend endpoint exists, frontend should add

### ❌ CRITICAL SECURITY ISSUES

1. **Share Link Passwords** - Plain text storage
   - Schema: `password String?` (line 676 in schema.prisma)
   - Utilities exist (`hashShareLinkPassword`, `verifyShareLinkPassword`) but not integrated
   - Must hash passwords before storing in database

2. **File Hash Verification** - Inconsistent usage
   - Utilities exist (`verifyFileHash`, `verifyFileIntegrity`)
   - Not consistently called in download endpoint
   - Should verify file integrity on every download

### ⚠️ PARTIALLY IMPLEMENTED

1. **File Versioning** - Schema and GET endpoint exist, but:
   - No POST endpoint to create new versions
   - Version field always set to 1
   - No version comparison UI
   - No rollback capability

2. **Access Logging** - Table and utility exist, but:
   - `logFileAccess` utility not consistently called
   - Should log all file operations (view, download, edit, delete)

---

## PART 1 – FULL-STACK ANALYSIS

### 1. Frontend – End-to-End Analysis (My Files Tab)

#### Components & Architecture

**Main Components:**
- `CloudStorage.tsx` - Main container component
- `RedesignedFileList.tsx` - File list display
- `RedesignedFolderSidebar.tsx` - Folder navigation sidebar
- `RedesignedStorageHeader.tsx` - Storage quota header
- `FileCard.tsx` - Individual file card component
- `UploadModal.tsx` - File upload modal
- `CreateFolderModal.tsx` - Folder creation modal
- `RenameFolderModal.tsx` - Folder rename modal
- `MoveFileModal.tsx` - File move modal
- `CredentialManager.tsx` - Credentials tab component
- `FilePreviewModal.tsx` - File preview modal
- `ShareModal` - File sharing modal (referenced but not found in search)

**Hooks:**
- `useCloudStorage` - Main orchestrator hook
- `useFileOperations` - File CRUD operations
- `useSharingOperations` - File sharing logic
- `useFolderOperations` - Folder management
- `useCredentialOperations` - Credential management
- `useCloudIntegration` - Cloud provider integration (stub)
- `useAccessTracking` - Access logging
- `useFolderModals` - Folder modal state management

**Routes:**
- Accessed via dashboard tab (not a separate route)
- No dedicated route found for `/my-files` or `/storage`

#### UI/UX Elements

**Current UI Features:**
1. **File List View:**
   - Grid view of files
   - Search bar
   - Filter by file type (all, resume, template, backup, cover_letter, transcript, certification, reference, portfolio, work_sample, document)
   - Sort by (name, date, size)
   - Quick filters (starred, archived, shared, recent, public)
   - Select all checkbox
   - Bulk delete action
   - Upload button
   - Recycle bin toggle

2. **File Card Actions:**
   - View/Preview
   - Download
   - Share (with user or link)
   - Delete (soft delete to recycle bin)
   - Restore (from recycle bin)
   - Permanently delete
   - Edit (name, type, description)
   - Star/Unstar
   - Archive/Unarchive
   - Move to folder
   - Add comment
   - View comments

3. **Folder Sidebar:**
   - List of folders
   - Create folder button
   - Rename folder
   - Delete folder
   - Folder file counts
   - Quick filters sidebar

4. **Storage Header:**
   - Storage quota display (used/limit GB, percentage)
   - Refresh button

5. **Upload Modal:**
   - File picker (drag-and-drop mentioned but not fully implemented)
   - Display name input
   - File type selector
   - Upload button
   - Error message display

6. **Credentials Tab:**
   - List of credentials
   - Add credential
   - Update credential
   - Delete credential
   - Generate QR code
   - Expiring credentials reminders

#### Client-Side Validation

**Current Validation:**
1. **File Upload:**
   - File selection required
   - Display name required (falls back to filename)
   - File type selection (dropdown)
   - Basic file extension check in UploadModal (accepts `.pdf,.doc,.docx,.txt`)

2. **File Editing:**
   - Name cannot be empty (backend validation)
   - Type must be valid enum value (backend validation)

3. **Sharing:**
   - Email format check (`userEmail.includes('@')`)
   - File ID required

4. **Folders:**
   - Folder name required (backend validation)

**Missing Validation:**
- File size validation on frontend (only backend)
- File type MIME validation on frontend
- Maximum filename length check
- Dangerous filename characters check
- Upload progress indication
- Duplicate filename detection
- Storage quota check before upload
- File type restrictions per file type category
- Drag-and-drop validation
- Multiple file upload support
- Upload cancellation
- Retry failed uploads

#### API Calls

**All API Endpoints Used:**

1. **GET `/api/storage/files`**
   - Query params: `folderId?`, `includeDeleted?`, `type?`, `search?`
   - Returns: `{ success, files[], storage, count }`
   - Used in: `useFileOperations.loadFilesFromAPI()`

2. **POST `/api/storage/files/upload`**
   - Method: FormData multipart
   - Body: `file`, `displayName?`, `type?`, `folderId?`, `description?`
   - Returns: `{ success, file{}, storage }`
   - Used in: `useFileOperations.handleUploadFile()`

3. **GET `/api/storage/files/:id/download`**
   - Returns: Blob
   - Used in: `useFileOperations.handleDownloadFile()`

4. **PUT `/api/storage/files/:id`**
   - Body: `{ name?, type?, description?, isStarred?, isArchived?, folderId? }`
   - Returns: `{ success, file{} }`
   - Used in: `useFileOperations.handleEditFile()`, `handleStarFile()`, `handleArchiveFile()`

5. **DELETE `/api/storage/files/:id`**
   - Soft delete (sets `deletedAt`)
   - Returns: `{ success, message, file{} }`
   - Used in: `useFileOperations.handleDeleteFile()`

6. **POST `/api/storage/files/:id/restore`**
   - Restores from recycle bin
   - Returns: `{ success, message, file{} }`
   - Used in: `useFileOperations.handleRestoreFile()`

7. **DELETE `/api/storage/files/:id/permanent`**
   - Hard delete
   - Returns: `{ success, message, storage }`
   - Used in: `useFileOperations.handlePermanentlyDeleteFile()`

8. **POST `/api/storage/files/:id/move`**
   - Body: `{ folderId }`
   - Returns: `{ success, message, file{} }`
   - Used in: `useCopyMoveOperations.handleMoveFile()`

9. **POST `/api/storage/files/:id/share`**
   - Body: `{ userEmail, permission, expiresAt?, maxDownloads? }`
   - Returns: `{ success, share{}, emailSent, emailError?, warning? }`
   - Used in: `useSharingOperations.handleShareWithUser()`

10. **POST `/api/storage/files/:id/share-link`**
    - Body: `{ password?, expiresAt?, maxDownloads? }`
    - Returns: `{ success, shareLink{} }`
    - Used in: `useSharingOperations.handleCreateShareLink()`

11. **PUT `/api/storage/shares/:id`**
    - Body: `{ permission }`
    - Returns: `{ success, share{} }`
    - Used in: `useSharingOperations.handleUpdatePermission()`

12. **DELETE `/api/storage/shares/:id`**
    - Returns: `{ success, message }`
    - Used in: `useSharingOperations.handleRemoveShare()`

13. **GET `/api/storage/files/:id/comments`**
    - Returns: `{ success, comments[] }`
    - Used in: (Not directly called, comments loaded with files)

14. **POST `/api/storage/files/:id/comments`**
    - Body: `{ content, parentId? }`
    - Returns: `{ success, comment{} }`
    - Used in: `useSharingOperations.handleAddComment()`

15. **GET `/api/storage/folders`**
    - Returns: `{ success, folders[] }`
    - Used in: `useFolderOperations.loadFolders()`

16. **POST `/api/storage/folders`**
    - Body: `{ name, color? }`
    - Returns: `{ success, folder{} }`
    - Used in: `useFolderOperations.handleCreateFolder()`

17. **PUT `/api/storage/folders/:id`**
    - Body: `{ name?, color? }`
    - Returns: `{ success, folder{} }`
    - Used in: `useFolderOperations.handleRenameFolder()`

18. **DELETE `/api/storage/folders/:id`**
    - Returns: `{ success, message }`
    - Used in: `useFolderOperations.handleDeleteFolder()`

19. **GET `/api/storage/credentials`**
    - Returns: `{ success, credentials[] }`
    - Used in: `useCloudStorage` (credentials loading)

20. **GET `/api/storage/credentials/expiring?days=90`**
    - Returns: `{ success, reminders[] }`
    - Used in: `useCloudStorage` (reminders loading)

21. **POST `/api/storage/credentials`**
    - Body: Credential data
    - Returns: `{ success, credential{} }`
    - Used in: `useCredentialOperations.handleAddCredential()`

22. **PUT `/api/storage/credentials/:id`**
    - Body: Credential updates
    - Returns: `{ success, credential{} }`
    - Used in: `useCredentialOperations.handleUpdateCredential()`

23. **DELETE `/api/storage/credentials/:id`**
    - Returns: `{ success, message }`
    - Used in: `useCredentialOperations.handleDeleteCredential()`

24. **POST `/api/storage/credentials/:id/qr-code`**
    - Returns: `{ success, qrData, message }`
    - Used in: `useCredentialOperations.handleGenerateQRCode()`

25. **GET `/api/storage/quota`**
    - Returns: `{ success, storage{} }`
    - Used in: `useCloudStorage.refreshStorageInfo()`

**Authentication:**
- All requests use `credentials: 'include'` (httpOnly cookies)
- No explicit Authorization header (handled by cookies)

#### Response Handling

**Success Handling:**
- Toast notifications for success (`success()`)
- Optimistic UI updates
- Real-time WebSocket sync
- Automatic refresh after mutations

**Error Handling:**
- Toast notifications for errors (`error()`)
- Error messages from API response
- Fallback to local state updates in some cases
- Logging via `logger.error()`

**Loading States:**
- `isLoading` state in `useFileOperations`
- `isUploading` state in `UploadModal`
- Loading spinner in `LoadingState` component
- No loading indicators for individual file operations

**Empty States:**
- `EmptyFilesState` component exists
- Not consistently used in all views

**Retry Logic:**
- Retry with backoff in `apiService.request()` (3 retries)
- No manual retry UI for failed operations
- No retry for upload failures

#### State Flow

**Upload Flow:**
1. User selects file in `UploadModal`
2. User enters display name and selects type
3. `handleUploadFile()` called with payload
4. FormData created with file and metadata
5. `apiService.uploadStorageFile()` called
6. Optimistic update: file added to local state
7. API response updates local state with server data
8. `loadFilesFromAPI()` called to refresh
9. Toast notification shown
10. Modal closed

**Delete Flow:**
1. User clicks delete on file card
2. `handleDeleteFile(fileId, showDeleted)` called
3. `apiService.deleteCloudFile(fileId)` called
4. Optimistic update: `deletedAt` set in local state
5. API response confirms
6. `loadFilesFromAPI(showDeleted)` called
7. Toast notification shown
8. Real-time event updates other clients

**Share Flow:**
1. User clicks share, enters email and permission
2. `handleShareWithUser(fileId, email, permission)` called
3. Email validation (`userEmail.includes('@')`)
4. `apiService.shareFile()` called
5. Optimistic update: share added to file's `sharedWith` array
6. API response updates with server data
7. Toast notification (with email status)
8. Real-time event updates other clients

#### Fields Shown But Not Sent

- `version` - Always set to 1, never sent to backend
- `owner` - Derived from `userId`, not sent separately
- `lastModified` - Derived from `updatedAt`, not sent
- `size` (formatted string) - Derived from `sizeBytes`, not sent
- `userAvatar` in comments - Always null, not sent
- `thumbnail` - Not implemented, not sent

#### Data Required But Not Collected

- File description in upload modal (field exists but not in UploadModal UI)
- File tags/categories (not in schema)
- File expiration date (not in schema)
- File access permissions beyond sharing (not in schema)
- File versioning metadata (version always 1)
- File checksum verification (fileHash exists but not verified on download)

#### Missing UX Elements

- Upload progress bar/percentage
- Upload cancellation
- Drag-and-drop visual feedback
- Multiple file upload
- Bulk operations progress indicator
- File preview for non-PDF files
- File thumbnail generation
- Keyboard shortcuts documentation
- Loading skeletons (only spinner)
- Error recovery UI (retry buttons)
- Offline mode handling
- Duplicate file detection UI
- File conflict resolution
- Upload queue management
- File size display in upload modal
- Storage quota warning before upload
- Disabled states for buttons during operations
- Duplicate-click protection (debouncing)

---

### 2. Backend – End-to-End Analysis

#### Endpoints & Handlers

**All File-Related Endpoints:**

1. **GET `/api/storage/files`**
   - Handler: `storage.routes.js` (line 37-240)
   - Auth: `authenticate` middleware
   - Query params: `folderId?`, `includeDeleted?`, `type?`, `search?`
   - Response: `{ success, files[], storage, count }`
   - Logic:
     - Gets `userId` from token
     - Builds Prisma where clause with filters
     - Includes: folder, shares (with sharer/recipient), comments (with replies)
     - Formats files for frontend
     - Fetches storage quota
     - Returns formatted response

2. **POST `/api/storage/files/upload`**
   - Handler: `storage.routes.js` (line 264-597)
   - Auth: `authenticate` middleware
   - Content-Type: `multipart/form-data`
   - Body: `file` (File), `displayName?`, `type?`, `folderId?`, `description?`
   - Response: `{ success, file{}, storage }`
   - Logic:
     - Extracts file from multipart form
     - Validates file (size, type, extension, MIME)
     - Checks storage quota
     - Uploads to storage (Supabase or local)
     - Saves metadata to database
     - Updates storage quota
     - Emits real-time event
     - Returns file metadata

3. **GET `/api/storage/files/:id/download`**
   - Handler: `storage.routes.js` (line 1070-1143)
   - Auth: `authenticate` middleware
   - Response: File blob with headers
   - Logic:
     - Checks file permission via `checkFilePermission()`
     - Downloads from storage
     - Increments `downloadCount`
     - Sets Content-Type and Content-Disposition headers
     - Returns file buffer

4. **PUT `/api/storage/files/:id`**
   - Handler: `storage.routes.js` (line 599-721)
   - Auth: `authenticate` middleware
   - Body: `{ name?, type?, description?, isStarred?, isArchived?, folderId? }`
   - Response: `{ success, file{} }`
   - Logic:
     - Validates updates
     - Checks permission via `checkFilePermission(userId, fileId, 'edit')`
     - Updates database
     - Emits real-time event
     - Returns updated file

5. **DELETE `/api/storage/files/:id`** (Soft Delete)
   - Handler: `storage.routes.js` (line 723-779)
   - Auth: `authenticate` middleware
   - Response: `{ success, message, file{} }`
   - Logic:
     - Checks permission via `checkFilePermission(userId, fileId, 'delete')`
     - Sets `deletedAt` timestamp
     - Emits real-time event
     - Returns success

6. **POST `/api/storage/files/:id/restore`**
   - Handler: `storage.routes.js` (line 781-859)
   - Auth: `authenticate` middleware
   - Response: `{ success, message, file{} }`
   - Logic:
     - Verifies file belongs to user
     - Checks `deletedAt` is not null
     - Sets `deletedAt` to null
     - Emits real-time event
     - Returns success

7. **DELETE `/api/storage/files/:id/permanent`**
   - Handler: `storage.routes.js` (line 981-1068)
   - Auth: `authenticate` middleware
   - Response: `{ success, message, storage }`
   - Logic:
     - Verifies file belongs to user
     - Deletes from storage
     - Deletes from database
     - Updates storage quota
     - Returns success

8. **POST `/api/storage/files/:id/move`**
   - Handler: `storage.routes.js` (line 861-979)
   - Auth: `authenticate` middleware
   - Body: `{ folderId }`
   - Response: `{ success, message, file{} }`
   - Logic:
     - Validates folderId (null = root, or existing folder)
     - Verifies folder belongs to user
     - Updates file's `folderId`
     - Emits real-time event
     - Returns success

9. **POST `/api/storage/files/:id/share`**
   - Handler: `storage.routes.js` (line 1145-1436)
   - Auth: `authenticate` middleware
   - Body: `{ userEmail, permission, expiresAt?, maxDownloads? }`
   - Response: `{ success, share{}, emailSent, emailError?, warning? }`
   - Logic:
     - Validates userEmail required
     - Verifies file belongs to user
     - Finds or creates share record
     - If user doesn't exist, creates share link instead
     - Sends email notification
     - Emits real-time event
     - Returns share data

10. **POST `/api/storage/files/:id/share-link`**
    - Handler: `storage.routes.js` (line 1438-1517)
    - Auth: `authenticate` middleware
    - Body: `{ password?, expiresAt?, maxDownloads? }`
    - Response: `{ success, shareLink{} }`
    - Logic:
      - Verifies file belongs to user
      - Generates unique token
      - Creates ShareLink record
      - Returns share link URL

11. **GET `/api/storage/files/:id/comments`**
    - Handler: `storage.routes.js` (line 1519-1620)
    - Auth: `authenticate` middleware
    - Response: `{ success, comments[] }`
    - Logic:
      - Checks file access (owner or shared)
      - Fetches comments with replies
      - Returns formatted comments

12. **POST `/api/storage/files/:id/comments`**
    - Handler: `storage.routes.js` (line 1622-1721)
    - Auth: `authenticate` middleware
    - Body: `{ content, parentId? }`
    - Response: `{ success, comment{} }`
    - Logic:
      - Validates content required
      - Checks permission via `checkFilePermission(userId, fileId, 'comment')`
      - Validates parentId if provided
      - Creates comment
      - Emits real-time event
      - Returns comment

13. **GET `/api/storage/folders`**
    - Handler: `storage.routes.js` (line 1725-1776)
    - Auth: `authenticate` middleware
    - Response: `{ success, folders[] }`
    - Logic:
      - Fetches all folders for user
      - Includes file counts
      - Returns formatted folders

14. **POST `/api/storage/folders`**
    - Handler: `storage.routes.js` (line 1778-1829)
    - Auth: `authenticate` middleware
    - Body: `{ name, color? }`
    - Response: `{ success, folder{} }`
    - Logic:
      - Validates name required
      - Creates folder
      - Returns folder

15. **PUT `/api/storage/folders/:id`**
    - Handler: `storage.routes.js` (line 1831-1892)
    - Auth: `authenticate` middleware
    - Body: `{ name?, color? }`
    - Response: `{ success, folder{} }`
    - Logic:
      - Verifies folder belongs to user
      - Updates folder
      - Returns updated folder

16. **DELETE `/api/storage/folders/:id`**
    - Handler: `storage.routes.js` (line 1894-1955)
    - Auth: `authenticate` middleware
    - Response: `{ success, message }`
    - Logic:
      - Verifies folder belongs to user
      - Moves all files to root (folderId = null)
      - Deletes folder
      - Returns success

17. **GET `/api/storage/credentials`**
    - Handler: `storage.routes.js` (line 1959-2006)
    - Auth: `authenticate` middleware
    - Response: `{ success, credentials[] }`
    - Logic:
      - Fetches all credentials for user
      - Returns formatted credentials

18. **GET `/api/storage/credentials/expiring`**
    - Handler: `storage.routes.js` (line 2008-2060)
    - Auth: `authenticate` middleware
    - Query: `days?` (default 90)
    - Response: `{ success, reminders[] }`
    - Logic:
      - Finds credentials expiring within days
      - Returns formatted reminders

19. **POST `/api/storage/credentials`**
    - Handler: `storage.routes.js` (line 2062-2136)
    - Auth: `authenticate` middleware
    - Body: Credential data
    - Response: `{ success, credential{} }`
    - Logic:
      - Validates required fields (credentialType, name, issuer)
      - Creates credential
      - Returns credential

20. **PUT `/api/storage/credentials/:id`**
    - Handler: `storage.routes.js` (line 2138-2186)
    - Auth: `authenticate` middleware
    - Body: Updates object
    - Response: `{ success, credential{} }`
    - Logic:
      - Verifies credential belongs to user
      - Updates credential
      - Returns updated credential

21. **DELETE `/api/storage/credentials/:id`**
    - Handler: `storage.routes.js` (line 2188-2234)
    - Auth: `authenticate` middleware
    - Response: `{ success, message }`
    - Logic:
      - Verifies credential belongs to user
      - Deletes credential
      - Returns success

22. **POST `/api/storage/credentials/:id/qr-code`**
    - Handler: `storage.routes.js` (line 2236-2291)
    - Auth: `authenticate` middleware
    - Response: `{ success, qrData, message }`
    - Logic:
      - Verifies credential belongs to user
      - Generates QR code data (JSON string, not image)
      - Returns QR data

23. **PUT `/api/storage/shares/:id`**
    - Handler: `storage.routes.js` (line 2293-2411)
    - Auth: `authenticate` middleware
    - Body: `{ permission }`
    - Response: `{ success, share{} }`
    - Logic:
      - Validates permission enum
      - Verifies user owns the file
      - Updates share permission
      - Emits real-time events
      - Returns updated share

24. **DELETE `/api/storage/shares/:id`**
    - Handler: `storage.routes.js` (line 2413-2498)
    - Auth: `authenticate` middleware
    - Response: `{ success, message }`
    - Logic:
      - Verifies user owns the file
      - Deletes share
      - Emits real-time events
      - Returns success

25. **GET `/api/storage/quota`**
    - Handler: `storage.routes.js` (line 2502-2578)
    - Auth: `authenticate` middleware
    - Response: `{ success, storage{} }`
    - Logic:
      - Gets or creates quota record
      - Calculates actual used bytes from files
      - Updates quota if mismatch
      - Returns storage info

26. **GET `/api/storage/shared/:token`** (Public)
    - Handler: `storage.routes.js` (line 2582-2664)
    - Auth: None (public endpoint)
    - Response: `{ success, file{}, share{} }`
    - Logic:
      - Finds share link by token
      - Checks expiration
      - Checks password if required
      - Checks max downloads
      - Returns file info

27. **GET `/api/storage/shared/:token/download`** (Public)
    - Handler: `storage.routes.js` (line 2666-2743)
    - Auth: None (public endpoint)
    - Response: File blob
    - Logic:
      - Validates share link
      - Checks expiration, password, max downloads
      - Increments download count
      - Downloads and returns file

#### Business Logic Details

**File Upload:**
- Validates file size (MAX_FILE_SIZE from env, default 10MB)
- Validates MIME type against whitelist
- Validates file extension
- Sanitizes filename
- Checks storage quota before upload
- Computes SHA-256 hash for resume files
- Uploads to Supabase Storage or local filesystem
- Creates database record
- Updates storage quota
- Emits real-time event

**File Permissions:**
- Uses `checkFilePermission()` utility
- Permissions: 'view', 'comment', 'edit', 'delete', 'admin'
- Owner has all permissions
- Shared users have permissions based on FileShare record
- Expired shares are not checked (should filter by expiresAt)

**Storage Quota:**
- Default limit: 5GB (from env or hardcoded)
- Quota checked before upload
- Quota updated after upload/delete
- Quota recalculated from actual file sizes on GET /quota

**Sharing:**
- If user exists: creates FileShare record
- If user doesn't exist: creates ShareLink and sends email
- Email notifications sent (but failures don't block share)
- Share permissions: view, comment, edit, admin
- Expiration dates supported
- Max downloads supported for share links

**Comments:**
- Threaded comments (parentId support)
- Permission check: user must have 'comment' permission
- Real-time updates via WebSocket

**Folders:**
- Simple flat structure (parentId exists in schema but not used in routes)
- Files moved to root when folder deleted
- Folder file counts calculated on-the-fly

**Credentials:**
- Basic CRUD operations
- Expiration tracking
- QR code generation (data only, not image)
- Linked to files via fileId

#### Validation

**File Upload Validation:**
- File size: MAX_FILE_SIZE (default 10MB)
- MIME types: Whitelist in `storageValidation.js`
- Extensions: Whitelist in `storageValidation.js`
- Filename: Max 255 chars, sanitized
- Dangerous characters: Removed
- Executable files: Blocked

**File Type Validation:**
- Enum: resume, template, backup, cover_letter, transcript, certification, reference, portfolio, work_sample, document
- Validated in `validateFileType()`

**Folder Name Validation:**
- Required, max 100 chars
- Invalid characters checked
- Reserved names checked (Windows)
- Trailing spaces/dots checked

**Missing Validation:**
- Rate limiting per user
- Concurrent upload limits
- File name uniqueness per user
- Folder name uniqueness per user
- Share link token uniqueness (handled by DB unique constraint)
- Email format validation (only checks for '@')
- Permission enum validation in share endpoint
- Expiration date format validation
- Max downloads range validation
- File description length limit
- Comment content length limit
- Folder color format validation

#### Error Handling

**Current Error Handling:**
- Try-catch blocks in all handlers
- Error logging via `logger.error()`
- HTTP status codes: 400, 401, 403, 404, 500
- Error messages in response body
- Stack traces in development mode

**Missing Error Handling:**
- Storage service failures (Supabase timeout, network errors)
- Database connection errors (retry logic)
- File corruption detection
- Partial upload failures
- Quota calculation errors
- Real-time event emission failures
- Email service failures (logged but not handled)
- Concurrent modification conflicts
- File not found in storage but exists in DB
- Storage path validation errors

#### Security

**Current Security:**
- Authentication required (except public share links)
- File ownership checks
- Permission checks via `checkFilePermission()`
- Filename sanitization
- Storage path validation (directory traversal prevention)
- SQL injection prevention (Prisma)
- CORS configured
- CSRF protection configured

**Missing Security:**
- Rate limiting per endpoint
- File size limits per user tier
- MIME type verification (magic bytes, not just extension)
- Virus scanning
- Content scanning for sensitive data
- Share link token entropy check
- Password hashing for share links (currently plain text in schema)
- Audit logging for sensitive operations
- IP-based rate limiting
- File access logging (FileAccessLog exists but not consistently used)
- Input sanitization for XSS in comments/descriptions
- File content validation (PDF structure, etc.)
- Storage quota enforcement (can be bypassed if quota check fails)

#### Missing Endpoints

- `GET /api/storage/files/:id` - Get single file metadata
- `POST /api/storage/files/bulk-delete` - Bulk delete
- `POST /api/storage/files/bulk-restore` - Bulk restore
- `POST /api/storage/files/bulk-move` - Bulk move
- `GET /api/storage/files/:id/versions` - File versioning (not implemented)
- `POST /api/storage/files/:id/duplicate` - Duplicate file
- `GET /api/storage/stats` - Storage statistics
- `GET /api/storage/files/:id/access-logs` - Access logs for file
- `PUT /api/storage/files/:id/thumbnail` - Upload thumbnail
- `GET /api/storage/files/:id/thumbnail` - Get thumbnail

#### Payload Mismatches

**Frontend → Backend:**
- Frontend sends `displayName`, backend expects `displayName` (matches)
- Frontend sends `folderId` as string or null, backend handles both (matches)
- Frontend sends `type` as enum, backend validates enum (matches)
- Frontend sends `description` optionally, backend accepts (matches)
- Frontend sends `isStarred`, backend accepts (matches)
- Frontend sends `isArchived`, backend accepts (matches)
- Frontend sends `userEmail` for sharing, backend expects (matches)
- Frontend sends `permission` as enum, backend validates (matches)
- Frontend sends `expiresAt` as ISO string, backend parses (matches)
- Frontend sends `maxDownloads` as number, backend accepts (matches)

**Backend → Frontend:**
- Backend returns `size` as number, frontend expects and formats (matches)
- Backend returns `deletedAt` as ISO string or null, frontend handles (matches)
- Backend returns `sharedWith` array, frontend expects (matches)
- Backend returns `comments` array, frontend expects (matches)
- Backend returns `storage` object, frontend normalizes (matches)
- Backend returns `fileHash`, frontend doesn't use (not a mismatch, just unused)

---

### 3. Database – End-to-End Analysis

#### Tables/Entities

**StorageFile (storage_files):**
- `id` (String, PK)
- `userId` (String, FK → users.id, indexed)
- `name` (String) - Display name
- `fileName` (String) - Original filename
- `type` (String) - File type enum (indexed)
- `contentType` (String) - MIME type
- `size` (BigInt) - File size in bytes
- `storagePath` (String) - Path in storage
- `publicUrl` (String?) - Public URL
- `fileHash` (String?) - SHA-256 hash (indexed)
- `description` (String?)
- `isPublic` (Boolean, default false)
- `isStarred` (Boolean, default false, indexed)
- `isArchived` (Boolean, default false, indexed)
- `folderId` (String?, FK → storage_folders.id, indexed)
- `deletedAt` (DateTime?, indexed)
- `downloadCount` (Int, default 0)
- `viewCount` (Int, default 0)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**StorageFolder (storage_folders):**
- `id` (String, PK)
- `userId` (String, FK → users.id, indexed)
- `name` (String)
- `parentId` (String?, FK → storage_folders.id, indexed) - Not used in routes
- `color` (String?)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `deletedAt` (DateTime?, indexed)

**FileShare (file_shares):**
- `id` (String, PK)
- `fileId` (String, FK → storage_files.id, indexed)
- `userId` (String, FK → users.id) - User who shared
- `sharedWith` (String, FK → users.id, indexed) - Recipient user ID
- `permission` (String, default "view")
- `expiresAt` (DateTime?)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- Unique constraint: `[fileId, sharedWith]`

**ShareLink (share_links):**
- `id` (String, PK)
- `fileId` (String, FK → storage_files.id, indexed)
- `userId` (String, FK → users.id)
- `token` (String, unique, indexed)
- `password` (String?) - **NOT HASHED** (security issue)
- `permission` (String, default "view")
- `expiresAt` (DateTime?)
- `maxDownloads` (Int?)
- `downloadCount` (Int, default 0)
- `createdAt` (DateTime)

**FileComment (file_comments):**
- `id` (String, PK)
- `fileId` (String, FK → storage_files.id, indexed)
- `userId` (String, FK → users.id)
- `content` (String)
- `parentId` (String?, FK → file_comments.id, indexed)
- `isResolved` (Boolean, default false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**FileAccessLog (file_access_logs):**
- `id` (String, PK)
- `fileId` (String, FK → storage_files.id, indexed)
- `userId` (String, FK → users.id, indexed)
- `action` (String) - view, download, share, edit, delete
- `ipAddress` (String?)
- `userAgent` (String?)
- `createdAt` (DateTime, indexed)

**StorageQuota (storage_quotas):**
- `id` (String, PK)
- `userId` (String, unique, FK → users.id, indexed)
- `usedBytes` (BigInt, default 0)
- `limitBytes` (BigInt, default 5368709120 = 5GB)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Credential (credentials):**
- `id` (String, PK)
- `userId` (String, FK → users.id, indexed)
- `fileId` (String?, FK → storage_files.id, indexed)
- `credentialType` (String, indexed)
- `name` (String)
- `issuer` (String)
- `issuedDate` (String)
- `expirationDate` (String?)
- `credentialId` (String?)
- `verificationUrl` (String?)
- `qrCode` (String?) - Base64 QR code
- `verificationStatus` (String, default "pending", indexed)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**CredentialReminder (credential_reminders):**
- `id` (String, PK)
- `credentialId` (String, FK → credentials.id, indexed)
- `reminderDate` (DateTime, indexed)
- `isSent` (Boolean, default false, indexed)
- `priority` (String, default "medium")
- `createdAt` (DateTime)

#### Relationships

**StorageFile:**
- `user` → User (many-to-one)
- `folder` → StorageFolder (many-to-one, nullable)
- `shares` → FileShare[] (one-to-many)
- `shareLinks` → ShareLink[] (one-to-many)
- `comments` → FileComment[] (one-to-many)
- `accessLogs` → FileAccessLog[] (one-to-many)
- `credentials` → Credential[] (one-to-many)
- `baseResumes` → BaseResume[] (one-to-many)
- `jobAttachments` → JobAttachment[] (one-to-many)

**StorageFolder:**
- `user` → User (many-to-one)
- `parent` → StorageFolder (self-referential, nullable, not used)
- `children` → StorageFolder[] (self-referential, not used)
- `files` → StorageFile[] (one-to-many)

**FileShare:**
- `file` → StorageFile (many-to-one)
- `sharer` → User (many-to-one)
- `recipient` → User (many-to-one)

**ShareLink:**
- `file` → StorageFile (many-to-one)
- `user` → User (many-to-one)

**FileComment:**
- `file` → StorageFile (many-to-one)
- `user` → User (many-to-one)
- `parent` → FileComment (self-referential, nullable)
- `replies` → FileComment[] (self-referential)

#### Constraints & Indexes

**StorageFile:**
- Indexes: userId, folderId, type, deletedAt, isStarred, isArchived, fileHash
- Foreign keys: userId → users.id (CASCADE), folderId → storage_folders.id (SET NULL)
- Missing: Unique constraint on (userId, name) - allows duplicate names
- Missing: Check constraint on size > 0
- Missing: Check constraint on contentType format

**StorageFolder:**
- Indexes: userId, parentId, deletedAt
- Foreign keys: userId → users.id (CASCADE), parentId → storage_folders.id (CASCADE)
- Missing: Unique constraint on (userId, name) - allows duplicate folder names
- Missing: Check constraint preventing parentId = id (self-reference)

**FileShare:**
- Unique constraint: [fileId, sharedWith] - prevents duplicate shares
- Indexes: fileId, sharedWith
- Foreign keys: fileId → storage_files.id (CASCADE), userId → users.id (CASCADE), sharedWith → users.id (CASCADE)
- Missing: Check constraint on permission enum
- Missing: Check constraint on expiresAt > createdAt

**ShareLink:**
- Unique constraint: token
- Indexes: token, fileId
- Foreign keys: fileId → storage_files.id (CASCADE), userId → users.id (CASCADE)
- Missing: Check constraint on permission enum
- Missing: Check constraint on expiresAt > createdAt
- Missing: Check constraint on maxDownloads > 0
- Missing: Check constraint on downloadCount >= 0

**FileComment:**
- Indexes: fileId, parentId
- Foreign keys: fileId → storage_files.id (CASCADE), userId → users.id (CASCADE), parentId → file_comments.id (CASCADE)
- Missing: Check constraint preventing parentId = id (self-reference)
- Missing: Check constraint on content length

**StorageQuota:**
- Unique constraint: userId
- Index: userId
- Foreign key: userId → users.id (CASCADE)
- Missing: Check constraint on usedBytes >= 0
- Missing: Check constraint on limitBytes > 0
- Missing: Check constraint on usedBytes <= limitBytes

#### Data Integrity Issues

1. **Orphaned Files:**
   - If user is deleted, files are CASCADE deleted (good)
   - If folder is deleted, files' folderId is SET NULL (good)
   - But if storage file is deleted from storage but DB record remains, no cleanup

2. **Storage Quota Mismatch:**
   - Quota can be out of sync with actual file sizes
   - GET /quota recalculates, but no background job to keep it in sync
   - If file is deleted from storage but not DB, quota is wrong

3. **Share Expiration:**
   - No automatic cleanup of expired shares
   - No check in permission logic to filter expired shares
   - Share links with expired expiresAt are still accessible if not checked

4. **File Hash:**
   - fileHash computed but not verified on download
   - No integrity check to detect file corruption
   - No duplicate detection based on hash

5. **Folder Hierarchy:**
   - parentId exists but not used in routes
   - No constraint preventing circular references
   - No depth limit

6. **Comment Threading:**
   - No constraint preventing circular parentId references
   - No depth limit for nested comments

7. **Access Logs:**
   - FileAccessLog table exists but not consistently populated
   - No automatic cleanup of old logs
   - No retention policy

#### Missing Fields

1. **StorageFile:**
   - `version` - Version number (always 1, no versioning)
   - `tags` - File tags/categories
   - `expiresAt` - File expiration date
   - `lastAccessedAt` - Last access timestamp
   - `thumbnailPath` - Thumbnail storage path
   - `metadata` - JSON metadata field
   - `checksum` - Additional checksum for verification
   - `uploadedBy` - User who uploaded (if different from owner)
   - `modifiedBy` - User who last modified

2. **StorageFolder:**
   - `description` - Folder description
   - `icon` - Folder icon
   - `sortOrder` - Display order
   - `metadata` - JSON metadata

3. **FileShare:**
   - `notifiedAt` - When email was sent
   - `accessedAt` - When share was first accessed
   - `lastAccessedAt` - Last access timestamp

4. **ShareLink:**
   - `accessedAt` - When link was first accessed
   - `lastAccessedAt` - Last access timestamp
   - `createdBy` - User who created (if different from file owner)

5. **FileComment:**
   - `editedAt` - Edit timestamp
   - `editedBy` - User who edited (if different from creator)
   - `mentions` - JSON array of mentioned user IDs

6. **StorageQuota:**
   - `tier` - Subscription tier (FREE, PRO, PREMIUM)
   - `warnedAt` - When quota warning was sent
   - `upgradedAt` - When tier was upgraded

---

### 4. Cross-Layer Data Flow & Gaps

#### Upload Flow

**Sequence:**
1. User selects file in `UploadModal.tsx`
2. User enters display name, selects type
3. `handleUploadFile()` in `useFileOperations.ts` called
4. FormData created: `file`, `displayName`, `type`, `folderId?`, `description?`
5. `apiService.uploadStorageFile(formData)` called
6. Frontend: File sent via `fetch()` with FormData
7. Backend: `POST /api/storage/files/upload` receives multipart
8. Backend: Extracts file and fields from `request.parts()`
9. Backend: `validateFileUpload()` checks size, type, extension
10. Backend: Checks storage quota
11. Backend: `storageHandler.upload()` uploads to Supabase/local
12. Backend: Creates `StorageFile` record in database
13. Backend: Updates `StorageQuota.usedBytes`
14. Backend: Emits WebSocket event `file_created`
15. Backend: Returns `{ success, file{}, storage }`
16. Frontend: Receives response, updates local state
17. Frontend: Calls `loadFilesFromAPI()` to refresh
18. Frontend: Shows success toast
19. Frontend: Closes modal
20. Frontend: WebSocket listener adds file to list

**Gaps:**
- No upload progress tracking (no XHR with progress events)
- No cancellation support
- No retry on failure
- No duplicate file detection
- Storage quota check happens after file is read into memory (could fail after)
- No file hash verification after upload
- WebSocket event may arrive before API response (race condition)

#### Delete Flow

**Sequence:**
1. User clicks delete in `FileCard.tsx`
2. `handleDeleteFile(fileId, showDeleted)` called
3. `apiService.deleteCloudFile(fileId)` called
4. Backend: `DELETE /api/storage/files/:id` receives request
5. Backend: `checkFilePermission(userId, fileId, 'delete')` checks ownership
6. Backend: Updates `StorageFile.deletedAt = now()`
7. Backend: Emits WebSocket event `file_deleted`
8. Backend: Returns success
9. Frontend: Optimistically updates local state (`deletedAt` set)
10. Frontend: Calls `loadFilesFromAPI(showDeleted)` to refresh
11. Frontend: Shows success toast
12. Frontend: WebSocket listener updates file in list

**Gaps:**
- Storage quota not updated on soft delete (file still counts)
- No confirmation dialog for delete
- No undo functionality
- Permanent delete doesn't verify file exists in storage before deleting
- No cleanup of shares/comments on permanent delete (handled by CASCADE)

#### Share Flow

**Sequence:**
1. User clicks share, enters email in `ShareModal`
2. `handleShareWithUser(fileId, email, permission)` called
3. Frontend: Validates email (`userEmail.includes('@')`)
4. `apiService.shareFile(fileId, { userEmail, permission, expiresAt?, maxDownloads? })` called
5. Backend: `POST /api/storage/files/:id/share` receives request
6. Backend: Validates `userEmail` required
7. Backend: Verifies file belongs to user
8. Backend: Finds user by email
9. Backend: If user exists, creates `FileShare` record
10. Backend: If user doesn't exist, creates `ShareLink` and sends email
11. Backend: Sends email notification (if user exists or for share link)
12. Backend: Emits WebSocket event `file_shared`
13. Backend: Returns `{ success, share{}, emailSent, emailError? }`
14. Frontend: Optimistically updates `file.sharedWith` array
15. Frontend: Shows success toast (with email status)
16. Frontend: WebSocket listener updates file in list

**Gaps:**
- Email validation is weak (only checks for '@')
- No check for duplicate shares (handled by DB unique constraint, but error not handled gracefully)
- Share expiration not checked when accessing file
- Email failures don't block share creation (good) but error handling could be better
- No notification if user tries to share with themselves

#### Download Flow

**Sequence:**
1. User clicks download in `FileCard.tsx`
2. `handleDownloadFile(file, format?)` called
3. `apiService.downloadCloudFile(fileId)` called
4. Backend: `GET /api/storage/files/:id/download` receives request
5. Backend: `checkFilePermission(userId, fileId, 'view')` checks access
6. Backend: `storageHandler.download(storagePath)` downloads from storage
7. Backend: Increments `StorageFile.downloadCount`
8. Backend: Returns file blob with headers
9. Frontend: Receives blob
10. Frontend: Creates object URL, triggers download
11. Frontend: Updates local state (`downloadCount++`)
12. Frontend: Shows success toast

**Gaps:**
- No file hash verification on download
- No access logging (FileAccessLog exists but not used)
- No download progress for large files
- No download cancellation
- Format parameter ignored (frontend sends but backend doesn't use)

#### Field Naming Consistency

**Consistent:**
- `userId` (camelCase) - used consistently
- `fileId` (camelCase) - used consistently
- `folderId` (camelCase) - used consistently
- `deletedAt` (camelCase) - used consistently
- `createdAt` (camelCase) - used consistently
- `updatedAt` (camelCase) - used consistently

**Inconsistent:**
- Database: `snake_case` (Prisma maps to camelCase)
- API: `camelCase` (matches frontend)
- Frontend: `camelCase` (matches API)

**Missing Fields:**
- `version` - Frontend always sets to 1, backend doesn't store
- `owner` - Frontend derives from `userId`, not stored separately
- `lastModified` - Frontend derives from `updatedAt`, not stored separately
- `size` (formatted) - Frontend formats `sizeBytes`, not sent to backend
- `userAvatar` - Always null, not implemented

#### Race Conditions

1. **Concurrent Uploads:**
   - ✅ **FIXED**: Transaction locking for quota updates implemented (`updateQuotaWithLock`)
   - ✅ **FIXED**: Concurrent upload limits enforced per user
   - ⚠️ **PARTIAL**: Still possible for two simultaneous quota checks to both pass before lock, but mitigated with locking

2. **Concurrent Deletes:**
   - ⚠️ **PARTIAL**: Two users deleting same file (if shared) - both succeed but second gets 404
   - ⚠️ **PARTIAL**: No optimistic locking for file updates

3. **Concurrent Shares:**
   - ⚠️ **PARTIAL**: Two shares to same user - second fails with unique constraint error
   - ⚠️ **NEEDS IMPROVEMENT**: Error not handled gracefully in frontend

4. **WebSocket vs API Response:**
   - ⚠️ **PARTIAL**: WebSocket event may arrive before API response
   - ✅ **IMPLEMENTED**: Frontend handles duplicates with version tracking (fileVersionsRef in useCloudStorage)

5. **File Updates:**
   - ⚠️ **PARTIAL**: Multiple users editing file metadata - last write wins
   - ❌ **MISSING**: No conflict resolution (BE-036, BE-058 still pending)

#### Missing Error Recovery

1. **Upload Failures:**
   - ✅ **FIXED**: `executeUploadWithCleanup` handles cleanup if DB save fails (storage + DB transaction)
   - ⚠️ **PARTIAL**: Cleanup job exists but needs verification
   - ✅ **FIXED**: Retry logic exists with exponential backoff

2. **Storage Service Failures:**
   - ✅ **FIXED**: Retry logic with exponential backoff implemented
   - ✅ **FIXED**: Circuit breaker for Supabase Storage implemented
   - ✅ **FIXED**: Storage quota check uses transaction locking

3. **Database Failures:**
   - ✅ **FIXED**: Retry logic with circuit breaker for database connections
   - ✅ **FIXED**: Transaction rollback for multi-step operations via `executeUploadWithCleanup`

4. **Email Failures:**
   - ✅ **FIXED**: `sendEmailWithRetry` utility exists with retry queue
   - ✅ **FIXED**: Share creation doesn't fail if email fails (good design)

---

## PART 2 – COMPLETE PRODUCTION-GRADE TODO CHECKLIST

### 1. Frontend (My Files Tab)

#### Frontend API Service Methods (Backend Endpoints Exist)

- [ ] **FE-000**: Add `bulkRestoreFiles(fileIds: string[])` method to `apiService.ts` (backend endpoint exists at POST /api/storage/files/bulk-restore)
- [ ] **FE-001**: Add `getFileById(fileId: string)` method to `apiService.ts` (backend endpoint exists at GET /api/storage/files/:id) - Use this instead of filtering full file list
- [ ] **FE-002**: Add `duplicateFile(fileId: string)` method to `apiService.ts` (backend endpoint exists at POST /api/storage/files/:id/duplicate)
- [ ] **FE-003**: Add `getFileStats()` method to `apiService.ts` (backend endpoint exists at GET /api/storage/stats)
- [ ] **FE-004**: Add `getFileAccessLogs(fileId: string)` method to `apiService.ts` (backend endpoint exists at GET /api/storage/files/:id/access-logs)
- [ ] **FE-005**: Add `uploadThumbnail(fileId: string, thumbnailBlob: Blob)` method to `apiService.ts` (backend endpoint exists at POST /api/storage/files/:id/thumbnail)
- [ ] **FE-006**: Add `getThumbnail(fileId: string)` method to `apiService.ts` (backend endpoint exists at GET /api/storage/files/:id/thumbnail)
- [ ] **FE-007**: Add `getFileActivity(fileId: string)` method to `apiService.ts` (backend endpoint exists at GET /api/storage/files/:id/activity)

#### UI/UX Fixes and Improvements

- [ ] **FE-001**: Add drag-and-drop upload support with visual feedback (drag-over state, drop zone highlighting) in `UploadModal.tsx` - **ALREADY IMPLEMENTED**
- [ ] **FE-002**: Add upload progress bar showing percentage and speed in `UploadModal.tsx` using XHR or fetch with ReadableStream
- [ ] **FE-003**: Add upload cancellation button and abort controller support in `UploadModal.tsx`
- [ ] **FE-004**: Add multiple file upload support (select multiple files, show queue, upload sequentially or in parallel with concurrency limit) in `UploadModal.tsx`
- [ ] **FE-005**: Add file size display in upload modal before upload starts
- [ ] **FE-006**: Add storage quota warning when approaching limit (e.g., >80%) before upload
- [ ] **FE-007**: Add duplicate file detection UI (show warning if file with same name exists, offer rename or replace)
- [ ] **FE-008**: Add file preview for images, PDFs, and text files in `FilePreviewModal.tsx` (currently only basic preview)
- [ ] **FE-009**: Add thumbnail generation display for image files (show thumbnail in file card)
- [ ] **FE-010**: Add loading skeletons for file list instead of spinner (better UX for slow loads)
- [ ] **FE-011**: Add empty state illustrations and helpful messages for each filter/view state
- [ ] **FE-012**: Add keyboard shortcuts documentation (e.g., 'u' for upload, 'd' for delete, 's' for search)
- [ ] **FE-013**: Add bulk operations progress indicator (show progress for bulk delete/move operations)
- [ ] **FE-014**: Add file conflict resolution UI (when file is modified by another user)
- [ ] **FE-015**: Add upload queue management UI (show pending uploads, retry failed, cancel queued)
- [ ] **FE-016**: Add file description field in upload modal (field exists in API but not in UI)
- [ ] **FE-017**: Add file tags/categories input in upload modal (requires backend support)
- [ ] **FE-018**: Add file expiration date picker in upload modal (requires backend support)
- [ ] **FE-019**: Add file version history UI (requires backend support for versioning)
- [ ] **FE-020**: Add file activity timeline (shows upload, edits, shares, downloads)

#### Form and Input Validation

- [ ] **FE-021**: Add client-side file size validation before upload (check against MAX_FILE_SIZE from env or API)
- [ ] **FE-022**: Add client-side MIME type validation using file.type and magic bytes detection
- [ ] **FE-023**: Add maximum filename length validation (255 chars) in upload modal
- [ ] **FE-024**: Add dangerous filename characters validation and sanitization in upload modal
- [ ] **FE-025**: Add file type restrictions per category (e.g., resume only accepts PDF/DOCX)
- [ ] **FE-026**: Add email format validation using regex in share modal (currently only checks for '@')
- [ ] **FE-027**: Add folder name validation (max 100 chars, invalid characters) in folder modals
- [ ] **FE-028**: Add comment content length validation (max 5000 chars) before submit
- [ ] **FE-029**: Add file description length validation (max 1000 chars) in edit modal
- [ ] **FE-030**: Add storage quota check before upload (call GET /api/storage/quota and compare)

#### Error/Empty/Loading States

- [ ] **FE-031**: Add error recovery UI with retry buttons for failed operations (upload, delete, share)
- [ ] **FE-032**: Add offline mode detection and queue operations for when connection is restored
- [ ] **FE-033**: Add network error handling with user-friendly messages and retry options
- [ ] **FE-034**: Add empty state for each filter combination (no files, no starred files, no shared files, etc.)
- [ ] **FE-035**: Add loading state for individual file operations (show spinner on file card during delete/share)
- [ ] **FE-036**: Add error boundary around CloudStorage component to catch and display errors gracefully
- [ ] **FE-037**: Add timeout handling for long-running operations (upload, download) with user notification
- [ ] **FE-038**: Add partial failure handling for bulk operations (show which files succeeded/failed)

#### State Management Correctness

- [ ] **FE-039**: Fix race condition between WebSocket events and API responses (use version/timestamp to determine latest)
- [ ] **FE-040**: Add optimistic update rollback on API error (revert local state if API call fails)
- [ ] **FE-041**: Add debouncing for search input (wait 300ms before calling API)
- [ ] **FE-042**: Add pagination or virtual scrolling for large file lists (currently loads all files)
- [ ] **FE-043**: Add local storage caching for file list (with TTL) to reduce API calls
- [ ] **FE-044**: Add request deduplication (prevent multiple simultaneous calls to same endpoint)
- [ ] **FE-045**: Fix duplicate file detection in WebSocket listeners (check by ID before adding)
- [ ] **FE-046**: Add state synchronization check (compare local state with server state periodically)

#### Accessibility

- [ ] **FE-047**: Add ARIA labels to all buttons and interactive elements
- [ ] **FE-048**: Add keyboard navigation support (Tab, Enter, Escape, Arrow keys)
- [ ] **FE-049**: Add focus management (focus trap in modals, return focus on close)
- [ ] **FE-050**: Add screen reader announcements for file operations (upload complete, delete successful)
- [ ] **FE-051**: Add keyboard shortcuts (documented in FE-012)
- [ ] **FE-052**: Add file input accessibility (proper label, error messages associated with inputs)
- [ ] **FE-053**: Add color contrast checks for all text and UI elements
- [ ] **FE-054**: Add skip links for main content areas

#### Performance Considerations

- [ ] **FE-055**: Add virtualization for file list (react-window or react-virtualized) for 100+ files
- [ ] **FE-056**: Add memoization for expensive computations (filteredFiles, sortedFiles)
- [ ] **FE-057**: Add code splitting for CloudStorage component (lazy load)
- [ ] **FE-058**: Add image lazy loading for file thumbnails
- [ ] **FE-059**: Add debouncing for folder operations (prevent rapid create/delete)
- [ ] **FE-060**: Add request cancellation for stale requests (abort controller)
- [ ] **FE-061**: Add service worker for offline file caching (if applicable)
- [ ] **FE-062**: Optimize re-renders (use React.memo, useMemo, useCallback where appropriate)

---

### 2. Backend (APIs, Business Logic, Services)

#### Missing Endpoints

- [x] **BE-001**: ✅ **IMPLEMENTED** - `GET /api/storage/files/:id` endpoint exists (line 3394) - Returns single file metadata with all relations. Frontend should add `getFileById()` method.
- [x] **BE-002**: ✅ **IMPLEMENTED** - `POST /api/storage/files/bulk-delete` endpoint exists (line 3561)
- [x] **BE-003**: ✅ **IMPLEMENTED** - `POST /api/storage/files/bulk-restore` endpoint exists (line 3650)
- [x] **BE-004**: ✅ **IMPLEMENTED** - `POST /api/storage/files/bulk-move` endpoint exists (line 3786)
- [x] **BE-005**: ✅ **IMPLEMENTED** - `POST /api/storage/files/:id/duplicate` endpoint exists (line 3917)
- [x] **BE-006**: ✅ **IMPLEMENTED** - `GET /api/storage/files/:id/versions` endpoint exists (line 4075) - However, versioning is not fully implemented (no POST endpoint for creating versions, version always 1)
- [x] **BE-007**: ✅ **IMPLEMENTED** - `GET /api/storage/stats` endpoint exists (line 4152)
- [x] **BE-008**: ✅ **IMPLEMENTED** - `GET /api/storage/files/:id/access-logs` endpoint exists (line 4269)
- [x] **BE-009**: ✅ **IMPLEMENTED** - `POST /api/storage/files/:id/thumbnail` endpoint exists (line 4346)
- [x] **BE-010**: ✅ **IMPLEMENTED** - `GET /api/storage/files/:id/thumbnail` endpoint exists (line 4599)
- [ ] **BE-011**: Add `POST /api/storage/files/:id/versions` endpoint to create new file versions (versioning system not complete)
- [ ] **BE-012**: Add `GET /api/storage/files/:id/activity` endpoint is implemented (line 4461) but frontend method needed

#### Input Validation and Business Rules

- [ ] **BE-011**: Add rate limiting per user for file uploads (max 10 uploads per minute)
- [ ] **BE-012**: Add concurrent upload limit per user (max 3 simultaneous uploads)
- [ ] **BE-013**: Add file name uniqueness check per user (prevent duplicates or require confirmation)
- [ ] **BE-014**: Add folder name uniqueness check per user (prevent duplicates)
- [ ] **BE-015**: Add email format validation using regex in share endpoint (currently only checks for '@')
- [ ] **BE-016**: Add permission enum validation in share endpoints (reject invalid values)
- [ ] **BE-017**: Add expiration date format validation (ISO 8601) and future date check
- [ ] **BE-018**: Add max downloads range validation (must be > 0 if provided)
- [ ] **BE-019**: Add file description length limit (max 1000 chars) in update endpoint
- [ ] **BE-020**: Add comment content length limit (max 5000 chars) in comment endpoint
- [ ] **BE-021**: Add folder color format validation (hex color code)
- [ ] **BE-022**: Add file size limits per subscription tier (FREE: 10MB, PRO: 50MB, PREMIUM: 100MB)
- [ ] **BE-023**: Add total file count limit per user (e.g., FREE: 100 files, PRO: 1000, PREMIUM: unlimited)
- [ ] **BE-024**: Add MIME type verification using magic bytes (not just extension/MIME header)
- [ ] **BE-025**: Add file content validation (PDF structure, DOCX structure, etc.)

#### Error Handling and Consistent Error Response Shapes

- [ ] **BE-026**: Standardize error response format across all endpoints: `{ error, message, code?, details? }`
- [ ] **BE-027**: Add error codes for common scenarios (FILE_NOT_FOUND, PERMISSION_DENIED, QUOTA_EXCEEDED, etc.)
- [ ] **BE-028**: Add retry logic for storage service failures (Supabase timeout, network errors)
- [ ] **BE-029**: Add database connection error handling with retry and circuit breaker
- [ ] **BE-030**: Add transaction rollback for multi-step operations (upload: storage + DB)
- [ ] **BE-031**: Add file corruption detection (verify file hash after download)
- [ ] **BE-032**: Add partial upload failure handling (cleanup storage if DB save fails)
- [ ] **BE-033**: Add quota calculation error handling (fallback to recalculating from files)
- [ ] **BE-034**: Add real-time event emission error handling (log but don't fail request)
- [ ] **BE-035**: Add email service failure handling with retry queue
- [ ] **BE-036**: Add concurrent modification conflict detection (optimistic locking with version field)
- [ ] **BE-037**: Add file not found in storage but exists in DB handling (mark as corrupted, notify user)
- [ ] **BE-038**: Add storage path validation error handling (prevent directory traversal)

#### Security

- [ ] **BE-039**: Add rate limiting per endpoint using `@fastify/rate-limit` (already registered but needs per-route config)
- [ ] **BE-040**: Add file size limits per user tier (enforce in upload endpoint)
- [ ] **BE-041**: Add virus scanning integration (ClamAV or cloud service) for uploaded files
- [ ] **BE-042**: Add content scanning for sensitive data (PII, credit cards, SSN) in file content
- [ ] **BE-043**: Add share link token entropy check (ensure sufficient randomness)
- [ ] **BE-044**: Integrate `hashShareLinkPassword` and `verifyShareLinkPassword` utilities into share link creation/verification endpoints (utilities exist in `shareLinkSecurity.js` but passwords still stored as plain text in database)
- [ ] **BE-045**: Add audit logging for sensitive operations (file delete, share, permission change)
- [ ] **BE-046**: Add IP-based rate limiting for suspicious activity
- [ ] **BE-047**: Consistently log file access in FileAccessLog table (currently not used)
- [ ] **BE-048**: Add input sanitization for XSS in comments and descriptions (sanitize HTML)
- [ ] **BE-049**: Add file content validation to prevent malicious files (PDF exploits, etc.)
- [ ] **BE-050**: Add storage quota enforcement with transaction locking (prevent race conditions)
- [ ] **BE-051**: Add CORS origin validation (verify request origin matches allowed origins)
- [ ] **BE-052**: Add request size limits for multipart uploads (prevent DoS)

#### Idempotency and Concurrency Control

- [ ] **BE-053**: Add idempotency keys for file uploads (prevent duplicate uploads)
- [ ] **BE-054**: Add optimistic locking for file updates (use version field or updatedAt timestamp)
- [ ] **BE-055**: Add transaction locking for storage quota updates (prevent concurrent quota violations)
- [ ] **BE-056**: Add duplicate file detection based on fileHash (offer to reuse existing file)
- [ ] **BE-057**: Add conflict resolution for concurrent shares (handle unique constraint gracefully)
- [ ] **BE-058**: Add file update conflict detection (return 409 Conflict if file was modified)

#### Integration with External Services/Storage

- [ ] **BE-059**: Add timeout handling for Supabase Storage operations (60s default, configurable)
- [ ] **BE-060**: Add retry logic with exponential backoff for Supabase failures
- [ ] **BE-061**: Add circuit breaker for Supabase Storage (stop trying if service is down)
- [ ] **BE-062**: Add fallback to local storage if Supabase is unavailable
- [ ] **BE-063**: Add health check endpoint for storage service
- [ ] **BE-064**: Add monitoring and alerting for storage service failures
- [ ] **BE-065**: Add signed URL generation for private file access (Supabase)
- [ ] **BE-066**: Add CDN integration for public file serving (if applicable)

---

### 3. Database (Schema, Migrations, Data Integrity)

#### Adding Missing Tables, Columns, Indexes, and Constraints

- [ ] **DB-001**: Add `version` column to `StorageFile` table (Int, default 1) for file versioning
- [ ] **DB-002**: Add `tags` column to `StorageFile` table (String[] or JSON) for file categorization
- [ ] **DB-003**: Add `expiresAt` column to `StorageFile` table (DateTime?) for file expiration
- [ ] **DB-004**: Add `lastAccessedAt` column to `StorageFile` table (DateTime?) for access tracking
- [ ] **DB-005**: Add `thumbnailPath` column to `StorageFile` table (String?) for thumbnail storage
- [ ] **DB-006**: Add `metadata` column to `StorageFile` table (JSON) for flexible metadata
- [ ] **DB-007**: Add `uploadedBy` column to `StorageFile` table (String?, FK → users.id) for audit
- [ ] **DB-008**: Add `modifiedBy` column to `StorageFile` table (String?, FK → users.id) for audit
- [ ] **DB-009**: Add unique constraint on `(userId, name)` in `StorageFile` table (or allow duplicates with confirmation)
- [ ] **DB-010**: Add check constraint on `StorageFile.size > 0`
- [ ] **DB-011**: Add check constraint on `StorageFile.contentType` format (basic validation)
- [ ] **DB-012**: Add `description` column to `StorageFolder` table (String?)
- [ ] **DB-013**: Add `icon` column to `StorageFolder` table (String?)
- [ ] **DB-014**: Add `sortOrder` column to `StorageFolder` table (Int, default 0)
- [ ] **DB-015**: Add `metadata` column to `StorageFolder` table (JSON)
- [ ] **DB-016**: Add unique constraint on `(userId, name)` in `StorageFolder` table
- [ ] **DB-017**: Add check constraint preventing `StorageFolder.parentId = id` (self-reference)
- [ ] **DB-018**: Add `notifiedAt` column to `FileShare` table (DateTime?) for email tracking
- [ ] **DB-019**: Add `accessedAt` column to `FileShare` table (DateTime?) for access tracking
- [ ] **DB-020**: Add `lastAccessedAt` column to `FileShare` table (DateTime?) for access tracking
- [ ] **DB-021**: Add check constraint on `FileShare.permission` enum (view, comment, edit, admin)
- [ ] **DB-022**: Add check constraint on `FileShare.expiresAt > createdAt` (if expiresAt is not null)
- [ ] **DB-023**: Add `accessedAt` column to `ShareLink` table (DateTime?) for access tracking
- [ ] **DB-024**: Add `lastAccessedAt` column to `ShareLink` table (DateTime?) for access tracking
- [ ] **DB-025**: Add `createdBy` column to `ShareLink` table (String?, FK → users.id) for audit
- [ ] **DB-026**: Add check constraint on `ShareLink.permission` enum
- [ ] **DB-027**: Add check constraint on `ShareLink.expiresAt > createdAt` (if expiresAt is not null)
- [ ] **DB-028**: Add check constraint on `ShareLink.maxDownloads > 0` (if maxDownloads is not null)
- [ ] **DB-029**: Add check constraint on `ShareLink.downloadCount >= 0`
- [ ] **DB-030**: Add `editedAt` column to `FileComment` table (DateTime?) for edit tracking
- [ ] **DB-031**: Add `editedBy` column to `FileComment` table (String?, FK → users.id) for audit
- [ ] **DB-032**: Add `mentions` column to `FileComment` table (String[] or JSON) for user mentions
- [ ] **DB-033**: Add check constraint preventing `FileComment.parentId = id` (self-reference)
- [ ] **DB-034**: Add check constraint on `FileComment.content` length (max 5000 chars)
- [ ] **DB-035**: Add `tier` column to `StorageQuota` table (Enum: FREE, PRO, PREMIUM) for subscription tracking
- [ ] **DB-036**: Add `warnedAt` column to `StorageQuota` table (DateTime?) for quota warning tracking
- [ ] **DB-037**: Add `upgradedAt` column to `StorageQuota` table (DateTime?) for tier upgrade tracking
- [ ] **DB-038**: Add check constraint on `StorageQuota.usedBytes >= 0`
- [ ] **DB-039**: Add check constraint on `StorageQuota.limitBytes > 0`
- [ ] **DB-040**: Add check constraint on `StorageQuota.usedBytes <= limitBytes` (enforce at application level, not DB)

#### Fixing Mismatches Between ORM Models and Schema

- [ ] **DB-041**: Verify all Prisma model fields match database schema (run `prisma db pull` and compare)
- [ ] **DB-042**: Add missing indexes for frequently queried fields (e.g., `StorageFile.createdAt` for sorting)
- [ ] **DB-043**: Add composite indexes for common query patterns (e.g., `(userId, deletedAt, type)`)
- [ ] **DB-044**: Update Prisma schema to reflect all new columns and constraints

#### Ensuring Referential Integrity, Uniqueness, and Data Consistency

- [ ] **DB-045**: Add database-level foreign key constraints if missing (verify all FKs are enforced)
- [ ] **DB-046**: Add cascade delete rules where appropriate (verify CASCADE vs SET NULL)
- [ ] **DB-047**: Add database triggers or application logic to clean up orphaned files (files in storage but not in DB)
- [ ] **DB-048**: Add database triggers or application logic to sync storage quota with actual file sizes
- [ ] **DB-049**: Add database function or application job to clean up expired shares (set expiresAt to past)
- [ ] **DB-050**: Add database function or application job to clean up expired share links
- [ ] **DB-051**: Add database function or application job to clean up old FileAccessLog entries (retention policy)
- [ ] **DB-052**: Add database constraint or application logic to prevent circular folder references (parentId chain)
- [ ] **DB-053**: Add database constraint or application logic to prevent circular comment references (parentId chain)
- [ ] **DB-054**: Add database function to verify file hash matches stored fileHash (integrity check)

#### Adding Audit Fields

- [ ] **DB-055**: Ensure all tables have `createdAt` and `updatedAt` timestamps (verify all tables)
- [ ] **DB-056**: Add `createdBy` and `updatedBy` fields to all user-modifiable tables (if not present)
- [ ] **DB-057**: Add `deletedAt` soft delete field to all tables that need it (currently only StorageFile and StorageFolder)
- [ ] **DB-058**: Add `deletedBy` field to tables with soft delete (track who deleted)

#### Data Migration Steps

- [ ] **DB-059**: Create migration to add all new columns with default values
- [ ] **DB-060**: Create migration to backfill `fileHash` for existing files (recompute hashes)
- [ ] **DB-061**: Create migration to sync storage quota with actual file sizes
- [ ] **DB-062**: Create migration to clean up orphaned files (files in DB but not in storage)
- [ ] **DB-063**: Create migration to hash existing ShareLink passwords (if any exist)
- [ ] **DB-064**: Create migration to populate `uploadedBy` and `modifiedBy` from `userId` for existing files
- [ ] **DB-065**: Create migration to add indexes for new query patterns

---

### 4. Infrastructure, Deployment & Operations

#### Environment Variables and Secrets

- [ ] **INFRA-001**: Document all required environment variables for My Files feature:
  - `STORAGE_TYPE` (supabase|local)
  - `STORAGE_PATH` (local storage path)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_STORAGE_BUCKET`
  - `MAX_FILE_SIZE` (default 10MB)
  - `DEFAULT_STORAGE_LIMIT` (default 5GB)
  - `FRONTEND_URL` (for share links)
- [ ] **INFRA-002**: Add environment variable validation on server startup (fail fast if missing)
- [ ] **INFRA-003**: Add secrets management for Supabase keys (use AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] **INFRA-004**: Add environment-specific configuration (dev, staging, prod)

#### Background Jobs/Queues

- [ ] **INFRA-005**: Add background job to sync storage quota with actual file sizes (run daily)
- [ ] **INFRA-006**: Add background job to clean up expired shares and share links (run hourly)
- [ ] **INFRA-007**: Add background job to generate thumbnails for image files (async processing)
- [ ] **INFRA-008**: Add background job to scan files for viruses (async processing)
- [ ] **INFRA-009**: Add background job to scan files for sensitive data (async processing)
- [ ] **INFRA-010**: Add background job to clean up orphaned files (files in storage but not in DB)
- [ ] **INFRA-011**: Add background job to clean up old FileAccessLog entries (retention policy)
- [ ] **INFRA-012**: Add background job to send quota warning emails (when >80% used)
- [ ] **INFRA-013**: Add queue system for email notifications (use Bull, BullMQ, or similar)
- [ ] **INFRA-014**: Add retry logic for failed background jobs (exponential backoff)

#### Scaling Considerations

- [ ] **INFRA-015**: Add horizontal scaling support for file uploads (use shared storage, not local filesystem)
- [ ] **INFRA-016**: Add CDN for public file serving (reduce server load)
- [ ] **INFRA-017**: Add database connection pooling configuration (optimize for file operations)
- [ ] **INFRA-018**: Add caching layer for file metadata (Redis) to reduce database load
- [ ] **INFRA-019**: Add load balancing configuration for file download endpoints
- [ ] **INFRA-020**: Add storage quota limits per subscription tier (enforce in application)

#### Observability: Logs, Metrics, and Tracing

- [ ] **INFRA-021**: Add structured logging for all file operations (upload, download, delete, share)
- [ ] **INFRA-022**: Add metrics for file operations (upload count, download count, storage usage, error rates)
- [ ] **INFRA-023**: Add distributed tracing for file operations (OpenTelemetry)
- [ ] **INFRA-024**: Add alerting for storage quota exceeded (>90% used)
- [ ] **INFRA-025**: Add alerting for storage service failures (Supabase downtime)
- [ ] **INFRA-026**: Add alerting for high error rates in file operations
- [ ] **INFRA-027**: Add performance monitoring for file upload/download speeds
- [ ] **INFRA-028**: Add logging for sensitive operations (file delete, share, permission change) without logging file content
- [ ] **INFRA-029**: Add request ID tracking for file operations (correlate logs across services)

---

### 5. Testing & Quality

#### Unit Tests

- [ ] **TEST-001**: Add unit tests for `useFileOperations` hook (upload, delete, restore, download, edit)
- [ ] **TEST-002**: Add unit tests for `useSharingOperations` hook (share, remove share, update permission, add comment)
- [ ] **TEST-003**: Add unit tests for `useFolderOperations` hook (create, rename, delete, move)
- [ ] **TEST-004**: Add unit tests for `useCredentialOperations` hook (CRUD operations)
- [ ] **TEST-005**: Add unit tests for file filtering and sorting logic (`filterAndSortFiles`)
- [ ] **TEST-006**: Add unit tests for storage quota calculation logic
- [ ] **TEST-007**: Add unit tests for file validation logic (`validateFileUpload`)
- [ ] **TEST-008**: Add unit tests for filename sanitization logic
- [ ] **TEST-009**: Add unit tests for file permission checking logic (`checkFilePermission`)
- [ ] **TEST-010**: Add unit tests for storage handler (upload, download, delete)

#### Integration Tests

- [ ] **TEST-011**: Add integration tests for file upload flow (API + DB + Storage)
- [ ] **TEST-012**: Add integration tests for file download flow (API + DB + Storage)
- [ ] **TEST-013**: Add integration tests for file delete flow (soft delete and permanent delete)
- [ ] **TEST-014**: Add integration tests for file restore flow
- [ ] **TEST-015**: Add integration tests for file share flow (with existing user and new user)
- [ ] **TEST-016**: Add integration tests for file move flow
- [ ] **TEST-017**: Add integration tests for folder operations (create, rename, delete)
- [ ] **TEST-018**: Add integration tests for comment operations (add, reply, resolve)
- [ ] **TEST-019**: Add integration tests for storage quota enforcement
- [ ] **TEST-020**: Add integration tests for permission checking (view, comment, edit, delete)
- [ ] **TEST-021**: Add integration tests for share link access (public endpoint)
- [ ] **TEST-022**: Add integration tests for concurrent operations (race conditions)

#### End-to-End Tests

- [ ] **TEST-023**: Add E2E test for complete file upload flow (select file, upload, verify in list)
- [ ] **TEST-024**: Add E2E test for file delete and restore flow
- [ ] **TEST-025**: Add E2E test for file share flow (share with user, verify access)
- [ ] **TEST-026**: Add E2E test for file move to folder flow
- [ ] **TEST-027**: Add E2E test for bulk operations (select multiple, delete)
- [ ] **TEST-028**: Add E2E test for search and filter functionality
- [ ] **TEST-029**: Add E2E test for storage quota display and enforcement
- [ ] **TEST-030**: Add E2E test for credentials management flow

#### Test Data and Fixtures

- [ ] **TEST-031**: Create test fixtures for various file types (PDF, DOCX, images, etc.)
- [ ] **TEST-032**: Create test fixtures for users with different subscription tiers
- [ ] **TEST-033**: Create test fixtures for files with various states (starred, archived, shared, deleted)
- [ ] **TEST-034**: Create test fixtures for folders with files
- [ ] **TEST-035**: Create test fixtures for shares and share links (expired, active, with passwords)
- [ ] **TEST-036**: Create test fixtures for comments (top-level and replies)
- [ ] **TEST-037**: Create load test data (1000+ files per user, 100+ users)

#### Load/Performance Tests

- [ ] **TEST-038**: Add load test for file upload endpoint (100 concurrent uploads)
- [ ] **TEST-039**: Add load test for file list endpoint (1000+ files)
- [ ] **TEST-040**: Add load test for file download endpoint (100 concurrent downloads)
- [ ] **TEST-041**: Add performance test for file search (large dataset)
- [ ] **TEST-042**: Add performance test for storage quota calculation (large dataset)
- [ ] **TEST-043**: Add stress test for storage service (Supabase) under high load

---

### 6. Security, Privacy & Compliance

#### Protecting User File Data

- [ ] **SEC-001**: Encrypt files at rest in storage (Supabase encryption or application-level encryption)
- [ ] **SEC-002**: Encrypt files in transit (HTTPS/TLS)
- [ ] **SEC-003**: Add access control lists (ACLs) for file access (beyond basic sharing)
- [ ] **SEC-004**: Add file access logging for compliance (who accessed what, when)
- [ ] **SEC-005**: Add data retention policies (auto-delete files after expiration)
- [ ] **SEC-006**: Add secure file deletion (overwrite before delete for sensitive files)
- [ ] **SEC-007**: Add PII detection and redaction in file content
- [ ] **SEC-008**: Add file access audit trail (comprehensive logging)

#### Access Control Rules

- [ ] **SEC-009**: Enforce file ownership checks in all endpoints (verify userId matches)
- [ ] **SEC-010**: Enforce share permission checks in all file operations (view, comment, edit, delete)
- [ ] **SEC-011**: Enforce share expiration checks (filter expired shares in permission logic)
- [ ] **SEC-012**: Enforce max downloads limit for share links (check before download)
- [ ] **SEC-013**: Add role-based access control (RBAC) for admin operations
- [ ] **SEC-014**: Add tenant isolation (if multi-tenant) - ensure users can't access other users' files
- [ ] **SEC-015**: Add file access rate limiting per user (prevent abuse)

#### Logging Without Leaking Sensitive Data

- [ ] **SEC-016**: Ensure file content is never logged (only metadata)
- [ ] **SEC-017**: Ensure file paths are sanitized in logs (no sensitive info)
- [ ] **SEC-018**: Ensure user emails are masked in logs (except for admin operations)
- [ ] **SEC-019**: Ensure share link tokens are never logged (only token existence)
- [ ] **SEC-020**: Add log rotation and retention policies

#### Role/Permission Checks

- [ ] **SEC-021**: Add admin role check for file management operations (if applicable)
- [ ] **SEC-022**: Add subscription tier checks for file size limits
- [ ] **SEC-023**: Add subscription tier checks for storage quota limits
- [ ] **SEC-024**: Add subscription tier checks for file count limits
- [ ] **SEC-025**: Add permission escalation prevention (users can't grant permissions they don't have)

---

### 7. Documentation & Developer Experience

#### API Documentation

- [ ] **DOC-001**: Add OpenAPI/Swagger documentation for all file endpoints
- [ ] **DOC-002**: Document request/response schemas for all endpoints
- [ ] **DOC-003**: Document error codes and error response formats
- [ ] **DOC-004**: Document authentication requirements for each endpoint
- [ ] **DOC-005**: Document rate limits for each endpoint
- [ ] **DOC-006**: Add API examples for common use cases (upload, share, download)

#### Data Models and Relationships

- [ ] **DOC-007**: Document database schema for file-related tables
- [ ] **DOC-008**: Document relationships between tables (ER diagram)
- [ ] **DOC-009**: Document file storage structure (Supabase vs local)
- [ ] **DOC-010**: Document file metadata fields and their meanings
- [ ] **DOC-011**: Document sharing and permission model

#### README/CONTRIBUTING Notes

- [ ] **DOC-012**: Add setup instructions for My Files feature (environment variables, storage configuration)
- [ ] **DOC-013**: Add local development setup guide (how to run with local storage)
- [ ] **DOC-014**: Add testing instructions for My Files feature
- [ ] **DOC-015**: Add debugging guide for common issues (upload failures, permission errors)
- [ ] **DOC-016**: Add architecture diagram for My Files feature
- [ ] **DOC-017**: Document WebSocket events for real-time updates

#### UX Documentation

- [ ] **DOC-018**: Document user flows for My Files feature (upload, share, organize)
- [ ] **DOC-019**: Document UI/UX decisions and rationale
- [ ] **DOC-020**: Document accessibility features and keyboard shortcuts
- [ ] **DOC-021**: Create user guide for My Files feature

---

## Summary

This analysis identified **200+ concrete TODO items** across 7 major categories:

1. **Frontend (62 items)**: UI/UX improvements, validation, error handling, accessibility, performance
2. **Backend (66 items)**: Missing endpoints, validation, error handling, security, idempotency, external service integration
3. **Database (65 items)**: Missing columns, constraints, indexes, data integrity, migrations
4. **Infrastructure (29 items)**: Environment variables, background jobs, scaling, observability
5. **Testing (43 items)**: Unit tests, integration tests, E2E tests, test data, load tests
6. **Security (25 items)**: Data protection, access control, logging, role checks
7. **Documentation (21 items)**: API docs, data models, README, UX docs

### Implementation Status

**✅ RESOLVED Critical Issues:**
- ✅ **Storage quota race conditions (BE-050)**: Fixed with `updateQuotaWithLock` transaction locking
- ✅ **Virus scanning (BE-041)**: Implemented with `scanFile` utility
- ✅ **Duplicate file detection (BE-056)**: Implemented with `findDuplicateFile` based on fileHash
- ✅ **Upload progress tracking (FE-002)**: Implemented with XHR progress events in UploadModal
- ✅ **Bulk operations endpoints (BE-002, BE-003, BE-004)**: All three endpoints exist in storage.routes.js
- ✅ **Share expiration checks (DB-049)**: Implemented in `checkFilePermission` with expiration filtering

**⚠️ PARTIALLY RESOLVED:**
- ⚠️ **File hash verification on download (BE-031)**: Utilities exist (`verifyFileHash`, `verifyFileIntegrity`) but not consistently used in download endpoint
- ⚠️ **Access logs not consistently used (BE-047)**: `logFileAccess` utility exists but needs to be called consistently

**❌ REMAINING Critical Issues:**
- ❌ **Share link passwords stored in plain text**: Schema still shows `password String?` without hashing. `hashShareLinkPassword` and `verifyShareLinkPassword` utilities exist in `shareLinkSecurity.js` but are not integrated into share link creation/verification endpoints
- ❌ **File versioning not fully implemented**: Schema has `version Int @default(1)` and `GET /api/storage/files/:id/versions` endpoint exists (line 4075), but no POST endpoint for creating new versions, no version comparison UI, and version field always set to 1
- ✅ **GET /api/storage/files/:id EXISTS** (line 3394 in storage.routes.js) - Returns single file metadata with all relations (folder, shares, comments). Frontend should use this instead of filtering full file list
- ❌ **Comprehensive test coverage**: Most test items still pending - some unit tests exist but integration and E2E tests are minimal
- ❌ **Complete API documentation**: OpenAPI/Swagger documentation missing - endpoints exist but not documented

**🔍 ADDITIONAL FINDINGS FROM FRESH ANALYSIS:**

**Fully Implemented Endpoints:**
- ✅ `GET /api/storage/files/:id` - Single file metadata (EXISTS, line 3394)
- ✅ `POST /api/storage/files/bulk-delete` - Bulk soft delete (EXISTS, line 3561)
- ✅ `POST /api/storage/files/bulk-restore` - Bulk restore (EXISTS, line 3650)
- ✅ `POST /api/storage/files/bulk-move` - Bulk move (EXISTS, line 3786)
- ✅ `POST /api/storage/files/:id/duplicate` - Duplicate file (EXISTS, line 3917)
- ✅ `GET /api/storage/files/:id/versions` - File versions (EXISTS, line 4075)
- ✅ `GET /api/storage/stats` - Storage statistics (EXISTS, line 4152)
- ✅ `GET /api/storage/files/:id/access-logs` - Access logs (EXISTS, line 4269)
- ✅ `POST /api/storage/files/:id/thumbnail` - Upload thumbnail (EXISTS, line 4346)
- ✅ `GET /api/storage/files/:id/thumbnail` - Get thumbnail (EXISTS, line 4599)
- ✅ `GET /api/storage/files/:id/activity` - File activity timeline (EXISTS, line 4461)

**Frontend API Service Coverage:**
- ✅ `bulkDeleteFiles()` - Calls bulk-delete endpoint
- ✅ `bulkMoveFiles()` - Calls bulk-move endpoint
- ❌ **Missing**: `bulkRestoreFiles()` - Endpoint exists but frontend method missing
- ❌ **Missing**: `getFileById()` - Endpoint exists but frontend method missing
- ❌ **Missing**: `duplicateFile()` - Endpoint exists but frontend method missing
- ❌ **Missing**: `getFileVersions()` - Endpoint exists, method exists but may not be used
- ❌ **Missing**: `getFileStats()` - Endpoint exists but frontend method missing
- ❌ **Missing**: `getFileAccessLogs()` - Endpoint exists but frontend method missing
- ❌ **Missing**: `uploadThumbnail()` - Endpoint exists but frontend method missing
- ❌ **Missing**: `getThumbnail()` - Endpoint exists but frontend method missing
- ❌ **Missing**: `getFileActivity()` - Endpoint exists but frontend method missing

**Assumptions Made:**
- Supabase Storage is the primary storage backend (with local fallback) ✅ **Confirmed**
- WebSocket service is implemented and working ✅ **Confirmed** (socketIOServer referenced in routes)
- Email service is implemented and working ✅ **Confirmed** (sendEmailWithRetry utility exists)
- Authentication middleware is working correctly ✅ **Confirmed** (authenticate middleware used)
- Prisma ORM is properly configured ✅ **Confirmed** (schema.prisma exists and is used)
- Frontend uses React with TypeScript ✅ **Confirmed** (TypeScript files and React components)
- Backend uses Fastify with Node.js ✅ **Confirmed** (Fastify routes and server.js)

