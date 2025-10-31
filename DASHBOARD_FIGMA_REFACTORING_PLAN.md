# DashboardFigma.tsx Refactoring Plan
## Current State: ~1026 lines

---

## Phase 1: Pre-Refactoring Setup

### Step 1.1: Backup Current File
- [ ] Create backup: `DashboardFigma.tsx.backup`
- [ ] Verify backup file exists and matches original

### Step 1.2: Map File Structure

**File Analysis:**
```
DashboardFigma.tsx (1026 lines)
├── Imports (27 lines)
│   ├── React hooks
│   ├── Lucide icons (23 icons)
│   └── Theme context
├── Types/Interfaces (2 interfaces, ~14 lines)
│   ├── DashboardFigmaProps
│   └── Todo
├── Component State (8 useState hooks, ~8 lines)
│   ├── activityFilter
│   ├── todoFilter
│   ├── showCompleted
│   ├── showAddTodo
│   ├── newTodoTitle
│   ├── newTodoSubtitle
│   ├── newTodoPriority
│   ├── userTodos
│   └── deletedDefaultTodoIds
├── Constants/Data (~180 lines)
│   ├── metrics (4 items)
│   ├── activities (4 items)
│   ├── defaultTodos (7 items)
│   ├── alerts (2 items)
│   ├── quickActions (8 items)
│   ├── progressMetrics (3 items)
│   └── filterTags (5 items)
├── Helper Functions (2 functions, ~30 lines)
│   ├── getStatusColor
│   └── getPriorityColor
└── JSX/Render (~770 lines)
    ├── Filter Tags Section
    ├── Metrics Grid (4 cards)
    ├── Premium Features Widget
    ├── Activity Feed Widget
    ├── Upcoming Events Widget
    ├── Quick Actions Widget
    ├── Smart To-Dos Widget (with Add Todo Form)
    ├── Intelligent Alerts Widget
    └── Progress Metrics Widget
```

### Step 1.3: Identify Extraction Candidates

**Inline Components to Extract:**
1. `FilterTags` - Filter tag buttons (lines 286-297)
2. `MetricsGrid` - Metrics cards grid (lines 300-332)
3. `MetricCard` - Individual metric card (lines 304-329)
4. `PremiumFeaturesWidget` - Premium features section (lines 338-429)
5. `PremiumFeatureCard` - Individual premium feature card (lines 398-421)
6. `ActivityFeedWidget` - Activity feed with filter (lines 432-528)
7. `ActivityItem` - Individual activity item (lines 487-524)
8. `UpcomingEventsWidget` - Upcoming events section (lines 531-650)
9. `EventItem` - Individual event item (lines 580-627)
10. `QuickActionsWidget` - Quick actions grid (lines 656-699)
11. `QuickActionButton` - Individual action button (lines 668-695)
12. `TodosWidget` - To-dos section (lines 701-941)
13. `TodoItem` - Individual todo item (lines 865-938)
14. `AddTodoForm` - Add todo form modal (lines 753-856)
15. `IntelligentAlertsWidget` - Alerts section (lines 944-990)
16. `AlertItem` - Individual alert item (lines 966-987)
17. `ProgressMetricsWidget` - Progress metrics section (lines 993-1018)
18. `ProgressMetricItem` - Individual progress metric (lines 1003-1015)

**Repeated Patterns:**
- Card styling patterns (background, border, hover effects)
- Icon + gradient badge patterns
- Hover effect handlers (onMouseEnter/onMouseLeave)
- Status/priority badge patterns

**Complex State Logic:**
- Todo management (default + user todos + deleted tracking)
- Filter logic (activity filter, todo filter)
- Add todo form state

**Utility Functions:**
- `getStatusColor` - Status color mapping
- `getPriorityColor` - Priority color mapping (theme-aware)
- Todo progress calculation
- Todo filtering logic

**Constants:**
- All static data arrays (metrics, activities, todos, alerts, quickActions, etc.)
- Gradient classes
- Icon imports

### Step 1.4: Create Test Checklist

**Manual UI Tests (Before Refactoring):**
- [ ] Filter tags render and navigate correctly
- [ ] Metrics cards display correct values and hover effects
- [ ] Premium features widget displays all 4 features
- [ ] Activity feed filter dropdown works
- [ ] Activity items display with correct status colors
- [ ] Upcoming events widget shows 3 events correctly
- [ ] Quick actions buttons navigate to correct tabs
- [ ] Add todo form shows/hides correctly
- [ ] Add todo form creates new todos
- [ ] Todo checkboxes toggle completion
- [ ] Todo delete buttons work (both default and user todos)
- [ ] Todo progress bar updates correctly
- [ ] Alerts widget displays with correct priorities
- [ ] Progress metrics bars display correctly
- [ ] All hover effects work (scale, shadow, color changes)
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Theme colors apply correctly

---

## Phase 2: Refactoring Steps (Incremental)

### Step 2.1: Extract Types and Interfaces

**Create:** `apps/web/src/components/DashboardFigma/types/dashboardFigma.ts`

**Extract:**
- `DashboardFigmaProps` interface
- `Todo` interface
- New types for extracted data:
  - `ActivityStatus` - 'pending' | 'completed' | 'warning'
  - `Priority` - 'low' | 'high' | 'urgent'
  - `Metric` - { label, value, icon, gradient }
  - `Activity` - { id, title, subtitle, time, status, icon }
  - `Alert` - { id, title, subtitle, time, priority, icon }
  - `QuickAction` - { id, icon, label, action }
  - `ProgressMetric` - { label, value, gradient }
  - `FilterTag` - { label, color, action }
  - `PremiumFeature` - { icon, title, description, gradient }
  - `Event` - { id, title, date, type, urgent, icon }

**Action Items:**
1. Create `apps/web/src/components/DashboardFigma/types/` directory
2. Create `dashboardFigma.ts` file
3. Move interfaces and add new types
4. Export all types
5. Update imports in main file

**Verify:**
- [ ] TypeScript compiles without errors
- [ ] No type errors in main file
- [ ] All types are properly exported

---

### Step 2.2: Extract Constants

**Create:** `apps/web/src/components/DashboardFigma/constants/dashboardFigma.ts`

**Extract:**
- `METRICS` - metrics array (lines 62-87)
- `ACTIVITIES` - activities array (lines 90-123)
- `DEFAULT_TODOS` - defaultTodos array (lines 126-190)
- `ALERTS` - alerts array (lines 199-216)
- `QUICK_ACTIONS_DATA` - quickActions array (lines 221-230)
- `PROGRESS_METRICS` - progressMetrics array (lines 233-237)
- `FILTER_TAGS_DATA` - filterTags array (lines 240-246)

**Note:** These will need navigation callbacks passed as parameters or use a factory function.

**Action Items:**
1. Create `apps/web/src/components/DashboardFigma/constants/` directory
2. Create `dashboardFigma.ts` file
3. Move all constant arrays
4. Create factory functions for dynamic constants (quickActions, filterTags):
   - `createQuickActions(onNavigateToTab: (tab: string) => void)`
   - `createFilterTags(onNavigateToTab, onQuickAction)`
5. Export all constants
6. Update imports in main file

**Verify:**
- [ ] All constants exported correctly
- [ ] Factory functions work correctly
- [ ] No runtime errors
- [ ] Data displays correctly

---

### Step 2.3: Extract Helper Functions

**Create:** `apps/web/src/components/DashboardFigma/utils/dashboardFigmaHelpers.ts`

**Extract:**
- `getStatusColor(status: ActivityStatus): string` (lines 249-258)
- `getPriorityColor(priority: Priority, colors: ThemeColors): React.CSSProperties` (lines 261-278)
- `calculateTodoProgress(todos: Todo[]): number` - extract logic from line 196
- `filterTodos(todos: Todo[], filter: string, showCompleted: boolean): Todo[]` - extract filtering logic (lines 860-864)

**Action Items:**
1. Create `apps/web/src/components/DashboardFigma/utils/` directory
2. Create `dashboardFigmaHelpers.ts` file
3. Move helper functions
4. Ensure functions are pure (no side effects)
5. Update imports and add proper types
6. Update main file to use helpers

**Verify:**
- [ ] Helper functions return correct values
- [ ] No state dependencies in helpers
- [ ] All calculations match original behavior

---

### Step 2.4: Extract Custom Hooks

**Create:** `apps/web/src/components/DashboardFigma/hooks/useDashboardFigma.ts`

**Extract State Logic:**
- Todo management hook: `useTodos`
  - userTodos state
  - deletedDefaultTodoIds state
  - addTodo function
  - deleteTodo function
  - toggleTodoComplete function
  - getCombinedTodos function (combines default + user - deleted)
  
- Filter hook: `useDashboardFilters`
  - activityFilter state
  - todoFilter state
  - showCompleted state
  - setters for all filters

- Form hook: `useAddTodoForm`
  - showAddTodo state
  - newTodoTitle state
  - newTodoSubtitle state
  - newTodoPriority state
  - resetForm function
  - submitForm function (adds todo and resets)

**Action Items:**
1. Create `apps/web/src/components/DashboardFigma/hooks/` directory
2. Create `useDashboardFigma.ts` file
3. Extract `useTodos` hook
4. Extract `useDashboardFilters` hook
5. Extract `useAddTodoForm` hook
6. Create main hook that combines all: `useDashboardFigma`
7. Update main component to use hooks

**Verify:**
- [ ] State updates work correctly
- [ ] Todo operations work (add, delete, toggle)
- [ ] Filters apply correctly
- [ ] Form submission works
- [ ] No regressions in functionality

---

### Step 2.5: Extract Sub-Components (One at a Time)

#### Step 2.5.1: Extract MetricCard (Smallest, Most Isolated)

**Create:** `apps/web/src/components/DashboardFigma/components/MetricCard.tsx`

**Extract:**
- Lines 304-329: Metric card JSX and logic
- Props: `{ metric: Metric, colors: ThemeColors }`

**Action Items:**
1. Create component file with proper props interface
2. Move JSX and hover logic
3. Import necessary types and icons
4. Update main file to use `<MetricCard />`
5. Test component renders correctly

**Verify:**
- [ ] Component renders
- [ ] Hover effects work
- [ ] Styling matches original
- [ ] Icon displays correctly

---

#### Step 2.5.2: Extract MetricsGrid

**Create:** `apps/web/src/components/DashboardFigma/components/MetricsGrid.tsx`

**Extract:**
- Lines 300-332: Metrics grid container and mapping
- Props: `{ metrics: Metric[], colors: ThemeColors }`
- Uses MetricCard component

**Action Items:**
1. Create component file
2. Import MetricCard
3. Map metrics to MetricCard components
4. Update main file

**Verify:**
- [ ] Grid displays all metrics
- [ ] Layout matches original
- [ ] Responsive grid works

---

#### Step 2.5.3: Extract FilterTags

**Create:** `apps/web/src/components/DashboardFigma/components/FilterTags.tsx`

**Extract:**
- Lines 286-297: Filter tags section
- Props: `{ filterTags: FilterTag[], colors?: ThemeColors }`

**Action Items:**
1. Create component file
2. Move filter tags JSX
3. Update main file

**Verify:**
- [ ] Tags render correctly
- [ ] Click handlers work
- [ ] Styling matches

---

#### Step 2.5.4: Extract ActivityItem

**Create:** `apps/web/src/components/DashboardFigma/components/ActivityItem.tsx`

**Extract:**
- Lines 487-524: Individual activity item
- Props: `{ activity: Activity, colors: ThemeColors }`
- Uses getStatusColor helper

**Action Items:**
1. Create component file
2. Move activity item JSX
3. Import getStatusColor helper
4. Update main file

**Verify:**
- [ ] Activity items render
- [ ] Status colors apply correctly
- [ ] Hover effects work

---

#### Step 2.5.5: Extract ActivityFeedWidget

**Create:** `apps/web/src/components/DashboardFigma/components/ActivityFeedWidget.tsx`

**Extract:**
- Lines 432-528: Activity feed widget
- Props: 
  ```typescript
  {
    activities: Activity[],
    activityFilter: string,
    onFilterChange: (filter: string) => void,
    colors: ThemeColors
  }
  ```
- Uses ActivityItem component

**Action Items:**
1. Create component file
2. Import ActivityItem
3. Move filter dropdown and activity list
4. Update main file

**Verify:**
- [ ] Widget renders
- [ ] Filter dropdown works
- [ ] Activities display correctly
- [ ] "View All" button works (if implemented)

---

#### Step 2.5.6: Extract PremiumFeatureCard

**Create:** `apps/web/src/components/DashboardFigma/components/PremiumFeatureCard.tsx`

**Extract:**
- Lines 398-421: Premium feature card
- Props: `{ feature: PremiumFeature, colors: ThemeColors }`

**Action Items:**
1. Create component file
2. Move card JSX and hover logic
3. Update main file

**Verify:**
- [ ] Card renders correctly
- [ ] Hover effects work
- [ ] Styling matches

---

#### Step 2.5.7: Extract PremiumFeaturesWidget

**Create:** `apps/web/src/components/DashboardFigma/components/PremiumFeaturesWidget.tsx`

**Extract:**
- Lines 338-429: Premium features section
- Props: `{ colors: ThemeColors }`
- Uses PremiumFeatureCard component
- Contains premium features data (or passes as prop)

**Action Items:**
1. Create component file
2. Import PremiumFeatureCard
3. Move widget JSX
4. Define premium features data in component or import from constants
5. Update main file

**Verify:**
- [ ] Widget renders
- [ ] All 4 features display
- [ ] Upgrade button works
- [ ] Styling matches

---

#### Step 2.5.8: Extract EventItem

**Create:** `apps/web/src/components/DashboardFigma/components/EventItem.tsx`

**Extract:**
- Lines 580-627: Individual event item
- Props: `{ event: Event, colors: ThemeColors }`

**Action Items:**
1. Create component file
2. Move event item JSX
3. Update main file

**Verify:**
- [ ] Event items render
- [ ] Urgent styling applies correctly
- [ ] Hover effects work

---

#### Step 2.5.9: Extract UpcomingEventsWidget

**Create:** `apps/web/src/components/DashboardFigma/components/UpcomingEventsWidget.tsx`

**Extract:**
- Lines 531-650: Upcoming events widget
- Props: `{ events: Event[], colors: ThemeColors }`
- Uses EventItem component

**Action Items:**
1. Create component file
2. Import EventItem
3. Move widget JSX
4. Define events data in component or pass as prop
5. Update main file

**Verify:**
- [ ] Widget renders
- [ ] Events display correctly
- [ ] "View All Events" button works
- [ ] Urgent events highlighted

---

#### Step 2.5.10: Extract QuickActionButton

**Create:** `apps/web/src/components/DashboardFigma/components/QuickActionButton.tsx`

**Extract:**
- Lines 668-695: Quick action button
- Props: `{ action: QuickAction, colors: ThemeColors }`

**Action Items:**
1. Create component file
2. Move button JSX and hover logic
3. Update main file

**Verify:**
- [ ] Buttons render
- [ ] Click handlers work
- [ ] Hover effects work
- [ ] Icons display correctly

---

#### Step 2.5.11: Extract QuickActionsWidget

**Create:** `apps/web/src/components/DashboardFigma/components/QuickActionsWidget.tsx`

**Extract:**
- Lines 656-699: Quick actions widget
- Props: `{ quickActions: QuickAction[], colors: ThemeColors }`
- Uses QuickActionButton component

**Action Items:**
1. Create component file
2. Import QuickActionButton
3. Move widget JSX
4. Update main file

**Verify:**
- [ ] Widget renders
- [ ] All 8 actions display
- [ ] Grid layout works
- [ ] Navigation works

---

#### Step 2.5.12: Extract AddTodoForm

**Create:** `apps/web/src/components/DashboardFigma/components/AddTodoForm.tsx`

**Extract:**
- Lines 753-856: Add todo form
- Props:
  ```typescript
  {
    isOpen: boolean,
    title: string,
    subtitle: string,
    priority: Priority,
    onTitleChange: (title: string) => void,
    onSubtitleChange: (subtitle: string) => void,
    onPriorityChange: (priority: Priority) => void,
    onSubmit: () => void,
    onCancel: () => void,
    colors: ThemeColors
  }
  ```

**Action Items:**
1. Create component file
2. Move form JSX
3. Update main file

**Verify:**
- [ ] Form shows/hides correctly
- [ ] Input fields work
- [ ] Submit adds todo
- [ ] Cancel clears form
- [ ] Validation works (title required)

---

#### Step 2.5.13: Extract TodoItem

**Create:** `apps/web/src/components/DashboardFigma/components/TodoItem.tsx`

**Extract:**
- Lines 865-938: Individual todo item
- Props:
  ```typescript
  {
    todo: Todo,
    onToggle: (id: number) => void,
    onDelete: (id: number) => void,
    colors: ThemeColors
  }
  ```
- Uses getPriorityColor helper

**Action Items:**
1. Create component file
2. Move todo item JSX
3. Import getPriorityColor helper
4. Update main file

**Verify:**
- [ ] Todo items render
- [ ] Checkbox toggles correctly
- [ ] Delete button works
- [ ] Priority badge displays
- [ ] Completed styling applies

---

#### Step 2.5.14: Extract TodosWidget

**Create:** `apps/web/src/components/DashboardFigma/components/TodosWidget.tsx`

**Extract:**
- Lines 701-941: Todos widget
- Props:
  ```typescript
  {
    todos: Todo[],
    todoFilter: string,
    showCompleted: boolean,
    todoProgress: number,
    showAddTodo: boolean,
    newTodoTitle: string,
    newTodoSubtitle: string,
    newTodoPriority: Priority,
    onFilterChange?: (filter: string) => void,
    onShowAddTodo: () => void,
    onTitleChange: (title: string) => void,
    onSubtitleChange: (subtitle: string) => void,
    onPriorityChange: (priority: Priority) => void,
    onAddTodo: () => void,
    onCancelAddTodo: () => void,
    onToggleTodo: (id: number) => void,
    onDeleteTodo: (id: number) => void,
    colors: ThemeColors
  }
  ```
- Uses TodoItem and AddTodoForm components

**Action Items:**
1. Create component file
2. Import TodoItem and AddTodoForm
3. Move widget JSX
4. Move progress bar logic
5. Update main file

**Verify:**
- [ ] Widget renders
- [ ] Progress bar displays correctly
- [ ] Add todo button works
- [ ] Todo list displays correctly
- [ ] Filtering works
- [ ] All todo operations work

---

#### Step 2.5.15: Extract AlertItem

**Create:** `apps/web/src/components/DashboardFigma/components/AlertItem.tsx`

**Extract:**
- Lines 966-987: Individual alert item
- Props: `{ alert: Alert }`

**Action Items:**
1. Create component file
2. Move alert item JSX
3. Update main file

**Verify:**
- [ ] Alert items render
- [ ] Priority colors apply
- [ ] Hover effects work

---

#### Step 2.5.16: Extract IntelligentAlertsWidget

**Create:** `apps/web/src/components/DashboardFigma/components/IntelligentAlertsWidget.tsx`

**Extract:**
- Lines 944-990: Alerts widget
- Props: `{ alerts: Alert[], urgentCount: number }`
- Uses AlertItem component

**Action Items:**
1. Create component file
2. Import AlertItem
3. Move widget JSX
4. Update main file

**Verify:**
- [ ] Widget renders
- [ ] Urgent count badge displays
- [ ] Alerts display correctly

---

#### Step 2.5.17: Extract ProgressMetricItem

**Create:** `apps/web/src/components/DashboardFigma/components/ProgressMetricItem.tsx`

**Extract:**
- Lines 1003-1015: Individual progress metric
- Props: `{ metric: ProgressMetric }`

**Action Items:**
1. Create component file
2. Move progress metric JSX
3. Update main file

**Verify:**
- [ ] Progress bars render
- [ ] Values display correctly
- [ ] Gradients apply correctly

---

#### Step 2.5.18: Extract ProgressMetricsWidget

**Create:** `apps/web/src/components/DashboardFigma/components/ProgressMetricsWidget.tsx`

**Extract:**
- Lines 993-1018: Progress metrics widget
- Props: `{ metrics: ProgressMetric[] }`
- Uses ProgressMetricItem component

**Action Items:**
1. Create component file
2. Import ProgressMetricItem
3. Move widget JSX
4. Update main file

**Verify:**
- [ ] Widget renders
- [ ] All metrics display
- [ ] Progress bars animate correctly

---

### Step 2.6: Create Index File

**Create:** `apps/web/src/components/DashboardFigma/index.ts`

**Action Items:**
1. Export main component: `export { default } from './DashboardFigma'`
2. Export all types
3. Export all components (optional, for external use)
4. Export hooks (optional)

---

### Step 2.7: Clean Up Main File

**Final Main File Structure:**
```typescript
DashboardFigma.tsx (~150-200 lines)
├── Imports
├── Main component function
├── Hook calls (useDashboardFigma)
├── Data preparation (combine todos, calculate progress)
└── JSX layout (compose widgets)
```

**Action Items:**
1. Remove all extracted code
2. Import all extracted modules
3. Compose widgets in JSX
4. Keep only layout logic
5. Verify file is much smaller and cleaner

---

## Phase 3: Post-Refactoring Verification

### Step 3.1: TypeScript Verification
- [ ] Run `npm run type-check` or `tsc --noEmit`
- [ ] No TypeScript errors
- [ ] Strict mode passes
- [ ] All types are properly defined
- [ ] No `any` types introduced

### Step 3.2: Linter Verification
- [ ] Run linter
- [ ] Address warnings (inline styles can wait if necessary)
- [ ] No unused imports
- [ ] Consistent naming conventions

### Step 3.3: Runtime Testing
- [ ] Test all features manually (use checklist from Phase 1.4)
- [ ] No console errors
- [ ] No broken imports
- [ ] All event handlers fire correctly
- [ ] State management works correctly

### Step 3.4: UI Comparison
- [ ] Side-by-side visual check
- [ ] Colors match exactly
- [ ] Spacing matches
- [ ] Fonts match
- [ ] Animations/transitions work
- [ ] Responsive behavior unchanged
- [ ] Loading states unchanged
- [ ] Error states unchanged

### Step 3.5: Performance Check
- [ ] No noticeable performance degradation
- [ ] Component re-renders are optimized
- [ ] No unnecessary re-renders
- [ ] Large lists still perform well

### Step 3.6: Code Quality Review
- [ ] All extracted files are clean
- [ ] Components are properly structured
- [ ] Props are minimal and clear
- [ ] Complex logic is documented
- [ ] No duplicate code
- [ ] Files follow naming conventions

---

## Quality Assurance Checklist (After Each Step)

### Functionality
- [ ] All features work as before
- [ ] No console errors
- [ ] No broken imports
- [ ] State management intact
- [ ] Event handlers fire correctly

### UI/UX
- [ ] Visual appearance unchanged
- [ ] Styling matches (colors, spacing, fonts)
- [ ] Animations/transitions work
- [ ] Responsive behavior unchanged
- [ ] Loading states unchanged
- [ ] Error states unchanged

### Code Quality
- [ ] TypeScript compiles without errors
- [ ] No unused imports
- [ ] Consistent naming
- [ ] Proper prop types
- [ ] Components are testable

---

## Refactoring Principles

1. **One change at a time** - Complete each step before moving to the next
2. **Test after each extraction** - Verify after each component extraction
3. **Preserve exact behavior** - No functional changes, only structural
4. **Keep props minimal and clear** - Don't pass entire objects when only one property is needed
5. **Document complex logic** - Add comments for non-obvious logic
6. **No premature optimization** - Focus on structure first, optimize later if needed

---

## Rollback Plan

If something breaks:
1. **Revert the last change** - Use git or backup file
2. **Identify the issue** - Check console, TypeScript errors, runtime errors
3. **Fix before continuing** - Don't accumulate errors
4. **Test before moving on** - Verify fix works completely

---

## File Structure After Refactoring

```
apps/web/src/components/DashboardFigma/
├── DashboardFigma.tsx (main file, ~150-200 lines)
├── index.ts (exports)
├── types/
│   └── dashboardFigma.ts
├── constants/
│   └── dashboardFigma.ts
├── utils/
│   └── dashboardFigmaHelpers.ts
├── hooks/
│   └── useDashboardFigma.ts
└── components/
    ├── MetricCard.tsx
    ├── MetricsGrid.tsx
    ├── FilterTags.tsx
    ├── ActivityItem.tsx
    ├── ActivityFeedWidget.tsx
    ├── PremiumFeatureCard.tsx
    ├── PremiumFeaturesWidget.tsx
    ├── EventItem.tsx
    ├── UpcomingEventsWidget.tsx
    ├── QuickActionButton.tsx
    ├── QuickActionsWidget.tsx
    ├── AddTodoForm.tsx
    ├── TodoItem.tsx
    ├── TodosWidget.tsx
    ├── AlertItem.tsx
    ├── IntelligentAlertsWidget.tsx
    ├── ProgressMetricItem.tsx
    └── ProgressMetricsWidget.tsx
```

**Total Files:** ~25 files (vs 1 monolithic file)
**Main File Reduction:** ~1026 lines → ~150-200 lines (80%+ reduction)

---

## Estimated Time Breakdown

- **Phase 1 (Setup):** 30-45 minutes
- **Phase 2.1 (Types):** 20-30 minutes
- **Phase 2.2 (Constants):** 30-45 minutes
- **Phase 2.3 (Helpers):** 20-30 minutes
- **Phase 2.4 (Hooks):** 45-60 minutes
- **Phase 2.5 (Components):** 3-4 hours (18 components × 10-15 min each)
- **Phase 2.6-2.7 (Index & Cleanup):** 30-45 minutes
- **Phase 3 (Verification):** 45-60 minutes

**Total Estimated Time:** 6-8 hours

---

## Notes

- This is a large refactoring. Take breaks between phases.
- Test thoroughly after each step.
- Keep the backup file until refactoring is complete and verified.
- Consider creating unit tests for extracted components after refactoring.
- The extracted structure follows the same pattern as other refactored components (AIAgents, CloudStorage, etc.)

