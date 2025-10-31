'use client';

import React from 'react';
import { X, User, ThumbsUp, MessageSquare, Plus } from 'lucide-react';
import type { Post, Comment } from '../../../types/discussion';
import type { CommentWithChildren } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';
import CommentTree from './CommentTree';

interface PostDetailViewProps {
  post: Post;
  comments: Comment[];
  commentTree: CommentWithChildren[];
  onClose: () => void;
  onVote: (id: string, direction: 'up' | 'down') => void;
  onShare: (postId: string) => void;
  onCommentClick: (postId: string) => void;
  replyingToComment: string | null;
  replyContent: string;
  onReply: (commentId: string) => void;
  onSubmitReply: (commentId: string) => void;
  onCancelReply: () => void;
  onReplyContentChange: (content: string) => void;
}

export default function PostDetailView({
  post,
  comments,
  commentTree,
  onClose,
  onVote,
  onShare,
  onCommentClick,
  replyingToComment,
  replyContent,
  onReply,
  onSubmitReply,
  onCancelReply,
  onReplyContentChange
}: PostDetailViewProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col" style={{ background: colors.background }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
          <h2 className="text-xl font-bold text-white">{post.title}</h2>
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
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Post Content */}
          <div className="rounded-lg p-6 mb-6" style={{ background: colors.inputBackground }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
                <User size={20} className="text-white" />
              </div>
              <div>
                <div className="font-semibold" style={{ color: colors.primaryText }}>{post.author.name}</div>
                <div className="text-sm" style={{ color: colors.tertiaryText }}>{post.community}</div>
              </div>
              <div className="ml-auto flex items-center gap-4 text-sm" style={{ color: colors.tertiaryText }}>
                <span>{post.views} views</span>
                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: colors.primaryText }}>{post.content}</p>
            
            {/* Post Actions */}
            <div className="flex items-center gap-4 mt-6 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={() => onVote(post.id, 'up')}
                className="flex items-center gap-2 transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryBlue; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
              >
                <ThumbsUp size={18} />
                <span>{post.votes} votes</span>
              </button>
              <button
                onClick={() => onCommentClick(post.id)}
                className="flex items-center gap-2 transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.badgePurpleText; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
              >
                <MessageSquare size={18} />
                <span>Comment</span>
              </button>
              <button
                onClick={() => onShare(post.id)}
                className="flex items-center gap-2 transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#16a34a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
              >
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: colors.primaryText }}>Comments ({comments.filter(c => c.postId === post.id).length})</h3>
              <button
                onClick={() => onCommentClick(post.id)}
                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
                style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Plus size={18} />
                Add Comment
              </button>
            </div>

            {/* Comment Tree */}
            <div className="space-y-4">
              {commentTree.length > 0 && (
                <CommentTree
                  comments={commentTree}
                  replyingToComment={replyingToComment}
                  replyContent={replyContent}
                  onVote={onVote}
                  onReply={onReply}
                  onSubmitReply={onSubmitReply}
                  onCancelReply={onCancelReply}
                  onReplyContentChange={onReplyContentChange}
                />
              )}
              {comments.filter(c => c.postId === post.id).length === 0 && (
                <div className="text-center py-12 rounded-lg border border-dashed" style={{ background: colors.inputBackground, borderColor: colors.border }}>
                  <MessageSquare size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                  <p style={{ color: colors.secondaryText }}>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

