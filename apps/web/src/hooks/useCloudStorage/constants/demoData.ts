import { ResumeFile, Folder, CredentialInfo, CredentialReminder, AccessLog, CloudIntegration } from '../../../types/cloudStorage';

export const DEMO_FILES: ResumeFile[] = [
  {
    id: '1',
    name: 'Software Engineer Resume',
    type: 'resume',
    size: '2.4 MB',
    lastModified: '2024-10-22',
    isPublic: false,
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
    deletedAt: undefined,
    description: 'My latest software engineer resume with React and Node.js experience'
  },
  {
    id: '2',
    name: 'Product Manager Resume',
    type: 'resume',
    size: '1.8 MB',
    lastModified: '2024-10-20',
    isPublic: true,
    version: 2,
    owner: 'john.doe@example.com',
    folderId: 'folder-product',
    sharedWith: [],
    comments: [],
    downloadCount: 8,
    viewCount: 23,
    isStarred: false,
    isArchived: false,
    deletedAt: undefined,
    description: 'Product management resume highlighting strategic thinking and team leadership'
  },
  {
    id: '3',
    name: 'Modern Template',
    type: 'template',
    size: '1.2 MB',
    lastModified: '2024-10-18',
    isPublic: true,
    version: 1,
    owner: 'john.doe@example.com',
    folderId: 'folder-templates',
    sharedWith: [],
    comments: [],
    downloadCount: 156,
    viewCount: 892,
    isStarred: true,
    isArchived: false,
    deletedAt: undefined,
    description: 'Clean and modern resume template for professionals'
  },
  {
    id: '4',
    name: 'Backup - Oct 15',
    type: 'backup',
    size: '3.1 MB',
    lastModified: '2024-10-15',
    isPublic: false,
    version: 1,
    owner: 'john.doe@example.com',
    sharedWith: [],
    comments: [],
    downloadCount: 0,
    viewCount: 2,
    isStarred: false,
    isArchived: true,
    deletedAt: undefined,
    description: 'Backup of all files from October 15th'
  },
  {
    id: '5',
    name: 'Data Scientist Resume',
    type: 'resume',
    size: '2.7 MB',
    lastModified: '2024-10-12',
    isPublic: false,
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
    deletedAt: undefined,
    description: 'Data science resume with ML and Python expertise'
  },
  {
    id: '6',
    name: 'Creative Template',
    type: 'template',
    size: '1.5 MB',
    lastModified: '2024-10-10',
    isPublic: true,
    version: 2,
    owner: 'john.doe@example.com',
    sharedWith: [],
    comments: [],
    downloadCount: 89,
    viewCount: 234,
    isStarred: true,
    isArchived: false,
    deletedAt: undefined,
    description: 'Creative resume template for tech positions'
  },
  {
    id: '7',
    name: 'Cover Letter - Software Engineer',
    type: 'cover_letter',
    size: '0.8 MB',
    lastModified: '2024-10-22',
    isPublic: false,
    version: 2,
    owner: 'john.doe@example.com',
    sharedWith: [],
    comments: [],
    downloadCount: 3,
    viewCount: 12,
    isStarred: false,
    isArchived: false,
    deletedAt: undefined,
    description: 'Customized cover letter for software engineer positions'
  },
  {
    id: '8',
    name: 'AWS Cloud Practitioner Certificate',
    type: 'certification',
    size: '1.2 MB',
    lastModified: '2024-01-15',
    isPublic: true,
    version: 1,
    owner: 'john.doe@example.com',
    sharedWith: [],
    comments: [],
    downloadCount: 8,
    viewCount: 32,
    isStarred: true,
    isArchived: false,
    deletedAt: undefined,
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
    version: 1,
    owner: 'john.doe@example.com',
    sharedWith: [],
    comments: [],
    downloadCount: 2,
    viewCount: 5,
    isStarred: false,
    isArchived: false,
    deletedAt: undefined,
    description: 'Official university transcript with degree confirmation'
  },
  {
    id: '10',
    name: 'Portfolio - Web Projects',
    type: 'portfolio',
    size: '15.3 MB',
    lastModified: '2024-10-20',
    isPublic: true,
    version: 3,
    owner: 'john.doe@example.com',
    sharedWith: [],
    comments: [],
    downloadCount: 45,
    viewCount: 267,
    isStarred: true,
    isArchived: false,
    deletedAt: undefined,
    description: 'Collection of web development projects and demos'
  },
  {
    id: '11',
    name: 'DevOps Engineer Resume',
    type: 'resume',
    size: '1.2 MB',
    lastModified: '2024-10-10',
    isPublic: false,
    version: 1,
    owner: 'john.doe@example.com',
    folderId: undefined,
    sharedWith: [],
    comments: [],
    downloadCount: 0,
    viewCount: 5,
    isStarred: false,
    isArchived: false,
    deletedAt: '2024-10-22T12:00:00Z',
    description: 'DevOps engineer resume with infrastructure expertise'
  }
];

export const DEMO_FOLDERS: Folder[] = [
  { id: 'folder-tech', name: 'Tech Resumes', color: '#3B82F6', createdAt: '2024-10-01', updatedAt: '2024-10-01', fileCount: 1 },
  { id: 'folder-product', name: 'Product Management', color: '#10B981', createdAt: '2024-10-05', updatedAt: '2024-10-05', fileCount: 1 },
  { id: 'folder-templates', name: 'Templates', color: '#8B5CF6', createdAt: '2024-09-15', updatedAt: '2024-09-15', fileCount: 1 }
];

export const DEMO_CREDENTIALS: CredentialInfo[] = [
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
];

export const DEMO_CREDENTIAL_REMINDERS: CredentialReminder[] = [
  {
    id: 'reminder_1',
    credentialId: 'LIC-789456',
    credentialName: 'State Board License',
    expirationDate: '2025-06-01',
    reminderDate: '2024-12-01',
    isSent: false,
    priority: 'medium'
  }
];

export const DEMO_ACCESS_LOGS: AccessLog[] = [
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
];

export const DEMO_CLOUD_INTEGRATIONS: CloudIntegration[] = [
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
];

