/**
 * BulkSelectionBar Component
 * Shows selected templates count and available bulk actions
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  FolderOpen,
  Star,
  ChevronDown,
} from 'lucide-react';
import type { BulkOperation } from '../../hooks/useTemplateBulkOps';

interface BulkSelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkOperation: (operation: BulkOperation) => void;
  className?: string;
  // Optional: Limit available operations based on context
  availableOperations?: BulkOperation[];
}

export const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkOperation,
  className = '',
  availableOperations,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Default available operations
  const defaultOperations: BulkOperation[] = [
    'approve',
    'reject',
    'delete',
    'make_public',
    'make_private',
    'add_tags',
    'remove_tags',
    'change_category',
    'feature',
    'unfeature',
  ];

  const operations = availableOperations || defaultOperations;

  // Operation metadata
  const operationMeta: Record<
    BulkOperation,
    {
      label: string;
      icon: React.ReactNode;
      color: string;
      description: string;
    }
  > = {
    approve: {
      label: 'Approve',
      icon: <CheckCircle size={16} />,
      color: 'text-green-600',
      description: 'Approve selected templates',
    },
    reject: {
      label: 'Reject',
      icon: <XCircle size={16} />,
      color: 'text-red-600',
      description: 'Reject selected templates',
    },
    delete: {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      color: 'text-red-600',
      description: 'Permanently delete selected templates',
    },
    make_public: {
      label: 'Make Public',
      icon: <Eye size={16} />,
      color: 'text-blue-600',
      description: 'Make selected templates public',
    },
    make_private: {
      label: 'Make Private',
      icon: <EyeOff size={16} />,
      color: 'text-gray-600',
      description: 'Make selected templates private',
    },
    add_tags: {
      label: 'Add Tags',
      icon: <Tag size={16} />,
      color: 'text-purple-600',
      description: 'Add tags to selected templates',
    },
    remove_tags: {
      label: 'Remove Tags',
      icon: <Tag size={16} />,
      color: 'text-gray-600',
      description: 'Remove tags from selected templates',
    },
    change_category: {
      label: 'Change Category',
      icon: <FolderOpen size={16} />,
      color: 'text-orange-600',
      description: 'Change category of selected templates',
    },
    feature: {
      label: 'Feature',
      icon: <Star size={16} />,
      color: 'text-yellow-600',
      description: 'Feature selected templates',
    },
    unfeature: {
      label: 'Unfeature',
      icon: <Star size={16} />,
      color: 'text-gray-600',
      description: 'Remove featured status',
    },
  };

  // Handle operation click
  const handleOperationClick = (operation: BulkOperation) => {
    setShowActionsMenu(false);
    onBulkOperation(operation);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* Fixed Bottom Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-lg z-40 transition-transform ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Selection Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {selectedCount}
                </div>
                <span className="text-gray-900 font-medium">
                  {selectedCount} {selectedCount === 1 ? 'template' : 'templates'} selected
                </span>
              </div>

              <button
                onClick={onClearSelection}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                <X size={16} />
                Clear selection
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                {operations.includes('approve') && (
                  <button
                    onClick={() => handleOperationClick('approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                )}

                {operations.includes('reject') && (
                  <button
                    onClick={() => handleOperationClick('reject')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                )}

                {operations.includes('delete') && (
                  <button
                    onClick={() => handleOperationClick('delete')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  More Actions
                  <ChevronDown size={16} />
                </button>

                {showActionsMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActionsMenu(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto">
                      {operations.map((operation) => {
                        const meta = operationMeta[operation];
                        return (
                          <button
                            key={operation}
                            onClick={() => handleOperationClick(operation)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors"
                          >
                            <div className={`flex-shrink-0 mt-0.5 ${meta.color}`}>
                              {meta.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${meta.color}`}>{meta.label}</div>
                              <div className="text-xs text-gray-600 mt-0.5">
                                {meta.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed bar */}
      <div className="h-20" />
    </>
  );
};

export default BulkSelectionBar;
