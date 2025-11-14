import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/apiService';

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  features: string[];
  difficulty: string;
  industry: string[];
  layout: string;
  colorScheme: string;
  isPremium: boolean;
  rating: number;
  downloads: number;
  author: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    favorites: number;
    usageHistory: number;
  };
}

export interface TemplateFilters {
  search: string;
  category: string;
  difficulty: string;
  layout: string;
  colorScheme: string;
  isPremium?: boolean;
  industry: string[];
  minRating?: number;
  maxRating?: number;
  sortBy: 'popular' | 'newest' | 'rating' | 'downloads' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseTemplatesOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const {
    initialPage = 1,
    initialLimit = 12,
    autoFetch = true
  } = options;

  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: initialLimit,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    category: '',
    difficulty: '',
    layout: '',
    colorScheme: '',
    industry: [],
    sortBy: 'popular',
    sortOrder: 'desc'
  });

  // Fetch templates
  const fetchTemplates = useCallback(async (page?: number) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = page ?? pagination.page;

      const response = await apiService.getTemplates({
        search: filters.search || undefined,
        category: filters.category || undefined,
        difficulty: filters.difficulty || undefined,
        layout: filters.layout || undefined,
        colorScheme: filters.colorScheme || undefined,
        isPremium: filters.isPremium,
        industry: filters.industry.length > 0 ? filters.industry : undefined,
        minRating: filters.minRating,
        maxRating: filters.maxRating,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: currentPage,
        limit: pagination.limit
      });

      if (response.success) {
        setTemplates(response.data);
        setPagination({
          ...response.pagination,
          limit: pagination.limit
        });
      } else {
        throw new Error(response.message || 'Failed to fetch templates');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Search templates
  const searchTemplates = useCallback(async (query: string, limit?: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.searchTemplates(query, limit);

      if (response.success) {
        setTemplates(response.data);
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
      console.error('Error searching templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single template
  const getTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTemplate(id);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch template');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch template');
      console.error('Error fetching template:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort operations
  const updateFilters = useCallback((newFilters: Partial<TemplateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      difficulty: '',
      layout: '',
      colorScheme: '',
      industry: [],
      sortBy: 'popular',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Pagination operations
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.hasNextPage]);

  const previousPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.hasPrevPage]);

  const setPageLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Track template usage
  const trackUsage = useCallback(async (
    templateId: string,
    action: 'PREVIEW' | 'DOWNLOAD' | 'USE' | 'FAVORITE' | 'SHARE',
    metadata?: any
  ) => {
    try {
      await apiService.trackTemplateUsage(templateId, action, metadata);
    } catch (err) {
      console.error('Error tracking template usage:', err);
    }
  }, []);

  // Auto-fetch on filter or pagination change
  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [filters, pagination.page, pagination.limit]); // fetchTemplates is intentionally excluded to avoid infinite loop

  // Stats computed from current templates
  const stats = useMemo(() => {
    const total = pagination.totalCount;
    const premium = templates.filter(t => t.isPremium).length;
    const free = templates.filter(t => !t.isPremium).length;
    const avgRating = templates.length > 0
      ? templates.reduce((sum, t) => sum + t.rating, 0) / templates.length
      : 0;

    return {
      total,
      premium,
      free,
      avgRating: Math.round(avgRating * 10) / 10,
      currentPage: templates.length
    };
  }, [templates, pagination.totalCount]);

  return {
    // Data
    templates,
    loading,
    error,
    pagination,
    filters,
    stats,

    // Actions
    fetchTemplates,
    searchTemplates,
    getTemplate,
    updateFilters,
    clearFilters,
    goToPage,
    nextPage,
    previousPage,
    setPageLimit,
    trackUsage,
    refresh: () => fetchTemplates(pagination.page)
  };
}
