/**
 * Template Gallery Container
 * Fetches templates from API and renders TemplateGallery
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TemplateGallery, type PortfolioTemplate } from './TemplateGallery';

interface ApiTemplate {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  category: string | null;
  isPublic: boolean;
  downloads: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// Map API template to component template
function mapApiTemplateToComponent(apiTemplate: ApiTemplate): PortfolioTemplate {
  // Map category string to component category type
  const categoryMap: Record<string, PortfolioTemplate['category']> = {
    'Developer': 'developer',
    'Professional': 'business',
    'Creative': 'creative',
    'Business': 'business',
    'Freelance': 'business',
  };

  const category = apiTemplate.category 
    ? (categoryMap[apiTemplate.category] || 'creative')
    : 'creative';

  return {
    id: apiTemplate.id,
    name: apiTemplate.name,
    description: apiTemplate.description || 'No description available',
    thumbnail: apiTemplate.thumbnail || '/placeholder-template.png',
    previewUrl: `/templates/${apiTemplate.id}/preview`,
    category,
    isPremium: false, // All seeded templates are free
    isPopular: apiTemplate.downloads > 500,
    isFeatured: apiTemplate.downloads > 1000,
    usageCount: apiTemplate.downloads,
    rating: apiTemplate.rating,
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#F59E0B',
    },
    features: [
      'Responsive Design',
      'Customizable Colors',
      'Multiple Sections',
      'SEO Optimized',
    ],
    tags: [category, 'modern', 'professional'],
  };
}

interface TemplateGalleryContainerProps {
  onSelectTemplate: (template: PortfolioTemplate) => void;
  onPreview?: (template: PortfolioTemplate) => void;
  userIsPremium?: boolean;
}

export function TemplateGalleryContainer({
  onSelectTemplate,
  onPreview,
  userIsPremium = false,
}: TemplateGalleryContainerProps) {
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates from API
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const data = await response.json();
      const apiTemplates: ApiTemplate[] = data.data || data.templates || [];
      
      setTemplates(apiTemplates.map(mapApiTemplateToComponent));
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Templates
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchTemplates}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Templates Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Templates will appear here once they're added to the system.
          </p>
        </div>
      </div>
    );
  }

  // Render template gallery
  return (
    <TemplateGallery
      templates={templates}
      onSelectTemplate={onSelectTemplate}
      onPreview={onPreview}
      userIsPremium={userIsPremium}
    />
  );
}

