'use client';

import React from 'react';
import { Target, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

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
  const addTargetRole = (role: string) => {
    if (role && !userData.targetRoles.includes(role)) {
      onUserDataChange({ targetRoles: [...userData.targetRoles, role] });
    }
  };

  const removeTargetRole = (index: number) => {
    onUserDataChange({ targetRoles: userData.targetRoles.filter((_, i) => i !== index) });
  };

  const addTargetCompany = (company: string) => {
    if (company && !userData.targetCompanies.includes(company)) {
      onUserDataChange({ targetCompanies: [...userData.targetCompanies, company] });
    }
  };

  const removeTargetCompany = (index: number) => {
    onUserDataChange({ targetCompanies: userData.targetCompanies.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Career Goals & Aspirations
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Track your career goals and measure your progress
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Structured Career Goals */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6 flex items-center gap-2"
            style={{ color: colors.primaryText }}
          >
            <Target style={{ color: colors.badgePurpleText }} />
            Career Goals
          </h3>
          <div className="space-y-4">
            {Array.isArray(userData.careerGoals) && userData.careerGoals.map((goal, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.badgePurpleBg,
                  border: `1px solid ${colors.badgePurpleBorder}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.badgePurpleBorder;
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {goal.title}
                    </h4>
                    <p 
                      className="text-sm mb-3"
                      style={{ color: colors.secondaryText }}
                    >
                      {goal.description}
                    </p>
                    <div 
                      className="flex items-center gap-4 text-xs"
                      style={{ color: colors.tertiaryText }}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {goal.targetDate}
                      </span>
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
                    <button
                      onClick={() => {
                        const updated = userData.careerGoals.filter((_, i) => i !== index);
                        onUserDataChange({ careerGoals: updated });
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: colors.errorRed }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.badgeErrorBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      aria-label={`Remove ${goal.title}`}
                      title={`Remove ${goal.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: colors.secondaryText }}
                    >
                      Progress
                    </span>
                    <span 
                      className="text-sm font-bold"
                      style={{ color: colors.badgePurpleText }}
                    >
                      {goal.progress}%
                    </span>
                  </div>
                  <div 
                    className="w-full rounded-full h-3 overflow-hidden"
                    style={{ background: colors.inputBackground }}
                  >
                    <div
                      className="h-full transition-all duration-1000 rounded-full"
                      style={{ 
                        width: `${goal.progress}%`,
                        background: `linear-gradient(90deg, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!Array.isArray(userData.careerGoals) || userData.careerGoals.length === 0) && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <Target size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No career goals set yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Target Roles */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Target Roles
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {(userData.targetRoles || []).map((role, index) => (
              <span 
                key={index} 
                className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                style={{
                  background: colors.badgeSuccessBg,
                  color: colors.badgeSuccessText,
                  border: `1px solid ${colors.badgeSuccessBorder}`,
                }}
              >
                {role}
                {isEditing && (
                  <button
                    onClick={() => removeTargetRole(index)}
                    className="transition-colors"
                    style={{ color: colors.badgeSuccessText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.errorRed;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.badgeSuccessText;
                    }}
                    aria-label={`Remove ${role}`}
                    title={`Remove ${role}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add target role"
                className="flex-1 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const role = target.value.trim();
                    addTargetRole(role);
                    target.value = '';
                  }
                }}
              />
              <button 
                className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  background: colors.successGreen,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Target Companies */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Target Companies
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {(userData.targetCompanies || []).map((company, index) => (
              <span 
                key={index} 
                className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                style={{
                  background: colors.badgePurpleBg,
                  color: colors.badgePurpleText,
                  border: `1px solid ${colors.badgePurpleBorder}`,
                }}
              >
                {company}
                {isEditing && (
                  <button
                    onClick={() => removeTargetCompany(index)}
                    className="transition-colors"
                    style={{ color: colors.badgePurpleText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.errorRed;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.badgePurpleText;
                    }}
                    aria-label={`Remove ${company}`}
                    title={`Remove ${company}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add target company"
                className="flex-1 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const company = target.value.trim();
                    addTargetCompany(company);
                    target.value = '';
                  }
                }}
              />
              <button 
                className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  background: colors.badgePurpleText,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Preferences
          </h3>
          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: colors.primaryText }}
            >
              Relocation Willingness
            </label>
            <select
              value={userData.relocationWillingness}
              onChange={(e) => onUserDataChange({ relocationWillingness: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
              aria-label="Relocation Willingness"
              title="Relocation Willingness"
            >
              <option value="Not willing to relocate" style={{ background: colors.background, color: colors.secondaryText }}>Not willing to relocate</option>
              <option value="Open to relocation" style={{ background: colors.background, color: colors.secondaryText }}>Open to relocation</option>
              <option value="Actively seeking relocation" style={{ background: colors.background, color: colors.secondaryText }}>Actively seeking relocation</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
