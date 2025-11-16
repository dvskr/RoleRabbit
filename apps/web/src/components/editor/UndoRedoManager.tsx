/**
 * Undo/Redo Manager with Action History
 * Requirement 1.12.8: Undo/redo buttons with action history (Ctrl+Z, Ctrl+Y)
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Undo2, Redo2, History, ChevronDown } from 'lucide-react';

export interface Action {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  data: any;
  previousState?: any;
}

interface UndoRedoManagerProps {
  onUndo?: (action: Action) => void;
  onRedo?: (action: Action) => void;
  maxHistorySize?: number;
}

/**
 * Undo/Redo Manager Component
 * Provides UI for undo/redo operations with action history
 */
export function UndoRedoManager({
  onUndo,
  onRedo,
  maxHistorySize = 50,
}: UndoRedoManagerProps) {
  const { actions, currentIndex, undo, redo, canUndo, canRedo } = useUndoRedo(
    maxHistorySize
  );
  const [showHistory, setShowHistory] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          const action = undo();
          if (action && onUndo) onUndo(action);
        }
      }

      // Ctrl+Y or Cmd+Shift+Z for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo) {
          const action = redo();
          if (action && onRedo) onRedo(action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, onUndo, onRedo]);

  const handleUndo = () => {
    if (!canUndo) return;
    const action = undo();
    if (action && onUndo) onUndo(action);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const action = redo();
    if (action && onRedo) onRedo(action);
  };

  const handleJumpToAction = (index: number) => {
    // Jump to specific point in history
    while (currentIndex > index && canUndo) {
      const action = undo();
      if (action && onUndo) onUndo(action);
    }
    while (currentIndex < index && canRedo) {
      const action = redo();
      if (action && onRedo) onRedo(action);
    }
    setShowHistory(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="px-3 py-1.5 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
          <span className="hidden sm:inline text-sm">Undo</span>
        </button>

        {/* Redo Button */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="px-3 py-1.5 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
          <span className="hidden sm:inline text-sm">Redo</span>
        </button>

        {/* History Button */}
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-3 py-1.5 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          title="Action History"
        >
          <History size={16} />
          <span className="hidden sm:inline text-sm">History</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${
              showHistory ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Action History Dropdown */}
      {showHistory && (
        <div className="absolute top-full mt-2 right-0 w-80 max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Action History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {actions.length} actions • Click to jump to state
            </p>
          </div>

          {actions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No actions yet
              </p>
            </div>
          ) : (
            <div className="p-2">
              {actions.map((action, index) => {
                const isCurrent = index === currentIndex;
                const isFuture = index > currentIndex;

                return (
                  <button
                    key={action.id}
                    onClick={() => handleJumpToAction(index)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                        : isFuture
                        ? 'opacity-50 hover:opacity-75'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              isCurrent
                                ? 'text-blue-600 dark:text-blue-400'
                                : isFuture
                                ? 'text-gray-400 dark:text-gray-600'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {action.description}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {action.type}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(action.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showHistory && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

/**
 * Hook for managing undo/redo state
 */
export function useUndoRedo(maxHistorySize = 50) {
  const [actions, setActions] = useState<Action[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addAction = useCallback(
    (type: string, description: string, data: any, previousState?: any) => {
      const action: Action = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        description,
        timestamp: new Date(),
        data,
        previousState,
      };

      setActions((prev) => {
        // Remove any actions after current index (when adding new action after undo)
        const newActions = prev.slice(0, currentIndex + 1);

        // Add new action
        newActions.push(action);

        // Limit history size
        if (newActions.length > maxHistorySize) {
          newActions.shift();
          setCurrentIndex((i) => i - 1);
        }

        return newActions;
      });

      setCurrentIndex((i) => Math.min(i + 1, maxHistorySize - 1));

      return action;
    },
    [currentIndex, maxHistorySize]
  );

  const undo = useCallback(() => {
    if (currentIndex < 0) return null;

    const action = actions[currentIndex];
    setCurrentIndex((i) => i - 1);
    return action;
  }, [currentIndex, actions]);

  const redo = useCallback(() => {
    if (currentIndex >= actions.length - 1) return null;

    const action = actions[currentIndex + 1];
    setCurrentIndex((i) => i + 1);
    return action;
  }, [currentIndex, actions]);

  const clear = useCallback(() => {
    setActions([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < actions.length - 1;

  return {
    actions,
    currentIndex,
    addAction,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
  };
}

/**
 * Format timestamp for display
 */
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
