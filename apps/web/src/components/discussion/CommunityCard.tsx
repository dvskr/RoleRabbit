import React, { useState, useRef, useEffect } from 'react';
import { Users, MessageSquare, Lock, Globe, Settings, Plus, Edit, Trash2, UserCog, Shield } from 'lucide-react';
import { Community } from '../../types/discussion';

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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Community Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {community.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{community.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {getCategoryIcon(community.category)}
              <span>{community.category}</span>
              {community.isPrivate ? (
                <Lock size={12} className="text-red-500" />
              ) : (
                <Globe size={12} className="text-green-500" />
              )}
            </div>
          </div>
        </div>
        
        <div className="relative" ref={settingsRef}>
          <button
            onClick={handleSettingsClick}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings size={16} className="text-gray-400 hover:text-gray-600" />
          </button>
          
          {/* Settings Dropdown */}
          {showSettingsMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[180px]">
              <button
                onClick={() => {
                  onEditCommunity(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit size={14} />
                Edit Community
              </button>
              <button
                onClick={() => {
                  onManageMembers(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <UserCog size={14} />
                Manage Members
              </button>
              <button
                onClick={() => {
                  onModerationTools(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Shield size={14} />
                Moderation Tools
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => {
                  onDeleteCommunity(community);
                  setShowSettingsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Community
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Community Description */}
      <p className="text-gray-600 text-sm mb-4">{community.description}</p>

      {/* Community Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs text-gray-600">{formatMemberCount(community.memberCount)} members</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare size={14} className="text-gray-400" />
          <span className="text-xs text-gray-600">{community.postCount} posts</span>
        </div>
      </div>

      {/* Community Tags */}
      {community.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {community.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {community.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
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
            isJoined 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${
            isAnimating ? 'animate-bounce' : ''
          }`}
        >
          {isJoined ? '✓ Joined' : 'Join Community'}
        </button>
        <button
          onClick={() => onPost(community.id)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
        >
          <Plus size={14} />
          Post
        </button>
        <button
          onClick={() => onView(community.id)}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          View
        </button>
      </div>
    </div>
  );
}
