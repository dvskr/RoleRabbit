'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface FileCardSkeletonProps {
  count?: number;
}

export const FileCardSkeleton: React.FC<FileCardSkeletonProps> = ({ count = 6 }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const skeletonPulse: React.CSSProperties = {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl p-5 w-full"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            maxWidth: '340px',
            minWidth: '280px',
          }}
        >
          {/* Header skeleton */}
          <div className="mb-4">
            <div className="flex items-start gap-4">
              {/* Icon skeleton */}
              <div
                className="w-12 h-12 rounded-lg flex-shrink-0"
                style={{
                  background: colors.inputBackground,
                  ...skeletonPulse,
                }}
              />

              {/* Title and buttons skeleton */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  {/* Title skeleton */}
                  <div
                    className="h-7 rounded flex-1"
                    style={{
                      background: colors.inputBackground,
                      ...skeletonPulse,
                    }}
                  />

                  {/* Action buttons skeleton */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-6 h-6 rounded"
                      style={{
                        background: colors.inputBackground,
                        ...skeletonPulse,
                      }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{
                        background: colors.inputBackground,
                        ...skeletonPulse,
                      }}
                    />
                  </div>
                </div>

                {/* Resume button skeleton */}
                <div
                  className="h-7 w-20 rounded"
                  style={{
                    background: colors.inputBackground,
                    ...skeletonPulse,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Metadata skeleton */}
          <div className="mb-4 space-y-2">
            <div
              className="h-4 w-3/4 rounded"
              style={{
                background: colors.inputBackground,
                ...skeletonPulse,
              }}
            />
            <div
              className="h-4 w-1/2 rounded"
              style={{
                background: colors.inputBackground,
                ...skeletonPulse,
              }}
            />
          </div>

          {/* Divider */}
          <div
            className="my-4"
            style={{ borderTop: `1px solid ${colors.border}` }}
          />

          {/* Action buttons grid skeleton */}
          <div className="space-y-3">
            {/* Row 1 */}
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`row1-${i}`}
                  className="h-16 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    ...skeletonPulse,
                  }}
                />
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`row2-${i}`}
                  className="h-16 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    ...skeletonPulse,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
