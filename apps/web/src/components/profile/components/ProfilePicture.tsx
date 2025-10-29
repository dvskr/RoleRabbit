'use client';

import React, { useRef } from 'react';
import { Camera, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProfilePictureProps {
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  onChangePhoto: () => void;
}

export default function ProfilePicture({
  firstName,
  lastName,
  profilePicture,
  onChangePhoto
}: ProfilePictureProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload (this would typically upload to a server)
      const reader = new FileReader();
      reader.onloadend = () => {
        // Here you would update the profile picture URL
        console.log('File selected:', file.name);
        // Trigger the parent's onChangePhoto callback
        onChangePhoto();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center gap-8">
        <div className="relative">
          {profilePicture ? (
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl">
              <img src={profilePicture} alt={`${firstName || 'User'} ${lastName || ''}`} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div 
              className="w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                color: 'white',
              }}
            >
              {(firstName || 'U')[0]}{(lastName || 'S')[0]}
            </div>
          )}
          <div 
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: colors.successGreen,
              border: `4px solid ${colors.cardBackground}`,
            }}
          >
            <CheckCircle size={16} className="text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: colors.primaryText }}
          >
            Profile Picture
          </h3>
          <p 
            className="mb-4"
            style={{ color: colors.secondaryText }}
          >
            Upload a professional photo to make your profile stand out
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload profile picture"
            title="Upload profile picture"
          />
          <button 
            onClick={handleButtonClick}
            className="px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryBlueHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
            }}
          >
            <Camera size={18} />
            Change Photo
          </button>
          <p 
            className="text-sm mt-2"
            style={{ color: colors.tertiaryText }}
          >
            JPG, PNG up to 5MB • Recommended: 400x400px
          </p>
        </div>
      </div>
    </div>
  );
}
