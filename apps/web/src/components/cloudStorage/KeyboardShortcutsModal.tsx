'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['/'], description: 'Focus search' },
    { keys: ['Esc'], description: 'Close modals/dialogs' },
  ]},
  { category: 'File Operations', items: [
    { keys: ['U'], description: 'Open upload modal' },
    { keys: ['D'], description: 'Download selected file(s)' },
    { keys: ['Delete'], description: 'Delete selected file(s)' },
    { keys: ['S'], description: 'Star/unstar selected file' },
    { keys: ['A'], description: 'Archive/unarchive selected file' },
  ]},
  { category: 'Selection', items: [
    { keys: ['Ctrl', 'A'], description: 'Select all files' },
    { keys: ['Ctrl', 'D'], description: 'Deselect all files' },
  ]},
  { category: 'Preview', items: [
    { keys: ['+', '='], description: 'Zoom in' },
    { keys: ['-'], description: 'Zoom out' },
    { keys: ['0'], description: 'Reset zoom' },
    { keys: ['R'], description: 'Rotate image' },
  ]},
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: colors.badgeInfoBg }}
            >
              <Keyboard size={20} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                Keyboard Shortcuts
              </h2>
              <p className="text-xs mt-0.5" style={{ color: colors.secondaryText }}>
                Speed up your workflow with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close shortcuts modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: colors.primaryText }}>
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: colors.inputBackground }}
                  >
                    <span className="text-sm" style={{ color: colors.secondaryText }}>
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd
                            className="px-2 py-1 rounded text-xs font-mono"
                            style={{
                              background: colors.cardBackground,
                              border: `1px solid ${colors.border}`,
                              color: colors.primaryText,
                            }}
                          >
                            {key}
                          </kbd>
                          {keyIdx < item.keys.length - 1 && (
                            <span className="text-xs" style={{ color: colors.tertiaryText }}>
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
      </div>
    </div>
  );
};

