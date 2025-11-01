# UI Testing Checklist

**Purpose:** Test all user-facing features in the browser  
**Time Required:** 15-20 minutes  
**Status:** ⏳ Pending Testing

---

## 🎯 Quick Start

1. **Start all services:**
   ```powershell
   npm run dev:all
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Follow this checklist**

---

## 1️⃣ Authentication (10 tests)

### Sign Up
- [ ] Click "Sign Up" button
- [ ] Enter valid email (e.g., `test@example.com`)
- [ ] Enter valid password (e.g., `Test1234!`)
- [ ] Enter your name
- [ ] Click submit
- [ ] **Expected:** Successfully registered, redirected to dashboard
- [ ] **Check:** URL changes to `/dashboard`
- [ ] **Check:** You see dashboard content

### Sign Up Errors
- [ ] Try invalid email (e.g., `notanemail`)
- [ ] **Expected:** Error message about email format
- [ ] Try weak password (e.g., `123`)
- [ ] **Expected:** Error message about password strength
- [ ] Try leaving fields empty
- [ ] **Expected:** Error message about required fields

### Login
- [ ] Click "Logout" if logged in
- [ ] Click "Login" button
- [ ] Enter your email and password
- [ ] Click submit
- [ ] **Expected:** Successfully logged in
- [ ] **Check:** Redirected to dashboard
- [ ] **Check:** Your name appears somewhere

### Login Errors
- [ ] Try wrong password
- [ ] **Expected:** "Invalid credentials" error
- [ ] Try non-existent email
- [ ] **Expected:** "User not found" or "Invalid credentials" error

### Session Persistence
- [ ] Login successfully
- [ ] Refresh the page (F5)
- [ ] **Expected:** Still logged in (no need to login again)
- [ ] Close browser tab
- [ ] Open new tab to http://localhost:3000
- [ ] **Expected:** Still logged in or redirect to login

---

## 2️⃣ Dashboard (5 tests)

### Navigation
- [ ] **Check:** Dashboard loads without errors
- [ ] **Check:** No error messages in browser console
- [ ] **Check:** Dashboard shows main sections
- [ ] Click around different sections
- [ ] **Expected:** Sections load without errors

### Dashboard Content
- [ ] **Check:** Statistics or overview visible
- [ ] **Check:** Quick actions available
- [ ] Try any quick action button
- [ ] **Expected:** Button responds or navigates

---

## 3️⃣ Resume Builder (15 tests)

### Create Resume
- [ ] Click "Resume Builder" or "Create Resume"
- [ ] **Expected:** Resume editor opens
- [ ] **Check:** Form/editor is visible
- [ ] Enter your name in resume
- [ ] Enter your email
- [ ] Add a skill (e.g., "JavaScript")
- [ ] Add education entry
- [ ] Add work experience
- [ ] **Check:** Data saves automatically (wait 30 seconds)
- [ ] Refresh page
- [ ] **Expected:** Your resume data is still there

### Resume Templates
- [ ] Click "Choose Template" or similar
- [ ] **Expected:** Template selection appears
- [ ] Select a different template
- [ ] **Expected:** Resume updates to new template
- [ ] **Check:** All your data remains

### Export Resume
- [ ] Click "Export" or "Download"
- [ ] **Expected:** Download starts or options appear
- [ ] Try PDF export
- [ ] **Expected:** PDF downloads (may need wait 3-5 seconds)
- [ ] Try DOCX export
- [ ] **Expected:** Word document downloads

### Resume Actions
- [ ] Try "Delete" resume
- [ ] **Expected:** Confirmation dialog
- [ ] Cancel delete
- [ ] **Expected:** Resume still exists
- [ ] Try "Rename" resume
- [ ] **Expected:** Name changes

---

## 4️⃣ Job Tracker (15 tests)

### Add Job
- [ ] Click "Jobs" or "Add Job Application"
- [ ] **Expected:** Job form appears
- [ ] Enter job title: "Software Engineer"
- [ ] Enter company: "Tech Company"
- [ ] Enter job URL
- [ ] Select status: "Applied"
- [ ] Add notes
- [ ] Click "Save" or "Add"
- [ ] **Expected:** Job appears in list
- [ ] **Check:** List shows your new job

### View Jobs
- [ ] **Check:** All jobs visible in list
- [ ] Click on a job
- [ ] **Expected:** Job details appear
- [ ] **Check:** All fields are visible

### Update Job
- [ ] Click "Edit" on a job
- [ ] Change status to "Interview"
- [ ] Update notes
- [ ] Save changes
- [ ] **Expected:** Changes saved
- [ ] Refresh page
- [ ] **Expected:** Changes persist

### Filter/Sort Jobs
- [ ] Try filtering by status (if available)
- [ ] **Expected:** List updates
- [ ] Try sorting (if available)
- [ ] **Expected:** Order changes
- [ ] Clear filters
- [ ] **Expected:** All jobs shown

### Delete Job
- [ ] Click "Delete" on a job
- [ ] **Expected:** Confirmation appears
- [ ] Confirm delete
- [ ] **Expected:** Job removed from list
- [ ] **Check:** Job gone after refresh

---

## 5️⃣ Cover Letter Generator (10 tests)

### Create Cover Letter
- [ ] Click "Cover Letters"
- [ ] Click "Create New" or "Add Cover Letter"
- [ ] **Expected:** Editor opens
- [ ] Enter content for cover letter
- [ ] **Check:** Auto-save after 30 seconds (wait)
- [ ] Refresh page
- [ ] **Expected:** Content still there

### Generate Cover Letter (AI)
- [ ] Click "Generate with AI" (if available)
- [ ] Enter job description
- [ ] Click generate
- [ ] **Expected:** AI-generated content appears (may take 10-30 seconds)
- [ ] **Check:** Content is relevant
- [ ] Edit generated content
- [ ] **Expected:** Edits work

### Save/Export
- [ ] Click "Save" or "Export"
- [ ] **Expected:** Cover letter saved or downloaded
- [ ] Try "Download PDF"
- [ ] **Expected:** PDF downloads

---

## 6️⃣ Profile/Settings (5 tests)

### View Profile
- [ ] Click profile icon or "Settings"
- [ ] **Expected:** Profile page opens
- [ ] **Check:** Your info is visible
- [ ] Try editing your name
- [ ] Save changes
- [ ] **Expected:** Changes saved

### Logout
- [ ] Click "Logout"
- [ ] **Expected:** Logged out
- [ ] **Expected:** Redirected to login or home
- [ ] Try accessing dashboard
- [ ] **Expected:** Redirected to login (cannot access)

---

## 7️⃣ General UI/UX (10 tests)

### Loading States
- [ ] Perform any action that takes time
- [ ] **Expected:** Loading spinner or "Loading..." message
- [ ] **Expected:** No blank screen

### Error Messages
- [ ] Trigger an error (e.g., network issue)
- [ ] **Expected:** User-friendly error message
- [ ] **Expected:** Error is clear, not technical

### Responsive Design
- [ ] Resize browser window to mobile size (375px)
- [ ] **Expected:** Layout adapts
- [ ] **Expected:** No horizontal scroll
- [ ] **Expected:** Buttons/links still clickable

### Performance
- [ ] Navigate between pages quickly
- [ ] **Expected:** Fast transitions (< 1 second)
- [ ] **Expected:** No freezing or lag
- [ ] Load multiple features
- [ ] **Expected:** Still responsive

### Console Errors
- [ ] **Check:** Browser console (F12 → Console)
- [ ] **Expected:** No red errors
- [ ] **Acceptable:** Yellow warnings are OK
- [ ] Try all major features
- [ ] **Check:** Still no red errors

---

## 8️⃣ Browser Console Check (5 tests)

### Open Console
- [ ] Press F12
- [ ] Go to "Console" tab
- [ ] **Expected:** Console opens without errors

### Check for Errors
- [ ] Perform all major actions while watching console
- [ ] **Expected:** No red error messages
- [ ] **Acceptable:** Some warnings are OK
- [ ] If errors appear, note them down

### Network Tab
- [ ] Go to "Network" tab
- [ ] Refresh page
- [ ] **Expected:** HTTP 200 or 304 responses
- [ ] **Not Expected:** 404, 500, or other errors
- [ ] **Expected:** API calls to localhost:3001

---

## 🐛 Bug Reporting Template

If something doesn't work:

1. **What you tried:**
   - Feature name
   - Steps to reproduce

2. **What happened:**
   - Actual behavior
   - Error message (if any)
   - Screenshot (if helpful)

3. **What you expected:**
   - Expected behavior

4. **Browser info:**
   - Browser name/version
   - Console errors (copy/paste)

---

## ✅ Testing Summary

**Total Tests:** ~75 checks

**Priority Levels:**
- 🔴 **Critical:** Authentication, Resume saving, Job tracking
- 🟡 **Important:** Navigation, Loading states, Error handling
- 🟢 **Nice-to-have:** Filtering, Sorting, Advanced features

**Expected Time:** 15-20 minutes

---

## 📊 Test Results Tracker

After testing, fill this out:

**Total Tests:** ___ / 75

**Critical Tests Pass:** ___ / 25  
**Important Tests Pass:** ___ / 25  
**Nice-to-Have Pass:** ___ / 25  

**Blocking Bugs:** ___ (cannot proceed without fixes)  
**Major Bugs:** ___ (workaround exists)  
**Minor Bugs:** ___ (cosmetic)  

**Overall Assessment:**
- [ ] Everything works perfectly
- [ ] Minor issues, but usable
- [ ] Major issues, needs fixes
- [ ] Critical issues, broken

---

## 🎯 Quick Priority Test (5 minutes)

If you're short on time, just test these:

1. ✅ Sign up
2. ✅ Login  
3. ✅ Create a resume
4. ✅ Add a job application
5. ✅ Check if data persists after refresh

**If these 5 work → Platform is functional for basic use**

---

**Last Updated:** November 1, 2025  
**Status:** ⏳ Awaiting your testing

