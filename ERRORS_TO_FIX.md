# TypeScript Errors - Complete List

## Summary
Total Errors: 31  
Files Affected: 12

## 1. Import Errors (7 errors)

### 1.1 exportHelpers Module
**File**: `apps/web/src/app/dashboard/page.tsx:32`
**Error**: `exportHelpers` not exported
**Fix**: Change import to use specific exports

### 1.2 AIGeneratorProps
**File**: `apps/web/src/components/email/components/AIGenerator.tsx:5`
**Error**: Not exported from email types
**Fix**: Add to email types or use inline interface

### 1.3 CampaignCardProps
**File**: `apps/web/src/components/email/components/CampaignCard.tsx:5`
**Error**: Not exported from email types
**Fix**: Add to email types or use inline interface

### 1.4 EmailHeaderProps
**File**: `apps/web/src/components/email/EmailHeader.tsx:5`
**Error**: Import path incorrect
**Fix**: Already fixed in previous sessions - ensure file exists

### 1.5 EmailTabsProps
**File**: `apps/web/src/components/email/EmailTabs.tsx:5`
**Error**: Import path incorrect
**Fix**: Already fixed in previous sessions - ensure file exists

### 1.6 EmailCampaign
**File**: `apps/web/src/components/email/tabs/CampaignsTab.tsx:5`
**Error**: Not exported
**Fix**: Add to email types

### 1.7 AIContext
**File**: `apps/web/src/components/email/tabs/ComposeTab.tsx:7`
**Error**: Typo `AIGontext` should be `AIContext`
**Fix**: Already fixed - verify

## 2. Type Mismatch Errors (7 errors)

### 2.1 string vs string[] in ComposeTab
**Files**: `apps/web/src/components/email/tabs/ComposeTab.tsx:14,15,52,53`
**Error**: Assigning string to string[] arrays
**Fix**: Wrap in arrays: `[value]` or split by comma

### 2.2 ExportModal format
**File**: `apps/web/src/components/jobs/ExportModal.tsx:77`
**Error**: json format no longer supported
**Fix**: Remove json option from type

### 2.3 JobCard actions
**File**: `apps/web/src/components/JobTracker.tsx:49`
**Error**: Incorrect number of arguments
**Fix**: Check function signature

## 3. InterviewTracker Props Errors (5 errors)

### 3.1 JobDetailView Props
**File**: `apps/web/src/components/jobs/JobDetailView.tsx:177`
**Error**: `interviewNotes` prop doesn't exist
**Fix**: Use `notes` instead

### 3.2 SalaryTracker Props
**File**: `apps/web/src/components/jobs/JobDetailView.tsx:187`
**Error**: `salaryOffers` prop doesn't exist
**Fix**: Use `offers` instead

### 3.3 CompanyInsights Props
**File**: `apps/web/src/components/jobs/JobDetailView.tsx:199`
**Error**: `onUpdateInsight` doesn't exist
**Fix**: Add optional prop or remove

### 3.4 ReferralTracker Props
**File**: `apps/web/src/components/jobs/JobDetailView.tsx:209`
**Error**: `onUpdateReferral` doesn't exist
**Fix**: Add optional prop or remove

### 3.5 NotesPanel Props
**File**: `apps/web/src/components/jobs/JobDetailView.tsx:219`
**Error**: `onUpdateNote` doesn't exist
**Fix**: Add optional prop or remove

## 4. Handler Signature Errors (7 errors)

### 4.1 InterviewTracker onAddNote
**Files**: Multiple trackers
**Error**: Handler expects (jobId, note) but receives different
**Fix**: Update handler signatures

### 4.2 NotesPanel id in create
**File**: `apps/web/src/components/jobs/panels/NotesPanel.tsx:33`
**Error**: Including 'id' in Omit<> type
**Fix**: Remove id from object literal

### 4.3 Same for RemindersPanel
**File**: `apps/web/src/components/jobs/panels/RemindersPanel.tsx:36`
**Fix**: Remove id from object literal

### 4.4 Same for CompanyInsights
**File**: `apps/web/src/components/jobs/trackers/CompanyInsights.tsx:33`
**Fix**: Remove id from object literal

### 4.5 Same for InterviewTracker
**File**: `apps/web/src/components/jobs/trackers/InterviewTracker.tsx:35`
**Fix**: Remove id from object literal

### 4.6 Same for ReferralTracker
**File**: `apps/web/src/components/jobs/trackers/ReferralTracker.tsx:34`
**Fix**: Remove id from object literal

### 4.7 Same for SalaryTracker
**File**: `apps/web/src/components/jobs/trackers/SalaryTracker.tsx:36`
**Fix**: Remove id from object literal

## 5. Null Safety Errors (2 errors)

### 5.1 InterviewTracker rating
**File**: `apps/web/src/components/jobs/trackers/InterviewTracker.tsx:88,94`
**Error**: `note.rating` possibly undefined
**Fix**: Add null check: `note.rating ?? 0`

### 5.2 JobTracker displayActions
**File**: `apps/web/src/components/JobTracker.tsx:49`
**Error**: Missing second argument
**Fix**: Check function signature

## 6. Profile SkillsTab Errors (6 errors)

### 6.1 addSkill
**File**: `apps/web/src/components/profile/tabs/SkillsTab.tsx:19,20`
**Error**: Expecting Skill object, receiving string
**Fix**: Transform to proper structure

### 6.2 addCertification
**File**: `apps/web/src/components/profile/tabs/SkillsTab.tsx:29,30`
**Error**: Expecting Certification object
**Fix**: Transform to proper structure

### 6.3 addLanguage
**File**: `apps/web/src/components/profile/tabs/SkillsTab.tsx:39,40`
**Error**: Expecting language object
**Fix**: Transform to proper structure

## Priority Fix Order

1. **Critical** (Application won't run):
   - Import path errors (7 errors)
   - Type interface mismatches (7 errors)
   - Handler signature errors (7 errors)

2. **High** (Functionality broken):
   - Null safety checks (2 errors)
   - SkillsTab transformation (6 errors)

3. **Medium** (Minor issues):
   - Optional props (can be deferred)

## Estimated Fix Time
- Critical: 30 minutes
- High: 20 minutes  
- Medium: 10 minutes
**Total**: ~1 hour

