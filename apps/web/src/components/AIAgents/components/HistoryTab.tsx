import React from 'react';
import { Calendar } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { HistoryCard } from './HistoryCard';
import { HistoryTask } from '../types';
import { groupHistoryByDate, formatDateLabel } from '../utils/helpers';

interface HistoryTabProps {
  historyTasks: HistoryTask[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ historyTasks }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const groupedHistory = groupHistoryByDate(historyTasks);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Task History
        </h2>
        <p 
          className="text-sm"
          style={{ color: colors.secondaryText }}
        >
          Review your AI agent's completed work
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedHistory).map(([date, tasks]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} style={{ color: colors.secondaryText }} />
              <h3 
                className="text-sm font-semibold capitalize"
                style={{ color: colors.primaryText }}
              >
                {formatDateLabel(date)}
              </h3>
            </div>

            <div className="space-y-3">
              {tasks.map(task => (
                <HistoryCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

