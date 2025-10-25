'use client';

import React from 'react';
import { Award, Globe, Trash2 } from 'lucide-react';
import { UserData } from '../types/profile';

interface SkillsTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function SkillsTab({
  userData,
  isEditing,
  onUserDataChange
}: SkillsTabProps) {
  const addSkill = (skill: string) => {
    if (skill && !userData.skills.includes(skill)) {
      onUserDataChange({ skills: [...userData.skills, skill] });
    }
  };

  const removeSkill = (index: number) => {
    onUserDataChange({ skills: userData.skills.filter((_, i) => i !== index) });
  };

  const addCertification = (cert: string) => {
    if (cert && !userData.certifications.includes(cert)) {
      onUserDataChange({ certifications: [...userData.certifications, cert] });
    }
  };

  const removeCertification = (index: number) => {
    onUserDataChange({ certifications: userData.certifications.filter((_, i) => i !== index) });
  };

  const addLanguage = (lang: string) => {
    if (lang && !userData.languages.includes(lang)) {
      onUserDataChange({ languages: [...userData.languages, lang] });
    }
  };

  const removeLanguage = (index: number) => {
    onUserDataChange({ languages: userData.languages.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Skills & Expertise
        </h2>
        <p className="text-gray-600">Showcase your technical skills, certifications, and language abilities</p>
      </div>
      
      <div className="space-y-8">
        {/* Technical Skills */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Technical Skills</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {userData.skills.map((skill, index) => (
              <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border border-blue-200/50">
                {skill}
                {isEditing && (
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-blue-600 hover:text-blue-800 transition-colors ml-1"
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
                placeholder="Add a technical skill"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const skill = target.value.trim();
                    addSkill(skill);
                    target.value = '';
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Skill
              </button>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Certifications</h3>
          <div className="space-y-4">
            {userData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award size={20} className="text-yellow-600" />
                </div>
                <span className="text-gray-900 font-medium flex-1">{cert}</span>
                {isEditing && (
                  <button
                    onClick={() => removeCertification(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Add certification"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const cert = target.value.trim();
                    addCertification(cert);
                    target.value = '';
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Certification
              </button>
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Languages</h3>
          <div className="space-y-4">
            {userData.languages.map((lang, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe size={20} className="text-green-600" />
                </div>
                <span className="text-gray-900 font-medium flex-1">{lang}</span>
                {isEditing && (
                  <button
                    onClick={() => removeLanguage(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Add language"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const lang = target.value.trim();
                    addLanguage(lang);
                    target.value = '';
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Language
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
