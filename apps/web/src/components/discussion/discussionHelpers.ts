// Helper functions for Discussion component
import type { Comment, Post } from '../../types/discussion';
import type { CommentWithChildren } from './types';

/**
 * Build a tree structure from flat comments array (Reddit-style nesting)
 */
export const buildCommentTree = (
  comments: Comment[],
  postId: string
): CommentWithChildren[] => {
  const postComments = comments.filter(c => c.postId === postId);
  const rootComments = postComments.filter(c => !c.parentId);
  
  const buildChildren = (parentId: string): CommentWithChildren[] => {
    return postComments
      .filter(c => c.parentId === parentId)
      .map(comment => ({
        ...comment,
        children: buildChildren(comment.id)
      }));
  };
  
  return rootComments.map(comment => ({
    ...comment,
    children: buildChildren(comment.id)
  }));
};

/**
 * Filter posts based on active tab
 */
export const filterPostsByTab = (
  posts: Post[],
  activeTab: 'hot' | 'new' | 'top' | 'ai' | 'communities'
): Post[] => {
  if (activeTab === 'hot') {
    return posts.filter(post => post.votes > 10 || post.comments > 5);
  } else if (activeTab === 'new') {
    return [...posts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } else if (activeTab === 'top') {
    return [...posts].sort((a, b) => b.votes - a.votes);
  } else if (activeTab === 'ai') {
    return posts
      .filter(post => post.aiScore > 0.5)
      .sort((a, b) => b.aiScore - a.aiScore);
  }
  return posts;
};

/**
 * Filter posts by bookmarked status
 */
export const filterBookmarkedPosts = (
  posts: Post[],
  bookmarkedPostIds: string[]
): Post[] => {
  return posts.filter(post => bookmarkedPostIds.includes(post.id));
};

/**
 * Filter posts by flagged status
 */
export const filterFlaggedPosts = (
  posts: Post[],
  flaggedPostIds: string[]
): Post[] => {
  return posts.filter(post => flaggedPostIds.includes(post.id));
};

/**
 * Filter communities by search query
 */
export const filterCommunitiesByQuery = (
  communities: any[],
  query: string,
  joinedCommunityIds: string[]
): any[] => {
  let filtered = [...communities];
  
  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = communities.filter(community =>
      community.name.toLowerCase().includes(lowerQuery) ||
      community.description.toLowerCase().includes(lowerQuery) ||
      community.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Sort: joined communities first, then by member count
  return filtered.sort((a, b) => {
    const aJoined = joinedCommunityIds.includes(a.id);
    const bJoined = joinedCommunityIds.includes(b.id);
    if (aJoined && !bJoined) return -1;
    if (!aJoined && bJoined) return 1;
    return b.memberCount - a.memberCount;
  });
};

/**
 * Calculate vote increment
 */
export const calculateVoteIncrement = (direction: 'up' | 'down'): number => {
  return direction === 'up' ? 1 : -1;
};

/**
 * Share post via Web Share API or clipboard fallback
 */
export const sharePost = async (
  post: Post,
  postId: string
): Promise<void> => {
  const shareUrl = `${window.location.origin}/discussions/post/${postId}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.title,
        text: post.content,
        url: shareUrl
      });
      return;
    } catch (error) {
      // Fall through to clipboard fallback
    }
  }
  
  // Fallback to clipboard
  await navigator.clipboard.writeText(shareUrl);
};

