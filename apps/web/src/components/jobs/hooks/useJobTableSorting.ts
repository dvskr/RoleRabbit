/**
 * Custom hook for managing job table sorting state
 */

import { useState } from 'react';
import type { ColumnKey, SortDirection } from '../types/jobTable.types';

export interface SortState {
  field: ColumnKey;
  direction: SortDirection;
}

export function useJobTableSorting() {
  const [sortBy, setSortBy] = useState<SortState | null>(null);

  // Handle column sort click
  const handleSort = (field: ColumnKey) => {
    // Skip non-sortable columns
    if (field === 'checkbox' || field === 'favorite') return;
    
    if (sortBy?.field === field) {
      // Toggle direction or clear sort
      setSortBy(sortBy.direction === 'asc' ? { field, direction: 'desc' } : null);
    } else {
      // New sort
      setSortBy({ field, direction: 'asc' });
    }
  };

  // Clear sort
  const clearSort = () => {
    setSortBy(null);
  };

  return {
    sortBy,
    setSortBy,
    handleSort,
    clearSort,
  };
}


