import { HistoryTask } from '../types';

/**
 * Groups history tasks by date
 */
export const groupHistoryByDate = (historyTasks: HistoryTask[]): Record<string, HistoryTask[]> => {
  return historyTasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, HistoryTask[]>);
};

/**
 * Creates a timestamp in 12-hour format
 */
export const createTimestamp = (): string => {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

/**
 * Formats a date label for display
 */
export const formatDateLabel = (date: string): string => {
  return date === 'today' ? 'Today' : 'Yesterday';
};

