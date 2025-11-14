// Advanced Template Routes - REST API endpoints for advanced template features
// Connects all advanced services to HTTP endpoints

// Import advanced services
const templateRatings = require('../services/templateRatings');
const templateComments = require('../services/templateComments');
const templateSharing = require('../services/templateSharing');
const templateUpload = require('../services/templateUpload');
const templateExport = require('../services/templateExport');
const templateVersioning = require('../services/templateVersioning');
const templateApprovalWorkflow = require('../services/templateApprovalWorkflow');
const templateBulkOperations = require('../services/templateBulkOperations');
const advancedTemplateSearch = require('../services/advancedTemplateSearch');
const advancedFiltersAndSorting = require('../services/advancedFiltersAndSorting');
const recommendationEngine = require('../services/recommendationEngine');
const abTestingFramework = require('../services/abTestingFramework');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const {
  requirePremium,
  requireFeature,
  requireTemplateAccess
} = require('../middleware/premiumAccessControl');

module.exports = async function (fastify) {
  // ============================================================================
  // RATINGS & REVIEWS ROUTES
  // ============================================================================

  /**
   * POST /api/templates/:id/rate
   * Rate and review a template
   */
  fastify.post('/api/templates/:id/rate', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const ratingData = request.body;

      // Validate rating data
      if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Rating must be between 1 and 5'
        });
      }

      const result = await templateRatings.rateTemplate(id, userId, ratingData);

      return reply.status(201).send({
        success: true,
        data: result,
        message: 'Template rated successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/:id/rate:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('already rated')) {
        return reply.status(409).send({
          success: false,
          error: 'Conflict',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/templates/:id/rate
   * Update an existing rating
   */
  fastify.put('/api/templates/:id/rate', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const ratingData = request.body;

      const result = await templateRatings.updateRating(id, userId, ratingData);

      return reply.send({
        success: true,
        data: result,
        message: 'Rating updated successfully'
      });
    } catch (error) {
      fastify.log.error('Error in PUT /api/templates/:id/rate:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/templates/:id/rate
   * Delete a rating
   */
  fastify.delete('/api/templates/:id/rate', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      await templateRatings.deleteRating(id, userId);

      return reply.send({
        success: true,
        message: 'Rating deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Error in DELETE /api/templates/:id/rate:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/:id/ratings
   * Get all ratings for a template
   */
  fastify.get('/api/templates/:id/ratings', async (request, reply) => {
    try {
      const { id } = request.params;
      const options = {
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 10,
        sortBy: request.query.sortBy || 'helpful',
        verifiedOnly: request.query.verifiedOnly === 'true'
      };

      const result = await templateRatings.getTemplateRatings(id, options);

      return reply.send({
        success: true,
        data: result.ratings,
        pagination: result.pagination,
        breakdown: result.breakdown
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/ratings:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/ratings/:ratingId/helpful
   * Mark a review as helpful
   */
  fastify.post('/api/templates/ratings/:ratingId/helpful', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { ratingId } = request.params;
      const userId = request.user.id;

      const result = await templateRatings.markReviewHelpful(ratingId, userId);

      return reply.send({
        success: true,
        data: result,
        message: 'Review marked as helpful'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/ratings/:ratingId/helpful:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/:id/ratings/breakdown
   * Get rating breakdown for a template
   */
  fastify.get('/api/templates/:id/ratings/breakdown', async (request, reply) => {
    try {
      const { id } = request.params;

      const breakdown = await templateRatings.getRatingBreakdown(id);

      return reply.send({
        success: true,
        data: breakdown
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/ratings/breakdown:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // COMMENTS ROUTES
  // ============================================================================

  /**
   * POST /api/templates/:id/comments
   * Add a comment to a template
   */
  fastify.post('/api/templates/:id/comments', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const commentData = request.body;

      if (!commentData.content || !commentData.content.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Comment content is required'
        });
      }

      const comment = await templateComments.addComment(id, userId, commentData);

      return reply.status(201).send({
        success: true,
        data: comment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/:id/comments:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/:id/comments
   * Get comments for a template
   */
  fastify.get('/api/templates/:id/comments', async (request, reply) => {
    try {
      const { id } = request.params;
      const options = {
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 20,
        sortBy: request.query.sortBy || 'newest',
        includeReplies: request.query.includeReplies !== 'false'
      };

      const result = await templateComments.getComments(id, options);

      return reply.send({
        success: true,
        data: result.comments,
        pagination: result.pagination
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/comments:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/templates/comments/:commentId
   * Update a comment
   */
  fastify.put('/api/templates/comments/:commentId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { commentId } = request.params;
      const userId = request.user.id;
      const { content } = request.body;

      if (!content || !content.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Comment content is required'
        });
      }

      const comment = await templateComments.updateComment(commentId, userId, content);

      return reply.send({
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      });
    } catch (error) {
      fastify.log.error('Error in PUT /api/templates/comments/:commentId:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('not authorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/templates/comments/:commentId
   * Delete a comment
   */
  fastify.delete('/api/templates/comments/:commentId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { commentId } = request.params;
      const userId = request.user.id;

      await templateComments.deleteComment(commentId, userId);

      return reply.send({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Error in DELETE /api/templates/comments/:commentId:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('not authorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/comments/:commentId/like
   * Toggle like on a comment
   */
  fastify.post('/api/templates/comments/:commentId/like', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { commentId } = request.params;
      const userId = request.user.id;

      const result = await templateComments.toggleCommentLike(commentId, userId);

      return reply.send({
        success: true,
        data: result,
        message: result.liked ? 'Comment liked' : 'Comment unliked'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/comments/:commentId/like:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/comments/:commentId/report
   * Report a comment for moderation
   */
  fastify.post('/api/templates/comments/:commentId/report', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { commentId } = request.params;
      const userId = request.user.id;
      const { reason } = request.body;

      if (!reason) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Report reason is required'
        });
      }

      const report = await templateComments.reportComment(commentId, userId, reason);

      return reply.send({
        success: true,
        data: report,
        message: 'Comment reported successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/comments/:commentId/report:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/templates/comments/:commentId/moderate
   * Moderate a comment (admin only)
   */
  fastify.put('/api/templates/comments/:commentId/moderate',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { commentId } = request.params;
        const { action } = request.body;

        if (!['APPROVE', 'HIDE', 'DELETE'].includes(action)) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'Action must be APPROVE, HIDE, or DELETE'
          });
        }

        const comment = await templateComments.moderateComment(commentId, action);

        return reply.send({
          success: true,
          data: comment,
          message: `Comment ${action.toLowerCase()}d successfully`
        });
      } catch (error) {
        fastify.log.error('Error in PUT /api/templates/comments/:commentId/moderate:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  // ============================================================================
  // SHARING ROUTES
  // ============================================================================

  /**
   * POST /api/templates/:id/share
   * Create a share link for a template
   */
  fastify.post('/api/templates/:id/share', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const options = request.body;

      const shareLink = await templateSharing.createShareLink(id, userId, options);

      return reply.status(201).send({
        success: true,
        data: shareLink,
        message: 'Share link created successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/:id/share:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('not authorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/shared/:token
   * Access a shared template via token
   */
  fastify.get('/api/templates/shared/:token', async (request, reply) => {
    try {
      const { token } = request.params;
      const userId = request.user?.id; // Optional authentication

      const result = await templateSharing.accessSharedTemplate(token, userId);

      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/shared/:token:', error);

      if (error.message.includes('not found') || error.message.includes('expired') || error.message.includes('invalid')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('not authorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/:id/shares
   * Get all share links for a template
   */
  fastify.get('/api/templates/:id/shares', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      const shares = await templateSharing.getTemplateShares(id, userId);

      return reply.send({
        success: true,
        data: shares
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/shares:', error);

      if (error.message.includes('not authorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/templates/shares/:shareId
   * Revoke a share link
   */
  fastify.delete('/api/templates/shares/:shareId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { shareId } = request.params;
      const userId = request.user.id;

      await templateSharing.revokeShareLink(shareId, userId);

      return reply.send({
        success: true,
        message: 'Share link revoked successfully'
      });
    } catch (error) {
      fastify.log.error('Error in DELETE /api/templates/shares/:shareId:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('not authorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/shares/:shareId/analytics
   * Get analytics for a share link
   */
  fastify.get('/api/templates/shares/:shareId/analytics', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { shareId } = request.params;
      const userId = request.user.id;

      const analytics = await templateSharing.getShareAnalytics(shareId, userId);

      return reply.send({
        success: true,
        data: analytics
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/shares/:shareId/analytics:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('not authorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // TEMPLATE UPLOAD ROUTES
  // ============================================================================

  /**
   * POST /api/templates/upload
   * Upload a custom template (Premium feature)
   */
  fastify.post('/api/templates/upload',
    {
      preHandler: [authenticate, requireFeature('CUSTOM_TEMPLATE_UPLOAD')]
    },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const file = await request.file();

        if (!file) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'File is required'
          });
        }

        const metadata = {
          name: request.body?.name,
          description: request.body?.description,
          category: request.body?.category,
          tags: request.body?.tags ? JSON.parse(request.body.tags) : []
        };

        const result = await templateUpload.uploadTemplate(userId, file, metadata);

        return reply.status(201).send({
          success: true,
          data: result,
          message: 'Template uploaded successfully'
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/templates/upload:', error);

        if (error.message.includes('limit exceeded') || error.message.includes('too large')) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: error.message
          });
        }

        if (error.message.includes('not authorized')) {
          return reply.status(403).send({
            success: false,
            error: 'Forbidden',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/templates/upload/limits
   * Get upload limits for current user
   */
  fastify.get('/api/templates/upload/limits', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;

      const limits = await templateUpload.getUploadLimits(userId);

      return reply.send({
        success: true,
        data: limits
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/upload/limits:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/upload/my-uploads
   * Get user's uploaded templates
   */
  fastify.get('/api/templates/upload/my-uploads', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const options = {
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 20,
        status: request.query.status
      };

      const result = await templateUpload.getUserUploads(userId, options);

      return reply.send({
        success: true,
        data: result.templates,
        pagination: result.pagination
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/upload/my-uploads:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // EXPORT ROUTES
  // ============================================================================

  /**
   * GET /api/templates/:id/export/:format
   * Export template in specified format (Premium feature)
   */
  fastify.get('/api/templates/:id/export/:format',
    {
      preHandler: [authenticate, requireFeature('TEMPLATE_EXPORT')]
    },
    async (request, reply) => {
      try {
        const { id, format } = request.params;
        const userId = request.user.id;
        const options = request.query;

        if (!['PDF', 'DOCX', 'LATEX', 'JSON', 'HTML'].includes(format.toUpperCase())) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'Format must be PDF, DOCX, LATEX, JSON, or HTML'
          });
        }

        const result = await templateExport.exportTemplate(id, userId, format.toUpperCase(), options);

        // Set appropriate headers
        reply.header('Content-Type', result.mimeType);
        reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

        return reply.send(result.buffer);
      } catch (error) {
        fastify.log.error('Error in GET /api/templates/:id/export/:format:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        if (error.message.includes('not authorized')) {
          return reply.status(403).send({
            success: false,
            error: 'Forbidden',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/templates/export/bulk
   * Export multiple templates (Admin only)
   */
  fastify.post('/api/templates/export/bulk',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { templateIds, format } = request.body;

        if (!Array.isArray(templateIds) || templateIds.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'templateIds must be a non-empty array'
          });
        }

        const result = await templateExport.exportBulk(templateIds, format);

        reply.header('Content-Type', 'application/zip');
        reply.header('Content-Disposition', `attachment; filename="templates-export.zip"`);

        return reply.send(result.buffer);
      } catch (error) {
        fastify.log.error('Error in POST /api/templates/export/bulk:', error);
        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  // ============================================================================
  // VERSIONING ROUTES
  // ============================================================================

  /**
   * POST /api/templates/:id/versions
   * Create a new version of a template
   */
  fastify.post('/api/templates/:id/versions',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = request.user.id;
        const { changes, versionType } = request.body;

        if (!['major', 'minor', 'patch'].includes(versionType)) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'versionType must be major, minor, or patch'
          });
        }

        const version = await templateVersioning.createVersion(id, userId, changes, versionType);

        return reply.status(201).send({
          success: true,
          data: version,
          message: 'Version created successfully'
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/templates/:id/versions:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/templates/:id/versions
   * Get version history for a template
   */
  fastify.get('/api/templates/:id/versions', async (request, reply) => {
    try {
      const { id } = request.params;
      const options = {
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 20
      };

      const result = await templateVersioning.getVersionHistory(id, options);

      return reply.send({
        success: true,
        data: result.versions,
        pagination: result.pagination
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/versions:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/versions/:versionId
   * Get a specific version
   */
  fastify.get('/api/templates/versions/:versionId', async (request, reply) => {
    try {
      const { versionId } = request.params;

      const version = await templateVersioning.getVersion(versionId);

      return reply.send({
        success: true,
        data: version
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/versions/:versionId:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/:id/versions/:versionId/rollback
   * Rollback template to a specific version
   */
  fastify.post('/api/templates/:id/versions/:versionId/rollback',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { id, versionId } = request.params;
        const userId = request.user.id;

        const result = await templateVersioning.rollbackToVersion(id, versionId, userId);

        return reply.send({
          success: true,
          data: result,
          message: 'Template rolled back successfully'
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/templates/:id/versions/:versionId/rollback:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/templates/versions/:versionId/compare/:otherVersionId
   * Compare two versions
   */
  fastify.get('/api/templates/versions/:versionId/compare/:otherVersionId', async (request, reply) => {
    try {
      const { versionId, otherVersionId } = request.params;

      const diff = await templateVersioning.compareVersions(versionId, otherVersionId);

      return reply.send({
        success: true,
        data: diff
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/versions/:versionId/compare/:otherVersionId:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // APPROVAL WORKFLOW ROUTES
  // ============================================================================

  /**
   * POST /api/templates/:id/submit
   * Submit template for approval
   */
  fastify.post('/api/templates/:id/submit', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const { notes } = request.body;

      const workflow = await templateApprovalWorkflow.submitTemplateForApproval(id, userId, notes);

      return reply.status(201).send({
        success: true,
        data: workflow,
        message: 'Template submitted for approval'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/:id/submit:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      if (error.message.includes('already submitted')) {
        return reply.status(409).send({
          success: false,
          error: 'Conflict',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/admin/templates/workflows/:workflowId/review
   * Review a submitted template (Admin only)
   */
  fastify.post('/api/admin/templates/workflows/:workflowId/review',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { workflowId } = request.params;
        const reviewerId = request.user.id;
        const { decision, feedback } = request.body;

        if (!['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(decision)) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'decision must be APPROVE, REJECT, or REQUEST_CHANGES'
          });
        }

        const workflow = await templateApprovalWorkflow.reviewTemplate(
          workflowId,
          reviewerId,
          decision,
          feedback
        );

        return reply.send({
          success: true,
          data: workflow,
          message: `Template ${decision.toLowerCase()}d successfully`
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/admin/templates/workflows/:workflowId/review:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/admin/templates/workflows
   * Get pending approval workflows (Admin only)
   */
  fastify.get('/api/admin/templates/workflows',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const options = {
          status: request.query.status || 'IN_REVIEW',
          page: parseInt(request.query.page) || 1,
          limit: parseInt(request.query.limit) || 20
        };

        const result = await templateApprovalWorkflow.getPendingApprovals(options);

        return reply.send({
          success: true,
          data: result.workflows,
          pagination: result.pagination
        });
      } catch (error) {
        fastify.log.error('Error in GET /api/admin/templates/workflows:', error);
        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/templates/:id/workflow
   * Get workflow status for a template
   */
  fastify.get('/api/templates/:id/workflow', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;

      const workflow = await templateApprovalWorkflow.getWorkflowStatus(id);

      return reply.send({
        success: true,
        data: workflow
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/workflow:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // BULK OPERATIONS ROUTES
  // ============================================================================

  /**
   * POST /api/admin/templates/bulk
   * Perform bulk operations on templates (Admin only)
   */
  fastify.post('/api/admin/templates/bulk',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { operation, templateIds, options } = request.body;

        if (!Array.isArray(templateIds) || templateIds.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'templateIds must be a non-empty array'
          });
        }

        if (templateIds.length > 100) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'Cannot process more than 100 templates at once'
          });
        }

        const validOperations = [
          'activate', 'deactivate', 'delete', 'updateCategory',
          'addTags', 'removeTags', 'approve', 'reject', 'export'
        ];

        if (!validOperations.includes(operation)) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: `operation must be one of: ${validOperations.join(', ')}`
          });
        }

        const userId = request.user.id;
        const result = await templateBulkOperations.bulkOperation(
          operation,
          templateIds,
          userId,
          options
        );

        return reply.send({
          success: true,
          data: result,
          message: `Bulk ${operation} completed`
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/admin/templates/bulk:', error);

        if (error.message.includes('not authorized')) {
          return reply.status(403).send({
            success: false,
            error: 'Forbidden',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  // ============================================================================
  // ADVANCED SEARCH ROUTES
  // ============================================================================

  /**
   * GET /api/templates/search/advanced
   * Advanced template search with fuzzy matching
   */
  fastify.get('/api/templates/search/advanced', async (request, reply) => {
    try {
      const query = request.query.q || request.query.query;

      if (!query || !query.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Search query is required'
        });
      }

      const options = {
        filters: {
          category: request.query.category,
          difficulty: request.query.difficulty,
          isPremium: request.query.isPremium === 'true',
          minRating: parseFloat(request.query.minRating),
          tags: request.query.tags ? request.query.tags.split(',') : undefined
        },
        sortBy: request.query.sortBy || 'relevance',
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 20,
        autocomplete: request.query.autocomplete === 'true'
      };

      const result = await advancedTemplateSearch.advancedSearch(query, options);

      return reply.send({
        success: true,
        data: result.templates,
        pagination: result.pagination,
        suggestions: result.suggestions
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/search/advanced:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/search/suggestions
   * Get search suggestions
   */
  fastify.get('/api/templates/search/suggestions', async (request, reply) => {
    try {
      const query = request.query.q || request.query.query;

      if (!query || !query.trim()) {
        return reply.send({
          success: true,
          data: []
        });
      }

      const limit = parseInt(request.query.limit) || 5;
      const suggestions = await advancedTemplateSearch.getSearchSuggestions(query, limit);

      return reply.send({
        success: true,
        data: suggestions
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/search/suggestions:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // ADVANCED FILTERS & SORTING ROUTES
  // ============================================================================

  /**
   * POST /api/templates/filters
   * Apply advanced filters and sorting
   */
  fastify.post('/api/templates/filters', async (request, reply) => {
    try {
      const { filters, sort, pagination } = request.body;

      const result = await advancedFiltersAndSorting.applyFiltersAndSort(
        filters || {},
        sort || { by: 'popular', order: 'desc' },
        pagination || { page: 1, limit: 20 }
      );

      return reply.send({
        success: true,
        data: result.templates,
        pagination: result.pagination,
        facets: result.facets
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/templates/filters:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/templates/filters/presets
   * Save a filter preset (Premium feature)
   */
  fastify.post('/api/templates/filters/presets',
    { preHandler: [authenticate, requireFeature('FILTER_PRESETS')] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const { name, filters, sort } = request.body;

        if (!name || !name.trim()) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'Preset name is required'
          });
        }

        const preset = await advancedFiltersAndSorting.saveFilterPreset(
          userId,
          name,
          filters || {},
          sort || {}
        );

        return reply.status(201).send({
          success: true,
          data: preset,
          message: 'Filter preset saved successfully'
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/templates/filters/presets:', error);
        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/templates/filters/presets
   * Get user's filter presets
   */
  fastify.get('/api/templates/filters/presets', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;

      const presets = await advancedFiltersAndSorting.getUserPresets(userId);

      return reply.send({
        success: true,
        data: presets
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/filters/presets:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/templates/filters/presets/:presetId
   * Delete a filter preset
   */
  fastify.delete('/api/templates/filters/presets/:presetId',
    { preHandler: authenticate },
    async (request, reply) => {
      try {
        const { presetId } = request.params;
        const userId = request.user.id;

        await advancedFiltersAndSorting.deleteFilterPreset(presetId, userId);

        return reply.send({
          success: true,
          message: 'Filter preset deleted successfully'
        });
      } catch (error) {
        fastify.log.error('Error in DELETE /api/templates/filters/presets/:presetId:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        if (error.message.includes('not authorized')) {
          return reply.status(403).send({
            success: false,
            error: 'Forbidden',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  // ============================================================================
  // RECOMMENDATIONS ROUTES
  // ============================================================================

  /**
   * GET /api/templates/recommendations
   * Get personalized template recommendations
   */
  fastify.get('/api/templates/recommendations', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const options = {
        limit: parseInt(request.query.limit) || 10,
        excludeViewed: request.query.excludeViewed !== 'false',
        context: request.query.context
      };

      const recommendations = await recommendationEngine.getRecommendations(userId, options);

      return reply.send({
        success: true,
        data: recommendations
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/recommendations:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/templates/:id/similar
   * Get similar templates
   */
  fastify.get('/api/templates/:id/similar', async (request, reply) => {
    try {
      const { id } = request.params;
      const limit = parseInt(request.query.limit) || 6;

      const similar = await recommendationEngine.getSimilarTemplates(id, limit);

      return reply.send({
        success: true,
        data: similar
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/templates/:id/similar:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  // ============================================================================
  // A/B TESTING ROUTES (Admin only)
  // ============================================================================

  /**
   * POST /api/admin/ab-tests
   * Create a new A/B test
   */
  fastify.post('/api/admin/ab-tests',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const testData = request.body;

        if (!testData.name || !testData.variants || !Array.isArray(testData.variants)) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'Test name and variants array are required'
          });
        }

        const test = await abTestingFramework.createTest(testData, userId);

        return reply.status(201).send({
          success: true,
          data: test,
          message: 'A/B test created successfully'
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/admin/ab-tests:', error);
        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/admin/ab-tests/:testId/start
   * Start an A/B test
   */
  fastify.post('/api/admin/ab-tests/:testId/start',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { testId } = request.params;

        const test = await abTestingFramework.startTest(testId);

        return reply.send({
          success: true,
          data: test,
          message: 'A/B test started successfully'
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/admin/ab-tests/:testId/start:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/admin/ab-tests/:testId/stop
   * Stop an A/B test
   */
  fastify.post('/api/admin/ab-tests/:testId/stop',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { testId } = request.params;

        const test = await abTestingFramework.stopTest(testId);

        return reply.send({
          success: true,
          data: test,
          message: 'A/B test stopped successfully'
        });
      } catch (error) {
        fastify.log.error('Error in POST /api/admin/ab-tests/:testId/stop:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/admin/ab-tests/:testId/results
   * Get A/B test results
   */
  fastify.get('/api/admin/ab-tests/:testId/results',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { testId } = request.params;

        const results = await abTestingFramework.getTestResults(testId);

        return reply.send({
          success: true,
          data: results
        });
      } catch (error) {
        fastify.log.error('Error in GET /api/admin/ab-tests/:testId/results:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/admin/ab-tests
   * Get all A/B tests
   */
  fastify.get('/api/admin/ab-tests',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const options = {
          status: request.query.status,
          page: parseInt(request.query.page) || 1,
          limit: parseInt(request.query.limit) || 20
        };

        const result = await abTestingFramework.getAllTests(options);

        return reply.send({
          success: true,
          data: result.tests,
          pagination: result.pagination
        });
      } catch (error) {
        fastify.log.error('Error in GET /api/admin/ab-tests:', error);
        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/ab-tests/:testId/assign
   * Get variant assignment for user (public)
   */
  fastify.get('/api/ab-tests/:testId/assign', async (request, reply) => {
    try {
      const { testId } = request.params;
      const userId = request.user?.id;
      const sessionId = request.headers['x-session-id'];

      if (!userId && !sessionId) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'User ID or session ID required'
        });
      }

      const variant = await abTestingFramework.assignVariant(testId, userId, sessionId);

      return reply.send({
        success: true,
        data: variant
      });
    } catch (error) {
      fastify.log.error('Error in GET /api/ab-tests/:testId/assign:', error);

      if (error.message.includes('not found') || error.message.includes('not running')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/ab-tests/:testId/track
   * Track A/B test event
   */
  fastify.post('/api/ab-tests/:testId/track', async (request, reply) => {
    try {
      const { testId } = request.params;
      const { variantId, eventType, metadata } = request.body;

      if (!variantId || !eventType) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'variantId and eventType are required'
        });
      }

      await abTestingFramework.trackEvent(testId, variantId, eventType, metadata);

      return reply.send({
        success: true,
        message: 'Event tracked successfully'
      });
    } catch (error) {
      fastify.log.error('Error in POST /api/ab-tests/:testId/track:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/admin/ab-tests/:testId
   * Delete an A/B test
   */
  fastify.delete('/api/admin/ab-tests/:testId',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      try {
        const { testId } = request.params;

        await abTestingFramework.deleteTest(testId);

        return reply.send({
          success: true,
          message: 'A/B test deleted successfully'
        });
      } catch (error) {
        fastify.log.error('Error in DELETE /api/admin/ab-tests/:testId:', error);

        if (error.message.includes('not found')) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: error.message
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  );

};
