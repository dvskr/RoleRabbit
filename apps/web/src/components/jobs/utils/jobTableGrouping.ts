/**
 * Grouping utilities for EditableJobTable
 * Extracted for better organization and reusability
 */

import { Job, JobFilters } from '../../../types/job';

/**
 * Group jobs based on groupBy filter
 */
export function groupJobs(jobs: Job[], groupBy?: string): Record<string, Job[]> {
  if (!groupBy || groupBy === 'status') {
    return { 'All': jobs };
  }

  const groups: Record<string, Job[]> = {};
  jobs.forEach(job => {
    let key = 'Other';
    if (groupBy === 'company') {
      key = job.company || 'Other';
    } else if (groupBy === 'priority') {
      key = job.priority || 'No Priority';
    } else if (groupBy === 'date') {
      const date = new Date(job.appliedDate);
      key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(job);
  });

  return groups;
}


