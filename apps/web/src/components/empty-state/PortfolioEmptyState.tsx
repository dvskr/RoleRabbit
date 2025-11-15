/**
 * Portfolio-specific Empty States
 * Section 1.7: Empty states for portfolio-related scenarios
 */

'use client';

import React from 'react';
import { FolderOpen, PlusCircle, LayoutTemplate, RefreshCw, BarChart3 } from 'lucide-react';
import { EmptyState } from './EmptyState';

/**
 * Empty state for portfolio list (Section 1.7 requirement #1)
 * Shows when user has no portfolios
 */
export function NoPortfoliosEmptyState({
  onCreatePortfolio,
}: {
  onCreatePortfolio?: () => void;
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      iconColor="text-purple-400"
      iconBgColor="bg-purple-100"
      title="You haven't created any portfolios yet"
      description="Create your first portfolio to showcase your work and skills to potential employers."
      action={
        onCreatePortfolio
          ? {
              label: 'Create Your First Portfolio',
              onClick: onCreatePortfolio,
              icon: PlusCircle,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty state for template selection (Section 1.7 requirement #2)
 * Shows when templates fail to load
 */
export function TemplateLoadErrorEmptyState({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={LayoutTemplate}
      iconColor="text-red-400"
      iconBgColor="bg-red-100"
      title="Unable to load templates"
      description="We couldn't load the portfolio templates. Please check your connection and try again."
      action={
        onRetry
          ? {
              label: 'Retry',
              onClick: onRetry,
              icon: RefreshCw,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty state for no templates available
 * Shows when template list is empty (but loaded successfully)
 */
export function NoTemplatesEmptyState() {
  return (
    <EmptyState
      icon={LayoutTemplate}
      iconColor="text-gray-400"
      iconBgColor="bg-gray-100"
      title="No templates available"
      description="Portfolio templates are currently being updated. Please check back soon."
    />
  );
}

/**
 * Empty state for analytics dashboard (Section 1.7 requirement #3)
 * Shows when user has no analytics data
 */
export function NoAnalyticsEmptyState({
  onPublishPortfolio,
}: {
  onPublishPortfolio?: () => void;
}) {
  return (
    <EmptyState
      icon={BarChart3}
      iconColor="text-blue-400"
      iconBgColor="bg-blue-100"
      title="No analytics data yet"
      description="Publish your portfolio to start tracking views, visitors, and engagement metrics."
      action={
        onPublishPortfolio
          ? {
              label: 'Publish Portfolio',
              onClick: onPublishPortfolio,
            }
          : undefined
      }
    />
  );
}

/**
 * Empty state for analytics (portfolio published but no views yet)
 */
export function NoViewsYetEmptyState() {
  return (
    <EmptyState
      icon={BarChart3}
      iconColor="text-blue-400"
      iconBgColor="bg-blue-100"
      title="No views yet"
      description="Your portfolio is live! Share it with others to start seeing analytics data."
    />
  );
}

export default NoPortfoliosEmptyState;
