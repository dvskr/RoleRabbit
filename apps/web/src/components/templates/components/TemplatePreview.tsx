/**
 * TemplatePreview - Mini resume preview component for template cards
 */

import React from 'react';
import type { ResumeTemplate } from '../../../data/templates';

interface TemplatePreviewProps {
  template: ResumeTemplate;
  size?: 'small' | 'medium' | 'large';
  variant?: 'grid' | 'list' | 'added';
}

export default function TemplatePreview({
  template,
  size = 'medium',
  variant = 'grid',
}: TemplatePreviewProps) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const isAdded = variant === 'added';

  // Size classes
  const containerSize = isSmall
    ? 'w-16 h-20'
    : isLarge
    ? 'w-20 h-28'
    : 'w-20 h-28';
  const paddingSize = isSmall ? 'p-1' : 'p-1.5';
  const barHeight = isSmall ? 'h-0.5' : isLarge ? 'h-2' : 'h-1';
  const headerBarHeight = isSmall ? 'h-1.5' : isLarge ? 'h-2' : 'h-1.5';

  // Background gradient based on variant
  const backgroundGradient =
    variant === 'added'
      ? 'bg-gradient-to-br from-green-50 to-green-100'
      : 'bg-gradient-to-br from-gray-100 to-gray-200';

  // Get color scheme class dynamically
  const getColorClass = () => {
    switch (template.colorScheme) {
      case 'blue':
        return 'bg-blue-600';
      case 'green':
        return 'bg-green-600';
      case 'monochrome':
        return 'bg-gray-700';
      default:
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
    }
  };
  
  const getSecondaryColorClass = () => {
    switch (template.colorScheme) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'monochrome':
        return 'bg-gray-600';
      default:
        return 'bg-purple-400';
    }
  };
  
  const colorClass = getColorClass();
  const secondaryColorClass = getSecondaryColorClass();

  return (
    <div
      className={`relative ${containerSize} ${backgroundGradient} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}
    >
      <div
        className={`${containerSize} bg-white rounded shadow-lg border border-gray-200 transform rotate-1`}
      >
        <div className={`${paddingSize} h-full flex flex-col space-y-0.5`}>
          {/* Name/Header Bar */}
          <div className={`${headerBarHeight} rounded ${colorClass}`} />

          {/* Contact Line */}
          <div
            className={`${barHeight} bg-gray-200 rounded w-10/12`}
          />

          {/* Summary Section */}
          <div className="space-y-0.5">
            <div
              className={`${barHeight} rounded ${
                isSmall ? 'w-6' : isLarge ? 'w-8' : 'w-6'
              } ${secondaryColorClass}`}
            />
            <div className={`${barHeight} bg-gray-100 rounded w-full`} />
            {!isSmall && (
              <div
                className={`${barHeight} bg-gray-100 rounded ${
                  isLarge ? 'w-5/6' : 'w-full'
                }`}
              />
            )}
          </div>

          {/* Experience Section */}
          <div className="space-y-0.5">
            <div
              className={`${barHeight} rounded ${
                isSmall ? 'w-5' : isLarge ? 'w-7' : 'w-5'
              } ${secondaryColorClass}`}
            />
            <div className={`${barHeight} bg-gray-100 rounded w-full`} />
            {isLarge && (
              <div className={`${barHeight} bg-gray-100 rounded w-4/5`} />
            )}
          </div>

          {/* Bullet Points */}
          {!isSmall && (
            <>
              <div className={`flex items-center ${isLarge ? 'gap-1' : 'gap-0.5'}`}>
                <div
                  className={`${
                    isLarge ? 'w-1 h-1' : 'w-0.5 h-0.5'
                  } bg-gray-400 rounded-full`}
                />
                <div
                  className={`${barHeight} bg-gray-100 rounded flex-1`}
                />
              </div>
              {isLarge && (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <div className={`${barHeight} bg-gray-100 rounded flex-1`} />
                </div>
              )}
            </>
          )}

          {/* Skills Tags */}
          <div className={`flex ${isLarge ? 'gap-1' : 'gap-0.5'}`}>
            <div
              className={`${barHeight} bg-gray-100 rounded flex-1`}
            />
            <div
              className={`${barHeight} bg-gray-100 rounded flex-1`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

