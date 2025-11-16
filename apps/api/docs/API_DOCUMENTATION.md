# My Files API Documentation

**DOC-001 to DOC-006**: Complete API documentation for My Files endpoints

## Base URL

```
Development: http://localhost:3001/api/storage
Production: https://api.roleready.com/api/storage
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Rate Limits

- **Upload**: 10 requests/minute per user
- **Download**: 30 requests/minute per user
- **Share**: 20 requests/minute per user
- **Delete**: 10 requests/minute per user

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `PERMISSION_DENIED` | 403 | User doesn't have permission |
| `FILE_NOT_FOUND` | 404 | File not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `FILE_TOO_LARGE` | 403 | File exceeds size limit |
| `STORAGE_QUOTA_EXCEEDED` | 403 | User quota exceeded |
| `CONCURRENT_MODIFICATION` | 409 | File modified by another user |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Endpoints

### File Operations

#### Upload File

**POST** `/api/storage/files`

Upload a new file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): File to upload
  - `folderId` (optional): Target folder ID
  - `description` (optional): File description
  - `tags` (optional): Comma-separated tags

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file-id",
    "name": "document.pdf",
    "size": 1024000,
    "contentType": "application/pdf",
    "storagePath": "user-id/file-id/document.pdf",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/storage/files \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "folderId=folder-id" \
  -F "description=Important document"
```

#### Get File by ID

**GET** `/api/storage/files/:id`

Get single file metadata with all relations.

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file-id",
    "name": "document.pdf",
    "size": 1024000,
    "contentType": "application/pdf",
    "folder": { "id": "folder-id", "name": "Documents" },
    "shares": [],
    "comments": []
  }
}
```

#### Download File

**GET** `/api/storage/files/:id/download`

Download file content.

**Response:**
- Content-Type: File's MIME type
- Content-Disposition: `attachment; filename="filename.ext"`
- Body: File binary data

**Example:**
```bash
curl -X GET http://localhost:3001/api/storage/files/:id/download \
  -H "Authorization: Bearer <token>" \
  -o downloaded-file.pdf
```

#### List Files

**GET** `/api/storage/files`

List all user files with filters.

**Query Parameters:**
- `folderId` (optional): Filter by folder
- `type` (optional): Filter by file type
- `search` (optional): Search in filename
- `sortBy` (optional): `name`|`size`|`createdAt`|`updatedAt`
- `sortOrder` (optional): `asc`|`desc`
- `limit` (optional): Page size (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "files": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

#### Update File

**PUT** `/api/storage/files/:id`

Update file metadata.

**Request Body:**
```json
{
  "name": "new-name.pdf",
  "description": "Updated description",
  "folderId": "new-folder-id",
  "version": 1
}
```

**Note**: Include `version` field for optimistic locking (prevents concurrent modification conflicts).

#### Delete File (Soft Delete)

**DELETE** `/api/storage/files/:id`

Soft delete a file (moves to trash).

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### Restore File

**POST** `/api/storage/files/:id/restore`

Restore a soft-deleted file.

#### Permanent Delete

**DELETE** `/api/storage/files/:id/permanent`

Permanently delete a file (cannot be undone).

### Bulk Operations

#### Bulk Delete

**POST** `/api/storage/files/bulk-delete`

Delete multiple files at once.

**Request Body:**
```json
{
  "fileIds": ["file-id-1", "file-id-2"]
}
```

#### Bulk Restore

**POST** `/api/storage/files/bulk-restore`

Restore multiple files.

#### Bulk Move

**POST** `/api/storage/files/bulk-move`

Move multiple files to a folder.

**Request Body:**
```json
{
  "fileIds": ["file-id-1", "file-id-2"],
  "folderId": "target-folder-id"
}
```

#### Duplicate File

**POST** `/api/storage/files/:id/duplicate`

Create a copy of a file.

### File Sharing

#### Share File with User

**POST** `/api/storage/files/:id/share`

Share file with another user.

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "permission": "VIEW",  // VIEW, COMMENT, EDIT, ADMIN
  "expiresAt": "2025-12-31T23:59:59Z"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "share": {
    "id": "share-id",
    "fileId": "file-id",
    "sharedWith": "user-id",
    "permission": "VIEW"
  }
}
```

#### Create Share Link

**POST** `/api/storage/files/:id/share-link`

Create a public share link.

**Request Body:**
```json
{
  "permission": "VIEW",
  "expiresAt": "2025-12-31T23:59:59Z",  // optional
  "maxDownloads": 10,  // optional
  "password": "secure-password"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "shareLink": {
    "token": "abc123...",
    "url": "https://app.roleready.com/shared/abc123..."
  }
}
```

#### Access Share Link

**GET** `/api/storage/shared/:token`

Access a file via share link (public endpoint, no auth required).

**Query Parameters:**
- `password` (optional): Password if link is protected

### File Versions

#### List File Versions

**GET** `/api/storage/files/:id/versions`

Get all versions of a file.

**Response:**
```json
{
  "success": true,
  "versions": [
    {
      "id": "version-id",
      "versionNumber": 1,
      "fileName": "document-v1.pdf",
      "createdAt": "2025-01-15T10:00:00Z",
      "createdBy": { "name": "User Name" }
    }
  ]
}
```

#### Create File Version

**POST** `/api/storage/files/:id/versions`

Upload a new version of an existing file.

**Request:** Same as file upload (multipart/form-data)

### Storage Statistics

#### Get Storage Stats

**GET** `/api/storage/stats`

Get user storage statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalFiles": 150,
    "totalSize": 5368709120,
    "usedBytes": 2684354560,
    "limitBytes": 5368709120,
    "usagePercent": 50
  }
}
```

### File Activity

#### Get File Activity

**GET** `/api/storage/files/:id/activity`

Get activity timeline for a file.

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "type": "upload",
      "user": { "name": "User Name" },
      "timestamp": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Get Access Logs

**GET** `/api/storage/files/:id/access-logs`

Get file access logs (compliance/audit).

**Query Parameters:**
- `limit` (optional): Number of logs to return

### Thumbnails

#### Upload Thumbnail

**POST** `/api/storage/files/:id/thumbnail`

Upload a custom thumbnail for a file.

#### Get Thumbnail

**GET** `/api/storage/files/:id/thumbnail`

Get file thumbnail image.

### Comments

#### Add Comment

**POST** `/api/storage/files/:id/comments`

Add a comment to a file.

**Request Body:**
```json
{
  "content": "This looks good!",
  "parentId": null  // optional, for replies
}
```

#### Get Comments

**GET** `/api/storage/files/:id/comments`

Get all comments for a file.

#### Update Comment

**PUT** `/api/storage/files/comments/:id`

Update a comment.

#### Delete Comment

**DELETE** `/api/storage/files/comments/:id`

Delete a comment.

## WebSocket Events

**DOC-017**: Real-time updates via WebSocket

### Events

#### `file:uploaded`
Emitted when a file is uploaded.

```json
{
  "event": "file:uploaded",
  "data": {
    "fileId": "file-id",
    "userId": "user-id"
  }
}
```

#### `file:deleted`
Emitted when a file is deleted.

#### `file:shared`
Emitted when a file is shared.

#### `file:updated`
Emitted when file metadata is updated.

### Connection

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: '<jwt-token>' }
});

socket.on('file:uploaded', (data) => {
  console.log('File uploaded:', data);
});
```

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for complete code examples.

