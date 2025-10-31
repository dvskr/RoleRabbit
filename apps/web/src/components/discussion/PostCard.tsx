'use client';

import React from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Flag, 
  MoreHorizontal,
  Pin,
  Lock,
  Eye,
  Clock,
  Users,
  FileText,
  TrendingUp,
  Search,
  Globe,
  Bot,
  Heart,
  Award
} from 'lucide-react';
import { Post } from '../../types/discussion';
import { useTheme } from '../../contexts/ThemeContext';

interface PostCardProps {
  post: Post;
  onVote: (postId: string, direction: 'up' | 'down') => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onFlag: (postId: string) => void;
  onView: (postId: string) => void;
  onPin: (postId: string) => void;
  isBookmarked: boolean;
  isFlagged: boolean;
  animatingAction?: string;
}

const PostCard = React.memo(function PostCard({
  post,
  onVote,
  onComment,
  onShare,
  onBookmark,
  onFlag,
  onView,
  onPin,
  isBookmarked,
  isFlagged,
  animatingAction
}: PostCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <MessageSquare size={16} />;
      case 'resume': return <FileText size={16} />;
      case 'career': return <TrendingUp size={16} />;
      case 'interview': return <Users size={16} />;
      case 'job-search': return <Search size={16} />;
      case 'networking': return <Globe size={16} />;
      case 'ai-help': return <Bot size={16} />;
      case 'feedback': return <Heart size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const formatKarma = (karma: number) => {
    if (karma >= 1000) {
      return `${(karma / 1000).toFixed(1)}k`;
    }
    return karma.toString();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const getRoleColorStyles = (role: string): React.CSSProperties => {
    switch (role) {
      case 'admin': return { backgroundColor: colors.badgeErrorBg, color: colors.badgeErrorText };
      case 'moderator': return { backgroundColor: colors.badgeInfoBg, color: colors.badgeInfoText };
      case 'ai': return { backgroundColor: colors.badgePurpleBg, color: colors.badgePurpleText };
      default: return { backgroundColor: colors.inputBackground, color: colors.secondaryText };
    }
  };

  return (
    <div
      className="rounded-lg p-6 transition-all duration-300 border"
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
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
            }}
          >
            {post.author.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: colors.primaryText }}>{post.author.name}</span>
              {post.author.verified && (
                <Award size={14} style={{ color: colors.primaryBlue }} />
              )}
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={getRoleColorStyles(post.author.role)}>
                {post.author.role}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.tertiaryText }}>
              <span>{formatKarma(post.author.karma)} karma</span>
              <span>•</span>
              <span>{formatTime(post.timestamp)}</span>
              <span>•</span>
              <span>{post.community}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {post.isPinned && (
            <Pin size={16} style={{ color: colors.badgeWarningText }} />
          )}
          {post.isLocked && (
            <Lock size={16} style={{ color: colors.badgeErrorText }} />
          )}
          <button
            className="p-1 rounded transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            aria-label="More options"
            title="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primaryText }}>{post.title}</h3>
        <p className="leading-relaxed" style={{ color: colors.secondaryText }}>{post.content}</p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
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
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onVote(post.id, 'up')}
              className="p-1 rounded transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              aria-label="Upvote post"
              title="Upvote"
            >
              <ThumbsUp size={16} />
            </button>
            <span className="text-sm font-medium" style={{ color: colors.primaryText }}>{post.votes}</span>
            <button
              onClick={() => onVote(post.id, 'down')}
              aria-label="Downvote post"
              title="Downvote"
              className="p-1 rounded transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <ThumbsDown size={16} />
            </button>
          </div>
          
          <button
            onClick={() => onView(post.id)}
            className="flex items-center gap-2 p-1 rounded transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="View post and comments"
            aria-label="View post and comments"
          >
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <MessageSquare size={16} />
            </div>
            <span className="text-sm">{post.views}</span>
            <span className="text-sm">•</span>
            <span className="text-sm">{post.comments}</span>
          </button>
          
          <button
            onClick={() => onShare(post.id)}
            className="flex items-center gap-1 p-1 rounded transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Share post"
            aria-label="Share post"
          >
            <Share2 size={16} />
            <span className="text-sm">Share</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBookmark(post.id)}
            className={`p-1 rounded transition-all ${
              animatingAction === 'bookmark' ? 'animate-bounce' : ''
            }`}
            style={{
              background: isBookmarked ? `${colors.primaryBlue}20` : 'transparent',
              color: isBookmarked ? colors.primaryBlue : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!isBookmarked) {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (!isBookmarked) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
          >
            <Bookmark 
              size={16} 
              className={isBookmarked ? 'fill-current' : ''}
            />
          </button>
          <button
            onClick={() => onFlag(post.id)}
            className={`p-1 rounded transition-all ${
              animatingAction === 'flag' ? 'animate-bounce' : ''
            }`}
            style={{
              background: isFlagged ? `${colors.badgeErrorBg}20` : 'transparent',
              color: isFlagged ? colors.badgeErrorText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!isFlagged) {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (!isFlagged) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title={isFlagged ? 'Remove report' : 'Report this post'}
            aria-label={isFlagged ? 'Remove report' : 'Report this post'}
          >
            <Flag size={16} />
          </button>
          <button
            onClick={() => onPin(post.id)}
            className={`p-1 rounded transition-all ${
              animatingAction === 'pin' ? 'animate-bounce' : ''
            }`}
            style={{
              background: post.isPinned ? `${colors.badgeWarningBg}20` : 'transparent',
              color: post.isPinned ? colors.badgeWarningText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!post.isPinned) {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (!post.isPinned) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title={post.isPinned ? 'Unpin this post' : 'Pin this post'}
            aria-label={post.isPinned ? 'Unpin this post' : 'Pin this post'}
          >
            <Pin size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.post.id === nextProps.post.id &&
         prevProps.isBookmarked === nextProps.isBookmarked &&
         prevProps.isFlagged === nextProps.isFlagged &&
         prevProps.animatingAction === nextProps.animatingAction;
});

export default PostCard;
