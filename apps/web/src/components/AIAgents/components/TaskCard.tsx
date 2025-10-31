import React from 'react';
import { CheckCircle, MoreVertical } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ActiveTask } from '../types';

interface TaskCardProps {
  task: ActiveTask;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const isCompleted = task.status === 'completed';

  return (
    <div
      className="rounded-lg p-4 transition-all"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderFocused;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ 
              background: colors.badgePurpleBg,
              color: isCompleted ? '#10b981' : colors.badgePurpleText
            }}
          >
            {isCompleted && <CheckCircle size={18} />}
            {!isCompleted && task.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="text-base font-semibold"
                style={{ color: colors.primaryText }}
              >
                {task.title}
              </h3>
              {!isCompleted && (
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: colors.badgePurpleBg, color: colors.badgePurpleText }}
                >
                  C
                </div>
              )}
            </div>
            <p 
              className="text-sm mb-1"
              style={{ color: colors.primaryText }}
            >
              {task.company} • {task.role}
            </p>
            {task.description && (
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
        <button
          className="p-1 rounded transition-all"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="More options"
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {!isCompleted && (
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1">
            <div 
              className="h-1 rounded-full overflow-hidden"
              style={{ background: colors.inputBackground }}
            >
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  background: '#10b981',
                  width: `${task.progress}%`
                }}
              />
            </div>
          </div>
          <span 
            className="text-sm font-medium"
            style={{ color: '#10b981' }}
          >
            {task.progress}%
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span 
          className="text-xs"
          style={{ color: colors.secondaryText }}
        >
          Started {task.started}
        </span>
      </div>
    </div>
  );
};

