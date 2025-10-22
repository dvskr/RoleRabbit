'use client';

import React, { useState } from 'react';
import { Plus, Edit, Save, X, Trash2, GripVertical } from 'lucide-react';
import { Experience } from '../../../types/resume';

interface ExperienceSectionProps {
  experiences: Experience[];
  onAddExperience: (experience: Experience) => void;
  onUpdateExperience: (id: number, updates: Partial<Experience>) => void;
  onRemoveExperience: (id: number) => void;
}

export default function ExperienceSection({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience
}: ExperienceSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    company: '',
    role: '',
    period: '',
    endPeriod: '',
    location: '',
    skills: [],
    bullets: []
  });

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.role) {
      onAddExperience({
        id: Date.now(),
        company: newExperience.company!,
        role: newExperience.role!,
        period: newExperience.period || '',
        endPeriod: newExperience.endPeriod || '',
        location: newExperience.location || '',
        skills: newExperience.skills || [],
        bullets: newExperience.bullets || []
      });
      setNewExperience({
        company: '',
        role: '',
        period: '',
        endPeriod: '',
        location: '',
        skills: [],
        bullets: []
      });
      setShowAddForm(false);
    }
  };

  const handleEditExperience = (id: number) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: number, updates: Partial<Experience>) => {
    onUpdateExperience(id, updates);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddBullet = (id: number, bullet: string) => {
    const experience = experiences.find(exp => exp.id === id);
    if (experience && bullet.trim()) {
      onUpdateExperience(id, {
        bullets: [...experience.bullets, bullet.trim()]
      });
    }
  };

  const handleRemoveBullet = (id: number, bulletIndex: number) => {
    const experience = experiences.find(exp => exp.id === id);
    if (experience) {
      const newBullets = experience.bullets.filter((_, index) => index !== bulletIndex);
      onUpdateExperience(id, { bullets: newBullets });
    }
  };

  const handleAddSkill = (id: number, skill: string) => {
    const experience = experiences.find(exp => exp.id === id);
    if (experience && skill.trim()) {
      onUpdateExperience(id, {
        skills: [...experience.skills, skill.trim()]
      });
    }
  };

  const handleRemoveSkill = (id: number, skillIndex: number) => {
    const experience = experiences.find(exp => exp.id === id);
    if (experience) {
      const newSkills = experience.skills.filter((_, index) => index !== skillIndex);
      onUpdateExperience(id, { skills: newSkills });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Professional Experience</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Experience
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Experience Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Experience</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={newExperience.period}
                  onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                  placeholder="e.g., Jan 2020"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="text"
                  value={newExperience.endPeriod}
                  onChange={(e) => setNewExperience({ ...newExperience, endPeriod: e.target.value })}
                  placeholder="e.g., Present"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newExperience.location}
                  onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddExperience}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Add Experience
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experiences List */}
      <div className="space-y-6">
        {experiences.map((experience) => (
          <div key={experience.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-semibold text-gray-900">{experience.role}</h4>
                  {isEditing && (
                    <button
                      onClick={() => handleEditExperience(experience.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit size={14} className="text-gray-600" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 font-medium">{experience.company}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{experience.period} - {experience.endPeriod}</span>
                  <span>{experience.location}</span>
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemoveExperience(experience.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              )}
            </div>

            {/* Skills */}
            {experience.skills.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Skills:</span>
                  {isEditing && (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Add skill..."
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSkill(experience.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {experience.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {skill}
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(experience.id, index)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <X size={10} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Points */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Key Achievements:</span>
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add achievement..."
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddBullet(experience.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <ul className="space-y-1">
                {experience.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="flex-1">{bullet}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveBullet(experience.id, index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X size={12} className="text-red-600" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No experience added yet</p>
          <p className="text-sm">Click "Add Experience" to get started</p>
        </div>
      )}
    </div>
  );
}
