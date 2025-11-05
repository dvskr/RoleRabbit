import React from 'react';
import { Clock, Trash2, Check } from 'lucide-react';
import type { Todo, ThemeColors } from '../types/dashboardFigma';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  colors: ThemeColors;
}

const getPriorityStyle = (priority: Todo['priority']) => {
  switch (priority) {
    case 'urgent':
      return {
        background: '#ef4444', // Red
        color: '#ffffff',
        label: 'high'
      };
    case 'high':
      return {
        background: '#f97316', // Orange (shown as medium in image)
        color: '#ffffff',
        label: 'medium'
      };
    case 'low':
    default:
      return {
        background: '#22c55e', // Green
        color: '#ffffff',
        label: 'low'
      };
  }
};

export function TodoItem({ todo, onToggle, onDelete, colors }: TodoItemProps) {
  const isDark = (
    colors.background.includes('0f0a1e') ||
    colors.background.includes('rgb(15, 10, 30)') ||
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );
  const priorityStyle = getPriorityStyle(todo.priority);

  return (
    <div
      className="flex items-start gap-3 py-3 px-4 rounded-xl transition-all group"
      style={{
        background: isDark 
          ? colors.hoverBackground 
          : '#f9fafb',
        border: `1px solid ${isDark ? colors.border : 'rgba(0, 0, 0, 0.06)'}`,
        boxShadow: isDark
          ? '0 1px 3px rgba(0, 0, 0, 0.2)'
          : '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? colors.hoverBackgroundStrong : '#f3f4f6';
        e.currentTarget.style.boxShadow = isDark
          ? '0 2px 6px rgba(0, 0, 0, 0.3)'
          : '0 2px 4px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? colors.hoverBackground : '#f9fafb';
        e.currentTarget.style.boxShadow = isDark
          ? '0 1px 3px rgba(0, 0, 0, 0.2)'
          : '0 1px 2px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Checkbox */}
      <div className="mt-0.5 flex-shrink-0 relative">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 rounded cursor-pointer transition-all appearance-none border-2"
          style={{
            borderColor: todo.completed 
              ? (isDark ? colors.successGreen : '#22c55e')
              : (isDark ? colors.border : '#d1d5db'),
            background: todo.completed 
              ? (isDark ? colors.successGreen : '#22c55e')
              : 'transparent',
          }}
          title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        />
        {todo.completed && (
          <Check 
            size={14} 
            className="absolute top-0.5 left-0.5 pointer-events-none"
            style={{ color: '#ffffff' }}
          />
        )}
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <p 
          className={`text-base font-medium mb-1.5 ${
            todo.completed ? 'line-through' : ''
          }`}
          style={{ 
            color: todo.completed 
              ? (isDark ? colors.tertiaryText : '#9ca3af')
              : (isDark ? colors.primaryText : '#1f2937')
          }}
        >
          {todo.title}
        </p>
        
        {/* Timestamp */}
        <div className="flex items-center gap-1.5">
          <Clock 
            size={14} 
            style={{ color: isDark ? colors.tertiaryText : '#9ca3af' }}
          />
          <span 
            className="text-sm"
            style={{ color: isDark ? colors.tertiaryText : '#9ca3af' }}
          >
            {todo.time}
          </span>
        </div>
      </div>

      {/* Priority Tag and Delete Button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Priority Tag */}
        <span 
          className="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap text-center flex items-center justify-center"
          style={{
            background: priorityStyle.background,
            color: priorityStyle.color,
            minWidth: '60px',
            width: '60px',
          }}
        >
          {priorityStyle.label}
        </span>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(todo.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
          style={{
            color: colors.errorRed,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark 
              ? `rgba(239, 68, 68, 0.2)` 
              : '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
