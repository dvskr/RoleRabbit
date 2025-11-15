/**
 * Portfolio List Component
 * Example implementation showing error handling with retry (Section 1.5)
 * Now with skeleton loading (Section 1.6 requirement #3)
 * Now with enhanced empty state (Section 1.7 requirement #1)
 * Demonstrates:
 * - Skeleton loading placeholders instead of blank screen
 * - Error states with retry button
 * - Empty state with CTA button
 * - Success states
 */

'use client';

import React, { useEffect } from 'react';
import { useFetchState } from '../error/FetchErrorState';
import { SkeletonPortfolioList } from '../loading/Skeleton';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { NoPortfoliosEmptyState } from '../empty-state';
import { portfolioApi } from '../../lib/api/portfolioApi';
import { Portfolio } from '../../types/portfolio';
import { Folder, Calendar, Eye } from 'lucide-react';

export function PortfolioList() {
  const {
    isLoading,
    isError,
    error,
    data,
    execute,
    retry,
    isEmpty,
  } = useFetchState<Portfolio[]>();

  // Fetch portfolios on mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const response = await execute(() =>
        portfolioApi.getAll().then((res) => res.portfolios)
      );
      console.log('Portfolios loaded:', response);
    } catch (err) {
      console.error('Failed to load portfolios:', err);
    }
  };

  const handleRetry = () => {
    retry(loadPortfolios);
  };

  const handleCreatePortfolio = () => {
    // Navigate to portfolio creation (would be implemented with router)
    console.log('Navigate to create portfolio');
    // In a real app: router.push('/portfolios/create');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Portfolios</h2>

      {/* Skeleton loading (Section 1.6 requirement #3) */}
      {isLoading && <SkeletonPortfolioList count={6} />}

      {/* Error state */}
      {isError && error && (
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          context={{ action: 'load portfolios' }}
        />
      )}

      {/* Empty state with CTA (Section 1.7 requirement #1) */}
      {!isLoading && !isError && isEmpty && (
        <NoPortfoliosEmptyState onCreatePortfolio={handleCreatePortfolio} />
      )}

      {/* Success state - render portfolio list */}
      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual portfolio card
 */
function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Folder className="text-blue-600" size={24} />
        </div>
        {portfolio.isPublished && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
            Published
          </span>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 text-lg mb-2">{portfolio.name}</h3>
      {portfolio.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{portfolio.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>
            {new Date(portfolio.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Eye size={14} />
          <span>{portfolio.viewCount} views</span>
        </div>
      </div>
    </div>
  );
}

export default PortfolioList;
