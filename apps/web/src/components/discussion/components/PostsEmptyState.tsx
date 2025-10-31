import React from 'react';
import { MessageSquare } from 'lucide-react';

interface PostsEmptyStateProps {
  colors: any;
  showBookmarkedOnly: boolean;
  showReportedOnly: boolean;
  onShowCreatePost: () => void;
}

export default function PostsEmptyState({
  colors,
  showBookmarkedOnly,
  showReportedOnly,
  onShowCreatePost,
}: PostsEmptyStateProps) {
  return (
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
          onClick={onShowCreatePost}
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
  );
}

