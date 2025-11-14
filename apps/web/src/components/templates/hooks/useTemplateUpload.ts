/**
 * Custom hook for managing template uploads
 */

import { useState, useCallback } from 'react';

export interface UploadedTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  tags: string[];
  imageUrl: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  downloads: number;
  views: number;
  isPublic: boolean;
  isPremium: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface UploadLimits {
  maxFileSize: number; // in bytes
  maxUploads: number;
  currentUploads: number;
  remainingUploads: number;
  allowedFileTypes: string[];
  isPremium: boolean;
}

export interface TemplateUploadData {
  file: File;
  name: string;
  description: string;
  tags: string[];
  isPublic: boolean;
}

interface UseTemplateUploadOptions {
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (template: UploadedTemplate) => void;
}

export function useTemplateUpload(options?: UseTemplateUploadOptions) {
  const { onUploadProgress, onUploadComplete } = options || {};

  const [uploads, setUploads] = useState<UploadedTemplate[]>([]);
  const [limits, setLimits] = useState<UploadLimits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Fetch upload limits
  const fetchLimits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/upload/limits', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upload limits');
      }

      const data = await response.json();
      setLimits(data.data);

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch limits';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's uploaded templates
  const fetchUploads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/my-uploads', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch uploads');
      }

      const data = await response.json();
      setUploads(data.data || []);

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch uploads';
      setError(errorMessage);
      console.error('Error fetching uploads:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload a template
  const uploadTemplate = useCallback(
    async (uploadData: TemplateUploadData) => {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('name', uploadData.name);
        formData.append('description', uploadData.description);
        formData.append('tags', JSON.stringify(uploadData.tags));
        formData.append('isPublic', uploadData.isPublic.toString());

        // Use XMLHttpRequest for progress tracking
        return new Promise<{ success: boolean; data?: UploadedTemplate; error?: string }>(
          (resolve) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(progress);
                onUploadProgress?.(progress);
              }
            });

            // Handle completion
            xhr.addEventListener('load', () => {
              setLoading(false);

              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  const template = data.data;

                  // Add to uploads list
                  setUploads((prev) => [template, ...prev]);

                  // Update limits
                  if (limits) {
                    setLimits({
                      ...limits,
                      currentUploads: limits.currentUploads + 1,
                      remainingUploads: limits.remainingUploads - 1,
                    });
                  }

                  onUploadComplete?.(template);
                  resolve({ success: true, data: template });
                } catch (err) {
                  const errorMessage = 'Failed to parse response';
                  setError(errorMessage);
                  resolve({ success: false, error: errorMessage });
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  const errorMessage = errorData.message || 'Upload failed';
                  setError(errorMessage);
                  resolve({ success: false, error: errorMessage });
                } catch {
                  const errorMessage = `Upload failed with status ${xhr.status}`;
                  setError(errorMessage);
                  resolve({ success: false, error: errorMessage });
                }
              }
            });

            // Handle errors
            xhr.addEventListener('error', () => {
              setLoading(false);
              const errorMessage = 'Network error during upload';
              setError(errorMessage);
              resolve({ success: false, error: errorMessage });
            });

            // Handle abort
            xhr.addEventListener('abort', () => {
              setLoading(false);
              const errorMessage = 'Upload cancelled';
              setError(errorMessage);
              resolve({ success: false, error: errorMessage });
            });

            // Send request
            xhr.open('POST', '/api/templates/upload', true);
            xhr.withCredentials = true;
            xhr.send(formData);
          }
        );
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [limits, onUploadProgress, onUploadComplete]
  );

  // Update a template
  const updateTemplate = useCallback(
    async (templateId: string, updates: Partial<TemplateUploadData>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/uploads/${templateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update template');
        }

        // Update in local state
        setUploads((prev) =>
          prev.map((upload) => (upload.id === templateId ? data.data : upload))
        );

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a template
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/uploads/${templateId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete template');
        }

        // Remove from local state
        setUploads((prev) => prev.filter((upload) => upload.id !== templateId));

        // Update limits
        if (limits) {
          setLimits({
            ...limits,
            currentUploads: limits.currentUploads - 1,
            remainingUploads: limits.remainingUploads + 1,
          });
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [limits]
  );

  // Toggle public/private
  const toggleVisibility = useCallback(
    async (templateId: string, isPublic: boolean) => {
      return updateTemplate(templateId, { isPublic });
    },
    [updateTemplate]
  );

  return {
    uploads,
    limits,
    loading,
    error,
    uploadProgress,
    fetchLimits,
    fetchUploads,
    uploadTemplate,
    updateTemplate,
    deleteTemplate,
    toggleVisibility,
  };
}
