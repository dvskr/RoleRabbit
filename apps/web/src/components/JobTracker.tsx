import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { JobCard, JobMergedToolbar, JobKanban, JobStats, JobTable } from './jobs';
import { useJobs } from '../hooks/useJobs';
import { Job } from '../types/job';

export default function JobTracker() {
  const {
    jobs,
    filters,
    viewMode,
    selectedJobs,
    favorites,
    showFilters,
    stats,
    setFilters,
    setViewMode,
    setShowFilters,
    addJob,
    updateJob,
    deleteJob,
    bulkDelete,
    bulkUpdateStatus,
    toggleJobSelection,
    selectAllJobs,
    clearSelection,
    toggleFavorite
  } = useJobs();

  const [showAddJob, setShowAddJob] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleAddJob = () => {
    setShowAddJob(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
  };

  const handleViewJob = (job: Job) => {
    // TODO: Implement job details view
    console.log('View job:', job);
  };

  const handleAddJobToColumn = (status: Job['status']) => {
    // TODO: Implement add job to specific column
    console.log('Add job to column:', status);
  };

  const renderJobs = () => {
    switch (viewMode) {
      case 'kanban':
    return (
          <JobKanban
            jobs={jobs}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onAddJobToColumn={handleAddJobToColumn}
          />
        );
      
      case 'grid':
    return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favorites.includes(job.id)}
                isSelected={selectedJobs.includes(job.id)}
                onToggleFavorite={toggleFavorite}
                onToggleSelection={toggleJobSelection}
                onEdit={handleEditJob}
                onDelete={deleteJob}
                onView={handleViewJob}
              />
            ))}
      </div>
    );

      case 'table':
    return (
          <div className="p-6">
            <JobTable
              jobs={jobs}
              favorites={favorites}
              selectedJobs={selectedJobs}
              onToggleFavorite={toggleFavorite}
              onToggleSelection={toggleJobSelection}
              onSelectAll={selectAllJobs}
              onEdit={handleEditJob}
              onDelete={deleteJob}
              onView={handleViewJob}
            />
      </div>
    );

      case 'list':
      default:
    return (
          <div className="space-y-4 p-6">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favorites.includes(job.id)}
                isSelected={selectedJobs.includes(job.id)}
                onToggleFavorite={toggleFavorite}
                onToggleSelection={toggleJobSelection}
                onEdit={handleEditJob}
                onDelete={deleteJob}
                onView={handleViewJob}
              />
            ))}
      </div>
    );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Ultra Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-1 flex-shrink-0">
        <div className="flex items-center justify-between">
            <div>
            <p className="text-xs text-gray-600">Manage your job applications and track your progress</p>
          </div>
        </div>
      </div>

      {/* Ultra Compact Stats */}
      <div className="px-4 pt-1">
        <JobStats stats={stats} />
            </div>
            
      {/* Merged Toolbar (Filters + Actions) */}
      <JobMergedToolbar
        filters={filters}
        onFiltersChange={setFilters}
        showAdvancedFilters={showFilters}
        onToggleAdvancedFilters={() => setShowFilters(!showFilters)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedJobsCount={selectedJobs.length}
        onBulkUpdateStatus={bulkUpdateStatus}
        onBulkDelete={bulkDelete}
        onClearSelection={clearSelection}
        onExport={() => console.log('Export jobs')}
        onImport={() => console.log('Import jobs')}
        onShowSettings={() => console.log('Show settings')}
      />

      {/* Scrollable Content */}
      <div className={`flex-1 overflow-y-auto ${viewMode === 'kanban' ? 'overflow-x-auto' : ''}`}>
        {jobs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first job application</p>
              <button
                onClick={handleAddJob}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Job
              </button>
            </div>
          </div>
        ) : (
          renderJobs()
        )}
      </div>

      {/* TODO: Add Job Form Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Job</h2>
            <p className="text-gray-600 mb-4">Job form will be implemented here</p>
            <div className="flex gap-3">
            <button
                onClick={() => setShowAddJob(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
                Cancel
            </button>
              <button
                onClick={() => setShowAddJob(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Job
              </button>
            </div>
                </div>
              </div>
      )}

      {/* TODO: Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Job</h2>
            <p className="text-gray-600 mb-4">Job edit form will be implemented here</p>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingJob(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingJob(null)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAddJob(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Add Job"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
