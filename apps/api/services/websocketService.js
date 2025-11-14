/**
 * WebSocket Service for Real-Time Updates
 * Manages WebSocket connections and real-time notifications
 *
 * Features:
 * - Real-time template updates
 * - Live comment notifications
 * - Rating updates
 * - Approval status changes
 * - User presence
 * - Collaboration events
 * - Room-based messaging
 */

const WebSocket = require('ws');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> Set of WebSocket connections
    this.rooms = new Map(); // roomId -> Set of userIds
    this.userPresence = new Map(); // userId -> presence data
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    let userId = null;
    let sessionId = this.generateSessionId();

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        this.handleMessage(ws, data, sessionId);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format',
        }));
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(userId, sessionId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Store session info
    ws.sessionId = sessionId;
  }

  /**
   * Handle incoming WebSocket message
   */
  async handleMessage(ws, data, sessionId) {
    const { type, payload, userId } = data;

    switch (type) {
      case 'auth':
        await this.handleAuth(ws, payload, sessionId);
        break;

      case 'subscribe':
        await this.handleSubscribe(ws, payload, userId);
        break;

      case 'unsubscribe':
        await this.handleUnsubscribe(ws, payload, userId);
        break;

      case 'presence':
        await this.handlePresenceUpdate(ws, payload, userId);
        break;

      case 'typing':
        await this.handleTypingIndicator(payload, userId);
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${type}`,
        }));
    }
  }

  /**
   * Handle user authentication
   */
  async handleAuth(ws, payload, sessionId) {
    const { token, userId } = payload;

    // Verify token (implementation depends on your auth system)
    const isValid = await this.verifyToken(token, userId);

    if (!isValid) {
      ws.send(JSON.stringify({
        type: 'auth_error',
        error: 'Invalid authentication token',
      }));
      ws.close();
      return;
    }

    // Register user connection
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }

    this.clients.get(userId).add(ws);
    ws.userId = userId;

    // Update user presence
    this.userPresence.set(userId, {
      status: 'online',
      lastSeen: new Date(),
    });

    // Send auth success
    ws.send(JSON.stringify({
      type: 'auth_success',
      userId,
      sessionId,
    }));

    // Notify presence change
    this.broadcastPresenceChange(userId, 'online');
  }

  /**
   * Handle subscription to template/room
   */
  async handleSubscribe(ws, payload, userId) {
    const { roomId, templateId } = payload;

    const room = roomId || `template:${templateId}`;

    // Add user to room
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    this.rooms.get(room).add(userId);

    // Store room info on connection
    if (!ws.rooms) {
      ws.rooms = new Set();
    }
    ws.rooms.add(room);

    ws.send(JSON.stringify({
      type: 'subscribed',
      room,
    }));

    // Notify room of new member
    this.broadcastToRoom(room, {
      type: 'user_joined',
      userId,
      room,
    }, userId);
  }

  /**
   * Handle unsubscription from room
   */
  async handleUnsubscribe(ws, payload, userId) {
    const { roomId } = payload;

    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
    }

    if (ws.rooms) {
      ws.rooms.delete(roomId);
    }

    ws.send(JSON.stringify({
      type: 'unsubscribed',
      room: roomId,
    }));

    // Notify room
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      userId,
      room: roomId,
    }, userId);
  }

  /**
   * Handle presence update
   */
  async handlePresenceUpdate(ws, payload, userId) {
    const { status } = payload;

    this.userPresence.set(userId, {
      status,
      lastSeen: new Date(),
    });

    this.broadcastPresenceChange(userId, status);
  }

  /**
   * Handle typing indicator
   */
  async handleTypingIndicator(payload, userId) {
    const { roomId, isTyping } = payload;

    this.broadcastToRoom(roomId, {
      type: 'typing',
      userId,
      isTyping,
    }, userId);
  }

  /**
   * Handle disconnection
   */
  handleDisconnection(userId, sessionId) {
    if (!userId) return;

    // Remove connection
    if (this.clients.has(userId)) {
      const connections = this.clients.get(userId);
      connections.forEach((conn) => {
        if (conn.sessionId === sessionId) {
          connections.delete(conn);
        }
      });

      if (connections.size === 0) {
        this.clients.delete(userId);

        // Update presence to offline
        this.userPresence.set(userId, {
          status: 'offline',
          lastSeen: new Date(),
        });

        this.broadcastPresenceChange(userId, 'offline');
      }
    }
  }

  /**
   * Broadcast template update
   */
  broadcastTemplateUpdate(templateId, updateData) {
    const room = `template:${templateId}`;

    this.broadcastToRoom(room, {
      type: 'template_update',
      templateId,
      update: updateData,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast new comment
   */
  broadcastNewComment(templateId, comment) {
    const room = `template:${templateId}`;

    this.broadcastToRoom(room, {
      type: 'new_comment',
      templateId,
      comment,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast rating update
   */
  broadcastRatingUpdate(templateId, rating) {
    const room = `template:${templateId}`;

    this.broadcastToRoom(room, {
      type: 'rating_update',
      templateId,
      rating,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast approval status change
   */
  broadcastApprovalStatusChange(templateId, status, userId) {
    // Notify template author
    this.sendToUser(userId, {
      type: 'approval_status',
      templateId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast presence change
   */
  broadcastPresenceChange(userId, status) {
    // Broadcast to all connected users (or to friends/followers)
    this.broadcast({
      type: 'presence_change',
      userId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId, message) {
    if (!this.clients.has(userId)) {
      return false;
    }

    const connections = this.clients.get(userId);
    const messageStr = JSON.stringify(message);

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });

    return true;
  }

  /**
   * Broadcast to all users in a room
   */
  broadcastToRoom(roomId, message, excludeUserId = null) {
    if (!this.rooms.has(roomId)) {
      return;
    }

    const userIds = this.rooms.get(roomId);
    const messageStr = JSON.stringify(message);

    userIds.forEach((userId) => {
      if (userId !== excludeUserId) {
        const connections = this.clients.get(userId);
        if (connections) {
          connections.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(messageStr);
            }
          });
        }
      }
    });
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(message, excludeUserId = null) {
    const messageStr = JSON.stringify(message);

    this.clients.forEach((connections, userId) => {
      if (userId !== excludeUserId) {
        connections.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
          }
        });
      }
    });
  }

  /**
   * Get online users
   */
  getOnlineUsers() {
    return Array.from(this.userPresence.entries())
      .filter(([_, presence]) => presence.status === 'online')
      .map(([userId, presence]) => ({ userId, ...presence }));
  }

  /**
   * Get users in room
   */
  getRoomUsers(roomId) {
    if (!this.rooms.has(roomId)) {
      return [];
    }

    return Array.from(this.rooms.get(roomId));
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.clients.has(userId);
  }

  /**
   * Get connection count
   */
  getConnectionCount() {
    let count = 0;
    this.clients.forEach((connections) => {
      count += connections.size;
    });
    return count;
  }

  /**
   * Helper: Verify authentication token (JWT)
   */
  async verifyToken(token, userId) {
    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET;

      if (!JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return false;
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/i, '');

      // Verify JWT token
      const decoded = jwt.verify(cleanToken, JWT_SECRET);

      // Check if the decoded userId matches (handle both userId and id fields)
      const tokenUserId = decoded.userId || decoded.id;

      if (!tokenUserId) {
        console.error('Token does not contain userId');
        return false;
      }

      // If userId is provided, verify it matches
      if (userId && tokenUserId !== userId) {
        console.error('Token userId mismatch');
        return false;
      }

      // Optional: Verify user still exists in database
      const user = await prisma.user.findUnique({
        where: { id: tokenUserId },
        select: { id: true, isActive: true }
      });

      if (!user) {
        console.error('User not found');
        return false;
      }

      if (user.isActive === false) {
        console.error('User is inactive');
        return false;
      }

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.error('Token expired:', error.message);
      } else if (error.name === 'JsonWebTokenError') {
        console.error('Invalid token:', error.message);
      } else {
        console.error('Error verifying token:', error);
      }
      return false;
    }
  }

  /**
   * Helper: Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

// Export event emitters for easy integration
const emitTemplateUpdate = (templateId, updateData) => {
  websocketService.broadcastTemplateUpdate(templateId, updateData);
};

const emitNewComment = (templateId, comment) => {
  websocketService.broadcastNewComment(templateId, comment);
};

const emitRatingUpdate = (templateId, rating) => {
  websocketService.broadcastRatingUpdate(templateId, rating);
};

const emitApprovalStatusChange = (templateId, status, userId) => {
  websocketService.broadcastApprovalStatusChange(templateId, status, userId);
};

const sendNotificationToUser = (userId, notification) => {
  websocketService.sendToUser(userId, {
    type: 'notification',
    notification,
    timestamp: new Date(),
  });
};

module.exports = {
  websocketService,
  emitTemplateUpdate,
  emitNewComment,
  emitRatingUpdate,
  emitApprovalStatusChange,
  sendNotificationToUser,
};
