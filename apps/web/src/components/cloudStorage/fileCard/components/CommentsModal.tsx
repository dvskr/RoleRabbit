/**
 * CommentsModal - Modal/section for displaying and adding comments
 */

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { FileComment } from '../../../types/cloudStorage';
import { COMMENTS } from '../constants';

interface CommentsModalProps {
  comments: FileComment[];
  colors: any;
  commentsState: {
    showComments: boolean;
    newComment: string;
    setNewComment: (comment: string) => void;
    handleCommentSubmit: () => void;
    closeComments: () => void;
  };
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  comments: fileComments,
  colors,
  commentsState,
}) => {
  if (!commentsState.showComments) return null;

  return (
    <div 
      className="mt-4 pt-4 w-full max-w-full overflow-hidden"
      style={{ borderTop: `1px solid ${colors.border}` }}
    >
      <div className="space-y-3 max-w-full">
        {/* Existing Comments */}
        {fileComments && fileComments.length > 0 ? (
          fileComments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 max-w-full">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                }}
              >
                <span className="text-xs text-white font-medium">
                  {comment.userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    {comment.userName || 'User'}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: colors.secondaryText }}
                  >
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p 
                  className="text-sm break-words"
                  style={{ color: colors.primaryText }}
                >
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div 
            className="text-center py-4 text-sm"
            style={{ color: colors.secondaryText }}
          >
            {COMMENTS.EMPTY_STATE}
          </div>
        )}
        
        {/* Add Comment */}
        <div className="flex space-x-3 max-w-full">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: colors.inputBackground,
            }}
          >
            <span 
              className="text-xs font-medium"
              style={{ color: colors.secondaryText }}
            >
              U
            </span>
          </div>
          <div className="flex-1 min-w-0 max-w-full">
            <textarea
              value={commentsState.newComment}
              onChange={(e) => commentsState.setNewComment(e.target.value)}
              placeholder={COMMENTS.PLACEHOLDER}
              className="w-full max-w-full px-3 py-2 rounded-lg focus:outline-none resize-none text-sm box-border transition-all"
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
              rows={2}
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={commentsState.handleCommentSubmit}
                disabled={!commentsState.newComment.trim()}
                className="px-3 py-1 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                style={{
                  background: !commentsState.newComment.trim() ? colors.inputBackground : colors.primaryBlue,
                  color: !commentsState.newComment.trim() ? colors.tertiaryText : 'white',
                  opacity: !commentsState.newComment.trim() ? 0.5 : 1,
                  cursor: !commentsState.newComment.trim() ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (commentsState.newComment.trim()) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (commentsState.newComment.trim()) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {COMMENTS.SUBMIT_BUTTON}
              </button>
              <button
                onClick={commentsState.closeComments}
                className="px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap"
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
                {COMMENTS.CANCEL_BUTTON}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

