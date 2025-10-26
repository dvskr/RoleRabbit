import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { JobCard, JobMergedToolbar, JobKanban, JobStats, JobTable, EditableJobTable, AddJobModal, EditJobModal, JobDetailView, ExportModal, SettingsModal } from './jobs';
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
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleAddJob = () => {
    setShowAddJob(true);
  };

  const handleAddJobSubmit = (jobData: any) => {
    addJob(jobData);
    setShowAddJob(false);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
  };

  const handleEditJobSubmit = (jobData: Job) => {
    updateJob(jobData.id, jobData);
    setEditingJob(null);
  };

  const handleViewJob = (job: Job) => {
    setViewingJob(job);
  };

  const handleAddJobToColumn = (status: Job['status']) => {
    // TODO: Implement add job to specific column
  };

  const handleExportJobs = () => {
    setShowExportModal(true);
  };

  const handleImportJobs = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedJobs = JSON.parse(event.target?.result as string);
            console.log('Imported jobs:', importedJobs);
            // TODO: Add logic to import jobs into state
          } catch (error) {
            console.error('Error importing jobs:', error);
            alert('Failed to import jobs. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleShowSettings = () => {
    setShowSettingsModal(true);
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
            <EditableJobTable
              jobs={jobs}
              onEdit={handleEditJob}
              onDelete={deleteJob}
              onView={handleViewJob}
              onAdd={handleAddJob}
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
        onExport={handleExportJobs}
        onImport={handleImportJobs}
        onShowSettings={handleShowSettings}
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

      {/* Add Job Modal */}
      {showAddJob && (
        <AddJobModal
          onClose={() => setShowAddJob(false)}
          onAdd={handleAddJobSubmit}
        />
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdate={handleEditJobSubmit}
        />
      )}

      {/* Job Detail View */}
      {viewingJob && (
        <JobDetailView
          job={viewingJob}
          onClose={() => setViewingJob(null)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          data={jobs}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
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
