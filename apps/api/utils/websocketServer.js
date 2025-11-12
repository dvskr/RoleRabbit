/**
 * WebSocket Server for Real-time Features
 * Handles real-time collaboration, notifications, and live updates
 */

const logger = require('./logger');

class WebSocketServer {
  constructor(server) {
    this.server = server;
    this.clients = new Map(); // userId -> Set of connections
  }

  /**
   * Register WebSocket plugin
   */
  register(server) {
    server.register(async function (fastify) {
      fastify.get('/ws', { websocket: true }, (connection) => {
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

    }
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
      uniqueUsers: this.clients.size
    };
  }
}

module.exports = WebSocketServer;

