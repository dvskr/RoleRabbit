'use client';

import React, { useState } from 'react';
import { MoreVertical, Columns, Plus, Trash2, Edit2, Eye } from 'lucide-react';
import { Job } from '../../types/job';

interface EditableJobTableProps {
  jobs: Job[];
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: string) => void;
  onView?: (job: Job) => void;
  onAdd?: () => void;
}

type ColumnKey = 'title' | 'company' | 'location' | 'salary' | 'status' | 'priority' | 'appliedDate' | 'description' | 'url';

interface Column {
  key: ColumnKey;
  label: string;
  visible: boolean;
  width?: string;
}

const defaultColumns: Column[] = [
  { key: 'title', label: 'Job Title', visible: true },
  { key: 'company', label: 'Company', visible: true },
  { key: 'location', label: 'Location', visible: true },
  { key: 'salary', label: 'Salary', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'priority', label: 'Priority', visible: true },
  { key: 'appliedDate', label: 'Date Applied', visible: true },
  { key: 'description', label: 'Description', visible: false },
  { key: 'url', label: 'URL', visible: false },
];

export default function EditableJobTable({
  jobs,
  onEdit,
  onDelete,
  onView,
  onAdd
}: EditableJobTableProps) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  const visibleColumns = columns.filter(col => col.visible);

  const toggleColumn = (key: ColumnKey) => {
    setColumns(cols => 
      cols.map(col => col.key === key ? { ...col, visible: !col.visible } : col)
    );
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: Job['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCell = (job: Job, column: ColumnKey) => {
    switch (column) {
      case 'title':
        return (
          <div className="font-medium text-gray-900">{job.title}</div>
        );
      case 'company':
        return <div className="text-gray-700">{job.company}</div>;
      case 'location':
        return <div className="text-gray-600">{job.location || 'N/A'}</div>;
      case 'salary':
        return (
          <div className="text-green-600 font-medium">
            {job.salary || 'Not specified'}
          </div>
        );
      case 'status':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        );
      case 'priority':
        return job.priority ? (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
            {job.priority}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      case 'appliedDate':
        return (
          <div className="text-gray-600">
            {new Date(job.appliedDate).toLocaleDateString()}
          </div>
        );
      case 'description':
        return (
          <div className="text-gray-600 truncate max-w-xs">
            {job.description || '—'}
          </div>
        );
      case 'url':
        return job.url ? (
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate max-w-xs block"
          >
            {job.url.substring(0, 40)}...
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        );
      default:
        return '—';
    }
  };

  const handleDoubleClick = (jobId: string, field: string) => {
    setEditingJob(jobId);
    setEditingField(field);
  };

  const handleBlur = () => {
    setEditingJob(null);
    setEditingField(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Job Applications</h3>
          <span className="text-sm text-gray-500">({jobs.length} jobs)</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add Job Button */}
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Job
            </button>
          )}

          {/* Column Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Columns size={16} />
              Columns
            </button>

            {showColumnPicker && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowColumnPicker(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-2 px-2">Show/Hide Columns</div>
                    {columns.map(column => (
                      <label
                        key={column.key}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => toggleColumn(column.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Job Title
              </th>
              {visibleColumns.slice(1).map(column => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-gray-50 transition-colors"
                onDoubleClick={() => setEditingJob(job.id)}
              >
                <td className="px-4 py-3">
                  {editingJob === job.id && editingField === 'title' ? (
                    <input
                      type="text"
                      defaultValue={job.title}
                      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onBlur={handleBlur}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:text-blue-600"
                      onDoubleClick={() => handleDoubleClick(job.id, 'title')}
                    >
                      {job.title}
                    </div>
                  )}
                </td>
                
                {visibleColumns.slice(1).map(column => (
                  <td key={column.key} className="px-4 py-3">
                    {editingJob === job.id && editingField === column.key ? (
                      <input
                        type="text"
                        defaultValue={job[column.key] as string}
                        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onBlur={handleBlur}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:text-blue-600"
                        onDoubleClick={() => handleDoubleClick(job.id, column.key)}
                      >
                        {renderCell(job, column.key)}
                      </div>
                    )}
                  </td>
                ))}

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(job)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(job)}
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(job.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-gray-400 mb-2">No jobs found</div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Job
            </button>
          )}
        </div>
      )}
    </div>
  );
}

