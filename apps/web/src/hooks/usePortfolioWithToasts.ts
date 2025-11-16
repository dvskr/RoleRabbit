/**
 * Portfolio Operations Hook with Toast Notifications
 * Section 1.5: Adds toast notifications for all portfolio CRUD operations
 * - Success: "Portfolio created", "Portfolio updated", "Portfolio published", "Portfolio deleted"
 * - Error: "Failed to save portfolio: [error]"
 */

'use client';

import { useState } from 'react';
import { portfolioApi } from '../lib/api/portfolioApi';
import { toast, portfolioToasts } from '../utils/toast';
import { getUserFriendlyError } from '../utils/errorMessages';
import { trackApiError } from '../utils/errorTracking';
import type {
  Portfolio,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  PortfolioListResponse,
} from '../types/portfolio';

/**
 * Hook for portfolio operations with automatic toast notifications
 * All CRUD operations show success/error toasts
 */
export function usePortfolioWithToasts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create portfolio with toast notifications
   */
  const createPortfolio = async (data: CreatePortfolioRequest): Promise<Portfolio | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.create(data);

      // Success toast (Section 1.5 requirement)
      portfolioToasts.created();

      return response.portfolio;
    } catch (err: any) {
      setError(err);

      // Error toast with specific details (Section 1.5 requirement)
      const friendlyError = getUserFriendlyError(err);
      toast.error('Failed to create portfolio', friendlyError.message);

      // Track error
      trackApiError(err, '/api/portfolios', 'POST', err.statusCode, {
        action: 'create portfolio',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update portfolio with toast notifications
   */
  const updatePortfolio = async (id: string, data: UpdatePortfolioRequest): Promise<Portfolio | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.update(id, data);

      // Success toast (Section 1.5 requirement)
      portfolioToasts.updated();

      return response.portfolio;
    } catch (err: any) {
      setError(err);

      // Error toast with specific details (Section 1.5 requirement)
      const friendlyError = getUserFriendlyError(err);
      toast.error('Failed to update portfolio', friendlyError.message);

      // Track error
      trackApiError(err, `/api/portfolios/${id}`, 'PUT', err.statusCode, {
        action: 'update portfolio',
        portfolioId: id,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Publish portfolio with toast notifications
   */
  const publishPortfolio = async (id: string): Promise<Portfolio | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.publish(id);

      // Success toast (Section 1.5 requirement)
      portfolioToasts.published();

      return response.portfolio;
    } catch (err: any) {
      setError(err);

      // Error toast with specific details (Section 1.5 requirement)
      const friendlyError = getUserFriendlyError(err);
      toast.error('Failed to publish portfolio', friendlyError.message);

      // Track error
      trackApiError(err, `/api/portfolios/${id}/publish`, 'POST', err.statusCode, {
        action: 'publish portfolio',
        portfolioId: id,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unpublish portfolio with toast notifications
   */
  const unpublishPortfolio = async (id: string): Promise<Portfolio | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.unpublish(id);

      // Success toast (Section 1.5 requirement)
      portfolioToasts.unpublished();

      return response.portfolio;
    } catch (err: any) {
      setError(err);

      // Error toast with specific details
      const friendlyError = getUserFriendlyError(err);
      toast.error('Failed to unpublish portfolio', friendlyError.message);

      // Track error
      trackApiError(err, `/api/portfolios/${id}/unpublish`, 'POST', err.statusCode, {
        action: 'unpublish portfolio',
        portfolioId: id,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete portfolio with toast notifications
   */
  const deletePortfolio = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await portfolioApi.delete(id);

      // Success toast (Section 1.5 requirement)
      portfolioToasts.deleted();

      return true;
    } catch (err: any) {
      setError(err);

      // Error toast with specific details (Section 1.5 requirement)
      const friendlyError = getUserFriendlyError(err);
      toast.error('Failed to delete portfolio', friendlyError.message);

      // Track error
      trackApiError(err, `/api/portfolios/${id}`, 'DELETE', err.statusCode, {
        action: 'delete portfolio',
        portfolioId: id,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get all portfolios (no toast on success, toast on error)
   */
  const getPortfolios = async (params?: Parameters<typeof portfolioApi.getAll>[0]): Promise<PortfolioListResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.getAll(params);
      return response;
    } catch (err: any) {
      setError(err);

      // Error toast
      const friendlyError = getUserFriendlyError(err);
      toast.error('Failed to load portfolios', friendlyError.message);

      // Track error
      trackApiError(err, '/api/portfolios', 'GET', err.statusCode, {
        action: 'load portfolios',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get single portfolio (no toast on success, toast on error)
   */
  const getPortfolio = async (id: string): Promise<Portfolio | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.getById(id);
      return response.portfolio;
    } catch (err: any) {
      setError(err);

      // Error toast
      const friendlyError = getUserFriendlyError(err);
      toast.error('Failed to load portfolio', friendlyError.message);

      // Track error
      trackApiError(err, `/api/portfolios/${id}`, 'GET', err.statusCode, {
        action: 'load portfolio',
        portfolioId: id,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
    unpublishPortfolio,
    deletePortfolio,
    getPortfolios,
    getPortfolio,
  };
}

export default usePortfolioWithToasts;
