# Detailed Refactoring Plan: ResumeEditor.tsx (1,089 lines)

## 📋 Overview
- **File**: `apps/web/src/components/features/ResumeEditor.tsx`
- **Current Lines**: 1,089
- **Target Structure**: Modular components with clear separation of concerns
- **Goal**: Reduce main file to ~200-300 lines while maintaining all functionality

---

## Phase 1: Pre-refactoring Setup

### Step 1.1: Backup Current File
```bash
# Create backup
cp apps/web/src/components/features/ResumeEditor.tsx apps/web/src/components/features/ResumeEditor.tsx.backup
```

**Verification**: ✅ Backup file exists

### Step 1.2: Map File Structure

**Current File Analysis**:
- **Lines 1-8**: Imports
- **Lines 9-56**: `ResumeEditorProps` interface (47 props)
- **Lines 58-107**: Component function signature and initialization
- **Lines 110-121**: `useEffect` for template application
- **Lines 124-130**: `useMemo` for rendered sections
- **Lines 132-191**: `getFieldIcon` helper function (59 lines - SVG icons)
- **Lines 193-195**: Sidebar width calculations
- **Lines 197-961**: Main JSX return (complex nested structure)
  - Lines 200-961: Left Sidebar
    - Lines 218-268: Collapsed sidebar view
    - Lines 270-959: Expanded sidebar view
      - Lines 272-319: File Name Configuration
      - Lines 321-335: Templates Horizontal Scroller
      - Lines 337-450: Sections List
      - Lines 452-958: Formatting Panel
        - Lines 460-490: Font Family selector
        - Lines 492-578: Font Size selector (3 buttons)
        - Lines 580-607: Line Spacing selector
        - Lines 609-683: Section Spacing selector (3 buttons)
        - Lines 685-759: Page Margins selector (3 buttons)
        - Lines 761-788: Heading Weight selector
        - Lines 790-933: Bullet Style selector (6 buttons)
        - Lines 935-958: Reset to Default button
  - Lines 964-1104: Main Resume Editing Area
    - Lines 990-1006: Name Input
    - Lines 1008-1096: Contact Fields Grid
      - Lines 1010-1038: Standard contact fields loop
      - Lines 1040-1069: Custom fields loop
      - Lines 1071-1095: Add Custom Field button
    - Lines 1098-1101: Rendered Sections display

### Step 1.3: Identify Extraction Candidates

#### A. Types & Interfaces
- ✅ `ResumeEditorProps` interface (47 props) → `types/ResumeEditor.types.ts`

#### B. Constants
- ✅ Font family options (lines 485-489)
- ✅ Font size options (lines 497-577)
- ✅ Line spacing options (lines 603-606)
- ✅ Section spacing options (lines 613-682)
- ✅ Margin options (lines 689-758)
- ✅ Heading style options (lines 784-787)
- ✅ Bullet style options (lines 794-932)
- ✅ Standard contact fields array (line 1010)
- ✅ Icon types mapping
- ✅ Sidebar width/padding constants

#### C. Helper Functions
- ✅ `getFieldIcon` (lines 132-191) → `utils/iconHelpers.ts`

#### D. Custom Hooks
- ⚠️ Could extract: Sidebar dimensions calculation → `hooks/useSidebarDimensions.ts`
- ⚠️ Could extract: Template application logic → `hooks/useTemplateApplication.ts`

#### E. Sub-Components (Priority Order)
1. **High Priority** (Large, Isolated):
   - `FormattingPanel` (lines 452-958) ~506 lines
   - `SectionsList` (lines 337-450) ~113 lines
   - `ContactFieldsGrid` (lines 1008-1096) ~88 lines
   - `CollapsedSidebar` (lines 218-268) ~50 lines
   - `FileNameSection` (lines 272-319) ~47 lines

2. **Medium Priority** (Reusable):
   - `FontFamilySelector` (lines 460-490) ~30 lines
   - `FontSizeSelector` (lines 492-578) ~86 lines
   - `LineSpacingSelector` (lines 580-607) ~27 lines
   - `SectionSpacingSelector` (lines 609-683) ~74 lines
   - `PageMarginsSelector` (lines 685-759) ~74 lines
   - `HeadingWeightSelector` (lines 761-788) ~27 lines
   - `BulletStyleSelector` (lines 790-933) ~143 lines
   - `ResetButton` (lines 935-958) ~23 lines
   - `NameInput` (lines 990-1006) ~16 lines
   - `CustomFieldInput` (lines 1041-1068) ~27 lines
   - `AddCustomFieldButton` (lines 1071-1095) ~24 lines

3. **Low Priority** (Small but can extract):
   - `CollapsedSidebarButton` (repeated 3 times in collapsed view)
   - `SectionItem` (lines 369-446) ~77 lines
   - `MoveSectionButton` (arrow up/down buttons)

### Step 1.4: Create Test Checklist

**Manual UI Tests** (to be performed after each extraction):
- [ ] Sidebar collapses/expands correctly
- [ ] File name input works and AI generate button works
- [ ] Template scroller displays and selects templates
- [ ] Sections list displays all sections
- [ ] Section visibility toggle (eye icon) works
- [ ] Section move up/down buttons work
- [ ] Add section button opens modal
- [ ] All formatting controls work:
  - [ ] Font family dropdown changes font
  - [ ] Font size buttons change size
  - [ ] Line spacing dropdown works
  - [ ] Section spacing buttons work
  - [ ] Page margins buttons work
  - [ ] Heading weight dropdown works
  - [ ] Bullet style buttons work
  - [ ] Reset to default button works
- [ ] Name input in main area works
- [ ] All contact fields (email, phone, location, etc.) can be edited
- [ ] Custom fields can be added, edited, and display correctly
- [ ] Add custom field button opens modal
- [ ] All sections render correctly in main area
- [ ] Responsive behavior maintained (mobile/tablet/desktop)
- [ ] Theme colors apply correctly throughout
- [ ] Hover states work on all interactive elements

---

## Phase 2: Refactoring Steps (Incremental)

### Step 2.1: Extract Types and Interfaces

**File to Create**: `apps/web/src/components/features/ResumeEditor/types/ResumeEditor.types.ts`

**Extraction**:
```typescript
// Move ResumeEditorProps interface here
export interface ResumeEditorProps {
  // ... all 47 props
}
```

**Update Main File**:
- Remove interface definition
- Add import: `import { ResumeEditorProps } from './types/ResumeEditor.types';`

**Verify**:
- ✅ TypeScript compiles without errors
- ✅ No type errors in IDE
- ✅ Component still receives all props correctly

**Files Changed**:
- ✅ Create: `types/ResumeEditor.types.ts`
- ✅ Modify: `ResumeEditor.tsx` (remove interface, add import)

---

### Step 2.2: Extract Constants

**File to Create**: `apps/web/src/components/features/ResumeEditor/constants.ts`

**Constants to Extract**:
1. **Font Families**:
```typescript
export const FONT_FAMILY_OPTIONS = [
  { value: 'arial', label: 'Arial (ATS Recommended)' },
  { value: 'calibri', label: 'Calibri' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'helvetica', label: 'Helvetica' },
];
```

2. **Font Sizes**:
```typescript
export const FONT_SIZE_OPTIONS = [
  { value: 'ats10pt', label: '10pt', badge: 'ATS' },
  { value: 'ats11pt', label: '11pt', badge: 'ATS' },
  { value: 'ats12pt', label: '12pt', badge: 'ATS' },
];
```

3. **Line Spacing**:
```typescript
export const LINE_SPACING_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'loose', label: 'Loose' },
];
```

4. **Section Spacing**:
```typescript
export const SECTION_SPACING_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'medium', label: 'Medium' },
  { value: 'loose', label: 'Loose' },
];
```

5. **Page Margins**:
```typescript
export const MARGIN_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
];
```

6. **Heading Styles**:
```typescript
export const HEADING_STYLE_OPTIONS = [
  { value: 'bold', label: 'Bold' },
  { value: 'semibold', label: 'Semi Bold' },
  { value: 'extrabold', label: 'Extra Bold' },
];
```

7. **Bullet Styles**:
```typescript
export const BULLET_STYLE_OPTIONS = [
  { value: 'disc', symbol: '•' },
  { value: 'circle', symbol: '◦' },
  { value: 'square', symbol: '▪' },
  { value: 'arrow', symbol: '→' },
  { value: 'check', symbol: '✓' },
  { value: 'dash', symbol: '–' },
];
```

8. **Contact Fields**:
```typescript
export const STANDARD_CONTACT_FIELDS = [
  'email',
  'phone', 
  'location',
  'linkedin',
  'github',
  'website',
] as const;
```

9. **Sidebar Dimensions**:
```typescript
export const SIDEBAR_DIMENSIONS = {
  EXPANDED_WIDTH: '288px',
  COLLAPSED_WIDTH: '48px',
  EXPANDED_PADDING: '24px',
  COLLAPSED_PADDING: '8px',
} as const;
```

**Update Main File**:
- Replace hardcoded values with imported constants
- Update all select options to use constant arrays

**Verify**:
- ✅ Same behavior - all dropdowns/buttons show correct options
- ✅ No runtime errors
- ✅ Values update correctly when selected

**Files Changed**:
- ✅ Create: `constants.ts`
- ✅ Modify: `ResumeEditor.tsx` (replace hardcoded values)

---

### Step 2.3: Extract Helper Functions

**File to Create**: `apps/web/src/components/features/ResumeEditor/utils/iconHelpers.ts`

**Functions to Extract**:
1. **`getFieldIcon`** (lines 132-191):
```typescript
export const getFieldIcon = (iconType: string) => {
  // ... entire function body
};
```

**Alternative**: Create icon components or use a mapping object.

**Update Main File**:
- Remove `getFieldIcon` function
- Add import: `import { getFieldIcon } from './utils/iconHelpers';`
- Replace function call with imported version

**Verify**:
- ✅ All icons render correctly (email, phone, location, linkedin, github, website, twitter, portfolio, default)
- ✅ Custom fields display correct icons
- ✅ No console errors

**Files Changed**:
- ✅ Create: `utils/iconHelpers.ts`
- ✅ Modify: `ResumeEditor.tsx` (remove function, add import)

---

### Step 2.4: Extract Custom Hooks (Optional)

**File to Create**: `apps/web/src/components/features/ResumeEditor/hooks/useSidebarDimensions.ts`

**Hook to Extract**:
```typescript
export const useSidebarDimensions = (isCollapsed: boolean) => {
  return useMemo(() => ({
    width: isCollapsed ? SIDEBAR_DIMENSIONS.COLLAPSED_WIDTH : SIDEBAR_DIMENSIONS.EXPANDED_WIDTH,
    padding: isCollapsed ? SIDEBAR_DIMENSIONS.COLLAPSED_PADDING : SIDEBAR_DIMENSIONS.EXPANDED_PADDING,
  }), [isCollapsed]);
};
```

**File to Create**: `apps/web/src/components/features/ResumeEditor/hooks/useTemplateApplication.ts`

**Hook to Extract**:
```typescript
export const useTemplateApplication = (
  selectedTemplateId: string | null | undefined,
  onTemplateApply?: (templateId: string) => void
) => {
  useEffect(() => {
    if (selectedTemplateId && onTemplateApply) {
      onTemplateApply(selectedTemplateId);
    }
  }, [selectedTemplateId, onTemplateApply]);
};
```

**Update Main File**:
- Replace inline calculations with hook calls
- Replace useEffect with hook call

**Verify**:
- ✅ Sidebar dimensions calculate correctly
- ✅ Template application works when selectedTemplateId changes
- ✅ No regressions

**Files Changed**:
- ✅ Create: `hooks/useSidebarDimensions.ts`
- ✅ Create: `hooks/useTemplateApplication.ts`
- ✅ Modify: `ResumeEditor.tsx` (replace logic with hooks)

---

### Step 2.5: Extract Sub-Components (One at a Time)

#### Component 5.1: CollapsedSidebar

**File to Create**: `apps/web/src/components/features/ResumeEditor/components/CollapsedSidebar.tsx`

**Props Interface**:
```typescript
interface CollapsedSidebarProps {
  colors: ThemeColors;
  onToggleSidebar?: () => void;
}
```

**Extract**: Lines 218-268

**Update Main File**:
- Remove collapsed sidebar JSX
- Import and use `<CollapsedSidebar />`

**Verify**:
- ✅ Component renders correctly when sidebar is collapsed
- ✅ All 3 icon buttons display
- ✅ Styling matches original
- ✅ Hover effects work

---

#### Component 5.2: FileNameSection

**File to Create**: `apps/web/src/components/features/ResumeEditor/components/FileNameSection.tsx`

**Props Interface**:
```typescript
interface FileNameSectionProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  onGenerateSmartFileName: () => string;
  colors: ThemeColors;
}
```

**Extract**: Lines 272-319

**Update Main File**:
- Remove file name section JSX
- Import and use `<FileNameSection />`

**Verify**:
- ✅ Input field works
- ✅ AI generate button works and updates filename
- ✅ Styling matches original
- ✅ Focus/blur states work

---

#### Component 5.3: SectionsList

**File to Create**: `apps/web/src/components/features/ResumeEditor/components/SectionsList.tsx`

**Props Interface**:
```typescript
interface SectionsListProps {
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: any[];
  onToggleSection: (section: string) => void;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onShowAddSectionModal: () => void;
  colors: ThemeColors;
}
```

**Extract**: Lines 337-450

**Update Main File**:
- Remove sections list JSX
- Import and use `<SectionsList />`

**Verify**:
- ✅ All sections display correctly
- ✅ Toggle visibility works (eye icon)
- ✅ Move up/down buttons work
- ✅ Add section button opens modal
- ✅ Custom sections show correct names
- ✅ Hover effects work

---

#### Component 5.4: FormattingPanel (Large Component)

**File to Create**: `apps/web/src/components/features/ResumeEditor/components/FormattingPanel.tsx`

**Props Interface**:
```typescript
interface FormattingPanelProps {
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;
  sectionSpacing: string;
  setSectionSpacing: (spacing: string) => void;
  margins: string;
  setMargins: (margins: string) => void;
  headingStyle: string;
  setHeadingStyle: (style: string) => void;
  bulletStyle: string;
  setBulletStyle: (style: string) => void;
  onResetToDefault: () => void;
  colors: ThemeColors;
}
```

**Extract**: Lines 452-958

**Update Main File**:
- Remove entire formatting panel JSX
- Import and use `<FormattingPanel />`

**Verify**:
- ✅ All formatting controls work
- ✅ All selectors/buttons function correctly
- ✅ Reset button works
- ✅ Styling matches original

**Note**: This is a large component (~506 lines). Consider further splitting in future iterations.

---

#### Component 5.5: ContactFieldsGrid

**File to Create**: `apps/web/src/components/features/ResumeEditor/components/ContactFieldsGrid.tsx`

**Props Interface**:
```typescript
interface ContactFieldsGridProps {
  resumeData: any;
  setResumeData: (data: any) => void;
  customFields: Array<{ id: string; name: string; icon?: string; value?: string }>;
  setCustomFields: (fields: Array<...>) => void;
  showAddFieldModal: boolean;
  setShowAddFieldModal: (show: boolean) => void;
  colors: ThemeColors;
  getFieldIcon: (iconType: string) => React.ReactNode;
}
```

**Extract**: Lines 1008-1096

**Update Main File**:
- Remove contact fields grid JSX
- Import and use `<ContactFieldsGrid />`

**Verify**:
- ✅ All standard contact fields render and are editable
- ✅ Custom fields display and are editable
- ✅ Add custom field button opens modal
- ✅ Grid layout responsive
- ✅ Icons display correctly
- ✅ Focus/blur states work

---

#### Component 5.6: NameInput

**File to Create**: `apps/web/src/components/features/ResumeEditor/components/NameInput.tsx`

**Props Interface**:
```typescript
interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
  colors: ThemeColors;
}
```

**Extract**: Lines 990-1006

**Update Main File**:
- Remove name input JSX
- Import and use `<NameInput />`

**Verify**:
- ✅ Input works and updates resumeData.name
- ✅ Styling matches original
- ✅ Focus states work

---

### Step 2.6: Extract Formatting Sub-Components (Further Split)

After extracting `FormattingPanel`, further split it into smaller components:

#### Component 6.1: FontFamilySelector
- Extract dropdown logic

#### Component 6.2: FontSizeSelector
- Extract 3 button grid

#### Component 6.3: LineSpacingSelector
- Extract dropdown logic

#### Component 6.4: SectionSpacingSelector
- Extract 3 button group

#### Component 6.5: PageMarginsSelector
- Extract 3 button group

#### Component 6.6: HeadingWeightSelector
- Extract dropdown logic

#### Component 6.7: BulletStyleSelector
- Extract 6 button grid

#### Component 6.8: ResetButton
- Extract reset button

**Then update FormattingPanel** to use these sub-components.

---

### Step 2.7: Extract Section Item Component

**File to Create**: `apps/web/src/components/features/ResumeEditor/components/SectionItem.tsx`

**Props Interface**:
```typescript
interface SectionItemProps {
  section: string;
  index: number;
  totalSections: number;
  isVisible: boolean;
  displayName: string;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  colors: ThemeColors;
}
```

**Extract**: Individual section item rendering logic from SectionsList (lines 369-446)

**Update SectionsList**:
- Replace inline JSX with `<SectionItem />` component

**Verify**:
- ✅ Section items render correctly
- ✅ All interactions work
- ✅ Styling matches

---

### Step 2.8: Extract Common Button Components (Optional)

Create reusable button components for:
- `GradientButton` - Used for format option buttons
- `IconButton` - Used for collapsed sidebar and section actions

---

## Phase 3: Post-Refactoring Verification

### 3.1: TypeScript Verification
- [ ] Run: `npm run type-check` or `tsc --noEmit`
- [ ] Verify: No type errors
- [ ] Verify: Strict mode passes
- [ ] Verify: All imports resolve correctly

### 3.2: Linter Verification
- [ ] Run: `npm run lint`
- [ ] Address: All warnings (inline styles can wait)
- [ ] Verify: No unused imports
- [ ] Verify: Consistent naming conventions

### 3.3: Runtime Testing
- [ ] **Sidebar**:
  - [ ] Collapses/expands correctly
  - [ ] File name section works
  - [ ] Template scroller works
  - [ ] Sections list works
  - [ ] Formatting panel works
  
- [ ] **Main Area**:
  - [ ] Name input works
  - [ ] Contact fields work
  - [ ] Custom fields work
  - [ ] Sections render correctly

- [ ] **Formatting**:
  - [ ] All dropdowns work
  - [ ] All button groups work
  - [ ] Reset button works

- [ ] **Responsive**:
  - [ ] Mobile layout
  - [ ] Tablet layout
  - [ ] Desktop layout

### 3.4: UI Comparison
- [ ] Side-by-side visual check with backup
- [ ] Colors match
- [ ] Spacing matches
- [ ] Fonts match
- [ ] Animations/transitions work
- [ ] Hover states work
- [ ] Focus states work

### 3.5: Performance Check
- [ ] No noticeable lag
- [ ] No unnecessary re-renders
- [ ] Console: No warnings/errors
- [ ] React DevTools: Component tree is clean

### 3.6: Code Review
- [ ] All extracted files are clean
- [ ] Props are minimal and well-typed
- [ ] Components are testable
- [ ] No circular dependencies
- [ ] Imports are organized

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

1. **One change at a time** - Extract one component/function/constant at a time
2. **Test after each extraction** - Run manual tests before moving on
3. **Preserve exact behavior** - No functional changes
4. **Keep props minimal and clear** - Don't pass entire objects if only one field is needed
5. **Document complex logic** - Add comments where necessary
6. **No premature optimization** - Focus on structure first

---

## Rollback Plan

If something breaks:

1. **Revert the last change**
   ```bash
   git checkout apps/web/src/components/features/ResumeEditor.tsx.backup
   # Or: git restore apps/web/src/components/features/ResumeEditor.tsx
   ```

2. **Identify the issue**
   - Check console for errors
   - Verify imports are correct
   - Check prop passing
   - Verify TypeScript compilation

3. **Fix before continuing**
   - Fix the broken extraction
   - Test thoroughly
   - Verify all functionality

4. **Test before moving on**
   - Run full test checklist
   - Verify UI matches
   - Check for regressions

---

## Expected Final Structure

```
apps/web/src/components/features/ResumeEditor/
├── ResumeEditor.tsx                    (~200-300 lines - main component)
├── ResumeEditor.tsx.backup             (backup)
├── types/
│   └── ResumeEditor.types.ts           (interface definitions)
├── constants.ts                        (all constants)
├── utils/
│   └── iconHelpers.ts                  (icon rendering helpers)
├── hooks/
│   ├── useSidebarDimensions.ts        (sidebar calculations)
│   └── useTemplateApplication.ts      (template effect)
└── components/
    ├── CollapsedSidebar.tsx
    ├── FileNameSection.tsx
    ├── SectionsList.tsx
    ├── SectionItem.tsx
    ├── FormattingPanel.tsx
    ├── FontFamilySelector.tsx
    ├── FontSizeSelector.tsx
    ├── LineSpacingSelector.tsx
    ├── SectionSpacingSelector.tsx
    ├── PageMarginsSelector.tsx
    ├── HeadingWeightSelector.tsx
    ├── BulletStyleSelector.tsx
    ├── ResetButton.tsx
    ├── NameInput.tsx
    ├── ContactFieldsGrid.tsx
    ├── CustomFieldInput.tsx
    └── AddCustomFieldButton.tsx
```

---

## Timeline Estimate

- **Phase 1**: 30 minutes (setup and analysis)
- **Phase 2.1**: 15 minutes (types)
- **Phase 2.2**: 30 minutes (constants)
- **Phase 2.3**: 20 minutes (helpers)
- **Phase 2.4**: 30 minutes (hooks)
- **Phase 2.5**: 3-4 hours (sub-components, one at a time)
- **Phase 2.6**: 1-2 hours (formatting sub-components)
- **Phase 2.7**: 30 minutes (section item)
- **Phase 3**: 1 hour (verification)

**Total**: ~6-8 hours (with testing)

---

## Notes

- Start with low-risk extractions (types, constants, helpers)
- Test thoroughly after each step
- Keep the backup file until refactoring is complete and verified
- Consider creating a `README.md` in the ResumeEditor folder documenting the structure
- Future improvements: Extract formatting selectors into a shared component library if used elsewhere

