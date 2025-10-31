# Dashboard Refactored Components - Testing Checklist

This checklist helps verify that the refactored components work correctly after extraction.

## Components to Test

1. **ResumePreview** (`components/ResumePreview.tsx`)
2. **DashboardModals** (`components/DashboardModals.tsx`)
3. **Export HTML Generator** (`utils/exportHtmlGenerator.ts`)

---

## Test Execution

### Automated Tests

Run the test suite:
```bash
cd apps/web
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run specific test file:
```bash
npm test -- ResumePreview.test.tsx
npm test -- exportHtmlGenerator.test.ts
npm test -- DashboardModals.test.tsx
```

---

## Manual Testing Checklist

### 1. ResumePreview Component

#### Test Preview Mode Display
- [ ] Navigate to Dashboard → Resume Editor
- [ ] Click "Preview" button (eye icon)
- [ ] Verify preview header shows "Preview: [filename]"
- [ ] Verify "Exit Preview" button is visible and functional
- [ ] Verify resume content displays correctly:
  - [ ] Name and title are shown
  - [ ] Contact information (email, phone, location) displays
  - [ ] Summary section renders when visible
  - [ ] Skills section displays with skill tags
  - [ ] Experience section shows with bullets
  - [ ] Education section displays
  - [ ] Projects section shows when present
  - [ ] Certifications section displays when present

#### Test Preview Styling
- [ ] Verify document has proper styling (8.5in width, shadow, padding)
- [ ] Verify font family is applied correctly
- [ ] Verify font size is applied correctly
- [ ] Verify line spacing is applied correctly
- [ ] Verify template classes are applied

#### Test Section Visibility
- [ ] Hide a section (e.g., Summary)
- [ ] Enter preview mode
- [ ] Verify hidden section doesn't appear
- [ ] Verify visible sections still render

### 2. DashboardModals Component

#### Test Export Modal
- [ ] Click Export button in Resume Editor
- [ ] Verify ExportModal appears
- [ ] Test PDF export:
  - [ ] Click "Export as PDF"
  - [ ] Verify print dialog opens
  - [ ] Verify HTML content is generated correctly
- [ ] Test Word export:
  - [ ] Click "Export as Word"
  - [ ] Verify .doc file downloads
  - [ ] Open file and verify content
- [ ] Test Print:
  - [ ] Click "Print"
  - [ ] Verify print dialog opens

#### Test Import Modal
- [ ] Click Import button
- [ ] Verify ImportModal appears
- [ ] Test file upload:
  - [ ] Select "Upload File"
  - [ ] Upload a resume JSON file
  - [ ] Verify resume data loads correctly
- [ ] Test cloud import:
  - [ ] Select "From Cloud Storage"
  - [ ] Verify cloud import modal opens

#### Test Section Management Modals
- [ ] Click "Add Section"
- [ ] Verify AddSectionModal appears
- [ ] Add a new section:
  - [ ] Enter section name
  - [ ] Enter section content
  - [ ] Click "Add Section"
  - [ ] Verify section appears in resume
- [ ] Click "Add Field"
- [ ] Verify AddFieldModal appears
- [ ] Add a custom field and verify it works

#### Test AI Generate Modal
- [ ] Click AI Generate button on any section
- [ ] Verify AIGenerateModal appears
- [ ] Test AI generation:
  - [ ] Enter prompt
  - [ ] Select writing tone
  - [ ] Select content length
  - [ ] Click "Generate"
  - [ ] Verify content is generated (or mocked response appears)

#### Test Cloud Storage Modals
- [ ] Click "Save to Cloud"
- [ ] Verify ResumeSaveToCloudModal appears
- [ ] Enter file name, description, tags
- [ ] Click "Save"
- [ ] Verify save functionality works
- [ ] Click "Import from Cloud"
- [ ] Verify ResumeImportFromCloudModal appears
- [ ] Select a resume file
- [ ] Click "Load"
- [ ] Verify resume loads correctly

#### Test Analytics Modals
- [ ] Open Resume Sharing modal
- [ ] Verify ResumeSharing component appears
- [ ] Open Cover Letter Analytics
- [ ] Verify CoverLetterAnalytics appears
- [ ] Open Email Analytics
- [ ] Verify EmailAnalytics appears
- [ ] Open Application Analytics
- [ ] Verify ApplicationAnalytics appears

### 3. Export HTML Generator

#### Test HTML Generation
- [ ] Export resume as PDF
- [ ] In the generated HTML, verify:
  - [ ] Document structure is valid HTML
  - [ ] Title contains resume filename
  - [ ] Resume name and title are in body
  - [ ] Contact information is included
  - [ ] All visible sections are included
  - [ ] Hidden sections are excluded
  - [ ] Font family is applied correctly
  - [ ] Font size and line spacing are applied
  - [ ] CSS styles are included

#### Test Section Rendering
- [ ] Export with Summary visible → verify Summary appears
- [ ] Export with Skills visible → verify Skills appear as tags
- [ ] Export with Experience → verify experience items render with bullets
- [ ] Export with Education → verify education items render
- [ ] Export with Projects → verify projects render
- [ ] Export with Certifications → verify certifications render
- [ ] Export with Custom Sections → verify custom sections appear

#### Test Template Handling
- [ ] Export with different templates:
  - [ ] Blue template → verify blue styling
  - [ ] Green template → verify green styling
  - [ ] Default template → verify default styling
- [ ] Export with null template → verify fallback styling

#### Test Font Handling
- [ ] Export with Arial font → verify Arial in CSS
- [ ] Export with Times font → verify Times New Roman in CSS
- [ ] Export with custom font size → verify size in CSS

---

## Integration Testing

### Test Component Interaction
- [ ] Create a resume with all sections
- [ ] Enter preview mode → verify ResumePreview renders correctly
- [ ] Exit preview mode → verify ResumeEditor returns
- [ ] Export resume → verify HTML is generated correctly
- [ ] Import resume → verify all data loads correctly
- [ ] Add custom section → verify it appears in preview and export

### Test Error Handling
- [ ] Test with empty resume data
- [ ] Test with missing sections
- [ ] Test with invalid template ID
- [ ] Test with null template ID
- [ ] Verify no console errors appear

---

## Performance Testing

- [ ] Verify modals open quickly (< 200ms)
- [ ] Verify preview renders smoothly
- [ ] Verify HTML generation is fast (< 100ms for typical resume)
- [ ] Verify no memory leaks when opening/closing modals repeatedly

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## Notes

- All automated tests should pass
- All manual test items should be verified
- Document any issues found during testing
- Performance should match or exceed original implementation

