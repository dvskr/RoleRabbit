/**
 * Empty State Component
 * Section 1.7: Reusable empty state UI for various scenarios
 */

'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

/**
 * Reusable empty state component
 * Shows icon, title, description, and optional action buttons
 */
export function EmptyState({
  icon: Icon,
  iconColor = 'text-gray-400',
  iconBgColor = 'bg-gray-100',
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      {/* Icon */}
      {Icon && (
        <div className={`p-4 ${iconBgColor} rounded-full mb-4`}>
          <Icon className={iconColor} size={48} />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                action.variant === 'secondary'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
              }`}
            >
              {action.icon && <action.icon size={20} />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                secondaryAction.variant === 'primary'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {secondaryAction.icon && <secondaryAction.icon size={20} />}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
