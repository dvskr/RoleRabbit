'use client';

import React from 'react';
import { User, Clock, ThumbsUp, Reply } from 'lucide-react';
import type { CommentWithChildren } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface CommentTreeProps {
  comments: CommentWithChildren[];
  depth?: number;
  replyingToComment: string | null;
  replyContent: string;
  onVote: (commentId: string, direction: 'up' | 'down') => void;
  onReply: (commentId: string) => void;
  onSubmitReply: (commentId: string) => void;
  onCancelReply: () => void;
  onReplyContentChange: (content: string) => void;
}

export default function CommentTree({
  comments,
  depth = 0,
  replyingToComment,
  replyContent,
  onVote,
  onReply,
  onSubmitReply,
  onCancelReply,
  onReplyContentChange
}: CommentTreeProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <>
      {comments.map(comment => (
        <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-2' : ''}`}>
          <div
            className="rounded-lg p-4 mb-4 transition-shadow border"
            style={{
              background: colors.cardBackground,
              borderColor: colors.border,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Comment Header */}
            <div className="flex items-center gap-2 mb-2">
              <User size={16} style={{ color: colors.tertiaryText }} />
              <span className="font-semibold" style={{ color: colors.primaryText }}>{comment.author.name}</span>
              {comment.author.verified && <span style={{ color: colors.primaryBlue }}>✓</span>}
              <span className="text-sm" style={{ color: colors.tertiaryText }}>{comment.author.karma} karma</span>
              <Clock size={14} style={{ color: colors.tertiaryText, marginLeft: '0.5rem' }} />
              <span className="text-xs" style={{ color: colors.tertiaryText }}>{new Date(comment.timestamp).toLocaleDateString()}</span>
            </div>
            
            {/* Comment Content */}
            <p className="mb-3" style={{ color: colors.secondaryText }}>{comment.content}</p>
            
            {/* Comment Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onVote(comment.id, 'up')}
                className="flex items-center gap-1 transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryBlue; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondaryText; }}
              >
                <ThumbsUp size={16} />
                <span className="text-sm">{comment.votes}</span>
              </button>
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1 transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.badgePurpleText; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondaryText; }}
              >
                <Reply size={16} />
                <span className="text-sm">Reply</span>
              </button>
            </div>
            
            {/* Reply Input (if replying) */}
            {replyingToComment === comment.id && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                <textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg resize-none"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.badgePurpleText; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="px-4 py-1 text-sm rounded-lg transition-colors"
                    style={{
                      background: replyContent.trim() ? colors.badgePurpleText : colors.inputBackground,
                      color: replyContent.trim() ? 'white' : colors.tertiaryText,
                    }}
                    onMouseEnter={(e) => {
                      if (replyContent.trim()) {
                        e.currentTarget.style.background = colors.badgePurpleText + 'dd';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (replyContent.trim()) {
                        e.currentTarget.style.background = colors.badgePurpleText;
                      }
                    }}
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={onCancelReply}
                    className="px-4 py-1 text-sm rounded-lg transition-colors"
                    style={{
                      background: colors.inputBackground,
                      color: colors.primaryText,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.inputBackground; }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Render Children (replies) */}
          {comment.children && comment.children.length > 0 && (
            <div className="pl-4" style={{ borderLeft: `2px solid ${colors.border}` }}>
              <CommentTree
                comments={comment.children}
                depth={depth + 1}
                replyingToComment={replyingToComment}
                replyContent={replyContent}
                onVote={onVote}
                onReply={onReply}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                onReplyContentChange={onReplyContentChange}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

