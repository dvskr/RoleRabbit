import { useState, useCallback, useMemo } from 'react';

export function useSearch<T>(
  data: T[],
  searchFn: (item: T, query: string) => boolean
) {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query) return data;
    return data.filter((item) => searchFn(item, query));
  }, [data, query, searchFn]);

  const setSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    filteredData,
    setSearch,
    clearSearch,
    hasResults: filteredData.length > 0
  };
}
