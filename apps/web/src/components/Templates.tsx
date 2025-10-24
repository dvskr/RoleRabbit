'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Download,
  Eye,
  Crown,
  Clock,
  Users,
  Award,
  Zap,
  ChevronDown,
  X,
  Heart,
  Share2,
  Bookmark,
  CheckCircle,
  Sparkles,
  Palette,
  Layout,
  Target,
  TrendingUp,
  Globe,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Settings,
  FileText,
  Image,
  Video,
  File,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { resumeTemplates, templateCategories, getTemplatesByCategory, searchTemplates } from '../data/templates';

interface TemplatesProps {}

export default function Templates({}: TemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'name'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLayout, setSelectedLayout] = useState('all');
  const [selectedColorScheme, setSelectedColorScheme] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templatesPerPage] = useState(12);

  const filteredTemplates = useMemo(() => {
    let templates = resumeTemplates;

    // Search filter
    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      templates = templates.filter(t => t.difficulty === selectedDifficulty);
    }

    // Layout filter
    if (selectedLayout !== 'all') {
      templates = templates.filter(t => t.layout === selectedLayout);
    }

    // Color scheme filter
    if (selectedColorScheme !== 'all') {
      templates = templates.filter(t => t.colorScheme === selectedColorScheme);
    }

    // Premium/Free filter
    if (showPremiumOnly) {
      templates = templates.filter(t => t.isPremium);
    }
    if (showFreeOnly) {
      templates = templates.filter(t => !t.isPremium);
    }

    // Sort templates
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return templates;
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedLayout, selectedColorScheme, showPremiumOnly, showFreeOnly, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
  const startIndex = (currentPage - 1) * templatesPerPage;
  const endIndex = startIndex + templatesPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex);

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ats': return <Target size={16} />;
      case 'creative': return <Palette size={16} />;
      case 'modern': return <Zap size={16} />;
      case 'classic': return <Award size={16} />;
      case 'executive': return <Crown size={16} />;
      case 'minimal': return <Layout size={16} />;
      case 'academic': return <Users size={16} />;
      case 'technical': return <Globe size={16} />;
      case 'startup': return <TrendingUp size={16} />;
      case 'freelance': return <Heart size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    // Here you would integrate with the resume editor
    console.log('Selected template:', templateId);
    setShowTemplateSelector(false);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Resume Templates</h1>
            <p className="text-sm text-gray-600">50+ professionally designed templates</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              <RefreshCw size={14} className="inline mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
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
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Rated</option>
            <option value="name">A-Z</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <List size={16} />
            </button>
          </div>

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
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-sm ${
              selectedCategory === 'all' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({resumeTemplates.length})
          </button>
          {templateCategories.map(category => (
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Layout</label>
                <select
                  value={selectedLayout}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Layouts</option>
                  <option value="single-column">Single Column</option>
                  <option value="two-column">Two Column</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={selectedColorScheme}
                  onChange={(e) => setSelectedColorScheme(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Colors</option>
                  <option value="monochrome">Monochrome</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showFreeOnly}
                      onChange={(e) => setShowFreeOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-1.5 text-xs text-gray-700">Free Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPremiumOnly}
                      onChange={(e) => setShowPremiumOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-1.5 text-xs text-gray-700">Premium Only</span>
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
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{resumeTemplates.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Free</p>
                <p className="text-lg font-bold text-gray-900">{resumeTemplates.filter(t => !t.isPremium).length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Unlock size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Premium</p>
                <p className="text-lg font-bold text-gray-900">{resumeTemplates.filter(t => t.isPremium).length}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown size={16} className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Downloads</p>
                <p className="text-lg font-bold text-gray-900">
                  {(resumeTemplates.reduce((sum, t) => sum + t.downloads, 0) / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download size={16} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentTemplates.map(template => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 group">
                {/* Template Preview */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="w-12 h-16 bg-white border border-gray-300 rounded shadow-lg flex items-center justify-center">
                    <Layout size={18} className="text-gray-400" />
                  </div>
                  {template.isPremium && (
                    <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-0.5">
                      <Crown size={10} />
                      Premium
                    </div>
                  )}
                  <div className="absolute top-1.5 left-1.5">
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        favorites.includes(template.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart size={12} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/80 text-gray-600 hover:bg-white rounded-full transition-colors">
                      <Eye size={12} />
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-semibold text-gray-900 text-xs">{template.name}</h3>
                    <div className="flex items-center gap-0.5 text-xs text-gray-500">
                      <Star size={10} className="text-yellow-400 fill-current" />
                      {template.rating}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      {template.layout}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-xs text-gray-500">
                      <Download size={10} />
                      {(template.downloads / 1000).toFixed(0)}k
                    </div>
                    <button
                      onClick={() => handleSelectTemplate(template.id)}
                      className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {currentTemplates.map(template => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                <div className="flex items-start gap-3">
                  {/* Template Preview */}
                  <div className="relative w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-8 bg-white border border-gray-300 rounded shadow-lg flex items-center justify-center">
                      <Layout size={12} className="text-gray-400" />
                    </div>
                    {template.isPremium && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1 py-0.5 rounded-full text-xs font-semibold">
                        <Crown size={8} />
                      </div>
                    )}
                  </div>

                  {/* Template Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{template.name}</h3>
                        <p className="text-xs text-gray-600 mb-1.5">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleFavorite(template.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            favorites.includes(template.id) 
                              ? 'bg-red-50 text-red-600' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <Heart size={12} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-0.5 text-xs text-gray-500">
                        <Star size={10} className="text-yellow-400 fill-current" />
                        {template.rating}
                      </div>
                      <div className="flex items-center gap-0.5 text-xs text-gray-500">
                        <Download size={10} />
                        {(template.downloads / 1000).toFixed(0)}k
                      </div>
                      <div className="flex items-center gap-0.5 text-xs text-gray-500">
                        <Clock size={10} />
                        {template.createdAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {template.layout}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {template.colorScheme}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {template.features.slice(0, 3).map(feature => (
                          <span key={feature} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleSelectTemplate(template.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-6 gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors text-sm ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates found</h3>
            <p className="text-gray-600 mb-3 text-sm">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedLayout('all');
                setSelectedColorScheme('all');
                setShowPremiumOnly(false);
                setShowFreeOnly(false);
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