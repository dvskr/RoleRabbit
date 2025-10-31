/**
 * Cell value extraction and manipulation utilities
 * Extracted for better organization and reusability
 */

import { Job } from '../../../types/job';
import type { ColumnKey } from '../types/jobTable.types';

/**
 * Extract cell value from job based on column key
 */
export function getCellValue(job: Partial<Job> | Job, column: ColumnKey): any {
  if (column === 'contact') {
    return job.contact?.name || '';
  } else if (column === 'email') {
    return job.contact?.email || '';
  } else if (column === 'phone') {
    return job.contact?.phone || '';
  } else {
    return job[column as keyof Job];
  }
}

/**
 * Check if a column is editable
 */
export function isEditableColumn(column: ColumnKey): boolean {
  return column !== 'checkbox' && column !== 'favorite';
}

/**
 * Update job with new field value, handling contact fields specially
 */
export function updateJobField(
  job: Job,
  field: ColumnKey,
  value: string
): Job {
  if (field === 'contact' || field === 'email' || field === 'phone') {
    return {
      ...job,
      lastUpdated: new Date().toISOString().split('T')[0],
      contact: {
        ...job.contact,
        ...(field === 'contact' ? { name: value } : {}),
        ...(field === 'email' ? { email: value } : {}),
        ...(field === 'phone' ? { phone: value } : {}),
      }
    };
  }

  return {
    ...job,
    [field]: value,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

/**
 * Update partial job data with new field value, handling contact fields specially
 */
export function updatePartialJobField(
  jobData: Partial<Job>,
  field: ColumnKey,
  value: string
): Partial<Job> {
  if (field === 'contact' || field === 'email' || field === 'phone') {
    return {
      ...jobData,
      contact: {
        ...jobData.contact,
        ...(field === 'contact' ? { name: value } : {}),
        ...(field === 'email' ? { email: value } : {}),
        ...(field === 'phone' ? { phone: value } : {}),
      }
    };
  }

  return {
    ...jobData,
    [field]: value,
  };
}


