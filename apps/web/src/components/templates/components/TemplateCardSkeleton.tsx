/**
 * TemplateCardSkeleton - Loading skeleton for template cards
 * Provides visual feedback while templates are loading
 */

import React from 'react';

interface TemplateCardSkeletonProps {
  colors: any;
  count?: number;
}

/**
 * Single skeleton card
 */
function SkeletonCard({ colors }: { colors: any }) {
  return (
    <div
      className="rounded-lg overflow-hidden animate-pulse"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      aria-hidden="true"
    >
      {/* Preview area skeleton */}
      <div
        className="h-32"
        style={{ background: colors.inputBackground }}
      />

      {/* Content area skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div
          className="h-4 rounded"
          style={{ background: colors.inputBackground, width: '70%' }}
        />

        {/* Description lines */}
        <div className="space-y-2">
          <div
            className="h-3 rounded"
            style={{ background: colors.inputBackground, width: '100%' }}
          />
          <div
            className="h-3 rounded"
            style={{ background: colors.inputBackground, width: '85%' }}
          />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div
            className="h-6 w-16 rounded-full"
            style={{ background: colors.inputBackground }}
          />
          <div
            className="h-6 w-20 rounded-full"
            style={{ background: colors.inputBackground }}
          />
        </div>

        {/* Footer with download count and buttons */}
        <div className="flex items-center justify-between pt-2">
          <div
            className="h-4 w-12 rounded"
            style={{ background: colors.inputBackground }}
          />
          <div className="flex gap-2">
            <div
              className="h-9 w-16 rounded-lg"
              style={{ background: colors.inputBackground }}
            />
            <div
              className="h-9 w-9 rounded-lg"
              style={{ background: colors.inputBackground }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards
 */
export default function TemplateCardSkeleton({
  colors,
  count = 8,
}: TemplateCardSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6"
      role="status"
      aria-label="Loading templates"
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} colors={colors} />
      ))}
      <span className="sr-only">Loading templates...</span>
    </div>
  );
}
