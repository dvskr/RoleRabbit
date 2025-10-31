/**
 * FileActionsMenu - More options dropdown menu
 */

import React from 'react';
import { Copy, Calendar, Tag, Trash2 } from 'lucide-react';
import { MORE_MENU_OPTIONS } from '../constants';

interface FileActionsMenuProps {
  fileId: string;
  colors: any;
  moreMenuRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

export const FileActionsMenu: React.FC<FileActionsMenuProps> = ({
  fileId,
  colors,
  moreMenuRef,
  onClose,
}) => {
  const handleCopyId = () => {
    navigator.clipboard.writeText(fileId);
    onClose();
  };

  return (
    <div 
      ref={moreMenuRef} 
      className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg z-20"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <button
        onClick={handleCopyId}
        className="w-full px-4 py-2 text-left text-sm transition-colors rounded-t-lg flex items-center space-x-2"
        style={{
          color: colors.primaryText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
          e.currentTarget.style.color = colors.primaryBlue;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.primaryText;
        }}
      >
        <Copy size={14} />
        <span>{MORE_MENU_OPTIONS.COPY_ID}</span>
      </button>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2"
        style={{
          color: colors.primaryText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
          e.currentTarget.style.color = colors.primaryBlue;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.primaryText;
        }}
      >
        <Calendar size={14} />
        <span>{MORE_MENU_OPTIONS.VIEW_HISTORY}</span>
      </button>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2"
        style={{
          color: colors.primaryText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
          e.currentTarget.style.color = colors.primaryBlue;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.primaryText;
        }}
      >
        <Tag size={14} />
        <span>{MORE_MENU_OPTIONS.MANAGE_TAGS}</span>
      </button>
      <div style={{ borderTop: `1px solid ${colors.border}` }}></div>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-sm transition-colors rounded-b-lg flex items-center space-x-2"
        style={{
          color: colors.errorRed,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.badgeErrorBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Trash2 size={14} />
        <span>{MORE_MENU_OPTIONS.DELETE_PERMANENTLY}</span>
      </button>
    </div>
  );
};

