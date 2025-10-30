'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  ExternalLink,
  PlayCircle,
  Clock,
  Award,
  Star,
  TrendingUp,
  Search,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'video' | 'article' | 'tutorial';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  rating: number;
  views: number;
  link: string;
  tags: string[];
  free: boolean;
  provider?: string;
  videoEmbedId?: string;
  lessons?: number;
  completed?: boolean;
  progress?: number;
  instructor?: string;
}

export default function LearningHub() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Resume Writing', 'Interview Prep', 'Career Development', 'Technical Skills', 'Communication', 'Salary Negotiation'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', 'Course', 'Video', 'Article', 'Tutorial'];

  const [resources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Mastering the Modern Resume',
      description: 'Learn to create ATS-friendly resumes that get you noticed. Includes templates, examples, and best practices.',
      type: 'course',
      category: 'Resume Writing',
      difficulty: 'intermediate',
      duration: '2h 30m',
      rating: 4.8,
      views: 15420,
      link: 'https://www.youtube.com/watch?v=qJWJQNmxqv0',
      tags: ['resume', 'ATS', 'applications'],
      free: true,
      lessons: 12,
      instructor: 'Sarah Chen',
      progress: 65
    },
    {
      id: '2',
      title: 'Ace Your Technical Interview',
      description: 'Comprehensive guide to technical interviews with coding challenges, system design, and behavioral questions.',
      type: 'video',
      category: 'Interview Prep',
      difficulty: 'advanced',
      duration: '3h 15m',
      rating: 4.9,
      views: 28450,
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      tags: ['interview', 'technical', 'coding'],
      free: false,
      provider: 'Tech Interview Mastery',
      videoEmbedId: 'dQw4w9WgXcQ'
    },
    {
      id: '3',
      title: 'Salary Negotiation Masterclass',
      description: 'Learn the art of negotiating salary and benefits. Real scenarios, scripts, and proven strategies.',
      type: 'article',
      category: 'Career Development',
      difficulty: 'intermediate',
      duration: '45m',
      rating: 4.7,
      views: 12340,
      link: 'https://hbr.org/topic/subject/negotiation',
      tags: ['salary', 'negotiation', 'career'],
      free: true,
      provider: 'Harvard Business Review'
    },
    {
      id: '4',
      title: 'LinkedIn Optimization Guide',
      description: 'Transform your LinkedIn profile into a job magnet. Boost visibility and get recruiter attention.',
      type: 'tutorial',
      category: 'Career Development',
      difficulty: 'beginner',
      duration: '1h 20m',
      rating: 4.6,
      views: 18900,
      link: 'https://www.linkedin.com/learning',
      tags: ['linkedin', 'networking', 'profile'],
      free: true,
      lessons: 8,
      instructor: 'LinkedIn Learning Team'
    },
    {
      id: '5',
      title: 'Behavioral Interview Success',
      description: 'Master the STAR method and answer behavioral questions like a pro with structured responses.',
      type: 'course',
      category: 'Interview Prep',
      difficulty: 'beginner',
      duration: '2h',
      rating: 4.8,
      views: 16780,
      link: 'https://www.coursera.org/courses?query=behavioral%20interview',
      tags: ['interview', 'behavioral', 'STAR'],
      free: true,
      lessons: 10,
      instructor: 'Dr. Emily Thompson',
      completed: true
    },
    {
      id: '6',
      title: 'Tech Stack Deep Dive: React & Next.js',
      description: 'Build modern web applications with React and Next.js. Hands-on projects and portfolio pieces.',
      type: 'video',
      category: 'Technical Skills',
      difficulty: 'intermediate',
      duration: '8h',
      rating: 4.9,
      views: 34500,
      link: 'https://www.udemy.com/courses/search/?q=react%20nextjs',
      tags: ['react', 'nextjs', 'web development'],
      free: false,
      provider: 'Udemy',
      lessons: 45
    },
    {
      id: '7',
      title: 'How to Write Compelling Cover Letters',
      description: 'Create cover letters that stand out. Templates, examples, and tips for different industries.',
      type: 'article',
      category: 'Resume Writing',
      difficulty: 'beginner',
      duration: '30m',
      rating: 4.7,
      views: 11560,
      link: 'https://zety.com/blog/cover-letter-tips',
      tags: ['cover letter', 'applications'],
      free: true
    },
    {
      id: '8',
      title: 'Networking That Works',
      description: 'Learn authentic networking strategies. Build meaningful connections that advance your career.',
      type: 'course',
      category: 'Career Development',
      difficulty: 'intermediate',
      duration: '1h 45m',
      rating: 4.5,
      views: 9800,
      link: 'https://www.skillshare.com/en/browse/professional-development',
      tags: ['networking', 'professional', 'career'],
      free: true,
      lessons: 6,
      instructor: 'Michael Rodriguez'
    },
    {
      id: '9',
      title: 'Mock Interview Practice',
      description: 'Practice interviews with AI-powered feedback on your responses, body language, and communication skills.',
      type: 'tutorial',
      category: 'Interview Prep',
      difficulty: 'beginner',
      duration: '1h',
      rating: 4.9,
      views: 22000,
      link: '#',
      tags: ['mock interview', 'practice', 'feedback'],
      free: true,
      provider: 'RoleReady AI',
      progress: 40
    },
    {
      id: '10',
      title: 'Career Pivot Success Stories',
      description: 'Real stories from professionals who successfully changed careers. Learn their strategies and lessons.',
      type: 'article',
      category: 'Career Development',
      difficulty: 'beginner',
      duration: '1h 15m',
      rating: 4.6,
      views: 15600,
      link: 'https://www.themuse.com/advice/career-change',
      tags: ['career change', 'pivot', 'success'],
      free: true
    },
    {
      id: '11',
      title: 'ATS Optimization Fundamentals',
      description: 'Deep dive into ATS (Applicant Tracking System) optimization. Keywords, formatting, and best practices.',
      type: 'course',
      category: 'Resume Writing',
      difficulty: 'advanced',
      duration: '3h',
      rating: 4.9,
      views: 18900,
      link: 'https://www.topresume.com/ats-optimization',
      tags: ['ATS', 'resume', 'optimization'],
      free: false,
      lessons: 18,
      instructor: 'Lisa Johnson'
    },
    {
      id: '12',
      title: 'Building Your Personal Brand',
      description: 'Create a consistent personal brand across LinkedIn, portfolio, and resume. Stand out in your industry.',
      type: 'course',
      category: 'Career Development',
      difficulty: 'intermediate',
      duration: '2h 30m',
      rating: 4.7,
      views: 12400,
      link: '#',
      tags: ['personal brand', 'branding', 'online presence'],
      free: true,
      lessons: 9,
      instructor: 'Alex Martinez'
    }
  ]);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty.toLowerCase();
    const matchesType = selectedType === 'all' || resource.type === selectedType.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <GraduationCap size={18} />;
      case 'video': return <Video size={18} />;
      case 'article': return <FileText size={18} />;
      case 'tutorial': return <BookOpen size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return { bg: `${colors.primaryBlue}20`, text: colors.primaryBlue };
      case 'video': return { bg: `${colors.badgeErrorBg}20`, text: colors.badgeErrorText };
      case 'article': return { bg: `${colors.badgeSuccessBg}20`, text: colors.badgeSuccessText };
      case 'tutorial': return { bg: `${colors.badgePurpleBg}20`, text: colors.badgePurpleText };
      default: return { bg: colors.inputBackground, text: colors.secondaryText };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { bg: `${colors.badgeSuccessBg}20`, text: colors.badgeSuccessText, border: colors.badgeSuccessBorder };
      case 'intermediate': return { bg: `${colors.badgeWarningBg}20`, text: colors.badgeWarningText, border: colors.badgeWarningBorder };
      case 'advanced': return { bg: `${colors.badgeErrorBg}20`, text: colors.badgeErrorText, border: colors.badgeErrorBorder };
      default: return { bg: colors.inputBackground, text: colors.secondaryText, border: colors.border };
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col" style={{ background: colors.background }}>
      <div className="max-w-7xl mx-auto p-3 flex flex-col h-full overflow-hidden">
        {/* Search Bar */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: colors.tertiaryText }} />
            <input
              type="text"
              placeholder="Search courses, videos, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>
        </div>

        {/* Compact Filters */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: colors.secondaryText }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              aria-label="Category filter"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: colors.secondaryText }}>Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              aria-label="Difficulty filter"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff.toLowerCase()}>{diff}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: colors.secondaryText }}>Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              aria-label="Type filter"
            >
              {types.map(type => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-2">
          <p className="text-xs" style={{ color: colors.secondaryText }}>
            Showing <span className="font-semibold" style={{ color: colors.primaryText }}>{filteredResources.length}</span> resources
          </p>
        </div>

        {/* Resources Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResources.map((resource) => {
            const typeColors = getTypeColor(resource.type);
            const difficultyColors = getDifficultyColor(resource.difficulty);
            return (
            <div
              key={resource.id}
              className="rounded-xl border overflow-hidden transition-all duration-200"
              style={{
                background: colors.cardBackground,
                borderColor: colors.border,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primaryBlue;
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primaryBlue}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header */}
              <div className="p-3 flex items-center justify-between" style={{ background: typeColors.bg }}>
                <div className="flex items-center gap-2" style={{ color: typeColors.text }}>
                  {getTypeIcon(resource.type)}
                  <span className="font-medium capitalize">{resource.type}</span>
                </div>
                {resource.free && (
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: colors.cardBackground, color: colors.primaryText }}>FREE</span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold flex-1" style={{ color: colors.primaryText }}>{resource.title}</h3>
                  <div className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
                    <Star size={14} className="fill-current" />
                    <span className="text-sm font-medium">{resource.rating}</span>
                  </div>
                </div>

                <p className="text-xs mb-2 line-clamp-2" style={{ color: colors.secondaryText }}>{resource.description}</p>

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-xs mb-2" style={{ color: colors.tertiaryText }}>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{resource.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>{resource.views.toLocaleString()} views</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {resource.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 rounded text-xs" style={{ background: colors.inputBackground, color: colors.secondaryText }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: difficultyColors.bg, color: difficultyColors.text }}>
                    {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                  </span>
                  <span className="text-xs" style={{ color: colors.tertiaryText }}>{resource.category}</span>
                </div>

                {/* Progress Indicator */}
                {resource.progress !== undefined && resource.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: colors.secondaryText }}>Progress</span>
                      <span className="font-medium" style={{ color: colors.primaryText }}>{resource.progress}%</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: colors.inputBackground }}>
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${resource.progress}%`, background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}
                      />
                    </div>
                  </div>
                )}

                {/* Completed Badge */}
                {resource.completed && (
                  <div className="mb-3 flex items-center gap-2" style={{ color: colors.badgeSuccessText }}>
                    <Award size={16} />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}

                {/* Instructor or Provider */}
                {(resource.instructor || resource.provider) && (
                  <div className="mb-3 text-xs" style={{ color: colors.secondaryText }}>
                    {resource.instructor && <span>Instructor: {resource.instructor}</span>}
                    {resource.provider && !resource.instructor && <span>Provider: {resource.provider}</span>}
                  </div>
                )}

                {/* Action Button */}
                <button 
                  onClick={() => {
                    if (resource.link && resource.link !== '#') {
                      if (resource.link.startsWith('http')) {
                        window.open(resource.link, '_blank');
                      }
                    } else {
                      // Open in-place for internal resources
                      console.log('Opening resource:', resource.title);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all font-medium"
                  style={{
                    background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primaryBlue}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {resource.type === 'video' ? (
                    <>
                      <PlayCircle size={18} />
                      Watch Now
                    </>
                  ) : (
                    <>
                      <ExternalLink size={18} />
                      {resource.completed ? 'Review' : 'Start Learning'}
                    </>
                  )}
                </button>
              </div>
            </div>
            );
          })}
          </div>
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="mx-auto" size={48} style={{ color: colors.tertiaryText }} />
            <h3 className="text-xl font-semibold mt-4" style={{ color: colors.primaryText }}>No resources found</h3>
            <p className="mt-2" style={{ color: colors.secondaryText }}>Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedType('all');
              }}
              className="mt-4 px-6 py-2 rounded-lg transition-colors"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

