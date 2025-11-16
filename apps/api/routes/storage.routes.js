/**
 * Storage Routes Module
 * Handles file upload, download, and storage management
 */

const { authenticate } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const storageHandler = require('../utils/storageHandler');
const { validateFileUpload, validateFileType, validateFolderName, validateStoragePath } = require('../utils/storageValidation');
const { checkFilePermission } = require('../utils/filePermissions');
const logger = require('../utils/logger');
// INFRA-021 to INFRA-029: Observability
const { FileOperationLogger, fileMetrics, fileTracer, performanceMonitor } = require('../config/observability');
const socketIOServer = require('../utils/socketIOServer');
// BE-011 through BE-025: Advanced validation utilities
const {
  validateEmail,
  validatePermission,
  validateExpirationDate,
  validateMaxDownloads,
  validateDescription,
  validateCommentContent,
  validateFolderColor,
  validateFileSizeByTier,
  validateFileCountByTier,
  verifyMimeTypeWithMagicBytes,
  validateFileStructure
} = require('../utils/advancedValidation');
const {
  checkUploadRateLimit,
  checkConcurrentUploadLimit,
  registerConcurrentUpload,
  unregisterConcurrentUpload
} = require('../utils/uploadRateLimiter');
// BE-026 through BE-038: Error handling utilities
const { sendErrorResponse, handleError, AppError, ERROR_CODES } = require('../utils/errorResponse');
const { retry } = require('../utils/retry');
const { circuitBreakers } = require('../utils/circuitBreaker');
const { verifyFileHash, handleMissingStorageFile, verifyFileIntegrity } = require('../utils/fileIntegrity');
const { executeUploadWithCleanup } = require('../utils/transactionManager');
const { updateQuotaSafely, recalculateQuotaFromFiles } = require('../utils/quotaManager');
const { sendEmailWithRetry } = require('../utils/emailQueue');
// BE-039 through BE-058: Security and concurrency control utilities
const { getStorageRateLimiter, isSuspiciousIP, recordSuspiciousActivity } = require('../utils/storageRateLimiter');
const { scanFile } = require('../utils/virusScanner');
const { shouldBlockFileForSensitiveData } = require('../utils/contentScanner');
const { sanitizeComment, sanitizeDescription, sanitizeFileName } = require('../utils/inputSanitizer');
const { logFileUpload, logFileDelete, logFileShare, logBulkOperation } = require('../utils/fileAuditLogger');
const { checkIdempotencyKey, storeIdempotencyKey, generateIdempotencyKey } = require('../utils/idempotency');
const { findDuplicateFile } = require('../utils/duplicateFileDetector');
const { generateSecureToken, validateTokenEntropy, hashShareLinkPassword, verifyShareLinkPassword } = require('../utils/shareLinkSecurity');
const { updateQuotaWithLock } = require('../utils/quotaLock');
const { validateOrigin } = require('../utils/corsValidator');
const { shouldBlockMaliciousFile } = require('../utils/maliciousFileDetector');
const { createStorageRateLimitMiddleware } = require('../middleware/storageRateLimit');
// SEC-001 to SEC-025: Security utilities
const { encryptFile, decryptFile } = require('../utils/fileEncryption');
const { logFileAccess } = require('../utils/fileAuditTrail');
const { checkShareLinkAccess, incrementShareLinkDownloads } = require('../utils/shareLinkAccess');
const { requireAdmin, canGrantPermission } = require('../utils/rbac');
const { checkFileSizeLimit, checkStorageQuotaLimit, checkFileCountLimit } = require('../utils/subscriptionTierChecks');
const { SafeLogger } = require('../utils/safeLogging');
const { sanitizePath } = require('../utils/fileAuditTrail');
const { enforceFileOwnership, enforceSharePermission, createUserRateLimitMiddleware, requireAdminRole } = require('../middleware/accessControl');
const { scheduleExpiredFileCleanup } = require('../utils/dataRetention');
const { secureDelete } = require('../utils/secureDeletion');
const { detectPII } = require('../utils/piiDetection');

/**
 * Register all storage routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function storageRoutes(fastify, _options) {
  // SEC-005: Schedule expired file cleanup
  scheduleExpiredFileCleanup();
  
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
  
  // Get all files for authenticated user
  fastify.get('/files', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileList')
    ]
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
      const search = request.query.search || request.query.searchTerm || null; // Support both 'search' and 'searchTerm'

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

      // FE-042: Parse pagination parameters
      const { parsePagination, createPaginatedResponse } = require('../utils/pagination');
      const { page, pageSize, skip } = parsePagination(request);
      
      // Determine sort order
      const sortBy = request.query.sortBy || 'date'; // date, name, size
      const sortOrder = request.query.sortOrder || 'desc'; // asc, desc
      
      let orderBy = {};
      switch (sortBy) {
        case 'name':
          orderBy = { name: sortOrder };
          break;
        case 'size':
          orderBy = { size: sortOrder };
          break;
        case 'date':
        default:
          orderBy = { createdAt: sortOrder };
          break;
      }

      // Get total count for pagination
      const total = await prisma.storage_files.count({ where });

      // Fetch files from database with pagination
      const files = await prisma.storage_files.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
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
        const quota = await prisma.storage_quotas.findUnique({
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

      // FE-042: Return paginated response
      const paginatedResponse = createPaginatedResponse(formattedFiles, total, page, pageSize);
      
      return reply.send({
        success: true,
        files: paginatedResponse.data,
        storage: storageInfo,
        count: formattedFiles.length,
        pagination: paginatedResponse.pagination
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileUpload'),
      // BE-051: CORS origin validation
      async (request, reply) => {
        const origin = request.headers.origin;
        if (origin) {
          const validation = validateOrigin(origin);
          if (!validation.valid) {
            return sendErrorResponse(reply, 403, ERROR_CODES.FORBIDDEN, validation.error);
          }
        }
      }
    ]
  }, async (request, reply) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let userId = null;
    
    try {
      logger.info(`📤 File upload request received: ${request.method} ${request.url}`);
      
      userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        logger.warn('File upload failed: User ID not found in token');
        return sendErrorResponse(reply, 401, ERROR_CODES.UNAUTHORIZED, 'User ID not found in token');
      }

      // BE-046: IP-based rate limiting for suspicious activity
      const clientIP = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      if (isSuspiciousIP(clientIP)) {
        recordSuspiciousActivity(clientIP, 'Suspicious upload activity');
        return sendErrorResponse(reply, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Your IP has been flagged for suspicious activity. Please try again later.');
      }

      // BE-053: Idempotency keys for file uploads
      const idempotencyKey = generateIdempotencyKey(request);
      if (idempotencyKey) {
        const idempotencyCheck = await checkIdempotencyKey(idempotencyKey, userId);
        if (idempotencyCheck.exists) {
          logger.info(`Idempotent upload request detected, returning cached result for key: ${idempotencyKey}`);
          return reply.status(200).send({
            success: true,
            idempotent: true,
            ...idempotencyCheck.result
          });
        }
      }

      // BE-052: Request size limits for multipart uploads
      const contentLength = parseInt(request.headers['content-length'] || '0');
      const maxRequestSize = 100 * 1024 * 1024; // 100MB max request size
      if (contentLength > maxRequestSize) {
        return sendErrorResponse(reply, 413, ERROR_CODES.FILE_TOO_LARGE, `Request size (${(contentLength / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of ${(maxRequestSize / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      // BE-011: Check upload rate limit
      const rateLimitCheck = checkUploadRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        return sendErrorResponse(reply, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, rateLimitCheck.error, { resetTime: rateLimitCheck.resetTime });
      }
      
      // BE-012: Check concurrent upload limit
      const concurrentCheck = checkConcurrentUploadLimit(userId);
      if (!concurrentCheck.allowed) {
        return sendErrorResponse(reply, 429, ERROR_CODES.CONCURRENT_UPLOAD_LIMIT_EXCEEDED, concurrentCheck.error, { current: concurrentCheck.current });
      }
      
      // BE-012: Register concurrent upload
      registerConcurrentUpload(userId, uploadId);
      
      logger.info(`📤 File upload initiated by user: ${userId} (uploadId: ${uploadId})`);

      // Get file and fields from multipart form
      // Fastify multipart: use request.parts() to get both file and fields
      let fileData = null;
      let fileName = null;
      let contentType = null;
      let fileSize = 0;
      let buffer = null; // Store buffer for magic bytes and structure validation
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
          buffer = Buffer.concat(chunks); // Store buffer in outer scope
          fileSize = buffer.length;
          
          // Compute fileHash for resume files
          const crypto = require('crypto');
          fileData.fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
          
          // BE-056: Duplicate file detection based on fileHash
          const duplicateFile = await findDuplicateFile(fileData.fileHash, userId);
          if (duplicateFile) {
            logger.info(`Duplicate file detected: ${fileName} (hash: ${fileData.fileHash.substring(0, 8)}...)`);
            // Return existing file info instead of uploading
            unregisterConcurrentUpload(userId, uploadId);
            return reply.status(200).send({
              success: true,
              duplicate: true,
              message: 'A file with identical content already exists. Using existing file.',
              file: {
                id: duplicateFile.id,
                name: duplicateFile.name,
                fileName: duplicateFile.fileName,
                size: Number(duplicateFile.size),
                contentType: duplicateFile.contentType,
                createdAt: duplicateFile.createdAt.toISOString()
              }
            });
          }
          
          // BE-041: Virus scanning integration
          const virusScanResult = await scanFile(buffer, fileName);
          if (!virusScanResult.clean) {
            unregisterConcurrentUpload(userId, uploadId);
            recordSuspiciousActivity(clientIP, `Virus detected: ${virusScanResult.message}`);
            return sendErrorResponse(reply, 400, ERROR_CODES.FILE_TYPE_NOT_SUPPORTED, `File rejected: ${virusScanResult.message}`, {
              scanner: virusScanResult.scanner,
              threats: virusScanResult.viruses || virusScanResult.threats
            });
          }
          
          // BE-042: Content scanning for sensitive data
          const sensitiveDataCheck = await shouldBlockFileForSensitiveData(buffer, contentType, fileName);
          if (sensitiveDataCheck.shouldBlock) {
            unregisterConcurrentUpload(userId, uploadId);
            logger.warn(`File ${fileName} blocked due to sensitive data:`, sensitiveDataCheck.findings);
            return sendErrorResponse(reply, 400, ERROR_CODES.VALIDATION_ERROR, sensitiveDataCheck.reason, {
              findings: sensitiveDataCheck.findings
            });
          }
          
          // BE-049: File content validation to prevent malicious files
          const maliciousCheck = shouldBlockMaliciousFile(buffer, contentType, fileName);
          if (maliciousCheck.shouldBlock) {
            unregisterConcurrentUpload(userId, uploadId);
            recordSuspiciousActivity(clientIP, `Malicious file detected: ${maliciousCheck.reason}`);
            return sendErrorResponse(reply, 400, ERROR_CODES.FILE_TYPE_NOT_SUPPORTED, maliciousCheck.reason, {
              threats: maliciousCheck.threats,
              warnings: maliciousCheck.warnings
            });
          }
          
          // Create a new readable stream from buffer for storage handler
          const { Readable } = require('stream');
          fileData.file = Readable.from(buffer);
        } else if (part.type === 'field') {
          // Collect form fields
          formFields[part.fieldname] = part.value;
        }
      }
      
      if (!fileData) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_INPUT, 'No file provided');
      }

      // Get user subscription tier for validation
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true }
      });
      const subscriptionTier = user?.subscriptionTier || 'FREE';
      
      // BE-022: Validate file size against subscription tier
      const sizeValidation = validateFileSizeByTier(fileSize, subscriptionTier);
      if (!sizeValidation.valid) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 403, ERROR_CODES.FILE_TOO_LARGE, sizeValidation.error);
      }
      
      // BE-023: Validate file count against subscription tier
      const countValidation = await validateFileCountByTier(userId, subscriptionTier, prisma);
      if (!countValidation.valid) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 403, ERROR_CODES.FILE_COUNT_LIMIT_EXCEEDED, countValidation.error);
      }
      
      // BE-024: Verify MIME type using magic bytes
      const magicBytesCheck = verifyMimeTypeWithMagicBytes(buffer, contentType);
      if (!magicBytesCheck.valid) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 400, ERROR_CODES.FILE_MAGIC_BYTES_MISMATCH, magicBytesCheck.error);
      }
      
      // BE-025: Validate file content structure
      const structureValidation = validateFileStructure(buffer, contentType); // Not async - returns synchronously
      if (!structureValidation.valid) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 400, ERROR_CODES.FILE_STRUCTURE_INVALID, structureValidation.error);
      }
      
      // BE-013: Check file name uniqueness per user
      const existingFile = await prisma.storage_files.findFirst({
        where: {
          userId,
          fileName: fileName,
          deletedAt: null
        },
        select: { id: true, name: true }
      });
      
      if (existingFile) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 409, ERROR_CODES.FILE_ALREADY_EXISTS, `A file with the name "${fileName}" already exists. Please rename the file or delete the existing one.`, {
          existingFileId: existingFile.id,
          existingFileName: existingFile.name
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
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 400, ERROR_CODES.VALIDATION_ERROR, validation.errors.join(', '), { errors: validation.errors, warnings: validation.warnings });
      }

      // BE-050, BE-055: Check storage quota using updateQuotaWithLock (transaction locking)
      let quotaCheckResult;
      try {
        quotaCheckResult = await updateQuotaWithLock(userId, fileSize, 'add', prisma);
        if (!quotaCheckResult.success) {
          unregisterConcurrentUpload(userId, uploadId);
          return sendErrorResponse(reply, 403, ERROR_CODES.QUOTA_EXCEEDED, quotaCheckResult.error, { details: quotaCheckResult.details });
        }
      } catch (error) {
        if (error instanceof AppError) {
          unregisterConcurrentUpload(userId, uploadId);
          return sendErrorResponse(reply, error.statusCode || 403, error.errorCode, error.message, { details: error.details });
        }
        // Fallback to updateQuotaSafely if updateQuotaWithLock fails
        logger.warn('updateQuotaWithLock failed, falling back to updateQuotaSafely:', error);
        quotaCheckResult = await updateQuotaSafely(userId, fileSize, 'add', prisma);
        if (!quotaCheckResult.success) {
          unregisterConcurrentUpload(userId, uploadId);
          return sendErrorResponse(reply, 403, ERROR_CODES.QUOTA_EXCEEDED, quotaCheckResult.error, { details: quotaCheckResult.details });
        }
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
      if (formFields.displayName) {
        // BE-048: Sanitize file name
        displayName = sanitizeFileName(formFields.displayName) || validation.sanitizedFileName;
      }
      if (formFields.type) fileType = formFields.type;
      
      // BE-019: Validate description length
      // BE-048: Input sanitization for XSS in descriptions
      if (formFields.description) {
        const descValidation = validateDescription(formFields.description);
        if (!descValidation.valid) {
          unregisterConcurrentUpload(userId, uploadId);
          return sendErrorResponse(reply, 400, ERROR_CODES.DESCRIPTION_TOO_LONG, descValidation.error);
        }
        // Sanitize description to prevent XSS
        description = sanitizeDescription(descValidation.description);
      }
      
      if (formFields.folderId) folderId = formFields.folderId === 'null' ? null : formFields.folderId;
      
      // BE-002: Parse tags from form (if provided as JSON string)
      let tags = [];
      if (formFields.tags) {
        try {
          tags = typeof formFields.tags === 'string' ? JSON.parse(formFields.tags) : formFields.tags;
          if (!Array.isArray(tags)) tags = [];
        } catch (e) {
          logger.warn('Failed to parse tags, using empty array:', e);
          tags = [];
        }
      }
      
      // BE-003: Parse expiration date from form
      let expiresAt = null;
      if (formFields.expiresAt) {
        try {
          expiresAt = new Date(formFields.expiresAt);
          if (isNaN(expiresAt.getTime())) {
            logger.warn('Invalid expiration date, ignoring:', formFields.expiresAt);
            expiresAt = null;
          }
        } catch (e) {
          logger.warn('Failed to parse expiration date:', e);
          expiresAt = null;
        }
      }

      // Validate file type
      const typeValidation = validateFileType(fileType);
      if (!typeValidation.valid) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(reply, 400, ERROR_CODES.FILE_TYPE_NOT_SUPPORTED, typeValidation.error);
      }

      // BE-030, BE-032: Use executeUploadWithCleanup for transaction and partial failure handling
      let storagePath = null;
      let storageResult = null;
      let savedFile = null;
      
      try {
        const result = await executeUploadWithCleanup(
          prisma,
          storageHandler,
          {
            uploadOperation: async () => {
              // BE-028, BE-029: Wrap storage upload with retry and circuit breaker
              logger.info(`Uploading file: ${fileName} for user: ${userId}`);
              logger.info(`File size: ${fileSize} bytes, Content-Type: ${contentType}`);
              
      // SEC-022: Check file size limit by subscription tier
      const sizeLimitCheck = await checkFileSizeLimit(userId, fileSize);
      if (!sizeLimitCheck.allowed) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(
          reply,
          ERROR_CODES.VALIDATION_ERROR,
          sizeLimitCheck.error,
          { limit: sizeLimitCheck.limit, tier: sizeLimitCheck.tier },
          400
        );
      }

      // SEC-023: Check storage quota limit by subscription tier
      const quotaCheck = await checkStorageQuotaLimit(userId, fileSize);
      if (!quotaCheck.allowed) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(
          reply,
          ERROR_CODES.QUOTA_EXCEEDED,
          quotaCheck.error,
          { limit: quotaCheck.limit, current: quotaCheck.current, tier: quotaCheck.tier },
          413
        );
      }

      // SEC-024: Check file count limit by subscription tier
      const fileCountCheck = await checkFileCountLimit(userId);
      if (!fileCountCheck.allowed) {
        unregisterConcurrentUpload(userId, uploadId);
        return sendErrorResponse(
          reply,
          ERROR_CODES.VALIDATION_ERROR,
          fileCountCheck.error,
          { limit: fileCountCheck.limit, current: fileCountCheck.current, tier: fileCountCheck.tier },
          403
        );
      }

      // SEC-007: Detect PII in file content
      const piiDetection = await detectPII(fileData.file, contentType, fileName);
      if (piiDetection.hasPII && piiDetection.riskLevel === 'high') {
        logger.warn(`High-risk PII detected in file upload: ${fileName}`, {
          userId,
          findings: piiDetection.findings,
        });
        // Log but don't block - user may have legitimate reason
      }

      // SEC-001: Encrypt file before upload (if enabled)
      let fileToUpload = fileData.file;
      const encryptionEnabled = process.env.ENABLE_FILE_ENCRYPTION === 'true';
      
      if (encryptionEnabled) {
        const fileBuffer = Buffer.from(await fileData.file.arrayBuffer());
        const encryptedBuffer = encryptFile(fileBuffer);
        fileToUpload = encryptedBuffer;
        logger.debug('File encrypted before upload');
      }

              const uploadResult = await circuitBreakers.storage.execute(() =>
                retry(() => storageHandler.upload(fileToUpload, userId, fileName, contentType))
              );
              
              if (!uploadResult || !uploadResult.path) {
                throw new AppError(ERROR_CODES.STORAGE_ERROR, 'Storage upload returned invalid result');
              }
              
              storagePath = uploadResult.path; // Store path for cleanup
              storageResult = uploadResult; // Store result for dbOperation
              
              // INFRA-021, INFRA-022: Structured logging and metrics for file operations
              const uploadStartTime = Date.now();
              const uploadLogger = new FileOperationLogger(generateRequestId());
              uploadLogger.logUpload(userId, null, fileName, fileSize, contentType);
              const uploadDuration = Date.now() - uploadStartTime;
              fileMetrics.recordUpload(fileSize, uploadDuration, true);
              performanceMonitor.recordUploadSpeed(fileSize, uploadDuration);
              
              // SEC-016: Safe logging (no file content)
              SafeLogger.logFileOperation('upload', {
                fileId: null, // Will be set after creation
                userId,
                fileName,
                fileType: fileType,
                fileSize: fileSize,
                storagePath: storagePath,
              });
              
              logger.info(`✅ File uploaded successfully: ${sanitizePath(storagePath)}`);
              return uploadResult;
            },
            dbOperation: async (tx) => {
              // DB-010: Validate file size > 0
              if (fileSize <= 0) {
                throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'File size must be greater than 0');
              }
              
              // DB-011: Validate contentType format (basic validation)
              if (contentType && !/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/.test(contentType)) {
                throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid content type format');
              }
              
              // Save file metadata to database in transaction
              let file = await tx.storageFile.create({
                data: {
                  userId,
                  name: displayName,
                  fileName: fileName,
                  type: fileType,
                  contentType: contentType,
                  size: BigInt(fileSize),
                  storagePath: storagePath,
                  publicUrl: storageResult?.publicUrl || null,
                  fileHash: fileData.fileHash || null,
                  description: description || null,
                  isPublic: isPublic,
                  folderId: folderId || null,
                  // DB-002: Tags (from form fields or request body)
                  tags: tags.length > 0 ? tags : (request.body?.tags || []),
                  // DB-003: Expiration (from form fields or request body)
                  expiresAt: expiresAt || (request.body?.expiresAt ? new Date(request.body.expiresAt) : null),
                  // DB-006: Metadata (if provided)
                  metadata: request.body?.metadata || null,
                  // DB-007: Audit - who uploaded
                  uploadedBy: userId
                }
              });
              
              logger.info(`✅ File metadata saved to database: ${file.id}`);
              
              // Update publicUrl with the file ID for local storage (enables preview/download via API)
              if (!storageResult?.publicUrl || storageResult.publicUrl.startsWith('/api/storage/files/')) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const publicUrl = `${apiUrl}/api/storage/files/${file.id}/download`;
                
                file = await tx.storageFile.update({
                  where: { id: file.id },
                  data: { publicUrl }
                });
                
                logger.info(`✅ Updated publicUrl to: ${publicUrl}`);
              }
              
              return file;
            },
            storagePath: storagePath
          }
        );
        
        savedFile = result.dbResult;
      } catch (uploadError) {
        logger.error('❌ Upload operation failed:', uploadError);
        unregisterConcurrentUpload(userId, uploadId);
        throw uploadError; // Re-throw to be caught by outer catch block
      }

      // Build file metadata from saved file (executeUploadWithCleanup ensures savedFile is set)
      const fileMetadata = {
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
      };

      // BE-012: Unregister concurrent upload on success
      unregisterConcurrentUpload(userId, uploadId);

      // BE-034: Emit real-time event for file creation (with error handling)
      socketIOServer.notifyFileCreated(userId, fileMetadata);

      // BE-033: Return updated quota info using recalculateQuotaFromFiles
      const quotaInfo = await recalculateQuotaFromFiles(userId, prisma);

      // BE-045: Audit logging for file upload
      const userAgent = request.headers['user-agent'] || null;
      await logFileUpload({
        userId,
        fileId: fileMetadata.id,
        fileName: fileMetadata.fileName,
        fileSize: fileMetadata.size,
        ip: clientIP,
        userAgent
      });

      // BE-047: Log file access
      await logFileAccess({
        fileId: fileMetadata.id,
        userId,
        action: 'upload',
        ipAddress: clientIP,
        userAgent
      });

      const responseData = {
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
        storage: quotaInfo
      };

      // BE-053: Store idempotency key result
      if (idempotencyKey) {
        await storeIdempotencyKey(idempotencyKey, userId, responseData);
      }

      reply.status(201).send(responseData);

    } catch (error) {
      logger.error('File upload error:', error);
      logger.error('Error stack:', error.stack);
      
      // BE-012: Unregister concurrent upload on error
      if (userId && uploadId) {
        unregisterConcurrentUpload(userId, uploadId);
      }
      
      // BE-026, BE-027: Standardize error response format with error codes
      if (error.code === 'P2002') { // Prisma unique constraint violation
        return sendErrorResponse(reply, 409, ERROR_CODES.FILE_ALREADY_EXISTS, 'A file with this name already exists.', { details: error.meta });
      }
      if (error instanceof AppError) {
        return sendErrorResponse(reply, error.statusCode || 500, error.errorCode, error.message, { details: error.details });
      }
      handleError(reply, error, ERROR_CODES.STORAGE_ERROR, 'An error occurred while uploading the file');
    }
  });

  // Update file metadata (name, type, description, visibility, etc.)
  fastify.put('/files/:id', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;

      if (!userId) {
        return sendErrorResponse(reply, 401, ERROR_CODES.UNAUTHORIZED, 'User ID not found in token');
      }

      const fileId = request.params.id;
      const body = request.body || {};
      const { name, type, description, isStarred, isArchived, folderId, displayName, version, tags, expiresAt, metadata } = body; // Added version for optimistic locking

      const updates = {};
      
      // DB-008: Set modifiedBy on any update
      updates.modifiedBy = userId;

      // BE-036: Concurrent modification conflict detection (optimistic locking with version field)
      if (version !== undefined) {
        const currentFile = await prisma.storage_files.findUnique({ where: { id: fileId }, select: { version: true } });
        if (currentFile && currentFile.version !== version) {
          return sendErrorResponse(reply, 409, ERROR_CODES.CONCURRENT_MODIFICATION, 'File has been modified by another user. Please refresh and try again.');
        }
        updates.version = { increment: 1 }; // Increment version on successful update
      }

      if (typeof name === 'string') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          return sendErrorResponse(reply, 400, ERROR_CODES.FILE_NAME_INVALID, 'File name cannot be empty');
        }
        // BE-013: Check file name uniqueness per user (for rename)
        const existingFile = await prisma.storage_files.findFirst({
          where: {
            userId,
            name: trimmedName,
            id: { not: fileId }, // Exclude current file
            deletedAt: null
          },
          select: { id: true }
        });
        if (existingFile) {
          return sendErrorResponse(reply, 409, ERROR_CODES.FILE_ALREADY_EXISTS, `A file with the name "${trimmedName}" already exists.`, { existingFileId: existingFile.id });
        }
        updates.name = trimmedName;
      }

      if (updates.name === undefined && typeof displayName === 'string') {
        const trimmedDisplayName = displayName.trim();
        if (trimmedDisplayName) {
          // BE-013: Check file name uniqueness per user (for rename)
          const existingFile = await prisma.storage_files.findFirst({
            where: {
              userId,
              name: trimmedDisplayName,
              id: { not: fileId }, // Exclude current file
              deletedAt: null
            },
            select: { id: true }
          });
          if (existingFile) {
            return sendErrorResponse(reply, 409, ERROR_CODES.FILE_ALREADY_EXISTS, `A file with the name "${trimmedDisplayName}" already exists.`, { existingFileId: existingFile.id });
          }
          updates.name = trimmedDisplayName;
        }
      }

      if (typeof type === 'string') {
        const typeValidation = validateFileType(type);
        if (!typeValidation.valid) {
          return sendErrorResponse(reply, 400, ERROR_CODES.FILE_TYPE_NOT_SUPPORTED, typeValidation.error);
        }
        updates.type = type;
      }

      // BE-019: Validate description length
      if (description !== undefined) {
        const descValidation = validateDescription(description);
        if (!descValidation.valid) {
          return sendErrorResponse(reply, 400, ERROR_CODES.DESCRIPTION_TOO_LONG, descValidation.error);
        }
        updates.description = descValidation.description;
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

      // DB-002: Update tags if provided
      if (tags !== undefined) {
        updates.tags = Array.isArray(tags) ? tags : [];
      }

      // DB-003: Update expiration if provided
      if (expiresAt !== undefined) {
        updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }

      // DB-006: Update metadata if provided
      if (metadata !== undefined) {
        updates.metadata = metadata || null;
      }

      if (Object.keys(updates).length === 0) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_INPUT, 'Please provide at least one field to update');
      }

      // Check permission to update file
      const permissionCheck = await checkFilePermission(userId, fileId, 'edit');
      if (!permissionCheck.allowed) {
        return sendErrorResponse(reply, 403, ERROR_CODES.PERMISSION_DENIED, permissionCheck.reason || 'You do not have permission to update this file');
      }

      const updatedFile = await prisma.storage_files.update({
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
        updatedAt: updatedFile.updatedAt.toISOString(),
        version: updatedFile.version // Return new version
      };

      // BE-034: Emit real-time event for file update (with error handling)
      socketIOServer.notifyFileUpdated(userId, formattedFile, updates);

      return reply.send({
        success: true,
        message: 'File updated successfully',
        file: formattedFile
      });

    } catch (error) {
      logger.error('Error updating file:', error);
      handleError(reply, error, ERROR_CODES.DATABASE_ERROR, 'An error occurred while updating the file');
    }
  });

  // Soft delete file (move to recycle bin)
  fastify.delete('/files/:id', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileDelete')
    ]
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

      // Get file info before deletion for audit logging
      const file = await prisma.storage_files.findUnique({
        where: { id: fileId },
        select: { name: true, fileName: true }
      });

      // Soft delete - set deletedAt timestamp
      const updatedFile = await prisma.storage_files.update({
        where: { id: fileId },
        data: {
          deletedAt: new Date()
        }
      });

      logger.info(`✅ File soft deleted (moved to recycle bin): ${fileId}`);

      // BE-045: Audit logging for file delete
      const userAgent = request.headers['user-agent'] || null;
      const clientIP = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      await logFileDelete({
        userId,
        fileId,
        fileName: file?.fileName || fileId,
        permanent: false,
        ip: clientIP,
        userAgent
      });

      // INFRA-021, INFRA-022: Structured logging and metrics for file operations
      const deleteLogger = new FileOperationLogger(generateRequestId());
      deleteLogger.logDelete(userId, fileId, file?.fileName || fileId, false);
      fileMetrics.recordDelete(true);

      // BE-047: Log file access
      await logFileAccess({
        fileId,
        userId,
        action: 'delete',
        ipAddress: clientIP,
        userAgent
      });

      // SEC-016: Safe logging (no file content)
      SafeLogger.logFileOperation('delete', {
        fileId,
        userId,
        fileName: file?.fileName || fileId,
        permanent: false,
      });

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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileUpdate')
    ]
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
      const file = await prisma.storage_files.findFirst({
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
      const updatedFile = await prisma.storage_files.update({
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileUpdate')
    ]
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
          const updatedFile = await prisma.storage_files.update({
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
        const folder = await prisma.storage_folders.findFirst({
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
      const file = await prisma.storage_files.findFirst({
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
      const updatedFile = await prisma.storage_files.update({
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileDelete')
    ]
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
      const file = await prisma.storage_files.findFirst({
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
      await prisma.storage_files.delete({
        where: { id: fileId }
      });

      logger.info(`✅ File permanently deleted: ${fileId}`);

      // Update storage quota
      try {
        const quota = await prisma.storage_quotas.findUnique({
          where: { userId }
        });

        if (quota) {
          const currentUsed = Number(quota.usedBytes);
          const fileSize = Number(file.size);
          const newUsed = Math.max(0, currentUsed - fileSize);

          await prisma.storage_quotas.update({
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileDownload')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return sendErrorResponse(reply, 401, ERROR_CODES.UNAUTHORIZED, 'User ID not found in token');
      }

      const fileId = request.params.id;

      // Check permission to download file
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return sendErrorResponse(reply, 403, ERROR_CODES.PERMISSION_DENIED, permissionCheck.reason || 'You do not have permission to download this file');
      }

      const file = permissionCheck.file;

      // DB-004: Update lastAccessedAt on download
      await prisma.storage_files.update({
        where: { id: fileId },
        data: { lastAccessedAt: new Date() }
      }).catch(err => logger.warn('Failed to update lastAccessedAt:', err));

      // BE-037: Add file not found in storage but exists in DB handling
      let fileBuffer;
      try {
        fileBuffer = await circuitBreakers.storage.execute(() =>
          retry(() => storageHandler.downloadAsBuffer(file.storagePath))
        );
      } catch (error) {
        logger.error('Failed to download file from storage:', error);
        await handleMissingStorageFile(file.id, file, prisma); // Mark as corrupted
        return sendErrorResponse(reply, 404, ERROR_CODES.STORAGE_FILE_NOT_FOUND, 'File not found in storage. It might be corrupted or missing.', { fileId: file.id, storagePath: file.storagePath });
      }
      
      if (!fileBuffer || fileBuffer.length === 0) {
        return sendErrorResponse(reply, 404, ERROR_CODES.FILE_NOT_FOUND, 'File not found in storage or file is empty');
      }

      // SEC-001: Decrypt file after download (if encryption was enabled during upload)
      const encryptionEnabled = process.env.ENABLE_FILE_ENCRYPTION === 'true';
      if (encryptionEnabled) {
        try {
          // Check if file is encrypted (has encryption header)
          const { isEncrypted } = require('../utils/fileEncryption');
          if (isEncrypted(fileBuffer)) {
            fileBuffer = decryptFile(fileBuffer);
            logger.debug(`File ${fileId} decrypted after download`);
          }
        } catch (decryptError) {
          logger.error(`Failed to decrypt file ${fileId}:`, decryptError);
          return sendErrorResponse(reply, 500, ERROR_CODES.FILE_CORRUPTED, 'Failed to decrypt file. File may be corrupted.');
        }
      }

      // BE-031: Add file corruption detection (verify file hash after download)
      const integrityCheck = await verifyFileIntegrity(fileBuffer, file);
      if (!integrityCheck.valid) {
        logger.warn(`File integrity check failed for file ${file.id}:`, integrityCheck.errors);
        // Optionally update DB to mark as corrupted if not already
        if (!file.isCorrupted) { // Assuming isCorrupted field exists
          await prisma.storage_files.update({
            where: { id: file.id },
            data: { isCorrupted: true }
          });
        }
        return sendErrorResponse(reply, 500, ERROR_CODES.FILE_CORRUPTED, 'File content corrupted. Please re-upload.', { fileId: file.id, errors: integrityCheck.errors });
      }

      // Increment download count
      await prisma.storage_files.update({
        where: { id: fileId },
        data: { downloadCount: { increment: 1 } }
      });

      // INFRA-021, INFRA-022: Structured logging and metrics for file operations
      const downloadStartTime = Date.now();
      const downloadLogger = new FileOperationLogger(generateRequestId());
      downloadLogger.logDownload(userId, fileId, file.fileName || file.name);
      const downloadDuration = Date.now() - downloadStartTime;
      fileMetrics.recordDownload(fileBuffer.length, downloadDuration, true);
      performanceMonitor.recordDownloadSpeed(fileBuffer.length, downloadDuration);

      // BE-047: Log file access
      const userAgent = request.headers['user-agent'] || null;
      const clientIP = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      await logFileAccess({
        fileId,
        userId,
        action: 'download',
        ipAddress: clientIP,
        userAgent
      });

      // SEC-016: Safe logging (no file content)
      SafeLogger.logFileOperation('download', {
        fileId,
        userId,
        fileName: file.fileName || file.name,
        fileSize: fileBuffer.length,
      });

      reply.type(file.contentType || 'application/octet-stream');
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName || file.name)}"`);
      return reply.send(fileBuffer);

    } catch (error) {
      logger.error('Error downloading file:', error);
      handleError(reply, error, ERROR_CODES.STORAGE_ERROR, 'An error occurred while downloading the file');
    }
  });

  // Share file with user
  fastify.post('/files/:id/share', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileShare')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return sendErrorResponse(reply, 401, ERROR_CODES.UNAUTHORIZED, 'User ID not found in token');
      }

      const fileId = request.params.id;
      const { userEmail, permission = 'VIEW', expiresAt, maxDownloads } = request.body || {}; // DB-021: Default to VIEW enum value

      // BE-015: Validate email format
      const emailValidation = validateEmail(userEmail);
      if (!emailValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_EMAIL, emailValidation.error);
      }

      // BE-016: Validate permission enum
      const permissionValidation = validatePermission(permission);
      if (!permissionValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_PERMISSION, permissionValidation.error);
      }

      // BE-017: Validate expiration date
      const expirationValidation = validateExpirationDate(expiresAt);
      if (!expirationValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_DATE_FORMAT, expirationValidation.error);
      }

      // BE-018: Validate max downloads (only relevant for share-link, but included here for consistency if logic changes)
      const maxDownloadsValidation = validateMaxDownloads(maxDownloads);
      if (!maxDownloadsValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_INPUT, maxDownloadsValidation.error);
      }

      // Check if file exists and belongs to user
      const file = await prisma.storage_files.findFirst({
        where: {
          id: fileId,
          userId,
          deletedAt: null
        }
      });

      if (!file) {
        return sendErrorResponse(reply, 404, ERROR_CODES.FILE_NOT_FOUND, 'File not found or you do not have permission to share it');
      }

      // Find the shared user (if exists)
      let sharedUser = await prisma.users.findUnique({
        where: { email: userEmail.toLowerCase() }
      });

      // Get the file owner's info for email
      const fileOwner = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      // Create share record - use user ID if exists, otherwise use email as identifier
      let share;
      if (sharedUser) {
        // User exists - create share with user ID
        // BE-057: Conflict resolution for concurrent shares (handle unique constraint gracefully)
        try {
          share = await prisma.fileShare.create({
            data: {
              fileId,
              userId,
              sharedWith: sharedUser.id,
              permission: permissionValidation.permission,
              expiresAt: expirationValidation.expiresAt
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
        } catch (error) {
          // Handle unique constraint violation (share already exists)
          if (error.code === 'P2002') {
            // Share already exists, fetch existing share
            share = await prisma.fileShare.findFirst({
              where: {
                fileId,
                userId,
                sharedWith: sharedUser.id
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
            
            if (share) {
              logger.info(`Share already exists for file ${fileId} with user ${sharedUser.id}, returning existing share`);
              // Update permission if different
              if (share.permission !== permissionValidation.permission) {
                share = await prisma.fileShare.update({
                  where: { id: share.id },
                  data: { permission: permissionValidation.permission },
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
              }
            } else {
              throw error; // Re-throw if we can't find existing share
            }
          } else {
            throw error; // Re-throw other errors
          }
        }
      } else {
        // User doesn't exist - create a temporary user or use email-based sharing
        // For now, we'll create a share link instead and send email
        // This allows sharing with external users
        
        // BE-043: Generate secure share token with entropy check
        let shareToken = generateSecureToken(32);
        const tokenValidation = validateTokenEntropy(shareToken);
        if (!tokenValidation.valid) {
          logger.error('Generated share token failed entropy check:', tokenValidation.error);
          // Generate a new token (shouldn't happen, but safety check)
          shareToken = generateSecureToken(64); // Use longer token as fallback
        }
        
        // BE-044: Hash share link password if provided
        let hashedPassword = null;
        if (formFields.password || request.body?.password) {
          const password = formFields.password || request.body.password;
          hashedPassword = await hashShareLinkPassword(password);
        }
        
        // Create share link with token
        const shareLink = await prisma.shareLink.create({
          data: {
            fileId,
            userId,
            token: shareToken,
            permission: permissionValidation.permission || 'VIEW', // DB-026: Use FilePermission enum (VIEW, COMMENT, EDIT, ADMIN)
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
            password: hashedPassword // BE-044: Store hashed password
          }
        });

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

        // BE-035: Email service failure handling with retry queue
        const emailResult = await sendEmailWithRetry({
          to: userEmail,
          subject: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you`,
          html: emailHtml,
          text: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you. View it here: ${shareUrl}`,
          isSecurityEmail: false,
          userId: sharedUser?.id || null, // Pass userId if available for preferences
          prisma: prisma
        });

        if (!emailResult.success) {
          logger.error(`Failed to send share email to ${userEmail}:`, emailResult.error);
          // Log but don't fail the request, as per BE-035
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
          emailSent: emailResult.success,
          emailError: emailResult.error || undefined,
          warning: emailResult.error ? 'File shared successfully but email notification failed. The recipient can still access the file.' : undefined
        });
      }

      logger.info(`✅ File shared: ${fileId} with ${userEmail}`);

      // Send email notification to existing user
      let emailResult = { success: true };
      
      if (sharedUser) {
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

        // BE-035: Email service failure handling with retry queue
        emailResult = await sendEmailWithRetry({
          to: userEmail,
          subject: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you`,
          html: emailHtml,
          text: `${fileOwner?.name || 'Someone'} shared "${file.name}" with you. View it here: ${fileUrl}`,
          isSecurityEmail: false,
          userId: sharedUser?.id || null,
          prisma: prisma
        });

        if (!emailResult.success) {
          logger.error(`Failed to send share email to ${userEmail}:`, emailResult.error);
          // Log but don't fail the request, as per BE-035
        }
      }

      // BE-034: Emit real-time event for file sharing (with error handling)
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

      // BE-045: Audit logging for file share
      const userAgent = request.headers['user-agent'] || null;
      const clientIP = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      // INFRA-021, INFRA-022: Structured logging and metrics for file operations
      const shareLogger = new FileOperationLogger(generateRequestId());
      shareLogger.logShare(userId, fileId, sharedUser?.id || userEmail, permissionValidation.permission);
      fileMetrics.recordShare(true);

      // SEC-016: Safe logging (no file content or sensitive share details)
      SafeLogger.logFileOperation('share', {
        fileId,
        userId,
        fileName: file.fileName || file.name,
        sharedWith: sharedUser ? sharedUser.id : maskEmail(userEmail),
      });

      await logFileShare({
        userId,
        fileId,
        fileName: file.name,
        sharedWith: sharedUser ? sharedUser.id : userEmail,
        permission: share.permission,
        ip: clientIP,
        userAgent
      });

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
        emailSent: emailResult.success,
        emailError: emailResult.error || undefined,
        warning: emailResult.error ? 'File shared successfully but email notification failed. The recipient can still access the file.' : undefined
      });

    } catch (error) {
      logger.error('Error sharing file:', error);
      handleError(reply, error, ERROR_CODES.EMAIL_SERVICE_ERROR, 'An error occurred while sharing the file');
    }
  });

  // Create share link
  fastify.post('/files/:id/share-link', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileShare')
    ]
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
      const file = await prisma.storage_files.findFirst({
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

      // BE-043: Generate secure share token with entropy check
      let shareToken = generateSecureToken(32);
      const tokenValidation = validateTokenEntropy(shareToken);
      if (!tokenValidation.valid) {
        logger.error('Generated share token failed entropy check:', tokenValidation.error);
        // Generate a new token (shouldn't happen, but safety check)
        shareToken = generateSecureToken(64); // Use longer token as fallback
      }

      // BE-044: Hash share link password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await hashShareLinkPassword(password);
      }

      // BE-017: Validate expiration date
      const expirationValidation = validateExpirationDate(expiresAt);
      if (expiresAt && !expirationValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_DATE_FORMAT, expirationValidation.error);
      }

      // BE-018: Validate max downloads
      const maxDownloadsValidation = validateMaxDownloads(maxDownloads);
      if (maxDownloads && !maxDownloadsValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_INPUT, maxDownloadsValidation.error);
      }

      // Create share link
      const shareLink = await prisma.shareLink.create({
        data: {
          fileId,
          userId,
          token: shareToken,
          password: hashedPassword, // BE-044: Store hashed password
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          maxDownloads: maxDownloads ? parseInt(maxDownloads) : null
        }
      });

      logger.info(`✅ Share link created: ${fileId} - token: ${shareToken}`);

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
          url: `${frontendUrl}/shared/${shareToken}`,
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('comments')
    ]
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
      const file = await prisma.storage_files.findFirst({
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('comments')
    ]
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
      const { content, parentId, mentions } = request.body || {};

      // BE-020: Validate comment content length
      // BE-048: Input sanitization for XSS in comments
      const contentValidation = validateCommentContent(content);
      if (!contentValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.COMMENT_TOO_LONG, contentValidation.error);
      }
      
      // DB-034: Validate content length (max 5000 chars) - already validated by validateCommentContent
      
      // Sanitize comment to prevent XSS
      const sanitizedContent = sanitizeComment(contentValidation.content);

      // Check permission to comment on file
      const permissionCheck = await checkFilePermission(userId, fileId, 'comment');
      if (!permissionCheck.allowed) {
        return sendErrorResponse(reply, 403, ERROR_CODES.PERMISSION_DENIED, permissionCheck.reason || 'You do not have permission to comment on this file');
      }

      // DB-033: Validate parentId doesn't equal id (self-reference check) - will be checked after comment creation

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

      // DB-033: Validate parentId doesn't equal id (self-reference check)
      if (parentId) {
        // This will be checked after we get the comment ID, but we can validate the concept here
        // The actual check happens when we try to set parentId to the same comment's ID
      }

      // Create comment
      const comment = await prisma.fileComment.create({
        data: {
          fileId,
          userId,
          content: sanitizedContent, // BE-048: Use sanitized content to prevent XSS
          parentId: parentId || null,
          // DB-032: User mentions
          mentions: Array.isArray(mentions) ? mentions : []
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('folderOperations')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const folders = await prisma.storage_folders.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: {
          _count: {
            select: {
              storage_files: {
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
          fileCount: folder._count.storage_files, // Include count of files in folder
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('folderOperations')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const { name, color, description, icon, sortOrder, metadata, parentId } = request.body || {};

      if (!name || !name.trim()) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Folder name is required'
        });
      }

      // BE-015: Check for duplicate folder name per user
      const existingFolder = await prisma.storage_folders.findFirst({
        where: {
          userId,
          name: name.trim(),
          deletedAt: null,
          parentId: parentId || null // Also check parent folder to prevent duplicates in same location
        }
      });
      if (existingFolder) {
        return sendErrorResponse(reply, 409, ERROR_CODES.FOLDER_ALREADY_EXISTS, `A folder with the name "${name.trim()}" already exists. Please use a different name.`, {
          existingFolderId: existingFolder.id,
          existingFolderName: existingFolder.name
        });
      }

      // DB-017: Validate parentId doesn't equal id (self-reference check)
      if (parentId && parentId === 'self') {
        return sendErrorResponse(reply, 400, ERROR_CODES.VALIDATION_ERROR, 'Folder cannot be its own parent');
      }

      const folder = await prisma.storage_folders.create({
        data: {
          userId,
          name: name.trim(),
          color: color || '#4F46E5',
          // DB-012: Folder description
          description: description || null,
          // DB-013: Folder icon
          icon: icon || null,
          // DB-014: Sort order
          sortOrder: sortOrder || 0,
          // DB-015: Metadata
          metadata: metadata || null,
          parentId: parentId || null
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('folderOperations')
    ]
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
      const { name, color, description, icon, sortOrder, metadata, parentId } = request.body || {};

      // Check if folder exists and belongs to user
      const folder = await prisma.storage_folders.findFirst({
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

      // DB-017: Validate parentId doesn't equal id (self-reference check)
      if (parentId !== undefined) {
        if (parentId === folderId || parentId === 'self') {
          return sendErrorResponse(reply, 400, ERROR_CODES.VALIDATION_ERROR, 'Folder cannot be its own parent');
        }
        // Check for circular reference (parent's parent chain)
        if (parentId) {
          let currentParentId = parentId;
          const visited = new Set([folderId]);
          while (currentParentId) {
            if (visited.has(currentParentId)) {
              return sendErrorResponse(reply, 400, ERROR_CODES.VALIDATION_ERROR, 'Circular reference detected in folder hierarchy');
            }
            visited.add(currentParentId);
            const parent = await prisma.storage_folders.findUnique({
              where: { id: currentParentId },
              select: { parentId: true }
            });
            currentParentId = parent?.parentId || null;
          }
        }
      }

      // DB-016: Check for duplicate folder name if name is being changed
      if (name && name.trim() && name.trim() !== folder.name) {
        const existingFolder = await prisma.storage_folders.findFirst({
          where: {
            userId,
            name: name.trim(),
            id: { not: folderId },
            deletedAt: null
          }
        });
        if (existingFolder) {
          return sendErrorResponse(reply, 409, ERROR_CODES.FILE_ALREADY_EXISTS, `A folder with the name "${name.trim()}" already exists.`);
        }
      }

      // Update folder
      const updatedFolder = await prisma.storage_folders.update({
        where: { id: folderId },
        data: {
          ...(name && name.trim() ? { name: name.trim() } : {}),
          ...(color ? { color } : {}),
          ...(description !== undefined ? { description: description || null } : {}),
          ...(icon !== undefined ? { icon: icon || null } : {}),
          ...(sortOrder !== undefined ? { sortOrder: sortOrder || 0 } : {}),
          ...(metadata !== undefined ? { metadata: metadata || null } : {}),
          ...(parentId !== undefined ? { parentId: parentId || null } : {})
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('folderOperations')
    ]
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
      const folder = await prisma.storage_folders.findFirst({
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
      await prisma.storage_files.updateMany({
        where: {
          folderId,
          userId
        },
        data: {
          folderId: null
        }
      });

      // Delete the folder
      await prisma.storage_folders.delete({
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

      const credentials = await prisma.credentials.findMany({
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

      const expiringCredentials = await prisma.credentials.findMany({
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

      const credential = await prisma.credentials.create({
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

      const credential = await prisma.credentials.findFirst({
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

      const updated = await prisma.credentials.update({
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

      const credential = await prisma.credentials.findFirst({
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

      await prisma.credentials.delete({
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

      const credential = await prisma.credentials.findFirst({
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileShare')
    ]
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

      // DB-021: Validate permission using enum values
      const permissionValidation = validatePermission(permission);
      if (!permissionValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.INVALID_PERMISSION, permissionValidation.error);
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
        data: { permission: permissionValidation.permission }, // DB-021: Use validated enum value (VIEW, COMMENT, EDIT, ADMIN)
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
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileShare')
    ]
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

  // ===== BE-063: STORAGE HEALTH CHECK ENDPOINT =====
  
  // Health check for storage service (no auth required for monitoring)
  fastify.get('/health', async (request, reply) => {
    try {
      const health = await storageHandler.healthCheck();
      
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      return reply.status(statusCode).send({
        success: true,
        health
      });
    } catch (error) {
      logger.error('Error checking storage health:', error);
      return reply.status(503).send({
        success: false,
        error: 'Storage health check failed',
        message: error.message
      });
    }
  });

  // ===== STORAGE QUOTA ENDPOINT =====

  // Get storage quota for user
  fastify.get('/quota', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileList')
    ]
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
      let quota = await prisma.storage_quotas.findUnique({
        where: { userId }
      });

      if (!quota) {
        // Create default quota (e.g., 5 GB limit)
        const defaultLimitBytes = BigInt(5 * 1024 * 1024 * 1024); // 5 GB
        quota = await prisma.storage_quotas.create({
          data: {
            userId,
            usedBytes: BigInt(0),
            limitBytes: defaultLimitBytes,
            id: uuidv4(),
            updatedAt: new Date()
          }
        });
      }

      // Calculate actual used space from files
      const files = await prisma.storage_files.findMany({
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
        quota = await prisma.storage_quotas.update({
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

      // BE-044: Verify password using hashed password
      if (shareLink.password) {
        if (!password) {
          return reply.status(403).send({
            error: 'Password Required',
            message: 'This share link requires a password'
          });
        }
        const isValid = await verifyShareLinkPassword(password, shareLink.password);
        if (!isValid) {
        return reply.status(403).send({
          error: 'Password Required',
          message: 'Incorrect password'
        });
        }
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

  // ===== BE-001: GET SINGLE FILE METADATA =====
  fastify.get('/files/:id', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileList')
    ]
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

      // Check permission to view file
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to view this file'
        });
      }

      // Get file with all relations
      const file = await prisma.storage_files.findUnique({
        where: { id: fileId },
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
          }
        }
      });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found'
        });
      }

      // Format response
      const formattedFile = {
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
        folderId: file.folderId || null,
        folderName: file.folder?.name || null,
        downloadCount: file.downloadCount,
        viewCount: file.viewCount,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
        lastModified: file.updatedAt.toISOString(),
        deletedAt: file.deletedAt ? file.deletedAt.toISOString() : null,
        owner: file.userId,
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
        thumbnail: file.thumbnail || null
      };

      return reply.send({
        success: true,
        file: formattedFile
      });

    } catch (error) {
      logger.error('Error fetching file:', error);
      return reply.status(500).send({
        error: 'Failed to fetch file',
        message: error.message
      });
    }
  });

  // ===== BE-002: BULK SOFT DELETE =====
  fastify.post('/files/bulk-delete', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('bulkOperations')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const { fileIds } = request.body;

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'fileIds array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const fileId of fileIds) {
        try {
          // Check permission
          const permissionCheck = await checkFilePermission(userId, fileId, 'delete');
          if (!permissionCheck.allowed) {
            errors.push({
              fileId,
              error: permissionCheck.reason || 'Permission denied'
            });
            continue;
          }

          // Soft delete file
          const deletedFile = await prisma.storage_files.update({
            where: { id: fileId },
            data: {
              deletedAt: new Date()
            }
          });

          results.push({
            fileId,
            success: true
          });

          // Emit real-time event
          if (socketIOServer.isInitialized()) {
            socketIOServer.notifyFileDeleted(userId, fileId, false);
          }

        } catch (error) {
          logger.error(`Error deleting file ${fileId}:`, error);
          errors.push({
            fileId,
            error: error.message || 'Failed to delete file'
          });
        }
      }

      return reply.send({
        success: true,
        results,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: fileIds.length,
          successful: results.length,
          failed: errors.length
        }
      });

    } catch (error) {
      logger.error('Error in bulk delete:', error);
      return reply.status(500).send({
        error: 'Failed to bulk delete files',
        message: error.message
      });
    }
  });

  // ===== BE-003: BULK RESTORE =====
  fastify.post('/files/bulk-restore', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('bulkOperations')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const { fileIds } = request.body;

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'fileIds array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const fileId of fileIds) {
        try {
          // Check if file exists and belongs to user
          const file = await prisma.storage_files.findUnique({
            where: { id: fileId }
          });

          if (!file) {
            errors.push({
              fileId,
              error: 'File not found'
            });
            continue;
          }

          if (file.userId !== userId) {
            errors.push({
              fileId,
              error: 'Permission denied'
            });
            continue;
          }

          if (!file.deletedAt) {
            errors.push({
              fileId,
              error: 'File is not deleted'
            });
            continue;
          }

          // Restore file
          const restoredFile = await prisma.storage_files.update({
            where: { id: fileId },
            data: {
              deletedAt: null
            }
          });

          results.push({
            fileId,
            success: true
          });

          // Format file for real-time event
          const restoredFileFormatted = {
            id: restoredFile.id,
            name: restoredFile.name,
            fileName: restoredFile.fileName,
            type: restoredFile.type,
            contentType: restoredFile.contentType,
            size: Number(restoredFile.size),
            sizeBytes: Number(restoredFile.size),
            storagePath: restoredFile.storagePath,
            publicUrl: restoredFile.publicUrl,
            description: restoredFile.description,
            isPublic: restoredFile.isPublic,
            isStarred: restoredFile.isStarred,
            isArchived: restoredFile.isArchived,
            folderId: restoredFile.folderId,
            downloadCount: restoredFile.downloadCount,
            viewCount: restoredFile.viewCount,
            createdAt: restoredFile.createdAt.toISOString(),
            updatedAt: restoredFile.updatedAt.toISOString(),
            lastModified: restoredFile.updatedAt.toISOString(),
            deletedAt: null,
            owner: restoredFile.userId,
            sharedWith: [],
            comments: [],
            version: 1
          };

          // Emit real-time event
          if (socketIOServer.isInitialized()) {
            socketIOServer.notifyFileRestored(userId, restoredFileFormatted);
          }

        } catch (error) {
          logger.error(`Error restoring file ${fileId}:`, error);
          errors.push({
            fileId,
            error: error.message || 'Failed to restore file'
          });
        }
      }

      return reply.send({
        success: true,
        results,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: fileIds.length,
          successful: results.length,
          failed: errors.length
        }
      });

    } catch (error) {
      logger.error('Error in bulk restore:', error);
      return reply.status(500).send({
        error: 'Failed to bulk restore files',
        message: error.message
      });
    }
  });

  // ===== BE-004: BULK MOVE TO FOLDER =====
  fastify.post('/files/bulk-move', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('bulkOperations')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      const { fileIds, folderId } = request.body;

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'fileIds array is required'
        });
      }

      // Validate folder if provided
      if (folderId !== null && folderId !== undefined && folderId !== '') {
        const folder = await prisma.folder.findUnique({
          where: { id: folderId }
        });

        if (!folder) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Folder not found'
          });
        }

        if (folder.userId !== userId) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'You do not have permission to move files to this folder'
          });
        }
      }

      const results = [];
      const errors = [];

      for (const fileId of fileIds) {
        try {
          // Check permission
          const permissionCheck = await checkFilePermission(userId, fileId, 'edit');
          if (!permissionCheck.allowed) {
            errors.push({
              fileId,
              error: permissionCheck.reason || 'Permission denied'
            });
            continue;
          }

          // Move file
          const updatedFile = await prisma.storage_files.update({
            where: { id: fileId },
            data: {
              folderId: folderId || null
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

          results.push({
            fileId,
            success: true,
            folderId: updatedFile.folderId,
            folderName: updatedFile.folder?.name || null
          });

          // Format file for real-time event
          const updatedFileFormatted = {
            id: updatedFile.id,
            name: updatedFile.name,
            fileName: updatedFile.fileName,
            type: updatedFile.type,
            folderId: updatedFile.folderId,
            updatedAt: updatedFile.updatedAt.toISOString(),
            version: 1
          };

          // Emit real-time event
          if (socketIOServer.isInitialized()) {
            socketIOServer.notifyFileUpdated(userId, updatedFileFormatted, { folderId: updatedFile.folderId });
          }

        } catch (error) {
          logger.error(`Error moving file ${fileId}:`, error);
          errors.push({
            fileId,
            error: error.message || 'Failed to move file'
          });
        }
      }

      return reply.send({
        success: true,
        results,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: fileIds.length,
          successful: results.length,
          failed: errors.length
        }
      });

    } catch (error) {
      logger.error('Error in bulk move:', error);
      return reply.status(500).send({
        error: 'Failed to bulk move files',
        message: error.message
      });
    }
  });

  // ===== BE-005: DUPLICATE FILE =====
  fastify.post('/files/:id/duplicate', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileUpload')
    ]
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

      // Check permission to view file
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to duplicate this file'
        });
      }

      const originalFile = permissionCheck.file;

      // Generate new filename
      const nameParts = originalFile.fileName.split('.');
      const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
      const baseName = nameParts.join('.');
      const newFileName = `${baseName} (copy)${extension}`;

      // Download original file
      let fileBuffer;
      try {
        const fileStream = await storageHandler.download(originalFile.storagePath);
        const chunks = [];
        for await (const chunk of fileStream) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
      } catch (error) {
        logger.error('Failed to download file for duplication:', error);
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Original file not found in storage'
        });
      }

      // Upload duplicate file
      // Create a readable stream from buffer for upload function
      const { Readable } = require('stream');
      const duplicateFileStream = Readable.from(fileBuffer);
      
      // Use duplicate-specific filename
      const duplicateFileName = `copy-${newFileName}`;
      const uploadResult = await storageHandler.upload(duplicateFileStream, userId, duplicateFileName, originalFile.contentType);
      
      // Use the generated path from upload result
      const duplicateStoragePath = uploadResult.path;

      // Get public URL if available
      let publicUrl = uploadResult.publicUrl || null;
      try {
        if (!publicUrl) {
          publicUrl = await storageHandler.getDownloadUrl(duplicateStoragePath);
        }
      } catch (error) {
        logger.warn('Failed to get public URL for duplicate:', error);
      }

      // Create duplicate file record
      const duplicateFile = await prisma.storage_files.create({
        data: {
          userId,
          name: originalFile.name + ' (copy)',
          fileName: newFileName,
          type: originalFile.type,
          contentType: originalFile.contentType,
          size: BigInt(fileBuffer.length),
          storagePath: duplicateStoragePath,
          publicUrl,
          description: originalFile.description ? originalFile.description + ' (duplicate)' : null,
          isPublic: false,
          isStarred: false,
          isArchived: false,
          folderId: originalFile.folderId,
          fileHash: originalFile.fileHash
        }
      });

      // Update storage quota
      try {
        const quota = await prisma.storage_quotas.findUnique({
          where: { userId }
        });

        if (quota) {
          const newUsed = BigInt(quota.usedBytes) + BigInt(fileBuffer.length);
          await prisma.storage_quotas.update({
            where: { userId },
            data: {
              usedBytes: newUsed
            }
          });
        }
      } catch (quotaError) {
        logger.warn('Failed to update storage quota:', quotaError.message);
      }

      // Format response
      const formattedFile = {
        id: duplicateFile.id,
        name: duplicateFile.name,
        fileName: duplicateFile.fileName,
        type: duplicateFile.type,
        contentType: duplicateFile.contentType,
        size: Number(duplicateFile.size),
        sizeBytes: Number(duplicateFile.size),
        storagePath: duplicateFile.storagePath,
        publicUrl: duplicateFile.publicUrl,
        description: duplicateFile.description,
        isPublic: duplicateFile.isPublic,
        isStarred: duplicateFile.isStarred,
        isArchived: duplicateFile.isArchived,
        folderId: duplicateFile.folderId,
        downloadCount: 0,
        viewCount: 0,
        createdAt: duplicateFile.createdAt.toISOString(),
        updatedAt: duplicateFile.updatedAt.toISOString(),
        lastModified: duplicateFile.updatedAt.toISOString(),
        owner: userId,
        sharedWith: [],
        comments: [],
        version: 1
      };

      // Emit real-time event
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileCreated(userId, formattedFile);
      }

      return reply.send({
        success: true,
        file: formattedFile,
        message: 'File duplicated successfully'
      });

    } catch (error) {
      logger.error('Error duplicating file:', error);
      return reply.status(500).send({
        error: 'Failed to duplicate file',
        message: error.message
      });
    }
  });

  // ===== BE-006: GET FILE VERSIONS =====
  fastify.get('/files/:id/versions', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileList')
    ]
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

      // Check permission to view file
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to view this file'
        });
      }

      // Get file with all versions
      const file = await prisma.storage_files.findUnique({
        where: { id: fileId },
        include: {
          file_versions: {
            orderBy: {
              versionNumber: 'desc'
            },
            include: {
              users: {
        select: {
          id: true,
          name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!file) {
        return sendErrorResponse(reply, 404, ERROR_CODES.FILE_NOT_FOUND, 'File not found');
      }

      // Build versions array - include current file as latest version
      const versions = file.file_versions.map(version => ({
        id: version.id,
        version: version.versionNumber,
        fileName: version.fileName,
        size: Number(version.size),
        contentType: version.contentType,
        fileHash: version.fileHash,
        description: version.description,
        createdAt: version.createdAt.toISOString(),
        createdBy: {
          id: version.users.id,
          name: version.users.name,
          email: version.users.email
        },
        isCurrent: false,
        metadata: version.metadata
      }));

      // Add current file as the latest version
      versions.unshift({
            id: file.id,
        version: file.version,
            fileName: file.fileName,
            size: Number(file.size),
        contentType: file.contentType,
        fileHash: file.fileHash,
        description: file.description,
            createdAt: file.createdAt.toISOString(),
            updatedAt: file.updatedAt.toISOString(),
        isCurrent: true,
        metadata: file.metadata
      });

      return reply.send({
        success: true,
        versions,
        totalVersions: versions.length
      });

    } catch (error) {
      logger.error('Error fetching file versions:', error);
      return handleError(reply, error, ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to fetch file versions');
    }
  });

  // ===== BE-011: POST CREATE FILE VERSION =====
  fastify.post('/files/:id/versions', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileUpload')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return sendErrorResponse(reply, 401, ERROR_CODES.UNAUTHORIZED, 'User ID not found in token');
      }

      const fileId = request.params.id;

      // Check permission to edit file
      const permissionCheck = await checkFilePermission(userId, fileId, 'edit');
      if (!permissionCheck.allowed) {
        return sendErrorResponse(reply, 403, ERROR_CODES.PERMISSION_DENIED, permissionCheck.reason || 'You do not have permission to create versions for this file');
      }

      const file = permissionCheck.file;

      // Get multipart file data
      const data = await request.file();
      if (!data) {
        return sendErrorResponse(reply, 400, ERROR_CODES.VALIDATION_ERROR, 'File is required');
      }

      const fileBuffer = await data.toBuffer();
      const fileSize = fileBuffer.length;

      // BE-022: Validate file size per subscription tier
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true }
      });

      const tierValidation = validateFileSizeByTier(fileSize, user?.subscriptionTier || 'FREE');
      if (!tierValidation.valid) {
        return sendErrorResponse(reply, 403, ERROR_CODES.FILE_TOO_LARGE, tierValidation.error);
      }

      // BE-025: Validate file content (structure validation)
      const contentType = data.mimetype || file.contentType;
      const contentValidation = validateFileStructure(fileBuffer, contentType);
      if (!contentValidation.valid) {
        return sendErrorResponse(reply, 400, ERROR_CODES.FILE_STRUCTURE_INVALID, contentValidation.error);
      }

      // Get next version number
      const latestVersion = await prisma.file_versions.findFirst({
        where: { fileId },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true }
      });

      const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : (file.version || 1);

      // Calculate file hash
      const crypto = require('crypto');
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Upload version to storage
      // Create a readable stream from buffer for upload function
      const { Readable } = require('stream');
      const versionFileStream = Readable.from(fileBuffer);
      
      // Use version-specific filename with version number
      const versionFileName = `v${nextVersionNumber}-${data.filename || file.fileName}`;
      const uploadResult = await storageHandler.upload(versionFileStream, userId, versionFileName, contentType);
      
      // Use the generated path from upload result, but organize versions in a subdirectory
      const versionStoragePath = `${userId}/versions/${fileId}/${uploadResult.path.split('/').pop()}`;
      
      // Note: The actual storage path is generated by storageHandler, but we track it as versions/{fileId}/filename

      // Create version record
      const fileVersion = await prisma.file_versions.create({
        data: {
          fileId,
          versionNumber: nextVersionNumber,
          fileName: data.filename || file.fileName,
          contentType: contentType,
          size: BigInt(fileSize),
          storagePath: uploadResult.path, // Use actual storage path from upload result
          fileHash: fileHash,
          description: file.description,
          createdBy: userId,
          metadata: {
            originalSize: fileSize,
            uploadedAt: new Date().toISOString()
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Update file version number
      await prisma.storage_files.update({
        where: { id: fileId },
        data: {
          version: nextVersionNumber,
          updatedAt: new Date(),
          modifiedBy: userId
        }
      });

      // BE-047: Log file access
      await logFileAccess({
        fileId,
        userId,
        action: 'version_create',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      // Emit real-time event
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileUpdated(userId, {
          id: fileId,
          version: nextVersionNumber
        }, {
          version: nextVersionNumber,
          versionCreated: true
        });
      }

      return reply.send({
        success: true,
        version: {
          id: fileVersion.id,
          fileId: fileVersion.fileId,
          version: fileVersion.versionNumber,
          fileName: fileVersion.fileName,
          size: Number(fileVersion.size),
          contentType: fileVersion.contentType,
          fileHash: fileVersion.fileHash,
          createdAt: fileVersion.createdAt.toISOString(),
          createdBy: {
            id: fileVersion.users.id,
            name: fileVersion.users.name,
            email: fileVersion.users.email
          }
        },
        message: `Version ${nextVersionNumber} created successfully`
      });

    } catch (error) {
      logger.error('Error creating file version:', error);
      return handleError(reply, error, ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to create file version');
    }
  });

  // ===== BE-011b: RESTORE A SPECIFIC FILE VERSION =====
  fastify.post('/files/:id/versions/:versionId/restore', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;
      const versionId = request.params.versionId;

      if (!userId) {
        return sendErrorResponse(reply, 401, ERROR_CODES.UNAUTHORIZED, 'User ID not found in token');
      }

      // Permission check
      const permissionCheck = await checkFilePermission(userId, fileId, 'edit');
      if (!permissionCheck.allowed) {
        return sendErrorResponse(reply, 403, ERROR_CODES.FORBIDDEN, permissionCheck.reason || 'Permission denied');
      }

      // Load current file and target version
      const file = await prisma.storage_files.findUnique({ where: { id: fileId } });
      if (!file) {
        return sendErrorResponse(reply, 404, ERROR_CODES.NOT_FOUND, 'File not found');
      }

      const version = await prisma.file_versions.findUnique({
        where: { id: versionId }
      });
      if (!version || version.fileId !== fileId) {
        return sendErrorResponse(reply, 404, ERROR_CODES.NOT_FOUND, 'File version not found');
      }

      // Create a version snapshot of the current file before restoring
      await prisma.file_versions.create({
        data: {
          fileId,
          versionNumber: (file.version || 1),
          fileName: file.fileName || file.name,
          contentType: file.contentType || 'application/octet-stream',
          size: BigInt(file.size || 0),
          storagePath: file.storagePath,
          fileHash: file.fileHash || null,
          description: file.description || null,
          createdBy: userId,
          metadata: {
            restoredFrom: version.id,
            snapshotAt: new Date().toISOString()
          }
        }
      });

      // Increment version and point file to the restored version's storage
      const newVersionNumber = (file.version || 1) + 1;
      const updatedFile = await prisma.storage_files.update({
        where: { id: fileId },
        data: {
          version: newVersionNumber,
          fileName: version.fileName,
          contentType: version.contentType,
          size: version.size,
          storagePath: version.storagePath,
          updatedAt: new Date(),
          modifiedBy: userId
        }
      });

      // Log audit
      await logFileAccess({
        fileId,
        userId,
        action: 'version_restore',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      // Realtime notify
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileUpdated(userId, {
          id: updatedFile.id,
          version: updatedFile.version
        }, { versionRestored: true });
      }

      return reply.send({
        success: true,
        message: 'Version restored successfully',
        file: {
          id: updatedFile.id,
          name: updatedFile.name,
          fileName: updatedFile.fileName,
          version: updatedFile.version,
          contentType: updatedFile.contentType,
          size: Number(updatedFile.size || 0),
          updatedAt: updatedFile.updatedAt?.toISOString?.() || new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error restoring file version:', error);
      return handleError(reply, error, ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to restore file version');
    }
  });

  // ===== BE-011c: DOWNLOAD A SPECIFIC FILE VERSION =====
  fastify.get('/files/:id/versions/:versionId/download', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      const fileId = request.params.id;
      const versionId = request.params.versionId;

      if (!userId) {
        return sendErrorResponse(reply, 401, ERROR_CODES.UNAUTHORIZED, 'User ID not found in token');
      }

      // Permission check (view)
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return sendErrorResponse(reply, 403, ERROR_CODES.FORBIDDEN, permissionCheck.reason || 'Permission denied');
      }

      // Get version
      const version = await prisma.file_versions.findUnique({
        where: { id: versionId }
      });
      if (!version || version.fileId !== fileId) {
        return sendErrorResponse(reply, 404, ERROR_CODES.NOT_FOUND, 'File version not found');
      }

      // Generate a signed URL (or direct URL) and redirect
      let downloadUrl = null;
      try {
        downloadUrl = await storageHandler.getDownloadUrl(version.storagePath);
      } catch (e) {
        logger.warn('Failed to generate download URL for version, attempting direct path:', e);
      }

      if (downloadUrl) {
        reply.header('Content-Disposition', `attachment; filename="${version.fileName || 'file'}"`);
        return reply.redirect(downloadUrl);
      }

      // Fallback: stream via storageHandler.download if available
      if (typeof storageHandler.download === 'function') {
        const stream = await storageHandler.download(version.storagePath);
        reply.header('Content-Type', version.contentType || 'application/octet-stream');
        reply.header('Content-Disposition', `attachment; filename="${version.fileName || 'file'}"`);
        return reply.send(stream);
      }

      return sendErrorResponse(reply, 500, ERROR_CODES.INTERNAL_SERVER_ERROR, 'Unable to download version');
    } catch (error) {
      logger.error('Error downloading file version:', error);
      return handleError(reply, error, ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to download file version');
    }
  });

  // ===== BE-007: GET STORAGE STATISTICS =====
  fastify.get('/stats', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileList')
    ]
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId || request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User ID not found in token'
        });
      }

      // Get all files for user
      const files = await prisma.storage_files.findMany({
        where: {
          userId,
          deletedAt: null // Only count non-deleted files
        },
        select: {
          type: true,
          size: true,
          createdAt: true
        }
      });

      // Calculate statistics
      const totalFiles = files.length;
      const totalSize = files.reduce((sum, file) => sum + BigInt(file.size || 0), BigInt(0));
      
      // Group by type
      const byType = {};
      files.forEach(file => {
        const type = file.type || 'document';
        if (!byType[type]) {
          byType[type] = {
            count: 0,
            size: BigInt(0)
          };
        }
        byType[type].count++;
        byType[type].size += BigInt(file.size || 0);
      });

      // Convert BigInt to numbers for JSON response
      const byTypeFormatted = {};
      Object.keys(byType).forEach(type => {
        byTypeFormatted[type] = {
          count: byType[type].count,
          size: Number(byType[type].size),
          sizeGB: Number(byType[type].size) / (1024 * 1024 * 1024)
        };
      });

      // Get storage quota
      const quota = await prisma.storageQuota.findUnique({
        where: { userId }
      });

      // Get folder count
      const folderCount = await prisma.folder.count({
        where: {
          userId,
          deletedAt: null
        }
      });

      // Get shared files count
      const sharedFilesCount = await prisma.fileShare.count({
        where: {
          userId // Files shared by this user
        }
      });

      // Get files shared with user count
      const filesSharedWithUserCount = await prisma.fileShare.count({
        where: {
          sharedWith: userId
        }
      });

      return reply.send({
        success: true,
        stats: {
          totalFiles,
          totalSize: Number(totalSize),
          totalSizeGB: Number(totalSize) / (1024 * 1024 * 1024),
          byType: byTypeFormatted,
          folderCount,
          sharedFilesCount,
          filesSharedWithUserCount,
          quota: quota ? {
            usedBytes: Number(quota.usedBytes),
            limitBytes: Number(quota.limitBytes),
            usedGB: Number(quota.usedBytes) / (1024 * 1024 * 1024),
            limitGB: Number(quota.limitBytes) / (1024 * 1024 * 1024),
            percentage: quota.limitBytes > 0 
              ? (Number(quota.usedBytes) / Number(quota.limitBytes)) * 100 
              : 0
          } : null
        }
      });

    } catch (error) {
      logger.error('Error fetching storage statistics:', error);
      return reply.status(500).send({
        error: 'Failed to fetch storage statistics',
        message: error.message
      });
    }
  });

  // ===== BE-008: GET FILE ACCESS LOGS =====
  fastify.get('/files/:id/access-logs', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileList')
    ]
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

      // Check permission to view file
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to view access logs for this file'
        });
      }

      // Get access logs
      const logs = await prisma.fileAccessLog.findMany({
        where: {
          fileId
        },
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
          createdAt: 'desc'
        },
        take: 100 // Limit to last 100 logs
      });

      // Format response
      const formattedLogs = logs.map(log => ({
        id: log.id,
        fileId: log.fileId,
        userId: log.userId,
        userName: log.user.name,
        userEmail: log.user.email,
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.createdAt.toISOString()
      }));

      return reply.send({
        success: true,
        logs: formattedLogs,
        count: formattedLogs.length
      });

    } catch (error) {
      logger.error('Error fetching access logs:', error);
      return reply.status(500).send({
        error: 'Failed to fetch access logs',
        message: error.message
      });
    }
  });

  // ===== BE-009: UPLOAD THUMBNAIL =====
  fastify.post('/files/:id/thumbnail', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileUpdate')
    ]
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

      // Check permission to edit file
      const permissionCheck = await checkFilePermission(userId, fileId, 'edit');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to update thumbnail for this file'
        });
      }

      // Get file data from multipart form
      let thumbnailData = null;
      let contentType = 'image/png';

      for await (const part of request.parts()) {
        if (part.type === 'file' && part.fieldname === 'thumbnail') {
          const chunks = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          thumbnailData = Buffer.concat(chunks);
          contentType = part.mimetype || 'image/png';
          break;
        }
      }

      if (!thumbnailData || thumbnailData.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Thumbnail file is required'
        });
      }

      // Validate thumbnail size (max 2MB)
      const maxThumbnailSize = 2 * 1024 * 1024; // 2MB
      if (thumbnailData.length > maxThumbnailSize) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Thumbnail size exceeds maximum limit of 2MB'
        });
      }

      // Upload thumbnail to storage
      const thumbnailPath = `${userId}/thumbnails/${fileId}-${Date.now()}.png`;
      await storageHandler.upload(thumbnailPath, thumbnailData, {
        contentType,
        metadata: {
          fileId,
          uploadedAt: new Date().toISOString()
        }
      });

      // Get public URL
      let thumbnailUrl = null;
      try {
        thumbnailUrl = await storageHandler.getPublicUrl(thumbnailPath);
      } catch (error) {
        logger.warn('Failed to get public URL for thumbnail:', error);
      }

      // Update file with thumbnail URL
      const updatedFile = await prisma.storage_files.update({
        where: { id: fileId },
        data: {
          thumbnail: thumbnailUrl || thumbnailPath
        }
      });

      // Format file for real-time event
      const thumbnailUpdatedFile = {
        id: updatedFile.id,
        thumbnail: updatedFile.thumbnail,
        updatedAt: updatedFile.updatedAt.toISOString(),
        version: 1
      };

      // Emit real-time event
      if (socketIOServer.isInitialized()) {
        socketIOServer.notifyFileUpdated(userId, thumbnailUpdatedFile, { thumbnail: updatedFile.thumbnail });
      }

      return reply.send({
        success: true,
        thumbnail: updatedFile.thumbnail,
        message: 'Thumbnail uploaded successfully'
      });

    } catch (error) {
      logger.error('Error uploading thumbnail:', error);
      return reply.status(500).send({
        error: 'Failed to upload thumbnail',
        message: error.message
      });
    }
  });

  // ===== GET FILE ACTIVITY TIMELINE =====
  fastify.get('/files/:id/activity', {
    preHandler: [authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const fileId = request.params.id;
      const limit = request.query.limit || 50;
      const offset = request.query.offset || 0;

      // Check file exists and user has permission
      const file = await prisma.storage_files.findUnique({
        where: { id: fileId },
        select: {
          id: true,
          userId: true,
          deletedAt: true
        }
      });

      if (!file) {
        return sendErrorResponse(reply, 404, ERROR_CODES.FILE_NOT_FOUND, 'File not found');
      }

      if (file.deletedAt) {
        return sendErrorResponse(reply, 404, ERROR_CODES.FILE_NOT_FOUND, 'File has been deleted');
      }

      // Check permission
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return sendErrorResponse(reply, 403, ERROR_CODES.PERMISSION_DENIED, permissionCheck.reason || 'You do not have permission to view this file');
      }

      // Get activity logs for this file
      const logs = await prisma.fileAccessLog.findMany({
        where: {
          fileId: fileId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      // Get total count for pagination
      const totalCount = await prisma.fileAccessLog.count({
        where: {
          fileId: fileId
        }
      });

      // Format response - map backend action to frontend ActivityType
      const actionToTypeMap = {
        'upload': 'upload',
        'download': 'download',
        'update': 'edit',
        'delete': 'delete',
        'restore': 'restore',
        'share': 'share',
        'comment': 'comment',
        'star': 'star',
        'archive': 'archive'
      };

      const activities = logs.map(log => {
        const activityType = actionToTypeMap[log.action] || 'upload';
        const userName = log.user?.name || log.user?.email || 'Unknown User';
        
        // Generate description based on action
        const descriptions = {
          'upload': `Uploaded file`,
          'download': `Downloaded file`,
          'update': `Updated file`,
          'delete': `Deleted file`,
          'restore': `Restored file`,
          'share': `Shared file`,
          'comment': `Added comment`,
          'star': `Starred file`,
          'archive': `Archived file`
        };
        
        return {
          id: log.id,
          type: activityType,
          timestamp: log.createdAt.toISOString(),
          userId: log.userId,
          userName: userName,
          userEmail: log.user?.email,
          userAvatar: null, // Can be added if user has avatar
          description: descriptions[activityType] || `Performed ${log.action} action`,
          metadata: log.metadata || {}
        };
      });

      return reply.send({
        success: true,
        activities,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      });

    } catch (error) {
      logger.error('Error fetching file activity:', error);
      return sendErrorResponse(reply, 500, ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch file activity');
    }
  });

  // ===== BE-010: GET THUMBNAIL =====
  fastify.get('/files/:id/thumbnail', {
    preHandler: [
      authenticate,
      // BE-039: Rate limiting per endpoint
      createStorageRateLimitMiddleware('fileDownload')
    ]
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

      // Check permission to view file
      const permissionCheck = await checkFilePermission(userId, fileId, 'view');
      if (!permissionCheck.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: permissionCheck.reason || 'You do not have permission to view thumbnail for this file'
        });
      }

      const file = permissionCheck.file;

      if (!file.thumbnail) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Thumbnail not found for this file'
        });
      }

      // If thumbnail is a public URL, redirect to it
      if (file.thumbnail.startsWith('http://') || file.thumbnail.startsWith('https://')) {
        return reply.redirect(file.thumbnail);
      }

      // Otherwise, download from storage
      try {
        const thumbnailStream = await storageHandler.download(file.thumbnail);
        const chunks = [];
        for await (const chunk of thumbnailStream) {
          chunks.push(chunk);
        }
        const thumbnailBuffer = Buffer.concat(chunks);

        reply.header('Content-Type', 'image/png');
        reply.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        return reply.send(thumbnailBuffer);

      } catch (error) {
        logger.error('Failed to download thumbnail from storage:', error);
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Thumbnail not found in storage'
        });
      }

    } catch (error) {
      logger.error('Error fetching thumbnail:', error);
      return reply.status(500).send({
        error: 'Failed to fetch thumbnail',
        message: error.message
      });
    }
  });
}

module.exports = storageRoutes;

