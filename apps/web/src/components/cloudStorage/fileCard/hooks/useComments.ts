/**
 * Hook for managing file comments state and actions
 */

import { useState } from 'react';
import { logger } from '../../../../utils/logger';

interface UseCommentsProps {
  fileId: string;
  onAddComment: (fileId: string, content: string) => void;
}

export const useComments = ({ fileId, onAddComment }: UseCommentsProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onAddComment(fileId, newComment.trim());
      setNewComment('');
      logger.debug('Comment submitted for file:', fileId);
    }
  };

  const closeComments = () => {
    setShowComments(false);
    setNewComment('');
  };

  return {
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    handleCommentSubmit,
    closeComments,
  };
};

