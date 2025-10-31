/**
 * Export/Import utilities for EditableJobTable
 * Extracted for better organization and reusability
 */

import { Job } from '../../../types/job';
import { exportToCSV } from '../../../utils/exportHelpers';

/**
 * Prepare job data for CSV export
 */
export function prepareJobsForExport(jobs: Job[]): Record<string, string>[] {
  return jobs.map(job => ({
    Company: job.company || '',
    Position: job.title || '',
    Status: job.status || '',
    Priority: job.priority || '',
    Location: job.location || '',
    Salary: job.salary || '',
    'Applied Date': job.appliedDate || '',
    'Last Updated': job.lastUpdated || '',
    Contact: job.contact?.name || '',
    Email: job.contact?.email || '',
    Phone: job.contact?.phone || '',
    'Next Step': job.nextStep || '',
    'Job URL': job.url || '',
    Notes: job.notes || ''
  }));
}

/**
 * Export jobs to CSV
 */
export function exportJobsToCSV(jobs: Job[], filename: string = 'jobs-export'): void {
  const exportData = prepareJobsForExport(jobs);
  exportToCSV(exportData, filename);
}

/**
 * Parse CSV file and convert to jobs
 */
export function parseCSVToJobs(csvText: string): Partial<Job>[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const jobs: Partial<Job>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const job: Partial<Job> = {
      title: values[headers.indexOf('Position')] || '',
      company: values[headers.indexOf('Company')] || '',
      location: values[headers.indexOf('Location')] || '',
      status: (values[headers.indexOf('Status')] || 'applied') as Job['status'],
      priority: (values[headers.indexOf('Priority')] || 'medium') as Job['priority'],
      salary: values[headers.indexOf('Salary')] || '',
      appliedDate: values[headers.indexOf('Applied Date')] || new Date().toISOString().split('T')[0],
      contact: {
        name: values[headers.indexOf('Contact')] || '',
        email: values[headers.indexOf('Email')] || '',
        phone: values[headers.indexOf('Phone')] || ''
      },
      url: values[headers.indexOf('Job URL')] || '',
      notes: values[headers.indexOf('Notes')] || ''
    };
    jobs.push(job);
  }

  return jobs;
}

/**
 * Parse JSON file and convert to jobs
 */
export function parseJSONToJobs(jsonText: string): Partial<Job>[] {
  try {
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}


