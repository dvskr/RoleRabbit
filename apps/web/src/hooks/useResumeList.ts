import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

interface ResumeListItem {
  id: string;
  name: string;
  fileName?: string | null;
  templateId?: string | null;
  createdAt?: string;
  lastUpdated?: string;
}

interface UseResumeListOptions {
  onResumeSwitched?: (resumeId: string) => void;
}

export const useResumeList = (options: UseResumeListOptions = {}) => {
  const { onResumeSwitched } = options;
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all resumes
  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getResumes();
      if (response?.resumes) {
        const resumeList: ResumeListItem[] = response.resumes.map((r: any) => ({
          id: r.id,
          name: r.name || r.fileName || 'Untitled Resume',
          fileName: r.fileName || r.name,
          templateId: r.templateId,
          createdAt: r.createdAt,
          lastUpdated: r.lastUpdated
        }));
        setResumes(resumeList);
        
        // Set first resume as active if none is set
        if (!activeResumeId && resumeList.length > 0) {
          setActiveResumeId(resumeList[0].id);
          onResumeSwitched?.(resumeList[0].id);
        }
      }
    } catch (err: any) {
      logger.error('Failed to fetch resumes:', err);
      setError(err?.message || 'Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  }, [activeResumeId, onResumeSwitched]);

  // Load resumes on mount
  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to prevent infinite loop

  // Switch to a different resume
  const switchResume = useCallback(async (resumeId: string) => {
    if (resumeId === activeResumeId) return;
    
    setActiveResumeId(resumeId);
    onResumeSwitched?.(resumeId);
  }, [activeResumeId, onResumeSwitched]);


  // Delete a resume
  const deleteResume = useCallback(async (resumeId: string) => {
    try {
      setError(null);
      await apiService.deleteResume(resumeId);
      
      setResumes(prev => {
        const filtered = prev.filter(r => r.id !== resumeId);
        
        // If deleted resume was active, switch to another one
        if (resumeId === activeResumeId) {
          if (filtered.length > 0) {
            setActiveResumeId(filtered[0].id);
            onResumeSwitched?.(filtered[0].id);
          } else {
            setActiveResumeId(null);
          }
        }
        
        return filtered;
      });
    } catch (err: any) {
      logger.error('Failed to delete resume:', err);
      setError(err?.message || 'Failed to delete resume');
      throw err;
    }
  }, [activeResumeId, onResumeSwitched]);

  // Duplicate a resume
  const duplicateResume = useCallback(async (resumeId: string, newFileName?: string) => {
    try {
      setError(null);
      const response = await apiService.duplicateResume(resumeId, newFileName);
      
      if (response?.resume) {
        const duplicatedResume: ResumeListItem = {
          id: response.resume.id,
          name: response.resume.name || response.resume.fileName || 'Copy of Resume',
          fileName: response.resume.fileName || response.resume.name,
          templateId: response.resume.templateId,
          createdAt: response.resume.createdAt,
          lastUpdated: response.resume.lastUpdated
        };
        
        setResumes(prev => [...prev, duplicatedResume]);
        return duplicatedResume;
      }
    } catch (err: any) {
      logger.error('Failed to duplicate resume:', err);
      setError(err?.message || 'Failed to duplicate resume');
      throw err;
    }
  }, []);

  return {
    resumes,
    activeResumeId,
    setActiveResumeId,
    isLoading,
    error,
    switchResume,
    deleteResume,
    duplicateResume,
    refreshResumes: fetchResumes,
  };
};

