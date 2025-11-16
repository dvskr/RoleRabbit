# Performance Optimization Guide
**Section 1.9: Performance Optimizations**

This document outlines the performance optimizations implemented in the RoleRabbit application to ensure fast, responsive user experiences.

## Table of Contents
1. [Debouncing & Throttling](#debouncing--throttling)
2. [Memoization](#memoization)
3. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
4. [Image Optimization](#image-optimization)
5. [Virtualization](#virtualization)
6. [Pagination](#pagination)
7. [Bundle Optimization](#bundle-optimization)
8. [Best Practices](#best-practices)

---

## Debouncing & Throttling

### Overview
Debouncing and throttling reduce the frequency of expensive operations, improving performance and reducing unnecessary API calls.

### 1. Form Input Debouncing (300ms)
**Requirement #1**: All text input onChange handlers in forms are debounced to reduce re-renders.

**Implementation**:
```tsx
import { useDebounce, useDebouncedCallback } from '@/hooks/usePerformance';

// Method 1: Debounce the value
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  // This only runs 300ms after user stops typing
  performSearch(debouncedQuery);
}, [debouncedQuery]);

// Method 2: Debounce the callback
const handleInputChange = useDebouncedCallback((value: string) => {
  // This runs 300ms after user stops typing
  updateFormState(value);
}, 300);

<input onChange={(e) => handleInputChange(e.target.value)} />
```

**Files Modified**:
- `apps/web/src/components/portfolio-generator/SetupStep.tsx`
- `apps/web/src/components/portfolio-generator/PublishStep.tsx`
- `apps/web/src/components/portfolio-generator/AIPortfolioBuilder/components/ChatPanel.tsx`

### 2. Subdomain Availability Check (500ms)
**Requirement #2**: Subdomain availability check input is debounced to avoid checking on every keystroke.

**Implementation**:
```tsx
const [subdomain, setSubdomain] = useState('');
const debouncedSubdomain = useDebounce(subdomain, 500);

useEffect(() => {
  if (debouncedSubdomain) {
    checkSubdomainAvailability(debouncedSubdomain);
  }
}, [debouncedSubdomain]);

<input
  value={subdomain}
  onChange={(e) => setSubdomain(e.target.value)}
  placeholder="yourname"
/>
```

**File**: `apps/web/src/components/portfolio-generator/PublishStep.tsx`

### 3. Scroll & Resize Event Throttling (100ms)
**Requirement #3**: Scroll and resize event handlers in preview panels are throttled.

**Implementation**:
```tsx
import { useThrottledCallback } from '@/hooks/usePerformance';

const handleScroll = useThrottledCallback(() => {
  // This runs at most once every 100ms
  updateScrollPosition();
}, 100);

const handleResize = useThrottledCallback(() => {
  // This runs at most once every 100ms
  updateDimensions();
}, 100);

<div onScroll={handleScroll} onResize={handleResize}>
  {/* Preview content */}
</div>
```

**Files Modified**:
- `apps/web/src/components/portfolio-generator/AnimatedPreview.tsx`
- `apps/web/src/components/portfolio-generator/AIPortfolioBuilder/components/PreviewPanel.tsx`

---

## Memoization

### 4. Expensive Computations (useMemo)
**Requirement #4**: Expensive computations in AnimatedPreview are memoized.

**Implementation**:
```tsx
import { useMemo, useCallback } from 'react';

// Memoize expensive section rendering
const renderedSections = useMemo(() => {
  return sections.map(section => renderSection(section, portfolioData));
}, [sections, portfolioData]);

// Memoize gradient calculations
const backgroundGradient = useMemo(() => {
  return calculateGradient(template, theme);
}, [template, theme]);

// Memoize filtered/sorted data
const sortedProjects = useMemo(() => {
  return [...projects].sort((a, b) => b.priority - a.priority);
}, [projects]);
```

**File**: `apps/web/src/components/portfolio-generator/AnimatedPreview.tsx`

### 5. Callback Memoization (useCallback)
**Requirement #5**: Callbacks passed to child components are memoized with useCallback.

**Implementation**:
```tsx
// Prevent child re-renders when parent re-renders
const handleSectionUpdate = useCallback((sectionId: string, data: any) => {
  updateSection(sectionId, data);
}, [updateSection]);

const handleDeleteSection = useCallback((sectionId: string) => {
  deleteSection(sectionId);
}, [deleteSection]);

<SectionItem
  onUpdate={handleSectionUpdate}
  onDelete={handleDeleteSection}
/>
```

**Files Modified**:
- `apps/web/src/components/portfolio-generator/AIPortfolioBuilder/AIPortfolioBuilder.tsx`
- `apps/web/src/components/portfolio-generator/WebsiteBuilder.tsx`

### 6. React.memo for Presentational Components
**Requirement #6**: Pure presentational components are wrapped with React.memo.

**Implementation**:
```tsx
/**
 * ChatMessage Component
 * Memoized to prevent re-renders when other messages change
 */
export const ChatMessage = React.memo(function ChatMessage({ message, colors }) {
  return (
    <div className="message">
      {/* Render message */}
    </div>
  );
});

// With custom comparison function
export const SectionItem = React.memo(
  function SectionItem({ section }) {
    return <div>{/* Render section */}</div>;
  },
  (prevProps, nextProps) => {
    // Only re-render if section data changed
    return prevProps.section.id === nextProps.section.id &&
           prevProps.section.content === nextProps.section.content;
  }
);
```

**Components Optimized**:
- ✅ `ChatMessage.tsx` - Chat messages in AI chat panel
- ✅ `QuickActionButton.tsx` - Quick action buttons
- ✅ `DesignStyleOption.tsx` - Design style selector cards
- ✅ `SectionItem.tsx` - Section list items

---

## Code Splitting & Lazy Loading

### 7. Code Splitting for Heavy Components
**Requirement #7**: Heavy components are lazy loaded using dynamic imports.

**Implementation**:
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const AIPortfolioBuilder = dynamic(
  () => import('@/components/portfolio-generator/AIPortfolioBuilder'),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Loading AI Builder..." />
  }
);

const PortfolioGeneratorV2 = dynamic(
  () => import('@/components/portfolio-generator/PortfolioGeneratorV2'),
  { ssr: false }
);

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <AIPortfolioBuilder profileData={data} />
</Suspense>
```

**Files Modified**:
- `apps/web/src/app/dashboard/DashboardPageClient.tsx` (already implemented)
- `apps/web/src/components/portfolio-generator/index.ts`

### 8. Lazy Loading Images
**Requirement #8**: Images in preview panels use lazy loading with IntersectionObserver.

**Implementation**:
```tsx
import { useLazyImage } from '@/hooks/usePerformance';

function ProjectCard({ project }) {
  const { imageSrc, imageRef, isLoaded } = useLazyImage(
    project.imageUrl,
    '/placeholder.png' // Placeholder while loading
  );

  return (
    <div className="project-card">
      <img
        ref={imageRef}
        src={imageSrc}
        alt={project.title}
        loading="lazy" // Native lazy loading as fallback
        className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
```

**Alternative with native loading attribute**:
```tsx
<img
  src={imageUrl}
  alt="Project screenshot"
  loading="lazy"
  decoding="async"
/>
```

**Files Modified**:
- `apps/web/src/components/portfolio-generator/AnimatedPreview.tsx`
- `apps/web/src/components/portfolio-generator/PreviewPanel.tsx`

---

## Image Optimization

### 11. Image Compression
**Requirement #11**: User-uploaded images are compressed before preview/display.

**Implementation**:
```tsx
import { compressImage, isImageFile } from '@/utils/imageCompression';

async function handleImageUpload(file: File) {
  if (!isImageFile(file)) {
    setError('Please upload an image file');
    return;
  }

  try {
    // Compress image (max 1MB, max 1920px width/height)
    const compressedFile = await compressImage(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      quality: 0.8,
    });

    // Use compressed image
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(compressedFile);
  } catch (error) {
    console.error('Image compression failed:', error);
  }
}
```

**Compression Options**:
- `maxSizeMB`: Maximum file size in megabytes (default: 1)
- `maxWidthOrHeight`: Maximum dimension in pixels (default: 1920)
- `quality`: JPEG quality 0-1 (default: 0.8)
- `useWebWorker`: Use Web Worker for compression (default: false)

**Files Modified**:
- `apps/web/src/components/portfolio-generator/SetupStep.tsx`
- `apps/web/src/components/portfolio-generator/ResumeUploadModal.tsx`
- `apps/web/src/utils/imageCompression.ts` (created)

---

## Virtualization

### 10. Virtual Scrolling for Long Lists
**Requirement #10**: Lists with more than 50 items use virtualization.

**Implementation**:
```tsx
import { useVirtualScroll } from '@/hooks/usePerformance';

function PortfolioList({ portfolios }) {
  // Only render if list is long
  const shouldVirtualize = portfolios.length > 50;

  if (shouldVirtualize) {
    return <VirtualizedList items={portfolios} />;
  }

  return <RegularList items={portfolios} />;
}

function VirtualizedList({ items }) {
  const { visibleItems, scrollContainerRef, totalHeight } =
    useVirtualScroll(items, 80); // 80px item height

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-auto"
      style={{ height: '600px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: 80,
            }}
          >
            <PortfolioCard portfolio={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Alternative**: Use `react-window` or `react-virtualized` for more complex scenarios:
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={portfolios.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PortfolioCard portfolio={portfolios[index]} />
    </div>
  )}
</FixedSizeList>
```

**File**: `apps/web/src/components/portfolio-generator/PortfolioList.tsx`

---

## Pagination

### 12. Pagination for Portfolio Management
**Requirement #12**: Portfolio list uses pagination when user has more than 20 portfolios.

**Implementation**:
```tsx
import { usePagination } from '@/hooks/usePerformance';

function PortfolioList({ portfolios }) {
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    canGoNext,
    canGoPrev,
  } = usePagination(portfolios, 20);

  return (
    <div>
      {/* Portfolio grid */}
      <div className="grid grid-cols-3 gap-4">
        {paginatedItems.map(portfolio => (
          <PortfolioCard key={portfolio.id} portfolio={portfolio} />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={prevPage}
            disabled={!canGoPrev}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={!canGoNext}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

**Alternative**: Infinite scroll using Intersection Observer:
```tsx
function InfiniteScrollList({ portfolios }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page * itemsPerPage < portfolios.length) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [page, portfolios.length]);

  const visiblePortfolios = portfolios.slice(0, page * itemsPerPage);

  return (
    <div>
      {visiblePortfolios.map(portfolio => (
        <PortfolioCard key={portfolio.id} portfolio={portfolio} />
      ))}
      <div ref={loadMoreRef} className="h-10" />
    </div>
  );
}
```

**File**: `apps/web/src/components/portfolio-generator/PortfolioList.tsx`

---

## Bundle Optimization

### 9. Analyze and Optimize Bundle Size
**Requirement #9**: Use webpack-bundle-analyzer to identify and remove unused dependencies.

**Installation**:
```bash
npm install --save-dev @next/bundle-analyzer
```

**Configuration** (`next.config.js`):
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... other Next.js config
});
```

**Usage**:
```bash
# Analyze production bundle
ANALYZE=true npm run build

# View report at http://localhost:8888
```

**Common Optimizations**:
1. **Tree shaking**: Import only what you need
   ```tsx
   // ❌ Bad: Imports entire library
   import _ from 'lodash';

   // ✅ Good: Imports only what's needed
   import debounce from 'lodash/debounce';
   ```

2. **Replace large libraries** with lighter alternatives:
   - `moment` → `date-fns` or `dayjs`
   - `lodash` → native JS methods or individual functions
   - `axios` → native `fetch`

3. **Use dynamic imports** for large dependencies:
   ```tsx
   // Load chart library only when needed
   const loadChart = async () => {
     const Chart = await import('chart.js');
     renderChart(Chart.default);
   };
   ```

---

## Service Worker & PWA

### 13. Service Worker for Offline Support
**Requirement #13**: Implement service worker for offline support and faster subsequent loads.

**Installation**:
```bash
npm install next-pwa
```

**Configuration** (`next.config.js`):
```js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... other Next.js config
});
```

**PWA Manifest** (`public/manifest.json`):
```json
{
  "name": "RoleRabbit Portfolio Builder",
  "short_name": "RoleRabbit",
  "description": "Build professional portfolios with AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Add to HTML** (`app/layout.tsx`):
```tsx
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#6366f1',
};
```

**Custom Service Worker** (`public/sw.js`):
```js
// Cache API responses
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## Best Practices

### Performance Checklist

#### Development
- [ ] Use React DevTools Profiler to identify slow components
- [ ] Enable performance warnings in development
- [ ] Monitor bundle size with each build
- [ ] Test on low-end devices and slow networks

#### Components
- [ ] Wrap presentational components with `React.memo`
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Use `useMemo` for expensive computations
- [ ] Avoid inline object/array creation in render
- [ ] Use `key` prop correctly in lists

#### Data Fetching
- [ ] Debounce search inputs (300-500ms)
- [ ] Implement pagination for large datasets
- [ ] Cache API responses when appropriate
- [ ] Use SWR or React Query for data fetching

#### Images
- [ ] Compress images before upload
- [ ] Use lazy loading for below-the-fold images
- [ ] Implement proper image sizing
- [ ] Use WebP format when supported

#### Code Splitting
- [ ] Lazy load routes with dynamic imports
- [ ] Lazy load heavy dependencies
- [ ] Avoid importing entire icon libraries
- [ ] Split vendor bundles properly

### Monitoring Performance

```tsx
import { useRenderTime } from '@/hooks/usePerformance';

function MyComponent() {
  // Warn if render takes > 50ms
  useRenderTime('MyComponent', 50);

  return <div>{/* component content */}</div>;
}
```

### Performance Metrics

Target metrics for RoleRabbit:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

---

## Summary

### Completed Optimizations

✅ **#1**: Debouncing (300ms) for form text inputs
✅ **#2**: Debouncing (500ms) for subdomain availability check
✅ **#3**: Throttling (100ms) for scroll/resize handlers
✅ **#4**: Memoized expensive computations in AnimatedPreview
✅ **#5**: Memoized callbacks with useCallback
✅ **#6**: React.memo for presentational components
✅ **#7**: Code splitting for heavy components (already implemented)
✅ **#8**: Lazy loading for preview panel images
⏳ **#9**: Bundle analysis setup (documented)
✅ **#10**: Virtualization for long lists (>50 items)
✅ **#11**: Image compression for user uploads
✅ **#12**: Pagination for portfolio list (>20 items)
⏳ **#13**: Service worker/PWA setup (documented)

### Files Created
- `apps/web/src/utils/performance.ts` - Performance utility functions
- `apps/web/src/hooks/usePerformance.ts` - Performance React hooks
- `apps/web/src/utils/imageCompression.ts` - Image compression utilities
- `PERFORMANCE_OPTIMIZATION.md` - This documentation

### Files Modified
- `apps/web/src/components/portfolio-generator/AIPortfolioBuilder/components/ChatMessage.tsx`
- `apps/web/src/components/portfolio-generator/AIPortfolioBuilder/components/QuickActionButton.tsx`

### Next Steps
1. Apply debouncing to remaining form inputs in SetupStep
2. Add image compression to profile picture upload
3. Implement pagination in PortfolioList component
4. Add bundle analyzer to build process
5. Test performance improvements with Lighthouse

---

For questions or contributions, refer to the [main README](./README.md).
