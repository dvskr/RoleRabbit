import { useState, useMemo } from 'react';
import { Job, JobFilters, JobStats, ViewMode } from '../../types/job';

const initialJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    status: 'interview',
    appliedDate: '2024-01-15',
    salary: '120k-150k',
    description: 'Looking for a senior engineer to lead our platform development team.',
    url: 'https://example.com/job1',
    notes: 'Great company culture, flexible work arrangements',
    priority: 'high',
    contact: {
      name: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1-555-0123'
    },
    requirements: ['5+ years experience', 'React, Node.js', 'Leadership skills'],
    benefits: ['Health insurance', '401k matching', 'Remote work'],
    remote: true,
    companySize: '100-500',
    industry: 'Technology'
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'New York, NY',
    status: 'applied',
    appliedDate: '2024-01-20',
    salary: '100k-130k',
    description: 'Lead product strategy for our mobile application.',
    url: 'https://example.com/job2',
    priority: 'medium',
    companySize: '10-50',
    industry: 'Technology'
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'DesignStudio',
    location: 'Austin, TX',
    status: 'offer',
    appliedDate: '2024-01-10',
    salary: '80k-100k',
    description: 'Create beautiful and intuitive user experiences.',
    notes: 'Received offer, considering negotiation',
    priority: 'high',
    remote: true,
    companySize: '50-100',
    industry: 'Design'
  }
];

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [filters, setFilters] = useState<JobFilters>({
    status: 'all',
    searchTerm: '',
    sortBy: 'date',
    groupBy: 'status',
    showArchived: false
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  // Job management functions
  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob: Job = {
      ...job,
      id: Date.now().toString()
    };
    setJobs(prev => [...prev, newJob]);
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates } : job
    ));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
    setSelectedJobs(prev => prev.filter(jobId => jobId !== id));
    setFavorites(prev => prev.filter(jobId => jobId !== id));
  };

  const bulkDelete = () => {
    setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
    setSelectedJobs([]);
  };

  const bulkUpdateStatus = (status: Job['status']) => {
    setJobs(prev => prev.map(job => 
      selectedJobs.includes(job.id) ? { ...job, status } : job
    ));
    setSelectedJobs([]);
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
    toggleFavorite
  };
}
