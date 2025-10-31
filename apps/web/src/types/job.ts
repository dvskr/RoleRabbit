export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  lastUpdated?: string;
  deletedAt?: string; // For recycle bin functionality
  salary?: string;
  description?: string;
  url?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  requirements?: string[];
  benefits?: string[];
  remote?: boolean;
  companySize?: string;
  industry?: string;
  nextStep?: string;
  nextStepDate?: string;
}

export interface JobFilters {
  status: string;
  searchTerm: string;
  sortBy: string;
  groupBy: 'status' | 'company' | 'priority' | 'date';
  showArchived: boolean;
  priority?: 'all' | 'high' | 'medium' | 'low';
  location?: string;
  dateRange?: { start?: string; end?: string };
  showDeleted?: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  filters: JobFilters;
  columns: string[];
  createdAt: string;
}

export interface JobStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  favorites: number;
}

export type ViewMode = 'list' | 'grid' | 'kanban' | 'table';
