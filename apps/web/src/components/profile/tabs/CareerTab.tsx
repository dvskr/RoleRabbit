'use client';

import React from 'react';
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Career Goals & Preferences</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
          <textarea
            value={userData.careerGoals}
            onChange={(e) => onUserDataChange({ careerGoals: e.target.value })}
            disabled={!isEditing}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Describe your career aspirations..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {userData.targetRoles.map((role, index) => (
              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                {role}
                {isEditing && (
                  <button
                    onClick={() => removeTargetRole(index)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add target role"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const role = target.value.trim();
                    addTargetRole(role);
                    target.value = '';
                  }
                }}
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Companies</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {userData.targetCompanies.map((company, index) => (
              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
                {company}
                {isEditing && (
                  <button
                    onClick={() => removeTargetCompany(index)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add target company"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const company = target.value.trim();
                    addTargetCompany(company);
                    target.value = '';
                  }
                }}
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relocation Willingness</label>
          <select
            value={userData.relocationWillingness}
            onChange={(e) => onUserDataChange({ relocationWillingness: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="Not willing to relocate">Not willing to relocate</option>
            <option value="Open to relocation">Open to relocation</option>
            <option value="Actively seeking relocation">Actively seeking relocation</option>
          </select>
        </div>
      </div>
    </div>
  );
}
