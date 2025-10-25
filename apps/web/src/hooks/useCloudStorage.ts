'use client';

import { useState, useMemo, useCallback } from 'react';
import { ResumeFile, FileType, SortBy, ViewMode, StorageInfo, SharePermission, FileComment, ShareLink, User } from '../types/cloudStorage';

export const useCloudStorage = () => {
  // File management
  const [files, setFiles] = useState<ResumeFile[]>([
    {
      id: '1',
      name: 'Software Engineer Resume',
      type: 'resume',
      size: '2.4 MB',
      lastModified: '2024-10-22',
      isPublic: false,
      tags: ['software', 'engineer', 'react'],
      version: 3,
      owner: 'john.doe@example.com',
      sharedWith: [
        {
          id: 'share_1',
          userId: 'user_2',
          userEmail: 'sarah.johnson@example.com',
          userName: 'Sarah Johnson',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          permission: 'edit',
          grantedBy: 'john.doe@example.com',
          grantedAt: '2024-10-20T10:00:00Z'
        }
      ],
      comments: [
        {
          id: 'comment_1',
          userId: 'user_2',
          userName: 'Sarah Johnson',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          content: 'Great resume! Consider adding more details about your React projects.',
          timestamp: '2024-10-21T14:30:00Z',
          replies: [],
          isResolved: false
        }
      ],
      downloadCount: 12,
      viewCount: 45,
      isStarred: true,
      isArchived: false,
      description: 'My latest software engineer resume with React and Node.js experience'
    },
    {
      id: '2',
      name: 'Product Manager Resume',
      type: 'resume',
      size: '1.8 MB',
      lastModified: '2024-10-20',
      isPublic: true,
      tags: ['product', 'management', 'strategy'],
      version: 2,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 8,
      viewCount: 23,
      isStarred: false,
      isArchived: false,
      description: 'Product management resume highlighting strategic thinking and team leadership'
    },
    {
      id: '3',
      name: 'Modern Template',
      type: 'template',
      size: '1.2 MB',
      lastModified: '2024-10-18',
      isPublic: true,
      tags: ['template', 'modern', 'clean'],
      version: 1,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 156,
      viewCount: 892,
      isStarred: true,
      isArchived: false,
      description: 'Clean and modern resume template for professionals'
    },
    {
      id: '4',
      name: 'Backup - Oct 15',
      type: 'backup',
      size: '3.1 MB',
      lastModified: '2024-10-15',
      isPublic: false,
      tags: ['backup', 'october'],
      version: 1,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 0,
      viewCount: 2,
      isStarred: false,
      isArchived: true,
      description: 'Backup of all files from October 15th'
    },
    {
      id: '5',
      name: 'Data Scientist Resume',
      type: 'resume',
      size: '2.7 MB',
      lastModified: '2024-10-12',
      isPublic: false,
      tags: ['data', 'science', 'python', 'ml'],
      version: 4,
      owner: 'john.doe@example.com',
      sharedWith: [
        {
          id: 'share_2',
          userId: 'user_3',
          userEmail: 'mike.chen@example.com',
          userName: 'Mike Chen',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          permission: 'view',
          grantedBy: 'john.doe@example.com',
          grantedAt: '2024-10-10T09:00:00Z',
          expiresAt: '2024-11-10T09:00:00Z'
        }
      ],
      comments: [],
      downloadCount: 5,
      viewCount: 18,
      isStarred: false,
      isArchived: false,
      description: 'Data science resume with ML and Python expertise'
    },
    {
      id: '6',
      name: 'Creative Template',
      type: 'template',
      size: '1.5 MB',
      lastModified: '2024-10-10',
      isPublic: true,
      tags: ['template', 'creative', 'design'],
      version: 2,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 89,
      viewCount: 234,
      isStarred: true,
      isArchived: false,
      description: 'Creative resume template for designers and artists'
    }
  ]);

  // UI state
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FileType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Storage info
  const [storageUsed, setStorageUsed] = useState(9.6);
  const [storageLimit, setStorageLimit] = useState(100);

  // Computed values
  const filteredFiles = useMemo(() => {
    let filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || file.type === filterType;
      return matchesSearch && matchesFilter;
    });

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'date':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });

    return filtered;
  }, [files, searchTerm, filterType, sortBy]);

  const storageInfo: StorageInfo = useMemo(() => ({
    used: storageUsed,
    limit: storageLimit,
    percentage: (storageUsed / storageLimit) * 100
  }), [storageUsed, storageLimit]);

  // File operations
  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedFiles(
      selectedFiles.length === filteredFiles.length 
        ? [] 
        : filteredFiles.map(file => file.id)
    );
  }, [selectedFiles.length, filteredFiles]);

  const handleDeleteFiles = useCallback(() => {
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  }, [selectedFiles]);

  const handleTogglePublic = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, isPublic: !file.isPublic } : file
    ));
  }, []);

  const handleDownloadFile = useCallback((file: ResumeFile) => {
    console.log('Downloading file:', file.name);
    // TODO: Implement actual download logic
  }, []);

  const handleShareFile = useCallback((file: ResumeFile) => {
    console.log('Sharing file:', file.name);
    // TODO: Implement actual share logic
  }, []);

  const handleUploadFile = useCallback((fileData: Partial<ResumeFile>) => {
    const newFile: ResumeFile = {
      id: `file_${Date.now()}`,
      name: fileData.name || 'Untitled',
      type: fileData.type || 'resume',
      size: fileData.size || '0 MB',
      lastModified: new Date().toISOString().split('T')[0],
      isPublic: fileData.isPublic || false,
      tags: fileData.tags || [],
      version: 1
    };
    
    setFiles(prev => [newFile, ...prev]);
    setShowUploadModal(false);
  }, []);

  const handleEditFile = useCallback((fileId: string, updates: Partial<ResumeFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing files...');
    // TODO: Implement actual refresh logic
  }, []);

  // Sharing and Access Management
  const handleShareWithUser = useCallback((fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin') => {
    const newPermission: SharePermission = {
      id: `share_${Date.now()}`,
      userId: `user_${Date.now()}`,
      userEmail,
      userName: userEmail.split('@')[0],
      permission,
      grantedBy: 'current-user@example.com',
      grantedAt: new Date().toISOString()
    };

    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, sharedWith: [...file.sharedWith, newPermission] }
        : file
    ));
  }, []);

  const handleRemoveShare = useCallback((fileId: string, shareId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, sharedWith: file.sharedWith.filter(share => share.id !== shareId) }
        : file
    ));
  }, []);

  const handleUpdatePermission = useCallback((fileId: string, shareId: string, permission: 'view' | 'comment' | 'edit' | 'admin') => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            sharedWith: file.sharedWith.map(share => 
              share.id === shareId ? { ...share, permission } : share
            )
          }
        : file
    ));
  }, []);

  const handleCreateShareLink = useCallback((fileId: string, options: { password?: string; expiresAt?: string; maxDownloads?: number }) => {
    const shareLink: ShareLink = {
      id: `link_${Date.now()}`,
      fileId,
      url: `https://roleready.com/share/${fileId}`,
      password: options.password,
      expiresAt: options.expiresAt,
      maxDownloads: options.maxDownloads,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user@example.com'
    };
    
    console.log('Created share link:', shareLink);
    return shareLink;
  }, []);

  const handleAddComment = useCallback((fileId: string, content: string) => {
    const newComment: FileComment = {
      id: `comment_${Date.now()}`,
      userId: 'current-user',
      userName: 'Current User',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      content,
      timestamp: new Date().toISOString(),
      replies: [],
      isResolved: false
    };

    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, comments: [...file.comments, newComment] }
        : file
    ));
  }, []);

  const handleStarFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isStarred: !file.isStarred }
        : file
    ));
  }, []);

  const handleArchiveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isArchived: !file.isArchived }
        : file
    ));
  }, []);

  return {
    // State
    files,
    selectedFiles,
    searchTerm,
    filterType,
    sortBy,
    viewMode,
    showUploadModal,
    storageInfo,
    
    // Computed
    filteredFiles,
    
    // Setters
    setFiles,
    setSelectedFiles,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setViewMode,
    setShowUploadModal,
    setStorageUsed,
    setStorageLimit,
    
    // Actions
    handleFileSelect,
    handleSelectAll,
    handleDeleteFiles,
    handleTogglePublic,
    handleDownloadFile,
    handleUploadFile,
    handleEditFile,
    handleRefresh,
    
    // Sharing and Access Management
    handleShareWithUser,
    handleRemoveShare,
    handleUpdatePermission,
    handleCreateShareLink,
    handleAddComment,
    handleStarFile,
    handleArchiveFile
  };
};
