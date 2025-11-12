import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketEventHandlers {
  onTaskProgress?: (data: TaskProgressData) => void;
  onTaskCompleted?: (data: TaskCompletedData) => void;
  onTaskFailed?: (data: TaskFailedData) => void;
  onTaskStarted?: (data: TaskStartedData) => void;
  onTaskCancelled?: (data: TaskCancelledData) => void;
  onBatchProgress?: (data: BatchProgressData) => void;
}

interface TaskProgressData {
  taskId: string;
  progress: number;
  currentStep: string;
  timestamp: string;
}

interface TaskCompletedData {
  taskId: string;
  result: any;
  timestamp: string;
}

interface TaskFailedData {
  taskId: string;
  error: string;
  timestamp: string;
}

interface TaskStartedData {
  taskId: string;
  taskType: string;
  timestamp: string;
}

interface TaskCancelledData {
  taskId: string;
  timestamp: string;
}

interface BatchProgressData {
  batchId: string;
  completed: number;
  total: number;
  currentTask: string;
  percentage: number;
  timestamp: string;
}

export function useWebSocket(userId: string | null, handlers: WebSocketEventHandlers) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      auth: {
        userId,
      },
      withCredentials: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      // Authenticate with userId
      socket.emit('authenticate', { userId });
    });

    socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // AI Agent task events
    socket.on('ai_agent:task_progress', (data: TaskProgressData) => {
      console.log('Task progress:', data);
      handlersRef.current.onTaskProgress?.(data);
    });

    socket.on('ai_agent:task_completed', (data: TaskCompletedData) => {
      console.log('Task completed:', data);
      handlersRef.current.onTaskCompleted?.(data);
    });

    socket.on('ai_agent:task_failed', (data: TaskFailedData) => {
      console.log('Task failed:', data);
      handlersRef.current.onTaskFailed?.(data);
    });

    socket.on('ai_agent:task_started', (data: TaskStartedData) => {
      console.log('Task started:', data);
      handlersRef.current.onTaskStarted?.(data);
    });

    socket.on('ai_agent:task_cancelled', (data: TaskCancelledData) => {
      console.log('Task cancelled:', data);
      handlersRef.current.onTaskCancelled?.(data);
    });

    socket.on('ai_agent:batch_progress', (data: BatchProgressData) => {
      console.log('Batch progress:', data);
      handlersRef.current.onBatchProgress?.(data);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return {
    socket: socketRef.current,
  };
}
