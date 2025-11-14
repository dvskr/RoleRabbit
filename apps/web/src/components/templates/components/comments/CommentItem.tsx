/**
 * CommentItem Component
 * Displays a single comment with user info, content, and actions
 */

import React, { useState } from 'react';
import { Heart, Reply, MoreVertical, Flag, Edit2, Trash2 } from 'lucide-react';
import { CommentInput } from './CommentInput';
import type { Comment } from '../../hooks/useTemplateComments';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  isAdmin?: boolean;
  onReply?: (commentId: string, content: string, mentions: string[]) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onLike?: (commentId: string) => Promise<void>;
  onReport?: (commentId: string, reason: string) => Promise<void>;
  onModerate?: (commentId: string, action: 'APPROVE' | 'HIDE' | 'DELETE') => Promise<void>;
  className?: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  isAdmin = false,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onReport,
  onModerate,
  className = '',
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwnComment = currentUserId === comment.userId;

  // Format relative time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  // Highlight @mentions in content
  const renderContent = (content: string) => {
    if (!comment.mentions || comment.mentions.length === 0) {
      return <span>{content}</span>;
    }

    // Split content by @ mentions and highlight them
    const parts = content.split(/(@\w+)/g);
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('@')) {
            return (
              <span
                key={index}
                className="text-blue-600 font-medium hover:underline cursor-pointer"
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  // Handle like
  const handleLike = async () => {
    if (!onLike || isOwnComment) return;

    try {
      await onLike(comment.id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  // Handle edit
  const handleEdit = async (content: string) => {
    if (!onEdit) return;

    setLoading(true);
    try {
      await onEdit(comment.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle reply
  const handleReply = async (content: string, mentions: string[]) => {
    if (!onReply) return;

    setLoading(true);
    try {
      await onReply(comment.id, content, mentions);
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete || !confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setLoading(false);
    }
  };

  // Handle report
  const handleReport = async () => {
    if (!onReport || !reportReason.trim()) return;

    setLoading(true);
    try {
      await onReport(comment.id, reportReason);
      setShowReportDialog(false);
      setReportReason('');
      alert('Comment reported successfully');
    } catch (error) {
      console.error('Failed to report comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle moderation
  const handleModerate = async (action: 'APPROVE' | 'HIDE' | 'DELETE') => {
    if (!onModerate || !confirm(`Are you sure you want to ${action.toLowerCase()} this comment?`))
      return;

    setLoading(true);
    try {
      await onModerate(comment.id, action);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to moderate comment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (comment.isHidden && !isAdmin) {
    return (
      <div className={`py-4 ${className}`}>
        <div className="text-gray-400 text-sm italic">This comment has been hidden</div>
      </div>
    );
  }

  return (
    <div className={`py-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {comment.user?.name || 'Anonymous User'}
            </span>
            <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400 italic">(edited)</span>
            )}
            {comment.isHidden && isAdmin && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                Hidden
              </span>
            )}
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="mb-3">
              <CommentInput
                initialValue={comment.content}
                onSubmit={handleEdit}
                onCancel={() => setIsEditing(false)}
                submitLabel="Save"
                loading={loading}
                placeholder="Edit your comment..."
              />
            </div>
          ) : (
            <div className="text-gray-700 mb-3 whitespace-pre-wrap break-words">
              {renderContent(comment.content)}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isOwnComment || loading}
              className={`flex items-center gap-1 transition-colors ${
                isLiked
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-red-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isOwnComment ? "Can't like your own comment" : 'Like'}
            >
              <Heart
                size={16}
                fill={isLiked ? 'currentColor' : 'none'}
                className="transition-all"
              />
              <span className="font-medium">{likeCount > 0 ? likeCount : ''}</span>
            </button>

            {/* Reply Button */}
            {onReply && !isEditing && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Reply size={16} />
                <span>Reply</span>
              </button>
            )}

            {/* Actions Menu */}
            <div className="relative ml-auto">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="More actions"
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {showActions && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    {isOwnComment ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={loading}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowReportDialog(true);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Flag size={14} />
                        Report
                      </button>
                    )}

                    {/* Admin Moderation Options */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 my-1" />
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                          Admin
                        </div>
                        {comment.isHidden ? (
                          <button
                            onClick={() => handleModerate('APPROVE')}
                            disabled={loading}
                            className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleModerate('HIDE')}
                            disabled={loading}
                            className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                          >
                            Hide
                          </button>
                        )}
                        <button
                          onClick={() => handleModerate('DELETE')}
                          disabled={loading}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete (Admin)
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-4 pl-4 border-l-2 border-blue-200">
              <CommentInput
                onSubmit={(content, mentions) => handleReply(content, mentions || [])}
                onCancel={() => setIsReplying(false)}
                submitLabel="Reply"
                loading={loading}
                placeholder={`Reply to ${comment.user?.name || 'user'}...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Report Comment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for reporting this comment:
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Spam, harassment, inappropriate content..."
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim() || loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
