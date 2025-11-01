/**
 * Resume Routes Module
 * 
 * Handles all resume-related routes including:
 * - CRUD operations for resumes
 * - Resume export functionality
 */

const { 
  getResumesByUserId,
  getResumeById,
  createResume,
  updateResume,
  deleteResume
} = require('../utils/resumes');
const { validateResumeData } = require('../utils/validation');
const { exportResume } = require('../utils/resumeExport');
const { authenticate } = require('../middleware/auth');
const { errorHandler, requireOwnership } = require('../utils/errorMiddleware');
const { ApiError } = require('../utils/errorHandler');
const CrudService = require('../utils/crudService');

const resumesService = new CrudService('resume');

/**
 * Register all resume routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function resumeRoutes(fastify, options) {
  // Get all resumes for user
  fastify.get('/api/resumes', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const resumes = await getResumesByUserId(userId);
    return { resumes };
  }));

  // Create new resume
  fastify.post('/api/resumes', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const resumeData = request.body;
    
    // Validate resume data
    const validation = validateResumeData(resumeData);
    if (!validation.isValid) {
      throw new ApiError(400, 'Invalid resume data', true, validation.errors);
    }
    
    const resume = await createResume(userId, resumeData);
    return { 
      success: true, 
      resume 
    };
  }));

  // Get single resume by ID
  fastify.get('/api/resumes/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(resumesService, id, userId);
    const resume = await getResumeById(id);

    return { resume };
  }));

  // Export resume endpoint
  fastify.post('/api/resumes/:id/export', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const { format = 'pdf' } = request.body;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(resumesService, id, userId);
    const resume = await getResumeById(id);
    
    const resumeData = typeof resume.data === 'string' ? JSON.parse(resume.data) : resume.data;
    
    let exportedData;
    if (format === 'pdf') {
      exportedData = await exportResume(resumeData, 'pdf');
      reply.type('application/pdf');
    } else if (format === 'docx') {
      exportedData = await exportResume(resumeData, 'docx');
      reply.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } else {
      throw new ApiError(400, 'Invalid format. Use pdf or docx');
    }
    
    reply.header('Content-Disposition', `attachment; filename="${resume.name || 'resume'}.${format}"`);
    reply.send(exportedData);
  }));

  // Update resume
  fastify.put('/api/resumes/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;
    const updates = request.body;

    // Verify ownership
    await requireOwnership(resumesService, id, userId);

    const resume = await updateResume(id, updates);
    return { 
      success: true, 
      resume 
    };
  }));

  // Delete resume
  fastify.delete('/api/resumes/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(resumesService, id, userId);

    await deleteResume(id);
    return { success: true };
  }));
}

module.exports = resumeRoutes;

