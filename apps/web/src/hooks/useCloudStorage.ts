'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ResumeFile, FileType, SortBy, ViewMode, StorageInfo, SharePermission, FileComment, ShareLink, User, CredentialInfo, CredentialReminder, AccessLog, CloudIntegration } from '../types/cloudStorage';
import { logger } from '../utils/logger';
import apiService from '../services/apiService';

export const useCloudStorage = () => {
  // File management
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load files from API on mount
  useEffect(() => {
    loadFilesFromAPI();
  }, []);

  const loadFilesFromAPI = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.listCloudResumes();
      if (response && response.savedResumes) {
        setFiles(response.savedResumes as ResumeFile[]);
      }
    } catch (error) {
      logger.error('Failed to load files from API:', error);
      // Fallback to demo data
      setFiles([
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
      folderId: 'folder-tech',
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
      folderId: 'folder-product',
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
      folderId: 'folder-templates',
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
      description: 'Creative resume template for tech positions'
    },
    {
      id: '7',
      name: 'Cover Letter - Software Engineer',
      type: 'cover_letter',
      size: '0.8 MB',
      lastModified: '2024-10-22',
      isPublic: false,
      tags: ['cover-letter', 'software-engineer', 'job-application'],
      version: 2,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 3,
      viewCount: 12,
      isStarred: false,
      isArchived: false,
      description: 'Customized cover letter for software engineer positions'
    },
    {
      id: '8',
      name: 'AWS Cloud Practitioner Certificate',
      type: 'certification',
      size: '1.2 MB',
      lastModified: '2024-01-15',
      isPublic: true,
      tags: ['certification', 'aws', 'cloud'],
      version: 1,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 8,
      viewCount: 32,
      isStarred: true,
      isArchived: false,
      description: 'AWS Cloud Practitioner certification document',
      credentialInfo: {
        credentialType: 'certification',
        issuer: 'AWS',
        issuedDate: '2024-01-15',
        expirationDate: '2026-01-15',
        credentialId: 'ARN:aws:cloudformation::123456789',
        verificationStatus: 'verified',
        verificationUrl: 'https://aws.amazon.com/verification/certificate/123456',
        associatedDocuments: ['8']
      }
    },
    {
      id: '9',
      name: 'University Transcript',
      type: 'transcript',
      size: '2.1 MB',
      lastModified: '2024-06-01',
      isPublic: false,
      tags: ['transcript', 'degree', 'education'],
      version: 1,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 2,
      viewCount: 5,
      isStarred: false,
      isArchived: false,
      description: 'Official university transcript with degree confirmation'
    },
    {
      id: '10',
      name: 'Portfolio - Web Projects',
      type: 'portfolio',
      size: '15.3 MB',
      lastModified: '2024-10-20',
      isPublic: true,
      tags: ['portfolio', 'projects', 'web-development'],
      version: 3,
      owner: 'john.doe@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 45,
      viewCount: 267,
      isStarred: true,
      isArchived: false,
      description: 'Collection of web development projects and demos'
    }
  ]);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Folder management
  const [folders, setFolders] = useState<import('../types/cloudStorage').Folder[]>([
    { id: 'folder-tech', name: 'Tech Resumes', color: '#3B82F6', createdAt: '2024-10-01', updatedAt: '2024-10-01', fileCount: 1 },
    { id: 'folder-product', name: 'Product Management', color: '#10B981', createdAt: '2024-10-05', updatedAt: '2024-10-05', fileCount: 1 },
    { id: 'folder-templates', name: 'Templates', color: '#8B5CF6', createdAt: '2024-09-15', updatedAt: '2024-09-15', fileCount: 1 }
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Credential management
  const [credentials] = useState<CredentialInfo[]>([
    {
      credentialType: 'certification',
      issuer: 'AWS',
      issuedDate: '2024-01-15',
      expirationDate: '2026-01-15',
      credentialId: 'ARN:aws:cloudformation::123456789',
      verificationStatus: 'verified',
      verificationUrl: 'https://aws.amazon.com/verification/certificate/123456',
      associatedDocuments: []
    },
    {
      credentialType: 'license',
      issuer: 'State Board',
      issuedDate: '2022-06-01',
      expirationDate: '2025-06-01',
      credentialId: 'LIC-789456',
      verificationStatus: 'verified',
      associatedDocuments: []
    }
  ]);

  const [credentialReminders] = useState<CredentialReminder[]>([
    {
      id: 'reminder_1',
      credentialId: 'LIC-789456',
      credentialName: 'State Board License',
      expirationDate: '2025-06-01',
      reminderDate: '2024-12-01',
      isSent: false,
      priority: 'medium'
    }
  ]);

  // Access tracking
  const [accessLogs] = useState<AccessLog[]>([
    {
      id: 'log_1',
      fileId: '1',
      userId: 'user_2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@example.com',
      action: 'view',
      timestamp: '2024-10-22T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'log_2',
      fileId: '1',
      userId: 'user_2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@example.com',
      action: 'download',
      timestamp: '2024-10-22T11:15:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ]);

  // Cloud integrations
  const [cloudIntegrations] = useState<CloudIntegration[]>([
    {
      provider: 'google_drive',
      isConnected: true,
      connectedAt: '2024-09-15T08:00:00Z',
      lastSyncAt: '2024-10-22T09:30:00Z',
      accountEmail: 'user@example.com',
      quotaUsed: 45.2,
      quotaTotal: 100
    },
    {
      provider: 'dropbox',
      isConnected: false,
      accountEmail: '',
      quotaUsed: 0,
      quotaTotal: 0
    }
  ]);

  // Computed values
  const filteredFiles = useMemo(() => {
    let filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || file.type === filterType;
      const matchesFolder = selectedFolderId === null ? file.folderId === undefined : file.folderId === selectedFolderId;
      return matchesSearch && matchesFilter && matchesFolder;
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
  }, [files, searchTerm, filterType, sortBy, selectedFolderId]);

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
    logger.debug('Downloading file:', file.name);
    // TODO: Implement actual download logic
  }, []);

  const handleShareFile = useCallback((file: ResumeFile) => {
    logger.debug('Sharing file:', file.name);
    // TODO: Implement actual share logic
  }, []);

  const handleUploadFile = useCallback(async (fileData: Partial<ResumeFile> | { data: any; name?: string }) => {
    try {
      // Save to API
      const response = await apiService.saveToCloud('data' in fileData ? fileData.data : fileData, fileData.name || 'Untitled');
      if (response && response.savedResume) {
        const newFile: ResumeFile = response.savedResume as ResumeFile;
        setFiles(prev => [newFile, ...prev]);
      }
    } catch (error) {
      logger.error('Failed to save file to API:', error);
      // Fallback to local
      const newFile: ResumeFile = {
        id: `file_${Date.now()}`,
        name: fileData.name || 'Untitled',
        type: fileData.type || 'resume',
        size: fileData.size || '0 MB',
        lastModified: new Date().toISOString().split('T')[0],
        isPublic: fileData.isPublic || false,
        tags: fileData.tags || [],
        version: 1,
        owner: 'current-user',
        sharedWith: [],
        comments: [],
        downloadCount: 0,
        isStarred: false,
        isArchived: false,
        description: '',
        viewCount: 0
      };
      setFiles(prev => [newFile, ...prev]);
    } finally {
      setShowUploadModal(false);
    }
  }, []);

  const handleEditFile = useCallback((fileId: string, updates: Partial<ResumeFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  }, []);

  const handleRefresh = useCallback(() => {
    logger.debug('Refreshing files...');
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
    
    logger.debug('Created share link:', shareLink);
    return shareLink;
  }, []);

  const handleAddComment = useCallback((fileId: string, content: string) => {
    logger.debug('Adding comment to file:', fileId, content);
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

    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        logger.debug('Comment added to file:', file.name, 'Total comments:', file.comments.length + 1);
        return { ...file, comments: [...file.comments, newComment] };
      }
      return file;
    }));
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

  // Credential handlers
  const handleAddCredential = useCallback((credential: Partial<CredentialInfo>) => {
    logger.debug('Adding credential:', credential);
    // TODO: Implement actual credential addition logic
  }, []);

  const handleUpdateCredential = useCallback((id: string, updates: Partial<CredentialInfo>) => {
    logger.debug('Updating credential:', id, updates);
    // TODO: Implement actual credential update logic
  }, []);

  const handleDeleteCredential = useCallback((id: string) => {
    logger.debug('Deleting credential:', id);
    // TODO: Implement actual credential deletion logic
  }, []);

  const handleGenerateQRCode = useCallback((id: string) => {
    logger.debug('Generating QR code for:', id);
    // TODO: Implement actual QR code generation
    return `https://roleready.com/credential/${id}/verify`;
  }, []);

  // Access tracking handlers
  const handleLogAccess = useCallback((fileId: string, action: 'view' | 'download' | 'share' | 'edit' | 'delete') => {
    logger.debug('Logging file access:', fileId, action);
    // TODO: Implement actual access logging
  }, []);

  const handleGetAccessLogs = useCallback((fileId?: string) => {
    if (fileId) {
      return accessLogs.filter(log => log.fileId === fileId);
    }
    return accessLogs;
  }, [accessLogs]);

  // Cloud integration handlers
  const handleConnectCloud = useCallback((provider: 'google_drive' | 'dropbox' | 'onedrive') => {
    logger.debug('Connecting to cloud provider:', provider);
    // TODO: Implement actual cloud connection logic
  }, []);

  const handleSyncCloud = useCallback((provider: 'google_drive' | 'dropbox' | 'onedrive') => {
    logger.debug('Syncing with cloud provider:', provider);
    // TODO: Implement actual cloud sync logic
  }, []);

  const handleDisconnectCloud = useCallback((provider: 'google_drive' | 'dropbox' | 'onedrive') => {
    logger.debug('Disconnecting from cloud provider:', provider);
    // TODO: Implement actual cloud disconnection logic
  }, []);

  // Folder management functions
  const handleCreateFolder = useCallback((name: string, color?: string) => {
    const newFolder: import('../types/cloudStorage').Folder = {
      id: `folder_${Date.now()}`,
      name,
      color: color || '#6B7280',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileCount: 0
    };
    setFolders(prev => [...prev, newFolder]);
    logger.debug('Folder created:', newFolder);
  }, []);

  const handleRenameFolder = useCallback((folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, name: newName, updatedAt: new Date().toISOString() }
        : folder
    ));
    logger.debug('Folder renamed:', folderId, newName);
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    // Move files from deleted folder back to root
    setFiles(prev => prev.map(file => 
      file.folderId === folderId ? { ...file, folderId: undefined } : file
    ));
    logger.debug('Folder deleted:', folderId);
  }, []);

  const handleMoveToFolder = useCallback((fileId: string, folderId: string | null) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, folderId: folderId ?? undefined } : file
    ));
    
    // Update folder file counts
    if (folderId) {
      const file = files.find(f => f.id === fileId);
      const oldFolderId = file?.folderId;
      
      setFolders(prev => prev.map(folder => {
        let count = folder.fileCount || 0;
        if (folder.id === oldFolderId) count = Math.max(0, count - 1);
        if (folder.id === folderId) count++;
        return { ...folder, fileCount: count };
      }));
    }
    
    logger.debug('File moved to folder:', fileId, folderId);
  }, [files]);

  return {
    // State
    files,
    isLoading,
    selectedFiles,
    searchTerm,
    filterType,
    sortBy,
    viewMode,
    showUploadModal,
    storageInfo,
    credentials,
    credentialReminders,
    folders,
    selectedFolderId,
    accessLogs,
    cloudIntegrations,
    
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
    setSelectedFolderId,
    
    // Actions
    handleFileSelect,
    handleSelectAll,
    handleDeleteFiles,
    handleTogglePublic,
    handleDownloadFile,
    handleShareFile,
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
    handleArchiveFile,
    
    // Credential Management
    handleAddCredential,
    handleUpdateCredential,
    handleDeleteCredential,
    handleGenerateQRCode,
    
    // Access Tracking
    handleLogAccess,
    handleGetAccessLogs,
    
    // Cloud Integration
    handleConnectCloud,
    handleSyncCloud,
    handleDisconnectCloud,
    
    // Folder Management
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleMoveToFolder
  };
};
