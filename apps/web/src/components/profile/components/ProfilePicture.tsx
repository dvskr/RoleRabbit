'use client';

import React from 'react';
import { Camera, CheckCircle } from 'lucide-react';

interface ProfilePictureProps {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  onChangePhoto: () => void;
}

export default function ProfilePicture({
  firstName,
  lastName,
  profilePicture,
  onChangePhoto
}: ProfilePictureProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
      <div className="flex items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-xl">
            {firstName[0]}{lastName[0]}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
            <CheckCircle size={16} className="text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Picture</h3>
          <p className="text-gray-600 mb-4">Upload a professional photo to make your profile stand out</p>
          <button 
            onClick={onChangePhoto}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Camera size={18} />
            Change Photo
          </button>
          <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB • Recommended: 400x400px</p>
        </div>
      </div>
    </div>
  );
}
