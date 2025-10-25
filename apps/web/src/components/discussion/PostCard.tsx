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

interface PostCardProps {
  post: Post;
  onVote: (postId: string, direction: 'up' | 'down') => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onFlag: (postId: string) => void;
  onView: (postId: string) => void;
}

export default function PostCard({
  post,
  onVote,
  onComment,
  onShare,
  onBookmark,
  onFlag,
  onView
}: PostCardProps) {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'moderator': return 'text-blue-600 bg-blue-100';
      case 'ai': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {post.author.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.author.name}</span>
              {post.author.verified && (
                <Award size={14} className="text-blue-500" />
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                {post.author.role}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
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
            <Pin size={16} className="text-orange-500" />
          )}
          {post.isLocked && (
            <Lock size={16} className="text-red-500" />
          )}
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 leading-relaxed">{post.content}</p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
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
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ThumbsUp size={16} className="text-gray-500" />
            </button>
            <span className="text-sm font-medium text-gray-700">{post.votes}</span>
            <button
              onClick={() => onVote(post.id, 'down')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ThumbsDown size={16} className="text-gray-500" />
            </button>
          </div>
          
          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded"
          >
            <MessageSquare size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">{post.comments}</span>
          </button>
          
          <button
            onClick={() => onShare(post.id)}
            className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded"
          >
            <Share2 size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Share</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBookmark(post.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Bookmark size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => onFlag(post.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Flag size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => onView(post.id)}
            className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded"
          >
            <Eye size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">{post.views}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
