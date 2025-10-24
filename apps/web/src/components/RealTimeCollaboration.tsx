import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Wifi, WifiOff, Circle, Square } from 'lucide-react';
import { useResumeCollaboration } from '../services/webSocketService';
import { useWebSocket } from '../hooks/useWebSocket';

interface Collaborator {
  userId: string;
  username: string;
  cursor?: any;
  isTyping?: boolean;
  color?: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
}

interface CollaborationIndicatorProps {
  resumeId: string;
  userId: string;
  className?: string;
}

export const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({
  resumeId,
  userId,
  className = ''
}) => {
  const { collaborators, isTyping, setTyping } = useResumeCollaboration(resumeId, userId);
  const [showDetails, setShowDetails] = useState(false);

  const collaboratorColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316'  // orange
  ];

  const getCollaboratorColor = (userId: string) => {
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return collaboratorColors[index % collaboratorColors.length];
  };

  return (
    <div className={`relative ${className}`}>
      {/* Collaboration Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">
            {collaborators.length + 1} online
          </span>
        </div>
        
        {isTyping && (
          <div className="flex items-center gap-1 text-blue-600">
            <Circle className="w-2 h-2 animate-pulse" />
            <span className="text-xs">You're typing...</span>
          </div>
        )}
      </div>

      {/* Collaborator Avatars */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.userId}
              className="relative group"
              title={`${collaborator.username}${collaborator.isTyping ? ' (typing...)' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: getCollaboratorColor(collaborator.userId) }}
              >
                {collaborator.username.charAt(0).toUpperCase()}
              </div>
              
              {collaborator.isTyping && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              )}
              
              {/* Cursor indicator */}
              {collaborator.cursor && (
                <div
                  className="absolute w-0.5 h-6 bg-current opacity-75 animate-pulse"
                  style={{ 
                    left: collaborator.cursor.x, 
                    top: collaborator.cursor.y,
                    color: getCollaboratorColor(collaborator.userId)
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {/* Detailed View */}
      {showDetails && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
          <h4 className="font-medium text-gray-900 mb-2">Active Collaborators</h4>
          <div className="space-y-2">
            {/* Current user */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: getCollaboratorColor(userId) }}
              >
                You
              </div>
              <span className="text-sm text-gray-700">You</span>
              {isTyping && (
                <span className="text-xs text-blue-600">(typing...)</span>
              )}
            </div>
            
            {/* Other collaborators */}
            {collaborators.map((collaborator) => (
              <div key={collaborator.userId} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: getCollaboratorColor(collaborator.userId) }}
                >
                  {collaborator.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{collaborator.username}</span>
                {collaborator.isTyping && (
                  <span className="text-xs text-blue-600">(typing...)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Real-time typing indicator
interface TypingIndicatorProps {
  resumeId: string;
  userId: string;
  onTypingChange?: (isTyping: boolean) => void;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  resumeId,
  userId,
  onTypingChange
}) => {
  const { collaborators, setTyping } = useResumeCollaboration(resumeId, userId);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping);
    onTypingChange?.(isTyping);
  }, [setTyping, onTypingChange]);

  const typingCollaborators = collaborators.filter(c => c.isTyping);

  return (
    <div className="typing-indicator">
      {typingCollaborators.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            {typingCollaborators.map((collaborator, index) => (
              <span key={collaborator.userId}>
                {collaborator.username}
                {index < typingCollaborators.length - 1 && ', '}
              </span>
            ))}
          </div>
          <span>
            {typingCollaborators.length === 1 ? 'is' : 'are'} typing...
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Connection status indicator
interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected, connectionState, reconnect } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'connecting': return <Circle className="w-4 h-4 animate-spin" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {connectionState === 'disconnected' && (
        <button
          onClick={reconnect}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

// Real-time cursor component
interface RealTimeCursorProps {
  resumeId: string;
  userId: string;
  containerRef: React.RefObject<HTMLElement>;
}

export const RealTimeCursor: React.FC<RealTimeCursorProps> = ({
  resumeId,
  userId,
  containerRef
}) => {
  const { collaborators, sendCursorPosition } = useResumeCollaboration(resumeId, userId);
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      sendCursorPosition(position);
    };

    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [containerRef, sendCursorPosition]);

  const getCollaboratorColor = (userId: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <>
      {collaborators.map((collaborator) => {
        if (!collaborator.cursor) return null;

        return (
          <div
            key={collaborator.userId}
            ref={(el) => {
              if (el) cursorRefs.current.set(collaborator.userId, el);
            }}
            className="absolute pointer-events-none z-50"
            style={{
              left: collaborator.cursor.x,
              top: collaborator.cursor.y,
              color: getCollaboratorColor(collaborator.userId)
            }}
          >
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-medium bg-current text-white px-1 py-0.5 rounded">
                {collaborator.username}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

// Real-time selection component
interface RealTimeSelectionProps {
  resumeId: string;
  userId: string;
  containerRef: React.RefObject<HTMLElement>;
}

export const RealTimeSelection: React.FC<RealTimeSelectionProps> = ({
  resumeId,
  userId,
  containerRef
}) => {
  const { collaborators, sendSelection } = useResumeCollaboration(resumeId, userId);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const selectionData = {
          start: {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
          },
          end: {
            x: rect.right - containerRect.left,
            y: rect.bottom - containerRect.top
          },
          width: rect.width,
          height: rect.height
        };
        
        sendSelection(selectionData);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef, sendSelection]);

  const getCollaboratorColor = (userId: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <>
      {collaborators.map((collaborator) => {
        if (!collaborator.selection) return null;

        return (
          <div
            key={`selection-${collaborator.userId}`}
            className="absolute pointer-events-none z-40 opacity-30"
            style={{
              left: collaborator.selection.start.x,
              top: collaborator.selection.start.y,
              width: collaborator.selection.width,
              height: collaborator.selection.height,
              backgroundColor: getCollaboratorColor(collaborator.userId)
            }}
          />
        );
      })}
    </>
  );
};

