'use client';

import React from 'react';
import { Briefcase, Star, Target, Trophy, CheckCircle } from 'lucide-react';
import FormField from '../components/FormField';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProfessionalTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function ProfessionalTab({
  userData,
  isEditing,
  onUserDataChange
}: ProfessionalTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Professional Information
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Manage your professional details and career information
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Professional Summary */}
        {userData.professionalSummary && (
          <div 
            className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Briefcase size={24} style={{ color: colors.primaryBlue }} />
              <h3 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Professional Summary
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h4 
                  className="text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: colors.primaryText }}
                >
                  <Target size={16} />
                  Overview
                </h4>
                <p 
                  className="leading-relaxed"
                  style={{ color: colors.secondaryText }}
                >
                  {userData.professionalSummary.overview}
                </p>
              </div>

              {/* Key Strengths */}
              {userData.professionalSummary.keyStrengths && userData.professionalSummary.keyStrengths.length > 0 && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    <Star size={16} />
                    Key Strengths
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {userData.professionalSummary.keyStrengths.map((strength, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2"
                        style={{
                          background: colors.badgeInfoBg,
                          color: colors.badgeInfoText,
                          border: `1px solid ${colors.badgeInfoBorder}`,
                        }}
                      >
                        <CheckCircle size={14} />
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Focus */}
              {userData.professionalSummary.currentFocus && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    <Target size={16} />
                    Current Focus
                  </h4>
                  <p 
                    className="leading-relaxed"
                    style={{ color: colors.secondaryText }}
                  >
                    {userData.professionalSummary.currentFocus}
                  </p>
                </div>
              )}

              {/* Key Achievements */}
              {userData.professionalSummary.achievements && userData.professionalSummary.achievements.length > 0 && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    <Trophy size={16} />
                    Key Achievements
                  </h4>
                  <div className="space-y-3">
                    {userData.professionalSummary.achievements.map((achievement, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{
                          background: colors.badgeWarningBg,
                          border: `1px solid ${colors.badgeWarningBorder}`,
                        }}
                      >
                        <Trophy size={16} className="mt-0.5 flex-shrink-0" style={{ color: colors.badgeWarningText }} />
                        <p style={{ color: colors.primaryText }}>{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Looking For */}
              {userData.professionalSummary.lookingFor && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Looking For
                  </h4>
                  <p 
                    className="leading-relaxed"
                    style={{ color: colors.secondaryText }}
                  >
                    {userData.professionalSummary.lookingFor}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Role & Company */}
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
            Current Position
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Current Role"
              value={userData.currentRole}
              onChange={(value) => onUserDataChange({ currentRole: value })}
              disabled={!isEditing}
              placeholder="e.g., Senior Software Engineer"
            />
            <FormField
              label="Current Company"
              value={userData.currentCompany}
              onChange={(value) => onUserDataChange({ currentCompany: value })}
              disabled={!isEditing}
              placeholder="e.g., Tech Corp"
            />
          </div>
        </div>

        {/* Experience & Industry */}
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
            Experience & Background
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Experience Level
              </label>
              <select
                value={userData.experience}
                onChange={(e) => onUserDataChange({ experience: e.target.value })}
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
                aria-label="Experience Level"
                title="Experience Level"
              >
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Industry
              </label>
              <select
                value={userData.industry}
                onChange={(e) => onUserDataChange({ industry: e.target.value })}
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
                aria-label="Industry"
                title="Industry"
              >
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media</option>
              </select>
            </div>
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Job Level
              </label>
              <select
                value={userData.jobLevel}
                onChange={(e) => onUserDataChange({ jobLevel: e.target.value })}
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
                aria-label="Job Level"
                title="Job Level"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead/Principal</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compensation & Preferences */}
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
            Compensation & Work Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Salary Expectation"
              value={userData.salaryExpectation}
              onChange={(value) => onUserDataChange({ salaryExpectation: value })}
              disabled={!isEditing}
              placeholder="e.g., $120,000 - $150,000"
            />
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Work Preference
              </label>
              <select
                value={userData.workPreference}
                onChange={(e) => onUserDataChange({ workPreference: e.target.value })}
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
                aria-label="Work Preference"
                title="Work Preference"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
