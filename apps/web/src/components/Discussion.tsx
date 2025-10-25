'use client';

import React from 'react';
import { Plus, MessageSquare, RefreshCw } from 'lucide-react';
import { useDiscussion } from '../hooks/useDiscussion';
import DiscussionHeader from './discussion/DiscussionHeader';
import DiscussionTabs from './discussion/DiscussionTabs';
import PostCard from './discussion/PostCard';
import CommunityCard from './discussion/CommunityCard';
import DiscussionFilters from './discussion/DiscussionFilters';

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
    addComment
  } = useDiscussion();

  const handleVote = (postId: string, direction: 'up' | 'down') => {
    console.log(`Vote ${direction} on post ${postId}`);
    // TODO: Implement actual vote functionality
    // This would update the post's vote count in the state
  };

  const handleComment = (postId: string) => {
    console.log(`Comment on post ${postId}`);
    // TODO: Implement comment functionality
    // This would open a comment modal or expand comment section
  };

  const handleShare = (postId: string) => {
    console.log(`Share post ${postId}`);
    // TODO: Implement share functionality
    // This could copy link to clipboard or open share modal
  };

  const handleBookmark = (postId: string) => {
    console.log(`Bookmark post ${postId}`);
    // TODO: Implement bookmark functionality
    // This would add/remove post from user's bookmarks
  };

  const handleFlag = (postId: string) => {
    console.log(`Flag post ${postId}`);
    // TODO: Implement flag functionality
    // This would report the post for moderation
  };

  const handleView = (postId: string) => {
    console.log(`View post ${postId}`);
    // TODO: Implement view functionality
    // This would increment view count and possibly open detailed view
  };

  const handleJoinCommunity = (communityId: string) => {
    console.log(`Join community ${communityId}`);
    // TODO: Implement join community functionality
    // This would add user to community members
  };

  const handleViewCommunity = (communityId: string) => {
    console.log(`View community ${communityId}`);
    // TODO: Implement view community functionality
    // This would navigate to community details or filter posts by community
  };

  const handleCommunitySettings = (community: any) => {
    setSelectedCommunityForSettings(community);
    setShowCommunitySettings(true);
  };

  const handleRefresh = () => {
    console.log('Refresh discussions');
    // TODO: Implement refresh functionality
    // This would refetch data from API
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <DiscussionHeader
        filters={filters}
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
                          onSettings={handleCommunitySettings}
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

                  {/* Posts List */}
                  {filteredPosts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPosts.map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onVote={handleVote}
                          onComment={handleComment}
                          onShare={handleShare}
                          onBookmark={handleBookmark}
                          onFlag={handleFlag}
                          onView={handleView}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <MessageSquare size={20} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">No discussions found</h3>
                      <p className="text-gray-600 mb-4">Start a new discussion or adjust your filters</p>
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Discussion
                      </button>
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

      {/* TODO: Add other modals */}
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
                  placeholder="Enter post title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Community Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post to Community
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select a community</option>
                  {communities.map(community => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
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
                <input
                  type="text"
                  placeholder="Add tags separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Tags help others find your post</p>
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
                  // TODO: Implement actual post creation
                  console.log('Creating post...');
                  setShowCreatePost(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    addCommunity({
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

      {showCommunitySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Community Settings</h2>
            <p className="text-gray-600">Community settings form will be implemented here</p>
            <button
              onClick={() => setShowCommunitySettings(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}