# Bulk Operations Implementation

## Overview
Enable users to upload/download/delete multiple files at once with progress tracking and error recovery.

## Features
- ✅ Multi-file upload (drag & drop)
- ✅ Bulk download (as ZIP)
- ✅ Bulk delete with confirmation
- ✅ Progress tracking
- ✅ Error recovery

## Implementation

### 1. Multi-File Upload (Frontend)

```typescript
// BulkUploadModal.tsx
import { useDropzone } from 'react-dropzone';

export function BulkUploadModal() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    },
    multiple: true,
    maxFiles: 50, // Limit to 50 files at once
    maxSize: 10 * 1024 * 1024 // 10MB per file
  });

  const handleBulkUpload = async () => {
    const uploads = files.map(async (file, index) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/storage/files/upload', {
          method: 'POST',
          body: formData,
          onUploadProgress: (e) => {
            setProgress(prev => ({
              ...prev,
              [file.name]: (e.loaded / e.total) * 100
            }));
          }
        });

        return { success: true, file: file.name };
      } catch (error) {
        return { success: false, file: file.name, error };
      }
    });

    const results = await Promise.allSettled(uploads);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    alert(`✅ ${successful} uploaded, ❌ ${failed} failed`);
  };

  return (
    <div>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select</p>
        <p className="text-sm">(Max 50 files, 10MB each)</p>
      </div>

      <div className="file-list">
        {files.map(file => (
          <div key={file.name} className="file-item">
            <span>{file.name}</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            {progress[file.name] && (
              <div className="progress-bar">
                <div style={{ width: `${progress[file.name]}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleBulkUpload} disabled={files.length === 0}>
        Upload {files.length} Files
      </button>
    </div>
  );
}
```

### 2. Bulk Download as ZIP (Backend)

```javascript
// In storage.routes.js
const archiver = require('archiver');

fastify.post('/files/bulk-download', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const { fileIds } = request.body;
  const userId = request.user?.userId || request.user?.id;

  if (!fileIds || fileIds.length === 0) {
    return reply.status(400).send({ error: 'No files specified' });
  }

  // Limit to 100 files
  if (fileIds.length > 100) {
    return reply.status(400).send({ error: 'Maximum 100 files allowed' });
  }

  // Check permissions for all files
  const files = await prisma.storageFile.findMany({
    where: {
      id: { in: fileIds },
      userId // Only user's own files
    }
  });

  if (files.length === 0) {
    return reply.status(404).send({ error: 'No accessible files found' });
  }

  // Create ZIP archive
  const archive = archiver('zip', { zlib: { level: 9 } });

  reply.type('application/zip');
  reply.header('Content-Disposition', 'attachment; filename="files.zip"');

  archive.pipe(reply.raw);

  // Add each file to archive
  for (const file of files) {
    try {
      const fileBuffer = await storageHandler.downloadAsBuffer(file.storagePath);
      archive.append(fileBuffer, { name: file.fileName });
    } catch (error) {
      logger.error(`Failed to add file ${file.id} to archive:`, error);
      // Continue with other files
    }
  }

  await archive.finalize();
});
```

### 3. Bulk Delete with Confirmation

```typescript
// BulkDeleteConfirmation.tsx
export function BulkDeleteConfirmation({ fileIds, onConfirm, onCancel }: Props) {
  const [confirmText, setConfirmText] = useState('');
  const fileCount = fileIds.length;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    // Delete files in parallel
    const deletePromises = fileIds.map(id =>
      apiService.deleteCloudFile(id)
    );

    try {
      await Promise.all(deletePromises);
      onConfirm();
    } catch (error) {
      alert('Some files failed to delete');
    }
  };

  return (
    <div className="modal">
      <h2>⚠️ Delete {fileCount} Files?</h2>
      <p>This action will move {fileCount} files to the recycle bin.</p>

      <input
        type="text"
        placeholder="Type DELETE to confirm"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
      />

      <div className="actions">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={handleDelete}
          disabled={confirmText !== 'DELETE'}
          className="danger"
        >
          Delete {fileCount} Files
        </button>
      </div>
    </div>
  );
}
```

### 4. Bulk Move to Folder

```typescript
async function handleBulkMove(fileIds: string[], targetFolderId: string) {
  const results = await Promise.allSettled(
    fileIds.map(id =>
      apiService.updateCloudFile(id, { folderId: targetFolderId })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed };
}
```

### 5. Batch API Endpoint (Backend)

```javascript
// Batch operations endpoint
fastify.post('/files/batch', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const { operations } = request.body;
  const userId = request.user?.userId || request.user?.id;

  // operations = [
  //   { action: 'delete', fileId: '123' },
  //   { action: 'move', fileId: '456', folderId: '789' },
  //   { action: 'star', fileId: '101' }
  // ]

  const results = [];

  for (const op of operations) {
    try {
      let result;

      switch (op.action) {
        case 'delete':
          await prisma.storageFile.update({
            where: { id: op.fileId, userId },
            data: { deletedAt: new Date() }
          });
          result = { success: true };
          break;

        case 'move':
          await prisma.storageFile.update({
            where: { id: op.fileId, userId },
            data: { folderId: op.folderId }
          });
          result = { success: true };
          break;

        case 'star':
          await prisma.storageFile.update({
            where: { id: op.fileId, userId },
            data: { isStarred: !op.currentValue }
          });
          result = { success: true };
          break;

        default:
          result = { success: false, error: 'Unknown action' };
      }

      results.push({ ...op, ...result });
    } catch (error) {
      results.push({ ...op, success: false, error: error.message });
    }
  }

  return reply.send({
    success: true,
    results,
    summary: {
      total: operations.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  });
});
```

## Install Dependencies

```bash
cd apps/api
npm install archiver

cd apps/web
npm install react-dropzone
```

## Cost
- archiver: Free
- react-dropzone: Free
- Bandwidth for ZIP downloads: $0.09/GB

## Implementation Time: 8-10 hours

## Testing

```bash
# Test bulk upload
curl -X POST http://localhost:5000/api/storage/files/batch \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"operations": [{"action": "delete", "fileId": "123"}]}'

# Test bulk download
curl -X POST http://localhost:5000/api/storage/files/bulk-download \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fileIds": ["123", "456"]}' \
  --output files.zip
```
