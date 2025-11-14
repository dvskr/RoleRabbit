/**
 * Template Card List Skeleton Loader
 * Displays while templates are loading in list view
 */

import React from 'react';
import type { ThemeColors } from '../types';

interface TemplateCardListSkeletonProps {
  colors: ThemeColors;
}

export default function TemplateCardListSkeleton({ colors }: TemplateCardListSkeletonProps) {
  return (
    <div
      className="rounded-xl overflow-hidden p-4 animate-pulse flex gap-4"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Preview Image Skeleton */}
      <div
        className="relative rounded-lg overflow-hidden flex-shrink-0"
        style={{
          width: '120px',
          height: '160px',
          background: colors.hoverBackground,
        }}
      >
        {/* Placeholder icon */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '32px',
            height: '32px',
            background: colors.border,
          }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-3">
        {/* Title and Category */}
        <div className="space-y-2">
          <div
            className="h-5 rounded"
            style={{
              background: colors.hoverBackground,
              width: '40%',
            }}
          />
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '20%',
            }}
          />
        </div>

        {/* Description */}
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
              width: '90%',
            }}
          />
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '70%',
            }}
          />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
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
              width: '70px',
            }}
          />
          <div
            className="h-6 rounded-full"
            style={{
              background: colors.hoverBackground,
              width: '65px',
            }}
          />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4">
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '80px',
            }}
          />
          <div
            className="h-3 rounded"
            style={{
              background: colors.hoverBackground,
              width: '100px',
            }}
          />
        </div>
      </div>

      {/* Actions Area */}
      <div className="flex flex-col gap-2 justify-center">
        <div
          className="h-9 rounded-lg"
          style={{
            background: colors.hoverBackground,
            width: '100px',
          }}
        />
        <div
          className="h-9 rounded-lg"
          style={{
            background: colors.hoverBackground,
            width: '100px',
          }}
        />
      </div>
    </div>
  );
}
