/**
 * Custom hook for managing job table filters state
 */

import { useState, useEffect } from 'react';
import { JobFilters } from '../../../types/job';

interface UseJobTableFiltersProps {
  externalFilters?: JobFilters;
  showDeleted?: boolean;
  onFiltersChange?: (filters: JobFilters) => void;
}

export function useJobTableFilters({
  externalFilters,
  showDeleted = false,
  onFiltersChange,
}: UseJobTableFiltersProps) {
  // Initialize filters from external or defaults
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
  useEffect(() => {
    if (externalFilters) {
      setTableFilters(externalFilters);
    }
  }, [externalFilters]);

  // Update filters and notify parent
  const updateFilters = (newFilters: JobFilters) => {
    setTableFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Reset filters to defaults
  const resetFilters = () => {
    const defaultFilters: JobFilters = {
      status: 'all',
      searchTerm: '',
      sortBy: 'date',
      groupBy: 'status',
      showArchived: false,
      showDeleted: showDeleted,
    };
    updateFilters(defaultFilters);
  };

  return {
    tableFilters,
    setTableFilters: updateFilters,
    resetFilters,
  };
}


