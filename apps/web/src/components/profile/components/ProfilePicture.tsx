'use client';

import React, { useRef, useState } from 'react';
import { Camera, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';
import ProfilePictureEditor from './ProfilePictureEditor';
import { compressImage } from '@/utils/imageUtils';

interface ProfilePictureProps {
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  onChangePhoto: (newPictureUrl: string | null) => void;
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
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please select an image file (JPEG, PNG, GIF, or WebP).');
      return;
    }

    // Validate file size (10MB max before compression)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File too large. Please select an image smaller than 10MB.');
      return;
    }

    // Show image in editor for cropping
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setShowEditor(true);
      setPreviewUrl(null);
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveCropped = async (croppedBlob: Blob) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Compress the cropped image
      const compressedBlob = await compressImage(
        new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' }),
        800, // max width
        0.9 // quality
      );

      // Upload to server
      const response = await apiService.uploadProfilePicture(compressedBlob);
      if (response.success && response.profilePicture) {
        onChangePhoto(response.profilePicture);
        setShowEditor(false);
        setSelectedImage(null);
        logger.debug('Profile picture uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      logger.error('Failed to upload profile picture:', error);
      setUploadError(error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };


  const handleRemovePicture = async () => {
    if (!profilePicture) return;
    
    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmed) return;

    setIsUploading(true);
    setUploadError(null);
    
    try {
      await apiService.deleteProfilePicture();
      onChangePhoto(null);
      setPreviewUrl(null);
      logger.debug('Profile picture removed successfully');
    } catch (error: any) {
      logger.error('Failed to remove profile picture:', error);
      setUploadError(error.message || 'Failed to remove profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {showEditor && selectedImage && (
        <ProfilePictureEditor
          imageSrc={selectedImage}
          onSave={handleSaveCropped}
          onCancel={() => {
            setShowEditor(false);
            setSelectedImage(null);
          }}
          onRemove={async () => {
            await handleRemovePicture();
            setShowEditor(false);
            setSelectedImage(null);
          }}
          isExistingPicture={!!profilePicture}
        />
      )}
      
      <div 
        className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-8">
          <div className="relative group">
            {previewUrl || profilePicture ? (
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl relative">
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
                className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl"
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
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center z-10"
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
              className="text-xl font-semibold mb-3"
              style={{ color: colors.primaryText }}
            >
              Profile Picture
            </h3>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                id="profile-picture-upload"
                name="profile-picture-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload profile picture"
                title="Upload profile picture"
              />
              <button 
                onClick={handleButtonClick}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    {profilePicture ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </button>
            </div>
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
                className="text-xs mt-2"
                style={{ color: colors.tertiaryText }}
              >
                JPG, PNG, WebP up to 10MB • Recommended: 800x800px
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
