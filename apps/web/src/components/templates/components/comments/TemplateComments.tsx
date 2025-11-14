/**
 * TemplateComments Component
 * Main container for template comments system
 */

import React, { useState } from 'react';
import { AlertCircle, LogIn } from 'lucide-react';
import { CommentInput } from './CommentInput';
import { CommentList } from './CommentList';
import { useTemplateComments } from '../../hooks/useTemplateComments';
import type { CommentFormData } from '../../hooks/useTemplateComments';

interface TemplateCommentsProps {
  templateId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  className?: string;
}

export const TemplateComments: React.FC<TemplateCommentsProps> = ({
  templateId,
  currentUserId,
  isAdmin = false,
  className = '',
}) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    comments,
    pagination,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    toggleLike,
    reportComment,
    moderateComment,
    refresh,
  } = useTemplateComments({
    templateId,
    page,
    limit: 20,
    sortBy,
    includeReplies: true,
  });

  // Handle new comment submission
  const handleSubmitComment = async (content: string, mentions?: string[]) => {
    if (!currentUserId) return;

    setIsSubmitting(true);
    try {
      const result = await addComment({
        content,
        mentions,
      });

      if (result.success) {
        // Refresh comments list
        await refresh();
      } else {
        alert(result.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reply to a comment
  const handleReply = async (parentId: string, content: string, mentions: string[]) => {
    if (!currentUserId) return;

    try {
      const result = await addComment({
        content,
        parentId,
        mentions,
      });

      if (result.success) {
        await refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    }
  };

  // Handle edit comment
  const handleEdit = async (commentId: string, content: string) => {
    try {
      const result = await updateComment(commentId, content);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Refresh to update counts
      await refresh();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  // Handle like comment
  const handleLike = async (commentId: string) => {
    try {
      const result = await toggleLike(commentId);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  };

  // Handle report comment
  const handleReport = async (commentId: string, reason: string) => {
    try {
      const result = await reportComment(commentId, reason);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  };

  // Handle moderate comment (admin only)
  const handleModerate = async (
    commentId: string,
    action: 'APPROVE' | 'HIDE' | 'DELETE'
  ) => {
    if (!isAdmin) return;

    try {
      const result = await moderateComment(commentId, action);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Refresh list after moderation
      await refresh();
    } catch (error) {
      console.error('Error moderating comment:', error);
      throw error;
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy: 'newest' | 'oldest' | 'popular') => {
    setSortBy(newSortBy);
    setPage(1); // Reset to first page when sorting changes
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of comments section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-900">Error loading comments</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Comment Input */}
      {currentUserId ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Add a comment</h3>
          <CommentInput
            onSubmit={handleSubmitComment}
            loading={isSubmitting}
            placeholder="Share your thoughts..."
          />
        </div>
      ) : (
        /* Login CTA */
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <LogIn className="mx-auto h-10 w-10 text-blue-600 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sign in to join the conversation
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Log in to share your thoughts and engage with the community.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Sign In
          </button>
        </div>
      )}

      {/* Admin Moderation Tools */}
      {isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-yellow-900">
              Admin Mode - Moderation tools enabled
            </span>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <CommentList
          comments={comments}
          pagination={pagination}
          loading={loading}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLike={handleLike}
          onReport={handleReport}
          onModerate={handleModerate}
        />
      </div>

      {/* Stats Footer */}
      {pagination.total > 0 && (
        <div className="text-center text-sm text-gray-500">
          {pagination.total} {pagination.total === 1 ? 'comment' : 'comments'} •{' '}
          {comments.reduce((sum, comment) => sum + (comment.replyCount || 0), 0)} replies
        </div>
      )}
    </div>
  );
};

export default TemplateComments;
