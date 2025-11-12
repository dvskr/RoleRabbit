import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { ActiveTask } from '../types';

interface ActiveTasksTabProps {
  activeTasks: ActiveTask[];
}

export const ActiveTasksTab: React.FC<ActiveTasksTabProps> = ({ activeTasks }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  if (!colors) return null;

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsDetailModalOpen(true);
  };

  return (
    <>
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
          {activeTasks.length === 0 ? (
            <div
              className="p-8 rounded-xl text-center"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <p style={{ color: colors.secondaryText }}>
                No active tasks. Start a new task from the Chat tab!
              </p>
            </div>
          ) : (
            activeTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task.id)}
              />
            ))
          )}
        </div>
      </div>

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        taskId={selectedTaskId}
      />
    </>
  );
};

