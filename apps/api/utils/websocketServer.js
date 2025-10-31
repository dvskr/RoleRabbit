/**
 * WebSocket Server for Real-time Features
 * Handles real-time collaboration, notifications, and live updates
 */

const { Server } = require('@fastify/websocket');
const logger = require('./logger');

class WebSocketServer {
  constructor(server) {
    this.server = server;
    this.clients = new Map(); // userId -> Set of connections
    this.resumeRooms = new Map(); // resumeId -> Set of connections
  }

  /**
   * Register WebSocket plugin
   */
  register(server) {
    server.register(async function (fastify) {
      fastify.get('/ws', { websocket: true }, (connection, req) => {
        connection.socket.on('message', (message) => {
          this.handleMessage(connection, message);
        });

        connection.socket.on('close', () => {
          this.handleDisconnect(connection);
        });
      });
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(connection, message) {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'auth':
          this.handleAuth(connection, data);
          break;
        case 'join_resume':
          this.handleJoinResume(connection, data);
          break;
        case 'leave_resume':
          this.handleLeaveResume(connection, data);
          break;
        case 'resume_update':
          this.handleResumeUpdate(connection, data);
          break;
        case 'get_presence':
          this.handleGetPresence(connection, data);
          break;
        default:
          this.sendError(connection, 'Unknown message type');
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
      this.sendError(connection, error.message);
    }
  }

  /**
   * Handle authentication
   */
  handleAuth(connection, data) {
    if (!data.userId) {
      this.sendError(connection, 'User ID required');
      return;
    }

    connection.userId = data.userId;
    
    // Add to user's connections
    if (!this.clients.has(data.userId)) {
      this.clients.set(data.userId, new Set());
    }
    this.clients.get(data.userId).add(connection);

    this.send(connection, {
      type: 'auth_success',
      message: 'Authenticated successfully'
    });
  }

  /**
   * Handle joining resume room
   */
  handleJoinResume(connection, data) {
    if (!connection.userId) {
      this.sendError(connection, 'Authentication required');
      return;
    }

    const resumeId = data.resumeId;
    if (!resumeId) {
      this.sendError(connection, 'Resume ID required');
      return;
    }

    // Add to resume room
    if (!this.resumeRooms.has(resumeId)) {
      this.resumeRooms.set(resumeId, new Set());
    }
    this.resumeRooms.get(resumeId).add(connection);

    // Broadcast to others in the room
    this.broadcastToRoom(resumeId, connection, {
      type: 'user_joined',
      userId: connection.userId,
      resumeId
    });
  }

  /**
   * Handle leaving resume room
   */
  handleLeaveResume(connection, data) {
    const resumeId = data.resumeId;
    if (!resumeId || !this.resumeRooms.has(resumeId)) {
      return;
    }

    this.resumeRooms.get(resumeId).delete(connection);

    this.broadcastToRoom(resumeId, connection, {
      type: 'user_left',
      userId: connection.userId,
      resumeId
    });
  }

  /**
   * Handle resume updates
   */
  handleResumeUpdate(connection, data) {
    if (!connection.userId) {
      this.sendError(connection, 'Authentication required');
      return;
    }

    const resumeId = data.resumeId;
    if (!resumeId || !this.resumeRooms.has(resumeId)) {
      this.sendError(connection, 'Not in resume room');
      return;
    }

    // Broadcast update to all others in the room
    this.broadcastToRoom(resumeId, connection, {
      type: 'resume_updated',
      resumeId,
      changes: data.changes,
      userId: connection.userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle getting presence information
   */
  handleGetPresence(connection, data) {
    const resumeId = data.resumeId;
    if (!resumeId || !this.resumeRooms.has(resumeId)) {
      this.send(connection, {
        type: 'presence',
        resumeId,
        users: []
      });
      return;
    }

    const users = Array.from(this.resumeRooms.get(resumeId))
      .map(client => client.userId)
      .filter(id => id && id !== connection.userId);

    this.send(connection, {
      type: 'presence',
      resumeId,
      users
    });
  }

  /**
   * Handle disconnect
   */
  handleDisconnect(connection) {
    if (connection.userId) {
      // Remove from clients
      const userConnections = this.clients.get(connection.userId);
      if (userConnections) {
        userConnections.delete(connection);
        if (userConnections.size === 0) {
          this.clients.delete(connection.userId);
        }
      }

      // Remove from all resume rooms
      for (const [resumeId, connections] of this.resumeRooms.entries()) {
        if (connections.has(connection)) {
          connections.delete(connection);
          
          // Broadcast user left
          this.broadcastToRoom(resumeId, connection, {
            type: 'user_left',
            userId: connection.userId,
            resumeId
          });
        }
      }
    }
  }

  /**
   * Broadcast to all connections in a room except sender
   */
  broadcastToRoom(resumeId, sender, message) {
    const room = this.resumeRooms.get(resumeId);
    if (!room) return;

    room.forEach(connection => {
      if (connection !== sender && connection.socket.readyState === 1) {
        this.send(connection, message);
      }
    });
  }

  /**
   * Send message to a specific connection
   */
  send(connection, message) {
    if (connection.socket.readyState === 1) {
      connection.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Send error message
   */
  sendError(connection, errorMessage) {
    this.send(connection, {
      type: 'error',
      message: errorMessage
    });
  }

  /**
   * Broadcast notification to a specific user
   */
  notifyUser(userId, notification) {
    const connections = this.clients.get(userId);
    if (!connections) return;

    const message = {
      type: 'notification',
      ...notification
    };

    connections.forEach(connection => {
      this.send(connection, message);
    });
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalConnections: Array.from(this.clients.values()).reduce((sum, set) => sum + set.size, 0),
      uniqueUsers: this.clients.size,
      activeRooms: this.resumeRooms.size
    };
  }
}

module.exports = WebSocketServer;

