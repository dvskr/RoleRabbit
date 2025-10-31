# Comprehensive Code Cleanup Plan - ALL FILES

**Status:** Not Started  
**Files to Check:** ~373 files (246 .tsx, 127 .ts)

## ✅ Completed (Phase 1)
- **Files Deleted:** 29 unused/duplicate files
- **Files Checked:** 3 files (JobTracker.tsx, dashboard/page.tsx, Profile.tsx)
- **Unused Code Removed:** 15 items

---

## 📋 Remaining Files to Check

### Components Directory (~200 files)
- [ ] All files in `components/common/` (59 files)
- [ ] All files in `components/email/` (27 files)
- [ ] All files in `components/jobs/` (23 files)
- [ ] All files in `components/profile/` (17 files)
- [ ] All files in `components/portfolio-generator/` (17 files)
- [ ] All files in `components/coverletter/` (14 files)
- [ ] All files in `components/discussion/` (6 files)
- [ ] All files in `components/sections/` (7 files)
- [ ] All files in `components/features/` (6 files)
- [ ] All files in `components/userProfile/` (7 files)
- [ ] All files in `components/modals/` (8 files)
- [ ] All files in `components/layout/` (4 files)
- [ ] All files in `components/dashboard/` (~15 files)
- [ ] Individual component files (~10 files)

### Hooks Directory (~27 files)
- [ ] All hooks in `hooks/` directory
- [ ] All hooks in `utils/hooks/` directory

### Utils Directory (~54 files)
- [ ] All utility files in `utils/`
- [ ] All files in `utils/constants/`
- [ ] All files in `utils/validation/`
- [ ] All files in `utils/api/`

### Services Directory (~7 files)
- [ ] All service files

### Types Directory (~9 files)
- [ ] All type definition files

### App Directory (~13 files)
- [ ] All page files in `app/`

---

## 🔍 What to Check in Each File

1. **Unused Imports**
   - Icons from lucide-react
   - Types that aren't used
   - Components that aren't used
   - Utilities that aren't used

2. **Unused Variables**
   - Destructured variables not used
   - State variables not used
   - Function parameters not used
   - Constants not referenced

3. **Unused Functions**
   - Helper functions never called
   - Event handlers never attached
   - Utility functions never imported

4. **Dead Code**
   - Commented out code blocks
   - Unreachable code paths
   - Empty functions with no implementation

5. **Accessibility Issues**
   - Buttons without aria-label
   - Forms without labels
   - Missing title attributes

---

## 📊 Progress Tracking

### Current Status:
- ✅ Files Deleted: 29
- ✅ Files Checked: 3 / 373 (0.8%)
- ✅ Unused Code Found: 15 items

### Target:
- 🎯 Check ALL 373 files
- 🎯 Remove all unused imports
- 🎯 Remove all unused variables
- 🎯 Fix all accessibility issues

---

## 🚀 Next Steps

1. Start with component files (highest impact)
2. Check hooks (shared code)
3. Check utilities (reused code)
4. Check services (API layer)
5. Check types (type safety)

---

**Would you like me to:**
1. **Start systematic checking now** - Go through all files methodically
2. **Check specific directories first** - Focus on high-impact areas
3. **Create automated checks** - Script to find unused imports

**Which approach would you prefer?**

