import { ThemeColors } from '../../contexts/ThemeContext';
import { Folder, FileType } from '../../types/cloudStorage';

// Tab types
export type TabType = 'files' | 'credentials';

// Folder modal types
export interface FolderToRename {
  id: string;
  name: string;
}

// Folder sidebar props
export interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  colors: ThemeColors;
}

// Tab navigation props
export interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  filesCount: number;
  credentialsCount: number;
  expiringCredentialsCount: number;
  colors: ThemeColors;
}

// Empty state props
export interface EmptyFilesStateProps {
  searchTerm: string;
  filterType: FileType;
  onUpload: () => void;
  colors: ThemeColors;
}

// Folder modal props (base)
export interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: ThemeColors;
}

// Create folder modal props
export interface CreateFolderModalProps extends FolderModalProps {
  onConfirm: (folderName: string) => void;
}

// Rename folder modal props
export interface RenameFolderModalProps extends FolderModalProps {
  folder: FolderToRename;
  onConfirm: (folderId: string, newName: string) => void;
}

// Loading state props
export interface LoadingStateProps {
  colors: ThemeColors;
  message?: string;
}

// Floating upload button props
export interface FloatingUploadButtonProps {
  onUpload: () => void;
  colors: ThemeColors;
}

