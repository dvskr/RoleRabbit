import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

type BaseResume = {
  id: string;
  slotNumber: number;
  name: string;
  isActive: boolean;
  data?: any;
  formatting?: any;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
};

type PlanLimits = {
  maxSlots: number;
};

type BaseResumeResponse = {
  success: boolean;
  resumes: BaseResume[];
  limits: PlanLimits;
  activeBaseResumeId: string | null;
};

type UseBaseResumesOptions = {
  onActiveChange?: (resumeId: string | null) => void;
};

export const useBaseResumes = (options: UseBaseResumesOptions = {}) => {
  const { onActiveChange } = options;
  const [resumes, setResumes] = useState<BaseResume[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [limits, setLimits] = useState<PlanLimits>({ maxSlots: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const upsertResume = useCallback((resume: BaseResume) => {
    setResumes(prev => {
      const existingIndex = prev.findIndex(r => r.id === resume.id);
      if (existingIndex === -1) {
        return [...prev, resume].sort((a, b) => a.slotNumber - b.slotNumber);
      }
      const next = [...prev];
      next[existingIndex] = { ...next[existingIndex], ...resume };
      return next.sort((a, b) => a.slotNumber - b.slotNumber);
    });
  }, []);

  const fetchResumes = useCallback(async (options: { showSpinner?: boolean } = {}) => {
    if (options.showSpinner) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const response: BaseResumeResponse = await apiService.getBaseResumes();
      if (response?.success) {
        const newActiveId = response.activeBaseResumeId || null;
        setResumes(response.resumes || []);
        setLimits(response.limits || { maxSlots: 1 });
        // Only update activeId if it actually changed to prevent unnecessary re-renders
        setActiveId(prevId => {
          if (prevId !== newActiveId) {
            onActiveChange?.(newActiveId);
            return newActiveId;
          }
          return prevId;
        });
      }
    } catch (err: any) {
      logger.error('Failed to load base resumes', err);
      setError(err?.message || 'Failed to load base resumes');
    } finally {
      setIsLoading(false);
    }
  }, [onActiveChange]);

  useEffect(() => {
    fetchResumes({ showSpinner: true });
    // Only run on mount, not when fetchResumes changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createResume = useCallback(async (payload: { name?: string; data?: any; formatting?: any; metadata?: any }) => {
    setError(null);
    try {
      const response = await apiService.createBaseResume(payload);
      if (response?.success && response.resume) {
        // Add to local state immediately
        upsertResume(response.resume);
        // Refresh from server to ensure consistency and get correct slot numbers
        await fetchResumes({ showSpinner: false });
        return response.resume;
      }
      if (response?.success === false) {
        throw new Error(response?.error || 'Failed to create base resume');
      }
    } catch (err: any) {
      logger.error('Failed to create base resume', err);
      setError(err?.message || 'Failed to create base resume');
      throw err;
    }
  }, [upsertResume, fetchResumes]);

  const activateResume = useCallback(async (id: string) => {
    setError(null);
    try {
      // Call API to activate resume
      await apiService.activateBaseResume(id);
      
      // Optimistically update local state FIRST for immediate UI feedback
      setActiveId(id);
      onActiveChange?.(id);
      setResumes(prev => prev.map(resume => ({
        ...resume,
        isActive: resume.id === id
      })));
      
      // Then verify with a fresh fetch to ensure consistency
      // This prevents UI state from getting out of sync with backend
      await fetchResumes({ showSpinner: false });
    } catch (err: any) {
      logger.error('Failed to activate base resume', err);
      setError(err?.message || 'Failed to activate base resume');
      // Revert optimistic update on error
      await fetchResumes({ showSpinner: false });
      throw err;
    }
  }, [onActiveChange, fetchResumes]);

  const deleteResume = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiService.deleteBaseResume(id);
      await fetchResumes();
    } catch (err: any) {
      logger.error('Failed to delete base resume', err);
      setError(err?.message || 'Failed to delete base resume');
      throw err;
    }
  }, [fetchResumes]);

  return {
    resumes,
    activeId,
    limits,
    isLoading,
    error,
    refresh: (options?: { showSpinner?: boolean }) => fetchResumes({ showSpinner: options?.showSpinner ?? true }),
    createResume,
    activateResume,
    deleteResume,
    setActiveId,
    upsertResume
  };
};
