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
  getCloudFilesByFolder
} = require('../utils/cloudFiles');
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
      const folder = request.query.folder;
      
      const files = folder 
        ? await getCloudFilesByFolder(userId, folder)
        : await getCloudFilesByUserId(userId);
      
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

  // Delete cloud file
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

  // Legacy cloud storage endpoints
  fastify.post('/api/cloud/save', {
    preHandler: authenticate
  }, async (request, reply) => {
    const { resumeData, name } = request.body;
    return { 
      success: true, 
      savedResume: { 
        id: Date.now().toString(), 
        name, 
        data: resumeData,
        savedAt: new Date().toISOString()
      }
    };
  });

  fastify.get('/api/cloud/list', {
    preHandler: authenticate
  }, async (request, reply) => {
    return { 
      success: true, 
      savedResumes: [] 
    };
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
        folder: request.body?.folder,
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
}

module.exports = fileRoutes;

