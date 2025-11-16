/**
 * AIPortfolioBuilder wrapped with Error Boundary
 * Section 1.5: Wraps AI Portfolio Builder component tree with error boundary
 */

'use client';

import React from 'react';
import { ErrorBoundary } from '../error/ErrorBoundary';
import AIPortfolioBuilder from './AIPortfolioBuilder';
import type { AIPortfolioBuilderProps } from './AIPortfolioBuilder/types/aiPortfolioBuilder';
import { trackError } from '../../utils/errorTracking';

/**
 * AIPortfolioBuilder wrapped with Error Boundary to catch render errors
 * Prevents entire app from crashing if portfolio builder has an error
 */
export function AIPortfolioBuilderWithErrorBoundary(props: AIPortfolioBuilderProps) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Track error with context
        trackError(error, {
          context: 'AIPortfolioBuilder',
          component: 'AIPortfolioBuilder',
          componentStack: errorInfo.componentStack,
          action: 'rendering portfolio builder',
        });
      }}
    >
      <AIPortfolioBuilder {...props} />
    </ErrorBoundary>
  );
}

export default AIPortfolioBuilderWithErrorBoundary;
