import { ResumeFile, FileType, SortBy } from '../../../types/cloudStorage';

export interface FilterOptions {
  searchTerm: string;
  filterType: FileType;
  sortBy: SortBy;
  selectedFolderId: string | null;
  quickFilters?: {
    starred?: boolean;
    archived?: boolean;
    shared?: boolean;
    recent?: boolean;
    public?: boolean;
  };
}

export const filterAndSortFiles = (
  files: ResumeFile[],
  options: FilterOptions
): ResumeFile[] => {
  // Early return if no files
  if (files.length === 0) return [];

  const { searchTerm, filterType, sortBy, selectedFolderId, quickFilters } = options;
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

    // Quick filters
    if (quickFilters) {
      if (quickFilters.starred !== undefined && file.isStarred !== quickFilters.starred) return false;
      if (quickFilters.archived !== undefined && file.isArchived !== quickFilters.archived) return false;
      if (quickFilters.shared !== undefined && file.sharedWith.length > 0 !== quickFilters.shared) return false;
      if (quickFilters.public !== undefined && file.isPublic !== quickFilters.public) return false;
      
      // Recent filter: files modified in last 7 days
      if (quickFilters.recent === true) {
        const fileDate = new Date(file.lastModified).getTime();
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (fileDate < sevenDaysAgo) return false;
      }
    }

    if (hasSearch) {
      // Enhanced search: name, tags, type, owner, description, credential info
      const matchesSearch = 
        // Basic search
        file.name.toLowerCase().includes(searchLower) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        file.description?.toLowerCase().includes(searchLower) ||
        
        // Type search
        file.type.toLowerCase().includes(searchLower) ||
        
        // Owner search
        file.owner.toLowerCase().includes(searchLower) ||
        
        // Credential search (if applicable)
        (file.credentialInfo && (
          file.credentialInfo.credentialType.toLowerCase().includes(searchLower) ||
          file.credentialInfo.issuer.toLowerCase().includes(searchLower) ||
          file.credentialInfo.credentialId?.toLowerCase().includes(searchLower)
        )) ||
        
        // Shared with search
        file.sharedWith.some(share => 
          share.userName.toLowerCase().includes(searchLower) ||
          share.userEmail.toLowerCase().includes(searchLower)
        );
      
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

