/**
 * Type definitions for EditableJobTable component
 * Extracted from EditableJobTable.tsx for better organization
 */

import { Job, ViewMode, JobFilters, SavedView } from '../../../types/job';

export interface EditableJobTableProps {
  jobs: Job[];
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: string, permanent?: boolean) => void;
  onRestore?: (jobId: string) => void;
  onView?: (job: Job) => void;
  onAdd?: () => void;
  onUpdate?: (job: Job) => void;
  onCreate?: (job: Partial<Job>) => void;
  favorites?: string[];
  onToggleFavorite?: (jobId: string) => void;
  selectedJobs?: string[];
  onToggleSelection?: (jobId: string) => void;
  onImport?: () => void;
  onBulkDelete?: (permanent?: boolean) => void;
  onBulkRestore?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onShowFilters?: () => void;
  showDeleted?: boolean;
  filters?: JobFilters;
  onFiltersChange?: (filters: JobFilters) => void;
  savedViews?: SavedView[];
  onSaveView?: (view: Omit<SavedView, 'id' | 'createdAt'>) => void;
  onDeleteView?: (viewId: string) => void;
  onLoadView?: (view: SavedView) => void;
}

export type ColumnKey = 
  | 'checkbox' 
  | 'favorite' 
  | 'company' 
  | 'title' 
  | 'status' 
  | 'priority' 
  | 'location' 
  | 'salary' 
  | 'appliedDate' 
  | 'lastUpdated' 
  | 'contact' 
  | 'email' 
  | 'phone' 
  | 'nextStep' 
  | 'nextStepDate' 
  | 'url' 
  | 'notes';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column {
  key: ColumnKey;
  label: string;
  visible: boolean;
  order: number;
  width?: number;
}

export interface EditingCell {
  jobId: string;
  field: ColumnKey;
}

export interface SortState {
  field: ColumnKey;
  direction: SortDirection;
}

export interface ResizingColumn {
  index: number;
  startX: number;
  startWidth: number;
}


