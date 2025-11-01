import { CredentialType } from './types';

export const CREDENTIAL_TYPES: { value: CredentialType; label: string }[] = [
  { value: 'certification', label: 'Certification' },
  { value: 'license', label: 'License' },
  { value: 'visa', label: 'Visa' },
  { value: 'degree', label: 'Degree' },
  { value: 'badge', label: 'Badge' },
];

export const MODAL_OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.85)';

export const CREDENTIAL_HEADER = {
  title: 'Credential Management',
  description: 'Track certifications, licenses, and credentials',
};

export const EMPTY_STATE = {
  title: 'No Credentials Added',
  description: 'Start tracking your certifications, licenses, and credentials',
  buttonText: 'Add Your First Credential',
};

export const REMINDERS_SECTION = {
  title: 'Upcoming Expirations',
};

