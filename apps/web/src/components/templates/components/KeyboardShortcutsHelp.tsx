/**
 * KeyboardShortcutsHelp - Modal showing available keyboard shortcuts
 * Provides in-app user guide for power users
 */

import React, { useEffect } from 'react';
import { X, Keyboard, Zap } from 'lucide-react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Search' | 'Filters' | 'Views';
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  colors?: any;
}

const shortcuts: KeyboardShortcut[] = [
  // Search shortcuts
  { keys: ['/'], description: 'Focus search input', category: 'Search' },
  { keys: ['Ctrl', 'K'], description: 'Focus search input', category: 'Search' },
  { keys: ['Esc'], description: 'Clear search (when focused)', category: 'Search' },

  // Filter shortcuts
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Clear all filters', category: 'Filters' },
  { keys: ['Ctrl', 'Shift', 'F'], description: 'Toggle filters panel', category: 'Filters' },

  // View shortcuts
  { keys: ['Ctrl', '1'], description: 'Switch to grid view', category: 'Views' },
  { keys: ['Ctrl', '2'], description: 'Switch to list view', category: 'Views' },

  // Navigation shortcuts
  { keys: ['←'], description: 'Previous page', category: 'Navigation' },
  { keys: ['→'], description: 'Next page', category: 'Navigation' },
  { keys: ['?'], description: 'Show this help', category: 'Navigation' },
];

const categories: Array<KeyboardShortcut['category']> = ['Search', 'Filters', 'Views', 'Navigation'];

export default function KeyboardShortcutsHelp({ isOpen, onClose, colors }: KeyboardShortcutsHelpProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ background: colors?.cardBackground || '#ffffff' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: colors?.badgeInfoBg || '#dbeafe',
              }}
            >
              <Keyboard
                size={24}
                style={{ color: colors?.badgeInfoText || '#3b82f6' }}
              />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className="text-2xl font-bold"
                style={{ color: colors?.primaryText || '#111827' }}
              >
                Keyboard Shortcuts
              </h2>
              <p
                className="text-sm"
                style={{ color: colors?.secondaryText || '#6b7280' }}
              >
                Navigate faster with keyboard shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: colors?.tertiaryText || '#9ca3af',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors?.hoverBackground || '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close shortcuts help"
          >
            <X size={24} />
          </button>
        </div>

        {/* Shortcuts by category */}
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryShortcuts = shortcuts.filter((s) => s.category === category);
            if (categoryShortcuts.length === 0) return null;

            return (
              <div key={category}>
                <h3
                  className="text-lg font-semibold mb-3 flex items-center gap-2"
                  style={{ color: colors?.primaryText || '#111827' }}
                >
                  <Zap
                    size={16}
                    style={{ color: colors?.badgeInfoText || '#3b82f6' }}
                  />
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        background: colors?.inputBackground || '#f9fafb',
                        border: `1px solid ${colors?.border || '#e5e7eb'}`,
                      }}
                    >
                      <span
                        className="text-sm"
                        style={{ color: colors?.secondaryText || '#6b7280' }}
                      >
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span
                                className="text-xs mx-1"
                                style={{ color: colors?.tertiaryText || '#9ca3af' }}
                              >
                                +
                              </span>
                            )}
                            <kbd
                              className="px-2 py-1 rounded text-xs font-mono font-semibold shadow-sm"
                              style={{
                                background: colors?.cardBackground || '#ffffff',
                                border: `1px solid ${colors?.border || '#e5e7eb'}`,
                                color: colors?.primaryText || '#111827',
                              }}
                            >
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div
          className="mt-6 p-4 rounded-lg"
          style={{
            background: colors?.badgeInfoBg || '#dbeafe',
            border: `1px solid ${colors?.badgeInfoBorder || '#bfdbfe'}`,
          }}
        >
          <p
            className="text-sm"
            style={{ color: colors?.badgeInfoText || '#1e40af' }}
          >
            <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 rounded text-xs font-mono bg-white border border-blue-300">?</kbd> anytime to show this help dialog
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 rounded-lg font-semibold transition-colors"
          style={{
            background: colors?.borderFocused || '#8b5cf6',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
