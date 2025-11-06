'use client';

import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { 
  Camera, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Check, 
  Loader2,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getCroppedImg } from '../../../utils/imageUtils';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProfilePictureEditorProps {
  imageSrc: string;
  onSave: (croppedImageBlob: Blob) => Promise<void>;
  onCancel: () => void;
  onRemove?: () => Promise<void>;
  isExistingPicture?: boolean;
}

export default function ProfilePictureEditor({
  imageSrc,
  onSave,
  onCancel,
  onRemove,
  isExistingPicture = false
}: ProfilePictureEditorProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [aspect] = useState(1); // Square aspect ratio for profile pictures

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsSaving(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      
      // Convert to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      
      await onSave(blob);
    } catch (error) {
      // Error is handled by parent component
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmed) return;

    setIsRemoving(true);
    try {
      await onRemove();
      // onRemove should handle closing the editor
    } catch (error) {
      // Error is handled by parent component
      setIsRemoving(false);
      throw error;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <h2 
            className="text-xl font-semibold"
            style={{ color: colors.primaryText }}
          >
            Edit Profile Picture
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
            style={{ color: colors.secondaryText }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div 
          className="relative w-full"
          style={{ height: '400px', background: '#000' }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="round"
            showGrid={true}
          />
        </div>

        {/* Controls - Compact Layout */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: colors.border }}
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Rotation Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  className="text-xs font-medium flex items-center gap-1.5"
                  style={{ color: colors.secondaryText }}
                >
                  <RotateCw size={14} />
                  Rotation
                </label>
                <span 
                  className="text-xs font-medium"
                  style={{ color: colors.tertiaryText }}
                >
                  {rotation}°
                </span>
              </div>
              <button
                onClick={handleRotate}
                className="w-full px-3 py-2 rounded-lg transition-all hover:shadow-md text-sm"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <RotateCw size={16} className="inline mr-1.5" />
                Rotate 90°
              </button>
            </div>

            {/* Zoom Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  className="text-xs font-medium flex items-center gap-1.5"
                  style={{ color: colors.secondaryText }}
                >
                  <ZoomIn size={14} />
                  Zoom
                </label>
                <span 
                  className="text-xs font-medium"
                  style={{ color: colors.tertiaryText }}
                >
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
                  className="p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-500 transition-colors flex-1"
                  style={{ 
                    color: colors.secondaryText,
                    background: colors.border + '40',
                  }}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: colors.border,
                  }}
                />
                <button
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                  className="p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-500 transition-colors flex-1"
                  style={{ 
                    color: colors.secondaryText,
                    background: colors.border + '40',
                  }}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            {/* Remove button on the left (only for existing pictures) */}
            {isExistingPicture && onRemove && (
              <button
                onClick={handleRemove}
                disabled={isSaving || isRemoving}
                className="px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md text-sm font-medium"
                style={{
                  background: colors.errorRed,
                  color: 'white',
                }}
              >
                {isRemoving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remove
                  </>
                )}
              </button>
            )}
            {!isExistingPicture && <div />}
            
            {/* Cancel and Save buttons on the right */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={onCancel}
                disabled={isSaving || isRemoving}
                className="px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                style={{
                  background: colors.border,
                  color: colors.primaryText,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isRemoving || !croppedAreaPixels}
                className="px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm font-medium"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

