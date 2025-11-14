/**
 * useTemplateBulkOps Hook
 * Custom hook for bulk template operations
 */

import { useState, useCallback } from 'react';

// Bulk operation types
export type BulkOperation =
  | 'approve'
  | 'reject'
  | 'delete'
  | 'make_public'
  | 'make_private'
  | 'add_tags'
  | 'remove_tags'
  | 'change_category'
  | 'feature'
  | 'unfeature';

// Bulk operation options
export interface BulkOperationOptions {
  operation: BulkOperation;
  templateIds: string[];
  // Additional options based on operation
  tags?: string[];
  category?: string;
  rejectionReason?: string;
  feedback?: string;
}

// Bulk operation result
export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: Array<{
    templateId: string;
    error: string;
  }>;
}

// Bulk operation progress
export interface BulkOperationProgress {
  total: number;
  completed: number;
  current?: string;
}

// Hook options
export interface UseTemplateBulkOpsOptions {
  onProgressUpdate?: (progress: BulkOperationProgress) => void;
  onComplete?: (result: BulkOperationResult) => void;
}

/**
 * Hook for managing bulk template operations
 */
export function useTemplateBulkOps(options?: UseTemplateBulkOpsOptions) {
  const { onProgressUpdate, onComplete } = options || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  /**
   * Execute bulk operation
   */
  const executeBulkOperation = useCallback(
    async (options: BulkOperationOptions): Promise<BulkOperationResult> => {
      setLoading(true);
      setError(null);
      setResult(null);
      setProgress({
        total: options.templateIds.length,
        completed: 0,
      });

      try {
        const response = await fetch('/api/templates/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Bulk operation failed');
        }

        const resultData: BulkOperationResult = await response.json();

        setResult(resultData);
        setProgress({
          total: options.templateIds.length,
          completed: options.templateIds.length,
        });

        onComplete?.(resultData);
        onProgressUpdate?.({
          total: options.templateIds.length,
          completed: options.templateIds.length,
        });

        return resultData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);

        const failureResult: BulkOperationResult = {
          success: false,
          successCount: 0,
          failureCount: options.templateIds.length,
          errors: options.templateIds.map((id) => ({
            templateId: id,
            error: errorMessage,
          })),
        };

        setResult(failureResult);
        return failureResult;
      } finally {
        setLoading(false);
      }
    },
    [onComplete, onProgressUpdate]
  );

  /**
   * Bulk approve templates
   */
  const bulkApprove = useCallback(
    async (templateIds: string[], feedback?: string): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'approve',
        templateIds,
        feedback,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk reject templates
   */
  const bulkReject = useCallback(
    async (templateIds: string[], rejectionReason: string): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'reject',
        templateIds,
        rejectionReason,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk delete templates
   */
  const bulkDelete = useCallback(
    async (templateIds: string[]): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'delete',
        templateIds,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk make public
   */
  const bulkMakePublic = useCallback(
    async (templateIds: string[]): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'make_public',
        templateIds,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk make private
   */
  const bulkMakePrivate = useCallback(
    async (templateIds: string[]): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'make_private',
        templateIds,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk add tags
   */
  const bulkAddTags = useCallback(
    async (templateIds: string[], tags: string[]): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'add_tags',
        templateIds,
        tags,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk remove tags
   */
  const bulkRemoveTags = useCallback(
    async (templateIds: string[], tags: string[]): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'remove_tags',
        templateIds,
        tags,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk change category
   */
  const bulkChangeCategory = useCallback(
    async (templateIds: string[], category: string): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'change_category',
        templateIds,
        category,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk feature templates
   */
  const bulkFeature = useCallback(
    async (templateIds: string[]): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'feature',
        templateIds,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Bulk unfeature templates
   */
  const bulkUnfeature = useCallback(
    async (templateIds: string[]): Promise<BulkOperationResult> => {
      return executeBulkOperation({
        operation: 'unfeature',
        templateIds,
      });
    },
    [executeBulkOperation]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setProgress(null);
    setResult(null);
  }, []);

  return {
    // State
    loading,
    error,
    progress,
    result,

    // Generic operation
    executeBulkOperation,

    // Specific operations
    bulkApprove,
    bulkReject,
    bulkDelete,
    bulkMakePublic,
    bulkMakePrivate,
    bulkAddTags,
    bulkRemoveTags,
    bulkChangeCategory,
    bulkFeature,
    bulkUnfeature,

    // Utilities
    reset,
  };
}

export default useTemplateBulkOps;
