import React from 'react';
import type { Priority, ThemeColors } from '../types/dashboardFigma';

interface AddTodoFormProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  priority: Priority;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  onPriorityChange: (priority: Priority) => void;
  onSubmit: () => void;
  onCancel: () => void;
  colors: ThemeColors;
}

export function AddTodoForm({
  isOpen,
  title,
  subtitle,
  priority,
  onTitleChange,
  onSubtitleChange,
  onPriorityChange,
  onSubmit,
  onCancel,
  colors
}: AddTodoFormProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="mb-1.5 p-1.5 rounded-lg border"
      style={{
        background: colors.inputBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <input
        type="text"
        placeholder="Todo title..."
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full mb-1 px-1.5 py-1 rounded text-xs focus:outline-none transition-colors"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          color: colors.primaryText,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.borderFocused;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.border;
        }}
      />
      <div className="flex items-center gap-1">
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as Priority)}
          className="flex-1 px-1.5 py-1 rounded text-xs focus:outline-none transition-colors"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
          }}
          title="Priority"
        >
          <option value="low">Low</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          onClick={onSubmit}
          className="px-2 py-1 text-xs font-medium rounded transition-all"
          style={{
            background: colors.badgePurpleText,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-1 text-xs font-medium rounded transition-all"
          style={{
            background: colors.inputBackground,
            color: colors.secondaryText,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.inputBackground;
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

