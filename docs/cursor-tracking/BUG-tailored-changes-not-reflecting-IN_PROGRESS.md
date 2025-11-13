# Bug: Tailored Changes Not Reflecting in Editor

**Status:** IN_PROGRESS  
**Date:** 2025-11-13  
**Priority:** HIGH  
**Category:** Resume Tailoring

---

## Problem Description

After tailoring a resume, the changes are saved to the working draft in the backend, but the editor doesn't update to show the tailored content.

### Expected Behavior
1. User clicks "Tailor Resume"
2. Tailoring completes successfully
3. Success toast shows score improvement
4. AI Panel opens showing ATS score
5. Diff banner appears showing changes
6. **Editor immediately updates with tailored content**

### Actual Behavior
1. User clicks "Tailor Resume"
2. Tailoring completes successfully
3. Success toast shows score improvement
4. AI Panel opens showing ATS score
5. Diff banner appears showing changes
6. **Editor shows old content (not updated)**

---

## Root Cause Analysis

### Backend (✅ Working)
- Tailoring saves to `working_drafts` table correctly
- `getCurrentResumeData()` returns draft data when available
- API endpoint `/api/base-resumes/:id` is draft-aware

### Frontend (❓ Issue)
- `loadResumeById()` is called after tailoring
- Function calls `apiService.getBaseResume(id)`
- Function calls `applyBaseResume()` to update state
- **But editor doesn't re-render with new data**

### Possible Causes

1. **State Update Not Triggering Re-render**
   - `setResumeData()` might not be triggering component updates
   - React might be batching updates and skipping the re-render

2. **Stale Closure**
   - `loadResumeById` might be using stale state
   - Dependencies in `useCallback` might be missing

3. **Race Condition**
   - Auto-save might be overwriting the tailored data
   - Multiple state updates happening simultaneously

4. **Cache Issue**
   - Frontend might be caching the old resume data
   - Browser might not be reloading the component

---

## Investigation Steps

### Step 1: Check Console Logs
```javascript
// In useDashboardHandlers.ts after tailoring
console.log('🔄 [TAILOR] Force reloading resume data from backend after tailoring...');
console.log('🔄 [TAILOR] Resume ID:', effectiveResumeId);
await loadResumeById(effectiveResumeId);
console.log('✅ [TAILOR] Resume reloaded successfully from backend!');
```

**Check:**
- Are these logs appearing?
- Is `loadResumeById` actually being called?
- Is it completing successfully?

### Step 2: Check API Response
```javascript
// In useResumeData.ts loadResumeById
console.log('📥 [LOAD] Response received:', {
  hasResume: !!response?.resume,
  hasData: !!response?.resume?.data,
  dataKeys: response?.resume?.data ? Object.keys(response.resume.data) : [],
  hasSummary: !!response?.resume?.data?.summary,
  summaryPreview: response?.resume?.data?.summary?.substring(0, 100)
});
```

**Check:**
- Is the response containing the tailored data?
- Is `hasSummary` true?
- Does `summaryPreview` show tailored content?

### Step 3: Check State Update
```javascript
// In useResumeData.ts applyBaseResume
console.log('📝 [APPLY] Setting resume data:', {
  name: resumeData.name,
  summaryLength: resumeData.summary?.length,
  experienceCount: resumeData.experience?.length
});
setResumeData(resumeData);
```

**Check:**
- Is `setResumeData` being called with tailored data?
- Are the values correct?

### Step 4: Check Component Re-render
```javascript
// In ResumeEditor.tsx
useEffect(() => {
  console.log('🎨 [EDITOR] Resume data changed:', {
    name: resumeData.name,
    summaryLength: resumeData.summary?.length,
    timestamp: new Date().toISOString()
  });
}, [resumeData]);
```

**Check:**
- Is the editor re-rendering after state update?
- Is `resumeData` actually changing?

---

## Potential Fixes

### Fix 1: Force Component Re-mount
```typescript
// In useDashboardHandlers.ts
// Temporarily clear resume ID to force unmount/remount
setCurrentResumeId(null);
await new Promise(resolve => setTimeout(resolve, 100));
setCurrentResumeId(effectiveResumeId);
await loadResumeById(effectiveResumeId);
```

### Fix 2: Add Key to Force Re-render
```tsx
// In DashboardPageClient.tsx
<ResumeEditor
  key={`${currentResumeId}-${lastUpdatedAt}`}
  // ... other props
/>
```

### Fix 3: Use Ref to Force Update
```typescript
// In useResumeData.ts
const forceUpdate = useReducer(() => ({}), {})[1];

const loadResumeById = useCallback(async (id: string) => {
  // ... load data
  setResumeData(resumeData);
  forceUpdate(); // Force re-render
}, []);
```

### Fix 4: Ensure Fresh State
```typescript
// In useDashboardHandlers.ts
// Use functional update to ensure fresh state
setResumeData(prev => {
  console.log('🔄 Replacing resume data');
  return tailoredData;
});
```

---

## Testing Plan

1. **Test Tailoring:**
   - Upload resume
   - Activate resume
   - Enter job description
   - Click "Tailor Resume"
   - **Verify:** Editor updates immediately

2. **Test Console Logs:**
   - Open browser console (F12)
   - Perform tailoring
   - **Verify:** All logs appear in correct order
   - **Verify:** No errors in console

3. **Test Network:**
   - Open Network tab (F12)
   - Perform tailoring
   - **Verify:** API calls complete successfully
   - **Verify:** Response contains tailored data

4. **Test State:**
   - Install React DevTools
   - Perform tailoring
   - **Verify:** `resumeData` state updates
   - **Verify:** Component re-renders

---

## Current Status

**Investigation:** Complete ✅  
**Fix Applied:** Yes ✅  
**Testing:** Ready for testing

## Root Cause Found ✅

**Error:** `ReferenceError: setShowRightPanel is not defined`

**Location:** `apps/web/src/app/dashboard/hooks/useDashboardHandlers.ts`

**Root Cause:** `setShowRightPanel` and `setShowDiffBanner` were defined in the `UseDashboardHandlersParams` interface and passed from `DashboardPageClient.tsx`, but they were **NOT being destructured** from the `params` object in `useDashboardHandlers.ts`.

**Impact:** When the tailoring success handler tried to call `setShowRightPanel(true)`, it threw a `ReferenceError` because the variable was `undefined`. This error prevented `loadResumeById` from being called, so the editor never updated with tailored content.

**Fix Applied:**
1. ✅ Added `setShowRightPanel` and `setShowDiffBanner` to the destructuring assignment in `useDashboardHandlers.ts` (line 312-313)
2. ✅ Added proper null checking before calling these functions
3. ✅ Wrapped calls in try-catch blocks to prevent errors from blocking the reload
4. ✅ Added logging to verify `loadResumeById` is available

**Code Change:**
```typescript
// Before (line 310-311):
showToast
} = params;

// After (line 310-314):
showToast,
// UI state
setShowRightPanel,
setShowDiffBanner
} = params;
```

**Next Steps:**
1. Add comprehensive console logging
2. Test in browser with DevTools open
3. Identify exact point of failure
4. Apply appropriate fix
5. Verify fix works
6. Remove debug logging

---

## Related Files

- `apps/web/src/app/dashboard/hooks/useDashboardHandlers.ts` (line 697-708)
- `apps/web/src/hooks/useResumeData.ts` (line 306-341)
- `apps/api/services/ai/tailorService.js` (line 378-384)
- `apps/api/services/workingDraftService.js` (line 35-75)

---

**Last Updated:** 2025-11-13  
**Assigned To:** Development Team

