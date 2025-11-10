# AI Features & Workflows Analysis - Resume Builder Tab

## Executive Summary

The Resume Builder tab includes **7 major AI-powered features** that help users optimize their resumes for Applicant Tracking Systems (ATS) and specific job descriptions. The system combines deterministic rule-based scoring with optional AI-powered semantic analysis to provide comprehensive resume optimization.

---

## Table of Contents

1. [AI Features Overview](#ai-features-overview)
2. [Technical Architecture](#technical-architecture)
3. [Feature-by-Feature Analysis](#feature-by-feature-analysis)
4. [Data Flow & Workflows](#data-flow--workflows)
5. [State Management](#state-management)
6. [API Endpoints](#api-endpoints)
7. [Subscription & Rate Limiting](#subscription--rate-limiting)
8. [Caching Strategy](#caching-strategy)
9. [Error Handling](#error-handling)
10. [Key Implementation Details](#key-implementation-details)

---

## 1. AI Features Overview

### 1.1 Core AI Features

| Feature | Description | Subscription Tier | Model Used | Status |
|---------|-------------|-------------------|------------|--------|
| **ATS Analysis** | Scores resume against job description with detailed breakdown | FREE | Rule-based + GPT-4o-mini (optional) | ✅ Active |
| **Resume Tailoring (Partial)** | AI-powered resume rewriting (selected sections) | PRO | gpt-4o-mini | ✅ Active |
| **Resume Tailoring (Full)** | Complete AI-powered resume rewrite | PRO | gpt-4o | ✅ Active |
| **Apply AI Recommendations** | Targeted improvements to boost ATS score | PRO | gpt-4o-mini | ✅ Active |
| **Generate Content** | Section-level AI content generation | PRO | gpt-4o-mini | ✅ Active |
| **Cover Letter Generation** | Creates tailored cover letters | PREMIUM | gpt-4o-mini | ✅ Active |
| **Portfolio Generator** | Generates portfolio outlines | PREMIUM | gpt-4o-mini | ✅ Active |

### 1.2 Supporting Features

- **Advanced Settings**: Tone (professional, technical, creative, casual) and length (brief, thorough, complete) customization
- **Before/After Comparison**: Visual score comparison after tailoring
- **Diff Tracking**: Shows what sections were modified during tailoring
- **Keyword Analysis**: Identifies matched and missing keywords

---

## 2. Technical Architecture

### 2.1 Frontend Architecture

**Component Structure:**
```
Dashboard (Main Container)
└── AIPanelRedesigned.tsx (Right Panel)
    ├── Job Description Input
    ├── ATS Score Display
    ├── Tailoring Controls
    ├── Advanced Settings (Collapsible)
    └── Other AI Actions (Cover Letter, Portfolio)
```

**Key Files:**
- `/apps/web/src/components/features/AIPanel/AIPanelRedesigned.tsx` - Main AI panel UI
- `/apps/web/src/app/dashboard/hooks/useDashboardHandlers.ts` - Business logic & API calls
- `/apps/web/src/services/apiService.ts` - API client with retry logic

### 2.2 Backend Architecture

**Service Structure:**
```
API Routes (editorAI.routes.js)
└── Services
    ├── tailorService.js - Core AI operations
    ├── generateContentService.js - Section generation
    ├── draftService.js - Draft management
    ├── usageService.js - Rate limiting & permissions
    └── ats/
        ├── atsScoringService.js - Rule-based scoring
        └── worldClassATS.js - Enhanced ATS with AI
```

**Key Files:**
- `/apps/api/routes/editorAI.routes.js` - 6 API endpoints
- `/apps/api/services/ai/tailorService.js` - Resume tailoring logic
- `/apps/api/services/ats/worldClassATS.js` - ATS scoring with semantic matching

---

## 3. Feature-by-Feature Analysis

### 3.1 ATS Analysis

**Purpose:** Score resume against job description and provide actionable feedback

**Workflow:**
```
User pastes job description (min 10 chars)
→ Click "Run ATS Check" button
→ Frontend: setIsAnalyzing(true)
→ API: POST /api/editor/ai/ats-check
→ Backend: scoreResumeWorldClass() with AI semantic matching
→ Cache result for 1 hour
→ Return: Overall score (0-100) + breakdown + keywords + tips
→ Frontend: Display score with progress bar + matched/missing keywords
```

**Scoring Components:**
- **Keywords** (40%): Matched technical & soft skills
- **Experience** (30%): Relevant job experience alignment
- **Format** (30%): Resume structure and readability

**AI Enhancement:**
- Uses GPT-4o-mini for semantic matching when `useAI: true`
- Falls back to rule-based scoring if AI fails
- Caches results for 1 hour using job description hash

**Key Files:**
- Frontend: `AIPanelRedesigned.tsx:73-77` (handleRunAnalysis)
- Handler: `useDashboardHandlers.ts:381-443` (analyzeJobDescription)
- Backend: `editorAI.routes.js:168-292` (POST /api/editor/ai/ats-check)
- Scoring: `worldClassATS.js` (scoreResumeWorldClass function)

---

### 3.2 Resume Tailoring

**Purpose:** AI-powered resume rewriting optimized for specific job descriptions

**Two Modes:**

#### Partial Mode (Default)
- Modifies selected sections only
- Faster, more conservative
- Uses gpt-4o-mini
- Max tokens: 1100
- Temperature: 0.3

#### Full Mode (Advanced)
- Complete resume rewrite
- More comprehensive changes
- Uses gpt-4o
- Max tokens: 1600
- Temperature: 0.3

**Workflow:**
```
User clicks "Auto-Tailor Resume"
→ Frontend: setBeforeScore(currentScore)
→ Frontend: setIsTailoring(true)
→ API: POST /api/editor/ai/tailor
→ Backend:
  1. Get current resume from DB
  2. Calculate ATS score BEFORE tailoring
  3. Build tailoring prompt with job description + settings
  4. Call OpenAI with appropriate model
  5. Parse JSON response (tailoredResume, diff, warnings)
  6. Normalize resume data (convert objects to arrays)
  7. Calculate ATS score AFTER tailoring
  8. Create TailoredVersion record in DB
  9. Return tailoredResume + diff + ATS comparison
→ Frontend:
  1. Merge tailored resume with current resume
  2. Remove duplicates
  3. Display before/after scores
  4. Show "Apply Changes" button
```

**Response Structure:**
```json
{
  "tailoredResume": { ...resumeData },
  "diff": [
    { "section": "experience", "change": "Updated bullet point" }
  ],
  "recommendedKeywords": ["React", "TypeScript"],
  "warnings": ["Some experience details may be too brief"],
  "ats": {
    "before": { "overall": 65, "keywords": 60, ... },
    "after": { "overall": 82, "keywords": 85, ... }
  },
  "confidence": 0.87
}
```

**Key Files:**
- Frontend: `AIPanelRedesigned.tsx:79-84` (handleAutoTailor)
- Handler: `useDashboardHandlers.ts:498-588` (tailorResumeForJob)
- Backend: `editorAI.routes.js:294-346` (POST /api/editor/ai/tailor)
- Service: `tailorService.js:163-306` (tailorResume function)

---

### 3.3 Apply AI Recommendations

**Purpose:** Make targeted improvements to boost ATS score based on analysis

**Workflow:**
```
User clicks "Apply Recommendations"
→ Frontend: Extract focus areas from aiRecommendations
→ API: POST /api/editor/ai/apply-recommendations
→ Backend:
  1. Get active resume
  2. Calculate ATS score BEFORE
  3. Build recommendations prompt with focus areas
  4. Call gpt-4o-mini (temp: 0.25, max_tokens: 1000)
  5. Parse response (updatedResume, appliedRecommendations)
  6. Normalize resume data
  7. Update BaseResume in DB directly
  8. Invalidate ATS & job analysis caches
  9. Calculate ATS score AFTER
  10. Return updated resume + recommendations + ATS comparison
→ Frontend:
  1. Apply updated resume to editor
  2. Display new ATS score
```

**Key Difference from Tailoring:**
- Updates the base resume directly (no TailoredVersion record)
- More focused changes based on specific recommendations
- Invalidates caches to ensure fresh data

**Key Files:**
- Handler: `useDashboardHandlers.ts:445-496` (applyAIRecommendations)
- Backend: `editorAI.routes.js:348-398` (POST /api/editor/ai/apply-recommendations)
- Service: `tailorService.js:308-430` (applyRecommendations function)

---

### 3.4 Generate Content (Section-Level)

**Purpose:** Generate AI-powered content for specific resume sections

**Workflow:**
```
User selects section (e.g., experience[0].summary)
→ Opens AI Generate modal
→ Provides optional instructions
→ API: POST /api/editor/ai/generate-content
→ Backend:
  1. Validate sectionPath format (e.g., "experience[0].summary")
  2. Build generation prompt with section context
  3. Call gpt-4o-mini
  4. Create Draft record in DB
  5. Return draft + draftId
→ Frontend: Display draft in modal
→ User clicks "Apply Draft"
→ API: POST /api/editor/ai/apply-draft
→ Backend:
  1. Get draft from DB
  2. Apply draft to resume at sectionPath
  3. Update BaseResume
  4. Mark AI request as 'applied'
→ Frontend: Update editor with new content
```

**Supported Section Types:**
- Summary / Professional Summary
- Experience bullets
- Skills descriptions
- Education highlights
- Project descriptions

**Key Files:**
- Backend: `editorAI.routes.js:61-120` (POST /api/editor/ai/generate-content)
- Backend: `editorAI.routes.js:122-166` (POST /api/editor/ai/apply-draft)
- Service: `generateContentService.js` (generateSectionDraft function)
- Service: `draftService.js` (applyDraft function)

---

### 3.5 Cover Letter Generation

**Purpose:** Generate tailored cover letters based on resume and job description

**Workflow:**
```
User clicks "Generate Cover Letter"
→ API: POST /api/editor/ai/cover-letter
→ Backend:
  1. Get active resume
  2. Build cover letter prompt (resume + job + company + tone)
  3. Call gpt-4o-mini (temp: 0.3, max_tokens: 900)
  4. Parse response (subject, greeting, bodyParagraphs, closing, signature)
  5. Create GeneratedDocument record (type: COVER_LETTER)
  6. Return document + content
→ Frontend: Display cover letter in modal/panel
```

**Response Structure:**
```json
{
  "subject": "Application for Senior Developer Role",
  "greeting": "Dear Hiring Manager,",
  "bodyParagraphs": [
    "I am excited to apply for...",
    "With 5 years of experience...",
    "I would welcome the opportunity..."
  ],
  "closing": "Thank you for your consideration.",
  "signature": "Best regards,\n[Your Name]"
}
```

**Key Files:**
- Frontend: `AIPanelRedesigned.tsx:584-605` (Generate Cover Letter button)
- Handler: `useDashboardHandlers.ts:590-642` (generateCoverLetterDraft)
- Backend: `editorAI.routes.js:400-449` (POST /api/editor/ai/cover-letter)
- Service: `tailorService.js:432-534` (generateCoverLetter function)

---

### 3.6 Portfolio Generator

**Purpose:** Generate portfolio outlines based on resume content

**Workflow:**
```
User clicks "Generate Portfolio Outline"
→ API: POST /api/editor/ai/portfolio
→ Backend:
  1. Get active resume
  2. Build portfolio prompt (resume + tone)
  3. Call gpt-4o-mini (temp: 0.3, max_tokens: 1000)
  4. Parse response (headline, tagline, about, highlights, selectedProjects)
  5. Create GeneratedDocument record (type: PORTFOLIO)
  6. Return document + content
→ Frontend: Display portfolio outline
```

**Response Structure:**
```json
{
  "headline": "Full-Stack Developer & Problem Solver",
  "tagline": "Building scalable web applications with modern technologies",
  "about": "Brief bio paragraph...",
  "highlights": [
    "5+ years of experience in React & Node.js",
    "Led team of 4 developers",
    "Reduced load time by 40%"
  ],
  "selectedProjects": [
    {
      "title": "E-commerce Platform",
      "description": "Built scalable...",
      "technologies": ["React", "Node.js", "PostgreSQL"]
    }
  ]
}
```

**Key Files:**
- Frontend: `AIPanelRedesigned.tsx:606-627` (Generate Portfolio button)
- Handler: `useDashboardHandlers.ts:644-688` (generatePortfolioDraft)
- Backend: `editorAI.routes.js:451-482` (POST /api/editor/ai/portfolio)
- Service: `tailorService.js:536-624` (generatePortfolio function)

---

### 3.7 Advanced Settings

**Purpose:** Customize AI behavior for all features

**Settings:**

#### Mode (Tailoring Only)
- **PARTIAL**: Selective section updates (default)
- **FULL**: Complete resume rewrite

#### Tone (All Features)
- **professional** (default): Formal business language
- **technical**: Technical jargon, detailed
- **creative**: Engaging, unique voice
- **casual**: Conversational, relaxed

#### Length (Tailoring & Generation)
- **brief**: Concise, to the point
- **thorough** (default): Balanced detail
- **complete**: Comprehensive, detailed

**UI Location:**
- Collapsible section in AI Panel (line 474-580)
- Defaults: Mode=PARTIAL, Tone=professional, Length=thorough

---

## 4. Data Flow & Workflows

### 4.1 Complete User Journey: ATS Analysis → Tailoring → Apply

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: ATS ANALYSIS                                        │
└─────────────────────────────────────────────────────────────┘
User pastes job description
    ↓
Click "Run ATS Check"
    ↓
[Frontend] setIsAnalyzing(true)
    ↓
[API Call] POST /api/editor/ai/ats-check
    ↓
[Backend]
  - Load resume from DB
  - Hash job description for cache key
  - Check cache (1 hour TTL)
  - If cache miss:
    → Call scoreResumeWorldClass(useAI: true)
    → AI semantic matching with GPT-4o-mini
    → Calculate score (0-100)
    → Extract matched/missing keywords
    → Generate actionable tips
  - Cache result
  - Return analysis
    ↓
[Frontend]
  - Display score with color coding:
    → Green (80+): "Excellent"
    → Orange (60-79): "Good"
    → Red (<60): "Needs Work"
  - Show matched keywords (green badges)
  - Show top 5 missing keywords (red badges)
  - Show "Quick Wins" recommendations
  - Enable "Auto-Tailor Resume" button

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: RESUME TAILORING                                    │
└─────────────────────────────────────────────────────────────┘
User clicks "Auto-Tailor Resume"
    ↓
[Frontend]
  - Save current score as "beforeScore"
  - setIsTailoring(true)
    ↓
[API Call] POST /api/editor/ai/tailor
  Body: {
    resumeId,
    jobDescription,
    mode: "PARTIAL" or "FULL",
    tone: "professional",
    length: "thorough"
  }
    ↓
[Backend]
  - Check subscription tier (PRO required)
  - Check rate limits (3/hour for tailoring)
  - Load active resume from DB
  - Calculate ATS score BEFORE (atsBefore)
  - Build tailoring prompt:
    → Resume JSON snapshot
    → Job description
    → Mode, tone, length settings
    → Instructions to preserve truthfulness
  - Call OpenAI:
    → Model: gpt-4o (FULL) or gpt-4o-mini (PARTIAL)
    → Temperature: 0.3 (focused, conservative)
    → Max tokens: 1600 (FULL) or 1100 (PARTIAL)
    → Timeout: 120 seconds
  - Parse JSON response
  - Normalize data (objects → arrays)
  - Calculate ATS score AFTER (atsAfter)
  - Create TailoredVersion record in DB
  - Record AI usage metrics
  - Return:
    → tailoredResume (complete resume JSON)
    → diff (array of changes)
    → recommendedKeywords (array)
    → warnings (array)
    → ats: { before: {...}, after: {...} }
    ↓
[Frontend]
  - Merge tailored resume with current resume
  - Remove duplicate entries
  - Display results card with:
    → "Resume Tailored Successfully!" message
    → Before/After/Improvement scores
    → Number of sections modified
    → Keywords added
    → "Apply Changes" button
    → "Dismiss" button

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: APPLY CHANGES                                       │
└─────────────────────────────────────────────────────────────┘
User clicks "Apply Changes"
    ↓
[Frontend]
  - Resume already merged in memory (step 2)
  - setHasChanges(true) - triggers save indicator
  - User can now save or continue editing
    ↓
User clicks "Save" (auto-save or manual)
    ↓
[API Call] PUT /api/resumes/:id
    ↓
[Backend]
  - Validate resume data
  - Update BaseResume record
  - Return updated resume
    ↓
[Frontend]
  - setHasChanges(false)
  - Display "Saved" indicator
```

### 4.2 State Management Flow

**Key State Variables:**
```typescript
// ATS Analysis State
const [jobDescription, setJobDescription] = useState('');
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [matchScore, setMatchScore] = useState<ATSAnalysisResult | null>(null);
const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
const [showATSScore, setShowATSScore] = useState(false);

// Tailoring State
const [isTailoring, setIsTailoring] = useState(false);
const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);
const [tailorEditMode, setTailorEditMode] = useState('PARTIAL');
const [beforeScore, setBeforeScore] = useState<number | null>(null);

// Advanced Settings
const [selectedTone, setSelectedTone] = useState('professional');
const [selectedLength, setSelectedLength] = useState('thorough');

// Cover Letter State
const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
const [coverLetterDraft, setCoverLetterDraft] = useState<CoverLetterDraft | null>(null);

// Portfolio State
const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);
const [portfolioDraft, setPortfolioDraft] = useState<PortfolioDraft | null>(null);

// UI State
const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
```

---

## 5. State Management

### 5.1 Frontend State Architecture

**State Hook: `useState` in DashboardPageClient.tsx**

All AI-related state is managed at the dashboard level and passed down to:
1. `AIPanelRedesigned` (UI component)
2. `useDashboardHandlers` (business logic hook)

**State Flow Pattern:**
```
DashboardPageClient (Parent)
  ↓ Props
AIPanelRedesigned (UI)
  ↓ Events
useDashboardHandlers (Logic)
  ↓ API Calls
apiService
  ↓ HTTP
Backend Services
```

### 5.2 Resume Data Normalization

**Problem:** Prisma JSON fields can store objects with numeric keys that should be arrays

**Solution:** `normalizeResumeData()` function in `tailorService.js:29-109`

**What it normalizes:**
```javascript
// BEFORE (from AI or DB)
{
  skills: {
    technical: { "0": "React", "1": "Node.js" }
  },
  experience: {
    "0": { title: "Developer", bullets: { "0": "Built...", "1": "Led..." } }
  }
}

// AFTER (normalized)
{
  skills: {
    technical: ["React", "Node.js"]
  },
  experience: [
    { title: "Developer", bullets: ["Built...", "Led..."] }
  ]
}
```

**Applied in:**
- Resume tailoring (line 233)
- Apply recommendations (line 364)
- All resume data writes

---

## 6. API Endpoints

### 6.1 Endpoint Summary

| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| POST | `/api/editor/ai/ats-check` | Run ATS analysis | ✅ | 60/hour |
| POST | `/api/editor/ai/tailor` | Tailor resume | ✅ | 3/hour (PRO) |
| POST | `/api/editor/ai/apply-recommendations` | Apply AI suggestions | ✅ | 10/hour (PRO) |
| POST | `/api/editor/ai/generate-content` | Generate section content | ✅ | 20/hour (PRO) |
| POST | `/api/editor/ai/apply-draft` | Apply generated draft | ✅ | N/A |
| POST | `/api/editor/ai/cover-letter` | Generate cover letter | ✅ | 5/hour (PREMIUM) |
| POST | `/api/editor/ai/portfolio` | Generate portfolio | ✅ | 5/hour (PREMIUM) |

### 6.2 Common Request/Response Patterns

**Standard Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Standard Success Response:**
```json
{
  "success": true,
  // ... feature-specific data
}
```

**Authentication:**
- All endpoints use `authenticate` middleware
- Extracts `userId` from JWT token: `request.user.userId`

**CORS Configuration:**
- Allows credentials
- Origin: `process.env.CORS_ORIGIN` or localhost:3000
- Headers: content-type, authorization, x-csrf-token

---

## 7. Subscription & Rate Limiting

### 7.1 Subscription Tiers

| Feature | FREE | PRO | PREMIUM |
|---------|------|-----|---------|
| ATS Analysis | ✅ 60/hour | ✅ 60/hour | ✅ 60/hour |
| Resume Tailoring (Partial) | ❌ | ✅ 3/hour | ✅ 3/hour |
| Resume Tailoring (Full) | ❌ | ✅ 3/hour | ✅ 3/hour |
| Apply Recommendations | ❌ | ✅ 10/hour | ✅ 10/hour |
| Generate Content | ❌ | ✅ 20/hour | ✅ 20/hour |
| Cover Letter | ❌ | ❌ | ✅ 5/hour |
| Portfolio Generator | ❌ | ❌ | ✅ 5/hour |

### 7.2 Rate Limiting Implementation

**Service:** `usageService.js`

**Functions:**
- `ensureActionAllowed(tier, action)` - Checks subscription tier
- `ensureWithinRateLimit({userId, action, tier})` - Checks rate limits
- `recordAIRequest({userId, baseResumeId, action, model, tokensUsed, metadata})` - Records usage

**Storage:**
- Tracked in `AIRequest` table (Prisma model)
- Counted per user per hour
- Rolling window implementation

**Error Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. You can make 3 requests per hour for this action."
}
```

---

## 8. Caching Strategy

### 8.1 Cache Configuration

**Location:** `cacheConfig.js` + `cacheManager.js`

**Cache Namespaces:**
```javascript
{
  ATS_SCORE: 'ats_score',        // 1 hour TTL
  JOB_ANALYSIS: 'job_analysis'   // 1 hour TTL
}
```

### 8.2 Cache Keys

**ATS Score Cache Key:**
```
namespace: ATS_SCORE
keyParts: [userId, resumeId, jobDescriptionHash]
Example: "ats_score:user123:resume456:hash789abc"
```

**Why Hash Job Description:**
- Same job description → same cache key → reuse result
- Saves API calls and OpenAI costs
- SHA-256 hash in `hashJobDescription()` function

### 8.3 Cache Invalidation

**When to Invalidate:**
1. After `applyRecommendations` - Resume changed
2. After `applyDraft` - Resume section changed

**How:**
```javascript
await Promise.all([
  cacheManager.invalidateNamespace(CACHE_NAMESPACES.JOB_ANALYSIS, [userId, resumeId]),
  cacheManager.invalidateNamespace(CACHE_NAMESPACES.ATS_SCORE, [userId, resumeId])
]);
```

**Note:** Cache invalidation uses partial key matching (userId + resumeId), not full key with hash

---

## 9. Error Handling

### 9.1 Frontend Error Handling

**Pattern:**
```typescript
try {
  const response = await apiService.someAIFeature(...);
  // Handle success
} catch (error) {
  logger.error('Feature failed', { error });
  const friendlyError = formatErrorForDisplay(error, {
    action: 'performing action',
    feature: 'feature name'
  });
  setSaveError(friendlyError);
  return null;
} finally {
  setIsLoading(false);
}
```

**Key Functions:**
- `formatErrorForDisplay()` - Converts technical errors to user-friendly messages
- `logger.error()` - Logs to console/service
- `setSaveError()` - Displays error banner in UI

### 9.2 Backend Error Handling

**AIUsageError Class:**
```javascript
class AIUsageError extends Error {
  constructor(message, statusCode = 403) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

**Usage:**
```javascript
if (!user.isActive) {
  throw new AIUsageError('You can only run AI features on the active resume.', 400);
}
```

**Error Response Middleware:**
```javascript
if (error instanceof AIUsageError) {
  return reply.status(error.statusCode || 403).send({
    success: false,
    error: error.message
  });
}
```

### 9.3 OpenAI Error Handling

**Retry Logic in apiService.ts:**
- Automatic retry with exponential backoff
- Max 3 retries
- Handles 429 (rate limit), 500 (server error), timeout

**Timeout Configuration:**
- ATS Analysis: 90 seconds
- Tailoring (FULL): 120 seconds (2 minutes)
- Tailoring (PARTIAL): 90 seconds
- Other features: 90 seconds

**Fallback Strategy:**
```javascript
try {
  analysis = await scoreResumeWorldClass({ useAI: true });
} catch (worldClassError) {
  logger.error('World-class ATS failed, using fallback');
  analysis = scoreResumeAgainstJob({ /* basic scoring */ });
}
```

---

## 10. Key Implementation Details

### 10.1 Prompt Engineering

**Principles:**
1. **Structured Output:** All prompts request JSON responses
2. **Never Invent Facts:** Explicitly instruct AI to only use provided information
3. **Preserve Truthfulness:** Never fabricate experience or skills
4. **Temperature:** 0.25-0.3 for focused, consistent output
5. **Context Awareness:** Include full resume snapshot + job description

**Example Prompt Structure (Tailoring):**
```
You are a professional resume writer optimizing a resume for ATS and recruiters.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${JSON.stringify(resumeSnapshot, null, 2)}

INSTRUCTIONS:
- Mode: ${mode} (PARTIAL or FULL)
- Tone: ${tone}
- Length: ${length}
- Never invent experience, skills, or accomplishments
- Optimize keywords for ATS
- Maintain truthfulness

OUTPUT FORMAT (JSON):
{
  "tailoredResume": { ...complete resume object },
  "diff": [{ "section": "...", "change": "..." }],
  "recommendedKeywords": ["..."],
  "warnings": ["..."],
  "confidence": 0.85
}
```

**Prompt Builder Location:** `promptBuilder.js`

### 10.2 Data Validation

**Frontend Validation (Before Save):**
```typescript
const validation = validateResumeData(resumeData);
if (!validation.isValid) {
  const errorMessages = Object.values(validation.errors).join(', ');
  setSaveError(`Validation failed: ${errorMessages}`);
  return;
}
```

**Backend Validation (API Routes):**
```javascript
if (!jobDescription || jobDescription.trim().length < 10) {
  return reply.status(400).send({
    success: false,
    error: 'jobDescription must be at least 10 characters'
  });
}
```

**Sanitization:**
- `sanitizeResumeData()` before saving to DB
- Removes malicious content, XSS attempts
- Trims whitespace
- Validates data types

### 10.3 Database Schema (Key Tables)

**BaseResume:**
```prisma
model BaseResume {
  id                 String    @id @default(cuid())
  userId             String
  name               String
  data               Json      // Resume content
  metadata           Json      // Section order, visibility
  formatting         Json      // Font, spacing, etc.
  isActive           Boolean   @default(false)
  lastAIAccessedAt   DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}
```

**TailoredVersion:**
```prisma
model TailoredVersion {
  id                   String      @id @default(cuid())
  userId               String
  baseResumeId         String
  jobTitle             String?
  company              String?
  jobDescriptionHash   String
  mode                 TailorMode  // PARTIAL | FULL
  tone                 String
  data                 Json        // Tailored resume content
  diff                 Json        // Array of changes
  atsScoreBefore       Int?
  atsScoreAfter        Int?
  createdAt            DateTime    @default(now())
}
```

**AIRequest (Usage Tracking):**
```prisma
model AIRequest {
  id            String    @id @default(cuid())
  userId        String
  baseResumeId  String
  action        AIAction  // Enum: ATS_SCORE, TAILOR_FULL, etc.
  provider      String?   // "openai" or "deterministic"
  model         String?   // "gpt-4o", "gpt-4o-mini"
  tokensUsed    Int?
  status        String    @default("completed")
  metadata      Json?
  createdAt     DateTime  @default(now())
}
```

**GeneratedDocument:**
```prisma
model GeneratedDocument {
  id            String            @id @default(cuid())
  userId        String
  baseResumeId  String
  type          GeneratedDocType  // COVER_LETTER | PORTFOLIO
  jobTitle      String?
  company       String?
  tone          String
  data          Json              // Generated content
  createdAt     DateTime          @default(now())
}
```

### 10.4 Metrics & Monitoring

**Prometheus Metrics:**
```javascript
// Counter: Number of AI actions performed
aiActionCounter.inc({
  action: 'tailor_full',
  tier: 'PRO'
});

// Histogram: Action latency
const stopTimer = aiActionLatency.startTimer({
  action: 'tailor_full',
  model: 'gpt-4o'
});
// ... perform action
stopTimer();

// Gauge: Current ATS scores
atsScoreGauge.set({ userId, resumeId }, 82);

// Counter: ATS score buckets
atsScoreCounter.inc({ result_bucket: '75_89' });
```

**Logging:**
```javascript
logger.info('AI tailoring completed', {
  userId,
  resumeId,
  mode: 'FULL',
  atsBefore: 65,
  atsAfter: 82,
  warnings: 2,
  diffCount: 7
});
```

### 10.5 Security Considerations

**Active Resume Requirement:**
```javascript
if (!resume.isActive) {
  throw new AIUsageError('You can only run AI features on the active resume.', 400);
}
```

**Why:** Prevents users from running expensive AI operations on old/archived resumes

**User Ownership Verification:**
```javascript
const resume = await prisma.baseResume.findFirst({
  where: { id: resumeId, userId }
});
if (!resume) {
  throw new Error('Base resume not found');
}
```

**Draft Security:**
```javascript
if (draftRecord.userId !== userId) {
  return reply.status(403).send({
    success: false,
    error: 'You cannot apply this draft'
  });
}
```

**Input Sanitization:**
- Job descriptions: min 10 characters
- Resume data: validated before processing
- Prompts: sanitized to prevent injection

---

## Summary & Recommendations

### Current Strengths

✅ **Comprehensive AI Features:** 7 distinct features covering entire resume optimization workflow
✅ **Smart Caching:** 1-hour TTL reduces costs and improves performance
✅ **Robust Error Handling:** Fallbacks, retries, and user-friendly error messages
✅ **Subscription Tiers:** Clear feature gating with FREE → PRO → PREMIUM progression
✅ **Rate Limiting:** Prevents abuse while allowing reasonable usage
✅ **Data Normalization:** Handles Prisma JSON quirks correctly
✅ **Metrics & Monitoring:** Prometheus metrics for observability
✅ **Security:** User ownership verification, active resume requirements

### Potential Improvements

1. **Batch Processing:** Allow multiple resume tailoring operations in parallel
2. **A/B Testing:** Compare different tone/length settings side-by-side
3. **Version History:** Save and compare multiple tailored versions
4. **Real-time Collaboration:** Multiple users editing same resume (future)
5. **AI Suggestions Preview:** Show AI suggestions before applying (currently auto-applies)
6. **Custom Prompts:** Allow power users to customize AI prompts
7. **Export Tailored Versions:** Download specific tailored version as separate file

### Technical Debt

- ⚠️ **No Type Safety on AI Responses:** JSON parsing without schema validation (consider Zod)
- ⚠️ **Cache Invalidation Complexity:** Partial key matching may miss some cache entries
- ⚠️ **Resume Merge Logic:** `mergeTailoredResume` could be more robust
- ⚠️ **State Management:** Consider migrating to Zustand or Redux for complex state

---

## Appendix: File Reference

### Frontend
- `/apps/web/src/components/features/AIPanel/AIPanelRedesigned.tsx` - Main AI panel UI (635 lines)
- `/apps/web/src/app/dashboard/hooks/useDashboardHandlers.ts` - AI business logic (848 lines)
- `/apps/web/src/services/apiService.ts` - API client with retry logic
- `/apps/web/src/types/ai.ts` - TypeScript type definitions
- `/apps/web/src/utils/aiHelpers.ts` - AI utility functions

### Backend
- `/apps/api/routes/editorAI.routes.js` - 6 API endpoints (484 lines)
- `/apps/api/services/ai/tailorService.js` - Core AI operations (632 lines)
- `/apps/api/services/ai/generateContentService.js` - Section generation
- `/apps/api/services/ai/draftService.js` - Draft management
- `/apps/api/services/ai/usageService.js` - Rate limiting & permissions
- `/apps/api/services/ai/promptBuilder.js` - Prompt engineering
- `/apps/api/services/ats/atsScoringService.js` - Rule-based ATS scoring
- `/apps/api/services/ats/worldClassATS.js` - Enhanced ATS with AI
- `/apps/api/utils/openAI.js` - OpenAI API client
- `/apps/api/utils/cacheManager.js` - Redis/in-memory cache
- `/apps/api/observability/metrics.js` - Prometheus metrics

---

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Analyzed Commit:** 8d4c7e4
