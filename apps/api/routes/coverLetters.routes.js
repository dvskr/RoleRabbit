/**
 * Cover Letter Routes Module
 * 
 * Handles all cover letter-related routes
 */

const { 
  getCoverLettersByUserId,
  getCoverLetterById,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  getCoverLettersByJobId
} = require('../utils/coverLetters');
const { authenticate } = require('../middleware/auth');

/**
 * Register all cover letter routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function coverLetterRoutes(fastify, options) {
  // Get all cover letters for user
  fastify.get('/api/cover-letters', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const jobId = request.query.jobId;
      
      const coverLetters = jobId 
        ? await getCoverLettersByJobId(jobId)
        : await getCoverLettersByUserId(userId);
      
      return { coverLetters };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new cover letter
  fastify.post('/api/cover-letters', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const coverLetterData = request.body;
      
      const coverLetter = await createCoverLetter(userId, coverLetterData);
      return { 
        success: true, 
        coverLetter 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single cover letter by ID
  fastify.get('/api/cover-letters/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const coverLetter = await getCoverLetterById(id);
      
      if (!coverLetter) {
        reply.status(404).send({ error: 'Cover letter not found' });
        return;
      }
      
      // Verify cover letter belongs to user
      if (coverLetter.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { coverLetter };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update cover letter
  fastify.put('/api/cover-letters/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      // Verify cover letter exists and belongs to user
      const existingCoverLetter = await getCoverLetterById(id);
      if (!existingCoverLetter) {
        reply.status(404).send({ error: 'Cover letter not found' });
        return;
      }
      if (existingCoverLetter.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const coverLetter = await updateCoverLetter(id, updates);
      return { 
        success: true, 
        coverLetter 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete cover letter
  fastify.delete('/api/cover-letters/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Verify cover letter exists and belongs to user
      const existingCoverLetter = await getCoverLetterById(id);
      if (!existingCoverLetter) {
        reply.status(404).send({ error: 'Cover letter not found' });
        return;
      }
      if (existingCoverLetter.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteCoverLetter(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = coverLetterRoutes;

