'use client';

import React from 'react';
import FormField from '../components/FormField';
import ProfilePicture from '../components/ProfilePicture';
import { UserData } from '../types/profile';

interface ProfileTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
  onChangePhoto: () => void;
}

export default function ProfileTab({
  userData,
  isEditing,
  onUserDataChange,
  onChangePhoto
}: ProfileTabProps) {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Update your personal details and profile information</p>
      </div>
      
      <div className="space-y-8">
        {/* Enhanced Profile Picture */}
        <ProfilePicture
          firstName={userData.firstName}
          lastName={userData.lastName}
          profilePicture={userData.profilePicture}
          onChangePhoto={onChangePhoto}
        />

        {/* Enhanced Basic Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="First Name"
              value={userData.firstName}
              onChange={(value) => onUserDataChange({ firstName: value })}
              disabled={!isEditing}
              placeholder="Enter your first name"
            />
            <FormField
              label="Last Name"
              value={userData.lastName}
              onChange={(value) => onUserDataChange({ lastName: value })}
              disabled={!isEditing}
              placeholder="Enter your last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField
              label="Email Address"
              type="email"
              value={userData.email}
              onChange={(value) => onUserDataChange({ email: value })}
              disabled={!isEditing}
              placeholder="Enter your email address"
            />
            <FormField
              label="Phone Number"
              type="tel"
              value={userData.phone}
              onChange={(value) => onUserDataChange({ phone: value })}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mt-6">
            <FormField
              label="Location"
              value={userData.location}
              onChange={(value) => onUserDataChange({ location: value })}
              disabled={!isEditing}
              placeholder="Enter your location"
            />
          </div>
        </div>

        {/* Enhanced Bio Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Professional Bio</h3>
          <div className="space-y-2">
            <FormField
              label="Tell us about yourself"
              type="textarea"
              value={userData.bio}
              onChange={(value) => onUserDataChange({ bio: value })}
              disabled={!isEditing}
              rows={4}
              placeholder="Write a compelling bio that highlights your experience, skills, and career goals..."
            />
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>This will be visible to recruiters and potential employers</span>
              <span>{userData.bio.length}/500 characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
