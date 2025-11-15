/**
 * Preview Toggle and Device Selector
 * Requirements 1.12.5-1.12.7: Preview toggle, device selector, highlight changes
 */

'use client';

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Code,
  Split,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type PreviewMode = 'edit' | 'preview' | 'split';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewToggleProps {
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

/**
 * Preview Toggle Component
 * Switches between Edit, Preview, and Split modes with device selection
 */
export function PreviewToggle({
  mode,
  onModeChange,
  device,
  onDeviceChange,
  isFullscreen = false,
  onToggleFullscreen,
}: PreviewToggleProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Mode Toggle */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => onModeChange('edit')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
            mode === 'edit'
              ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title="Edit Mode"
        >
          <Code size={16} />
          <span className="hidden sm:inline">Edit</span>
        </button>

        <button
          onClick={() => onModeChange('split')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
            mode === 'split'
              ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title="Split View"
        >
          <Split size={16} />
          <span className="hidden sm:inline">Split</span>
        </button>

        <button
          onClick={() => onModeChange('preview')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
            mode === 'preview'
              ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title="Preview Mode"
        >
          <Eye size={16} />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Divider */}
      {(mode === 'preview' || mode === 'split') && (
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
      )}

      {/* Device Selector */}
      {(mode === 'preview' || mode === 'split') && (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
              device === 'desktop'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Desktop View (1920×1080)"
          >
            <Monitor size={16} />
            <span className="hidden md:inline">Desktop</span>
          </button>

          <button
            onClick={() => onDeviceChange('tablet')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
              device === 'tablet'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Tablet View (768×1024)"
          >
            <Tablet size={16} />
            <span className="hidden md:inline">Tablet</span>
          </button>

          <button
            onClick={() => onDeviceChange('mobile')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
              device === 'mobile'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Mobile View (375×667)"
          >
            <Smartphone size={16} />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>
      )}

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (mode === 'preview' || mode === 'split') && (
        <>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <button
            onClick={onToggleFullscreen}
            className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Device Frame Component
 * Wraps preview content in device frame with proper dimensions
 */
export function DeviceFrame({
  device,
  children,
  highlightChanges = false,
}: {
  device: DeviceType;
  children: React.ReactNode;
  highlightChanges?: boolean;
}) {
  const dimensions = {
    desktop: { width: '100%', height: '100%', maxWidth: '1920px' },
    tablet: { width: '768px', height: '1024px', maxWidth: '768px' },
    mobile: { width: '375px', height: '667px', maxWidth: '375px' },
  };

  const { width, height, maxWidth } = dimensions[device];

  return (
    <div className="flex items-start justify-center p-4 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-auto">
      <div
        className={`bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 ${
          device === 'desktop' ? 'w-full' : 'mx-auto'
        } ${highlightChanges ? 'animate-pulse-border' : ''}`}
        style={{
          width: device === 'desktop' ? '100%' : width,
          maxWidth,
          minHeight: device === 'desktop' ? '100vh' : height,
        }}
      >
        {/* Device Bezel (for mobile/tablet) */}
        {device !== 'desktop' && (
          <div className="sticky top-0 z-10 bg-gray-800 dark:bg-gray-900 px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>
            <div className="text-xs text-gray-400">
              {device === 'tablet' ? '768×1024' : '375×667'}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-600 rounded-full" />
              <div className="w-1 h-1 bg-gray-600 rounded-full" />
              <div className="w-1 h-1 bg-gray-600 rounded-full" />
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className={`overflow-auto ${
            device === 'desktop' ? 'h-full' : ''
          }`}
          style={{
            height: device === 'desktop' ? '100%' : height,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Change Highlighter Component
 * Highlights newly added/changed content with animation
 */
export function ChangeHighlight({
  children,
  isNew = false,
  isModified = false,
}: {
  children: React.ReactNode;
  isNew?: boolean;
  isModified?: boolean;
}) {
  if (!isNew && !isModified) return <>{children}</>;

  return (
    <div
      className={`relative ${
        isNew
          ? 'animate-highlight-new ring-2 ring-green-500 ring-opacity-50'
          : 'animate-highlight-modified ring-2 ring-blue-500 ring-opacity-50'
      }`}
    >
      {children}
      <div
        className={`absolute -top-2 -left-2 px-2 py-1 text-xs font-medium rounded shadow-lg ${
          isNew
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 text-white'
        }`}
      >
        {isNew ? 'New' : 'Modified'}
      </div>
    </div>
  );
}

/**
 * Custom CSS for animations
 * Add to your global CSS:
 */
export const previewAnimationStyles = `
@keyframes highlight-new {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
}

@keyframes highlight-modified {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}

@keyframes pulse-border {
  0%, 100% { border-color: rgba(59, 130, 246, 0.5); }
  50% { border-color: rgba(59, 130, 246, 1); }
}

.animate-highlight-new {
  animation: highlight-new 2s ease-in-out 3;
}

.animate-highlight-modified {
  animation: highlight-modified 2s ease-in-out 3;
}

.animate-pulse-border {
  animation: pulse-border 2s ease-in-out infinite;
  border: 2px solid;
}
`;
