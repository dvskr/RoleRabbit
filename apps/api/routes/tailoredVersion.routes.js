/**
 * Tailored Version Routes
 * 
 * Handles tailored resume version operations
 */

const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const { prisma } = require('../utils/db');

module.exports = async function tailoredVersionRoutes(fastify) {
  /**
   * Get tailored version by ID
   * GET /api/tailored-versions/:id
   */
  fastify.get('/api/tailored-versions/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const versionId = request.params.id;
      
      logger.info('📄 Fetching tailored version', { userId, versionId });
      
      // Get tailored version with ownership check
      const version = await prisma.tailoredVersion.findFirst({
        where: {
          id: versionId,
          userId: userId
        },
        include: {
          baseResume: {
            select: {
              id: true,
              name: true,
              userId: true
            }
          }
        }
      });
      
      if (!version) {
        return reply.status(404).send({
          success: false,
          error: 'Tailored version not found or you do not have permission to view it'
        });
      }
      
      // Format response
      const formattedVersion = {
        id: version.id,
        baseResumeId: version.baseResumeId,
        baseResumeName: version.baseResume.name,
        jobTitle: version.jobTitle,
        company: version.company,
        jobDescriptionHash: version.jobDescriptionHash,
        mode: version.mode,
        tone: version.tone,
        data: version.data,
        diff: version.diff,
        atsScoreBefore: version.atsScoreBefore,
        atsScoreAfter: version.atsScoreAfter,
        improvement: version.atsScoreBefore && version.atsScoreAfter 
          ? version.atsScoreAfter - version.atsScoreBefore 
          : null,
        isPromoted: version.isPromoted,
        createdAt: version.createdAt.toISOString(),
        updatedAt: version.updatedAt.toISOString()
      };
      
      logger.info('✅ Tailored version fetched', {
        userId,
        versionId,
        jobTitle: version.jobTitle
      });
      
      return reply.send({
        success: true,
        version: formattedVersion
      });
      
    } catch (error) {
      logger.error('❌ Failed to fetch tailored version', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch tailored version'
      });
    }
  });

  /**
   * Delete tailored version
   * DELETE /api/tailored-versions/:id
   */
  fastify.delete('/api/tailored-versions/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const versionId = request.params.id;
      
      logger.info('🗑️ Deleting tailored version', { userId, versionId });
      
      // Verify ownership
      const version = await prisma.tailoredVersion.findFirst({
        where: {
          id: versionId,
          userId: userId
        }
      });
      
      if (!version) {
        return reply.status(404).send({
          success: false,
          error: 'Tailored version not found or you do not have permission to delete it'
        });
      }
      
      // Delete version
      await prisma.tailoredVersion.delete({
        where: { id: versionId }
      });
      
      logger.info('✅ Tailored version deleted', { userId, versionId });
      
      return reply.send({
        success: true,
        message: 'Tailored version deleted successfully'
      });
      
    } catch (error) {
      logger.error('❌ Failed to delete tailored version', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete tailored version'
      });
    }
  });

  /**
   * List all tailored versions for user
   * GET /api/tailored-versions
   */
  fastify.get('/api/tailored-versions', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { baseResumeId, limit = 50, offset = 0 } = request.query;
      
      logger.info('📋 Listing tailored versions', { userId, baseResumeId, limit, offset });
      
      const where = {
        userId: userId
      };
      
      if (baseResumeId) {
        where.baseResumeId = baseResumeId;
      }
      
      const [versions, total] = await Promise.all([
        prisma.tailoredVersion.findMany({
          where,
          select: {
            id: true,
            baseResumeId: true,
            jobTitle: true,
            company: true,
            mode: true,
            tone: true,
            atsScoreBefore: true,
            atsScoreAfter: true,
            isPromoted: true,
            createdAt: true,
            baseResume: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: parseInt(limit),
          skip: parseInt(offset)
        }),
        prisma.tailoredVersion.count({ where })
      ]);
      
      const formattedVersions = versions.map(v => ({
        id: v.id,
        baseResumeId: v.baseResumeId,
        baseResumeName: v.baseResume.name,
        jobTitle: v.jobTitle || 'Untitled Position',
        company: v.company || null,
        mode: v.mode,
        tone: v.tone,
        atsScoreBefore: v.atsScoreBefore,
        atsScoreAfter: v.atsScoreAfter,
        improvement: v.atsScoreBefore && v.atsScoreAfter 
          ? v.atsScoreAfter - v.atsScoreBefore 
          : null,
        isPromoted: v.isPromoted,
        createdAt: v.createdAt.toISOString()
      }));
      
      logger.info('✅ Tailored versions listed', {
        userId,
        count: formattedVersions.length,
        total
      });
      
      return reply.send({
        success: true,
        versions: formattedVersions,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + formattedVersions.length < total
        }
      });
      
    } catch (error) {
      logger.error('❌ Failed to list tailored versions', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to list tailored versions'
      });
    }
  });
};

