# Remaining Files to Refactor - COMPLETE LIST

Based on comprehensive analysis of the codebase, here are ALL the remaining large files that need refactoring:

---

## 🔴 CRITICAL PRIORITY (Files > 1000 lines) - Start Here!

### 1. **Discussion.tsx** (2,277 lines) ⭐ LARGEST FILE
**Location:** `apps/web/src/components/Discussion.tsx`
**Status:** ⚠️ CRITICAL - Needs immediate refactoring
**Refactoring Strategy:**
- Extract post rendering into `PostCard.tsx` component
- Extract comment rendering into `CommentSection.tsx` component
- Extract thread management into hooks
- Extract voting/upvoting logic into utilities
- Extract modals (create post, edit post) into separate components
- Extract filters and search into `DiscussionFilters.tsx`
- Extract sidebar panels into components

**Estimated Reduction:** 2,277 lines → ~800 lines (65% reduction)

---

### 2. **Templates.tsx** (2,067 lines) ⭐ SECOND LARGEST
**Location:** `apps/web/src/components/Templates.tsx`
**Status:** ⚠️ CRITICAL - Needs immediate refactoring
**Refactoring Strategy:**
- Extract template card rendering into `TemplateCard.tsx`
- Extract template preview into `TemplatePreview.tsx` component
- Extract template filtering/search into hooks
- Extract template categories into components
- Extract customization panel into `TemplateCustomizer.tsx`
- Extract upload/import logic into utilities

**Estimated Reduction:** 2,067 lines → ~700 lines (66% reduction)

---

### 3. **FileCard.tsx** (1,917 lines) ⭐ THIRD LARGEST
**Location:** `apps/web/src/components/cloudStorage/FileCard.tsx`
**Status:** ⚠️ CRITICAL - Needs immediate refactoring
**Refactoring Strategy:**
- Extract file preview into `FilePreview.tsx` component
- Extract file actions menu into `FileActionsMenu.tsx`
- Extract sharing controls into `FileSharingControls.tsx`
- Extract file metadata display into `FileMetadata.tsx`
- Extract version history into `FileVersionHistory.tsx`
- Extract file operations (delete, rename, etc.) into hooks

**Estimated Reduction:** 1,917 lines → ~600 lines (69% reduction)

---

### 4. **PortfolioTab.tsx** (1,740 lines)
**Location:** `apps/web/src/components/profile/tabs/PortfolioTab.tsx`
**Status:** ⚠️ CRITICAL - Needs refactoring
**Refactoring Strategy:**
- Extract portfolio sections into separate components
- Extract achievement rendering into `AchievementCard.tsx`
- Extract project cards into `ProjectCard.tsx`
- Extract form sections into components
- Extract validation logic into utilities
- Extract save/load logic into hooks

**Estimated Reduction:** 1,740 lines → ~600 lines (65% reduction)

---

## 🟠 HIGH PRIORITY (Files 700-1000 lines)

### 5. **AIAgents.tsx** (~1,051 lines)
**Location:** `apps/web/src/components/AIAgents.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract agent cards into `AgentCard.tsx` component
- Extract agent configuration into `AgentConfigPanel.tsx`
- Extract agent creation/edit modals into components
- Extract agent logic into hooks
- Extract agent utilities into separate file

**Estimated Reduction:** ~1,051 lines → ~500 lines (52% reduction)

---

### 10. **ResumeEditor.tsx** (1,089 lines)
**Location:** `apps/web/src/components/features/ResumeEditor.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract section rendering into separate components (already partially done)
- Extract formatting controls into `FormatControls.tsx` component
- Extract template selection logic into hooks
- Extract preview logic (ResumePreview already extracted)
- Extract toolbar into `ResumeToolbar.tsx` component
- Extract sidebar panels into separate components
- Extract section management logic into hooks

**Estimated Reduction:** 1,089 lines → ~600 lines (45% reduction)

---

### 2. **EmailComposerAI.tsx** (~727 lines)
**Location:** `apps/web/src/components/email/components/EmailComposerAI.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract email composition logic into custom hooks
- Extract AI generation logic into separate utilities
- Extract attachment handling into component
- Extract email validation into utilities
- Break down into smaller sub-components

**Estimated Reduction:** ~727 lines → ~400 lines (45% reduction)

---

### 11. **DashboardFigma.tsx** (~996 lines)
**Location:** `apps/web/src/components/DashboardFigma.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract dashboard widgets into components
- Extract layout customization into `LayoutCustomizer.tsx`
- Extract widget configuration into components
- Extract dashboard settings into hooks

**Estimated Reduction:** ~996 lines → ~500 lines (50% reduction)

---

### 12. **CloudStorage.tsx** (~873 lines)
**Location:** `apps/web/src/components/CloudStorage.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract file list rendering into component
- Extract folder management into components
- Extract credential management into component (already partially extracted)
- Extract upload logic into hooks
- Extract file operations into utilities
- Extract sharing logic into component


---

### 13. **AIPanel.tsx** (~879 lines)
**Location:** `apps/web/src/components/features/AIPanel.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract AI mode tabs into components
- Extract conversation UI into component
- Extract analysis display into component
- Extract recommendations display into component
- Extract settings panel into component
- Extract AI utilities into separate file

**Estimated Reduction:** ~879 lines → ~450 lines (49% reduction)

---

### 14. **SecurityTab.tsx** (~818 lines)
**Location:** `apps/web/src/components/profile/tabs/SecurityTab.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract 2FA setup into `TwoFactorSetup.tsx` component
- Extract password change into `PasswordChange.tsx` component
- Extract session management into `SessionManagement.tsx`
- Extract security settings into hooks

**Estimated Reduction:** ~818 lines → ~400 lines (51% reduction)

---

### 15. **BillingTab.tsx** (~800 lines)
**Location:** `apps/web/src/components/profile/tabs/BillingTab.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract subscription card into `SubscriptionCard.tsx`
- Extract payment method form into `PaymentMethodForm.tsx`
- Extract billing history into `BillingHistory.tsx`
- Extract upgrade/cancel modals into components

**Estimated Reduction:** ~800 lines → ~400 lines (50% reduction)

---

### 16. **AIPortfolioBuilder.tsx** (~786 lines)
**Location:** `apps/web/src/components/portfolio-generator/AIPortfolioBuilder.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract portfolio sections into components
- Extract AI generation UI into component
- Extract preview into component
- Extract configuration into hooks

**Estimated Reduction:** ~786 lines → ~400 lines (49% reduction)

---

### 17. **useCloudStorage.ts** (~705 lines) - HOOK FILE
**Location:** `apps/web/src/hooks/useCloudStorage.ts`
**Status:** ⚠️ Needs refactoring
**Note:** This is a hook file, not a component
**Refactoring Strategy:**
- Split into smaller hooks: `useFileOperations`, `useFolderManagement`, `useCredentialManagement`
- Extract utility functions into separate files
- Extract file sharing logic into `useFileSharing` hook

**Estimated Reduction:** ~705 lines → ~350 lines (50% reduction)

---

### 18. **EmailComposerAI.tsx** (~727 lines)
**Location:** `apps/web/src/components/email/components/EmailComposerAI.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract email composition logic into custom hooks
- Extract AI generation logic into separate utilities
- Extract attachment handling into component
- Extract email validation into utilities
- Break down into smaller sub-components

**Estimated Reduction:** ~727 lines → ~400 lines (45% reduction)

---

### 19. **CredentialManager.tsx** (~694 lines)
**Location:** `apps/web/src/components/cloudStorage/CredentialManager.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract credential cards into `CredentialCard.tsx`
- Extract credential form into `CredentialForm.tsx`
- Extract QR code generation into utilities
- Extract validation logic into utilities

**Estimated Reduction:** ~694 lines → ~350 lines (50% reduction)

---

### 20. **JobTracker.tsx** (~537 lines)
**Location:** `apps/web/src/components/JobTracker.tsx`
**Status:** ✅ Already well-structured (uses extracted components)
**Note:** This file is already using extracted components (EditableJobTable, JobCard, etc.)
**Refactoring Strategy:**
- Minimal refactoring needed
- Could extract view mode switching logic

**Estimated Reduction:** ~537 lines → ~450 lines (16% reduction)

---

### 6. **Profile.tsx** (374 lines)
**Location:** `apps/web/src/components/Profile.tsx`
**Status:** ✅ Already reasonable size
**Note:** This file is already well-structured and doesn't need major refactoring
**Minor Improvements:**
- Could extract tabs into separate components for better organization

**Estimated Reduction:** 374 lines → ~350 lines (6% reduction, optional)

---

## 🟡 MEDIUM PRIORITY (Moderate Size 300-500 lines)

### 7. **CoverLetterGenerator.tsx** (~469 lines)
**Location:** `apps/web/src/components/CoverLetterGenerator.tsx`
**Status:** ⚠️ Needs refactoring
**Refactoring Strategy:**
- Extract tab management logic
- Extract save/load logic into hooks
- Extract export logic into utilities

**Estimated Reduction:** ~469 lines → ~350 lines (25% reduction)

---

### 8. **JobDetailView.tsx** (261 lines)
**Location:** `apps/web/src/components/jobs/JobDetailView.tsx`
**Status:** ✅ Already reasonable size
**Note:** This file uses extracted components (InterviewTracker, SalaryTracker, etc.)
**Minor Improvements:**
- Could further extract tab management logic

**Estimated Reduction:** 261 lines → ~220 lines (16% reduction, optional)

---

## ✅ ALREADY REFACTORED

### ✅ **dashboard/page.tsx**
- **Original:** 1,981 lines
- **Current:** 1,056 lines
- **Reduction:** 47% (925 lines removed)
- **Status:** ✅ Completed refactoring

### ✅ **EditableJobTable.tsx**
- **Original:** 2,232 lines
- **Current:** ~752 lines
- **Reduction:** 66% (1,480 lines removed)
- **Status:** ✅ Completed refactoring

---

## 📊 Summary

| File | Current Lines | Target Lines | Priority | Status |
|------|---------------|--------------|----------|--------|
| **Discussion.tsx** | **2,277** | ~800 | 🔴 Critical | ⭐ START HERE |
| **Templates.tsx** | **2,067** | ~700 | 🔴 Critical | ⭐ START HERE |
| **FileCard.tsx** | **1,917** | ~600 | 🔴 Critical | ⭐ START HERE |
| PortfolioTab.tsx | 1,740 | ~600 | 🔴 Critical | High Priority |
| AIAgents.tsx | ~1,051 | ~500 | 🟠 High | Pending |
| ResumeEditor.tsx | 1,089 | ~600 | 🟠 High | Pending |
| DashboardFigma.tsx | ~996 | ~500 | 🟠 High | Pending |
| CloudStorage.tsx | ~873 | ~400 | 🟠 High | Pending |
| AIPanel.tsx | ~879 | ~450 | 🟠 High | Pending |
| SecurityTab.tsx | ~818 | ~400 | 🟠 High | Pending |
| BillingTab.tsx | ~800 | ~400 | 🟠 High | Pending |
| AIPortfolioBuilder.tsx | ~786 | ~400 | 🟠 High | Pending |
| useCloudStorage.ts | ~705 | ~350 | 🟠 High | Pending |
| EmailComposerAI.tsx | ~727 | ~400 | 🟠 High | Pending |
| CredentialManager.tsx | ~694 | ~350 | 🟡 Medium | Pending |
| JobTracker.tsx | ~537 | ~450 | 🟡 Medium | Minor |
| CoverLetterGenerator.tsx | ~469 | ~350 | 🟡 Medium | Pending |
| Profile.tsx | 374 | ~350 | 🟢 Low | Optional |
| JobDetailView.tsx | 261 | ~220 | 🟢 Low | Optional |

**Total Lines to Reduce (Critical + High Priority):** ~18,519 → ~9,200 (~50% reduction potential)

---

## 🎯 Recommended Refactoring Order

### Phase 1: CRITICAL Priority - Files > 1000 lines (Start Here!)
1. **Discussion.tsx** (2,277 lines) ⭐ LARGEST - START HERE
2. **Templates.tsx** (2,067 lines) ⭐ SECOND LARGEST
3. **FileCard.tsx** (1,917 lines) ⭐ THIRD LARGEST
4. **PortfolioTab.tsx** (1,740 lines)

### Phase 2: HIGH Priority - Files 700-1000 lines
5. **AIAgents.tsx** (~1,051 lines)
6. **ResumeEditor.tsx** (1,089 lines)
7. **DashboardFigma.tsx** (~996 lines)
8. **CloudStorage.tsx** (~873 lines)
9. **AIPanel.tsx** (~879 lines)
10. **SecurityTab.tsx** (~818 lines)
11. **BillingTab.tsx** (~800 lines)
12. **AIPortfolioBuilder.tsx** (~786 lines)
13. **useCloudStorage.ts** (~705 lines) - Hook refactoring
14. **EmailComposerAI.tsx** (~727 lines)
15. **CredentialManager.tsx** (~694 lines)

### Phase 3: Medium Priority Files (500-700 lines)
16. **JobTracker.tsx** (~537 lines - minor cleanup)
17. **CoverLetterGenerator.tsx** (~469 lines)

### Phase 4: Optional Cleanup (Smaller files)
18. **Profile.tsx** (374 lines - already good)
19. **JobDetailView.tsx** (261 lines - already good)

---

## 📝 Refactoring Approach (Same as Dashboard)

For each file, follow this pattern:

1. **Extract Types & Constants** - Move types to `types/` folder, constants to `constants/` folder
2. **Extract Helper Functions** - Move utility functions to `utils/` folder
3. **Extract Custom Hooks** - Move stateful logic to `hooks/` folder
4. **Extract Sub-Components** - Break down large render logic into smaller components
5. **Extract Modal/UI Components** - Move modals and UI components to separate files

---

## 🧪 Testing Strategy

After each refactoring:
1. Run automated tests (if available)
2. Manual testing checklist
3. Verify no functionality loss
4. Verify UI/UX unchanged
5. Check for TypeScript errors

