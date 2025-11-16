/**
 * Portfolio List Container
 * Fetches portfolios from API and renders PortfolioList
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioList } from './PortfolioList';
import type { Portfolio } from './PortfolioCard';
import { useRouter } from 'next/navigation';

interface ApiPortfolio {
  id: string;
  userId: string;
  title: string;
  slug: string;
  content: any;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SUSPENDED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  viewCount: number;
  shareCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: string;
    name: string;
    thumbnail: string | null;
  };
  _count?: {
    versions: number;
    shares: number;
  };
}

// Map API portfolio to component portfolio
function mapApiPortfolioToComponent(apiPortfolio: ApiPortfolio): Portfolio {
  return {
    id: apiPortfolio.id,
    name: apiPortfolio.title,
    status: apiPortfolio.status === 'PUBLISHED' ? 'published' : 'draft',
    lastUpdated: apiPortfolio.updatedAt,
    viewCount: apiPortfolio.viewCount,
    previewUrl: `/portfolios/${apiPortfolio.slug}`,
    thumbnail: apiPortfolio.template?.thumbnail || null,
  };
}

export function PortfolioListContainer() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolios from API
  const fetchPortfolios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/portfolios');
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolios: ${response.statusText}`);
      }

      const data = await response.json();
      const apiPortfolios: ApiPortfolio[] = data.data || [];
      
      setPortfolios(apiPortfolios.map(mapApiPortfolioToComponent));
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Handlers
  const handleEdit = useCallback((id: string) => {
    router.push(`/portfolios/${id}/edit`);
  }, [router]);

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate portfolio');
      }

      const duplicated = await response.json();
      
      // Refresh the list
      await fetchPortfolios();
      
      // Navigate to edit the duplicated portfolio
      router.push(`/portfolios/${duplicated.id}/edit`);
    } catch (err) {
      console.error('Error duplicating portfolio:', err);
      alert('Failed to duplicate portfolio. Please try again.');
    }
  }, [router, fetchPortfolios]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete portfolio');
      }

      // Remove from local state
      setPortfolios(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      throw err; // Re-throw so the modal can handle it
    }
  }, []);

  const handleViewLive = useCallback((id: string) => {
    const portfolio = portfolios.find(p => p.id === id);
    if (portfolio && portfolio.previewUrl) {
      window.open(portfolio.previewUrl, '_blank');
    }
  }, [portfolios]);

  const handleCreateNew = useCallback(() => {
    router.push('/portfolios/new');
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Portfolios
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchPortfolios}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render portfolio list
  return (
    <PortfolioList
      portfolios={portfolios}
      onEdit={handleEdit}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onViewLive={handleViewLive}
      onCreateNew={handleCreateNew}
    />
  );
}

