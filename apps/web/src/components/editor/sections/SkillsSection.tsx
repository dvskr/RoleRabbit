'use client';

import React, { useState } from 'react';
import { Plus, X, Edit, Save, Trash2 } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export default function SkillsSection({ skills, onAddSkill, onRemoveSkill }: SkillsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onRemoveSkill(skill);
  };

  const handleEditSkill = (skill: string) => {
    setEditingSkill(skill);
    setEditValue(skill);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editingSkill) {
      onRemoveSkill(editingSkill);
      onAddSkill(editValue.trim());
      setEditingSkill(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSkill(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit size={16} className="text-gray-600" />
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Add New Skill */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {/* Skills List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Current Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-1">
                  {editingSkill === skill ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        <Save size={12} className="text-green-600" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X size={12} className="text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        {skill}
                      </span>
                      <button
                        onClick={() => handleEditSkill(skill)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit size={12} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 size={12} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No skills added yet</p>
              <p className="text-sm">Click edit to add your skills</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
