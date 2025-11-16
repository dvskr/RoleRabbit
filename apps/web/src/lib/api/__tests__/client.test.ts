/**
 * Frontend Unit Tests: API Client (Section 5.1)
 *
 * Tests for API client functions
 */

import { apiClient } from '../client';
import { mockFetchResponse, mockFetchError } from '@/../test/utils/test-helpers';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPortfolios', () => {
    it('should fetch portfolios successfully', async () => {
      const mockData = {
        portfolios: [
          { id: '1', title: 'Portfolio 1' },
          { id: '2', title: 'Portfolio 2' },
        ],
      };

      mockFetchResponse(mockData);

      const result = await apiClient.getPortfolios();

      expect(global.fetch).toHaveBeenCalledWith('/api/portfolios', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockData);
    });

    it('should handle fetch errors', async () => {
      mockFetchError('Failed to fetch portfolios', 500);

      await expect(apiClient.getPortfolios()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getPortfolios()).rejects.toThrow('Network error');
    });
  });

  describe('getPortfolio', () => {
    it('should fetch single portfolio by ID', async () => {
      const mockData = { portfolio: { id: '1', title: 'Test Portfolio' } };

      mockFetchResponse(mockData);

      const result = await apiClient.getPortfolio('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/portfolios/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockData);
    });

    it('should handle 404 errors', async () => {
      mockFetchError('Portfolio not found', 404);

      await expect(apiClient.getPortfolio('nonexistent')).rejects.toThrow();
    });
  });

  describe('createPortfolio', () => {
    it('should create portfolio with correct request format', async () => {
      const portfolioData = {
        title: 'New Portfolio',
        templateId: 'template-1',
        subtitle: 'My Portfolio',
      };

      const mockResponse = {
        portfolio: { id: 'new-id', ...portfolioData },
      };

      mockFetchResponse(mockResponse, 201);

      const result = await apiClient.createPortfolio(portfolioData);

      expect(global.fetch).toHaveBeenCalledWith('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      mockFetchError('Invalid portfolio data', 400);

      await expect(
        apiClient.createPortfolio({ title: '', templateId: '' })
      ).rejects.toThrow();
    });
  });

  describe('updatePortfolio', () => {
    it('should update portfolio with correct request format', async () => {
      const updates = { title: 'Updated Title' };
      const mockResponse = {
        portfolio: { id: '1', title: 'Updated Title' },
      };

      mockFetchResponse(mockResponse);

      const result = await apiClient.updatePortfolio('1', updates);

      expect(global.fetch).toHaveBeenCalledWith('/api/portfolios/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle authorization errors', async () => {
      mockFetchError('Unauthorized', 403);

      await expect(
        apiClient.updatePortfolio('1', { title: 'New' })
      ).rejects.toThrow();
    });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio successfully', async () => {
      mockFetchResponse({ success: true });

      await apiClient.deletePortfolio('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/portfolios/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle errors during deletion', async () => {
      mockFetchError('Failed to delete', 500);

      await expect(apiClient.deletePortfolio('1')).rejects.toThrow();
    });
  });

  describe('response parsing', () => {
    it('should parse JSON responses correctly', async () => {
      const mockData = { key: 'value', nested: { data: 123 } };
      mockFetchResponse(mockData);

      const result = await apiClient.getPortfolios();

      expect(result).toEqual(mockData);
    });

    it('should handle empty responses', async () => {
      mockFetchResponse(null, 204);

      const result = await apiClient.deletePortfolio('1');

      expect(result).toBeNull();
    });

    it('should handle malformed JSON', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiClient.getPortfolios()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('error handling', () => {
    it('should extract error message from response', async () => {
      mockFetchError('Custom error message', 400);

      await expect(apiClient.getPortfolios()).rejects.toThrow();
    });

    it('should handle network timeouts', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 100)
          )
      );

      await expect(apiClient.getPortfolios()).rejects.toThrow('Timeout');
    });
  });
});
