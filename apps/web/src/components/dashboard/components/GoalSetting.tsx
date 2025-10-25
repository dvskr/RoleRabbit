'use client';

import React, { useState } from 'react';
import { Target, Plus, Edit, Trash2, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'applications' | 'interviews' | 'networking' | 'learning' | 'personal';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isCompleted: boolean;
  createdAt: Date;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
}

interface GoalSettingProps {
  goals: Goal[];
  onGoalsChange: (goals: Goal[]) => void;
  onClose: () => void;
}

export function GoalSetting({ goals, onGoalsChange, onClose }: GoalSettingProps) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'applications' as Goal['category'],
    targetValue: 10,
    unit: 'applications',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    priority: 'medium' as Goal['priority']
  });

  const categories = [
    { value: 'applications', label: 'Job Applications', icon: Target, color: 'text-blue-600 bg-blue-100' },
    { value: 'interviews', label: 'Interviews', icon: Calendar, color: 'text-green-600 bg-green-100' },
    { value: 'networking', label: 'Networking', icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
    { value: 'learning', label: 'Learning', icon: CheckCircle, color: 'text-orange-600 bg-orange-100' },
    { value: 'personal', label: 'Personal', icon: Target, color: 'text-gray-600 bg-gray-100' }
  ];

  const getCategoryInfo = (category: Goal['category']) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const addGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date(),
      milestones: []
    };

    onGoalsChange([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      category: 'applications',
      targetValue: 10,
      unit: 'applications',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 'medium'
    });
    setShowAddGoal(false);
  };

  const updateGoal = (updatedGoal: Goal) => {
    onGoalsChange(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
    setEditingGoal(null);
  };

  const deleteGoal = (goalId: string) => {
    onGoalsChange(goals.filter(goal => goal.id !== goalId));
  };

  const updateGoalProgress = (goalId: string, newValue: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, currentValue: newValue };
        updatedGoal.isCompleted = updatedGoal.currentValue >= updatedGoal.targetValue;
        return updatedGoal;
      }
      return goal;
    });
    onGoalsChange(updatedGoals);
  };

  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Goal Setting & Tracking</h2>
            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">{completionRate}% Complete</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add Goal Button */}
          <div className="mb-4">
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add New Goal
            </button>
          </div>

          {/* Add Goal Form */}
          {showAddGoal && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Goal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Apply to 50 jobs this month"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Goal['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., applications, interviews"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newGoal.deadline.toISOString().split('T')[0]}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Goal['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Describe your goal..."
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={addGoal}
                  disabled={!newGoal.title}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Goal
                </button>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 text-gray-600 text-sm rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target size={32} className="mx-auto mb-2 text-gray-400" />
                <p>No goals set yet. Create your first goal to get started!</p>
              </div>
            ) : (
              goals.map(goal => {
                const categoryInfo = getCategoryInfo(goal.category);
                const progressPercentage = getProgressPercentage(goal);
                const daysRemaining = getDaysRemaining(goal.deadline);
                const isOverdue = daysRemaining < 0 && !goal.isCompleted;

                return (
                  <div
                    key={goal.id}
                    className={`p-4 border rounded-lg transition-all ${
                      goal.isCompleted
                        ? 'border-green-200 bg-green-50'
                        : isOverdue
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded ${categoryInfo.color}`}>
                          <categoryInfo.icon size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium ${
                              goal.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {goal.title}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                            {goal.isCompleted && (
                              <CheckCircle size={14} className="text-green-600" />
                            )}
                            {isOverdue && (
                              <AlertCircle size={14} className="text-red-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Target: {goal.targetValue} {goal.unit}</span>
                            <span>Current: {goal.currentValue} {goal.unit}</span>
                            <span className={isOverdue ? 'text-red-600' : ''}>
                              {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs font-medium text-gray-900">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            goal.isCompleted ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Update */}
                    {!goal.isCompleted && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={goal.currentValue}
                          onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          max={goal.targetValue}
                        />
                        <span className="text-xs text-gray-600">/ {goal.targetValue}</span>
                        <button
                          onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          +1
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
