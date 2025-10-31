/**
 * JobTable row component - renders a single table row
 */

import React from 'react';
import { Job } from '../../../types/job';
import { useTheme } from '../../../contexts/ThemeContext';
import type { ColumnKey, Column, EditingCell } from '../types/jobTable.types';
import { getCellValue, isEditableColumn } from '../utils/jobTableCellHelpers';
import JobTableCell from './JobTableCell';
import JobTableRowActions from './JobTableRowActions';

interface JobTableRowProps {
  job: Job;
  columns: Column[];
  visibleColumns: Column[];
  editingCell: EditingCell | null;
  editingValue: string;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>;
  selectedJobs: string[];
  favorites: string[];
  showDeleted?: boolean;
  // Handlers
  onCellClick: (jobId: string, field: ColumnKey, value: any) => void;
  onEditChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, jobId: string, field: ColumnKey) => void;
  onBlur: () => void;
  onStatusChange: (jobId: string, newStatus: Job['status']) => void;
  onPriorityChange: (jobId: string, newPriority: Job['priority'] | undefined) => void;
  onToggleSelection?: (jobId: string) => void;
  onToggleFavorite?: (jobId: string) => void;
  onView?: (job: Job) => void;
  onRestore?: (jobId: string) => void;
  onDelete?: (jobId: string, permanent?: boolean) => void;
  // For grouped rows
  isLastInGroup?: boolean;
}

export default function JobTableRow({
  job,
  columns,
  visibleColumns,
  editingCell,
  editingValue,
  inputRef,
  selectedJobs,
  favorites,
  showDeleted = false,
  onCellClick,
  onEditChange,
  onKeyDown,
  onBlur,
  onStatusChange,
  onPriorityChange,
  onToggleSelection,
  onToggleFavorite,
  onView,
  onRestore,
  onDelete,
  isLastInGroup = false,
}: JobTableRowProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const isSelected = selectedJobs.includes(job.id);
  const isFavorite = favorites.includes(job.id);

  return (
    <tr
      className="transition-colors group"
      style={{
        borderBottom: isLastInGroup ? 'none' : `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.hoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {visibleColumns.map(column => {
        const isEditing = editingCell?.jobId === job.id && editingCell?.field === column.key;
        return (
          <td 
            key={column.key}
            className="px-3 py-2.5"
            onClick={() => onCellClick(job.id, column.key, getCellValue(job, column.key))}
            style={{
              cursor: (column.key === 'checkbox' || column.key === 'favorite') ? 'default' : 'text',
              background: isEditing
                ? colors.inputBackground
                : 'transparent',
              width: columns.find(c => c.key === column.key)?.width,
              minWidth: columns.find(c => c.key === column.key)?.width || 120,
            }}
          >
            <JobTableCell
              job={job}
              column={column.key}
              jobId={job.id}
              isEditing={isEditing}
              editingValue={editingValue}
              editingCell={editingCell}
              inputRef={inputRef}
              onEditChange={onEditChange}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              isSelected={isSelected}
              isFavorite={isFavorite}
              onToggleSelection={onToggleSelection}
              onToggleFavorite={onToggleFavorite}
            />
          </td>
        );
      })}
      <td 
        className="px-4 py-2"
        style={{ 
          background: 'inherit',
          width: '100px',
          minWidth: '100px',
          borderLeft: `1px solid ${colors.border}`,
        }}
      >
        <JobTableRowActions
          job={job}
          showDeleted={showDeleted}
          onView={onView}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

