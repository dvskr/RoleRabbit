/**
 * Custom hook for managing column resizing
 */

import { useState, useEffect } from 'react';
import type { Column, ColumnKey } from '../types/jobTable.types';

interface ResizingColumn {
  index: number;
  startX: number;
  startWidth: number;
}

interface UseJobTableColumnResizeProps {
  visibleColumns: Column[];
  updateColumnWidth: (key: ColumnKey, width: number) => void;
}

export function useJobTableColumnResize({
  visibleColumns,
  updateColumnWidth,
}: UseJobTableColumnResizeProps) {
  const [resizingColumn, setResizingColumn] = useState<ResizingColumn | null>(null);

  // Handle column resize
  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizingColumn.startX;
      const newWidth = Math.max(60, resizingColumn.startWidth + diff);
      const column = visibleColumns[resizingColumn.index];
      if (column) {
        updateColumnWidth(column.key, newWidth);
      }
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
  }, [resizingColumn, visibleColumns, updateColumnWidth]);

  // Start resizing
  const startResize = (index: number, startX: number, startWidth: number) => {
    setResizingColumn({ index, startX, startWidth });
  };

  return {
    resizingColumn,
    startResize,
  };
}

