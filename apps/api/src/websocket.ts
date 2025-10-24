// WebSocket server integration for Node.js backend
// This would be added to apps/api/src/server.ts

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface SocketData {
  userId: string;
  username: string;
  resumeId?: string;
}

interface ResumeRoom {
  resumeId: string;
  collaborators: Map<string, SocketData>;
  cursors: Map<string, any>;
  selections: Map<string, any>;
}

class WebSocketManager {
  private io: SocketIOServer;
  private resumeRooms: Map<string, ResumeRoom> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Resume collaboration events
      socket.on('join_resume_room', (data: { resumeId: string; userId: string }) => {
        this.joinResumeRoom(socket, data.resumeId, data.userId);
      });

      socket.on('leave_resume_room', (data: { resumeId: string; userId: string }) => {
        this.leaveResumeRoom(socket, data.resumeId, data.userId);
      });

      socket.on('resume_update', (data: { resumeId: string; changes: any; userId: string }) => {
        this.handleResumeUpdate(socket, data);
      });

      socket.on('resume_cursor', (data: { resumeId: string; position: any; userId: string }) => {
        this.handleCursorUpdate(socket, data);
      });

      socket.on('resume_selection', (data: { resumeId: string; selection: any; userId: string }) => {
        this.handleSelectionUpdate(socket, data);
      });

      // User presence events
      socket.on('join_user_room', (data: { userId: string }) => {
        this.joinUserRoom(socket, data.userId);
      });

      socket.on('leave_user_room', (data: { userId: string }) => {
        this.leaveUserRoom(socket, data.userId);
      });

      socket.on('user_typing', (data: { isTyping: boolean; userId: string; username: string }) => {
        this.handleUserTyping(socket, data);
      });

      // AI streaming events
      socket.on('ai_request', (data: { requestId: string; prompt: string; userId: string }) => {
        this.handleAIRequest(socket, data);
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private joinResumeRoom(socket: any, resumeId: string, userId: string) {
    socket.join(`resume:${resumeId}`);
    
    if (!this.resumeRooms.has(resumeId)) {
      this.resumeRooms.set(resumeId, {
        resumeId,
        collaborators: new Map(),
        cursors: new Map(),
        selections: new Map()
      });
    }

    const room = this.resumeRooms.get(resumeId)!;
    const userData: SocketData = {
      userId,
      username: `User ${userId.slice(-4)}`, // Replace with actual username
      resumeId
    };

    room.collaborators.set(userId, userData);
    socket.data = userData;

    // Notify other collaborators
    socket.to(`resume:${resumeId}`).emit('user_joined', {
      userId,
      username: userData.username
    });

    // Send current collaborators to the new user
    const collaborators = Array.from(room.collaborators.values())
      .filter(c => c.userId !== userId);
    
    socket.emit('collaborators_list', collaborators);

    console.log(`User ${userId} joined resume room ${resumeId}`);
  }

  private leaveResumeRoom(socket: any, resumeId: string, userId: string) {
    socket.leave(`resume:${resumeId}`);
    
    const room = this.resumeRooms.get(resumeId);
    if (room) {
      room.collaborators.delete(userId);
      room.cursors.delete(userId);
      room.selections.delete(userId);

      // Clean up empty rooms
      if (room.collaborators.size === 0) {
        this.resumeRooms.delete(resumeId);
      }
    }

    // Notify other collaborators
    socket.to(`resume:${resumeId}`).emit('user_left', { userId });

    console.log(`User ${userId} left resume room ${resumeId}`);
  }

  private handleResumeUpdate(socket: any, data: { resumeId: string; changes: any; userId: string }) {
    // Broadcast changes to other collaborators
    socket.to(`resume:${data.resumeId}`).emit('resume_updated', {
      resumeId: data.resumeId,
      changes: data.changes,
      userId: data.userId
    });

    // In production, you would also save changes to database
    console.log(`Resume ${data.resumeId} updated by ${data.userId}`);
  }

  private handleCursorUpdate(socket: any, data: { resumeId: string; position: any; userId: string }) {
    const room = this.resumeRooms.get(data.resumeId);
    if (room) {
      room.cursors.set(data.userId, data.position);
    }

    // Broadcast cursor position to other collaborators
    socket.to(`resume:${data.resumeId}`).emit('resume_cursor', {
      resumeId: data.resumeId,
      userId: data.userId,
      position: data.position
    });
  }

  private handleSelectionUpdate(socket: any, data: { resumeId: string; selection: any; userId: string }) {
    const room = this.resumeRooms.get(data.resumeId);
    if (room) {
      room.selections.set(data.userId, data.selection);
    }

    // Broadcast selection to other collaborators
    socket.to(`resume:${data.resumeId}`).emit('resume_selection', {
      resumeId: data.resumeId,
      userId: data.userId,
      selection: data.selection
    });
  }

  private joinUserRoom(socket: any, userId: string) {
    socket.join(`user:${userId}`);
    
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    
    this.userRooms.get(userId)!.add(socket.id);
    console.log(`User ${userId} joined user room`);
  }

  private leaveUserRoom(socket: any, userId: string) {
    socket.leave(`user:${userId}`);
    
    const userRoom = this.userRooms.get(userId);
    if (userRoom) {
      userRoom.delete(socket.id);
      
      if (userRoom.size === 0) {
        this.userRooms.delete(userId);
      }
    }
    
    console.log(`User ${userId} left user room`);
  }

  private handleUserTyping(socket: any, data: { isTyping: boolean; userId: string; username: string }) {
    // Broadcast typing status to relevant rooms
    const userData = socket.data;
    if (userData && userData.resumeId) {
      socket.to(`resume:${userData.resumeId}`).emit('user_typing', {
        userId: data.userId,
        username: data.username,
        isTyping: data.isTyping
      });
    }
  }

  private async handleAIRequest(socket: any, data: { requestId: string; prompt: string; userId: string }) {
    try {
      // Notify that AI response is starting
      socket.emit('ai_response_start', {
        requestId: data.requestId,
        userId: data.userId
      });

      // In production, integrate with actual AI service
      const mockResponse = `AI Response to: "${data.prompt}"\n\nThis is a mock response. In production, this would be streamed from an AI service like OpenAI.`;

      // Simulate streaming response
      const words = mockResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        
        socket.emit('ai_response_chunk', {
          requestId: data.requestId,
          chunk: words[i] + ' ',
          userId: data.userId
        });
      }

      // Notify that AI response is complete
      socket.emit('ai_response_end', {
        requestId: data.requestId,
        userId: data.userId
      });

    } catch (error) {
      console.error('AI request error:', error);
      socket.emit('ai_error', {
        requestId: data.requestId,
        error: 'Failed to process AI request',
        userId: data.userId
      });
    }
  }

  private handleDisconnect(socket: any) {
    const userData = socket.data;
    if (userData) {
      // Leave all resume rooms
      if (userData.resumeId) {
        this.leaveResumeRoom(socket, userData.resumeId, userData.userId);
      }
      
      // Leave user room
      this.leaveUserRoom(socket, userData.userId);
    }

    console.log('User disconnected:', socket.id);
  }

  // Public methods for external use
  public sendNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  public broadcastToResume(resumeId: string, event: string, data: any) {
    this.io.to(`resume:${resumeId}`).emit(event, data);
  }

  public getRoomStats() {
    return {
      totalRooms: this.resumeRooms.size,
      totalUsers: this.userRooms.size,
      resumeRooms: Array.from(this.resumeRooms.keys()),
      activeUsers: Array.from(this.userRooms.keys())
    };
  }
}

// Export for use in server.ts
export default WebSocketManager;

// Usage in server.ts:
/*
import WebSocketManager from './websocket';

const httpServer = http.createServer(app);
const wsManager = new WebSocketManager(httpServer);

// Add to your existing server setup
httpServer.listen(3001, () => {
  console.log('Server running on port 3001');
});
*/
