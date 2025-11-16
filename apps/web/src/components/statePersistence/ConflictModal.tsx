/**
 * Conflict Detection Modal
 * Section 1.10 requirement #6: Conflict detection
 */

'use client';

import React from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import type { ConflictInfo } from '../../utils/statePersistence';

interface ConflictModalProps {
  conflictInfo: ConflictInfo;
  onKeepLocal: () => void;
  onUseServer: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

/**
 * Modal shown when a conflict is detected between local and server data
 * Allows user to choose which version to keep
 */
export function ConflictModal({
  conflictInfo,
  onKeepLocal,
  onUseServer,
  onCancel,
  isOpen,
}: ConflictModalProps) {
  if (!isOpen || !conflictInfo.hasConflict) return null;

  const localDate = new Date(conflictInfo.localTimestamp);
  const serverDate = new Date(conflictInfo.serverTimestamp);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-modal-title"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
          </div>
          <div className="flex-1">
            <h2
              id="conflict-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Sync Conflict Detected
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              This data was modified in another session or tab. Choose which version to keep.
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-3 mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-900 dark:text-blue-300">
                Your Version
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Modified: {localDate.toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-900 dark:text-purple-300">
                Server Version
              </span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Modified: {serverDate.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Warning message */}
        {conflictInfo.message && (
          <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              {conflictInfo.message}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onUseServer}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Use Server Version
          </button>
          <button
            onClick={onKeepLocal}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Keep My Changes
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Compact conflict warning banner
 * Alternative to modal for less intrusive UI
 */
export function ConflictBanner({
  conflictInfo,
  onResolve,
  onDismiss,
}: {
  conflictInfo: ConflictInfo;
  onResolve: () => void;
  onDismiss: () => void;
}) {
  if (!conflictInfo.hasConflict) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4">
      <div className="flex items-start">
        <AlertTriangle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mr-3" size={20} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">
            Sync Conflict
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
            {conflictInfo.message || 'Changes detected from another session.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onResolve}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded font-medium transition-colors"
            >
              Resolve Conflict
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-orange-800 dark:text-orange-300 text-sm rounded font-medium border border-orange-300 dark:border-orange-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
