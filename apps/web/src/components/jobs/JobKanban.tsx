import React from 'react';
import { Plus, Star, MapPin } from 'lucide-react';
import { Job } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';
import { getStatusBadgeStyles, getPriorityBadgeStyles } from '../../utils/themeHelpers';

interface JobKanbanProps {
  jobs: Job[];
  favorites: string[];
  onToggleFavorite: (jobId: string) => void;
  onAddJobToColumn: (status: Job['status']) => void;
}

export default function JobKanban({
  jobs, // Already filtered and sorted
  favorites,
  selectedJobs = [],
  onToggleFavorite,
  onToggleSelection,
  onEdit,
  onDelete,
  onRestore,
  onView,
  onAddJobToColumn,
  showDeleted = false
}: JobKanbanProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const statusColumns = [
    { status: 'applied' as const, title: 'Applied' },
    { status: 'interview' as const, title: 'Interview' },
    { status: 'offer' as const, title: 'Offer' },
    { status: 'rejected' as const, title: 'Rejected' }
  ];

  return (
    <div className="w-full">
      <div className="flex gap-6 overflow-x-auto pb-4 min-w-max px-6">
        {statusColumns.map(column => {
          const columnJobs = jobs.filter(job => job.status === column.status);
          const columnBadge = getStatusBadgeStyles(column.status, colors);
          
          return (
            <div key={column.status} className="flex-shrink-0 w-80">
              <div 
                className="rounded-lg p-4 h-full"
                style={{
                  background: columnBadge.background,
                  border: `1px solid ${columnBadge.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="font-semibold text-sm"
                    style={{ color: columnBadge.color }}
                  >
                    {column.title} ({columnJobs.length})
                  </h3>
                  <button 
                    onClick={() => onAddJobToColumn(column.status)}
                    className="p-1 rounded transition-all"
                    style={{ color: columnBadge.color }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.hoverBackground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {columnJobs.map(job => {
                    const priorityBadge = job.priority ? getPriorityBadgeStyles(job.priority, colors) : null;
                    
                    return (
                      <div 
                        key={job.id} 
                        className="rounded-lg p-4 transition-all cursor-pointer group"
                        style={{
                          background: colors.cardBackground,
                          border: `1px solid ${colors.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.hoverBackgroundStrong;
                          e.currentTarget.style.borderColor = colors.borderFocused;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.cardBackground;
                          e.currentTarget.style.borderColor = colors.border;
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            {onToggleSelection && (
                              <input
                                type="checkbox"
                                checked={selectedJobs.includes(job.id)}
                                onChange={() => onToggleSelection?.(job.id)}
                                className="mr-2 rounded transition-all w-3 h-3"
                                style={{
                                  accentColor: colors.primaryBlue,
                                  cursor: 'pointer',
                                }}
                                onClick={(e) => e.stopPropagation()}
                                title={`Select ${job.title}`}
                                aria-label={`Select ${job.title}`}
                              />
                            )}
                            <h4 
                              className="font-medium text-sm inline"
                              style={{ color: colors.primaryText }}
                            >
                              {job.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(job.id);
                              }}
                              className="p-1 rounded transition-colors"
                              style={{ color: favorites.includes(job.id) ? colors.warningYellow : colors.tertiaryText }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = colors.warningYellow;
                              }}
                              onMouseLeave={(e) => {
                                if (!favorites.includes(job.id)) {
                                  e.currentTarget.style.color = colors.tertiaryText;
                                }
                              }}
                              title="Toggle Favorite"
                            >
                              <Star size={14} fill={favorites.includes(job.id) ? 'currentColor' : 'none'} />
                            </button>
                            {onView && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(job);
                                }}
                                className="p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: colors.tertiaryText }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = colors.hoverBackground;
                                  e.currentTarget.style.color = colors.primaryBlue;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = colors.tertiaryText;
                                }}
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(job);
                                }}
                                className="p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: colors.tertiaryText }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = colors.hoverBackground;
                                  e.currentTarget.style.color = colors.primaryBlue;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = colors.tertiaryText;
                                }}
                                title="Edit Job"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                            {showDeleted && onRestore && job.deletedAt && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRestore(job.id);
                                }}
                                className="p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: colors.tertiaryText }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = colors.hoverBackground;
                                  e.currentTarget.style.color = colors.badgeSuccessText;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = colors.tertiaryText;
                                }}
                                title="Restore"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                            {onDelete && (!showDeleted || !job.deletedAt) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(job.id, showDeleted);
                                }}
                                className="p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: colors.tertiaryText }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = colors.hoverBackground;
                                  e.currentTarget.style.color = colors.badgeErrorText;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = colors.tertiaryText;
                                }}
                                title={showDeleted ? "Permanently Delete" : "Delete"}
                              >
                                {showDeleted ? <Trash size={14} /> : <Trash2 size={14} />}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p 
                          className="text-xs mb-2"
                          style={{ color: colors.secondaryText }}
                        >
                          {job.company}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs" style={{ color: colors.tertiaryText }}>
                          <MapPin size={12} />
                          <span>{job.location}</span>
                        </div>
                        
                        {job.salary && (
                          <div 
                            className="mt-2 text-xs font-medium"
                            style={{ color: colors.successGreen }}
                          >
                            {job.salary}
                          </div>
                        )}
                        
                        {job.priority && priorityBadge && (
                          <div className="mt-2">
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium border"
                              style={{
                                background: priorityBadge.background,
                                color: priorityBadge.color,
                                border: `1px solid ${priorityBadge.border}`,
                              }}
                            >
                              {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
