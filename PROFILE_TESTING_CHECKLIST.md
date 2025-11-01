# Profile Tab Testing Checklist

## Prerequisites (Do These First!)

### 1. Database Migration
```bash
cd apps/api
npx prisma migrate dev --name add_extended_profile_fields
```
This adds all the new profile fields to your database.

### 2. Install Resume Parsing Packages (Optional)
```bash
cd apps/api
npm install pdf-parse mammoth
```
Required for resume import to work.

### 3. Restart Servers
After migration and package installation:
```bash
# Restart Node.js API
cd apps/api
npm run dev

# Restart Next.js frontend (in another terminal)
cd apps/web
npm run dev
```

### 4. Optional: Configure OpenAI (for better resume parsing)
Edit `apps/api/.env` and add:
```env
OPENAI_API_KEY=sk-your-key-here
```
Without this, resume parsing uses regex (still works but less accurate).

---

## Manual Testing Checklist

### ✅ Profile Tab Access
- [ ] Navigate to Profile tab in the application
- [ ] Verify all 10 tabs are visible in sidebar:
  - Personal Information
  - Professional
  - Skills & Expertise
  - Career Goals
  - Portfolio
  - Preferences
  - Analytics
  - Security
  - Billing
  - Help & Support

### ✅ Personal Information Tab
- [ ] Click "Edit" button - fields become editable
- [ ] Update First Name - saves correctly
- [ ] Update Last Name - saves correctly
- [ ] Update Email - saves correctly
- [ ] Update Phone - saves correctly
- [ ] Update Location - saves correctly
- [ ] Update Bio - saves correctly (character count shows)
- [ ] Click "Save" - success message appears
- [ ] Refresh page - data persists
- [ ] Profile picture section displays correctly
- [ ] Upload new profile picture - works and shows preview
- [ ] Verify profile picture uploads successfully

### ✅ Profile Picture Upload
- [ ] Click "Change Photo" button
- [ ] Select image file (JPG/PNG) - preview shows
- [ ] Upload completes - success message appears
- [ ] Image displays in profile after upload
- [ ] Try invalid file type - error message shows
- [ ] Try file > 5MB - error message shows

### ✅ Professional Tab
- [ ] Update Current Role - saves
- [ ] Update Current Company - saves
- [ ] Update Experience - saves
- [ ] Update Industry - saves
- [ ] Update Job Level - saves
- [ ] Update Employment Type - saves
- [ ] Update Availability - saves
- [ ] Update Salary Expectation - saves
- [ ] Update Work Preference - saves

### ✅ Skills & Expertise Tab
- [ ] Add skills - saves correctly
- [ ] Add certifications - saves correctly
- [ ] Add languages - saves correctly
- [ ] Verify arrays are stored and retrieved properly

### ✅ Career Goals Tab
- [ ] Add career goals - saves
- [ ] Add target roles - saves
- [ ] Add target companies - saves
- [ ] Update relocation willingness - saves

### ✅ Portfolio Tab
- [ ] Update portfolio URL - saves
- [ ] Update LinkedIn - saves
- [ ] Update GitHub - saves
- [ ] Update Website - saves
- [ ] Add projects - saves
- [ ] Add achievements - saves

### ✅ Resume Import
- [ ] Click "Import Resume" button
- [ ] Select PDF file - parsing starts
- [ ] Verify "Parsing Resume..." message shows
- [ ] After parsing, profile fields auto-fill
- [ ] Success message shows with field count
- [ ] Edit mode automatically enabled
- [ ] Review imported data - accuracy check
- [ ] Save imported data - persists
- [ ] Try DOCX file - works
- [ ] Try invalid file type - error shows
- [ ] Try corrupted file - error shows

### ✅ Data Persistence
- [ ] Make changes in any tab
- [ ] Click "Save"
- [ ] Refresh page (F5)
- [ ] Verify all changes persisted

### ✅ Error Handling
- [ ] Save with invalid email - error shows
- [ ] Try to save while offline - error shows
- [ ] Cancel editing - changes discarded
- [ ] Error messages are clear and helpful

### ✅ Success Messages
- [ ] Save profile - success message appears
- [ ] Upload picture - success message appears
- [ ] Import resume - success message appears
- [ ] Messages auto-dismiss after timeout

### ✅ Loading States
- [ ] Profile loads with spinner initially
- [ ] Saving shows loading state
- [ ] Uploading shows loading state
- [ ] Parsing resume shows loading state

### ✅ Other Tabs (UI Check)
- [ ] Preferences Tab - renders correctly
- [ ] Analytics Tab - displays metrics
- [ ] Security Tab - security options visible
- [ ] Billing Tab - billing info displays
- [ ] Support Tab - help content visible

---

## Test Scenarios

### Scenario 1: New User Profile Setup
1. Register new account
2. Navigate to Profile tab
3. Import resume
4. Review and edit auto-filled data
5. Upload profile picture
6. Save all changes
7. Verify everything persisted

### Scenario 2: Edit Existing Profile
1. Login with existing account
2. Navigate to Profile tab
3. Click Edit
4. Update multiple fields across different tabs
5. Save changes
6. Verify all updates persisted

### Scenario 3: Profile Picture Only
1. Navigate to Profile tab
2. Upload new profile picture
3. Don't save other changes
4. Verify picture updated immediately

### Scenario 4: Resume Import & Edit
1. Import a resume
2. Review auto-filled data
3. Make corrections
4. Save changes
5. Verify accuracy

---

## Known Issues to Check

- [ ] Profile picture upload works correctly
- [ ] JSON arrays (skills, education) save and load properly
- [ ] Resume parsing extracts accurate information
- [ ] All fields map correctly from resume to profile
- [ ] No console errors during normal operation
- [ ] Mobile responsive (if applicable)

---

## Quick Test (5 minutes)

If you want a quick test:
1. Navigate to Profile tab
2. Click Edit
3. Update First Name and Last Name
4. Click Save
5. Check success message appears
6. Refresh page
7. Verify names persisted

Then test resume import:
1. Click "Import Resume"
2. Select a PDF resume
3. Wait for parsing
4. Check if fields auto-filled
5. Save if accurate

---

## Report Issues

If you find any issues, note:
- What you were doing
- Expected behavior
- Actual behavior
- Error messages (if any)
- Browser console errors
- Network tab errors

