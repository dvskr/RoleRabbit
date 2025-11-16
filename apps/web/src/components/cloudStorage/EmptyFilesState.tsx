'use client';

import React from 'react';
import { Cloud, Search, Filter, Folder, Trash2, Star, Archive, FileX, Users, Clock } from 'lucide-react';
import { EmptyFilesStateProps, FileType } from './types';

const getEmptyStateConfig = (
  searchTerm: string,
  filterType: FileType,
  showDeleted: boolean,
  quickFilters?: { starred?: boolean; archived?: boolean; shared?: boolean; recent?: boolean }
): { icon: React.ReactNode; title: string; message: string; action?: string } => {
  if (showDeleted) {
    return {
      icon: <Trash2 size={48} />,
      title: 'Recycle Bin is Empty',
      message: 'Files you delete will appear here. You can restore them or permanently delete them.',
    };
  }

  // FE-034: Empty state for starred files
  if (quickFilters?.starred) {
    return {
      icon: <Star size={48} />,
      title: 'No Starred Files',
      message: 'You haven\'t starred any files yet. Star important files to find them quickly.',
    };
  }

  // FE-034: Empty state for archived files
  if (quickFilters?.archived) {
    return {
      icon: <Archive size={48} />,
      title: 'No Archived Files',
      message: 'You haven\'t archived any files yet. Archive files to keep them organized.',
    };
  }

  // FE-034: Empty state for shared files
  if (quickFilters?.shared) {
    return {
      icon: <Users size={48} />,
      title: 'No Shared Files',
      message: 'You haven\'t shared any files yet. Share files with others to collaborate.',
    };
  }

  // FE-034: Empty state for recent files
  if (quickFilters?.recent) {
    return {
      icon: <Clock size={48} />,
      title: 'No Recent Files',
      message: 'No files have been modified in the last 7 days.',
    };
  }

  if (searchTerm) {
    return {
      icon: <Search size={48} />,
      title: 'No Files Found',
      message: `No files match your search "${searchTerm}". Try adjusting your search terms or filters.`,
      action: 'Clear search',
    };
  }

  if (filterType !== 'all') {
    const filterLabels: Record<FileType, string> = {
      all: 'All Files',
      resume: 'Resumes',
      template: 'Templates',
      backup: 'Backups',
      cover_letter: 'Cover Letters',
      transcript: 'Transcripts',
      certification: 'Certifications',
      reference: 'References',
      portfolio: 'Portfolios',
      work_sample: 'Work Samples',
      document: 'Documents',
    };

    return {
      icon: <Filter size={48} />,
      title: `No ${filterLabels[filterType]} Found`,
      message: `You don't have any ${filterLabels[filterType].toLowerCase()} yet. Upload your first file to get started.`,
      action: 'Clear filter',
    };
  }

  return {
    icon: <Cloud size={48} />,
    title: 'No Files Yet',
    message: 'Upload your first file to get started. You can organize files into folders, share them with others, and more.',
    action: 'Upload Your First File',
  };
};

export const EmptyFilesState: React.FC<EmptyFilesStateProps> = ({
  searchTerm,
  filterType,
  onUpload,
  colors,
  showDeleted = false,
  quickFilters,
}) => {
  const config = getEmptyStateConfig(searchTerm, filterType, showDeleted, quickFilters);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div 
        className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{
          background: colors.inputBackground,
          color: colors.tertiaryText,
        }}
      >
        {config.icon}
      </div>
      
      <h3 
        className="text-xl font-semibold mb-2"
        style={{ color: colors.primaryText }}
      >
        {config.title}
      </h3>
      
      <p 
        className="text-sm max-w-md mb-6"
        style={{ color: colors.secondaryText }}
      >
        {config.message}
      </p>
      
      {onUpload && !showDeleted && !searchTerm && filterType === 'all' && (
        <button
          onClick={onUpload}
          className="px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          style={{
            background: colors.primaryBlue,
            color: 'white',
            boxShadow: '0 4px 12px rgba(64, 87, 255, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          aria-label="Upload files"
        >
          <Cloud size={18} />
          Upload Your First File
        </button>
      )}
      
      {searchTerm && (
        <div className="flex flex-col gap-2 items-center">
          <p className="text-xs" style={{ color: colors.tertiaryText }}>
            Tips for better search results:
          </p>
          <ul className="text-xs text-left space-y-1" style={{ color: colors.secondaryText }}>
            <li>• Try searching by file name, type, or description</li>
            <li>• Use filters to narrow down results</li>
            <li>• Check your spelling</li>
          </ul>
        </div>
      )}
    </div>
  );
};
