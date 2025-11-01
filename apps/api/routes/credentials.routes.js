/**
 * Credential Routes Module
 * 
 * Handles all credential-related routes including:
 * - Credential CRUD operations
 */

const { 
  getCredentialsByUserId,
  getCredentialById,
  createCredential,
  updateCredential,
  deleteCredential,
  getCredentialsByType,
  getExpiringCredentials
} = require('../utils/credentials');
const { authenticate } = require('../middleware/auth');

/**
 * Register all credential routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function credentialRoutes(fastify, options) {
  // Get all credentials for user
  fastify.get('/api/credentials', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const credentials = await getCredentialsByUserId(userId);
      return { credentials };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get expiring credentials
  fastify.get('/api/credentials/expiring', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const daysAhead = parseInt(request.query.daysAhead) || 90;
      const credentials = await getExpiringCredentials(userId, daysAhead);
      return { credentials };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get credentials by type
  fastify.get('/api/credentials/type/:type', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { type } = request.params;
      const credentials = await getCredentialsByType(userId, type);
      return { credentials };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single credential by ID
  fastify.get('/api/credentials/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const credential = await getCredentialById(id);
      
      if (!credential) {
        reply.status(404).send({ error: 'Credential not found' });
        return;
      }
      
      if (credential.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { credential };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new credential
  fastify.post('/api/credentials', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const credentialData = request.body;
      
      const credential = await createCredential(userId, credentialData);
      return { 
        success: true, 
        credential 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update credential
  fastify.put('/api/credentials/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      const existingCredential = await getCredentialById(id);
      if (!existingCredential) {
        reply.status(404).send({ error: 'Credential not found' });
        return;
      }
      if (existingCredential.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const credential = await updateCredential(id, updates);
      return { success: true, credential };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete credential
  fastify.delete('/api/credentials/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingCredential = await getCredentialById(id);
      if (!existingCredential) {
        reply.status(404).send({ error: 'Credential not found' });
        return;
      }
      if (existingCredential.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteCredential(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = credentialRoutes;

