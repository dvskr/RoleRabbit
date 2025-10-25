'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Clock, X, Bell, Zap } from 'lucide-react';
import { DashboardAlert } from '../../types/dashboard';

interface IntelligentAlertsProps {
  alerts: DashboardAlert[];
  onDismissAlert: (alertId: string) => void;
  isLoading: boolean;
}

export function IntelligentAlerts({
  alerts,
  onDismissAlert,
  isLoading
}: IntelligentAlertsProps) {
  const getAlertIcon = (type: DashboardAlert['type']) => {
    switch (type) {
      case 'follow_up':
        return <Clock size={16} className="text-orange-600" />;
      case 'interview':
        return <CheckCircle size={16} className="text-blue-600" />;
      case 'deadline':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'suggestion':
        return <Zap size={16} className="text-purple-600" />;
      case 'achievement':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: DashboardAlert['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const urgentAlerts = alerts.filter(alert => alert.priority === 'urgent');

  // Calculate dynamic height based on content
  const getDynamicHeight = () => {
    if (typeof window !== 'undefined') {
      const baseHeight = 120; // Header height
      const itemHeight = 80; // Approximate height per alert item
      const maxHeight = window.innerHeight * 0.4; // Max 40% of viewport height
      const calculatedHeight = baseHeight + (alerts.length * itemHeight);
      return Math.min(calculatedHeight, maxHeight);
    }
    return 600;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ height: `${getDynamicHeight()}px` }}>
      {/* Header - Compact */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-900">Intelligent Alerts</h3>
          {unreadAlerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadAlerts.length}
            </span>
          )}
        </div>
        
        {urgentAlerts.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            <AlertCircle size={12} />
            <span>{urgentAlerts.length} urgent alert{urgentAlerts.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Alerts List - Dynamic Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-3 text-center text-gray-500">
            <Bell size={20} className="mx-auto mb-1 text-gray-400" />
            <p className="text-xs">No alerts</p>
            <p className="text-xs mt-0.5">You're all caught up!</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-2 rounded border-l-3 ${getPriorityColor(alert.priority)} hover:shadow-sm transition-shadow ${
                  !alert.isRead ? 'ring-1 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-xs font-medium line-clamp-1 ${
                        !alert.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {alert.title}
                      </h4>
                      
                      <div className="flex items-center gap-1 ml-1">
                        {alert.dismissible && (
                          <button
                            onClick={() => onDismissAlert(alert.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Dismiss"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-xs text-gray-600 mt-0.5 line-clamp-1 ${
                      !alert.isRead ? 'font-medium' : ''
                    }`}>
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        alert.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : alert.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : alert.priority === 'medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
