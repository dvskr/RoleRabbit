'use client';

import React from 'react';
import { Briefcase, Plus, Filter, Search, Edit, Trash2, Calendar, MapPin, DollarSign, X } from 'lucide-react';
import { JobApplication } from '../../types/userProfile';

interface JobTrackerTabProps {
  jobs: JobApplication[];
  setJobs: (jobs: JobApplication[]) => void;
  newJob: Partial<JobApplication>;
  setNewJob: (job: Partial<JobApplication>) => void;
  showAddJob: boolean;
  setShowAddJob: (show: boolean) => void;
  jobFilter: string;
  setJobFilter: (filter: string) => void;
  onAddJob: (job: Partial<JobApplication>) => void;
  onUpdateJob: (jobId: string, job: Partial<JobApplication>) => void;
  onDeleteJob: (jobId: string) => void;
}

export default function JobTrackerTab({ 
  jobs, 
  setJobs, 
  newJob, 
  setNewJob, 
  showAddJob, 
  setShowAddJob, 
  jobFilter, 
  setJobFilter, 
  onAddJob, 
  onUpdateJob, 
  onDeleteJob 
}: JobTrackerTabProps) {
  const handleNewJobChange = (field: keyof JobApplication, value: any) => {
    setNewJob(prev => ({ ...prev, [field]: value }));
  };

  const handleAddJob = () => {
    if (newJob.title?.trim() && newJob.company?.trim()) {
      onAddJob(newJob);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'text-blue-600 bg-blue-100';
      case 'interview': return 'text-yellow-600 bg-yellow-100';
      case 'offer': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (jobFilter === 'all') return true;
    return job.status === jobFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Briefcase size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Job Applications</h3>
            <p className="text-sm text-gray-600">Track your job applications and progress</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddJob(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Job</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Jobs</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  {job.priority && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                      {job.priority} priority
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Briefcase size={14} />
                    <span>{job.company}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center space-x-1">
                      <DollarSign size={14} />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {job.description && (
                  <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                )}

                {job.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {job.notes}
                    </p>
                  </div>
                )}

                {job.contact && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">Contact Information</p>
                    <div className="text-sm text-blue-700">
                      {job.contact.name && <p>Name: {job.contact.name}</p>}
                      {job.contact.email && <p>Email: {job.contact.email}</p>}
                      {job.contact.phone && <p>Phone: {job.contact.phone}</p>}
                    </div>
                  </div>
                )}

                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Job Posting →
                  </a>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => onDeleteJob(job.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
          <p className="text-gray-600 mb-4">
            {jobFilter === 'all' 
              ? "You haven't added any job applications yet" 
              : `No jobs with status "${jobFilter}" found`
            }
          </p>
          <button
            onClick={() => setShowAddJob(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Job
          </button>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Job Application</h2>
              <button
                onClick={() => setShowAddJob(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={newJob.title || ''}
                    onChange={(e) => handleNewJobChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                  <input
                    type="text"
                    value={newJob.company || ''}
                    onChange={(e) => handleNewJobChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Tech Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newJob.location || ''}
                    onChange={(e) => handleNewJobChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newJob.status || 'applied'}
                    onChange={(e) => handleNewJobChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applied Date</label>
                  <input
                    type="date"
                    value={newJob.appliedDate || ''}
                    onChange={(e) => handleNewJobChange('appliedDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newJob.priority || 'medium'}
                    onChange={(e) => handleNewJobChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                <input
                  type="text"
                  value={newJob.salary || ''}
                  onChange={(e) => handleNewJobChange('salary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., $80,000 - $100,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job URL</label>
                <input
                  type="url"
                  value={newJob.url || ''}
                  onChange={(e) => handleNewJobChange('url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://company.com/job-posting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newJob.description || ''}
                  onChange={(e) => handleNewJobChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description of the job..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newJob.notes || ''}
                  onChange={(e) => handleNewJobChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any additional notes about this application..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddJob(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddJob}
                disabled={!newJob.title?.trim() || !newJob.company?.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
