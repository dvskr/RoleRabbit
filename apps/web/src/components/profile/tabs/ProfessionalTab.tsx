'use client';

import React from 'react';
import { Briefcase, Star, Target, Trophy, CheckCircle } from 'lucide-react';
import FormField from '../components/FormField';
import { UserData } from '../types/profile';

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
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Professional Information
        </h2>
        <p className="text-gray-600">Manage your professional details and career information</p>
      </div>
      
      <div className="space-y-8">
        {/* Professional Summary */}
        {userData.professionalSummary && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">Professional Summary</h3>
            </div>
            
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Overview
                </h4>
                <p className="text-gray-700 leading-relaxed">{userData.professionalSummary.overview}</p>
              </div>

              {/* Key Strengths */}
              {userData.professionalSummary.keyStrengths && userData.professionalSummary.keyStrengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Star size={16} />
                    Key Strengths
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {userData.professionalSummary.keyStrengths.map((strength, index) => (
                      <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium shadow-sm border border-blue-200/50 flex items-center gap-2">
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Target size={16} />
                    Current Focus
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{userData.professionalSummary.currentFocus}</p>
                </div>
              )}

              {/* Key Achievements */}
              {userData.professionalSummary.achievements && userData.professionalSummary.achievements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Trophy size={16} />
                    Key Achievements
                  </h4>
                  <div className="space-y-3">
                    {userData.professionalSummary.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50">
                        <Trophy size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Looking For */}
              {userData.professionalSummary.lookingFor && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Looking For</h4>
                  <p className="text-gray-700 leading-relaxed">{userData.professionalSummary.lookingFor}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Role & Company */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Current Position</h3>
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Experience & Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Experience Level</label>
              <select
                value={userData.experience}
                onChange={(e) => onUserDataChange({ experience: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Industry</label>
              <select
                value={userData.industry}
                onChange={(e) => onUserDataChange({ industry: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
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
              <label className="block text-sm font-semibold text-gray-700">Job Level</label>
              <select
                value={userData.jobLevel}
                onChange={(e) => onUserDataChange({ jobLevel: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Compensation & Work Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Salary Expectation"
              value={userData.salaryExpectation}
              onChange={(value) => onUserDataChange({ salaryExpectation: value })}
              disabled={!isEditing}
              placeholder="e.g., $120,000 - $150,000"
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Work Preference</label>
              <select
                value={userData.workPreference}
                onChange={(e) => onUserDataChange({ workPreference: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
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
