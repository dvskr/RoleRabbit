/**
 * Custom hook for managing template versions
 */

import { useState, useCallback } from 'react';

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  name: string;
  description?: string;
  changes: string;
  createdBy: string;
  createdAt: string;
  data: any; // Template data snapshot
  size: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface VersionComparison {
  oldVersion: TemplateVersion;
  newVersion: TemplateVersion;
  diff: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

export function useTemplateVersions(templateId: string) {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all versions
  const fetchVersions = useCallback(async () => {
    if (!templateId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${templateId}/versions`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }

      const data = await response.json();
      setVersions(data.data || []);

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch versions';
      setError(errorMessage);
      console.error('Error fetching versions:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  // Get specific version
  const getVersion = useCallback(
    async (versionId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/${templateId}/versions/${versionId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch version');
        }

        const data = await response.json();
        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch version';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [templateId]
  );

  // Compare two versions
  const compareVersions = useCallback(
    async (oldVersionId: string, newVersionId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/templates/${templateId}/versions/compare?old=${oldVersionId}&new=${newVersionId}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to compare versions');
        }

        const data = await response.json();
        setComparison(data.data);

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to compare versions';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [templateId]
  );

  // Rollback to specific version
  const rollbackToVersion = useCallback(
    async (versionId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/${templateId}/versions/${versionId}/rollback`, {
          method: 'POST',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to rollback version');
        }

        // Refresh versions list
        await fetchVersions();

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to rollback version';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [templateId, fetchVersions]
  );

  // Create new version (manual save point)
  const createVersion = useCallback(
    async (name: string, description?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/${templateId}/versions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ name, description }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create version');
        }

        // Refresh versions list
        await fetchVersions();

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create version';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [templateId, fetchVersions]
  );

  // Delete a version
  const deleteVersion = useCallback(
    async (versionId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/${templateId}/versions/${versionId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete version');
        }

        // Remove from local state
        setVersions((prev) => prev.filter((v) => v.id !== versionId));

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete version';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [templateId]
  );

  return {
    versions,
    comparison,
    loading,
    error,
    fetchVersions,
    getVersion,
    compareVersions,
    rollbackToVersion,
    createVersion,
    deleteVersion,
  };
}
