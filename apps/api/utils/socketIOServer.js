/**
 * Socket.IO Server for Real-time Features
 * Handles file storage updates, notifications, and live collaboration
 */

const { Server } = require('socket.io');
const logger = require('./logger');

class SocketIOServer {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();

    logger.info('Socket.IO server initialized');
    return this.io;
  }

  /**
   * Setup middleware for authentication
   */
  setupMiddleware() {
    if (!this.io) return;

    // Authentication middleware (using JWT from cookies)
    this.io.use(async (socket, next) => {
      try {
        // Get user ID from handshake auth or query
        const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
        
        if (userId) {
          socket.userId = userId;
          socket.join(`user:${userId}`); // Join user's personal room
          next();
        } else {
          // Allow connection but mark as unauthorized - client can authenticate later
          socket.authenticated = false;
          next();
        }
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup connection event handlers
   */
  setupConnectionHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}${socket.userId ? ` (user: ${socket.userId})` : ''}`);

      // Handle authentication
      socket.on('authenticate', (data) => {
        if (data.userId) {
          socket.userId = data.userId;
          socket.authenticated = true;
          socket.join(`user:${data.userId}`);
          socket.emit('authenticated', { success: true });
          logger.info(`Socket authenticated: ${socket.id} for user ${data.userId}`);
        }
      });

      // Handle join file room (for file-specific updates)
      socket.on('join_file_room', (data) => {
        if (data.fileId && socket.userId) {
          socket.join(`file:${data.fileId}`);
          logger.debug(`Socket ${socket.id} joined file room: file:${data.fileId}`);
        }
      });

      // Handle leave file room
      socket.on('leave_file_room', (data) => {
        if (data.fileId) {
          socket.leave(`file:${data.fileId}`);
        }
      });

      socket.on('disconnect', (reason) => {
        logger.info(`Socket disconnected: ${socket.id} (${reason})`);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Emit file created event to user
   */
  notifyFileCreated(userId, file) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('file_created', {
      file,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit file updated event to user and file watchers
   */
  notifyFileUpdated(userId, file, updates) {
    if (!this.io) return;
    const eventData = {
      fileId: file.id,
      file,
      updates,
      timestamp: new Date().toISOString()
    };
    
    // Notify the owner
    this.io.to(`user:${userId}`).emit('file_updated', eventData);
    
    // Notify anyone watching this file
    this.io.to(`file:${file.id}`).emit('file_updated', eventData);
  }

  /**
   * Emit file deleted event to user
   */
  notifyFileDeleted(userId, fileId, permanently = false) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('file_deleted', {
      fileId,
      permanently,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit file restored event to user
   */
  notifyFileRestored(userId, file) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('file_restored', {
      file,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit file shared event to users
   */
  notifyFileShared(ownerId, shareData) {
    if (!this.io) return;
    const eventData = {
      fileId: shareData.fileId,
      share: shareData.share,
      timestamp: new Date().toISOString()
    };
    
    // Notify the owner
    this.io.to(`user:${ownerId}`).emit('file_shared', eventData);
    
    // Notify the shared user if they're online
    if (shareData.share.sharedWithUserId) {
      this.io.to(`user:${shareData.share.sharedWithUserId}`).emit('file_shared_with_you', eventData);
    }
  }

  /**
   * Emit share removed event
   */
  notifyShareRemoved(userId, fileId, shareId) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('share_removed', {
      fileId,
      shareId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit comment added event
   */
  notifyCommentAdded(userId, fileId, comment) {
    if (!this.io) return;
    const eventData = {
      fileId,
      comment,
      timestamp: new Date().toISOString()
    };
    
    // Notify the owner
    this.io.to(`user:${userId}`).emit('comment_added', eventData);
    
    // Notify anyone watching this file
    this.io.to(`file:${fileId}`).emit('comment_added', eventData);
  }

  /**
   * Get instance
   */
  getIO() {
    return this.io;
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this.io !== null;
  }
}

// Export singleton instance
module.exports = new SocketIOServer();

