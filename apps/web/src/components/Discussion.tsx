'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Users,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Share2,
  Bookmark,
  Flag,
  MoreHorizontal,
  Bot,
  Sparkles,
  Zap,
  Brain,
  Target,
  Award,
  Star,
  Heart,
  Eye,
  Edit,
  Trash2,
  Pin,
  Lock,
  Globe,
  ChevronUp,
  ChevronDown,
  Send,
  Image,
  Link,
  Code,
  Smile,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Flame,
  Rocket,
  Crown,
  Shield,
  Lightbulb,
  Megaphone,
  Calendar,
  MapPin,
  Tag,
  Hash,
  AtSign,
  Bell,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Phone,
  PhoneOff,
  Mail,
  MailOpen,
  Archive,
  ArchiveRestore,
  Trash,
  TrashRestore,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Database,
  Server,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Signal,
  SignalOff,
  Battery,
  BatteryLow,
  BatteryFull,
  Power,
  PowerOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  Zap as Lightning,
  Flame as Fire,
  Heart as Love,
  Star as Favorite,
  Award as Trophy,
  Crown as King,
  Shield as Protection,
  Target as Goal,
  Lightbulb as Idea,
  Megaphone as Announcement,
  Calendar as Event,
  MapPin as Location,
  Tag as Label,
  Hash as Number,
  AtSign as Mention,
  Bell as Notification,
  Settings as Config,
  RefreshCw as Refresh,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Copy as CopyIcon,
  ExternalLink as External,
  Maximize2 as Maximize,
  Minimize2 as Minimize,
  RotateCcw as RotateLeft,
  RotateCw as RotateRight,
  Play as PlayIcon,
  Pause as PauseIcon,
  Volume2 as Volume,
  VolumeX as Mute,
  Mic as Microphone,
  MicOff as MicrophoneOff,
  Video as VideoIcon,
  VideoOff as VideoOffIcon,
  Camera as CameraIcon,
  CameraOff as CameraOffIcon,
  Phone as PhoneIcon,
  PhoneOff as PhoneOffIcon,
  Mail as MailIcon,
  MailOpen as MailOpenIcon,
  Archive as ArchiveIcon,
  ArchiveRestore as ArchiveRestoreIcon,
  Trash as TrashIcon,
  TrashRestore as TrashRestoreIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  File as FileIcon,
  FileText as FileTextIcon,
  FileImage as FileImageIcon,
  FileVideo as FileVideoIcon,
  FileAudio as FileAudioIcon,
  FilePdf as FilePdfIcon,
  FileWord as FileWordIcon,
  FileExcel as FileExcelIcon,
  FilePowerpoint as FilePowerpointIcon,
  FileArchive as FileArchiveIcon,
  FileCode as FileCodeIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  Database as DatabaseIcon,
  Server as ServerIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Signal as SignalIcon,
  SignalOff as SignalOffIcon,
  Battery as BatteryIcon,
  BatteryLow as BatteryLowIcon,
  BatteryFull as BatteryFullIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  Wind as WindIcon,
  Thermometer as ThermometerIcon,
  Droplets as DropletsIcon,
  Umbrella as UmbrellaIcon,
  Snowflake as SnowflakeIcon,
  Building
} from 'lucide-react';

interface DiscussionProps {}

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: 'role' | 'topic' | 'industry' | 'skill' | 'location' | 'general';
  members: number;
  posts: number;
  createdAt: string;
  creator: {
    name: string;
    avatar: string;
    role: 'user' | 'moderator' | 'admin' | 'ai';
    verified: boolean;
  };
  moderators: string[];
  rules: string[];
  tags: string[];
  isPrivate: boolean;
  isVerified: boolean;
  banner?: string;
  icon?: string;
  trending: boolean;
  aiGenerated: boolean;
  aiScore: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: 'user' | 'moderator' | 'admin' | 'ai';
    verified: boolean;
    karma: number;
  };
  timestamp: string;
  votes: number;
  comments: number;
  views: number;
  tags: string[];
  category: 'general' | 'resume' | 'career' | 'interview' | 'job-search' | 'networking' | 'ai-help' | 'feedback';
  community?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  pinned: boolean;
  locked: boolean;
  aiGenerated: boolean;
  aiScore: number;
  trending: boolean;
  hot: boolean;
  type: 'text' | 'image' | 'link' | 'poll' | 'question';
  attachments?: string[];
  poll?: {
    question: string;
    options: string[];
    votes: number[];
    totalVotes: number;
  };
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: 'user' | 'moderator' | 'admin' | 'ai';
    verified: boolean;
    karma: number;
  };
  timestamp: string;
  votes: number;
  replies: Comment[];
  aiGenerated: boolean;
  aiScore: number;
  parentId?: string;
}

export default function Discussion({}: DiscussionProps) {
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'top' | 'ai' | 'communities'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'time' | 'votes' | 'comments'>('relevance');
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [aiMode, setAiMode] = useState<'assistant' | 'moderator' | 'analyzer'>('assistant');

  // Sample communities data
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: '1',
      name: 'Software Engineers',
      description: 'A community for software engineers to share experiences, tips, and career advice',
      slug: 'software-engineers',
      category: 'role',
      members: 15420,
      posts: 2340,
      createdAt: '2 months ago',
      creator: {
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        role: 'moderator',
        verified: true
      },
      moderators: ['sarah-chen', 'ai-moderator'],
      rules: [
        'Be respectful and professional',
        'Share relevant content only',
        'No spam or self-promotion',
        'Use appropriate tags'
      ],
      tags: ['software', 'engineering', 'programming', 'career'],
      isPrivate: false,
      isVerified: true,
      trending: true,
      aiGenerated: false,
      aiScore: 0.92
    },
    {
      id: '2',
      name: 'AI & Machine Learning',
      description: 'Discuss AI tools, ML techniques, and how AI is transforming careers',
      slug: 'ai-ml',
      category: 'topic',
      members: 8900,
      posts: 1560,
      createdAt: '1 month ago',
      creator: {
        name: 'AI Assistant',
        avatar: '/avatars/ai.jpg',
        role: 'ai',
        verified: true
      },
      moderators: ['ai-assistant', 'ai-moderator'],
      rules: [
        'Focus on AI/ML career topics',
        'Share practical AI tools',
        'Be helpful and constructive',
        'Tag your posts appropriately'
      ],
      tags: ['ai', 'machine-learning', 'automation', 'tools'],
      isPrivate: false,
      isVerified: true,
      trending: true,
      aiGenerated: true,
      aiScore: 0.98
    },
    {
      id: '3',
      name: 'Remote Work Warriors',
      description: 'Tips, experiences, and advice for remote workers and digital nomads',
      slug: 'remote-work',
      category: 'topic',
      members: 12300,
      posts: 1890,
      createdAt: '3 months ago',
      creator: {
        name: 'Mike Rodriguez',
        avatar: '/avatars/mike.jpg',
        role: 'user',
        verified: false
      },
      moderators: ['mike-rodriguez', 'emily-watson'],
      rules: [
        'Share remote work experiences',
        'Be supportive of others',
        'No location-specific spam',
        'Use helpful tags'
      ],
      tags: ['remote', 'work-from-home', 'productivity', 'tools'],
      isPrivate: false,
      isVerified: false,
      trending: false,
      aiGenerated: false,
      aiScore: 0.78
    },
    {
      id: '4',
      name: 'Tech Startups',
      description: 'Entrepreneurs, founders, and startup enthusiasts sharing insights',
      slug: 'tech-startups',
      category: 'industry',
      members: 6700,
      posts: 980,
      createdAt: '1 month ago',
      creator: {
        name: 'Emily Watson',
        avatar: '/avatars/emily.jpg',
        role: 'moderator',
        verified: true
      },
      moderators: ['emily-watson', 'ai-moderator'],
      rules: [
        'Startup-focused content only',
        'Share real experiences',
        'No excessive self-promotion',
        'Be constructive in feedback'
      ],
      tags: ['startup', 'entrepreneurship', 'funding', 'growth'],
      isPrivate: false,
      isVerified: true,
      trending: false,
      aiGenerated: false,
      aiScore: 0.85
    },
    {
      id: '5',
      name: 'Data Scientists',
      description: 'Data science professionals sharing insights, tools, and career advice',
      slug: 'data-scientists',
      category: 'role',
      members: 9800,
      posts: 1450,
      createdAt: '2 months ago',
      creator: {
        name: 'AI Moderator',
        avatar: '/avatars/ai-moderator.jpg',
        role: 'ai',
        verified: true
      },
      moderators: ['ai-moderator', 'sarah-chen'],
      rules: [
        'Data science content only',
        'Share useful resources',
        'Be respectful of all levels',
        'Use proper data science tags'
      ],
      tags: ['data-science', 'analytics', 'python', 'r', 'sql'],
      isPrivate: false,
      isVerified: true,
      trending: true,
      aiGenerated: true,
      aiScore: 0.94
    }
  ]);

  // Sample data
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'AI-Powered Resume Optimization Tips',
      content: 'Just discovered some amazing AI tools that can help optimize your resume for ATS systems. Here are my top recommendations...',
      author: {
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        role: 'moderator',
        verified: true,
        karma: 15420
      },
      timestamp: '2 hours ago',
      votes: 234,
      comments: 45,
      views: 1200,
      tags: ['ai', 'resume', 'ats', 'optimization'],
      category: 'ai-help',
      community: {
        id: '2',
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        icon: '🤖'
      },
      pinned: true,
      locked: false,
      aiGenerated: false,
      aiScore: 0.95,
      trending: true,
      hot: true,
      type: 'text'
    },
    {
      id: '2',
      title: 'What\'s your biggest career challenge right now?',
      content: 'I\'m curious about what everyone is struggling with in their career journey. Let\'s share and help each other out!',
      author: {
        name: 'AI Assistant',
        avatar: '/avatars/ai.jpg',
        role: 'ai',
        verified: true,
        karma: 50000
      },
      timestamp: '4 hours ago',
      votes: 189,
      comments: 67,
      views: 890,
      tags: ['career', 'discussion', 'support'],
      category: 'general',
      community: {
        id: '1',
        name: 'Software Engineers',
        slug: 'software-engineers',
        icon: '💻'
      },
      pinned: false,
      locked: false,
      aiGenerated: true,
      aiScore: 0.98,
      trending: false,
      hot: true,
      type: 'question'
    },
    {
      id: '3',
      title: 'Resume Review: Software Engineer with 5 years experience',
      content: 'Looking for feedback on my resume. I\'ve been applying to senior positions but not getting many responses. Any suggestions?',
      author: {
        name: 'Mike Rodriguez',
        avatar: '/avatars/mike.jpg',
        role: 'user',
        verified: false,
        karma: 2340
      },
      timestamp: '6 hours ago',
      votes: 156,
      comments: 23,
      views: 567,
      tags: ['resume-review', 'software-engineer', 'feedback'],
      category: 'feedback',
      community: {
        id: '1',
        name: 'Software Engineers',
        slug: 'software-engineers',
        icon: '💻'
      },
      pinned: false,
      locked: false,
      aiGenerated: false,
      aiScore: 0.72,
      trending: false,
      hot: false,
      type: 'text',
      attachments: ['resume.pdf']
    },
    {
      id: '4',
      title: 'Best practices for remote job interviews in 2024',
      content: 'With remote work becoming the norm, what are your best tips for acing virtual interviews?',
      author: {
        name: 'Emily Watson',
        avatar: '/avatars/emily.jpg',
        role: 'user',
        verified: true,
        karma: 8900
      },
      timestamp: '8 hours ago',
      votes: 298,
      comments: 89,
      views: 1456,
      tags: ['interview', 'remote', 'tips', '2024'],
      category: 'interview',
      community: {
        id: '3',
        name: 'Remote Work Warriors',
        slug: 'remote-work',
        icon: '🏠'
      },
      pinned: false,
      locked: false,
      aiGenerated: false,
      aiScore: 0.88,
      trending: true,
      hot: true,
      type: 'text'
    },
    {
      id: '5',
      title: 'Poll: Which resume format do you prefer?',
      content: 'Help us understand what resume formats work best for different industries.',
      author: {
        name: 'AI Moderator',
        avatar: '/avatars/ai-moderator.jpg',
        role: 'ai',
        verified: true,
        karma: 75000
      },
      timestamp: '12 hours ago',
      votes: 445,
      comments: 156,
      views: 2100,
      tags: ['poll', 'resume-format', 'survey'],
      category: 'resume',
      community: {
        id: '5',
        name: 'Data Scientists',
        slug: 'data-scientists',
        icon: '📊'
      },
      pinned: false,
      locked: false,
      aiGenerated: true,
      aiScore: 0.99,
      trending: true,
      hot: true,
      type: 'poll',
      poll: {
        question: 'Which resume format do you prefer?',
        options: ['ATS-Friendly', 'Creative/Design', 'Traditional', 'Modern/Minimal'],
        votes: [234, 89, 67, 55],
        totalVotes: 445
      }
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      content: 'Great tips! I\'ve been using AI tools for resume optimization and they\'ve really helped improve my response rate.',
      author: {
        name: 'Alex Johnson',
        avatar: '/avatars/alex.jpg',
        role: 'user',
        verified: false,
        karma: 1200
      },
      timestamp: '1 hour ago',
      votes: 23,
      replies: [],
      aiGenerated: false,
      aiScore: 0.65
    },
    {
      id: 'c2',
      content: 'I can help analyze your resume and provide specific suggestions for improvement. Would you like me to review it?',
      author: {
        name: 'AI Assistant',
        avatar: '/avatars/ai.jpg',
        role: 'ai',
        verified: true,
        karma: 50000
      },
      timestamp: '2 hours ago',
      votes: 45,
      replies: [
        {
          id: 'c2r1',
          content: 'Yes, please! That would be amazing.',
          author: {
            name: 'Mike Rodriguez',
            avatar: '/avatars/mike.jpg',
            role: 'user',
            verified: false,
            karma: 2340
          },
          timestamp: '1 hour ago',
          votes: 12,
          replies: [],
          aiGenerated: false,
          aiScore: 0.45
        }
      ],
      aiGenerated: true,
      aiScore: 0.92
    }
  ]);

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
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
  }, [posts, searchQuery, selectedCategory, sortBy]);

  const categories = [
    { id: 'all', name: 'All', count: posts.length },
    { id: 'general', name: 'General', count: posts.filter(p => p.category === 'general').length },
    { id: 'resume', name: 'Resume', count: posts.filter(p => p.category === 'resume').length },
    { id: 'career', name: 'Career', count: posts.filter(p => p.category === 'career').length },
    { id: 'interview', name: 'Interview', count: posts.filter(p => p.category === 'interview').length },
    { id: 'job-search', name: 'Job Search', count: posts.filter(p => p.category === 'job-search').length },
    { id: 'networking', name: 'Networking', count: posts.filter(p => p.category === 'networking').length },
    { id: 'ai-help', name: 'AI Help', count: posts.filter(p => p.category === 'ai-help').length },
    { id: 'feedback', name: 'Feedback', count: posts.filter(p => p.category === 'feedback').length }
  ];

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

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Discussion Forum</h1>
            <p className="text-sm text-gray-600">Connect, learn, and get AI-powered career advice</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              <RefreshCw size={14} className="inline mr-1" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateCommunity(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 text-sm font-semibold shadow-sm"
            >
              <Plus size={14} className="inline mr-1" />
              Create Network
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={14} className="inline mr-1" />
              New Post
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          <button
            onClick={() => setActiveTab('hot')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'hot' 
                ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Flame size={14} className="inline mr-1" />
            Hot
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'new' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock size={14} className="inline mr-1" />
            New
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'top' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={14} className="inline mr-1" />
            Top
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'ai' 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bot size={14} className="inline mr-1" />
            AI Powered
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'communities' 
                ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={14} className="inline mr-1" />
            Networks
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="relevance">Most Relevant</option>
            <option value="time">Newest</option>
            <option value="votes">Most Voted</option>
            <option value="comments">Most Comments</option>
          </select>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} className="inline mr-1" />
            Filters
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 text-sm ${
                selectedCategory === category.id 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getCategoryIcon(category.id)}
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Post Type</label>
                <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="all">All Types</option>
                  <option value="text">Text Posts</option>
                  <option value="question">Questions</option>
                  <option value="poll">Polls</option>
                  <option value="image">Images</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">AI Generated</label>
                <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="all">All Posts</option>
                  <option value="ai">AI Generated</option>
                  <option value="human">Human Created</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time Range</label>
                <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-1.5 text-xs text-gray-700">Pinned</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-1.5 text-xs text-gray-700">Trending</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Posts</p>
                <p className="text-lg font-bold text-gray-900">{posts.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={16} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">AI Posts</p>
                <p className="text-lg font-bold text-gray-900">{posts.filter(p => p.aiGenerated).length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot size={16} className="text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Active Users</p>
                <p className="text-lg font-bold text-gray-900">1.2k</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">AI Score</p>
                <p className="text-lg font-bold text-gray-900">9.2</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Brain size={16} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Communities Hub */}
        {activeTab === 'communities' && (
          <div className="space-y-6">
            {/* Professional Network Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Professional Networks</h2>
                  <p className="text-sm text-gray-600">Connect with professionals in your field and industry</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                </div>
              </div>
              
              {/* Network Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{communities.filter(c => c.category === 'role').length}</div>
                  <div className="text-xs text-gray-600">Role Networks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{communities.filter(c => c.category === 'topic').length}</div>
                  <div className="text-xs text-gray-600">Topic Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{communities.filter(c => c.category === 'industry').length}</div>
                  <div className="text-xs text-gray-600">Industry Hubs</div>
                </div>
              </div>
            </div>

            {/* Professional Networks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communities.map(community => (
                <div key={community.id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Network Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                          {community.icon || community.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{community.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {community.isVerified && (
                              <div className="flex items-center gap-1">
                                <CheckCircle size={12} className="text-blue-500" />
                                <span className="text-xs text-blue-600 font-medium">Verified</span>
                              </div>
                            )}
                            {community.trending && (
                              <div className="flex items-center gap-1">
                                <TrendingUp size={12} className="text-green-500" />
                                <span className="text-xs text-green-600 font-medium">Trending</span>
                              </div>
                            )}
                            {community.aiGenerated && (
                              <div className="flex items-center gap-1">
                                <Bot size={12} className="text-purple-500" />
                                <span className="text-xs text-purple-600 font-medium">AI Powered</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          community.category === 'role' ? 'bg-blue-100 text-blue-700' :
                          community.category === 'topic' ? 'bg-green-100 text-green-700' :
                          community.category === 'industry' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {community.category.charAt(0).toUpperCase() + community.category.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Network Content */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                    
                    {/* Network Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{community.members.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{community.posts.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Discussions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{community.createdAt}</div>
                        <div className="text-xs text-gray-500">Established</div>
                      </div>
                    </div>

                    {/* Network Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {community.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                      {community.tags.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                          +{community.tags.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm">
                        Join Network
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {communities.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Professional Networks Found</h3>
                <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">Start building your professional network by creating a community for your role, industry, or area of expertise</p>
                <button
                  onClick={() => setShowCreateCommunity(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
                >
                  Create Your Network
                </button>
              </div>
            )}
          </div>
        )}

        {/* Posts List */}
        {activeTab !== 'communities' && (
          <div className="space-y-3">
            {filteredPosts.map(post => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
              <div className="flex items-start gap-3">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <ChevronUp size={16} className="text-gray-400 hover:text-orange-500" />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">{post.votes}</span>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <ChevronDown size={16} className="text-gray-400 hover:text-blue-500" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="flex-1">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">{post.author.name}</span>
                        {post.author.verified && (
                          <CheckCircle size={12} className="text-blue-500" />
                        )}
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(post.author.role)}`}>
                          {post.author.role}
                        </span>
                        <span className="text-xs text-gray-500">• {formatKarma(post.author.karma)} karma</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {post.pinned && <Pin size={12} className="text-orange-500" />}
                      {post.locked && <Lock size={12} className="text-gray-500" />}
                      {post.aiGenerated && <Bot size={12} className="text-purple-500" />}
                      {post.trending && <TrendingUp size={12} className="text-green-500" />}
                      {post.hot && <Flame size={12} className="text-orange-500" />}
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Post Title and Content */}
                  <div className="flex items-center gap-2 mb-1">
                    {post.community && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {post.community.name}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900">{post.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{post.content}</p>

                  {/* Post Tags */}
                  <div className="flex items-center gap-1 mb-2">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
                    )}
                  </div>

                  {/* Post Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{post.timestamp}</span>
                      <span>{post.comments} comments</span>
                      <span>{post.views} views</span>
                      {post.aiGenerated && (
                        <span className="flex items-center gap-1">
                          <Brain size={10} />
                          AI Score: {(post.aiScore * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                        <Reply size={12} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                        <Share2 size={12} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                        <Bookmark size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {activeTab !== 'communities' && filteredPosts.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={20} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No discussions found</h3>
            <p className="text-gray-600 mb-3 text-sm">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}