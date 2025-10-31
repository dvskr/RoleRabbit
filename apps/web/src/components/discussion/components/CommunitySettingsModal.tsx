'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { Community } from '../../../types/discussion';
import { useTheme } from '../../../contexts/ThemeContext';

interface CommunitySettingsModalProps {
  isOpen: boolean;
  community: Community | null;
  onClose: () => void;
  onCommunityUpdate: (updater: (prev: Community[]) => Community[]) => void;
  onSelectedCommunityUpdate: (updater: (prev: Community | null) => Community | null) => void;
}

export default function CommunitySettingsModal({
  isOpen,
  community,
  onClose,
  onCommunityUpdate,
  onSelectedCommunityUpdate
}: CommunitySettingsModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen || !community) return null;

  return (
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
            onClick={onClose}
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
            className="transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>Community Name</label>
            <input
              type="text"
              value={community.name}
              onChange={(e) => {
                onCommunityUpdate(prev => prev.map(c => 
                  c.id === community.id 
                    ? { ...c, name: e.target.value } 
                    : c
                ));
                onSelectedCommunityUpdate(prev => prev ? { ...prev, name: e.target.value } : null);
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
              value={community.description}
              onChange={(e) => {
                onCommunityUpdate(prev => prev.map(c => 
                  c.id === community.id 
                    ? { ...c, description: e.target.value } 
                    : c
                ));
                onSelectedCommunityUpdate(prev => prev ? { ...prev, description: e.target.value } : null);
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
              value={community.category}
              onChange={(e) => {
                const category = e.target.value as Community['category'];
                onCommunityUpdate(prev => prev.map(c => 
                  c.id === community.id 
                    ? { ...c, category } 
                    : c
                ));
                onSelectedCommunityUpdate(prev => prev ? { ...prev, category } : null);
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
                checked={community.isPrivate}
                onChange={(e) => {
                  onCommunityUpdate(prev => prev.map(c => 
                    c.id === community.id 
                      ? { ...c, isPrivate: e.target.checked } 
                      : c
                  ));
                  onSelectedCommunityUpdate(prev => prev ? { ...prev, isPrivate: e.target.checked } : null);
                }}
                className="mr-2"
                style={{ accentColor: colors.primaryBlue }}
              />
              <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Private Community</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
              Members: {community.memberCount} | Posts: {community.postCount}
            </label>
          </div>
        </div>

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
            onClick={onClose}
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
  );
}

