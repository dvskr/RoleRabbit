import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface FloatingActionButtonsProps {
  colors: any;
  activeTab: string;
  onShowCreatePost: () => void;
  onShowCreateCommunity: () => void;
  onRefresh: () => void;
}

export default function FloatingActionButtons({
  colors,
  activeTab,
  onShowCreatePost,
  onShowCreateCommunity,
  onRefresh,
}: FloatingActionButtonsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Create Post Button */}
      {activeTab !== 'communities' && (
        <button
          onClick={onShowCreatePost}
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
          onClick={onShowCreateCommunity}
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
        onClick={onRefresh}
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
  );
}

