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
  getCloudFilesByFolder
} = require('../utils/cloudFiles');
const { 
  getFileShares,
  createFileShare,
  updateFileShare,
  deleteFileShare
} = require('../utils/fileShares');
const { authenticate } = require('../middleware/auth');

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
      
      await permanentlyDeleteCloudFile(id);
      return { success: true };
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
        .filter(file => file.type === 'resume')
        .map(file => ({
          id: file.id,
          name: file.name,
          data: JSON.parse(file.data),
          savedAt: file.createdAt
        }));
      
      return { 
        success: true, 
        savedResumes 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // File upload endpoint
  fastify.post('/api/files/upload', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
      
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type' });
      }
      
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (data.file.bytesRead > maxSize) {
        return reply.status(400).send({ error: 'File too large (max 10MB)' });
      }
      
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `file-${uniqueSuffix}-${data.filename}`;
      
      // Save file data to cloud file
      const buffer = await data.toBuffer();
      const fileData = {
        name: filename,
        fileName: data.filename,
        type: data.fieldname || 'document',
        size: buffer.length,
        contentType: data.mimetype,
        data: buffer.toString('base64'),
        folderId: request.body?.folderId,
        tags: request.body?.tags,
        description: request.body?.description
      };
      
      const cloudFile = await createCloudFile(userId, fileData);
      
      return {
        success: true,
        file: cloudFile
      };
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

