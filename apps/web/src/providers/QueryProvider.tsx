import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Time in milliseconds that unused/inactive cache data remains in memory
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry failed requests
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query config functions (not hooks, despite the "query" naming)
export const getResumeQueryConfig = (resumeId: string) => {
  return {
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }
      return response.json();
    },
    enabled: !!resumeId,
  };
};

export const getTemplatesQueryConfig = (filters?: any) => {
  return {
    queryKey: ['templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
  };
};

export const getJobsQueryConfig = (userId: string) => {
  return {
    queryKey: ['jobs', userId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
    enabled: !!userId,
  };
};

export const getUserQueryConfig = (userId: string) => {
  return {
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId,
  };
};

// Mutation hooks
export const useSaveResumeMutation = () => {
  return {
    mutationFn: async (resumeData: any) => {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save resume');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate resume queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  };
};

export const useDeleteResumeMutation = () => {
  return {
    mutationFn: async (resumeId: string) => {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate resume queries
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  };
};

export const useCreateJobMutation = () => {
  return {
    mutationFn: async (jobData: any) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate jobs queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  };
};

// Provider component
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

// Utility functions for cache management
export const resumeCacheUtils = {
  // Prefetch resume data
  prefetchResume: async (resumeId: string) => {
    const queryConfig = getResumeQueryConfig(resumeId);
    await queryClient.prefetchQuery(queryConfig);
  },
  
  // Update resume in cache
  updateResumeCache: (resumeId: string, updatedResume: any) => {
    queryClient.setQueryData(['resume', resumeId], updatedResume);
  },
  
  // Remove resume from cache
  removeResumeFromCache: (resumeId: string) => {
    queryClient.removeQueries({ queryKey: ['resume', resumeId] });
  },
};

export const templateCacheUtils = {
  // Prefetch templates
  prefetchTemplates: async (filters?: any) => {
    const queryConfig = getTemplatesQueryConfig(filters);
    await queryClient.prefetchQuery(queryConfig);
  },
  
  // Update templates cache
  updateTemplatesCache: (filters: any, updatedTemplates: any) => {
    queryClient.setQueryData(['templates', filters], updatedTemplates);
  },
};

export const jobCacheUtils = {
  // Prefetch jobs
  prefetchJobs: async (userId: string) => {
    const queryConfig = getJobsQueryConfig(userId);
    await queryClient.prefetchQuery(queryConfig);
  },
  
  // Update jobs cache
  updateJobsCache: (userId: string, updatedJobs: any) => {
    queryClient.setQueryData(['jobs', userId], updatedJobs);
  },
};

export { queryClient };
