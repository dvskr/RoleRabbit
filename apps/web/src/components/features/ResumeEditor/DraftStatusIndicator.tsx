'use client';

import React, { useEffect, useState } from 'react';
import { logger } from '../../../utils/logger';

interface DraftStatusIndicatorProps {
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  hasDraft: boolean;
  isOnline?: boolean;
  // 🎯 REMOVED: onCommitDraft and onDiscardDraft - now in header
}

export const DraftStatusIndicator: React.FC<DraftStatusIndicatorProps> = ({
  isSaving,
  lastSavedAt,
  saveError,
  hasDraft,
  isOnline = true,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');
  // 🎯 REMOVED: showDiscardConfirm state - no longer needed

  // Update time ago every second
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSavedAt) {
        setTimeAgo('');
        return;
      }

      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSavedAt.getTime()) / 1000);

      if (diff < 10) {
        setTimeAgo('just now');
      } else if (diff < 60) {
        setTimeAgo(`${diff} seconds ago`);
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastSavedAt]);

  // 🎯 REMOVED: All button handlers - buttons are now in the header

  // Determine status icon and message
  const getStatusDisplay = () => {
    if (saveError) {
      return {
        icon: '⚠️',
        message: saveError,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }

    if (!isOnline) {
      return {
        icon: '🔌',
        message: 'Offline - changes will save when reconnected',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    }

    if (isSaving) {
      return {
        icon: '⟳',
        message: 'Saving draft...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    }

    if (lastSavedAt && timeAgo) {
      return {
        icon: '📝',
        message: `Draft auto-saved ${timeAgo}`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    }

    return {
      icon: '📝',
      message: 'Draft',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    };
  };

  const status = getStatusDisplay();

  if (!hasDraft && !isSaving) {
    return null;
  }

  return (
    <div className="relative">
      {/* 🎯 SIMPLIFIED: Just show status message, buttons are in header */}
      <div
        className={`flex items-center gap-3 px-4 py-2 border-b ${status.borderColor}`}
        style={{
          background: status.bgColor,
          borderBottom: `1px solid ${status.borderColor}`,
        }}
      >
        <span className="text-base">{status.icon}</span>
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${status.color}`}>
            {status.message}
          </span>
          {hasDraft && !saveError && (
            <span className="text-xs text-gray-500">
              ⚠️ Not saved to base resume
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

