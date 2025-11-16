/**
 * Skeleton Loading Components
 * Section 1.6: Skeleton placeholders for better loading UX
 */

'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * Base skeleton element with shimmer animation
 */
export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
}: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${roundedMap[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="16px"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for a card
 */
export function SkeletonCard({
  className = '',
  showImage = false,
}: {
  className?: string;
  showImage?: boolean;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {showImage && <Skeleton height="200px" className="mb-4" />}
      <Skeleton height="24px" width="60%" className="mb-3" />
      <SkeletonText lines={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton height="32px" width="80px" rounded="md" />
        <Skeleton height="32px" width="80px" rounded="md" />
      </div>
    </div>
  );
}

/**
 * Skeleton for portfolio card
 */
export function SkeletonPortfolioCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton width="48px" height="48px" rounded="lg" />
        <Skeleton width="60px" height="20px" rounded="full" />
      </div>
      <Skeleton height="24px" width="70%" className="mb-2" />
      <SkeletonText lines={2} className="mb-4" />
      <div className="flex items-center gap-4">
        <Skeleton height="14px" width="80px" />
        <Skeleton height="14px" width="60px" />
      </div>
    </div>
  );
}

/**
 * Skeleton for list of portfolio cards
 */
export function SkeletonPortfolioList({
  count = 6,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPortfolioCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for template card
 */
export function SkeletonTemplateCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <Skeleton height="200px" className="mb-0" />
      <div className="p-4">
        <Skeleton height="20px" width="60%" className="mb-2" />
        <Skeleton height="14px" width="40%" />
      </div>
    </div>
  );
}

/**
 * Skeleton for template grid
 */
export function SkeletonTemplateGrid({
  count = 6,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTemplateCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for preview panel
 */
export function SkeletonPreview({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <Skeleton width="120px" height="120px" rounded="full" className="mx-auto mb-4" />
        <Skeleton height="32px" width="200px" className="mx-auto mb-2" />
        <Skeleton height="20px" width="300px" className="mx-auto" />
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        <div>
          <Skeleton height="24px" width="120px" className="mb-4" />
          <SkeletonText lines={4} />
        </div>
        <div>
          <Skeleton height="24px" width="150px" className="mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for form
 */
export function SkeletonForm({
  fields = 5,
  className = '',
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton height="16px" width="120px" className="mb-2" />
          <Skeleton height="40px" width="100%" rounded="md" />
        </div>
      ))}
      <Skeleton height="44px" width="150px" rounded="lg" />
    </div>
  );
}

export default Skeleton;
