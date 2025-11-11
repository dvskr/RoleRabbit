# Cloud Storage Files Tab - Architecture Documentation

## Overview

The Cloud Storage Files Tab is a full-featured file management system built with Next.js, React, and Node.js. It provides enterprise-grade file storage, sharing, and collaboration capabilities with advanced performance optimizations.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │              │  │              │  │              │      │
│  │  CloudStorage│  │   FileList   │  │   FileCard   │     │
│  │  Container   │  │  Component   │  │  Component   │     │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │                 │                        │
│                   │ useCloudStorage │                        │
│                   │      Hook       │                        │
│                   │                 │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │                 │                        │
│                   │   API Service   │                        │
│                   │                 │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    HTTP/WebSocket
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                     Backend API (Fastify)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │              │  │              │  │              │      │
│  │   Storage    │  │   Permission │  │  Validation  │     │
│  │   Routes     │  │  Middleware  │  │  Utilities   │     │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │                 │                        │
│                   │  Redis Cache    │◄──────────┐           │
│                   │                 │           │           │
│                   └────────┬────────┘           │           │
│                            │                    │           │
│                   ┌────────▼────────┐  ┌────────┴────────┐ │
│                   │                 │  │                 │ │
│                   │     Prisma      │  │   Socket.IO     │ │
│                   │      ORM        │  │     Server      │ │
│                   │                 │  │                 │ │
│                   └────────┬────────┘  └─────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    Data Layer                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │              │  │              │  │              │      │
│  │  PostgreSQL  │  │    Redis     │  │   Storage    │     │
│  │   Database   │  │    Cache     │  │  (S3/Local)  │     │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: React 18 with hooks
- **State Management**: React hooks (useState, useEffect, useCallback, useMemo)
- **Real-time**: Socket.IO client
- **Styling**: Tailwind CSS + Theme system
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, Playwright

### Backend
- **Framework**: Fastify (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with ioredis client
- **Real-time**: Socket.IO server
- **Storage**: Local filesystem or S3-compatible
- **Authentication**: JWT with httpOnly cookies

---

## Key Features

### 1. **File Management**
- Upload files with drag & drop or file picker
- Download files in multiple formats
- Star/archive files for quick access
- Soft delete with recycle bin (30-day retention)
- Permanent deletion
- File renaming and metadata editing
- File type categorization (resume, cover letter, etc.)

### 2. **Folder Organization**
- Create folders with custom names and colors
- Move files between folders
- Nested folder support
- Folder deletion (moves files to root)

### 3. **File Sharing**
- Share with registered users (user-to-user)
- Create public share links with tokens
- Permission levels: view, comment, edit, admin
- Expiration dates for shares
- Download limits for public links
- Password protection for share links
- Remove shares / revoke access

### 4. **Collaboration**
- Add comments to files
- View shared users
- Real-time updates via WebSocket
- Activity tracking

### 5. **Search & Filter**
- Full-text search with GIN indexing
- Filter by file type
- Filter by starred/archived
- View deleted files (recycle bin)
- Debounced search (300ms)

### 6. **Performance Optimizations**
- Cursor-based pagination (50 files per page)
- Infinite scroll
- Redis caching (5-minute TTL)
- Selective data loading (include: folder, shares, comments)
- React.memo on components
- useCallback/useMemo for expensive operations
- Optimistic UI updates with rollback

---

## Component Structure

### Frontend Components Hierarchy

```
CloudStorage (Main Container)
├── StorageHeader
│   ├── Search Input
│   ├── View Tabs (All Files / Deleted)
│   └── Upload Button
│
├── FolderSidebar
│   ├── Folder List
│   ├── Create Folder Button
│   └── Folder Actions (Rename, Delete)
│
└── FileList
    ├── Toolbar
    │   ├── Select All Checkbox
    │   └── Type Filter
    │
    ├── File Cards Grid
    │   └── FileCard (for each file)
    │       ├── FileCardHeader
    │       │   ├── Type Badge
    │       │   ├── File Icon
    │       │   └── Selection Checkbox
    │       │
    │       ├── FileCardMetadata
    │       │   ├── File Name
    │       │   ├── File Size
    │       │   ├── Last Modified
    │       │   └── Folder Badge
    │       │
    │       ├── FileCardActions
    │       │   ├── Star Button
    │       │   ├── Archive Button
    │       │   ├── Preview Button
    │       │   ├── Download Button
    │       │   ├── Share Button
    │       │   ├── Comment Button
    │       │   ├── Move Button
    │       │   └── Delete Button
    │       │
    │       ├── SharedUsers (if applicable)
    │       └── Comments Display
    │
    ├── Infinite Scroll Sentinel
    └── Load More Button
```

---

## Data Flow

### 1. **File Upload Flow**

```
User Action → UploadModal
     ↓
FormData created with file + metadata
     ↓
apiService.uploadFile()
     ↓
POST /api/storage/files/upload
     ↓
Fastify multipart processing
     ↓
File validation (type, size)
     ↓
Storage handler saves file
     ↓
Prisma creates database record
     ↓
Update user quota
     ↓
Invalidate Redis cache
     ↓
Emit WebSocket event
     ↓
Response sent to frontend
     ↓
useCloudStorage updates files array
     ↓
UI updates with new file
```

### 2. **File List Loading Flow**

```
Component Mount → useCloudStorage.loadFiles()
     ↓
apiService.getCloudFiles({ limit: 50 })
     ↓
GET /api/storage/files?limit=50
     ↓
Check Redis cache (key: files:userId:limit:50)
     ↓
Cache HIT? → Return cached data
     ↓
Cache MISS? → Query database
     ↓
Prisma query with pagination
     ↓
Apply filters (type, search, folderId)
     ↓
Load selective includes (folder, shares)
     ↓
Format response with pagination metadata
     ↓
Cache response in Redis (TTL: 300s)
     ↓
Return to frontend
     ↓
useCloudStorage sets files state
     ↓
FileList renders file cards
```

### 3. **Real-time Updates Flow**

```
User A performs action (e.g., upload file)
     ↓
Backend emits Socket.IO event
     ↓
socketIOServer.notifyFileCreated(userId, fileMetadata)
     ↓
Event broadcast to all connected clients for that user
     ↓
User B's browser receives event
     ↓
useCloudStorage WebSocket listener triggered
     ↓
handleFileCreated() adds file to local state
     ↓
UI updates immediately (optimistic)
```

---

## API Endpoints

### File Operations

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/storage/files` | List files (paginated) | Any |
| POST | `/api/storage/files/upload` | Upload file | Owner |
| GET | `/api/storage/files/:id` | Get file details | View+ |
| PUT | `/api/storage/files/:id` | Update file metadata | Edit+ |
| DELETE | `/api/storage/files/:id` | Soft delete (recycle bin) | Admin |
| POST | `/api/storage/files/:id/restore` | Restore from recycle bin | Admin |
| DELETE | `/api/storage/files/:id/permanent` | Permanent delete | Admin |
| POST | `/api/storage/files/:id/move` | Move to folder | Edit+ |
| GET | `/api/storage/files/:id/download` | Download file | View+ |

### Sharing Operations

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/api/storage/files/:id/share` | Share with user | Admin |
| POST | `/api/storage/files/:id/share-link` | Create public share link | Admin |
| PUT | `/api/shares/:id` | Update share permission | Admin |
| DELETE | `/api/shares/:id` | Remove share | Admin |
| GET | `/api/shared/:token` | Access file via share link | Public |
| GET | `/api/shared/:token/download` | Download via share link | Public |

### Folder Operations

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/storage/folders` | List folders | Any |
| POST | `/api/storage/folders` | Create folder | Owner |
| PUT | `/api/storage/folders/:id` | Rename/update folder | Owner |
| DELETE | `/api/storage/folders/:id` | Delete folder | Owner |

---

## Database Schema

### Core Tables

**StorageFile**
```prisma
model StorageFile {
  id          String    @id @default(uuid())
  userId      String
  name        String
  fileName    String
  type        FileType
  mimeType    String
  size        BigInt
  storagePath String
  folderId    String?
  starred     Boolean   @default(false)
  archived    Boolean   @default(false)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  folder      StorageFolder?  @relation(fields: [folderId])
  shares      FileShare[]
  shareLinks  ShareLink[]
  comments    FileComment[]
}
```

**FileShare** (User-to-User)
```prisma
model FileShare {
  id         String     @id @default(uuid())
  fileId     String
  userId     String     // Owner
  sharedWith String     // Recipient
  permission Permission // view, comment, edit, admin
  expiresAt  DateTime?
  createdAt  DateTime   @default(now())

  file       StorageFile @relation(fields: [fileId])
  @@index([fileId, sharedWith])
}
```

**ShareLink** (Public Sharing)
```prisma
model ShareLink {
  id            String     @id @default(uuid())
  fileId        String
  userId        String
  token         String     @unique
  permission    Permission
  expiresAt     DateTime?
  maxDownloads  Int?
  downloadCount Int        @default(0)
  password      String?
  createdAt     DateTime   @default(now())

  file          StorageFile @relation(fields: [fileId])
  @@index([token])
}
```

### Performance Indexes

```sql
-- File listing optimization
CREATE INDEX idx_files_user_deleted ON storage_files(user_id, deleted_at);
CREATE INDEX idx_files_folder ON storage_files(folder_id);
CREATE INDEX idx_files_type ON storage_files(type);
CREATE INDEX idx_files_created ON storage_files(created_at DESC);

-- Full-text search
CREATE INDEX idx_files_name_gin ON storage_files USING GIN (to_tsvector('english', name));

-- Share lookup
CREATE INDEX idx_file_shares_user_expiry ON file_shares(file_id, shared_with, expires_at);
CREATE INDEX idx_share_links_token ON share_links(token);

-- Folder optimization
CREATE INDEX idx_folders_user ON storage_folders(user_id);
```

---

## Caching Strategy

### Redis Cache Keys

| Key Pattern | Purpose | TTL | Invalidation Trigger |
|-------------|---------|-----|---------------------|
| `files:{userId}:*` | File list queries | 300s | File/folder mutations |
| `quota:{userId}` | Storage quota | 300s | File upload/delete |
| `share:{token}` | Share link data | 3600s | Share update/delete |

### Cache Invalidation Rules

1. **File Upload** → Invalidate `files:{userId}:*` and `quota:{userId}`
2. **File Update** → Invalidate `files:{userId}:*`
3. **File Delete** → Invalidate `files:{userId}:*` and `quota:{userId}`
4. **Folder Change** → Invalidate `files:{userId}:*`
5. **Share Create/Update/Delete** → Invalidate specific file caches

### Optimization Tips

- Search queries bypass cache (too dynamic)
- Cache only successful responses
- Use pattern deletion for bulk invalidation
- Monitor cache hit rate (`INFO stats`)

---

## Permission System

### Permission Levels (Hierarchical)

1. **view** (Level 1)
   - Can view/download file
   - Can see file metadata
   - Cannot modify anything

2. **comment** (Level 2)
   - All view permissions
   - Can add comments
   - Cannot edit file

3. **edit** (Level 3)
   - All comment permissions
   - Can edit file metadata
   - Can move file to folders
   - Cannot delete or share

4. **admin** (Level 4 - Owner Only)
   - All edit permissions
   - Can delete file
   - Can manage shares
   - Can permanently delete

### Permission Check Flow

```javascript
async function checkFilePermission(userId, fileId, action) {
  // 1. Get file with shares
  const file = await prisma.storageFile.findUnique({
    where: { id: fileId },
    include: { shares: { where: { sharedWith: userId } } }
  });

  // 2. Owner has admin permission
  if (file.userId === userId) {
    return { allowed: true, permission: 'admin' };
  }

  // 3. Check user's share
  const share = file.shares[0];
  if (!share) {
    return { allowed: false, reason: 'No access' };
  }

  // 4. Check permission hierarchy
  const userLevel = permissionLevels[share.permission];
  const requiredLevel = permissionLevels[action];

  return {
    allowed: userLevel >= requiredLevel,
    permission: share.permission
  };
}
```

---

## Performance Benchmarks

### Before Optimization
- **Response Time**: 3-5 seconds (1000 files)
- **Data Transfer**: 5-10 MB
- **Database Queries**: 15+ per request
- **Re-renders**: 20+ per interaction
- **Cache**: None

### After Optimization
- **Response Time**: 100-300ms (50 files paginated)
- **Data Transfer**: 50-200 KB
- **Database Queries**: 1-2 per request (cached)
- **Re-renders**: 1-3 per interaction
- **Cache Hit Rate**: ~85%

### Key Optimizations

1. **Pagination**: 50 files per page instead of all
2. **Selective Includes**: Load only needed relations
3. **Redis Caching**: 5-min TTL for file lists
4. **React.memo**: Prevent unnecessary re-renders
5. **Debounced Search**: 300ms delay
6. **Database Indexes**: 10x faster queries
7. **Optimistic Updates**: Instant UI feedback

---

## Security Considerations

### Implemented
✅ JWT authentication with httpOnly cookies
✅ Permission-based access control
✅ File type validation
✅ File size limits
✅ SQL injection prevention (Prisma)
✅ XSS prevention (React escaping)
✅ Soft delete (recycle bin)
✅ Audit logging

### TODO (See security audit docs)
⚠️ Rate limiting
⚠️ CSRF protection
⚠️ Email validation for shares
⚠️ Brute force protection
⚠️ Virus scanning
⚠️ Share expiration enforcement

---

## Testing Strategy

### Unit Tests (125+ cases)
- Hook logic (`useCloudStorage`, `useFileOperations`)
- Permission checking
- Utility functions
- Component rendering

### Integration Tests (15+ cases)
- Complete API workflows
- File upload → list → download
- Share creation → access
- Comment CRUD operations

### E2E Tests (30+ cases with Playwright)
- User workflows
- File management
- Sharing scenarios
- Error handling
- Performance checks
- Accessibility

### Running Tests

```bash
# Frontend unit tests
cd apps/web
npm test

# Backend API tests
cd apps/api
npm test

# E2E tests
cd apps/web
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## Deployment

### Prerequisites
```bash
# Install Redis
docker run -d -p 6379:6379 redis:alpine

# Set environment variables
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/db
STORAGE_PATH=/path/to/storage
FRONTEND_URL=https://your-domain.com
```

### Database Setup
```bash
# Apply schema
cd apps/api
npx prisma migrate deploy

# Apply performance indexes
psql $DATABASE_URL -f prisma/migrations/add_storage_performance_indexes.sql
```

### Build & Start
```bash
# Install dependencies
npm install

# Build frontend
cd apps/web
npm run build

# Start frontend
npm start

# Start backend (in another terminal)
cd apps/api
npm start
```

---

## Monitoring

### Key Metrics to Track

1. **Performance**
   - API response times
   - Cache hit rate
   - Database query duration
   - File upload speed

2. **Usage**
   - Files uploaded per day
   - Storage quota usage
   - Active shares
   - Download count

3. **Errors**
   - Failed uploads
   - Permission denials
   - Cache errors
   - Database timeouts

### Logging
```javascript
// Structured logging with Winston/Pino
logger.info('File uploaded', {
  userId,
  fileId,
  size: file.size,
  duration: uploadTime
});
```

---

## Future Enhancements

### Planned Features
- [ ] File versioning
- [ ] Collaborative editing
- [ ] Advanced search filters
- [ ] Bulk operations
- [ ] Mobile app
- [ ] Offline mode with sync
- [ ] Trash auto-cleanup job
- [ ] Storage analytics dashboard

### Performance
- [ ] CDN for file downloads
- [ ] Image thumbnails
- [ ] Video previews
- [ ] Background job queue

### Security
- [ ] Encryption at rest
- [ ] End-to-end encryption for shares
- [ ] Two-factor authentication
- [ ] Advanced audit logs

---

## Troubleshooting

### Common Issues

**1. Redis Connection Failed**
```
⚠️ Redis connection failed. Caching will be disabled but server will continue.
```
**Solution**: Check REDIS_URL environment variable, ensure Redis is running

**2. File Upload Failed**
```
Error: File size exceeds maximum allowed size
```
**Solution**: Check Fastify `bodyLimit` setting, adjust file size limits

**3. Slow Performance**
```
Response time > 2 seconds
```
**Solution**: Check database indexes, verify Redis cache is working, monitor query performance

**4. Cache Not Invalidating**
```
Old data showing after file upload
```
**Solution**: Check Redis connection, verify `invalidateUserFiles()` is called, check cache TTL

---

## Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- JSDoc for all exported functions

### Pull Request Checklist
- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Security audit reviewed
- [ ] Accessibility checked
- [ ] Performance benchmarked
- [ ] Documentation updated

---

## References

- [Refactoring Summary](apps/web/docs/refactoring-summary.md)
- [Backend Optimization Plan](apps/api/docs/backend-optimization-plan.md)
- [Security Audits](apps/api/docs/)
- [Accessibility Audit](apps/web/docs/accessibility-audit.md)
- [useEffect Dependency Review](apps/web/docs/useEffect-dependency-review.md)

---

**Last Updated**: 2025-11-11
**Version**: 2.0.0
**Status**: Production Ready (with security fixes needed)
