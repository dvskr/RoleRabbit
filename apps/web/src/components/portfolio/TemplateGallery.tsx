/**
 * Template Gallery Component
 * Requirements #16-19: Template cards, preview modal, category filter, premium badges
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Grid,
  List as ListIcon,
  Eye,
  Crown,
  Star,
  Sparkles,
  X,
  Check,
  Download,
  Filter,
  TrendingUp,
  Code,
  Briefcase,
  Palette,
  Camera,
  Music,
  Newspaper,
} from 'lucide-react';

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  previewUrl: string;
  category: 'developer' | 'designer' | 'photographer' | 'writer' | 'musician' | 'business' | 'creative';
  isPremium: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  usageCount: number;
  rating: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: string[];
  tags: string[];
}

interface TemplateGalleryProps {
  templates: PortfolioTemplate[];
  onSelectTemplate: (template: PortfolioTemplate) => void;
  onPreview?: (template: PortfolioTemplate) => void;
  userIsPremium?: boolean;
}

const categoryIcons = {
  developer: Code,
  designer: Palette,
  photographer: Camera,
  writer: Newspaper,
  musician: Music,
  business: Briefcase,
  creative: Sparkles,
};

const categoryLabels = {
  developer: 'Developer',
  designer: 'Designer',
  photographer: 'Photographer',
  writer: 'Writer',
  musician: 'Musician',
  business: 'Business',
  creative: 'Creative',
};

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'rating' | 'name';

/**
 * Template Gallery Component
 */
export function TemplateGallery({
  templates,
  onSelectTemplate,
  onPreview,
  userIsPremium = false,
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [previewTemplate, setPreviewTemplate] = useState<PortfolioTemplate | null>(null);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Filter by premium
    if (showPremiumOnly) {
      result = result.filter((t) => t.isPremium);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          // Assuming templates are already ordered by creation date
          return 0;
        default:
          return 0;
      }
    });

    // Move featured to top
    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

    return result;
  }, [templates, searchQuery, selectedCategory, sortBy, showPremiumOnly]);

  // Categories with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Handle template selection
  const handleSelectTemplate = (template: PortfolioTemplate) => {
    if (template.isPremium && !userIsPremium) {
      // Show upgrade modal or message
      alert('This is a premium template. Upgrade to access premium templates.');
      return;
    }
    onSelectTemplate(template);
  };

  // Handle preview
  const handlePreview = (template: PortfolioTemplate) => {
    setPreviewTemplate(template);
    onPreview?.(template);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Template Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose from {templates.length} professionally designed templates
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="List view"
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({categoryCounts.all})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons];
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon size={16} />
                {label} ({categoryCounts[key] || 0})
              </button>
            );
          })}
        </div>

        {/* Premium Filter */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPremiumOnly}
              onChange={(e) => setShowPremiumOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Crown size={16} className="text-yellow-500" />
              Premium Templates Only
            </span>
          </label>
        </div>
      </div>

      {/* Templates */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
              userIsPremium={userIsPremium}
              onSelect={() => handleSelectTemplate(template)}
              onPreview={() => handlePreview(template)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          userIsPremium={userIsPremium}
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            handleSelectTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Template Card Component
 */
interface TemplateCardProps {
  template: PortfolioTemplate;
  viewMode: ViewMode;
  userIsPremium: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

const TemplateCard = React.memo(function TemplateCard({
  template,
  viewMode,
  userIsPremium,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  const CategoryIcon = categoryIcons[template.category];

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700 flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-48 h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {template.isFeatured && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded flex items-center gap-1">
                <Sparkles size={12} />
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {template.name}
                {template.isPremium && (
                  <Crown size={16} className="text-yellow-500" />
                )}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <CategoryIcon size={14} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {categoryLabels[template.category]}
                </span>
                <span className="text-gray-400">·</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {template.rating.toFixed(1)}
                  </span>
                </div>
                {template.isPopular && (
                  <>
                    <span className="text-gray-400">·</span>
                    <TrendingUp size={14} className="text-green-500" />
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {template.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onPreview}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
              >
                Preview
              </button>
              <button
                onClick={onSelect}
                disabled={template.isPremium && !userIsPremium}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group border border-gray-200 dark:border-gray-700">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {template.isFeatured && (
            <span className="px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1 w-fit">
              <Sparkles size={12} />
              Featured
            </span>
          )}
          {template.isPopular && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1 w-fit">
              <TrendingUp size={12} />
              Popular
            </span>
          )}
        </div>

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-3 right-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-2 rounded-full shadow-lg">
              <Crown size={14} />
            </div>
          </div>
        )}

        {/* Preview Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={onPreview}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {template.name}
            {template.isPremium && (
              <Crown size={16} className="text-yellow-500" />
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <CategoryIcon size={14} className="text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {categoryLabels[template.category]}
          </span>
          <span className="text-gray-400">·</span>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {template.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {template.description}
        </p>

        <button
          onClick={onSelect}
          disabled={template.isPremium && !userIsPremium}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {template.isPremium && !userIsPremium ? (
            <>
              <Crown size={16} />
              Upgrade to Use
            </>
          ) : (
            <>
              <Check size={16} />
              Use Template
            </>
          )}
        </button>
      </div>
    </div>
  );
});

/**
 * Template Preview Modal
 */
interface TemplatePreviewModalProps {
  template: PortfolioTemplate;
  userIsPremium: boolean;
  onClose: () => void;
  onSelect: () => void;
}

function TemplatePreviewModal({
  template,
  userIsPremium,
  onClose,
  onSelect,
}: TemplatePreviewModalProps) {
  const CategoryIcon = categoryIcons[template.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {template.name}
              {template.isPremium && (
                <Crown size={20} className="text-yellow-500" />
              )}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <CategoryIcon size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {categoryLabels[template.category]}
              </span>
              <span className="text-gray-400">·</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {template.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-400">·</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {template.usageCount.toLocaleString()} uses
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Image */}
        <div className="p-6">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Details */}
        <div className="px-6 pb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {template.description}
          </p>

          {/* Features */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Features
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {template.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Check size={16} className="text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Color Palette
            </h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: template.colors.primary }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Primary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: template.colors.secondary }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Secondary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: template.colors.accent }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Accent
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSelect}
              disabled={template.isPremium && !userIsPremium}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {template.isPremium && !userIsPremium ? (
                <>
                  <Crown size={20} />
                  Upgrade to Premium
                </>
              ) : (
                <>
                  <Download size={20} />
                  Use This Template
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
