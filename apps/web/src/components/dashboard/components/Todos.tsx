'use client';

import React, { useState } from 'react';
import { CheckCircle, Circle, Plus, X } from 'lucide-react';
import { DashboardTodo } from '../types/dashboard';
import { useTheme } from '../../../contexts/ThemeContext';

interface TodosProps {
  todos: DashboardTodo[];
  onCompleteTodo: (todoId: string) => void;
  isLoading?: boolean;
}

export function Todos({ todos, onCompleteTodo, isLoading }: TodosProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter todos based on completion status
  const filteredTodos = todos.filter(todo => {
    if (!showCompleted && todo.isCompleted) return false;
    return true;
  });

  // Sort todos: incomplete first, then by priority
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const incompleteTodos = todos.filter(t => !t.isCompleted);
  const completedCount = todos.filter(t => t.isCompleted).length;

  const getPriorityColor = (priority: DashboardTodo['priority']) => {
    switch (priority) {
      case 'urgent':
        return colors.badgeErrorText;
      case 'high':
        return colors.badgeWarningText;
      case 'medium':
        return colors.primaryBlue;
      case 'low':
        return colors.secondaryText;
      default:
        return colors.secondaryText;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 
              className="text-lg font-semibold"
              style={{ color: colors.primaryText }}
            >
              Todos
            </h3>
            {completedCount > 0 && (
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-xs px-2 py-1 rounded"
                style={{
                  color: colors.secondaryText,
                  background: colors.inputBackground,
                }}
              >
                {showCompleted ? 'Hide' : 'Show'} completed ({completedCount})
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div 
                  className="h-16 rounded-lg"
                  style={{ background: colors.inputBackground }}
                />
              </div>
            ))}
          </div>
        ) : sortedTodos.length === 0 ? (
          <div 
            className="text-center py-8 rounded-lg"
            style={{ background: colors.inputBackground }}
          >
            <CheckCircle 
              size={32} 
              className="mx-auto mb-2"
              style={{ color: colors.secondaryText }}
            />
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              {incompleteTodos.length === 0 
                ? 'All caught up! No todos.' 
                : 'No todos to display'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTodos.map(todo => (
              <div
                key={todo.id}
                className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-sm"
                style={{
                  background: todo.isCompleted 
                    ? colors.inputBackground 
                    : colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                  opacity: todo.isCompleted ? 0.7 : 1,
                }}
              >
                <button
                  onClick={() => onCompleteTodo(todo.id)}
                  className="mt-0.5 flex-shrink-0 transition-colors"
                  style={{ color: todo.isCompleted ? colors.successGreen : colors.secondaryText }}
                  aria-label={todo.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {todo.isCompleted ? (
                    <CheckCircle size={20} style={{ color: colors.successGreen }} />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 
                      className={`text-sm font-medium flex-1 ${
                        todo.isCompleted ? 'line-through' : ''
                      }`}
                      style={{ 
                        color: todo.isCompleted 
                          ? colors.secondaryText 
                          : colors.primaryText 
                      }}
                    >
                      {todo.title}
                    </h4>
                    {todo.priority !== 'low' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          color: getPriorityColor(todo.priority),
                          background: colors.inputBackground,
                        }}
                      >
                        {todo.priority}
                      </span>
                    )}
                  </div>
                  
                  {todo.description && (
                    <p 
                      className={`text-xs mb-2 ${
                        todo.isCompleted ? 'line-through' : ''
                      }`}
                      style={{ color: colors.secondaryText }}
                    >
                      {todo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs">
                    {todo.dueDate && (
                      <span 
                        style={{ 
                          color: new Date(todo.dueDate) < new Date() && !todo.isCompleted
                            ? colors.errorRed
                            : colors.tertiaryText
                        }}
                      >
                        {formatDate(todo.dueDate)}
                      </span>
                    )}
                    {todo.category && (
                      <span style={{ color: colors.tertiaryText }}>
                        {todo.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!isLoading && incompleteTodos.length > 0 && (
          <div 
            className="mt-4 p-3 rounded-lg text-center"
            style={{ background: colors.inputBackground }}
          >
            <p 
              className="text-xs"
              style={{ color: colors.secondaryText }}
            >
              {incompleteTodos.length} {incompleteTodos.length === 1 ? 'task' : 'tasks'} remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

