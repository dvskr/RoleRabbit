# UI/UX Polish Implementation Guide

## Overview
Complete the user experience with professional polish: mobile responsiveness, accessibility, loading states, empty states, error boundaries, keyboard shortcuts, and drag & drop upload.

**Implementation Time**: 20-25 hours
**Priority**: P1.5 (High importance for user satisfaction)
**Cost**: Free

---

## 1️⃣ Mobile Responsive Design

### Current Issues
- File cards may overflow on small screens
- Action buttons too small for touch
- Modals not optimized for mobile
- File preview not mobile-friendly

### Implementation

#### Responsive File Grid

Update `apps/web/src/components/cloudStorage/RedesignedFileList.tsx`:

```typescript
// Responsive grid with Tailwind
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
  {files.map(file => (
    <FileCard key={file.id} file={file} {...props} />
  ))}
</div>
```

#### Mobile-Optimized File Card

Update `apps/web/src/components/cloudStorage/FileCard.tsx`:

```typescript
export default function FileCard({ file, onSelect, isSelected }: FileCardProps) {
  return (
    <div className={`
      relative rounded-lg border-2 transition-all duration-200
      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}

      // Mobile optimizations
      touch-manipulation // Disable double-tap zoom on touch
      min-h-[120px] sm:min-h-[140px] // Taller on mobile for better touch targets
      p-3 sm:p-4 // More padding on desktop
    `}>
      {/* Thumbnail */}
      <div className="aspect-square w-full mb-3 bg-gray-100 rounded-lg overflow-hidden">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FileIcon type={file.type} className="w-full h-full p-6" />
        )}
      </div>

      {/* File info */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-medium truncate" title={file.name}>
          {file.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          {formatFileSize(file.size)}
        </p>
      </div>

      {/* Actions - Mobile bottom sheet, Desktop dropdown */}
      <div className="absolute top-2 right-2">
        {/* Mobile: Bottom sheet trigger */}
        <button
          className="sm:hidden p-2 rounded-full bg-white shadow-md touch-manipulation"
          onClick={() => openMobileActions(file)}
          aria-label="File actions"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Desktop: Dropdown menu */}
        <DropdownMenu className="hidden sm:block">
          <FileActions file={file} />
        </DropdownMenu>
      </div>
    </div>
  );
}
```

#### Mobile Bottom Sheet for Actions

Create `apps/web/src/components/cloudStorage/MobileBottomSheet.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/sheet'; // shadcn/ui

interface MobileBottomSheetProps {
  file: ResumeFile | null;
  onClose: () => void;
  onAction: (action: string) => void;
}

export default function MobileBottomSheet({ file, onClose, onAction }: MobileBottomSheetProps) {
  if (!file) return null;

  const actions = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'download', label: 'Download', icon: Download },
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'rename', label: 'Rename', icon: Edit },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
  ];

  return (
    <Sheet open={!!file} onOpenChange={onClose}>
      <div className="p-4 space-y-1">
        {/* File info */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <FileIcon type={file.type} className="w-10 h-10" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{file.name}</h3>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>

        {/* Actions */}
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => {
              onAction(action.id);
              onClose();
            }}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg
              hover:bg-gray-100 transition-colors touch-manipulation
              ${action.danger ? 'text-red-600' : 'text-gray-700'}
            `}
          >
            <action.icon className="w-5 h-5" />
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
```

#### Responsive Modal/Dialog

```typescript
// Mobile-friendly modal
<Dialog>
  <DialogContent className="
    w-full max-w-lg
    // Mobile: Full screen with safe areas
    sm:max-h-[90vh] sm:rounded-lg
    max-sm:h-full max-sm:max-h-full max-sm:w-full max-sm:rounded-none
    // Safe area padding for notched phones
    pb-safe
  ">
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

#### Responsive File Preview

```typescript
// In FilePreviewModal.tsx
<div className="
  fixed inset-0 z-50 bg-black
  // Desktop: Padding around preview
  sm:p-8
  // Mobile: Full screen
  max-sm:p-0
">
  <div className="relative h-full flex flex-col">
    {/* Header - sticky on mobile */}
    <div className="
      flex items-center justify-between p-4 bg-black/80
      backdrop-blur-sm sticky top-0 z-10
    ">
      <h3 className="text-white font-medium truncate max-w-[70%]">
        {file.name}
      </h3>
      <button
        onClick={onClose}
        className="p-2 text-white hover:bg-white/20 rounded-full touch-manipulation"
      >
        <X className="w-6 h-6" />
      </button>
    </div>

    {/* Preview content - scrollable */}
    <div className="flex-1 overflow-auto">
      {renderPreview()}
    </div>

    {/* Actions - sticky on mobile */}
    <div className="
      p-4 bg-black/80 backdrop-blur-sm sticky bottom-0
      flex gap-2 justify-center
    ">
      <button className="px-4 py-2 bg-white/20 text-white rounded-lg touch-manipulation">
        Download
      </button>
      <button className="px-4 py-2 bg-white/20 text-white rounded-lg touch-manipulation">
        Share
      </button>
    </div>
  </div>
</div>
```

#### Responsive Breakpoints Reference

```css
/* Tailwind breakpoints */
sm:  640px  /* Small tablets */
md:  768px  /* Tablets */
lg:  1024px /* Desktops */
xl:  1280px /* Large desktops */
2xl: 1536px /* Extra large */

/* Custom mobile-first classes */
.touch-manipulation {
  touch-action: manipulation; /* Disable double-tap zoom */
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom); /* iPhone notch */
}
```

---

## 2️⃣ Accessibility (WCAG 2.1 AA Compliance)

### Key Requirements
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast (4.5:1 for text)
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Alt text for images

### Implementation

#### Keyboard-Accessible File Card

```typescript
export default function FileCard({ file, onSelect, isSelected }: FileCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${file.name}, ${formatFileSize(file.size)}, ${isSelected ? 'selected' : 'not selected'}`}
      aria-pressed={isSelected}
      className={`
        file-card relative rounded-lg border-2 transition-all
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        focus:outline-none
      `}
      onClick={() => onSelect(file.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(file.id);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {/* Thumbnail with alt text */}
      <div className="aspect-square w-full mb-3 bg-gray-100 rounded-lg overflow-hidden">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={`Thumbnail of ${file.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileIcon
            type={file.type}
            className="w-full h-full p-6"
            aria-hidden="true"
          />
        )}
      </div>

      {/* File info - accessible */}
      <h3 className="text-sm font-medium truncate">
        {file.name}
      </h3>
      <p className="text-xs text-gray-500" aria-label={`File size: ${formatFileSize(file.size)}`}>
        {formatFileSize(file.size)}
      </p>

      {/* Checkbox with keyboard support */}
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(file.id);
          }}
          className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
          aria-label={`Select ${file.name}`}
        />
      </div>
    </div>
  );
}
```

#### Accessible Dropdown Menu

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function FileActionsMenu({ file }: { file: ResumeFile }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 hover:bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500"
          aria-label={`Actions for ${file.name}`}
        >
          <MoreVertical className="w-5 h-5" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="
            min-w-[200px] bg-white rounded-lg shadow-lg border
            p-1 z-50
          "
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="
              flex items-center gap-2 px-3 py-2 rounded-md
              hover:bg-gray-100 focus:bg-gray-100
              outline-none cursor-pointer
            "
            onSelect={() => handlePreview(file)}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>Preview</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 focus:bg-gray-100 outline-none cursor-pointer"
            onSelect={() => handleDownload(file)}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item
            className="
              flex items-center gap-2 px-3 py-2 rounded-md
              hover:bg-red-50 focus:bg-red-50 text-red-600
              outline-none cursor-pointer
            "
            onSelect={() => handleDelete(file)}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

#### Screen Reader Announcements

```typescript
// Create live region for announcements
export function LiveRegion({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only" // Visually hidden but readable by screen readers
    >
      {message}
    </div>
  );
}

// Usage
function FileUploadComponent() {
  const [announcement, setAnnouncement] = useState('');

  const handleUploadSuccess = (fileName: string) => {
    setAnnouncement(`File ${fileName} uploaded successfully`);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  return (
    <>
      <LiveRegion message={announcement} />
      {/* Upload UI */}
    </>
  );
}
```

#### Color Contrast Checker

```typescript
// Ensure all colors meet WCAG AA (4.5:1)
const colors = {
  // ✅ PASS: 7.0:1 contrast
  text: {
    primary: '#1f2937',    // gray-800 on white
    secondary: '#6b7280',  // gray-500 on white
  },

  // ✅ PASS: 4.6:1 contrast
  interactive: {
    primary: '#2563eb',    // blue-600
    hover: '#1d4ed8',      // blue-700
  },

  // ❌ FAIL: Use with caution
  danger: {
    text: '#dc2626',       // red-600 (5.9:1 - PASS)
    bg: '#fef2f2',         // red-50
  },
};
```

#### Focus Indicators

```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid #2563eb; /* blue-600 */
  outline-offset: 2px;
}

/* Skip to content link (for keyboard users) */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}
```

---

## 3️⃣ Loading States and Skeletons

### Skeleton Components

Create `apps/web/src/components/cloudStorage/FileCardSkeleton.tsx`:

```typescript
export function FileCardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-gray-200 p-4 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-square w-full mb-3 bg-gray-200 rounded-lg" />

      {/* Title skeleton */}
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />

      {/* Meta skeleton */}
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export function FileListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <FileCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Loading States in File List

```typescript
export default function RedesignedFileList({ files, isLoading }: Props) {
  // Initial loading
  if (isLoading && files.length === 0) {
    return <FileListSkeleton count={8} />;
  }

  // Empty state (see section 4)
  if (!isLoading && files.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* File grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {files.map(file => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>

      {/* Pagination loading (load more) */}
      {isLoading && files.length > 0 && (
        <div className="flex justify-center p-4">
          <FileCardSkeleton />
          <FileCardSkeleton />
          <FileCardSkeleton />
        </div>
      )}
    </div>
  );
}
```

### Upload Progress Indicator

```typescript
export function UploadProgress({ file, progress }: { file: File; progress: number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {/* File icon */}
      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
        <FileIcon type={file.type} className="w-6 h-6" />
      </div>

      {/* File info & progress */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="mt-1 flex items-center gap-2">
          {/* Progress bar */}
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Upload progress: ${progress}%`}
            />
          </div>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
      </div>

      {/* Cancel button */}
      {progress < 100 && (
        <button
          onClick={() => cancelUpload(file)}
          className="p-1 text-gray-400 hover:text-gray-600"
          aria-label="Cancel upload"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
```

### Spinner Component

```typescript
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-gray-300 border-t-blue-600
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

---

## 4️⃣ Empty States with Helpful CTAs

### Empty File List

Create `apps/web/src/components/cloudStorage/EmptyState.tsx`:

```typescript
import { Upload, File, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-files' | 'no-search-results' | 'no-folder-items';
  onAction?: () => void;
}

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const states = {
    'no-files': {
      icon: FolderOpen,
      title: 'No files yet',
      description: 'Upload your first file to get started',
      action: {
        label: 'Upload File',
        onClick: onAction,
      },
      illustration: (
        <div className="w-64 h-64 mx-auto mb-6">
          <EmptyFolderIllustration />
        </div>
      ),
    },
    'no-search-results': {
      icon: File,
      title: 'No files found',
      description: 'Try adjusting your search terms or filters',
      action: {
        label: 'Clear Filters',
        onClick: onAction,
      },
    },
    'no-folder-items': {
      icon: FolderOpen,
      title: 'This folder is empty',
      description: 'Upload files or create subfolders to organize your content',
      action: {
        label: 'Upload to Folder',
        onClick: onAction,
      },
    },
  };

  const state = states[type];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration (optional) */}
      {state.illustration}

      {/* Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {state.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 mb-6 max-w-sm">
        {state.description}
      </p>

      {/* CTA */}
      {state.action && (
        <button
          onClick={state.action.onClick}
          className="
            px-6 py-3 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors
            font-medium
          "
        >
          {state.action.label}
        </button>
      )}

      {/* Secondary actions */}
      <div className="mt-4 flex gap-4 text-sm text-gray-500">
        <button className="hover:text-gray-700">Learn more</button>
        <button className="hover:text-gray-700">Watch tutorial</button>
      </div>
    </div>
  );
}
```

### Empty Folder Illustration (Simple SVG)

```typescript
function EmptyFolderIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Open folder */}
      <rect x="40" y="80" width="120" height="80" rx="4" fill="#E5E7EB" />
      <rect x="50" y="70" width="60" height="20" rx="4" fill="#D1D5DB" />

      {/* Dashed upload icon */}
      <circle cx="100" cy="120" r="30" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M100 105 L100 135 M100 105 L90 115 M100 105 L110 115" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
```

---

## 5️⃣ Error Boundaries for Graceful Failures

### Error Boundary Component

Create `apps/web/src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Log to error tracking service (Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>

          <p className="text-gray-600 mb-6 max-w-md">
            We encountered an unexpected error. Please try refreshing the page.
          </p>

          {/* Error details (dev mode only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="text-left text-xs bg-gray-100 p-4 rounded mb-4 max-w-2xl overflow-auto">
              {this.state.error.toString()}
              {this.state.error.stack}
            </pre>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage in App

```typescript
// Wrap entire file list
<ErrorBoundary>
  <RedesignedFileList files={files} />
</ErrorBoundary>

// Wrap individual components with specific fallbacks
<ErrorBoundary fallback={<FileCardErrorFallback />}>
  <FileCard file={file} />
</ErrorBoundary>

// Multiple error boundaries for granular error handling
export default function CloudStoragePage() {
  return (
    <div>
      <ErrorBoundary>
        <FileUploadZone />
      </ErrorBoundary>

      <ErrorBoundary>
        <FileFilters />
      </ErrorBoundary>

      <ErrorBoundary fallback={<FileListErrorFallback />}>
        <RedesignedFileList files={files} />
      </ErrorBoundary>
    </div>
  );
}
```

### Specific Error Fallbacks

```typescript
function FileListErrorFallback() {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="font-semibold text-red-900 mb-2">
        Failed to load files
      </h3>
      <p className="text-red-700 text-sm">
        There was a problem loading your files. Please try again.
      </p>
    </div>
  );
}

function FileCardErrorFallback() {
  return (
    <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300 border-dashed">
      <p className="text-sm text-gray-500 text-center">
        Unable to display this file
      </p>
    </div>
  );
}
```

---

## 6️⃣ Keyboard Shortcuts

### Keyboard Shortcuts Hook

Create `apps/web/src/hooks/useKeyboardShortcuts.ts`:

```typescript
import { useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchesCtrl = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
      const matchesShift = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
      const matchesAlt = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
      const matchesMeta = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

### File List Keyboard Shortcuts

```typescript
export default function RedesignedFileList({ files }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Define shortcuts
  const shortcuts: Shortcut[] = [
    {
      key: 'u',
      description: 'Upload file',
      action: () => openUploadDialog(),
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'New folder',
      action: () => createNewFolder(),
    },
    {
      key: 'a',
      ctrlKey: true,
      description: 'Select all',
      action: () => setSelectedFiles(files.map(f => f.id)),
    },
    {
      key: 'Escape',
      description: 'Deselect all',
      action: () => setSelectedFiles([]),
    },
    {
      key: 'Delete',
      description: 'Delete selected',
      action: () => {
        if (selectedFiles.length > 0) {
          handleBulkDelete(selectedFiles);
        }
      },
    },
    {
      key: 'ArrowDown',
      description: 'Navigate down',
      action: () => {
        const nextIndex = Math.min(focusedIndex + 1, files.length - 1);
        setFocusedIndex(nextIndex);
        focusFile(nextIndex);
      },
    },
    {
      key: 'ArrowUp',
      description: 'Navigate up',
      action: () => {
        const prevIndex = Math.max(focusedIndex - 1, 0);
        setFocusedIndex(prevIndex);
        focusFile(prevIndex);
      },
    },
    {
      key: ' ',
      description: 'Toggle selection',
      action: () => {
        const fileId = files[focusedIndex]?.id;
        if (fileId) {
          setSelectedFiles(prev =>
            prev.includes(fileId)
              ? prev.filter(id => id !== fileId)
              : [...prev, fileId]
          );
        }
      },
    },
    {
      key: 'Enter',
      description: 'Open file',
      action: () => {
        const file = files[focusedIndex];
        if (file) {
          handlePreview(file);
        }
      },
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Download selected',
      action: () => {
        if (selectedFiles.length > 0) {
          handleBulkDownload(selectedFiles);
        }
      },
    },
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcutsHelp(true),
    },
  ];

  useKeyboardShortcuts(shortcuts);

  // ... rest of component
}
```

### Keyboard Shortcuts Help Dialog

```typescript
export function KeyboardShortcutsHelp({ shortcuts, onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* General */}
          <div>
            <h3 className="font-semibold mb-3">General</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['U']} description="Upload file" />
              <ShortcutRow keys={['Ctrl', 'N']} description="New folder" />
              <ShortcutRow keys={['?']} description="Show shortcuts" />
            </div>
          </div>

          {/* Selection */}
          <div>
            <h3 className="font-semibold mb-3">Selection</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['Ctrl', 'A']} description="Select all" />
              <ShortcutRow keys={['Esc']} description="Deselect all" />
              <ShortcutRow keys={['Space']} description="Toggle selection" />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-3">Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['↑']} description="Move up" />
              <ShortcutRow keys={['↓']} description="Move down" />
              <ShortcutRow keys={['Enter']} description="Open file" />
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="font-semibold mb-3">Actions</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['Ctrl', 'D']} description="Download" />
              <ShortcutRow keys={['Delete']} description="Delete" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="
              px-2 py-1 bg-gray-100 border border-gray-300 rounded
              font-mono text-xs font-semibold
            "
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
```

---

## 7️⃣ Drag & Drop Upload Zone

### Complete Drag & Drop Component

Create `apps/web/src/components/cloudStorage/DragDropUploadZone.tsx`:

```typescript
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface DragDropUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
}

export default function DragDropUploadZone({
  onUpload,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = [],
}: DragDropUploadZoneProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          toast.error(`${file.name}: ${error.message}`);
        });
      });
    }

    // Process accepted files
    if (acceptedFiles.length > 0) {
      // Add to upload queue
      const items: UploadItem[] = acceptedFiles.map(file => ({
        id: Math.random().toString(36),
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploadQueue(prev => [...prev, ...items]);

      // Start uploads
      for (const item of items) {
        try {
          setUploadQueue(prev =>
            prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i)
          );

          await uploadFile(item.file, (progress) => {
            setUploadQueue(prev =>
              prev.map(i => i.id === item.id ? { ...i, progress } : i)
            );
          });

          setUploadQueue(prev =>
            prev.map(i => i.id === item.id ? { ...i, status: 'success', progress: 100 } : i)
          );
        } catch (error) {
          setUploadQueue(prev =>
            prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i)
          );
          toast.error(`Failed to upload ${item.file.name}`);
        }
      }
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: accept.length > 0 ? { [accept[0]]: accept } : undefined,
  });

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12
          transition-colors cursor-pointer
          ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${!isDragActive ? 'border-gray-300 hover:border-gray-400' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4
            ${isDragActive && !isDragReject ? 'bg-blue-100' : 'bg-gray-100'}
            ${isDragReject ? 'bg-red-100' : ''}
          `}>
            <Upload className={`
              w-8 h-8
              ${isDragActive && !isDragReject ? 'text-blue-600' : 'text-gray-400'}
              ${isDragReject ? 'text-red-600' : ''}
            `} />
          </div>

          {/* Text */}
          {isDragReject ? (
            <>
              <p className="text-lg font-semibold text-red-900 mb-2">
                Invalid files
              </p>
              <p className="text-sm text-red-600">
                Please check file type and size limits
              </p>
            </>
          ) : isDragActive ? (
            <>
              <p className="text-lg font-semibold text-blue-900 mb-2">
                Drop files here
              </p>
              <p className="text-sm text-blue-600">
                Release to upload
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Drag & drop files here
              </p>
              <p className="text-sm text-gray-600 mb-4">
                or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Max {maxFiles} files, up to {formatFileSize(maxSize)} each
              </p>
            </>
          )}

          {/* CTA button (non-drag state) */}
          {!isDragActive && (
            <button
              className="
                mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-colors font-medium
              "
            >
              Select Files
            </button>
          )}
        </div>
      </div>

      {/* Upload queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Uploads ({uploadQueue.filter(i => i.status !== 'success').length})
          </h3>

          {uploadQueue.map(item => (
            <UploadQueueItem
              key={item.id}
              item={item}
              onRemove={() => removeFromQueue(item.id)}
            />
          ))}

          {/* Clear completed */}
          {uploadQueue.some(i => i.status === 'success') && (
            <button
              onClick={() => setUploadQueue(prev => prev.filter(i => i.status !== 'success'))}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Upload queue item component
function UploadQueueItem({ item, onRemove }: { item: UploadItem; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
      {/* Status icon */}
      <div className="flex-shrink-0">
        {item.status === 'success' && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
        {item.status === 'error' && (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
        {(item.status === 'pending' || item.status === 'uploading') && (
          <File className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* File info & progress */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.file.name}</p>

        {item.status === 'uploading' && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{item.progress}%</span>
          </div>
        )}

        {item.status === 'success' && (
          <p className="text-xs text-green-600">Upload complete</p>
        )}

        {item.status === 'error' && (
          <p className="text-xs text-red-600">Upload failed</p>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-gray-600"
        aria-label="Remove from queue"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}
```

### Compact Upload Button with Drag & Drop

```typescript
export function CompactUploadButton({ onUpload }: { onUpload: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    noClick: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg
        border-2 border-dashed cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="w-5 h-5" />
      <span className="font-medium">
        {isDragActive ? 'Drop here' : 'Upload'}
      </span>
    </div>
  );
}
```

---

## Implementation Time Breakdown

| Feature | Time | Priority |
|---------|------|----------|
| Mobile Responsive Design | 5-6 hours | High |
| Accessibility (WCAG 2.1 AA) | 4-5 hours | High |
| Loading States & Skeletons | 2-3 hours | Medium |
| Empty States with CTAs | 2-3 hours | Medium |
| Error Boundaries | 2-3 hours | High |
| Keyboard Shortcuts | 3-4 hours | Medium |
| Drag & Drop Upload Zone | 3-4 hours | High |

**Total**: 20-25 hours

---

## Testing Checklist

### Mobile Responsiveness
- ⬜ Test on iPhone (Safari)
- ⬜ Test on Android (Chrome)
- ⬜ Test on tablet (iPad)
- ⬜ Test landscape/portrait modes
- ⬜ Test touch targets (min 44x44px)
- ⬜ Test safe area insets (notched phones)

### Accessibility
- ⬜ Keyboard navigation works
- ⬜ Screen reader announces properly
- ⬜ Color contrast passes WCAG AA
- ⬜ Focus indicators visible
- ⬜ ARIA labels present
- ⬜ Alt text for all images

### Loading & Empty States
- ⬜ Skeletons show while loading
- ⬜ Empty state shows when no files
- ⬜ Progress indicators show during upload
- ⬜ Loading states accessible

### Error Handling
- ⬜ Error boundaries catch errors
- ⬜ User-friendly error messages
- ⬜ Recovery actions work
- ⬜ Errors logged to Sentry

### Keyboard Shortcuts
- ⬜ All shortcuts work
- ⬜ Shortcuts help dialog accessible
- ⬜ No conflicts with browser shortcuts
- ⬜ Shortcuts don't trigger in input fields

### Drag & Drop
- ⬜ Drag & drop works
- ⬜ File validation works
- ⬜ Progress tracking accurate
- ⬜ Error handling works
- ⬜ Works on mobile (alternative provided)

---

## Conclusion

These UI/UX enhancements transform your files tab from functional to **delightful**. Users will appreciate:

- **Mobile experience** that rivals native apps
- **Accessibility** for all users (WCAG 2.1 AA compliant)
- **Loading states** that reduce perceived wait time
- **Empty states** that guide users to action
- **Error boundaries** that gracefully handle failures
- **Keyboard shortcuts** for power users
- **Drag & drop** for effortless uploads

**Implementation Priority**:
1. Mobile responsiveness (5-6h) - CRITICAL
2. Error boundaries (2-3h) - CRITICAL
3. Drag & drop (3-4h) - HIGH
4. Accessibility (4-5h) - HIGH
5. Loading/empty states (4-6h) - MEDIUM
6. Keyboard shortcuts (3-4h) - NICE TO HAVE

**Total investment**: 20-25 hours for world-class UX
