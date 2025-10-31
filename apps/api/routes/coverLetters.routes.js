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
const { errorHandler, requireOwnership } = require('../utils/errorMiddleware');
const CrudService = require('../utils/crudService');

const coverLettersService = new CrudService('coverLetter');

/**
 * Register all cover letter routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function coverLetterRoutes(fastify, options) {
  // Get all cover letters for user
  fastify.get('/api/cover-letters', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const jobId = request.query.jobId;
    
    const coverLetters = jobId 
      ? await getCoverLettersByJobId(jobId)
      : await getCoverLettersByUserId(userId);
    
    return { coverLetters };
  }));

  // Create new cover letter
  fastify.post('/api/cover-letters', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const coverLetterData = request.body;
    
    const coverLetter = await createCoverLetter(userId, coverLetterData);
    return { 
      success: true, 
      coverLetter 
    };
  }));

  // Get single cover letter by ID
  fastify.get('/api/cover-letters/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(coverLettersService, id, userId);
    const coverLetter = await getCoverLetterById(id);

    return { coverLetter };
  }));

  // Update cover letter
  fastify.put('/api/cover-letters/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;
    const updates = request.body;

    // Verify ownership
    await requireOwnership(coverLettersService, id, userId);

    const coverLetter = await updateCoverLetter(id, updates);
    return { 
      success: true, 
      coverLetter 
    };
  }));

  // Delete cover letter
  fastify.delete('/api/cover-letters/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(coverLettersService, id, userId);

    await deleteCoverLetter(id);
    return { success: true };
  }));
}

module.exports = coverLetterRoutes;

