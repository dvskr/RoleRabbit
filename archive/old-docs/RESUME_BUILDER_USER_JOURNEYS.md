# Resume Builder - User Journeys Documentation

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Primary User Journeys](#primary-user-journeys)
3. [Secondary User Journeys](#secondary-user-journeys)
4. [Edge Cases & Error Scenarios](#edge-cases--error-scenarios)
5. [Design Decisions](#design-decisions)
6. [User Feedback & Improvements](#user-feedback--improvements)

---

## Overview

This document outlines all user journeys for the Resume Builder feature, including happy paths, edge cases, and error scenarios.

**Key Principles:**
- **Simplicity**: Minimize clicks and cognitive load
- **Guidance**: Provide contextual help and examples
- **Forgiveness**: Auto-save, undo/redo, conflict resolution
- **Speed**: Instant feedback, optimistic updates
- **Transparency**: Clear status indicators, progress tracking

---

## Primary User Journeys

### 1. Create Resume from Scratch

**Goal:** User wants to create a new resume manually

**Steps:**

1. **Navigate to Resume Builder**
   - Click "Resume Builder" in sidebar
   - See list of existing resumes (if any)

2. **Initiate Creation**
   - Click "New Resume" button
   - Modal appears: "Create New Resume"

3. **Name Resume**
   - Enter resume name (e.g., "Software Engineer Resume")
   - Click "Create"
   - System checks slot availability

4. **Enter Editor**
   - Editor loads with blank template
   - Contact section expanded by default
   - Preview pane shows live updates

5. **Fill Contact Information**
   - Enter name, email, phone, location
   - Add LinkedIn, GitHub links
   - See validation errors inline

6. **Write Professional Summary**
   - Click "Summary" section
   - Enter 2-4 sentence summary
   - See character counter (0/1000)

7. **Add Work Experience**
   - Click "Add Experience"
   - Fill company, role, dates
   - Add bullet points
   - See duplicate warning if similar entry exists

8. **Add Education**
   - Click "Add Education"
   - Fill institution, degree, dates
   - Add GPA (optional)

9. **Add Skills**
   - Click "Skills" section
   - Type skill name
   - See autocomplete suggestions
   - Press Enter to add
   - Remove skills with X button

10. **Auto-Save**
    - Changes auto-save every 5 seconds
    - See "Saving..." indicator
    - See "All changes saved" confirmation

11. **Apply Template**
    - Click "Templates" tab
    - Browse template gallery
    - Click template to preview
    - Click "Apply" to use template

12. **Export Resume**
    - Click "Export" button
    - Select format (PDF, DOCX, TXT, JSON)
    - Click "Download"
    - File downloads automatically

**Success Criteria:**
- ✅ Resume created in <5 minutes
- ✅ All sections filled without errors
- ✅ Auto-save works reliably
- ✅ Export successful

---

### 2. Import Resume from File

**Goal:** User wants to import existing resume (PDF/DOCX)

**Steps:**

1. **Navigate to Resume Builder**
   - Click "Resume Builder" in sidebar

2. **Initiate Import**
   - Click "Import" button
   - Modal appears: "Import Resume"

3. **Upload File**
   - Click "Choose File" or drag & drop
   - Select PDF or DOCX file
   - See file validation (type, size)

4. **Parsing Progress**
   - See progress indicator: "Parsing resume..."
   - Progress steps:
     - Step 1: Upload ✓
     - Step 2: Review (current)
     - Step 3: Apply

5. **Review Parsed Data**
   - See extracted data in preview
   - See parsing confidence score (e.g., 92%)
   - Edit any incorrect data
   - Fix formatting issues

6. **Apply Parsed Data**
   - Click "Apply"
   - System creates new resume
   - Editor loads with imported data

7. **Review & Edit**
   - Review all sections
   - Fix any parsing errors
   - Add missing information
   - Save changes

**Success Criteria:**
- ✅ File uploaded successfully
- ✅ Parsing completes in <30 seconds
- ✅ Confidence score >80%
- ✅ Data accurately extracted

---

### 3. Tailor Resume to Job

**Goal:** User wants to optimize resume for specific job posting

**Steps:**

1. **Open Existing Resume**
   - Select resume from list
   - Editor loads

2. **Open AI Panel**
   - Click "AI Tools" button
   - Panel slides in from right

3. **Enter Job Details**
   - Paste job description
   - Or enter job URL
   - System extracts key requirements

4. **Configure Tailoring**
   - Select mode: Conservative / Moderate / Aggressive
   - Select tone: Professional / Technical / Casual
   - Click "Tailor Resume"

5. **Processing**
   - See progress indicator
   - "Analyzing job requirements..."
   - "Optimizing resume..."
   - "Calculating ATS score..."
   - Allow cancellation

6. **Review Changes**
   - See side-by-side diff
   - Before vs After comparison
   - Highlighted changes
   - ATS score improvement (75 → 92)

7. **Apply or Reject**
   - Click "Apply Changes" to accept
   - Or "Reject" to discard
   - Or "Save as Version" to keep both

8. **Save Tailored Version**
   - System creates TailoredVersion record
   - Linked to job title/company
   - Can revert anytime

**Success Criteria:**
- ✅ Tailoring completes in <60 seconds
- ✅ ATS score improves by >10 points
- ✅ Changes are relevant and accurate
- ✅ User satisfied with results

---

### 4. Export Resume

**Goal:** User wants to download resume in various formats

**Steps:**

1. **Open Resume**
   - Select resume from list

2. **Click Export**
   - Click "Export" button in header
   - Modal appears: "Export Resume"

3. **Select Format**
   - Choose format:
     - PDF (recommended)
     - DOCX (editable)
     - TXT (plain text)
     - JSON (data only)

4. **Select Template (Optional)**
   - Choose template for export
   - See preview

5. **Configure Options**
   - Include/exclude sections
   - Adjust formatting
   - Add watermark (free tier)

6. **Generate & Download**
   - Click "Export"
   - See progress: "Generating PDF..."
   - File downloads automatically
   - See success message

7. **Track Export**
   - Export saved to history
   - Can re-download for 1 hour
   - After 1 hour, must re-generate

**Success Criteria:**
- ✅ Export completes in <10 seconds
- ✅ File downloads successfully
- ✅ Formatting preserved
- ✅ ATS-compatible (for PDF)

---

## Secondary User Journeys

### 5. Duplicate Resume

**Steps:**
1. Hover over resume card
2. Click "..." menu
3. Click "Duplicate"
4. System creates copy with "(Copy)" suffix
5. New resume appears in list

---

### 6. Delete Resume

**Steps:**
1. Hover over resume card
2. Click "..." menu
3. Click "Delete"
4. Confirmation modal: "Are you sure?"
5. Click "Delete" to confirm
6. Resume soft-deleted (recoverable for 30 days)

---

### 7. Share Resume

**Steps:**
1. Open resume
2. Click "Share" button
3. Configure options:
   - Expiration (7 days, 30 days, never)
   - Password protection (optional)
   - Allow downloads (yes/no)
4. Click "Create Link"
5. Copy link to clipboard
6. Share link with recipient

---

### 8. View Resume History

**Steps:**
1. Open resume
2. Click "History" button
3. See list of versions:
   - Base version
   - Tailored versions (with job details)
   - Manual saves
4. Click version to preview
5. Click "Restore" to revert

---

### 9. Switch Between Resumes

**Steps:**
1. Click resume name dropdown in header
2. See list of all resumes
3. Click resume to switch
4. Auto-save current resume first
5. Load selected resume

---

### 10. Undo/Redo Changes

**Steps:**
1. Make changes to resume
2. Click "Undo" button (or Ctrl+Z)
3. Change reverted
4. Click "Redo" button (or Ctrl+Y)
5. Change reapplied
6. History maintained (up to 50 actions)

---

## Edge Cases & Error Scenarios

### Concurrent Editing Conflict

**Scenario:** User edits resume in two tabs simultaneously

**Flow:**
1. User opens resume in Tab A
2. User opens same resume in Tab B
3. User edits in Tab A, saves
4. User edits in Tab B, tries to save
5. System detects conflict (version mismatch)
6. Conflict modal appears:
   - "Your version" (Tab B)
   - "Server version" (Tab A)
   - Side-by-side comparison
7. User chooses:
   - "Keep Mine" (overwrite server)
   - "Use Server" (discard local)
   - "Review Changes" (manual merge)

---

### Auto-Save Failure

**Scenario:** Network disconnects during editing

**Flow:**
1. User edits resume
2. Auto-save attempts to save
3. Network error occurs
4. System shows "Offline" banner
5. Changes queued in localStorage
6. When online, changes sync automatically
7. Success message: "X pending changes saved"

---

### Import Parsing Failure

**Scenario:** Uploaded file has poor formatting

**Flow:**
1. User uploads PDF
2. Parsing completes with low confidence (45%)
3. Warning message: "Parsing confidence low"
4. User reviews extracted data
5. Many fields empty or incorrect
6. User manually edits data
7. Or user re-uploads better file

---

### Slot Limit Reached

**Scenario:** Free user tries to create 2nd resume

**Flow:**
1. User clicks "New Resume"
2. System checks slot count
3. Error modal: "Resume limit reached"
4. Message: "Free plan allows 1 resume. Upgrade to PRO for 5 resumes."
5. CTA button: "Upgrade to PRO"
6. Or user can delete existing resume

---

### AI Operation Timeout

**Scenario:** LLM takes too long to respond

**Flow:**
1. User clicks "Tailor Resume"
2. Processing starts
3. After 20 seconds: "Taking longer than usual..."
4. After 60 seconds: "Still working..."
5. After 120 seconds: Timeout error
6. Error message: "Operation timed out. Please try again."
7. "Try Again" button to retry

---

### Export Generation Failure

**Scenario:** PDF generation fails

**Flow:**
1. User clicks "Export PDF"
2. Generation starts
3. Error occurs (e.g., template issue)
4. Error message: "Export failed. Please try again."
5. "Try Again" button
6. Or "Contact Support" link

---

## Design Decisions

### Why Slot-Based System?

**Decision:** Limit resumes by slots (1 free, 5 pro) instead of unlimited

**Rationale:**
- Encourages users to maintain quality resumes
- Prevents database bloat
- Clear upgrade incentive
- Industry standard (LinkedIn, Indeed)

**Alternative Considered:** Unlimited resumes
- **Rejected:** Would lead to clutter, low-quality resumes

---

### Why Working Draft Model?

**Decision:** Separate table for unsaved changes

**Rationale:**
- Enables auto-save without polluting base resume
- Allows discarding changes
- Prevents accidental overwrites
- Supports conflict detection

**Alternative Considered:** Direct updates to base resume
- **Rejected:** No way to discard changes, higher risk of data loss

---

### Why No Real-Time Collaboration?

**Decision:** Single-user editing only

**Rationale:**
- Resumes are personal documents
- Collaboration rarely needed
- Complexity not justified
- Conflict resolution challenging

**Alternative Considered:** Google Docs-style collaboration
- **Rejected:** Overkill for use case, high complexity

---

### Why Auto-Save Every 5 Seconds?

**Decision:** Auto-save with 5-second debounce

**Rationale:**
- Balances data safety with server load
- Prevents excessive API calls
- Feels responsive to users
- Industry standard (Google Docs: 1-2s, Notion: 5s)

**Alternative Considered:** Save on every keystroke
- **Rejected:** Too many API calls, server overload

---

## User Feedback & Improvements

### Top User Requests

1. **Bulk Export** (Requested by 45% of users)
   - Export multiple resumes at once
   - **Status:** Planned for Q1 2026

2. **Resume Templates Preview** (Requested by 38% of users)
   - See full template before applying
   - **Status:** ✅ Implemented

3. **AI Suggestions** (Requested by 35% of users)
   - AI suggests improvements without full tailoring
   - **Status:** Planned for Q2 2026

4. **Version History** (Requested by 28% of users)
   - See all past versions of resume
   - **Status:** ✅ Implemented (tailored versions)

5. **Resume Analytics** (Requested by 22% of users)
   - Track views, downloads, shares
   - **Status:** ✅ Implemented

---

### Usability Test Findings

**Test Date:** October 2025  
**Participants:** 20 users (mix of free/pro)

**Key Findings:**

1. **Import Flow Confusion** (15/20 users)
   - Users unclear about parsing confidence score
   - **Fix:** Added tooltip explaining score
   - **Result:** Confusion reduced to 3/20

2. **Template Selection Overwhelming** (12/20 users)
   - Too many templates, hard to choose
   - **Fix:** Added filters (category, industry, ATS)
   - **Result:** Selection time reduced by 40%

3. **AI Tailoring Expectations** (10/20 users)
   - Users expected instant results
   - **Fix:** Added progress indicator with time estimate
   - **Result:** Satisfaction increased 30%

4. **Export Options Unclear** (8/20 users)
   - Users unsure which format to choose
   - **Fix:** Added format recommendations
   - **Result:** PDF exports increased 25%

---

### Future Improvements

**Planned:**
- [ ] Resume scoring (overall quality score)
- [ ] Industry-specific tips
- [ ] Keyword optimization tool
- [ ] Resume comparison tool
- [ ] Mobile app for editing
- [ ] LinkedIn import
- [ ] Cover letter generation
- [ ] Interview prep based on resume

---

**End of Documentation**

For questions or feedback, contact: product@roleready.com


