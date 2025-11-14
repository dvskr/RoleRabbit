/**
 * Custom hook for managing template comments
 */

import { useState, useEffect, useCallback } from 'react';

export interface Comment {
  id: string;
  templateId: string;
  userId: string;
  content: string;
  parentId: string | null;
  mentions: string[];
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  isHidden: boolean;
  editHistory?: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  replies?: Comment[];
}

export interface CommentFormData {
  content: string;
  parentId?: string;
  mentions?: string[];
}

export interface PaginatedComments {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseTemplateCommentsOptions {
  templateId: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'popular';
  includeReplies?: boolean;
}

export function useTemplateComments(options: UseTemplateCommentsOptions) {
  const {
    templateId,
    page = 1,
    limit = 20,
    sortBy = 'newest',
    includeReplies = true,
  } = options;

  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!templateId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        includeReplies: includeReplies.toString(),
      });

      const response = await fetch(`/api/templates/${templateId}/comments?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data: PaginatedComments = await response.json();

      if (data.success !== false) {
        setComments(data.comments || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [templateId, page, limit, sortBy, includeReplies]);

  // Add comment
  const addComment = useCallback(
    async (commentData: CommentFormData) => {
      if (!templateId) return { success: false, error: 'Template ID is required' };

      try {
        const response = await fetch(`/api/templates/${templateId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(commentData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to add comment');
        }

        // Refresh comments after adding
        await fetchComments();

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
        return { success: false, error: errorMessage };
      }
    },
    [templateId, fetchComments]
  );

  // Update comment
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        const response = await fetch(`/api/templates/comments/${commentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ content }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update comment');
        }

        // Update local state
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, content, isEdited: true, updatedAt: new Date().toISOString() }
              : comment
          )
        );

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Delete comment
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        const response = await fetch(`/api/templates/comments/${commentId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete comment');
        }

        // Remove from local state
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Toggle like
  const toggleLike = useCallback(async (commentId: string) => {
    try {
      const response = await fetch(`/api/templates/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to like comment');
      }

      // Update local state
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likeCount: data.data.liked
                  ? comment.likeCount + 1
                  : comment.likeCount - 1,
              }
            : comment
        )
      );

      return { success: true, liked: data.data.liked };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like comment';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Report comment
  const reportComment = useCallback(async (commentId: string, reason: string) => {
    try {
      const response = await fetch(`/api/templates/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to report comment');
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report comment';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Moderate comment (admin only)
  const moderateComment = useCallback(
    async (commentId: string, action: 'APPROVE' | 'HIDE' | 'DELETE') => {
      try {
        const response = await fetch(`/api/templates/comments/${commentId}/moderate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ action }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to moderate comment');
        }

        if (action === 'DELETE') {
          // Remove from local state
          setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        } else if (action === 'HIDE') {
          // Update local state
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? { ...comment, isHidden: true } : comment
            )
          );
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to moderate comment';
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
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
    refresh: fetchComments,
  };
}
