'use client';

import React, { useRef, useState } from 'react';
import { Camera, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';

interface ProfilePictureProps {
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  onChangePhoto: (newPictureUrl: string) => void;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please select an image file (JPEG, PNG, GIF, or WebP).');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File too large. Please select an image smaller than 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const response = await apiService.uploadProfilePicture(file);
      if (response.success && response.profilePicture) {
        onChangePhoto(response.profilePicture);
        setPreviewUrl(null); // Clear preview since we have the actual URL now
        logger.debug('Profile picture uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      logger.error('Failed to upload profile picture:', error);
      setUploadError(error.message || 'Failed to upload profile picture. Please try again.');
      setPreviewUrl(null); // Clear preview on error
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          {previewUrl || profilePicture ? (
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl relative">
              <img 
                src={previewUrl || profilePicture || ''} 
                alt={`${firstName || 'User'} ${lastName || ''}`} 
                className="w-full h-full object-cover" 
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
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
          {!isUploading && (previewUrl || profilePicture) && (
            <div 
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: colors.successGreen,
                border: `4px solid ${colors.cardBackground}`,
              }}
            >
              <CheckCircle size={16} className="text-white" />
            </div>
          )}
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
            id="profile-picture-upload"
            name="profile-picture-upload"
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload profile picture"
            title="Upload profile picture"
          />
          <button 
            onClick={handleButtonClick}
            disabled={isUploading}
            className="px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.background = colors.primaryBlueHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera size={18} />
                Change Photo
              </>
            )}
          </button>
          {uploadError && (
            <p 
              className="text-sm mt-2"
              style={{ color: '#ef4444' }}
            >
              {uploadError}
            </p>
          )}
          {!uploadError && (
            <p 
              className="text-sm mt-2"
              style={{ color: colors.tertiaryText }}
            >
              JPG, PNG, GIF, WebP up to 5MB • Recommended: 400x400px
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
