'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ThemeColors } from '../../../../contexts/ThemeContext';

interface FileCardMetadataProps {
  formattedDateTime: string;
  relativeUpdated: string;
  formattedSize: string;
  commentsCount: number;
  colors: ThemeColors;
}

export const FileCardMetadata: React.FC<FileCardMetadataProps> = ({
  formattedDateTime,
  relativeUpdated,
  formattedSize,
  commentsCount,
  colors,
}) => {
  return (
    <div className="mb-4 space-y-1">
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: colors.secondaryText }}
      >
        <span>{formattedDateTime}</span>
        <span style={{ color: colors.tertiaryText }}>({relativeUpdated})</span>
      </div>
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: colors.secondaryText }}
      >
        <span>{formattedSize}</span>
        {commentsCount > 0 && (
          <>
            <span style={{ color: colors.tertiaryText }}>•</span>
            <div className="flex items-center gap-1">
              <MessageCircle size={14} style={{ color: colors.secondaryText }} />
              <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
