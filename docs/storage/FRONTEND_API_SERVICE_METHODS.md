# Frontend API Service Methods Reference

This document lists all the API service methods that need to be added to `apps/web/src/services/apiService.ts` for the cloud storage feature.

---

## File Management Methods

### getCloudFiles
```typescript
async getCloudFiles(folderId?: string, includeDeleted?: boolean): Promise<{
  files: ResumeFile[];
  total: number;
  limit: number;
  offset: number;
}>
```
**Endpoint:** `GET /api/storage/files`

---

### uploadStorageFile
```typescript
async uploadStorageFile(formData: FormData): Promise<{
  file: ResumeFile;
  storage: StorageInfo;
}>
```
**Endpoint:** `POST /api/storage/files/upload`

**Usage:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('displayName', 'My Resume');
formData.append('type', 'resume');
formData.append('folderId', 'folder123');
```

---

### downloadCloudFile
```typescript
async downloadCloudFile(fileId: string): Promise<Blob>
```
**Endpoint:** `GET /api/storage/files/:id/download`

---

### updateCloudFile
```typescript
async updateCloudFile(
  fileId: string, 
  updates: Partial<ResumeFile>
): Promise<{ file: ResumeFile }>
```
**Endpoint:** `PUT /api/storage/files/:id`

**Example:**
```typescript
await apiService.updateCloudFile('file123', {
  displayName: 'Updated Name',
  tags: ['new', 'tags'],
  isPublic: true
});
```

---

### deleteCloudFile
```typescript
async deleteCloudFile(fileId: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/files/:id`

---

### restoreCloudFile
```typescript
async restoreCloudFile(fileId: string): Promise<{ message: string; file: ResumeFile }>
```
**Endpoint:** `POST /api/storage/files/:id/restore`

---

### permanentlyDeleteCloudFile
```typescript
async permanentlyDeleteCloudFile(fileId: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/files/:id/permanent`

---

## Folder Management Methods

### getFolders
```typescript
async getFolders(): Promise<{ folders: Folder[] }>
```
**Endpoint:** `GET /api/storage/folders`

---

### createFolder
```typescript
async createFolder(data: {
  name: string;
  color?: string;
  parentId?: string;
}): Promise<{ folder: Folder }>
```
**Endpoint:** `POST /api/storage/folders`

---

### updateFolder
```typescript
async updateFolder(
  folderId: string, 
  updates: { name?: string; color?: string }
): Promise<{ folder: Folder }>
```
**Endpoint:** `PUT /api/storage/folders/:id`

---

### deleteFolder
```typescript
async deleteFolder(folderId: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/folders/:id`

---

## Sharing Methods

### shareFile
```typescript
async shareFile(
  fileId: string, 
  data: {
    userId: string;
    permission: 'view' | 'comment' | 'edit' | 'admin';
    expiresAt?: string;
  }
): Promise<{ share: SharePermission }>
```
**Endpoint:** `POST /api/storage/files/:id/share`

---

### deleteFileShare
```typescript
async deleteFileShare(shareId: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/shares/:id`

---

### updateFileShare
```typescript
async updateFileShare(
  shareId: string, 
  updates: { permission: 'view' | 'comment' | 'edit' | 'admin' }
): Promise<{ share: SharePermission }>
```
**Endpoint:** `PUT /api/storage/shares/:id`

---

### createShareLink
```typescript
async createShareLink(
  fileId: string, 
  options?: {
    password?: string;
    expiresAt?: string;
    maxDownloads?: number;
  }
): Promise<{ shareLink: ShareLink }>
```
**Endpoint:** `POST /api/storage/files/:id/share-link`

---

### deleteShareLink
```typescript
async deleteShareLink(linkId: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/share-links/:id`

---

## Comments Methods

### getFileComments
```typescript
async getFileComments(fileId: string): Promise<{ comments: FileComment[] }>
```
**Endpoint:** `GET /api/storage/files/:id/comments`

---

### addFileComment
```typescript
async addFileComment(
  fileId: string, 
  data: {
    content: string;
    parentId?: string;
  }
): Promise<{ comment: FileComment }>
```
**Endpoint:** `POST /api/storage/files/:id/comments`

---

### updateFileComment
```typescript
async updateFileComment(
  commentId: string, 
  data: { content: string }
): Promise<{ comment: FileComment }>
```
**Endpoint:** `PUT /api/storage/comments/:id`

---

### deleteFileComment
```typescript
async deleteFileComment(commentId: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/comments/:id`

---

### toggleCommentResolve
```typescript
async toggleCommentResolve(commentId: string): Promise<{ comment: FileComment }>
```
**Endpoint:** `POST /api/storage/comments/:id/resolve`

---

## Credential Methods

### getCredentials
```typescript
async getCredentials(): Promise<{ credentials: CredentialInfo[] }>
```
**Endpoint:** `GET /api/storage/credentials`

---

### getExpiringCredentials
```typescript
async getExpiringCredentials(days: number): Promise<{ credentials: CredentialInfo[] }>
```
**Endpoint:** `GET /api/storage/credentials/expiring?days=90`

---

### createCredential
```typescript
async createCredential(credential: CredentialInfo): Promise<{ credential: CredentialInfo }>
```
**Endpoint:** `POST /api/storage/credentials`

**Example:**
```typescript
await apiService.createCredential({
  credentialType: 'certification',
  name: 'AWS Solutions Architect',
  issuer: 'Amazon Web Services',
  issuedDate: '2022-01-15',
  expirationDate: '2025-01-15',
  fileId: 'file123'
});
```

---

### updateCredential
```typescript
async updateCredential(
  id: string, 
  updates: Partial<CredentialInfo>
): Promise<{ credential: CredentialInfo }>
```
**Endpoint:** `PUT /api/storage/credentials/:id`

---

### deleteCredential
```typescript
async deleteCredential(id: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/credentials/:id`

---

### generateCredentialQRCode
```typescript
async generateCredentialQRCode(id: string): Promise<{ qrCode: string }>
```
**Endpoint:** `POST /api/storage/credentials/:id/qr-code`

---

## Storage Quota Methods

### getStorageQuota
```typescript
async getStorageQuota(): Promise<{ storage: StorageInfo }>
```
**Endpoint:** `GET /api/storage/quota`

---

### getStorageStats
```typescript
async getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  storage: StorageInfo;
}>
```
**Endpoint:** `GET /api/storage/stats`

---

## Cloud Integration Methods

### getCloudIntegrations
```typescript
async getCloudIntegrations(): Promise<{ integrations: CloudIntegration[] }>
```
**Endpoint:** `GET /api/storage/integrations`

---

### connectCloudService
```typescript
async connectCloudService(data: {
  provider: 'google_drive' | 'dropbox' | 'onedrive';
  accessToken: string;
  refreshToken: string;
  accountEmail: string;
}): Promise<{ integration: CloudIntegration }>
```
**Endpoint:** `POST /api/storage/integrations/connect`

---

### syncCloudService
```typescript
async syncCloudService(integrationId: string): Promise<{
  message: string;
  syncedFiles: number;
  lastSyncAt: string;
}>
```
**Endpoint:** `POST /api/storage/integrations/:id/sync`

---

### disconnectCloudService
```typescript
async disconnectCloudService(integrationId: string): Promise<{ message: string }>
```
**Endpoint:** `DELETE /api/storage/integrations/:id`

---

## Access Logs Methods

### getFileAccessLogs
```typescript
async getFileAccessLogs(
  fileId: string, 
  options?: { limit?: number; offset?: number }
): Promise<{ logs: AccessLog[]; total: number }>
```
**Endpoint:** `GET /api/storage/files/:id/access-logs`

---

## Implementation Template

Add these methods to your `apiService.ts`:

```typescript
// ===== STORAGE ENDPOINTS =====

/**
 * Get cloud storage files
 */
async getCloudFiles(folderId?: string, includeDeleted?: boolean): Promise<any> {
  const params = new URLSearchParams();
  if (folderId) params.append('folderId', folderId);
  if (includeDeleted) params.append('includeDeleted', 'true');
  
  return this.request(`/api/storage/files?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });
}

/**
 * Upload storage file
 */
async uploadStorageFile(formData: FormData): Promise<any> {
  const response = await fetch(`${this.baseUrl}/api/storage/files/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return await response.json();
}

/**
 * Download cloud file
 */
async downloadCloudFile(fileId: string): Promise<Blob> {
  const response = await fetch(`${this.baseUrl}/api/storage/files/${fileId}/download`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download file');
  }

  return await response.blob();
}

/**
 * Update cloud file
 */
async updateCloudFile(fileId: string, updates: any): Promise<any> {
  return this.request(`/api/storage/files/${fileId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    credentials: 'include',
  });
}

/**
 * Delete cloud file (soft delete)
 */
async deleteCloudFile(fileId: string): Promise<any> {
  return this.request(`/api/storage/files/${fileId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Restore cloud file from trash
 */
async restoreCloudFile(fileId: string): Promise<any> {
  return this.request(`/api/storage/files/${fileId}/restore`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Permanently delete cloud file
 */
async permanentlyDeleteCloudFile(fileId: string): Promise<any> {
  return this.request(`/api/storage/files/${fileId}/permanent`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Get storage folders
 */
async getFolders(): Promise<any> {
  return this.request('/api/storage/folders', {
    method: 'GET',
    credentials: 'include',
  });
}

/**
 * Create folder
 */
async createFolder(data: { name: string; color?: string; parentId?: string }): Promise<any> {
  return this.request('/api/storage/folders', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
  });
}

/**
 * Update folder
 */
async updateFolder(folderId: string, updates: { name?: string; color?: string }): Promise<any> {
  return this.request(`/api/storage/folders/${folderId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    credentials: 'include',
  });
}

/**
 * Delete folder
 */
async deleteFolder(folderId: string): Promise<any> {
  return this.request(`/api/storage/folders/${folderId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Share file with user
 */
async shareFile(fileId: string, data: {
  userId: string;
  permission: string;
  expiresAt?: string;
}): Promise<any> {
  return this.request(`/api/storage/files/${fileId}/share`, {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
  });
}

/**
 * Delete file share
 */
async deleteFileShare(shareId: string): Promise<any> {
  return this.request(`/api/storage/shares/${shareId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Update file share permission
 */
async updateFileShare(shareId: string, updates: { permission: string }): Promise<any> {
  return this.request(`/api/storage/shares/${shareId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    credentials: 'include',
  });
}

/**
 * Create share link
 */
async createShareLink(fileId: string, options?: {
  password?: string;
  expiresAt?: string;
  maxDownloads?: number;
}): Promise<any> {
  return this.request(`/api/storage/files/${fileId}/share-link`, {
    method: 'POST',
    body: JSON.stringify(options || {}),
    credentials: 'include',
  });
}

/**
 * Get credentials
 */
async getCredentials(): Promise<any> {
  return this.request('/api/storage/credentials', {
    method: 'GET',
    credentials: 'include',
  });
}

/**
 * Get expiring credentials
 */
async getExpiringCredentials(days: number): Promise<any> {
  return this.request(`/api/storage/credentials/expiring?days=${days}`, {
    method: 'GET',
    credentials: 'include',
  });
}

/**
 * Create credential
 */
async createCredential(credential: any): Promise<any> {
  return this.request('/api/storage/credentials', {
    method: 'POST',
    body: JSON.stringify(credential),
    credentials: 'include',
  });
}

/**
 * Update credential
 */
async updateCredential(id: string, updates: any): Promise<any> {
  return this.request(`/api/storage/credentials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    credentials: 'include',
  });
}

/**
 * Delete credential
 */
async deleteCredential(id: string): Promise<any> {
  return this.request(`/api/storage/credentials/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Generate credential QR code
 */
async generateCredentialQRCode(id: string): Promise<any> {
  return this.request(`/api/storage/credentials/${id}/qr-code`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Get storage quota
 */
async getStorageQuota(): Promise<any> {
  return this.request('/api/storage/quota', {
    method: 'GET',
    credentials: 'include',
  });
}

/**
 * Get storage statistics
 */
async getStorageStats(): Promise<any> {
  return this.request('/api/storage/stats', {
    method: 'GET',
    credentials: 'include',
  });
}
```

---

## Error Handling

All methods should handle errors consistently:

```typescript
try {
  const result = await apiService.getCloudFiles();
  // Handle success
} catch (error: any) {
  if (error.statusCode === 401) {
    // Handle unauthorized
  } else if (error.statusCode === 403) {
    // Handle forbidden
  } else {
    // Handle other errors
    console.error('Storage API error:', error);
  }
}
```

---

## Type Definitions

Make sure these types are imported:

```typescript
import type {
  ResumeFile,
  Folder,
  SharePermission,
  ShareLink,
  FileComment,
  CredentialInfo,
  StorageInfo,
  CloudIntegration,
  AccessLog
} from '../types/cloudStorage';
```

