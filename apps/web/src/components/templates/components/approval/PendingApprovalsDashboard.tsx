/**
 * PendingApprovalsDashboard Component
 * Admin dashboard for reviewing pending template approvals
 */

import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
} from 'lucide-react';
import { useTemplateApproval, type TemplateApproval } from '../../hooks/useTemplateApproval';
import { ReviewInterface } from './ReviewInterface';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';

interface PendingApprovalsDashboardProps {
  className?: string;
}

export const PendingApprovalsDashboard: React.FC<PendingApprovalsDashboardProps> = ({
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(
    'PENDING'
  );
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'submitter' | 'status'>('date');

  const {
    approvals,
    loading,
    error,
    fetchPendingApprovals,
    fetchAllApprovals,
  } = useTemplateApproval();

  // Load approvals on mount and when filter changes
  useEffect(() => {
    if (filterStatus === 'PENDING') {
      fetchPendingApprovals();
    } else {
      fetchAllApprovals(filterStatus === 'ALL' ? undefined : filterStatus);
    }
  }, [filterStatus, fetchPendingApprovals, fetchAllApprovals]);

  // Filter approvals based on search
  const filteredApprovals = approvals.filter((approval) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const matchesTemplate = approval.template?.name.toLowerCase().includes(query);
    const matchesSubmitter = approval.submitter?.name.toLowerCase().includes(query);
    const matchesDescription = approval.template?.description?.toLowerCase().includes(query);

    return matchesTemplate || matchesSubmitter || matchesDescription;
  });

  // Sort approvals
  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case 'submitter':
        return (a.submitter?.name || '').localeCompare(b.submitter?.name || '');
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Handle review complete
  const handleReviewComplete = () => {
    setExpandedApproval(null);
    // Refresh list
    if (filterStatus === 'PENDING') {
      fetchPendingApprovals();
    } else {
      fetchAllApprovals(filterStatus === 'ALL' ? undefined : filterStatus);
    }
  };

  // Calculate stats
  const stats = {
    total: approvals.length,
    pending: approvals.filter((a) => a.status === 'PENDING').length,
    approved: approvals.filter((a) => a.status === 'APPROVED').length,
    rejected: approvals.filter((a) => a.status === 'REJECTED').length,
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Approvals</h1>
        <p className="text-gray-600">Review and manage template submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by template name, submitter, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Only</option>
              <option value="APPROVED">Approved Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="submitter">Submitter</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-medium text-red-900">Error loading approvals</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => {
                if (filterStatus === 'PENDING') {
                  fetchPendingApprovals();
                } else {
                  fetchAllApprovals(filterStatus === 'ALL' ? undefined : filterStatus);
                }
              }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && approvals.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex gap-4">
                <div className="w-32 h-40 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approvals List */}
      {!loading && sortedApprovals.length > 0 && (
        <div className="space-y-4">
          {sortedApprovals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Approval Header */}
              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpandedApproval(expandedApproval === approval.id ? null : approval.id)
                }
              >
                <div className="flex gap-4">
                  {/* Template Image */}
                  <img
                    src={approval.template?.imageUrl}
                    alt={approval.template?.name}
                    className="w-32 h-40 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Template Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {approval.template?.name}
                        </h3>
                        {approval.template?.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {approval.template?.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <ApprovalStatusBadge status={approval.status} />
                        {expandedApproval === approval.id ? (
                          <ChevronUp className="text-gray-400" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={20} />
                        )}
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>Submitted by {approval.submitter?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(approval.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Review Details (if reviewed) */}
                    {approval.status !== 'PENDING' && approval.reviewedAt && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>Reviewed by {approval.reviewer?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(approval.reviewedAt).toLocaleDateString()}</span>
                          </div>
                          {approval.qualityScore && (
                            <div className="flex items-center gap-1">
                              <span>Quality: {approval.qualityScore}/5 ⭐</span>
                            </div>
                          )}
                        </div>
                        {approval.feedback && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Feedback:</strong> {approval.feedback}
                          </p>
                        )}
                        {approval.rejectionReason && (
                          <p className="text-sm text-red-700 mt-2">
                            <strong>Rejection Reason:</strong> {approval.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Interface (Expanded) */}
              {expandedApproval === approval.id && approval.status === 'PENDING' && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <ReviewInterface approval={approval} onReviewComplete={handleReviewComplete} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedApprovals.length === 0 && approvals.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600">
            {filterStatus === 'PENDING'
              ? 'There are no pending template approvals at this time.'
              : 'No template submissions match your filters.'}
          </p>
        </div>
      )}

      {/* No Results State */}
      {!loading && sortedApprovals.length === 0 && approvals.length > 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('PENDING');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Results Summary */}
      {!loading && sortedApprovals.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {sortedApprovals.length} of {approvals.length} approvals
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsDashboard;
