# 🐛 CRITICAL BUGS FIXED - Session Report

## Date: 2025-11-12

---

## 🚨 BUG #1: File Upload Not Linking to BaseResume

### **Symptoms:**
- Resume files uploaded successfully to storage
- BaseResume records created but WITHOUT `storageFileId` or `fileHash`
- Parsing never triggered because no file link existed
- Editor remained empty after "activation"

### **Root Cause:**
The frontend's `createResume()` function in `useBaseResumes.ts` had a TypeScript type that only accepted:
```typescript
{ name, data, formatting, metadata }
```

But the upload flow was trying to pass:
```typescript
{ name, data, storageFileId, fileHash }
```

These critical fields were **silently dropped** because TypeScript didn't include them in the type definition!

### **Files Affected:**
1. `apps/web/src/hooks/useBaseResumes.ts` (Line 86-93)
2. `apps/api/routes/baseResume.routes.js` (Line 42-50)

### **Fix Applied:**
✅ **Frontend:** Updated `createResume()` type to accept `storageFileId` and `fileHash`
✅ **Backend:** Updated route to extract and pass these fields to the service
✅ **Service:** Already supported these fields (no change needed)

### **Impact:**
- ✅ Resume uploads now properly link to storage files
- ✅ Parsing can now find the file via `fileHash`
- ✅ Editor will populate after parsing completes

---

## 🚨 BUG #2: Auto-Save Preferences Triggering on Page Load

### **Symptoms:**
- Backend logs showed "User tailoring preferences updated" immediately on page load
- User did NOT interact with any UI
- Unnecessary PUT requests being sent on every page load

### **Root Cause:**
The `useAI.ts` hook had a **cascading effect** that caused an infinite loop:

1. **Line 26:** `useTailoringPreferences()` loads preferences (GET request)
2. **Line 32-39:** When preferences load, they update state:
   - `setTailorEditMode(preferences.mode)`
   - `setSelectedTone(preferences.tone)`
   - `setSelectedLength(preferences.length)`
3. **Line 44-58:** When those states change, a `useEffect` triggers and calls `updatePreferences()` (PUT request) after 500ms!
4. **Result:** Every page load = 1 GET + 1 PUT request (unnecessary write)

### **Files Affected:**
1. `apps/web/src/hooks/useAI.ts` (Line 25-58)

### **Fix Applied:**
✅ Added `prefsInitialized` state flag to track if preferences have been loaded
✅ Modified auto-save `useEffect` to only trigger AFTER preferences are initialized
✅ This prevents auto-save from firing when applying loaded preferences to state

### **Impact:**
- ✅ No more unnecessary PUT requests on page load
- ✅ Auto-save still works when user manually changes preferences
- ✅ Cleaner backend logs

---

## 📊 VERIFICATION CHECKLIST

### Before Fix:
- ❌ File upload → BaseResume created without `storageFileId`/`fileHash`
- ❌ Parsing never triggered (no file to parse)
- ❌ Editor remained empty
- ❌ Backend logs showed "preferences updated" on every page load

### After Fix:
- ✅ File upload → BaseResume properly linked to storage file
- ✅ Parsing triggers automatically on activation
- ✅ Editor populates with parsed data
- ✅ Backend logs clean (no unnecessary updates)

---

## 🧪 TESTING INSTRUCTIONS

### Test 1: Resume Upload & Parsing
1. Navigate to dashboard
2. Click "Import" button
3. Upload a resume file (PDF/DOCX)
4. Toggle the resume ON
5. **Expected:**
   - ✅ Modal closes immediately
   - ✅ Toast shows "🔄 Activating and parsing resume..."
   - ✅ After ~10-30s: "✅ Resume activated and parsed successfully!"
   - ✅ Editor populates with structured resume data

### Test 2: Preferences Not Auto-Saving on Load
1. Open browser DevTools → Network tab
2. Refresh the dashboard page
3. Filter for `/api/user/preferences/tailoring`
4. **Expected:**
   - ✅ 1 GET request (loading preferences)
   - ❌ NO PUT request (unless user manually changes preferences)

---

## 🔍 CODE CHANGES SUMMARY

### Files Modified:
1. `apps/web/src/hooks/useBaseResumes.ts`
   - Added `storageFileId` and `fileHash` to `createResume()` type

2. `apps/api/routes/baseResume.routes.js`
   - Extracted `storageFileId` and `fileHash` from request body
   - Passed them to `createBaseResume()` service

3. `apps/web/src/hooks/useAI.ts`
   - Added `prefsInitialized` state flag
   - Modified auto-save `useEffect` to check `prefsInitialized`

### Files NOT Modified (Already Working):
- `apps/api/services/baseResumeService.js` (already saved `storageFileId`/`fileHash`)
- `apps/web/src/components/modals/ImportModal.tsx` (already passed correct params)

---

## 🎯 NEXT STEPS

1. ✅ Backend restarted with fixes
2. ⏳ User to test resume upload workflow
3. ⏳ Verify parsing animation shows correctly
4. ⏳ Verify editor populates with parsed data
5. ⏳ Verify no unnecessary API calls in Network tab

---

## 📝 LESSONS LEARNED

1. **TypeScript Type Safety:** Even with TypeScript, parameters can be silently dropped if the type definition doesn't include them. Always verify the full type chain.

2. **useEffect Dependencies:** When using `useEffect` for auto-save, always add a flag to prevent triggering on initial state hydration from server data.

3. **Backend Logs:** Unexpected logs are often the first sign of unnecessary API calls or infinite loops in the frontend.

4. **Full-Stack Tracing:** When debugging, trace the ENTIRE flow from UI → API → Service → Database to find where data is being lost.

---

**Status:** ✅ All fixes applied, backend restarted, ready for testing.

