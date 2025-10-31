/**
 * Email Routes Module
 * 
 * Handles all email-related routes for job applications
 */

const { 
  getEmailsByUserId,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail,
  getEmailsByJobId
} = require('../utils/emails');
const { authenticate } = require('../middleware/auth');

/**
 * Register all email routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function emailRoutes(fastify, options) {
  // Get all emails for user
  fastify.get('/api/emails', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const jobId = request.query.jobId;
      
      const emails = jobId 
        ? await getEmailsByJobId(jobId)
        : await getEmailsByUserId(userId);
      
      return { emails };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new email
  fastify.post('/api/emails', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const emailData = request.body;
      
      const email = await createEmail(userId, emailData);
      return { 
        success: true, 
        email 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single email by ID
  fastify.get('/api/emails/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const email = await getEmailById(id);
      
      if (!email) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      
      // Verify email belongs to user
      if (email.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { email };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update email
  fastify.put('/api/emails/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      // Verify email exists and belongs to user
      const existingEmail = await getEmailById(id);
      if (!existingEmail) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      if (existingEmail.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const email = await updateEmail(id, updates);
      return { 
        success: true, 
        email 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete email
  fastify.delete('/api/emails/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Verify email exists and belongs to user
      const existingEmail = await getEmailById(id);
      if (!existingEmail) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      if (existingEmail.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteEmail(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = emailRoutes;

