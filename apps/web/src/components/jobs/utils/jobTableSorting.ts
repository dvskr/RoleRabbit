/**
 * Sorting utilities for EditableJobTable
 * Extracted for better organization and reusability
 */

import { Job, JobFilters } from '../../../types/job';
import type { ColumnKey, SortDirection } from '../types/jobTable.types';

interface SortState {
  field: ColumnKey;
  direction: SortDirection;
}

/**
 * Sort jobs by column field
 */
export function sortJobsByColumn(jobs: Job[], sortBy: SortState | null): Job[] {
  if (!sortBy) return jobs;

  const sorted = [...jobs];
  sorted.sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortBy.field === 'contact') {
      aVal = a.contact?.name || '';
      bVal = b.contact?.name || '';
    } else if (sortBy.field === 'email') {
      aVal = a.contact?.email || '';
      bVal = b.contact?.email || '';
    } else if (sortBy.field === 'phone') {
      aVal = a.contact?.phone || '';
      bVal = b.contact?.phone || '';
    } else {
      aVal = a[sortBy.field as keyof Job];
      bVal = b[sortBy.field as keyof Job];
    }

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    let comp = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime()) && aVal.includes('-')) {
        comp = aDate.getTime() - bDate.getTime();
      } else {
        comp = aVal.localeCompare(bVal);
      }
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comp = aVal - bVal;
    } else {
      comp = String(aVal).localeCompare(String(bVal));
    }

    return sortBy.direction === 'asc' ? comp : -comp;
  });

  return sorted;
}

/**
 * Sort jobs by filter sortBy option
 */
export function sortJobsByFilter(jobs: Job[], filters: JobFilters): Job[] {
  if (!filters.sortBy) return jobs;

  const sorted = [...jobs];
  sorted.sort((a, b) => {
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
    return 0;
  });

  return sorted;
}


