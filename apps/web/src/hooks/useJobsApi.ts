import { useState, useMemo, useEffect, useCallback } from 'react';
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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Initialize from URL if available
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('view');
        if (mode && ['list', 'grid', 'kanban', 'table'].includes(mode)) {
          return mode as ViewMode;
        }
      } catch (error) {
        // Ignore
      }
    }
    return 'table';
  });
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load jobs from API on mount
  useEffect(() => {
    loadJobs();
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist viewMode to URL (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const currentView = params.get('view');
        if (currentView !== viewMode) {
          params.set('view', viewMode);
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        }
      } catch (error) {
        // Ignore
      }
    }
  }, [viewMode, isInitialized]);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getJobs();
      if (response && response.jobs && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
      } else {
        setJobs([]); // Empty if no jobs
      }
    } catch (error) {
      logger.error('Failed to load jobs from API:', error);
      setJobs([]); // Empty on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter and sort jobs - Comprehensive filtering matching table view
  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return [];
    }

    try {
      // Exclude deleted jobs unless showDeleted is true
      const filtered = jobs.filter(job => {
        if (!job || typeof job !== 'object') return false;
        
        try {
          if (!filters.showDeleted && job.deletedAt) return false;
          if (filters.showDeleted && !job.deletedAt) return false;
          
          const matchesStatus = filters.status === 'all' || job.status === filters.status;
          
          const searchLower = (filters.searchTerm || '').toLowerCase();
          const matchesSearch = searchLower === '' || 
            (job.title || '').toLowerCase().includes(searchLower) ||
            (job.company || '').toLowerCase().includes(searchLower) ||
            (job.location || '').toLowerCase().includes(searchLower) ||
            (job.contact?.name || '').toLowerCase().includes(searchLower) ||
            (job.contact?.email || '').toLowerCase().includes(searchLower) ||
            (job.notes || '').toLowerCase().includes(searchLower);
          
          const matchesPriority = !filters.priority || filters.priority === 'all' || job.priority === filters.priority;
          
          const locationLower = (filters.location || '').toLowerCase();
          const matchesLocation = locationLower === '' || (job.location || '').toLowerCase().includes(locationLower);
          
          // Date range filtering
          let matchesDateRange = true;
          if (filters.dateRange?.start || filters.dateRange?.end) {
            try {
              const jobDate = new Date(job.appliedDate || new Date());
              if (filters.dateRange.start) {
                const startDate = new Date(filters.dateRange.start);
                startDate.setHours(0, 0, 0, 0);
                if (jobDate < startDate) matchesDateRange = false;
              }
              if (filters.dateRange.end) {
                const endDate = new Date(filters.dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                if (jobDate > endDate) matchesDateRange = false;
              }
            } catch (e) {
              logger.error('Date parsing error:', e);
            }
          }
          
          return matchesStatus && matchesSearch && matchesPriority && matchesLocation && matchesDateRange;
        } catch (e) {
          logger.error('Error filtering job:', e, job);
          return false;
        }
      });

      // Sort jobs - matching table view sorting
      try {
        filtered.sort((a, b) => {
          try {
            if (filters.sortBy === 'date') {
              const dateA = new Date(a.appliedDate || 0).getTime();
              const dateB = new Date(b.appliedDate || 0).getTime();
              return dateB - dateA;
            }
            if (filters.sortBy === 'company') {
              return (a.company || '').localeCompare(b.company || '');
            }
            if (filters.sortBy === 'priority') {
              const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
              const priorityA = priorityOrder[a.priority || ''] || 0;
              const priorityB = priorityOrder[b.priority || ''] || 0;
              return priorityB - priorityA;
            }
            if (filters.sortBy === 'title') {
              return (a.title || '').localeCompare(b.title || '');
            }
            // Default: sort by date (newest first)
            const dateA = new Date(a.appliedDate || 0).getTime();
            const dateB = new Date(b.appliedDate || 0).getTime();
            return dateB - dateA;
          } catch (e) {
            logger.error('Sort error:', e);
            return 0;
          }
        });
      } catch (e) {
        logger.error('Error sorting jobs:', e);
      }
      
      return filtered;
    } catch (error) {
      logger.error('Critical error in filteredJobs:', error);
      return [];
    }
  }, [jobs, filters]);

  // Calculate stats
  const stats: JobStats = useMemo(() => {
    try {
      if (!Array.isArray(jobs)) {
        return {
          total: 0,
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          favorites: favorites.length || 0
        };
      }

      return {
        total: jobs.length,
        applied: jobs.filter(job => job && job.status === 'applied').length,
        interview: jobs.filter(job => job && job.status === 'interview').length,
        offer: jobs.filter(job => job && job.status === 'offer').length,
        rejected: jobs.filter(job => job && job.status === 'rejected').length,
        favorites: Array.isArray(favorites) ? favorites.length : 0
      };
    } catch (error) {
      logger.error('Error calculating stats:', error);
      return {
        total: 0,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
        favorites: 0
      };
    }
  }, [jobs, favorites]);

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
      throw error; // Re-throw to let UI handle it
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
      throw error; // Re-throw to let UI handle it
    }
  };

  const deleteJob = async (id: string, permanent: boolean = false) => {
    try {
      if (permanent) {
        // Permanent delete
        await apiService.deleteJob(id);
        setJobs(prev => prev.filter(job => job.id !== id));
      } else {
        // Soft delete - move to recycle bin
        const deletedAt = new Date().toISOString();
        await apiService.updateJob(id, { deletedAt } as Partial<Job>);
        setJobs(prev => prev.map(job => 
          job.id === id ? { ...job, deletedAt } : job
        ));
      }
      setSelectedJobs(prev => prev.filter(jobId => jobId !== id));
      setFavorites(prev => prev.filter(jobId => jobId !== id));
      logger.debug('Job deleted via API:', id, permanent ? 'permanently' : 'to recycle bin');
    } catch (error) {
      logger.error('Failed to delete job via API:', error);
      throw error; // Re-throw to let UI handle it
    }
  };

  const restoreJob = async (id: string) => {
    try {
      await apiService.updateJob(id, { deletedAt: undefined } as Partial<Job>);
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, deletedAt: undefined } : job
      ));
      logger.debug('Job restored via API:', id);
    } catch (error) {
      logger.error('Failed to restore job via API:', error);
      throw error; // Re-throw to let UI handle it
    }
  };

  const bulkDelete = async (permanent: boolean = false) => {
    try {
      if (permanent) {
        // Permanent delete
        await Promise.all(selectedJobs.map(id => apiService.deleteJob(id)));
        setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
      } else {
        // Soft delete - move to recycle bin
        const deletedAt = new Date().toISOString();
        await Promise.all(selectedJobs.map(id => 
          apiService.updateJob(id, { deletedAt } as Partial<Job>)
        ));
        setJobs(prev => prev.map(job => 
          selectedJobs.includes(job.id) ? { ...job, deletedAt } : job
        ));
      }
      setSelectedJobs([]);
      logger.debug('Bulk delete completed via API:', permanent ? 'permanently' : 'to recycle bin');
    } catch (error) {
      logger.error('Failed to bulk delete via API:', error);
      throw error; // Re-throw to let UI handle it
    }
  };

  const bulkRestore = async () => {
    try {
      await Promise.all(selectedJobs.map(id => 
        apiService.updateJob(id, { deletedAt: undefined } as Partial<Job>)
      ));
      setJobs(prev => prev.map(job => 
        selectedJobs.includes(job.id) ? { ...job, deletedAt: undefined } : job
      ));
      setSelectedJobs([]);
      logger.debug('Bulk restore completed via API');
    } catch (error) {
      logger.error('Failed to bulk restore via API:', error);
      throw error; // Re-throw to let UI handle it
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
      throw error; // Re-throw to let UI handle it
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
    // State - all views use filteredJobs for consistency
    jobs: filteredJobs, // This is already filtered and sorted
    allJobs: jobs, // Raw unfiltered jobs for stats calculation
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
    restoreJob,
    bulkDelete,
    bulkRestore,
    bulkUpdateStatus,
    toggleJobSelection,
    selectAllJobs,
    clearSelection,
    toggleFavorite,
    loadJobs // Expose for manual refresh
  };
}

