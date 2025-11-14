/**
 * Custom hook for managing template exports
 */

import { useState, useCallback } from 'react';

export type ExportFormat = 'PDF' | 'DOCX' | 'LATEX' | 'JSON' | 'HTML';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeComments?: boolean;
  includeVersionHistory?: boolean;
  quality?: 'low' | 'medium' | 'high';
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
}

export interface ExportJob {
  id: string;
  templateId: string;
  format: ExportFormat;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export function useTemplateExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportJob, setExportJob] = useState<ExportJob | null>(null);

  // Export template
  const exportTemplate = useCallback(async (templateId: string, options: ExportOptions) => {
    setLoading(true);
    setError(null);
    setExportJob(null);

    try {
      const response = await fetch(`/api/templates/${templateId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Export failed');
      }

      setExportJob(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get export job status
  const getExportStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/templates/export/${jobId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get export status');
      }

      setExportJob(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get export status';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Download exported file
  const downloadExport = useCallback(async (jobId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/templates/export/${jobId}/download`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Preview export (for formats like PDF/HTML)
  const previewExport = useCallback(async (templateId: string, options: ExportOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${templateId}/export/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Preview failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      return { success: true, url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Preview failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportJob,
    exportTemplate,
    getExportStatus,
    downloadExport,
    previewExport,
  };
}
