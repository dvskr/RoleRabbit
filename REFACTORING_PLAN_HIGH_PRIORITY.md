# High Priority Refactoring Plan (700-1000+ Lines)
## Goal: Break down large components without changing UI/UX or functionality

---

## 1. AIAgents.tsx (~1,051 lines)

### Current Structure:
- Single monolithic component with 4 tabs: Chat, Active Tasks, Capabilities, History
- All state management, UI rendering, and logic in one file
- Large inline JSX for each tab view

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/AIAgents/
├── index.tsx (Main container - ~100 lines)
├── types.ts (Type definitions)
├── hooks/
│   ├── useAIAgentsState.ts (State management)
│   └── useAIChat.ts (Chat functionality)
├── components/
│   ├── TabNavigation.tsx (~50 lines)
│   ├── AgentToggle.tsx (~30 lines)
│   ├── ChatTab.tsx (~200 lines)
│   │   └── ChatMessage.tsx (~50 lines)
│   │   └── ChatInput.tsx (~40 lines)
│   ├── ActiveTasksTab.tsx (~250 lines)
│   │   └── TaskCard.tsx (~80 lines)
│   │   └── TaskProgress.tsx (~40 lines)
│   ├── CapabilitiesTab.tsx (~200 lines)
│   │   └── CapabilityCard.tsx (~60 lines)
│   └── HistoryTab.tsx (~180 lines)
│       └── HistoryCard.tsx (~50 lines)
└── constants/
    └── mockData.ts (Mock data moved here)
```

#### Benefits:
- Reduces main file from 1,051 to ~100 lines
- Each tab becomes independently testable
- Reusable components (TaskCard, ChatMessage, etc.)
- Clear separation of concerns

---

## 2. ResumeEditor.tsx (~1,089 lines)

### Current Structure:
- Main editor component with left sidebar, main editing area
- File name, templates, sections, formatting controls all in one file
- Large inline JSX for formatting options

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/features/ResumeEditor/
├── index.tsx (Main container - ~150 lines)
├── types.ts (ResumeEditorProps, etc.)
├── hooks/
│   ├── useResumeEditorState.ts
│   └── useResumeEditorSections.ts
├── components/
│   ├── Sidebar/
│   │   ├── SidebarContainer.tsx (~50 lines)
│   │   ├── FileNameSection.tsx (~60 lines)
│   │   ├── TemplatesSection.tsx (~40 lines) [uses MultiResumeManager]
│   │   ├── SectionsList.tsx (~120 lines)
│   │   └── FormattingSection.tsx (~300 lines)
│   │       ├── FontFamilyControl.tsx (~50 lines)
│   │       ├── FontSizeControl.tsx (~80 lines)
│   │       ├── LineSpacingControl.tsx (~40 lines)
│   │       ├── SectionSpacingControl.tsx (~50 lines)
│   │       ├── PageMarginsControl.tsx (~40 lines)
│   │       ├── HeadingWeightControl.tsx (~30 lines)
│   │       └── BulletStyleControl.tsx (~80 lines)
│   └── MainEditorArea/
│       ├── EditorContainer.tsx (~50 lines)
│       ├── ResumeCard.tsx (~80 lines)
│       ├── NameInput.tsx (~30 lines)
│       ├── ContactFields.tsx (~120 lines)
│       │   ├── ContactFieldRow.tsx (~40 lines)
│       │   └── CustomFieldsList.tsx (~60 lines)
│       └── SectionsRenderer.tsx (~40 lines)
└── utils/
    └── resumeEditorHelpers.ts
```

#### Benefits:
- Main file reduced from 1,089 to ~150 lines
- Formatting section split into 7 focused components
- Sidebar components can be reused or tested independently
- Clear component hierarchy

---

## 3. DashboardFigma.tsx (~996 lines)

### Current Structure:
- Dashboard with metrics, activities, todos, quick actions
- All sections rendered inline in one component

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/DashboardFigma/
├── index.tsx (Main container - ~120 lines)
├── types.ts (Todo, Activity, Metric types)
├── hooks/
│   ├── useDashboardState.ts
│   ├── useTodos.ts
│   └── useActivities.ts
├── components/
│   ├── MetricsSection.tsx (~80 lines)
│   │   └── MetricCard.tsx (~40 lines)
│   ├── ActivitiesSection.tsx (~150 lines)
│   │   ├── ActivityFilter.tsx (~40 lines)
│   │   └── ActivityCard.tsx (~60 lines)
│   ├── TodosSection.tsx (~200 lines)
│   │   ├── TodoFilter.tsx (~40 lines)
│   │   ├── TodoList.tsx (~80 lines)
│   │   ├── TodoCard.tsx (~60 lines)
│   │   └── AddTodoForm.tsx (~50 lines)
│   ├── QuickActions.tsx (~120 lines)
│   │   └── QuickActionCard.tsx (~50 lines)
│   └── StatsBar.tsx (~80 lines)
└── constants/
    └── dashboardData.ts (Mock data)
```

#### Benefits:
- Main file reduced from 996 to ~120 lines
- Each section becomes independently manageable
- Reusable card components
- Better state management separation

---

## 4. CloudStorage.tsx (~873 lines)

### Current Structure:
- File management with folder sidebar, file grid/list view
- File operations (upload, download, share, etc.) all inline

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/CloudStorage/
├── index.tsx (Main container - ~120 lines)
├── types.ts
├── hooks/
│   ├── useCloudStorageState.ts
│   ├── useFileOperations.ts
│   └── useFileFilters.ts
├── components/
│   ├── FolderSidebar.tsx (~150 lines)
│   │   └── FolderItem.tsx (~50 lines)
│   ├── FileToolbar.tsx (~100 lines)
│   │   ├── ViewModeToggle.tsx (~30 lines)
│   │   └── SearchAndFilter.tsx (~50 lines)
│   ├── FileGrid.tsx (~80 lines)
│   ├── FileList.tsx (~80 lines)
│   ├── FileCard.tsx (~120 lines) [already exists, verify]
│   └── Modals/
│       ├── UploadModal.tsx (~80 lines)
│       ├── ShareModal.tsx (~60 lines)
│       └── DeleteConfirmModal.tsx (~40 lines)
└── utils/
    └── fileHelpers.ts
```

#### Benefits:
- Main file reduced from 873 to ~120 lines
- File operations separated into hooks
- Modal components extracted
- Better organization

---

## 5. AIPanel.tsx (~879 lines)

### Current Structure:
- AI assistant panel with multiple modes (analyze, tailor, generate, chat)
- All modes and UI in one component

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/features/AIPanel/
├── index.tsx (Main container - ~100 lines)
├── types.ts
├── hooks/
│   ├── useAIPanelState.ts
│   ├── useAIAnalysis.ts
│   └── useAIConversation.ts
├── components/
│   ├── PanelHeader.tsx (~40 lines)
│   ├── ModeSelector.tsx (~60 lines)
│   ├── AnalysisMode.tsx (~150 lines)
│   │   ├── JobDescriptionInput.tsx (~40 lines)
│   │   ├── MatchScoreDisplay.tsx (~50 lines)
│   │   ├── KeywordsDisplay.tsx (~60 lines)
│   │   └── RecommendationsList.tsx (~50 lines)
│   ├── TailorMode.tsx (~120 lines)
│   │   ├── ToneSelector.tsx (~40 lines)
│   │   └── LengthSelector.tsx (~30 lines)
│   ├── GenerateMode.tsx (~100 lines)
│   └── ChatMode.tsx (~180 lines)
│       ├── ChatMessages.tsx (~80 lines)
│       ├── ChatMessage.tsx (~40 lines)
│       └── ChatInput.tsx (~50 lines)
└── utils/
    └── aiHelpers.ts
```

#### Benefits:
- Main file reduced from 879 to ~100 lines
- Each AI mode becomes independent component
- Reusable chat components
- Better separation of AI logic

---

## 6. SecurityTab.tsx (~818 lines)

### Current Structure:
- Security settings with multiple sections (password, 2FA, sessions, etc.)

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/profile/tabs/SecurityTab/
├── index.tsx (Main container - ~100 lines)
├── types.ts
├── hooks/
│   ├── useSecurityState.ts
│   └── useSecurityActions.ts
├── components/
│   ├── PasswordSection.tsx (~150 lines)
│   │   ├── ChangePasswordForm.tsx (~80 lines)
│   │   └── PasswordStrengthIndicator.tsx (~40 lines)
│   ├── TwoFactorSection.tsx (~120 lines)
│   │   └── TwoFactorSetup.tsx (~80 lines)
│   ├── SessionsSection.tsx (~150 lines)
│   │   └── SessionCard.tsx (~60 lines)
│   ├── ApiKeysSection.tsx (~100 lines)
│   │   └── ApiKeyCard.tsx (~50 lines)
│   └── SecurityAlerts.tsx (~100 lines)
└── utils/
    └── securityHelpers.ts
```

#### Benefits:
- Main file reduced from 818 to ~100 lines
- Each security section independently manageable
- Reusable form components

---

## 7. BillingTab.tsx (~800 lines)

### Current Structure:
- Billing interface with plans, payment methods, invoices, usage

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/profile/tabs/BillingTab/
├── index.tsx (Main container - ~100 lines)
├── types.ts
├── hooks/
│   ├── useBillingState.ts
│   └── useBillingActions.ts
├── components/
│   ├── PlanSelector.tsx (~150 lines)
│   │   └── PlanCard.tsx (~80 lines)
│   ├── PaymentMethods.tsx (~120 lines)
│   │   └── PaymentMethodCard.tsx (~60 lines)
│   ├── InvoicesList.tsx (~100 lines)
│   │   └── InvoiceCard.tsx (~50 lines)
│   ├── UsageStats.tsx (~150 lines)
│   │   └── UsageChart.tsx (~80 lines)
│   └── BillingHistory.tsx (~100 lines)
└── utils/
    └── billingHelpers.ts
```

#### Benefits:
- Main file reduced from 800 to ~100 lines
- Clear separation of billing sections
- Reusable card components

---

## 8. AIPortfolioBuilder.tsx (~786 lines)

### Current Structure:
- Multi-step portfolio builder with wizard steps

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/portfolio-generator/AIPortfolioBuilder/
├── index.tsx (Main container - ~120 lines)
├── types.ts
├── hooks/
│   ├── usePortfolioBuilderState.ts
│   └── usePortfolioBuilderWizard.ts
├── components/
│   ├── WizardSteps.tsx (~60 lines)
│   ├── Step1PersonalInfo.tsx (~100 lines)
│   ├── Step2Content.tsx (~120 lines)
│   ├── Step3Design.tsx (~150 lines)
│   │   └── ThemeSelector.tsx (~60 lines)
│   ├── Step4Preview.tsx (~100 lines)
│   └── StepNavigation.tsx (~40 lines)
└── utils/
    └── portfolioHelpers.ts
```

#### Benefits:
- Main file reduced from 786 to ~120 lines
- Each wizard step becomes independent
- Better wizard state management

---

## 9. useCloudStorage.ts (~705 lines) - Hook

### Current Structure:
- Large hook with all file operations logic

### Refactoring Strategy:

#### Split into Multiple Hooks:
```
apps/web/src/hooks/cloudStorage/
├── index.ts (Re-export all)
├── useCloudStorage.ts (~150 lines - Main state)
├── useFileOperations.ts (~200 lines - CRUD operations)
├── useFileUpload.ts (~120 lines - Upload logic)
├── useFileFilters.ts (~100 lines - Filtering logic)
├── useFileSharing.ts (~80 lines - Sharing logic)
└── utils/
    └── cloudStorageHelpers.ts
```

#### Benefits:
- Each hook has single responsibility
- Easier to test individual operations
- Better code organization

---

## 10. EmailComposerAI.tsx (~727 lines)

### Current Structure:
- Email composer with AI features, templates, attachments

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/email/EmailComposerAI/
├── index.tsx (Main container - ~120 lines)
├── types.ts
├── hooks/
│   ├── useEmailComposerState.ts
│   └── useEmailAI.ts
├── components/
│   ├── EmailHeader.tsx (~80 lines)
│   ├── EmailBody.tsx (~100 lines)
│   │   └── RichTextEditor.tsx (~60 lines)
│   ├── EmailTemplates.tsx (~120 lines)
│   │   └── TemplateCard.tsx (~50 lines)
│   ├── AttachmentsList.tsx (~80 lines)
│   │   └── AttachmentItem.tsx (~40 lines)
│   ├── AIPanel.tsx (~100 lines)
│   └── EmailActions.tsx (~60 lines)
└── utils/
    └── emailHelpers.ts
```

#### Benefits:
- Main file reduced from 727 to ~120 lines
- Clear component separation
- Reusable email components

---

## 11. CredentialManager.tsx (~694 lines)

### Current Structure:
- Credential management with add/edit/delete functionality

### Refactoring Strategy:

#### Extract Components:
```
apps/web/src/components/CredentialManager/
├── index.tsx (Main container - ~120 lines)
├── types.ts
├── hooks/
│   ├── useCredentialsState.ts
│   └── useCredentialsActions.ts
├── components/
│   ├── CredentialsList.tsx (~100 lines)
│   │   └── CredentialCard.tsx (~80 lines)
│   ├── CredentialForm.tsx (~150 lines)
│   │   ├── CredentialFields.tsx (~80 lines)
│   │   └── PasswordGenerator.tsx (~50 lines)
│   ├── CredentialSearch.tsx (~40 lines)
│   └── CredentialCategories.tsx (~60 lines)
└── utils/
    └── credentialHelpers.ts
```

#### Benefits:
- Main file reduced from 694 to ~120 lines
- Form logic separated
- Reusable credential components

---

## Implementation Guidelines

### Phase 1: Preparation (Week 1)
1. **Create folder structure** for each component
2. **Extract types** to separate `types.ts` files
3. **Move constants/mock data** to `constants/` folders
4. **Create barrel exports** (`index.ts`) for easy imports

### Phase 2: Component Extraction (Weeks 2-4)
1. **Start with leaf components** (smallest UI pieces)
2. **Extract components one at a time**
3. **Test after each extraction** to ensure UI/UX unchanged
4. **Move hooks** after components are stable

### Phase 3: Hook Extraction (Week 5)
1. **Extract state management** to custom hooks
2. **Extract business logic** to utility functions
3. **Maintain same hook interfaces** for compatibility

### Phase 4: Testing & Cleanup (Week 6)
1. **Verify all functionality** works identically
2. **Check for unused code**
3. **Update imports** throughout codebase
4. **Document component structure**

---

## Refactoring Rules

### ✅ DO:
- Extract components that represent distinct UI sections
- Create hooks for reusable state logic
- Move types/interfaces to separate files
- Maintain exact same props interfaces
- Keep all styling/classes identical
- Preserve all event handlers
- Keep component behavior identical

### ❌ DON'T:
- Change any UI/UX elements
- Modify styling or layout
- Add new features
- Remove existing functionality
- Change prop names or structures
- Alter component behavior
- Modify state management patterns (just reorganize)

---

## Success Criteria

1. **File size reduction**: Each main component file < 200 lines
2. **Component count**: Increase component count by 3-5x per file
3. **Zero UI changes**: Visual/functional parity verified
4. **Import compatibility**: Existing imports work (use barrel exports)
5. **Performance**: No performance regression
6. **Test coverage**: All existing tests pass

---

## Estimated Time per File

- **AIAgents.tsx**: 3-4 days
- **ResumeEditor.tsx**: 4-5 days (most complex)
- **DashboardFigma.tsx**: 3-4 days
- **CloudStorage.tsx**: 2-3 days
- **AIPanel.tsx**: 3-4 days
- **SecurityTab.tsx**: 2-3 days
- **BillingTab.tsx**: 2-3 days
- **AIPortfolioBuilder.tsx**: 3-4 days
- **useCloudStorage.ts**: 2-3 days
- **EmailComposerAI.tsx**: 3-4 days
- **CredentialManager.tsx**: 2-3 days

**Total Estimated Time: 6-8 weeks**

---

## Priority Order

1. **ResumeEditor.tsx** (Most complex, most used)
2. **AIAgents.tsx** (High user interaction)
3. **DashboardFigma.tsx** (Core dashboard)
4. **AIPanel.tsx** (Frequently opened)
5. **CloudStorage.tsx** (File management critical)
6. **useCloudStorage.ts** (Affects CloudStorage)
7. **SecurityTab.tsx** (Important but less frequent)
8. **BillingTab.tsx** (Important but less frequent)
9. **AIPortfolioBuilder.tsx** (Feature-specific)
10. **EmailComposerAI.tsx** (Feature-specific)
11. **CredentialManager.tsx** (Feature-specific)

