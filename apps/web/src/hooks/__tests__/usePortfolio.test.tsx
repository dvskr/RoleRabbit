/**
 * Frontend Unit Tests: usePortfolio Hook (Section 5.1)
 *
 * Tests for custom hook managing portfolio state
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePortfolio } from '../usePortfolio';
import { mockFetchResponse, mockFetchError } from '@/../test/utils/test-helpers';

describe('usePortfolio Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('state management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePortfolio('test-id'));

      expect(result.current.portfolio).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should update loading state during fetch', async () => {
      mockFetchResponse({
        portfolio: { id: 'test-id', title: 'Test' },
      });

      const { result } = renderHook(() => usePortfolio('test-id'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set portfolio data on successful fetch', async () => {
      const mockPortfolio = {
        id: 'test-id',
        title: 'Test Portfolio',
        userId: 'user-1',
      };

      mockFetchResponse({ portfolio: mockPortfolio });

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.portfolio).toEqual(mockPortfolio);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should set error state on fetch failure', async () => {
      mockFetchError('Failed to fetch portfolio', 500);

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.portfolio).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('API call triggers', () => {
    it('should fetch portfolio on mount', async () => {
      mockFetchResponse({
        portfolio: { id: 'test-id', title: 'Test' },
      });

      renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/portfolios/test-id',
          expect.any(Object)
        );
      });
    });

    it('should refetch when ID changes', async () => {
      mockFetchResponse({ portfolio: { id: 'id-1' } });

      const { rerender } = renderHook(
        ({ id }) => usePortfolio(id),
        { initialProps: { id: 'id-1' } }
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      mockFetchResponse({ portfolio: { id: 'id-2' } });

      rerender({ id: 'id-2' });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenLastCalledWith(
          '/api/portfolios/id-2',
          expect.any(Object)
        );
      });
    });

    it('should not refetch when ID is the same', async () => {
      mockFetchResponse({ portfolio: { id: 'test-id' } });

      const { rerender } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      rerender();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should support manual refetch', async () => {
      mockFetchResponse({ portfolio: { id: 'test-id' } });

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      mockFetchResponse({ portfolio: { id: 'test-id', title: 'Updated' } });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(result.current.portfolio?.title).toBe('Updated');
      });
    });
  });

  describe('error states', () => {
    it('should handle 404 errors', async () => {
      mockFetchError('Portfolio not found', 404);

      const { result } = renderHook(() => usePortfolio('nonexistent'));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toContain('not found');
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toContain('Network error');
      });
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 100)
          )
      );

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should allow error recovery', async () => {
      mockFetchError('Server error', 500);

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      mockFetchResponse({ portfolio: { id: 'test-id' } });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.portfolio).toBeTruthy();
      });
    });
  });

  describe('update operations', () => {
    it('should update portfolio optimistically', async () => {
      mockFetchResponse({
        portfolio: { id: 'test-id', title: 'Original' },
      });

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.portfolio?.title).toBe('Original');
      });

      mockFetchResponse({
        portfolio: { id: 'test-id', title: 'Updated' },
      });

      act(() => {
        result.current.update({ title: 'Updated' });
      });

      // Should update immediately (optimistic)
      expect(result.current.portfolio?.title).toBe('Updated');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/portfolios/test-id',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ title: 'Updated' }),
          })
        );
      });
    });

    it('should rollback on update failure', async () => {
      mockFetchResponse({
        portfolio: { id: 'test-id', title: 'Original' },
      });

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.portfolio?.title).toBe('Original');
      });

      mockFetchError('Update failed', 500);

      await act(async () => {
        try {
          await result.current.update({ title: 'Updated' });
        } catch (e) {
          // Expected error
        }
      });

      await waitFor(() => {
        // Should rollback to original
        expect(result.current.portfolio?.title).toBe('Original');
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('delete operations', () => {
    it('should delete portfolio', async () => {
      mockFetchResponse({
        portfolio: { id: 'test-id', title: 'Test' },
      });

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.portfolio).toBeTruthy();
      });

      mockFetchResponse({ success: true });

      await act(async () => {
        await result.current.delete();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/portfolios/test-id',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should handle delete errors', async () => {
      mockFetchResponse({
        portfolio: { id: 'test-id', title: 'Test' },
      });

      const { result } = renderHook(() => usePortfolio('test-id'));

      await waitFor(() => {
        expect(result.current.portfolio).toBeTruthy();
      });

      mockFetchError('Delete failed', 500);

      await act(async () => {
        try {
          await result.current.delete();
        } catch (e) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.portfolio).toBeTruthy(); // Should still exist
      });
    });
  });
});
