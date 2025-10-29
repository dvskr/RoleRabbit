/**
 * Email Type Constants
 */

export const EMAIL_TYPES = {
  FOLLOW_UP: 'followup',
  THANK_YOU: 'thank_you',
  NETWORKING: 'networking',
  INQUIRY: 'inquiry',
  OTHER: 'other'
} as const;

export type EmailType = typeof EMAIL_TYPES[keyof typeof EMAIL_TYPES];

export const EMAIL_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  FAILED: 'failed',
  SCHEDULED: 'scheduled'
} as const;

export type EmailStatus = typeof EMAIL_STATUS[keyof typeof EMAIL_STATUS];

