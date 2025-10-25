'use client';

import React from 'react';
import { Plus, Mail, FileText, Search, ArrowRight, Zap } from 'lucide-react';
import { QuickAction } from '../../types/dashboard';

interface QuickActionsPanelProps {
  actions: QuickAction[];
  onQuickAction: (actionId: string) => void;
  isLoading: boolean;
}

export function QuickActionsPanel({
  actions,
  onQuickAction,
  isLoading
}: QuickActionsPanelProps) {
  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Plus':
        return <Plus size={20} />;
      case 'Mail':
        return <Mail size={20} />;
      case 'FileText':
        return <FileText size={20} />;
      case 'Search':
        return <Search size={20} />;
      default:
        return <ArrowRight size={20} />;
    }
  };

  const getCategoryColor = (category: QuickAction['category']) => {
    switch (category) {
      case 'application':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'communication':
        return 'bg-green-500 hover:bg-green-600';
      case 'preparation':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'research':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getCategoryIcon = (category: QuickAction['category']) => {
    switch (category) {
      case 'application':
        return <Plus size={14} className="text-blue-600" />;
      case 'communication':
        return <Mail size={14} className="text-green-600" />;
      case 'preparation':
        return <FileText size={14} className="text-purple-600" />;
      case 'research':
        return <Search size={14} className="text-orange-600" />;
      default:
        return <ArrowRight size={14} className="text-gray-600" />;
    }
  };

  const enabledActions = (actions || []).filter(action => action.isEnabled);

  // Calculate dynamic height to fill available space
  const getDynamicHeight = () => {
    if (typeof window !== 'undefined') {
      const baseHeight = 80; // Header height
      const itemHeight = 50; // Item height
      const availableHeight = window.innerHeight * 0.6; // Use 60% of viewport height
      const calculatedHeight = baseHeight + (enabledActions.length * itemHeight);
      return Math.max(calculatedHeight, availableHeight); // Fill minimum space
    }
    return 600;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ height: `${getDynamicHeight()}px` }}>
      {/* Header - Ultra Compact */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center gap-1 mb-1">
          <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          <Zap size={12} className="text-yellow-500" />
        </div>
        <p className="text-xs text-gray-600">One-click access to common tasks</p>
      </div>

      {/* Actions Grid - Ultra Compact */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : enabledActions.length === 0 ? (
          <div className="text-center text-gray-500 py-3">
            <ArrowRight size={16} className="mx-auto mb-1 text-gray-400" />
            <p className="text-xs">No actions available</p>
          </div>
        ) : (
          <div className="space-y-1">
            {enabledActions.map(action => (
              <button
                key={action.id}
                onClick={() => onQuickAction(action.id)}
                disabled={!action.isEnabled}
                className={`w-full p-1.5 rounded border border-gray-200 hover:shadow-sm transition-all duration-200 text-left group ${
                  !action.isEnabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${getCategoryColor(action.category)} text-white`}>
                    {getActionIcon(action.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-900 mb-0.5 line-clamp-1">
                      {action.label}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {action.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 text-xs text-gray-500">
                    {getCategoryIcon(action.category)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
