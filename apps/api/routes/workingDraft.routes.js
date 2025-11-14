const { authenticate } = require('../middleware/auth');
const {
  getCurrentResumeData,
  saveWorkingDraft,
  commitDraftToBase,
  discardWorkingDraft,
  getDraftStatus
} = require('../services/workingDraftService');
const logger = require('../utils/logger');

/**
 * Working Draft Routes (Fastify)
 * Manages temporary working drafts for resume editing
 */
module.exports = async function workingDraftRoutes(fastify) {
  /**
   * GET /api/working-draft/:baseResumeId/status
   * Get draft status for a base resume
   */
  fastify.get('/api/working-draft/:baseResumeId/status', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { baseResumeId } = request.params;

      const status = await getDraftStatus(baseResumeId);

      return reply.send({
        success: true,
        status
      });
    } catch (error) {
      logger.error('Failed to get draft status', {
        error: error.message,
        baseResumeId: request.params.baseResumeId
      });

      return reply.status(500).send({
        success: false,
        error: 'Failed to get draft status',
        message: error.message
      });
    }
  });

  /**
   * GET /api/working-draft/:baseResumeId/current
   * Get current resume data (draft OR base)
   * Used by ATS/Tailoring to transparently use draft if exists
   */
  fastify.get('/api/working-draft/:baseResumeId/current', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { baseResumeId } = request.params;

      const resumeData = await getCurrentResumeData(baseResumeId);

      return reply.send({
        success: true,
        data: resumeData
      });
    } catch (error) {
      logger.error('Failed to get current resume data', {
        error: error.message,
        baseResumeId: request.params.baseResumeId
      });

      return reply.status(500).send({
        success: false,
        error: 'Failed to get current resume data',
        message: error.message
      });
    }
  });

  /**
   * POST /api/working-draft/:baseResumeId/save
   * Save or update working draft (auto-save)
   */
  fastify.post('/api/working-draft/:baseResumeId/save', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { baseResumeId } = request.params;
      const { data, formatting, metadata } = request.body;

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'Resume data is required'
        });
      }

      const draft = await saveWorkingDraft(baseResumeId, {
        data,
        formatting,
        metadata
      });

      return reply.send({
        success: true,
        draft: {
          id: draft.id,
          updatedAt: draft.updatedAt,
          createdAt: draft.createdAt
        }
      });
    } catch (error) {
      // Silently handle errors for deleted/stale resumes (auto-save will retry)
      logger.debug('Failed to save working draft (likely deleted resume)', {
        error: error.message,
        baseResumeId: request.params.baseResumeId
      });

      // Return success with null draft to avoid frontend errors
      return reply.send({
        success: true,
        draft: null,
        message: 'Resume not found or deleted'
      });
    }
  });

  /**
   * POST /api/working-draft/:baseResumeId/commit
   * Commit draft to base resume (explicit user save)
   */
  fastify.post('/api/working-draft/:baseResumeId/commit', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { baseResumeId } = request.params;

      const updatedBase = await commitDraftToBase(baseResumeId);

      return reply.send({
        success: true,
        baseResume: {
          id: updatedBase.id,
          updatedAt: updatedBase.updatedAt,
          data: updatedBase.data,
          formatting: updatedBase.formatting,
          metadata: updatedBase.metadata
        }
      });
    } catch (error) {
      logger.error('Failed to commit draft to base', {
        error: error.message,
        baseResumeId: request.params.baseResumeId
      });

      return reply.status(500).send({
        success: false,
        error: 'Failed to commit draft to base',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/working-draft/:baseResumeId
   * Discard working draft (revert to base)
   */
  fastify.delete('/api/working-draft/:baseResumeId', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { baseResumeId } = request.params;

      const baseResume = await discardWorkingDraft(baseResumeId);

      return reply.send({
        success: true,
        baseResume: {
          id: baseResume.id,
          updatedAt: baseResume.updatedAt,
          data: baseResume.data,
          formatting: baseResume.formatting,
          metadata: baseResume.metadata
        }
      });
    } catch (error) {
      logger.error('Failed to discard working draft', {
        error: error.message,
        baseResumeId: request.params.baseResumeId
      });

      return reply.status(500).send({
        success: false,
        error: 'Failed to discard working draft',
        message: error.message
      });
    }
  });
};
