# 🔍 Debugging Auto-Tailor Not Working

## 📋 Diagnostic Checklist

### **1. Check Servers Running**
```powershell
# Run this in PowerShell:
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue  # Backend
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue  # Frontend
```

**Expected**: Both should return connections

---

### **2. Check Browser Console (F12)**

**Common errors:**
- ❌ `startTailorProgress is not defined`
- ❌ `completeTailorProgress is not defined`
- ❌ `Network error` or `500 Internal Server Error`
- ❌ `Timeout` errors

---

### **3. Check Backend Terminal**

**Look for:**
- ✅ "Tailoring targets calculated" message
- ❌ "missingKeywords is not defined" error
- ❌ "Cannot find module" errors
- ❌ Any crash messages

---

### **4. Test ATS First**

**Does ATS Check work?**
- ✅ Yes → Tailoring issue is specific
- ❌ No → General connectivity issue

---

## 🛠️ Quick Fixes to Try

### **Fix 1: Hard Restart Everything**
```powershell
cd C:\Users\sathish.kumar\RoleReady-FullStack

# Kill all Node processes
Get-Process node | Stop-Process -Force

# Clear frontend cache
Remove-Item -Recurse -Force apps\web\.next

# Restart backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\api'; node server.js"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Restart frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web'; npm run dev"
```

### **Fix 2: Clear Browser Cache**
```
1. Press Ctrl + Shift + Delete
2. Clear "Cached images and files"
3. Or use Incognito window
4. Hard refresh: Ctrl + Shift + R
```

### **Fix 3: Check Prerequisites**
```
✅ ATS Check completed successfully?
✅ Job description pasted?
✅ Resume loaded?
✅ Advanced Settings visible?
✅ "Partial" mode selected?
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Button Disabled/Grayed Out**

**Possible causes:**
- ❌ No ATS score yet (run ATS Check first!)
- ❌ No job description
- ❌ Already tailoring (wait for completion)

**Solution**: 
```
1. Make sure ATS Check completed
2. See a score displayed (e.g., 56/100)
3. Then click Auto-Tailor
```

### **Issue 2: Timeout After 10 Seconds**

**Error**: `POST /api/proxy/editor/ai/tailor 500 in 10050ms`

**Cause**: Old timeout settings still cached

**Solution**:
```powershell
# Full clean restart
.\RESTART_CLEAN.ps1
```

### **Issue 3: Backend Crash**

**Error**: `missingKeywords is not defined`

**Status**: Should be FIXED (just applied fix)

**Check**: Look in backend terminal for this specific error

**Solution**: If still happening, restart backend:
```powershell
cd apps\api
node server.js
```

### **Issue 4: No Progress Visual**

**Symptom**: Button just says "Tailoring Resume..." with spinner

**Expected**: Should show multi-stage progress visual

**Cause**: Frontend not properly reloaded

**Solution**:
```
1. Hard refresh: Ctrl + Shift + R
2. Or open new Incognito window
3. Clear browser cache
```

### **Issue 5: Success But No Changes**

**Symptom**: Says "tailored" but resume looks the same

**Possible causes:**
- Low improvement potential (+14 points might be subtle)
- Changes applied to backend but not reflected in editor

**Check**: Look for toast notification showing score improvement

---

## 📊 What Should Happen

### **Correct Flow:**

**1. Before Tailoring:**
```
ATS Score: 56/100
7 matched keywords
20 missing keywords
```

**2. Click "Auto-Tailor Resume":**
```
┌─────────────────────────────────────────────┐
│ 🔄 Tailoring Resume                         │
├─────────────────────────────────────────────┤
│ Generating improvements             45%     │
│ ██████████████▌░░░░░░░░░░░░░░░░░░░░         │
├─────────────────────────────────────────────┤
│ ✅ Analyzing resume                         │
│ ✅ Identifying gaps                         │
│ 🔄 Generating improvements                  │
│ ⏳ Optimizing content                       │
│ ⏳ Finalizing changes                       │
└─────────────────────────────────────────────┘
```

**3. After ~90 seconds:**
```
✅ Toast: "Resume Tailored! Score improved from 56 to 70 (+14 points)"
```

**4. Resume updates in editor**

---

## 🔧 Debug Commands

### **Check Backend Endpoint Directly:**
```powershell
# Test if backend is responding
curl http://localhost:3001/health

# If no health endpoint, check:
curl http://localhost:3001/api/editor/ai/health
```

### **Check Frontend Proxy:**
```
Open browser console (F12)
Navigate to Network tab
Click Auto-Tailor
Look for: /api/proxy/editor/ai/tailor
Check: Status code, Response time, Error messages
```

### **Check Backend Logs:**
Look for these messages:
```
✅ "Running World-Class ATS analysis before tailoring"
✅ "Tailoring targets calculated"
✅ "Starting AI tailoring"
❌ Any error messages
```

---

## 🆘 If Nothing Works

### **Nuclear Option - Complete Reset:**

```powershell
# 1. Stop everything
Get-Process node | Stop-Process -Force

# 2. Clear ALL caches
Remove-Item -Recurse -Force apps\web\.next
Remove-Item -Recurse -Force apps\web\.next\cache
Remove-Item -Recurse -Force node_modules\.cache

# 3. Restart
cd apps\api
node server.js
# (in new terminal)
cd apps\web
npm run dev

# 4. Clear browser
# Ctrl+Shift+Delete → Clear cache
# Or use Incognito window

# 5. Test fresh
# ATS Check first
# Then Auto-Tailor
```

---

## 📝 Information Needed for Further Help

Please provide:

1. **Server Status:**
   - ✅/❌ Backend running?
   - ✅/❌ Frontend running?

2. **Browser Console Error:**
   - Press F12
   - Look at Console tab
   - Copy any red error messages

3. **Backend Terminal Output:**
   - What do you see after clicking Auto-Tailor?
   - Any error messages?

4. **Frontend Terminal Output:**
   - Any 500 errors?
   - Timeout messages?

5. **Current Behavior:**
   - Button disabled?
   - Button loading forever?
   - Error message shown?
   - Toast notification?

6. **ATS Status:**
   - Did ATS Check work?
   - What score do you see?

---

## ✅ Quick Test Script

Run this to test everything:

```powershell
Write-Host "=== AUTO-TAILOR DEBUG TEST ===" -ForegroundColor Cyan

# 1. Check servers
Write-Host "`n1. Checking servers..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($backend) { Write-Host "   ✅ Backend running" -ForegroundColor Green } 
else { Write-Host "   ❌ Backend NOT running - START IT!" -ForegroundColor Red }

if ($frontend) { Write-Host "   ✅ Frontend running" -ForegroundColor Green } 
else { Write-Host "   ❌ Frontend NOT running - START IT!" -ForegroundColor Red }

# 2. Check for common errors
Write-Host "`n2. Checking for error indicators..." -ForegroundColor Yellow
if (Test-Path "apps\web\.next\cache") {
    Write-Host "   ⚠️  Next.js cache exists - might be stale" -ForegroundColor Yellow
}

# 3. Instructions
Write-Host "`n3. Test Steps:" -ForegroundColor Cyan
Write-Host "   1. Open: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "   2. Open browser console (F12)" -ForegroundColor White
Write-Host "   3. Run ATS Check first" -ForegroundColor White
Write-Host "   4. Then click Auto-Tailor" -ForegroundColor White
Write-Host "   5. Watch console for errors" -ForegroundColor White
Write-Host "   6. Wait ~90 seconds" -ForegroundColor White
Write-Host "   7. Report what happens!" -ForegroundColor White

Write-Host "`n=== Please share the results! ===" -ForegroundColor Cyan
```

---

**Run the quick test and let me know what you see!** 🔍

