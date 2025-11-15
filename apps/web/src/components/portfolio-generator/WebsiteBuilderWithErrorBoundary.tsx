/**
 * WebsiteBuilder wrapped with Error Boundary
 * Section 1.5: Wraps Website Builder component tree with error boundary
 */

'use client';

import React from 'react';
import { ErrorBoundary } from '../error/ErrorBoundary';
import WebsiteBuilder from './WebsiteBuilder';
import { trackError } from '../../utils/errorTracking';

/**
 * WebsiteBuilder wrapped with Error Boundary to catch render errors
 * Prevents entire app from crashing if website builder has an error
 */
export function WebsiteBuilderWithErrorBoundary(props: React.ComponentProps<typeof WebsiteBuilder>) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Track error with context
        trackError(error, {
          context: 'WebsiteBuilder',
          component: 'WebsiteBuilder',
          componentStack: errorInfo.componentStack,
          action: 'building portfolio website',
        });
      }}
    >
      <WebsiteBuilder {...props} />
    </ErrorBoundary>
  );
}

export default WebsiteBuilderWithErrorBoundary;
