/**
 * Constants for EditableJobTable component
 * Extracted from EditableJobTable.tsx for better organization
 */

import { Job } from '../../../types/job';
import type { Column } from '../types/jobTable.types';

export const defaultColumns: Column[] = [
  { key: 'checkbox', label: '', visible: true, order: 0, width: 40 },
  { key: 'favorite', label: '', visible: true, order: 1, width: 40 },
  { key: 'company', label: 'Company', visible: true, order: 2, width: 150 },
  { key: 'title', label: 'Position', visible: true, order: 3, width: 200 },
  { key: 'status', label: 'Status', visible: true, order: 4, width: 120 },
  { key: 'priority', label: 'Priority', visible: true, order: 5, width: 100 },
  { key: 'location', label: 'Location', visible: true, order: 6, width: 120 },
  { key: 'salary', label: 'Salary', visible: true, order: 7, width: 120 },
  { key: 'appliedDate', label: 'Applied Date', visible: true, order: 8, width: 140 },
  { key: 'lastUpdated', label: 'Last Updated', visible: true, order: 9, width: 140 },
  { key: 'contact', label: 'Contact', visible: true, order: 10, width: 150 },
  { key: 'email', label: 'Email', visible: true, order: 11, width: 180 },
  { key: 'phone', label: 'Phone', visible: true, order: 12, width: 150 },
  { key: 'nextStep', label: 'Next Step', visible: true, order: 13, width: 180 },
  { key: 'nextStepDate', label: 'Next Step Date', visible: true, order: 14, width: 140 },
  { key: 'url', label: 'Job URL', visible: true, order: 15, width: 200 },
  { key: 'notes', label: 'Notes', visible: true, order: 16, width: 200 },
];

export const statusOptions: Job['status'][] = ['applied', 'interview', 'offer', 'rejected'];
export const priorityOptions: Job['priority'][] = ['high', 'medium', 'low'];

/**
 * Sample preloaded data for testing/demo purposes
 */
export const getSampleJobs = (): Job[] => [
  {
    id: 'sample-1',
    title: 'Frontend Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    status: 'applied',
    priority: 'high',
    appliedDate: '2025-01-15',
    salary: '$120k - $160k',
    url: 'https://techcorp.com/careers/frontend',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah.j@techcorp.com',
      phone: '+1 (555) 123-4567'
    },
    notes: 'Great opportunity at a leading tech company',
  },
  {
    id: 'sample-2',
    title: 'Senior React Developer',
    company: 'Innovate Labs',
    location: 'Remote',
    status: 'interview',
    priority: 'medium',
    appliedDate: '2025-01-10',
    salary: '$130k - $170k',
    url: 'https://innovatelabs.com/jobs/senior-react',
    contact: {
      name: 'Mike Chen',
      email: 'mike.chen@innovatelabs.com',
      phone: '+1 (555) 987-6543'
    },
    notes: 'Second round interview scheduled',
  }
];

export const STORAGE_KEY_COLUMNS = 'jobTableColumns';

