/**
 * JobTable column picker dropdown component
 */

import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Column, ColumnKey } from '../types/jobTable.types';

interface JobTableColumnPickerProps {
  columns: Column[];
  toggleColumn: (key: ColumnKey) => void;
  onClose: () => void;
}

export default function JobTableColumnPicker({
  columns,
  toggleColumn,
  onClose,
}: JobTableColumnPickerProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-transparent focus:outline-none border-0 p-0"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose();
          }
        }}
        aria-label="Close column picker"
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
        role="dialog"
        aria-labelledby="job-table-column-picker-heading"
        tabIndex={-1}
      >
        <div className="p-3">
          <div 
            className="text-xs font-semibold mb-3 px-2 uppercase tracking-wider whitespace-nowrap"
            style={{ color: colors.tertiaryText }}
            id="job-table-column-picker-heading"
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
  );
}

