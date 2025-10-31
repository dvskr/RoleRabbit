'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface CommentModalProps {
  isOpen: boolean;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function CommentModal({
  isOpen,
  comment,
  onCommentChange,
  onSubmit,
  onClose
}: CommentModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" style={{ background: colors.background }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
          <h2 className="text-xl font-bold text-white">Add Comment</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'white' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.secondaryText }}>Your Comment</label>
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Write your comment here..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg resize-none"
              style={{
                background: colors.inputBackground,
                border: `2px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!comment.trim()}
              className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: comment.trim() 
                  ? `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`
                  : colors.inputBackground,
                color: comment.trim() ? 'white' : colors.tertiaryText,
              }}
              onMouseEnter={(e) => {
                if (comment.trim()) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (comment.trim()) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

