# Storage (My Files) - Full Stack Implementation Plan

## Overview
This document outlines the comprehensive implementation plan to make the Storage/My Files feature 100% full stack and production-ready with all UI buttons and features fully functional.

## Current State Analysis

### ✅ Already Implemented
1. **Database Schema**
   - CloudFile model with all necessary fields
   - CloudFolder model with nested folder support
   - FileShare model for sharing permissions
   - Soft delete (recycle bin) support

2. **Backend Routes**
   - File CRUD operations (`/api/cloud-files`)
   - Folder CRUD operations (`/api/folders`)
   - File sharing endpoints (`/api/files/:id/shares`)
   - Basic file upload endpoint (`/api/files/upload`)

3. **Frontend UI**
   - Complete CloudStorage component with all buttons
   - File card with actions (star, archive, share, download, edit, delete)
   - Folder sidebar and management
   - Upload modal
   - Share modal
   - Comments modal (UI only)
   - Storage info display
   - Filtering and sorting
   - Multiple view modes (grid, list, compact)

### ❌ Missing/Incomplete Features

1. **File Upload**
   - Current: Only saves JSON/text data
   - Needed: Binary file upload with proper storage
   - Missing: File size validation against quota
   - Missing: File type validation enhancement

2. **File Download**
   - Current: Not implemented
   - Needed: Download files in original format
   - Needed: Download as PDF/DOC conversion
   - Needed: Track download count

3. **File Comments**
   - Current: UI exists but no backend
   - Needed: Comments model/table
   - Needed: CRUD endpoints for comments
   - Needed: Comment notifications

4. **Storage Quota Management**
   - Current: Hardcoded values
   - Needed: Calculate actual storage used
   - Needed: User storage limits (tier-based)
   - Needed: Quota enforcement on upload
   - Needed: Storage analytics

5. **File Sharing**
   - Current: Basic sharing with users
   - Missing: Share link generation with tokens
   - Missing: Share link expiration
   - Missing: Public file access without login
   - Missing: Share link analytics

6. **File Operations**
   - Missing: Move file to folder
   - Missing: Copy/duplicate file
   - Missing: Bulk operations (move, copy, delete)
   - Missing: File versioning

7. **File Preview/View**
   - Missing: File preview (PDF, images, text)
   - Missing: In-browser viewing
   - Missing: Thumbnail generation

8. **Search & Filtering**
   - Current: Basic frontend filtering
   - Needed: Backend search with indexing
   - Needed: Full-text search
   - Needed: Advanced filters (date range, size range)

9. **File Metadata**
   - Missing: File edit history/versioning
   - Missing: Access logs
   - Missing: File tags management backend

10. **Error Handling & Validation**
    - Missing: Comprehensive error messages
    - Missing: File validation middleware
    - Missing: Storage quota exceeded handling

---

## Implementation Plan

### Phase 1: Core File Operations (Priority: CRITICAL)

#### 1.1 Real File Upload & Storage
**Backend Tasks:**
- [ ] Enhance `/api/files/upload` endpoint to handle multipart/form-data properly
- [ ] Implement file storage strategy (choose: S3, local filesystem, or database)
- [ ] Add file validation middleware (size, type, virus scanning)
- [ ] Implement storage quota check before upload
- [ ] Store file metadata separately from file content
- [ ] Add file upload progress tracking

**Frontend Tasks:**
- [ ] Update UploadModal to handle actual file selection
- [ ] Implement drag-and-drop file upload
- [ ] Add file upload progress indicator
- [ ] Add file size validation before upload
- [ ] Show quota warnings when approaching limit

**Files to Modify:**
- `apps/api/routes/files.routes.js`
- `apps/api/utils/fileUpload.js`
- `apps/api/utils/storageQuota.js` (NEW)
- `apps/web/src/components/cloudStorage/UploadModal.tsx`
- `apps/web/src/hooks/useCloudStorage/hooks/useFileOperations.ts`

**Database Changes:**
- Consider adding `storagePath` field to CloudFile if using filesystem
- Add `storageUsed` and `storageLimit` to User model

#### 1.2 File Download Implementation
**Backend Tasks:**
- [ ] Create `/api/files/:id/download` endpoint
- [ ] Implement file streaming for large files
- [ ] Add download format conversion (PDF, DOC)
- [ ] Track download count and access logs
- [ ] Implement download permissions check

**Frontend Tasks:**
- [ ] Connect download button to API
- [ ] Implement download progress
- [ ] Add download format selection modal
- [ ] Handle download errors gracefully

**Files to Modify:**
- `apps/api/routes/files.routes.js`
- `apps/api/utils/fileDownload.js` (NEW)
- `apps/web/src/utils/fileDownload.ts`
- `apps/web/src/hooks/useCloudStorage/hooks/useFileOperations.ts`

#### 1.3 Storage Quota Management
**Backend Tasks:**
- [ ] Create `storageQuota.js` utility
- [ ] Calculate total storage used by user
- [ ] Implement storage limit per user tier
- [ ] Add quota check middleware
- [ ] Create `/api/storage/quota` endpoint
- [ ] Auto-update User.storageUsed on file operations

**Frontend Tasks:**
- [ ] Fetch real storage quota from API
- [ ] Display storage usage accurately
- [ ] Show warnings at 80%, 90%, 100%
- [ ] Prevent uploads when quota exceeded

**Files to Create:**
- `apps/api/utils/storageQuota.js`
- `apps/api/routes/storage.routes.js` (NEW)

**Files to Modify:**
- `apps/api/prisma/schema.prisma` (add storage fields to User)
- `apps/web/src/hooks/useCloudStorage.ts`
- `apps/web/src/components/cloudStorage/StorageHeader.tsx`

---

### Phase 2: File Sharing & Collaboration (Priority: HIGH)

#### 2.1 Enhanced File Sharing
**Backend Tasks:**
- [ ] Implement share link generation with unique tokens
- [ ] Add share link expiration dates
- [ ] Create public file access endpoint (no auth required)
- [ ] Add share link analytics (views, downloads)
- [ ] Implement share permission validation middleware

**Frontend Tasks:**
- [ ] Add "Create Share Link" button functionality
- [ ] Display share links with expiration
- [ ] Add copy share link to clipboard
- [ ] Show share link analytics

**Files to Modify:**
- `apps/api/routes/files.routes.js`
- `apps/api/utils/fileShares.js`
- `apps/web/src/components/cloudStorage/fileCard/components/ShareModal.tsx`
- `apps/web/src/hooks/useCloudStorage/hooks/useSharingOperations.ts`

**Database Changes:**
- Add `shareToken` field to FileShare (or create separate ShareLink model)
- Add `expiresAt` to FileShare
- Add `viewCount`, `downloadCount` to FileShare

#### 2.2 File Comments System
**Backend Tasks:**
- [ ] Create FileComment model in Prisma schema
- [ ] Create comment CRUD endpoints
- [ ] Implement comment notifications
- [ ] Add comment replies support
- [ ] Add comment reactions (optional)

**Frontend Tasks:**
- [ ] Connect comments UI to backend
- [ ] Implement real-time comment updates (optional: WebSocket)
- [ ] Add comment notifications
- [ ] Implement comment editing/deletion

**Files to Create:**
- `apps/api/utils/fileComments.js`
- `apps/api/routes/comments.routes.js` (NEW)

**Files to Modify:**
- `apps/api/prisma/schema.prisma` (add FileComment model)
- `apps/web/src/components/cloudStorage/fileCard/components/CommentsModal.tsx`
- `apps/web/src/hooks/useCloudStorage/hooks/useSharingOperations.ts`

**Database Changes:**
- Create FileComment model:
  ```prisma
  model FileComment {
    id        String   @id @default(cuid())
    fileId    String
    userId    String
    content   String
    parentId  String?  // For replies
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    file      CloudFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    parent    FileComment? @relation("CommentReplies", fields: [parentId], references: [id])
    replies   FileComment[] @relation("CommentReplies")
  }
  ```

---

### Phase 3: File Management Features (Priority: HIGH)

#### 3.1 File Move & Copy Operations
**Backend Tasks:**
- [ ] Add `/api/files/:id/move` endpoint
- [ ] Add `/api/files/:id/copy` endpoint
- [ ] Implement bulk move/copy operations
- [ ] Validate folder permissions

**Frontend Tasks:**
- [ ] Add "Move to Folder" dropdown/modal
- [ ] Add "Copy" button functionality
- [ ] Implement bulk selection move/copy
- [ ] Add drag-and-drop to folders

**Files to Modify:**
- `apps/api/routes/files.routes.js`
- `apps/api/utils/cloudFiles.js`
- `apps/web/src/components/cloudStorage/FileCard.tsx`
- `apps/web/src/components/cloudStorage/FolderSidebar.tsx`

#### 3.2 File Versioning
**Backend Tasks:**
- [ ] Create FileVersion model
- [ ] Implement version creation on file update
- [ ] Add version restore endpoint
- [ ] Store version metadata

**Frontend Tasks:**
- [ ] Add version history view
- [ ] Add "Restore Version" functionality
- [ ] Display version information

**Files to Create:**
- `apps/api/utils/fileVersions.js`

**Files to Modify:**
- `apps/api/prisma/schema.prisma` (add FileVersion model)
- `apps/web/src/components/cloudStorage/FileCard.tsx`

**Database Changes:**
- Create FileVersion model:
  ```prisma
  model FileVersion {
    id          String    @id @default(cuid())
    fileId      String
    version     Int
    data        String
    size        Int
    createdAt   DateTime  @default(now())
    createdBy   String
    file        CloudFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  }
  ```

#### 3.3 Bulk Operations
**Backend Tasks:**
- [ ] Add bulk delete endpoint
- [ ] Add bulk move endpoint
- [ ] Add bulk copy endpoint
- [ ] Add bulk share endpoint
- [ ] Implement transaction handling for bulk ops

**Frontend Tasks:**
- [ ] Enhance bulk selection UI
- [ ] Add bulk action toolbar
- [ ] Show bulk operation progress
- [ ] Handle bulk operation errors

**Files to Modify:**
- `apps/api/routes/files.routes.js`
- `apps/web/src/components/cloudStorage/StorageHeader.tsx`
- `apps/web/src/hooks/useCloudStorage/hooks/useFileOperations.ts`

---

### Phase 4: File Preview & Viewing (Priority: MEDIUM)

#### 4.1 File Preview System
**Backend Tasks:**
- [ ] Create `/api/files/:id/preview` endpoint
- [ ] Implement PDF preview generation
- [ ] Implement image thumbnail generation
- [ ] Add text file preview
- [ ] Cache previews for performance

**Frontend Tasks:**
- [ ] Add file preview modal
- [ ] Implement PDF viewer
- [ ] Implement image viewer
- [ ] Add text file viewer
- [ ] Add preview button to file cards

**Files to Create:**
- `apps/api/utils/filePreview.js`
- `apps/web/src/components/cloudStorage/FilePreview.tsx` (NEW)

**Files to Modify:**
- `apps/api/routes/files.routes.js`
- `apps/web/src/components/cloudStorage/FileCard.tsx`

---

### Phase 5: Search & Filtering (Priority: MEDIUM)

#### 5.1 Advanced Search
**Backend Tasks:**
- [ ] Implement full-text search with Prisma
- [ ] Add search indexing (consider Elasticsearch for scale)
- [ ] Add search filters (date, size, type, tags)
- [ ] Add search result ranking

**Frontend Tasks:**
- [ ] Enhance search bar with filters
- [ ] Add search suggestions
- [ ] Show search results count
- [ ] Highlight search terms

**Files to Modify:**
- `apps/api/routes/files.routes.js`
- `apps/api/utils/fileSearch.js` (NEW)
- `apps/web/src/components/cloudStorage/StorageFilters.tsx`

---

### Phase 6: File Metadata & Analytics (Priority: LOW)

#### 6.1 File Access Logging
**Backend Tasks:**
- [ ] Create FileAccessLog model
- [ ] Log file views, downloads, edits
- [ ] Create access analytics endpoint
- [ ] Add file activity timeline

**Frontend Tasks:**
- [ ] Display file activity in file details
- [ ] Show "Recent Activity" section
- [ ] Add file analytics dashboard

**Files to Create:**
- `apps/api/utils/fileAnalytics.js`

**Database Changes:**
- Create FileAccessLog model:
  ```prisma
  model FileAccessLog {
    id        String    @id @default(cuid())
    fileId    String
    userId    String?
    action    String    // view, download, edit, share
    ipAddress String?
    userAgent String?
    createdAt DateTime  @default(now())
    file      CloudFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  }
  ```

#### 6.2 File Tags Management
**Backend Tasks:**
- [ ] Enhance tags system
- [ ] Add tag suggestions
- [ ] Implement tag-based filtering
- [ ] Add tag analytics

**Frontend Tasks:**
- [ ] Add tag autocomplete
- [ ] Show popular tags
- [ ] Add tag management UI

---

### Phase 7: Error Handling & Validation (Priority: CRITICAL)

#### 7.1 Comprehensive Error Handling
**Backend Tasks:**
- [ ] Add validation middleware for all endpoints
- [ ] Implement consistent error response format
- [ ] Add error logging
- [ ] Create error handling utilities

**Frontend Tasks:**
- [ ] Add user-friendly error messages
- [ ] Implement error retry logic
- [ ] Add error notifications
- [ ] Handle network errors gracefully

**Files to Create:**
- `apps/api/middleware/fileValidation.js` (NEW)
- `apps/api/utils/errorHandler.js` (NEW)

#### 7.2 File Validation
**Backend Tasks:**
- [ ] Validate file types
- [ ] Validate file sizes
- [ ] Add virus scanning (optional)
- [ ] Validate file names
- [ ] Sanitize file content

**Files to Modify:**
- `apps/api/utils/fileValidators.js`
- `apps/api/middleware/fileValidation.js` (NEW)

---

## Implementation Priority Matrix

### Critical (Must Have for Production)
1. ✅ Real file upload & storage
2. ✅ File download functionality
3. ✅ Storage quota management
4. ✅ Error handling & validation
5. ✅ File move/copy operations

### High Priority (Should Have)
6. ✅ Enhanced file sharing with links
7. ✅ File comments system
8. ✅ Bulk operations
9. ✅ File versioning

### Medium Priority (Nice to Have)
10. ✅ File preview system
11. ✅ Advanced search
12. ✅ File access logging

### Low Priority (Future Enhancements)
13. ✅ File analytics dashboard
14. ✅ Tag management enhancements
15. ✅ Real-time collaboration features

---

## Technical Decisions Needed

### 1. File Storage Strategy
**Options:**
- **Local Filesystem**: Simple, but doesn't scale
- **Database (Base64)**: Works but inefficient for large files
- **Cloud Storage (S3/GCS)**: Scalable, production-ready
- **Hybrid**: Small files in DB, large files in cloud

**Recommendation**: Start with local filesystem, migrate to S3 for production

### 2. File Size Limits
- Default: 10MB per file
- Max: 100MB per file (configurable)
- Storage quota: 100GB per user (tier-based)

### 3. File Types Supported
- Documents: PDF, DOC, DOCX, TXT, RTF
- Images: JPG, PNG, GIF, WEBP
- Spreadsheets: XLS, XLSX, CSV
- Presentations: PPT, PPTX

### 4. Authentication for Shared Files
- Public links: No auth required
- Private shares: Require login
- Expiration: Configurable (default: 30 days)

---

## Testing Requirements

### Unit Tests
- [ ] File upload validation
- [ ] Storage quota calculation
- [ ] File sharing logic
- [ ] Comment CRUD operations

### Integration Tests
- [ ] File upload → download flow
- [ ] File move between folders
- [ ] Share link generation and access
- [ ] Bulk operations

### E2E Tests
- [ ] Complete file lifecycle (upload → share → download → delete)
- [ ] Storage quota enforcement
- [ ] File comments workflow
- [ ] Folder management workflow

---

## Security Considerations

1. **File Upload Security**
   - Validate file types
   - Scan for malware (future)
   - Limit file sizes
   - Sanitize file names

2. **Access Control**
   - Verify ownership before operations
   - Validate share permissions
   - Enforce quota limits
   - Audit file access

3. **Data Protection**
   - Encrypt files at rest (future)
   - Secure file transfer (HTTPS)
   - Protect share links
   - Implement rate limiting

---

## Performance Optimizations

1. **File Storage**
   - Implement file caching
   - Use CDN for public files
   - Compress large files
   - Lazy load file previews

2. **Database**
   - Index frequently queried fields
   - Paginate file listings
   - Cache storage quota calculations
   - Optimize search queries

3. **Frontend**
   - Virtual scrolling for large file lists
   - Lazy load file cards
   - Debounce search input
   - Cache file metadata

---

## Migration Plan

### Step 1: Database Migrations
- Add storage fields to User model
- Create FileComment model
- Create FileVersion model (optional)
- Create FileAccessLog model (optional)

### Step 2: Backend Implementation
- Implement file upload/download
- Add storage quota management
- Implement comments system
- Add file move/copy operations

### Step 3: Frontend Integration
- Connect all UI buttons to backend
- Update file operations hooks
- Add error handling
- Implement loading states

### Step 4: Testing & Validation
- Test all features end-to-end
- Validate error handling
- Performance testing
- Security audit

### Step 5: Deployment
- Deploy to staging
- User acceptance testing
- Deploy to production
- Monitor and fix issues

---

## Success Criteria

✅ **Phase 1 Complete When:**
- Users can upload real files (not just JSON)
- Users can download files in original format
- Storage quota is accurately tracked and enforced
- All file CRUD operations work end-to-end

✅ **Phase 2 Complete When:**
- Users can share files via links
- Users can add comments to files
- Share links have expiration dates
- Comments persist and display correctly

✅ **Phase 3 Complete When:**
- Users can move files between folders
- Users can copy/duplicate files
- Bulk operations work correctly
- File versioning is functional

✅ **Production Ready When:**
- All UI buttons are functional
- Error handling is comprehensive
- Performance is acceptable (<2s load times)
- Security measures are in place
- Storage quota is enforced
- File sharing works as expected

---

## Estimated Timeline

- **Phase 1**: 2-3 weeks
- **Phase 2**: 1-2 weeks
- **Phase 3**: 1-2 weeks
- **Phase 4**: 1 week
- **Phase 5**: 1 week
- **Phase 6**: 1 week
- **Phase 7**: Ongoing (throughout all phases)

**Total Estimated Time**: 7-10 weeks for full implementation

---

## Notes

- This plan is comprehensive and covers all aspects needed for production
- Prioritize Phase 1 and Phase 7 for MVP
- Implement phases incrementally, testing after each phase
- Consider user feedback during development
- Document all API endpoints and data models
- Maintain backward compatibility where possible

