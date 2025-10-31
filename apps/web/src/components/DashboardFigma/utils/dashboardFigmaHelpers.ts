import type { ActivityStatus, Priority, Todo, ThemeColors } from '../types/dashboardFigma';

/**
 * Get status color class based on activity status
 */
export const getStatusColor = (status: ActivityStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/20 text-emerald-400';
    case 'pending':
      return 'bg-blue-500/20 text-blue-400';
    case 'warning':
      return 'bg-amber-500/20 text-amber-400';
  }
};

/**
 * Get priority color style based on priority level (theme-aware)
 */
export const getPriorityColor = (
  priority: Priority,
  colors: ThemeColors
): React.CSSProperties => {
  const style: React.CSSProperties = {};
  switch (priority) {
    case 'urgent':
      style.background = colors.badgeErrorBg;
      style.color = colors.errorRed;
      break;
    case 'high':
      style.background = colors.badgeWarningBg;
      style.color = colors.badgeWarningText;
      break;
    case 'low':
      style.background = colors.inputBackground;
      style.color = colors.secondaryText;
      break;
  }
  return style;
};

/**
 * Calculate todo progress percentage
 */
export const calculateTodoProgress = (todos: Todo[]): number => {
  if (todos.length === 0) return 0;
  const completedCount = todos.filter(t => t.completed).length;
  return Math.round((completedCount / todos.length) * 100);
};

/**
 * Filter todos based on filter string and showCompleted flag
 */
export const filterTodos = (
  todos: Todo[],
  filter: string,
  showCompleted: boolean
): Todo[] => {
  let filtered = todos;

  // Apply filter
  if (filter === 'Urgent') {
    filtered = filtered.filter(t => t.priority === 'urgent');
  } else if (filter === 'High Priority') {
    filtered = filtered.filter(t => t.priority === 'high');
  } else if (filter === 'Low Priority') {
    filtered = filtered.filter(t => t.priority === 'low');
  }

  // Apply showCompleted filter
  if (!showCompleted) {
    filtered = filtered.filter(t => !t.completed);
  }

  return filtered;
};

