import React, { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  items: CommandItem[];
  triggerKey?: string;
}

export function CommandPalette({ items, triggerKey = 'k' }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === triggerKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerKey]);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20%]">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
        <div className="flex items-center px-4 border-b">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full py-3 outline-none"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

