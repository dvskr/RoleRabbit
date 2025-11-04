import { render, screen, fireEvent, act } from '@testing-library/react';
import CloudStorage from '../../CloudStorage';
import { useCloudStorage } from '../../../hooks/useCloudStorage';

jest.mock('../../../hooks/useCloudStorage');

jest.mock('../FileCard', () => ({ file }: { file: { name: string } }) => (
  <div data-testid="file-card">{file.name}</div>
));

const buildFile = (overrides: Partial<any> = {}) => ({
  id: 'file-1',
  name: 'Resume.pdf',
  type: 'resume',
  size: '1 MB',
  sizeBytes: 1024,
  lastModified: '2025-01-01',
  isPublic: false,
  version: 1,
  owner: 'user@example.com',
  sharedWith: [],
  comments: [],
  downloadCount: 0,
  viewCount: 0,
  isStarred: false,
  isArchived: false,
  ...overrides
});

const mockUseCloudStorage = useCloudStorage as jest.MockedFunction<typeof useCloudStorage>;
let baseState: any;

describe('CloudStorage integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    baseState = {
      files: [buildFile()],
      isLoading: false,
      selectedFiles: [],
      searchTerm: '',
      filterType: 'all',
      sortBy: 'date',
      viewMode: 'list',
      showUploadModal: false,
      showDeleted: false,
      storageInfo: { used: 1, limit: 10, percentage: 10 },
      credentials: [],
      credentialReminders: [],
      folders: [],
      selectedFolderId: null,
      quickFilters: {},
      filteredFiles: [buildFile()],
      setSearchTerm: jest.fn(),
      setFilterType: jest.fn(),
      setSortBy: jest.fn(),
      setViewMode: jest.fn(),
      setShowUploadModal: jest.fn(),
      setShowDeleted: jest.fn(),
      setSelectedFolderId: jest.fn(),
      setQuickFilters: jest.fn(),
      handleFileSelect: jest.fn(),
      handleSelectAll: jest.fn(),
      handleDeleteFiles: jest.fn(),
      handleDeleteFile: jest.fn(),
      handleRestoreFile: jest.fn(),
      handlePermanentlyDeleteFile: jest.fn(),
      handleTogglePublic: jest.fn(),
      handleDownloadFile: jest.fn(),
      handleShareFile: jest.fn(),
      handleUploadFile: jest.fn(),
      handleEditFile: jest.fn(),
      handleRefresh: jest.fn(),
      handleShareWithUser: jest.fn(),
      handleRemoveShare: jest.fn(),
      handleUpdatePermission: jest.fn(),
      handleCreateShareLink: jest.fn(),
      handleAddComment: jest.fn(),
      handleStarFile: jest.fn(),
      handleArchiveFile: jest.fn(),
      handleAddCredential: jest.fn(),
      handleUpdateCredential: jest.fn(),
      handleDeleteCredential: jest.fn(),
      handleGenerateQRCode: jest.fn(),
      handleCreateFolder: jest.fn(),
      handleRenameFolder: jest.fn(),
      handleDeleteFolder: jest.fn(),
      handleMoveToFolder: jest.fn()
    };

    mockUseCloudStorage.mockReturnValue(baseState);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('connects search input to setter with debounce', () => {
    const setSearchTerm = jest.fn();
    mockUseCloudStorage.mockReturnValueOnce({
      ...baseState,
      setSearchTerm
    });

    render(<CloudStorage onClose={jest.fn()} />);

    const searchInput = screen.getByTestId('storage-search-input');
    fireEvent.change(searchInput, { target: { value: 'budget' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(setSearchTerm).toHaveBeenCalledWith('budget');
  });

  it('renders file cards from filtered files', () => {
    render(<CloudStorage onClose={jest.fn()} />);
    expect(screen.getByTestId('file-card')).toHaveTextContent('Resume.pdf');
  });
});


