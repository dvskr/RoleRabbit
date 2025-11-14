/**
 * Custom hook for managing template sharing
 */

import { useState, useCallback } from 'react';

export type SharePermission = 'VIEW' | 'DOWNLOAD' | 'EDIT' | 'FULL';

export interface ShareLink {
  id: string;
  templateId: string;
  token: string;
  permission: SharePermission;
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  sharedWith?: string[];
}

export interface ShareLinkFormData {
  permission: SharePermission;
  expiresAt?: string | null;
  maxUses?: number | null;
  sharedWith?: string[];
}

export interface ShareAnalytics {
  shareId: string;
  totalViews: number;
  totalDownloads: number;
  totalEdits: number;
  recentAccess: Array<{
    id: string;
    userId?: string;
    userName?: string;
    action: 'VIEW' | 'DOWNLOAD' | 'EDIT';
    accessedAt: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
  viewsByDate: Array<{
    date: string;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    accessCount: number;
  }>;
}

interface UseTemplateSharingOptions {
  templateId: string;
}

export function useTemplateSharing(options: UseTemplateSharingOptions) {
  const { templateId } = options;

  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new share link
  const createShareLink = useCallback(
    async (shareData: ShareLinkFormData) => {
      if (!templateId) return { success: false, error: 'Template ID is required' };

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/${templateId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(shareData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create share link');
        }

        // Add new share link to the list
        setShareLinks((prev) => [data.data, ...prev]);

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create share link';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [templateId]
  );

  // Get all share links for the template
  const fetchShareLinks = useCallback(async () => {
    if (!templateId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${templateId}/shares`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch share links');
      }

      const data = await response.json();

      if (data.success !== false) {
        setShareLinks(data.data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch share links';
      setError(errorMessage);
      console.error('Error fetching share links:', err);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  // Revoke a share link
  const revokeShareLink = useCallback(async (shareId: string) => {
    try {
      const response = await fetch(`/api/templates/shares/${shareId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to revoke share link');
      }

      // Remove from local state
      setShareLinks((prev) => prev.filter((link) => link.id !== shareId));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke share link';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get analytics for a share link
  const fetchShareAnalytics = useCallback(async (shareId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/shares/${shareId}/analytics`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch share analytics');
      }

      const data = await response.json();

      if (data.success !== false) {
        setAnalytics(data.data);
      }

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Error fetching share analytics:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a share link's settings
  const updateShareLink = useCallback(
    async (shareId: string, updates: Partial<ShareLinkFormData>) => {
      try {
        const response = await fetch(`/api/templates/shares/${shareId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update share link');
        }

        // Update local state
        setShareLinks((prev) =>
          prev.map((link) => (link.id === shareId ? { ...link, ...data.data } : link))
        );

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update share link';
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Get share link by token (public access)
  const getSharedTemplate = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/shared/${token}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to access shared template');
      }

      const data = await response.json();

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access shared template';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shareLinks,
    analytics,
    loading,
    error,
    createShareLink,
    fetchShareLinks,
    revokeShareLink,
    updateShareLink,
    fetchShareAnalytics,
    getSharedTemplate,
  };
}
