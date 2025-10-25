'use client';

import React from 'react';
import { Save, Edit } from 'lucide-react';
import { ProfileHeaderProps } from '../types/profile';

export default function ProfileHeader({
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave
}: ProfileHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 flex-shrink-0 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mt-1 text-sm">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
          {!isEditing && (
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
