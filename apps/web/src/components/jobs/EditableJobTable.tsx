'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare } from 'lucide-react';
import { Job } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';
import JobFiltersPanel from './JobFiltersPanel';
// Import extracted types and constants
import type { EditableJobTableProps, ColumnKey } from './types/jobTable.types';
import { getSampleJobs } from './constants/jobTable.constants';
// Import helper functions
import { filterJobs } from './utils/jobTableFilters';
import { sortJobsByColumn, sortJobsByFilter } from './utils/jobTableSorting';
import { groupJobs } from './utils/jobTableGrouping';
import { getCellValue, isEditableColumn, updateJobField, updatePartialJobField } from './utils/jobTableCellHelpers';
import { exportJobsToCSV, parseCSVToJobs, parseJSONToJobs } from './utils/jobTableExportHelpers';
// Import custom hooks
import { useJobTableColumns } from './hooks/useJobTableColumns';
import { useJobTableEditing } from './hooks/useJobTableEditing';
import { useJobTableFilters } from './hooks/useJobTableFilters';
import { useJobTableSorting } from './hooks/useJobTableSorting';
import { useJobTableColumnResize } from './hooks/useJobTableColumnResize';
// Import components
import JobTableRow from './components/JobTableRow';
import JobTableNewRow from './components/JobTableNewRow';
import JobTableToolbar from './components/JobTableToolbar';

export default function EditableJobTable({
  jobs: propsJobs,
  onDelete,
  onRestore,
  onView,
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
  
  // Use custom hooks for state management
  const {
    columns,
    visibleColumns,
    toggleColumn,
    updateColumnWidth,
  } = useJobTableColumns();

  const {
    editingCell,
    editingValue,
    setEditingValue,
    newRowData,
    setNewRowData,
    inputRef,
    startEditing: startEditingHook,
    resetNewRow,
    setEditingCell,
  } = useJobTableEditing();

  const {
    tableFilters,
    setTableFilters,
  } = useJobTableFilters({
    externalFilters,
    showDeleted,
    onFiltersChange,
  });

  const {
    sortBy,
    handleSort,
  } = useJobTableSorting();

  const {
    resizingColumn,
    startResize,
  } = useJobTableColumnResize({
    visibleColumns,
    updateColumnWidth,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // UI state
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const sortedAndGroupedJobs = useCallback(() => {
    // Apply filters
    let filtered = filterJobs(jobs, tableFilters);
    
    // Apply sorting
    if (sortBy) {
      filtered = sortJobsByColumn(filtered, sortBy);
    } else if (tableFilters.sortBy) {
      filtered = sortJobsByFilter(filtered, tableFilters);
    }
    
    return filtered;
  }, [jobs, sortBy, tableFilters]);

  const displayJobs = sortedAndGroupedJobs();
  
  // Group jobs if groupBy is set
  const groupedJobs = useMemo(() => {
    return groupJobs(displayJobs, tableFilters.groupBy);
  }, [displayJobs, tableFilters.groupBy]);
  
  const shouldShowGroups = tableFilters.groupBy && tableFilters.groupBy !== 'status';

  const startEditing = useCallback((jobId: string, field: ColumnKey, currentValue: unknown) => {
    if (!isEditableColumn(field)) return;
    startEditingHook(jobId, field, currentValue);
  }, [startEditingHook]);

  const saveEdit = useCallback(() => {
    if (!editingCell) return;

    if (editingCell.jobId === 'new') {
      setNewRowData(prev => updatePartialJobField(prev, editingCell.field, editingValue));
    } else if (onUpdate) {
      const job = displayJobs.find(j => j.id === editingCell.jobId);
      if (job) {
        const updatedJob = updateJobField(job, editingCell.field, editingValue);
        onUpdate(updatedJob);
      }
    }
    
    setEditingCell(null);
  }, [editingCell, editingValue, onUpdate, displayJobs, setNewRowData, setEditingCell]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, jobId: string, field: ColumnKey) => {
    if (!isEditableColumn(field)) return;
    
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
              ? getCellValue(newRowData, nextNextField)
              : getCellValue(displayJobs.find(j => j.id === jobId) || {}, nextNextField);
            setTimeout(() => startEditing(jobId, nextNextField, nextValue), 0);
          }
        } else {
          const nextValue = jobId === 'new' 
            ? getCellValue(newRowData, nextField)
            : getCellValue(displayJobs.find(j => j.id === jobId) || {}, nextField);
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
            ? getCellValue(newRowData, prevField)
            : getCellValue(displayJobs.find(j => j.id === jobId) || {}, prevField);
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
            ? getCellValue(newRowData, nextField)
            : getCellValue(displayJobs.find(j => j.id === jobId) || {}, nextField);
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
      if (jobId === 'new') {
        resetNewRow();
      } else {
        setEditingCell(null);
      }
    }
  }, [visibleColumns, displayJobs, newRowData, saveEdit, startEditing, onCreate, resetNewRow, setEditingCell]);

  const handleCellClick = (jobId: string, field: ColumnKey, value: unknown) => {
    if (!isEditableColumn(field)) return;
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
    exportJobsToCSV(displayJobs);
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
              let importedJobs: Partial<Job>[] = [];
              
              if (file.name.endsWith('.csv')) {
                importedJobs = parseCSVToJobs(text);
              } else {
                importedJobs = parseJSONToJobs(text);
              }
              
              if (importedJobs.length > 0 && onCreate) {
                importedJobs.forEach(job => onCreate(job));
                  alert(`Successfully imported ${importedJobs.length} job(s)`);
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
      {/* Toolbar */}
      <JobTableToolbar
        tableFilters={tableFilters}
        setTableFilters={setTableFilters}
        onFiltersChange={onFiltersChange}
        showDeleted={showDeleted}
        showFiltersModal={showFiltersModal}
        setShowFiltersModal={setShowFiltersModal}
        onShowFilters={onShowFilters}
        selectedJobs={selectedJobs}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onBulkDelete={onBulkDelete}
        onBulkRestore={onBulkRestore}
        onExport={handleExportCSV}
        onImport={handleImportCSV}
        columns={columns}
        toggleColumn={(key: string) => toggleColumn(key as ColumnKey)}
      />

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
                    }}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full text-left focus:outline-none"
                      style={{
                        color: colors.tertiaryText,
                        cursor: isSortable ? 'pointer' : 'default',
                        background: 'transparent',
                      }}
                      onClick={() => isSortable && handleSort(column.key)}
                      aria-label={`Sort by ${column.label}`}
                    >
                      <span className="flex-1">{column.label}</span>
                      {isSortable && (
                        <span
                          className="p-0.5 rounded transition-all opacity-60 hover:opacity-100"
                          style={{ color: isSorted ? colors.primaryBlue : colors.tertiaryText }}
                        >
                          {isSorted ? (
                            sortBy?.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </span>
                      )}
                    </button>
                    {/* Resize Handle */}
                    {isSortable && (
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize opacity-0 hover:opacity-100 transition-opacity"
                        style={{
                          background: resizingColumn?.index === idx ? colors.primaryBlue : colors.border,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startResize(idx, e.clientX, colDef.width || 150);
                        }}
                        role="separator"
                        aria-hidden="true"
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
                    <JobTableRow
                      key={job.id}
                      job={job}
                      columns={columns}
                      visibleColumns={visibleColumns}
                      editingCell={editingCell}
                      editingValue={editingValue}
                      inputRef={inputRef}
                      selectedJobs={selectedJobs}
                      favorites={favorites}
                      showDeleted={showDeleted}
                      onCellClick={handleCellClick}
                      onEditChange={setEditingValue}
                      onKeyDown={handleKeyDown}
                      onBlur={() => {
                        if (editingCell?.jobId !== 'new') saveEdit();
                      }}
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      onToggleSelection={onToggleSelection ? () => onToggleSelection(job.id) : undefined}
                      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(job.id) : undefined}
                      onView={onView}
                      onRestore={onRestore}
                      onDelete={onDelete}
                      isLastInGroup={idx === groupJobs.length - 1}
                    />
                  ))}
                </React.Fragment>
              ))
            ) : (
              // Normal flat view
              displayJobs.map((job, idx) => (
                <JobTableRow
                  key={job.id}
                  job={job}
                  columns={columns}
                  visibleColumns={visibleColumns}
                  editingCell={editingCell}
                  editingValue={editingValue}
                  inputRef={inputRef}
                  selectedJobs={selectedJobs}
                  favorites={favorites}
                  showDeleted={showDeleted}
                  onCellClick={handleCellClick}
                  onEditChange={setEditingValue}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (editingCell?.jobId !== 'new') saveEdit();
                  }}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onToggleSelection={onToggleSelection ? () => onToggleSelection(job.id) : undefined}
                  onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(job.id) : undefined}
                  onView={onView}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  isLastInGroup={idx === displayJobs.length - 1}
                />
              ))
            )}
            
            {/* New Row */}
            {editingCell?.jobId === 'new' && (
              <JobTableNewRow
                newRowData={newRowData}
                columns={columns}
                visibleColumns={visibleColumns}
                editingCell={editingCell}
                editingValue={editingValue}
                inputRef={inputRef}
                onCellClick={handleCellClick}
                onEditChange={setEditingValue}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  // Allow blur for new row
                }}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onSave={saveNewRow}
                onCancel={() => {
                  setEditingCell(null);
                  setNewRowData({});
                }}
              />
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
          <button 
            type="button"
            className="fixed inset-0 z-[99] border-0 p-0 focus:outline-none"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={() => setShowFiltersModal(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setShowFiltersModal(false);
              }
            }}
            aria-label="Close filters panel"
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
