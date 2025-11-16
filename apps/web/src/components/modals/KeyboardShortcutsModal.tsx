'use client';

import React, { useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Editing
  { keys: ['Ctrl', 'S'], description: 'Save resume', category: 'Editing' },
  { keys: ['Ctrl', 'Z'], description: 'Undo', category: 'Editing' },
  { keys: ['Ctrl', 'Y'], description: 'Redo', category: 'Editing' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternative)', category: 'Editing' },
  
  // Navigation
  { keys: ['Tab'], description: 'Navigate to next field', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Navigate to previous field', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close modal/dropdown', category: 'Navigation' },
  
  // Skills
  { keys: ['Enter'], description: 'Add skill', category: 'Skills' },
  { keys: ['↑', '↓'], description: 'Navigate autocomplete', category: 'Skills' },
  
  // General
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
  { keys: ['Ctrl', 'E'], description: 'Export resume', category: 'General' },
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="shortcuts-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: colors.background,
          color: colors.primaryText,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 pb-4" style={{ background: colors.background }}>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              }}
            >
              <Keyboard size={24} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <h3 id="shortcuts-modal-title" className="text-xl font-bold">
                Keyboard Shortcuts
              </h3>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                Speed up your workflow with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: colors.secondaryText }}
            aria-label="Close keyboard shortcuts modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Shortcuts by Category */}
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h4
                className="text-sm font-semibold uppercase tracking-wide mb-3 pb-2 border-b"
                style={{
                  color: colors.secondaryText,
                  borderColor: colors.border,
                }}
              >
                {category}
              </h4>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: colors.inputBackground,
                    }}
                  >
                    <span className="text-sm" style={{ color: colors.primaryText }}>
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd
                            className="px-2 py-1 text-xs font-semibold rounded border shadow-sm"
                            style={{
                              background: colors.cardBackground,
                              color: colors.primaryText,
                              borderColor: colors.border,
                            }}
                          >
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs mx-1" style={{ color: colors.tertiaryText }}>
                              +
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tip */}
        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderColor: '#fbbf24',
          }}
        >
          <div className="flex items-start gap-3">
            <Command size={20} style={{ color: '#92400e' }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium" style={{ color: '#92400e' }}>
                Pro Tip
              </p>
              <p className="text-xs mt-1" style={{ color: '#78350f' }}>
                Press <kbd className="px-1 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(0,0,0,0.1)' }}>?</kbd> anytime to view this help
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

