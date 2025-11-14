# Template Context Migration Guide

## Overview

The `TemplateContext` provides centralized state management for all template-related functionality,
eliminating state duplication and synchronization issues across the application.

## Problem Solved

**Before:** Template state was fragmented across multiple locations:

1. **useTemplateActions** managed:
   - selectedTemplate
   - showPreviewModal, showUploadModal
   - favorites (with localStorage)
   - addedTemplateId (animation state)
   - uploadedFile, error

2. **useDashboardTemplates** managed:
   - selectedTemplateId (duplicate!)
   - addedTemplates

3. **Templates component** managed:
   - viewMode
   - showFilters
   - isLoading

**Issues:**
- State duplication (`selectedTemplate` vs `selectedTemplateId`)
- Synchronization problems between hooks
- Multiple localStorage implementations
- Difficult to share state across components
- No single source of truth

**After:** All template state centralized in `TemplateContext`:
- Single source of truth
- Automatic localStorage persistence
- No state duplication
- Easy to share state across any component
- Consistent API

## Architecture

```
TemplateProvider (at app root)
    ├─ Manages all template state
    ├─ Persists to localStorage automatically
    ├─ Provides unified API
    └─ Children can access via hooks

Components
    ├─ useTemplateContext() - Full access
    ├─ useTemplateSelection() - Selection only
    ├─ useTemplateFavorites() - Favorites only
    └─ useAddedTemplates() - Added templates only
```

## Migration Steps

### Step 1: Add TemplateProvider

Wrap your app (or relevant section) with `TemplateProvider`:

```tsx
import { TemplateProvider } from '@/contexts/TemplateContext';

export default function App() {
  return (
    <TemplateProvider
      defaultTemplateId={null}
      defaultAddedTemplates={[]}
      maxAddedTemplates={10}
    >
      <YourComponents />
    </TemplateProvider>
  );
}
```

### Step 2: Replace Old Hooks

#### Old Code (useTemplateActions):
```tsx
const actionsState = useTemplateActions({
  onAddToEditor: handleAdd,
  onRemoveTemplate: handleRemove,
});

// Access state
actionsState.favorites
actionsState.selectedTemplate
actionsState.handlePreviewTemplate(id)
```

#### New Code:
```tsx
import { useTemplateContext } from '@/contexts/TemplateContext';

const {
  favorites,
  selectedTemplateId,
  previewTemplate,
  useTemplate,
  toggleFavorite,
  // ... all other state and actions
} = useTemplateContext();

// Use template with callback
useTemplate(id, handleAdd);
```

#### Old Code (useDashboardTemplates):
```tsx
const {
  addedTemplates,
  addTemplate,
  removeTemplate,
  maxTemplates,
} = useDashboardTemplates();
```

#### New Code:
```tsx
import { useAddedTemplates } from '@/contexts/TemplateContext';

const {
  addedTemplates,
  addTemplate,
  removeTemplate,
  maxAddedTemplates,
  canAddMoreTemplates,
} = useAddedTemplates();
```

### Step 3: Replace Component State

#### Old Code:
```tsx
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [showFilters, setShowFilters] = useState(false);
const [isLoading, setIsLoading] = useState(true);
```

#### New Code:
```tsx
const {
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  isLoading,
} = useTemplateContext();
```

## API Reference

### TemplateProvider Props

```tsx
interface TemplateProviderProps {
  children: ReactNode;
  defaultTemplateId?: string | null;         // Initial selected template
  defaultAddedTemplates?: string[];          // Initial added templates
  maxAddedTemplates?: number;                // Max templates (default: 10)
}
```

### useTemplateContext()

Returns the full context with all state and actions.

**State:**
- `selectedTemplateId: string | null` - Currently selected template ID
- `selectedTemplate: ResumeTemplate | null` - Full template object
- `addedTemplates: string[]` - Templates added to dashboard
- `favorites: string[]` - Favorited template IDs
- `showPreviewModal: boolean` - Preview modal visibility
- `showUploadModal: boolean` - Upload modal visibility
- `viewMode: 'grid' | 'list'` - Current view mode
- `showFilters: boolean` - Filters panel visibility
- `isLoading: boolean` - Loading state
- `addedTemplateId: string | null` - Template being added (animation)
- `uploadedFile: File | null` - Currently uploaded file
- `error: string | null` - Current error message

**Actions:**
- `selectTemplate(id)` - Select a template
- `addTemplate(id)` - Add template to dashboard (returns boolean)
- `removeTemplate(id)` - Remove from dashboard
- `toggleFavorite(id)` - Toggle favorite status
- `isFavorite(id)` - Check if favorited
- `previewTemplate(id)` - Open preview modal
- `useTemplate(id, onAddToEditor?)` - Use template with optional callback
- `setShowPreviewModal(show)` - Toggle preview modal
- `setShowUploadModal(show)` - Toggle upload modal
- `setViewMode(mode)` - Change view mode
- `setShowFilters(show)` - Toggle filters
- `setIsLoading(loading)` - Set loading state
- `setUploadedFile(file)` - Set uploaded file
- `setError(error)` - Set error message
- `clearError()` - Clear error

**Computed:**
- `canAddMoreTemplates: boolean` - Whether more templates can be added

### Convenience Hooks

#### useTemplateSelection()
Returns only selection-related state:
```tsx
{
  selectedTemplateId: string | null;
  selectedTemplate: ResumeTemplate | null;
  selectTemplate: (id: string | null) => void;
}
```

#### useTemplateFavorites()
Returns only favorites-related state:
```tsx
{
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}
```

#### useAddedTemplates()
Returns only added templates state:
```tsx
{
  addedTemplates: string[];
  addTemplate: (id: string) => boolean;
  removeTemplate: (id: string) => void;
  canAddMoreTemplates: boolean;
  maxAddedTemplates: number;
}
```

## Persistence

The following state is automatically persisted to localStorage:
- `favorites` → `template_favorites`
- `addedTemplates` → `dashboard_added_templates`
- `viewMode` → `template_view_mode`

Persistence happens automatically whenever these values change.

## Error Handling

The context includes built-in error handling:

```tsx
const { error, setError, clearError } = useTemplateContext();

// Display errors
{error && (
  <Alert>
    {error}
    <button onClick={clearError}>Dismiss</button>
  </Alert>
)}
```

## Benefits

1. **Single Source of Truth:** All template state in one place
2. **No Duplication:** Eliminates `selectedTemplate` vs `selectedTemplateId` issues
3. **Automatic Persistence:** localStorage handled automatically
4. **Type Safety:** Full TypeScript support with IntelliSense
5. **Performance:** Selective subscriptions via convenience hooks
6. **Testability:** Easy to mock for testing
7. **Consistency:** Same API everywhere
8. **Maintainability:** Changes in one place affect all consumers

## Backward Compatibility

Legacy hooks are available as wrappers:
- `useTemplateActions.v2.ts` - Wraps TemplateContext
- `useDashboardTemplates.v2.ts` - Wraps TemplateContext

These allow gradual migration without breaking existing code.

## Best Practices

1. **Use specific hooks when possible:**
   ```tsx
   // Good - only subscribes to favorites
   const { favorites, toggleFavorite } = useTemplateFavorites();

   // Less optimal - subscribes to all context changes
   const context = useTemplateContext();
   ```

2. **Avoid storing duplicate state:**
   ```tsx
   // Bad - duplicates context state
   const [selected, setSelected] = useState(context.selectedTemplateId);

   // Good - use context directly
   const { selectedTemplateId, selectTemplate } = useTemplateSelection();
   ```

3. **Use the context for shared state:**
   ```tsx
   // Favorites are automatically shared across all components
   function FavoriteButton({ templateId }) {
     const { isFavorite, toggleFavorite } = useTemplateFavorites();
     return <button onClick={() => toggleFavorite(templateId)}>
       {isFavorite(templateId) ? '★' : '☆'}
     </button>;
   }
   ```

## Testing

Mock the context for tests:

```tsx
import { TemplateContext } from '@/contexts/TemplateContext';

const mockContext = {
  selectedTemplateId: 'test-id',
  favorites: ['fav-1', 'fav-2'],
  toggleFavorite: jest.fn(),
  // ... other required properties
};

<TemplateContext.Provider value={mockContext}>
  <YourComponent />
</TemplateContext.Provider>
```

## Migration Checklist

- [ ] Add `TemplateProvider` to app root or layout
- [ ] Replace `useTemplateActions()` with `useTemplateContext()` or specific hooks
- [ ] Replace `useDashboardTemplates()` with `useAddedTemplates()`
- [ ] Remove local state that duplicates context (`useState` for viewMode, etc.)
- [ ] Update component props to remove state that's now in context
- [ ] Test localStorage persistence
- [ ] Verify no state synchronization issues
- [ ] Remove old hook files once migration is complete

## Questions?

See `/contexts/TemplateContext.tsx` for full implementation details.
