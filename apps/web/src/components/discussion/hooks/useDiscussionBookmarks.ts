// Hook for managing bookmarks, flags, and pinned posts
import { useState, useEffect, useCallback } from 'react';
import { logger } from '../../../utils/logger';

export const useDiscussionBookmarks = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<Record<string, any>>({});
  const [pinnedPosts, setPinnedPosts] = useState<string[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedPosts') || '[]');
    setBookmarkedPosts(bookmarked);
    
    const flagged = JSON.parse(localStorage.getItem('flaggedPosts') || '[]');
    const flaggedMap: Record<string, any> = {};
    flagged.forEach((flag: any) => {
      flaggedMap[flag.postId] = flag;
    });
    setFlaggedPosts(flaggedMap);
    
    const pinned = JSON.parse(localStorage.getItem('pinnedPosts') || '[]');
    setPinnedPosts(pinned);
  }, []);

  const handleBookmark = useCallback((postId: string, setPosts: (updater: any) => void) => {
    logger.debug(`Bookmark post ${postId}`);
    
    const isBookmarked = bookmarkedPosts.includes(postId);
    let updated: string[];
    
    if (isBookmarked) {
      updated = bookmarkedPosts.filter(id => id !== postId);
      setBookmarkedPosts(updated);
      localStorage.setItem('bookmarkedPosts', JSON.stringify(updated));
    } else {
      updated = [...bookmarkedPosts, postId];
      setBookmarkedPosts(updated);
      localStorage.setItem('bookmarkedPosts', JSON.stringify(updated));
    }
    
    // Update post visually
    setPosts((prev: any[]) => prev.map((post: any) => 
      post.id === postId 
        ? { ...post, isBookmarked: !isBookmarked }
        : post
    ));
  }, [bookmarkedPosts]);

  const handleFlag = useCallback((postId: string) => {
    logger.debug(`Flag post ${postId}`);
    
    const nowFlagged = { ...flaggedPosts };
    if (!nowFlagged[postId]) {
      nowFlagged[postId] = {
        postId,
        reason: 'Reported by user',
        timestamp: new Date().toISOString()
      };
      setFlaggedPosts(nowFlagged);
      localStorage.setItem('flaggedPosts', JSON.stringify(Object.values(nowFlagged)));
    } else {
      delete nowFlagged[postId];
      setFlaggedPosts(nowFlagged);
      localStorage.setItem('flaggedPosts', JSON.stringify(Object.values(nowFlagged)));
    }
  }, [flaggedPosts]);

  const handlePin = useCallback((postId: string, setPosts: (updater: any) => void) => {
    logger.debug(`Pin post ${postId}`);
    
    if (pinnedPosts.includes(postId)) {
      const updated = pinnedPosts.filter(id => id !== postId);
      setPinnedPosts(updated);
      localStorage.setItem('pinnedPosts', JSON.stringify(updated));
      
      setPosts((prev: any[]) => prev.map((post: any) => 
        post.id === postId 
          ? { ...post, isPinned: false }
          : post
      ));
    } else {
      const updated = [...pinnedPosts, postId];
      setPinnedPosts(updated);
      localStorage.setItem('pinnedPosts', JSON.stringify(updated));
      
      setPosts((prev: any[]) => prev.map((post: any) => 
        post.id === postId 
          ? { ...post, isPinned: true }
          : post
      ));
    }
  }, [pinnedPosts]);

  return {
    bookmarkedPosts,
    flaggedPosts,
    pinnedPosts,
    showBookmarkedOnly,
    showReportedOnly,
    setShowBookmarkedOnly,
    setShowReportedOnly,
    handleBookmark,
    handleFlag,
    handlePin
  };
};

