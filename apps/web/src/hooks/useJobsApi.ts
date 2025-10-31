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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize sample jobs - moved outside to avoid dependency issues
  const initializeSampleJobs = useCallback(() => {
    try {
      const sampleJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          status: 'applied',
          appliedDate: new Date().toISOString().split('T')[0],
          salary: '$120,000 - $150,000',
          description: 'Looking for an experienced frontend developer to join our team.',
          url: 'https://techcorp.com/jobs',
          priority: 'high',
          remote: true,
        },
        {
          id: '2',
          title: 'Full Stack Engineer',
          company: 'StartupXYZ',
          location: 'New York, NY',
          status: 'interview',
          appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          salary: '$100,000 - $130,000',
          description: 'Join our growing team of engineers building the future.',
          url: 'https://startupxyz.com/careers',
          priority: 'medium',
          remote: false,
        },
        {
          id: '3',
          title: 'React Developer',
          company: 'WebDev Agency',
          location: 'Austin, TX',
          status: 'offer',
          appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          salary: '$90,000 - $110,000',
          description: 'Work on exciting client projects using modern React.',
          url: 'https://webdev.com/jobs',
          priority: 'high',
          remote: true,
        },
      ];
      setJobs(sampleJobs);
      if (typeof window !== 'undefined') {
        localStorage.setItem('jobs', JSON.stringify(sampleJobs));
      }
    } catch (error) {
      logger.error('Failed to initialize sample jobs:', error);
    }
  }, []);

  // Load jobs from API on mount
  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if we're in browser
      if (typeof window === 'undefined') {
        initializeSampleJobs();
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getJobs();
        if (response && response.jobs && Array.isArray(response.jobs) && response.jobs.length > 0) {
          setJobs(response.jobs);
          // Save to localStorage as backup
          localStorage.setItem('jobs', JSON.stringify(response.jobs));
        } else {
          // Try loading from localStorage
          const stored = localStorage.getItem('jobs');
          if (stored) {
            try {
              const parsedJobs = JSON.parse(stored);
              if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
                setJobs(parsedJobs);
              } else {
                // Initialize with sample data if completely empty
                initializeSampleJobs();
              }
            } catch (e) {
              logger.error('Failed to parse stored jobs:', e);
              initializeSampleJobs();
            }
          } else {
            // Initialize with sample data
            initializeSampleJobs();
          }
        }
      } catch (error) {
        logger.error('Failed to load jobs from API:', error);
        // Try localStorage as fallback
        try {
          const stored = localStorage.getItem('jobs');
          if (stored) {
            const parsedJobs = JSON.parse(stored);
            if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
              setJobs(parsedJobs);
            } else {
              initializeSampleJobs();
            }
          } else {
            initializeSampleJobs();
          }
        } catch (e) {
          logger.error('Failed to load from localStorage:', e);
          initializeSampleJobs();
        }
      }
    } catch (error) {
      logger.error('Critical error loading jobs:', error);
      initializeSampleJobs();
    } finally {
      setIsLoading(false);
    }
  }, [initializeSampleJobs]);

  // Filter and sort jobs - Comprehensive filtering matching table view
  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return [];
    }

    try {
      // Exclude deleted jobs unless showDeleted is true
      let filtered = jobs.filter(job => {
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

