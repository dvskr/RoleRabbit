/**
 * Contact Type Definitions
 * Used for professional contact management
 */

export type ContactGroup = 'Network' | 'Recruiters' | 'Hiring Managers' | 'Other';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  role: string;
  avatar?: string;
  tags: string[];
  group: ContactGroup;
  notes?: string;
  lastContactDate?: string;
  emailCount: number;
  phoneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFilters {
  searchTerm: string;
  group?: ContactGroup | 'All';
  tags: string[];
  sortBy: 'name' | 'company' | 'lastContact';
}

export interface ContactStats {
  totalContacts: number;
  recruiters: number;
  hiringManagers: number;
  network: number;
  other: number;
  contactsLastMonth: number;
  activeContacts: number;
}

