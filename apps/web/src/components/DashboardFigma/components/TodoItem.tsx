import React from 'react';
import { X } from 'lucide-react';
import type { Todo, ThemeColors } from '../types/dashboardFigma';
import { getPriorityColor } from '../utils/dashboardFigmaHelpers';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  colors: ThemeColors;
}

export function TodoItem({ todo, onToggle, onDelete, colors }: TodoItemProps) {
  return (
    <div
      className="flex items-center gap-2 p-1.5 rounded-lg transition-colors group"
      style={{
        background: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.hoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 rounded flex-shrink-0 transition-colors"
        style={{
          border: `1px solid ${colors.border}`,
          background: todo.completed ? colors.successGreen : colors.inputBackground,
          color: colors.successGreen,
        }}
        title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      />
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p 
          className={`text-sm font-medium truncate ${todo.completed ? 'line-through' : ''}`}
          style={{ color: todo.completed ? colors.tertiaryText : colors.primaryText }}
        >
          {todo.title}
        </p>
        <span 
          className="px-2 py-0.5 text-xs font-medium rounded-full"
          style={getPriorityColor(todo.priority, colors)}
        >
          {todo.priority.slice(0, 1).toUpperCase()}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
        style={{
          color: colors.errorRed,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.badgeErrorBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        title="Delete todo"
      >
        <X size={12} />
      </button>
    </div>
  );
}

