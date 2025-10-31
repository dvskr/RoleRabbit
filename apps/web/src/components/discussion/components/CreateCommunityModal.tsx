'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { NewCommunity } from '../types';
import type { Community } from '../../../types/discussion';
import { useTheme } from '../../../contexts/ThemeContext';

interface CreateCommunityModalProps {
  isOpen: boolean;
  newCommunity: NewCommunity;
  onClose: () => void;
  onCommunityChange: (community: NewCommunity) => void;
  onCreateCommunity: (community: Omit<Community, 'id'>) => Community;
  onJoinCommunity: (communityId: string) => void;
}

export default function CreateCommunityModal({
  isOpen,
  newCommunity,
  onClose,
  onCommunityChange,
  onCreateCommunity,
  onJoinCommunity
}: CreateCommunityModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (newCommunity.name.trim() && newCommunity.description.trim()) {
      const newComm = onCreateCommunity({
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
      onJoinCommunity(communityId);
      
      // Reset form
      onCommunityChange({
        name: '',
        description: '',
        category: 'general',
        isPrivate: false,
        tags: [],
        rules: []
      });
      setNewTag('');
      setNewRule('');
      onClose();
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
          <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Create Community</h2>
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
          {/* Community Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
              Community Name *
            </label>
            <input
              type="text"
              value={newCommunity.name}
              onChange={(e) => onCommunityChange({ ...newCommunity, name: e.target.value })}
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
              onChange={(e) => onCommunityChange({ ...newCommunity, description: e.target.value })}
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
              onChange={(e) => onCommunityChange({ ...newCommunity, category: e.target.value as any })}
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
                onChange={(e) => onCommunityChange({ ...newCommunity, isPrivate: e.target.checked })}
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
                      onCommunityChange({ ...newCommunity, tags: [...newCommunity.tags, newTag.trim()] });
                      setNewTag('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newTag.trim() && !newCommunity.tags.includes(newTag.trim())) {
                    onCommunityChange({ ...newCommunity, tags: [...newCommunity.tags, newTag.trim()] });
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
                      onCommunityChange({ ...newCommunity, tags: newCommunity.tags.filter((_, i) => i !== index) });
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
                      onCommunityChange({ ...newCommunity, rules: [...newCommunity.rules, newRule.trim()] });
                      setNewRule('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newRule.trim() && !newCommunity.rules.includes(newRule.trim())) {
                    onCommunityChange({ ...newCommunity, rules: [...newCommunity.rules, newRule.trim()] });
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
                      onCommunityChange({ ...newCommunity, rules: newCommunity.rules.filter((_, i) => i !== index) });
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
  );
}

