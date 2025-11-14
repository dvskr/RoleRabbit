# Files Tab - Complete Checklist (Start to Finish)

**Current Status**: 50% Complete (12/24 features working)
**Target**: 100% Production Ready
**Total Time**: 3 hours (minimum) to 2 weeks (complete)

---

## 🚀 START HERE - Quick Production Path (3 hours)

### Step 1: Database Migrations (1 hour)

Open terminal and run:

```bash
cd /home/user/RoleRabbit/apps/api
```

#### Migration 1: File Versions
- [ ] Run migration:
```bash
npx prisma migrate dev --name add_file_versions
```
- [ ] Verify: `psql $DATABASE_URL -c "\d file_versions"`
- [ ] **Unlocks**: File versioning feature

#### Migration 2: Share Links
- [ ] Run migration:
```bash
npx prisma migrate dev --name add_share_links
```
- [ ] Verify: `psql $DATABASE_URL -c "\d share_links"`
- [ ] **Unlocks**: Public share links feature

#### Migration 3: File Comments
- [ ] Run migration:
```bash
npx prisma migrate dev --name add_file_comments
```
- [ ] Verify: `psql $DATABASE_URL -c "\d file_comments"`
- [ ] **Unlocks**: Comments feature

#### Migration 4: Storage Quotas
- [ ] Run migration:
```bash
npx prisma migrate dev --name add_storage_quotas
```
- [ ] Verify: `psql $DATABASE_URL -c "\d storage_quotas"`
- [ ] Create default quotas for existing users:
```sql
psql $DATABASE_URL -c "
INSERT INTO storage_quotas (user_id, used_bytes, limit_bytes)
SELECT id, 0, 5368709120 FROM users
WHERE id NOT IN (SELECT user_id FROM storage_quotas);
"
```
- [ ] **Unlocks**: Storage quota enforcement

#### Migration 5: File Access Logs
- [ ] Run migration:
```bash
npx prisma migrate dev --name add_file_access_logs
```
- [ ] Verify: `psql $DATABASE_URL -c "\d file_access_logs"`
- [ ] **Unlocks**: Access logging and analytics

#### Migration 6: Verify Table Names
- [ ] Check current names:
```bash
psql $DATABASE_URL -c "\dt" | grep -E "storage_files|cloud_files|storage_folders|cloud_folders"
```
- [ ] If tables are named `cloud_*`, rename them:
```sql
psql $DATABASE_URL -c "
ALTER TABLE cloud_files RENAME TO storage_files;
ALTER TABLE cloud_folders RENAME TO storage_folders;
"
```
- [ ] Regenerate Prisma client:
```bash
npx prisma generate
```

---

### Step 2: Install Dependencies (5 minutes)

#### Install Sharp Package
- [ ] Install:
```bash
cd /home/user/RoleRabbit/apps/api
npm install sharp@^0.33.0
```
- [ ] Verify:
```bash
npm list sharp
```
- [ ] Test:
```bash
node -e "const sharp = require('sharp'); console.log('Sharp version:', sharp.versions);"
```
- [ ] **Unlocks**: Thumbnail generation

#### Verify Archiver
- [ ] Check:
```bash
npm list archiver
```
- [ ] If missing, install:
```bash
npm install archiver@^7.0.1
```
- [ ] **Status**: Should already be installed

---

### Step 3: Test Everything (1 hour)

#### Start Servers
- [ ] Terminal 1 - Start API:
```bash
cd /home/user/RoleRabbit/apps/api
npm run dev
```
- [ ] Terminal 2 - Start Web:
```bash
cd /home/user/RoleRabbit/apps/web
npm run dev
```

#### Get Auth Token
- [ ] Login to app: `http://localhost:3000`
- [ ] Open browser console
- [ ] Run: `localStorage.getItem('token')`
- [ ] Copy token for testing

Set in terminal:
```bash
export TOKEN="your-token-here"
```

#### Test 1: File Versioning
- [ ] Upload test file:
```bash
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test.pdf" \
  -F "type=document"
```
- [ ] Note the file ID from response
- [ ] Update file (creates version):
```bash
curl -X PUT http://localhost:3001/api/storage/files/{FILE_ID} \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test-v2.pdf"
```
- [ ] Get versions:
```bash
curl http://localhost:3001/api/storage/files/{FILE_ID}/versions \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] **Expected**: Version list with version 1
- [ ] **If fails**: Check migration ran, check logs

#### Test 2: Share Links
- [ ] Create share link:
```bash
curl -X POST http://localhost:3001/api/storage/files/{FILE_ID}/share-link \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expiresAt":"2025-12-31","maxDownloads":5}'
```
- [ ] Note the token from response
- [ ] Open in incognito: `http://localhost:3000/shared/{TOKEN}`
- [ ] Download the file
- [ ] **Expected**: File downloads successfully
- [ ] **If fails**: Check share_links table exists

#### Test 3: Comments
- [ ] Add comment:
```bash
curl -X POST http://localhost:3001/api/storage/files/{FILE_ID}/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Test comment"}'
```
- [ ] Get comments:
```bash
curl http://localhost:3001/api/storage/files/{FILE_ID}/comments \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] **Expected**: Comment appears in list
- [ ] **If fails**: Check file_comments table exists

#### Test 4: Storage Quotas
- [ ] Check quota:
```bash
curl http://localhost:3001/api/storage/quota \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] **Expected**: Shows used/limit in GB
- [ ] Upload a file and check quota updated
- [ ] **If fails**: Check storage_quotas table, check default quotas created

#### Test 5: Thumbnails
- [ ] Upload image:
```bash
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "type=document"
```
- [ ] Check API logs for "Thumbnail generated"
- [ ] Open file in UI, check thumbnail displays
- [ ] **Expected**: Thumbnail shows in file card
- [ ] **If fails**: Check sharp installed, check logs for errors

#### Test 6: Activity Timeline
- [ ] Perform operations (upload, download, share)
- [ ] Get activity:
```bash
curl http://localhost:3001/api/storage/files/{FILE_ID}/activity \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] **Expected**: All operations logged
- [ ] Open file in UI, click activity icon
- [ ] **Expected**: Activity modal shows timeline

---

### Step 4: Document Results (30 minutes)

- [ ] Create file: `TEST_RESULTS.md`
- [ ] List what works:
  - [ ] File versioning: ✅ / ❌
  - [ ] Share links: ✅ / ❌
  - [ ] Comments: ✅ / ❌
  - [ ] Quotas: ✅ / ❌
  - [ ] Thumbnails: ✅ / ❌
  - [ ] Activity: ✅ / ❌
- [ ] List any errors found
- [ ] Note which features are now working
- [ ] Update team on progress

**Result**: You should now be at **71% ready** (17/24 features working)

---

## 🎯 CHECKPOINT: Can You Stop Here?

**If you just need basic file management working:**
- ✅ Stop here and deploy
- ✅ You have core features: upload, download, delete, restore, share, search
- ⚠️ Missing: Batch upload UI, version history UI

**If you need full feature set:**
- ⏭️ Continue to next section

---

## 🔥 WEEK 1 - Complete Core Features (40 hours)

### Day 2-3: Batch Upload UI (8 hours)

#### Create BatchUploadModal Component

- [ ] Create file: `apps/web/src/components/cloudStorage/BatchUploadModal.tsx`

Copy this template:
```typescript
'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function BatchUploadModal({ isOpen, onClose, onUploadComplete }: BatchUploadModalProps) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newTasks: UploadTask[] = files.map(file => ({
      id: Math.random().toString(36),
      file,
      progress: 0,
      status: 'pending'
    }));
    setTasks(prev => [...prev, ...newTasks]);
  };

  const uploadFile = async (task: UploadTask) => {
    const formData = new FormData();
    formData.append('file', task.file);
    formData.append('type', 'document');

    const xhr = new XMLHttpRequest();

    return new Promise<void>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          setTasks(prev => prev.map(t =>
            t.id === task.id ? { ...t, progress, status: 'uploading' } : t
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          setTasks(prev => prev.map(t =>
            t.id === task.id ? { ...t, status: 'success', progress: 100 } : t
          ));
          resolve();
        } else {
          setTasks(prev => prev.map(t =>
            t.id === task.id ? { ...t, status: 'error', error: 'Upload failed' } : t
          ));
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        setTasks(prev => prev.map(t =>
          t.id === task.id ? { ...t, status: 'error', error: 'Network error' } : t
        ));
        reject(new Error('Network error'));
      });

      const token = localStorage.getItem('token');
      xhr.open('POST', 'http://localhost:3001/api/storage/files/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  const startUpload = async () => {
    setUploading(true);
    const pendingTasks = tasks.filter(t => t.status === 'pending');

    // Upload max 3 at a time
    for (let i = 0; i < pendingTasks.length; i += 3) {
      const batch = pendingTasks.slice(i, i + 3);
      await Promise.allSettled(batch.map(uploadFile));
    }

    setUploading(false);
    onUploadComplete();
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Batch Upload</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[400px]">
          {tasks.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Select files to upload</p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                accept=".pdf,.doc,.docx,image/*"
              />
              <label htmlFor="file-input" className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                Choose Files
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {task.status === 'success' && <CheckCircle size={20} className="text-green-600" />}
                      {task.status === 'error' && <AlertCircle size={20} className="text-red-600" />}
                      {task.status === 'uploading' && <Loader size={20} className="text-blue-600 animate-spin" />}
                      <span className="font-medium">{task.file.name}</span>
                      <span className="text-sm text-gray-500">
                        ({(task.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    {task.status === 'pending' && (
                      <button onClick={() => removeTask(task.id)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  {task.status !== 'pending' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          task.status === 'success' ? 'bg-green-600' :
                          task.status === 'error' ? 'bg-red-600' :
                          'bg-blue-600'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  {task.error && (
                    <p className="text-sm text-red-600 mt-1">{task.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {tasks.length} file(s) •{' '}
            {tasks.filter(t => t.status === 'success').length} uploaded •{' '}
            {tasks.filter(t => t.status === 'error').length} failed
          </div>
          <div className="flex gap-3">
            {tasks.length > 0 && (
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="add-more"
                accept=".pdf,.doc,.docx,image/*"
              />
            )}
            {tasks.length > 0 && !uploading && (
              <label htmlFor="add-more" className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                Add More
              </label>
            )}
            <button
              onClick={startUpload}
              disabled={uploading || tasks.filter(t => t.status === 'pending').length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Test component:
  - [ ] Select multiple files
  - [ ] Upload queue displays
  - [ ] Progress bars work
  - [ ] Can remove files before upload
  - [ ] Can add more files
  - [ ] Upload succeeds
  - [ ] Errors display correctly

#### Update UploadModal to Use Batch Upload

- [ ] Edit: `apps/web/src/components/cloudStorage/UploadModal.tsx`
- [ ] Add import:
```typescript
import { BatchUploadModal } from './BatchUploadModal';
```
- [ ] Add state:
```typescript
const [showBatchUpload, setShowBatchUpload] = useState(false);
```
- [ ] Add button:
```typescript
<button onClick={() => setShowBatchUpload(true)}>
  Upload Multiple Files
</button>
```
- [ ] Add modal:
```typescript
<BatchUploadModal
  isOpen={showBatchUpload}
  onClose={() => setShowBatchUpload(false)}
  onUploadComplete={() => {
    setShowBatchUpload(false);
    refreshFileList();
  }}
/>
```

---

### Day 4-5: Version History UI (4 hours)

#### Create VersionHistoryModal Component

- [ ] Create file: `apps/web/src/components/cloudStorage/VersionHistoryModal.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, RotateCcw, Trash2, Clock } from 'lucide-react';

interface Version {
  versionNumber: number;
  createdAt: string;
  size: number;
  changeNote?: string;
  user: {
    name: string;
    email: string;
  };
}

interface VersionHistoryModalProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (versionNumber: number) => void;
}

export function VersionHistoryModal({ fileId, isOpen, onClose, onRestore }: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fileId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/storage/files/${fileId}/versions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setVersions(data.versions);
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionNumber: number) => {
    if (!confirm(`Restore to version ${versionNumber}? This will create a new version.`)) {
      return;
    }
    onRestore(versionNumber);
    onClose();
  };

  const handleDownload = async (versionNumber: number) => {
    const token = localStorage.getItem('token');
    window.open(
      `http://localhost:3001/api/storage/files/${fileId}/versions/${versionNumber}/download?token=${token}`,
      '_blank'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Version History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No versions yet. Versions are created when you update a file.
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.versionNumber} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock size={20} className="text-gray-400" />
                        <div>
                          <div className="font-medium">
                            Version {version.versionNumber}
                            {version.versionNumber === versions.length && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(version.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {version.changeNote && (
                        <p className="text-sm text-gray-600 ml-8">{version.changeNote}</p>
                      )}
                      <div className="text-sm text-gray-500 ml-8">
                        {(version.size / 1024 / 1024).toFixed(2)} MB • {version.user.name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(version.versionNumber)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Download this version"
                      >
                        <Download size={18} />
                      </button>
                      {version.versionNumber !== versions.length && (
                        <button
                          onClick={() => handleRestore(version.versionNumber)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Restore this version"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Add Version Button to FileCard

- [ ] Edit: `apps/web/src/components/cloudStorage/FileCard.tsx`
- [ ] Add import:
```typescript
import { VersionHistoryModal } from './VersionHistoryModal';
import { History } from 'lucide-react';
```
- [ ] Add state:
```typescript
const [showVersionHistory, setShowVersionHistory] = useState(false);
```
- [ ] Add button in actions menu:
```typescript
<button
  onClick={() => setShowVersionHistory(true)}
  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded"
>
  <History size={16} />
  View Versions
</button>
```
- [ ] Add modal:
```typescript
<VersionHistoryModal
  fileId={file.id}
  isOpen={showVersionHistory}
  onClose={() => setShowVersionHistory(false)}
  onRestore={async (versionNumber) => {
    // Call restore API
    const token = localStorage.getItem('token');
    await fetch(
      `http://localhost:3001/api/storage/files/${file.id}/versions/${versionNumber}/restore`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
    );
    // Refresh file list
    window.location.reload();
  }}
/>
```

- [ ] Test version history:
  - [ ] Upload file
  - [ ] Update file multiple times
  - [ ] Open version history
  - [ ] Verify all versions show
  - [ ] Test restore version
  - [ ] Test download version

---

### Day 6: Backend Fixes (3 hours)

#### Fix Share Link Download Tracking

- [ ] Edit: `apps/api/prisma/schema.prisma`
- [ ] Find `model ShareLink` and add fields:
```prisma
model ShareLink {
  // ... existing fields
  downloadCount Int @default(0)
  lastAccessedAt DateTime?
}
```

- [ ] Run migration:
```bash
cd /home/user/RoleRabbit/apps/api
npx prisma migrate dev --name add_share_link_download_tracking
```

- [ ] Edit: `apps/api/routes/storage.routes.js`
- [ ] Find the share link download endpoint (around line 2672)
- [ ] Add before download:
```javascript
// Check max downloads
if (shareLink.maxDownloads && shareLink.downloadCount >= shareLink.maxDownloads) {
  return reply.status(403).send({
    error: 'Download limit exceeded',
    message: 'This share link has reached its maximum download limit'
  });
}

// Increment download count
await prisma.shareLink.update({
  where: { id: shareLink.id },
  data: {
    downloadCount: { increment: 1 },
    lastAccessedAt: new Date()
  }
});
```

- [ ] Remove TODO comment at line 1161
- [ ] Test:
  - [ ] Create share link with maxDownloads: 2
  - [ ] Download file twice (should work)
  - [ ] Try third download (should fail with limit exceeded)

#### Add Thumbnail Generation to Upload

- [ ] Edit: `apps/api/routes/storage.routes.js`
- [ ] Find upload endpoint (around line 537)
- [ ] Add after successful upload:
```javascript
// After savedFile is created
if (savedFile && contentType.startsWith('image/')) {
  // Generate thumbnail asynchronously
  setImmediate(async () => {
    try {
      const fileBuffer = await storageHandler.downloadAsBuffer(savedFile.storagePath);
      await thumbnailService.generateThumbnail(savedFile.id, fileBuffer, 'medium');
      logger.info(`✅ Thumbnail generated for file: ${savedFile.id}`);
    } catch (err) {
      logger.error('❌ Thumbnail generation failed:', err);
      // Don't fail upload if thumbnail fails
    }
  });
}
```

- [ ] Test:
  - [ ] Upload image file
  - [ ] Check logs for "Thumbnail generated"
  - [ ] Verify thumbnail displays in UI

---

## 📊 CHECKPOINT 2: Week 1 Complete

**At this point you should have:**
- ✅ All migrations run
- ✅ Dependencies installed
- ✅ All core features tested and working
- ✅ Batch upload UI implemented
- ✅ Version history UI implemented
- ✅ Backend fixes complete

**Status**: **92% ready** (22/24 features working)

**Can you deploy now?**
- ✅ Yes, if you're okay without extensive tests
- ⏭️ Or continue to Week 2 for full testing

---

## 🧪 WEEK 2 - Testing & Deployment (40 hours)

### Days 7-9: Write Tests (20 hours)

#### Integration Tests (10 hours)

- [ ] Create file: `apps/api/__tests__/storage.integration.test.js`

```javascript
const request = require('supertest');
const { prisma } = require('../utils/db');

describe('Storage API Integration Tests', () => {
  let authToken;
  let testFileId;

  beforeAll(async () => {
    // Get auth token
    const loginRes = await request('http://localhost:3001')
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'test123' });
    authToken = loginRes.body.token;
  });

  describe('File Upload', () => {
    test('should upload file successfully', async () => {
      const res = await request('http://localhost:3001')
        .post('/api/storage/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test content'), 'test.txt')
        .field('type', 'document');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.file).toHaveProperty('id');
      testFileId = res.body.file.id;
    });

    test('should enforce file size limit', async () => {
      // Create 11MB buffer
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const res = await request('http://localhost:3001')
        .post('/api/storage/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeBuffer, 'large.txt')
        .field('type', 'document');

      expect(res.status).toBe(400);
    });
  });

  describe('File Versioning', () => {
    test('should create version on update', async () => {
      // Update file
      await request('http://localhost:3001')
        .put(`/api/storage/files/${testFileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('updated content'), 'test.txt');

      // Check versions
      const res = await request('http://localhost:3001')
        .get(`/api/storage/files/${testFileId}/versions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.versions.length).toBeGreaterThan(0);
    });
  });

  describe('Share Links', () => {
    let shareToken;

    test('should create share link', async () => {
      const res = await request('http://localhost:3001')
        .post(`/api/storage/files/${testFileId}/share-link`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ maxDownloads: 2 });

      expect(res.status).toBe(200);
      expect(res.body.share).toHaveProperty('token');
      shareToken = res.body.share.token;
    });

    test('should enforce max downloads', async () => {
      // Download twice (should work)
      await request('http://localhost:3001')
        .get(`/api/storage/shared/${shareToken}/download`);
      await request('http://localhost:3001')
        .get(`/api/storage/shared/${shareToken}/download`);

      // Third download should fail
      const res = await request('http://localhost:3001')
        .get(`/api/storage/shared/${shareToken}/download`);

      expect(res.status).toBe(403);
    });
  });

  // Add more test suites for comments, quotas, etc.

  afterAll(async () => {
    // Cleanup
    if (testFileId) {
      await prisma.storageFile.delete({ where: { id: testFileId } });
    }
    await prisma.$disconnect();
  });
});
```

- [ ] Run tests:
```bash
cd /home/user/RoleRabbit/apps/api
npm test
```

#### Frontend Tests (8 hours)

- [ ] Install testing library:
```bash
cd /home/user/RoleRabbit/apps/web
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

- [ ] Create test file: `apps/web/src/components/cloudStorage/__tests__/FileCard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import FileCard from '../FileCard';

describe('FileCard', () => {
  const mockFile = {
    id: '1',
    name: 'test.pdf',
    type: 'document',
    size: 1024000,
    createdAt: new Date().toISOString(),
  };

  test('renders file name', () => {
    render(<FileCard file={mockFile} />);
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  test('handles download click', () => {
    const onDownload = jest.fn();
    render(<FileCard file={mockFile} onDownload={onDownload} />);

    fireEvent.click(screen.getByLabelText('Download'));
    expect(onDownload).toHaveBeenCalledWith(mockFile);
  });

  // Add more tests
});
```

- [ ] Run tests:
```bash
npm test
```

#### Load Tests (4 hours)

- [ ] Install K6:
```bash
brew install k6  # macOS
# or
sudo apt-get install k6  # Linux
```

- [ ] Create file: `load-tests/upload-load-test.js`

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp to 100 users
    { duration: '2m', target: 500 },   // Ramp to 500 users
    { duration: '3m', target: 1000 },  // Sustain 1000 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 95% under 5s
    http_req_failed: ['rate<0.1'],      // Error rate under 10%
  },
};

const TOKEN = 'YOUR_TOKEN_HERE';

export default function () {
  const fileContent = 'test file content';
  const formData = {
    file: http.file(fileContent, 'test.txt', 'text/plain'),
    type: 'document',
  };

  const res = http.post('http://localhost:3001/api/storage/files/upload', formData, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  check(res, {
    'upload successful': (r) => r.status === 201,
  });
}
```

- [ ] Run load test:
```bash
k6 run load-tests/upload-load-test.js
```

- [ ] Monitor:
  - [ ] CPU usage
  - [ ] Memory usage
  - [ ] Database connections
  - [ ] Response times
  - [ ] Error rate

- [ ] Document results

---

### Days 10-11: Security & Accessibility (6 hours)

#### Security Tests (3 hours)

- [ ] Test SQL injection:
```bash
curl "http://localhost:3001/api/storage/search/advanced?q=' OR '1'='1"
```
Expected: No SQL error, sanitized

- [ ] Test XSS:
```bash
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "description=<script>alert('XSS')</script>"
```
Expected: Script tags escaped

- [ ] Test path traversal:
```bash
curl "http://localhost:3001/api/storage/files/../../etc/passwd/download" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: 403 or 404

- [ ] Test authentication:
```bash
curl http://localhost:3001/api/storage/files
```
Expected: 401 Unauthorized

- [ ] Run npm audit:
```bash
cd /home/user/RoleRabbit/apps/api
npm audit
npm audit fix
```

#### Accessibility Tests (3 hours)

- [ ] Install tools:
```bash
cd /home/user/RoleRabbit/apps/web
npm install -D @axe-core/playwright pa11y
```

- [ ] Run axe:
```bash
npx playwright test accessibility
```

- [ ] Run pa11y:
```bash
npx pa11y http://localhost:3000/dashboard?tab=storage
```

- [ ] Manual keyboard test:
  - [ ] Tab through all elements
  - [ ] Enter to activate buttons
  - [ ] Escape to close modals
  - [ ] All interactive elements accessible

- [ ] Screen reader test (if available):
  - [ ] File list announced
  - [ ] Buttons have labels
  - [ ] Forms accessible
  - [ ] Errors announced

- [ ] Fix all critical violations

---

### Days 12-13: Documentation Updates (3 hours)

- [ ] Update `PRODUCTION_READINESS_SUMMARY.md`:
  - [ ] Change status to 92%
  - [ ] Update feature table
  - [ ] Add test results section

- [ ] Mark P2 features as "Planned":
  - [ ] Edit `P2_03_WEBHOOK_NOTIFICATIONS.md` - add "⚠️ PLANNED - Not Implemented" banner
  - [ ] Edit `P2_05_OFFLINE_SUPPORT.md` - add "⚠️ PLANNED - Not Implemented" banner
  - [ ] Edit `P2_06_REALTIME_COLLABORATION.md` - add "⚠️ PARTIAL - Backend only" banner

- [ ] Create `KNOWN_ISSUES.md`:
```markdown
# Known Issues

## Not Implemented
- P2 features (webhooks, offline support, real-time UI)

## Limitations
- Batch upload UI basic version (no retry from queue)
- Version history shows all versions (no pagination yet)

## Workarounds
- For batch upload: Use multiple single uploads
- For version history: Limit to 10 most recent versions
```

- [ ] Update `README.md`:
```markdown
## Setup

1. Install dependencies
2. **IMPORTANT: Run migrations**
   ```bash
   cd apps/api
   npx prisma migrate deploy
   npm install sharp@^0.33.0
   ```
3. Start development server
```

---

### Days 14-15: Deployment (8 hours)

#### Production Environment Setup

- [ ] Set environment variables:
```bash
# Production .env
DATABASE_URL="postgresql://user:pass@host:5432/roleready_prod"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
JWT_SECRET="$(openssl rand -hex 32)"
NODE_ENV="production"
CORS_ORIGIN="https://app.roleready.com"
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_STORAGE_LIMIT=5368709120
```

- [ ] Create production database:
```bash
createdb roleready_production
```

- [ ] Run migrations on production:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

- [ ] Verify tables:
```bash
psql $DATABASE_URL -c "\dt"
```

#### Build & Deploy to Staging

- [ ] Build frontend:
```bash
cd /home/user/RoleRabbit/apps/web
npm run build
```

- [ ] Test build:
```bash
npm run start
```

- [ ] Deploy to staging server
- [ ] Run smoke tests on staging:
  - [ ] Upload file
  - [ ] Download file
  - [ ] Create share link
  - [ ] Test versions
  - [ ] Test comments
  - [ ] Test batch upload

#### Deploy to Production

- [ ] Deploy application
- [ ] Run smoke tests on production
- [ ] Monitor error rates (first hour)
- [ ] Monitor performance metrics
- [ ] Check database connections
- [ ] Verify file uploads working

#### Post-Deployment Monitoring

- [ ] Set up Sentry:
```bash
npm install @sentry/node @sentry/react
```

- [ ] Configure alerts:
  - [ ] High error rate (>5%)
  - [ ] Slow response times (>5s)
  - [ ] Database connection issues
  - [ ] Storage quota exceeded

- [ ] Create rollback plan:
```bash
# Backup database
pg_dump roleready_production > backup_$(date +%Y%m%d).sql

# Rollback steps documented
```

- [ ] Monitor for 24-48 hours

---

## ✅ FINAL CHECKPOINT: Production Deployed!

**You now have:**
- ✅ All migrations run
- ✅ All dependencies installed
- ✅ All core features working (92%)
- ✅ Batch upload UI
- ✅ Version history UI
- ✅ Integration tests
- ✅ Load tests passed
- ✅ Security tests passed
- ✅ Accessibility tests passed
- ✅ Documentation updated
- ✅ Deployed to production
- ✅ Monitoring in place

**Status**: **Production Ready! 🎉**

---

## 📋 Optional: P2 Features (If Needed)

Only implement if actually required:

### Webhooks (12 hours)
- [ ] Create `apps/api/services/webhookService.js`
- [ ] Add webhook routes
- [ ] Implement delivery queue
- [ ] Test webhook delivery

### Offline Support (15 hours)
- [ ] Create service worker: `apps/web/public/sw.js`
- [ ] Create PWA manifest
- [ ] Implement caching strategies
- [ ] Test offline functionality

### Real-time Collaboration UI (16 hours)
- [ ] Create presence indicators
- [ ] Add live comment updates
- [ ] Add live file updates
- [ ] Test with multiple users

### CDN Integration (6 hours)
- [ ] Integrate CloudFlare API
- [ ] Implement cache purging
- [ ] Add signed URLs
- [ ] Measure performance improvement

---

## 📊 Progress Tracking Template

Copy this to track your progress:

```markdown
## Week 1 Progress

### Day 1: Critical Fixes
- [ ] Run 6 migrations
- [ ] Install dependencies
- [ ] Test everything
- Status: __% complete

### Days 2-3: Batch Upload
- [ ] Create BatchUploadModal
- [ ] Update UploadModal
- [ ] Test batch upload
- Status: __% complete

### Days 4-5: Version History
- [ ] Create VersionHistoryModal
- [ ] Update FileCard
- [ ] Test version history
- Status: __% complete

### Day 6: Backend Fixes
- [ ] Fix share link tracking
- [ ] Add thumbnail generation
- [ ] Test fixes
- Status: __% complete

## Week 2 Progress

### Days 7-9: Testing
- [ ] Integration tests
- [ ] Frontend tests
- [ ] Load tests
- [ ] Security tests
- Status: __% complete

### Days 10-11: Documentation
- [ ] Update readiness summary
- [ ] Mark P2 as planned
- [ ] Create known issues
- [ ] Update README
- Status: __% complete

### Days 12-13: Deployment
- [ ] Setup production env
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Monitor
- Status: __% complete

## Overall Status
- Features Working: __/24 (__%)
- Tests Complete: __/5
- Deployed: Yes / No
- Production Ready: Yes / No
```

---

## 🆘 Troubleshooting

### Migration Fails
```bash
# Reset and retry
npx prisma migrate reset
npx prisma migrate dev
```

### Sharp Installation Fails
```bash
# Try with Python 3
npm install --python=python3 sharp

# Or use pre-built binary
npm install --platform=linux --arch=x64 sharp
```

### Tests Fail
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install
```

### Build Fails
```bash
# Check Node version
node --version  # Should be 18+

# Clear build cache
rm -rf .next
npm run build
```

---

## 📞 Support

**Documentation:**
- Full audit: `SEMI_IMPLEMENTATIONS_AUDIT.md`
- Simple checklist: `COMPLETION_CHECKLIST.md`
- Testing guide: `PRODUCTION_TESTING_GUIDE.md`
- Readiness summary: `PRODUCTION_READINESS_SUMMARY.md`

**Quick Commands:**
```bash
# Migrations
cd /home/user/RoleRabbit/apps/api
npx prisma migrate dev --name <name>

# Install deps
npm install sharp@^0.33.0

# Test
npm test

# Build
npm run build

# Start
npm run dev
```

---

**Ready to start? Begin with Step 1: Database Migrations! 🚀**

---

*Last Updated: 2025-11-14*
*Version: 2.0 - Complete Start-to-Finish Guide*
*Estimated Total Time: 3 hours (minimum) to 2 weeks (complete)*
