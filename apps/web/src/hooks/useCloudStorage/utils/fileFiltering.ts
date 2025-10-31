import { ResumeFile, FileType, SortBy } from '../../../types/cloudStorage';

export interface FilterOptions {
  searchTerm: string;
  filterType: FileType;
  sortBy: SortBy;
  selectedFolderId: string | null;
}

export const filterAndSortFiles = (
  files: ResumeFile[],
  options: FilterOptions
): ResumeFile[] => {
  // Early return if no files
  if (files.length === 0) return [];

  const { searchTerm, filterType, sortBy, selectedFolderId } = options;
  const searchLower = searchTerm.toLowerCase();
  const hasSearch = searchLower.length > 0;
  
  // Filter files
  let filtered = files.filter(file => {
    // Early exit conditions for performance
    const matchesFilter = filterType === 'all' || file.type === filterType;
    if (!matchesFilter) return false;

    const matchesFolder = selectedFolderId === null 
      ? file.folderId === undefined 
      : file.folderId === selectedFolderId;
    if (!matchesFolder) return false;

    if (hasSearch) {
      const matchesSearch = file.name.toLowerCase().includes(searchLower) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Create a copy before sorting to avoid mutation
  const sorted = [...filtered];
  
  // Sort files (only if multiple files)
  if (sorted.length > 1) {
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return parseFloat(b.size.replace(/[^\d.]/g, '')) - parseFloat(a.size.replace(/[^\d.]/g, ''));
        case 'date':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });
  }

  return sorted;
};

