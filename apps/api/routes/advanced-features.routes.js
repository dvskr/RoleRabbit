/**
 * Advanced Features Routes for File Management
 *
 * Features:
 * - Activity timeline per file
 * - Advanced search with filters
 * - Bulk operations (delete, download)
 * - ZIP download for multiple files
 */

import archiver from 'archiver';
import { authenticate } from '../utils/auth.js';
import { prisma } from '../utils/prismaClient.js';
import { storageHandler } from '../utils/storageHandler.js';
import { logger } from '../utils/logger.js';

export default async function advancedFeaturesRoutes(fastify, options) {

  // ============================================================================
  // ACTIVITY TIMELINE PER FILE
  // ============================================================================

  /**
   * Get activity timeline for a specific file
   * Shows all actions performed on the file
   */
  fastify.get('/files/:id/activity', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;
      const { page = 1, limit = 50 } = request.query;

      // Check if user has access to this file
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          OR: [
            { userId }, // Owner
            {
              shares: {
                some: {
                  sharedWith: userId,
                  expiresAt: { gte: new Date() }
                }
              }
            }
          ]
        }
      });

      if (!file) {
        return reply.status(404).send({ error: 'File not found or access denied' });
      }

      // Get activity log
      const skip = (page - 1) * limit;
      const [activities, totalCount] = await Promise.all([
        prisma.fileActivity.findMany({
          where: { fileId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.fileActivity.count({ where: { fileId } })
      ]);

      // Format activities with user-friendly messages
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        action: activity.action,
        description: formatActivityDescription(activity),
        user: activity.user,
        metadata: activity.metadata,
        ipAddress: activity.ipAddress,
        createdAt: activity.createdAt
      }));

      return reply.send({
        success: true,
        activities: formattedActivities,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: skip + limit < totalCount,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      logger.error('Get file activity error:', error);
      return reply.status(500).send({ error: 'Failed to fetch activity timeline' });
    }
  });

  /**
   * Log a file activity
   * Internal helper function
   */
  async function logFileActivity(fileId, userId, action, metadata = {}, request) {
    await prisma.fileActivity.create({
      data: {
        fileId,
        userId,
        action, // 'uploaded', 'downloaded', 'shared', 'deleted', 'restored', 'renamed', 'moved', 'commented'
        metadata: JSON.stringify(metadata),
        ipAddress: request?.ip,
        userAgent: request?.headers['user-agent']
      }
    });
  }

  /**
   * Format activity description for display
   */
  function formatActivityDescription(activity) {
    const actions = {
      uploaded: 'uploaded this file',
      downloaded: 'downloaded this file',
      shared: `shared this file with ${activity.metadata?.sharedWith || 'someone'}`,
      deleted: 'moved this file to trash',
      restored: 'restored this file from trash',
      renamed: `renamed this file to "${activity.metadata?.newName}"`,
      moved: `moved this file to ${activity.metadata?.newFolder || 'another folder'}`,
      commented: `commented: "${activity.metadata?.comment?.substring(0, 50)}..."`,
      previewed: 'previewed this file',
      version_created: `created version ${activity.metadata?.version}`,
      version_restored: `restored to version ${activity.metadata?.version}`
    };

    return actions[activity.action] || `performed ${activity.action}`;
  }

  // ============================================================================
  // ADVANCED SEARCH WITH FILTERS
  // ============================================================================

  /**
   * Advanced file search with multiple filters
   */
  fastify.get('/search/advanced', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const {
        q, // Search query
        type, // File type (mime type prefix, e.g., 'image/', 'application/pdf')
        minSize, // Minimum file size in bytes
        maxSize, // Maximum file size in bytes
        createdAfter, // ISO date string
        createdBefore, // ISO date string
        folderId, // Specific folder
        tags, // Comma-separated tags (from metadata)
        shared, // 'true' to show only shared files
        starred, // 'true' to show only starred files
        sortBy = 'createdAt', // 'name', 'size', 'createdAt', 'relevance'
        sortOrder = 'desc',
        page = 1,
        limit = 50
      } = request.query;

      // Build where clause
      const where = {
        userId,
        isDeleted: false
      };

      // Full-text search on name and description
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          // If using PostgreSQL full-text search:
          // { searchVector: { search: q } }
        ];
      }

      // File type filter
      if (type) {
        where.type = { startsWith: type };
      }

      // Size filters
      if (minSize) {
        where.size = { ...where.size, gte: parseInt(minSize) };
      }
      if (maxSize) {
        where.size = { ...where.size, lte: parseInt(maxSize) };
      }

      // Date filters
      if (createdAfter) {
        where.createdAt = { ...where.createdAt, gte: new Date(createdAfter) };
      }
      if (createdBefore) {
        where.createdAt = { ...where.createdAt, lte: new Date(createdBefore) };
      }

      // Folder filter
      if (folderId) {
        where.folderId = folderId;
      }

      // Tags filter (check metadata JSON)
      if (tags) {
        const tagArray = tags.split(',').map(t => t.trim());
        where.metadata = {
          path: ['tags'],
          array_contains: tagArray
        };
      }

      // Shared files filter
      if (shared === 'true') {
        where.shares = {
          some: {
            expiresAt: { gte: new Date() }
          }
        };
      }

      // Starred files filter
      if (starred === 'true') {
        where.metadata = {
          path: ['starred'],
          equals: true
        };
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Order by
      const orderBy = {};
      if (sortBy === 'relevance' && q) {
        // For PostgreSQL full-text search, use ts_rank
        // For simple search, just use createdAt desc
        orderBy.createdAt = 'desc';
      } else {
        orderBy[sortBy] = sortOrder;
      }

      // Execute search
      const [files, totalCount] = await Promise.all([
        prisma.storageFile.findMany({
          where,
          include: {
            folder: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: {
                shares: true,
                comments: true,
                versions: true
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.storageFile.count({ where })
      ]);

      // Generate signed URLs for downloads
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const downloadUrl = await storageHandler.getDownloadUrl(file.storagePath, 3600);
          const thumbnailUrl = file.thumbnailPath
            ? await storageHandler.getDownloadUrl(file.thumbnailPath, 3600)
            : null;

          return {
            ...file,
            downloadUrl,
            thumbnailUrl,
            shareCount: file._count.shares,
            commentCount: file._count.comments,
            versionCount: file._count.versions
          };
        })
      );

      return reply.send({
        success: true,
        results: filesWithUrls,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: skip + limit < totalCount,
          hasPrevPage: page > 1
        },
        filters: {
          query: q,
          type,
          minSize,
          maxSize,
          createdAfter,
          createdBefore,
          folderId,
          tags,
          shared,
          starred
        }
      });
    } catch (error) {
      logger.error('Advanced search error:', error);
      return reply.status(500).send({ error: 'Search failed' });
    }
  });

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk delete files
   */
  fastify.post('/files/bulk/delete', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds, permanent = false } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: 'fileIds array is required' });
      }

      // Validate user owns all files
      const files = await prisma.storageFile.findMany({
        where: {
          id: { in: fileIds },
          userId
        }
      });

      if (files.length !== fileIds.length) {
        return reply.status(403).send({
          error: 'Some files not found or you do not have permission'
        });
      }

      let deletedCount = 0;

      if (permanent) {
        // Permanent deletion
        for (const file of files) {
          // Delete from storage
          await storageHandler.deleteFile(file.storagePath);

          // Delete thumbnail
          if (file.thumbnailPath) {
            await storageHandler.deleteFile(file.thumbnailPath);
          }

          // Delete all versions
          const versions = await prisma.fileVersion.findMany({
            where: { fileId: file.id }
          });
          for (const version of versions) {
            await storageHandler.deleteFile(version.storagePath);
          }

          // Delete from database
          await prisma.storageFile.delete({ where: { id: file.id } });

          deletedCount++;
        }
      } else {
        // Soft delete
        await prisma.storageFile.updateMany({
          where: { id: { in: fileIds } },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });
        deletedCount = fileIds.length;
      }

      // Log activity
      for (const fileId of fileIds) {
        await logFileActivity(fileId, userId, 'deleted', { permanent }, request);
      }

      return reply.send({
        success: true,
        deletedCount,
        message: permanent
          ? `${deletedCount} files permanently deleted`
          : `${deletedCount} files moved to trash`
      });
    } catch (error) {
      logger.error('Bulk delete error:', error);
      return reply.status(500).send({ error: 'Bulk delete failed' });
    }
  });

  /**
   * Bulk move files to a folder
   */
  fastify.post('/files/bulk/move', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds, targetFolderId } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: 'fileIds array is required' });
      }

      // Verify folder belongs to user (if not null)
      if (targetFolderId) {
        const folder = await prisma.storageFolder.findFirst({
          where: { id: targetFolderId, userId }
        });
        if (!folder) {
          return reply.status(404).send({ error: 'Target folder not found' });
        }
      }

      // Validate user owns all files
      const files = await prisma.storageFile.findMany({
        where: {
          id: { in: fileIds },
          userId
        }
      });

      if (files.length !== fileIds.length) {
        return reply.status(403).send({
          error: 'Some files not found or you do not have permission'
        });
      }

      // Move files
      await prisma.storageFile.updateMany({
        where: { id: { in: fileIds } },
        data: { folderId: targetFolderId }
      });

      // Log activity
      for (const fileId of fileIds) {
        await logFileActivity(fileId, userId, 'moved', { targetFolderId }, request);
      }

      return reply.send({
        success: true,
        movedCount: fileIds.length,
        message: `${fileIds.length} files moved successfully`
      });
    } catch (error) {
      logger.error('Bulk move error:', error);
      return reply.status(500).send({ error: 'Bulk move failed' });
    }
  });

  /**
   * Bulk restore files from trash
   */
  fastify.post('/files/bulk/restore', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: 'fileIds array is required' });
      }

      // Restore files
      const result = await prisma.storageFile.updateMany({
        where: {
          id: { in: fileIds },
          userId,
          isDeleted: true
        },
        data: {
          isDeleted: false,
          deletedAt: null
        }
      });

      // Log activity
      for (const fileId of fileIds) {
        await logFileActivity(fileId, userId, 'restored', {}, request);
      }

      return reply.send({
        success: true,
        restoredCount: result.count,
        message: `${result.count} files restored from trash`
      });
    } catch (error) {
      logger.error('Bulk restore error:', error);
      return reply.status(500).send({ error: 'Bulk restore failed' });
    }
  });

  // ============================================================================
  // DOWNLOAD MULTIPLE FILES AS ZIP
  // ============================================================================

  /**
   * Download multiple files as a ZIP archive
   */
  fastify.post('/files/download-zip', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds, zipName = 'files.zip' } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: 'fileIds array is required' });
      }

      // Validate user has access to all files
      const files = await prisma.storageFile.findMany({
        where: {
          id: { in: fileIds },
          OR: [
            { userId }, // Owner
            {
              shares: {
                some: {
                  sharedWith: userId,
                  permission: { in: ['view', 'edit', 'admin'] }
                }
              }
            }
          ],
          isDeleted: false
        }
      });

      if (files.length === 0) {
        return reply.status(404).send({ error: 'No accessible files found' });
      }

      // Create ZIP archive
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Set response headers
      reply.raw.setHeader('Content-Type', 'application/zip');
      reply.raw.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

      // Pipe archive to response
      archive.pipe(reply.raw);

      // Add files to archive
      for (const file of files) {
        try {
          // Download file from storage
          const fileBuffer = await storageHandler.downloadAsBuffer(file.storagePath);

          // Add to archive with original filename
          archive.append(fileBuffer, { name: file.name });
        } catch (error) {
          logger.error(`Failed to add file ${file.id} to ZIP:`, error);
          // Continue with other files
        }
      }

      // Add manifest file with metadata
      const manifest = {
        exportDate: new Date().toISOString(),
        fileCount: files.length,
        files: files.map(f => ({
          name: f.name,
          type: f.type,
          size: Number(f.size),
          createdAt: f.createdAt
        }))
      };
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

      // Finalize the archive
      await archive.finalize();

      // Log activity for each file
      for (const file of files) {
        await logFileActivity(file.id, userId, 'downloaded', { asZip: true }, request);
      }

      // Note: reply.send() is not called because we're streaming
    } catch (error) {
      logger.error('Download ZIP error:', error);
      return reply.status(500).send({ error: 'Failed to create ZIP archive' });
    }
  });

  // ============================================================================
  // FILE STAR/FAVORITE
  // ============================================================================

  /**
   * Star/favorite a file
   */
  fastify.post('/files/:id/star', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;

      const file = await prisma.storageFile.findFirst({
        where: { id: fileId, userId }
      });

      if (!file) {
        return reply.status(404).send({ error: 'File not found' });
      }

      // Update metadata to add starred flag
      const currentMetadata = file.metadata || {};
      await prisma.storageFile.update({
        where: { id: fileId },
        data: {
          metadata: {
            ...currentMetadata,
            starred: true,
            starredAt: new Date().toISOString()
          }
        }
      });

      return reply.send({
        success: true,
        message: 'File starred'
      });
    } catch (error) {
      logger.error('Star file error:', error);
      return reply.status(500).send({ error: 'Failed to star file' });
    }
  });

  /**
   * Unstar/unfavorite a file
   */
  fastify.delete('/files/:id/star', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;

      const file = await prisma.storageFile.findFirst({
        where: { id: fileId, userId }
      });

      if (!file) {
        return reply.status(404).send({ error: 'File not found' });
      }

      // Update metadata to remove starred flag
      const currentMetadata = file.metadata || {};
      delete currentMetadata.starred;
      delete currentMetadata.starredAt;

      await prisma.storageFile.update({
        where: { id: fileId },
        data: { metadata: currentMetadata }
      });

      return reply.send({
        success: true,
        message: 'File unstarred'
      });
    } catch (error) {
      logger.error('Unstar file error:', error);
      return reply.status(500).send({ error: 'Failed to unstar file' });
    }
  });

  // Export log activity function for use in other routes
  fastify.decorate('logFileActivity', logFileActivity);
}
