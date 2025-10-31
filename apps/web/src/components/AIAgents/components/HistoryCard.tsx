import React from 'react';
import { CheckCircle, Eye, Download } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { HistoryTask } from '../types';

interface HistoryCardProps {
  task: HistoryTask;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ task }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div
      className="rounded-lg p-4 transition-all flex items-center justify-between"
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
      <div className="flex items-center gap-3 flex-1">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#10b98120' }}
        >
          <div style={{ color: '#10b981' }}>
            {task.icon}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="text-sm font-medium"
              style={{ color: colors.primaryText }}
            >
              {task.title}
            </span>
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ 
                background: colors.badgePurpleBg,
                color: colors.badgePurpleText
              }}
            >
              {task.count}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} style={{ color: '#10b981' }} />
            <span 
              className="text-xs"
              style={{ color: '#10b981' }}
            >
              {task.status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg transition-all"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.tertiaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.primaryBlue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.inputBackground;
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title="View Details"
        >
          <Eye size={16} />
        </button>
        <button
          className="p-2 rounded-lg transition-all"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.tertiaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.primaryBlue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.inputBackground;
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title="Download"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};

