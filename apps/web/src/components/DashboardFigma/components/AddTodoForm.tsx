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

  const isDark = (
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );

  return (
    <div 
      className="mb-1.5 p-1.5 rounded-lg border"
      style={{
        background: isDark ? colors.inputBackground : colors.inputBackground,
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
          background: isDark ? colors.cardBackground : colors.cardBackground,
          border: `1px solid ${colors.border}`,
          color: colors.primaryText,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentCyan;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accentCyan}40`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <div className="flex items-center gap-1">
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as Priority)}
          className="flex-1 px-1.5 py-1 rounded text-xs focus:outline-none transition-colors"
          style={{
            background: isDark ? colors.cardBackground : colors.cardBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.accentCyan;
            e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accentCyan}40`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = 'none';
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
            background: isDark
              ? `linear-gradient(135deg, ${colors.accentTeal} 0%, ${colors.accentCyan} 100%)`
              : colors.badgePurpleText,
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            if (isDark) {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.boxShadow = `0 2px 8px ${colors.accentCyan}40`;
            } else {
              e.currentTarget.style.opacity = '0.92';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-1 text-xs font-medium rounded transition-all"
          style={{
            background: isDark ? colors.inputBackground : colors.inputBackground,
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
          A-
        </button>
      </div>
    </div>
  );
}

