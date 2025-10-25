import React from 'react';
import { Building, MapPin, Calendar, Eye, Edit, Trash2, Star, DollarSign, Link } from 'lucide-react';
import { Job } from '../../types/job';

interface JobCardProps {
  job: Job;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleFavorite: (jobId: string) => void;
  onToggleSelection: (jobId: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onView: (job: Job) => void;
}

export default function JobCard({
  job,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onToggleSelection,
  onEdit,
  onDelete,
  onView
}: JobCardProps) {
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offer': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority?: Job['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(job.id)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h3>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Building size={16} />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(job.id)}
            className={`p-1 rounded transition-colors ${
              isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(job)}
              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onEdit(job)}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
              title="Edit Job"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Delete Job"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={14} />
          <span className="text-sm">{job.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={14} />
          <span className="text-sm">Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
        </div>
        
        {job.salary && (
          <div className="flex items-center gap-2 text-green-600">
            <DollarSign size={14} />
            <span className="text-sm font-medium">{job.salary}</span>
          </div>
        )}
        
        {job.url && (
          <div className="flex items-center gap-2 text-blue-600">
            <Link size={14} />
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              View Job Posting
            </a>
          </div>
        )}
      </div>

      {/* Status and Priority */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
        
        {job.priority && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
            {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
          </span>
        )}
      </div>

      {/* Description */}
      {job.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
        </div>
      )}
    </div>
  );
}
