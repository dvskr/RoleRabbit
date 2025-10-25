export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
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
}

export interface JobFilters {
  status: string;
  searchTerm: string;
  sortBy: string;
  groupBy: 'status' | 'company' | 'priority' | 'date';
  showArchived: boolean;
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
