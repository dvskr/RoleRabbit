import React from 'react';
import { Building, MapPin, Calendar, Eye, Edit, Trash2, Star, DollarSign, Link, Trash, RotateCcw } from 'lucide-react';
import { Job } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';
import { getStatusBadgeStyles, getPriorityBadgeStyles } from '../../utils/themeHelpers';

interface JobCardProps {
  job: Job;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleFavorite: (jobId: string) => void;
  onToggleSelection: (jobId: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string, permanent?: boolean) => void;
  onView: (job: Job) => void;
  onRestore?: (jobId: string) => void;
  showDeleted?: boolean;
}

export default function JobCard({
  job,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onToggleSelection,
  onEdit,
  onDelete,
  onView,
  onRestore,
  showDeleted = false
}: JobCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const statusBadge = getStatusBadgeStyles(job.status, colors);
  const priorityBadge = job.priority ? getPriorityBadgeStyles(job.priority, colors) : null;

  return (
    <div 
      className="rounded-lg p-3 transition-all duration-200 cursor-pointer group"
      style={{
        background: isSelected ? colors.badgeInfoBg : colors.cardBackground,
        border: `1px solid ${isSelected ? colors.badgeInfoBorder : colors.border}`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.hoverBackgroundStrong;
          e.currentTarget.style.borderColor = colors.borderFocused;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.cardBackground;
          e.currentTarget.style.borderColor = colors.border;
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(job.id)}
            className="mt-1 rounded transition-all w-3.5 h-3.5"
            style={{
              accentColor: colors.primaryBlue,
              cursor: 'pointer',
            }}
            title={`Select ${job.title}`}
            aria-label={`Select ${job.title}`}
          />
          <div className="flex-1">
            <h3 
              className="font-semibold text-base mb-0.5"
              style={{ color: colors.primaryText }}
            >
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 mb-1" style={{ color: colors.secondaryText }}>
              <Building size={14} />
              <span className="font-medium text-sm">{job.company}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(job.id)}
            className="p-1 rounded transition-colors"
            style={{ color: isFavorite ? colors.warningYellow : colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.warningYellow;
            }}
            onMouseLeave={(e) => {
              if (!isFavorite) {
                e.currentTarget.style.color = colors.tertiaryText;
              }
            }}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(job);
              }}
              className="p-1 rounded transition-all"
              style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.primaryBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.tertiaryText;
              }}
              title="View Details & Trackers"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(job)}
              className="p-1 rounded transition-all"
              style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.successGreen;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.tertiaryText;
              }}
              title="Edit Job"
            >
              <Edit size={14} />
            </button>
            {showDeleted && onRestore && job.deletedAt && (
              <button
                onClick={() => onRestore(job.id)}
                className="p-1 rounded transition-all"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeSuccessBg;
                  e.currentTarget.style.color = colors.badgeSuccessText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.tertiaryText;
                }}
                title="Restore Job"
              >
                <RotateCcw size={14} />
              </button>
            )}
            {onDelete && (!showDeleted || !job.deletedAt) && (
              <button
                onClick={() => onDelete(job.id, showDeleted)}
                className="p-1 rounded transition-all"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeErrorBg;
                  e.currentTarget.style.color = colors.badgeErrorText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.tertiaryText;
                }}
                title={showDeleted ? "Permanently Delete" : "Delete Job"}
              >
                {showDeleted ? <Trash size={14} /> : <Trash2 size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5" style={{ color: colors.secondaryText }}>
          <MapPin size={12} />
          <span className="text-xs">{job.location}</span>
        </div>
        
        <div className="flex items-center gap-1.5" style={{ color: colors.secondaryText }}>
          <Calendar size={12} />
          <span className="text-xs">Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
        </div>
        
        {job.salary && (
          <div className="flex items-center gap-1.5" style={{ color: colors.successGreen }}>
            <DollarSign size={12} />
            <span className="text-xs font-medium">{job.salary}</span>
          </div>
        )}
        
        {job.url && (
          <div className="flex items-center gap-1.5" style={{ color: colors.primaryBlue }}>
            <Link size={12} />
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: colors.primaryBlue }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              View Job Posting
            </a>
          </div>
        )}
      </div>

      {/* Status and Priority */}
      <div className="flex items-center justify-between">
        <span 
          className="px-2 py-1 rounded text-xs font-medium border"
          style={{
            background: statusBadge.background,
            color: statusBadge.color,
            border: `1px solid ${statusBadge.border}`,
          }}
        >
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
        
        {job.priority && priorityBadge && (
          <span 
            className="px-2 py-1 rounded text-xs font-medium border"
            style={{
              background: priorityBadge.background,
              color: priorityBadge.color,
              border: `1px solid ${priorityBadge.border}`,
            }}
          >
            {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
          </span>
        )}
      </div>

      {/* Description */}
      {job.description && (
        <div 
          className="mt-2 pt-2"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <p 
            className="text-xs line-clamp-2"
            style={{ color: colors.secondaryText }}
          >
            {job.description}
          </p>
        </div>
      )}
    </div>
  );
}
