'use client';

import React from 'react';
import { Target, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import { UserData } from '../types/profile';

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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Career Goals & Aspirations
        </h2>
        <p className="text-gray-600">Track your career goals and measure your progress</p>
      </div>
      
      <div className="space-y-8">
        {/* Structured Career Goals */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="text-purple-600" />
            Career Goals
          </h3>
          <div className="space-y-4">
            {Array.isArray(userData.careerGoals) && userData.careerGoals.map((goal, index) => (
              <div key={index} className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{goal.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {goal.targetDate}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded">
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
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-purple-600">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!Array.isArray(userData.careerGoals) || userData.careerGoals.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Target size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No career goals set yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Target Roles */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Target Roles</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {(userData.targetRoles || []).map((role, index) => (
              <span key={index} className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border border-green-200/50">
                {role}
                {isEditing && (
                  <button
                    onClick={() => removeTargetRole(index)}
                    className="text-green-600 hover:text-green-800 transition-colors"
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const role = target.value.trim();
                    addTargetRole(role);
                    target.value = '';
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add
              </button>
            </div>
          )}
        </div>

        {/* Target Companies */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Target Companies</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {(userData.targetCompanies || []).map((company, index) => (
              <span key={index} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border border-purple-200/50">
                {company}
                {isEditing && (
                  <button
                    onClick={() => removeTargetCompany(index)}
                    className="text-purple-600 hover:text-purple-800 transition-colors"
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const company = target.value.trim();
                    addTargetCompany(company);
                    target.value = '';
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add
              </button>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Relocation Willingness</label>
            <select
              value={userData.relocationWillingness}
              onChange={(e) => onUserDataChange({ relocationWillingness: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 hover:border-gray-400"
            >
              <option value="Not willing to relocate">Not willing to relocate</option>
              <option value="Open to relocation">Open to relocation</option>
              <option value="Actively seeking relocation">Actively seeking relocation</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
