/**
 * Dynamic Import Utilities for Code Splitting
 * Reduces initial bundle size by lazy-loading components
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Loading component for dynamic imports
 */
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * Loading skeleton for template cards
 */
export const TemplateCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

/**
 * Lazy-loaded Templates Component
 */
export const TemplatesLazy = dynamic(() => import('../components/templates/Templates'), {
  loading: () => <LoadingSpinner />,
  ssr: true, // Enable SSR for better SEO
});

/**
 * Lazy-loaded Template Preview Modal
 */
export const TemplatePreviewModalLazy = dynamic(
  () => import('../components/templates/components/TemplatePreviewModal'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Modals don't need SSR
  }
);

/**
 * Lazy-loaded Filter Sidebar
 */
export const FilterSidebarLazy = dynamic(
  () => import('../components/templates/components/FilterSidebar'),
  {
    loading: () => <div className="w-64 h-screen bg-gray-100 dark:bg-gray-900 animate-pulse"></div>,
    ssr: true,
  }
);

/**
 * Lazy-loaded Template Card
 */
export const TemplateCardLazy = dynamic(
  () => import('../components/templates/components/TemplateCard'),
  {
    loading: () => <TemplateCardSkeleton />,
    ssr: true,
  }
);

/**
 * Lazy-loaded Charts (for analytics dashboard)
 */
export const ChartComponentLazy = dynamic(() => import('react-chartjs-2'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Charts don't need SSR
});

/**
 * Lazy-loaded PDF Viewer
 */
export const PDFViewerLazy = dynamic(() => import('../components/PDFViewer'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

/**
 * Lazy-loaded Rich Text Editor
 */
export const RichTextEditorLazy = dynamic(() => import('../components/RichTextEditor'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

/**
 * Lazy-loaded Code Editor
 */
export const CodeEditorLazy = dynamic(() => import('../components/CodeEditor'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

/**
 * Dynamic import with error boundary
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName: string,
  retries = 3,
  interval = 1000
): ReturnType<typeof dynamic> {
  return dynamic(() => retry(componentImport, retries, interval), {
    loading: () => <LoadingSpinner />,
  });
}

/**
 * Retry mechanism for failed dynamic imports
 */
async function retry<T>(
  fn: () => Promise<T>,
  retriesLeft = 3,
  interval = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft === 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
    return retry(fn, retriesLeft - 1, interval);
  }
}

/**
 * Preload component for better UX
 */
export function preloadComponent<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): void {
  // Preload on user interaction or route change
  componentImport().catch(() => {
    // Silently fail preload
  });
}

/**
 * Route-based code splitting configuration
 */
export const RouteComponents = {
  templates: {
    list: TemplatesLazy,
    preview: TemplatePreviewModalLazy,
    filters: FilterSidebarLazy,
  },
  dashboard: lazyWithRetry(
    () => import('../components/Dashboard'),
    'Dashboard'
  ),
  profile: lazyWithRetry(
    () => import('../components/Profile'),
    'Profile'
  ),
  settings: lazyWithRetry(
    () => import('../components/Settings'),
    'Settings'
  ),
};

/**
 * Feature-based code splitting
 */
export const FeatureComponents = {
  analytics: lazyWithRetry(
    () => import('../features/Analytics'),
    'Analytics'
  ),
  collaboration: lazyWithRetry(
    () => import('../features/Collaboration'),
    'Collaboration'
  ),
  export: lazyWithRetry(
    () => import('../features/Export'),
    'Export'
  ),
};

export default {
  TemplatesLazy,
  TemplatePreviewModalLazy,
  FilterSidebarLazy,
  TemplateCardLazy,
  ChartComponentLazy,
  PDFViewerLazy,
  RichTextEditorLazy,
  CodeEditorLazy,
  lazyWithRetry,
  preloadComponent,
  RouteComponents,
  FeatureComponents,
};
