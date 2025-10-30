import React from 'react';
import { ChevronDown, ChevronUp, Star, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Job } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const colors = theme.colors;

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'applied': return { background: colors.badgeInfoBg, color: colors.badgeInfoText, border: colors.badgeInfoBorder };
      case 'interview': return { background: colors.badgeWarningBg, color: colors.badgeWarningText, border: colors.badgeWarningBorder };
      case 'offer': return { background: colors.badgeSuccessBg, color: colors.badgeSuccessText, border: colors.badgeSuccessBorder };
      case 'rejected': return { background: colors.badgeErrorBg, color: colors.badgeErrorText, border: colors.badgeErrorBorder };
      default: return { background: colors.badgeNeutralBg, color: colors.badgeNeutralText, border: colors.badgeNeutralBorder };
    }
  };

  const getPriorityColor = (priority?: Job['priority']) => {
    switch (priority) {
      case 'high': return { background: colors.badgeErrorBg, color: colors.badgeErrorText, border: colors.badgeErrorBorder };
      case 'medium': return { background: colors.badgeWarningBg, color: colors.badgeWarningText, border: colors.badgeWarningBorder };
      case 'low': return { background: colors.badgeSuccessBg, color: colors.badgeSuccessText, border: colors.badgeSuccessBorder };
      default: return { background: colors.badgeNeutralBg, color: colors.badgeNeutralText, border: colors.badgeNeutralBorder };
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
    <div 
      className="rounded-lg overflow-hidden"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead 
            className="border-b"
            style={{
              background: colors.inputBackground,
              borderColor: colors.border,
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onSelectAll}
                  className="rounded"
                  style={{
                    accentColor: colors.primaryBlue,
                    borderColor: colors.border,
                  }}
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Job Title
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Company
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Location
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Status
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Priority
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Applied Date
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Salary
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.tertiaryText }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody 
            className="divide-y transition-colors"
            style={{
              background: colors.cardBackground,
              borderColor: colors.border,
            }}
          >
            {jobs.map((job) => (
              <tr 
                key={job.id} 
                className="transition-colors"
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.cardBackground;
                }}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => onToggleSelection(job.id)}
                    className="rounded"
                    style={{
                      accentColor: colors.primaryBlue,
                      borderColor: colors.border,
                    }}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div 
                        className="text-sm font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        {job.title}
                      </div>
                      {job.description && (
                        <div 
                          className="text-sm truncate max-w-xs"
                          style={{ color: colors.secondaryText }}
                        >
                          {job.description}
                        </div>
                      )}
                    </div>
                    {job.url && (
                      <button
                        onClick={() => window.open(job.url, '_blank')}
                        className="ml-2 p-1 transition-colors"
                        style={{ color: colors.tertiaryText }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.primaryBlue;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.tertiaryText;
                        }}
                        title="View Job Posting"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div 
                    className="text-sm"
                    style={{ color: colors.primaryText }}
                  >
                    {job.company}
                  </div>
                  {job.companySize && (
                    <div 
                      className="text-sm"
                      style={{ color: colors.secondaryText }}
                    >
                      {job.companySize}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div 
                    className="text-sm"
                    style={{ color: colors.primaryText }}
                  >
                    {job.location}
                    {job.remote && (
                      <span 
                        className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: colors.badgeSuccessBg,
                          color: colors.badgeSuccessText,
                        }}
                      >
                        Remote
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: getStatusColor(job.status).background,
                      color: getStatusColor(job.status).color,
                      border: `1px solid ${getStatusColor(job.status).border}`,
                    }}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {job.priority && (
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: getPriorityColor(job.priority).background,
                        color: getPriorityColor(job.priority).color,
                        border: `1px solid ${getPriorityColor(job.priority).border}`,
                      }}
                    >
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </span>
                  )}
                </td>
                <td 
                  className="px-4 py-4 text-sm"
                  style={{ color: colors.primaryText }}
                >
                  {formatDate(job.appliedDate)}
                </td>
                <td 
                  className="px-4 py-4 text-sm"
                  style={{ color: colors.primaryText }}
                >
                  {job.salary || '-'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onToggleFavorite(job.id)}
                      className="p-1 rounded transition-colors"
                      style={{
                        color: favorites.includes(job.id) ? colors.warningYellow : colors.tertiaryText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.warningYellow;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = favorites.includes(job.id) ? colors.warningYellow : colors.tertiaryText;
                      }}
                      title={favorites.includes(job.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star size={16} fill={favorites.includes(job.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => onView(job)}
                      className="p-1 transition-colors"
                      style={{ color: colors.tertiaryText }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.primaryBlue;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.tertiaryText;
                      }}
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(job)}
                      className="p-1 transition-colors"
                      style={{ color: colors.tertiaryText }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.successGreen;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.tertiaryText;
                      }}
                      title="Edit job"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(job.id)}
                      className="p-1 transition-colors"
                      style={{ color: colors.tertiaryText }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.errorRed;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.tertiaryText;
                      }}
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
