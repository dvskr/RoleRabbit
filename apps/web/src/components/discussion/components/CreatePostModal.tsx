'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { NewPost, Community } from '../../../types/discussion';
import type { NewPost as LocalNewPost } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';
import { DEFAULT_NEW_POST } from '../constants';

interface CreatePostModalProps {
  isOpen: boolean;
  newPost: LocalNewPost;
  communities: Community[];
  joinedCommunities: string[];
  onClose: () => void;
  onPostChange: (post: LocalNewPost) => void;
  onCreatePost: (post: any) => void;
  onCommunityPostCountIncrement: (communityId: string) => void;
}

export default function CreatePostModal({
  isOpen,
  newPost,
  communities,
  joinedCommunities,
  onClose,
  onPostChange,
  onCreatePost,
  onCommunityPostCountIncrement
}: CreatePostModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen) return null;

  const handleSubmit = () => {
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
      
      onCreatePost(createdPost);
      
      // Increment post count for the community
      if (selectedCommunity) {
        onCommunityPostCountIncrement(selectedCommunity.id);
      }
      
      // Reset form
      onPostChange(DEFAULT_NEW_POST);
      onClose();
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const newTags = input.value.split(',').map(t => t.trim()).filter(t => t && !newPost.tags.includes(t));
      if (newTags.length > 0) {
        onPostChange({ ...newPost, tags: [...newPost.tags, ...newTags] });
        input.value = '';
      }
    }
  };

  return (
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
            onClick={onClose}
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
              onChange={(e) => onPostChange({ ...newPost, title: e.target.value })}
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
              onChange={(e) => onPostChange({ ...newPost, community: e.target.value })}
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
              onChange={(e) => onPostChange({ ...newPost, content: e.target.value })}
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
                <input 
                  type="radio" 
                  name="postType" 
                  value="text" 
                  checked={newPost.type === 'text'}
                  onChange={() => onPostChange({ ...newPost, type: 'text' })}
                  className="mr-2" 
                  style={{ accentColor: colors.primaryBlue }} 
                />
                <span className="text-sm" style={{ color: colors.primaryText }}>Discussion</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="postType" 
                  value="question"
                  checked={newPost.type === 'question'}
                  onChange={() => onPostChange({ ...newPost, type: 'question' })}
                  className="mr-2" 
                  style={{ accentColor: colors.primaryBlue }} 
                />
                <span className="text-sm" style={{ color: colors.primaryText }}>Question</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="postType" 
                  value="announcement"
                  checked={newPost.type === 'announcement'}
                  onChange={() => onPostChange({ ...newPost, type: 'announcement' })}
                  className="mr-2" 
                  style={{ accentColor: colors.primaryBlue }} 
                />
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
                  onKeyPress={handleTagKeyPress}
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
                          onPostChange({ ...newPost, tags: newPost.tags.filter((_, i) => i !== index) });
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
            onClick={onClose}
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
            onClick={handleSubmit}
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
  );
}

