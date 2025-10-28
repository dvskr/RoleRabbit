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
    <div className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(job.id)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-0.5">{job.title}</h3>
            <div className="flex items-center gap-1.5 text-gray-600 mb-1">
              <Building size={14} />
              <span className="font-medium text-sm">{job.company}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(job.id)}
            className={`p-1 rounded transition-colors ${
              isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(job);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
              title="View Details & Trackers"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(job)}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
              title="Edit Job"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Delete Job"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin size={12} />
          <span className="text-xs">{job.location}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar size={12} />
          <span className="text-xs">Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
        </div>
        
        {job.salary && (
          <div className="flex items-center gap-1.5 text-green-600">
            <DollarSign size={12} />
            <span className="text-xs font-medium">{job.salary}</span>
          </div>
        )}
        
        {job.url && (
          <div className="flex items-center gap-1.5 text-blue-600">
            <Link size={12} />
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs hover:underline"
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
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-2">{job.description}</p>
        </div>
      )}
    </div>
  );
}
