import { io, Socket } from 'socket.io-client';
import { useCallback, useEffect, useRef, useState } from 'react';

// WebSocket event types
export interface WebSocketEvents {
  // Connection events
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // User events
  user_joined: (data: { userId: string; username: string }) => void;
  user_left: (data: { userId: string }) => void;
  user_typing: (data: { userId: string; username: string; isTyping: boolean }) => void;
  
  // Resume collaboration events
  resume_updated: (data: { resumeId: string; changes: any; userId: string }) => void;
  resume_cursor: (data: { resumeId: string; userId: string; position: any }) => void;
  resume_selection: (data: { resumeId: string; userId: string; selection: any }) => void;
  
  // AI events
  ai_response_start: (data: { requestId: string; userId: string }) => void;
  ai_response_chunk: (data: { requestId: string; chunk: string; userId: string }) => void;
  ai_response_end: (data: { requestId: string; userId: string }) => void;
  
  // Notification events
  notification: (data: { type: string; message: string; userId: string }) => void;
  
  // Error events
  error: (data: { message: string; code?: string }) => void;
}

// WebSocket service class
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.emitToListeners('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.emitToListeners('disconnect');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.emitToListeners('reconnect');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.emitToListeners('error', { message: 'Failed to reconnect to server', code: 'RECONNECT_FAILED' });
    });

    // Forward all other events
    Object.keys(this.getEventTypes()).forEach(eventType => {
      this.socket?.on(eventType, (data) => {
        this.emitToListeners(eventType, data);
      });
    });
  }

  private getEventTypes(): WebSocketEvents {
    return {
      connect: () => {},
      disconnect: () => {},
      reconnect: () => {},
      user_joined: () => {},
      user_left: () => {},
      user_typing: () => {},
      resume_updated: () => {},
      resume_cursor: () => {},
      resume_selection: () => {},
      ai_response_start: () => {},
      ai_response_chunk: () => {},
      ai_response_end: () => {},
      notification: () => {},
      error: () => {}
    };
  }

  private emitToListeners(eventType: string, data?: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  public on<K extends keyof WebSocketEvents>(eventType: K, listener: WebSocketEvents[K]) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);

    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  public emit(eventType: string, data?: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventType, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', eventType);
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getConnectionState(): 'connecting' | 'connected' | 'disconnected' {
    if (this.isConnecting) return 'connecting';
    if (this.socket?.connected) return 'connected';
    return 'disconnected';
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public reconnect() {
    this.disconnect();
    this.connect();
  }

  // Resume collaboration methods
  public joinResumeRoom(resumeId: string, userId: string) {
    this.emit('join_resume_room', { resumeId, userId });
  }

  public leaveResumeRoom(resumeId: string, userId: string) {
    this.emit('leave_resume_room', { resumeId, userId });
  }

  public updateResume(resumeId: string, changes: any, userId: string) {
    this.emit('resume_update', { resumeId, changes, userId });
  }

  public sendCursorPosition(resumeId: string, position: any, userId: string) {
    this.emit('resume_cursor', { resumeId, position, userId });
  }

  public sendSelection(resumeId: string, selection: any, userId: string) {
    this.emit('resume_selection', { resumeId, selection, userId });
  }

  // AI streaming methods
  public requestAIResponse(requestId: string, prompt: string, userId: string) {
    this.emit('ai_request', { requestId, prompt, userId });
  }

  // User presence methods
  public setUserTyping(isTyping: boolean, userId: string, username: string) {
    this.emit('user_typing', { isTyping, userId, username });
  }

  public joinUserRoom(userId: string) {
    this.emit('join_user_room', { userId });
  }

  public leaveUserRoom(userId: string) {
    this.emit('leave_user_room', { userId });
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// React hook for WebSocket
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected());
  const [connectionState, setConnectionState] = useState(webSocketService.getConnectionState());

  useEffect(() => {
    const unsubscribeConnect = webSocketService.on('connect', () => {
      setIsConnected(true);
      setConnectionState('connected');
    });

    const unsubscribeDisconnect = webSocketService.on('disconnect', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    const unsubscribeReconnect = webSocketService.on('reconnect', () => {
      setIsConnected(true);
      setConnectionState('connected');
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeReconnect();
    };
  }, []);

  return {
    isConnected,
    connectionState,
    socket: webSocketService,
    emit: webSocketService.emit.bind(webSocketService),
    on: webSocketService.on.bind(webSocketService),
    reconnect: webSocketService.reconnect.bind(webSocketService)
  };
};

// Hook for resume collaboration
export const useResumeCollaboration = (resumeId: string, userId: string) => {
  const { socket, isConnected } = useWebSocket();
  const [collaborators, setCollaborators] = useState<Array<{ userId: string; username: string; cursor?: any }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isConnected || !resumeId || !userId) return;

    // Join resume room
    socket.joinResumeRoom(resumeId, userId);

    // Set up event listeners
    const unsubscribeUserJoined = socket.on('user_joined', (data) => {
      if (data.userId !== userId) {
        setCollaborators(prev => [...prev.filter(c => c.userId !== data.userId), {
          userId: data.userId,
          username: data.username
        }]);
      }
    });

    const unsubscribeUserLeft = socket.on('user_left', (data) => {
      setCollaborators(prev => prev.filter(c => c.userId !== data.userId));
    });

    const unsubscribeResumeUpdated = socket.on('resume_updated', (data) => {
      if (data.userId !== userId) {
        // Handle resume updates from other users
        console.log('Resume updated by', data.userId, ':', data.changes);
      }
    });

    const unsubscribeResumeCursor = socket.on('resume_cursor', (data) => {
      if (data.userId !== userId) {
        setCollaborators(prev => prev.map(c => 
          c.userId === data.userId 
            ? { ...c, cursor: data.position }
            : c
        ));
      }
    });

    const unsubscribeUserTyping = socket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        setCollaborators(prev => prev.map(c => 
          c.userId === data.userId 
            ? { ...c, isTyping: data.isTyping }
            : c
        ));
      }
    });

    return () => {
      socket.leaveResumeRoom(resumeId, userId);
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribeResumeUpdated();
      unsubscribeResumeCursor();
      unsubscribeUserTyping();
    };
  }, [isConnected, resumeId, userId, socket]);

  const updateResume = useCallback((changes: any) => {
    if (isConnected) {
      socket.updateResume(resumeId, changes, userId);
    }
  }, [isConnected, resumeId, userId, socket]);

  const sendCursorPosition = useCallback((position: any) => {
    if (isConnected) {
      socket.sendCursorPosition(resumeId, position, userId);
    }
  }, [isConnected, resumeId, userId, socket]);

  const sendSelection = useCallback((selection: any) => {
    if (isConnected) {
      socket.sendSelection(resumeId, selection, userId);
    }
  }, [isConnected, resumeId, userId, socket]);

  const setTyping = useCallback((typing: boolean) => {
    if (isConnected) {
      setIsTyping(typing);
      socket.setUserTyping(typing, userId, 'User'); // Replace with actual username
      
      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.setUserTyping(false, userId, 'User');
        }, 3000);
      }
    }
  }, [isConnected, userId, socket]);

  return {
    collaborators,
    isTyping,
    updateResume,
    sendCursorPosition,
    sendSelection,
    setTyping
  };
};

// Hook for AI streaming
export const useAIStreaming = () => {
  const { socket, isConnected } = useWebSocket();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeStart = socket.on('ai_response_start', (data) => {
      setIsStreaming(true);
      setStreamingResponse('');
      setCurrentRequestId(data.requestId);
    });

    const unsubscribeChunk = socket.on('ai_response_chunk', (data) => {
      if (data.requestId === currentRequestId) {
        setStreamingResponse(prev => prev + data.chunk);
      }
    });

    const unsubscribeEnd = socket.on('ai_response_end', (data) => {
      if (data.requestId === currentRequestId) {
        setIsStreaming(false);
        setCurrentRequestId(null);
      }
    });

    return () => {
      unsubscribeStart();
      unsubscribeChunk();
      unsubscribeEnd();
    };
  }, [isConnected, socket, currentRequestId]);

  const requestAIResponse = useCallback((prompt: string, userId: string) => {
    if (isConnected) {
      const requestId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      socket.requestAIResponse(requestId, prompt, userId);
      return requestId;
    }
    return null;
  }, [isConnected, socket]);

  return {
    isStreaming,
    streamingResponse,
    requestAIResponse
  };
};

export default webSocketService;
