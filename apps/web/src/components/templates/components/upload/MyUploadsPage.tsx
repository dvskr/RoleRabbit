/**
 * MyUploadsPage Component
 * Page for managing user's uploaded templates
 */

import React, { useEffect, useState } from 'react';
import { Upload, Plus, Filter, Search, AlertCircle } from 'lucide-react';
import { useTemplateUpload, type UploadedTemplate } from '../../hooks/useTemplateUpload';
import { UploadedTemplateCard } from './UploadedTemplateCard';
import { TemplateUploadModal } from './TemplateUploadModal';
import { UploadLimits } from './UploadLimits';

interface MyUploadsPageProps {
  className?: string;
}

export const MyUploadsPage: React.FC<MyUploadsPageProps> = ({ className = '' }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(
    'ALL'
  );
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');

  const {
    uploads,
    limits,
    loading,
    error,
    fetchUploads,
    fetchLimits,
    deleteTemplate,
    toggleVisibility,
  } = useTemplateUpload();

  // Load uploads and limits on mount
  useEffect(() => {
    fetchUploads();
    fetchLimits();
  }, [fetchUploads, fetchLimits]);

  // Filter uploads
  const filteredUploads = uploads.filter((upload) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = upload.name.toLowerCase().includes(query);
      const matchesDescription = upload.description.toLowerCase().includes(query);
      const matchesTags = upload.tags.some((tag) => tag.toLowerCase().includes(query));

      if (!matchesName && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Status filter
    if (filterStatus !== 'ALL' && upload.status !== filterStatus) {
      return false;
    }

    // Visibility filter
    if (filterVisibility === 'PUBLIC' && !upload.isPublic) {
      return false;
    }
    if (filterVisibility === 'PRIVATE' && upload.isPublic) {
      return false;
    }

    return true;
  });

  // Handle upload complete
  const handleUploadComplete = () => {
    fetchUploads();
    fetchLimits();
  };

  // Handle delete
  const handleDelete = async (templateId: string) => {
    const result = await deleteTemplate(templateId);
    if (result.success) {
      // Refresh list
      fetchUploads();
    } else {
      alert(result.error || 'Failed to delete template');
    }
  };

  // Handle toggle visibility
  const handleToggleVisibility = async (templateId: string, isPublic: boolean) => {
    const result = await toggleVisibility(templateId, isPublic);
    if (!result.success) {
      alert(result.error || 'Failed to update visibility');
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Uploads</h1>
        <p className="text-gray-600">Manage your uploaded resume templates</p>
      </div>

      {/* Upload Limits */}
      {limits && (
        <div className="mb-6">
          <UploadLimits limits={limits} />
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={limits?.remainingUploads === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Upload Template
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Visibility Filter */}
        <select
          value={filterVisibility}
          onChange={(e) => setFilterVisibility(e.target.value as any)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Visibility</option>
          <option value="PUBLIC">Public Only</option>
          <option value="PRIVATE">Private Only</option>
        </select>

        {/* Active Filters Count */}
        {(searchQuery || filterStatus !== 'ALL' || filterVisibility !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('ALL');
              setFilterVisibility('ALL');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-medium text-red-900">Error loading templates</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => {
                fetchUploads();
                fetchLimits();
              }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && uploads.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[3/4] rounded-t-lg" />
              <div className="bg-gray-100 p-4 rounded-b-lg space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {!loading && filteredUploads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUploads.map((template) => (
            <UploadedTemplateCard
              key={template.id}
              template={template}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUploads.length === 0 && uploads.length === 0 && (
        <div className="text-center py-16">
          <Upload className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates uploaded yet</h3>
          <p className="text-gray-600 mb-6">
            Start uploading your resume templates to share with others
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={limits?.remainingUploads === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Upload Your First Template
          </button>
        </div>
      )}

      {/* No Results State */}
      {!loading && filteredUploads.length === 0 && uploads.length > 0 && (
        <div className="text-center py-16">
          <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('ALL');
              setFilterVisibility('ALL');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Results Summary */}
      {!loading && filteredUploads.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {filteredUploads.length} of {uploads.length} templates
        </div>
      )}

      {/* Upload Modal */}
      <TemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default MyUploadsPage;
