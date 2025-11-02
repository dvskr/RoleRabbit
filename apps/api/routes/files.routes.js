/**
 * File Routes Module
 * 
 * Handles all file-related routes including:
 * - File uploads
 * - Cloud file management
 */

const {
  getCloudFilesByUserId,
  getCloudFileById,
  createCloudFile,
  updateCloudFile,
  deleteCloudFile,
  permanentlyDeleteCloudFile,
  restoreCloudFile,
  getCloudFilesByFolder,
  incrementDownloadCount
} = require('../utils/cloudFiles');
const { 
  getFileShares,
  createFileShare,
  updateFileShare,
  deleteFileShare
} = require('../utils/fileShares');
const { authenticate } = require('../middleware/auth');
const { ensureWithinQuota, getUserStorageInfo } = require('../utils/storageQuota');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const {
  sanitizeFilename,
  parseUploadFields,
  deriveDisplayNameFromFilename,
  UploadValidationError
} = require('../utils/uploadUtils');

const UPLOADS_ROOT = process.env.FILES_UPLOAD_DIR
  ? path.resolve(process.env.FILES_UPLOAD_DIR)
  : path.join(__dirname, '../../uploads');

async function ensureDirectory(dirPath) {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

/**
 * Register all file routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function fileRoutes(fastify, options) {
  // Get all cloud files for user
  fastify.get('/api/cloud-files', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const folderId = request.query.folderId;
      const includeDeleted = request.query.includeDeleted === 'true';
      
      const files = folderId !== undefined
        ? await getCloudFilesByFolder(userId, folderId === 'null' ? null : folderId, includeDeleted)
        : await getCloudFilesByUserId(userId, includeDeleted);
      
      return { files };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new cloud file
  fastify.post('/api/cloud-files', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const fileData = request.body;
      
      const file = await createCloudFile(userId, fileData);
      return { 
        success: true, 
        file 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single cloud file by ID
  fastify.get('/api/cloud-files/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const file = await getCloudFileById(id);
      
      if (!file) {
        reply.status(404).send({ error: 'File not found' });
        return;
      }
      
      if (file.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { file };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update cloud file
  fastify.put('/api/cloud-files/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      const existingFile = await getCloudFileById(id);
      if (!existingFile) {
        reply.status(404).send({ error: 'File not found' });
        return;
      }
      if (existingFile.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const file = await updateCloudFile(id, updates);
      return { success: true, file };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Soft delete cloud file (moves to recycle bin)
  fastify.delete('/api/cloud-files/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingFile = await getCloudFileById(id);
      if (!existingFile) {
        reply.status(404).send({ error: 'File not found' });
        return;
      }
      if (existingFile.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteCloudFile(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Restore deleted cloud file from recycle bin
  fastify.post('/api/cloud-files/:id/restore', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingFile = await getCloudFileById(id);
      if (!existingFile) {
        reply.status(404).send({ error: 'File not found' });
        return;
      }
      if (existingFile.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const file = await restoreCloudFile(id);
      return { success: true, file };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Permanently delete cloud file
  fastify.delete('/api/cloud-files/:id/permanent', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingFile = await getCloudFileById(id);
      if (!existingFile) {
        reply.status(404).send({ error: 'File not found' });
        return;
      }
      if (existingFile.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      if (existingFile.storagePath) {
        const absolutePath = path.join(UPLOADS_ROOT, existingFile.storagePath);
        await fsPromises.unlink(absolutePath).catch(() => {});
      }

      await permanentlyDeleteCloudFile(id);
      const storage = await getUserStorageInfo(request.user.userId);
      return { success: true, storage };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Legacy cloud storage endpoints - now integrated with new API
  fastify.post('/api/cloud/save', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { resumeData, name } = request.body;
      
      const fileData = {
        name: name || 'Untitled Resume',
        type: 'resume',
        size: JSON.stringify(resumeData).length,
        contentType: 'application/json',
        data: JSON.stringify(resumeData)
      };
      
      const cloudFile = await createCloudFile(userId, fileData);
      
      return { 
        success: true, 
        savedResume: {
          id: cloudFile.id,
          name: cloudFile.name,
          data: resumeData,
          savedAt: cloudFile.createdAt
        }
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  fastify.get('/api/cloud/list', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const files = await getCloudFilesByUserId(userId);
      
      // Transform to legacy format
      const savedResumes = files
        .filter(file => file.type === 'resume' && file.data)
        .map(file => {
          let parsedData = null;
          try {
            parsedData = typeof file.data === 'string' ? JSON.parse(file.data) : file.data;
          } catch (parseError) {
            parsedData = null;
          }

          return {
            id: file.id,
            name: file.name,
            data: parsedData,
            savedAt: file.createdAt
          };
        })
        .filter(file => file.data !== null);
      
      return { 
        success: true, 
        savedResumes 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  fastify.get('/api/storage/quota', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const storage = await getUserStorageInfo(userId);
      reply.send({ storage });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // File upload endpoint
  fastify.post('/api/files/upload', {
    preHandler: authenticate
  }, async (request, reply) => {
    const userId = request.user?.userId;
    let savedFilePath = null;

    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
      ];

      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type' });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (data.file.bytesRead > maxSize) {
        return reply.status(400).send({ error: 'File too large (max 10MB)' });
      }

      const buffer = await data.toBuffer();
      const fileSize = buffer.length;

      try {
        await ensureWithinQuota(userId, fileSize);
      } catch (quotaError) {
        if (quotaError.code === 'STORAGE_QUOTA_EXCEEDED') {
          const storage = await getUserStorageInfo(userId);
          return reply.status(413).send({
            error: quotaError.message,
            code: quotaError.code,
            storage,
            meta: quotaError.meta
          });
        }
        throw quotaError;
      }

      const userDir = path.join(UPLOADS_ROOT, userId);
      await ensureDirectory(userDir);

      const originalName = data.filename || 'untitled';
      const sanitizedOriginalName = sanitizeFilename(originalName);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const diskFileName = `${uniqueSuffix}-${sanitizedOriginalName}`;
      const absoluteFilePath = path.join(userDir, diskFileName);

      await fsPromises.writeFile(absoluteFilePath, buffer);
      savedFilePath = absoluteFilePath;

      const relativePath = path.relative(UPLOADS_ROOT, absoluteFilePath).replace(/\\/g, '/');
      const fields = data.fields || {};

      let metadata;
      try {
        const defaultDisplayName = deriveDisplayNameFromFilename(sanitizedOriginalName);
        metadata = parseUploadFields(fields, {
          defaultDisplayName,
          defaultType: data.fieldname || 'document'
        });
      } catch (validationError) {
        if (validationError instanceof UploadValidationError) {
          await fsPromises.unlink(absoluteFilePath).catch(() => {});
          return reply.status(400).send({ error: validationError.message });
        }
        throw validationError;
      }

      const { displayName, type, tags, description, folderId, isPublic } = metadata;
      const formattedTags = Array.isArray(tags) && tags.length > 0 ? tags.join(',') : undefined;

      const fileData = {
        name: displayName,
        fileName: originalName,
        type,
        size: fileSize,
        contentType: data.mimetype,
        storagePath: relativePath,
        folderId,
        tags: formattedTags,
        description,
        isPublic: isPublicRaw ? isPublicRaw === 'true' : false
      };

      const cloudFile = await createCloudFile(userId, fileData);
      const storage = await getUserStorageInfo(userId);

      return reply.send({
        success: true,
        file: cloudFile,
        storage
      });
    } catch (error) {
      if (savedFilePath) {
        await fsPromises.unlink(savedFilePath).catch(() => {});
      }

      if (error.code === 'STORAGE_QUOTA_EXCEEDED') {
        const storage = userId ? await getUserStorageInfo(userId) : null;
        return reply.status(413).send({
          error: error.message,
          code: error.code,
          storage,
          meta: error.meta
        });
      }

      reply.status(500).send({ error: error.message });
    }
  });

  // File download endpoint
  fastify.get('/api/files/:id/download', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;

      const file = await getCloudFileById(id);
      if (!file) {
        return reply.status(404).send({ error: 'File not found' });
      }
      if (file.userId !== userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }

      if (!file.storagePath) {
        return reply.status(400).send({ error: 'File storage path missing' });
      }

      const absolutePath = path.join(UPLOADS_ROOT, file.storagePath);

      if (!fs.existsSync(absolutePath)) {
        return reply.status(410).send({ error: 'File is no longer available on the server' });
      }

      await incrementDownloadCount(id);

      reply.header('Content-Type', file.contentType || 'application/octet-stream');
      reply.header('Content-Disposition', `attachment; filename="${file.fileName || file.name}"`);

      const stream = fs.createReadStream(absolutePath);
      return reply.send(stream);
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get shares for a file
  fastify.get('/api/files/:id/shares', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const shares = await getFileShares(id);
      return { shares };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create a share for a file
  fastify.post('/api/files/:id/shares', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const shareData = { ...request.body, fileId: id, grantedBy: request.user.email };
      const share = await createFileShare(shareData);
      return { success: true, share };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update a share
  fastify.put('/api/shares/:shareId', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { shareId } = request.params;
      const updates = request.body;
      const share = await updateFileShare(shareId, updates);
      return { success: true, share };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete a share
  fastify.delete('/api/shares/:shareId', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { shareId } = request.params;
      await deleteFileShare(shareId);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = fileRoutes;

