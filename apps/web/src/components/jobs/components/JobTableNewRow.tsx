/**
 * JobTable new row component - renders the "new row" editing row
 */

import React from 'react';
import { Plus, X } from 'lucide-react';
import { Job } from '../../../types/job';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Column, EditingCell, ColumnKey } from '../types/jobTable.types';
import { getCellValue, isEditableColumn } from '../utils/jobTableCellHelpers';
import JobTableCell from './JobTableCell';

interface JobTableNewRowProps {
  newRowData: Partial<Job>;
  columns: Column[];
  visibleColumns: Column[];
  editingCell: EditingCell | null;
  editingValue: string;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>;
  onCellClick: (jobId: string, field: ColumnKey, value: any) => void;
  onEditChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, jobId: string, field: ColumnKey) => void;
  onBlur: () => void;
  onStatusChange: (jobId: string, newStatus: Job['status']) => void;
  onPriorityChange: (jobId: string, newPriority: Job['priority'] | undefined) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function JobTableNewRow({
  newRowData,
  columns,
  visibleColumns,
  editingCell,
  editingValue,
  inputRef,
  onCellClick,
  onEditChange,
  onKeyDown,
  onBlur,
  onStatusChange,
  onPriorityChange,
  onSave,
  onCancel,
}: JobTableNewRowProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <tr
      className="transition-colors"
      style={{
        borderBottom: `1px solid ${colors.border}`,
        background: colors.inputBackground,
      }}
    >
      {visibleColumns.map(column => {
        const isEditing = editingCell?.field === column.key;
        return (
          <td 
            key={column.key}
            className="px-3 py-2.5"
            onClick={() => {
              if (editingCell?.field !== column.key && isEditableColumn(column.key)) {
                onCellClick('new', column.key as ColumnKey, getCellValue(newRowData, column.key));
              }
            }}
            style={{
              cursor: (column.key === 'checkbox' || column.key === 'favorite') ? 'default' : 'text',
              background: isEditing
                ? colors.cardBackground
                : colors.inputBackground,
              width: columns.find(c => c.key === column.key)?.width,
              minWidth: columns.find(c => c.key === column.key)?.width || 120,
            }}
          >
            <JobTableCell
              job={newRowData}
              column={column.key}
              jobId="new"
              isEditing={isEditing}
              editingValue={editingValue}
              editingCell={editingCell}
              inputRef={inputRef}
              onEditChange={onEditChange}
              onKeyDown={(e) => onKeyDown(e, 'new', column.key as ColumnKey)}
              onBlur={onBlur}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              isSelected={false}
              isFavorite={false}
            />
          </td>
        );
      })}
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
            onClick={onSave}
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
            onClick={onCancel}
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
  );
}

