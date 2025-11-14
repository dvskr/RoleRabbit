/**
 * Custom hook for managing template approval workflow
 */

import { useState, useCallback } from 'react';

export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TemplateApproval {
  id: string;
  templateId: string;
  status: ApprovalStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  qualityScore?: number;
  feedback?: string;
  rejectionReason?: string;
  template?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
  submitter?: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApprovalSubmission {
  message?: string;
}

export interface ApprovalReview {
  status: 'APPROVED' | 'REJECTED';
  qualityScore?: number;
  feedback?: string;
  rejectionReason?: string;
}

export function useTemplateApproval() {
  const [approvals, setApprovals] = useState<TemplateApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit template for approval
  const submitForApproval = useCallback(async (templateId: string, data?: ApprovalSubmission) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${templateId}/submit-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data || {}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit for approval');
      }

      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit for approval';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get approval status for a template
  const getApprovalStatus = useCallback(async (templateId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${templateId}/approval-status`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch approval status');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch approval status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Review a template (admin)
  const reviewTemplate = useCallback(async (approvalId: string, review: ApprovalReview) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/approvals/${approvalId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(review),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit review');
      }

      // Update local state
      setApprovals((prev) =>
        prev.map((approval) => (approval.id === approvalId ? result.data : approval))
      );

      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pending approvals (admin)
  const fetchPendingApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/approvals/pending', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }

      const data = await response.json();
      setApprovals(data.data || []);

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pending approvals';
      setError(errorMessage);
      console.error('Error fetching pending approvals:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all approvals (admin)
  const fetchAllApprovals = useCallback(async (status?: ApprovalStatus) => {
    setLoading(true);
    setError(null);

    try {
      const url = status
        ? `/api/templates/approvals?status=${status}`
        : '/api/templates/approvals';

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch approvals');
      }

      const data = await response.json();
      setApprovals(data.data || []);

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch approvals';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    approvals,
    loading,
    error,
    submitForApproval,
    getApprovalStatus,
    reviewTemplate,
    fetchPendingApprovals,
    fetchAllApprovals,
  };
}
