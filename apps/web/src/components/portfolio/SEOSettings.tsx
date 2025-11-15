/**
 * SEO Settings Component
 * Requirements #13-15: Meta tag editor, social preview cards, SEO score calculator
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Facebook,
  Twitter,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Image as ImageIcon,
  Type,
  Hash,
} from 'lucide-react';

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  robots?: string;
}

interface SEOSettingsProps {
  portfolioId: string;
  currentSEO: SEOData;
  portfolioUrl: string;
  onUpdate: (seo: SEOData) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string>;
}

interface SEOScore {
  score: number;
  issues: SEOIssue[];
  suggestions: string[];
}

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field: string;
}

/**
 * Calculate SEO score based on best practices
 */
function calculateSEOScore(seo: SEOData): SEOScore {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Title validation
  if (!seo.title) {
    issues.push({
      type: 'error',
      message: 'Title is required',
      field: 'title',
    });
    score -= 20;
  } else if (seo.title.length < 30) {
    issues.push({
      type: 'warning',
      message: 'Title is too short (recommended: 30-60 characters)',
      field: 'title',
    });
    score -= 10;
  } else if (seo.title.length > 60) {
    issues.push({
      type: 'warning',
      message: 'Title is too long (recommended: 30-60 characters)',
      field: 'title',
    });
    score -= 10;
  }

  // Description validation
  if (!seo.description) {
    issues.push({
      type: 'error',
      message: 'Description is required',
      field: 'description',
    });
    score -= 20;
  } else if (seo.description.length < 120) {
    issues.push({
      type: 'warning',
      message: 'Description is too short (recommended: 120-160 characters)',
      field: 'description',
    });
    score -= 10;
  } else if (seo.description.length > 160) {
    issues.push({
      type: 'warning',
      message: 'Description is too long (recommended: 120-160 characters)',
      field: 'description',
    });
    score -= 10;
  }

  // Keywords validation
  if (!seo.keywords || seo.keywords.length === 0) {
    issues.push({
      type: 'warning',
      message: 'Add keywords to improve discoverability',
      field: 'keywords',
    });
    score -= 5;
  } else if (seo.keywords.length < 3) {
    issues.push({
      type: 'info',
      message: 'Consider adding more keywords (recommended: 3-10)',
      field: 'keywords',
    });
    score -= 3;
  } else if (seo.keywords.length > 10) {
    issues.push({
      type: 'warning',
      message: 'Too many keywords may dilute focus (recommended: 3-10)',
      field: 'keywords',
    });
    score -= 5;
  }

  // Open Graph validation
  if (!seo.ogTitle || !seo.ogDescription) {
    issues.push({
      type: 'info',
      message: 'Add Open Graph tags for better social media sharing',
      field: 'og',
    });
    score -= 5;
  }

  if (!seo.ogImage) {
    issues.push({
      type: 'info',
      message: 'Add Open Graph image for social media preview',
      field: 'ogImage',
    });
    score -= 5;
  }

  // Twitter Card validation
  if (!seo.twitterTitle || !seo.twitterDescription) {
    issues.push({
      type: 'info',
      message: 'Add Twitter Card tags for better Twitter sharing',
      field: 'twitter',
    });
    score -= 5;
  }

  if (!seo.twitterImage) {
    issues.push({
      type: 'info',
      message: 'Add Twitter Card image for preview',
      field: 'twitterImage',
    });
    score -= 5;
  }

  // Suggestions
  const suggestions: string[] = [];
  if (score < 100) {
    if (!seo.title || seo.title.length < 30) {
      suggestions.push('Write a descriptive title between 30-60 characters');
    }
    if (!seo.description || seo.description.length < 120) {
      suggestions.push('Create a compelling description between 120-160 characters');
    }
    if (!seo.keywords || seo.keywords.length < 3) {
      suggestions.push('Add 3-10 relevant keywords for your portfolio');
    }
    if (!seo.ogImage || !seo.twitterImage) {
      suggestions.push('Upload a preview image (recommended: 1200x630px)');
    }
  }

  return { score: Math.max(0, score), issues, suggestions };
}

/**
 * SEO Settings Component
 */
export function SEOSettings({
  portfolioId,
  currentSEO,
  portfolioUrl,
  onUpdate,
  onUploadImage,
}: SEOSettingsProps) {
  const [seo, setSEO] = useState<SEOData>(currentSEO);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'advanced'>('basic');

  // Calculate SEO score
  const seoScore = useMemo(() => calculateSEOScore(seo), [seo]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(seo);
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle keyword add
  const handleAddKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !seo.keywords.includes(keyword)) {
      setSEO({ ...seo, keywords: [...seo.keywords, keyword] });
      setKeywordInput('');
    }
  };

  // Handle keyword remove
  const handleRemoveKeyword = (keyword: string) => {
    setSEO({ ...seo, keywords: seo.keywords.filter((k) => k !== keyword) });
  };

  // Handle image upload
  const handleImageUpload = async (file: File, field: 'ogImage' | 'twitterImage') => {
    if (!onUploadImage) return;

    try {
      const url = await onUploadImage(file);
      setSEO({ ...seo, [field]: url });
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get score background
  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header with Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              SEO Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Optimize your portfolio for search engines and social media
            </p>
          </div>

          {/* SEO Score */}
          <div className={`px-6 py-4 rounded-lg ${getScoreBackground(seoScore.score)}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(seoScore.score)}`}>
                {seoScore.score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                SEO Score
              </div>
            </div>
          </div>
        </div>

        {/* Issues */}
        {seoScore.issues.length > 0 && (
          <div className="space-y-2">
            {seoScore.issues.map((issue, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  issue.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : issue.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                {issue.type === 'error' ? (
                  <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                ) : issue.type === 'warning' ? (
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                ) : (
                  <CheckCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                )}
                <span
                  className={`text-sm ${
                    issue.type === 'error'
                      ? 'text-red-700 dark:text-red-300'
                      : issue.type === 'warning'
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {issue.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Search className="inline mr-2" size={18} />
            Basic SEO
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'social'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Globe className="inline mr-2" size={18} />
            Social Media
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <TrendingUp className="inline mr-2" size={18} />
            Advanced
          </button>
        </div>
      </div>

      {/* Basic SEO Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Type className="inline mr-2" size={16} />
              Page Title *
            </label>
            <input
              type="text"
              value={seo.title}
              onChange={(e) => setSEO({ ...seo, title: e.target.value })}
              placeholder="Your Name - Portfolio"
              maxLength={60}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {seo.title.length}/60 characters
              </p>
              <p className="text-xs text-gray-500">
                Recommended: 30-60 characters
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Description *
            </label>
            <textarea
              value={seo.description}
              onChange={(e) => setSEO({ ...seo, description: e.target.value })}
              placeholder="A brief description of your portfolio..."
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {seo.description.length}/160 characters
              </p>
              <p className="text-xs text-gray-500">
                Recommended: 120-160 characters
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Hash className="inline mr-2" size={16} />
              Keywords
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Add a keyword..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {seo.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {seo.keywords.length}/10 keywords · Recommended: 3-10
            </p>
          </div>

          {/* Search Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Google Search Preview
            </h3>
            <div className="space-y-1">
              <div className="text-blue-600 dark:text-blue-400 text-lg">
                {seo.title || 'Your Portfolio Title'}
              </div>
              <div className="text-green-700 dark:text-green-400 text-sm">
                {portfolioUrl}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {seo.description || 'Your portfolio description will appear here...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-8">
          {/* Open Graph */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Facebook size={20} className="text-blue-600" />
              Open Graph (Facebook, LinkedIn)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OG Title
                </label>
                <input
                  type="text"
                  value={seo.ogTitle || ''}
                  onChange={(e) => setSEO({ ...seo, ogTitle: e.target.value })}
                  placeholder={seo.title || 'Use default title'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OG Description
                </label>
                <textarea
                  value={seo.ogDescription || ''}
                  onChange={(e) => setSEO({ ...seo, ogDescription: e.target.value })}
                  placeholder={seo.description || 'Use default description'}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <ImageIcon className="inline mr-2" size={16} />
                  OG Image (1200x630px recommended)
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={seo.ogImage || ''}
                    onChange={(e) => setSEO({ ...seo, ogImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {onUploadImage && (
                    <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'ogImage');
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* OG Preview */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-3">Facebook Preview</p>
                {seo.ogImage && (
                  <img
                    src={seo.ogImage}
                    alt="OG Preview"
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                )}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {seo.ogTitle || seo.title || 'Your Portfolio Title'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {seo.ogDescription || seo.description || 'Your description here...'}
                  </div>
                  <div className="text-xs text-gray-400">{portfolioUrl}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Twitter Card */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Twitter size={20} className="text-blue-400" />
              Twitter Card
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Type
                </label>
                <select
                  value={seo.twitterCard || 'summary_large_image'}
                  onChange={(e) =>
                    setSEO({
                      ...seo,
                      twitterCard: e.target.value as 'summary' | 'summary_large_image',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter Title
                </label>
                <input
                  type="text"
                  value={seo.twitterTitle || ''}
                  onChange={(e) => setSEO({ ...seo, twitterTitle: e.target.value })}
                  placeholder={seo.title || 'Use default title'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter Description
                </label>
                <textarea
                  value={seo.twitterDescription || ''}
                  onChange={(e) => setSEO({ ...seo, twitterDescription: e.target.value })}
                  placeholder={seo.description || 'Use default description'}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <ImageIcon className="inline mr-2" size={16} />
                  Twitter Image
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={seo.twitterImage || ''}
                    onChange={(e) => setSEO({ ...seo, twitterImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {onUploadImage && (
                    <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'twitterImage');
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Twitter Preview */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-3">Twitter Preview</p>
                {seo.twitterImage && (
                  <img
                    src={seo.twitterImage}
                    alt="Twitter Preview"
                    className={`w-full ${
                      seo.twitterCard === 'summary_large_image' ? 'h-48' : 'h-32'
                    } object-cover rounded mb-3`}
                  />
                )}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {seo.twitterTitle || seo.title || 'Your Portfolio Title'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {seo.twitterDescription || seo.description || 'Your description here...'}
                  </div>
                  <div className="text-xs text-gray-400">{portfolioUrl}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Canonical URL
            </label>
            <input
              type="url"
              value={seo.canonicalUrl || ''}
              onChange={(e) => setSEO({ ...seo, canonicalUrl: e.target.value })}
              placeholder={portfolioUrl}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              The preferred URL for this page (prevents duplicate content issues)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Robots Meta Tag
            </label>
            <select
              value={seo.robots || 'index, follow'}
              onChange={(e) => setSEO({ ...seo, robots: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="index, follow">Index, Follow (Recommended)</option>
              <option value="noindex, follow">No Index, Follow</option>
              <option value="index, nofollow">Index, No Follow</option>
              <option value="noindex, nofollow">No Index, No Follow</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Controls how search engines crawl and index your portfolio
            </p>
          </div>

          {/* Suggestions */}
          {seoScore.suggestions.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Optimization Suggestions
              </h4>
              <ul className="space-y-1">
                {seoScore.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2"
                  >
                    <span className="text-blue-600 mt-0.5">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save SEO Settings'
          )}
        </button>
      </div>
    </div>
  );
}
