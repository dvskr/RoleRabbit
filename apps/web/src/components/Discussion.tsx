'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, MessageSquare, RefreshCw, X, Reply, ThumbsUp, Clock, User, Bookmark, Flag, Users, Shield, Trash2 } from 'lucide-react';
import { useDiscussion } from '../hooks/useDiscussion';
import { useTheme } from '../contexts/ThemeContext';
import DiscussionHeader from './discussion/DiscussionHeader';
import DiscussionTabs from './discussion/DiscussionTabs';
import PostCard from './discussion/PostCard';
import CommunityCard from './discussion/CommunityCard';
import DiscussionFilters from './discussion/DiscussionFilters';
import { logger } from '../utils/logger';
import type { Comment, Post, Community } from '../types/discussion';
import { debounce } from '../utils/performance';

interface CommentWithChildren extends Comment {
  children?: CommentWithChildren[];
}

export default function Discussion() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    // State
    activeTab,
    filters,
    showCreatePost,
    showCreateCommunity,
    showCommunitySettings,
    showModerationTools,
    showFilters,
    showAIFeatures,
    selectedCommunityForSettings,
    selectedPost,
    aiMode,
    newCommunity,
    newTag,
    newRule,
    communities,
    posts,
    comments,
    
    // Computed
    filteredPosts,
    filteredCommunities,
    
    // Setters
    setActiveTab,
    setShowCreatePost,
    setShowCreateCommunity,
    setShowCommunitySettings,
    setShowModerationTools,
    setShowFilters,
    setShowAIFeatures,
    setSelectedCommunityForSettings,
    setSelectedPost,
    setAiMode,
    setNewCommunity,
    setNewTag,
    setNewRule,
    
    // Actions
    updateFilters,
    resetFilters,
    addPost,
    addCommunity,
    addComment,
    setPosts,
    setCommunities,
    setComments
  } = useDiscussion();

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    community: '',
    type: 'text' as 'text' | 'question' | 'image' | 'link' | 'poll',
    tags: [] as string[]
  });

  // Comment state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<Record<string, any>>({});
  const [pinnedPosts, setPinnedPosts] = useState<string[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showReportedOnly, setShowReportedOnly] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [animatingCommunityId, setAnimatingCommunityId] = useState<string | null>(null);
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [debouncedCommunitySearchQuery, setDebouncedCommunitySearchQuery] = useState('');
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  
  // Debounce community search
  const debouncedSetCommunitySearch = useCallback(
    debounce((value: string) => {
      setDebouncedCommunitySearchQuery(value);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetCommunitySearch(communitySearchQuery);
  }, [communitySearchQuery, debouncedSetCommunitySearch]);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showCommunityModerationTools, setShowCommunityModerationTools] = useState(false);
  const [managingMembersFor, setManagingMembersFor] = useState<Community | null>(null);
  const [moderatingCommunity, setModeratingCommunity] = useState<Community | null>(null);
  
  // Sample member data for communities
  const [communityMembers] = useState<Record<string, any[]>>({
    '1': [
      { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'admin', joinedAt: '2024-01-15', postCount: 45, lastActive: '2024-10-26' },
      { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'moderator', joinedAt: '2024-02-20', postCount: 32, lastActive: '2024-10-25' },
      { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com', role: 'member', joinedAt: '2024-03-10', postCount: 18, lastActive: '2024-10-24' },
      { id: 'user4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'member', joinedAt: '2024-04-05', postCount: 12, lastActive: '2024-10-26' },
      { id: 'user5', name: 'David Brown', email: 'david@example.com', role: 'member', joinedAt: '2024-05-12', postCount: 8, lastActive: '2024-10-23' }
    ]
  });
  
  // Animation state for icons
  const [animatingIcons, setAnimatingIcons] = useState<Record<string, string>>({});
  
  const animateIcon = (postId: string, action: string) => {
    setAnimatingIcons(prev => ({ ...prev, [postId]: action }));
    setTimeout(() => {
      setAnimatingIcons(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
    }, 600);
  };

  // Computed values for filtered posts
  const displayPosts = React.useMemo(() => {
    let posts = filteredPosts;
    
    // Tab-specific filtering
    if (activeTab === 'hot') {
      posts = posts.filter(post => post.votes > 10 || post.comments > 5);
    } else if (activeTab === 'new') {
      posts = [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (activeTab === 'top') {
      posts = [...posts].sort((a, b) => b.votes - a.votes);
    } else if (activeTab === 'ai') {
      posts = posts.filter(post => post.aiScore > 0.5).sort((a, b) => b.aiScore - a.aiScore);
    }
    
    // Bookmarked/Reported filtering
    if (showBookmarkedOnly) {
      return posts.filter(post => bookmarkedPosts.includes(post.id));
    }
    if (showReportedOnly) {
      return posts.filter(post => flaggedPosts[post.id] !== undefined);
    }
    
    return posts;
  }, [filteredPosts, activeTab, showBookmarkedOnly, showReportedOnly, bookmarkedPosts, flaggedPosts]);

  // Filtered communities for post creation (joined first, then search results)
  const filteredCommunitiesForPost = useMemo(() => {
    let filtered = [...communities];
    
    // Filter by search query
    if (debouncedCommunitySearchQuery) {
      const query = debouncedCommunitySearchQuery.toLowerCase();
      filtered = communities.filter(community =>
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query) ||
        community.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort: joined communities first, then by member count
    return filtered.sort((a, b) => {
      const aJoined = joinedCommunities.includes(a.id);
      const bJoined = joinedCommunities.includes(b.id);
      if (aJoined && !bJoined) return -1;
      if (!aJoined && bJoined) return 1;
      return b.memberCount - a.memberCount;
    });
  }, [communities, debouncedCommunitySearchQuery, joinedCommunities]);
  
  // Post detail view state
  const [viewingPostDetail, setViewingPostDetail] = useState<Post | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleVote = useCallback((id: string, direction: 'up' | 'down') => {
    const increment = direction === 'up' ? 1 : -1;
    
    // Check if it's a post vote
    const post = posts.find(p => p.id === id);
    if (post) {
      setPosts(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, votes: Math.max(0, p.votes + increment) };
        }
        return p;
      }));
      return;
    }
    
    // Otherwise it's a comment vote
    const comment = comments.find(c => c.id === id);
    if (comment) {
      setComments(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, votes: Math.max(0, c.votes + increment) };
        }
        return c;
      }));
    }
  }, [posts, comments]);

  const handleComment = useCallback((postId: string) => {
    setCommentingPostId(postId);
    setShowCommentModal(true);
    logger.debug(`Opening comment modal for post ${postId}`);
  }, []);

  const handleViewPost = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setViewingPostDetail(post);
      // Increment view count
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, views: p.views + 1 };
        }
        return p;
      }));
    }
  }, [posts]);

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

  const handleShare = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post && navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: `${window.location.origin}/discussions/post/${postId}`
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/discussions/post/${postId}`);
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/discussions/post/${postId}`);
    }
  }, [posts]);

  const handleBookmark = useCallback((postId: string) => {
    logger.debug(`Bookmark post ${postId}`);
    
    // Animate icon
    animateIcon(postId, 'bookmark');
    
    // Update state
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
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !isBookmarked }
        : post
    ));
  }, [bookmarkedPosts, posts]);

  const handleFlag = useCallback((postId: string) => {
    logger.debug(`Flag post ${postId}`);
    
    // Animate icon
    animateIcon(postId, 'flag');
    
    // Update state
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

  const handlePin = useCallback((postId: string) => {
    logger.debug(`Pin post ${postId}`);
    
    // Animate icon
    animateIcon(postId, 'pin');
    
    // Toggle pin
    if (pinnedPosts.includes(postId)) {
      const updated = pinnedPosts.filter(id => id !== postId);
      setPinnedPosts(updated);
      localStorage.setItem('pinnedPosts', JSON.stringify(updated));
      
      // Update post
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isPinned: false }
          : post
      ));
    } else {
      const updated = [...pinnedPosts, postId];
      setPinnedPosts(updated);
      localStorage.setItem('pinnedPosts', JSON.stringify(updated));
      
      // Update post
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isPinned: true }
          : post
      ));
    }
  }, [pinnedPosts]);

  const handleView = useCallback((postId: string) => {
    logger.debug(`View post ${postId}`);
    handleViewPost(postId);
  }, [handleViewPost]);

  const handleJoinCommunity = useCallback((communityId: string) => {
    logger.debug(`Join/Leave community ${communityId}`);
    
    // Animate
    setAnimatingCommunityId(communityId);
    setTimeout(() => setAnimatingCommunityId(null), 600);
    
    const isJoined = joinedCommunities.includes(communityId);
    
    if (isJoined) {
      // Leave community
      const updated = joinedCommunities.filter(id => id !== communityId);
      setJoinedCommunities(updated);
      localStorage.setItem('joinedCommunities', JSON.stringify(updated));
      
      // Update community member count
      setCommunities(prev => prev.map(c => {
        if (c.id === communityId) {
          return { ...c, memberCount: Math.max(0, c.memberCount - 1) };
        }
        return c;
      }));
    } else {
      // Join community
      const updated = [...joinedCommunities, communityId];
      setJoinedCommunities(updated);
      localStorage.setItem('joinedCommunities', JSON.stringify(updated));
      
      // Update community member count
      setCommunities(prev => prev.map(c => {
        if (c.id === communityId) {
          return { ...c, memberCount: c.memberCount + 1 };
        }
        return c;
      }));
    }
  }, [joinedCommunities, setJoinedCommunities, setCommunities, setAnimatingCommunityId]);

  const handleViewCommunity = useCallback((communityId: string) => {
    logger.debug(`View community ${communityId}`);
    // Filter posts by community
    const community = communities.find(c => c.id === communityId);
    if (community) {
      updateFilters({ selectedCommunity: community.name });
      setActiveTab('all'); // Switch to posts tab to see filtered posts
    }
  }, [communities, updateFilters, setActiveTab]);

  const handlePostToCommunity = useCallback((communityId: string) => {
    logger.debug(`Post to community ${communityId}`);
    const community = communities.find(c => c.id === communityId);
    if (community) {
      // Pre-select the community in the new post
      setNewPost(prev => ({ ...prev, community: community.id }));
      // Open the create post modal
      setShowCreatePost(true);
      // Auto-join if not already joined
      if (!joinedCommunities.includes(communityId)) {
        handleJoinCommunity(communityId);
      }
    }
  }, [communities, joinedCommunities, handleJoinCommunity, setShowCreatePost, setNewPost]);

  const handleCommunitySettings = useCallback((community: any) => {
    setSelectedCommunityForSettings(community);
    setShowCommunitySettings(true);
  }, [setSelectedCommunityForSettings, setShowCommunitySettings]);

  const handleEditCommunity = useCallback((community: Community) => {
    setSelectedCommunityForSettings(community);
    setShowCommunitySettings(true);
  }, [setSelectedCommunityForSettings, setShowCommunitySettings]);

  const handleManageMembers = useCallback((community: Community) => {
    setManagingMembersFor(community);
    setShowManageMembers(true);
  }, [setManagingMembersFor, setShowManageMembers]);

  const handleModerationTools = useCallback((community: Community) => {
    setModeratingCommunity(community);
    setShowCommunityModerationTools(true);
  }, [setModeratingCommunity, setShowCommunityModerationTools]);

  const handleDeleteCommunity = useCallback((community: Community) => {
    if (confirm(`Are you sure you want to delete "${community.name}"?\n\nThis action cannot be undone and will remove all posts, members, and data associated with this community.`)) {
      setCommunities(prev => prev.filter(c => c.id !== community.id));
      // Also remove from joined communities
      setJoinedCommunities(prev => prev.filter(id => id !== community.id));
      localStorage.setItem('joinedCommunities', JSON.stringify(joinedCommunities.filter(id => id !== community.id)));
      
      logger.debug(`Deleted community: ${community.name}`);
    }
  }, [joinedCommunities, setCommunities, setJoinedCommunities]);

  const handleRefresh = useCallback(() => {
    logger.debug('Refresh discussions');
    // Refresh by resetting posts to trigger a re-render
    // In a real app, this would fetch fresh data from API
    window.location.reload();
  }, []);

  const handleSubmitComment = useCallback(() => {
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
      setPosts(prev => prev.map(post => {
        if (post.id === commentingPostId) {
          return { ...post, comments: post.comments + 1 };
        }
        return post;
      }));
      
      logger.debug('Comment added:', newCommentObj);
      setNewComment('');
      setShowCommentModal(false);
      setCommentingPostId(null);
    }
  }, [newComment, commentingPostId, addComment]);

  // Load saved state on mount
  React.useEffect(() => {
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
    
    const joined = JSON.parse(localStorage.getItem('joinedCommunities') || '[]');
    setJoinedCommunities(joined);
  }, []);

  // Build comment tree structure
  const buildCommentTree = (postId: string): CommentWithChildren[] => {
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

  // Render comment tree recursively (Reddit-style)
  const renderCommentTree = (comments: CommentWithChildren[], depth: number = 0) => {
    return comments.map(comment => (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-2' : ''}`}>
        <div
          className="rounded-lg p-4 mb-4 transition-shadow border"
          style={{
            background: colors.cardBackground,
            borderColor: colors.border,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-2">
            <User size={16} style={{ color: colors.tertiaryText }} />
            <span className="font-semibold" style={{ color: colors.primaryText }}>{comment.author.name}</span>
            {comment.author.verified && <span style={{ color: colors.primaryBlue }}>✓</span>}
            <span className="text-sm" style={{ color: colors.tertiaryText }}>{comment.author.karma} karma</span>
            <Clock size={14} style={{ color: colors.tertiaryText, marginLeft: '0.5rem' }} />
            <span className="text-xs" style={{ color: colors.tertiaryText }}>{new Date(comment.timestamp).toLocaleDateString()}</span>
          </div>
          
          {/* Comment Content */}
          <p className="mb-3" style={{ color: colors.secondaryText }}>{comment.content}</p>
          
          {/* Comment Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote(comment.id, 'up')}
              className="flex items-center gap-1 transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryBlue; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondaryText; }}
            >
              <ThumbsUp size={16} />
              <span className="text-sm">{comment.votes}</span>
            </button>
            <button
              onClick={() => handleReplyToComment(comment.id)}
              className="flex items-center gap-1 transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.badgePurpleText; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondaryText; }}
            >
              <Reply size={16} />
              <span className="text-sm">Reply</span>
            </button>
          </div>
          
          {/* Reply Input (if replying) */}
          {replyingToComment === comment.id && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg resize-none"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = colors.badgePurpleText; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className="px-4 py-1 text-sm rounded-lg transition-colors"
                  style={{
                    background: replyContent.trim() ? colors.badgePurpleText : colors.inputBackground,
                    color: replyContent.trim() ? 'white' : colors.tertiaryText,
                  }}
                  onMouseEnter={(e) => {
                    if (replyContent.trim()) {
                      e.currentTarget.style.background = colors.badgePurpleText + 'dd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (replyContent.trim()) {
                      e.currentTarget.style.background = colors.badgePurpleText;
                    }
                  }}
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingToComment(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-1 text-sm rounded-lg transition-colors"
                  style={{
                    background: colors.inputBackground,
                    color: colors.primaryText,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.inputBackground; }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Render Children (replies) */}
        {comment.children && comment.children.length > 0 && (
          <div className="pl-4" style={{ borderLeft: `2px solid ${colors.border}` }}>
            {renderCommentTree(comment.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.background }}>
      {/* Header */}
      <DiscussionHeader
        filters={filters}
        communities={communities}
        onUpdateFilters={updateFilters}
        onShowFilters={() => setShowFilters(true)}
        onRefresh={handleRefresh}
      />

      {/* Tabs */}
      <DiscussionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Communities Tab */}
              {activeTab === 'communities' && (
                <div className="space-y-6">
                  {/* Professional Network Overview */}
                  <div
                    className="rounded-xl p-6 border"
                    style={{
                      background: `linear-gradient(to right, ${colors.primaryBlue}15, ${colors.badgePurpleBg}15)`,
                      borderColor: colors.border,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold mb-1" style={{ color: colors.primaryText }}>Professional Networks</h2>
                        <p className="text-sm" style={{ color: colors.secondaryText }}>Join communities and connect with professionals</p>
                      </div>
                      <button
                        onClick={() => setShowCreateCommunity(true)}
                        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        style={{
                          background: colors.primaryBlue,
                          color: 'white',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                      >
                        <Plus size={16} />
                        Create Network
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredCommunities.map(community => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          onJoin={handleJoinCommunity}
                          onView={handleViewCommunity}
                          onPost={handlePostToCommunity}
                          onEditCommunity={handleEditCommunity}
                          onManageMembers={handleManageMembers}
                          onModerationTools={handleModerationTools}
                          onDeleteCommunity={handleDeleteCommunity}
                          isJoined={joinedCommunities.includes(community.id)}
                          isAnimating={animatingCommunityId === community.id}
                        />
                      ))}
                    </div>
                    
                    {filteredCommunities.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: colors.inputBackground }}>
                          <MessageSquare size={20} style={{ color: colors.tertiaryText }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: colors.primaryText }}>No Professional Networks Found</h3>
                        <p className="mb-4" style={{ color: colors.secondaryText }}>Create your first professional network to get started</p>
                        <button
                          onClick={() => setShowCreateCommunity(true)}
                          className="px-4 py-2 rounded-lg transition-colors"
                          style={{
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                        >
                          Create Network
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Posts Tab */}
              {activeTab !== 'communities' && (
                <div className="space-y-4">

                  {/* Filter Toggle Buttons */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => {
                        setShowBookmarkedOnly(!showBookmarkedOnly);
                        setShowReportedOnly(false);
                      }}
                      className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      style={{
                        background: showBookmarkedOnly ? colors.primaryBlue : colors.inputBackground,
                        color: showBookmarkedOnly ? 'white' : colors.primaryText,
                      }}
                      onMouseEnter={(e) => {
                        if (!showBookmarkedOnly) {
                          e.currentTarget.style.background = colors.hoverBackground;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!showBookmarkedOnly) {
                          e.currentTarget.style.background = colors.inputBackground;
                        }
                      }}
                    >
                      <Bookmark size={16} />
                      <span>Bookmarked ({bookmarkedPosts.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowReportedOnly(!showReportedOnly);
                        setShowBookmarkedOnly(false);
                      }}
                      className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      style={{
                        background: showReportedOnly ? colors.badgeErrorText : colors.inputBackground,
                        color: showReportedOnly ? 'white' : colors.primaryText,
                      }}
                      onMouseEnter={(e) => {
                        if (!showReportedOnly) {
                          e.currentTarget.style.background = colors.hoverBackground;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!showReportedOnly) {
                          e.currentTarget.style.background = colors.inputBackground;
                        }
                      }}
                    >
                      <Flag size={16} />
                      <span>Reported ({Object.keys(flaggedPosts).length})</span>
                    </button>
                  </div>

                  {/* Posts List */}
                  {displayPosts.length > 0 ? (
                    <div className="space-y-4">
                      {displayPosts.map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onVote={handleVote}
                          onComment={handleComment}
                          onShare={handleShare}
                          onBookmark={handleBookmark}
                          onFlag={handleFlag}
                          onView={handleView}
                          onPin={handlePin}
                          isBookmarked={bookmarkedPosts.includes(post.id)}
                          isFlagged={flaggedPosts[post.id] !== undefined}
                          animatingAction={animatingIcons[post.id]}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 rounded-lg border border-dashed" style={{ background: colors.cardBackground, borderColor: colors.border }}>
                      <MessageSquare size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                      <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primaryText }}>
                        {showBookmarkedOnly ? 'No bookmarked posts yet' : showReportedOnly ? 'No reported posts' : 'No discussions found'}
                      </h3>
                      <p className="mb-4" style={{ color: colors.secondaryText }}>
                        {showBookmarkedOnly 
                          ? 'Bookmark posts to save them for later' 
                          : showReportedOnly 
                          ? 'No posts have been reported' 
                          : 'Start a new discussion or adjust your filters'}
                      </p>
                      {!showBookmarkedOnly && !showReportedOnly && (
                        <button
                          onClick={() => setShowCreatePost(true)}
                          className="px-4 py-2 rounded-lg transition-colors"
                          style={{
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                        >
                          Create Discussion
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Create Post Button */}
        {activeTab !== 'communities' && (
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryBlueHover;
              e.currentTarget.style.boxShadow = `0 10px 25px ${colors.primaryBlue}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}20`;
            }}
            title="Create Post"
            aria-label="Create Post"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        )}
        
        {/* Create Community Button */}
        {activeTab === 'communities' && (
          <button
            onClick={() => setShowCreateCommunity(true)}
            className="w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group"
            style={{
              background: colors.badgePurpleText,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgePurpleText + 'dd';
              e.currentTarget.style.boxShadow = `0 10px 25px ${colors.badgePurpleText}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.badgePurpleText;
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}20`;
            }}
            title="Create Community"
            aria-label="Create Community"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        )}
        
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group"
          style={{
            background: colors.inputBackground,
            color: colors.primaryText,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.boxShadow = `0 10px 25px ${colors.border}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.inputBackground;
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}20`;
          }}
          title="Refresh"
          aria-label="Refresh discussions"
        >
          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-200" />
        </button>
      </div>

      {/* Modals */}
      {showFilters && (
        <DiscussionFilters
          filters={filters}
          onUpdateFilters={updateFilters}
          onResetFilters={resetFilters}
          onClose={() => setShowFilters(false)}
          communities={communities.map(c => ({ id: c.id, name: c.name }))}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: colors.cardBackground }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Create Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.secondaryText; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                title="Close"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Post Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Post Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              {/* Community Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Post to Community *
                </label>
                <select 
                  value={newPost.community}
                  onChange={(e) => setNewPost(prev => ({ ...prev, community: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                  required
                  title="Select a community to post to"
                  aria-label="Select a community to post to"
                >
                  <option value="">Select a community</option>
                  {communities.map(community => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
                  {joinedCommunities.filter(id => communities.find(c => c.id === id)).length > 0 && 
                    `${joinedCommunities.filter(id => communities.find(c => c.id === id)).length} joined communities`}
                </p>
              </div>

              {/* Post Content */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg resize-none"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Post Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="postType" value="discussion" defaultChecked className="mr-2" style={{ accentColor: colors.primaryBlue }} />
                    <span className="text-sm" style={{ color: colors.primaryText }}>Discussion</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="postType" value="question" className="mr-2" style={{ accentColor: colors.primaryBlue }} />
                    <span className="text-sm" style={{ color: colors.primaryText }}>Question</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="postType" value="announcement" className="mr-2" style={{ accentColor: colors.primaryBlue }} />
                    <span className="text-sm" style={{ color: colors.primaryText }}>Announcement</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Tags (optional)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tags separated by commas"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const newTags = input.value.split(',').map(t => t.trim()).filter(t => t && !newPost.tags.includes(t));
                          if (newTags.length > 0) {
                            setNewPost(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }));
                            input.value = '';
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-lg"
                      style={{
                        background: colors.inputBackground,
                        border: `1px solid ${colors.border}`,
                        color: colors.primaryText,
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                    />
                  </div>
                  
                  {/* Display tags */}
                  {newPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                          style={{
                            background: `${colors.primaryBlue}20`,
                            color: colors.activeBlueText,
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => {
                              setNewPost(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
                            }}
                            className="ml-2"
                            style={{ color: colors.activeBlueText }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = colors.badgeErrorText; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = colors.activeBlueText; }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>Tags help others find your post. Press Enter to add.</p>
              </div>

              {/* Post Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" style={{ accentColor: colors.primaryBlue }} />
                  <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Pin this post</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" style={{ accentColor: colors.primaryBlue }} />
                  <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Allow comments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" style={{ accentColor: colors.primaryBlue }} />
                  <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Notify community members</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
            <button
              onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Create the new post
                  if (newPost.title.trim() && newPost.content.trim() && newPost.community) {
                    const selectedCommunity = communities.find(c => c.id === newPost.community);
                    const createdPost = {
                      title: newPost.title,
                      content: newPost.content,
                      author: {
                        id: 'currentUser',
                        name: 'Current User',
                        avatar: '/avatars/default.jpg',
                        role: 'user' as const,
                        karma: 100,
                        verified: false
                      },
                      community: selectedCommunity?.name || 'General',
                      category: selectedCommunity?.category || 'general',
                      timestamp: new Date().toISOString(),
                      votes: 0,
                      comments: 0,
                      views: 0,
                      isPinned: false,
                      isLocked: false,
                      tags: newPost.tags,
                      aiScore: 0.5,
                      type: newPost.type
                    };
                    
                    addPost(createdPost);
                    logger.debug('Post created:', createdPost);
                    
                    // Increment post count for the community
                    if (selectedCommunity) {
                      setCommunities(prev => prev.map(c => 
                        c.id === selectedCommunity.id 
                          ? { ...c, postCount: c.postCount + 1 }
                          : c
                      ));
                    }
                    
                    // Reset form
                    setNewPost({
                      title: '',
                      content: '',
                      community: '',
                      type: 'text' as const,
                      tags: []
                    });
                    
                    setShowCreatePost(false);
                  }
                }}
                disabled={!newPost.title.trim() || !newPost.content.trim() || !newPost.community}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: (newPost.title.trim() && newPost.content.trim() && newPost.community) ? colors.primaryBlue : colors.inputBackground,
                  color: (newPost.title.trim() && newPost.content.trim() && newPost.community) ? 'white' : colors.tertiaryText,
                }}
                onMouseEnter={(e) => {
                  if (newPost.title.trim() && newPost.content.trim() && newPost.community) {
                    e.currentTarget.style.background = colors.primaryBlueHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (newPost.title.trim() && newPost.content.trim() && newPost.community) {
                    e.currentTarget.style.background = colors.primaryBlue;
                  }
                }}
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateCommunity && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: colors.cardBackground }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Create Community</h2>
              <button
                onClick={() => setShowCreateCommunity(false)}
                className="transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.secondaryText; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                title="Close"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Community Name *
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter community name"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Description *
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your community"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg resize-none"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Category
                </label>
                <select
                  value={newCommunity.category}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                  title="Select community category"
                  aria-label="Select community category"
                >
                  <option value="general">General</option>
                  <option value="resume">Resume</option>
                  <option value="career">Career</option>
                  <option value="interview">Interview</option>
                  <option value="job-search">Job Search</option>
                  <option value="networking">Networking</option>
                  <option value="ai-help">AI Help</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newCommunity.isPrivate}
                    onChange={(e) => setNewCommunity(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="mr-2"
                    style={{ accentColor: colors.primaryBlue }}
                  />
                  <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Private Community</span>
                </label>
                <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>Private communities require approval to join</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 rounded-lg"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newTag.trim() && !newCommunity.tags.includes(newTag.trim())) {
                          setNewCommunity(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
                          setNewTag('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTag.trim() && !newCommunity.tags.includes(newTag.trim())) {
                        setNewCommunity(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
                        setNewTag('');
                      }
                    }}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newCommunity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-full"
                      style={{
                        background: `${colors.primaryBlue}20`,
                        color: colors.activeBlueText,
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => {
                          setNewCommunity(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
                        }}
                        className="ml-1"
                        style={{ color: colors.activeBlueText }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = colors.badgeErrorText; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = colors.activeBlueText; }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Community Rules
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="flex-1 px-3 py-2 rounded-lg"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newRule.trim() && !newCommunity.rules.includes(newRule.trim())) {
                          setNewCommunity(prev => ({ ...prev, rules: [...prev.rules, newRule.trim()] }));
                          setNewRule('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newRule.trim() && !newCommunity.rules.includes(newRule.trim())) {
                        setNewCommunity(prev => ({ ...prev, rules: [...prev.rules, newRule.trim()] }));
                        setNewRule('');
                      }
                    }}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {newCommunity.rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded" style={{ background: colors.inputBackground }}>
                      <span className="text-sm" style={{ color: colors.primaryText }}>{rule}</span>
                      <button
                        onClick={() => {
                          setNewCommunity(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }));
                        }}
                        style={{ color: colors.badgeErrorText }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = colors.badgeErrorText + 'dd'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = colors.badgeErrorText; }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
            <button
              onClick={() => setShowCreateCommunity(false)}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCommunity.name.trim() && newCommunity.description.trim()) {
                    const newComm = addCommunity({
                      name: newCommunity.name.trim(),
                      description: newCommunity.description.trim(),
                      category: newCommunity.category,
                      isPrivate: newCommunity.isPrivate,
                      tags: newCommunity.tags,
                      rules: newCommunity.rules,
                      memberCount: 1,
                      postCount: 0,
                      moderators: ['current-user'],
                      createdAt: new Date().toISOString()
                    });
                    
                    // Auto-join the user to their new community
                    const communityId = `community_${Date.now()}`;
                    const updatedJoined = [...joinedCommunities, communityId];
                    setJoinedCommunities(updatedJoined);
                    localStorage.setItem('joinedCommunities', JSON.stringify(updatedJoined));
                    
                    setNewCommunity({
                      name: '',
                      description: '',
                      category: 'general',
                      isPrivate: false,
                      tags: [],
                      rules: []
                    });
                    setShowCreateCommunity(false);
                  }
                }}
                disabled={!newCommunity.name.trim() || !newCommunity.description.trim()}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: (newCommunity.name.trim() && newCommunity.description.trim()) ? colors.primaryBlue : colors.inputBackground,
                  color: (newCommunity.name.trim() && newCommunity.description.trim()) ? 'white' : colors.tertiaryText,
                }}
                onMouseEnter={(e) => {
                  if (newCommunity.name.trim() && newCommunity.description.trim()) {
                    e.currentTarget.style.background = colors.primaryBlueHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (newCommunity.name.trim() && newCommunity.description.trim()) {
                    e.currentTarget.style.background = colors.primaryBlue;
                  }
                }}
              >
                Create Community
            </button>
            </div>
          </div>
        </div>
      )}

      {showCommunitySettings && selectedCommunityForSettings && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: colors.background }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Edit Community</h2>
              <button
                onClick={() => {
                  setShowCommunitySettings(false);
                  setSelectedCommunityForSettings(null);
                }}
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                className="transition-colors"
                title="Close"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>Community Name</label>
                <input
                  type="text"
                  value={selectedCommunityForSettings.name}
                  onChange={(e) => {
                    setCommunities(prev => prev.map(c => 
                      c.id === selectedCommunityForSettings.id 
                        ? { ...c, name: e.target.value } 
                        : c
                    ));
                    setSelectedCommunityForSettings(prev => prev ? { ...prev, name: e.target.value } : null);
                  }}
                  className="w-full px-3 py-2 rounded-lg"
                  title="Community Name"
                  aria-label="Community Name"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>Description</label>
                <textarea
                  value={selectedCommunityForSettings.description}
                  onChange={(e) => {
                    setCommunities(prev => prev.map(c => 
                      c.id === selectedCommunityForSettings.id 
                        ? { ...c, description: e.target.value } 
                        : c
                    ));
                    setSelectedCommunityForSettings(prev => prev ? { ...prev, description: e.target.value } : null);
                  }}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg resize-none"
                  title="Community Description"
                  aria-label="Community Description"
                  placeholder="Enter community description"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>Category</label>
                <select
                  value={selectedCommunityForSettings.category}
                  onChange={(e) => {
                    const category = e.target.value as Community['category'];
                    setCommunities(prev => prev.map(c => 
                      c.id === selectedCommunityForSettings.id 
                        ? { ...c, category } 
                        : c
                    ));
                    setSelectedCommunityForSettings(prev => prev ? { ...prev, category } : null);
                  }}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                  title="Select community category"
                  aria-label="Select community category"
                >
                  <option value="general">General</option>
                  <option value="resume">Resume</option>
                  <option value="career">Career</option>
                  <option value="interview">Interview</option>
                  <option value="job-search">Job Search</option>
                  <option value="networking">Networking</option>
                  <option value="ai-help">AI Help</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCommunityForSettings.isPrivate}
                    onChange={(e) => {
                      setCommunities(prev => prev.map(c => 
                        c.id === selectedCommunityForSettings.id 
                          ? { ...c, isPrivate: e.target.checked } 
                          : c
                      ));
                      setSelectedCommunityForSettings(prev => prev ? { ...prev, isPrivate: e.target.checked } : null);
                    }}
                    className="mr-2"
                    style={{ accentColor: colors.primaryBlue }}
                  />
                  <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Private Community</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Members: {selectedCommunityForSettings.memberCount} | Posts: {selectedCommunityForSettings.postCount}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={() => {
                  setShowCommunitySettings(false);
                  setSelectedCommunityForSettings(null);
                }}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCommunitySettings(false);
                  setSelectedCommunityForSettings(null);
                }}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showManageMembers && managingMembersFor && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: colors.background }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
              <h2 className="text-xl font-bold text-white">Manage Members - {managingMembersFor.name}</h2>
              <button
                onClick={() => {
                  setShowManageMembers(false);
                  setManagingMembersFor(null);
                }}
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
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.primaryText }}>Members ({communityMembers[managingMembersFor.id]?.length || 0})</h3>
                    <p className="text-sm" style={{ color: colors.tertiaryText }}>Manage roles and permissions</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors" style={{ background: colors.primaryBlue, color: 'white' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                    >
                      <Users size={16} />
                      Invite Members
                    </button>
                  </div>
                </div>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search members..."
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>
              
              {/* Members List */}
              <div className="space-y-3">
                {(communityMembers[managingMembersFor.id] || []).map((member, index) => (
                  <div key={index} className="rounded-lg p-4 transition-shadow" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold" style={{ color: colors.primaryText }}>{member.name}</h4>
                            {member.role === 'admin' && (
                              <span className="px-2 py-0.5 text-xs rounded-full" style={{ background: `${colors.badgeErrorText}20`, color: colors.badgeErrorText }}>Admin</span>
                            )}
                            {member.role === 'moderator' && (
                              <span className="px-2 py-0.5 text-xs rounded-full" style={{ background: `${colors.primaryBlue}20`, color: colors.activeBlueText }}>Mod</span>
                            )}
                            {member.role === 'member' && (
                              <span className="px-2 py-0.5 text-xs rounded-full" style={{ background: colors.inputBackground, color: colors.primaryText }}>Member</span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: colors.tertiaryText }}>{member.email}</p>
                          <div className="flex items-center gap-4 text-xs mt-1" style={{ color: colors.tertiaryText }}>
                            <span>{member.postCount} posts</span>
                            <span>Joined {member.joinedAt}</span>
                            <span>Last active: {member.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) => {
                            // In real app, update member role
                            logger.debug(`Change role for ${member.name} to ${e.target.value}`);
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{
                            background: colors.inputBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                          title={`Change role for ${member.name}`}
                          aria-label={`Change role for ${member.name}`}
                        >
                          <option value="member">Member</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from ${managingMembersFor.name}?`)) {
                              logger.debug(`Removed ${member.name}`);
                              // In real app, remove member from community
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg transition-colors text-sm"
                          style={{
                            background: 'transparent',
                            border: `1px solid ${colors.badgeErrorText}`,
                            color: colors.badgeErrorText,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${colors.badgeErrorText}20`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Tools Modal */}
      {showCommunityModerationTools && moderatingCommunity && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: colors.background }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(to right, #dc2626, #ea580c)` }}>
              <h2 className="text-xl font-bold text-white">Moderation Tools - {moderatingCommunity.name}</h2>
              <button
                onClick={() => {
                  setShowCommunityModerationTools(false);
                  setModeratingCommunity(null);
                }}
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
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button className="px-4 py-2 font-medium" style={{ borderBottom: `2px solid #dc2626`, color: '#dc2626' }}>Reported Posts (2)</button>
                <button className="px-4 py-2 transition-colors" style={{ color: colors.tertiaryText }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                >Flagged Content</button>
                <button className="px-4 py-2 transition-colors" style={{ color: colors.tertiaryText }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                >Member Violations</button>
                <button className="px-4 py-2 transition-colors" style={{ color: colors.tertiaryText }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                >Rules</button>
              </div>
              
              {/* Reported Posts */}
              <div className="space-y-4">
                <div className="rounded-lg p-4" style={{ border: `1px solid ${colors.badgeErrorText}40`, background: `${colors.badgeErrorText}15` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold" style={{ color: colors.primaryText }}>Post: "Need Help with Resume"</h4>
                        <span className="px-2 py-0.5 text-white text-xs rounded-full" style={{ background: '#dc2626' }}>Reported</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>Reason: Spam/Inappropriate content</p>
                      <p className="text-xs" style={{ color: colors.tertiaryText }}>Reported by: 3 users | Author: @username</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" style={{ background: '#16a34a' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#16a34a'; }}
                      >
                        Approve
                      </button>
                      <button className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" style={{ background: '#dc2626' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg p-4" style={{ border: `1px solid #ea580c40`, background: '#ea580c15' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold" style={{ color: colors.primaryText }}>Post: "Job Interview Tips"</h4>
                        <span className="px-2 py-0.5 text-white text-xs rounded-full" style={{ background: '#ea580c' }}>Under Review</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>Reason: Misleading information</p>
                      <p className="text-xs" style={{ color: colors.tertiaryText }}>Reported by: 1 user | Author: @username2</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" style={{ background: '#16a34a' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#16a34a'; }}
                      >
                        Approve
                      </button>
                      <button className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" style={{ background: '#dc2626' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                      >
                        Remove
                      </button>
                      <button className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" style={{ background: colors.primaryBlue }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primaryText }}>Quick Actions</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-4 rounded-lg transition-shadow text-center" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <Shield size={24} className="mx-auto mb-2" style={{ color: colors.primaryBlue }} />
                    <p className="text-sm font-medium" style={{ color: colors.primaryText }}>Automod Settings</p>
                  </button>
                  <button className="p-4 rounded-lg transition-shadow text-center" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <Users size={24} className="mx-auto mb-2" style={{ color: '#16a34a' }} />
                    <p className="text-sm font-medium" style={{ color: colors.primaryText }}>Ban Members</p>
                  </button>
                  <button className="p-4 rounded-lg transition-shadow text-center" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <Trash2 size={24} className="mx-auto mb-2" style={{ color: colors.badgeErrorText }} />
                    <p className="text-sm font-medium" style={{ color: colors.primaryText }}>Clean Up Posts</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail View with Comment Tree */}
      {viewingPostDetail && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col" style={{ background: colors.background }}>
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
              <h2 className="text-xl font-bold text-white">{viewingPostDetail.title}</h2>
              <button
                onClick={() => {
                  setViewingPostDetail(null);
                  setReplyingToComment(null);
                  setReplyContent('');
                }}
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
                    <div className="font-semibold" style={{ color: colors.primaryText }}>{viewingPostDetail.author.name}</div>
                    <div className="text-sm" style={{ color: colors.tertiaryText }}>{viewingPostDetail.community}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-4 text-sm" style={{ color: colors.tertiaryText }}>
                    <span>{viewingPostDetail.views} views</span>
                    <span>{new Date(viewingPostDetail.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap" style={{ color: colors.primaryText }}>{viewingPostDetail.content}</p>
                
                {/* Post Actions */}
                <div className="flex items-center gap-4 mt-6 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <button
                    onClick={() => handleVote(viewingPostDetail.id, 'up')}
                    className="flex items-center gap-2 transition-colors"
                    style={{ color: colors.tertiaryText }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryBlue; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                  >
                    <ThumbsUp size={18} />
                    <span>{viewingPostDetail.votes} votes</span>
                  </button>
                  <button
                    onClick={() => {
                      setCommentingPostId(viewingPostDetail.id);
                      setShowCommentModal(true);
                    }}
                    className="flex items-center gap-2 transition-colors"
                    style={{ color: colors.tertiaryText }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = colors.badgePurpleText; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
                  >
                    <MessageSquare size={18} />
                    <span>Comment</span>
                  </button>
                  <button
                    onClick={() => handleShare(viewingPostDetail.id)}
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
                  <h3 className="text-lg font-bold" style={{ color: colors.primaryText }}>Comments ({comments.filter(c => c.postId === viewingPostDetail.id).length})</h3>
                  <button
                    onClick={() => {
                      setCommentingPostId(viewingPostDetail.id);
                      setShowCommentModal(true);
                    }}
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
                  {renderCommentTree(buildCommentTree(viewingPostDetail.id))}
                  {comments.filter(c => c.postId === viewingPostDetail.id).length === 0 && (
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
      )}

      {/* Comment Modal */}
      {showCommentModal && commentingPostId && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" style={{ background: colors.background }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
              <h2 className="text-xl font-bold text-white">Add Comment</h2>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setCommentingPostId(null);
                  setNewComment('');
                }}
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
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.secondaryText }}>Your Comment</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg resize-none"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentingPostId(null);
                    setNewComment('');
                  }}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: newComment.trim() 
                      ? `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`
                      : colors.inputBackground,
                    color: newComment.trim() ? 'white' : colors.tertiaryText,
                  }}
                  onMouseEnter={(e) => {
                    if (newComment.trim()) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newComment.trim()) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
