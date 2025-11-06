'use client';

import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, X, Check } from 'lucide-react';
import { MODAL_BACKDROP_STYLE, MODAL_MAX_WIDTH } from './constants';

interface Folder {
  id: string;
  name: string;
  color?: string;
}

interface MoveFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (folderId: string | null) => void;
  folders: Folder[];
  currentFolderId: string | null;
  fileName: string;
  colors: any;
}

export const MoveFileModal: React.FC<MoveFileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folders,
  currentFolderId,
  fileName,
  colors,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(currentFolderId);
    }
  }, [isOpen, currentFolderId]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedFolderId);
    onClose();
  };

  const handleSelectRoot = () => {
    setSelectedFolderId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: MODAL_BACKDROP_STYLE, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl p-6 w-full ${MODAL_MAX_WIDTH} shadow-2xl`}
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                background: colors.badgeInfoBg,
              }}
            >
              <Folder size={24} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <h2 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Move File
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: colors.secondaryText }}
              >
                {fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: colors.secondaryText,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p 
            className="text-sm mb-4"
            style={{ color: colors.secondaryText }}
          >
            Select destination folder:
          </p>
          
          <div 
            className="max-h-64 overflow-y-auto rounded-lg border"
            style={{ 
              borderColor: colors.border,
              background: colors.inputBackground,
            }}
          >
            {/* Root option */}
            <button
              onClick={handleSelectRoot}
              className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left"
              style={{
                background: selectedFolderId === null ? colors.badgeInfoBg : 'transparent',
                borderBottom: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (selectedFolderId !== null) {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFolderId !== null) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <FolderOpen 
                size={20} 
                style={{ 
                  color: selectedFolderId === null ? colors.primaryBlue : colors.secondaryText 
                }} 
              />
              <span 
                className="flex-1 font-medium"
                style={{ 
                  color: selectedFolderId === null ? colors.primaryBlue : colors.primaryText 
                }}
              >
                Root (No Folder)
              </span>
              {selectedFolderId === null && (
                <Check size={18} style={{ color: colors.primaryBlue }} />
              )}
            </button>

            {/* Folder list */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left"
                style={{
                  background: selectedFolderId === folder.id ? colors.badgeInfoBg : 'transparent',
                  borderBottom: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (selectedFolderId !== folder.id) {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFolderId !== folder.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Folder 
                  size={20} 
                  style={{ 
                    color: selectedFolderId === folder.id 
                      ? colors.primaryBlue 
                      : (folder.color || colors.secondaryText)
                  }} 
                />
                <span 
                  className="flex-1 font-medium"
                  style={{ 
                    color: selectedFolderId === folder.id ? colors.primaryBlue : colors.primaryText 
                  }}
                >
                  {folder.name}
                </span>
                {selectedFolderId === folder.id && (
                  <Check size={18} style={{ color: colors.primaryBlue }} />
                )}
              </button>
            ))}

            {folders.length === 0 && (
              <div 
                className="px-4 py-8 text-center"
                style={{ color: colors.secondaryText }}
              >
                <p className="text-sm">No folders available</p>
                <p className="text-xs mt-1">Create a folder to organize your files</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors font-medium"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded-lg transition-colors font-medium"
            style={{
              background: colors.primaryBlue,
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
};

