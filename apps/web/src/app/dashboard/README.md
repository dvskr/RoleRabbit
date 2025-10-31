# Dashboard Module

The dashboard module is the central hub of the RoleReady application, managing multiple tabs including resume editing, job tracking, cloud storage, and more.

## Architecture

The dashboard is organized into several key directories:

```
dashboard/
├── components/        # Dashboard-specific components
├── constants/         # Configuration constants
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── page.tsx           # Main dashboard component
```

## Custom Hooks

### UI State Management
- **`useDashboardUI`** - Manages tabs, sidebars, panels, preview mode
- **`useDashboardTemplates`** - Manages template selection and configuration

### Business Logic
- **`useDashboardHandlers`** - All handler functions (resume, AI, history operations)
- **`useDashboardCloudStorage`** - Cloud storage modal state management
- **`useDashboardCloudSave`** - Cloud save/load operations
- **`useDashboardExport`** - Export and import operations
- **`useDashboardAnalytics`** - Analytics feature visibility
- **`useDashboardTabChange`** - Tab navigation with legacy name mapping

## Constants

- **`dashboard.constants.ts`** - Default values and tab definitions
  - `DEFAULT_TAB`, `DEFAULT_TEMPLATE_ID`, etc.
  - `DashboardTab` type definition

## Utilities

### Helper Functions
- **`dashboardHelpers.ts`** - Tab metadata (titles, icons, colors)
- **`dashboardHandlers.ts`** - General handler utilities
- **`cloudStorageHelpers.ts`** - Cloud storage operations
- **`exportHtmlGenerator.ts`** - HTML generation for exports
- **`resumeDataHelpers.ts`** - Resume data transformations
- **`templateClassesHelper.ts`** - Template styling

## Components

- **`DashboardModals.tsx`** - All modal dialogs
- **`ResumePreview.tsx`** - Resume preview component
- **`CustomSectionEditor.tsx`** - Custom section editing

## Usage Example

```typescript
import { useDashboardUI } from './hooks/useDashboardUI';
import { useDashboardHandlers } from './hooks/useDashboardHandlers';

function MyComponent() {
  const dashboardUI = useDashboardUI();
  const { activeTab, setActiveTab } = dashboardUI;
  
  const handlers = useDashboardHandlers(/* params */);
  const { toggleSection, moveSection } = handlers;
  
  // Use the hooks...
}
```

## Tab Management

The dashboard supports multiple tabs:
- `dashboard` - Main overview
- `profile` - User profile
- `storage` - Cloud storage
- `editor` - Resume editor
- `templates` - Resume templates
- `jobs` / `tracker` - Job tracking
- `email` - Email hub
- `discussion` - Community
- `cover-letter` - Cover letter generator
- `portfolio` - Portfolio builder
- `learning` - Learning hub
- `ai-agents` / `agents` - AI agents

## State Management

The dashboard uses multiple layers of state:

1. **Global State** - `useResumeData`, `useModals`, `useAI`
2. **Dashboard State** - Custom hooks for dashboard-specific state
3. **Local State** - Component-level state for UI interactions

## Performance Optimizations

- Lazy loading of heavy components
- Dynamic imports for code splitting
- Memoized callbacks in hooks
- Conditional rendering of tabs

## Testing

### Unit Tests
Located in `components/__tests__/` and `utils/__tests__/`

### Integration Tests
Test the full dashboard flow including tab switching and state management

## Future Improvements

- [ ] Extract more complex rendering logic into components
- [ ] Add more comprehensive unit tests
- [ ] Optimize bundle size further
- [ ] Add error boundaries for each tab
- [ ] Implement virtual scrolling for large lists

## Related Documentation

- [Refactoring Summary](./REFACTORING_SUMMARY.md)
- [Main README](../../../../README.md)
- [API Documentation](../../../../docs/README.md)

## Contributing

When adding new features to the dashboard:

1. Check if an existing hook can be extended
2. Create utility functions for reusable logic
3. Add constants to `dashboard.constants.ts`
4. Update this README with new patterns
5. Add appropriate tests

