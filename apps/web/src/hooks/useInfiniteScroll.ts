import { useEffect, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loader: () => Promise<void>;
}

/**
 * Infinite scroll hook
 * Triggers loader when user scrolls near bottom
 */
export function useInfiniteScroll({ hasMore, loader }: UseInfiniteScrollOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = useCallback(async () => {
    if (window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 300) {
      if (hasMore && !isLoading) {
        setIsLoading(true);
        await loader();
        setIsLoading(false);
      }
    }
  }, [hasMore, isLoading, loader]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}

