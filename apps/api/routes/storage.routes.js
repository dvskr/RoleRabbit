/**
 * Storage Routes Module
 * Handles file upload, download, and storage management
 */

const { authenticate } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const storageHandler = require('../utils/storageHandler');
const { validateFileUpload, validateFileType } = require('../utils/storageValidation');
const { checkFilePermission } = require('../utils/filePermissions');
const logger = require('../utils/logger');
const socketIOServer = require('../utils/socketIOServer');

/**
 * Register all storage routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function storageRoutes(fastify, _options) {
  // Log route registration
  logger.info('📁 Storage routes registered: /api/storage/*');
  logger.info('   → GET    /api/storage/files');
  logger.info('   → POST   /api/storage/files/upload');
  logger.info('   → GET    /api/storage/files/:id/download');
  logger.info('   → PUT    /api/storage/files/:id');
  logger.info('   → DELETE /api/storage/files/:id (soft delete)');
  logger.info('   → POST   /api/storage/files/:id/restore');
  logger.info('   → DELETE /api/storage/files/:id/permanent');
  logger.info('   → POST   /api/storage/files/:id/share');
  logger.info('   → POST   /api/storage/files/:id/share-link');
  logger.info('   → GET    /api/storage/files/:id/comments');
  logger.info('   → POST   /api/storage/files/:id/comments');
  logger.info('   → POST   /api/storage/files/:id/move');
  logger.info('   → PUT    /api/storage/shares/:id');
  logger.info('   → DELETE /api/storage/shares/:id');
  logger.info('   → POST   /api/storage/files/batch/delete (batch delete)');
  logger.info('   → POST   /api/storage/files/batch/move (batch move)');
  logger.info('   → POST   /api/storage/files/batch/restore (batch restore)');
  logger.info('   → POST   /api/storage/files/download/zip (ZIP download)');
  logger.info('   → GET    /api/storage/analytics (storage analytics)');
  logger.info('   → GET    /api/storage/files/:id/versions (file versions)');
  logger.info('   → POST   /api/storage/files/:id/versions (create version)');
  logger.info('   → POST   /api/storage/files/:id/versions/:versionId/restore (restore version)');
  logger.info('   → GET    /api/storage/tags (file tags)');
  logger.info('   → POST   /api/storage/tags (create tag)');
  logger.info('   → POST   /api/storage/files/:id/tags (add tag to file)');
  logger.info('   → DELETE /api/storage/files/:id/tags/:tagId (remove tag from file)');
  
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
        // When includeDeleted is true (recycle bin), show only deleted files (deletedAt IS NOT NULL)
        // When includeDeleted is false (normal view), show only non-deleted files (deletedAt IS NULL)
        ...(includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null }),
        ...(type ? { type } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      // Folder filter: only filter if folderId is explicitly provided
      // If not provided, return ALL files (client-side will filter)
      if (folderId !== null && folderId !== undefined && folderId !== '') {
        where.folderId = folderId;
      }
      // If folderId not provided, don't add folder filter - return all files

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
          },
          shares: {
            include: {
              sharer: {
                select: {
                  name: true,
                  email: true
                }
              },
              recipient: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          comments: {
            where: {
              parentId: null // Only top-level comments for listing
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                },
                orderBy: {
                  createdAt: 'asc'
                },
                take: 5 // Limit replies in listing
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10 // Limit comments in listing
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
        sharedWith: file.shares ? file.shares.map((share) => ({
          id: share.id,
          userId: share.sharedWith,
          userEmail: share.recipient?.email || share.sharedWith,
          userName: share.recipient?.name || 'Unknown User',
          permission: share.permission,
          grantedBy: share.userId,
          grantedAt: share.createdAt.toISOString(),
          expiresAt: share.expiresAt?.toISOString() || null
        })) : [],
        comments: file.comments ? file.comments.map((comment) => ({
          id: comment.id,
          userId: comment.userId,
          userName: comment.user.name,
          userAvatar: null,
          content: comment.content,
          timestamp: comment.createdAt.toISOString(),
          isResolved: comment.isResolved,
          replies: comment.replies.map((reply) => ({
            id: reply.id,
            userId: reply.userId,
            userName: reply.user.name,
            userAvatar: null,
            content: reply.content,
            timestamp: reply.createdAt.toISOString(),
            isResolved: reply.isResolved,
            replies: []
          }))
        })) : [],
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
          
          // Compute fileHash for resume files
          const crypto = require('crypto');
          fileData.fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
          
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
      let folderId = null;
      // Always set isPublic to false (public view feature removed)
      const isPublic = false;

      // Process collected form fields
      if (formFields.displayName) displayName = formFields.displayName;
      if (formFields.type) fileType = formFields.type;
      if (formFields.description) description = formFields.description;
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
            fileHash: fileData.fileHash || null,
            description: description || null,
            isPublic: isPublic,
            folderId: folderId || null
          }
        });
        logger.info(`✅ File metadata saved to database: ${savedFile.id}`);
        
        // Update publicUrl with the file ID for local storage (enables preview/download via API)
        if (!storageResult.publicUrl || storageResult.publicUrl.startsWith('/api/storage/files/')) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const publicUrl = `${apiUrl}/api/storage/files/${savedFile.id}/download`;
          
          // Update the file with proper public URL
          savedFile = await prisma.storageFile.update({
            where: { id: savedFile.id },
            data: { publicUrl }
          });
          
          logger.info(`✅ Updated publicUrl to: ${publicUrl}`);
        }
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
        fileHash: savedFile.fileHash,  // ✅ ADD: Include fileHash for resume parsing
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
        fileHash: fileData.fileHash || null,  // ✅ ADD: Include fileHash for resume parsing
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

      // Emit real-time event for file creation
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileCreated(userId, fileMetadata);
      }

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
              fileHash: fileMetadata.fileHash || null,  // ✅ CRITICAL: Include fileHash for resume parsing!
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
      const { name, type, description, isStarred, isArchived, folderId, displayName } = body;

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

      // isPublic is always false (public view feature removed)
      // Ignore any isPublic input from client

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

      // Check permission to update file
      const permissionCheck = await checkFilePermission(userId, fileId, 'edit');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to update this file'
        });
      }

      const updatedFile = await prisma.storageFile.update({
        where: { id: fileId },
        data: updates
      });

      logger.info(`✅ File updated: ${fileId}`, updates);

      // Format file for real-time event
      const formattedFile = {
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
      };

      // Emit real-time event for file update
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileUpdated(userId, formattedFile, updates);
      }

      return reply.send({
        success: true,
        file: formattedFile
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

      // Check permission to delete file (requires admin permission - only owner can delete)
      const permissionCheck = await checkFilePermission(userId, fileId, 'delete');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to delete this file. Only file owners can delete files.'
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

      // Emit real-time event for file deletion
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileDeleted(userId, fileId, false);
      }

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

      // Format file for real-time event
      const restoredFile = {
        id: updatedFile.id,
        name: updatedFile.name,
        fileName: updatedFile.fileName,
        type: updatedFile.type,
        deletedAt: null
      };

      // Emit real-time event for file restore
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileRestored(userId, restoredFile);
      }

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

  // Move file to folder
  fastify.post('/files/:id/move', {
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
      const { folderId } = request.body || {};

      // Validate folderId if provided
      if (folderId !== null && folderId !== undefined) {
        if (folderId === 'null' || folderId === '') {
          // Move to root (no folder)
          const updatedFile = await prisma.storageFile.update({
            where: { id: fileId },
            data: { folderId: null }
          });

          logger.info(`✅ File moved to root: ${fileId}`);

          // Emit real-time event
          if (socketIOServer.isInitialized()) {
            socketIOServer.notifyFileUpdated(userId, {
              id: updatedFile.id,
              folderId: null
            }, { folderId: null });
          }

          return reply.send({
            success: true,
            message: 'File moved successfully',
            file: {
              id: updatedFile.id,
              folderId: null
            }
          });
        }

        // Check if folder exists and belongs to user
        const folder = await prisma.storageFolder.findFirst({
          where: {
            id: folderId,
            userId
          }
        });

        if (!folder) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Folder not found or you do not have permission to access it'
          });
        }
      }

      // Get file
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have permission to move it'
        });
      }

      // Update file folderId
      const updatedFile = await prisma.storageFile.update({
        where: { id: fileId },
        data: {
          folderId: folderId === null || folderId === undefined || folderId === 'null' ? null : folderId
        }
      });

      logger.info(`✅ File moved: ${fileId} to folder: ${folderId || 'root'}`);

      // Format file for real-time event
      const formattedFile = {
        id: updatedFile.id,
        name: updatedFile.name,
        fileName: updatedFile.fileName,
        type: updatedFile.type,
        folderId: updatedFile.folderId,
        updatedAt: updatedFile.updatedAt.toISOString()
      };

      // Emit real-time event
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileUpdated(userId, formattedFile, { folderId: updatedFile.folderId });
      }

      return reply.send({
        success: true,
        message: 'File moved successfully',
        file: {
          id: updatedFile.id,
          folderId: updatedFile.folderId
        }
      });

    } catch (error) {
      logger.error('Error moving file:', error);
      return reply.status(500).send({
        error: 'Failed to move file',
        message: error.message || 'An error occurred while moving the file'
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

  // Download file
  fastify.get('/files/:id/download', {
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

      // Check permission to download file
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to download this file'
        });
      }

      const file = permissionCheck.file;

      // Get file from storage
      let fileBuffer;
      try {
        const fileStream = await storageHandler.download(file.storagePath);
        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of fileStream) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
      } catch (error) {
        logger.error('Failed to download file from storage:', error);
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found in storage'
        });
      }
      
      if (!fileBuffer || fileBuffer.length === 0) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found in storage or file is empty'
        });
      }

      // Increment download count
      await prisma.storageFile.update({
        where: { id: fileId },
        data: {
          downloadCount: { increment: 1 }
        }
      });

      // Set appropriate headers
      reply.type(file.contentType || 'application/octet-stream');
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName || file.name)}"`);
      
      return reply.send(fileBuffer);

    } catch (error) {
      logger.error('Error downloading file:', error);
      return reply.status(500).send({
        error: 'Failed to download file',
        message: error.message || 'An error occurred while downloading the file'
      });
    }
  });

  // Share file with user
  fastify.post('/files/:id/share', {
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
      const { userEmail, permission = 'view', expiresAt, maxDownloads } = request.body || {};

      if (!userEmail) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'userEmail is required'
        });
      }

      // Check if file exists and belongs to user
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId,
          deletedAt: null
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have permission to share it'
        });
      }

      // Find the shared user (if exists)
      let sharedUser = await prisma.user.findUnique({
        where: { email: userEmail.toLowerCase() }
      });

      // Get the file owner's info for email
      const fileOwner = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      // Create share record - use user ID if exists, otherwise use email as identifier
      let share;
      if (sharedUser) {
        // User exists - create share with user ID
        share = await prisma.fileShare.create({
          data: {
            fileId,
            userId,
            sharedWith: sharedUser.id,
            permission,
            expiresAt: expiresAt ? new Date(expiresAt) : null
          },
          include: {
            recipient: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
      } else {
        // User doesn't exist - create a temporary user or use email-based sharing
        // For now, we'll create a share link instead and send email
        // This allows sharing with external users
        
        // Generate a share token
        const crypto = require('crypto');
        const shareToken = crypto.randomBytes(32).toString('hex');
        
        // Create share link with token
        const shareLink = await prisma.shareLink.create({
          data: {
            fileId,
            userId,
            token: shareToken,
            permission: permission || 'view',
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
            password: null // Password protection can be added later
          }
        });

        // Send email notification with share link
        const { sendEmail } = require('../utils/emailService');
        // Get frontend URL from env or detect from request
        let frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
          // Try to detect from request headers
          const protocol = request.headers['x-forwarded-proto'] || (request.protocol || 'http');
          const host = request.headers['x-forwarded-host'] || request.headers.host || 'localhost:3000';
          frontendUrl = `${protocol}://${host}`;
        }
        const shareUrl = `${frontendUrl}/shared/${shareToken}`;
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9fafb; }
              .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .file-info { background: #e5e7eb; padding: 15px; border-radius: 8px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>File Shared with You</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p><strong>${fileOwner?.name || 'Someone'}</strong> has shared a file with you.</p>
                <div class="file-info">
                  <p><strong>File:</strong> ${file.name}</p>
                  <p><strong>Permission:</strong> ${permission}</p>
                  ${expiresAt ? `<p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleString()}</p>` : ''}
                </div>
                <p>
                  <a href="${shareUrl}" class="button">View File</a>
                </p>
                <p>Or copy this link: <a href="${shareUrl}">${shareUrl}</a></p>
                <p>If you didn't expect this file, you can safely ignore this email.</p>
                <p>Best regards,<br>The RoleReady Team</p>
              </div>
            </div>
          </body>
          </html>
        `;

        let emailSent = false;
        let emailError = null;
        
        try {
          await sendEmail({
            to: userEmail,
            subject: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you`,
            html: emailHtml,
            text: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you. View it here: ${shareUrl}`,
            isSecurityEmail: false
          });
          logger.info(`✅ Share email sent to ${userEmail}`);
          emailSent = true;
        } catch (err) {
          logger.error('Failed to send share email:', err);
          emailError = err?.message || 'Failed to send email notification';
          // Don't fail the share if email fails - just notify the user
        }

        return reply.send({
          success: true,
          share: {
            id: shareLink.id,
            fileId: shareLink.fileId,
            shareLink: shareUrl,
            permission: shareLink.permission,
            expiresAt: shareLink.expiresAt?.toISOString() || null,
            createdAt: shareLink.createdAt.toISOString()
          },
          emailSent,
          emailError: emailError || undefined,
          warning: emailError ? 'Share link created but email notification failed. Please share the link manually.' : undefined
        });
      }

      logger.info(`✅ File shared: ${fileId} with ${userEmail}`);

      // Send email notification to existing user
      let emailSent = false;
      let emailError = null;
      
      if (sharedUser) {
        const { sendEmail } = require('../utils/emailService');
        // Get frontend URL from env or detect from request
        let frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
          // Try to detect from request headers
          const protocol = request.headers['x-forwarded-proto'] || (request.protocol || 'http');
          const host = request.headers['x-forwarded-host'] || request.headers.host || 'localhost:3000';
          frontendUrl = `${protocol}://${host}`;
        }
        const fileUrl = `${frontendUrl}/dashboard?tab=storage&fileId=${fileId}`;
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9fafb; }
              .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .file-info { background: #e5e7eb; padding: 15px; border-radius: 8px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>File Shared with You</h1>
              </div>
              <div class="content">
                <p>Hello ${sharedUser.name || userEmail},</p>
                <p><strong>${fileOwner?.name || 'Someone'}</strong> has shared a file with you.</p>
                <div class="file-info">
                  <p><strong>File:</strong> ${file.name}</p>
                  <p><strong>Permission:</strong> ${permission}</p>
                  ${expiresAt ? `<p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleString()}</p>` : ''}
                </div>
                <p>
                  <a href="${fileUrl}" class="button">View File</a>
                </p>
                <p>If you didn't expect this file, you can safely ignore this email.</p>
                <p>Best regards,<br>The RoleReady Team</p>
              </div>
            </div>
          </body>
          </html>
        `;

        try {
          await sendEmail({
            to: userEmail,
            subject: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you`,
            html: emailHtml,
            text: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you. View it here: ${fileUrl}`,
            isSecurityEmail: false
          });
          logger.info(`✅ Share email sent to ${userEmail}`);
          emailSent = true;
        } catch (err) {
          logger.error('Failed to send share email:', err);
          emailError = err?.message || 'Failed to send email notification';
          // Don't fail the share if email fails - just notify the user
        }
      }

      // Emit real-time event for file sharing
      if (socketIOServer.isInitialized() && sharedUser) {
        socketIOServer.notifyFileShared(userId, {
          fileId,
          share: {
            id: share.id,
            fileId: share.fileId,
            sharedWith: share.sharedWith,
            sharedWithUserId: share.sharedWith,
            permission: share.permission,
            expiresAt: share.expiresAt?.toISOString() || null,
            createdAt: share.createdAt.toISOString()
          }
        });
      }

      return reply.send({
        success: true,
        share: {
          id: share.id,
          fileId: share.fileId,
          sharedWith: share.sharedWith,
          sharedWithEmail: userEmail,
          permission: share.permission,
          expiresAt: share.expiresAt?.toISOString() || null,
          createdAt: share.createdAt.toISOString()
        },
        emailSent,
        emailError: emailError || undefined,
        warning: emailError ? 'File shared successfully but email notification failed. The recipient can still access the file.' : undefined
      });

    } catch (error) {
      logger.error('Error sharing file:', error);
      return reply.status(500).send({
        error: 'Failed to share file',
        message: error.message || 'An error occurred while sharing the file'
      });
    }
  });

  // Create share link
  fastify.post('/files/:id/share-link', {
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
      const { password, expiresAt, maxDownloads } = request.body || {};

      // Check if file exists and belongs to user
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId,
          deletedAt: null
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have permission to create share link'
        });
      }

      // Generate unique token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');

      // Create share link
      const shareLink = await prisma.shareLink.create({
        data: {
          fileId,
          userId,
          token,
          password: password || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          maxDownloads: maxDownloads || null
        }
      });

      logger.info(`✅ Share link created: ${fileId} - token: ${token}`);

      // Get frontend URL from env or detect from request
      let frontendUrl = process.env.FRONTEND_URL;
      if (!frontendUrl) {
        // Try to detect from request headers
        const protocol = request.headers['x-forwarded-proto'] || (request.protocol || 'http');
        const host = request.headers['x-forwarded-host'] || request.headers.host || 'localhost:3000';
        frontendUrl = `${protocol}://${host}`;
      }

      return reply.send({
        success: true,
        shareLink: {
          id: shareLink.id,
          token: shareLink.token,
          url: `${frontendUrl}/shared/${token}`,
          expiresAt: shareLink.expiresAt?.toISOString() || null,
          maxDownloads: shareLink.maxDownloads,
          hasPassword: !!shareLink.password
        }
      });

    } catch (error) {
      logger.error('Error creating share link:', error);
      return reply.status(500).send({
        error: 'Failed to create share link',
        message: error.message || 'An error occurred while creating share link'
      });
    }
  });

  // Get file comments
  fastify.get('/files/:id/comments', {
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

      // Check if file exists and user has access
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          OR: [
            { userId },
            { shares: { some: { sharedWith: userId } } }
          ],
          deletedAt: null
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found or you do not have access'
        });
      }

      // Get comments
      const comments = await prisma.fileComment.findMany({
        where: {
          fileId,
          parentId: null // Only top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedComments = comments.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        userName: comment.user.name,
        userAvatar: null, // Can be added later if profile pictures are available
        content: comment.content,
        timestamp: comment.createdAt.toISOString(),
        isResolved: comment.isResolved,
        replies: comment.replies.map(reply => ({
          id: reply.id,
          userId: reply.userId,
          userName: reply.user.name,
          userAvatar: null,
          content: reply.content,
          timestamp: reply.createdAt.toISOString(),
          isResolved: reply.isResolved,
          replies: []
        }))
      }));

      return reply.send({
        success: true,
        comments: formattedComments
      });

    } catch (error) {
      logger.error('Error fetching comments:', error);
      return reply.status(500).send({
        error: 'Failed to fetch comments',
        message: error.message || 'An error occurred while fetching comments'
      });
    }
  });

  // Add comment to file
  fastify.post('/files/:id/comments', {
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
      const { content, parentId } = request.body || {};

      if (!content || !content.trim()) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Comment content is required'
        });
      }

      // Check permission to comment on file
      const permissionCheck = await checkFilePermission(userId, fileId, 'comment');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to comment on this file'
        });
      }

      // If parentId is provided, verify it exists
      if (parentId) {
        const parentComment = await prisma.fileComment.findFirst({
          where: {
            id: parentId,
            fileId
          }
        });

        if (!parentComment) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Parent comment not found'
          });
        }
      }

      // Create comment
      const comment = await prisma.fileComment.create({
        data: {
          fileId,
          userId,
          content: content.trim(),
          parentId: parentId || null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info(`✅ Comment added to file: ${fileId} by user: ${userId}`);

      const formattedComment = {
        id: comment.id,
        userId: comment.userId,
        userName: comment.user.name,
        userAvatar: null,
        content: comment.content,
        timestamp: comment.createdAt.toISOString(),
        isResolved: comment.isResolved,
        replies: []
      };

      // Emit real-time event for comment added
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyCommentAdded(userId, fileId, formattedComment);
      }

      return reply.send({
        success: true,
        comment: formattedComment
      });

    } catch (error) {
      logger.error('Error adding comment:', error);
      return reply.status(500).send({
        error: 'Failed to add comment',
        message: error.message || 'An error occurred while adding comment'
      });
    }
  });

  // ===== FOLDER MANAGEMENT ENDPOINTS =====

  // Get all folders for user
  fastify.get('/folders', {
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

      const folders = await prisma.storageFolder.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: {
          _count: {
            select: {
              files: {
                where: {
                  deletedAt: null // Only count non-deleted files
                }
              }
            }
          }
        }
      });

      logger.info(`✅ Retrieved ${folders.length} folders for user: ${userId}`);

      return reply.send({
        success: true,
        folders: folders.map(folder => ({
          id: folder.id,
          name: folder.name,
          color: folder.color,
          fileCount: folder._count.files, // Include count of files in folder
          createdAt: folder.createdAt.toISOString(),
          updatedAt: folder.updatedAt.toISOString()
        }))
      });

    } catch (error) {
      logger.error('Error retrieving folders:', error);
      return reply.status(500).send({
        error: 'Failed to retrieve folders',
        message: error.message || 'An error occurred while retrieving folders'
      });
    }
  });

  // Create folder
  fastify.post('/folders', {
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

      const { name, color } = request.body || {};

      if (!name || !name.trim()) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Folder name is required'
        });
      }

      const folder = await prisma.storageFolder.create({
        data: {
          userId,
          name: name.trim(),
          color: color || '#4F46E5'
        }
      });

      logger.info(`✅ Folder created: ${folder.id} - ${folder.name}`);

      return reply.send({
        success: true,
        folder: {
          id: folder.id,
          name: folder.name,
          color: folder.color,
          createdAt: folder.createdAt.toISOString(),
          updatedAt: folder.updatedAt.toISOString()
        }
      });

    } catch (error) {
      logger.error('Error creating folder:', error);
      return reply.status(500).send({
        error: 'Failed to create folder',
        message: error.message || 'An error occurred while creating folder'
      });
    }
  });

  // Update folder (rename/change color)
  fastify.put('/folders/:id', {
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

      const folderId = request.params.id;
      const { name, color } = request.body || {};

      // Check if folder exists and belongs to user
      const folder = await prisma.storageFolder.findFirst({
        where: {
          id: folderId,
          userId
        }
      });

      if (!folder) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Folder not found or you do not have permission to update it'
        });
      }

      // Update folder
      const updatedFolder = await prisma.storageFolder.update({
        where: { id: folderId },
        data: {
          ...(name && name.trim() ? { name: name.trim() } : {}),
          ...(color ? { color } : {})
        }
      });

      logger.info(`✅ Folder updated: ${folderId}`);

      return reply.send({
        success: true,
        folder: {
          id: updatedFolder.id,
          name: updatedFolder.name,
          color: updatedFolder.color,
          createdAt: updatedFolder.createdAt.toISOString(),
          updatedAt: updatedFolder.updatedAt.toISOString()
        }
      });

    } catch (error) {
      logger.error('Error updating folder:', error);
      return reply.status(500).send({
        error: 'Failed to update folder',
        message: error.message || 'An error occurred while updating folder'
      });
    }
  });

  // Delete folder
  fastify.delete('/folders/:id', {
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

      const folderId = request.params.id;

      // Check if folder exists and belongs to user
      const folder = await prisma.storageFolder.findFirst({
        where: {
          id: folderId,
          userId
        }
      });

      if (!folder) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Folder not found or you do not have permission to delete it'
        });
      }

      // Move all files in this folder to root (folderId = null)
      await prisma.storageFile.updateMany({
        where: {
          folderId,
          userId
        },
        data: {
          folderId: null
        }
      });

      // Delete the folder
      await prisma.storageFolder.delete({
        where: { id: folderId }
      });

      logger.info(`✅ Folder deleted: ${folderId}`);

      return reply.send({
        success: true,
        message: 'Folder deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting folder:', error);
      return reply.status(500).send({
        error: 'Failed to delete folder',
        message: error.message || 'An error occurred while deleting folder'
      });
    }
  });

  // ===== CREDENTIALS MANAGEMENT ENDPOINTS =====

  // Get all credentials for user
  fastify.get('/credentials', {
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

      const credentials = await prisma.credential.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      logger.info(`✅ Retrieved ${credentials.length} credentials for user: ${userId}`);

      return reply.send({
        success: true,
        credentials: credentials.map(cred => ({
          id: cred.id,
          credentialId: cred.credentialId,
          credentialType: cred.credentialType,
          name: cred.name,
          issuer: cred.issuer,
          issuedDate: cred.issuedDate,
          expirationDate: cred.expirationDate,
          verificationUrl: cred.verificationUrl,
          verificationStatus: cred.verificationStatus,
          qrCode: cred.qrCode,
          fileId: cred.fileId,
          createdAt: cred.createdAt.toISOString(),
          updatedAt: cred.updatedAt.toISOString()
        }))
      });

    } catch (error) {
      logger.error('Error fetching credentials:', error);
      return reply.status(500).send({
        error: 'Failed to fetch credentials',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Get expiring credentials (for reminders)
  fastify.get('/credentials/expiring', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized'
        });
      }

      const days = parseInt(request.query.days || '90');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const expiringCredentials = await prisma.credential.findMany({
        where: {
          userId,
          expirationDate: {
            not: null,
            lte: futureDate.toISOString().split('T')[0]
          }
        },
        orderBy: {
          expirationDate: 'asc'
        }
      });

      return reply.send({
        success: true,
        reminders: expiringCredentials.map(cred => ({
          id: cred.id,
          credentialId: cred.id,
          name: cred.name,
          type: cred.credentialType,
          expirationDate: cred.expirationDate,
          daysUntilExpiration: Math.ceil(
            (new Date(cred.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
          ),
          priority: Math.ceil((new Date(cred.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) < 30 ? 'high' : 'medium'
        }))
      });

    } catch (error) {
      logger.error('Error fetching expiring credentials:', error);
      return reply.status(500).send({
        error: 'Failed to fetch expiring credentials',
        message: error.message
      });
    }
  });

  // Create credential
  fastify.post('/credentials', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized'
        });
      }

      const {
        credentialType,
        name,
        issuer,
        issuedDate,
        expirationDate,
        credentialId,
        verificationUrl,
        fileId
      } = request.body || {};

      if (!credentialType || !name || !issuer) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'credentialType, name, and issuer are required'
        });
      }

      const credential = await prisma.credential.create({
        data: {
          userId,
          credentialType,
          name,
          issuer,
          issuedDate: issuedDate || new Date().toISOString().split('T')[0],
          expirationDate: expirationDate || null,
          credentialId: credentialId || null,
          verificationUrl: verificationUrl || null,
          fileId: fileId || null,
          verificationStatus: 'pending'
        }
      });

      logger.info(`✅ Credential created: ${credential.id}`);

      return reply.send({
        success: true,
        credential: {
          id: credential.id,
          credentialId: credential.credentialId,
          credentialType: credential.credentialType,
          name: credential.name,
          issuer: credential.issuer,
          issuedDate: credential.issuedDate,
          expirationDate: credential.expirationDate,
          verificationUrl: credential.verificationUrl,
          verificationStatus: credential.verificationStatus,
          qrCode: credential.qrCode,
          fileId: credential.fileId,
          createdAt: credential.createdAt.toISOString(),
          updatedAt: credential.updatedAt.toISOString()
        }
      });

    } catch (error) {
      logger.error('Error creating credential:', error);
      return reply.status(500).send({
        error: 'Failed to create credential',
        message: error.message
      });
    }
  });

  // Update credential
  fastify.put('/credentials/:id', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized'
        });
      }

      const credentialId = request.params.id;
      const updates = request.body || {};

      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          userId
        }
      });

      if (!credential) {
        return reply.status(404).send({
          error: 'Credential not found'
        });
      }

      const updated = await prisma.credential.update({
        where: { id: credentialId },
        data: updates
      });

      logger.info(`✅ Credential updated: ${credentialId}`);

      return reply.send({
        success: true,
        credential: updated
      });

    } catch (error) {
      logger.error('Error updating credential:', error);
      return reply.status(500).send({
        error: 'Failed to update credential',
        message: error.message
      });
    }
  });

  // Delete credential
  fastify.delete('/credentials/:id', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized'
        });
      }

      const credentialId = request.params.id;

      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          userId
        }
      });

      if (!credential) {
        return reply.status(404).send({
          error: 'Credential not found'
        });
      }

      await prisma.credential.delete({
        where: { id: credentialId }
      });

      logger.info(`✅ Credential deleted: ${credentialId}`);

      return reply.send({
        success: true,
        message: 'Credential deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting credential:', error);
      return reply.status(500).send({
        error: 'Failed to delete credential',
        message: error.message
      });
    }
  });

  // Generate QR code for credential
  fastify.post('/credentials/:id/qr', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized'
        });
      }

      const credentialId = request.params.id;

      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          userId
        }
      });

      if (!credential) {
        return reply.status(404).send({
          error: 'Credential not found'
        });
      }

      // Generate QR code data
      const qrData = JSON.stringify({
        type: credential.credentialType,
        name: credential.name,
        issuer: credential.issuer,
        issued: credential.issuedDate,
        expires: credential.expirationDate,
        id: credential.credentialId,
        verifyUrl: credential.verificationUrl
      });

      // For now, return the data (client can generate QR with library)
      // In production, use qrcode library to generate image

      return reply.send({
        success: true,
        qrData,
        message: 'QR code data generated'
      });

    } catch (error) {
      logger.error('Error generating QR code:', error);
      return reply.status(500).send({
        error: 'Failed to generate QR code',
        message: error.message
      });
    }
  });

  // Update share permission
  fastify.put('/shares/:id', {
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

      const shareId = request.params.id;
      const { permission } = request.body || {};

      if (!permission || !['view', 'comment', 'edit', 'admin'].includes(permission)) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Valid permission (view, comment, edit, admin) is required'
        });
      }

      // Get share and verify user owns the file
      const share = await prisma.fileShare.findUnique({
        where: { id: shareId },
        include: {
          file: {
            select: {
              id: true,
              userId: true,
              name: true
            }
          }
        }
      });

      if (!share) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Share not found'
        });
      }

      // Only file owner can update permissions
      if (share.file.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Only file owner can update share permissions'
        });
      }

      // Update share permission
      const updatedShare = await prisma.fileShare.update({
        where: { id: shareId },
        data: { permission },
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info(`✅ Share permission updated: ${shareId} -> ${permission}`);

      // Emit real-time event for permission update
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileShared(userId, {
          fileId: share.fileId,
          share: {
            id: updatedShare.id,
            fileId: updatedShare.fileId,
            sharedWith: updatedShare.sharedWith,
            permission: updatedShare.permission,
            expiresAt: updatedShare.expiresAt?.toISOString() || null,
            createdAt: updatedShare.createdAt.toISOString()
          }
        });
        
        // Also notify the recipient
        socketIOServer.notifyFileShared(updatedShare.sharedWith, {
          fileId: share.fileId,
          share: {
            id: updatedShare.id,
            fileId: updatedShare.fileId,
            sharedWith: updatedShare.sharedWith,
            permission: updatedShare.permission,
            expiresAt: updatedShare.expiresAt?.toISOString() || null,
            createdAt: updatedShare.createdAt.toISOString()
          }
        });
      }

      return reply.send({
        success: true,
        share: {
          id: updatedShare.id,
          fileId: updatedShare.fileId,
          sharedWith: updatedShare.sharedWith,
          sharedWithEmail: updatedShare.recipient.email,
          permission: updatedShare.permission,
          expiresAt: updatedShare.expiresAt?.toISOString() || null,
          createdAt: updatedShare.createdAt.toISOString()
        }
      });

    } catch (error) {
      logger.error('Error updating share permission:', error);
      return reply.status(500).send({
        error: 'Failed to update share permission',
        message: error.message || 'An error occurred while updating share permission'
      });
    }
  });

  // Delete share
  fastify.delete('/shares/:id', {
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

      const shareId = request.params.id;

      // Get share and verify user owns the file
      const share = await prisma.fileShare.findUnique({
        where: { id: shareId },
        include: {
          file: {
            select: {
              id: true,
              userId: true
            }
          },
          recipient: {
            select: {
              id: true
            }
          }
        }
      });

      if (!share) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Share not found'
        });
      }

      // Only file owner can remove shares
      if (share.file.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Only file owner can remove shares'
        });
      }

      const fileId = share.fileId;
      const recipientId = share.sharedWith;

      // Delete share
      await prisma.fileShare.delete({
        where: { id: shareId }
      });

      logger.info(`✅ Share removed: ${shareId}`);

      // Emit real-time event for share removal
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyShareRemoved(userId, {
          fileId,
          shareId
        });
        
        // Also notify the recipient
        socketIOServer.notifyShareRemoved(recipientId, {
          fileId,
          shareId
        });
      }

      return reply.send({
        success: true,
        message: 'Share removed successfully'
      });

    } catch (error) {
      logger.error('Error removing share:', error);
      return reply.status(500).send({
        error: 'Failed to remove share',
        message: error.message || 'An error occurred while removing share'
      });
    }
  });

  // ===== STORAGE QUOTA ENDPOINT =====

  // Get storage quota for user
  fastify.get('/quota', {
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

      // Get or create quota record
      let quota = await prisma.storageQuota.findUnique({
        where: { userId }
      });

      if (!quota) {
        // Create default quota (e.g., 5 GB limit)
        const defaultLimitBytes = BigInt(5 * 1024 * 1024 * 1024); // 5 GB
        quota = await prisma.storageQuota.create({
          data: {
            userId,
            usedBytes: BigInt(0),
            limitBytes: defaultLimitBytes
          }
        });
      }

      // Calculate actual used space from files
      const files = await prisma.storageFile.findMany({
        where: {
          userId,
          deletedAt: null // Only count non-deleted files
        },
        select: {
          size: true
        }
      });

      const actualUsedBytes = files.reduce((sum, file) => sum + BigInt(file.size || 0), BigInt(0));

      // Update quota with actual usage
      if (actualUsedBytes !== quota.usedBytes) {
        quota = await prisma.storageQuota.update({
          where: { userId },
          data: { usedBytes: actualUsedBytes }
        });
      }

      const usedBytes = Number(quota.usedBytes);
      const limitBytes = Number(quota.limitBytes);
      const usedGB = usedBytes / (1024 * 1024 * 1024);
      const limitGB = limitBytes / (1024 * 1024 * 1024);
      const percentage = limitGB > 0 ? (usedGB / limitGB) * 100 : 0;

      return reply.send({
        success: true,
        storage: {
          usedBytes,
          limitBytes,
          usedGB: Number(usedGB.toFixed(2)),
          limitGB: Number(limitGB.toFixed(2)),
          percentage: Number(percentage.toFixed(2))
        }
      });

    } catch (error) {
      logger.error('Error fetching storage quota:', error);
      return reply.status(500).send({
        error: 'Failed to fetch storage quota',
        message: error.message || 'An error occurred while fetching quota'
      });
    }
  });

  // ===== PUBLIC SHARE LINK ENDPOINTS =====

  // Get shared file by token (public access)
  fastify.get('/shared/:token', async (request, reply) => {
    try {
      const token = request.params.token;
      const password = request.query.password;

      // Find share link
      const shareLink = await prisma.shareLink.findUnique({
        where: { token },
        include: {
          file: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!shareLink) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Share link not found or has expired'
        });
      }

      // Check if link has expired
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return reply.status(403).send({
          error: 'Expired',
          message: 'This share link has expired'
        });
      }

      // Check if password is required
      if (shareLink.password && shareLink.password !== password) {
        return reply.status(403).send({
          error: 'Password Required',
          message: 'This file is password-protected',
          passwordRequired: true
        });
      }

      // Check max downloads
      if (shareLink.maxDownloads && shareLink.downloadCount >= shareLink.maxDownloads) {
        return reply.status(403).send({
          error: 'Download Limit Reached',
          message: 'This share link has reached its maximum download limit'
        });
      }

      // Return file info
      return reply.send({
        success: true,
        file: {
          id: shareLink.file.id,
          name: shareLink.file.name,
          fileName: shareLink.file.fileName,
          type: shareLink.file.type,
          contentType: shareLink.file.contentType,
          size: Number(shareLink.file.size),
          publicUrl: shareLink.file.publicUrl,
          createdAt: shareLink.file.createdAt.toISOString()
        },
        share: {
          permission: shareLink.permission,
          expiresAt: shareLink.expiresAt?.toISOString() || null,
          sharedBy: shareLink.file.user.name || shareLink.file.user.email
        }
      });

    } catch (error) {
      logger.error('Error accessing shared file:', error);
      return reply.status(500).send({
        error: 'Failed to access shared file',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Download shared file by token
  fastify.get('/shared/:token/download', async (request, reply) => {
    try {
      const token = request.params.token;
      const password = request.query.password;

      // Find share link
      const shareLink = await prisma.shareLink.findUnique({
        where: { token },
        include: { file: true }
      });

      if (!shareLink) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Share link not found or has expired'
        });
      }

      // Check if link has expired
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return reply.status(403).send({
          error: 'Expired',
          message: 'This share link has expired'
        });
      }

      // Check password
      if (shareLink.password && shareLink.password !== password) {
        return reply.status(403).send({
          error: 'Password Required',
          message: 'Incorrect password'
        });
      }

      // Check max downloads
      if (shareLink.maxDownloads && shareLink.downloadCount >= shareLink.maxDownloads) {
        return reply.status(403).send({
          error: 'Download Limit Reached',
          message: 'This share link has reached its maximum download limit'
        });
      }

      // Increment download count
      await prisma.shareLink.update({
        where: { id: shareLink.id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      });

      // Get file from storage
      const fileBuffer = await storageHandler.download(shareLink.file.storagePath);
      
      if (!fileBuffer) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found in storage'
        });
      }

      // Set headers and send file
      reply.header('Content-Type', shareLink.file.contentType || 'application/octet-stream');
      reply.header('Content-Disposition', `attachment; filename="${shareLink.file.fileName}"`);
      reply.header('Content-Length', shareLink.file.size.toString());
      
      return reply.send(fileBuffer);

    } catch (error) {
      logger.error('Error downloading shared file:', error);
      return reply.status(500).send({
        error: 'Failed to download shared file',
        message: error.message || 'An error occurred'
      });
    }
  });

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  // Batch delete files
  fastify.post('/files/batch/delete', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'fileIds must be a non-empty array'
        });
      }

      // Verify all files belong to user and soft delete them
      const deletedFiles = await prisma.storageFile.updateMany({
        where: {
          id: { in: fileIds },
          userId,
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      });

      logger.info(`Batch deleted ${deletedFiles.count} files for user ${userId}`);

      // Emit socket events for each deleted file
      fileIds.forEach(fileId => {
        socketIOServer.emitToUser(userId, 'file_deleted', { fileId });
      });

      return reply.send({
        success: true,
        deletedCount: deletedFiles.count,
        message: `Successfully deleted ${deletedFiles.count} file(s)`
      });

    } catch (error) {
      logger.error('Error batch deleting files:', error);
      return reply.status(500).send({
        error: 'Failed to batch delete files',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Batch move files
  fastify.post('/files/batch/move', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds, folderId } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'fileIds must be a non-empty array'
        });
      }

      // Verify folder belongs to user if folderId is provided
      if (folderId) {
        const folder = await prisma.storageFolder.findFirst({
          where: {
            id: folderId,
            userId
          }
        });

        if (!folder) {
          return reply.status(404).send({
            error: 'Folder not found',
            message: 'The specified folder does not exist'
          });
        }
      }

      // Move files to new folder
      const movedFiles = await prisma.storageFile.updateMany({
        where: {
          id: { in: fileIds },
          userId,
          deletedAt: null
        },
        data: {
          folderId: folderId || null
        }
      });

      logger.info(`Batch moved ${movedFiles.count} files to folder ${folderId || 'root'} for user ${userId}`);

      // Emit socket events for each moved file
      fileIds.forEach(fileId => {
        socketIOServer.emitToUser(userId, 'file_updated', { fileId, folderId });
      });

      return reply.send({
        success: true,
        movedCount: movedFiles.count,
        message: `Successfully moved ${movedFiles.count} file(s)`
      });

    } catch (error) {
      logger.error('Error batch moving files:', error);
      return reply.status(500).send({
        error: 'Failed to batch move files',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Batch restore files
  fastify.post('/files/batch/restore', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'fileIds must be a non-empty array'
        });
      }

      // Restore files
      const restoredFiles = await prisma.storageFile.updateMany({
        where: {
          id: { in: fileIds },
          userId,
          deletedAt: { not: null }
        },
        data: {
          deletedAt: null
        }
      });

      logger.info(`Batch restored ${restoredFiles.count} files for user ${userId}`);

      // Emit socket events
      fileIds.forEach(fileId => {
        socketIOServer.emitToUser(userId, 'file_restored', { fileId });
      });

      return reply.send({
        success: true,
        restoredCount: restoredFiles.count,
        message: `Successfully restored ${restoredFiles.count} file(s)`
      });

    } catch (error) {
      logger.error('Error batch restoring files:', error);
      return reply.status(500).send({
        error: 'Failed to batch restore files',
        message: error.message || 'An error occurred'
      });
    }
  });

  // ============================================================================
  // ZIP ARCHIVE DOWNLOAD
  // ============================================================================

  // Download multiple files as ZIP
  fastify.post('/files/download/zip', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { fileIds } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'fileIds must be a non-empty array'
        });
      }

      // Fetch files
      const files = await prisma.storageFile.findMany({
        where: {
          id: { in: fileIds },
          userId,
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          fileName: true,
          storagePath: true,
          contentType: true
        }
      });

      if (files.length === 0) {
        return reply.status(404).send({
          error: 'No files found',
          message: 'No files found matching the provided IDs'
        });
      }

      // Create ZIP archive
      const archiver = require('archiver');
      const archive = archiver('zip', {
        zlib: { level: 6 } // Compression level
      });

      // Set response headers
      reply.header('Content-Type', 'application/zip');
      reply.header('Content-Disposition', `attachment; filename="files_${Date.now()}.zip"`);

      // Pipe archive to response
      reply.raw.on('close', () => {
        logger.info(`ZIP download completed for ${files.length} files`);
      });

      archive.pipe(reply.raw);

      // Add files to archive
      for (const file of files) {
        try {
          const fileBuffer = await storageHandler.download(file.storagePath);
          if (fileBuffer) {
            archive.append(fileBuffer, { name: file.fileName || file.name });
          }
        } catch (error) {
          logger.error(`Failed to add file ${file.id} to ZIP:`, error);
        }
      }

      // Finalize archive
      await archive.finalize();

      return reply;

    } catch (error) {
      logger.error('Error creating ZIP archive:', error);
      return reply.status(500).send({
        error: 'Failed to create ZIP archive',
        message: error.message || 'An error occurred'
      });
    }
  });

  // ============================================================================
  // STORAGE ANALYTICS
  // ============================================================================

  // Get storage analytics
  fastify.get('/analytics', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;

      // Get file counts by type
      const filesByType = await prisma.storageFile.groupBy({
        by: ['type'],
        where: {
          userId,
          deletedAt: null
        },
        _count: true,
        _sum: {
          size: true
        }
      });

      // Get total files and storage
      const totalStats = await prisma.storageFile.aggregate({
        where: {
          userId,
          deletedAt: null
        },
        _count: true,
        _sum: {
          size: true
        }
      });

      // Get deleted files count
      const deletedCount = await prisma.storageFile.count({
        where: {
          userId,
          deletedAt: { not: null }
        }
      });

      // Get shared files count
      const sharedCount = await prisma.fileShare.count({
        where: {
          file: {
            userId
          }
        }
      });

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentUploads = await prisma.storageFile.count({
        where: {
          userId,
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      });

      // Get storage quota
      const quota = await prisma.storageQuota.findUnique({
        where: { userId }
      });

      return reply.send({
        filesByType: filesByType.map(item => ({
          type: item.type,
          count: item._count,
          totalSize: item._sum.size || 0
        })),
        totalFiles: totalStats._count || 0,
        totalSize: totalStats._sum.size || 0,
        deletedFiles: deletedCount,
        sharedFiles: sharedCount,
        recentUploads,
        quota: {
          used: quota?.usedBytes || 0,
          limit: quota?.limitBytes || 5368709120, // 5GB default
          percentage: quota ? ((quota.usedBytes / quota.limitBytes) * 100).toFixed(2) : 0
        }
      });

    } catch (error) {
      logger.error('Error fetching storage analytics:', error);
      return reply.status(500).send({
        error: 'Failed to fetch analytics',
        message: error.message || 'An error occurred'
      });
    }
  });

  // ============================================================================
  // FILE VERSIONING
  // ============================================================================

  // Get file versions
  fastify.get('/files/:id/versions', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;

      // Verify file ownership or access
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          OR: [
            { userId },
            {
              shares: {
                some: {
                  sharedWith: userId
                }
              }
            }
          ]
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'File not found',
          message: 'File not found or access denied'
        });
      }

      // Get versions
      const versions = await prisma.fileVersion.findMany({
        where: { fileId },
        orderBy: { versionNumber: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return reply.send({
        versions,
        total: versions.length
      });

    } catch (error) {
      logger.error('Error fetching file versions:', error);
      return reply.status(500).send({
        error: 'Failed to fetch file versions',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Create new file version
  fastify.post('/files/:id/versions', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;
      const { changeDescription } = request.body;

      // Verify file ownership
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'File not found',
          message: 'File not found or you do not have permission'
        });
      }

      // Get next version number
      const lastVersion = await prisma.fileVersion.findFirst({
        where: { fileId },
        orderBy: { versionNumber: 'desc' }
      });

      const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

      // Create version snapshot
      const version = await prisma.fileVersion.create({
        data: {
          fileId,
          userId,
          versionNumber: nextVersionNumber,
          fileName: file.fileName,
          contentType: file.contentType,
          size: file.size,
          storagePath: file.storagePath,
          fileHash: file.fileHash || '',
          changeDescription,
          isActive: true
        }
      });

      // Set all other versions to inactive
      await prisma.fileVersion.updateMany({
        where: {
          fileId,
          id: { not: version.id }
        },
        data: {
          isActive: false
        }
      });

      logger.info(`Created version ${nextVersionNumber} for file ${fileId}`);

      return reply.send({
        version,
        message: `Version ${nextVersionNumber} created successfully`
      });

    } catch (error) {
      logger.error('Error creating file version:', error);
      return reply.status(500).send({
        error: 'Failed to create file version',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Restore file version
  fastify.post('/files/:id/versions/:versionId/restore', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { id: fileId, versionId } = request.params;

      // Verify file ownership
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'File not found',
          message: 'File not found or you do not have permission'
        });
      }

      // Get version
      const version = await prisma.fileVersion.findFirst({
        where: {
          id: versionId,
          fileId
        }
      });

      if (!version) {
        return reply.status(404).send({
          error: 'Version not found',
          message: 'Version not found'
        });
      }

      // Restore file to this version
      await prisma.storageFile.update({
        where: { id: fileId },
        data: {
          fileName: version.fileName,
          contentType: version.contentType,
          size: version.size,
          storagePath: version.storagePath,
          fileHash: version.fileHash
        }
      });

      // Set this version as active
      await prisma.fileVersion.updateMany({
        where: { fileId },
        data: { isActive: false }
      });

      await prisma.fileVersion.update({
        where: { id: versionId },
        data: { isActive: true }
      });

      logger.info(`Restored file ${fileId} to version ${version.versionNumber}`);

      return reply.send({
        success: true,
        message: `File restored to version ${version.versionNumber}`
      });

    } catch (error) {
      logger.error('Error restoring file version:', error);
      return reply.status(500).send({
        error: 'Failed to restore file version',
        message: error.message || 'An error occurred'
      });
    }
  });

  // ============================================================================
  // FILE TAGGING
  // ============================================================================

  // Get user's tags
  fastify.get('/tags', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;

      const tags = await prisma.fileTag.findMany({
        where: {
          OR: [
            { userId }, // User's tags
            { userId: null } // System tags
          ]
        },
        include: {
          _count: {
            select: { files: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return reply.send({
        tags: tags.map(tag => ({
          ...tag,
          fileCount: tag._count.files
        }))
      });

    } catch (error) {
      logger.error('Error fetching tags:', error);
      return reply.status(500).send({
        error: 'Failed to fetch tags',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Create new tag
  fastify.post('/tags', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { name, color } = request.body;

      if (!name || !name.trim()) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Tag name is required'
        });
      }

      // Check if tag already exists for user
      const existing = await prisma.fileTag.findFirst({
        where: {
          userId,
          name: name.trim()
        }
      });

      if (existing) {
        return reply.status(409).send({
          error: 'Tag already exists',
          message: 'A tag with this name already exists'
        });
      }

      const tag = await prisma.fileTag.create({
        data: {
          userId,
          name: name.trim(),
          color: color || '#4285F4'
        }
      });

      logger.info(`Created tag "${name}" for user ${userId}`);

      return reply.send({
        tag,
        message: 'Tag created successfully'
      });

    } catch (error) {
      logger.error('Error creating tag:', error);
      return reply.status(500).send({
        error: 'Failed to create tag',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Add tag to file
  fastify.post('/files/:id/tags', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;
      const { tagId } = request.body;

      // Verify file ownership
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'File not found',
          message: 'File not found or you do not have permission'
        });
      }

      // Verify tag belongs to user or is system tag
      const tag = await prisma.fileTag.findFirst({
        where: {
          id: tagId,
          OR: [
            { userId },
            { userId: null }
          ]
        }
      });

      if (!tag) {
        return reply.status(404).send({
          error: 'Tag not found',
          message: 'Tag not found'
        });
      }

      // Check if already tagged
      const existing = await prisma.fileTagging.findFirst({
        where: {
          fileId,
          tagId
        }
      });

      if (existing) {
        return reply.status(409).send({
          error: 'Already tagged',
          message: 'File is already tagged with this tag'
        });
      }

      // Add tag to file
      const tagging = await prisma.fileTagging.create({
        data: {
          fileId,
          tagId
        }
      });

      logger.info(`Tagged file ${fileId} with tag ${tagId}`);

      return reply.send({
        tagging,
        message: 'Tag added to file successfully'
      });

    } catch (error) {
      logger.error('Error adding tag to file:', error);
      return reply.status(500).send({
        error: 'Failed to add tag to file',
        message: error.message || 'An error occurred'
      });
    }
  });

  // Remove tag from file
  fastify.delete('/files/:id/tags/:tagId', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const { id: fileId, tagId } = request.params;

      // Verify file ownership
      const file = await prisma.storageFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'File not found',
          message: 'File not found or you do not have permission'
        });
      }

      // Remove tag from file
      const deleted = await prisma.fileTagging.deleteMany({
        where: {
          fileId,
          tagId
        }
      });

      if (deleted.count === 0) {
        return reply.status(404).send({
          error: 'Tag not found',
          message: 'File is not tagged with this tag'
        });
      }

      logger.info(`Removed tag ${tagId} from file ${fileId}`);

      return reply.send({
        success: true,
        message: 'Tag removed from file successfully'
      });

    } catch (error) {
      logger.error('Error removing tag from file:', error);
      return reply.status(500).send({
        error: 'Failed to remove tag from file',
        message: error.message || 'An error occurred'
      });
    }
  });
}

module.exports = storageRoutes;

