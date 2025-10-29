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

  // Filter and sort jobs - Comprehensive filtering matching table view
  const filteredJobs = useMemo(() => {
    // Exclude deleted jobs unless showDeleted is true
    let filtered = jobs.filter(job => {
      if (!filters.showDeleted && job.deletedAt) return false;
      if (filters.showDeleted && !job.deletedAt) return false;
      
      const matchesStatus = filters.status === 'all' || job.status === filters.status;
      
      const matchesSearch = filters.searchTerm === '' || 
        job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (job.contact?.name && job.contact.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (job.contact?.email && job.contact.email.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (job.notes && job.notes.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesPriority = !filters.priority || filters.priority === 'all' || job.priority === filters.priority;
      
      const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      // Date range filtering
      let matchesDateRange = true;
      if (filters.dateRange?.start || filters.dateRange?.end) {
        const jobDate = new Date(job.appliedDate);
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
      }
      
      return matchesStatus && matchesSearch && matchesPriority && matchesLocation && matchesDateRange;
    });

    // Sort jobs - matching table view sorting
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date') {
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      }
      if (filters.sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      if (filters.sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1, undefined: 0 };
        return (priorityOrder[b.priority || 'undefined'] || 0) - (priorityOrder[a.priority || 'undefined'] || 0);
      }
      if (filters.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // Default: sort by date (newest first)
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });
    
    // Apply grouping logic if needed (for future use)
    // Currently grouping is handled in table view only

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
      // Fallback to local soft delete
      if (permanent) {
        setJobs(prev => prev.filter(job => job.id !== id));
      } else {
        const deletedAt = new Date().toISOString();
        setJobs(prev => prev.map(job => 
          job.id === id ? { ...job, deletedAt } : job
        ));
      }
      setSelectedJobs(prev => prev.filter(jobId => jobId !== id));
      setFavorites(prev => prev.filter(jobId => jobId !== id));
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
      // Fallback to local restore
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, deletedAt: undefined } : job
      ));
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
      // Fallback to local delete
      if (permanent) {
        setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
      } else {
        const deletedAt = new Date().toISOString();
        setJobs(prev => prev.map(job => 
          selectedJobs.includes(job.id) ? { ...job, deletedAt } : job
        ));
      }
      setSelectedJobs([]);
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
      // Fallback to local restore
      setJobs(prev => prev.map(job => 
        selectedJobs.includes(job.id) ? { ...job, deletedAt: undefined } : job
      ));
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

