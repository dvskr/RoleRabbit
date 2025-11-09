/**
 * Custom hook for managing job table cell editing state
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Job } from '../../../types/job';
import type { ColumnKey, EditingCell } from '../types/jobTable.types';

export function useJobTableEditing() {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [newRowData, setNewRowData] = useState<Partial<Job>>({});
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

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

  // Start editing a cell
  const startEditing = useCallback((jobId: string, field: ColumnKey, currentValue: unknown) => {
    setEditingCell({ jobId, field });
    setEditingValue(String(currentValue || ''));
    if (jobId === 'new') {
      setNewRowData(prev => ({ ...prev, [field]: currentValue || '' }));
    }
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setEditingValue('');
    setNewRowData({});
  }, []);

  // Reset new row data
  const resetNewRow = useCallback(() => {
    setNewRowData({});
    setEditingCell(null);
  }, []);

  return {
    editingCell,
    editingValue,
    setEditingValue,
    newRowData,
    setNewRowData,
    inputRef,
    startEditing,
    cancelEditing,
    resetNewRow,
    setEditingCell,
  };
}


