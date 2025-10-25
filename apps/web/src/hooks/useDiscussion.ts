import { useState, useMemo } from 'react';
import { Community, Post, Comment, DiscussionFilters, NewCommunity } from '../types/discussion';

export const useDiscussion = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'top' | 'ai' | 'communities'>('hot');
  
  // Filter state
  const [filters, setFilters] = useState<DiscussionFilters>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedCommunity: null,
    sortBy: 'relevance',
    showPinned: false,
    showTrending: false
  });
  
  // Modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCommunitySettings, setShowCommunitySettings] = useState(false);
  const [showModerationTools, setShowModerationTools] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  
  // Selected items
  const [selectedCommunityForSettings, setSelectedCommunityForSettings] = useState<Community | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // AI mode
  const [aiMode, setAiMode] = useState<'assistant' | 'moderator' | 'analyzer'>('assistant');
  
  // Community creation form
  const [newCommunity, setNewCommunity] = useState<NewCommunity>({
    name: '',
    description: '',
    category: 'general',
    isPrivate: false,
    tags: [],
    rules: []
  });
  
  // Form inputs
  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');
  
  // Sample data
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: '1',
      name: 'Software Engineers',
      description: 'Discussion for software engineers and developers',
      memberCount: 1250,
      postCount: 89,
      isPrivate: false,
      tags: ['software', 'engineering', 'development'],
      rules: ['Be respectful', 'No spam', 'Stay on topic'],
      moderators: ['mod1', 'mod2'],
      createdAt: '2024-01-15',
      category: 'career'
    },
    {
      id: '2',
      name: 'Resume Review',
      description: 'Get feedback on your resume from professionals',
      memberCount: 890,
      postCount: 156,
      isPrivate: false,
      tags: ['resume', 'feedback', 'career'],
      rules: ['Be constructive', 'No personal attacks'],
      moderators: ['mod3'],
      createdAt: '2024-02-01',
      category: 'resume'
    },
    {
      id: '3',
      name: 'AI Career Assistant',
      description: 'AI-powered career guidance and advice',
      memberCount: 2100,
      postCount: 234,
      isPrivate: false,
      tags: ['ai', 'career', 'assistance'],
      rules: ['AI-generated content only', 'Be helpful'],
      moderators: ['ai-mod1'],
      createdAt: '2024-01-20',
      category: 'ai-help'
    }
  ]);
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'AI-Powered Resume Optimization Tips',
      content: 'I\'ve been using AI tools to optimize my resume and the results have been amazing. Here are my top tips...',
      author: {
        id: 'user1',
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        role: 'user',
        karma: 1250,
        verified: true
      },
      community: 'Software Engineers',
      category: 'resume',
      timestamp: '2024-10-22T10:30:00Z',
      votes: 45,
      comments: 12,
      views: 234,
      isPinned: false,
      isLocked: false,
      tags: ['ai', 'resume', 'optimization'],
      aiScore: 0.95,
      type: 'text'
    },
    {
      id: '2',
      title: 'What\'s your biggest career challenge right now?',
      content: 'I\'m curious about what challenges other professionals are facing in their careers. Let\'s discuss!',
      author: {
        id: 'user2',
        name: 'Mike Rodriguez',
        avatar: '/avatars/mike.jpg',
        role: 'user',
        karma: 890,
        verified: false
      },
      community: 'Software Engineers',
      category: 'career',
      timestamp: '2024-10-21T15:45:00Z',
      votes: 23,
      comments: 8,
      views: 156,
      isPinned: false,
      isLocked: false,
      tags: ['career', 'discussion', 'support'],
      aiScore: 0.78,
      type: 'question'
    },
    {
      id: '3',
      title: 'Resume Review: Software Engineer with 5 years experience',
      content: 'Looking for feedback on my resume. I have 5 years of experience in full-stack development...',
      author: {
        id: 'user3',
        name: 'Alex Johnson',
        avatar: '/avatars/alex.jpg',
        role: 'user',
        karma: 567,
        verified: true
      },
      community: 'Resume Review',
      category: 'resume',
      timestamp: '2024-10-20T09:15:00Z',
      votes: 18,
      comments: 15,
      views: 189,
      isPinned: true,
      isLocked: false,
      tags: ['resume', 'review', 'software-engineer'],
      aiScore: 0.82,
      type: 'text',
      attachments: ['resume.pdf']
    },
    {
      id: '4',
      title: 'Best practices for remote job interviews in 2024',
      content: 'With remote work becoming the norm, here are the best practices I\'ve learned for remote interviews...',
      author: {
        id: 'user4',
        name: 'Emma Wilson',
        avatar: '/avatars/emma.jpg',
        role: 'moderator',
        karma: 2100,
        verified: true
      },
      community: 'Software Engineers',
      category: 'interview',
      timestamp: '2024-10-19T14:20:00Z',
      votes: 67,
      comments: 22,
      views: 445,
      isPinned: false,
      isLocked: false,
      tags: ['interview', 'remote', 'best-practices'],
      aiScore: 0.91,
      type: 'text'
    },
    {
      id: '5',
      title: 'Poll: Which resume format do you prefer?',
      content: 'I\'m curious about everyone\'s preference for resume formats. Vote below!',
      author: {
        id: 'user5',
        name: 'David Kim',
        avatar: '/avatars/david.jpg',
        role: 'user',
        karma: 432,
        verified: false
      },
      community: 'Resume Review',
      category: 'resume',
      timestamp: '2024-10-18T11:30:00Z',
      votes: 34,
      comments: 9,
      views: 278,
      isPinned: false,
      isLocked: false,
      tags: ['poll', 'resume', 'format'],
      aiScore: 0.65,
      type: 'poll',
      poll: {
        question: 'Which resume format do you prefer?',
        options: ['Chronological', 'Functional', 'Combination', 'Skills-based'],
        votes: { 'Chronological': 45, 'Functional': 12, 'Combination': 67, 'Skills-based': 23 },
        totalVotes: 147,
        expiresAt: '2024-11-18T11:30:00Z'
      }
    }
  ]);
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      content: 'Great tips! I especially liked the section about using AI for keyword optimization.',
      author: {
        id: 'user6',
        name: 'Lisa Park',
        avatar: '/avatars/lisa.jpg',
        role: 'user',
        karma: 789,
        verified: true
      },
      postId: '1',
      timestamp: '2024-10-22T11:15:00Z',
      votes: 8,
      replies: 2,
      isPinned: false,
      isDeleted: false
    },
    {
      id: 'c2',
      content: 'Thanks for sharing! This was really helpful.',
      author: {
        id: 'user7',
        name: 'Tom Brown',
        avatar: '/avatars/tom.jpg',
        role: 'user',
        karma: 234,
        verified: false
      },
      postId: '1',
      timestamp: '2024-10-22T12:30:00Z',
      votes: 3,
      replies: 0,
      isPinned: false,
      isDeleted: false
    }
  ]);
  
  // Computed values
  const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (filters.selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === filters.selectedCategory);
    }
    
    // Filter by community
    if (filters.selectedCommunity) {
      filtered = filtered.filter(post => post.community === filters.selectedCommunity);
    }
    
    // Filter by pinned/trending
    if (filters.showPinned) {
      filtered = filtered.filter(post => post.isPinned);
    }
    
    if (filters.showTrending) {
      filtered = filtered.filter(post => post.votes > 20);
    }
    
    // Sort posts
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'time':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'votes':
          return b.votes - a.votes;
        case 'comments':
          return b.comments - a.comments;
        case 'relevance':
        default:
          return b.aiScore - a.aiScore;
      }
    });
    
    return filtered;
  }, [posts, filters]);
  
  const filteredCommunities = useMemo(() => {
    return communities.filter(community => 
      !filters.searchQuery || 
      community.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
    );
  }, [communities, filters.searchQuery]);
  
  // Helper functions
  const updateFilters = (newFilters: Partial<DiscussionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategory: 'all',
      selectedCommunity: null,
      sortBy: 'relevance',
      showPinned: false,
      showTrending: false
    });
  };
  
  const addPost = (post: Omit<Post, 'id'>) => {
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}`
    };
    setPosts(prev => [newPost, ...prev]);
  };
  
  const addCommunity = (community: Omit<Community, 'id'>) => {
    const newCommunity: Community = {
      ...community,
      id: `community_${Date.now()}`
    };
    setCommunities(prev => [...prev, newCommunity]);
  };
  
  const addComment = (comment: Omit<Comment, 'id'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}`
    };
    setComments(prev => [...prev, newComment]);
  };
  
  return {
    // State
    activeTab,
    filters,
    showCreatePost,
    showCreateCommunity,
    showCommunitySettings,
    showModerationTools,
    showFilters,
    showAIFeatures,
    selectedCommunityForSettings,
    selectedPost,
    aiMode,
    newCommunity,
    newTag,
    newRule,
    communities,
    posts,
    comments,
    
    // Computed
    filteredPosts,
    filteredCommunities,
    
    // Setters
    setActiveTab,
    setShowCreatePost,
    setShowCreateCommunity,
    setShowCommunitySettings,
    setShowModerationTools,
    setShowFilters,
    setShowAIFeatures,
    setSelectedCommunityForSettings,
    setSelectedPost,
    setAiMode,
    setNewCommunity,
    setNewTag,
    setNewRule,
    
    // Actions
    updateFilters,
    resetFilters,
    addPost,
    addCommunity,
    addComment
  };
};
