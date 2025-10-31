import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import EmptyState from './EmptyState';
import { 
  JobCard, 
  JobMergedToolbar, 
  JobKanban, 
  JobStats, 
  EditableJobTable, 
  AddJobModal, 
  EditJobModal, 
  JobDetailView, 
  ExportModal, 
  SettingsModal 
} from './jobs';
import { useJobsApi } from '../hooks/useJobsApi';
import { Job, SavedView } from '../types/job';
import { logger } from '../utils/logger';
import { useTheme } from '../contexts/ThemeContext';

export default function JobTracker() {
  try {
    const { theme } = useTheme();
    const colors = theme?.colors;
    
    // Safety check for theme
    if (!colors) {
      return (
        <div className="h-full flex items-center justify-center bg-white">
          <p className="text-gray-600">Loading...</p>
        </div>
      );
    }

    let hookResult;
    try {
      hookResult = useJobsApi();
    } catch (error) {
      logger.error('Error initializing useJobsApi:', error);
      return (
        <div className="h-full flex items-center justify-center" style={{ background: colors.background || '#ffffff' }}>
          <div className="text-center">
            <p style={{ color: colors.primaryText || '#000000' }}>Error loading job tracker. Please refresh the page.</p>
          </div>
        </div>
      );
    }

    const {
      jobs = [], // Already filtered and sorted - use this for ALL views
      isLoading = false,
      filters = {
        status: 'all',
        searchTerm: '',
        sortBy: 'date',
        groupBy: 'status',
        showArchived: false
      },
      viewMode = 'table',
      selectedJobs = [],
      favorites = [],
      showFilters = false,
      stats = {
        total: 0,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
        favorites: 0
      },
      setFilters = () => {},
      setViewMode = () => {},
      setShowFilters = () => {},
      addJob = async () => {},
      updateJob = async () => {},
      deleteJob = async () => {},
      restoreJob = async () => {},
      bulkDelete = async () => {},
      bulkRestore = async () => {},
      bulkUpdateStatus = async () => {},
      toggleJobSelection = () => {},
      clearSelection = () => {},
      toggleFavorite = () => {}
    } = hookResult || {};

  const [showAddJob, setShowAddJob] = useState(false);
  const [preSelectedStatus, setPreSelectedStatus] = useState<Job['status'] | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    try {
      const saved = localStorage.getItem('jobSavedViews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // All hooks must be called before any conditional returns
  const handleAddJob = useCallback(() => {
    setPreSelectedStatus(null);
    setShowAddJob(true);
  }, []);

  const handleAddJobSubmit = useCallback((jobData: any) => {
    addJob(jobData);
    setShowAddJob(false);
    setPreSelectedStatus(null);
  }, [addJob]);

  const handleEditJob = useCallback((job: Job) => {
    setEditingJob(job);
  }, []);

  const handleEditJobSubmit = useCallback((jobData: Job) => {
    updateJob(jobData.id, jobData);
    setEditingJob(null);
  }, [updateJob]);

  const handleViewJob = useCallback((job: Job) => {
    setViewingJob(job);
  }, []);

  const handleAddJobToColumn = useCallback((status: Job['status']) => {
    setPreSelectedStatus(status);
    setShowAddJob(true);
  }, []);

  const handleExportJobs = useCallback(() => {
    setShowExportModal(true);
  }, []);

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
            logger.debug('Imported jobs:', importedJobs);
            
            // Validate and import jobs
            if (Array.isArray(importedJobs)) {
              // Process each job and add to state
              const jobsToAdd = importedJobs.map((job: any) => {
                // Create a new job with ensured ID
                const newJob: Omit<Job, 'id'> = {
                  title: job.title || 'Untitled Job',
                  company: job.company || '',
                  location: job.location || '',
                  status: job.status || 'applied',
                  appliedDate: job.appliedDate || new Date().toISOString().split('T')[0],
                  salary: job.salary || '',
                  description: job.description || '',
                  url: job.url || '',
                  notes: job.notes || '',
                  priority: job.priority || 'medium',
                  remote: job.remote || false,
                  companySize: job.companySize || '',
                  industry: job.industry || ''
                };
                return newJob;
              });
              
              // Add all jobs
              jobsToAdd.forEach(job => addJob(job));
              
              alert(`Successfully imported ${importedJobs.length} job(s)`);
            } else {
              alert('Invalid file format. Expected an array of jobs.');
            }
          } catch (error) {
            logger.error('Error importing jobs:', error);
            alert('Failed to import jobs. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleShowSettings = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const renderJobs = useMemo(() => {
    if (!Array.isArray(jobs)) {
      return (
        <div className="flex-1 flex items-center justify-center h-full">
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Start tracking your job applications to never miss an opportunity."
            actionLabel="Add Your First Job"
            onAction={handleAddJob}
          />
        </div>
      );
    }

    try {
      switch (viewMode) {
        case 'kanban':
          if (!JobKanban) {
            return <div className="p-4">Kanban view not available</div>;
          }
          return (
            <JobKanban
              jobs={jobs}
              favorites={favorites || []}
              onToggleFavorite={toggleFavorite}
              onAddJobToColumn={handleAddJobToColumn}
            />
          );
        
        case 'grid':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {jobs.map(job => {
                if (!job || !job.id) return null;
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    isFavorite={(favorites || []).includes(job.id)}
                    isSelected={(selectedJobs || []).includes(job.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleSelection={toggleJobSelection}
                    onEdit={handleEditJob}
                    onDelete={deleteJob}
                    onView={handleViewJob}
                    onRestore={restoreJob}
                    showDeleted={filters.showDeleted || false}
                  />
                );
              })}
            </div>
          );

        case 'table':
          if (!EditableJobTable) {
            return <div className="p-4">Table view not available</div>;
          }
          return (
            <div className="p-4 h-full flex flex-col" style={{ minHeight: 0 }}>
              <EditableJobTable
                jobs={jobs || []}
                onEdit={handleEditJob}
                onDelete={deleteJob}
                onRestore={restoreJob}
                onView={handleViewJob}
                onAdd={handleAddJob}
                onUpdate={handleEditJobSubmit}
                favorites={favorites || []}
                onToggleFavorite={toggleFavorite}
                selectedJobs={selectedJobs || []}
                onToggleSelection={toggleJobSelection}
                onImport={handleImportJobs}
                onBulkDelete={bulkDelete}
                onBulkRestore={bulkRestore}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onShowFilters={() => setShowFilters(!showFilters)}
                showDeleted={filters.showDeleted || false}
                filters={filters}
                onFiltersChange={setFilters}
                savedViews={savedViews || []}
                onSaveView={(view) => {
                  try {
                    const newView: SavedView = {
                      ...view,
                      id: `view-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                    };
                    const updated = [...(savedViews || []), newView];
                    setSavedViews(updated);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('jobSavedViews', JSON.stringify(updated));
                    }
                  } catch (error) {
                    logger.error('Error saving view:', error);
                  }
                }}
                onDeleteView={(viewId) => {
                  try {
                    const updated = (savedViews || []).filter(v => v.id !== viewId);
                    setSavedViews(updated);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('jobSavedViews', JSON.stringify(updated));
                    }
                  } catch (error) {
                    logger.error('Error deleting view:', error);
                  }
                }}
                onLoadView={(view) => {
                  try {
                    setFilters(view.filters);
                  } catch (error) {
                    logger.error('Error loading view:', error);
                  }
                }}
                onCreate={async (jobData) => {
                  try {
                    const newJob: Omit<Job, 'id'> = {
                      title: jobData.title || 'Untitled Job',
                      company: jobData.company || '',
                      location: jobData.location || '',
                      status: (jobData.status as Job['status']) || 'applied',
                      appliedDate: jobData.appliedDate || new Date().toISOString().split('T')[0],
                      lastUpdated: new Date().toISOString().split('T')[0],
                      salary: jobData.salary,
                      url: jobData.url,
                      notes: jobData.notes,
                      nextStep: jobData.nextStep,
                      nextStepDate: jobData.nextStepDate,
                      priority: jobData.priority,
                      contact: jobData.contact || {},
                      description: jobData.description,
                      requirements: jobData.requirements,
                      benefits: jobData.benefits,
                      remote: jobData.remote,
                      companySize: jobData.companySize,
                      industry: jobData.industry,
                    };
                    await handleAddJobSubmit(newJob);
                  } catch (error) {
                    logger.error('Error creating job:', error);
                    alert('Failed to create job. Please try again.');
                  }
                }}
              />
            </div>
          );

        case 'list':
        default:
          return (
            <div className="space-y-3 p-4">
              {jobs.map(job => {
                if (!job || !job.id) return null;
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    isFavorite={(favorites || []).includes(job.id)}
                    isSelected={(selectedJobs || []).includes(job.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleSelection={toggleJobSelection}
                    onEdit={handleEditJob}
                    onDelete={deleteJob}
                    onView={handleViewJob}
                    onRestore={restoreJob}
                    showDeleted={filters.showDeleted || false}
                  />
                );
              })}
            </div>
          );
      }
    } catch (error) {
      logger.error('Error rendering jobs:', error);
      return (
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="text-center">
            <p style={{ color: colors.primaryText }}>Error displaying jobs. Please refresh the page.</p>
          </div>
        </div>
      );
    }
  }, [viewMode, jobs, favorites, selectedJobs, filters, toggleFavorite, toggleJobSelection, handleEditJob, deleteJob, handleViewJob, restoreJob, handleAddJob, handleAddJobToColumn, handleEditJobSubmit, bulkDelete, bulkRestore, setViewMode, setShowFilters, showFilters, setFilters, savedViews, handleAddJobSubmit, colors]);

  // Show loading state when fetching from API
  if (isLoading) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{ background: colors.background }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.primaryBlue,
              borderTopColor: 'transparent',
            }}
          />
          <p style={{ color: colors.secondaryText }}>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col overflow-hidden"
      style={{ background: colors.background }}
    >

      {/* Ultra Compact Stats */}
      {JobStats && stats && (
        <div className="px-4 pt-1">
          <JobStats stats={stats} />
        </div>
      )}
            
      {/* Merged Toolbar (Filters + Actions) - Hidden for table view, shown for other views */}
      {viewMode !== 'table' && JobMergedToolbar && (
        <JobMergedToolbar
          filters={filters}
          onFiltersChange={setFilters}
          showAdvancedFilters={showFilters}
          onToggleAdvancedFilters={() => setShowFilters(!showFilters)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedJobsCount={(selectedJobs || []).length}
          onBulkUpdateStatus={bulkUpdateStatus}
          onBulkDelete={(permanent) => bulkDelete(permanent)}
          onBulkRestore={bulkRestore}
          onClearSelection={clearSelection}
          onExport={handleExportJobs}
          onImport={handleImportJobs}
          onShowSettings={handleShowSettings}
        />
      )}

      {/* Scrollable Content */}
      <div className={`flex-1 overflow-y-auto ${viewMode === 'kanban' ? 'overflow-x-auto' : ''}`}>
        {(!jobs || !Array.isArray(jobs) || jobs.length === 0) && viewMode !== 'table' ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <EmptyState
              icon={Briefcase}
              title="No jobs yet"
              description="Start tracking your job applications to never miss an opportunity. Add jobs as you apply and watch your pipeline grow."
              actionLabel="Add Your First Job"
              onAction={handleAddJob}
              secondaryActionLabel="Import Jobs"
              onSecondaryAction={() => alert('Import feature coming soon!')}
            />
          </div>
        ) : (
          renderJobs
        )}
      </div>

      {/* Add Job Modal */}
      {showAddJob && AddJobModal && (
        <AddJobModal
          onClose={() => {
            setShowAddJob(false);
            setPreSelectedStatus(null);
          }}
          onAdd={handleAddJobSubmit}
          initialStatus={preSelectedStatus || undefined}
        />
      )}

      {/* Edit Job Modal */}
      {editingJob && EditJobModal && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdate={handleEditJobSubmit}
        />
      )}

      {/* Job Detail View */}
      {viewingJob && JobDetailView && (
        <JobDetailView
          job={viewingJob}
          onClose={() => setViewingJob(null)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && ExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          data={jobs || []}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && SettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAddJob(true)}
          className="w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group"
          style={{
            background: colors?.primaryBlue || '#3b82f6',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors?.primaryBlueHover || colors?.primaryBlue || '#2563eb';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors?.primaryBlue || '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Add Job"
          aria-label="Add Job"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </div>
    );
  } catch (error) {
    logger.error('Critical error in JobTracker:', error);
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading Job Tracker</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
