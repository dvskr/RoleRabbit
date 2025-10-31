# Unused Code Analysis - File-by-File Check

**Date:** 2024-01-XX  
**Status:** In Progress

## 🔍 Analysis by File

### 1. `apps/web/src/components/JobTracker.tsx`

#### ✅ All Imports Used
- ✅ `React, useState` - Used
- ✅ `Plus, Briefcase` - Used
- ✅ `EmptyState` - Used
- ✅ All job components - Used
- ✅ `useJobsApi` - Used
- ✅ `Job, SavedView` types - Used
- ✅ `logger` - Used (4 times)
- ✅ `useTheme` - Used

#### ⚠️ Potentially Unused Variables from useJobsApi
- ⚠️ `allJobs` - Declared but **NOT USED** (line 16)
- ⚠️ `selectAllJobs` - Declared but **NOT USED** (line 35)
- ⚠️ `loadJobs` - Declared but **NOT USED** (line 38)

**Action:** Remove unused destructured variables from useJobsApi hook.

---

### 2. `apps/web/src/app/dashboard/page.tsx`

#### ⚠️ Unused Icon Imports
Checking which lucide-react icons are actually used...

#### ⚠️ Unused Hook Destructures
- ⚠️ `resumeDataHook` - Destructured but usage needs verification
- ⚠️ `modalsHook` - Destructured but usage needs verification
- ⚠️ `aiHook` - Destructured but usage needs verification

---

## 📋 Next Steps

1. Check icon usage in dashboard/page.tsx
2. Check hook usage in dashboard/page.tsx
3. Remove unused variables from JobTracker.tsx
4. Check other major files for unused code

---

**Status:** Analysis in progress...

