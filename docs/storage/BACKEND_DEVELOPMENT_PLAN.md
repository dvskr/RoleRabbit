# Cloud Storage Backend Development Plan

## 📋 Overview

This document outlines the complete backend development plan for the RoleReady Cloud Storage feature. The storage system includes file management, folder organization, sharing, credential management, and cloud integrations.

---

## 🗄️ Phase 1: Database Schema Design

### 1.1 Prisma Schema Updates

Add the following models to `apps/api/prisma/schema.prisma`:

#### **StorageFile Model**
```prisma
model StorageFile {
  id          String   @id @default(cuid())
  userId      String
  
  // File metadata
  name        String
  fileName    String   // Original filename
  displayName String?  // User-friendly display name
  type        String   // resume, template, backup, cover_letter, etc.
  contentType String?  // MIME type
  size        BigInt   // File size in bytes
  storagePath String   // Path in storage (Supabase Storage path, local path, etc.)
  thumbnail   String?  // Thumbnail URL
  
  // Organization
  folderId    String?
  tags        String[] @default([])
  description String?
  
  // Sharing & Access
  isPublic    Boolean  @default(false)
  isStarred   Boolean  @default(false)
  isArchived  Boolean  @default(false)
  
  // Statistics
  downloadCount Int     @default(0)
  viewCount     Int     @default(0)
  version       Int     @default(1)
  
  // Soft delete
  deletedAt    DateTime?
  
  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder       StorageFolder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)
  shares       FileShare[]
  comments     FileComment[]
  accessLogs   AccessLog[]
  credential   Credential?
  
  @@index([userId])
  @@index([folderId])
  @@index([type])
  @@index([deletedAt])
  @@index([userId, deletedAt])
  @@map("storage_files")
}
```

#### **StorageFolder Model**
```prisma
model StorageFolder {
  id          String   @id @default(cuid())
  userId      String
  name        String
  parentId    String?  // For nested folders
  color       String?  // Hex color code
  deletedAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent      StorageFolder? @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    StorageFolder[] @relation("FolderHierarchy")
  files       StorageFile[]
  
  @@index([userId])
  @@index([parentId])
  @@index([userId, deletedAt])
  @@map("storage_folders")
}
```

#### **FileShare Model**
```prisma
model FileShare {
  id          String   @id @default(cuid())
  fileId      String
  userId      String   // User who shared
  sharedWith  String   // User ID of recipient
  
  permission  String   @default("view") // view, comment, edit, admin
  expiresAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  file        StorageFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  sharer      User        @relation("FileShares", fields: [userId], references: [id])
  recipient   User        @relation("SharedWithMe", fields: [sharedWith], references: [id])
  
  @@unique([fileId, sharedWith])
  @@index([fileId])
  @@index([sharedWith])
  @@map("file_shares")
}
```

#### **ShareLink Model**
```prisma
model ShareLink {
  id           String   @id @default(cuid())
  fileId       String
  userId       String
  
  token        String   @unique
  password     String?  // Hashed password if protected
  expiresAt    DateTime?
  maxDownloads Int?
  downloadCount Int     @default(0)
  
  createdAt    DateTime @default(now())
  
  // Relations
  file         StorageFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([fileId])
  @@map("share_links")
}
```

#### **FileComment Model**
```prisma
model FileComment {
  id          String   @id @default(cuid())
  fileId      String
  userId      String
  content     String
  parentId    String?  // For threaded comments
  
  isResolved  Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  file        StorageFile   @relation(fields: [fileId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent      FileComment?  @relation("CommentThread", fields: [parentId], references: [id], onDelete: Cascade)
  replies     FileComment[] @relation("CommentThread")
  
  @@index([fileId])
  @@index([parentId])
  @@map("file_comments")
}
```

#### **Credential Model**
```prisma
model Credential {
  id               String   @id @default(cuid())
  userId           String
  fileId           String?   // Associated file if any
  
  credentialType   String   // certification, license, visa, degree, badge
  name             String
  issuer           String
  issuedDate       String
  expirationDate   String?
  credentialId     String?  // External credential ID
  verificationUrl  String?
  qrCode           String?  // Base64 QR code
  
  verificationStatus String @default("pending") // pending, verified, expired, revoked
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  // Relations
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  file             StorageFile? @relation(fields: [fileId], references: [id], onDelete: SetNull)
  reminders        CredentialReminder[]
  
  @@index([userId])
  @@index([verificationStatus])
  @@index([expirationDate])
  @@map("credentials")
}
```

#### **CredentialReminder Model**
```prisma
model CredentialReminder {
  id             String   @id @default(cuid())
  credentialId   String
  reminderDate   DateTime
  isSent         Boolean  @default(false)
  priority       String   @default("medium") // low, medium, high
  
  createdAt      DateTime @default(now())
  
  // Relations
  credential     Credential @relation(fields: [credentialId], references: [id], onDelete: Cascade)
  
  @@index([credentialId])
  @@index([reminderDate, isSent])
  @@map("credential_reminders")
}
```

#### **AccessLog Model**
```prisma
model AccessLog {
  id          String   @id @default(cuid())
  fileId      String
  userId      String
  
  action      String   // view, download, share, edit, delete
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  // Relations
  file        StorageFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([fileId])
  @@index([userId])
  @@index([createdAt])
  @@map("access_logs")
}
```

#### **CloudIntegration Model**
```prisma
model CloudIntegration {
  id          String   @id @default(cuid())
  userId      String
  
  provider    String   // google_drive, dropbox, onedrive
  isConnected Boolean  @default(false)
  accessToken String? // Encrypted token
  refreshToken String?
  accountEmail String
  
  quotaUsed  BigInt?   @default(0)
  quotaTotal BigInt?
  
  connectedAt DateTime?
  lastSyncAt  DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, provider])
  @@index([userId])
  @@map("cloud_integrations")
}
```

#### **StorageQuota Model**
```prisma
model StorageQuota {
  id          String   @id @default(cuid())
  userId      String   @unique
  
  usedBytes   BigInt   @default(0)
  limitBytes  BigInt   @default(5368709120) // 5GB default
  
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("storage_quotas")
}
```

#### **Update User Model**
Add relations to existing `User` model:
```prisma
model User {
  // ... existing fields ...
  
  // Storage relations
  storageFiles       StorageFile[]
  storageFolders     StorageFolder[]
  fileShares         FileShare[]      @relation("FileShares")
  sharedFiles        FileShare[]      @relation("SharedWithMe")
  fileComments       FileComment[]
  credentials        Credential[]
  cloudIntegrations  CloudIntegration[]
  storageQuota       StorageQuota?
  accessLogs         AccessLog[]
  shareLinks         ShareLink[]
}
```

### 1.2 Migration Creation

```bash
cd apps/api
npx prisma migrate dev --name add_storage_models
```

---

## 🛣️ Phase 2: API Routes

### 2.1 Create Storage Routes File

Create `apps/api/routes/storage.routes.js`:

#### **File Management Routes**

```javascript
// GET /api/storage/files
// Query params: folderId, type, includeDeleted, search, sortBy
// List files with filtering

// POST /api/storage/files/upload
// Upload new file (multipart/form-data)

// GET /api/storage/files/:id
// Get file metadata

// GET /api/storage/files/:id/download
// Download file

// PUT /api/storage/files/:id
// Update file metadata (name, description, tags, etc.)

// DELETE /api/storage/files/:id
// Soft delete file

// POST /api/storage/files/:id/restore
// Restore from trash

// DELETE /api/storage/files/:id/permanent
// Permanently delete file

// POST /api/storage/files/:id/star
// Toggle star status

// POST /api/storage/files/:id/archive
// Toggle archive status

// POST /api/storage/files/:id/toggle-public
// Toggle public/private status

// POST /api/storage/files/:id/move
// Move file to folder
```

#### **Folder Management Routes**

```javascript
// GET /api/storage/folders
// List all folders

// POST /api/storage/folders
// Create folder

// PUT /api/storage/folders/:id
// Update folder (rename, change color)

// DELETE /api/storage/folders/:id
// Delete folder

// GET /api/storage/folders/:id/files
// Get files in folder
```

#### **Sharing Routes**

```javascript
// POST /api/storage/files/:id/share
// Share file with user

// GET /api/storage/files/:id/shares
// List file shares

// PUT /api/storage/shares/:id
// Update share permission

// DELETE /api/storage/shares/:id
// Remove share

// POST /api/storage/files/:id/share-link
// Create shareable link

// GET /api/storage/share-links/:token
// Access file via share link

// DELETE /api/storage/share-links/:id
// Delete share link
```

#### **Comments Routes**

```javascript
// GET /api/storage/files/:id/comments
// Get file comments

// POST /api/storage/files/:id/comments
// Add comment

// PUT /api/storage/comments/:id
// Update comment

// DELETE /api/storage/comments/:id
// Delete comment

// POST /api/storage/comments/:id/resolve
// Toggle resolve status
```

#### **Credential Routes**

```javascript
// GET /api/storage/credentials
// List user credentials

// GET /api/storage/credentials/expiring
// Get expiring credentials (query param: days)

// POST /api/storage/credentials
// Create credential

// PUT /api/storage/credentials/:id
// Update credential

// DELETE /api/storage/credentials/:id
// Delete credential

// POST /api/storage/credentials/:id/qr-code
// Generate QR code
```

#### **Storage Quota Routes**

```javascript
// GET /api/storage/quota
// Get storage quota info

// GET /api/storage/stats
// Get storage statistics
```

#### **Cloud Integration Routes**

```javascript
// GET /api/storage/integrations
// List cloud integrations

// POST /api/storage/integrations/connect
// Connect cloud service (OAuth flow)

// POST /api/storage/integrations/:id/sync
// Sync with cloud service

// DELETE /api/storage/integrations/:id
// Disconnect cloud service
```

#### **Access Logs Routes**

```javascript
// GET /api/storage/files/:id/access-logs
// Get file access logs
```

---

## 🔧 Phase 3: Implementation Details

### 3.1 File Storage Handler

Create `apps/api/utils/storageHandler.js`:

```javascript
// Supports:
// - Local file storage (development)
// - Supabase Storage (production) ✅ IMPLEMENTED
// - File validation
// - Size limits
// - Automatic fallback between storage types
```

### 3.2 Storage Service

Create `apps/api/utils/storageService.js`:

```javascript
// Business logic for:
// - Quota validation
// - File operations
// - Sharing logic
// - Permission checks
```

### 3.3 Validation Schemas

Create `apps/api/utils/storageValidation.js`:

```javascript
// Validation for:
// - File uploads
// - Folder creation
// - Share permissions
// - Credential data
```

---

## 📝 Phase 4: API Service Integration

### 4.1 Add Methods to Frontend API Service

Update `apps/web/src/services/apiService.ts` with all storage methods:

```typescript
// File methods
async getCloudFiles(folderId?: string, includeDeleted?: boolean)
async uploadStorageFile(formData: FormData)
async downloadCloudFile(fileId: string): Promise<Blob>
async updateCloudFile(fileId: string, updates: Partial<ResumeFile>)
async deleteCloudFile(fileId: string)
async restoreCloudFile(fileId: string)
async permanentlyDeleteCloudFile(fileId: string)

// Folder methods
async getFolders()
async createFolder(data: { name: string; color?: string })
async updateFolder(folderId: string, updates: { name?: string; color?: string })
async deleteFolder(folderId: string)

// Sharing methods
async shareFile(fileId: string, data: { userId: string; permission: string })
async deleteFileShare(shareId: string)
async updateFileShare(shareId: string, updates: { permission: string })
async createShareLink(fileId: string, options?: ShareLinkOptions)
async deleteShareLink(linkId: string)

// Credential methods
async getCredentials()
async getExpiringCredentials(days: number)
async createCredential(credential: CredentialInfo)
async updateCredential(id: string, updates: Partial<CredentialInfo>)
async deleteCredential(id: string)
async generateCredentialQRCode(id: string)

// Storage quota
async getStorageQuota()
async getStorageStats()
```

---

## 🧪 Phase 5: Testing

### 5.1 Unit Tests

Create test files:
- `apps/api/tests/storage/storage.routes.test.js`
- `apps/api/tests/storage/storageService.test.js`
- `apps/api/tests/storage/storageHandler.test.js`

### 5.2 Integration Tests

- File upload/download flow
- Folder operations
- Sharing functionality
- Credential management

---

## 📊 Phase 6: Implementation Checklist

### Database & Schema
- [ ] Add all Prisma models
- [ ] Run migration
- [ ] Create seed data for testing

### Core File Operations
- [ ] File upload endpoint
- [ ] File download endpoint
- [ ] File list endpoint
- [ ] File update endpoint
- [ ] File delete (soft)
- [ ] File restore
- [ ] File permanent delete
- [ ] File star/archive toggle
- [ ] File move to folder

### Folder Operations
- [ ] Folder list endpoint
- [ ] Folder create endpoint
- [ ] Folder update endpoint
- [ ] Folder delete endpoint
- [ ] Nested folder support

### Sharing & Permissions
- [ ] Share with user endpoint
- [ ] Share link creation
- [ ] Share link access
- [ ] Permission management
- [ ] Share removal

### Comments
- [ ] Comment creation
- [ ] Comment listing
- [ ] Comment updates
- [ ] Comment deletion
- [ ] Threaded replies

### Credentials
- [ ] Credential CRUD endpoints
- [ ] Expiration tracking
- [ ] QR code generation
- [ ] Reminder system

### Storage Management
- [ ] Quota tracking
- [ ] Storage statistics
- [ ] Quota validation
- [ ] Auto-cleanup of old files

### Cloud Integration
- [ ] OAuth connection
- [ ] Sync endpoints
- [ ] Disconnect endpoint
- [ ] Integration status

### Frontend Integration
- [ ] Add all API methods to apiService
- [ ] Update hooks to use real API
- [ ] Error handling
- [ ] Loading states

### Security & Validation
- [ ] File type validation
- [ ] File size limits
- [ ] Permission checks
- [ ] Rate limiting
- [ ] Input sanitization

---

## 🚀 Phase 7: Deployment Considerations

### 7.1 File Storage

**Development & Production:**
- Use Supabase Storage for both ✅ IMPLEMENTED
- Free tier (1GB) perfect for development
- Same configuration works everywhere
- Files organized by user ID automatically
- Supabase Storage includes CDN automatically

**Alternative (not recommended):**
- Local filesystem: Only for offline development
- AWS S3: More complex setup, no built-in integration

### 7.2 Environment Variables

```env
# Storage Configuration
STORAGE_TYPE=supabase  # 'supabase' (recommended for dev & prod) or 'local'
STORAGE_PATH=./uploads  # Only used if STORAGE_TYPE=local (not recommended)

# Supabase Storage ✅ RECOMMENDED - Works for both dev and production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=roleready-files

# AWS S3 (Alternative - only if not using Supabase)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=roleready-storage

# Storage Limits
MAX_FILE_SIZE=10485760  # 10MB
DEFAULT_STORAGE_LIMIT=5368709120  # 5GB
PREMIUM_STORAGE_LIMIT=10737418240  # 10GB
```

### 7.3 Performance Optimizations

- Implement file chunking for large uploads
- Add caching for frequently accessed files
- Use background jobs for file processing
- Implement file compression

---

## 📅 Development Timeline

### Week 1: Database & Basic Operations
- Day 1-2: Database schema design and migration
- Day 3-4: Basic file upload/download
- Day 5: File listing and metadata

### Week 2: Organization & Management
- Day 1-2: Folder operations
- Day 3: File organization (move, tag)
- Day 4-5: Storage quota and statistics

### Week 3: Sharing & Collaboration
- Day 1-2: Share with users
- Day 3: Share links
- Day 4: Comments system
- Day 5: Access logging

### Week 4: Advanced Features
- Day 1-2: Credential management
- Day 3: Cloud integrations
- Day 4-5: Testing and bug fixes

---

## 🔐 Security Checklist

- [ ] File type whitelist validation
- [ ] File size limits enforced
- [ ] User quota enforcement
- [ ] Permission checks on all endpoints
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention
- [ ] Rate limiting on upload endpoints
- [ ] Secure file serving (no direct file access)
- [ ] Encrypted storage for sensitive files
- [ ] Share link token security
- [ ] Password-protected share links

---

## 📚 Additional Resources

- [Prisma Relations Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Fastify File Upload](https://github.com/fastify/fastify-multipart)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/storage-from)
- [File Storage Best Practices](https://supabase.com/docs/guides/storage/security/access-control)

---

## ✅ Success Criteria

1. All storage endpoints implemented and tested
2. Database schema migrated successfully
3. Frontend API service updated
4. File upload/download working
5. Folder management functional
6. Sharing system operational
7. Credential management complete
8. Storage quota enforced
9. All security measures in place
10. Performance optimized for production

---

**Last Updated:** 2024-01-15
**Status:** Ready for Development

