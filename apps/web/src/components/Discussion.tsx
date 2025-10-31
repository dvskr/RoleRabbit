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
import type { CommentWithChildren, NewPost } from './discussion/types';
import { DEFAULT_NEW_POST, DEBOUNCE_DELAY_MS, ANIMATION_DURATION_MS } from './discussion/constants';
import { 
  buildCommentTree, 
  filterPostsByTab, 
  filterBookmarkedPosts, 
  filterFlaggedPosts,
  filterCommunitiesByQuery,
  calculateVoteIncrement,
  sharePost
} from './discussion/discussionHelpers';
import { useDiscussionBookmarks } from './discussion/hooks/useDiscussionBookmarks';
import { useDiscussionCommunities } from './discussion/hooks/useDiscussionCommunities';
import { useDiscussionComments } from './discussion/hooks/useDiscussionComments';
import { useDiscussionAnimation } from './discussion/hooks/useDiscussionAnimation';
import CommentTree from './discussion/components/CommentTree';
import CommentModal from './discussion/components/CommentModal';
import PostDetailView from './discussion/components/PostDetailView';
import CreatePostModal from './discussion/components/CreatePostModal';
import CreateCommunityModal from './discussion/components/CreateCommunityModal';
import CommunitySettingsModal from './discussion/components/CommunitySettingsModal';
import ManageMembersModal from './discussion/components/ManageMembersModal';
import ModerationToolsModal from './discussion/components/ModerationToolsModal';

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
  const [newPost, setNewPost] = useState<NewPost>(DEFAULT_NEW_POST);

  // Extract hooks for state management
  const bookmarks = useDiscussionBookmarks();
  const communitiesHook = useDiscussionCommunities(communities, setCommunities);
  const commentsHook = useDiscussionComments(addComment);
  const animation = useDiscussionAnimation();

  // Use extracted hooks state
  const {
    bookmarkedPosts,
    flaggedPosts,
    showBookmarkedOnly,
    showReportedOnly,
    setShowBookmarkedOnly,
    setShowReportedOnly,
    handleBookmark: handleBookmarkPost,
    handleFlag: handleFlagPost,
    handlePin: handlePinPost
  } = bookmarks;

  const {
    joinedCommunities,
    setJoinedCommunities,
    communitySearchQuery,
    setCommunitySearchQuery,
    debouncedCommunitySearchQuery,
    debouncedSetCommunitySearch,
    showCommunityDropdown,
    setShowCommunityDropdown,
    animatingCommunityId,
    filteredCommunitiesForPost,
    handleJoinCommunity,
    handleViewCommunity: handleViewCommunityBase,
    handlePostToCommunity: handlePostToCommunityBase,
    removeJoinedCommunity
  } = communitiesHook;

  const {
    showCommentModal,
    commentingPostId,
    newComment,
    setNewComment,
    viewingPostDetail,
    replyingToComment,
    replyContent,
    setReplyContent,
    handleComment,
    handleViewPost: handleViewPostBase,
    handleReplyToComment,
    handleSubmitReply,
    handleSubmitComment,
    closeCommentModal,
    closePostDetail,
    setViewingPostDetail,
    setReplyingToComment,
    setShowCommentModal,
    setCommentingPostId
  } = commentsHook;

  const { animatingIcons, animateIcon } = animation;

  // Debounce community search
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
  
  // Animation is now handled by useDiscussionAnimation hook

  // Computed values for filtered posts
  const displayPosts = React.useMemo(() => {
    let posts = filteredPosts;
    
    // Tab-specific filtering (only if tab is not 'all' or 'communities')
    if (activeTab !== 'all' && activeTab !== 'communities') {
      posts = filterPostsByTab(filteredPosts, activeTab);
    }
    
    // Bookmarked/Reported filtering
    if (showBookmarkedOnly) {
      return filterBookmarkedPosts(posts, bookmarkedPosts);
    }
    if (showReportedOnly) {
      return filterFlaggedPosts(posts, Object.keys(flaggedPosts));
    }
    
    return posts;
  }, [filteredPosts, activeTab, showBookmarkedOnly, showReportedOnly, bookmarkedPosts, flaggedPosts]);

  // Filtered communities and post detail state are now handled by hooks

  const handleVote = useCallback((id: string, direction: 'up' | 'down') => {
    const increment = calculateVoteIncrement(direction);
    
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

  // Comment handlers are now in useDiscussionComments hook

  const handleShare = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      await sharePost(post, postId);
    }
  }, [posts]);

  // Bookmark/Flag/Pin handlers - with animation
  const handleBookmark = useCallback((postId: string) => {
    animateIcon(postId, 'bookmark');
    handleBookmarkPost(postId, setPosts);
  }, [animateIcon, handleBookmarkPost, setPosts]);

  const handleFlag = useCallback((postId: string) => {
    animateIcon(postId, 'flag');
    handleFlagPost(postId);
  }, [animateIcon, handleFlagPost]);

  const handlePin = useCallback((postId: string) => {
    animateIcon(postId, 'pin');
    handlePinPost(postId, setPosts);
  }, [animateIcon, handlePinPost, setPosts]);

  // View and community handlers - wrapped with logging
  const handleView = useCallback((postId: string) => {
    logger.debug(`View post ${postId}`);
    handleViewPostBase(postId, posts, setPosts);
  }, [handleViewPostBase, posts, setPosts]);

  const handleJoinCommunityWithAnimation = useCallback((communityId: string) => {
    logger.debug(`Join/Leave community ${communityId}`);
    animation.animateCommunity(communityId);
    handleJoinCommunity(communityId);
  }, [animation, handleJoinCommunity]);

  const handleViewCommunityWithLogging = useCallback((communityId: string) => {
    logger.debug(`View community ${communityId}`);
    handleViewCommunityBase(communityId, updateFilters, (tab: string) => setActiveTab(tab as any));
  }, [handleViewCommunityBase, updateFilters, setActiveTab]);

  const handlePostToCommunityWithLogging = useCallback((communityId: string) => {
    logger.debug(`Post to community ${communityId}`);
    handlePostToCommunityBase(communityId, setNewPost, setShowCreatePost);
  }, [handlePostToCommunityBase, setNewPost, setShowCreatePost]);

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
      removeJoinedCommunity(community.id);
      
      logger.debug(`Deleted community: ${community.name}`);
    }
  }, [setCommunities, removeJoinedCommunity]);

  const handleRefresh = useCallback(() => {
    logger.debug('Refresh discussions');
    // Refresh by resetting posts to trigger a re-render
    // In a real app, this would fetch fresh data from API
    window.location.reload();
  }, []);

  // Submit comment handler - wrapped to add logging
  const handleSubmitCommentWithLogging = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    logger.debug('Submitting comment');
    handleSubmitComment(setPosts);
  }, [handleSubmitComment, setPosts]);

  // Saved state loading is now handled by hooks

  // Build comment tree structure - using helper function
  const getCommentTree = useCallback((postId: string): CommentWithChildren[] => {
    return buildCommentTree(comments, postId);
  }, [comments]);

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
                          onView={handleViewCommunityWithLogging}
                          onPost={handlePostToCommunityWithLogging}
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
      <CreatePostModal
        isOpen={showCreatePost}
        newPost={newPost}
        communities={communities}
        joinedCommunities={joinedCommunities}
        onClose={() => setShowCreatePost(false)}
        onPostChange={setNewPost}
        onCreatePost={(post) => {
          addPost(post);
          logger.debug('Post created:', post);
        }}
        onCommunityPostCountIncrement={(communityId) => {
                      setCommunities(prev => prev.map(c => 
            c.id === communityId 
                          ? { ...c, postCount: c.postCount + 1 }
                          : c
                      ));
        }}
      />

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={showCreateCommunity}
        newCommunity={newCommunity}
        onClose={() => setShowCreateCommunity(false)}
        onCommunityChange={(community) => setNewCommunity(community)}
        onCreateCommunity={(community: Omit<Community, 'id'>): Community => {
          return addCommunity(community);
        }}
        onJoinCommunity={(communityId) => {
          const updatedJoined = [...joinedCommunities, communityId];
          setJoinedCommunities(updatedJoined);
        }}
      />

      {/* Community Settings Modal */}
      <CommunitySettingsModal
        isOpen={showCommunitySettings}
        community={selectedCommunityForSettings}
        onClose={() => {
                  setShowCommunitySettings(false);
                  setSelectedCommunityForSettings(null);
                }}
        onCommunityUpdate={setCommunities}
        onSelectedCommunityUpdate={setSelectedCommunityForSettings}
      />

      {/* Manage Members Modal */}
      <ManageMembersModal
        isOpen={showManageMembers}
        community={managingMembersFor}
        members={communityMembers[managingMembersFor?.id || ''] || []}
        onClose={() => {
                  setShowManageMembers(false);
                  setManagingMembersFor(null);
                }}
      />

      {/* Moderation Tools Modal */}
      <ModerationToolsModal
        isOpen={showCommunityModerationTools}
        community={moderatingCommunity}
        onClose={() => {
                  setShowCommunityModerationTools(false);
                  setModeratingCommunity(null);
                }}
      />

      {/* Post Detail View with Comment Tree */}
      {viewingPostDetail && (
        <PostDetailView
          post={viewingPostDetail}
          comments={comments}
          commentTree={getCommentTree(viewingPostDetail.id)}
          onClose={closePostDetail}
          onVote={handleVote}
          onShare={handleShare}
          onCommentClick={(postId) => {
            setCommentingPostId(postId);
            setShowCommentModal(true);
          }}
          replyingToComment={replyingToComment}
          replyContent={replyContent}
          onReply={handleReplyToComment}
          onSubmitReply={handleSubmitReply}
          onCancelReply={() => {
                  setReplyingToComment(null);
                  setReplyContent('');
                }}
          onReplyContentChange={setReplyContent}
        />
      )}

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal && !!commentingPostId}
        comment={newComment}
        onCommentChange={setNewComment}
        onSubmit={() => {
          handleSubmitComment(setPosts);
        }}
        onClose={closeCommentModal}
      />
    </div>
  );
}
