/**
 * Hook for managing file comments state and actions
 */

import { useState, useEffect, useRef } from 'react';
import { logger } from '../../../../utils/logger';
import apiService from '../../../../services/apiService';
import { FileComment } from '../../../../types/cloudStorage';

interface UseCommentsProps {
  fileId: string;
  onAddComment: (fileId: string, content: string, parentId?: string) => Promise<void>;
  onCommentsLoaded?: (comments: FileComment[]) => void;
  initialComments?: FileComment[]; // Use existing comments from file prop
}

export const useComments = ({ fileId, onAddComment, onCommentsLoaded, initialComments }: UseCommentsProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  // Start with false if we have initial comments - prevents flashing
  const [isLoadingComments, setIsLoadingComments] = useState(
    !initialComments || initialComments.length === 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  // Sync loading state with initialComments - if comments exist, never show loading
  useEffect(() => {
    if (initialComments && initialComments.length > 0) {
      setIsLoadingComments(false);
      hasLoadedRef.current = true;
    }
  }, [initialComments]);

  // Load comments when modal opens - ONLY if we don't have initial comments
  useEffect(() => {
    if (!showComments) {
      // Reset to appropriate state when closing
      setIsLoadingComments(!initialComments || initialComments.length === 0);
      setError(null);
      return;
    }

    // If we have initial comments, use them immediately - NO API CALL, NO LOADING
    if (initialComments && initialComments.length > 0) {
      setIsLoadingComments(false);
      hasLoadedRef.current = true;
      return;
    }

    // Only load from API if we truly don't have any comments and haven't loaded
    if (hasLoadedRef.current || isLoadingComments) {
      return;
    }

    let cancelled = false;
    setIsLoadingComments(true);
    setError(null);

    const loadComments = async () => {
      try {
        const response = await apiService.getFileComments(fileId);
        if (cancelled) return;
        
        if (response && response.comments) {
          const comments: FileComment[] = response.comments.map((c: any) => ({
            id: c.id,
            userId: c.userId,
            userName: c.userName,
            userAvatar: c.userAvatar,
            content: c.content,
            timestamp: c.timestamp,
            isResolved: c.isResolved || false,
            replies: c.replies || []
          }));
          onCommentsLoaded?.(comments);
          hasLoadedRef.current = true;
        }
      } catch (error: any) {
        if (!cancelled) {
          logger.error('Failed to load comments:', error);
          setError('Failed to load comments. You can still add new comments.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingComments(false);
        }
      }
    };
    
    loadComments();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments]); // Only depend on showComments

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Add timeout to prevent infinite "Sending..." state
    const timeoutId = setTimeout(() => {
      logger.error('Comment submission timeout');
      setIsSubmitting(false);
      setSubmitSuccess(false);
    }, 10000); // 10 second timeout

    try {
      logger.debug('Submitting comment:', { fileId, content: newComment.trim() });
      await onAddComment(fileId, newComment.trim());
      clearTimeout(timeoutId);
      
      setNewComment('');
      setSubmitSuccess(true);
      logger.debug('Comment submitted successfully for file:', fileId);
      
      // Don't reload comments - real-time WebSocket events will update the UI automatically
      // This prevents flashing and unnecessary API calls

      // Show success confirmation for 2 seconds, then close comments section
      // This gives time for the comment to be saved and real-time event to update UI
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsSubmitting(false);
        // Don't close immediately - let user see the comment was saved
        // Close after a brief delay so they can see the success state
        setTimeout(() => {
          setShowComments(false);
          setNewComment('');
        }, 500);
      }, 2000);
    } catch (error: any) {
      clearTimeout(timeoutId);
      logger.error('Failed to submit comment:', error);
      console.error('Comment submission error:', error);
      
      // Reset state even on error
      setIsSubmitting(false);
      setSubmitSuccess(false);
      
      // Set error message for UI display
      const errorMessage = error?.message || error?.error || 'Unknown error';
      setError(`Failed to save comment: ${errorMessage}. Please try again.`);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const closeComments = () => {
    setShowComments(false);
    setNewComment('');
    setSubmitSuccess(false);
    setIsSubmitting(false);
    setError(null);
  };

  return {
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    handleCommentSubmit,
    closeComments,
    isLoadingComments,
    isSubmitting,
    submitSuccess,
    error,
  };
};

