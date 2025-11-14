# Templates Component - Architecture & Documentation

Comprehensive template browsing and management system with advanced filtering, search, and user interactions.

## Overview

The Templates component provides a complete solution for browsing, filtering, previewing, and managing resume templates. It features a modern, accessible UI with mobile responsiveness, keyboard shortcuts, and persistent user preferences.

### Key Features

- **Advanced Filtering**: Category, difficulty, layout, color scheme, and price filters
- **Real-time Search**: Debounced search with instant results (300ms delay)
- **Multiple View Modes**: Grid and list views with smooth transitions
- **Template Management**: Add up to 10 templates, favorites with localStorage
- **Keyboard Shortcuts**: Power user navigation (see [Keyboard Shortcuts](#keyboard-shortcuts))
- **Mobile Responsive**: Touch-friendly with 44px minimum touch targets
- **Accessible**: WCAG 2.1 Level AA compliant with full ARIA labels
- **Performance Optimized**: React.memo, debouncing, and efficient re-renders
- **Usage Tracking**: History of previewed, used, and downloaded templates

## Architecture

### Directory Structure

```
templates/
├── components/          # UI Components
│   ├── TemplateHeader.tsx          # Header with search/filters
│   ├── SearchAndFilters.tsx        # Search bar and control buttons
│   ├── CategoryTabs.tsx            # Category navigation tabs
│   ├── AdvancedFilters.tsx         # Dropdown filter controls
│   ├── FilterChips.tsx             # Active filter visualization
│   ├── TemplateStats.tsx           # Statistics dashboard
│   ├── TemplateCard.tsx            # Grid view card (memoized)
│   ├── TemplateCardList.tsx        # List view row (memoized)
│   ├── TemplateCardSkeleton.tsx    # Loading skeleton
│   ├── TemplatePreviewModal.tsx    # Preview modal with animations
│   ├── UploadTemplateModal.tsx     # Upload/apply modal
│   ├── PaginationControls.tsx      # Pagination UI
│   ├── EmptyState.tsx              # No results state
│   ├── Tooltip.tsx                 # Reusable tooltip
│   └── TemplatesErrorBoundary.tsx  # Error handling
├── hooks/               # Custom Hooks
│   ├── useTemplateFilters.ts       # Filter logic & persistence
│   ├── useTemplatePagination.ts    # Pagination state
│   ├── useTemplateActions.ts       # Template actions & favorites
│   ├── useTemplateHistory.ts       # Usage history tracking
│   └── useKeyboardShortcuts.ts     # Keyboard navigation
├── constants/           # Constants & Configuration
│   ├── index.ts                    # Main constants export
│   └── spacing.ts                  # Spacing standards
├── utils/               # Utility Functions
│   └── templateHelpers.ts          # Helper utilities
├── validation.ts        # Zod schemas for runtime validation
├── types.ts            # TypeScript types
└── README.md           # This file
```

### Component Hierarchy

```
Templates (with ErrorBoundary)
├── TemplateHeader
│   ├── SearchAndFilters
│   │   ├── Search Input (with ref for keyboard shortcuts)
│   │   ├── Sort Dropdown
│   │   ├── View Mode Toggle (Grid/List)
│   │   ├── Filters Button
│   │   └── Refresh Button
│   ├── CategoryTabs
│   └── AdvancedFilters (conditional)
│       ├── Difficulty Filter
│       ├── Layout Filter
│       ├── Color Scheme Filter
│       └── Price Filters
├── TemplateStats
├── FilterChips (active filters)
├── Added Templates Section
│   └── TemplateCard[] (grid view)
├── All Templates Section
│   ├── TemplateCard[] (grid view)
│   └── TemplateCardList[] (list view)
├── PaginationControls
├── EmptyState (conditional)
├── TemplatePreviewModal (conditional)
└── UploadTemplateModal (conditional)
```

## Custom Hooks

### useTemplateFilters

Manages all filtering and search logic with localStorage persistence.

```typescript
const {
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredTemplates,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,
} = useTemplateFilters({
  initialCategory: 'all',
  initialSortBy: 'popular',
  persistFilters: true, // Enable localStorage
});
```

**Features:**
- Debounced search (300ms)
- 7 filter dimensions (category, difficulty, layout, color, price, etc.)
- localStorage persistence with Zod validation
- Computed active filter count
- SSR-safe

### useTemplatePagination

Handles pagination state and scroll-to-top behavior.

```typescript
const {
  currentPage,
  setCurrentPage,
  totalPages,
  currentTemplates,
} = useTemplatePagination({
  templates: filteredTemplates,
  itemsPerPage: 12,
  scrollToTopOnPageChange: true,
});
```

**Features:**
- Configurable items per page
- Automatic scroll-to-top on page change
- Custom scroll container support

### useTemplateActions

Manages template actions (preview, add, favorite, download, share).

```typescript
const {
  favorites,
  toggleFavorite,
  handlePreviewTemplate,
  handleUseTemplate,
  handleDownloadTemplate,
  handleShareTemplate,
  showPreviewModal,
  currentSelectedTemplate,
  addedTemplateId, // For success animation
} = useTemplateActions({
  onAddToEditor: (templateId) => console.log('Added:', templateId),
  onRemoveTemplate: (templateId) => console.log('Removed:', templateId),
});
```

**Features:**
- Favorites with localStorage persistence
- Usage history tracking integration
- Success animations (2s duration)
- Error handling with callbacks
- Template validation with Zod

### useTemplateHistory

Tracks user interactions with templates for analytics.

```typescript
const {
  history,
  recentlyUsed,
  addToHistory,
  getTemplateUsageCount,
  getLastUsed,
  clearHistory,
} = useTemplateHistory();
```

**Features:**
- Tracks preview, use, and download actions
- localStorage persistence (max 20 items)
- Provides recently used template IDs
- Usage count and last used timestamps

### useKeyboardShortcuts

Provides keyboard navigation for power users.

```typescript
const { shortcuts } = useKeyboardShortcuts({
  searchInputRef,
  onClearFilters,
  onToggleFilters,
  onChangeViewMode,
  onNextPage,
  onPrevPage,
  currentPage,
  totalPages,
  isModalOpen,
});
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` or `Ctrl+K` | Focus search input |
| `Escape` | Clear search (when focused) |
| `Ctrl+Shift+C` | Clear all filters |
| `Ctrl+Shift+F` | Toggle filters panel |
| `Ctrl+1` | Switch to grid view |
| `Ctrl+2` | Switch to list view |
| `←` (Left Arrow) | Previous page |
| `→` (Right Arrow) | Next page |
| `?` | Show keyboard shortcuts help |

**Note:** Shortcuts are context-aware and won't trigger when typing in inputs.

## Data Validation

All template data and user inputs are validated using Zod schemas:

```typescript
import { validateTemplate, validateTemplates } from './validation';

// Validate single template
const result = validateTemplate(template);
if (!result.success) {
  console.error('Invalid template:', result.error);
}

// Validate array of templates
const validTemplates = validateTemplates(templates);
```

**Validated data:**
- Template structure (all required fields)
- Filter values (enums for difficulty, layout, etc.)
- localStorage data (favorites, filters)
- User actions (template IDs, action types)

## Spacing Standards

Use consistent spacing tokens from `constants/spacing.ts`:

```typescript
import { SPACING, SPACING_VALUES, LAYOUT_PATTERNS } from './constants';

// Using Tailwind classes
<div className={SPACING.cardPadding}>...</div>
<div className={LAYOUT_PATTERNS.gridResponsive}>...</div>

// Using raw values for calculations
<div style={{ marginTop: SPACING_VALUES.lg }}>...</div>
```

## Mobile Responsiveness

All components are mobile-first with responsive breakpoints:

- **Breakpoints**: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- **Touch Targets**: Minimum 44px on mobile per accessibility guidelines
- **Modals**: Full-screen on mobile, centered on desktop
- **Grids**: 1 column mobile → 2 tablet → 3-4 desktop
- **Text**: Smaller on mobile, larger on desktop

Example:
```tsx
<button className="px-6 py-3 sm:py-2">
  Button with larger padding on mobile
</button>
```

## Performance Optimizations

1. **React.memo**: TemplateCard and TemplateCardList are memoized
   ```typescript
   React.memo(TemplateCard, (prev, next) => {
     return (
       prev.template.id === next.template.id &&
       prev.isAdded === next.isAdded &&
       prev.isFavorite === next.isFavorite
     );
   });
   ```

2. **Debounced Search**: 300ms delay prevents excessive filtering
3. **useMemo**: Filtered results and computed values are memoized
4. **useCallback**: Event handlers are memoized to prevent re-renders
5. **Pagination**: Only render current page items (12 per page)

## Accessibility

- **WCAG 2.1 Level AA** compliant
- **ARIA labels** on all interactive elements
- **ARIA roles** for semantic structure (search, main, region, list)
- **Keyboard navigation** with visible focus indicators
- **Screen reader** announcements for dynamic content
- **Semantic HTML** (search input type, proper headings)
- **Color contrast** meets minimum ratios

## Error Handling

```tsx
<TemplatesErrorBoundary>
  <TemplatesInternal {...props} />
</TemplatesErrorBoundary>
```

- Catches React errors and prevents crashes
- Shows fallback UI with retry/reload options
- Error details shown in development mode
- Logs errors for monitoring (ready for Sentry integration)

## Usage Example

```tsx
import Templates from './components/Templates';

function App() {
  const [addedTemplates, setAddedTemplates] = useState<string[]>([]);

  const handleAddTemplate = (templateId: string) => {
    if (addedTemplates.length < 10) {
      setAddedTemplates([...addedTemplates, templateId]);
    }
  };

  const handleRemoveTemplate = (templateId: string) => {
    setAddedTemplates(addedTemplates.filter(id => id !== templateId));
  };

  return (
    <Templates
      onAddToEditor={handleAddTemplate}
      addedTemplates={addedTemplates}
      onRemoveTemplate={handleRemoveTemplate}
    />
  );
}
```

## Testing Recommendations

1. **Unit Tests**:
   - Test all custom hooks with @testing-library/react-hooks
   - Test utility functions with Jest
   - Test validation schemas with Zod

2. **Component Tests**:
   - Test with @testing-library/react
   - Test user interactions (click, type, keyboard)
   - Test accessibility with jest-axe

3. **Integration Tests**:
   - Test filter combinations
   - Test pagination flow
   - Test localStorage persistence

4. **E2E Tests**:
   - Test complete user workflows (browse → preview → add)
   - Test on multiple devices (desktop, tablet, mobile)
   - Test with screen readers (NVDA, JAWS, VoiceOver)

## Future Enhancements

- [ ] Backend integration (API instead of hardcoded data)
- [ ] Advanced analytics tracking (Mixpanel, Amplitude)
- [ ] Template ratings and reviews system
- [ ] Social sharing functionality
- [ ] AI-powered template recommendations
- [ ] A/B testing framework
- [ ] Template versioning and updates
- [ ] Custom template upload and creation
- [ ] Admin panel for template management

## Contributing

When adding new features:

1. Follow existing patterns (hooks for logic, components for UI)
2. Add TypeScript types for all props and returns
3. Include JSDoc comments with examples
4. Use consistent spacing from `constants/spacing.ts`
5. Ensure mobile responsiveness (test on real devices)
6. Add ARIA labels for accessibility
7. Write unit tests for logic
8. Update this README

## License

Copyright © 2025 RoleRabbit. All rights reserved.
