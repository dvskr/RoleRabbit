'use client';

import React from 'react';
import { CheckCircle, Circle, Clock, Filter, Plus, Zap } from 'lucide-react';
import { DashboardTodo } from '../../types/dashboard';

interface SmartTodoSystemProps {
  todos: DashboardTodo[];
  filter: string;
  onFilterChange: (filter: string) => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  onCompleteTodo: (todoId: string) => void;
  isLoading: boolean;
}

export function SmartTodoSystem({
  todos,
  filter,
  onFilterChange,
  showCompleted,
  onShowCompletedChange,
  onCompleteTodo,
  isLoading
}: SmartTodoSystemProps) {
  const getCategoryIcon = (category: DashboardTodo['category']) => {
    switch (category) {
      case 'application':
        return <Plus size={14} className="text-blue-600" />;
      case 'follow_up':
        return <Clock size={14} className="text-orange-600" />;
      case 'preparation':
        return <CheckCircle size={14} className="text-purple-600" />;
      case 'research':
        return <Circle size={14} className="text-green-600" />;
      case 'networking':
        return <Zap size={14} className="text-yellow-600" />;
      default:
        return <Circle size={14} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: DashboardTodo['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (!showCompleted && todo.isCompleted) return false;
    if (filter === 'all') return true;
    return todo.category === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'application', label: 'Applications' },
    { value: 'follow_up', label: 'Follow-ups' },
    { value: 'preparation', label: 'Preparation' },
    { value: 'research', label: 'Research' },
    { value: 'networking', label: 'Networking' }
  ];

  const completedCount = todos.filter(todo => todo.isCompleted).length;
  const totalCount = todos.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate dynamic height to fill ALL available space
  const getDynamicHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerHeight * 0.9; // Use 90% of viewport height
    }
    return 600;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full">
      {/* Header - Ultra Compact */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold text-gray-900">Smart To-Dos</h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">{completionRate}%</span>
            <div className="w-10 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Filters - Ultra Compact */}
        <div className="flex items-center gap-2">
          <Filter size={10} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show completed
          </label>
        </div>
      </div>

      {/* Todo List - Ultra Compact Scrollable with Hidden Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="p-2 space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="p-2 text-center text-gray-500">
            <CheckCircle size={16} className="mx-auto mb-1 text-gray-400" />
            <p className="text-xs">No tasks found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`flex items-start gap-1.5 p-1.5 rounded border border-gray-200 hover:shadow-sm transition-shadow ${
                  todo.isCompleted ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => onCompleteTodo(todo.id)}
                  className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {todo.isCompleted ? (
                    <CheckCircle size={12} className="text-green-600" />
                  ) : (
                    <Circle size={12} />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {getCategoryIcon(todo.category)}
                    <h4 className={`text-xs font-medium line-clamp-1 ${
                      todo.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </h4>
                    {todo.aiGenerated && (
                      <Zap size={8} className="text-yellow-500" title="AI Generated" />
                    )}
                  </div>
                  
                  <p className={`text-xs text-gray-600 mb-0.5 line-clamp-1 ${
                    todo.isCompleted ? 'line-through' : ''
                  }`}>
                    {todo.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-1 py-0.5 rounded-full ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatEstimatedTime(todo.estimatedTime)}
                      </span>
                    </div>
                    
                    {todo.dueDate && (
                      <span className={`text-xs ${
                        new Date(todo.dueDate) < new Date() 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
