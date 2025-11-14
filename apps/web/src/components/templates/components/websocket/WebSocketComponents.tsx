/**
 * WebSocket Components
 * Real-time WebSocket integration components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  MessageSquare,
  Star,
  Download,
  Eye,
  Circle,
} from 'lucide-react';
import {
  useWebSocket,
  type WebSocketMessage,
  type ConnectionStatus,
} from '../../hooks/useWebSocket';

// ============================================================================
// WebSocket Context
// ============================================================================

interface WebSocketContextType {
  status: ConnectionStatus;
  isConnected: boolean;
  sendMessage: (message: Partial<WebSocketMessage>) => boolean;
  subscribe: (type: string, callback: (message: WebSocketMessage) => void) => () => void;
  notifications: WebSocketMessage[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

// ============================================================================
// WebSocket Provider Component
// ============================================================================

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, url }) => {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [subscribers, setSubscribers] = useState<Map<string, Set<Function>>>(new Map());

  const { status, isConnected, sendMessage: wsSendMessage, lastMessage } = useWebSocket({
    url,
    autoConnect: true,
    reconnectAttempts: 5,
  });

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    // Store notifications
    if (lastMessage.type === 'notification') {
      setNotifications((prev) => [lastMessage, ...prev].slice(0, 50)); // Keep last 50
    }

    // Notify subscribers
    const typeSubscribers = subscribers.get(lastMessage.type);
    if (typeSubscribers) {
      typeSubscribers.forEach((callback) => callback(lastMessage));
    }

    // Notify wildcard subscribers
    const wildcardSubscribers = subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach((callback) => callback(lastMessage));
    }
  }, [lastMessage, subscribers]);

  // Subscribe to messages
  const subscribe = useCallback(
    (type: string, callback: (message: WebSocketMessage) => void) => {
      setSubscribers((prev) => {
        const next = new Map(prev);
        const typeSubscribers = next.get(type) || new Set();
        typeSubscribers.add(callback);
        next.set(type, typeSubscribers);
        return next;
      });

      // Return unsubscribe function
      return () => {
        setSubscribers((prev) => {
          const next = new Map(prev);
          const typeSubscribers = next.get(type);
          if (typeSubscribers) {
            typeSubscribers.delete(callback);
            if (typeSubscribers.size === 0) {
              next.delete(type);
            }
          }
          return next;
        });
      };
    },
    []
  );

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setReadNotifications((prev) => new Set(prev).add(id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setReadNotifications(new Set());
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !readNotifications.has(n.id)).length;

  const value: WebSocketContextType = {
    status,
    isConnected,
    sendMessage: wsSendMessage,
    subscribe,
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

// ============================================================================
// Notification Badge Component
// ============================================================================

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  onClick,
  className = '',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, markAsRead, clearNotifications } = useWebSocketContext();

  const handleNotificationClick = (notification: WebSocketMessage) => {
    markAsRead(notification.id);
    // Handle notification action
    if (notification.payload?.url) {
      window.location.href = notification.payload.url;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={16} className="text-blue-600" />;
      case 'rating':
        return <Star size={16} className="text-yellow-600" />;
      case 'download':
        return <Download size={16} className="text-green-600" />;
      case 'like':
        return <Star size={16} className="text-red-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          onClick?.();
        }}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-600">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        !readNotifications.has(notification.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.payload?.title || 'Notification'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.payload?.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!readNotifications.has(notification.id) && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// Live Update Toast Component
// ============================================================================

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export const LiveUpdateToast: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    // Subscribe to all messages for live updates
    const unsubscribe = subscribe('*', (message) => {
      // Create toast for certain message types
      if (['comment', 'rating', 'like'].includes(message.type)) {
        const toast: Toast = {
          id: message.id,
          type: 'info',
          message: message.payload?.message || 'New update',
          duration: 5000,
        };

        setToasts((prev) => [...prev, toast]);

        // Auto-remove after duration
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <Check className="text-green-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  const getToastColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right ${getToastColor(
            toast.type
          )}`}
        >
          <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
          <p className="flex-1 text-sm text-gray-900">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Presence Indicator Component
// ============================================================================

interface PresenceIndicatorProps {
  userId?: string;
  showLabel?: boolean;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  userId,
  showLabel = false,
  className = '',
}) => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const { subscribe, isConnected } = useWebSocketContext();

  useEffect(() => {
    const unsubscribe = subscribe('presence', (message) => {
      if (userId && message.payload?.userId === userId) {
        setIsOnline(message.payload?.status === 'online');
      }

      if (message.payload?.activeUsers !== undefined) {
        setActiveUsers(message.payload.activeUsers);
      }
    });

    return unsubscribe;
  }, [subscribe, userId]);

  if (!userId && activeUsers === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Circle
          size={12}
          className={`${
            isConnected && (userId ? isOnline : activeUsers > 0)
              ? 'fill-green-500 text-green-500'
              : 'fill-gray-400 text-gray-400'
          }`}
        />
        {isConnected && (userId ? isOnline : activeUsers > 0) && (
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
        )}
      </div>

      {showLabel && (
        <span className="text-sm text-gray-700">
          {userId ? (isOnline ? 'Online' : 'Offline') : `${activeUsers} online`}
        </span>
      )}
    </div>
  );
};
