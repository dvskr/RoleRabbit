/**
 * useABTesting Hook
 * A/B testing management for admin users
 */

import { useState, useCallback, useEffect } from 'react';

// Test variant
export interface TestVariant {
  id: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  traffic: number; // Percentage (0-100)
}

// Test status
export type TestStatus = 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';

// Test metrics
export interface TestMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
}

// A/B Test
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: TestStatus;
  variants: TestVariant[];
  startDate?: string;
  endDate?: string;
  targetAudience?: {
    percentage: number;
    segments?: string[];
  };
  metrics: Record<string, TestMetrics>; // Keyed by variant ID
  winner?: string; // Variant ID
  createdAt: string;
  createdBy: string;
}

// Test results
export interface TestResults {
  test: ABTest;
  analysis: {
    sampleSize: number;
    confidence: number; // 0-100
    significantDifference: boolean;
    recommendedWinner?: string;
    insights: string[];
  };
  variantComparison: Array<{
    variantId: string;
    variantName: string;
    metrics: TestMetrics;
    performance: number; // 0-100 score
    isWinner: boolean;
  }>;
}

// Hook options
export interface UseABTestingOptions {
  autoFetch?: boolean;
}

/**
 * Hook for A/B testing management
 */
export function useABTesting(options?: UseABTestingOptions) {
  const { autoFetch = true } = options || {};

  const [tests, setTests] = useState<ABTest[]>([]);
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all tests
   */
  const fetchTests = useCallback(async (status?: TestStatus): Promise<ABTest[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/ab-tests?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }

      const data = await response.json();
      const fetchedTests = data.tests || [];

      setTests(fetchedTests);
      return fetchedTests;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tests';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch active tests
   */
  const fetchActiveTests = useCallback(async (): Promise<ABTest[]> => {
    try {
      const response = await fetch('/api/ab-tests/active', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active tests');
      }

      const data = await response.json();
      const active = data.tests || [];

      setActiveTests(active);
      return active;
    } catch (err) {
      console.error('Failed to fetch active tests:', err);
      return [];
    }
  }, []);

  /**
   * Create new test
   */
  const createTest = useCallback(
    async (
      testData: Omit<ABTest, 'id' | 'createdAt' | 'createdBy' | 'metrics'>
    ): Promise<ABTest | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ab-tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(testData),
        });

        if (!response.ok) {
          throw new Error('Failed to create test');
        }

        const data = await response.json();
        const newTest = data.test;

        setTests((prev) => [newTest, ...prev]);
        return newTest;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create test';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update test
   */
  const updateTest = useCallback(
    async (testId: string, updates: Partial<ABTest>): Promise<ABTest | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ab-tests/${testId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update test');
        }

        const data = await response.json();
        const updated = data.test;

        setTests((prev) => prev.map((t) => (t.id === testId ? updated : t)));
        return updated;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update test';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Start test
   */
  const startTest = useCallback(
    async (testId: string): Promise<boolean> => {
      const updated = await updateTest(testId, {
        status: 'running',
        startDate: new Date().toISOString(),
      });
      return updated !== null;
    },
    [updateTest]
  );

  /**
   * Pause test
   */
  const pauseTest = useCallback(
    async (testId: string): Promise<boolean> => {
      const updated = await updateTest(testId, { status: 'paused' });
      return updated !== null;
    },
    [updateTest]
  );

  /**
   * Resume test
   */
  const resumeTest = useCallback(
    async (testId: string): Promise<boolean> => {
      const updated = await updateTest(testId, { status: 'running' });
      return updated !== null;
    },
    [updateTest]
  );

  /**
   * Stop test
   */
  const stopTest = useCallback(
    async (testId: string, declareWinner?: string): Promise<boolean> => {
      const updated = await updateTest(testId, {
        status: 'completed',
        endDate: new Date().toISOString(),
        winner: declareWinner,
      });
      return updated !== null;
    },
    [updateTest]
  );

  /**
   * Delete test
   */
  const deleteTest = useCallback(async (testId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ab-tests/${testId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete test');
      }

      setTests((prev) => prev.filter((t) => t.id !== testId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete test';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get test results
   */
  const getTestResults = useCallback(async (testId: string): Promise<TestResults | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ab-tests/${testId}/results`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }

      const data = await response.json();
      return data.results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load results';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get test by ID
   */
  const getTest = useCallback(
    async (testId: string): Promise<ABTest | null> => {
      try {
        const response = await fetch(`/api/ab-tests/${testId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch test');
        }

        const data = await response.json();
        return data.test;
      } catch (err) {
        console.error('Failed to fetch test:', err);
        return null;
      }
    },
    []
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchTests();
      fetchActiveTests();
    }
  }, [autoFetch, fetchTests, fetchActiveTests]);

  return {
    // State
    tests,
    activeTests,
    loading,
    error,

    // Actions
    fetchTests,
    fetchActiveTests,
    createTest,
    updateTest,
    startTest,
    pauseTest,
    resumeTest,
    stopTest,
    deleteTest,
    getTestResults,
    getTest,
  };
}

export default useABTesting;
