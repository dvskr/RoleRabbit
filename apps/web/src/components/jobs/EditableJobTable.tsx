'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Columns, Plus, Trash2, Eye, X, ArrowUpDown, ArrowUp, ArrowDown, Download, Upload, Star, CheckSquare, Filter as FilterIcon, List, Grid, Layout, RotateCcw, Trash, Trash as TrashIcon, Search, Calendar, BarChart3, Settings, Building2, Briefcase } from 'lucide-react';
import { Job, ViewMode, JobFilters, SavedView } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';
import { getStatusBadgeStyles, getPriorityBadgeStyles } from '../../utils/themeHelpers';
import { exportToCSV } from '../../utils/exportHelpers';
import JobFiltersPanel from './JobFiltersPanel';

interface EditableJobTableProps {
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

type ColumnKey = 'checkbox' | 'favorite' | 'company' | 'title' | 'status' | 'priority' | 'location' | 'salary' | 'appliedDate' | 'lastUpdated' | 'contact' | 'email' | 'phone' | 'nextStep' | 'nextStepDate' | 'url' | 'notes';
type SortDirection = 'asc' | 'desc' | null;

interface Column {
  key: ColumnKey;
  label: string;
  visible: boolean;
  order: number;
  width?: number;
}

const defaultColumns: Column[] = [
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

const statusOptions: Job['status'][] = ['applied', 'interview', 'offer', 'rejected'];
const priorityOptions: Job['priority'][] = ['high', 'medium', 'low'];

// Sample preloaded data
const getSampleJobs = (): Job[] => [
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

export default function EditableJobTable({
  jobs: propsJobs,
  onEdit,
  onDelete,
  onRestore,
  onView,
  onAdd,
  onUpdate,
  onCreate,
  favorites = [],
  onToggleFavorite,
  selectedJobs = [],
  onToggleSelection,
  onImport,
  onBulkDelete,
  onBulkRestore,
  viewMode,
  onViewModeChange,
  onShowFilters,
  showDeleted = false,
  filters: externalFilters,
  onFiltersChange,
  savedViews = [],
  onSaveView,
  onDeleteView,
  onLoadView
}: EditableJobTableProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Merge props jobs with sample data if needed
  const [jobs, setJobs] = useState<Job[]>(() => {
    const merged = [...getSampleJobs(), ...propsJobs];
    // Ensure each job has a lastUpdated field
    return merged.map(job => ({
      ...job,
      lastUpdated: job.lastUpdated || job.appliedDate || new Date().toISOString().split('T')[0],
    }));
  });
  
  // Update jobs when props change
  useEffect(() => {
    const merged = [...getSampleJobs(), ...propsJobs];
    setJobs(merged.map(job => ({
      ...job,
      lastUpdated: job.lastUpdated || job.appliedDate || new Date().toISOString().split('T')[0]
    })));
  }, [propsJobs]);
  
  const [columns, setColumns] = useState<Column[]>(() => {
    // Always start with all default columns visible
    // We'll respect localStorage for widths and order, but force visibility on first render
    return defaultColumns;
  });
  
  // Initialize columns from localStorage and ensure all are visible
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobTableColumns');
      if (saved) {
        const savedCols = JSON.parse(saved);
        // Merge with defaultColumns - preserve saved widths/order but ensure all are visible
        const merged = defaultColumns.map(defaultCol => {
          const savedCol = savedCols.find((c: Column) => c.key === defaultCol.key);
          if (savedCol) {
            // Keep saved width and order, but force visible for data columns
            return defaultCol.key !== 'checkbox' && defaultCol.key !== 'favorite'
              ? { ...defaultCol, width: savedCol.width || defaultCol.width, order: savedCol.order !== undefined ? savedCol.order : defaultCol.order, visible: true }
              : { ...defaultCol, width: savedCol.width, order: savedCol.order !== undefined ? savedCol.order : defaultCol.order };
          }
          return defaultCol; // New column from defaults
        });
        // Add any additional columns that might exist
        savedCols.forEach((savedCol: Column) => {
          if (!merged.find(c => c.key === savedCol.key)) {
            merged.push(savedCol);
          }
        });
        setColumns(merged.sort((a, b) => a.order - b.order));
      } else {
        // No saved data - use defaults (all visible)
        setColumns(defaultColumns);
      }
    } catch {
      setColumns(defaultColumns);
    }
  }, []); // Only run once on mount
  
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [editingCell, setEditingCell] = useState<{ jobId: string; field: ColumnKey } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [newRowData, setNewRowData] = useState<Partial<Job>>({});
  const [sortBy, setSortBy] = useState<{ field: ColumnKey; direction: SortDirection } | null>(null);
  const [resizingColumn, setResizingColumn] = useState<{ index: number; startX: number; startWidth: number } | null>(null);
  
  // Initialize table filters from external filters or defaults
  const [tableFilters, setTableFilters] = useState<JobFilters>(() => 
    externalFilters || {
      status: 'all',
      searchTerm: '',
      sortBy: 'date',
      groupBy: 'status',
      showArchived: false,
      showDeleted: showDeleted,
    }
  );
  
  // Sync external filters when they change
  React.useEffect(() => {
    if (externalFilters) {
      setTableFilters(externalFilters);
    }
  }, [externalFilters]);
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save columns to localStorage
  useEffect(() => {
    localStorage.setItem('jobTableColumns', JSON.stringify(columns));
  }, [columns]);

  const visibleColumns = columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current instanceof HTMLInputElement && inputRef.current.type === 'text') {
          inputRef.current.select();
        }
      }, 0);
    }
  }, [editingCell]);

  // Column resize handler
  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizingColumn.startX;
      const newWidth = Math.max(60, resizingColumn.startWidth + diff);
      
      setColumns(cols => cols.map(col => {
        if (col.key === visibleColumns[resizingColumn.index].key) {
          return { ...col, width: newWidth };
        }
        return col;
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, visibleColumns]);

  const toggleColumn = (key: ColumnKey) => {
    setColumns(cols => {
      const newCols = cols.map(col => col.key === key ? { ...col, visible: !col.visible } : col);
      const visibleCount = newCols.filter(col => col.visible && col.key !== 'checkbox' && col.key !== 'favorite').length;
      if (visibleCount === 0 && key !== 'checkbox' && key !== 'favorite') {
        return cols.map(col => col.key === key ? { ...col, visible: true } : col);
      }
      return newCols;
    });
  };

  const handleSort = (field: ColumnKey) => {
    if (field === 'checkbox' || field === 'favorite') return;
    if (sortBy?.field === field) {
      setSortBy(sortBy.direction === 'asc' ? { field, direction: 'desc' } : null);
    } else {
      setSortBy({ field, direction: 'asc' });
    }
  };

  const sortedAndGroupedJobs = useCallback(() => {
    let filtered = [...jobs];
    
    // Apply filters
    if (tableFilters.showDeleted) {
      filtered = filtered.filter(job => job.deletedAt);
    } else {
      filtered = filtered.filter(job => !job.deletedAt);
    }
    
    // Search term filtering
    if (tableFilters.searchTerm) {
      const searchLower = tableFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        (job.contact?.name && job.contact.name.toLowerCase().includes(searchLower)) ||
        (job.contact?.email && job.contact.email.toLowerCase().includes(searchLower)) ||
        (job.notes && job.notes.toLowerCase().includes(searchLower))
      );
    }
    
    if (tableFilters.status !== 'all') {
      filtered = filtered.filter(job => job.status === tableFilters.status);
    }
    
    if (tableFilters.priority && tableFilters.priority !== 'all') {
      filtered = filtered.filter(job => job.priority === tableFilters.priority);
    }
    
    if (tableFilters.location) {
      const locationLower = tableFilters.location.toLowerCase();
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    if (tableFilters.dateRange?.start || tableFilters.dateRange?.end) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.appliedDate);
        if (tableFilters.dateRange?.start) {
          const startDate = new Date(tableFilters.dateRange.start);
          if (jobDate < startDate) return false;
        }
        if (tableFilters.dateRange?.end) {
          const endDate = new Date(tableFilters.dateRange.end);
          if (jobDate > endDate) return false;
        }
        return true;
      });
    }
    
    // Sort
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        
        if (sortBy.field === 'contact') {
          aVal = a.contact?.name || '';
          bVal = b.contact?.name || '';
        } else if (sortBy.field === 'email') {
          aVal = a.contact?.email || '';
          bVal = b.contact?.email || '';
        } else if (sortBy.field === 'phone') {
          aVal = a.contact?.phone || '';
          bVal = b.contact?.phone || '';
        } else {
          aVal = a[sortBy.field as keyof Job];
          bVal = b[sortBy.field as keyof Job];
        }
        
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        let comp = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const aDate = new Date(aVal);
          const bDate = new Date(bVal);
          if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime()) && aVal.includes('-')) {
            comp = aDate.getTime() - bDate.getTime();
          } else {
            comp = aVal.localeCompare(bVal);
          }
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comp = aVal - bVal;
        } else {
          comp = String(aVal).localeCompare(String(bVal));
        }
        
        return sortBy.direction === 'asc' ? comp : -comp;
      });
    } else if (tableFilters.sortBy) {
      // Apply filter sortBy if no column sort
      filtered.sort((a, b) => {
        if (tableFilters.sortBy === 'date') {
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        }
        if (tableFilters.sortBy === 'company') {
          return a.company.localeCompare(b.company);
        }
        if (tableFilters.sortBy === 'priority') {
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1, undefined: 0 };
          return (priorityOrder[b.priority || 'undefined'] || 0) - (priorityOrder[a.priority || 'undefined'] || 0);
        }
        if (tableFilters.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    }
    
    return filtered;
  }, [jobs, sortBy, tableFilters]);

  const displayJobs = sortedAndGroupedJobs();
  
  // Group jobs if groupBy is set
  const groupedJobs = useMemo(() => {
    if (!tableFilters.groupBy || tableFilters.groupBy === 'status') {
      return { 'All': displayJobs };
    }
    
    const groups: Record<string, Job[]> = {};
    displayJobs.forEach(job => {
      let key = 'Other';
      if (tableFilters.groupBy === 'company') {
        key = job.company || 'Other';
      } else if (tableFilters.groupBy === 'priority') {
        key = job.priority || 'No Priority';
      } else if (tableFilters.groupBy === 'date') {
        const date = new Date(job.appliedDate);
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
    });
    
    return groups;
  }, [displayJobs, tableFilters.groupBy]);
  
  const shouldShowGroups = tableFilters.groupBy && tableFilters.groupBy !== 'status';

  const startEditing = useCallback((jobId: string, field: ColumnKey, currentValue: any) => {
    if (field === 'checkbox' || field === 'favorite') return;
    setEditingCell({ jobId, field });
    setEditingValue(String(currentValue || ''));
    if (jobId === 'new') {
      setNewRowData(prev => ({ ...prev, [field]: currentValue || '' }));
    }
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingCell) return;

    if (editingCell.jobId === 'new') {
      setNewRowData(prev => ({
        ...prev,
        [editingCell.field]: editingValue,
        // Update contact object for contact fields
        contact: editingCell.field === 'contact' || editingCell.field === 'email' || editingCell.field === 'phone'
          ? {
              ...prev.contact,
              ...(editingCell.field === 'contact' ? { name: editingValue } : {}),
              ...(editingCell.field === 'email' ? { email: editingValue } : {}),
              ...(editingCell.field === 'phone' ? { phone: editingValue } : {}),
            }
          : prev.contact
      }));
    } else if (onUpdate) {
      const job = displayJobs.find(j => j.id === editingCell.jobId);
      if (job) {
        const updatedJob = {
          ...job,
          [editingCell.field]: editingValue,
          lastUpdated: new Date().toISOString().split('T')[0], // Update timestamp
          // Update contact object for contact fields
          contact: editingCell.field === 'contact' || editingCell.field === 'email' || editingCell.field === 'phone'
            ? {
                ...job.contact,
                ...(editingCell.field === 'contact' ? { name: editingValue } : {}),
                ...(editingCell.field === 'email' ? { email: editingValue } : {}),
                ...(editingCell.field === 'phone' ? { phone: editingValue } : {}),
              }
            : job.contact
        };
        onUpdate(updatedJob as Job);
      }
    }
    
    setEditingCell(null);
  }, [editingCell, editingValue, onUpdate, displayJobs]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, jobId: string, field: ColumnKey) => {
    if (field === 'checkbox' || field === 'favorite') return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (field === 'notes') return; // Allow Enter in textarea
      
      saveEdit();
      
      // Move to next cell in same row
      const colIndex = visibleColumns.findIndex(col => col.key === field);
      if (colIndex < visibleColumns.length - 1) {
        const nextField = visibleColumns[colIndex + 1].key;
        if (nextField === 'checkbox' || nextField === 'favorite') {
          if (colIndex + 2 < visibleColumns.length) {
            const nextNextField = visibleColumns[colIndex + 2].key;
            const nextValue = jobId === 'new' 
              ? (nextNextField === 'contact' || nextNextField === 'email' || nextNextField === 'phone'
                  ? newRowData.contact?.[nextNextField === 'contact' ? 'name' : nextNextField === 'email' ? 'email' : 'phone']
                  : newRowData[nextNextField as keyof Partial<Job>])
              : displayJobs.find(j => j.id === jobId)?.[nextNextField as keyof Job] || 
                (nextNextField === 'contact' || nextNextField === 'email' || nextNextField === 'phone'
                  ? displayJobs.find(j => j.id === jobId)?.contact?.[nextNextField === 'contact' ? 'name' : nextNextField === 'email' ? 'email' : 'phone']
                  : '');
            setTimeout(() => startEditing(jobId, nextNextField, nextValue), 0);
          }
        } else {
          const nextValue = jobId === 'new' 
            ? (nextField === 'contact' || nextField === 'email' || nextField === 'phone'
                ? newRowData.contact?.[nextField === 'contact' ? 'name' : nextField === 'email' ? 'email' : 'phone']
                : newRowData[nextField as keyof Partial<Job>])
            : displayJobs.find(j => j.id === jobId)?.[nextField as keyof Job] || 
              (nextField === 'contact' || nextField === 'email' || nextField === 'phone'
                ? displayJobs.find(j => j.id === jobId)?.contact?.[nextField === 'contact' ? 'name' : nextField === 'email' ? 'email' : 'phone']
                : '');
          setTimeout(() => startEditing(jobId, nextField, nextValue), 0);
        }
      }
      return;
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      saveEdit();
      
      const colIndex = visibleColumns.findIndex(col => col.key === field);
      
      if (e.shiftKey) {
        // Shift+Tab: previous cell
        let prevIndex = colIndex - 1;
        while (prevIndex >= 0 && (visibleColumns[prevIndex].key === 'checkbox' || visibleColumns[prevIndex].key === 'favorite')) {
          prevIndex--;
        }
        if (prevIndex >= 0) {
          const prevField = visibleColumns[prevIndex].key;
          const prevValue = jobId === 'new' 
            ? (prevField === 'contact' || prevField === 'email' || prevField === 'phone'
                ? newRowData.contact?.[prevField === 'contact' ? 'name' : prevField === 'email' ? 'email' : 'phone']
                : newRowData[prevField as keyof Partial<Job>])
            : displayJobs.find(j => j.id === jobId)?.[prevField as keyof Job] || 
              (prevField === 'contact' || prevField === 'email' || prevField === 'phone'
                ? displayJobs.find(j => j.id === jobId)?.contact?.[prevField === 'contact' ? 'name' : prevField === 'email' ? 'email' : 'phone']
                : '');
          setTimeout(() => startEditing(jobId, prevField, prevValue), 0);
        }
      } else {
        // Tab: next cell
        let nextIndex = colIndex + 1;
        while (nextIndex < visibleColumns.length && (visibleColumns[nextIndex].key === 'checkbox' || visibleColumns[nextIndex].key === 'favorite')) {
          nextIndex++;
        }
        if (nextIndex < visibleColumns.length) {
          const nextField = visibleColumns[nextIndex].key;
          const nextValue = jobId === 'new' 
            ? (nextField === 'contact' || nextField === 'email' || nextField === 'phone'
                ? newRowData.contact?.[nextField === 'contact' ? 'name' : nextField === 'email' ? 'email' : 'phone']
                : newRowData[nextField as keyof Partial<Job>])
            : displayJobs.find(j => j.id === jobId)?.[nextField as keyof Job] || 
              (nextField === 'contact' || nextField === 'email' || nextField === 'phone'
                ? displayJobs.find(j => j.id === jobId)?.contact?.[nextField === 'contact' ? 'name' : nextField === 'email' ? 'email' : 'phone']
                : '');
          setTimeout(() => startEditing(jobId, nextField, nextValue), 0);
        } else if (jobId !== 'new' && onCreate) {
          // Last column - create new row if editing existing row
          const currentJob = displayJobs.find(j => j.id === jobId);
          if (currentJob && currentJob.title) {
            const newJob: Partial<Job> = {
              title: '',
              company: '',
              status: 'applied',
              appliedDate: new Date().toISOString().split('T')[0],
              contact: {}
            };
            setNewRowData(newJob);
            setTimeout(() => startEditing('new', visibleColumns.find(col => col.key !== 'checkbox' && col.key !== 'favorite')?.key || 'company', ''), 0);
          }
        }
      }
      return;
    }
    
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingCell(null);
      if (jobId === 'new') {
        setNewRowData({});
      }
    }
  }, [visibleColumns, displayJobs, newRowData, saveEdit, startEditing, onCreate]);

  const handleCellClick = (jobId: string, field: ColumnKey, value: any) => {
    if (field === 'checkbox' || field === 'favorite') return;
    if (editingCell?.jobId === jobId && editingCell?.field === field) return;
    startEditing(jobId, field, value);
  };

  const handleStatusChange = (jobId: string, newStatus: Job['status']) => {
    if (jobId === 'new') {
      setNewRowData(prev => ({ ...prev, status: newStatus }));
      setEditingCell(null);
      return;
    }
    const job = displayJobs.find(j => j.id === jobId);
    if (job && onUpdate) {
      onUpdate({ ...job, status: newStatus });
    }
    setEditingCell(null);
  };

  const handlePriorityChange = (jobId: string, newPriority: Job['priority']) => {
    if (jobId === 'new') {
      setNewRowData(prev => ({ ...prev, priority: newPriority }));
      setEditingCell(null);
      return;
    }
    const job = displayJobs.find(j => j.id === jobId);
    if (job && onUpdate) {
      onUpdate({ ...job, priority: newPriority });
    }
    setEditingCell(null);
  };

  const startNewRow = () => {
    setNewRowData({
      title: '',
      company: '',
      location: '',
      salary: '',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      contact: {}
    });
    const firstEditableField = visibleColumns.find(col => col.key !== 'checkbox' && col.key !== 'favorite')?.key || 'company';
    startEditing('new', firstEditableField, '');
  };

  const saveNewRow = () => {
    if (!onCreate) return;
    
    // Ensure required fields are present
    const jobData: Partial<Job> = {
      title: newRowData.title?.trim() || 'Untitled Job',
      company: newRowData.company?.trim() || '',
      location: newRowData.location?.trim() || '',
      status: (newRowData.status || 'applied') as Job['status'],
      appliedDate: newRowData.appliedDate || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      salary: newRowData.salary || '',
      url: newRowData.url || '',
      notes: newRowData.notes || '',
      nextStep: newRowData.nextStep || '',
      nextStepDate: newRowData.nextStepDate || '',
      priority: newRowData.priority,
      contact: newRowData.contact || {},
      ...newRowData,
    };
    
    // Only create if at least title or company is provided
    if (jobData.title !== 'Untitled Job' || jobData.company) {
      onCreate(jobData);
      setNewRowData({});
      setEditingCell(null);
    }
  };

  const handleExportCSV = () => {
    const exportData = displayJobs.map(job => ({
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
      'Next Step': job.notes || '',
      'Job URL': job.url || '',
      Notes: job.notes || ''
    }));
    exportToCSV(exportData, 'jobs-export');
  };

  const handleImportCSV = () => {
    if (onImport) {
      onImport();
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.json';
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const text = event.target?.result as string;
              if (file.name.endsWith('.csv')) {
                // Parse CSV
                const lines = text.split('\n');
                const headers = lines[0].split(',');
                const importedJobs = lines.slice(1).filter(line => line.trim()).map(line => {
                  const values = line.split(',');
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
                  return job;
                });
                importedJobs.forEach(job => onCreate && onCreate(job));
                alert(`Successfully imported ${importedJobs.length} job(s)`);
              } else {
                // Parse JSON
                const importedJobs = JSON.parse(text);
                if (Array.isArray(importedJobs)) {
                  importedJobs.forEach((job: any) => onCreate && onCreate(job));
                  alert(`Successfully imported ${importedJobs.length} job(s)`);
                }
              }
            } catch (error) {
              alert('Failed to import jobs. Please check the file format.');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  const renderCellContent = (job: Partial<Job> | Job, column: ColumnKey, jobId: string) => {
    const isEditing = editingCell?.jobId === jobId && editingCell?.field === column;
    
      if (column === 'checkbox') {
      const isSelected = jobId === 'new' ? false : selectedJobs.includes(jobId);
        return (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSelection && jobId !== 'new') {
                onToggleSelection(jobId);
              }
            }}
            className="p-0.5 rounded transition-all flex items-center justify-center"
            style={{ 
              color: isSelected ? colors.primaryBlue : colors.tertiaryText,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              if (!isSelected) {
                e.currentTarget.style.color = colors.primaryBlue;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isSelected ? colors.primaryBlue : colors.tertiaryText;
            }}
            title={isSelected ? 'Deselect row' : 'Select row'}
            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${job.title || 'row'}`}
          >
            <CheckSquare 
              size={16} 
              fill={isSelected ? colors.primaryBlue : 'none'} 
              strokeWidth={isSelected ? 0 : 1.5}
              style={{ 
                color: isSelected ? colors.primaryBlue : colors.tertiaryText,
              }}
            />
          </button>
        </div>
      );
    }
    
    if (column === 'favorite') {
      const isFavorite = jobId === 'new' ? false : favorites.includes(jobId);
        return (
        <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite && jobId !== 'new') {
                  onToggleFavorite(jobId);
                }
              }}
              className="p-0.5 rounded transition-all"
              style={{ 
                color: isFavorite ? '#fbbf24' : colors.tertiaryText,
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = '#fbbf24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = isFavorite ? '#fbbf24' : colors.tertiaryText;
              }}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={isFavorite ? '#fbbf24' : 'none'} strokeWidth={isFavorite ? 0 : 1.5} />
            </button>
          </div>
        );
    }

    let value: any;
    if (column === 'contact') {
      value = job.contact?.name || '';
    } else if (column === 'email') {
      value = job.contact?.email || '';
    } else if (column === 'phone') {
      value = job.contact?.phone || '';
    } else {
      value = job[column as keyof Job];
    }

    switch (column) {
      case 'status':
        if (isEditing) {
        return (
            <select
              ref={inputRef as any}
              value={editingValue || job.status || 'applied'}
              onChange={(e) => {
                setEditingValue(e.target.value);
                handleStatusChange(jobId, e.target.value as Job['status']);
              }}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
              }}
              title="Select status"
              aria-label="Job status"
              autoFocus
            >
              {statusOptions.map(status => (
                <option key={status} value={status} style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>
                  {status}
                </option>
              ))}
            </select>
          );
        }
        // Status badges matching the design: purple (interview), blue (applied), green (offer), red (rejected)
        const statusColors: Record<Job['status'], { bg: string; text: string }> = {
          'interview': { bg: '#8b5cf6', text: 'white' }, // Purple
          'applied': { bg: '#3b82f6', text: 'white' }, // Blue
          'offer': { bg: '#10b981', text: 'white' }, // Green
          'rejected': { bg: '#ef4444', text: 'white' }, // Red
        };
        const statusColor = statusColors[(job.status || 'applied') as Job['status']] || statusColors.applied;
        return (
          <span 
            className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            style={{
              background: statusColor.bg,
              color: statusColor.text,
            }}
          >
            {job.status || 'applied'}
          </span>
        );

      case 'priority':
        if (isEditing) {
          return (
            <select
              ref={inputRef as any}
              value={editingValue || job.priority || ''}
              onChange={(e) => {
                setEditingValue(e.target.value);
                handlePriorityChange(jobId, e.target.value as Job['priority'] || undefined);
              }}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
              }}
              title="Select priority"
              aria-label="Job priority"
              autoFocus
            >
              <option value="" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>None</option>
              {priorityOptions.map(priority => (
                <option key={priority} value={priority} style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>
                  {priority}
                </option>
              ))}
            </select>
          );
        }
        if (!job.priority) return <span className="text-sm" style={{ color: colors.tertiaryText }}>—</span>;
        const priorityBadge = getPriorityBadgeStyles(job.priority, colors);
        return (
          <span 
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              background: priorityBadge.background,
              color: priorityBadge.color,
              border: `1px solid ${priorityBadge.border}`,
            }}
          >
            {job.priority}
          </span>
        );

      case 'notes':
      case 'nextStep':
        if (isEditing) {
        return (
            <textarea
              ref={inputRef as any}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm resize-none transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
                minHeight: '60px',
              }}
              rows={2}
              placeholder="Enter notes..."
              title="Job notes"
              aria-label="Job notes"
              autoFocus
            />
          );
        }
        return (
          <div className="text-sm truncate max-w-xs" style={{ color: colors.secondaryText }} title={(column === 'notes' ? job.notes : job.notes) || ''}>
            {(column === 'notes' ? job.notes : job.notes) || '—'}
          </div>
        );

      case 'appliedDate':
      case 'lastUpdated':
      case 'nextStepDate':
        if (isEditing) {
        return (
            <input
              ref={inputRef as any}
              type="date"
              value={editingValue || (job[column as keyof Job] as string) || ''}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
              }}
              title={column === 'appliedDate' ? 'Applied date' : column === 'lastUpdated' ? 'Last updated' : 'Next step date'}
              aria-label={column === 'appliedDate' ? 'Applied date' : column === 'lastUpdated' ? 'Last updated' : 'Next step date'}
              autoFocus
            />
          );
        }
        const dateValue = column === 'lastUpdated' ? (job.lastUpdated || job.appliedDate) : job[column as keyof Job];
        return (
          <div className="text-sm" style={{ color: colors.secondaryText }}>
            {dateValue ? new Date(dateValue as string).toLocaleDateString() : '—'}
          </div>
        );

      case 'url':
        if (isEditing) {
          return (
            <input
              ref={inputRef as any}
              type="url"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
              }}
              placeholder="https://..."
              title="Job URL"
              aria-label="Job application URL"
              autoFocus
            />
          );
        }
        return value ? (
          <a 
            href={value as string} 
            target="_blank" 
            rel="noopener noreferrer"
            className="truncate max-w-xs block text-sm transition-all"
            style={{ color: colors.primaryBlue }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(value as string).substring(0, 40)}...
          </a>
        ) : (
          <span className="text-sm" style={{ color: colors.tertiaryText }}>—</span>
        );

      case 'contact':
      case 'email':
      case 'phone':
        if (isEditing) {
          return (
            <input
              ref={inputRef as any}
              type={column === 'email' ? 'email' : 'text'}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
              }}
              placeholder={column === 'contact' ? 'Contact name...' : column === 'email' ? 'email@example.com' : '+1 (555) 000-0000'}
              title={column === 'contact' ? 'Contact name' : column === 'email' ? 'Email address' : 'Phone number'}
              aria-label={column === 'contact' ? 'Contact name' : column === 'email' ? 'Email address' : 'Phone number'}
              autoFocus
            />
          );
        }
        return (
          <div className="text-sm" style={{ color: colors.secondaryText }}>
            {value || '—'}
          </div>
        );

      case 'company':
        if (isEditing) {
          return (
            <input
              ref={inputRef as any}
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
              }}
              placeholder="Company name..."
              title="Company name"
              aria-label="Company name"
              autoFocus
            />
          );
        }
        const companyValue = value || '';
        return (
          <div className="flex items-center gap-2">
            {/* Company Icon Badge - Purple background with building icon */}
            <div 
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: '#8b5cf6', // Purple background matching design
              }}
            >
              <Building2 size={14} style={{ color: 'white' }} />
            </div>
            <span className="text-sm" style={{ color: colors.secondaryText }}>
              {companyValue || (jobId === 'new' ? '' : '—')}
            </span>
          </div>
        );

      default:
        if (isEditing) {
          return (
            <input
              ref={inputRef as any}
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, jobId, column)}
              onBlur={() => {
                if (jobId !== 'new') saveEdit();
              }}
              className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.borderFocused}`,
                color: colors.primaryText,
              }}
              placeholder={column === 'title' ? 'Job title...' : column === 'location' ? 'Location...' : column === 'salary' ? '$0,000' : ''}
              title={column === 'title' ? 'Job title' : column === 'location' ? 'Location' : column === 'salary' ? 'Salary' : column === 'nextStep' ? 'Next step' : column === 'nextStepDate' ? 'Next step date' : ''}
              aria-label={column || ''}
              autoFocus
            />
          );
        }
        const displayValue = value || '';
        const style = column === 'title' 
          ? { color: colors.primaryText, fontWeight: 500 }
          : column === 'salary'
          ? { color: colors.badgeSuccessText, fontWeight: 500 }
          : { color: colors.secondaryText };

  return (
          <div className="text-sm" style={style}>
            {displayValue || (jobId === 'new' ? '' : '—')}
        </div>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className="rounded-lg overflow-hidden flex flex-col h-full"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        minHeight: 0, // Allow flex container to shrink
      }}
    >
      {/* Toolbar - Matching Design from Screenshot */}
      <div 
        className="px-4 py-2.5 flex items-center justify-between gap-3 flex-shrink-0"
        style={{
          borderBottom: `1px solid ${colors.border}`,
          background: colors.toolbarBackground,
        }}
      >
        {/* Left Side - Search and Quick Filters */}
        <div className="flex items-center gap-2 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2" 
              style={{ color: colors.tertiaryText }}
            />
            <input
              type="text"
              placeholder="Search jobs..."
              value={tableFilters.searchTerm || ''}
              onChange={(e) => {
                const newFilters = { ...tableFilters, searchTerm: e.target.value };
                setTableFilters(newFilters);
                if (onFiltersChange) {
                  onFiltersChange(newFilters);
                }
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm transition-all outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
        </div>
        
          {/* Quick Filter Buttons: All, Date, Filters */}
          <button
            onClick={() => {
              const newFilters = { ...tableFilters, status: 'all', priority: undefined, location: undefined, dateRange: undefined };
              setTableFilters(newFilters);
              if (onFiltersChange) {
                onFiltersChange(newFilters);
              }
            }}
            className="px-3 py-1.5 rounded-md text-sm transition-all"
            style={{
              background: tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange
                ? colors.badgePurpleBg
                : colors.inputBackground,
              border: `1px solid ${
                tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange
                  ? colors.badgePurpleBorder
                  : colors.border
              }`,
              color: tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange
                ? colors.activeText
                : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!(tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange)) {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!(tableFilters.status === 'all' && !tableFilters.priority && !tableFilters.location && !tableFilters.dateRange)) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title="Show All"
          >
            All
          </button>

          <button
            onClick={() => {
              // Sort by date (newest first)
              const newFilters = { ...tableFilters, sortBy: 'date' };
              setTableFilters(newFilters);
              if (onFiltersChange) {
                onFiltersChange(newFilters);
              }
            }}
            className="px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5"
            style={{
              background: tableFilters.sortBy === 'date'
                ? colors.badgePurpleBg
                : colors.inputBackground,
              border: `1px solid ${
                tableFilters.sortBy === 'date'
                  ? colors.badgePurpleBorder
                  : colors.border
              }`,
              color: tableFilters.sortBy === 'date'
                ? colors.activeText
                : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (tableFilters.sortBy !== 'date') {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (tableFilters.sortBy !== 'date') {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title="Sort by Date"
          >
            <Calendar size={14} />
            Date
          </button>

          <button
            onClick={() => {
              setShowFiltersModal(true);
              if (onShowFilters) onShowFilters();
            }}
            className="px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5"
            style={{
              background: showFiltersModal
                ? colors.badgePurpleBg
                : colors.inputBackground,
              border: `1px solid ${
                showFiltersModal
                  ? colors.badgePurpleBorder
                  : colors.border
              }`,
              color: showFiltersModal
                ? colors.activeText
                : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!showFiltersModal) {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!showFiltersModal) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title="Filters & Views"
          >
            <FilterIcon size={14} />
            Filters
          </button>

          {/* Recycle Bin Button */}
          <button
            onClick={() => {
              const newFilters = { ...tableFilters, showDeleted: !tableFilters.showDeleted };
              setTableFilters(newFilters);
              if (onFiltersChange) {
                onFiltersChange(newFilters);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
            style={{
              background: showDeleted ? colors.badgeErrorBg : colors.inputBackground,
              border: `1px solid ${showDeleted ? colors.badgeErrorBorder : colors.border}`,
              color: showDeleted ? colors.badgeErrorText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!showDeleted) {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }
            }}
            onMouseLeave={(e) => {
              if (!showDeleted) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title={showDeleted ? 'Hide Recycle Bin' : 'Show Recycle Bin'}
          >
            <TrashIcon size={14} />
            <span>Recycle Bin</span>
          </button>
        </div>

        {/* Center - Bulk Actions (when items are selected) */}
        {selectedJobs.length > 0 && (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: colors.secondaryText }}>
              {selectedJobs.length} selected
            </span>
            {showDeleted && onBulkRestore && (
            <button
                onClick={() => onBulkRestore()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.badgeSuccessText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                  e.currentTarget.style.borderColor = colors.badgeSuccessBorder;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.borderColor = colors.border;
                }}
                title="Restore Selected"
              >
                <RotateCcw size={14} />
                <span>Restore</span>
            </button>
            )}
            {onBulkDelete && (
              <button
                onClick={() => onBulkDelete(showDeleted)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.badgeErrorText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                  e.currentTarget.style.borderColor = colors.badgeErrorBorder;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.borderColor = colors.border;
                }}
                title={showDeleted ? 'Permanently Delete Selected' : 'Delete Selected'}
              >
                <Trash2 size={14} />
                <span>{showDeleted ? 'Delete Forever' : 'Delete'}</span>
              </button>
            )}
          </div>
        )}

        {/* Right Side - View Mode Toggles and Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggles */}
          <div 
            className="flex items-center rounded-md overflow-hidden"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <button
              onClick={() => onViewModeChange && onViewModeChange('table')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'table' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'table' ? colors.activeText : colors.tertiaryText,
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'table') {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'table') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title="Table View"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => onViewModeChange && onViewModeChange('kanban')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'kanban' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'kanban' ? colors.activeText : colors.tertiaryText,
                borderLeft: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'kanban') {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'kanban') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title="Kanban View"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => onViewModeChange && onViewModeChange('list')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'list' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'list' ? colors.activeText : colors.tertiaryText,
                borderLeft: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => onViewModeChange && onViewModeChange('grid')}
              className="p-1.5 transition-all"
              style={{
                background: viewMode === 'grid' ? colors.badgePurpleBg : 'transparent',
                color: viewMode === 'grid' ? colors.activeText : colors.tertiaryText,
                borderLeft: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'grid') {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'grid') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>

          {/* Action Icons: Download, Upload, Settings */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.tertiaryText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.color = colors.tertiaryText;
              }}
              title="Export Jobs"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleImportCSV}
              className="p-1.5 rounded transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.tertiaryText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.color = colors.tertiaryText;
              }}
              title="Import Jobs"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="p-1.5 rounded transition-all relative"
              style={{
                background: showColumnPicker ? colors.badgePurpleBg : colors.inputBackground,
                border: `1px solid ${showColumnPicker ? colors.badgePurpleBorder : colors.border}`,
                color: showColumnPicker ? colors.activeText : colors.tertiaryText,
              }}
              onMouseEnter={(e) => {
                if (!showColumnPicker) {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.secondaryText;
                }
              }}
              onMouseLeave={(e) => {
                if (!showColumnPicker) {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.color = colors.tertiaryText;
                }
              }}
              title="Column Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Column Picker Dropdown */}
            {showColumnPicker && (
              <>
                <div 
              className="fixed inset-0 z-[100]" 
                  onClick={() => setShowColumnPicker(false)}
                />
            <div 
              className="absolute right-4 top-full mt-2 rounded-lg shadow-2xl z-[101]"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(20px)',
                maxHeight: '500px',
                overflowY: 'auto',
                overflowX: 'visible',
                width: 'max-content',
                minWidth: '200px',
                maxWidth: '350px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3">
                <div 
                  className="text-xs font-semibold mb-3 px-2 uppercase tracking-wider whitespace-nowrap"
                  style={{ color: colors.tertiaryText }}
                >
                  Toggle Columns
                </div>
                <div className="space-y-1">
                  {columns.filter(col => col.key !== 'checkbox' && col.key !== 'favorite').map(column => {
                    const visibleCount = columns.filter(col => col.visible && col.key !== 'checkbox' && col.key !== 'favorite').length;
                    const isDisabled = !column.visible && visibleCount === 1;
                    return (
                      <label
                        key={column.key}
                        className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all whitespace-nowrap ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{ color: colors.secondaryText }}
                        onMouseEnter={(e) => {
                          if (!isDisabled) {
                            e.currentTarget.style.background = colors.hoverBackground;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={column.visible}
                          disabled={isDisabled}
                          onChange={() => {
                            if (!isDisabled) {
                              toggleColumn(column.key);
                            }
                          }}
                          className="rounded flex-shrink-0"
                          style={{ accentColor: colors.primaryBlue }}
                          title={column.label}
                        />
                        <span className="text-sm flex-1 overflow-visible" style={{ overflowWrap: 'normal', wordBreak: 'keep-all' }}>
                          {column.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                  </div>
                </div>
              </>
            )}
          </div>

      {/* Table - Horizontally and Vertically Scrollable */}
      <div 
        className="flex-1 force-scrollbar" 
        style={{ 
          overflowX: 'scroll',
          overflowY: 'scroll',
          minHeight: 0, // Allow flex container to shrink
        }}
      >
        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 'max-content', width: 'max-content' }}>
          <thead className="sticky top-0 z-10">
            <tr style={{ 
              borderBottom: `1px solid ${colors.border}`,
              background: colors.toolbarBackground,
            }}>
              {visibleColumns.map((column, idx) => {
                const colDef = columns.find(c => c.key === column.key)!;
                const isSorted = sortBy?.field === column.key;
                const isSortable = column.key !== 'checkbox' && column.key !== 'favorite';
                
                // Select all checkbox logic for checkbox column header
                if (column.key === 'checkbox') {
                  const allSelected = displayJobs.length > 0 && selectedJobs.length === displayJobs.length;
                  
                  return (
                    <th
                      key={column.key}
                      className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium relative"
                      style={{ 
                        color: colors.tertiaryText,
                        background: colors.toolbarBackground,
                        width: colDef.width,
                        minWidth: colDef.width || 120,
                        cursor: 'default',
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleSelection && displayJobs.length > 0) {
                              if (allSelected) {
                                // Deselect all
                                displayJobs.forEach(job => {
                                  if (selectedJobs.includes(job.id)) {
                                    onToggleSelection(job.id);
                                  }
                                });
                              } else {
                                // Select all
                                displayJobs.forEach(job => {
                                  if (!selectedJobs.includes(job.id)) {
                                    onToggleSelection(job.id);
                                  }
                                });
                              }
                            }
                          }}
                          className="p-0.5 rounded transition-all flex items-center justify-center"
                          style={{ 
                            color: allSelected ? colors.primaryBlue : colors.tertiaryText,
                            background: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackground;
                            if (!allSelected) {
                              e.currentTarget.style.color = colors.primaryBlue;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = allSelected ? colors.primaryBlue : colors.tertiaryText;
                          }}
                          title={allSelected ? 'Deselect all' : 'Select all'}
                          aria-label={allSelected ? 'Deselect all' : 'Select all'}
                        >
                          <CheckSquare 
                            size={16} 
                            fill={allSelected ? colors.primaryBlue : 'none'} 
                            strokeWidth={allSelected ? 0 : 1.5}
                            style={{ 
                              color: allSelected ? colors.primaryBlue : colors.tertiaryText,
                            }}
                          />
                        </button>
        </div>
                    </th>
                  );
                }
                
                // Empty header for favorite column
                if (column.key === 'favorite') {
                  return (
                    <th
                      key={column.key}
                      className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium relative"
                      style={{ 
                        color: colors.tertiaryText,
                        background: colors.toolbarBackground,
                        width: colDef.width,
                        minWidth: colDef.width || 120,
                        cursor: 'default',
                      }}
                    >
                      {/* Empty header - star is not selectable */}
              </th>
                  );
                }
                
                return (
                <th
                  key={column.key}
                    className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium relative"
                    style={{ 
                      color: colors.tertiaryText,
                      background: colors.toolbarBackground,
                      width: colDef.width,
                      minWidth: colDef.width || 120,
                      cursor: isSortable ? 'pointer' : 'default',
                    }}
                    onClick={() => isSortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1">{column.label}</span>
                      {isSortable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSort(column.key);
                          }}
                          className="p-0.5 rounded transition-all opacity-60 hover:opacity-100"
                          style={{ color: isSorted ? colors.primaryBlue : colors.tertiaryText }}
                        >
                          {isSorted ? (
                            sortBy?.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </button>
                      )}
                    </div>
                    {/* Resize Handle */}
                    {isSortable && (
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize opacity-0 hover:opacity-100 transition-opacity"
                        style={{
                          background: resizingColumn?.index === idx ? colors.primaryBlue : colors.border,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizingColumn({
                            index: idx,
                            startX: e.clientX,
                            startWidth: colDef.width || 150
                          });
                        }}
                      />
                    )}
                </th>
                );
              })}
              <th 
                className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium"
                style={{ 
                  color: colors.tertiaryText,
                  background: colors.toolbarBackground,
                  width: '100px',
                  minWidth: '100px',
                  borderLeft: `1px solid ${colors.border}`,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {shouldShowGroups ? (
              // Grouped view
              Object.entries(groupedJobs).map(([groupName, groupJobs]) => (
                <React.Fragment key={groupName}>
                  {/* Group Header Row */}
                  <tr style={{ background: colors.toolbarBackground }}>
                    <td 
                      colSpan={visibleColumns.length + 1}
                      className="px-4 py-2 font-semibold text-sm sticky top-0"
                      style={{ 
                        color: colors.primaryText,
                        borderBottom: `2px solid ${colors.border}`,
                        background: colors.toolbarBackground,
                      }}
                    >
                      {groupName} ({groupJobs.length})
                    </td>
                  </tr>
                  {/* Group Jobs */}
                  {groupJobs.map((job, idx) => (
              <tr
                key={job.id}
                      className="transition-colors group"
                      style={{
                        borderBottom: idx < groupJobs.length - 1 ? `1px solid ${colors.border}` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackground;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {visibleColumns.map(column => (
                        <td 
                          key={column.key}
                          className="px-3 py-2.5"
                          onClick={() => handleCellClick(job.id, column.key, 
                            column.key === 'contact' ? job.contact?.name :
                            column.key === 'email' ? job.contact?.email :
                            column.key === 'phone' ? job.contact?.phone :
                            job[column.key as keyof Job]
                          )}
                          style={{
                            cursor: (column.key === 'checkbox' || column.key === 'favorite') ? 'default' : 'text',
                            background: editingCell?.jobId === job.id && editingCell?.field === column.key
                              ? colors.inputBackground
                              : 'transparent',
                            width: columns.find(c => c.key === column.key)?.width,
                            minWidth: columns.find(c => c.key === column.key)?.width || 120,
                          }}
                        >
                          {renderCellContent(job, column.key, job.id)}
                        </td>
                      ))}
                      <td 
                        className="px-4 py-2"
                        style={{ 
                          background: 'inherit',
                          width: '100px',
                          minWidth: '100px',
                          borderLeft: `1px solid ${colors.border}`,
                        }}
                      >
                        <div className="flex items-center gap-1 justify-end">
                          {onView && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(job);
                              }}
                              className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                              style={{ color: colors.tertiaryText }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.hoverBackground;
                                e.currentTarget.style.color = colors.primaryBlue;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = colors.tertiaryText;
                              }}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {showDeleted && onRestore && job.deletedAt && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestore(job.id);
                              }}
                              className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                              style={{ color: colors.tertiaryText }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.hoverBackground;
                                e.currentTarget.style.color = colors.badgeSuccessText;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = colors.tertiaryText;
                              }}
                              title="Restore"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          {onDelete && (!showDeleted || !job.deletedAt) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (showDeleted) {
                                  onDelete(job.id, true);
                                } else {
                                  onDelete(job.id, false);
                                }
                              }}
                              className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                              style={{ color: colors.tertiaryText }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.hoverBackground;
                                e.currentTarget.style.color = colors.badgeErrorText;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = colors.tertiaryText;
                              }}
                              title={showDeleted ? "Permanently Delete" : "Delete"}
                            >
                              {showDeleted ? <Trash size={14} /> : <Trash2 size={14} />}
                            </button>
                          )}
                        </div>
                </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              // Normal flat view
              displayJobs.map((job, idx) => (
                <tr
                  key={job.id}
                  className="transition-colors group"
                  style={{
                    borderBottom: idx < displayJobs.length - 1 ? `1px solid ${colors.border}` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {visibleColumns.map(column => (
                    <td 
                      key={column.key}
                      className="px-3 py-2.5"
                      onClick={() => handleCellClick(job.id, column.key, 
                        column.key === 'contact' ? job.contact?.name :
                        column.key === 'email' ? job.contact?.email :
                        column.key === 'phone' ? job.contact?.phone :
                        job[column.key as keyof Job]
                      )}
                      style={{
                        cursor: (column.key === 'checkbox' || column.key === 'favorite') ? 'default' : 'text',
                        background: editingCell?.jobId === job.id && editingCell?.field === column.key
                          ? colors.inputBackground
                          : 'transparent',
                        width: columns.find(c => c.key === column.key)?.width,
                        minWidth: columns.find(c => c.key === column.key)?.width || 120,
                      }}
                    >
                      {renderCellContent(job, column.key, job.id)}
                  </td>
                ))}

                  <td 
                    className="px-4 py-2"
                    style={{ 
                      background: 'inherit',
                      width: '100px',
                      minWidth: '100px',
                      borderLeft: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-1 justify-end">
                    {onView && (
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(job);
                          }}
                          className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                          style={{ color: colors.tertiaryText }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackground;
                            e.currentTarget.style.color = colors.primaryBlue;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = colors.tertiaryText;
                          }}
                        title="View Details"
                      >
                          <Eye size={14} />
                      </button>
                    )}
                      {showDeleted && onRestore && job.deletedAt && (
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestore(job.id);
                          }}
                          className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                          style={{ color: colors.tertiaryText }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackground;
                            e.currentTarget.style.color = colors.badgeSuccessText;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = colors.tertiaryText;
                          }}
                          title="Restore"
                        >
                          <RotateCcw size={14} />
                      </button>
                    )}
                      {onDelete && (!showDeleted || !job.deletedAt) && (
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (showDeleted) {
                              onDelete(job.id, true);
                            } else {
                              onDelete(job.id, false);
                            }
                          }}
                          className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                          style={{ color: colors.tertiaryText }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackground;
                            e.currentTarget.style.color = colors.badgeErrorText;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = colors.tertiaryText;
                          }}
                          title={showDeleted ? "Permanently Delete" : "Delete"}
                        >
                          {showDeleted ? <Trash size={14} /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
            
            {/* New Row */}
            {editingCell?.jobId === 'new' && (
              <tr
                className="transition-colors"
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  background: colors.inputBackground,
                }}
              >
                {visibleColumns.map(column => (
                  <td 
                    key={column.key}
                    className="px-3 py-2.5"
                    onClick={() => {
                      if (editingCell.field !== column.key && column.key !== 'checkbox' && column.key !== 'favorite') {
                        handleCellClick('new', column.key, 
                          column.key === 'contact' ? newRowData.contact?.name :
                          column.key === 'email' ? newRowData.contact?.email :
                          column.key === 'phone' ? newRowData.contact?.phone :
                          newRowData[column.key as keyof Partial<Job>]
                        );
                      }
                    }}
                    style={{
                      cursor: (column.key === 'checkbox' || column.key === 'favorite') ? 'default' : 'text',
                      background: editingCell?.field === column.key
                        ? colors.cardBackground
                        : colors.inputBackground,
                      width: columns.find(c => c.key === column.key)?.width,
                      minWidth: columns.find(c => c.key === column.key)?.width || 120,
                    }}
                  >
                    {renderCellContent(newRowData, column.key, 'new')}
                  </td>
                ))}
                <td 
                  className="px-4 py-2"
                  style={{ 
                    background: colors.inputBackground,
                    width: '100px',
                    minWidth: '100px',
                    borderLeft: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={saveNewRow}
                      className="p-1 rounded transition-all"
                      style={{ color: colors.badgeSuccessText }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackground;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="Save"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCell(null);
                        setNewRowData({});
                      }}
                      className="p-1 rounded transition-all"
                      style={{ color: colors.tertiaryText }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackground;
                        e.currentTarget.style.color = colors.badgeErrorText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = colors.tertiaryText;
                      }}
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Row Button at Bottom */}
      {editingCell?.jobId !== 'new' && (
        <div 
          className="px-6 py-2 border-t flex-shrink-0"
          style={{
            borderTop: `1px solid ${colors.border}`,
            background: colors.toolbarBackground,
          }}
        >
            <button
            onClick={startNewRow}
            className="flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm w-full text-left"
            style={{
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.secondaryText;
            }}
          >
            <Plus size={16} />
            <span>Add a row</span>
            </button>
        </div>
      )}

      {displayJobs.length === 0 && editingCell?.jobId !== 'new' && (
        <div className="text-center py-12">
          <div style={{ color: colors.tertiaryText, marginBottom: '8px' }}>
            {showDeleted ? 'No deleted jobs' : 'No jobs yet'}
          </div>
          <div style={{ color: colors.secondaryText, fontSize: '13px' }}>
            {showDeleted 
              ? 'Deleted jobs will appear here'
              : 'Click "Add Row" to create your first job entry'
            }
          </div>
        </div>
      )}

      {/* Filters Panel - SharePoint Style Side Panel */}
      {showFiltersModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[99]"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={() => setShowFiltersModal(false)}
          />
          {/* Side Panel */}
          <JobFiltersPanel
            filters={tableFilters}
            onFiltersChange={(filters) => {
              setTableFilters(filters);
              if (onFiltersChange) {
                onFiltersChange(filters);
              }
            }}
            onClose={() => setShowFiltersModal(false)}
            savedViews={savedViews}
            onSaveView={onSaveView}
            onDeleteView={onDeleteView}
            onLoadView={(view) => {
              setTableFilters(view.filters);
              if (onFiltersChange) {
                onFiltersChange(view.filters);
              }
              if (onLoadView) {
                onLoadView(view);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
