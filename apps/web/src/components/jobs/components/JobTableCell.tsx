/**
 * JobTable cell component - handles rendering of individual table cells
 */

import React from 'react';
import { CheckSquare, Star, Building2 } from 'lucide-react';
import { Job } from '../../../types/job';
import { useTheme } from '../../../contexts/ThemeContext';
import { getPriorityBadgeStyles } from '../../../utils/themeHelpers';
import { statusOptions, priorityOptions } from '../constants/jobTable.constants';
import { getCellValue } from '../utils/jobTableCellHelpers';
import type { ColumnKey } from '../types/jobTable.types';

interface JobTableCellProps {
  job: Partial<Job> | Job;
  column: ColumnKey;
  jobId: string;
  isEditing: boolean;
  editingValue: string;
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>;
  onEditChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, jobId: string, field: ColumnKey) => void;
  onBlur: () => void;
  onStatusChange: (jobId: string, newStatus: Job['status']) => void;
  onPriorityChange: (jobId: string, newPriority: Job['priority'] | undefined) => void;
  // Selection and favorites
  isSelected?: boolean;
  isFavorite?: boolean;
  onToggleSelection?: () => void;
  onToggleFavorite?: () => void;
}

export default function JobTableCell({
  job,
  column,
  jobId,
  isEditing,
  editingValue,
  inputRef,
  onEditChange,
  onKeyDown,
  onBlur,
  onStatusChange,
  onPriorityChange,
  isSelected = false,
  isFavorite = false,
  onToggleSelection,
  onToggleFavorite,
}: JobTableCellProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const assignInputRef = (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => {
    inputRef.current = element;
  };

  // Checkbox column
  if (column === 'checkbox') {
    return (
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection?.();
          }}
          className="p-0.5 rounded transition-all flex items-center justify-center"
          style={{ 
            color: isSelected ? colors.primaryBlue : colors.tertiaryText,
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            if (!isSelected) {
              e.currentTarget.style.color = colors.primaryBlue;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isSelected ? colors.primaryBlue : colors.tertiaryText;
          }}
          title={isSelected ? 'Deselect row' : 'Select row'}
          aria-label={`${isSelected ? 'Deselect' : 'Select'} ${job.title || 'row'}`}
        >
          <CheckSquare 
            size={16} 
            fill={isSelected ? colors.primaryBlue : 'none'} 
            strokeWidth={isSelected ? 0 : 1.5}
            style={{ 
              color: isSelected ? colors.primaryBlue : colors.tertiaryText,
            }}
          />
        </button>
      </div>
    );
  }

  // Favorite column
  if (column === 'favorite') {
    return (
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className="p-0.5 rounded transition-all"
          style={{ 
            color: isFavorite ? '#fbbf24' : colors.tertiaryText,
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = '#fbbf24';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isFavorite ? '#fbbf24' : colors.tertiaryText;
          }}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={16} fill={isFavorite ? '#fbbf24' : 'none'} strokeWidth={isFavorite ? 0 : 1.5} />
        </button>
      </div>
    );
  }

  const value = getCellValue(job, column);

  // Status column
  if (column === 'status') {
    if (isEditing) {
      return (
        <select
          ref={assignInputRef}
          value={editingValue || job.status || 'applied'}
          onChange={(e) => {
            onEditChange(e.target.value);
            onStatusChange(jobId, e.target.value as Job['status']);
          }}
          onKeyDown={(e) => onKeyDown(e, jobId, column)}
          onBlur={onBlur}
          className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.borderFocused}`,
            color: colors.primaryText,
          }}
          title="Select status"
          aria-label="Job status"
        >
          {statusOptions.map(status => (
            <option key={status} value={status} style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>
              {status}
            </option>
          ))}
        </select>
      );
    }
    const statusColors: Record<Job['status'], { bg: string; text: string }> = {
      'interview': { bg: '#8b5cf6', text: 'white' },
      'applied': { bg: '#3b82f6', text: 'white' },
      'offer': { bg: '#10b981', text: 'white' },
      'rejected': { bg: '#ef4444', text: 'white' },
    };
    const statusColor = statusColors[(job.status || 'applied') as Job['status']] || statusColors.applied;
    return (
      <span 
        className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
        style={{
          background: statusColor.bg,
          color: statusColor.text,
        }}
      >
        {job.status || 'applied'}
      </span>
    );
  }

  // Priority column
  if (column === 'priority') {
    if (isEditing) {
      return (
        <select
          ref={assignInputRef}
          value={editingValue || job.priority || ''}
          onChange={(e) => {
            onEditChange(e.target.value);
            onPriorityChange(jobId, e.target.value as Job['priority'] || undefined);
          }}
          onKeyDown={(e) => onKeyDown(e, jobId, column)}
          onBlur={onBlur}
          className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.borderFocused}`,
            color: colors.primaryText,
          }}
          title="Select priority"
          aria-label="Job priority"
        >
          <option value="" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>None</option>
          {priorityOptions.map(priority => (
            <option key={priority} value={priority} style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>
              {priority}
            </option>
          ))}
        </select>
      );
    }
    if (!job.priority) return <span className="text-sm" style={{ color: colors.tertiaryText }}>—</span>;
    const priorityBadge = getPriorityBadgeStyles(job.priority, colors);
    return (
      <span 
        className="px-2 py-1 rounded text-xs font-medium"
        style={{
          background: priorityBadge.background,
          color: priorityBadge.color,
          border: `1px solid ${priorityBadge.border}`,
        }}
      >
        {job.priority}
      </span>
    );
  }

  // Notes or Next Step columns (textarea)
  if (column === 'notes' || column === 'nextStep') {
    if (isEditing) {
      return (
        <textarea
          ref={assignInputRef}
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, jobId, column)}
          onBlur={onBlur}
          className="w-full px-2 py-1 rounded text-sm resize-none transition-all outline-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.borderFocused}`,
            color: colors.primaryText,
            minHeight: '60px',
          }}
          rows={2}
          placeholder="Enter notes..."
          title="Job notes"
          aria-label="Job notes"
        />
      );
    }
    return (
      <div className="text-sm truncate max-w-xs" style={{ color: colors.secondaryText }} title={value as string || ''}>
        {value || '—'}
      </div>
    );
  }

  // Date columns
  if (column === 'appliedDate' || column === 'lastUpdated' || column === 'nextStepDate') {
    if (isEditing) {
      return (
        <input
          ref={assignInputRef}
          type="date"
          value={editingValue || (job[column as keyof Job] as string) || ''}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, jobId, column)}
          onBlur={onBlur}
          className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.borderFocused}`,
            color: colors.primaryText,
          }}
          title={column === 'appliedDate' ? 'Applied date' : column === 'lastUpdated' ? 'Last updated' : 'Next step date'}
          aria-label={column === 'appliedDate' ? 'Applied date' : column === 'lastUpdated' ? 'Last updated' : 'Next step date'}
        />
      );
    }
    const dateValue = column === 'lastUpdated' ? (job.lastUpdated || job.appliedDate) : job[column as keyof Job];
    return (
      <div className="text-sm" style={{ color: colors.secondaryText }}>
        {dateValue ? new Date(dateValue as string).toLocaleDateString() : '—'}
      </div>
    );
  }

  // URL column
  if (column === 'url') {
    if (isEditing) {
      return (
        <input
          ref={assignInputRef}
          type="url"
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, jobId, column)}
          onBlur={onBlur}
          className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.borderFocused}`,
            color: colors.primaryText,
          }}
          placeholder="https://..."
          title="Job URL"
          aria-label="Job application URL"
        />
      );
    }
    return value ? (
      <a 
        href={value as string} 
        target="_blank" 
        rel="noopener noreferrer"
        className="truncate max-w-xs block text-sm transition-all"
        style={{ color: colors.primaryBlue }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = 'underline';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = 'none';
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(value as string).substring(0, 40)}...
      </a>
    ) : (
      <span className="text-sm" style={{ color: colors.tertiaryText }}>—</span>
    );
  }

  // Contact, email, phone columns
  if (column === 'contact' || column === 'email' || column === 'phone') {
    if (isEditing) {
      return (
        <input
          ref={assignInputRef}
          type={column === 'email' ? 'email' : 'text'}
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, jobId, column)}
          onBlur={onBlur}
          className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.borderFocused}`,
            color: colors.primaryText,
          }}
          placeholder={column === 'contact' ? 'Contact name...' : column === 'email' ? 'email@example.com' : '+1 (555) 000-0000'}
          title={column === 'contact' ? 'Contact name' : column === 'email' ? 'Email address' : 'Phone number'}
          aria-label={column === 'contact' ? 'Contact name' : column === 'email' ? 'Email address' : 'Phone number'}
        />
      );
    }
    return (
      <div className="text-sm" style={{ color: colors.secondaryText }}>
        {value || '—'}
      </div>
    );
  }

  // Company column (with icon)
  if (column === 'company') {
    if (isEditing) {
      return (
        <input
          ref={assignInputRef}
          type="text"
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, jobId, column)}
          onBlur={onBlur}
          className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.borderFocused}`,
            color: colors.primaryText,
          }}
          placeholder="Company name..."
          title="Company name"
          aria-label="Company name"
        />
      );
    }
    const companyValue = value || '';
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{
            background: '#8b5cf6',
          }}
        >
          <Building2 size={14} style={{ color: 'white' }} />
        </div>
        <span className="text-sm" style={{ color: colors.secondaryText }}>
          {companyValue || (jobId === 'new' ? '' : '—')}
        </span>
      </div>
    );
  }

  // Default text input field
  if (isEditing) {
    return (
      <input
        ref={assignInputRef}
        type="text"
        value={editingValue}
        onChange={(e) => onEditChange(e.target.value)}
        onKeyDown={(e) => onKeyDown(e, jobId, column)}
        onBlur={onBlur}
        className="w-full px-2 py-1 rounded text-sm transition-all outline-none"
        style={{
          background: colors.inputBackground,
          border: `1px solid ${colors.borderFocused}`,
          color: colors.primaryText,
        }}
        placeholder={column === 'title' ? 'Job title...' : column === 'location' ? 'Location...' : column === 'salary' ? '$0,000' : ''}
        title={column === 'title' ? 'Job title' : column === 'location' ? 'Location' : column === 'salary' ? 'Salary' : column === 'nextStep' ? 'Next step' : column === 'nextStepDate' ? 'Next step date' : ''}
        aria-label={column || ''}
      />
    );
  }

  const displayValue = value || '';
  const style = column === 'title' 
    ? { color: colors.primaryText, fontWeight: 500 }
    : column === 'salary'
    ? { color: colors.badgeSuccessText, fontWeight: 500 }
    : { color: colors.secondaryText };

  return (
    <div className="text-sm" style={style}>
      {displayValue || (jobId === 'new' ? '' : '—')}
    </div>
  );
}

