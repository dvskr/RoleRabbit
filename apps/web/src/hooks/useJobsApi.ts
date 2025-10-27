import { useState, useMemo, useEffect } from 'react';
import { Job, JobFilters, JobStats, ViewMode } from '../types/job';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

export function useJobsApi() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    status: 'all',
    searchTerm: '',
    sortBy: 'date',
    groupBy: 'status',
    showArchived: false
  });
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load jobs from API on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getJobs();
      if (response && response.jobs) {
        setJobs(response.jobs);
      }
    } catch (error) {
      logger.error('Failed to load jobs from API:', error);
      // Continue with empty array if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesFilter = filters.status === 'all' || job.status === filters.status;
      const matchesSearch = job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date') {
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      }
      if (filters.sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      if (filters.sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
      }
      return 0;
    });

    return filtered;
  }, [jobs, filters]);

  // Calculate stats
  const stats: JobStats = useMemo(() => ({
    total: jobs.length,
    applied: jobs.filter(job => job.status === 'applied').length,
    interview: jobs.filter(job => job.status === 'interview').length,
    offer: jobs.filter(job => job.status === 'offer').length,
    rejected: jobs.filter(job => job.status === 'rejected').length,
    favorites: favorites.length
  }), [jobs, favorites]);

  // Job management functions with API integration
  const addJob = async (job: Omit<Job, 'id'>) => {
    try {
      const response = await apiService.saveJob(job);
      if (response && response.job) {
        setJobs(prev => [...prev, response.job]);
        logger.debug('Job saved via API:', response.job);
        return response.job;
      }
    } catch (error) {
      logger.error('Failed to save job via API:', error);
      // Fallback to local state
      const newJob: Job = {
        ...job,
        id: Date.now().toString()
      };
      setJobs(prev => [...prev, newJob]);
      return newJob;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      await apiService.updateJob(id, updates);
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, ...updates } : job
      ));
      logger.debug('Job updated via API:', id);
    } catch (error) {
      logger.error('Failed to update job via API:', error);
      // Fallback to local update
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, ...updates } : job
      ));
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await apiService.deleteJob(id);
      setJobs(prev => prev.filter(job => job.id !== id));
      setSelectedJobs(prev => prev.filter(jobId => jobId !== id));
      setFavorites(prev => prev.filter(jobId => jobId !== id));
      logger.debug('Job deleted via API:', id);
    } catch (error) {
      logger.error('Failed to delete job via API:', error);
      // Fallback to local delete
      setJobs(prev => prev.filter(job => job.id !== id));
      setSelectedJobs(prev => prev.filter(jobId => jobId !== id));
      setFavorites(prev => prev.filter(jobId => jobId !== id));
    }
  };

  const bulkDelete = async () => {
    try {
      // Delete all selected jobs via API
      await Promise.all(selectedJobs.map(id => apiService.deleteJob(id)));
      setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
      setSelectedJobs([]);
      logger.debug('Bulk delete completed via API');
    } catch (error) {
      logger.error('Failed to bulk delete via API:', error);
      // Fallback to local delete
      setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
      setSelectedJobs([]);
    }
  };

  const bulkUpdateStatus = async (status: Job['status']) => {
    try {
      // Update all selected jobs via API
      await Promise.all(selectedJobs.map(id => 
        apiService.updateJob(id, { status })
      ));
      setJobs(prev => prev.map(job => 
        selectedJobs.includes(job.id) ? { ...job, status } : job
      ));
      setSelectedJobs([]);
      logger.debug('Bulk update completed via API');
    } catch (error) {
      logger.error('Failed to bulk update via API:', error);
      // Fallback to local update
      setJobs(prev => prev.map(job => 
        selectedJobs.includes(job.id) ? { ...job, status } : job
      ));
      setSelectedJobs([]);
    }
  };

  const toggleJobSelection = (id: string) => {
    setSelectedJobs(prev => 
      prev.includes(id) 
        ? prev.filter(jobId => jobId !== id)
        : [...prev, id]
    );
  };

  const selectAllJobs = () => {
    setSelectedJobs(filteredJobs.map(job => job.id));
  };

  const clearSelection = () => {
    setSelectedJobs([]);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(jobId => jobId !== id)
        : [...prev, id]
    );
  };

  return {
    // State
    jobs: filteredJobs,
    isLoading,
    filters,
    viewMode,
    selectedJobs,
    favorites,
    showFilters,
    stats,
    
    // Actions
    setFilters,
    setViewMode,
    setShowFilters,
    addJob,
    updateJob,
    deleteJob,
    bulkDelete,
    bulkUpdateStatus,
    toggleJobSelection,
    selectAllJobs,
    clearSelection,
    toggleFavorite,
    loadJobs // Expose for manual refresh
  };
}

