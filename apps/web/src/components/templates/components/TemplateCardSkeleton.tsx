/**
 * Template Card Skeleton Loader
 * Displays while templates are loading or being filtered
 */

import React from 'react';

interface TemplateCardSkeletonProps {
  colors: any;
}

export default function TemplateCardSkeleton({ colors }: TemplateCardSkeletonProps) {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Preview Area Skeleton */}
      <div
        className="relative aspect-[3/4]"
        style={{ background: colors.hoverBackground }}
      >
        {/* Placeholder icon */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '48px',
            height: '48px',
            background: colors.border,
          }}
        />
      </div>

      {/* Content Area Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div
          className="h-4 rounded"
          style={{
            background: colors.hoverBackground,
            width: '70%',
          }}
        />

        {/* Description lines */}
        <div className="space-y-2">
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '100%',
            }}
          />
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '85%',
            }}
          />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div
            className="h-6 rounded-full"
            style={{
              background: colors.hoverBackground,
              width: '50px',
            }}
          />
          <div
            className="h-6 rounded-full"
            style={{
              background: colors.hoverBackground,
              width: '60px',
            }}
          />
          <div
            className="h-6 rounded-full"
            style={{
              background: colors.hoverBackground,
              width: '55px',
            }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2">
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '40px',
            }}
          />
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '60px',
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <div
            className="h-9 rounded-lg flex-1"
            style={{ background: colors.hoverBackground }}
          />
          <div
            className="h-9 rounded-lg flex-1"
            style={{ background: colors.hoverBackground }}
          />
        </div>
      </div>
    </div>
  );
}
