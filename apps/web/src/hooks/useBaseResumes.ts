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
      if (response?.success) {
        await fetchResumes();
        return response.resume;
      }
    } catch (err: any) {
      logger.error('Failed to create base resume', err);
      setError(err?.message || 'Failed to create base resume');
      throw err;
    }
  }, [fetchResumes]);

  const activateResume = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiService.activateBaseResume(id);
      setActiveId(id);
      onActiveChange?.(id);
      setResumes(prev => prev.map(resume => ({
        ...resume,
        isActive: resume.id === id
      })));
    } catch (err: any) {
      logger.error('Failed to activate base resume', err);
      setError(err?.message || 'Failed to activate base resume');
      throw err;
    }
  }, [onActiveChange]);

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
    setActiveId
  };
};
