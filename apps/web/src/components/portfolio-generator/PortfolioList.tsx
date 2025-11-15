/**
 * Portfolio List Component
 * Example implementation showing error handling with retry (Section 1.5)
 * Demonstrates:
 * - Loading states
 * - Error states with retry button
 * - Empty states
 * - Success states
 */

'use client';

import React, { useEffect, useState } from 'react';
import { FetchErrorState, useFetchState } from '../error/FetchErrorState';
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Portfolios</h2>

      {/* Fetch error state handles loading, error, and empty states */}
      <FetchErrorState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={isEmpty}
        onRetry={handleRetry}
        loadingMessage="Loading your portfolios..."
        emptyMessage="No portfolios yet"
        emptyDescription="Create your first portfolio to get started!"
      >
        {/* Success state - render portfolio list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      </FetchErrorState>
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
