# Resume Editor - Complete Analysis Document

> **Status:** 🟡 In Progress  
> **Phase:** Phase 1 - Analysis  
> **Last Updated:** 2025-11-07  
> **Analysis Started:** 2025-11-07

---

## 1. UI Component Inventory

### Main Component Structure
- **File:** `apps/web/src/components/features/ResumeEditor.tsx`
- **Size:** 337 lines
- **Type:** React Functional Component (Client Component)
- **Layout:** Flex layout with left sidebar (collapsible) and main editing area
- **Responsive:** Yes (lg:flex-row, hidden lg:flex)

### Sub-Components Used
1. **MultiResumeManager** - Template/resume selection (`apps/web/src/components/features/MultiResumeManager.tsx`)
2. **CollapsedSidebar** - Collapsed sidebar view (`apps/web/src/components/features/ResumeEditor/components/CollapsedSidebar.tsx`)
3. **FileNameSection** - File name input with AI generation (`apps/web/src/components/features/ResumeEditor/components/FileNameSection.tsx`)
4. **SectionsList** - Section management list (`apps/web/src/components/features/ResumeEditor/components/SectionsList.tsx`)
5. **NameInput** - Name input with character count (`apps/web/src/components/features/ResumeEditor/components/NameInput.tsx`)
6. **ContactFieldsGrid** - Contact fields grid with validation (`apps/web/src/components/features/ResumeEditor/components/ContactFieldsGrid.tsx`)
7. **FormattingPanel** - Formatting options panel (`apps/web/src/components/features/ResumeEditor/components/FormattingPanel.tsx`)
8. **SectionItem** - Individual section item (`apps/web/src/components/features/ResumeEditor/components/SectionItem.tsx`)
9. **ConflictIndicator** - Shows autosave conflict state (`apps/web/src/components/ConflictIndicator.tsx`)
10. **ToastContainer / ToastComponent** - Toast notifications for save/error feedback (`apps/web/src/components/Toast.tsx`)
11. **Loading** - Generic loading spinner/text during data fetch (`apps/web/src/components/Loading.tsx`)

### Buttons

#### Left Sidebar Buttons
1. **Generate Smart Filename** (Sparkles icon)
   - Location: FileNameSection component
   - Action: Calls `onGenerateSmartFileName()`
   - Style: Purple badge background

2. **Add Custom Section** (Plus icon)
   - Location: SectionsList component
   - Action: Opens AddSectionModal (`onShowAddSectionModal()`)
   - Style: Success badge background

3. **Toggle Section Visibility** (Eye/EyeOff icon)
   - Location: SectionItem component
   - Action: Toggles section visibility (`onToggleSection()`)
   - Style: Blue when visible, gray when hidden

4. **Move Section Up** (Up arrow SVG)
   - Location: SectionItem component
   - Action: Moves section up (`onMoveSection(index, 'up')`)
   - Condition: Only shown if `index > 0`

5. **Move Section Down** (Down arrow SVG)
   - Location: SectionItem component
   - Action: Moves section down (`onMoveSection(index, 'down')`)
   - Condition: Only shown if `index < totalSections - 1`

6. **Reset to Default** (Circle icon)
   - Location: FormattingPanel component
   - Action: Resets formatting to defaults (`onResetToDefault()`)
   - Style: Input background with border

#### Header Toolbar Buttons
1. **Collapse**
   - Location: Top toolbar (leftmost)
   - Action: Toggles sidebar collapse/expand state via `useDashboardUI`
   - Notes: Mirrors sidebar chevron icon state

2. **Clear**
   - Location: Top toolbar
   - Action: Triggers resume reset flow (`onClearResume`) to wipe current data (confirmation modal expected)
   - Notes: Styled as destructive text button

3. **Import**
   - Location: Top toolbar
   - Action: Opens `ImportModal` with options for file upload and Cloud import
   - Notes: Uses `handleJsonImport` implemented in `DashboardPageClient`

4. **Export**
   - Location: Top toolbar
   - Action: Opens `ExportModal` for PDF/DOCX/JSON export or cloud save
   - Notes: Icon button with label

5. **Preview**
   - Location: Top toolbar
   - Action: Toggles preview pane (table vs document view) using `useDashboardUI`
   - Notes: Switches between editing and preview layouts

6. **AI Assistant**
   - Location: Top toolbar (green button)
   - Action: Opens AI assistant side panel (chat-based guidance via `DashboardAI` components)
   - Notes: Requires authenticated OpenAI configuration

7. **Save**
   - Location: Top toolbar (rightmost)
   - Action: Forces manual save by calling `saveResume` in `useResumeData`
   - Notes: Complementary to auto-save; disabled while saving

#### Sidebar Navigation Buttons
1. **Dashboard** - Navigates to overview tab (`/dashboard?tab=overview`)
2. **Profile** - Opens profile management tab
3. **My Files** - Opens cloud storage tab
4. **Resume Builder** - Current tab (editor)
5. **Cover Letter** - Opens cover letter generator tab
6. **Portfolio Builder** - Opens portfolio designer tab
7. **Templates** - Navigates to template gallery
8. **AI Auto-Apply** - Opens job auto-apply workflow
9. **Job Tracker** - Opens job tracker board
10. **Email Hub** - Opens communication hub
11. **Community** - Opens community resources

#### Formatting Panel Buttons
7. **Font Size Options** (3 buttons: ATS 10pt, ATS 11pt, ATS 12pt)
   - Location: FormattingPanel
   - Action: Sets fontSize state
   - Style: Info badge when selected

8. **Section Spacing Options** (3 buttons: Tight, Medium, Loose)
   - Location: FormattingPanel
   - Action: Sets sectionSpacing state
   - Style: Info badge when selected

9. **Page Margins Options** (3 buttons: Narrow, Normal, Wide)
   - Location: FormattingPanel
   - Action: Sets margins state
   - Style: Info badge when selected

10. **Bullet Style Options** (6 buttons: disc, circle, square, arrow, check, dash)
    - Location: FormattingPanel
    - Action: Sets bulletStyle state
    - Style: Purple badge when selected

#### Template Manager Buttons
11. **Select Template** (Template card button)
    - Location: MultiResumeManager component
    - Action: Calls `onSelectTemplate(templateId)`
    - Shows: Active badge when selected

12. **Remove Template** (X icon)
    - Location: MultiResumeManager template card
    - Action: Calls `onRemoveTemplate(templateId)`
    - Condition: Disabled if only 1 template remains
    - Style: Red background, appears on hover

13. **Add Templates** (Plus button)
    - Location: MultiResumeManager
    - Action: Calls `onAddTemplates()` or `onNavigateToTemplates()`
    - Condition: Shown when templates < max (10)

### Input Fields

#### File Name Section
1. **Resume File Name Input**
   - Type: Text input
   - Location: FileNameSection component
   - Placeholder: "Enter filename..."
   - Validation: None (free text)
   - Required: No

#### Contact Fields Grid
2. **Email Input**
   - Type: Email input (`type="email"`)
   - Location: ContactFieldsGrid component
   - Placeholder: "Email"
   - Validation: ✅ Email validation (`validateEmail`)
   - Error Display: Red border + AlertCircle icon + error message
   - Required: No

3. **Phone Input**
   - Type: Tel input (`type="tel"`)
   - Location: ContactFieldsGrid component
   - Placeholder: "Phone"
   - Validation: ✅ Phone validation (`validatePhone`)
   - Error Display: Red border + AlertCircle icon + error message
   - Required: No

4. **Location Input**
   - Type: Text input
   - Location: ContactFieldsGrid component
   - Placeholder: "Location"
   - Validation: None
   - Required: No

5. **LinkedIn Input**
   - Type: Text input
   - Location: ContactFieldsGrid component
   - Placeholder: "Linkedin"
   - Validation: ✅ URL validation (`validateURL`)
   - URL Normalization: ✅ Auto-normalizes on blur
   - Error Display: Red border + AlertCircle icon + error message
   - Required: No

6. **Github Input**
   - Type: Text input
   - Location: ContactFieldsGrid component
   - Placeholder: "Github"
   - Validation: ✅ URL validation (`validateURL`)
   - URL Normalization: ✅ Auto-normalizes on blur
   - Error Display: Red border + AlertCircle icon + error message
   - Required: No

7. **Website Input**
   - Type: Text input
   - Location: ContactFieldsGrid component
   - Placeholder: "Website"
   - Validation: ✅ URL validation (`validateURL`)
   - URL Normalization: ✅ Auto-normalizes on blur
   - Error Display: Red border + AlertCircle icon + error message
   - Required: No

8. **Custom Fields** (Dynamic)
   - Type: Text input
   - Location: ContactFieldsGrid component
   - Placeholder: Field name
   - Validation: None
   - Required: No

#### Name Input
9. **Name Input**
   - Type: Text input
   - Location: NameInput component
   - Placeholder: "Your Name"
   - Max Length: ✅ MAX_LENGTHS.NAME (character limit)
   - Character Count: ✅ Shows when near limit (80% of max)
   - Validation: ✅ Length validation
   - Required: No

#### Title Input
10. **Title/Designation Input**
    - Type: Text input
    - Location: ResumeEditor main component (inline)
    - Placeholder: "Your Title / Designation"
    - Validation: None
    - Required: No

#### Formatting Panel Dropdowns
11. **Font Family Dropdown**
    - Type: Select dropdown
    - Location: FormattingPanel
    - Options: Arial, Times New Roman, Verdana
    - Action: Sets fontFamily state

12. **Line Spacing Dropdown**
    - Type: Select dropdown
    - Location: FormattingPanel
    - Options: Tight, Normal, Loose
    - Action: Sets lineSpacing state

13. **Heading Weight Dropdown**
    - Type: Select dropdown
    - Location: FormattingPanel
    - Options: Bold, Normal, Semibold
    - Action: Sets headingStyle state

### Modals

1. **ExportModal** (`apps/web/src/components/modals/ExportModal.tsx`)
   - Purpose: Export resume to PDF/DOCX/JSON
   - Triggers: Header export button
   - Features: PDF export, DOCX export, JSON export, Save to Cloud option

2. **ImportModal** (`apps/web/src/components/modals/ImportModal.tsx`)
   - Purpose: Import resume from file or JSON
   - Triggers: Header import button
   - Features: File upload, JSON paste (parsed through `handleJsonImport`), Import from Cloud option
   - Status: ⏳ To be tested end-to-end (JSON import handler implemented in `DashboardPageClient`)

3. **AddSectionModal** (`apps/web/src/components/modals/AddSectionModal.tsx`)
   - Purpose: Add custom section to resume
   - Triggers: Plus button in SectionsList
   - Features: Section name input, content textarea, AI generate option

4. **AddFieldModal** (`apps/web/src/components/modals/AddFieldModal.tsx`)
   - Purpose: Add custom contact field
   - Triggers: "Add Field" button in ContactFieldsGrid
   - Features: Field name input, icon selector

5. **NewResumeModal** (`apps/web/src/components/modals/NewResumeModal.tsx`)
   - Purpose: Create new resume
   - Triggers: Header "New Resume" button
   - Features: Resume name input, template selection

6. **AIGenerateModal** (`apps/web/src/components/modals/AIGenerateModal.tsx`)
   - Purpose: Generate content using AI
   - Triggers: AI generate button in sections
   - Features: Section selection, prompt input, tone selection, length selection

7. **ResumeSaveToCloudModal** (`apps/web/src/components/modals/ResumeSaveToCloudModal.tsx`)
   - Purpose: Save resume to cloud storage
   - Triggers: Export modal "Save to Cloud" option
   - Features: File name input, description input

8. **ResumeImportFromCloudModal** (`apps/web/src/components/modals/ResumeImportFromCloudModal.tsx`)
   - Purpose: Import resume from cloud storage
   - Triggers: Import modal "Import from Cloud" option
   - Features: List of cloud resumes, load option

9. **MobileMenuModal** (`apps/web/src/components/modals/MobileMenuModal.tsx`)
   - Purpose: Mobile navigation menu
   - Triggers: Mobile menu button
   - Features: Tab navigation

### Sections (Resume Content Sections)

1. **SummarySection** (`apps/web/src/components/sections/SummarySection.tsx`)
   - Purpose: Professional summary section
   - Features: Textarea input, AI generate button, hide section option

2. **SkillsSection** (`apps/web/src/components/sections/SkillsSection.tsx`)
   - Purpose: Skills list section
   - Features: Add/remove skills, skill input, AI generate button

3. **ExperienceSection** (`apps/web/src/components/sections/ExperienceSection.tsx`)
   - Purpose: Work experience section
   - Features: Add/remove experiences, company/role/date inputs, description, AI generate

4. **EducationSection** (`apps/web/src/components/sections/EducationSection.tsx`)
   - Purpose: Education section
   - Features: Add/remove education entries, institution/degree/date inputs

5. **ProjectsSection** (`apps/web/src/components/sections/ProjectsSection.tsx`)
   - Purpose: Projects section
   - Features: Add/remove projects, project details, AI generate

6. **CertificationsSection** (`apps/web/src/components/sections/CertificationsSection.tsx`)
   - Purpose: Certifications section
   - Features: Add/remove certifications, certification details

7. **Custom Sections** (Dynamic)
   - Purpose: User-created custom sections
   - Features: Custom name, custom content, edit/delete options

### Dropdowns

1. **Font Family Dropdown** - FormattingPanel
2. **Line Spacing Dropdown** - FormattingPanel
3. **Heading Weight Dropdown** - FormattingPanel
4. **Template Selection** - MultiResumeManager (horizontal scroller)

### Tooltips

- All buttons have `title` attributes for tooltips
- Section items show tooltips on hover
- Template cards show tooltips

### Loading States

1. **Resume Editor Loading** - Shows spinner + "Loading..." message using shared `Loading` component while lazy loading ResumeEditor
2. **Resume Data Loading** - Managed by `useResumeData` hook (`isLoading` state)
3. **Saving State** - Managed by `useResumeData` hook (`isSaving` state)

### Empty States

- Empty resume sections show placeholder text
- No empty state component found - needs verification

### Error States

1. **Validation Errors** - ContactFieldsGrid shows inline validation errors (AlertCircle + helper text)
2. **Save Errors** - `useResumeData` surfaces `saveError`; UI displays toast notification via `ToastContainer`
3. **Conflict Errors** - Autosave conflict banner rendered with `ConflictIndicator`

### Navigation Elements

- Sidebar navigation (via Dashboard component)
- Tab switching (editor tab active)
- Collapsible sidebar toggle
- Toolbar controls for preview toggle, manual save, AI assistant launch

### Visual Components

1. **Template Cards** - Horizontal scroller with template previews
2. **Section Cards** - Section items with visibility toggle
3. **Formatting Options** - Grid/button groups for formatting choices
4. **Contact Fields Grid** - Responsive grid (1/2/3 columns based on screen size)

---

## 2. User Workflow Maps

### Primary Flows (Must-Have Features)

#### Flow 1: Create New Resume
- **Entry Point:** Header "New Resume" button
- **Steps:**
  1. Click "New Resume" button
  2. NewResumeModal opens
  3. Enter resume name
  4. (Optional) Select template
  5. Click "Create"
  6. Resume created, editor loads with new resume
- **Expected Outcome:** New resume created and loaded in editor
- **Current Status:** ⏳ To be tested
- **Edge Cases:**
  - Duplicate resume name
  - No template selected
  - Empty resume name
- **Error Scenarios:**
  - API failure
  - Network error
  - Validation error

#### Flow 2: Edit Resume Content
- **Entry Point:** Resume Editor tab
- **Steps:**
  1. Navigate to Resume Editor tab
  2. Resume loads (or create new)
  3. Edit name, title, contact fields
  4. Edit sections (summary, skills, experience, etc.)
  5. Changes auto-save after 5 seconds
  6. See "Saved" confirmation
- **Expected Outcome:** All edits persist to database
- **Current Status:** ⏳ To be tested
- **Edge Cases:**
  - Rapid edits (debouncing)
  - Concurrent edits (conflict detection)
  - Offline editing
- **Error Scenarios:**
  - Save failure
  - Conflict detection
  - Network timeout

#### Flow 3: Apply Template
- **Entry Point:** Template scroller in sidebar
- **Steps:**
  1. View templates in horizontal scroller
  2. Click on template card
  3. Template styling applied
  4. Resume preview updates
- **Expected Outcome:** Template styling applied to resume
- **Current Status:** ⏳ To be tested
- **Edge Cases:**
  - Multiple templates added
  - Removing last template
  - Template not found
- **Error Scenarios:**
  - Template load failure
  - Styling application error

#### Flow 4: Add Custom Section
- **Entry Point:** Plus button in SectionsList
- **Steps:**
  1. Click "Add Custom Section" button
  2. AddSectionModal opens
  3. Enter section name
  4. (Optional) Enter content
  5. (Optional) Use AI to generate content
  6. Click "Add Section"
  7. Section appears in resume
- **Expected Outcome:** Custom section added and visible
- **Current Status:** ⏳ To be tested
- **Edge Cases:**
  - Duplicate section name
  - Empty section name
  - Very long section name
- **Error Scenarios:**
  - AI generation failure
  - Save failure

#### Flow 5: Export Resume
- **Entry Point:** Header export button
- **Steps:**
  1. Click export button
  2. ExportModal opens
  3. Select format (PDF/DOCX/JSON)
  4. Click export
  5. File downloads
  6. (Optional) Save to Cloud
- **Expected Outcome:** Resume exported in selected format
- **Current Status:** ⏳ To be tested
- **Edge Cases:**
  - Large resume (performance)
  - Empty resume
  - Special characters in filename
- **Error Scenarios:**
  - Export generation failure
  - Download failure
  - Cloud save failure

#### Flow 6: Import Resume
- **Entry Point:** Header import button
- **Steps:**
  1. Click import button
  2. ImportModal opens
  3. Select import method (File/JSON/Cloud)
  4. Upload file or paste JSON
  5. Click import
  6. Resume loads with imported data
- **Expected Outcome:** Resume imported and loaded
- **Current Status:** ⚠️ PARTIAL - TODO comment found, functionality incomplete
- **Edge Cases:**
  - Invalid file format
  - Corrupted JSON
  - Missing required fields
- **Error Scenarios:**
  - File parse error
  - Validation error
  - Import failure

### Secondary Flows (Nice-to-Have Features)

#### Flow 7: Reorder Sections
- **Entry Point:** SectionItem move buttons
- **Steps:**
  1. Click up/down arrows on section
  2. Section moves in order
  3. Changes auto-save
- **Expected Outcome:** Section order updated
- **Current Status:** ⏳ To be tested

#### Flow 8: Toggle Section Visibility
- **Entry Point:** Eye icon on SectionItem
- **Steps:**
  1. Click eye icon
  2. Section visibility toggles
  3. Section appears/disappears from resume
  4. Changes auto-save
- **Expected Outcome:** Section visibility updated
- **Current Status:** ⏳ To be tested

#### Flow 9: Format Resume
- **Entry Point:** FormattingPanel
- **Steps:**
  1. Adjust font family, size, spacing
  2. Adjust margins, heading style, bullet style
  3. Changes apply immediately
  4. Changes auto-save
- **Expected Outcome:** Formatting applied and saved
- **Current Status:** ⏳ To be tested

#### Flow 10: Add Custom Contact Field
- **Entry Point:** "Add Field" button in ContactFieldsGrid
- **Steps:**
  1. Click "Add Field"
  2. AddFieldModal opens
  3. Enter field name
  4. Select icon
  5. Click "Add"
  6. Field appears in contact grid
- **Expected Outcome:** Custom field added
- **Current Status:** ⏳ To be tested

#### Flow 11: Generate Smart Filename
- **Entry Point:** Sparkles icon in FileNameSection
- **Steps:**
  1. Click Sparkles icon
  2. Filename auto-generates based on name + title + date
  3. Filename updates
- **Expected Outcome:** Smart filename generated
- **Current Status:** ⏳ To be tested

#### Flow 12: AI Content Generation
- **Entry Point:** AI generate button in sections
- **Steps:**
  1. Click AI generate button
  2. AIGenerateModal opens
  3. Enter prompt (optional)
  4. Select tone and length
  5. Click generate
  6. Content generated and inserted
- **Expected Outcome:** AI-generated content inserted
- **Current Status:** ⏳ To be tested

#### Flow 13: Launch AI Assistant Panel
- **Entry Point:** Toolbar "AI Assistant" button
- **Steps:**
  1. Click green "AI Assistant" button in toolbar
  2. Assistant side panel slides into view
  3. Select prompt template or type question
  4. Submit prompt to receive guidance/content suggestions
- **Expected Outcome:** Assistant responds with actionable resume advice
- **Current Status:** ⏳ To be tested (requires configured OpenAI API key)

#### Flow 14: Clear Resume Data
- **Entry Point:** Toolbar "Clear" button
- **Steps:**
  1. Click "Clear" button
  2. Confirm action in modal (expected)
  3. Resume form resets to default/empty state
- **Expected Outcome:** Current resume data cleared without affecting stored history
- **Current Status:** ⏳ To be tested (confirm modal + data reset behavior)

---

## 3. Functionality Analysis

### Features List

| Feature | Expected | Implemented | Status | Mock Data? | Notes |
|---------|----------|------------|--------|------------|-------|
| Create Resume | ✅ | ✅ | ⏳ To test | No | NewResumeModal + API |
| Load Resume | ✅ | ✅ | ⏳ To test | No | `useResumeData` hook + API; currently returns 401 without authenticated session (toast displayed) |
| Edit Resume Data | ✅ | ✅ | ⏳ To test | No | State management + API (blocked until resume load succeeds) |
| Auto-save | ✅ | ✅ | ⏳ To test | No | 5s debounce, autosave endpoint (requires authenticated session) |
| Apply Template | ✅ | ✅ | ⏳ To test | No | Template selection + styling |
| Add Custom Section | ✅ | ✅ | ⏳ To test | No | AddSectionModal + API |
| Delete Custom Section | ✅ | ✅ | ⏳ To test | No | Delete handler |
| Reorder Sections | ✅ | ✅ | ⏳ To test | No | Move handlers |
| Toggle Section Visibility | ✅ | ✅ | ⏳ To test | No | Visibility state |
| Format Resume | ✅ | ✅ | ⏳ To test | No | Formatting state + API |
| Export PDF | ✅ | ✅ | ⏳ To test | No | ExportModal + export function |
| Export DOCX | ✅ | ✅ | ⏳ To test | No | ExportModal + export function |
| Export JSON | ✅ | ✅ | ⏳ To test | No | ExportModal + export function |
| Import Resume | ✅ | ✅ | ⏳ To test | No | JSON import handler wired via `handleJsonImport`; cloud paths need verification |
| Add Custom Field | ✅ | ✅ | ⏳ To test | No | AddFieldModal + API |
| Validate Contact Fields | ✅ | ✅ | ⏳ To test | No | Email/Phone/URL validation |
| Generate Smart Filename | ✅ | ✅ | ⏳ To test | No | Filename generator |
| AI Content Generation | ✅ | ✅ | ⏳ To test | No | AIGenerateModal + AI API |
| AI Assistant Panel | ✅ | ✅ | ⏳ To test | No | Toolbar button opens assistant chat UI |
| Toast Notifications | ✅ | ✅ | ⏳ To test | No | ToastContainer renders contextual save/error toasts |
| Save to Cloud | ✅ | ✅ | ⏳ To test | No | Cloud storage integration |
| Import from Cloud | ✅ | ✅ | ⏳ To test | No | Cloud storage integration |
| Conflict Detection | ✅ | ✅ | ⏳ To test | No | Timestamp comparison |
| Undo/Redo | ✅ | ✅ | ⏳ To test | No | History management |

### Console Errors/Warnings
- ❌ `TypeError: apiService.getJobs is not a function` triggered by `useJobsApi` hook (dashboard sidebar jobs widget). Indicates missing API client method implementation.
- ❌ `TypeError: apiService.getCoverLetters is not a function` triggered by `CoverLetterGenerator` component. Requires API service parity for cover letter endpoints.
- ⚠️ Historical `ERR_CONNECTION_REFUSED` errors were observed when API server was offline; resolved once `dev:api` restarted.

### API Calls Analysis

#### Expected API Endpoints (from code analysis)

1. **GET /api/resumes**
   - Purpose: Get all resumes for user
   - Auth: ✅ Required (JWT)
   - Used in: `useResumeList` hook

2. **GET /api/resumes/:id**
   - Purpose: Get single resume by ID
   - Auth: ✅ Required (JWT)
   - Used in: `useResumeData.loadResumeById`

3. **POST /api/resumes**
   - Purpose: Create new resume
   - Auth: ✅ Required (JWT)
   - Used in: `useResumeData.createResume`

4. **PUT /api/resumes/:id**
   - Purpose: Update resume
   - Auth: ✅ Required (JWT)
   - Used in: `useResumeData.saveResume`
   - Features: Conflict detection

5. **POST /api/resumes/:id/autosave**
   - Purpose: Auto-save resume (optimistic update)
   - Auth: ✅ Required (JWT)
   - Used in: `useResumeData` auto-save
   - Features: Conflict detection, debounced

6. **DELETE /api/resumes/:id**
   - Purpose: Delete resume
   - Auth: ✅ Required (JWT)
   - Used in: Resume list management

7. **POST /api/resumes/:id/duplicate**
   - Purpose: Duplicate/copy resume
   - Auth: ✅ Required (JWT)
   - Used in: Resume management

#### Actual API Calls
- ⏳ To be verified during network tab analysis

### Database Operations

#### Resume Model Schema (from Prisma)
```prisma
model Resume {
  id          String   @id @default(cuid())
  userId      String
  fileName    String
  templateId String?
  data        Json     // Complete resume data
  sectionOrder     String[] @default([])
  sectionVisibility Json   @default("{}")
  customSections   Json    @default("[]")
  customFields     Json    @default("[]")
  formatting       Json    @default("{}")
  isStarred        Boolean  @default(false)
  isArchived       Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  user User @relation("Resumes", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([fileName])
  @@index([isStarred])
  @@index([isArchived])
  @@index([createdAt])
}
```

#### Data Stored
- ✅ Resume data (name, title, email, phone, location, summary, skills, experience, education, projects, certifications)
- ✅ Section order (array)
- ✅ Section visibility (object)
- ✅ Custom sections (array)
- ✅ Custom fields (array)
- ✅ Formatting options (object)
- ✅ Template ID
- ✅ File name
- ✅ Metadata (starred, archived, timestamps)

#### Data Retrieved
- ✅ All resume data on load
- ✅ Resume list for user
- ✅ Single resume by ID

### Authentication/Authorization

#### Protected Features
- ✅ All resume CRUD operations require JWT authentication
- ✅ User can only access their own resumes (userId from JWT)
- ✅ Backend validates userId from JWT token

#### Authorization Checks
- ✅ Resume ownership verified in all endpoints
- ✅ User ID extracted from JWT, not request body
- ✅ 401 returned for invalid/expired tokens
- ✅ 403 returned for unauthorized access

---

## 4. Code Audit Findings

### Main Component
- **File:** `apps/web/src/components/features/ResumeEditor.tsx`
- **Size:** 337 lines
- **Structure:** Well-organized, uses sub-components
- **Performance:** ✅ Uses useMemo for expensive computations
- **TypeScript:** ✅ Fully typed with ResumeEditorProps interface

### Sub-Components
1. **CollapsedSidebar.tsx** - Collapsed sidebar view
2. **FileNameSection.tsx** - File name input section
3. **SectionsList.tsx** - Section management list
4. **SectionItem.tsx** - Individual section item
5. **NameInput.tsx** - Name input with validation
6. **ContactFieldsGrid.tsx** - Contact fields with validation
7. **FormattingPanel.tsx** - Formatting options panel

### State Management
- **Primary Hook:** `useResumeData` - Comprehensive resume state management
- **Modal State:** `useModals` hook
- **UI State:** `useDashboardUI` hook
- **Template State:** `useDashboardTemplates` hook
- **State Updates:** ✅ Properly tracked with `hasChanges` flag
- **Auto-save:** ✅ Debounced (5 seconds)

### Props
- **Total Props:** 30+ props passed to ResumeEditor
- **Props Structure:** Well-defined TypeScript interface
- **Props Flow:** DashboardPageClient → ResumeEditor → Sub-components

### Hooks Used
1. **useResumeData** - Resume data management, auto-save, conflict detection
2. **useResumeList** - Resume list management
3. **useModals** - Modal state management
4. **useTheme** - Theme/color management
5. **useSidebarDimensions** - Sidebar width calculation
6. **useTemplateApplication** - Template application logic
7. **useMemo** - Performance optimization
8. **useCallback** - Function memoization
9. **useToasts** - Toast management for save/error feedback

### API Endpoints Called
1. `GET /api/resumes` - Get all resumes
2. `GET /api/resumes/:id` - Get single resume
3. `POST /api/resumes` - Create resume
4. `PUT /api/resumes/:id` - Update resume
5. `POST /api/resumes/:id/autosave` - Auto-save resume
6. `DELETE /api/resumes/:id` - Delete resume
7. `POST /api/resumes/:id/duplicate` - Duplicate resume

### Backend Routes & Controllers
- **File:** `apps/api/routes/resume.routes.js`
- **Routes:** 7 endpoints defined
- **Authentication:** ✅ All routes use `authenticate` middleware
- **Error Handling:** ✅ Try-catch blocks, proper error responses
- **Logging:** ✅ Comprehensive logging with logger
- **Conflict Detection:** ✅ Implemented in PUT and autosave endpoints

### Database Tables/Models
- **Resume Model:** ✅ Defined in Prisma schema
- **Relations:** ✅ User relation (Cascade delete)
- **Indexes:** ✅ userId, fileName, isStarred, isArchived, createdAt

### Database Schema
- **Provider:** PostgreSQL
- **ORM:** Prisma
- **JSON Fields:** data, sectionVisibility, customSections, customFields, formatting
- **Array Fields:** sectionOrder (String[])
- **Timestamps:** ✅ createdAt, updatedAt

### Missing Indexes
- ⏳ To be analyzed - current indexes look adequate

### Mock Data Locations
- ✅ No mock data found in ResumeEditor components
- ✅ All data comes from API or state

### TODO Comments
- ✅ No TODO/FIXME comments detected in current Resume Editor frontend or related dashboard modals

### console.log Statements
- ✅ None found in ResumeEditor components
- ✅ Uses logger utility instead

### Commented-Out Code
- ⏳ To be checked

### Type Definitions
- ✅ `ResumeEditorProps` interface defined
- ✅ `ResumeData` type imported
- ✅ `CustomSection`, `SectionVisibility`, `CustomField` types imported
- ✅ All components properly typed

### Utility Functions Used
1. **getTemplateClasses** - Template styling helper
2. **validateEmail** - Email validation
3. **validatePhone** - Phone validation
4. **validateURL** - URL validation
5. **normalizeURL** - URL normalization
6. **getFieldIcon** - Icon helper
7. **parseResumeFile** - Normalizes imported resume payloads
8. **resumeHelpers** - Resume utility functions
9. **logger** - Logging utility
10. **apiService** - API service wrapper

### External Dependencies/Libraries
- React
- Next.js (dynamic imports)
- Lucide React (icons)
- Tailwind CSS (styling)
- Custom hooks and utilities

---

## 5. Initial Observations

### Strengths
- ✅ Well-structured component hierarchy
- ✅ Comprehensive TypeScript typing
- ✅ Proper state management
- ✅ Auto-save with conflict detection
- ✅ Input validation
- ✅ Performance optimizations (useMemo, useCallback)
- ✅ Responsive design
- ✅ Accessibility features (ARIA labels)

### Potential Issues
- ⚠️ Import flows (file) need end-to-end verification even though JSON handler is wired
- ⏳ Need to verify all API endpoints work correctly
- ⏳ Need to verify database persistence
- ⏳ Need to check for console errors/warnings
- ⏳ Need to verify all user workflows work end-to-end
- ❌ Dashboard widgets call `apiService.getJobs` / `getCoverLetters` which are undefined, spamming console errors (needs API client parity)

---

**Next Steps:**
1. Complete browser testing (Phase 2)
2. Verify all features work with real data
3. Check for console errors/warnings
4. Test all user workflows
5. Perform gap analysis
