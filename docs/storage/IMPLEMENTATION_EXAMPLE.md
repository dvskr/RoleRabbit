# Storage Backend Implementation Example

This document provides example implementations for key storage features.

## Example: File Upload Route

```javascript
// apps/api/routes/storage.routes.js

const fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');
const storageHandler = require('../utils/storageHandler');
const { authenticate } = require('../middleware/auth');
const { validateFileUpload } = require('../utils/storageValidation');

const prisma = new PrismaClient();

async function storageRoutes(fastify, options) {
  // File Upload
  fastify.post('/files/upload', {
    preHandler: [authenticate],
    onRequest: fastify.multipart
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      
      // Get file from multipart form
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({
          error: 'No file provided',
          message: 'Please provide a file to upload'
        });
      }

      // Validate file
      const fileSize = data.file.readableLength || 0;
      const validation = await validateFileUpload(
        data.file,
        data.filename,
        data.mimetype,
        fileSize
      );
      if (!validation.valid) {
        return reply.status(400).send({
          error: 'File validation failed',
          message: validation.errors.join(', ')
        });
      }

      // Check storage quota
      const quota = await prisma.storageQuota.findUnique({
        where: { userId }
      });

      const newFileSize = data.file.readableLength || 0;
      if (quota.usedBytes + BigInt(newFileSize) > quota.limitBytes) {
        return reply.status(403).send({
          error: 'Storage quota exceeded',
          message: 'You have exceeded your storage limit. Please upgrade or delete files.'
        });
      }

      // Upload file to storage
      const fileSize = data.file.readableLength || 0;
      const storageResult = await storageHandler.upload(
        data.file,
        userId,
        data.filename,
        data.mimetype
      );
      
      // Get additional metadata from form
      const displayName = request.body.displayName || data.filename;
      const type = request.body.type || 'document';
      const tags = request.body.tags ? request.body.tags.split(',') : [];
      const description = request.body.description || null;
      const isPublic = request.body.isPublic === 'true';
      const folderId = request.body.folderId || null;

      // Save file metadata to database
      const file = await prisma.storageFile.create({
        data: {
          userId,
          name: displayName,
          fileName: data.filename,
          type,
          contentType: data.mimetype,
          size: BigInt(newFileSize),
          storagePath: storageResult.path,
          tags,
          description,
          isPublic,
          folderId,
          thumbnail: storageResult.thumbnail
        }
      });

      // Update storage quota
      await prisma.storageQuota.update({
        where: { userId },
        data: {
          usedBytes: quota.usedBytes + BigInt(newFileSize)
        }
      });

      // Log access
      await prisma.accessLog.create({
        data: {
          fileId: file.id,
          userId,
          action: 'upload'
        }
      });

      reply.status(201).send({
        file: {
          id: file.id,
          name: file.name,
          size: Number(file.size),
          storagePath: file.storagePath,
          createdAt: file.createdAt
        },
        storage: {
          usedBytes: Number(quota.usedBytes + BigInt(newFileSize)),
          limitBytes: Number(quota.limitBytes),
          percentage: Number(((quota.usedBytes + BigInt(newFileSize)) * 100n) / quota.limitBytes)
        }
      });
    } catch (error) {
      fastify.log.error('File upload error:', error);
      reply.status(500).send({
        error: 'Upload failed',
        message: 'An error occurred while uploading the file'
      });
    }
  });
}

module.exports = storageRoutes;
```

---

## Example: Storage Handler Usage

The storage handler has been implemented! See `apps/api/utils/storageHandler.js` for the complete implementation.

**Key Features:**
- ✅ Supabase Storage support (production)
- ✅ Local filesystem fallback (development)
- ✅ Automatic initialization
- ✅ File upload/download/delete
- ✅ Signed URLs for sharing
- ✅ File metadata retrieval

**Usage Example:**
```javascript
const storageHandler = require('../utils/storageHandler');

// Upload file
const result = await storageHandler.upload(
  fileStream.file,
  userId,
  fileStream.filename,
  fileStream.mimetype
);
// Returns: { path, fullPath, publicUrl, displayName, size }

// Download file
const fileStream = await storageHandler.download(storagePath);
// Returns: Readable stream

// Delete file
await storageHandler.deleteFile(storagePath);

// Get download URL (signed URL for Supabase)
const url = await storageHandler.getDownloadUrl(storagePath, 3600);
// Returns: Temporary signed URL valid for 1 hour
```

**Storage Configuration:**
- Set `STORAGE_TYPE=supabase` for production (uses Supabase Storage)
- Set `STORAGE_TYPE=local` for development (uses local filesystem)
- Handler automatically falls back if Supabase not configured

See **[SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)** for complete setup instructions.

---

## Example: Storage Validation

```javascript
// apps/api/utils/storageValidation.js

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

async function validateFileUpload(fileStream, userId) {
  const errors = [];

  // Check file size
  const fileSize = fileStream.file.readableLength || 0;
  if (fileSize > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(fileStream.mimetype)) {
    errors.push(`File type ${fileStream.mimetype} is not allowed`);
  }

  // Check file extension
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
  const fileExtension = path.extname(fileStream.filename).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension ${fileExtension} is not allowed`);
  }

  // Additional security checks
  // - Scan for viruses (optional)
  // - Check file content matches extension
  // - Validate filename

  return {
    valid: errors.length === 0,
    error: errors.join(', ')
  };
}

function validateFolderName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Folder name cannot be empty' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Folder name must be less than 100 characters' };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { valid: false, error: 'Folder name contains invalid characters' };
  }

  return { valid: true };
}

module.exports = {
  validateFileUpload,
  validateFolderName
};
```

---

## Example: Folder Operations Service

```javascript
// apps/api/utils/storageService.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StorageService {
  async createFolder(userId, data) {
    // Validate parent folder exists and belongs to user
    if (data.parentId) {
      const parent = await prisma.storageFolder.findFirst({
        where: {
          id: data.parentId,
          userId,
          deletedAt: null
        }
      });

      if (!parent) {
        throw new Error('Parent folder not found');
      }
    }

    // Check for duplicate folder name in same parent
    const existing = await prisma.storageFolder.findFirst({
      where: {
        userId,
        name: data.name,
        parentId: data.parentId || null,
        deletedAt: null
      }
    });

    if (existing) {
      throw new Error('Folder with this name already exists');
    }

    return await prisma.storageFolder.create({
      data: {
        userId,
        name: data.name,
        color: data.color,
        parentId: data.parentId || null
      }
    });
  }

  async deleteFolder(userId, folderId) {
    // Check if folder belongs to user
    const folder = await prisma.storageFolder.findFirst({
      where: {
        id: folderId,
        userId,
        deletedAt: null
      },
      include: {
        files: true,
        children: true
      }
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    // Check if folder has files or subfolders
    if (folder.files.length > 0 || folder.children.length > 0) {
      // Option 1: Move files to root
      await prisma.storageFile.updateMany({
        where: { folderId },
        data: { folderId: null }
      });

      // Option 2: Soft delete folder and all contents
      // await this.softDeleteFolderRecursive(folderId);
    }

    // Soft delete folder
    return await prisma.storageFolder.update({
      where: { id: folderId },
      data: { deletedAt: new Date() }
    });
  }

  async softDeleteFolderRecursive(folderId) {
    const folder = await prisma.storageFolder.findUnique({
      where: { id: folderId },
      include: { children: true, files: true }
    });

    // Soft delete all files
    if (folder.files.length > 0) {
      await prisma.storageFile.updateMany({
        where: { folderId },
        data: { deletedAt: new Date() }
      });
    }

    // Recursively delete children
    for (const child of folder.children) {
      await this.softDeleteFolderRecursive(child.id);
    }

    // Delete this folder
    await prisma.storageFolder.update({
      where: { id: folderId },
      data: { deletedAt: new Date() }
    });
  }
}

module.exports = new StorageService();
```

---

## Example: Share Link Generation

```javascript
// In storage.routes.js

fastify.post('/files/:id/share-link', {
  preHandler: [authenticate]
}, async (request, reply) => {
  try {
    const userId = request.user.id;
    const fileId = request.params.id;
    const { password, expiresAt, maxDownloads } = request.body;

    // Verify file belongs to user
    const file = await prisma.storageFile.findFirst({
      where: {
        id: fileId,
        userId,
        deletedAt: null
      }
    });

    if (!file) {
      return reply.status(404).send({
        error: 'File not found'
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash password if provided
    const hashedPassword = password 
      ? await bcrypt.hash(password, 10)
      : null;

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        fileId,
        userId,
        token,
        password: hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxDownloads: maxDownloads || null
      }
    });

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${token}`;

    reply.send({
      shareLink: {
        id: shareLink.id,
        url: shareUrl,
        token: shareLink.token,
        expiresAt: shareLink.expiresAt,
        maxDownloads: shareLink.maxDownloads
      }
    });
  } catch (error) {
    fastify.log.error('Share link creation error:', error);
    reply.status(500).send({
      error: 'Failed to create share link'
    });
  }
});
```

---

## Example: Access Logging Middleware

```javascript
// apps/api/utils/storageMiddleware.js

async function logFileAccess(fileId, userId, action, request) {
  try {
    await prisma.accessLog.create({
      data: {
        fileId,
        userId,
        action,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      }
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to log file access:', error);
  }
}

module.exports = {
  logFileAccess
};
```

