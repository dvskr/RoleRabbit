/**
 * Keyboard Shortcuts System
 * Requirements 1.12.9-1.12.10: Shortcuts modal and global shortcuts
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
  category?: string;
  enabled?: boolean;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Keyboard Shortcuts Modal
 * Shows all available shortcuts with "Press ? to see shortcuts"
 */
export function KeyboardShortcutsModal({
  shortcuts,
  isOpen = false,
  onClose,
}: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Keyboard size={28} />
              Keyboard Shortcuts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {shortcuts.length} shortcuts available
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {category}
              </h3>
              <div className="space-y-3">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                          <kbd className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono shadow-sm">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">?</kbd>{' '}
            anytime to see this help
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Keyboard Shortcuts Hook
 * Manages global shortcuts: Ctrl+S to save, Ctrl+P to publish, Esc to close modals
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement).tagName
      );

      // Show shortcuts modal on "?"
      if (e.key === '?' && !isInputActive && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsModalOpen(true);
        return;
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        if (isModalOpen) {
          e.preventDefault();
          setIsModalOpen(false);
          return;
        }
      }

      // Execute shortcuts
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keys = shortcut.keys.map((k) => k.toLowerCase());
        const pressedKeys: string[] = [];

        if (e.ctrlKey || e.metaKey) pressedKeys.push('ctrl');
        if (e.shiftKey) pressedKeys.push('shift');
        if (e.altKey) pressedKeys.push('alt');
        pressedKeys.push(e.key.toLowerCase());

        // Check if pressed keys match shortcut
        if (
          pressedKeys.length === keys.length &&
          pressedKeys.every((key, i) => keys[i] === key)
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, isModalOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
  };
}

/**
 * Default shortcuts for portfolio editor
 */
export const defaultEditorShortcuts: (handlers: {
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onFind?: () => void;
}) => Shortcut[] = (handlers) => [
  // File Operations
  {
    keys: ['Ctrl', 'S'],
    description: 'Save draft',
    action: () => handlers.onSave?.(),
    category: 'File',
  },
  {
    keys: ['Ctrl', 'P'],
    description: 'Publish portfolio',
    action: () => handlers.onPublish?.(),
    category: 'File',
  },
  {
    keys: ['Ctrl', 'Shift', 'P'],
    description: 'Preview portfolio',
    action: () => handlers.onPreview?.(),
    category: 'File',
  },

  // Edit Operations
  {
    keys: ['Ctrl', 'Z'],
    description: 'Undo',
    action: () => handlers.onUndo?.(),
    category: 'Edit',
  },
  {
    keys: ['Ctrl', 'Y'],
    description: 'Redo',
    action: () => handlers.onRedo?.(),
    category: 'Edit',
  },
  {
    keys: ['Ctrl', 'F'],
    description: 'Find in content',
    action: () => handlers.onFind?.(),
    category: 'Edit',
  },

  // Navigation
  {
    keys: ['Esc'],
    description: 'Close modal/dialog',
    action: () => {
      // Handled by modal components
    },
    category: 'Navigation',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
    action: () => {
      // Handled by useKeyboardShortcuts hook
    },
    category: 'Help',
  },
];

/**
 * Keyboard Shortcut Indicator
 * Shows hint that shortcuts are available
 */
export function KeyboardShortcutHint({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all hover:scale-105 flex items-center gap-2"
    >
      <Command size={16} />
      <span className="text-sm">
        Press <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-600 rounded text-xs">?</kbd> for shortcuts
      </span>
    </button>
  );
}
