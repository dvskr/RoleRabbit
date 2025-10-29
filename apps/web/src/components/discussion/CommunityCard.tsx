import React, { useState, useRef, useEffect } from 'react';
import { Users, MessageSquare, Lock, Globe, Settings, Plus, Edit, Trash2, UserCog, Shield } from 'lucide-react';
import { Community } from '../../types/discussion';
import { useTheme } from '../../contexts/ThemeContext';

interface CommunityCardProps {
  community: Community;
  onJoin: (communityId: string) => void;
  onView: (communityId: string) => void;
  onPost: (communityId: string) => void;
  onEditCommunity: (community: Community) => void;
  onManageMembers: (community: Community) => void;
  onModerationTools: (community: Community) => void;
  onDeleteCommunity: (community: Community) => void;
  isJoined: boolean;
  isAnimating: boolean;
}

export default function CommunityCard({
  community,
  onJoin,
  onView,
  onPost,
  onEditCommunity,
  onManageMembers,
  onModerationTools,
  onDeleteCommunity,
  isJoined,
  isAnimating
}: CommunityCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettingsMenu(!showSettingsMenu);
  };
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <MessageSquare size={16} />;
      case 'resume': return <MessageSquare size={16} />;
      case 'career': return <MessageSquare size={16} />;
      case 'interview': return <MessageSquare size={16} />;
      case 'job-search': return <MessageSquare size={16} />;
      case 'networking': return <MessageSquare size={16} />;
      case 'ai-help': return <MessageSquare size={16} />;
      case 'feedback': return <MessageSquare size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div
      className="rounded-lg p-6 transition-shadow border"
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
      {/* Community Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
            }}
          >
            {community.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: colors.primaryText }}>{community.name}</h3>
            <div className="flex items-center gap-2 text-xs" style={{ color: colors.tertiaryText }}>
              {getCategoryIcon(community.category)}
              <span>{community.category}</span>
              {community.isPrivate ? (
                <Lock size={12} style={{ color: colors.badgeErrorText }} />
              ) : (
                <Globe size={12} style={{ color: colors.badgeSuccessText }} />
              )}
            </div>
          </div>
        </div>
        
        <div className="relative" ref={settingsRef}>
          <button
            onClick={handleSettingsClick}
            className="p-1 rounded transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Settings"
            aria-label="Community settings"
          >
            <Settings size={16} />
          </button>
          
          {/* Settings Dropdown */}
          {showSettingsMenu && (
            <div
              className="absolute right-0 top-full mt-1 rounded-lg shadow-xl py-2 z-50 min-w-[180px] border"
              style={{
                background: colors.cardBackground,
                borderColor: colors.border,
                boxShadow: `0 10px 25px ${colors.border}40`,
              }}
            >
              <button
                onClick={() => {
                  onEditCommunity(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                style={{ color: colors.primaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Edit size={14} />
                Edit Community
              </button>
              <button
                onClick={() => {
                  onManageMembers(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                style={{ color: colors.primaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <UserCog size={14} />
                Manage Members
              </button>
              <button
                onClick={() => {
                  onModerationTools(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                style={{ color: colors.primaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Shield size={14} />
                Moderation Tools
              </button>
              <div className="my-1" style={{ borderTop: `1px solid ${colors.border}` }}></div>
              <button
                onClick={() => {
                  onDeleteCommunity(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                style={{ color: colors.badgeErrorText }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${colors.badgeErrorBg}20`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Trash2 size={14} />
                Delete Community
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Community Description */}
      <p className="text-sm mb-4" style={{ color: colors.secondaryText }}>{community.description}</p>

      {/* Community Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Users size={14} style={{ color: colors.tertiaryText }} />
          <span className="text-xs" style={{ color: colors.secondaryText }}>{formatMemberCount(community.memberCount)} members</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare size={14} style={{ color: colors.tertiaryText }} />
          <span className="text-xs" style={{ color: colors.secondaryText }}>{community.postCount} posts</span>
        </div>
      </div>

      {/* Community Tags */}
      {community.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {community.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              #{tag}
            </span>
          ))}
          {community.tags.length > 3 && (
            <span
              className="px-2 py-1 text-xs rounded-full"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              +{community.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Community Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onJoin(community.id)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            isAnimating ? 'animate-bounce' : ''
          }`}
          style={{
            background: isJoined ? colors.badgeSuccessText : colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isJoined ? colors.badgeSuccessText + 'dd' : colors.primaryBlueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isJoined ? colors.badgeSuccessText : colors.primaryBlue;
          }}
        >
          {isJoined ? '✓ Joined' : 'Join Community'}
        </button>
        <button
          onClick={() => onPost(community.id)}
          className="px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
          style={{
            background: colors.badgePurpleText,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.badgePurpleText + 'dd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.badgePurpleText;
          }}
        >
          <Plus size={14} />
          Post
        </button>
        <button
          onClick={() => onView(community.id)}
          className="px-4 py-2 rounded-lg transition-colors text-sm"
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          View
        </button>
      </div>
    </div>
  );
}
