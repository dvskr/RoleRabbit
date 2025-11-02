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

function sanitizeFileName(name = '') {
  const fallback = 'resume';
  if (typeof name !== 'string') return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  return trimmed
    .replace(/[^a-z0-9\-_.\s]/gi, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 120) || fallback;
}

function parseResumeDataPayload(data) {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }
  if (typeof data === 'object') {
    return data;
  }
  return {};
}

function mapResumeToResponse(resume) {
  if (!resume) return null;
  const parsedData = parseResumeDataPayload(resume.data);
  return {
    id: resume.id,
    name: resume.name,
    fileName: resume.fileName,
    templateId: resume.templateId,
    data: parsedData,
    version: resume.version,
    isPublic: resume.isPublic,
    createdAt: resume.createdAt,
    lastUpdated: resume.lastUpdated,
  };
}

function normalizeCreatePayload(payload = {}) {
  const normalizedName = typeof payload.name === 'string' && payload.name.trim().length > 0
    ? payload.name.trim()
    : 'Untitled Resume';

  const normalizedFileName = payload.fileName
    ? sanitizeFileName(payload.fileName)
    : sanitizeFileName(normalizedName);

  return {
    ...payload,
    name: normalizedName,
    fileName: normalizedFileName,
  };
}

function normalizeUpdatePayload(payload = {}, existingResume = null) {
  const updates = {};

  if (payload.data !== undefined) {
    updates.data = payload.data;
  }

  if (payload.templateId !== undefined) {
    updates.templateId = payload.templateId;
  }

  if (payload.isPublic !== undefined) {
    updates.isPublic = payload.isPublic;
  }

  if (payload.name !== undefined) {
    const normalizedName = typeof payload.name === 'string' && payload.name.trim().length > 0
      ? payload.name.trim()
      : existingResume?.name || 'Untitled Resume';
    updates.name = normalizedName;

    const fileNameSource = payload.fileName ?? normalizedName;
    updates.fileName = sanitizeFileName(fileNameSource);
  } else if (payload.fileName !== undefined) {
    updates.fileName = sanitizeFileName(payload.fileName);
  }

  updates.version = { increment: 1 };

  return updates;
}

function ensureNoConflicts(existingResume, lastKnownServerUpdatedAt) {
  if (!existingResume || !lastKnownServerUpdatedAt) {
    return;
  }

  const clientTimestamp = new Date(lastKnownServerUpdatedAt).getTime();
  const serverTimestamp = new Date(existingResume.lastUpdated).getTime();

  if (!Number.isNaN(clientTimestamp) && clientTimestamp !== serverTimestamp) {
    throw new ApiError(409, 'Resume has been updated in another session', true, {
      lastUpdated: existingResume.lastUpdated,
    });
  }
}

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
    return {
      resumes: resumes.map(mapResumeToResponse)
    };
  }));

  // Create new resume
  fastify.post('/api/resumes', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const resumeData = normalizeCreatePayload(request.body || {});

    // Validate resume data
    const validation = validateResumeData(resumeData);
    if (!validation.isValid) {
      throw new ApiError(400, 'Invalid resume data', true, validation.errors);
    }
    
    const resume = await createResume(userId, resumeData);
    return {
      success: true,
      resume: mapResumeToResponse(resume)
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

    return {
      resume: mapResumeToResponse(resume)
    };
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
    const updates = request.body || {};

    const existingResume = await requireOwnership(resumesService, id, userId);

    ensureNoConflicts(existingResume, updates.lastKnownServerUpdatedAt);

    const updatePayload = normalizeUpdatePayload(updates, existingResume);
    const resume = await updateResume(id, updatePayload);
    return {
      success: true,
      resume: mapResumeToResponse(resume)
    };
  }));

  // Auto-save resume
  fastify.post('/api/resumes/:id/autosave', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;
    const updates = request.body || {};

    if (updates.data === undefined) {
      throw new ApiError(400, 'Resume data is required for auto-save');
    }

    const existingResume = await requireOwnership(resumesService, id, userId);

    ensureNoConflicts(existingResume, updates.lastKnownServerUpdatedAt);

    const updatePayload = normalizeUpdatePayload(updates, existingResume);
    const resume = await updateResume(id, updatePayload);

    return {
      success: true,
      resume: mapResumeToResponse(resume)
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

