import { useState, useMemo } from 'react';
import type { Todo, Priority } from '../types/dashboardFigma';
import { DEFAULT_TODOS } from '../constants/dashboardFigma';
import { calculateTodoProgress, filterTodos } from '../utils/dashboardFigmaHelpers';

/**
 * Hook for managing todos (default + user-added, with deletion tracking)
 */
export const useTodos = () => {
  const [userTodos, setUserTodos] = useState<Todo[]>([]);
  const [deletedDefaultTodoIds, setDeletedDefaultTodoIds] = useState<number[]>([]);

  const todos = useMemo(() => {
    return [
      ...DEFAULT_TODOS.filter(t => !deletedDefaultTodoIds.includes(t.id)),
      ...userTodos
    ];
  }, [userTodos, deletedDefaultTodoIds]);

  const addTodo = (todo: Todo) => {
    setUserTodos(prev => [...prev, todo]);
  };

  const deleteTodo = (id: number) => {
    if (id > 7) {
      // User-added todo
      setUserTodos(prev => prev.filter(t => t.id !== id));
    } else {
      // Default todo - mark as deleted
      setDeletedDefaultTodoIds(prev => [...prev, id]);
    }
  };

  const toggleTodoComplete = (id: number) => {
    if (id > 7) {
      // User-added todo
      setUserTodos(prev =>
        prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
    // Note: Default todos completion state would need separate tracking
    // For now, we only allow toggling user todos
  };

  return {
    todos,
    userTodos,
    deletedDefaultTodoIds,
    addTodo,
    deleteTodo,
    toggleTodoComplete
  };
};

/**
 * Hook for managing dashboard filters
 */
export const useDashboardFilters = () => {
  const [activityFilter, setActivityFilter] = useState('All Activity');
  const [todoFilter, setTodoFilter] = useState('All Tasks');
  const [showCompleted, setShowCompleted] = useState(true);

  return {
    activityFilter,
    setActivityFilter,
    todoFilter,
    setTodoFilter,
    showCompleted,
    setShowCompleted
  };
};

/**
 * Hook for managing add todo form state
 */
export const useAddTodoForm = (
  onAddTodo: (todo: Todo) => void
) => {
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoSubtitle, setNewTodoSubtitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('high');

  const resetForm = () => {
    setNewTodoTitle('');
    setNewTodoSubtitle('');
    setNewTodoPriority('high');
    setShowAddTodo(false);
  };

  const submitForm = () => {
    if (newTodoTitle.trim()) {
      onAddTodo({
        id: Date.now(),
        title: newTodoTitle,
        subtitle: newTodoSubtitle,
        time: 'Just now',
        priority: newTodoPriority,
        completed: false,
        date: undefined
      });
      resetForm();
    }
  };

  return {
    showAddTodo,
    setShowAddTodo,
    newTodoTitle,
    setNewTodoTitle,
    newTodoSubtitle,
    setNewTodoSubtitle,
    newTodoPriority,
    setNewTodoPriority,
    resetForm,
    submitForm
  };
};

/**
 * Main hook that combines all dashboard state management
 */
export const useDashboardFigma = () => {
  const todos = useTodos();
  const filters = useDashboardFilters();

  const todoProgress = useMemo(() => {
    return calculateTodoProgress(todos.todos);
  }, [todos.todos]);

  const filteredTodos = useMemo(() => {
    return filterTodos(todos.todos, filters.todoFilter, filters.showCompleted);
  }, [todos.todos, filters.todoFilter, filters.showCompleted]);

  const addTodoForm = useAddTodoForm(todos.addTodo);

  return {
    todos: {
      ...todos,
      filtered: filteredTodos,
      progress: todoProgress
    },
    filters,
    addTodoForm
  };
};

