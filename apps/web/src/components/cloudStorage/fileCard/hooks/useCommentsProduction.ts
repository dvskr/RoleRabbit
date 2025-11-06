/**
 * Production-ready hook for managing file comments
 * Handles all edge cases, error recovery, and real-time updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '../../../../utils/logger';
import apiService from '../../../../services/apiService';
import { FileComment } from '../../../../types/cloudStorage';

interface UseCommentsProps {
  fileId: string;
  onAddComment: (fileId: string, content: string, parentId?: string) => Promise<void>;
  onCommentsLoaded?: (comments: FileComment[]) => void;
  initialComments?: FileComment[];
}

export const useCommentsProduction = ({ 
  fileId, 
  onAddComment, 
  onCommentsLoaded, 
  initialComments = [] 
}: UseCommentsProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we've loaded comments to prevent duplicate loads
  const hasLoadedRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize loading state - if we have comments, never show loading
  useEffect(() => {
    if (initialComments && initialComments.length > 0) {
      setIsLoadingComments(false);
      hasLoadedRef.current = true;
    }
  }, [initialComments]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // Load comments when modal opens - only if needed
  useEffect(() => {
    if (!showComments) {
      setIsLoadingComments(false);
      setError(null);
      return;
    }

    // If we have initial comments, use them immediately
    if (initialComments && initialComments.length > 0) {
      setIsLoadingComments(false);
      hasLoadedRef.current = true;
      return;
    }

    // Only load if we haven't loaded before and don't have comments
    if (hasLoadedRef.current || isLoadingComments) {
      return;
    }

    let cancelled = false;
    setIsLoadingComments(true);
    setError(null);

    // Set a timeout for loading
    loadingTimeoutRef.current = setTimeout(() => {
      if (!cancelled) {
        setIsLoadingComments(false);
        setError('Loading comments is taking longer than expected...');
      }
    }, 5000);

    const loadComments = async () => {
      try {
        const response = await apiService.getFileComments(fileId);
        if (cancelled) return;
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

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
          setError('Failed to load comments. Please try again.');
          // Don't block UI - user can still add comments
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [showComments, fileId, initialComments, isLoadingComments, onCommentsLoaded]);

  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    // Set timeout for submission
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setError('Comment submission is taking longer than expected. Please check your connection.');
    }, 15000); // 15 second timeout

    try {
      logger.debug('Submitting comment:', { fileId, content: newComment.trim() });
      
      // Call the parent handler
      await onAddComment(fileId, newComment.trim());
      
      // Clear timeout on success
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
      
      // Clear input and show success
      setNewComment('');
      setSubmitSuccess(true);
      logger.debug('Comment submitted successfully for file:', fileId);

      // Show success for 2 seconds, then close
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsSubmitting(false);
        // Close comments section after showing success
        setTimeout(() => {
          setShowComments(false);
        }, 300);
      }, 2000);
    } catch (error: any) {
      // Clear timeout on error
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }

      logger.error('Failed to submit comment:', error);
      console.error('Comment submission error:', error);
      
      // Reset state
      setIsSubmitting(false);
      setSubmitSuccess(false);
      
      // Show user-friendly error message
      const errorMessage = error?.message || error?.error || 'Unknown error';
      setError(`Failed to save comment: ${errorMessage}. Please try again.`);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [fileId, newComment, isSubmitting, onAddComment]);

  const closeComments = useCallback(() => {
    setShowComments(false);
    setNewComment('');
    setSubmitSuccess(false);
    setIsSubmitting(false);
    setError(null);
    
    // Clear any pending timeouts
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
  }, []);

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

