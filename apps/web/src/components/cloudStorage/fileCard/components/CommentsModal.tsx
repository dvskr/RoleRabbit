/**
 * CommentsModal - Modal/section for displaying and adding comments
 */

import React from 'react';
import { MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { FileComment } from '../../../types/cloudStorage';
import { COMMENTS } from '../constants';
import { formatRelativeTime } from '../../../../utils/formatters';
import { MAX_COMMENT_LENGTH } from '../../../../utils/validation';

interface CommentsModalProps {
  comments: FileComment[];
  colors: any;
  commentsState: {
    showComments: boolean;
    newComment: string;
    setNewComment: (comment: string) => void;
    handleCommentSubmit: () => void | Promise<void>;
    closeComments: () => void;
    isLoadingComments?: boolean;
    isSubmitting?: boolean;
    submitSuccess?: boolean;
    error?: string | null;
  };
}

const CommentsModalComponent: React.FC<CommentsModalProps> = ({
  comments: fileComments,
  colors,
  commentsState,
}) => {
  if (!commentsState.showComments) return null;

  // Always show comments if they exist, regardless of loading state
  // This ensures instant display without flashing
  // Use fileComments directly - they're already loaded from API
  const hasComments = Array.isArray(fileComments) && fileComments.length > 0;
  // Only show loading if we truly don't have comments AND are loading
  const showLoading = commentsState.isLoadingComments && !hasComments;

  return (
    <div 
      className="mt-4 pt-4 w-full max-w-full overflow-hidden"
      style={{ borderTop: `1px solid ${colors.border}` }}
    >
      <div className="space-y-3 max-w-full">
        {/* Error Message */}
        {commentsState.error && (
          <div 
            className="px-3 py-2 rounded-lg text-sm mb-2"
            style={{
              background: colors.badgeErrorBg,
              color: colors.errorRed,
              border: `1px solid ${colors.errorRed}`
            }}
          >
            {commentsState.error}
          </div>
        )}

        {/* Loading State - Only show if no comments exist yet */}
        {showLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.secondaryText }} />
            <span className="ml-2 text-sm" style={{ color: colors.secondaryText }}>Loading comments...</span>
          </div>
        )}

        {/* Existing Comments - Show immediately, no delay */}
        {hasComments ? (
          fileComments.map((comment) => (
            <div 
              key={comment.id} 
              className="flex space-x-3 max-w-full"
            >
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
                    title={new Date(comment.timestamp).toLocaleString()}
                  >
                    {formatRelativeTime(new Date(comment.timestamp))}
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
        ) : !showLoading && (
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
              onChange={(e) => {
                const value = e.target.value;
                // FE-028: Enforce max length
                if (value.length <= MAX_COMMENT_LENGTH) {
                  commentsState.setNewComment(value);
                }
              }}
              placeholder={COMMENTS.PLACEHOLDER}
              maxLength={MAX_COMMENT_LENGTH}
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
            <p className="text-xs mt-1" style={{ 
              color: commentsState.newComment.length > MAX_COMMENT_LENGTH * 0.9 
                ? colors.errorRed 
                : colors.tertiaryText 
            }}>
              {commentsState.newComment.length} / {MAX_COMMENT_LENGTH} characters
            </p>
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={commentsState.handleCommentSubmit}
                disabled={!commentsState.newComment.trim() || commentsState.isSubmitting || commentsState.submitSuccess}
                className="px-3 py-1 text-white text-sm rounded-lg transition-all whitespace-nowrap flex items-center space-x-2"
                style={{
                  background: commentsState.submitSuccess 
                    ? colors.successGreen 
                    : !commentsState.newComment.trim() || commentsState.isSubmitting 
                    ? colors.inputBackground 
                    : colors.primaryBlue,
                  color: commentsState.submitSuccess || (!commentsState.newComment.trim() && !commentsState.isSubmitting) 
                    ? 'white' 
                    : commentsState.isSubmitting 
                    ? colors.tertiaryText 
                    : 'white',
                  opacity: (!commentsState.newComment.trim() && !commentsState.submitSuccess && !commentsState.isSubmitting) ? 0.5 : 1,
                  cursor: (!commentsState.newComment.trim() && !commentsState.submitSuccess) || commentsState.isSubmitting ? 'not-allowed' : 'pointer',
                  transform: commentsState.submitSuccess ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
                aria-label={commentsState.submitSuccess ? "Comment saved" : "Submit comment"}
                aria-busy={commentsState.isSubmitting || commentsState.submitSuccess}
              >
                {commentsState.submitSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : commentsState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{COMMENTS.SUBMIT_BUTTON}</span>
                )}
              </button>
              <button
                onClick={commentsState.closeComments}
                className="px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap"
                disabled={commentsState.isSubmitting || commentsState.submitSuccess}
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                  opacity: (commentsState.isSubmitting || commentsState.submitSuccess) ? 0.5 : 1,
                  cursor: (commentsState.isSubmitting || commentsState.submitSuccess) ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!commentsState.isSubmitting && !commentsState.submitSuccess) {
                    e.currentTarget.style.background = colors.hoverBackgroundStrong;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!commentsState.isSubmitting && !commentsState.submitSuccess) {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
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

// Memoize to prevent unnecessary re-renders
export const CommentsModal = React.memo(CommentsModalComponent, (prevProps, nextProps) => {
  // Only re-render if comments actually changed or modal state changed
  const commentsChanged = 
    prevProps.comments?.length !== nextProps.comments?.length ||
    JSON.stringify(prevProps.comments?.map(c => c.id)) !== JSON.stringify(nextProps.comments?.map(c => c.id));
  
  const stateChanged = 
    prevProps.commentsState.showComments !== nextProps.commentsState.showComments ||
    prevProps.commentsState.isLoadingComments !== nextProps.commentsState.isLoadingComments ||
    prevProps.commentsState.isSubmitting !== nextProps.commentsState.isSubmitting ||
    prevProps.commentsState.submitSuccess !== nextProps.commentsState.submitSuccess ||
    prevProps.commentsState.newComment !== nextProps.commentsState.newComment;
  
  // Re-render only if something actually changed
  return !commentsChanged && !stateChanged;
});

