# Templates.tsx Refactoring Plan (2,067 lines)

## Phase 1: Pre-refactoring Setup

### ✅ Backup Current File
- File: `apps/web/src/components/Templates.tsx`
- Location: Keep original as reference

### ✅ Structure Mapping
**Current Structure:**
1. **Types/Interfaces** (lines 43-47):
   - `TemplatesProps` interface

2. **State Management** (lines 52-73):
   - 20+ useState hooks for various states
   - Search, filters, view modes, modals, pagination

3. **Helper Functions** (lines 160-203):
   - `getDifficultyColor()` - Returns color scheme based on difficulty
   - `getCategoryIcon()` - Returns icon component for category

4. **Event Handlers** (lines 205-348):
   - `handleSelectTemplate()`
   - `handlePreviewTemplate()`
   - `handleUseTemplate()`
   - `handleDownloadTemplate()` - Contains large HTML template
   - `handleShareTemplate()`

5. **Complex Logic** (lines 350-563):
   - `generateSampleResumePreview()` - Large function with multiple layout renderings

6. **Computed Values** (lines 87-140):
   - `filteredTemplates` - Complex useMemo with multiple filters
   - `currentTemplates` - Pagination logic

7. **Components to Extract:**
   - **Header/Search Section** (lines 568-841)
   - **Stats Cards** (lines 849-897)
   - **Added Templates Section (Grid)** (lines 900-1088)
   - **Template Cards (Grid View)** (lines 1092-1273)
   - **Added Templates (List View)** (lines 1277-1504)
   - **All Templates (List View)** (lines 1508-1729)
   - **Pagination** (lines 1734-1766)
   - **Empty State** (lines 1768-1790)
   - **Preview Modal** (lines 1794-1928)
   - **Upload Modal** (lines 1932-2063)

8. **Constants:**
   - Default pagination: 12 templates per page
   - Sort options: 'popular' | 'newest' | 'rating' | 'name'
   - View modes: 'grid' | 'list'
   - Difficulty levels, layouts, color schemes
   - HTML template for download

### Test Checklist (Manual UI Tests)
After each step, verify:
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Category tabs switch properly
- [ ] View mode toggles (grid/list)
- [ ] Template cards render with correct data
- [ ] Preview modal opens/closes
- [ ] Upload modal opens/closes
- [ ] Pagination works correctly
- [ ] Add template button works
- [ ] Favorite toggle works
- [ ] Download template works
- [ ] Share template works
- [ ] Empty state displays when no results
- [ ] Stats cards show correct counts
- [ ] Added templates section displays correctly

---

## Phase 2: Refactoring Steps (Incremental)

### Step 1: Extract Types and Interfaces ✅
**File:** `apps/web/src/components/templates/types.ts`

**To Extract:**
- `TemplatesProps` interface
- Add any additional types needed for components

**Verification:**
- TypeScript compiles without errors
- No type errors in main file

---

### Step 2: Extract Constants ✅
**File:** `apps/web/src/components/templates/constants.ts`

**To Extract:**
- `TEMPLATES_PER_PAGE = 12`
- `SORT_OPTIONS` array
- `VIEW_MODES` array
- `DIFFICULTY_LEVELS` array
- `LAYOUT_TYPES` array
- `COLOR_SCHEMES` array
- HTML template strings for downloads
- Sample resume data structure

**Verification:**
- Same behavior, no runtime errors
- Constants are properly exported and imported

---

### Step 3: Extract Helper Functions ✅
**File:** `apps/web/src/components/templates/utils/templateHelpers.ts`

**To Extract:**
- `getDifficultyColor(difficulty: string, colors: any)` - Pure function
- `getCategoryIcon(category: string)` - Pure function
- `generateTemplateDownloadHTML(template: any)` - Pure function
- `generateSampleResumeData()` - Pure function

**Verification:**
- Same calculations/outputs
- No React hooks in helpers
- Functions are testable

---

### Step 4: Extract Custom Hooks ✅
**File:** `apps/web/src/components/templates/hooks/useTemplateFilters.ts`

**To Extract:**
- Filter state management
- Search debouncing logic
- Filter application logic
- Returns: `filteredTemplates`, filter states, setters

**File:** `apps/web/src/components/templates/hooks/useTemplatePagination.ts`

**To Extract:**
- Pagination state
- Current page calculation
- Returns: `currentTemplates`, `totalPages`, pagination handlers

**File:** `apps/web/src/components/templates/hooks/useTemplateActions.ts`

**To Extract:**
- Template action handlers (preview, use, download, share)
- Favorite management
- Returns: all action handlers

**Verification:**
- State updates work correctly
- No regressions in functionality
- Hooks are properly memoized

---

### Step 5: Extract Sub-Components (One at a Time) ✅

#### 5.1: TemplateCard (Grid View)
**File:** `apps/web/src/components/templates/components/TemplateCard.tsx`
**Lines:** 1094-1271

**Props:**
- `template`
- `isAdded`
- `viewMode: 'grid' | 'list'`
- `isFavorite`
- `addedTemplateId`
- `onFavorite`
- `onPreview`
- `onUse`
- `onRemove` (optional)
- `colors`

**Verification:**
- Component renders correctly
- Styling matches original
- All interactions work

#### 5.2: TemplateCard (List View)
**File:** `apps/web/src/components/templates/components/TemplateCardList.tsx`
**Lines:** 1509-1728

**Props:**
- Same as TemplateCard but with list-specific styling

#### 5.3: TemplatePreview (Mini)
**File:** `apps/web/src/components/templates/components/TemplatePreview.tsx`
**Lines:** 926-981, 1112-1168, etc.

**Props:**
- `template`
- `size?: 'small' | 'medium' | 'large'`

**Verification:**
- Preview renders correctly for all layouts
- Color schemes apply correctly

#### 5.4: TemplateStats
**File:** `apps/web/src/components/templates/components/TemplateStats.tsx`
**Lines:** 849-897

**Props:**
- `templates`
- `colors`

**Verification:**
- Stats display correctly
- Counts update properly

#### 5.5: CategoryTabs
**File:** `apps/web/src/components/templates/components/CategoryTabs.tsx`
**Lines:** 702-750

**Props:**
- `categories`
- `selectedCategory`
- `onSelectCategory`
- `getCategoryIcon`
- `colors`

#### 5.6: SearchAndFilters
**File:** `apps/web/src/components/templates/components/SearchAndFilters.tsx`
**Lines:** 569-680

**Props:**
- `searchQuery`
- `setSearchQuery`
- `sortBy`
- `setSortBy`
- `viewMode`
- `setViewMode`
- `showFilters`
- `setShowFilters`
- `colors`

#### 5.7: AdvancedFilters
**File:** `apps/web/src/components/templates/components/AdvancedFilters.tsx`
**Lines:** 752-841

**Props:**
- All filter states
- Filter setters
- `colors`

---

### Step 6: Extract Modals and Overlays ✅

#### 6.1: TemplatePreviewModal
**File:** `apps/web/src/components/templates/components/TemplatePreviewModal.tsx`
**Lines:** 1794-1928

**Props:**
- `isOpen`
- `template`
- `onClose`
- `onUse`
- `onDownload`
- `onShare`
- `onFavorite`
- `isFavorite`
- `onUpload`
- `addedTemplateId`
- `generateSampleResumePreview`
- `colors`

**Verification:**
- Modal opens/closes correctly
- All actions work
- Preview renders correctly

#### 6.2: UploadTemplateModal
**File:** `apps/web/src/components/templates/components/UploadTemplateModal.tsx`
**Lines:** 1932-2063

**Props:**
- `isOpen`
- `template`
- `onClose`
- `onFileSelect`
- `uploadedFile`
- `generateSampleResumePreview`
- `colors`

**Verification:**
- Modal opens/closes correctly
- File upload works
- Preview renders

---

### Step 7: Extract Toolbar/Header Components ✅

#### 7.1: TemplateHeader
**File:** `apps/web/src/components/templates/components/TemplateHeader.tsx`
**Lines:** 568-841 (complete header section)

**Props:**
- All search/filter states
- All handlers
- `colors`

**Verification:**
- Toolbar actions work
- Styling matches original

---

### Step 8: Extract Form Sections ✅

#### 8.1: PaginationControls
**File:** `apps/web/src/components/templates/components/PaginationControls.tsx`
**Lines:** 1734-1766

**Props:**
- `currentPage`
- `totalPages`
- `onPageChange`
- `colors`

**Verification:**
- Pagination works correctly
- Navigation buttons function properly

#### 8.2: EmptyState
**File:** `apps/web/src/components/templates/components/EmptyState.tsx`
**Lines:** 1768-1790

**Props:**
- `onClearFilters`
- `colors`

**Verification:**
- Displays when no results
- Clear filters button works

---

## Phase 3: Post-refactoring Verification

### TypeScript
- [ ] No compilation errors
- [ ] Strict mode passes
- [ ] All types properly defined

### Linter
- [ ] Address all warnings (inline styles can wait)
- [ ] No unused imports
- [ ] Consistent naming conventions

### Runtime
- [ ] Test all features manually using checklist above
- [ ] No console errors
- [ ] No broken imports

### UI Comparison
- [ ] Side-by-side visual check
- [ ] Styling matches exactly
- [ ] Animations/transitions work
- [ ] Responsive behavior unchanged
- [ ] Loading states unchanged
- [ ] Error states unchanged

### Performance
- [ ] No noticeable degradation
- [ ] Smooth scrolling
- [ ] Fast filter/search responses

### Code Review
- [ ] Extracted files are clean
- [ ] Components are testable
- [ ] Props are minimal and clear
- [ ] Complex logic is documented

---

## Rollback Plan

If something breaks:
1. Revert the last change using git
2. Identify the issue in the extracted code
3. Fix before continuing
4. Test before moving on

---

## File Structure After Refactoring

```
apps/web/src/components/templates/
├── Templates.tsx (main component, ~200-300 lines)
├── types.ts
├── constants.ts
├── utils/
│   └── templateHelpers.ts
├── hooks/
│   ├── useTemplateFilters.ts
│   ├── useTemplatePagination.ts
│   └── useTemplateActions.ts
└── components/
    ├── TemplateCard.tsx
    ├── TemplateCardList.tsx
    ├── TemplatePreview.tsx
    ├── TemplateStats.tsx
    ├── CategoryTabs.tsx
    ├── SearchAndFilters.tsx
    ├── AdvancedFilters.tsx
    ├── TemplateHeader.tsx
    ├── TemplatePreviewModal.tsx
    ├── UploadTemplateModal.tsx
    ├── PaginationControls.tsx
    └── EmptyState.tsx
```

