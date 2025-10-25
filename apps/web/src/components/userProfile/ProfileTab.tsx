'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Building, Globe, Calendar, Edit, Save, X } from 'lucide-react';
import { UserProfile } from '../../types/userProfile';

interface ProfileTabProps {
  profileForm: UserProfile;
  setProfileForm: (profile: UserProfile) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: (profile: UserProfile) => void;
}

export default function ProfileTab({ 
  profileForm, 
  setProfileForm, 
  isEditing, 
  setIsEditing, 
  onSave 
}: ProfileTabProps) {
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !profileForm.skills?.includes(skill.trim())) {
      setProfileForm(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill.trim()]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {profileForm.avatar ? (
              <img 
                src={profileForm.avatar} 
                alt={profileForm.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profileForm.name}</h2>
            <p className="text-gray-600">{profileForm.title}</p>
            <p className="text-sm text-gray-500">{profileForm.company}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => onSave(profileForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <User size={20} />
            <span>Basic Information</span>
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                value={profileForm.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="url"
                value={profileForm.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Building size={20} />
            <span>Professional Information</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            <input
              type="text"
              value={profileForm.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={profileForm.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={profileForm.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <input
              type="text"
              value={profileForm.experience || ''}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
            <input
              type="text"
              value={profileForm.education || ''}
              onChange={(e) => handleInputChange('education', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
        <textarea
          value={profileForm.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          disabled={!isEditing}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {profileForm.skills?.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {skill}
              {isEditing && (
                <button
                  onClick={() => handleSkillRemove(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {isEditing && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add a skill"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSkillAdd(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                handleSkillAdd(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar size={20} />
          <span>Account Information</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Member since:</span>
            <p>{new Date(profileForm.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium">Last updated:</span>
            <p>{new Date(profileForm.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
