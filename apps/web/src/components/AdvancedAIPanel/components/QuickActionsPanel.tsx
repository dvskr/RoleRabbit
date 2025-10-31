import React from 'react';
import { QuickAction } from '../types';

interface QuickActionsPanelProps {
  actions: QuickAction[];
  isStreaming?: boolean;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  actions,
  isStreaming = false
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={action.disabled || isStreaming}
              className="flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={action.description}
            >
              <Icon className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">{action.label}</div>
                <div className="text-xs text-gray-600">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

