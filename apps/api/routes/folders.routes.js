/**
 * Folder Routes Module
 * 
 * Handles all folder-related routes including:
 * - Folder CRUD operations
 */

const { 
  getCloudFoldersByUserId,
  getCloudFolderById,
  createCloudFolder,
  updateCloudFolder,
  deleteCloudFolder,
  permanentlyDeleteCloudFolder,
  restoreCloudFolder,
  getCloudFoldersByParent
} = require('../utils/cloudFolders');
const { authenticate } = require('../middleware/auth');

/**
 * Register all folder routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function folderRoutes(fastify, options) {
  // Get all folders for user
  fastify.get('/api/folders', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const includeDeleted = request.query.includeDeleted === 'true';
      const folders = await getCloudFoldersByUserId(userId, includeDeleted);
      return { folders };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get folders by parent
  fastify.get('/api/folders/parent/:parentId', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { parentId } = request.params;
      const folders = await getCloudFoldersByParent(userId, parentId === 'null' ? null : parentId);
      return { folders };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single folder by ID
  fastify.get('/api/folders/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const folder = await getCloudFolderById(id);
      
      if (!folder) {
        reply.status(404).send({ error: 'Folder not found' });
        return;
      }
      
      if (folder.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { folder };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new folder
  fastify.post('/api/folders', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const folderData = request.body;
      
      const folder = await createCloudFolder(userId, folderData);
      return { 
        success: true, 
        folder 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update folder
  fastify.put('/api/folders/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      const existingFolder = await getCloudFolderById(id);
      if (!existingFolder) {
        reply.status(404).send({ error: 'Folder not found' });
        return;
      }
      if (existingFolder.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const folder = await updateCloudFolder(id, updates);
      return { success: true, folder };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Soft delete folder (moves to recycle bin)
  fastify.delete('/api/folders/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingFolder = await getCloudFolderById(id);
      if (!existingFolder) {
        reply.status(404).send({ error: 'Folder not found' });
        return;
      }
      if (existingFolder.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteCloudFolder(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Restore deleted folder from recycle bin
  fastify.post('/api/folders/:id/restore', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingFolder = await getCloudFolderById(id);
      if (!existingFolder) {
        reply.status(404).send({ error: 'Folder not found' });
        return;
      }
      if (existingFolder.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const folder = await restoreCloudFolder(id);
      return { success: true, folder };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Permanently delete folder
  fastify.delete('/api/folders/:id/permanent', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingFolder = await getCloudFolderById(id);
      if (!existingFolder) {
        reply.status(404).send({ error: 'Folder not found' });
        return;
      }
      if (existingFolder.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await permanentlyDeleteCloudFolder(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = folderRoutes;

