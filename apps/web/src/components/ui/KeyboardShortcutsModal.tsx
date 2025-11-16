import React, { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from '../common/Button';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // General
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
  { keys: ['Ctrl', 'S'], description: 'Save resume', category: 'General' },
  { keys: ['Ctrl', 'Z'], description: 'Undo', category: 'General' },
  { keys: ['Ctrl', 'Y'], description: 'Redo', category: 'General' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternative)', category: 'General' },
  { keys: ['Esc'], description: 'Close modal/dialog', category: 'General' },
  
  // Navigation
  { keys: ['Ctrl', '1'], description: 'Go to Resume Builder', category: 'Navigation' },
  { keys: ['Ctrl', '2'], description: 'Go to Job Tracker', category: 'Navigation' },
  { keys: ['Ctrl', '3'], description: 'Go to Cover Letters', category: 'Navigation' },
  { keys: ['Tab'], description: 'Next field', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Previous field', category: 'Navigation' },
  
  // Editing
  { keys: ['Ctrl', 'B'], description: 'Bold text', category: 'Editing' },
  { keys: ['Ctrl', 'I'], description: 'Italic text', category: 'Editing' },
  { keys: ['Ctrl', 'K'], description: 'Insert link', category: 'Editing' },
  { keys: ['Ctrl', 'Enter'], description: 'Add new bullet point', category: 'Editing' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate section', category: 'Editing' },
  { keys: ['Ctrl', 'Backspace'], description: 'Delete section', category: 'Editing' },
  
  // Preview
  { keys: ['Ctrl', '+'], description: 'Zoom in', category: 'Preview' },
  { keys: ['Ctrl', '-'], description: 'Zoom out', category: 'Preview' },
  { keys: ['Ctrl', '0'], description: 'Reset zoom', category: 'Preview' },
  { keys: ['Ctrl', 'P'], description: 'Print/Export', category: 'Preview' },
  
  // AI Tools
  { keys: ['Ctrl', 'Shift', 'A'], description: 'Open AI panel', category: 'AI Tools' },
  { keys: ['Ctrl', 'Shift', 'T'], description: 'Tailor resume', category: 'AI Tools' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Check ATS score', category: 'AI Tools' },
];

const KeyboardShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open modal with '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close modal with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Keyboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Speed up your workflow with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {category}
                </h3>
                <div className="space-y-3">
                  {shortcuts
                    .filter((s) => s.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-gray-400 dark:text-gray-500 text-xs">
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

          {/* Platform Note */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> On Mac, use <kbd className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded">Cmd</kbd> instead of <kbd className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded">Ctrl</kbd>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Press <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">?</kbd> anytime to view shortcuts
          </p>
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;

