/**
 * Filter utilities
 */

export interface Filter<T> {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

/**
 * Apply filters to array
 */
export function applyFilters<T>(items: T[], filters: Filter<T>[]): T[] {
  return items.filter(item => {
    return filters.every(filter => {
      const fieldValue = getNestedValue(item, filter.field);
      
      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'gt':
          return Number(fieldValue) > Number(filter.value);
        case 'lt':
          return Number(fieldValue) < Number(filter.value);
        case 'gte':
          return Number(fieldValue) >= Number(filter.value);
        case 'lte':
          return Number(fieldValue) <= Number(filter.value);
        default:
          return true;
      }
    });
  });
}

/**
 * Get nested value from object
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Sort array by field
 */
export function sortBy<T>(items: T[], field: string, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...items].sort((a, b) => {
    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

