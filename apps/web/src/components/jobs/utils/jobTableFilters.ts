/**
 * Filtering utilities for EditableJobTable
 * Extracted for better organization and reusability
 */

import { Job, JobFilters } from '../../../types/job';

/**
 * Filter jobs based on table filters
 */
export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  let filtered = [...jobs];

  // Filter by deleted status
  if (filters.showDeleted) {
    filtered = filtered.filter(job => job.deletedAt);
  } else {
    filtered = filtered.filter(job => !job.deletedAt);
  }

  // Search term filtering
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      (job.contact?.name && job.contact.name.toLowerCase().includes(searchLower)) ||
      (job.contact?.email && job.contact.email.toLowerCase().includes(searchLower)) ||
      (job.notes && job.notes.toLowerCase().includes(searchLower))
    );
  }

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter(job => job.status === filters.status);
  }

  // Priority filter
  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(job => job.priority === filters.priority);
  }

  // Location filter
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filtered = filtered.filter(job =>
      job.location.toLowerCase().includes(locationLower)
    );
  }

  // Date range filter
  if (filters.dateRange?.start || filters.dateRange?.end) {
    filtered = filtered.filter(job => {
      const jobDate = new Date(job.appliedDate);
      if (filters.dateRange?.start) {
        const startDate = new Date(filters.dateRange.start);
        if (jobDate < startDate) return false;
      }
      if (filters.dateRange?.end) {
        const endDate = new Date(filters.dateRange.end);
        if (jobDate > endDate) return false;
      }
      return true;
    });
  }

  return filtered;
}


