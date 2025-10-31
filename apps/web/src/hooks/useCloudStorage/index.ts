// Export main hook
export { useCloudStorage } from '../useCloudStorage';

// Export sub-hooks for advanced usage
export { useFileOperations } from './hooks/useFileOperations';
export { useSharingOperations } from './hooks/useSharingOperations';
export { useCredentialOperations } from './hooks/useCredentialOperations';
export { useFolderOperations } from './hooks/useFolderOperations';
export { useCloudIntegration } from './hooks/useCloudIntegration';
export { useAccessTracking } from './hooks/useAccessTracking';

// Export utilities
export { filterAndSortFiles } from './utils/fileFiltering';
export { createDefaultFile, createFileId } from './utils/fileOperations';
export { createDefaultFolder, createFolderId, updateFolderFileCounts } from './utils/folderOperations';
export { createSharePermission, createShareLink } from './utils/shareOperations';

// Export constants
export * from './constants/demoData';
export * from './constants/defaults';

