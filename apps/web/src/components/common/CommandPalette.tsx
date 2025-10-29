import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { cn } from '../../lib/utils';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  group?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  commands,
  placeholder = 'Type a command or search...'
}: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!searchTerm) return commands;
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [commands, searchTerm]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      const group = cmd.group || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const command = filteredCommands[selectedIndex];
      if (command) {
        command.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (command: Command) => {
    command.action();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div onKeyDown={handleKeyDown}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([group, cmds]) => (
            <div key={group} className="mb-4">
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                {group}
              </h3>
              {cmds.map((cmd, index) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                return (
                  <div
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={cn(
                      'flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100',
                      globalIndex === selectedIndex && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {cmd.icon && <span>{cmd.icon}</span>}
                      <span>{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <span className="text-xs text-gray-500 font-mono">
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No commands found
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
