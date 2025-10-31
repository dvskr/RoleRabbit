/**
 * DownloadFormatMenu - Download format dropdown
 */

import React from 'react';
import { DOWNLOAD_FORMATS } from '../constants';

interface DownloadFormatMenuProps {
  colors: any;
  onDownload: (format: 'pdf' | 'doc') => void;
  onClose: () => void;
}

export const DownloadFormatMenu: React.FC<DownloadFormatMenuProps> = ({
  colors,
  onDownload,
  onClose,
}) => {
  return (
    <div 
      className="absolute right-0 mt-2 w-32 rounded-lg shadow-lg z-10"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <button
        onClick={() => {
          onDownload('pdf');
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm transition-colors rounded-t-lg"
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
        {DOWNLOAD_FORMATS.PDF}
      </button>
      <button
        onClick={() => {
          onDownload('doc');
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm transition-colors rounded-b-lg"
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
        {DOWNLOAD_FORMATS.DOC}
      </button>
    </div>
  );
};

