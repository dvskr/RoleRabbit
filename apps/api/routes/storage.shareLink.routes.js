/**
 * SEC-012, SEC-021: Public share link endpoint with max downloads enforcement
 */

const { prisma } = require('../utils/db');
const storageHandler = require('../utils/storageHandler');
const { checkShareLinkAccess, incrementShareLinkDownloads } = require('../utils/shareLinkAccess');
const { logFileAccess } = require('../utils/fileAuditTrail');
const { decryptFile } = require('../utils/fileEncryption');
const { SafeLogger } = require('../utils/safeLogging');
const logger = require('../utils/logger');
const { sendErrorResponse, ERROR_CODES } = require('../utils/errorResponse');

/**
 * Register share link routes
 */
async function shareLinkRoutes(fastify, _options) {
  // SEC-021: Public share link access endpoint (no authentication required)
  fastify.get('/share/:token', async (request, reply) => {
    try {
      const token = request.params.token;
      const password = request.query.password || null;

      // SEC-012: Check share link access and enforce max downloads
      const accessCheck = await checkShareLinkAccess(token, password);
      
      if (!accessCheck.allowed) {
        if (accessCheck.requiresPassword) {
          return reply.status(401).send({
            error: 'Password Required',
            message: 'This share link requires a password',
            requiresPassword: true,
          });
        }
        return sendErrorResponse(reply, 403, ERROR_CODES.PERMISSION_DENIED, accessCheck.reason || 'Share link access denied');
      }

      const { shareLink, file } = accessCheck;

      // SEC-004, SEC-008: Log file access via share link
      await logFileAccess(file.id, null, 'share_link_access', {
        fileName: file.name,
        fileType: file.type,
        fileSize: Number(file.size),
        storagePath: file.storagePath,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        shareTokenUsed: true, // SEC-019: Indicate token was used but don't log it
      });

      // SEC-012: Increment download count before download
      await incrementShareLinkDownloads(token);

      // Download file
      let fileBuffer;
      try {
        fileBuffer = await storageHandler.downloadAsBuffer(file.storagePath);
      } catch (error) {
        logger.error('Failed to download file from storage:', error);
        return sendErrorResponse(reply, 404, ERROR_CODES.STORAGE_FILE_NOT_FOUND, 'File not found in storage');
      }

      // SEC-001: Decrypt if encrypted
      const encryptionEnabled = process.env.ENABLE_FILE_ENCRYPTION === 'true';
      if (encryptionEnabled) {
        try {
          fileBuffer = decryptFile(fileBuffer);
        } catch (error) {
          logger.error('File decryption failed:', error);
          return sendErrorResponse(reply, 500, ERROR_CODES.STORAGE_ERROR, 'Failed to decrypt file');
        }
      }

      // SEC-016: Safe logging
      SafeLogger.logFileOperation('share_link_download', {
        fileId: file.id,
        userId: null, // Public access
        fileName: file.name,
        fileType: file.type,
        fileSize: Number(file.size),
        // SEC-019: Token is NOT logged
      });

      reply.type(file.contentType || 'application/octet-stream');
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName || file.name)}"`);
      reply.send(fileBuffer);

    } catch (error) {
      logger.error('Error accessing share link:', error);
      return sendErrorResponse(reply, 500, ERROR_CODES.INTERNAL_ERROR, 'An error occurred while accessing the share link');
    }
  });
}

module.exports = shareLinkRoutes;

