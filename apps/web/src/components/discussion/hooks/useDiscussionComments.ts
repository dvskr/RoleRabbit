// Hook for managing comment-related state and actions
import { useState, useCallback } from 'react';
import type { Comment } from '../../../types/discussion';

export const useDiscussionComments = (addComment: (comment: Comment) => void) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [viewingPostDetail, setViewingPostDetail] = useState<any | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleComment = useCallback((postId: string) => {
    setCommentingPostId(postId);
    setShowCommentModal(true);
  }, []);

  const handleViewPost = useCallback((
    postId: string,
    posts: any[],
    setPosts: (updater: any) => void
  ) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setViewingPostDetail(post);
      // Increment view count
      setPosts((prev: any[]) => prev.map(p => {
        if (p.id === postId) {
          return { ...p, views: p.views + 1 };
        }
        return p;
      }));
    }
  }, []);

  const handleReplyToComment = useCallback((commentId: string) => {
    setReplyingToComment(commentId);
    setReplyContent('');
  }, []);

  const handleSubmitReply = useCallback((commentId: string) => {
    if (replyContent.trim()) {
      const replyComment = {
        content: replyContent.trim(),
        author: {
          id: 'currentUser',
          name: 'Current User',
          avatar: '/avatars/default.jpg',
          role: 'user' as const,
          karma: 100,
          verified: false
        },
        postId: viewingPostDetail?.id || '',
        parentId: commentId,
        timestamp: new Date().toISOString(),
        votes: 0,
        replies: 0,
        isPinned: false,
        isDeleted: false
      };
      
      addComment(replyComment);
      setReplyContent('');
      setReplyingToComment(null);
    }
  }, [replyContent, viewingPostDetail, addComment]);

  const handleSubmitComment = useCallback((
    setPosts: (updater: any) => void
  ) => {
    if (newComment.trim() && commentingPostId) {
      const newCommentObj = {
        content: newComment.trim(),
        author: {
          id: 'currentUser',
          name: 'Current User',
          avatar: '/avatars/default.jpg',
          role: 'user' as const,
          karma: 100,
          verified: false
        },
        postId: commentingPostId,
        timestamp: new Date().toISOString(),
        votes: 0,
        replies: 0,
        isPinned: false,
        isDeleted: false
      };
      
      addComment(newCommentObj);
      
      // Increment comment count on post
      setPosts((prev: any[]) => prev.map(post => {
        if (post.id === commentingPostId) {
          return { ...post, comments: post.comments + 1 };
        }
        return post;
      }));
      
      setNewComment('');
      setShowCommentModal(false);
      setCommentingPostId(null);
    }
  }, [newComment, commentingPostId, addComment]);

  const closeCommentModal = useCallback(() => {
    setShowCommentModal(false);
    setCommentingPostId(null);
    setNewComment('');
  }, []);

  const closePostDetail = useCallback(() => {
    setViewingPostDetail(null);
    setReplyingToComment(null);
    setReplyContent('');
  }, []);

  return {
    showCommentModal,
    setShowCommentModal,
    commentingPostId,
    setCommentingPostId,
    newComment,
    setNewComment,
    viewingPostDetail,
    replyingToComment,
    setReplyingToComment,
    replyContent,
    setReplyContent,
    handleComment,
    handleViewPost,
    handleReplyToComment,
    handleSubmitReply,
    handleSubmitComment,
    closeCommentModal,
    closePostDetail,
    setViewingPostDetail
  };
};

