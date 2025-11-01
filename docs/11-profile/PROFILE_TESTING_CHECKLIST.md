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

### ✅ Profile Tab Access & Navigation

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
- [ ] Click each tab - switches correctly
- [ ] Verify active tab is highlighted in sidebar
- [ ] Test tab navigation with keyboard (if applicable)

### ✅ Personal Information Tab

- [ ] Click "Edit" button - fields become editable
- [ ] Update First Name - saves correctly
- [ ] Update Last Name - saves correctly
- [ ] Update Email - saves correctly (with validation)
- [ ] Update Phone - saves correctly
- [ ] Update Location - saves correctly
- [ ] Update Bio - saves correctly (character count shows 0/500)
- [ ] Test bio character limit (500 characters max)
- [ ] Click "Save" - success message appears
- [ ] Refresh page (F5) - data persists
- [ ] Profile picture section displays correctly
- [ ] Upload new profile picture - works and shows preview
- [ ] Verify profile picture uploads successfully
- [ ] Test invalid email format - error shows
- [ ] Test canceling edit - changes discarded

### ✅ Profile Picture Upload

- [ ] Click "Change Photo" button
- [ ] Select image file (JPG/PNG) - preview shows immediately
- [ ] Upload completes - success message appears
- [ ] Image displays in profile after upload
- [ ] Try invalid file type (e.g., .txt) - error message shows
- [ ] Try file > 5MB - error message shows
- [ ] Try GIF/WebP formats - should work
- [ ] Verify image displays correctly (no distortion)
- [ ] Check image dimensions (recommended 400x400px message shows)
- [ ] Test upload with slow network (loading state shows)

### ✅ Professional Tab - Basic Information

- [ ] Update Current Role - saves correctly
- [ ] Update Current Company - saves correctly
- [ ] Update Experience Level dropdown (0-1, 1-3, 3-5, 5+, 10+ years) - saves
- [ ] Update Industry dropdown - saves correctly
- [ ] Update Job Level dropdown (Entry, Mid, Senior, Lead, Executive) - saves
- [ ] Update Employment Type - saves correctly
- [ ] Update Availability - saves correctly
- [ ] Update Salary Expectation - saves correctly
- [ ] Update Work Preference (Remote, On-site, Hybrid) - saves correctly

### ✅ Professional Tab - Professional Summary

- [ ] Professional Summary section displays (if data exists)
- [ ] Overview text displays correctly
- [ ] Key Strengths badges display (if present)
- [ ] Current Focus displays (if present)
- [ ] Key Achievements list displays (if present)
- [ ] Looking For section displays (if present)
- [ ] Verify professional summary data maps from resume import

### ✅ Professional Tab - Work Experience History

- [ ] Click "Add Experience" button - form appears
- [ ] Add new work experience with all fields:
  - Company name
  - Role/Position
  - Client (if applicable)
  - Location
  - Start Date
  - End Date
  - Current Position checkbox
  - Project Type (Full-time, Part-time, Contract, Freelance, Consulting, Client Project)
  - Description
  - Technologies array
  - Achievements array
- [ ] Save work experience - appears in list
- [ ] Edit existing work experience - opens edit form
- [ ] Update work experience fields - saves correctly
- [ ] Delete work experience - removes from list
- [ ] Test "Current Position" checkbox - end date becomes disabled when checked
- [ ] Add technologies to work experience - tags appear
- [ ] Remove technologies from work experience - updates correctly
- [ ] Verify client field works for consulting work
- [ ] Test multiple work experiences - all display correctly
- [ ] Test empty state - "No work experience added yet" message shows

### ✅ Professional Tab - Projects Section

- [ ] Click "Add Project" button - form appears
- [ ] Add new project with all fields:
  - Project Title
  - Description
  - Technologies (add multiple)
  - Date
  - Project Link (Live Demo URL)
  - GitHub Link
- [ ] Save project - appears in list
- [ ] Edit existing project - opens edit form inline
- [ ] Update project fields - saves correctly
- [ ] Delete project - removes from list
- [ ] Test adding technologies to project - tags appear
- [ ] Test removing technologies from project
- [ ] Verify Live Demo link opens in new tab
- [ ] Verify GitHub link opens in new tab
- [ ] Test empty state - "No projects added yet" message shows
- [ ] Test projects with no links - displays correctly

### ✅ Professional Tab - Additional Sections (if implemented)

- [ ] Volunteer Experiences section (add, edit, delete)
- [ ] Recommendations section (add, edit, delete)
- [ ] Publications section (add, edit, delete)
- [ ] Patents section (add, edit, delete)
- [ ] Organizations section (add, edit, delete)
- [ ] Test Scores section (add, edit, delete)

### ✅ Skills & Expertise Tab - Technical Skills

- [ ] Skills list displays correctly (with proficiency badges)
- [ ] Add skill via input field - skill appears immediately
- [ ] Add skill by pressing Enter - skill added
- [ ] Verify skill proficiency levels display (Beginner, Intermediate, Advanced, Expert)
- [ ] Remove skill - skill disappears
- [ ] Test duplicate skill prevention - doesn't add duplicate
- [ ] Verify skill verification badges (if verified)
- [ ] Verify years of experience display (if present)
- [ ] Test empty state - placeholder shows when no skills
- [ ] Test skill hover effects

### ✅ Skills & Expertise Tab - Certifications

- [ ] Certifications list displays correctly
- [ ] Add certification via input field
- [ ] Certification appears with issuer, date
- [ ] Remove certification - removes from list
- [ ] Verify certification verification badges (if verified)
- [ ] Verify credential URL link (if present) - opens correctly
- [ ] Test expiry date display (if present)
- [ ] Test empty state - placeholder shows

### ✅ Skills & Expertise Tab - Languages

- [ ] Languages list displays correctly
- [ ] Add language via input field
- [ ] Language appears with proficiency level
- [ ] Remove language - removes from list
- [ ] Verify proficiency levels (Native, Fluent, Conversational, Basic)
- [ ] Test duplicate language prevention
- [ ] Test empty state - placeholder shows

### ✅ Career Goals Tab - Career Goals

- [ ] Career goals list displays correctly
- [ ] Each goal shows:
  - Title
  - Description
  - Target Date
  - Category badge
  - Progress bar with percentage
- [ ] Verify progress bars animate correctly
- [ ] Test empty state - "No career goals set yet" message shows
- [ ] Test goal deletion (if editing enabled)

### ✅ Career Goals Tab - Target Roles

- [ ] Target roles display as badges/tags
- [ ] Add target role via input field - role appears
- [ ] Add target role by pressing Enter - role added
- [ ] Remove target role - removes from list
- [ ] Test duplicate role prevention
- [ ] Test empty state display

### ✅ Career Goals Tab - Target Companies

- [ ] Target companies display as badges/tags
- [ ] Add target company via input field - company appears
- [ ] Add target company by pressing Enter - company added
- [ ] Remove target company - removes from list
- [ ] Test duplicate company prevention
- [ ] Test empty state display

### ✅ Career Goals Tab - Preferences

- [ ] Relocation Willingness dropdown works:
  - "Not willing to relocate"
  - "Open to relocation"
  - "Actively seeking relocation"
- [ ] Selection saves correctly
- [ ] Value persists after page refresh

### ✅ Portfolio Tab - Professional Links

- [ ] Social Links/Professional Links section displays
- [ ] Click "Add Link" button - modal opens
- [ ] Add link with platform (LinkedIn, GitHub, Twitter, Behance, Dribbble, Medium, Personal Website) and URL
- [ ] Save link - appears in grid/list
- [ ] Edit existing link - opens edit form
- [ ] Update link fields - saves correctly
- [ ] Delete link - removes from list
- [ ] Verify link cards display correctly
- [ ] Test empty state - "No professional links yet" message shows
- [ ] Test invalid URL format - validation works

### ✅ Portfolio Tab - Featured Projects

- [ ] Projects list displays correctly
- [ ] Click "Add Project" button - modal opens
- [ ] Add project with all fields:
  - Title
  - Description
  - Technologies (add multiple)
  - Date
  - Live Demo URL
  - GitHub URL
- [ ] Save project - appears in list
- [ ] Edit existing project - opens inline edit form
- [ ] Update project fields - saves correctly
- [ ] Delete project - removes from list
- [ ] Verify project links open in new tabs
- [ ] Test empty state - "No projects yet" message shows

### ✅ Portfolio Tab - Awards & Achievements

- [ ] Achievements list displays correctly
- [ ] Click "Add Achievement" button - modal opens
- [ ] Add achievement with all fields:
  - Type (Award, Publication, Speaking Engagement, Certification)
  - Title
  - Description
  - Date
  - Link (optional)
- [ ] Save achievement - appears in list
- [ ] Edit existing achievement - opens inline edit form
- [ ] Update achievement fields - saves correctly
- [ ] Delete achievement - removes from list
- [ ] Verify achievement type icons display correctly
- [ ] Test empty state - "No achievements yet" message shows

### ✅ Portfolio Tab - Quick Links

- [ ] Portfolio Website field - saves correctly
- [ ] LinkedIn field - saves correctly
- [ ] GitHub field - saves correctly
- [ ] Personal Website field - saves correctly
- [ ] Test URL validation
- [ ] Test URL format auto-correction (http/https)

### ✅ Preferences Tab - Notification Preferences

- [ ] Job Alerts toggle - works and saves
- [ ] Email Notifications toggle - works and saves
- [ ] SMS Notifications toggle - works and saves
- [ ] Toggle states persist after refresh
- [ ] Verify toggle animations/transitions

### ✅ Preferences Tab - Privacy Settings

- [ ] Profile Visibility dropdown works:
  - Public
  - Recruiters Only
  - Private
- [ ] Privacy Level dropdown works:
  - Professional
  - Limited
  - Minimal
- [ ] Selections save correctly
- [ ] Values persist after page refresh

### ✅ Analytics Tab - Profile Metrics

- [ ] Profile Views metric displays correctly
- [ ] Applications Sent metric displays correctly
- [ ] Interviews Scheduled metric displays correctly
- [ ] Offers Received metric displays correctly
- [ ] Success Rate metric displays correctly
- [ ] Profile Completeness metric displays correctly
- [ ] Skills Match Rate metric displays correctly
- [ ] Average Response Time metric displays correctly
- [ ] All metric cards render without errors

### ✅ Analytics Tab - Performance Metrics

- [ ] Profile Completeness progress bar displays
- [ ] Progress bar animates correctly
- [ ] Helpful messages show based on completeness level
- [ ] Skills Match Rate progress bar displays
- [ ] Average Response Time progress bar displays
- [ ] All progress bars update when data changes

### ✅ Analytics Tab - Recent Activity

- [ ] Recent activity items display
- [ ] Activity timestamps display correctly
- [ ] Activity icons display correctly
- [ ] Activity list updates when new events occur

### ✅ Security Tab - Password Management

- [ ] Click "Change Password" button - modal opens
- [ ] Enter current password, new password, confirm password
- [ ] Test password validation (minimum length, complexity)
- [ ] Test password mismatch - error shows
- [ ] Test weak password - error shows
- [ ] Save password change - success message shows
- [ ] Modal closes after successful change

### ✅ Security Tab - Two-Factor Authentication (2FA)

- [ ] 2FA toggle displays current state (enabled/disabled)
- [ ] Click to enable 2FA - setup modal opens
- [ ] QR code displays (if implemented)
- [ ] Enter verification code - 2FA enables
- [ ] Test invalid verification code - error shows
- [ ] Test disable 2FA - confirmation works
- [ ] 2FA state persists after refresh

### ✅ Security Tab - Login Activity

- [ ] Login activity history displays
- [ ] Activity items show:
  - Device/OS information
  - Location (if available)
  - Timestamp
  - IP address (if available)
- [ ] Recent logins list correctly
- [ ] Activity list updates

### ✅ Security Tab - Privacy Settings

- [ ] Profile Visibility dropdown works (Public, Recruiters Only, Private)
- [ ] Show Contact Info toggle works
- [ ] Settings save correctly
- [ ] Settings persist after refresh

### ✅ Billing Tab - Current Plan

- [ ] Current plan displays correctly
- [ ] Plan name, price, billing cycle show
- [ ] Plan features list displays
- [ ] Click "Upgrade Plan" - works (if implemented)
- [ ] Click "Cancel Subscription" - modal opens

### ✅ Billing Tab - Payment Method

- [ ] Current payment method displays (card ending in XXXX)
- [ ] Expiry date displays
- [ ] Click "Update" button - payment modal opens
- [ ] Enter new card details (card number, holder name, expiry, CVV)
- [ ] Test card number validation
- [ ] Test expiry date validation
- [ ] Test CVV validation
- [ ] Save payment method - success message shows
- [ ] Updated payment method displays

### ✅ Billing Tab - Billing History

- [ ] Billing history list displays
- [ ] Each entry shows:
  - Plan name
  - Billing period
  - Amount
  - Download invoice button
- [ ] Click "Download" - invoice downloads (if implemented)
- [ ] Multiple billing entries display correctly

### ✅ Billing Tab - Usage Statistics

- [ ] Usage stats display:
  - Applications Sent this month
  - Interviews this month
  - Offers this month
- [ ] Statistics update correctly
- [ ] Stats cards render without errors

### ✅ Billing Tab - Cancel Subscription Modal

- [ ] Modal opens when "Cancel Subscription" clicked
- [ ] Warning message displays
- [ ] Current plan details show
- [ ] Access expiration date shows
- [ ] Click "Keep Subscription" - modal closes
- [ ] Click "Yes, Cancel Subscription" - cancellation processes
- [ ] Success message displays

### ✅ Support Tab - Get Help

- [ ] Help Center card displays
- [ ] Click "Visit Help Center" - opens (if implemented)
- [ ] Live Chat card displays
- [ ] Click "Start Chat" - opens chat (if implemented)

### ✅ Support Tab - Contact Us

- [ ] Email Support card displays
- [ ] Email address link works (mailto:)
- [ ] Phone Support card displays
- [ ] Phone number link works (tel:)
- [ ] Documentation card displays
- [ ] Click "View Docs" - opens (if implemented)

### ✅ Support Tab - FAQ

- [ ] FAQ questions display
- [ ] FAQ answers display correctly
- [ ] All FAQ items render without errors

### ✅ Resume Import Functionality

- [ ] "Import Resume" button visible in header
- [ ] Click button - file picker opens
- [ ] Select PDF file - parsing starts
- [ ] Verify "Parsing Resume..." loading message shows
- [ ] After parsing, profile fields auto-fill:
  - Personal Information (name, email, phone, location)
  - Professional Summary/Bio
  - Current Role and Company
  - Work Experience History
  - Skills
  - Education
  - Certifications
  - Projects
  - Social Links (LinkedIn, GitHub, Website)
- [ ] Success message shows with field count
- [ ] Edit mode automatically enabled after import
- [ ] Review imported data - accuracy check
- [ ] Save imported data - persists
- [ ] Try DOCX file - works
- [ ] Try DOC file - works (if supported)
- [ ] Try TXT file - works (if supported)
- [ ] Try invalid file type - error shows
- [ ] Try corrupted file - error shows
- [ ] Try file > 10MB - error shows
- [ ] Try scanned PDF (image-based) - appropriate error shows
- [ ] Test error messages are clear and helpful

### ✅ Edit Mode & Save Functionality

- [ ] Click "Edit" button - all editable fields become active
- [ ] Make changes across multiple tabs
- [ ] Click "Save" - shows loading state
- [ ] Success message appears after save
- [ ] Changes persist after page refresh
- [ ] Click "Cancel" - changes discarded
- [ ] Verify no data loss when canceling
- [ ] Test save with network error - error message shows
- [ ] Test save while offline - appropriate error shows

### ✅ Data Persistence

- [ ] Make changes in any tab
- [ ] Click "Save"
- [ ] Refresh page (F5)
- [ ] Verify all changes persisted
- [ ] Test persistence across browser sessions
- [ ] Test persistence with multiple tabs open

### ✅ Error Handling

- [ ] Save with invalid email - error shows
- [ ] Save with invalid URL - error shows
- [ ] Try to save while offline - error shows
- [ ] Test server errors (500, 503) - appropriate message shows
- [ ] Test authentication errors (401) - session expired message shows
- [ ] Cancel editing - changes discarded
- [ ] Error messages are clear and helpful
- [ ] Error messages auto-dismiss (after timeout)
- [ ] Network timeout errors handled gracefully

### ✅ Success Messages

- [ ] Save profile - success message appears
- [ ] Upload picture - success message appears
- [ ] Import resume - success message appears
- [ ] Messages auto-dismiss after timeout
- [ ] Success messages are non-intrusive

### ✅ Loading States

- [ ] Profile loads with spinner initially
- [ ] Saving shows loading state (button disabled)
- [ ] Uploading picture shows loading state
- [ ] Parsing resume shows loading state
- [ ] Loading states don't block UI unnecessarily
- [ ] Loading indicators are clear and visible

### ✅ UI/UX - Visual Consistency

- [ ] All tabs use consistent styling
- [ ] Color theme applies correctly throughout
- [ ] Icons display correctly
- [ ] Typography is consistent
- [ ] Spacing and padding are consistent
- [ ] Cards and containers render correctly
- [ ] Buttons have proper hover states
- [ ] Input fields have proper focus states

### ✅ UI/UX - Responsive Design

- [ ] Profile tab works on desktop (1920px+)
- [ ] Profile tab works on tablet (768px - 1024px)
- [ ] Profile tab works on mobile (< 768px)
- [ ] Sidebar collapses/hides appropriately on mobile
- [ ] Forms stack vertically on mobile
- [ ] Modals are responsive
- [ ] Images scale correctly
- [ ] Text is readable at all sizes

### ✅ Accessibility

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Form labels are properly associated
- [ ] Error messages are announced (if screen reader tested)
- [ ] Color contrast meets WCAG standards
- [ ] Images have alt text
- [ ] ARIA labels present where needed

---

## Test Scenarios

### Scenario 1: New User Profile Setup

1. Register new account
2. Navigate to Profile tab
3. Import resume
4. Review and edit auto-filled data
5. Upload profile picture
6. Complete all sections:
   - Personal Information
   - Professional details
   - Skills
   - Career Goals
   - Portfolio items
7. Save all changes
8. Verify everything persisted
9. Check profile completeness percentage

### Scenario 2: Edit Existing Profile

1. Login with existing account
2. Navigate to Profile tab
3. Click Edit
4. Update multiple fields across different tabs:
   - Personal Information
   - Professional Summary
   - Work Experience
   - Skills
   - Career Goals
   - Portfolio
5. Save changes
6. Verify all updates persisted
7. Refresh page - verify persistence

### Scenario 3: Profile Picture Only

1. Navigate to Profile tab
2. Upload new profile picture
3. Don't save other changes
4. Verify picture updated immediately
5. Refresh page - verify picture persists

### Scenario 4: Resume Import & Edit

1. Import a resume
2. Review auto-filled data
3. Make corrections to:
   - Work experience dates
   - Skills list
   - Professional summary
4. Add additional information not in resume
5. Save changes
6. Verify accuracy
7. Re-import same resume - verify merge behavior

### Scenario 5: Work Experience Management

1. Add multiple work experiences
2. Edit each experience with different project types
3. Add technologies to experiences
4. Mark one as current position
5. Delete an experience
6. Save and verify all changes

### Scenario 6: Portfolio Building

1. Add professional links
2. Add multiple projects with technologies
3. Add achievements
4. Edit portfolio items
5. Delete items
6. Save and verify

### Scenario 7: Security Settings

1. Change password
2. Enable 2FA
3. Update privacy settings
4. Review login activity
5. Verify all changes persisted

### Scenario 8: Billing Management

1. View current plan
2. Update payment method
3. View billing history
4. Test cancel subscription flow (don't actually cancel)
5. Verify all billing data displays correctly

---

## Known Issues to Check

- [ ] Profile picture upload works correctly
- [ ] JSON arrays (skills, education, work experiences) save and load properly
- [ ] Resume parsing extracts accurate information
- [ ] All fields map correctly from resume to profile
- [ ] No console errors during normal operation
- [ ] Mobile responsive (test on actual device)
- [ ] Large data sets don't cause performance issues
- [ ] File upload limits enforced correctly
- [ ] Validation messages are helpful
- [ ] Loading states don't cause UI flicker

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

- **What you were doing**: Description of actions taken
- **Expected behavior**: What should have happened
- **Actual behavior**: What actually happened
- **Error messages**: Any error messages displayed
- **Browser console errors**: Check browser DevTools console
- **Network tab errors**: Check browser Network tab for failed requests
- **Screenshot**: If applicable, include screenshot
- **Browser & OS**: e.g., Chrome 120 on Windows 11
- **Steps to reproduce**: Detailed steps if issue is reproducible

---

## Additional Testing Notes

### Performance Testing

- [ ] Profile loads in < 2 seconds
- [ ] Save operation completes in < 1 second
- [ ] Resume import completes in < 10 seconds
- [ ] No lag when typing in fields
- [ ] Smooth transitions and animations

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Edge Cases

- [ ] Very long text in bio (test character limit)
- [ ] Special characters in fields (test encoding)
- [ ] Empty arrays vs null vs undefined (test data handling)
- [ ] Multiple rapid saves (test debouncing/throttling)
- [ ] Large file uploads (test close to limit)
- [ ] Unicode characters in all fields
- [ ] Extremely long URLs
- [ ] Multiple work experiences (test 20+ items)
