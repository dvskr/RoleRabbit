import React from 'react';
import { ChevronDown, ChevronUp, Star, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Job } from '../../types/job';

interface JobTableProps {
  jobs: Job[];
  favorites: string[];
  selectedJobs: string[];
  onToggleFavorite: (jobId: string) => void;
  onToggleSelection: (jobId: string) => void;
  onSelectAll: () => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onView: (job: Job) => void;
}

export default function JobTable({
  jobs,
  favorites,
  selectedJobs,
  onToggleFavorite,
  onToggleSelection,
  onSelectAll,
  onEdit,
  onDelete,
  onView
}: JobTableProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const allSelected = jobs.length > 0 && selectedJobs.length === jobs.length;
  const someSelected = selectedJobs.length > 0 && selectedJobs.length < jobs.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => onToggleSelection(job.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {job.title}
                      </div>
                      {job.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {job.description}
                        </div>
                      )}
                    </div>
                    {job.url && (
                      <button
                        onClick={() => window.open(job.url, '_blank')}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Job Posting"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{job.company}</div>
                  {job.companySize && (
                    <div className="text-sm text-gray-500">{job.companySize}</div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {job.location}
                    {job.remote && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Remote
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {job.priority && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {formatDate(job.appliedDate)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {job.salary || '-'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onToggleFavorite(job.id)}
                      className={`p-1 rounded transition-colors ${
                        favorites.includes(job.id)
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={favorites.includes(job.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star size={16} fill={favorites.includes(job.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => onView(job)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(job)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit job"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(job.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Add your first job application to get started</p>
        </div>
      )}
    </div>
  );
}
