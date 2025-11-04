/**
 * Storage Routes Module
 * Handles file upload, download, and storage management
 */

const { authenticate } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const storageHandler = require('../utils/storageHandler');
const { validateFileUpload, validateFileType } = require('../utils/storageValidation');
const logger = require('../utils/logger');

/**
 * Register all storage routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function storageRoutes(fastify, options) {
  // Log route registration
  logger.info('📁 Storage routes registered: /api/storage/*');
  logger.info('   → GET    /api/storage/files');
  logger.info('   → POST   /api/storage/files/upload');
  logger.info('   → PUT    /api/storage/files/:id');
  logger.info('   → DELETE /api/storage/files/:id (soft delete)');
  logger.info('   → POST   /api/storage/files/:id/restore');
  logger.info('   → DELETE /api/storage/files/:id/permanent');
  
  // Get all files for authenticated user
  fastify.get('/files', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      // Get query parameters
      const folderId = request.query.folderId || null;
      const includeDeleted = request.query.includeDeleted === 'true';
      const type = request.query.type || null;
      const search = request.query.search || null;

      // Build where clause
      const where = {
        userId,
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(type ? { type } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      // Folder filter: null/undefined means root folder (no folder)
      if (folderId !== null && folderId !== undefined) {
        where.folderId = folderId;
      } else {
        // Root folder - files with no folder (folderId is null)
        where.folderId = null;
      }

      // Fetch files from database
      const files = await prisma.storageFile.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          folder: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Transform to match frontend expected format
      const formattedFiles = files.map(file => ({
        id: file.id,
        name: file.name,
        fileName: file.fileName,
        type: file.type,
        contentType: file.contentType,
        size: Number(file.size),
        sizeBytes: Number(file.size),
        storagePath: file.storagePath,
        publicUrl: file.publicUrl,
        description: file.description,
        isPublic: file.isPublic,
        isStarred: file.isStarred,
        isArchived: file.isArchived,
        folderId: file.folderId || null, // Ensure null instead of undefined
        folderName: file.folder?.name || null,
        downloadCount: file.downloadCount,
        viewCount: file.viewCount,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
        lastModified: file.updatedAt.toISOString(),
        owner: userId,
        sharedWith: [],
        comments: [],
        version: 1,
        deletedAt: file.deletedAt ? file.deletedAt.toISOString() : null // Include deletedAt for filtering
      }));

      // Get storage quota
      let storageInfo = null;
      try {
        const quota = await prisma.storageQuota.findUnique({
          where: { userId }
        });

        if (quota) {
          const usedBytes = Number(quota.usedBytes);
          const limitBytes = Number(quota.limitBytes);
          const usedGB = usedBytes / (1024 * 1024 * 1024);
          const limitGB = limitBytes / (1024 * 1024 * 1024);
          const percentage = limitGB > 0 ? (usedGB / limitGB) * 100 : 0;

          storageInfo = {
            usedBytes,
            limitBytes,
            usedGB: Number(usedGB.toFixed(2)),
            limitGB: Number(limitGB.toFixed(2)),
            percentage: Number(percentage.toFixed(2))
          };
        }
      } catch (error) {
        logger.warn('Failed to fetch storage quota:', error.message);
      }

      return reply.send({
        success: true,
        files: formattedFiles,
        storage: storageInfo,
        count: formattedFiles.length
      });

    } catch (error) {
      logger.error('Error fetching files:', error);
      return reply.status(500).send({
        error: 'Failed to fetch files',
        message: error.message
      });
    }
  });
  
  // Test route to verify storage connection
  fastify.get('/test', async (request, reply) => {
    try {
      const storageHandler = require('../utils/storageHandler');
      
      return reply.send({
        success: true,
        message: 'Storage routes are working',
        storageType: storageHandler.getStorageType(),
        isSupabase: storageHandler.isSupabase(),
        supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || 'roleready-file',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
  
  // File Upload
  fastify.post('/files/upload', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      logger.info(`📤 File upload request received: ${request.method} ${request.url}`);
      
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        logger.warn('File upload failed: User ID not found in token');
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }
      
      logger.info(`📤 File upload initiated by user: ${userId}`);

      // Get file and fields from multipart form
      // Fastify multipart: use request.parts() to get both file and fields
      let fileData = null;
      let fileName = null;
      let contentType = null;
      let fileSize = 0;
      const formFields = {}; // Collect all form fields
      
      // Process all parts (both files and fields) in a single iteration
      // Note: request.parts() can only be consumed once
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          // This is the file upload
          fileData = part;
          fileName = part.filename;
          contentType = part.mimetype;
          // For file size, we need to read the stream
          const chunks = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          fileSize = buffer.length;
          
          // Create a new readable stream from buffer for storage handler
          const { Readable } = require('stream');
          fileData.file = Readable.from(buffer);
        } else if (part.type === 'field') {
          // Collect form fields
          formFields[part.fieldname] = part.value;
        }
      }
      
      if (!fileData) {
        return reply.status(400).send({
          error: 'No file provided',
          message: 'Please provide a file to upload'
        });
      }

      // Validate file
      const validation = await validateFileUpload(
        fileData.file,
        fileName,
        contentType,
        fileSize
      );

      if (!validation.valid) {
        return reply.status(400).send({
          error: 'File validation failed',
          message: validation.errors.join(', '),
          errors: validation.errors,
          warnings: validation.warnings
        });
      }

      // Check storage quota (optional - only if StorageQuota model exists)
      let quota = null;
      let newFileSize = BigInt(fileSize);
      
      try {
        // Try to get quota from database (if model exists)
        quota = await prisma.storageQuota.findUnique({
          where: { userId }
        });

        // Create quota record if it doesn't exist
        if (!quota) {
          const defaultLimit = BigInt(process.env.DEFAULT_STORAGE_LIMIT || 5 * 1024 * 1024 * 1024); // 5GB default
          quota = await prisma.storageQuota.create({
            data: {
              userId,
              usedBytes: BigInt(0),
              limitBytes: defaultLimit
            }
          });
        }

        // Check if adding this file would exceed quota
        if (quota.usedBytes + newFileSize > quota.limitBytes) {
          const usedGB = Number(quota.usedBytes) / (1024 * 1024 * 1024);
          const limitGB = Number(quota.limitBytes) / (1024 * 1024 * 1024);
          const fileGB = fileSize / (1024 * 1024 * 1024);
          
          return reply.status(403).send({
            error: 'Storage quota exceeded',
            message: `Uploading this file would exceed your storage limit.`,
            storage: {
              usedGB: usedGB.toFixed(2),
              limitGB: limitGB.toFixed(2),
              availableGB: (limitGB - usedGB).toFixed(2),
              fileSizeGB: fileGB.toFixed(2)
            }
          });
        }
      } catch (error) {
        // If StorageQuota model doesn't exist yet, skip quota check
        logger.warn('StorageQuota model not found, skipping quota validation:', error.message);
      }

      // Get additional metadata from form (if provided)
      // Use the form fields we collected during parts iteration
      let displayName = validation.sanitizedFileName;
      let fileType = 'document';
      let description = null;
      let isPublic = false;
      let folderId = null;

      // Process collected form fields
      if (formFields.displayName) displayName = formFields.displayName;
      if (formFields.type) fileType = formFields.type;
      if (formFields.description) description = formFields.description;
      if (formFields.isPublic) isPublic = formFields.isPublic === 'true';
      if (formFields.folderId) folderId = formFields.folderId === 'null' ? null : formFields.folderId;

      // Validate file type
      const typeValidation = validateFileType(fileType);
      if (!typeValidation.valid) {
        return reply.status(400).send({
          error: 'Invalid file type',
          message: typeValidation.error
        });
      }

      // Upload file to storage
      // Note: storageHandler.upload() will initialize storage automatically
      logger.info(`Uploading file: ${fileName} for user: ${userId}`);
      logger.info(`File size: ${fileSize} bytes, Content-Type: ${contentType}`);
      
      const storageResult = await storageHandler.upload(
        fileData.file,
        userId,
        fileName,
        contentType
      );
      
      if (!storageResult || !storageResult.path) {
        throw new Error('Storage upload returned invalid result');
      }
      
      logger.info(`✅ File uploaded successfully: ${storageResult.path}`);

      // Save file metadata to database
      let savedFile = null;
      try {
        savedFile = await prisma.storageFile.create({
          data: {
            userId,
            name: displayName,
            fileName: fileName,
            type: fileType,
            contentType: contentType,
            size: BigInt(fileSize),
            storagePath: storageResult.path,
            publicUrl: storageResult.publicUrl || null,
            description: description || null,
            isPublic: isPublic,
            folderId: folderId || null
          }
        });
        logger.info(`✅ File metadata saved to database: ${savedFile.id}`);
      } catch (dbError) {
        logger.error('❌ Failed to save file metadata to database:', dbError);
        logger.error('❌ Database error details:', {
          message: dbError.message,
          code: dbError.code,
          meta: dbError.meta,
          stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
        });
        // Re-throw the error so the upload fails if database save fails
        // This ensures files are only considered uploaded if they're in the database
        throw new Error(`Failed to save file to database: ${dbError.message}`);
      }

      // Use saved file data or create fallback
      const fileMetadata = savedFile ? {
        id: savedFile.id,
        userId: savedFile.userId,
        name: savedFile.name,
        fileName: savedFile.fileName,
        type: savedFile.type,
        contentType: savedFile.contentType,
        size: Number(savedFile.size),
        storagePath: savedFile.storagePath,
        publicUrl: savedFile.publicUrl,
        description: savedFile.description,
        isPublic: savedFile.isPublic,
        folderId: savedFile.folderId,
        createdAt: savedFile.createdAt.toISOString()
      } : {
        // Fallback if database save failed
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        name: displayName,
        fileName: fileName,
        type: fileType,
        contentType: contentType,
        size: fileSize,
        storagePath: storageResult.path,
        publicUrl: storageResult.publicUrl || null,
        description: description || null,
        isPublic: isPublic,
        folderId: folderId || null,
        createdAt: new Date().toISOString()
      };

      // Update storage quota (if model exists)
      let storageInfo = {
        usedBytes: 0,
        limitBytes: 0,
        usedGB: 0,
        limitGB: 0,
        percentage: 0
      };

      if (quota) {
        try {
          await prisma.storageQuota.update({
            where: { userId },
            data: {
              usedBytes: quota.usedBytes + newFileSize
            }
          });

          // Calculate updated storage info
          const updatedQuota = await prisma.storageQuota.findUnique({
            where: { userId }
          });

          if (updatedQuota) {
            const usedBytes = Number(updatedQuota.usedBytes);
            const limitBytes = Number(updatedQuota.limitBytes);
            const usedGB = usedBytes / (1024 * 1024 * 1024);
            const limitGB = limitBytes / (1024 * 1024 * 1024);
            const percentage = limitGB > 0 ? (usedGB / limitGB) * 100 : 0;

            storageInfo = {
              usedBytes,
              limitBytes,
              usedGB: Number(usedGB.toFixed(2)),
              limitGB: Number(limitGB.toFixed(2)),
              percentage: Number(percentage.toFixed(2))
            };
          }
        } catch (error) {
          logger.warn('Failed to update storage quota:', error.message);
        }
      }

      logger.info(`File uploaded successfully: ${storageResult.path}`);

          reply.status(201).send({
            success: true,
            file: {
              id: fileMetadata.id,
              name: fileMetadata.name,
              fileName: fileMetadata.fileName,
              type: fileMetadata.type,
              size: fileMetadata.size,
              storagePath: fileMetadata.storagePath,
              publicUrl: fileMetadata.publicUrl,
              description: fileMetadata.description || null,
              isPublic: fileMetadata.isPublic || false,
              folderId: fileMetadata.folderId || null,
              createdAt: fileMetadata.createdAt
            },
            storage: storageInfo
          });

    } catch (error) {
      logger.error('File upload error:', error);
      logger.error('Error stack:', error.stack);
      
      // Return more detailed error in development
      const errorResponse = {
        error: 'Upload failed',
        message: error.message || 'An error occurred while uploading the file'
      };
      
      if (process.env.NODE_ENV === 'development') {
        errorResponse.details = error.stack;
      }
      
      reply.status(500).send(errorResponse);
    }
  });

  // Update file metadata (name, type, description, visibility, etc.)
  fastify.put('/files/:id', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const fileId = request.params.id;
      const body = request.body || {};
      const { name, type, description, isPublic, isStarred, isArchived, folderId, displayName } = body;

      const updates = {};

      if (typeof name === 'string') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          return reply.status(400).send({
            error: 'Invalid name',
            message: 'File name cannot be empty'
          });
        }
        updates.name = trimmedName;
      }

      if (updates.name === undefined && typeof displayName === 'string') {
        const trimmedDisplayName = displayName.trim();
        if (trimmedDisplayName) {
          updates.name = trimmedDisplayName;
        }
      }

      if (typeof type === 'string') {
        const typeValidation = validateFileType(type);
        if (!typeValidation.valid) {
          return reply.status(400).send({
            error: 'Invalid file type',
            message: typeValidation.error
          });
        }
        updates.type = type;
      }

      if (description !== undefined) {
        updates.description = description ? String(description).trim() : null;
      }

      if (typeof isPublic === 'boolean') {
        updates.isPublic = isPublic;
      }

      if (typeof isStarred === 'boolean') {
        updates.isStarred = isStarred;
      }

      if (typeof isArchived === 'boolean') {
        updates.isArchived = isArchived;
      }

      if (folderId !== undefined) {
        updates.folderId = folderId === null || folderId === 'null' ? null : folderId;
      }

      if (Object.keys(updates).length === 0) {
        return reply.status(400).send({
          error: 'No updates provided',
          message: 'Please provide at least one field to update'
        });
      }

      // Ensure file belongs to user
      const existingFile = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!existingFile) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have permission to update it'
        });
      }

      const updatedFile = await prisma.storageFile.update({
        where: { id: fileId },
        data: updates
      });

      logger.info(`✅ File updated: ${fileId}`, updates);

      return reply.send({
        success: true,
        file: {
          id: updatedFile.id,
          name: updatedFile.name,
          fileName: updatedFile.fileName,
          type: updatedFile.type,
          description: updatedFile.description,
          isPublic: updatedFile.isPublic,
          isStarred: updatedFile.isStarred,
          isArchived: updatedFile.isArchived,
          folderId: updatedFile.folderId,
          updatedAt: updatedFile.updatedAt.toISOString()
        }
      });

    } catch (error) {
      logger.error('Error updating file metadata:', error);
      return reply.status(500).send({
        error: 'Failed to update file',
        message: error.message || 'An error occurred while updating the file'
      });
    }
  });

  // Soft delete file (move to recycle bin)
  fastify.delete('/files/:id', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const fileId = request.params.id;

      // Check if file exists and belongs to user
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have permission to delete it'
        });
      }

      // Soft delete - set deletedAt timestamp
      const updatedFile = await prisma.storageFile.update({
        where: { id: fileId },
        data: {
          deletedAt: new Date()
        }
      });

      logger.info(`✅ File soft deleted (moved to recycle bin): ${fileId}`);

      return reply.send({
        success: true,
        message: 'File moved to recycle bin',
        file: {
          id: updatedFile.id,
          deletedAt: updatedFile.deletedAt?.toISOString() || null
        }
      });

    } catch (error) {
      logger.error('Error soft deleting file:', error);
      return reply.status(500).send({
        error: 'Failed to delete file',
        message: error.message || 'An error occurred while deleting the file'
      });
    }
  });

  // Restore file from recycle bin
  fastify.post('/files/:id/restore', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const fileId = request.params.id;

      // Check if file exists and belongs to user
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have permission to restore it'
        });
      }

      if (!file.deletedAt) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'File is not in recycle bin'
        });
      }

      // Restore - remove deletedAt timestamp
      const updatedFile = await prisma.storageFile.update({
        where: { id: fileId },
        data: {
          deletedAt: null
        }
      });

      logger.info(`✅ File restored from recycle bin: ${fileId}`);

      return reply.send({
        success: true,
        message: 'File restored from recycle bin',
        file: {
          id: updatedFile.id,
          deletedAt: null
        }
      });

    } catch (error) {
      logger.error('Error restoring file:', error);
      return reply.status(500).send({
        error: 'Failed to restore file',
        message: error.message || 'An error occurred while restoring the file'
      });
    }
  });

  // Permanently delete file (hard delete)
  fastify.delete('/files/:id/permanent', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const fileId = request.params.id;

      // Check if file exists and belongs to user
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have permission to delete it'
        });
      }

      // Delete file from storage
      try {
        await storageHandler.deleteFile(file.storagePath);
        logger.info(`✅ File deleted from storage: ${file.storagePath}`);
      } catch (storageError) {
        logger.warn('⚠️ Failed to delete file from storage (continuing with database delete):', storageError.message);
        // Continue with database delete even if storage delete fails
      }

      // Permanently delete from database
      await prisma.storageFile.delete({
        where: { id: fileId }
      });

      logger.info(`✅ File permanently deleted: ${fileId}`);

      // Update storage quota
      try {
        const quota = await prisma.storageQuota.findUnique({
          where: { userId }
        });

        if (quota) {
          const currentUsed = Number(quota.usedBytes);
          const fileSize = Number(file.size);
          const newUsed = Math.max(0, currentUsed - fileSize);

          await prisma.storageQuota.update({
            where: { userId },
            data: {
              usedBytes: BigInt(newUsed)
            }
          });

          logger.info(`✅ Storage quota updated: ${newUsed} bytes used`);
        }
      } catch (quotaError) {
        logger.warn('⚠️ Failed to update storage quota:', quotaError.message);
      }

      return reply.send({
        success: true,
        message: 'File permanently deleted',
        storage: {
          usedBytes: 0, // Will be calculated by frontend
          limitBytes: 0
        }
      });

    } catch (error) {
      logger.error('Error permanently deleting file:', error);
      return reply.status(500).send({
        error: 'Failed to permanently delete file',
        message: error.message || 'An error occurred while deleting the file'
      });
    }
  });
}

module.exports = storageRoutes;

