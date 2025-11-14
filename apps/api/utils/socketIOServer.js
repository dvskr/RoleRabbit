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
   * ===========================================
   * AI AGENT EVENTS
   * ===========================================
   */

  /**
   * Emit AI Agent task progress update
   */
  notifyTaskProgress(userId, taskId, progress, currentStep) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('ai_agent:task_progress', {
      taskId,
      progress,
      currentStep,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit AI Agent task completed event
   */
  notifyTaskCompleted(userId, taskId, result) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('ai_agent:task_completed', {
      taskId,
      result,
      timestamp: new Date().toISOString()
    });
    logger.info(`Notified user ${userId} of completed task ${taskId}`);
  }

  /**
   * Emit AI Agent task failed event
   */
  notifyTaskFailed(userId, taskId, error) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('ai_agent:task_failed', {
      taskId,
      error,
      timestamp: new Date().toISOString()
    });
    logger.info(`Notified user ${userId} of failed task ${taskId}`);
  }

  /**
   * Emit AI Agent task started event
   */
  notifyTaskStarted(userId, taskId, taskType) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('ai_agent:task_started', {
      taskId,
      taskType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit AI Agent task cancelled event
   */
  notifyTaskCancelled(userId, taskId) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('ai_agent:task_cancelled', {
      taskId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit batch tasks progress (for bulk operations)
   */
  notifyBatchProgress(userId, batchId, completed, total, currentTask) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('ai_agent:batch_progress', {
      batchId,
      completed,
      total,
      currentTask,
      percentage: Math.round((completed / total) * 100),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * ===========================================
   * WORKFLOW EVENTS
   * ===========================================
   */

  /**
   * Emit workflow execution queued event
   */
  notifyWorkflowQueued(userId, executionId, workflowId, workflowName) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:execution_queued', {
      executionId,
      workflowId,
      workflowName,
      status: 'QUEUED',
      timestamp: new Date().toISOString()
    });
    logger.info(`Notified user ${userId} of queued workflow execution ${executionId}`);
  }

  /**
   * Emit workflow execution started event
   */
  notifyWorkflowStarted(userId, executionId, workflowId, workflowName) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:execution_started', {
      executionId,
      workflowId,
      workflowName,
      status: 'RUNNING',
      timestamp: new Date().toISOString()
    });
    logger.info(`Notified user ${userId} of started workflow execution ${executionId}`);
  }

  /**
   * Emit workflow execution completed event
   */
  notifyWorkflowCompleted(userId, executionId, workflowId, result, duration) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:execution_completed', {
      executionId,
      workflowId,
      status: 'COMPLETED',
      result,
      duration,
      timestamp: new Date().toISOString()
    });
    logger.info(`Notified user ${userId} of completed workflow execution ${executionId}`);
  }

  /**
   * Emit workflow execution failed event
   */
  notifyWorkflowFailed(userId, executionId, workflowId, error, failedNodeId) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:execution_failed', {
      executionId,
      workflowId,
      status: 'FAILED',
      error,
      failedNodeId,
      timestamp: new Date().toISOString()
    });
    logger.info(`Notified user ${userId} of failed workflow execution ${executionId}`);
  }

  /**
   * Emit workflow execution cancelled event
   */
  notifyWorkflowCancelled(userId, executionId, workflowId) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:execution_cancelled', {
      executionId,
      workflowId,
      status: 'CANCELLED',
      timestamp: new Date().toISOString()
    });
    logger.info(`Notified user ${userId} of cancelled workflow execution ${executionId}`);
  }

  /**
   * Emit workflow node started event
   */
  notifyWorkflowNodeStarted(userId, executionId, nodeId, nodeName, nodeType) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:node_started', {
      executionId,
      nodeId,
      nodeName,
      nodeType,
      status: 'RUNNING',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit workflow node completed event
   */
  notifyWorkflowNodeCompleted(userId, executionId, nodeId, nodeName, result, duration) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:node_completed', {
      executionId,
      nodeId,
      nodeName,
      status: 'COMPLETED',
      result,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit workflow node failed event
   */
  notifyWorkflowNodeFailed(userId, executionId, nodeId, nodeName, error) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('workflow:node_failed', {
      executionId,
      nodeId,
      nodeName,
      status: 'FAILED',
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit workflow progress update (overall percentage)
   */
  notifyWorkflowProgress(userId, executionId, completedNodes, totalNodes) {
    if (!this.io) return;
    const percentage = Math.round((completedNodes / totalNodes) * 100);
    this.io.to(`user:${userId}`).emit('workflow:execution_progress', {
      executionId,
      completedNodes,
      totalNodes,
      percentage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * ===========================================
   * PROGRESS TRACKING EVENTS (Resume Operations)
   * ===========================================
   */

  /**
   * Emit resume parsing progress
   */
  notifyParsingProgress(userId, operationId, progressData) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('resume:parsing_progress', {
      operationId,
      ...progressData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit ATS analysis progress
   */
  notifyATSProgress(userId, operationId, progressData) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('resume:ats_progress', {
      operationId,
      ...progressData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit resume tailoring progress
   */
  notifyTailoringProgress(userId, operationId, progressData) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('resume:tailoring_progress', {
      operationId,
      ...progressData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit operation completed event
   */
  notifyOperationComplete(userId, operationId, operationType, result) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('resume:operation_complete', {
      operationId,
      operationType,
      result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit operation failed event
   */
  notifyOperationFailed(userId, operationId, operationType, error) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('resume:operation_failed', {
      operationId,
      operationType,
      error,
      timestamp: new Date().toISOString()
    });
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

