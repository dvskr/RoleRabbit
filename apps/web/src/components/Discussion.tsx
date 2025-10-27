'use client';

import React, { useState } from 'react';
import { Plus, MessageSquare, RefreshCw, X, ChevronDown, ChevronUp, Reply, ThumbsUp, ThumbsDown, Clock, User, Bookmark, Flag, Search as SearchIcon, Users, Shield, Trash2 } from 'lucide-react';
import { useDiscussion } from '../hooks/useDiscussion';
import DiscussionHeader from './discussion/DiscussionHeader';
import DiscussionTabs from './discussion/DiscussionTabs';
import PostCard from './discussion/PostCard';
import CommunityCard from './discussion/CommunityCard';
import DiscussionFilters from './discussion/DiscussionFilters';
import { logger } from '../utils/logger';
import { Comment, Post, Community } from '../types/discussion';

interface CommentWithChildren extends Comment {
  children?: CommentWithChildren[];
}

export default function Discussion() {
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
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
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
  const filteredCommunitiesForPost = React.useMemo(() => {
    let filtered = [...communities];
    
    // Filter by search query
    if (communitySearchQuery) {
      const query = communitySearchQuery.toLowerCase();
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
  }, [communities, communitySearchQuery, joinedCommunities]);
  
  // Post detail view state
  const [viewingPostDetail, setViewingPostDetail] = useState<Post | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleVote = (id: string, direction: 'up' | 'down') => {
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
  };

  const handleComment = (postId: string) => {
    setCommentingPostId(postId);
    setShowCommentModal(true);
    logger.debug(`Opening comment modal for post ${postId}`);
  };

  const handleViewPost = (postId: string) => {
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
  };

  const handleReplyToComment = (commentId: string) => {
    setReplyingToComment(commentId);
    setReplyContent('');
  };

  const handleSubmitReply = (commentId: string) => {
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
  };

  const handleShare = (postId: string) => {
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
  };

  const handleBookmark = (postId: string) => {
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
  };

  const handleFlag = (postId: string) => {
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
  };

  const handlePin = (postId: string) => {
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
  };

  const handleView = (postId: string) => {
    logger.debug(`View post ${postId}`);
    handleViewPost(postId);
  };

  const handleJoinCommunity = (communityId: string) => {
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
  };

  const handleViewCommunity = (communityId: string) => {
    logger.debug(`View community ${communityId}`);
    // Filter posts by community
    const community = communities.find(c => c.id === communityId);
    if (community) {
      updateFilters({ selectedCommunity: community.name });
      setActiveTab('all'); // Switch to posts tab to see filtered posts
    }
  };

  const handlePostToCommunity = (communityId: string) => {
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
  };

  const handleCommunitySettings = (community: any) => {
    setSelectedCommunityForSettings(community);
    setShowCommunitySettings(true);
  };

  const handleEditCommunity = (community: Community) => {
    setSelectedCommunityForSettings(community);
    setShowCommunitySettings(true);
  };

  const handleManageMembers = (community: Community) => {
    setManagingMembersFor(community);
    setShowManageMembers(true);
  };

  const handleModerationTools = (community: Community) => {
    setModeratingCommunity(community);
    setShowCommunityModerationTools(true);
  };

  const handleDeleteCommunity = (community: Community) => {
    if (confirm(`Are you sure you want to delete "${community.name}"?\n\nThis action cannot be undone and will remove all posts, members, and data associated with this community.`)) {
      setCommunities(prev => prev.filter(c => c.id !== community.id));
      // Also remove from joined communities
      setJoinedCommunities(prev => prev.filter(id => id !== community.id));
      localStorage.setItem('joinedCommunities', JSON.stringify(joinedCommunities.filter(id => id !== community.id)));
      
      logger.debug(`Deleted community: ${community.name}`);
    }
  };

  const handleRefresh = () => {
    logger.debug('Refresh discussions');
    // Refresh by resetting posts to trigger a re-render
    // In a real app, this would fetch fresh data from API
    window.location.reload();
  };

  const handleSubmitComment = () => {
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
  };

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
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-500" />
            <span className="font-semibold text-gray-900">{comment.author.name}</span>
            {comment.author.verified && <span className="text-blue-600">✓</span>}
            <span className="text-sm text-gray-500">{comment.author.karma} karma</span>
            <Clock size={14} className="text-gray-400 ml-2" />
            <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
          </div>
          
          {/* Comment Content */}
          <p className="text-gray-800 mb-3">{comment.content}</p>
          
          {/* Comment Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote(comment.id, 'up')}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ThumbsUp size={16} />
              <span className="text-sm">{comment.votes}</span>
            </button>
            <button
              onClick={() => handleReplyToComment(comment.id)}
              className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Reply size={16} />
              <span className="text-sm">Reply</span>
            </button>
          </div>
          
          {/* Reply Input (if replying) */}
          {replyingToComment === comment.id && (
            <div className="mt-4 border-t pt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className={`px-4 py-1 text-sm rounded-lg ${
                    replyContent.trim() 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingToComment(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Render Children (replies) */}
        {comment.children && comment.children.length > 0 && (
          <div className="border-l-2 border-gray-200 pl-4">
            {renderCommentTree(comment.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
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
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Professional Networks</h2>
                        <p className="text-sm text-gray-600">Join communities and connect with professionals</p>
                      </div>
                      <button
                        onClick={() => setShowCreateCommunity(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Create Network
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <MessageSquare size={20} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Professional Networks Found</h3>
                        <p className="text-gray-600 mb-4">Create your first professional network to get started</p>
                        <button
                          onClick={() => setShowCreateCommunity(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        showBookmarkedOnly 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark size={16} />
                      <span>Bookmarked ({bookmarkedPosts.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowReportedOnly(!showReportedOnly);
                        setShowBookmarkedOnly(false);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        showReportedOnly 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
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
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                      <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {showBookmarkedOnly ? 'No bookmarked posts yet' : showReportedOnly ? 'No reported posts' : 'No discussions found'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {showBookmarkedOnly 
                          ? 'Bookmark posts to save them for later' 
                          : showReportedOnly 
                          ? 'No posts have been reported' 
                          : 'Start a new discussion or adjust your filters'}
                      </p>
                      {!showBookmarkedOnly && !showReportedOnly && (
                        <button
                          onClick={() => setShowCreatePost(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            title="Create Post"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        )}
        
        {/* Create Community Button */}
        {activeTab === 'communities' && (
          <button
            onClick={() => setShowCreateCommunity(true)}
            className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            title="Create Community"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        )}
        
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Refresh"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Post Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Community Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post to Community *
                </label>
                <select 
                  value={newPost.community}
                  onChange={(e) => setNewPost(prev => ({ ...prev, community: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a community</option>
                  {communities.map(community => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {joinedCommunities.filter(id => communities.find(c => c.id === id)).length > 0 && 
                    `${joinedCommunities.filter(id => communities.find(c => c.id === id)).length} joined communities`}
                </p>
              </div>

              {/* Post Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="postType" value="discussion" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Discussion</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="postType" value="question" className="mr-2" />
                    <span className="text-sm text-gray-700">Question</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="postType" value="announcement" className="mr-2" />
                    <span className="text-sm text-gray-700">Announcement</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Display tags */}
                  {newPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => {
                              setNewPost(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Tags help others find your post. Press Enter to add.</p>
              </div>

              {/* Post Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm font-medium text-gray-700">Pin this post</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm font-medium text-gray-700">Allow comments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm font-medium text-gray-700">Notify community members</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                className={`px-4 py-2 rounded-lg transition-colors ${
                  newPost.title.trim() && newPost.content.trim() && newPost.community
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Community</h2>
              <button
                onClick={() => setShowCreateCommunity(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter community name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your community"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newCommunity.category}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  />
                  <span className="text-sm font-medium text-gray-700">Private Community</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Private communities require approval to join</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newCommunity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          setNewCommunity(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Rules
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {newCommunity.rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{rule}</span>
                      <button
                        onClick={() => {
                          setNewCommunity(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowCreateCommunity(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Community
            </button>
            </div>
          </div>
        </div>
      )}

      {showCommunitySettings && selectedCommunityForSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Community</h2>
              <button
                onClick={() => {
                  setShowCommunitySettings(false);
                  setSelectedCommunityForSettings(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Community Name</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  />
                  <span className="text-sm font-medium text-gray-700">Private Community</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Members: {selectedCommunityForSettings.memberCount} | Posts: {selectedCommunityForSettings.postCount}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCommunitySettings(false);
                  setSelectedCommunityForSettings(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCommunitySettings(false);
                  setSelectedCommunityForSettings(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showManageMembers && managingMembersFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Manage Members - {managingMembersFor.name}</h2>
              <button
                onClick={() => {
                  setShowManageMembers(false);
                  setManagingMembersFor(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Members ({communityMembers[managingMembersFor.id]?.length || 0})</h3>
                    <p className="text-sm text-gray-600">Manage roles and permissions</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Users size={16} />
                      Invite Members
                    </button>
                  </div>
                </div>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search members..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Members List */}
              <div className="space-y-3">
                {(communityMembers[managingMembersFor.id] || []).map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            {member.role === 'admin' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Admin</span>
                            )}
                            {member.role === 'moderator' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Mod</span>
                            )}
                            {member.role === 'member' && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">Member</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
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
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Moderation Tools - {moderatingCommunity.name}</h2>
              <button
                onClick={() => {
                  setShowCommunityModerationTools(false);
                  setModeratingCommunity(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button className="px-4 py-2 border-b-2 border-red-600 text-red-600 font-medium">Reported Posts (2)</button>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Flagged Content</button>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Member Violations</button>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Rules</button>
              </div>
              
              {/* Reported Posts */}
              <div className="space-y-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">Post: "Need Help with Resume"</h4>
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">Reported</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Reason: Spam/Inappropriate content</p>
                      <p className="text-xs text-gray-500">Reported by: 3 users | Author: @username</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">Post: "Job Interview Tips"</h4>
                        <span className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">Under Review</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Reason: Misleading information</p>
                      <p className="text-xs text-gray-500">Reported by: 1 user | Author: @username2</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                        Remove
                      </button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
                    <Shield size={24} className="mx-auto text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Automod Settings</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
                    <Users size={24} className="mx-auto text-green-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Ban Members</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
                    <Trash2 size={24} className="mx-auto text-red-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Clean Up Posts</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail View with Comment Tree */}
      {viewingPostDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold">{viewingPostDetail.title}</h2>
              <button
                onClick={() => {
                  setViewingPostDetail(null);
                  setReplyingToComment(null);
                  setReplyContent('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Post Content */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{viewingPostDetail.author.name}</div>
                    <div className="text-sm text-gray-500">{viewingPostDetail.community}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
                    <span>{viewingPostDetail.views} views</span>
                    <span>{new Date(viewingPostDetail.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{viewingPostDetail.content}</p>
                
                {/* Post Actions */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleVote(viewingPostDetail.id, 'up')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ThumbsUp size={18} />
                    <span>{viewingPostDetail.votes} votes</span>
                  </button>
                  <button
                    onClick={() => {
                      setCommentingPostId(viewingPostDetail.id);
                      setShowCommentModal(true);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <MessageSquare size={18} />
                    <span>Comment</span>
                  </button>
                  <button
                    onClick={() => handleShare(viewingPostDetail.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Comment Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Comments ({comments.filter(c => c.postId === viewingPostDetail.id).length})</h3>
                  <button
                    onClick={() => {
                      setCommentingPostId(viewingPostDetail.id);
                      setShowCommentModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Comment
                  </button>
                </div>

                {/* Comment Tree */}
                <div className="space-y-4">
                  {renderCommentTree(buildCommentTree(viewingPostDetail.id))}
                  {comments.filter(c => c.postId === viewingPostDetail.id).length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No comments yet. Be the first to comment!</p>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Comment</h2>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setCommentingPostId(null);
                  setNewComment('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Comment</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentingPostId(null);
                    setNewComment('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className={`px-6 py-2 text-white rounded-lg transition-colors ${
                    newComment.trim() 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
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
