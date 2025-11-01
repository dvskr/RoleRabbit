# Cloud Storage Testing Checklist

## Prerequisites (Do These First!)

### 1. Database Migration

```bash
cd apps/api
npx prisma migrate dev --name add_cloud_storage_features
npx prisma generate
```

This adds all the cloud storage tables (CloudFolder, FileShare, Credential) to your database.

### 2. Restart Servers

After migration:

```bash
# Restart Node.js API
cd apps/api
npm run dev

# Restart Next.js frontend (in another terminal)
cd apps/web
npm run dev
```

---

## Manual Testing Checklist

### ✅ Cloud Storage Tab Access & Navigation

- [ ] Navigate to Cloud Storage tab in the application
- [ ] Verify tab navigation displays:
  - Files tab (with file count)
  - Credentials tab (with credential count and expiring credentials badge)
- [ ] Click Files tab - files view displays
- [ ] Click Credentials tab - credentials view displays
- [ ] Verify active tab is highlighted
- [ ] Verify storage info header displays (used/total storage)

### ✅ Storage Header

- [ ] Storage usage bar displays correctly
- [ ] Used storage amount shows correctly
- [ ] Total storage limit shows correctly
- [ ] Percentage calculation is correct
- [ ] "Upload" button works - opens upload modal
- [ ] "Refresh" button works - reloads files
- [ ] Storage info updates after file operations

### ✅ Files Tab - View Modes

- [ ] Grid view displays files in grid layout
- [ ] List view displays files in list layout
- [ ] Compact view displays files in compact layout
- [ ] Switch between view modes - layout changes correctly
- [ ] View mode preference persists (if implemented)
- [ ] Files render correctly in all view modes

### ✅ Files Tab - Search & Filters

- [ ] Search input field works
- [ ] Type in search - results filter in real-time
- [ ] Search works across file names, tags, descriptions
- [ ] Clear search - all files display again
- [ ] Filter by file type dropdown works:
  - All
  - Resume
  - Template
  - Backup
  - Cover Letter
  - Transcript
  - Certification
  - Reference
  - Portfolio
  - Work Sample
- [ ] Filter persists when switching tabs
- [ ] Filter clears correctly

### ✅ Files Tab - Sorting

- [ ] Sort by Name - files sorted alphabetically
- [ ] Sort by Date - files sorted by last modified
- [ ] Sort by Size - files sorted by size
- [ ] Sort direction (ascending/descending) works
- [ ] Sort persists across operations
- [ ] Sort indicator shows current sort option

### ✅ Files Tab - Selection & Bulk Operations

- [ ] Click checkbox on file - file selects
- [ ] Click "Select All" - all files select
- [ ] Multiple files can be selected
- [ ] Selected files highlighted visually
- [ ] Selection count displays correctly
- [ ] Deselect individual files - updates count
- [ ] Delete selected files - confirmation dialog shows
- [ ] Confirm delete - selected files removed
- [ ] Cancel delete - files remain selected
- [ ] Selection clears after operations

### ✅ File Upload

- [ ] Click "Upload" button - modal opens
- [ ] Upload modal displays correctly
- [ ] File name input field works
- [ ] File type dropdown works (resume, template, backup)
- [ ] Tags input field works (comma-separated)
- [ ] Public/Private toggle works
- [ ] Select file from file picker - file name populates
- [ ] Upload button enabled when file selected
- [ ] Click "Upload" - file uploads
- [ ] Loading state shows during upload
- [ ] Success message appears after upload
- [ ] File appears in files list
- [ ] Upload modal closes after success
- [ ] Try upload without file name - validation error shows
- [ ] Test file size limits
- [ ] Test invalid file types - error shows

### ✅ File Cards - Grid View

- [ ] File cards display in grid layout
- [ ] File name displays correctly
- [ ] File type badge displays with correct color
- [ ] File size displays correctly
- [ ] Last modified date displays correctly
- [ ] Tags display correctly (if present)
- [ ] Star icon shows for starred files
- [ ] Public/Private icon displays correctly
- [ ] Share count displays (if shared)
- [ ] File card hover effects work
- [ ] Selection checkbox works
- [ ] Card click selects file

### ✅ File Cards - List View

- [ ] File cards display in list layout
- [ ] All file information visible
- [ ] Actions menu accessible
- [ ] Selection checkbox works
- [ ] Row hover effects work
- [ ] Compact information displays correctly

### ✅ File Actions - Edit

- [ ] Click edit button/icon on file - edit dialog opens
- [ ] File name field editable
- [ ] Update file name - saves correctly
- [ ] Cancel edit - changes discarded
- [ ] Empty file name - validation error shows
- [ ] Edit persists after page refresh

### ✅ File Actions - Download

- [ ] Click download button - download menu appears
- [ ] Select PDF format - file downloads as PDF
- [ ] Select DOC format - file downloads as DOC
- [ ] Download count increments
- [ ] Download works for different file types
- [ ] Download with slow network - loading state shows

### ✅ File Actions - Share

- [ ] Click share button - share modal opens
- [ ] Share modal displays correctly
- [ ] "Share with User" section displays
- [ ] Enter user email - validation works
- [ ] Select permission level (view, comment, edit, admin)
- [ ] Add share - share created
- [ ] Shared users list updates
- [ ] Permission badges display correctly
- [ ] Remove share - share removed
- [ ] Update permission - permission changes
- [ ] Share link generation works (if implemented)
- [ ] Copy share link works (if implemented)
- [ ] Share expiration date works (if implemented)

### ✅ File Actions - Star/Unstar

- [ ] Click star icon - file stars
- [ ] Starred file shows filled star icon
- [ ] Click again - file unstars
- [ ] Starred files filter works (if implemented)
- [ ] Star state persists after refresh

### ✅ File Actions - Archive

- [ ] Click archive button - file archives
- [ ] Archived file shows archive indicator
- [ ] Archive filter shows archived files
- [ ] Unarchive works
- [ ] Archive state persists after refresh

### ✅ File Actions - Toggle Public/Private

- [ ] Click public/private toggle - status changes
- [ ] Public icon shows for public files
- [ ] Private icon shows for private files
- [ ] Toggle state persists after refresh
- [ ] Public files accessible via share links (if implemented)

### ✅ File Actions - Delete

- [ ] Click delete button - confirmation dialog shows
- [ ] Confirm delete - file removed
- [ ] Cancel delete - file remains
- [ ] Delete multiple files - all removed
- [ ] Delete from context menu works
- [ ] Deleted file doesn't appear in list

### ✅ File Comments

- [ ] Click comments icon - comments panel opens
- [ ] Comments list displays
- [ ] Add comment - comment appears
- [ ] Comment timestamp displays correctly
- [ ] User avatar/name displays (if available)
- [ ] Edit own comment works (if implemented)
- [ ] Delete own comment works (if implemented)
- [ ] Reply to comment works (if implemented)
- [ ] Resolve comment works (if implemented)
- [ ] Comments persist after refresh

### ✅ File Tags

- [ ] File tags display correctly
- [ ] Tags have appropriate styling
- [ ] Click tag - filter by tag works (if implemented)
- [ ] Tags persist after refresh
- [ ] Multiple tags display correctly

### ✅ Folder Sidebar

- [ ] Folder sidebar displays on left
- [ ] "All Files" option shows at top
- [ ] All folders list displays
- [ ] Folder name displays correctly
- [ ] Folder color indicator shows
- [ ] File count displays for each folder
- [ ] Click folder - files filter to that folder
- [ ] Selected folder highlighted
- [ ] "All Files" selected by default

### ✅ Folder Management - Create

- [ ] Click "Create Folder" button - modal opens
- [ ] Folder name input works
- [ ] Color picker works (if implemented)
- [ ] Enter folder name - folder creates
- [ ] New folder appears in sidebar
- [ ] Folder file count starts at 0
- [ ] Create folder without name - validation error shows
- [ ] Cancel create - modal closes, no folder created
- [ ] Duplicate folder name handling works

### ✅ Folder Management - Rename

- [ ] Click rename icon on folder - rename modal opens
- [ ] Current folder name pre-filled
- [ ] Update folder name - saves correctly
- [ ] Folder name updates in sidebar
- [ ] Cancel rename - no changes
- [ ] Empty folder name - validation error shows
- [ ] Rename persists after refresh

### ✅ Folder Management - Delete

- [ ] Click delete icon on folder - confirmation dialog shows
- [ ] Confirm delete - folder removed
- [ ] Files in deleted folder move to "All Files"
- [ ] Cancel delete - folder remains
- [ ] Delete folder with subfolders - error/prevention works
- [ ] Deleted folder no longer appears

### ✅ Folder Management - Nested Folders (if implemented)

- [ ] Create folder inside another folder
- [ ] Nested folder displays correctly
- [ ] Folder hierarchy shows with indentation
- [ ] Select nested folder - files filter correctly
- [ ] Move folder to another folder works
- [ ] Delete parent folder - nested folders handled correctly

### ✅ File Organization - Move to Folder

- [ ] Select file(s)
- [ ] Click "Move to Folder" (if implemented)
- [ ] Folder selector opens
- [ ] Select destination folder
- [ ] File moves to folder
- [ ] File count updates in folders
- [ ] File appears in correct folder view

### ✅ Credentials Tab - Overview

- [ ] Credentials tab displays correctly
- [ ] Credentials list displays
- [ ] Expiring credentials section shows (if any expiring)
- [ ] Reminders count badge displays
- [ ] Empty state shows when no credentials

### ✅ Credentials Tab - Credential List

- [ ] All credentials display correctly
- [ ] Credential card shows:
  - Credential name
  - Credential type badge
  - Issuer
  - Issue date
  - Expiration date (if applicable)
  - Verification status badge
- [ ] Credential cards have hover effects
- [ ] Click credential - view modal opens (if implemented)

### ✅ Credentials Tab - Add Credential

- [ ] Click "Add Credential" button - modal opens
- [ ] Credential type dropdown works:
  - Certification
  - License
  - Visa
  - Degree
  - Badge
- [ ] Credential name input works
- [ ] Issuer input works
- [ ] Credential ID input works (optional)
- [ ] Issue date picker works
- [ ] Expiration date picker works (optional)
- [ ] Verification URL input works (optional)
- [ ] Description textarea works (optional)
- [ ] Submit form - credential created
- [ ] New credential appears in list
- [ ] Modal closes after creation
- [ ] Validation errors show for required fields
- [ ] Cancel button - modal closes, no credential created

### ✅ Credentials Tab - View Credential

- [ ] Click credential card - view modal opens
- [ ] All credential details display
- [ ] QR code displays (if generated)
- [ ] Associated documents list shows (if any)
- [ ] Edit button works (if implemented)
- [ ] Delete button works (if implemented)
- [ ] Close modal - modal closes

### ✅ Credentials Tab - Edit Credential

- [ ] Click edit on credential - edit modal opens
- [ ] All fields pre-filled with current values
- [ ] Update fields - saves correctly
- [ ] Credential updates in list
- [ ] Cancel edit - no changes saved

### ✅ Credentials Tab - Delete Credential

- [ ] Click delete on credential - confirmation shows
- [ ] Confirm delete - credential removed
- [ ] Credential no longer appears in list
- [ ] Cancel delete - credential remains

### ✅ Credentials Tab - QR Code Generation

- [ ] Click "Generate QR Code" button
- [ ] QR code generates
- [ ] QR code displays in modal/view
- [ ] QR code can be downloaded (if implemented)
- [ ] QR code contains verification URL (if applicable)

### ✅ Credentials Tab - Expiring Credentials

- [ ] Expiring credentials section displays
- [ ] Reminders show correct expiration dates
- [ ] Priority badges display (high, medium, low)
- [ ] High priority reminders highlighted
- [ ] Reminder count badge updates
- [ ] Click reminder - opens credential view
- [ ] Reminders update when credentials expire

### ✅ Credentials Tab - Filtering & Sorting

- [ ] Filter by credential type works (if implemented)
- [ ] Filter by verification status works (if implemented)
- [ ] Sort by date works (if implemented)
- [ ] Sort by name works (if implemented)
- [ ] Search credentials works (if implemented)

### ✅ Floating Upload Button

- [ ] Floating upload button displays (on mobile/if implemented)
- [ ] Button positioned correctly
- [ ] Click button - upload modal opens
- [ ] Button has hover effects
- [ ] Button only shows in Files tab

### ✅ Empty States

- [ ] Empty state displays when no files
- [ ] Empty state shows appropriate message
- [ ] "Upload" button in empty state works
- [ ] Empty state for credentials displays correctly
- [ ] Empty state for filtered results shows message

### ✅ Loading States

- [ ] Loading spinner shows while fetching files
- [ ] Loading state shows during upload
- [ ] Loading state shows during folder operations
- [ ] Loading states don't block UI unnecessarily
- [ ] Loading indicators are clear and visible

### ✅ Error Handling

- [ ] Network error - appropriate error message shows
- [ ] Upload failure - error message shows
- [ ] Invalid file type - validation error shows
- [ ] File too large - size limit error shows
- [ ] Server error (500) - user-friendly message shows
- [ ] Authentication error (401) - redirect/login message shows
- [ ] Permission denied - appropriate error shows
- [ ] Error messages are clear and actionable
- [ ] Error messages auto-dismiss (if implemented)

### ✅ Data Persistence

- [ ] Upload file - file persists after refresh
- [ ] Create folder - folder persists after refresh
- [ ] Edit file - changes persist after refresh
- [ ] Delete file - deletion persists after refresh
- [ ] Share file - share persists after refresh
- [ ] Star file - star state persists after refresh
- [ ] Archive file - archive state persists after refresh
- [ ] All data persists across browser sessions

### ✅ Storage Limits

- [ ] Storage usage updates after upload
- [ ] Storage usage updates after delete
- [ ] Storage bar fills correctly
- [ ] Warning shows near storage limit (if implemented)
- [ ] Upload blocked when storage full (if implemented)
- [ ] Storage limit upgrade option shows (if implemented)

### ✅ File Types Support

- [ ] Resume files upload and display correctly
- [ ] Template files upload and display correctly
- [ ] Backup files upload and display correctly
- [ ] Cover letter files work correctly
- [ ] Transcript files work correctly
- [ ] Certification files work correctly
- [ ] Reference files work correctly
- [ ] Portfolio files work correctly
- [ ] Work sample files work correctly
- [ ] File type icons display correctly
- [ ] File type badges have correct colors

### ✅ UI/UX - Visual Consistency

- [ ] All components use consistent styling
- [ ] Color theme applies correctly
- [ ] Icons display correctly
- [ ] Typography is consistent
- [ ] Spacing and padding are consistent
- [ ] Cards render correctly
- [ ] Buttons have proper hover states
- [ ] Input fields have proper focus states
- [ ] Modals styled consistently

### ✅ UI/UX - Responsive Design

- [ ] Cloud storage works on desktop (1920px+)
- [ ] Cloud storage works on tablet (768px - 1024px)
- [ ] Cloud storage works on mobile (< 768px)
- [ ] Folder sidebar collapses on mobile (if implemented)
- [ ] Grid view adapts to screen size
- [ ] Modals are responsive
- [ ] File cards scale correctly
- [ ] Text is readable at all sizes

### ✅ Accessibility

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Form labels are properly associated
- [ ] File operations work with keyboard
- [ ] Modal navigation works with keyboard
- [ ] Color contrast meets WCAG standards
- [ ] Icons have alt text/tooltips
- [ ] ARIA labels present where needed

---

## Test Scenarios

### Scenario 1: First-Time User - File Upload & Organization

1. Navigate to Cloud Storage
2. Upload a resume file
3. Create a folder named "Resumes"
4. Move uploaded file to folder
5. Upload another file
6. Add tags to files
7. Star one file
8. Refresh page
9. Verify all changes persisted

### Scenario 2: File Sharing Workflow

1. Upload a file
2. Share file with user email
3. Set permission to "Can Edit"
4. Verify share appears in shared users list
5. Update permission to "View Only"
6. Remove share
7. Create share link (if implemented)
8. Verify share link works

### Scenario 3: Folder Organization

1. Create multiple folders (Resumes, Templates, Certifications)
2. Upload files to each folder
3. Verify file counts update
4. Rename a folder
5. Delete a folder
6. Verify files moved to "All Files"
7. Create nested folder (if implemented)

### Scenario 4: Credential Management

1. Switch to Credentials tab
2. Add a certification credential
3. Add expiration date
4. Generate QR code
5. Edit credential details
6. View credential details
7. Delete credential
8. Verify credential removed

### Scenario 5: Search & Filter

1. Upload multiple files with different types
2. Add tags to files
3. Search for file by name - results filter
4. Filter by file type - only that type shows
5. Clear search and filter - all files show
6. Combine search and filter - works correctly

### Scenario 6: Bulk Operations

1. Upload multiple files
2. Select all files
3. Delete selected files - confirmation shows
4. Cancel deletion
5. Select subset of files
6. Delete selected - files removed
7. Verify remaining files still present

### Scenario 7: File Actions - Complete Workflow

1. Upload a file
2. Edit file name
3. Add tags to file
4. Star the file
5. Share file with user
6. Add comment to file
7. Download file as PDF
8. Archive file
9. Unarchive file
10. Delete file

### Scenario 8: Expiring Credentials

1. Add credential with expiration date (30 days from now)
2. Verify it appears in expiring credentials
3. Add credential expiring tomorrow (high priority)
4. Verify priority badge shows
5. Add credential expiring in 90 days (low priority)
6. Verify all reminders display correctly
7. Edit expiration date - reminder updates

---

## Known Issues to Check

- [ ] File upload works correctly for all file types
- [ ] Folder creation/deletion doesn't cause errors
- [ ] File sharing permissions work correctly
- [ ] Storage usage calculation is accurate
- [ ] No console errors during normal operation
- [ ] Mobile responsive (test on actual device)
- [ ] Large file sets don't cause performance issues
- [ ] File operations complete without timeout
- [ ] Credential data persists correctly
- [ ] QR code generation works reliably

---

## Quick Test (5 minutes)

If you want a quick test:

1. Navigate to Cloud Storage tab
2. Upload a file
3. Create a folder
4. Move file to folder
5. Verify file appears in folder
6. Switch to Credentials tab
7. Add a credential
8. Verify credential appears
9. Refresh page
10. Verify all changes persisted

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

- [ ] Files load in < 2 seconds
- [ ] Upload completes in reasonable time
- [ ] Folder operations are responsive
- [ ] Search filters in real-time without lag
- [ ] No lag when scrolling through many files
- [ ] Smooth transitions and animations

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Edge Cases

- [ ] Very long file names (test truncation)
- [ ] Files with special characters in names
- [ ] Empty file upload (test validation)
- [ ] Multiple rapid uploads (test queue/throttling)
- [ ] Large number of files (test pagination/virtual scrolling)
- [ ] Files with very long tags
- [ ] Folders with many subfolders
- [ ] Sharing with invalid email addresses
- [ ] Concurrent operations (upload while deleting)
- [ ] Network interruption during upload
- [ ] Storage at capacity limits

### Security Testing

- [ ] Users can only access their own files
- [ ] File sharing permissions enforced correctly
- [ ] Private files not accessible without permission
- [ ] Share links require authentication (if implemented)
- [ ] Expired shares no longer work (if implemented)
- [ ] File deletion requires confirmation
- [ ] Folder deletion requires confirmation
- [ ] Credential data encrypted/stored securely

