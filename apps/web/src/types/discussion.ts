export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  tags: string[];
  rules: string[];
  moderators: string[];
  createdAt: string;
  category: 'general' | 'resume' | 'career' | 'interview' | 'job-search' | 'networking' | 'ai-help' | 'feedback';
  icon?: string;
  banner?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: 'user' | 'moderator' | 'admin' | 'ai';
    karma: number;
    verified: boolean;
  };
  community: string;
  category: 'general' | 'resume' | 'career' | 'interview' | 'job-search' | 'networking' | 'ai-help' | 'feedback';
  timestamp: string;
  votes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  aiScore: number;
  type: 'text' | 'image' | 'link' | 'poll' | 'question';
  attachments?: string[];
  poll?: {
    question: string;
    options: string[];
    votes: Record<string, number>;
    totalVotes: number;
    expiresAt: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: 'user' | 'moderator' | 'admin' | 'ai';
    karma: number;
    verified: boolean;
  };
  postId: string;
  parentId?: string;
  timestamp: string;
  votes: number;
  replies: number;
  isPinned: boolean;
  isDeleted: boolean;
}

export interface DiscussionFilters {
  searchQuery: string;
  selectedCategory: string;
  selectedCommunity: string | null;
  sortBy: 'relevance' | 'time' | 'votes' | 'comments';
  showPinned: boolean;
  showTrending: boolean;
}

export interface NewCommunity {
  name: string;
  description: string;
  category: 'general' | 'resume' | 'career' | 'interview' | 'job-search' | 'networking' | 'ai-help' | 'feedback';
  isPrivate: boolean;
  tags: string[];
  rules: string[];
}

export interface DiscussionTab {
  id: 'hot' | 'new' | 'top' | 'ai' | 'communities';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}
