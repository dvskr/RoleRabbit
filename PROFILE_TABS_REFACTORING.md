# 🎯 Simplified Profile Tabs Refactoring Checklist

A practical, focused checklist for refactoring the Profile Tabs feature.

---

## 📋 PHASE 1: Remove 2FA from Codebase ⏱️ 10 minutes

### Step 1: Frontend Removal
- [ ] Remove 2FA section from [object Object] (lines 76-127)
- [ ] Remove 2FA props from [object Object] interface
- [ ] Remove 2FA state from [object Object] (lines 30-42)
- [ ] Remove 2FA handlers from [object Object] (lines 114-180)
- [ ] Remove [object Object] component usage (lines 205-215)
- [ ] Update [object Object] to not pass 2FA props

### Step 2: Delete 2FA Files
- [ ] Delete [object Object]
- [ ] Delete [object Object]
- [ ] Remove 2FA functions from [object Object] (lines 18-127)
- [ ] Remove 2FA endpoints from [object Object]

### Step 3: Update Exports
- [ ] Update [object Object] to remove TwoFASetupModal export
- [ ] Update [object Object] to remove use2FAModal export

### Step 4: Test
- [ ] Run [object Object] and verify SecurityTab loads
- [ ] Verify no console errors
- [ ] Verify Password section still works

---

## 📋 PHASE 2: Clean Up Junk Code ⏱️ 4 hours

### 2.1 Remove Duplicate Normalization (ProfessionalTab)
- [ ] Delete [object Object] function (lines 25-54)
- [ ] Delete [object Object] function (lines 56-102)
- [ ] Delete [object Object] function (lines 104-180)
- [ ] Delete [object Object] function (lines 304-395)
- [ ] Import from dataSanitizer: [object Object]
- [ ] Replace [object Object] with [object Object]
- [ ] Replace [object Object] with [object Object]
- [ ] Test work experience CRUD operations
- [ ] Test project CRUD operations
- [ ] **Result:** Remove 155 lines

### 2.2 Fix SecurityTab UX Issues
- [x] ~~Remove window.prompt for password~~ (Already handled - 2FA removed)
- [x] ~~Remove window.prompt for 2FA token~~ (Already handled - 2FA removed)
- [x] ~~Remove alert() calls~~ (Already handled - 2FA removed)

### 2.3 Fix PreferencesTab Issues
- [ ] Remove [object Object] from email update (line 190)
- [ ] Import useRouter: [object Object]
- [ ] Add: [object Object]
- [ ] Replace reload with: [object Object] or refetch user context
- [ ] Test email update flow

### 2.4 Move Utilities
- [ ] Create [object Object]
- [ ] Move [object Object] function from ProfileTab to urlHelpers.ts
- [ ] Export from utils: [object Object]
- [ ] Update ProfileTab import: [object Object]
- [ ] Test social links still work

---

## 📋 PHASE 3: Extract Reusable Components ⏱️ 8 hours

### 3.1 Create TagSection Component (2 hours)
**File:** `apps/web/src/components/profile/components/TagSection.tsx`

- [ ] Create new file TagSection.tsx
- [ ] Props: [object Object]
- [ ] Copy badge rendering logic from SkillsTab
- [ ] Copy input + button from SkillsTab
- [ ] Copy empty state from SkillsTab
- [ ] Add proper TypeScript types

**Usage in SkillsTab:**
- [ ] Replace Skills section (lines 213-366) with [object Object]
- [ ] Replace Languages section (lines 649-802) with [object Object]
- [ ] Test adding/removing skills
- [ ] Test adding/removing languages
- [ ] **Result:** Remove ~250 lines from SkillsTab

### 3.2 Create SocialLinkField Component (1 hour)
**File:** `apps/web/src/components/profile/components/SocialLinkField.tsx`

- [ ] Create new file SocialLinkField.tsx
- [ ] Props: [object Object]
- [ ] Copy edit mode logic (FormField)
- [ ] Copy view mode logic (clickable link)
- [ ] Copy empty state logic
- [ ] Add proper TypeScript types

**Usage in ProfileTab:**
- [ ] Replace LinkedIn field (lines 186-232) with [object Object]
- [ ] Replace GitHub field (lines 233-278) with [object Object]
- [ ] Replace Portfolio field (lines 280-326) with [object Object]
- [ ] Replace Website field (lines 327-373) with [object Object]
- [ ] Test social links in edit and view mode
- [ ] **Result:** Remove ~75 lines from ProfileTab

### 3.3 Create TechnologiesInput Component (2 hours)
**File:** `apps/web/src/components/profile/components/TechnologiesInput.tsx`

- [ ] Create new file TechnologiesInput.tsx
- [ ] Props: [object Object]
- [ ] Handle comma-separated input
- [ ] Show badges preview while typing
- [ ] Handle blur to parse final value
- [ ] Add proper TypeScript types

**Usage in ProfessionalTab:**
- [ ] Replace work experience technologies input (lines 740-759)
- [ ] Replace project technologies input (lines 1060-1070)
- [ ] Test technologies input in work experience
- [ ] Test technologies input in projects
- [ ] **Result:** Remove ~40 lines, better UX

### 3.4 Create ProfileCard Wrapper (1 hour)
**File:** `apps/web/src/components/profile/components/ProfileCard.tsx`

- [ ] Create new file ProfileCard.tsx
- [ ] Props: [object Object]
- [ ] Standard card styling with theme colors
- [ ] Proper spacing and borders
- [ ] Add proper TypeScript types

**Usage:**
- [ ] Wrap sections in SkillsTab (Skills, Certifications, Languages, Education)
- [ ] Wrap sections in ProfileTab (Basic Information)
- [ ] Test all sections still render correctly
- [ ] **Result:** Consistent card styling

### 3.5 Create EmptyState Component (1 hour)
**File:** `apps/web/src/components/profile/components/EmptyState.tsx`

- [ ] Create new file EmptyState.tsx
- [ ] Props: [object Object]
- [ ] Standard empty state layout
- [ ] Optional action button
- [ ] Add proper TypeScript types

**Usage:**
- [ ] Replace empty state in ProfessionalTab (work experience)
- [ ] Replace empty state in ProfessionalTab (projects)
- [ ] Replace empty state in SkillsTab (all sections)
- [ ] Test empty states
- [ ] **Result:** Consistent empty states

### 3.6 Create EditableCardActions Component (1 hour)
**File:** `apps/web/src/components/profile/components/EditableCardActions.tsx`

- [ ] Create new file EditableCardActions.tsx
- [ ] Props: [object Object]
- [ ] Edit button with icon
- [ ] Delete button with icon
- [ ] Hover effects
- [ ] Add proper TypeScript types

**Usage:**
- [ ] Use in WorkExperienceCard view mode
- [ ] Use in ProjectCard view mode
- [ ] Use in CertificationCard view mode
- [ ] Use in EducationCard view mode
- [ ] Test edit/delete actions
- [ ] **Result:** Consistent action buttons

---

## 📋 PHASE 4: Add Basic Validation ⏱️ 3 hours

### 4.1 Create Validation Utils
**File:** `apps/web/src/utils/validation.ts`

- [ ] Create new file validation.ts
- [ ] Add [object Object] function
- [ ] Add [object Object] function
- [ ] Add [object Object] function (accepts MM/YYYY, YYYY-MM)
- [ ] Add [object Object] function
- [ ] Export all validators

### 4.2 Add URL Validation
- [ ] Add validation to LinkedIn field (ProfileTab)
- [ ] Add validation to GitHub field (ProfileTab)
- [ ] Add validation to Portfolio field (ProfileTab)
- [ ] Add validation to Website field (ProfileTab)
- [ ] Add validation to Certification URL (SkillsTab)
- [ ] Add validation to Project URL (ProfessionalTab)
- [ ] Add validation to Project GitHub URL (ProfessionalTab)
- [ ] Show error message on blur if invalid
- [ ] Prevent save if URLs are invalid

### 4.3 Add Required Field Validation
- [ ] Validate firstName in ProfileTab (required)
- [ ] Validate lastName in ProfileTab (required)
- [ ] Show error inline if empty on save attempt
- [ ] Focus first invalid field

### 4.4 Add Date Validation
- [ ] Validate startDate format in work experience
- [ ] Validate endDate format in work experience
- [ ] Validate startDate format in education
- [ ] Validate endDate format in education
- [ ] Show error if invalid format
- [ ] Show warning if startDate > endDate

---

## 📋 PHASE 5: Replace Inline Styles ⏱️ 6 hours

### 5.1 Setup CSS Variables
**File:** `apps/web/src/styles/globals.css`

- [ ] Add CSS variables for all theme colors [object Object]

### 5.2 Configure Tailwind
**File:** `tailwind.config.ts`

- [ ] Add custom colors using CSS variables [object Object]

### 5.3 Replace Inline Styles - ProfileTab
- [ ] Replace all [object Object] with Tailwind classes
- [ ] Replace all [object Object]/[object Object] with [object Object] classes
- [ ] Remove theme colors props where possible
- [ ] Test all hover effects work
- [ ] Test in both light and dark themes

### 5.4 Replace Inline Styles - ProfessionalTab
- [ ] Replace inline styles with Tailwind classes
- [ ] Replace hover handlers with hover: classes
- [ ] Test all interactions work

### 5.5 Replace Inline Styles - SkillsTab
- [ ] Replace inline styles with Tailwind classes
- [ ] Replace hover handlers with hover: classes
- [ ] Test all interactions work

### 5.6 Replace Inline Styles - PreferencesTab
- [ ] Replace inline styles with Tailwind classes
- [ ] Replace hover handlers with hover: classes
- [ ] Test all interactions work

---

## 📋 PHASE 6: Type Safety ⏱️ 3 hours

### 6.1 Fix TypeScript Issues
- [ ] Fix [object Object] type in SkillsTab line 132: [object Object]
- [ ] Add proper types for all event handlers
- [ ] Ensure all function parameters have types
- [ ] Ensure all function returns have types
- [ ] Run [object Object] and fix errors

### 6.2 Add Shared Types
**File:** `apps/web/src/types/forms.ts`

- [ ] Create forms.ts
- [ ] Add [object Object] type
- [ ] Add [object Object] type
- [ ] Add [object Object] type
- [ ] Export all types

### 6.3 Add Validation Types
**File:** `apps/web/src/types/validation.ts`

- [ ] Create validation.ts
- [ ] Add [object Object] type
- [ ] Add [object Object] type
- [ ] Export all types

---

## 📋 PHASE 7: Testing ⏱️ 4 hours

### 7.1 Manual Testing Checklist
- [ ] Test ProfileTab: Add/edit/save all fields
- [ ] Test ProfessionalTab: Add/edit/delete work experience
- [ ] Test ProfessionalTab: Add/edit/delete projects
- [ ] Test SkillsTab: Add/remove skills
- [ ] Test SkillsTab: Add/edit/delete certifications
- [ ] Test SkillsTab: Add/remove languages
- [ ] Test SkillsTab: Add/edit/delete education
- [ ] Test PreferencesTab: Change password
- [ ] Test PreferencesTab: Update email (without page reload)
- [ ] Test PreferencesTab: Toggle notifications
- [ ] Test all validation (URLs, required fields, dates)
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile viewport
- [ ] Test light theme
- [ ] Test dark theme

### 7.2 Component Tests (Optional but recommended)
- [ ] Write test for TagSection component
- [ ] Write test for SocialLinkField component
- [ ] Write test for TechnologiesInput component
- [ ] Write test for validation utils
- [ ] Run [object Object] to verify all pass

---

## 📊 PROGRESS TRACKER

### Time Estimate by Phase:
| Phase | Description | Time | Priority |
|-------|-------------|------|----------|
| 1 | Remove 2FA | 10 min | 🔴 Critical |
| 2 | Clean Up Junk Code | 4 hours | 🔴 Critical |
| 3 | Extract Components | 8 hours | 🟡 High |
| 4 | Add Validation | 3 hours | 🟡 High |
| 5 | Replace Inline Styles | 6 hours | 🟢 Medium |
| 6 | Type Safety | 3 hours | 🟢 Medium |
| 7 | Testing | 4 hours | 🟡 High |
| **TOTAL** | | **~28 hours** | **3-4 days** |

### Expected Results:

**Before:**
- 3,340 lines across 5 tabs
- 480 lines of duplicate code
- Poor UX (window.prompt, page reload)
- Inconsistent styling
- TypeScript issues

**After:**
- ~2,400 lines (28% reduction)
- 0 duplicate code
- Good UX (proper modals, smooth updates)
- Consistent styling with Tailwind
- Type-safe code

---

## 🎯 QUICK START GUIDE

### Week 1: Critical Fixes (Day 1-2)
- ✅ Complete Phase 1 (Remove 2FA)
- ✅ Complete Phase 2 (Clean up junk code)

### Week 1: Component Extraction (Day 3-5)
- ✅ Complete Phase 3 (Extract components)

### Week 2: Polish (Day 1-3)
- ✅ Complete Phase 4 (Validation)
- ✅ Complete Phase 5 (Styling)
- ✅ Complete Phase 6 (Types)

### Week 2: Final Testing (Day 4-5)
- ✅ Complete Phase 7 (Testing)

---

## ✅ FINAL CHECKLIST

**Before marking complete:**

- [ ] All tabs load without errors
- [ ] All CRUD operations work (add, edit, delete)
- [ ] All validation works correctly
- [ ] No console errors in browser
- [ ] No TypeScript errors ([object Object])
- [ ] All tests pass ([object Object])
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on mobile viewport
- [ ] Works in light and dark themes
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] QA approved
