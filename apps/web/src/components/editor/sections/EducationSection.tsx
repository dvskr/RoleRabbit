'use client';

import React, { useState } from 'react';
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react';
import { Education } from '../../../types/resume';

interface EducationSectionProps {
  education: Education[];
  onAddEducation: (education: Education) => void;
  onUpdateEducation: (id: number, updates: Partial<Education>) => void;
  onRemoveEducation: (id: number) => void;
}

export default function EducationSection({
  education,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation
}: EducationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    school: '',
    degree: '',
    startDate: '',
    endDate: '',
    gpa: '',
    location: ''
  });

  const handleAddEducation = () => {
    if (newEducation.school && newEducation.degree) {
      onAddEducation({
        id: Date.now(),
        school: newEducation.school!,
        degree: newEducation.degree!,
        startDate: newEducation.startDate || '',
        endDate: newEducation.endDate || '',
        gpa: newEducation.gpa || '',
        location: newEducation.location || ''
      });
      setNewEducation({
        school: '',
        degree: '',
        startDate: '',
        endDate: '',
        gpa: '',
        location: ''
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Education
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Education Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Education</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School/University</label>
                <input
                  type="text"
                  value={newEducation.school}
                  onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                  placeholder="e.g., Aug 2020"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="text"
                  value={newEducation.endDate}
                  onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                  placeholder="e.g., May 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                <input
                  type="text"
                  value={newEducation.gpa}
                  onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
                  placeholder="e.g., 3.8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newEducation.location}
                onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddEducation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Add Education
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

      {/* Education List */}
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
                <p className="text-gray-700 font-medium">{edu.school}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{edu.startDate} - {edu.endDate}</span>
                  <span>{edu.location}</span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemoveEducation(edu.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {education.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No education added yet</p>
          <p className="text-sm">Click "Add Education" to get started</p>
        </div>
      )}
    </div>
  );
}
