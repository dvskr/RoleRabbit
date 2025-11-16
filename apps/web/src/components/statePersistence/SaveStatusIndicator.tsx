/**
 * Save Status Indicator Component
 * Section 1.10 requirement #4: Last saved indicator
 */

'use client';

import React from 'react';
import { Check, AlertCircle, Loader2, Clock, Wifi, WifiOff } from 'lucide-react';
import { useLastSavedIndicator } from '../../hooks/useStatePersistence';

interface SaveStatusIndicatorProps {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: number | null;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  error?: Error | null;
  className?: string;
}

/**
 * Displays save status and last saved time
 * Shows: "Saving...", "All changes saved", "Unsaved changes", etc.
 */
export const SaveStatusIndicator = React.memo(function SaveStatusIndicator({
  saveStatus,
  lastSaved,
  hasUnsavedChanges = false,
  isOnline = true,
  error = null,
  className = '',
}: SaveStatusIndicatorProps) {
  const { lastSavedText, lastSavedTime } = useLastSavedIndicator(lastSaved);

  // Offline state
  if (!isOnline) {
    return (
      <div
        className={`flex items-center gap-2 text-sm ${className}`}
        title="You're offline. Changes are saved locally and will sync when you reconnect."
      >
        <WifiOff size={16} className="text-orange-500" />
        <span className="text-orange-600 font-medium">Offline - Saving locally</span>
      </div>
    );
  }

  // Saving state
  if (saveStatus === 'saving') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Loader2 size={16} className="text-blue-500 animate-spin" />
        <span className="text-blue-600 font-medium">Saving...</span>
      </div>
    );
  }

  // Error state
  if (saveStatus === 'error' && error) {
    return (
      <div
        className={`flex items-center gap-2 text-sm ${className}`}
        title={error.message}
      >
        <AlertCircle size={16} className="text-red-500" />
        <span className="text-red-600 font-medium">Save failed</span>
      </div>
    );
  }

  // Unsaved changes
  if (hasUnsavedChanges) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Clock size={16} className="text-orange-500" />
        <span className="text-orange-600 font-medium">Unsaved changes</span>
      </div>
    );
  }

  // Saved state
  if (saveStatus === 'saved' || lastSaved) {
    return (
      <div
        className={`flex items-center gap-2 text-sm ${className}`}
        title={lastSavedTime ? `Last saved at ${lastSavedTime}` : undefined}
      >
        <Check size={16} className="text-green-500" />
        <span className="text-green-600 font-medium">
          {lastSavedText ? `Saved ${lastSavedText}` : 'All changes saved'}
        </span>
      </div>
    );
  }

  // Idle/default state
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Wifi size={16} className="text-gray-400" />
      <span className="text-gray-500">Auto-save enabled</span>
    </div>
  );
});

/**
 * Compact save status badge for headers/toolbars
 */
export const SaveStatusBadge = React.memo(function SaveStatusBadge({
  saveStatus,
  lastSaved,
  hasUnsavedChanges = false,
  isOnline = true,
}: Omit<SaveStatusIndicatorProps, 'error' | 'className'>) {
  const { lastSavedText } = useLastSavedIndicator(lastSaved);

  if (!isOnline) {
    return (
      <div className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium flex items-center gap-1">
        <WifiOff size={12} />
        Offline
      </div>
    );
  }

  if (saveStatus === 'saving') {
    return (
      <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center gap-1">
        <Loader2 size={12} className="animate-spin" />
        Saving
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium flex items-center gap-1">
        <Clock size={12} />
        Unsaved
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
        <Check size={12} />
        {lastSavedText}
      </div>
    );
  }

  return null;
});
