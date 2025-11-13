# Debug Guide: Tailoring Changes Not Reflecting

**Status:** TESTING  
**Date:** 2025-11-13  
**Priority:** HIGH

---

## Quick Debug Steps

### 1. Open Browser Console (F12)

Before testing, open the browser console to see all debug logs.

### 2. Perform Tailoring

1. Upload a resume and activate it
2. Enter a job description
3. Click "Tailor Resume"
4. Wait for completion

### 3. Check Console Logs

You should see logs in this order:

```
🔄 [TAILOR] Force reloading resume data from backend after tailoring...
🔄 [TAILOR] Resume ID: cmXXXXXXXXXXXXXXXXXXXXXX
📥 [LOAD] Loading resume by ID: cmXXXXXXXXXXXXXXXXXXXXXX
📥 [LOAD] Response received: {
  hasResume: true,
  hasData: true,
  dataKeys: [...],
  hasSummary: true,
  summaryPreview: "..." (should show TAILORED content)
}
📝 [LOAD] Applying resume to editor: {
  resumeId: "...",
  hasData: true,
  hasSummary: true,
  summaryPreview: "..." (should show TAILORED content),
  experienceCount: X
}
✅ [LOAD] Resume applied to editor, result: {
  hasResult: true,
  resultSummary: "..." (should show TAILORED content)
}
✅ [TAILOR] Resume reloaded successfully from backend!
🎨 [EDITOR] Resume data changed: {
  name: "...",
  summaryLength: XXX,
  summaryPreview: "..." (should show TAILORED content),
  experienceCount: X,
  timestamp: "..."
}
```

---

## Diagnostic Checklist

### ✅ Backend is Saving Correctly

**Check:**
```sql
-- In PostgreSQL
SELECT id, "baseResumeId", "updatedAt", 
       jsonb_extract_path_text(data, 'summary') as summary_preview
FROM working_drafts
ORDER BY "updatedAt" DESC
LIMIT 1;
```

**Expected:** Latest draft should have tailored summary

---

### ✅ API is Returning Draft Data

**Check Network Tab:**
1. Open Network tab (F12)
2. Perform tailoring
3. Look for request to `/api/base-resumes/cmXXXXXXX`
4. Check response body

**Expected:** Response should contain `data.summary` with tailored content

---

### ✅ Frontend is Receiving Data

**Check Console Log:**
```
📥 [LOAD] Response received: {
  hasResume: true,
  hasData: true,
  hasSummary: true,
  summaryPreview: "..." <-- Should show tailored content
}
```

**If summaryPreview shows OLD content:**
- Backend isn't saving to draft correctly
- OR API isn't reading from draft

**If summaryPreview shows NEW content:**
- Backend is working ✅
- Issue is in frontend state update

---

### ✅ State is Being Updated

**Check Console Log:**
```
📝 [LOAD] Applying resume to editor: {
  summaryPreview: "..." <-- Should match response
}
✅ [LOAD] Resume applied to editor, result: {
  resultSummary: "..." <-- Should match response
}
```

**If resultSummary doesn't match:**
- `applyBaseResume()` is transforming data incorrectly
- Check `mapBaseResumeToEditor()` function

---

### ✅ Editor is Re-rendering

**Check Console Log:**
```
🎨 [EDITOR] Resume data changed: {
  summaryPreview: "..." <-- Should show tailored content
  timestamp: "2025-11-13T..." <-- Should be recent
}
```

**If this log doesn't appear:**
- `setResumeData()` isn't being called
- OR React isn't detecting the state change

**If this log appears but editor doesn't update:**
- Component memoization issue
- OR section rendering issue

---

## Common Issues & Fixes

### Issue 1: Backend Not Saving to Draft

**Symptom:** API response shows old content

**Fix:**
```javascript
// Check apps/api/services/ai/tailorService.js
// Line 378-384 should save to draft:
await saveWorkingDraft({
  userId,
  baseResumeId: resumeId,
  data: tailoredData,
  formatting: resume.formatting || {},
  metadata: resume.metadata || {}
});
```

---

### Issue 2: API Not Reading from Draft

**Symptom:** Draft exists in DB but API returns base data

**Fix:**
```javascript
// Check apps/api/services/workingDraftService.js
// getBaseResume should be draft-aware (line 51-67)
const draft = await prisma.workingDraft.findUnique({
  where: { baseResumeId }
});
if (draft) {
  return {
    data: draft.data,  // <-- Should return draft data
    isDraft: true
  };
}
```

---

### Issue 3: Frontend Not Reloading

**Symptom:** `loadResumeById` not being called

**Fix:**
```typescript
// Check apps/web/src/app/dashboard/hooks/useDashboardHandlers.ts
// Line 704 should call loadResumeById:
await loadResumeById(effectiveResumeId);
```

**If `loadResumeById` is undefined:**
```typescript
// Check apps/web/src/app/dashboard/DashboardPageClient.tsx
// Line 697 should pass loadResumeById:
loadResumeById,  // <-- Must be passed to useDashboardHandlers
```

---

### Issue 4: State Not Triggering Re-render

**Symptom:** State updates but component doesn't re-render

**Fix Option 1 - Force Update:**
```typescript
// In useResumeData.ts
setResumeData(prev => ({
  ...tailoredData  // Create new object to force update
}));
```

**Fix Option 2 - Add Key:**
```tsx
// In DashboardPageClient.tsx
<ResumeEditor
  key={`${currentResumeId}-${Date.now()}`}  // Force remount
  // ... other props
/>
```

---

### Issue 5: Browser Cache

**Symptom:** Old code running in browser

**Fix:**
1. Hard refresh: `Ctrl + Shift + R`
2. Clear cache: `Ctrl + Shift + Delete`
3. Restart Next.js dev server
4. Check "Disable cache" in DevTools Network tab

---

## Testing Procedure

### Step 1: Clear Everything
```bash
# Clear database drafts
psql -d roleready -c "DELETE FROM working_drafts;"

# Restart backend
cd apps/api
npm run dev

# Restart frontend
cd apps/web
npm run dev
```

### Step 2: Upload Fresh Resume
1. Go to dashboard
2. Upload a new resume (not previously uploaded)
3. Activate it
4. Wait for parsing to complete

### Step 3: Test Tailoring
1. Open browser console (F12)
2. Enter job description
3. Click "Tailor Resume"
4. Watch console logs
5. **Verify:** Editor updates with tailored content

### Step 4: Verify in Database
```sql
-- Check draft was created
SELECT * FROM working_drafts ORDER BY "updatedAt" DESC LIMIT 1;

-- Check summary was tailored
SELECT 
  jsonb_extract_path_text(data, 'summary') as draft_summary
FROM working_drafts
WHERE "baseResumeId" = 'YOUR_RESUME_ID';
```

---

## If Still Not Working

### Collect Debug Info

1. **Console Logs:** Copy all console logs during tailoring
2. **Network Tab:** Export HAR file of API requests
3. **Database:** Export draft record
4. **React DevTools:** Check component state

### Create Bug Report

```markdown
## Environment
- Browser: Chrome/Firefox/Safari
- Next.js: Running/Not Running
- Backend: Running/Not Running

## Console Logs
[Paste logs here]

## Network Response
[Paste API response here]

## Database State
[Paste draft record here]

## Expected vs Actual
- Expected: Editor shows tailored content
- Actual: Editor shows [old/no/partial] content
```

---

## Success Criteria

✅ **Tailoring Working When:**
1. Console shows all debug logs in correct order
2. API response contains tailored content
3. Editor log shows tailored content
4. Editor UI displays tailored content
5. Diff banner shows changes
6. ATS panel shows improved score

---

**Last Updated:** 2025-11-13  
**Next Review:** After testing with debug logs

