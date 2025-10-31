import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { TaskCard } from './TaskCard';
import { ActiveTask } from '../types';

interface ActiveTasksTabProps {
  activeTasks: ActiveTask[];
}

export const ActiveTasksTab: React.FC<ActiveTasksTabProps> = ({ activeTasks }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Active Tasks
        </h2>
        <p 
          className="text-sm"
          style={{ color: colors.secondaryText }}
        >
          Monitor your AI agent's progress in real-time
        </p>
      </div>

      <div className="space-y-4">
        {activeTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

