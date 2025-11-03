'use client';

import React, { useState } from 'react';
import { Target, Calendar, TrendingUp, Trash2, Edit2, Save, X, Plus, BarChart3, CheckCircle } from 'lucide-react';
import { UserData, CareerGoal } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';
import FormField from '../components/FormField';

interface CareerTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function CareerTab({
  userData,
  isEditing,
  onUserDataChange
}: CareerTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editingTimelineId, setEditingTimelineId] = useState<number | null>(null);
  
  // Normalize array fields to always be arrays
  const normalizeArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map(item => typeof item === 'string' ? item : (item || ''));
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return normalizeArray(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const normalizeCareerGoals = (goals: any): CareerGoal[] => {
    if (!goals) return [];
    if (Array.isArray(goals)) {
      return goals.map(goal => {
        if (typeof goal === 'string') {
          return { 
            title: goal, 
            description: '', 
            targetDate: '', 
            progress: 0, 
            category: 'Other' 
          };
        }
        return {
          title: goal.title || goal.goal || '',
          description: goal.description || '',
          targetDate: goal.targetDate || goal.deadline || '',
          progress: goal.progress || 0,
          category: goal.category || 'Other'
        };
      });
    }
    if (typeof goals === 'string') {
      try {
        const parsed = JSON.parse(goals);
        return normalizeCareerGoals(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const normalizeCareerTimeline = (timeline: any): any[] => {
    if (!timeline) return [];
    if (Array.isArray(timeline)) {
      return timeline.map(item => ({
        id: item.id || `timeline-${Date.now()}-${Math.random()}`,
        title: item.title || '',
        description: item.description || '',
        date: item.date || item.period || '',
        type: item.type || 'Work'
      }));
    }
    if (typeof timeline === 'string') {
      try {
        const parsed = JSON.parse(timeline);
        return normalizeCareerTimeline(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const careerGoals = normalizeCareerGoals(userData.careerGoals);
  const careerTimeline = normalizeCareerTimeline(userData.careerTimeline);
  
  // Career Goals Functions
  const addCareerGoal = () => {
    const newGoal: CareerGoal = {
      title: '',
      description: '',
      targetDate: '',
      progress: 0,
      category: 'Role'
    };
    onUserDataChange({ careerGoals: [...careerGoals, newGoal] });
    setEditingGoalId(careerGoals.length);
  };

  const updateCareerGoal = (index: number, updates: Partial<CareerGoal>) => {
    const updated = careerGoals.map((goal, i) => 
      i === index ? { ...goal, ...updates } : goal
    );
    onUserDataChange({ careerGoals: updated });
  };

  const removeCareerGoal = (index: number) => {
    onUserDataChange({ careerGoals: careerGoals.filter((_, i) => i !== index) });
    setEditingGoalId(null);
  };

  // Statistics
  const stats = {
    totalGoals: careerGoals.length,
    completedGoals: careerGoals.filter(g => g.progress >= 100).length,
    avgProgress: careerGoals.length > 0 
      ? Math.round(careerGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / careerGoals.length)
      : 0,
  };

  const goalCategories = ['Role', 'Company', 'Location', 'Skill', 'Education', 'Other'];

  return (
    <div className="max-w-4xl">
      <div className="space-y-8">
        {/* Statistics Overview */}
        {careerGoals.length > 0 && (
          <div 
            className="backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} style={{ color: colors.primaryBlue }} />
              <h3 
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                Career Goals Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.primaryBlue }}>
                  {stats.totalGoals}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Total Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.successGreen }}>
                  {stats.completedGoals}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.badgePurpleText }}>
                  {stats.avgProgress}%
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Avg Progress</div>
              </div>
            </div>
          </div>
        )}

        {/* Structured Career Goals */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Target style={{ color: colors.badgePurpleText }} />
              Career Goals
            </h3>
            {isEditing && (
              <button
                onClick={addCareerGoal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Goal
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {careerGoals.map((goal, index) => {
              const isEditing = editingGoalId === index;
              
              return (
                <div 
                  key={index} 
                  className="p-6 rounded-xl transition-all"
                  style={{
                    background: colors.badgePurpleBg,
                    border: `1px solid ${colors.badgePurpleBorder}`,
                  }}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2" style={{ color: colors.primaryText }}>
                          <Target size={16} />
                          Edit Career Goal
                        </h4>
                        <button
                          onClick={() => setEditingGoalId(null)}
                          className="p-1 rounded"
                          style={{ color: colors.secondaryText }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <FormField
                            label="Goal Title"
                            value={goal.title}
                            onChange={(value) => updateCareerGoal(index, { title: value })}
                            disabled={false}
                            placeholder="e.g., Become Senior Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: colors.primaryText }}>
                            Category
                          </label>
                          <select
                            value={goal.category}
                            onChange={(e) => updateCareerGoal(index, { category: e.target.value as CareerGoal['category'] })}
                            className="w-full px-4 py-3 rounded-xl"
                            style={{
                              background: colors.cardBackground,
                              border: `1px solid ${colors.border}`,
                              color: colors.primaryText,
                            }}
                          >
                            {goalCategories.map(cat => (
                              <option key={cat} value={cat} style={{ background: colors.background, color: colors.secondaryText }}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <FormField
                            label="Target Date"
                            type="date"
                            value={goal.targetDate}
                            onChange={(value) => updateCareerGoal(index, { targetDate: value })}
                            disabled={false}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2" style={{ color: colors.primaryText }}>
                            Progress (%)
                          </label>
                          <input
                            id={`goal-progress-${index}`}
                            name={`goal-progress-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            value={goal.progress || 0}
                            onChange={(e) => updateCareerGoal(index, { progress: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 rounded-xl"
                            style={{
                              background: colors.cardBackground,
                              border: `1px solid ${colors.border}`,
                              color: colors.primaryText,
                            }}
                            placeholder="0-100"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <FormField
                            label="Description"
                            type="textarea"
                            value={goal.description}
                            onChange={(value) => updateCareerGoal(index, { description: value })}
                            disabled={false}
                            rows={3}
                            maxLength={3000}
                            showCounter={true}
                            autoResize={true}
                            placeholder="Describe your career goal and steps to achieve it..."
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setEditingGoalId(null)}
                          className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                          style={{
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={() => removeCareerGoal(index)}
                          className="px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                          style={{
                            background: colors.errorRed,
                            color: 'white',
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 
                            className="font-semibold mb-2"
                            style={{ color: colors.primaryText }}
                          >
                            {goal.title || 'Untitled Goal'}
                          </h4>
                          {goal.description && (
                            <p 
                              className="text-sm mb-3"
                              style={{ color: colors.secondaryText }}
                            >
                              {goal.description}
                            </p>
                          )}
                          <div 
                            className="flex items-center gap-4 text-xs flex-wrap"
                            style={{ color: colors.tertiaryText }}
                          >
                            {goal.targetDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {goal.targetDate}
                              </span>
                            )}
                            <span 
                              className="px-2 py-1 rounded"
                              style={{
                                background: colors.inputBackground,
                                color: colors.secondaryText,
                              }}
                            >
                              {goal.category}
                            </span>
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingGoalId(index)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: colors.primaryBlue }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeInfoBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              aria-label="Edit goal"
                              title="Edit goal"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => removeCareerGoal(index)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: colors.errorRed }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeErrorBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              aria-label="Remove goal"
                              title="Remove goal"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span 
                            className="text-sm font-medium flex items-center gap-1"
                            style={{ color: colors.secondaryText }}
                          >
                            <TrendingUp size={14} />
                            Progress
                          </span>
                          <span 
                            className="text-sm font-bold"
                            style={{ color: colors.badgePurpleText }}
                          >
                            {goal.progress || 0}%
                          </span>
                        </div>
                        <div 
                          className="w-full rounded-full h-3 overflow-hidden"
                          style={{ background: colors.inputBackground }}
                        >
                          <div
                            className="h-full transition-all duration-1000 rounded-full"
                            style={{ 
                              width: `${goal.progress || 0}%`,
                              background: goal.progress >= 100
                                ? `linear-gradient(90deg, ${colors.successGreen}, ${colors.badgeSuccessText})`
                                : `linear-gradient(90deg, ${colors.primaryBlue}, ${colors.badgePurpleText})`
                            }}
                          />
                        </div>
                        {goal.progress >= 100 && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle size={14} style={{ color: colors.successGreen }} />
                            <span className="text-xs" style={{ color: colors.successGreen }}>
                              Goal completed!
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            
            {careerGoals.length === 0 && (
              <div 
                className="text-center py-12"
                style={{ color: colors.tertiaryText }}
              >
                <Target size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText, opacity: 0.5 }} />
                <p className="mb-2">No career goals set yet</p>
                {isEditing && (
                  <button
                    onClick={addCareerGoal}
                    className="mt-4 px-6 py-3 rounded-xl"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Your First Career Goal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
