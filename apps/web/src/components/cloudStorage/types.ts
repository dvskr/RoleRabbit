import { ThemeColors } from '../../contexts/ThemeContext';
import { Folder, FileType } from '../../types/cloudStorage';

// Tab types
export type TabType = 'files' | 'credentials';

// Folder modal types
export interface FolderToRename {
  id: string;
  name: string;
}

// Empty state props
export interface EmptyFilesStateProps {
  searchTerm?: string;
  filterType?: FileType;
  onUpload?: () => void;
  colors: ThemeColors;
  showDeleted?: boolean;
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

