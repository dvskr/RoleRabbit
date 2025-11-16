# Implementation Plan: Sections 1.7 & 2.1

## Overview

This document outlines the implementation plan for:
- **Section 1.7:** Missing Template Handling (Frontend)
- **Section 2.1:** Missing Endpoints (Backend)

**Total Features:** 10 (4 frontend + 6 backend)
**Estimated Time:** 8-12 hours
**Priority:** Critical (P0) features must be completed first

---

## 1.7 Missing Template Handling (Frontend)

### ✅ Critical (P0) - Must Have

#### 1. Add template validation before applying
**Status:** ✅ Utility Created
**File:** `apps/web/src/utils/templateValidation.ts`
**Implementation:**
- Created `validateTemplateBeforeApply()` function
- Created `validateTemplateExists()` function
- Created `getTemplateWithFallback()` function

**Next Steps:**
1. Integrate into `DashboardPageClient.tsx`
2. Add validation before template application
3. Show warnings to user via toast notifications

**Code Integration:**
```typescript
// In DashboardPageClient.tsx or template handler
import { validateTemplateBeforeApply } from '../../utils/templateValidation';

const handleTemplateApply = (templateId: string) => {
  const validation = validateTemplateBeforeApply(
    templateId,
    resumeData,
    customSections
  );
  
  if (validation.usedFallback) {
    showToast(validation.warnings[0], 'warning', 5000);
  }
  
  if (validation.warnings.length > 1) {
    validation.warnings.slice(1).forEach(warning => {
      showToast(warning, 'info', 4000);
    });
  }
  
  setSelectedTemplateId(validation.template.id);
};
```

---

#### 2. Add template fallback for deleted templates
**Status:** ✅ Utility Created
**File:** `apps/web/src/utils/templateValidation.ts`
**Implementation:**
- `getTemplateWithFallback()` handles missing templates
- Returns default template with warning message
- Logs warning for debugging

**Next Steps:**
1. Add `useEffect` in `DashboardPageClient.tsx` to check template on mount
2. Show warning modal if template was replaced

**Code Integration:**
```typescript
// In DashboardPageClient.tsx
useEffect(() => {
  if (selectedTemplateId) {
    const { template, usedFallback, warning } = getTemplateWithFallback(selectedTemplateId);
    
    if (usedFallback) {
      showToast(warning || 'Template no longer available, using default', 'warning', 6000);
      setSelectedTemplateId(template.id);
    }
  }
}, [selectedTemplateId]);
```

---

### High Priority (P1) - Should Have

#### 3. Add "Reset to Default Template" button
**Status:** ⏳ Pending Implementation
**Files:**
- `apps/web/src/components/features/ResumeEditor/components/FormattingPanel.tsx`
- `apps/web/src/utils/templateValidation.ts` (utility ready)

**Implementation:**
```typescript
// Add to FormattingPanel.tsx
import { resetToDefaultTemplate } from '../../../utils/templateValidation';

const handleResetTemplate = () => {
  const { templateId, message } = resetToDefaultTemplate();
  setSelectedTemplateId(templateId);
  
  // Reset all formatting to defaults
  setFontFamily(DEFAULT_FORMATTING.fontFamily);
  setFontSize(DEFAULT_FORMATTING.fontSize);
  setLineSpacing(DEFAULT_FORMATTING.lineSpacing);
  setSectionSpacing(DEFAULT_FORMATTING.sectionSpacing);
  setMargins(DEFAULT_FORMATTING.margins);
  setHeadingStyle(DEFAULT_FORMATTING.headingStyle);
  setBulletStyle(DEFAULT_FORMATTING.bulletStyle);
  
  showToast(message, 'success', 3000);
};

// UI Button
<button
  onClick={handleResetTemplate}
  className="px-3 py-2 rounded-lg text-sm font-medium"
  style={{
    background: colors.badgeWarningBg,
    color: colors.badgeWarningText,
    border: `1px solid ${colors.badgeWarningBorder}`
  }}
>
  Reset to Default Template
</button>
```

---

#### 4. Add template compatibility warnings
**Status:** ✅ Utility Created
**File:** `apps/web/src/utils/templateValidation.ts`
**Implementation:**
- `checkTemplateCompatibility()` function created
- Checks for custom sections support
- Checks for content volume vs layout
- Checks for ATS compatibility

**Next Steps:**
1. Show compatibility warnings in template selection UI
2. Add compatibility score badge to template cards

**Code Integration:**
```typescript
// In Templates.tsx or TemplateCard.tsx
import { getTemplateCompatibilityScore } from '../../utils/templateValidation';

const compatibilityScore = getTemplateCompatibilityScore(
  template,
  resumeData,
  customSections
);

// Show score badge
{compatibilityScore < 80 && (
  <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold"
    style={{
      background: compatibilityScore >= 60 ? '#fef3c7' : '#fee2e2',
      color: compatibilityScore >= 60 ? '#d97706' : '#dc2626'
    }}
  >
    {compatibilityScore}% compatible
  </div>
)}
```

---

## 2.1 Missing Endpoints (Backend)

### ✅ Critical (P0) - Must Have

#### 5. Create resume export endpoint
**Status:** ⏳ Pending Implementation
**Endpoint:** `POST /api/base-resumes/:id/export`
**File:** `apps/api/routes/baseResume.routes.js`

**Implementation:**
```javascript
// In baseResume.routes.js
router.post('/:id/export', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { format, templateId } = req.body;
    
    // Validate format
    const validFormats = ['pdf', 'docx', 'txt', 'json'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: `Invalid format. Must be one of: ${validFormats.join(', ')}`
      });
    }
    
    // Get resume
    const resume = await BaseResume.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }
    
    // Use existing resumeExporter service
    const { resumeExporter } = require('../services/resumeExporter');
    const exportResult = await resumeExporter.export({
      resume: resume.data,
      format,
      templateId: templateId || resume.metadata?.templateId
    });
    
    // Store in StorageFile table
    const storageFile = await StorageFile.create({
      userId: req.user.id,
      fileName: exportResult.fileName,
      fileType: format,
      fileSize: exportResult.fileSize,
      filePath: exportResult.filePath,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });
    
    // Generate signed URL (if using S3) or temporary URL
    const fileUrl = await generateDownloadUrl(storageFile);
    
    res.json({
      success: true,
      fileUrl,
      fileName: exportResult.fileName
    });
    
    // Schedule cleanup after 1 hour
    setTimeout(async () => {
      await storageFile.destroy();
      await deleteFile(exportResult.filePath);
    }, 3600000);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export resume'
    });
  }
});
```

---

#### 6. Create template list endpoint
**Status:** ⏳ Pending Implementation
**Endpoint:** `GET /api/resume-templates`
**File:** `apps/api/routes/template.routes.js` (new file)

**Note:** Templates are currently stored in `apps/web/src/data/templates.ts` (frontend).
This endpoint is optional if templates remain client-side.

**Implementation (if moving to database):**
```javascript
// In template.routes.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, isPremium } = req.query;
    
    let where = {};
    if (category) where.category = category;
    if (isPremium !== undefined) where.isPremium = isPremium === 'true';
    
    const templates = await ResumeTemplate.findAll({
      where,
      attributes: ['id', 'name', 'category', 'description', 'isPremium', 'colorScheme', 'preview'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Template list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

module.exports = router;
```

**Alternative (serve from frontend data):**
```javascript
// Simple endpoint that returns frontend template data
router.get('/', (req, res) => {
  const templates = require('../../web/src/data/templates').resumeTemplates;
  res.json({
    success: true,
    templates: templates.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      isPremium: t.isPremium,
      colorScheme: t.colorScheme
    }))
  });
});
```

---

### High Priority (P1) - Should Have

#### 7. Create resume duplicate endpoint
**Status:** ⏳ Pending Implementation
**Endpoint:** `POST /api/base-resumes/:id/duplicate`
**File:** `apps/api/routes/baseResume.routes.js`

**Implementation:**
```javascript
router.post('/:id/duplicate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get source resume
    const sourceResume = await BaseResume.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!sourceResume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }
    
    // Get next available slot
    const existingResumes = await BaseResume.findAll({
      where: { userId: req.user.id },
      order: [['slotNumber', 'DESC']]
    });
    
    const nextSlot = existingResumes.length > 0 
      ? existingResumes[0].slotNumber + 1 
      : 1;
    
    // Create duplicate
    const duplicate = await BaseResume.create({
      userId: req.user.id,
      slotNumber: nextSlot,
      name: `${sourceResume.name} (Copy)`,
      data: sourceResume.data,
      formatting: sourceResume.formatting,
      metadata: sourceResume.metadata,
      isActive: false
    });
    
    // Do NOT duplicate working draft
    
    res.json({
      success: true,
      resume: duplicate
    });
    
  } catch (error) {
    console.error('Duplicate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate resume'
    });
  }
});
```

---

#### 8. Create resume history endpoint
**Status:** ⏳ Pending Implementation
**Endpoint:** `GET /api/base-resumes/:id/history`
**File:** `apps/api/routes/baseResume.routes.js`

**Implementation:**
```javascript
router.get('/:id/history', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const resume = await BaseResume.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }
    
    // Get tailored versions (history)
    const versions = await TailoredVersion.findAll({
      where: { baseResumeId: id },
      attributes: ['id', 'type', 'createdAt', 'jobTitle', 'atsScore'],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json({
      success: true,
      versions
    });
    
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});
```

---

#### 9. Create tailored version fetch endpoint
**Status:** ⏳ Pending Implementation
**Endpoint:** `GET /api/tailored-versions/:id`
**File:** `apps/api/routes/tailoredVersion.routes.js` (new file)

**Implementation:**
```javascript
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const version = await TailoredVersion.findOne({
      where: { id },
      include: [{
        model: BaseResume,
        where: { userId: req.user.id },
        attributes: ['id', 'name']
      }]
    });
    
    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'Version not found'
      });
    }
    
    // Calculate diff if not stored
    let diff = version.diff;
    if (!diff && version.baseResumeId) {
      const baseResume = await BaseResume.findByPk(version.baseResumeId);
      diff = calculateDiff(baseResume.data, version.data);
    }
    
    res.json({
      success: true,
      version: {
        id: version.id,
        data: version.data,
        diff,
        atsScoreBefore: version.atsScoreBefore,
        atsScoreAfter: version.atsScoreAfter,
        jobTitle: version.jobTitle,
        createdAt: version.createdAt
      }
    });
    
  } catch (error) {
    console.error('Fetch version error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch version'
    });
  }
});

module.exports = router;
```

---

#### 10. Create resume restore endpoint
**Status:** ⏳ Pending Implementation
**Endpoint:** `POST /api/base-resumes/:id/restore/:versionId`
**File:** `apps/api/routes/baseResume.routes.js`

**Implementation:**
```javascript
router.post('/:id/restore/:versionId', authMiddleware, async (req, res) => {
  try {
    const { id, versionId } = req.params;
    
    // Get base resume
    const baseResume = await BaseResume.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!baseResume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }
    
    // Get version to restore
    const version = await TailoredVersion.findOne({
      where: { id: versionId, baseResumeId: id }
    });
    
    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'Version not found'
      });
    }
    
    // Save current state as a history entry before restoring
    await TailoredVersion.create({
      baseResumeId: id,
      type: 'base',
      data: baseResume.data,
      jobTitle: 'Pre-restore backup',
      atsScore: baseResume.atsScore || 0
    });
    
    // Restore data from version
    await baseResume.update({
      data: version.data,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      resume: baseResume
    });
    
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore version'
    });
  }
});
```

---

## Implementation Priority

### Phase 1: Critical Frontend (1-2 hours)
1. ✅ Template validation utility (DONE)
2. Integrate validation into DashboardPageClient
3. Add template fallback on mount
4. Show warnings via toasts

### Phase 2: Critical Backend (3-4 hours)
1. Resume export endpoint
2. Template list endpoint (if needed)

### Phase 3: High Priority Frontend (1-2 hours)
1. Reset to Default Template button
2. Template compatibility warnings UI

### Phase 4: High Priority Backend (3-4 hours)
1. Resume duplicate endpoint
2. Resume history endpoint
3. Tailored version fetch endpoint
4. Resume restore endpoint

---

## Testing Checklist

### Frontend
- [ ] Template validation works with valid template
- [ ] Template validation falls back to default for invalid template
- [ ] Warning toast shows when template is missing
- [ ] Reset to Default Template button works
- [ ] Compatibility warnings show for incompatible templates
- [ ] Compatibility score displays correctly

### Backend
- [ ] Export endpoint creates file successfully
- [ ] Export endpoint returns valid download URL
- [ ] Export endpoint cleans up after 1 hour
- [ ] Duplicate endpoint creates copy with "(Copy)" suffix
- [ ] Duplicate endpoint increments slot number
- [ ] History endpoint returns versions in correct order
- [ ] Tailored version fetch returns correct data
- [ ] Restore endpoint creates backup before restoring
- [ ] Restore endpoint updates resume correctly

---

## Files to Create/Modify

### Frontend
- ✅ `apps/web/src/utils/templateValidation.ts` (CREATED)
- `apps/web/src/app/dashboard/DashboardPageClient.tsx` (MODIFY)
- `apps/web/src/components/features/ResumeEditor/components/FormattingPanel.tsx` (MODIFY)
- `apps/web/src/components/Templates.tsx` (MODIFY - add compatibility scores)

### Backend
- `apps/api/routes/baseResume.routes.js` (MODIFY - add 4 endpoints)
- `apps/api/routes/template.routes.js` (CREATE - optional)
- `apps/api/routes/tailoredVersion.routes.js` (CREATE)
- `apps/api/services/resumeExporter.js` (VERIFY EXISTS)

---

## Estimated Completion Time

- **Phase 1 (Critical Frontend):** 1-2 hours
- **Phase 2 (Critical Backend):** 3-4 hours
- **Phase 3 (High Priority Frontend):** 1-2 hours
- **Phase 4 (High Priority Backend):** 3-4 hours

**Total:** 8-12 hours

---

## Next Steps

1. Complete Phase 1 (integrate template validation)
2. Create backend endpoints (Phase 2)
3. Add Reset Template button (Phase 3)
4. Implement remaining backend endpoints (Phase 4)
5. Test all features
6. Update documentation

---

**Status:** ✅ Planning Complete | ⏳ Implementation In Progress
**Created:** November 15, 2025
**Last Updated:** November 15, 2025

