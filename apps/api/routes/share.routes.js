/**
 * Resume Sharing Routes
 * 
 * Handles resume sharing functionality
 */

const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const { prisma } = require('../utils/db');
const crypto = require('crypto');

module.exports = async function shareRoutes(fastify) {
  /**
   * Create share link for resume
   * POST /api/base-resumes/:id/share
   */
  fastify.post('/api/base-resumes/:id/share', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      const { expiresInDays = 30, password = null, allowDownload = true } = request.body || {};
      
      logger.info('🔗 Creating share link', { userId, baseResumeId, expiresInDays });
      
      // Verify user owns the resume
      const resume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        }
      });
      
      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found or you do not have permission to share it'
        });
      }
      
      // Generate unique share token
      const shareToken = crypto.randomBytes(16).toString('hex');
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
      
      // Hash password if provided
      const bcrypt = require('bcrypt');
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;
      
      // Create share link record
      const shareLink = await prisma.resumeShareLink.create({
        data: {
          baseResumeId: baseResumeId,
          userId: userId,
          token: shareToken,
          expiresAt: expiresAt,
          passwordHash: passwordHash,
          allowDownload: allowDownload,
          viewCount: 0,
          isActive: true
        }
      });
      
      // Track analytics if table exists
      try {
        await prisma.resumeAnalytics.upsert({
          where: {
            resumeId: baseResumeId
          },
          create: {
            resumeId: baseResumeId,
            viewCount: 0,
            exportCount: 0,
            tailorCount: 0,
            shareCount: 1,
            lastSharedAt: new Date()
          },
          update: {
            shareCount: {
              increment: 1
            },
            lastSharedAt: new Date()
          }
        });
      } catch (analyticsError) {
        logger.warn('Failed to track share analytics', { error: analyticsError.message });
      }
      
      // Generate share URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const shareUrl = `${baseUrl}/shared/${shareToken}`;
      
      logger.info('✅ Share link created', {
        userId,
        baseResumeId,
        shareToken,
        expiresAt: expiresAt.toISOString()
      });
      
      return reply.send({
        success: true,
        shareLink: {
          id: shareLink.id,
          token: shareToken,
          url: shareUrl,
          expiresAt: expiresAt.toISOString(),
          hasPassword: !!passwordHash,
          allowDownload: allowDownload,
          viewCount: 0,
          createdAt: shareLink.createdAt.toISOString()
        },
        message: 'Share link created successfully'
      });
      
    } catch (error) {
      logger.error('❌ Failed to create share link', {
        error: error.message,
        stack: error.stack
      });
      
      // Check if table doesn't exist
      if (error.message?.includes('resumeShareLink') || error.code === 'P2021') {
        return reply.status(501).send({
          success: false,
          error: 'Resume sharing feature is not yet available. Database table needs to be created.',
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to create share link'
      });
    }
  });

  /**
   * Get share link details
   * GET /api/share/:token
   */
  fastify.get('/api/share/:token', async (request, reply) => {
    try {
      const { token } = request.params;
      const { password } = request.query;
      
      logger.info('👀 Accessing shared resume', { token: token.substring(0, 8) + '...' });
      
      // Find share link
      const shareLink = await prisma.resumeShareLink.findUnique({
        where: { token: token },
        include: {
          baseResume: {
            select: {
              id: true,
              name: true,
              data: true,
              formatting: true,
              metadata: true,
              createdAt: true,
              updatedAt: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });
      
      if (!shareLink) {
        return reply.status(404).send({
          success: false,
          error: 'Share link not found'
        });
      }
      
      // Check if link is active
      if (!shareLink.isActive) {
        return reply.status(403).send({
          success: false,
          error: 'This share link has been deactivated'
        });
      }
      
      // Check if link has expired
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return reply.status(410).send({
          success: false,
          error: 'This share link has expired'
        });
      }
      
      // Check password if required
      if (shareLink.passwordHash) {
        if (!password) {
          return reply.status(401).send({
            success: false,
            error: 'Password required',
            requiresPassword: true
          });
        }
        
        const bcrypt = require('bcrypt');
        const passwordValid = await bcrypt.compare(password, shareLink.passwordHash);
        
        if (!passwordValid) {
          return reply.status(401).send({
            success: false,
            error: 'Invalid password'
          });
        }
      }
      
      // Increment view count
      await prisma.resumeShareLink.update({
        where: { id: shareLink.id },
        data: {
          viewCount: {
            increment: 1
          },
          lastAccessedAt: new Date()
        }
      });
      
      // Track analytics
      try {
        await prisma.resumeAnalytics.upsert({
          where: {
            resumeId: shareLink.baseResumeId
          },
          create: {
            resumeId: shareLink.baseResumeId,
            viewCount: 1,
            exportCount: 0,
            tailorCount: 0,
            shareCount: 0,
            lastViewedAt: new Date()
          },
          update: {
            viewCount: {
              increment: 1
            },
            lastViewedAt: new Date()
          }
        });
      } catch (analyticsError) {
        logger.warn('Failed to track view analytics', { error: analyticsError.message });
      }
      
      logger.info('✅ Shared resume accessed', {
        token: token.substring(0, 8) + '...',
        resumeId: shareLink.baseResumeId,
        viewCount: shareLink.viewCount + 1
      });
      
      return reply.send({
        success: true,
        resume: {
          id: shareLink.baseResume.id,
          name: shareLink.baseResume.name,
          data: shareLink.baseResume.data,
          formatting: shareLink.baseResume.formatting,
          metadata: shareLink.baseResume.metadata,
          ownerName: shareLink.baseResume.user.name,
          sharedAt: shareLink.createdAt.toISOString(),
          viewCount: shareLink.viewCount + 1
        },
        shareInfo: {
          allowDownload: shareLink.allowDownload,
          expiresAt: shareLink.expiresAt?.toISOString() || null
        }
      });
      
    } catch (error) {
      logger.error('❌ Failed to access shared resume', {
        error: error.message,
        stack: error.stack
      });
      
      if (error.message?.includes('resumeShareLink') || error.code === 'P2021') {
        return reply.status(501).send({
          success: false,
          error: 'Resume sharing feature is not yet available',
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to access shared resume'
      });
    }
  });

  /**
   * List all share links for a resume
   * GET /api/base-resumes/:id/shares
   */
  fastify.get('/api/base-resumes/:id/shares', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      
      logger.info('📋 Listing share links', { userId, baseResumeId });
      
      // Verify ownership
      const resume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        }
      });
      
      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found'
        });
      }
      
      // Get all share links
      const shareLinks = await prisma.resumeShareLink.findMany({
        where: {
          baseResumeId: baseResumeId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const formattedLinks = shareLinks.map(link => ({
        id: link.id,
        token: link.token,
        url: `${baseUrl}/shared/${link.token}`,
        expiresAt: link.expiresAt?.toISOString() || null,
        hasPassword: !!link.passwordHash,
        allowDownload: link.allowDownload,
        viewCount: link.viewCount,
        isActive: link.isActive,
        createdAt: link.createdAt.toISOString(),
        lastAccessedAt: link.lastAccessedAt?.toISOString() || null
      }));
      
      return reply.send({
        success: true,
        shareLinks: formattedLinks,
        count: formattedLinks.length
      });
      
    } catch (error) {
      logger.error('❌ Failed to list share links', {
        error: error.message,
        stack: error.stack
      });
      
      if (error.message?.includes('resumeShareLink') || error.code === 'P2021') {
        return reply.status(501).send({
          success: false,
          error: 'Resume sharing feature is not yet available',
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to list share links'
      });
    }
  });

  /**
   * Deactivate share link
   * DELETE /api/share/:token
   */
  fastify.delete('/api/share/:token', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { token } = request.params;
      
      logger.info('🗑️ Deactivating share link', { userId, token: token.substring(0, 8) + '...' });
      
      // Find and verify ownership
      const shareLink = await prisma.resumeShareLink.findUnique({
        where: { token: token },
        include: {
          baseResume: {
            select: {
              userId: true
            }
          }
        }
      });
      
      if (!shareLink) {
        return reply.status(404).send({
          success: false,
          error: 'Share link not found'
        });
      }
      
      if (shareLink.baseResume.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'You do not have permission to deactivate this share link'
        });
      }
      
      // Deactivate (soft delete)
      await prisma.resumeShareLink.update({
        where: { token: token },
        data: {
          isActive: false
        }
      });
      
      logger.info('✅ Share link deactivated', { userId, token: token.substring(0, 8) + '...' });
      
      return reply.send({
        success: true,
        message: 'Share link deactivated successfully'
      });
      
    } catch (error) {
      logger.error('❌ Failed to deactivate share link', {
        error: error.message,
        stack: error.stack
      });
      
      if (error.message?.includes('resumeShareLink') || error.code === 'P2021') {
        return reply.status(501).send({
          success: false,
          error: 'Resume sharing feature is not yet available',
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to deactivate share link'
      });
    }
  });
};

