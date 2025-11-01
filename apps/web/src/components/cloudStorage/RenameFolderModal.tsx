'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import { RenameFolderModalProps } from './types';
import { MODAL_BACKDROP_STYLE, MODAL_MAX_WIDTH } from './constants';

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  onConfirm,
  colors,
}) => {
  const [folderName, setFolderName] = useState(folder?.name || '');

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name);
    }
  }, [folder]);

  if (!isOpen || !folder) return null;

  const handleConfirm = () => {
    if (folderName.trim()) {
      onConfirm(folder.id, folderName.trim());
      setFolderName('');
    }
  };

  const handleClose = () => {
    setFolderName('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: MODAL_BACKDROP_STYLE, backdropFilter: 'blur(4px)' }}
    >
      <div 
        className={`rounded-2xl p-6 w-full ${MODAL_MAX_WIDTH} shadow-2xl`}
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                background: colors.badgeInfoBg,
              }}
            >
              <Pencil size={24} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <h3 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Rename Folder
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                Update folder name
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close rename folder modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.primaryText }}
            >
              Folder Name <span style={{ color: colors.errorRed }}>*</span>
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 rounded-lg transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
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
            disabled={!folderName.trim()}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: !folderName.trim() ? colors.inputBackground : colors.primaryBlue,
              color: !folderName.trim() ? colors.tertiaryText : 'white',
              opacity: !folderName.trim() ? 0.5 : 1,
              cursor: !folderName.trim() ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (folderName.trim()) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (folderName.trim()) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
};

