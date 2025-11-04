# Cloud Storage API Endpoints Reference

## Base URL
```
http://localhost:3001/api/storage
```

All endpoints require authentication via JWT token (in cookie or Authorization header).

---

## File Management Endpoints

### List Files
```http
GET /api/storage/files
```

**Query Parameters:**
- `folderId` (optional): Filter by folder
- `type` (optional): Filter by file type (resume, template, etc.)
- `includeDeleted` (optional, boolean): Include deleted files
- `search` (optional): Search term for file names
- `sortBy` (optional): Sort order (name, date, size)
- `limit` (optional): Results limit
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "files": [
    {
      "id": "file123",
      "name": "My Resume",
      "fileName": "resume.pdf",
      "type": "resume",
      "size": 245678,
      "contentType": "application/pdf",
      "lastModified": "2024-01-15T10:30:00Z",
      "isPublic": false,
      "downloadCount": 5,
      "viewCount": 12,
      "folderId": "folder456",
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

---

### Upload File
```http
POST /api/storage/files/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): File to upload
- `displayName` (optional): Custom display name
- `type` (optional): File type
- `description` (optional): File description
- `isPublic` (optional, boolean): Public/private
- `folderId` (optional): Target folder ID

**Response:**
```json
{
  "file": {
    "id": "file123",
    "name": "My Resume",
    "size": 245678,
    "storagePath": "uploads/user123/file123.pdf",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "storage": {
    "usedBytes": 5242880,
    "limitBytes": 5368709120,
    "percentage": 0.1
  }
}
```

**Errors:**
- `400`: Invalid file type or size
- `403`: Storage quota exceeded
- `413`: File too large

---

### Get File Metadata
```http
GET /api/storage/files/:id
```

**Response:**
```json
{
  "id": "file123",
  "name": "My Resume",
  "fileName": "resume.pdf",
  "type": "resume",
  "size": 245678,
  "contentType": "application/pdf",
  "lastModified": "2024-01-15T10:30:00Z",
  "isPublic": false,
  "description": "My professional resume",
  "downloadCount": 5,
  "viewCount": 12,
  "version": 1,
  "folderId": "folder456",
  "sharedWith": [],
  "comments": [],
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Download File
```http
GET /api/storage/files/:id/download
```

**Response:**
- Binary file content
- Headers:
  - `Content-Type`: File MIME type
  - `Content-Disposition`: `attachment; filename="resume.pdf"`
  - `Content-Length`: File size

**Errors:**
- `404`: File not found
- `403`: Access denied

---

### Update File
```http
PUT /api/storage/files/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "displayName": "Updated Resume Name",
  "description": "Updated description",
  "type": "document",
  "isPublic": true,
  "folderId": "folder789"
}
```

**Response:**
```json
{
  "file": {
    "id": "file123",
    "name": "Updated Resume Name",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### Delete File (Soft Delete)
```http
DELETE /api/storage/files/:id
```

**Response:**
```json
{
  "message": "File deleted successfully",
  "deletedAt": "2024-01-15T11:30:00Z"
}
```

---

### Restore File
```http
POST /api/storage/files/:id/restore
```

**Response:**
```json
{
  "message": "File restored successfully",
  "file": {
    "id": "file123",
    "deletedAt": null
  }
}
```

---

### Permanently Delete File
```http
DELETE /api/storage/files/:id/permanent
```

**Response:**
```json
{
  "message": "File permanently deleted"
}
```

**Warning:** This action cannot be undone.

---

### Toggle Star
```http
POST /api/storage/files/:id/star
```

**Response:**
```json
{
  "file": {
    "id": "file123",
    "isStarred": true
  }
}
```

---

### Toggle Archive
```http
POST /api/storage/files/:id/archive
```

**Response:**
```json
{
  "file": {
    "id": "file123",
    "isArchived": true
  }
}
```

---

### Toggle Public/Private
```http
POST /api/storage/files/:id/toggle-public
```

**Response:**
```json
{
  "file": {
    "id": "file123",
    "isPublic": true
  }
}
```

---

### Move File to Folder
```http
POST /api/storage/files/:id/move
Content-Type: application/json
```

**Request Body:**
```json
{
  "folderId": "folder789"
}
```

**Response:**
```json
{
  "file": {
    "id": "file123",
    "folderId": "folder789"
  }
}
```

---

## Folder Management Endpoints

### List Folders
```http
GET /api/storage/folders
```

**Response:**
```json
{
  "folders": [
    {
      "id": "folder456",
      "name": "Resumes",
      "color": "#3b82f6",
      "parentId": null,
      "fileCount": 10,
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

---

### Create Folder
```http
POST /api/storage/folders
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Folder",
  "color": "#3b82f6",
  "parentId": "folder456"
}
```

**Response:**
```json
{
  "folder": {
    "id": "folder789",
    "name": "My Folder",
    "color": "#3b82f6",
    "parentId": "folder456",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

---

### Update Folder
```http
PUT /api/storage/folders/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "color": "#a855f7"
}
```

**Response:**
```json
{
  "folder": {
    "id": "folder789",
    "name": "Updated Folder Name",
    "color": "#a855f7",
    "updatedAt": "2024-01-15T12:30:00Z"
  }
}
```

---

### Delete Folder
```http
DELETE /api/storage/folders/:id
```

**Response:**
```json
{
  "message": "Folder deleted successfully"
}
```

**Note:** Files in folder are moved to root or soft-deleted.

---

### Get Folder Files
```http
GET /api/storage/folders/:id/files
```

**Response:** Same as list files endpoint, filtered by folder.

---

## Sharing Endpoints

### Share File with User
```http
POST /api/storage/files/:id/share
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user789",
  "permission": "view",
  "expiresAt": "2024-02-15T12:00:00Z"
}
```

**Response:**
```json
{
  "share": {
    "id": "share123",
    "fileId": "file123",
    "userId": "user789",
    "permission": "view",
    "createdAt": "2024-01-15T13:00:00Z"
  }
}
```

---

### List File Shares
```http
GET /api/storage/files/:id/shares
```

**Response:**
```json
{
  "shares": [
    {
      "id": "share123",
      "userId": "user789",
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "permission": "view",
      "createdAt": "2024-01-15T13:00:00Z"
    }
  ]
}
```

---

### Update Share Permission
```http
PUT /api/storage/shares/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "permission": "edit"
}
```

**Response:**
```json
{
  "share": {
    "id": "share123",
    "permission": "edit",
    "updatedAt": "2024-01-15T13:30:00Z"
  }
}
```

---

### Remove Share
```http
DELETE /api/storage/shares/:id
```

**Response:**
```json
{
  "message": "Share removed successfully"
}
```

---

### Create Share Link
```http
POST /api/storage/files/:id/share-link
Content-Type: application/json
```

**Request Body:**
```json
{
  "password": "optional-password",
  "expiresAt": "2024-02-15T12:00:00Z",
  "maxDownloads": 10
}
```

**Response:**
```json
{
  "shareLink": {
    "id": "link123",
    "url": "https://roleready.com/share/abc123xyz",
    "token": "abc123xyz",
    "expiresAt": "2024-02-15T12:00:00Z",
    "maxDownloads": 10
  }
}
```

---

### Access File via Share Link
```http
GET /api/storage/share-links/:token
```

**Query Parameters:**
- `password` (optional): If link is password-protected

**Response:** Same as download file endpoint.

---

### Delete Share Link
```http
DELETE /api/storage/share-links/:id
```

**Response:**
```json
{
  "message": "Share link deleted successfully"
}
```

---

## Comments Endpoints

### Get File Comments
```http
GET /api/storage/files/:id/comments
```

**Response:**
```json
{
  "comments": [
    {
      "id": "comment123",
      "userId": "user456",
      "userName": "Jane Smith",
      "content": "Great resume!",
      "replies": [],
      "isResolved": false,
      "createdAt": "2024-01-15T14:00:00Z"
    }
  ]
}
```

---

### Add Comment
```http
POST /api/storage/files/:id/comments
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Great resume!",
  "parentId": "comment123"
}
```

**Response:**
```json
{
  "comment": {
    "id": "comment456",
    "content": "Great resume!",
    "parentId": "comment123",
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

---

### Update Comment
```http
PUT /api/storage/comments/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Updated comment"
}
```

---

### Delete Comment
```http
DELETE /api/storage/comments/:id
```

---

### Toggle Comment Resolve
```http
POST /api/storage/comments/:id/resolve
```

---

## Credential Endpoints

### List Credentials
```http
GET /api/storage/credentials
```

**Response:**
```json
{
  "credentials": [
    {
      "id": "cred123",
      "credentialType": "certification",
      "name": "AWS Solutions Architect",
      "issuer": "Amazon Web Services",
      "issuedDate": "2022-01-15",
      "expirationDate": "2025-01-15",
      "verificationStatus": "verified",
      "fileId": "file123"
    }
  ]
}
```

---

### Get Expiring Credentials
```http
GET /api/storage/credentials/expiring?days=90
```

**Response:** Same format as list credentials, filtered by expiration date.

---

### Create Credential
```http
POST /api/storage/credentials
Content-Type: application/json
```

**Request Body:**
```json
{
  "credentialType": "certification",
  "name": "AWS Solutions Architect",
  "issuer": "Amazon Web Services",
  "issuedDate": "2022-01-15",
  "expirationDate": "2025-01-15",
  "credentialId": "AWS-12345",
  "verificationUrl": "https://aws.amazon.com/verification",
  "fileId": "file123"
}
```

---

### Update Credential
```http
PUT /api/storage/credentials/:id
Content-Type: application/json
```

**Request Body:** Same as create, all fields optional.

---

### Delete Credential
```http
DELETE /api/storage/credentials/:id
```

---

### Generate QR Code
```http
POST /api/storage/credentials/:id/qr-code
```

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

## Storage Quota Endpoints

### Get Storage Quota
```http
GET /api/storage/quota
```

**Response:**
```json
{
  "storage": {
    "usedBytes": 5242880,
    "limitBytes": 5368709120,
    "usedGB": 0.005,
    "limitGB": 5,
    "percentage": 0.1
  }
}
```

---

### Get Storage Statistics
```http
GET /api/storage/stats
```

**Response:**
```json
{
  "totalFiles": 50,
  "totalSize": 5242880,
  "filesByType": {
    "resume": 20,
    "template": 10,
    "backup": 5,
    "cover_letter": 15
  },
  "storage": {
    "usedBytes": 5242880,
    "limitBytes": 5368709120,
    "percentage": 0.1
  }
}
```

---

## Cloud Integration Endpoints

### List Integrations
```http
GET /api/storage/integrations
```

**Response:**
```json
{
  "integrations": [
    {
      "id": "int123",
      "provider": "google_drive",
      "isConnected": true,
      "accountEmail": "user@gmail.com",
      "quotaUsed": 1073741824,
      "quotaTotal": 15728640000,
      "connectedAt": "2024-01-10T08:00:00Z",
      "lastSyncAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Connect Cloud Service
```http
POST /api/storage/integrations/connect
Content-Type: application/json
```

**Request Body:**
```json
{
  "provider": "google_drive",
  "accessToken": "token-from-oauth",
  "refreshToken": "refresh-token",
  "accountEmail": "user@gmail.com"
}
```

**Response:**
```json
{
  "integration": {
    "id": "int123",
    "provider": "google_drive",
    "isConnected": true,
    "connectedAt": "2024-01-15T15:00:00Z"
  }
}
```

---

### Sync with Cloud
```http
POST /api/storage/integrations/:id/sync
```

**Response:**
```json
{
  "message": "Sync completed",
  "syncedFiles": 15,
  "lastSyncAt": "2024-01-15T15:30:00Z"
}
```

---

### Disconnect Cloud Service
```http
DELETE /api/storage/integrations/:id
```

**Response:**
```json
{
  "message": "Integration disconnected successfully"
}
```

---

## Access Logs Endpoints

### Get File Access Logs
```http
GET /api/storage/files/:id/access-logs
```

**Query Parameters:**
- `limit` (optional): Results limit
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "logs": [
    {
      "id": "log123",
      "userId": "user789",
      "userName": "John Doe",
      "action": "download",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-15T14:00:00Z"
    }
  ],
  "total": 25
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400,
  "details": {
    "field": "Additional error details"
  }
}
```

**Common Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `413`: Payload Too Large
- `429`: Too Many Requests
- `500`: Internal Server Error

