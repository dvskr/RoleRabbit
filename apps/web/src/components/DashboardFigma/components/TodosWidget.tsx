import React from 'react';
import { Clock } from 'lucide-react';
import type { Todo, Priority, ThemeColors } from '../types/dashboardFigma';
import { TodoItem } from './TodoItem';
import { AddTodoForm } from './AddTodoForm';

interface TodosWidgetProps {
  todos: Todo[];
  todoFilter: string;
  showCompleted: boolean;
  todoProgress: number;
  showAddTodo: boolean;
  newTodoTitle: string;
  newTodoSubtitle: string;
  newTodoPriority: Priority;
  onFilterChange?: (filter: string) => void;
  onShowAddTodo: () => void;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  onPriorityChange: (priority: Priority) => void;
  onAddTodo: () => void;
  onCancelAddTodo: () => void;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  colors: ThemeColors;
}

export function TodosWidget({
  todos,
  todoFilter,
  showCompleted,
  showAddTodo,
  newTodoTitle,
  newTodoSubtitle,
  newTodoPriority,
  onShowAddTodo,
  onTitleChange,
  onSubtitleChange,
  onPriorityChange,
  onAddTodo,
  onCancelAddTodo,
  onToggleTodo,
  onDeleteTodo,
  colors
}: TodosWidgetProps) {
  const filteredTodos = (
    todoFilter === 'All Tasks' ? todos : 
    todoFilter === 'Urgent' ? todos.filter(t => t.priority === 'urgent') :
    todoFilter === 'High Priority' ? todos.filter(t => t.priority === 'high') :
    todos.filter(t => t.priority === 'low')
  ).filter(todo => showCompleted || !todo.completed);

  const isDark = colors.background.includes('0f0a1e') || colors.background.includes('rgb(15, 10, 30)');

  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{
        background: isDark 
          ? 'rgba(255, 255, 255, 0.05)' 
          : '#ffffff',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
        boxShadow: isDark
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 2px 12px rgba(0, 0, 0, 0.08), 0 4px 24px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 
            className="text-2xl font-bold mb-1"
            style={{ color: isDark ? '#ffffff' : '#1f2937' }}
          >
            Smart To-Dos
          </h2>
          <p 
            className="text-sm"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#6b7280' }}
          >
            AI-prioritized tasks for your job search
          </p>
        </div>
        <button
          onClick={onShowAddTodo}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-lg hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)';
          }}
        >
          Add Task
        </button>
      </div>

      {/* Add Todo Form */}
      <AddTodoForm
        isOpen={showAddTodo}
        title={newTodoTitle}
        subtitle={newTodoSubtitle}
        priority={newTodoPriority}
        onTitleChange={onTitleChange}
        onSubtitleChange={onSubtitleChange}
        onPriorityChange={onPriorityChange}
        onSubmit={onAddTodo}
        onCancel={onCancelAddTodo}
        colors={colors}
      />

      {/* Task List - Scrollable */}
      <div 
        className="overflow-y-auto pr-2 space-y-2.5"
        style={{ 
          maxHeight: '500px',
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? 'rgba(255, 255, 255, 0.2) transparent' : 'rgba(0, 0, 0, 0.2) transparent'
        }}
      >
        {filteredTodos.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#9ca3af' }}>
              No tasks yet. Add one to get started!
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
              colors={colors}
            />
          ))
        )}
      </div>
    </div>
  );
}
