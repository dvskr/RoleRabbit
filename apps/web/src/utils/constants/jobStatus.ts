/**
 * Job Application Status Constants
 */

export const JOB_STATUS = {
  SAVED: 'SAVED',
  APPLIED: 'APPLIED',
  PHONE_SCREEN: 'PHONE_SCREEN',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  SAVED: 'bg-gray-500',
  APPLIED: 'bg-blue-500',
  PHONE_SCREEN: 'bg-yellow-500',
  INTERVIEW: 'bg-purple-500',
  OFFER: 'bg-green-500',
  REJECTED: 'bg-red-500',
  WITHDRAWN: 'bg-gray-400'
};
