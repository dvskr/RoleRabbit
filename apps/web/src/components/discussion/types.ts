// Additional types specific to Discussion component
import type { Comment } from '../../types/discussion';

export interface CommentWithChildren extends Comment {
  children?: CommentWithChildren[];
}

export interface NewPost {
  title: string;
  content: string;
  community: string;
  type: 'text' | 'question' | 'image' | 'link' | 'poll';
  tags: string[];
}

export interface FlaggedPost {
  postId: string;
  reason: string;
  timestamp: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  postCount: number;
  lastActive: string;
}

export interface NewCommunity {
  name: string;
  description: string;
  category: 'general' | 'resume' | 'career' | 'interview' | 'job-search' | 'networking' | 'ai-help' | 'feedback';
  isPrivate: boolean;
  tags: string[];
  rules: string[];
}

