/**
 * Application Dashboard Component
 * Shows all automated job applications with statistics and filters
 */

import React, { useState, useMemo } from 'react';
import { Briefcase, CheckCircle, Clock, XCircle, TrendingUp, Filter, Search, ExternalLink, Calendar } from 'lucide-react';
import { useJobBoardApi, JobApplication } from '../../../hooks/useJobBoardApi';
import { useTheme } from '../../../contexts/ThemeContext';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function StatsCard({ icon, label, value, subtext, color }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color === 'text-blue-600' ? 'bg-blue-100' : color === 'text-green-600' ? 'bg-green-100' : color === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-red-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface ApplicationCardProps {
  application: JobApplication;
  onViewDetails: (app: JobApplication) => void;
}

function ApplicationCard({ application, onViewDetails }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-green-100 text-green-800';
      case 'VIEWED':
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'INTERVIEWING':
        return 'bg-purple-100 text-purple-800';
      case 'OFFERED':
        return 'bg-emerald-100 text-emerald-800';
      case 'ACCEPTED':
        return 'bg-teal-100 text-teal-800';
      case 'REJECTED':
      case 'WITHDRAWN':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LINKEDIN':
        return 'bg-blue-100 text-blue-800';
      case 'INDEED':
        return 'bg-green-100 text-green-800';
      case 'GLASSDOOR':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{application.jobTitle}</h3>
          <p className="text-sm text-gray-600">{application.company}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(application.platform)}`}>
            {application.platform}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        {application.appliedAt && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Applied: {formatDate(application.appliedAt)}</span>
          </div>
        )}
        {application.isAutoApplied && (
          <div className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-600" />
            <span className="text-green-600">Auto-Applied</span>
          </div>
        )}
      </div>

      {application.applicationMethod && (
        <div className="text-xs text-gray-500 mb-3">
          Method: {application.applicationMethod}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(application)}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
        >
          View Details
        </button>
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ApplicationDashboard() {
  const { applications, stats, isLoading, loadApplications } = useJobBoardApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [viewDetailsApp, setViewDetailsApp] = useState<JobApplication | null>(null);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchTerm === '' ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || app.status === statusFilter;

      const matchesPlatform =
        platformFilter === 'all' || app.platform === platformFilter;

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [applications, searchTerm, statusFilter, platformFilter]);

  const handleViewDetails = (app: JobApplication) => {
    setViewDetailsApp(app);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Application Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track your automated job applications and their status
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<Briefcase className="text-blue-600" size={20} />}
            label="Total Applications"
            value={stats.total}
            color="text-blue-600"
          />
          <StatsCard
            icon={<CheckCircle className="text-green-600" size={20} />}
            label="Submitted"
            value={stats.submitted}
            subtext={`${stats.successRate}% success rate`}
            color="text-green-600"
          />
          <StatsCard
            icon={<Clock className="text-yellow-600" size={20} />}
            label="In Progress"
            value={stats.pending}
            color="text-yellow-600"
          />
          <StatsCard
            icon={<XCircle className="text-red-600" size={20} />}
            label="Failed"
            value={stats.failed}
            color="text-red-600"
          />
        </div>
      )}

      {/* Platform Breakdown */}
      {stats && Object.keys(stats.byPlatform).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">By Platform</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byPlatform).map(([platform, count]) => (
              <div key={platform} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{platform}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search jobs or companies..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="VIEWED">Viewed</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFERED">Offered</option>
            <option value="REJECTED">Rejected</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="INDEED">Indeed</option>
            <option value="GLASSDOOR">Glassdoor</option>
            <option value="ZIPRECRUITER">ZipRecruiter</option>
          </select>
        </div>
      </div>

      {/* Applications Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
          </h3>
          <p className="text-gray-600">
            {applications.length === 0
              ? 'Start applying to jobs to see them here'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredApplications.length} of {applications.length} applications
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {viewDetailsApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
              <button
                onClick={() => setViewDetailsApp(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Job Title</p>
                <p className="font-medium text-gray-900">{viewDetailsApp.jobTitle}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium text-gray-900">{viewDetailsApp.company}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="font-medium text-gray-900">{viewDetailsApp.platform}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-900">{viewDetailsApp.status}</p>
              </div>

              {viewDetailsApp.appliedAt && (
                <div>
                  <p className="text-sm text-gray-600">Applied At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(viewDetailsApp.appliedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {viewDetailsApp.applicationMethod && (
                <div>
                  <p className="text-sm text-gray-600">Application Method</p>
                  <p className="font-medium text-gray-900">{viewDetailsApp.applicationMethod}</p>
                </div>
              )}

              {viewDetailsApp.jobDescription && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Job Description</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 max-h-48 overflow-y-auto">
                    {viewDetailsApp.jobDescription}
                  </div>
                </div>
              )}

              {viewDetailsApp.metadata && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Automation Details</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700 max-h-48 overflow-y-auto">
                    <pre>{JSON.stringify(viewDetailsApp.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}

              {viewDetailsApp.jobUrl && (
                <a
                  href={viewDetailsApp.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Original Posting
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
