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

/**
 * Register all resume routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function resumeRoutes(fastify, options) {
  // Get all resumes for user
  fastify.get('/api/resumes', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const resumes = await getResumesByUserId(userId);
      return { resumes };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new resume
  fastify.post('/api/resumes', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const resumeData = request.body;
      
      // Validate resume data
      const validation = validateResumeData(resumeData);
      if (!validation.isValid) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid resume data',
          details: validation.errors
        });
      }
      
      const resume = await createResume(userId, resumeData);
      return { 
        success: true, 
        resume 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single resume by ID
  fastify.get('/api/resumes/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const resume = await getResumeById(id);
      
      if (!resume) {
        reply.status(404).send({ error: 'Resume not found' });
        return;
      }
      
      // Verify resume belongs to user
      if (resume.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      return { resume };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Export resume endpoint
  fastify.post('/api/resumes/:id/export', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { format = 'pdf' } = request.body;
      
      const resume = await getResumeById(id);
      if (!resume) {
        return reply.status(404).send({ error: 'Resume not found' });
      }
      
      if (resume.userId !== request.user.userId) {
        return reply.status(403).send({ error: 'Forbidden' });
      }
      
      const resumeData = typeof resume.data === 'string' ? JSON.parse(resume.data) : resume.data;
      
      let exportedData;
      if (format === 'pdf') {
        exportedData = await exportResume(resumeData, 'pdf');
        reply.type('application/pdf');
      } else if (format === 'docx') {
        exportedData = await exportResume(resumeData, 'docx');
        reply.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        return reply.status(400).send({ error: 'Invalid format. Use pdf or docx' });
      }
      
      reply.header('Content-Disposition', `attachment; filename="${resume.name || 'resume'}.${format}"`);
      reply.send(exportedData);
      
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update resume
  fastify.put('/api/resumes/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      // Verify resume exists and belongs to user
      const existingResume = await getResumeById(id);
      if (!existingResume) {
        reply.status(404).send({ error: 'Resume not found' });
        return;
      }
      if (existingResume.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      const resume = await updateResume(id, updates);
      return { 
        success: true, 
        resume 
      };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete resume
  fastify.delete('/api/resumes/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Verify resume exists and belongs to user
      const existingResume = await getResumeById(id);
      if (!existingResume) {
        reply.status(404).send({ error: 'Resume not found' });
        return;
      }
      if (existingResume.userId !== request.user.userId) {
        reply.status(403).send({ error: 'Forbidden' });
        return;
      }
      
      await deleteResume(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = resumeRoutes;

