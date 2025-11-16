/**
 * Empty State Variants
 * Section 1.7: Specialized empty states for various scenarios
 *
 * Features:
 * - Pre-built empty states for common scenarios
 * - Consistent styling and behavior
 * - Call-to-action buttons
 * - Loading skeletons
 */

'use client';

import React from 'react';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  FolderOpen,
  Globe,
  Share2,
  BarChart,
  Layers,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { EmptyState } from './EmptyState';

// ============================================================================
// SPECIALIZED EMPTY STATES
// ============================================================================

/**
 * Empty portfolio list state
 */
export function EmptyPortfolioList({
  onCreatePortfolio,
}: {
  onCreatePortfolio?: () => void;
}) {
  return (
    <EmptyState
      icon={<FolderOpen className="text-blue-500" size={48} />}
      title="No portfolios yet"
      description="Create your first portfolio to showcase your work and stand out to employers"
      action={
        onCreatePortfolio
          ? {
              label: 'Create Your First Portfolio',
              onClick: onCreatePortfolio,
            }
          : undefined
      }
    />
  );
}

/**
 * No search results state
 */
export function EmptySearchResults({
  query,
  onClearSearch,
}: {
  query?: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="text-gray-400" size={48} />}
      title="No results found"
      description={
        query
          ? `We couldn't find any results for "${query}". Try adjusting your search.`
          : "We couldn't find any results matching your criteria."
      }
      action={
        onClearSearch
          ? {
              label: 'Clear Search',
              onClick: onClearSearch,
            }
          : undefined
      }
    />
  );
}

/**
 * No filtered results state
 */
export function EmptyFilterResults({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      icon={<Filter className="text-gray-400" size={48} />}
      title="No results match your filters"
      description="Try adjusting or clearing your filters to see more results"
      action={
        onClearFilters
          ? {
              label: 'Clear All Filters',
              onClick: onClearFilters,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty published portfolios state
 */
export function EmptyPublishedPortfolios() {
  return (
    <EmptyState
      icon={<Globe className="text-green-500" size={48} />}
      title="No published portfolios"
      description="Publish a portfolio to make it visible to the world"
    />
  );
}

/**
 * Empty drafts state
 */
export function EmptyDrafts({ onCreatePortfolio }: { onCreatePortfolio?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="text-orange-500" size={48} />}
      title="No drafts"
      description="Create a new portfolio to get started"
      action={
        onCreatePortfolio
          ? {
              label: 'Create Portfolio',
              onClick: onCreatePortfolio,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty templates state
 */
export function EmptyTemplates() {
  return (
    <EmptyState
      icon={<Layers className="text-purple-500" size={48} />}
      title="No templates available"
      description="Check back later for new portfolio templates"
    />
  );
}

/**
 * Empty versions state
 */
export function EmptyVersions({ onCreateVersion }: { onCreateVersion?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="text-blue-500" size={48} />}
      title="No versions saved"
      description="Create a version to save a snapshot of your portfolio"
      action={
        onCreateVersion
          ? {
              label: 'Create Version',
              onClick: onCreateVersion,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty custom domains state
 */
export function EmptyCustomDomains({ onAddDomain }: { onAddDomain?: () => void }) {
  return (
    <EmptyState
      icon={<Globe className="text-blue-500" size={48} />}
      title="No custom domains"
      description="Add a custom domain to give your portfolio a professional URL"
      action={
        onAddDomain
          ? {
              label: 'Add Custom Domain',
              onClick: onAddDomain,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty share links state
 */
export function EmptyShareLinks({ onCreateShareLink }: { onCreateShareLink?: () => void }) {
  return (
    <EmptyState
      icon={<Share2 className="text-blue-500" size={48} />}
      title="No share links"
      description="Create a private share link to share your portfolio with specific people"
      action={
        onCreateShareLink
          ? {
              label: 'Create Share Link',
              onClick: onCreateShareLink,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty analytics state
 */
export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={<BarChart className="text-gray-400" size={48} />}
      title="No analytics data yet"
      description="Analytics data will appear here once your portfolio starts getting views"
    />
  );
}

/**
 * Empty projects state
 */
export function EmptyProjects({ onAddProject }: { onAddProject?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="text-blue-500" size={48} />}
      title="No projects added"
      description="Showcase your best work by adding projects to your portfolio"
      action={
        onAddProject
          ? {
              label: 'Add Project',
              onClick: onAddProject,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty experience state
 */
export function EmptyExperience({ onAddExperience }: { onAddExperience?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="text-blue-500" size={48} />}
      title="No experience added"
      description="Add your work experience to build a comprehensive portfolio"
      action={
        onAddExperience
          ? {
              label: 'Add Experience',
              onClick: onAddExperience,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty education state
 */
export function EmptyEducation({ onAddEducation }: { onAddEducation?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="text-blue-500" size={48} />}
      title="No education added"
      description="Add your educational background to complete your portfolio"
      action={
        onAddEducation
          ? {
              label: 'Add Education',
              onClick: onAddEducation,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty skills state
 */
export function EmptySkills({ onAddSkills }: { onAddSkills?: () => void }) {
  return (
    <EmptyState
      icon={<Layers className="text-blue-500" size={48} />}
      title="No skills added"
      description="Highlight your skills to show what you're capable of"
      action={
        onAddSkills
          ? {
              label: 'Add Skills',
              onClick: onAddSkills,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty images/media state
 */
export function EmptyImages({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<ImageIcon className="text-blue-500" size={48} />}
      title="No images uploaded"
      description="Add images to make your portfolio more visually appealing"
      action={
        onUpload
          ? {
              label: 'Upload Images',
              onClick: onUpload,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty file upload state
 */
export function EmptyUpload({ onUpload }: { onUpload?: () => void }) {
  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
      <Upload className="mx-auto text-gray-400 mb-4" size={48} />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No files uploaded
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Drag and drop files here or click to browse
      </p>
      {onUpload && (
        <button
          onClick={onUpload}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
        >
          <Upload size={20} />
          Choose Files
        </button>
      )}
    </div>
  );
}

// ============================================================================
// LOADING SKELETONS
// ============================================================================

/**
 * Loading skeleton for portfolio cards
 */
export function PortfolioCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton grid
 */
export function PortfolioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PortfolioCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for lists
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
