'use client';

import React from 'react';
import { Paperclip, X } from 'lucide-react';

interface AttachmentListProps {
  attachments: string[];
  onRemove: (index: number) => void;
  colors: {
    primaryText: string;
    inputBackground: string;
    border: string;
    errorRed: string;
  };
}

export function AttachmentList({ attachments, onRemove, colors }: AttachmentListProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
        Attachments
      </p>
      <div className="flex flex-wrap gap-2">
        {attachments.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
          >
            <Paperclip size={14} />
            <span>{file}</span>
            <button
              onClick={() => onRemove(idx)}
              className="ml-2 transition-colors"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              title="Remove attachment"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

