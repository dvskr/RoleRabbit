/**
 * Skeleton Loader Components
 * Provides loading placeholders for various UI elements
 */

import React from 'react';

// ============================================
// BASE SKELETON
// ============================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// ============================================
// TEMPLATE CARD SKELETON
// ============================================

export const TemplateCardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      {/* Preview Image */}
      <Skeleton height={200} variant="rectangular" />
      
      {/* Title */}
      <Skeleton height={20} width="70%" />
      
      {/* Description */}
      <div className="space-y-2">
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="90%" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton height={24} width={60} variant="rectangular" />
        <Skeleton height={24} width={80} variant="rectangular" />
        <Skeleton height={24} width={70} variant="rectangular" />
      </div>
      
      {/* Button */}
      <Skeleton height={36} variant="rectangular" />
    </div>
  );
};

// ============================================
// TEMPLATE GALLERY SKELETON
// ============================================

interface TemplateGallerySkeletonProps {
  count?: number;
}

export const TemplateGallerySkeleton: React.FC<TemplateGallerySkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <TemplateCardSkeleton key={index} />
      ))}
    </div>
  );
};

// ============================================
// RESUME LIST ITEM SKELETON
// ============================================

export const ResumeListItemSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        {/* Title and metadata */}
        <div className="flex-1 space-y-2">
          <Skeleton height={24} width="60%" />
          <Skeleton height={14} width="40%" />
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Skeleton height={32} width={32} variant="circular" />
          <Skeleton height={32} width={32} variant="circular" />
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton height={20} width={50} variant="rectangular" />
        <Skeleton height={20} width={70} variant="rectangular" />
      </div>
      
      {/* Stats */}
      <div className="flex gap-4">
        <Skeleton height={16} width={100} />
        <Skeleton height={16} width={120} />
      </div>
    </div>
  );
};

// ============================================
// RESUME LIST SKELETON
// ============================================

interface ResumeListSkeletonProps {
  count?: number;
}

export const ResumeListSkeleton: React.FC<ResumeListSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <ResumeListItemSkeleton key={index} />
      ))}
    </div>
  );
};

// ============================================
// EDITOR SKELETON
// ============================================

export const EditorSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton height={32} width="50%" />
        <Skeleton height={16} width="30%" />
      </div>
      
      {/* Sections */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3">
          {/* Section title */}
          <Skeleton height={24} width="40%" />
          
          {/* Section content */}
          <div className="space-y-2">
            <Skeleton height={40} width="100%" />
            <Skeleton height={40} width="100%" />
            <Skeleton height={80} width="100%" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// TABLE SKELETON
// ============================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height={20} width={`${100 / columns}%`} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height={16} width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
};

// ============================================
// TEXT BLOCK SKELETON
// ============================================

interface TextBlockSkeletonProps {
  lines?: number;
}

export const TextBlockSkeleton: React.FC<TextBlockSkeletonProps> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={14}
          width={index === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
};

// ============================================
// AVATAR SKELETON
// ============================================

interface AvatarSkeletonProps {
  size?: number;
}

export const AvatarSkeleton: React.FC<AvatarSkeletonProps> = ({ size = 40 }) => {
  return <Skeleton width={size} height={size} variant="circular" />;
};

// ============================================
// CARD SKELETON
// ============================================

export const CardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
      <Skeleton height={24} width="60%" />
      <TextBlockSkeleton lines={3} />
      <div className="flex gap-2">
        <Skeleton height={36} width={100} variant="rectangular" />
        <Skeleton height={36} width={100} variant="rectangular" />
      </div>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default {
  Skeleton,
  TemplateCardSkeleton,
  TemplateGallerySkeleton,
  ResumeListItemSkeleton,
  ResumeListSkeleton,
  EditorSkeleton,
  TableSkeleton,
  TextBlockSkeleton,
  AvatarSkeleton,
  CardSkeleton
};



