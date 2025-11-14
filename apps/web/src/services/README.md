# Template Service Layer

## Overview

The Template Service Layer provides a centralized, abstracted API for all template operations. It decouples business logic from data access, enabling easy storage backend swapping and caching strategies.

## Problem Solved

**Before:** Template operations were scattered across the codebase:
- Direct imports of `resumeTemplates` in 18+ files
- Filtering logic duplicated in multiple hooks
- No abstraction for data access
- Impossible to swap storage (e.g., switch to API without refactoring everything)
- No caching strategy
- Business logic mixed with components

**After:** Centralized service layer with clean architecture:
- Single source for all template operations
- Pluggable storage adapters (Local, API, Cached)
- Business logic separated from UI
- Easy to test and mock
- Consistent error handling
- Ready for backend integration

## Architecture

```
┌─────────────────────────────────────┐
│         Components/Hooks            │
│  (TemplateContext, useTemplates)    │
└───────────────┬─────────────────────┘
                │
                ↓
┌─────────────────────────────────────┐
│        TemplateService              │
│  (Business Logic Layer)             │
│  - filter(), sort(), query()        │
│  - getStats(), validate()           │
└───────────────┬─────────────────────┘
                │
                ↓
┌─────────────────────────────────────┐
│      ITemplateStorage Interface     │
└───────────────┬─────────────────────┘
                │
       ┌────────┴────────┐
       ↓                 ↓
┌──────────────┐  ┌──────────────────┐
│   Local      │  │  CachedStorage   │
│   Storage    │  │   (Decorator)    │
└──────────────┘  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │  APIStorage      │
                  │  (Future)        │
                  └──────────────────┘
```

## Quick Start

### 1. Initialize Service (Once at App Startup)

```typescript
// In app/layout.tsx or _app.tsx
import { initializeServices } from '@/services/initializeServices';

// Simple initialization
initializeServices();

// With custom config
initializeServices({
  enableCache: true,
  cacheConfig: {
    maxSize: 100,
    ttl: 300000, // 5 minutes
    enableStats: process.env.NODE_ENV === 'development',
  },
});
```

### 2. Use Service in Components/Hooks

```typescript
import { getTemplateService } from '@/services/templateService';

const templateService = getTemplateService();

// Get all templates
const templates = await templateService.getAll();

// Search templates
const results = await templateService.search('developer');

// Filter and sort
const filtered = await templateService.query(
  {
    category: 'ats',
    difficulty: 'beginner',
    isPremium: false,
  },
  'rating-desc'
);

// Get by ID
const template = await templateService.getById('ats-classic');

// Get statistics
const stats = await templateService.getStats();
```

## Core Concepts

### ITemplateStorage Interface

The storage interface defines how templates are accessed. Any implementation must provide these methods:

```typescript
interface ITemplateStorage {
  getAll(): Promise<ResumeTemplate[]>;
  getById(id: string): Promise<ResumeTemplate | null>;
  getByCategory(category: ResumeCategory): Promise<ResumeTemplate[]>;
  search(query: string): Promise<ResumeTemplate[]>;
  getByIndustry(industry: Industry): Promise<ResumeTemplate[]>;
  getPremium(): Promise<ResumeTemplate[]>;
  getByDifficulty(difficulty): Promise<ResumeTemplate[]>;
  getByLayout(layout): Promise<ResumeTemplate[]>;
}
```

### LocalTemplateStorage

Default implementation using static template data:

```typescript
import { LocalTemplateStorage } from '@/services/templateService';
import { resumeTemplates } from '@/data/templates';

const storage = new LocalTemplateStorage(resumeTemplates);
```

**Features:**
- Returns copies to prevent mutation
- Fast in-memory access
- No network requests
- Perfect for static data

### CachedTemplateStorage

Decorator that adds caching to any storage adapter:

```typescript
import { CachedTemplateStorage } from '@/services/storageAdapters/CachedTemplateStorage';

const cachedStorage = new CachedTemplateStorage(storage, {
  maxSize: 100,        // Max cache entries
  ttl: 300000,         // 5 minutes
  enableStats: true,   // Enable statistics
});

// Check cache performance
const stats = cachedStorage.getStats();
console.log(`Hit rate: ${stats.hitRate * 100}%`);

// Clear cache
cachedStorage.clearCache();
cachedStorage.clearExpired();
```

**Features:**
- In-memory LRU cache
- Configurable TTL (Time To Live)
- Automatic eviction when full
- Cache statistics (hits, misses, hit rate)
- Works with any ITemplateStorage

**When to use:**
- API-backed storage (reduce network calls)
- Expensive computations
- High-traffic applications

### APITemplateStorage (Skeleton)

Example of API-backed storage:

```typescript
import { APITemplateStorage } from '@/services/storageAdapters/APITemplateStorage';

const apiStorage = new APITemplateStorage({
  baseUrl: 'https://api.example.com',
  authToken: 'your-token',
  timeout: 5000,
  retries: 3,
});

// Combine with caching
const cachedApiStorage = new CachedTemplateStorage(apiStorage, {
  maxSize: 200,
  ttl: 600000, // 10 minutes
});

const service = new TemplateService(cachedApiStorage);
```

**Note:** This is a skeleton - implement actual API logic.

## TemplateService API

### Basic Operations

```typescript
// Get all templates
const all = await service.getAll();

// Get by ID (with validation)
const template = await service.getById('template-id');

// Get by category
const atsTemplates = await service.getByCategory('ats');

// Search
const results = await service.search('software engineer');
```

### Advanced Filtering

```typescript
const filtered = await service.filter({
  category: 'creative',           // or 'all'
  difficulty: 'intermediate',     // or 'all'
  layout: 'two-column',          // or 'all'
  isPremium: false,
  industries: ['Technology', 'Design'],
  tags: ['modern', 'colorful'],
  minRating: 4.0,
  maxRating: 5.0,
  searchQuery: 'portfolio',
});
```

### Sorting

```typescript
const sorted = service.sort(templates, 'rating-desc');

// Available sort options:
// - 'name-asc' / 'name-desc'
// - 'rating-asc' / 'rating-desc'
// - 'downloads-asc' / 'downloads-desc'
// - 'date-asc' / 'date-desc'
```

### Combined Query

```typescript
// Filter + Sort in one call
const results = await service.query(
  {
    category: 'ats',
    difficulty: 'beginner',
    minRating: 4.5,
  },
  'rating-desc'
);
```

### Statistics

```typescript
const stats = await service.getStats();

console.log(stats);
// {
//   total: 54,
//   premium: 30,
//   free: 24,
//   byCategory: { ats: 8, creative: 8, ... },
//   byDifficulty: { beginner: 18, ... },
//   byLayout: { 'single-column': 20, ... },
//   avgRating: 4.7,
//   totalDownloads: 245830
// }
```

### Validation

```typescript
// Validate a template
const isValid = service.validate(template);

// Check if template exists
const exists = await service.exists('template-id');
```

## Usage Patterns

### In React Hooks

```typescript
import { getTemplateService } from '@/services/templateService';
import { useState, useEffect } from 'react';

export function useTemplates(category?: string) {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      const service = getTemplateService();
      const results = category
        ? await service.getByCategory(category)
        : await service.getAll();
      setTemplates(results);
      setLoading(false);
    };

    loadTemplates();
  }, [category]);

  return { templates, loading };
}
```

### In Server Components (Next.js)

```typescript
import { getTemplateService } from '@/services/templateService';

export default async function TemplatesPage() {
  const service = getTemplateService();
  const templates = await service.getAll();

  return (
    <div>
      {templates.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
```

### In Context Providers

```typescript
import { getTemplateService } from '@/services/templateService';

export function TemplateProvider({ children }) {
  const service = getTemplateService();

  const loadTemplate = async (id: string) => {
    return await service.getById(id);
  };

  const searchTemplates = async (query: string) => {
    return await service.search(query);
  };

  return (
    <TemplateContext.Provider value={{ loadTemplate, searchTemplates }}>
      {children}
    </TemplateContext.Provider>
  );
}
```

## Creating Custom Storage Adapters

Implement the `ITemplateStorage` interface:

```typescript
import { ITemplateStorage } from '@/services/templateService';

export class CustomStorage implements ITemplateStorage {
  async getAll(): Promise<ResumeTemplate[]> {
    // Your implementation
  }

  async getById(id: string): Promise<ResumeTemplate | null> {
    // Your implementation
  }

  // ... implement other methods
}

// Use it
const storage = new CustomStorage();
const service = new TemplateService(storage);
```

### IndexedDB Storage Example

```typescript
export class IndexedDBStorage implements ITemplateStorage {
  private db: IDBDatabase;

  async getAll(): Promise<ResumeTemplate[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['templates'], 'readonly');
      const store = transaction.objectStore('templates');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ... other methods
}
```

## Testing

### Mock the Service

```typescript
import { TemplateService } from '@/services/templateService';

const mockStorage = {
  getAll: jest.fn().mockResolvedValue([mockTemplate1, mockTemplate2]),
  getById: jest.fn().mockResolvedValue(mockTemplate1),
  // ... other methods
};

const service = new TemplateService(mockStorage);

// Test
await service.getAll();
expect(mockStorage.getAll).toHaveBeenCalled();
```

### Test Storage Adapters

```typescript
import { LocalTemplateStorage } from '@/services/templateService';

describe('LocalTemplateStorage', () => {
  it('should return all templates', async () => {
    const storage = new LocalTemplateStorage([template1, template2]);
    const result = await storage.getAll();
    expect(result).toHaveLength(2);
  });

  it('should return template by ID', async () => {
    const storage = new LocalTemplateStorage([template1]);
    const result = await storage.getById('template-1');
    expect(result).toEqual(template1);
  });
});
```

## Performance Considerations

### Caching Strategy

**When to use caching:**
- API-backed storage
- Expensive filtering operations
- High-traffic pages
- Repeat queries

**Cache configuration:**
```typescript
// Development: Short TTL, enable stats
{ maxSize: 50, ttl: 60000, enableStats: true }

// Production: Longer TTL, disable stats
{ maxSize: 200, ttl: 600000, enableStats: false }
```

### Optimization Tips

1. **Use specific queries instead of filtering all:**
   ```typescript
   // Good - direct query
   await service.getByCategory('ats');

   // Less optimal - filter all
   const all = await service.getAll();
   const ats = all.filter(t => t.category === 'ats');
   ```

2. **Batch operations when possible:**
   ```typescript
   // Fetch once, filter multiple times in memory
   const templates = await service.getAll();
   const ats = templates.filter(t => t.category === 'ats');
   const premium = templates.filter(t => t.isPremium);
   ```

3. **Use query() for complex operations:**
   ```typescript
   // Optimized - single call
   const results = await service.query(
     { category: 'ats', isPremium: true },
     'rating-desc'
   );
   ```

## Migration Guide

### Replace Direct Imports

**Before:**
```typescript
import { resumeTemplates } from '@/data/templates';

const templates = resumeTemplates.filter(t => t.category === 'ats');
```

**After:**
```typescript
import { getTemplateService } from '@/services/templateService';

const service = getTemplateService();
const templates = await service.getByCategory('ats');
```

### Replace Custom Filtering

**Before:**
```typescript
const filtered = templates.filter(t =>
  t.category === 'ats' &&
  t.difficulty === 'beginner' &&
  !t.isPremium
);
```

**After:**
```typescript
const filtered = await service.filter({
  category: 'ats',
  difficulty: 'beginner',
  isPremium: false,
});
```

## Benefits

1. **Decoupling:** Components don't depend on data structure
2. **Testability:** Easy to mock storage layer
3. **Flexibility:** Swap storage without changing business logic
4. **Caching:** Built-in caching support
5. **Consistency:** Single API for all operations
6. **Error Handling:** Centralized error handling
7. **Performance:** Optimized queries and caching
8. **Maintainability:** Changes in one place
9. **Type Safety:** Full TypeScript support
10. **Scalability:** Ready for backend integration

## Future Enhancements

- [ ] Add write operations (create, update, delete)
- [ ] Implement GraphQL storage adapter
- [ ] Add request batching
- [ ] Add optimistic updates
- [ ] Add offline support
- [ ] Add real-time updates (WebSocket)
- [ ] Add template versioning
- [ ] Add A/B testing support
- [ ] Add analytics tracking
- [ ] Add template recommendations

## Files Structure

```
/services/
  ├── templateService.ts          # Main service + interface
  ├── initializeServices.ts       # Initialization helper
  ├── README.md                   # This file
  └── storageAdapters/
      ├── CachedTemplateStorage.ts   # Caching decorator
      └── APITemplateStorage.ts      # API adapter skeleton
```

## Support

For questions or issues with the service layer:
1. Check this README
2. Review the inline JSDoc comments
3. Check the implementation files
4. Consult the team lead
