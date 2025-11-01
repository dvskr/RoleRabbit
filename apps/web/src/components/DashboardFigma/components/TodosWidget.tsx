import React from 'react';
import { Plus } from 'lucide-react';
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
  todoProgress,
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
  ).filter(todo => showCompleted || !todo.completed).slice(0, 5);

  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col overflow-visible"
      style={{
        background: colors.cardBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="mb-2 sm:mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold" style={{ color: colors.primaryText }}>
            To-Dos
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: colors.secondaryText }}>
              {todos.filter(t => !t.completed).length} active
            </span>
            <button
              onClick={onShowAddTodo}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                background: colors.badgePurpleBg,
                border: `1px solid ${colors.badgePurpleBorder}`,
                color: colors.badgePurpleText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              title="Add new todo"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: colors.secondaryText }}>Progress</span>
            <span className="font-medium" style={{ color: colors.secondaryText }}>
              {todoProgress}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: colors.inputBackground }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${todoProgress}%`,
                background: colors.successGreen,
              }}
            />
          </div>
        </div>
      </div>

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

      <div className="space-y-1.5">
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggleTodo}
            onDelete={onDeleteTodo}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}

