/**
 * Custom hook for managing job table columns state
 * Handles column visibility, ordering, width, and localStorage persistence
 */

import { useState, useEffect, useMemo } from 'react';
import { defaultColumns, STORAGE_KEY_COLUMNS } from '../constants/jobTable.constants';
import type { Column, ColumnKey } from '../types/jobTable.types';

export function useJobTableColumns() {
  const [columns, setColumns] = useState<Column[]>(() => defaultColumns);

  // Initialize columns from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLUMNS);
      if (saved) {
        const savedCols = JSON.parse(saved);
        // Merge with defaultColumns - preserve saved widths/order but ensure all are visible
        const merged = defaultColumns.map(defaultCol => {
          const savedCol = savedCols.find((c: Column) => c.key === defaultCol.key);
          if (savedCol) {
            // Keep saved width and order, but force visible for data columns
            return defaultCol.key !== 'checkbox' && defaultCol.key !== 'favorite'
              ? { 
                  ...defaultCol, 
                  width: savedCol.width || defaultCol.width, 
                  order: savedCol.order !== undefined ? savedCol.order : defaultCol.order, 
                  visible: true 
                }
              : { 
                  ...defaultCol, 
                  width: savedCol.width, 
                  order: savedCol.order !== undefined ? savedCol.order : defaultCol.order 
                };
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
  }, []);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
  }, [columns]);

  // Compute visible columns
  const visibleColumns = useMemo(() => {
    return columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order);
  }, [columns]);

  // Toggle column visibility
  const toggleColumn = (key: ColumnKey) => {
    setColumns(cols => {
      const newCols = cols.map(col => col.key === key ? { ...col, visible: !col.visible } : col);
      const visibleCount = newCols.filter(col => col.visible && col.key !== 'checkbox' && col.key !== 'favorite').length;
      // Prevent hiding all data columns
      if (visibleCount === 0 && key !== 'checkbox' && key !== 'favorite') {
        return cols.map(col => col.key === key ? { ...col, visible: true } : col);
      }
      return newCols;
    });
  };

  // Update column width
  const updateColumnWidth = (key: ColumnKey, width: number) => {
    setColumns(cols => 
      cols.map(col => col.key === key ? { ...col, width } : col)
    );
  };

  return {
    columns,
    setColumns,
    visibleColumns,
    toggleColumn,
    updateColumnWidth,
  };
}


