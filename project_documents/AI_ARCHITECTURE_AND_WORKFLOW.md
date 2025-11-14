# AI Features Architecture & Workflow
## RoleReady Resume Builder - Technical Documentation

**Last Updated:** November 14, 2024  
**Version:** 2.0  
**Status:** Production

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Feature 1: Resume Parsing](#feature-1-resume-parsing)
4. [Feature 2: ATS Score Analysis](#feature-2-ats-score-analysis)
5. [Feature 3: Resume Tailoring](#feature-3-resume-tailoring)
6. [Supporting System: Working Draft](#supporting-system-working-draft)
7. [Features In Development](#features-in-development)
8. [Database Schema](#database-schema)
9. [Performance & Optimization](#performance--optimization)

---

## System Overview

RoleReady is an AI-powered resume builder that helps users optimize their resumes for job applications. The system uses OpenAI's GPT models to provide intelligent resume analysis and optimization.

### Production-Ready Features (3)
1. ✅ **Resume Parsing** - Upload PDF/DOCX → Extract structured data
2. ✅ **ATS Score Analysis** - Calculate resume-job compatibility (0-100)
3. ✅ **Resume Tailoring** - Optimize resume for specific jobs

### Features In Development (4)
- 🚧 **Content Generation** - AI-powered section rewriting
- 🚧 **Cover Letter Generation** - Create tailored cover letters
- 🚧 **Portfolio Generation** - Generate professional portfolios
- 🚧 **Interview Prep** - AI-powered interview preparation

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback)

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Fastify (high-performance web framework)
- **ORM:** Prisma (type-safe database access)
- **Database:** PostgreSQL (with JSONB support)
- **Cache:** Redis (multi-level caching strategy)
- **Authentication:** JWT (HTTP-only cookies, secure)

### AI Services
- **Primary Model:** OpenAI GPT-4o-mini (cost-effective)
- **Fallback Model:** OpenAI GPT-4o (powerful, for corrupted text)
- **Embeddings:** OpenAI text-embedding-3-small
- **Strategy:** Hybrid model selection based on content quality

### Architecture Pattern
```
User Browser
    ↓ (HTTPS)
Next.js Frontend (Port 3000)
    ↓ (REST API with JWT)
Node.js/Fastify Backend (Port 3001)
    ↓ (Prisma ORM)
PostgreSQL Database (JSONB for resume data)
    ↓ (External API calls)
OpenAI API (GPT-4o, GPT-4o-mini, Embeddings)
    ↓
Redis Cache (30-day TTL for ATS results)
```

### Deployment
- **Development:** Local Node.js servers (no Docker)
- **Production:** Direct deployment to VPS/cloud servers
- **Database:** Managed PostgreSQL instance
- **Cache:** Managed Redis instance

---

## Feature 1: Resume Parsing

### What It Does
Extracts structured data (contact info, experience, education, skills, etc.) from uploaded PDF/DOCX files using AI. The system intelligently chooses between two AI models based on text quality.

---

### Complete Flow: Frontend → Backend → AI → Database

#### **STEP 1: User Uploads File (Frontend)**

**Location:** `apps/web/src/components/modals/ImportModal.tsx`

**User Action:**
- User opens Import Modal
- Clicks "Upload Resume" button
- Selects PDF or DOCX file from computer
- File is validated (max 10MB, allowed types)

**What Happens:**
1. File is read into memory as a Buffer
2. FormData object is created with file + metadata
3. POST request sent to `/api/base-resumes` endpoint
4. Loading spinner shown to user

**Data Sent to Backend:**
- `file`: Binary file data (PDF/DOCX)
- `slotNumber`: Resume slot (1-5)
- `fileName`: Original filename
- JWT cookie (automatic, for authentication)

---

#### **STEP 2: Backend Receives Request (API Route)**

**Location:** `apps/api/routes/baseResume.routes.js`

**Authentication:**
- JWT token extracted from HTTP-only cookie
- Middleware verifies token and extracts `userId`
- If invalid/missing → 401 Unauthorized

**What Happens:**
1. Fastify multipart handler extracts file from request
2. File buffer and metadata extracted
3. User's existing resumes counted (max 5 slots enforced)
4. Slot availability checked
5. Resume parser service called
6. Result saved to database
7. Response sent back to frontend

**Error Handling:**
- Invalid file type → 400 Bad Request
- File too large → 413 Payload Too Large
- Slot already occupied → 409 Conflict
- Parsing fails → 500 Internal Server Error

---

#### **STEP 3: Text Extraction (Resume Parser Service)**

**Location:** `apps/api/services/resumeParser.js`

**What Happens:**

**3.1 Extract Raw Text:**
- **PDF files:** Uses `pdf-parse` library
  - Extracts text from all pages
  - Handles multi-column layouts
  - Preserves line breaks and spacing
- **DOCX files:** Uses `mammoth` library
  - Converts to plain text
  - Preserves formatting hints
  - Extracts tables and lists

**3.2 Analyze Text Quality:**
The system analyzes the extracted text to determine if it's clean or corrupted.

**Quality Metrics Calculated:**
- **Text Length:** 100-50,000 chars (optimal range)
- **Alphanumeric Ratio:** % of letters/numbers vs special chars (target: ≥60%)
- **PDF Artifacts:** Count of junk like "obj", "endobj", "stream", "xref" (target: <10)
- **Resume Keywords:** Presence of "experience", "education", "skills", "email", "phone" (target: ≥2)

**Quality Decision:**
- **Clean Text:** All metrics pass → Confidence ≥0.7 → Use GPT-4o-mini
- **Corrupted Text:** Metrics fail → Confidence <0.7 → Use GPT-4o

**Why This Matters:**
- GPT-4o-mini: $0.15 per 1M tokens (fast, cheap)
- GPT-4o: $2.50 per 1M tokens (powerful, expensive)
- **Cost savings:** ~94% on clean resumes

---

#### **STEP 4: AI Parsing (OpenAI API)**

**Location:** `apps/api/services/resumeParser.js` → `structureResumeWithAI()` or `parseWithGPT4o()`

**What Happens:**

**4.1 Prompt Construction:**
A detailed prompt is built that instructs the AI to:
- Extract only factual information
- Ignore PDF artifacts and junk data
- Return structured JSON with specific schema
- Use ISO date formats (YYYY-MM or YYYY-MM-DD)
- Use null for missing fields (never invent data)

**4.2 API Call to OpenAI:**
- **Model:** GPT-4o-mini (clean) or GPT-4o (corrupted)
- **Temperature:** 0.1 (low = factual, high = creative)
- **Max Tokens:** 4000 (enough for large resumes)
- **Response Format:** JSON mode (forces valid JSON output)

**4.3 AI Processing:**
The AI model:
- Reads the entire resume text
- Identifies sections (contact, experience, education, skills, etc.)
- Extracts dates and formats them consistently
- Structures bullet points and descriptions
- Identifies skills and technologies
- Returns structured JSON

**4.4 Response Parsing:**
- JSON response extracted from AI output
- Parsed and validated
- If invalid JSON → Attempt repair with `jsonrepair` library
- If still invalid → Throw error

---

#### **STEP 5: Data Validation & Enhancement**

**Location:** `apps/api/services/resumeParser.js` → `ensureContactDetails()`

**What Happens:**

**5.1 Contact Information Validation:**
- Verify email format (regex validation)
- Verify phone format (international formats supported)
- Extract LinkedIn/GitHub URLs from links array
- Validate URL formats
- Merge duplicate contact fields

**5.2 Data Normalization:**
- Dates converted to ISO format
- Empty strings converted to null
- Arrays initialized even if empty
- Duplicate entries removed
- Skills categorized (technical, tools, soft)

**5.3 Completeness Check:**
- Verify at least one contact method exists
- Verify at least one experience or education entry
- Flag missing critical fields

---

#### **STEP 6: Save to Database (Prisma ORM)**

**Location:** `apps/api/routes/baseResume.routes.js`

**Database Operation:**
```
INSERT INTO baseResumes
```

**Data Saved:**
- `id`: UUID (auto-generated)
- `userId`: User who uploaded (from JWT)
- `slotNumber`: 1-5 (which slot this occupies)
- `fileName`: Original filename
- `data`: Structured resume JSON (JSONB column)
- `formatting`: Empty object (for future use)
- `metadata`: Parse method, confidence score, timestamp
- `isActive`: false (not activated yet)
- `createdAt`: Current timestamp
- `updatedAt`: Current timestamp

**Database State After Insert:**
```
baseResumes table:
├─ id: "resume-uuid-abc123"
├─ userId: "user-uuid-xyz789"
├─ slotNumber: 1
├─ fileName: "John_Doe_Resume.pdf"
├─ data: {
│    contact: { name: "John Doe", email: "john@example.com", ... },
│    summary: "Experienced software engineer...",
│    experience: [{ company: "Google", role: "SWE", ... }],
│    education: [...],
│    skills: { technical: ["Python", "React"], ... }
│  }
├─ metadata: { parseMethod: "gpt-4o-mini", confidence: 0.85 }
├─ isActive: false
└─ createdAt: "2024-11-14T10:00:00Z"
```

---

#### **STEP 7: Response to Frontend**

**What Backend Sends:**
```
HTTP 200 OK
{
  "success": true,
  "resume": {
    "id": "resume-uuid-abc123",
    "slotNumber": 1,
    "fileName": "John_Doe_Resume.pdf",
    "isActive": false,
    "createdAt": "2024-11-14T10:00:00Z",
    "data": { ... } // Full structured resume
  }
}
```

---

#### **STEP 8: Frontend Updates UI**

**Location:** `apps/web/src/components/modals/ImportModal.tsx`

**What Happens:**
1. Response received and parsed
2. Local state updated with new resume
3. Resume card appears in the modal
4. Shows: filename, upload date, toggle (inactive), Parse button
5. Success toast notification shown
6. Loading spinner hidden

**UI State After Upload:**
```
Slot 1: [John_Doe_Resume.pdf] [Toggle: OFF] [Parse]
Slot 2: [Empty]
Slot 3: [Empty]
Slot 4: [Empty]
Slot 5: [Empty]
```

---

### Key Logic: Model Selection

**Decision Tree:**
```
Extract Text from File
    ↓
Analyze Quality
    ↓
Is alphanumericRatio ≥ 0.6? ────NO──→ Use GPT-4o
    ↓ YES
Are pdfArtifacts < 10? ────NO──→ Use GPT-4o
    ↓ YES
Are resumeKeywords ≥ 2? ────NO──→ Use GPT-4o
    ↓ YES
Is textLength 100-50000? ────NO──→ Use GPT-4o
    ↓ YES
Use GPT-4o-mini (94% cheaper!)
```

---

### Error Scenarios & Handling

| Error | Cause | Response | User Sees |
|-------|-------|----------|-----------|
| **400 Bad Request** | Invalid file type | Error message | "Only PDF/DOCX allowed" |
| **413 Payload Too Large** | File > 10MB | Error message | "File too large (max 10MB)" |
| **409 Conflict** | Slot occupied | Error message | "Slot already has a resume" |
| **500 Parse Error** | AI parsing failed | Error message | "Could not parse resume" |
| **503 Service Unavailable** | OpenAI API down | Error message | "AI service unavailable" |

---

## Feature 2: ATS Score Analysis

### What It Does
Calculates a compatibility score (0-100) between a resume and job description using semantic analysis and AI. Identifies missing keywords, strengths, and improvement suggestions.

---

### Complete Flow: Frontend → Backend → AI → Database

#### **STEP 1: User Requests ATS Check (Frontend)**

**Location:** `apps/web/src/components/features/AIPanel/AIPanelRedesigned.tsx`

**User Action:**
- User pastes job description into text area
- Clicks "Check ATS Score" button
- Loading state shown (spinner)

**What Happens:**
1. Validate job description (min 50 chars)
2. Get current resume data from editor
3. POST request to `/api/editor/ai/ats-check`
4. Loading indicator shown

**Data Sent to Backend:**
- `resumeId`: Active resume ID
- `resumeData`: Current resume JSON (from editor, may include draft changes)
- `jobDescription`: Job posting text
- JWT cookie (automatic)

---

#### **STEP 2: Backend Receives Request (API Route)**

**Location:** `apps/api/routes/editorAI.routes.js`

**Authentication & Validation:**
1. JWT verified → Extract `userId`
2. Validate request body schema
3. Verify user owns the resume
4. Check user's subscription tier (ATS checks allowed?)
5. Check rate limits (e.g., 10 checks per day for free tier)

**What Happens:**
1. Check cache first (30-day TTL)
   - Cache key: `hash(jobDescription + resumeData)`
   - If cached → Return immediately (fast!)
2. If not cached → Call ATS scoring service
3. Record AI request in database (for usage tracking)
4. Cache result for future requests
5. Return score + details to frontend

---

#### **STEP 3: ATS Scoring Service (Parallel Processing)**

**Location:** `apps/api/services/ats/` (multiple files)

**What Happens - 3 Parallel Operations:**

**Operation 1: Extract Skills from Job Description**
- **Service:** `aiSkillExtractor.js`
- **AI Model:** GPT-4o-mini
- **Prompt:** "Extract required skills, preferred skills, experience requirements from this job description"
- **Output:** 
  ```
  {
    required_skills: ["Python", "React", "AWS"],
    preferred_skills: ["Docker", "Kubernetes"],
    experience_requirements: { years: "3-5", level: "mid" },
    role_type: "Backend Engineer",
    seniority_level: "mid"
  }
  ```

**Operation 2: Extract Skills from Resume**
- **Service:** `aiSkillExtractor.js`
- **AI Model:** GPT-4o-mini
- **Prompt:** "Extract all technical skills, tools, and technologies from this resume"
- **Output:**
  ```
  {
    technical_skills: ["Python", "JavaScript", "SQL"],
    tools: ["Git", "Docker", "Jenkins"],
    soft_skills: ["Leadership", "Communication"],
    experience_level: "mid"
  }
  ```

**Operation 3: Calculate Semantic Similarity**
- **Service:** `skillMatcher.js`
- **Technology:** OpenAI Embeddings (text-embedding-3-small)
- **Process:**
  1. Convert job skills to embeddings (vector representations)
  2. Convert resume skills to embeddings
  3. Calculate cosine similarity between vectors
  4. Match synonyms (e.g., "JS" = "JavaScript")
  5. Score based on coverage and relevance

**Why Parallel?**
- These operations are independent
- Running in parallel saves ~60% time
- Uses `Promise.all()` to execute simultaneously

---

#### **STEP 4: Score Calculation (Weighted Algorithm)**

**Location:** `apps/api/services/ats/skillMatcher.js`

**Scoring Components (Weighted):**

**1. Keyword Matching (40% weight):**
- Required skills found: +10 points each
- Preferred skills found: +5 points each
- Missing required skills: -5 points each
- Semantic similarity score (0-100)
- **Formula:** `(matchedSkills / totalSkills) * 40`

**2. Experience Relevance (30% weight):**
- Years of experience match: +15 points
- Seniority level match: +10 points
- Industry relevance: +5 points
- **Formula:** `experienceScore * 0.3`

**3. Format Quality (20% weight):**
- Has contact info: +5 points
- Has summary: +5 points
- Has quantified achievements: +5 points
- Proper date formatting: +5 points
- **Formula:** `formatScore * 0.2`

**4. Content Quality (10% weight):**
- Resume completeness: +5 points
- No spelling errors: +3 points
- Appropriate length: +2 points
- **Formula:** `contentScore * 0.1`

**Final Score:**
```
Overall ATS Score = 
  (keywordScore * 0.4) + 
  (experienceScore * 0.3) + 
  (formatScore * 0.2) + 
  (contentScore * 0.1)
```

**Score Range:** 0-100 (rounded to integer)

---

#### **STEP 5: Generate Detailed Analysis**

**What's Generated:**

**1. Missing Keywords:**
- List of required skills not found in resume
- Prioritized by importance (required > preferred)
- Includes synonyms and related terms

**2. Matched Keywords:**
- List of skills found in resume
- Includes both exact matches and semantic matches

**3. Strengths:**
- What the resume does well
- Strong experience matches
- Unique skills that stand out

**4. Suggestions:**
- Specific improvements to increase score
- Where to add missing keywords
- How to better highlight experience

**5. Score Breakdown:**
```
{
  overall: 72,
  breakdown: {
    keywords: 28.8,  // 40% weight
    experience: 22.5, // 30% weight
    format: 16.0,    // 20% weight
    content: 4.7     // 10% weight
  },
  missingKeywords: ["Docker", "Kubernetes", "CI/CD"],
  matchedKeywords: ["Python", "React", "AWS", "Git"],
  strengths: ["Strong Python experience", "Cloud expertise"],
  suggestions: ["Add Docker experience", "Quantify achievements"]
}
```

---

#### **STEP 6: Cache Result (Redis)**

**Location:** `apps/api/services/ats/atsCache.js`

**Cache Strategy:**
- **Key:** `ats:${hash(jobDesc)}:${hash(resume)}`
- **TTL:** 30 days
- **Why Cache?** Same job + same resume = same score (deterministic)

**Cache Layers:**
1. **L1 (Memory):** In-process cache (fastest, 5-minute TTL)
2. **L2 (Redis):** Distributed cache (fast, 30-day TTL)
3. **L3 (Compute):** Calculate fresh (slowest, ~3-5 seconds)

**Cache Hit Rate:** ~70% (most users check multiple times)

---

#### **STEP 7: Record AI Usage (Database)**

**Location:** `apps/api/services/ai/usageService.js`

**Database Operation:**
```
INSERT INTO aiRequests
```

**Data Saved:**
- `userId`: Who made the request
- `action`: "ATS_CHECK"
- `inputTokens`: Tokens sent to OpenAI
- `outputTokens`: Tokens received from OpenAI
- `cost`: Calculated cost in USD
- `model`: "gpt-4o-mini"
- `success`: true/false
- `timestamp`: When request was made

**Why Track This?**
- Monitor usage per user (enforce rate limits)
- Calculate costs (billing)
- Analytics (which features are popular)
- Debugging (trace errors)

---

#### **STEP 8: Response to Frontend**

**What Backend Sends:**
```
HTTP 200 OK
{
  "success": true,
  "score": 72,
  "breakdown": {
    "keywords": 28.8,
    "experience": 22.5,
    "format": 16.0,
    "content": 4.7
  },
  "missingKeywords": ["Docker", "Kubernetes", "CI/CD"],
  "matchedKeywords": ["Python", "React", "AWS", "Git"],
  "strengths": [
    "Strong Python experience with 5+ years",
    "Cloud expertise (AWS certified)"
  ],
  "suggestions": [
    "Add Docker/Kubernetes experience to skills section",
    "Quantify achievements with metrics (e.g., 'Improved performance by 40%')",
    "Include CI/CD pipeline experience"
  ],
  "cached": false,
  "processingTime": "3.2s"
}
```

---

#### **STEP 9: Frontend Updates UI**

**Location:** `apps/web/src/components/features/AIPanel/AIPanelRedesigned.tsx`

**What Happens:**
1. Response received and parsed
2. ATS score displayed with color coding:
   - 0-49: Red (Poor)
   - 50-69: Yellow (Fair)
   - 70-84: Blue (Good)
   - 85-100: Green (Excellent)
3. Score breakdown shown as progress bars
4. Missing keywords listed (clickable to add)
5. Suggestions displayed as action items
6. Strengths highlighted

**UI State After Check:**
```
┌─────────────────────────────────┐
│ ATS Score: 72 (Good)            │
├─────────────────────────────────┤
│ Keywords:    [████████░░] 72%   │
│ Experience:  [███████░░░] 75%   │
│ Format:      [████████░░] 80%   │
│ Content:     [██████░░░░] 47%   │
├─────────────────────────────────┤
│ Missing Keywords (3):           │
│ • Docker                        │
│ • Kubernetes                    │
│ • CI/CD                         │
├─────────────────────────────────┤
│ Suggestions:                    │
│ 1. Add Docker experience        │
│ 2. Quantify achievements        │
│ 3. Include CI/CD pipeline work  │
└─────────────────────────────────┘
```

---

### Key Logic: Semantic Matching

**How Embeddings Work:**

**Step 1: Convert Text to Vectors**
```
"Python" → [0.23, -0.45, 0.67, ..., 0.12] (1536 dimensions)
"React"  → [0.18, -0.52, 0.71, ..., 0.09] (1536 dimensions)
```

**Step 2: Calculate Similarity**
```
Cosine Similarity = dot(vector1, vector2) / (norm(vector1) * norm(vector2))
Range: -1 to 1 (1 = identical, 0 = unrelated, -1 = opposite)
```

**Step 3: Match Skills**
```
Job requires: "JavaScript"
Resume has: "JS", "Node.js", "React"

Similarity scores:
- "JS" ↔ "JavaScript": 0.92 (very similar) ✅
- "Node.js" ↔ "JavaScript": 0.78 (related) ✅
- "React" ↔ "JavaScript": 0.65 (related) ✅
```

**Why This Works:**
- Catches synonyms (JS = JavaScript)
- Catches related skills (React implies JavaScript)
- Understands context (Python web dev vs Python data science)

---

### Performance Optimization

**1. Caching (70% hit rate):**
- First check: 3-5 seconds (AI processing)
- Cached check: 50-100ms (Redis lookup)
- **Speed improvement:** 30-50x faster

**2. Parallel Processing:**
- Sequential: 9 seconds (3s + 3s + 3s)
- Parallel: 3 seconds (max of 3 operations)
- **Speed improvement:** 3x faster

**3. Embedding Reuse:**
- Job description embeddings cached separately
- Same job checked by multiple users → Reuse embeddings
- **Cost savings:** ~50% on popular jobs

---

## Feature 3: Resume Tailoring

### What It Does
Optimizes a resume for a specific job by intelligently integrating missing keywords, emphasizing relevant experience, and improving ATS compatibility. Provides before/after scores and detailed change tracking.

---

### Complete Flow: Frontend → Backend → AI → Database

#### **STEP 1: User Requests Tailoring (Frontend)**

**Location:** `apps/web/src/components/features/AIPanel/AIPanelRedesigned.tsx`

**User Action:**
- User pastes job description
- Optionally runs ATS check first (recommended)
- Selects tailoring preferences:
  - **Mode:** PARTIAL (conservative) or FULL (aggressive)
  - **Tone:** Professional, Technical, Creative, or Casual
  - **Length:** Brief, Thorough, or Complete
- Clicks "Tailor Resume" button

**What Happens:**
1. Validate job description (min 100 chars for tailoring)
2. Get current resume data (may include draft changes)
3. Show progress modal with stages
4. POST request to `/api/editor/ai/tailor`
5. Stream progress updates (if supported)

**Data Sent to Backend:**
- `resumeId`: Active resume ID
- `jobDescription`: Job posting text
- `mode`: "PARTIAL" or "FULL"
- `tone`: "professional" (default)
- `length`: "thorough" (default)
- JWT cookie (automatic)

---

#### **STEP 2: Backend Receives Request (API Route)**

**Location:** `apps/api/routes/editorAI.routes.js`

**Authentication & Authorization:**
1. JWT verified → Extract `userId`
2. Validate request body schema
3. Check user's subscription tier:
   - Free: PARTIAL only, 3 per day
   - Pro: PARTIAL + FULL, 20 per day
   - Enterprise: Unlimited
4. Check rate limits
5. Verify resume exists and belongs to user

**What Happens:**
1. Load user's subscription details
2. Verify action allowed (PARTIAL vs FULL)
3. Check rate limit (daily quota)
4. Call tailoring service
5. Record AI request in database
6. Return tailored resume + metrics

---

#### **STEP 3: Tailoring Service - Stage 1 (Analysis)**

**Location:** `apps/api/services/ai/tailorService.js`

**Stage 1: Comprehensive Analysis (Parallel Processing)**

**Three Parallel Operations:**

**Operation 1: Calculate Current ATS Score**
- Run full ATS analysis on current resume
- Get baseline score (e.g., 65)
- Identify all missing keywords
- Analyze strengths and weaknesses

**Operation 2: Extract Job Requirements**
- Use AI to extract:
  - Required skills (must-have)
  - Preferred skills (nice-to-have)
  - Experience requirements (years, level)
  - Role type and seniority
  - Industry context

**Operation 3: Analyze Resume Content**
- Identify sections that can be improved
- Find weak bullet points
- Locate areas to add keywords
- Assess current keyword density

**All Three Complete → Proceed to Target Calculation**

---

#### **STEP 4: Calculate Tailoring Targets**

**Location:** `apps/api/services/ai/intelligentKeywordLimits.js`

**What Happens:**

**4.1 Calculate Realistic Ceiling:**
The system determines the maximum achievable score based on:
- Resume's current content quality
- Job's keyword requirements
- Experience match potential
- Format quality

**Example:**
```
Current Score: 65
Job has 20 required keywords
Resume can naturally fit 15 keywords
Realistic Ceiling: 85 (can't reach 100 without inventing experience)
```

**4.2 Set Target Score:**
- **PARTIAL Mode:** Current + 15 points (conservative, aim for 80+)
- **FULL Mode:** Current + 20 points (aggressive, aim for 85+)
- **Never exceed realistic ceiling**

**Example:**
```
PARTIAL: 65 + 15 = 80 (target)
FULL: 65 + 20 = 85 (target)
```

**4.3 Calculate Optimal Keyword Limit:**
Determines how many missing keywords to integrate.

**Decision Logic:**
```
IF current score >= 75:
  PARTIAL: Add 3-5 keywords (minimal changes)
  FULL: Add 5-8 keywords (moderate changes)

ELSE IF current score >= 60:
  PARTIAL: Add 5-8 keywords (moderate changes)
  FULL: Add 8-12 keywords (significant changes)

ELSE (score < 60):
  PARTIAL: Add 8-12 keywords (significant changes)
  FULL: Add 12-15 keywords (major overhaul)
```

**4.4 Prioritize Missing Keywords:**
Keywords are ranked by importance:
1. **Critical (10 points):** Required skills mentioned 3+ times in job
2. **High (7 points):** Required skills mentioned 1-2 times
3. **Medium (5 points):** Preferred skills
4. **Low (3 points):** Nice-to-have skills

**4.5 Apply 1.5x Flexibility:**
Give AI more keywords to choose from, but recommend optimal count.

**Example:**
```
Optimal: 8 keywords
Flexible: 8 * 1.5 = 12 keywords
AI gets top 12 keywords but is told to use ~8
```

**Why?** AI can choose the most natural fit from a larger pool.

---

#### **STEP 5: Tailoring Service - Stage 2 (Generation)**

**Location:** `apps/api/services/ai/tailorService.js`

**What Happens:**

**5.1 Build Enhanced Prompt:**
The prompt includes:
- Current resume (full JSON)
- Job description (full text)
- Missing keywords (prioritized list of 12)
- Target ATS score (e.g., 80)
- Recommended keyword count (e.g., 8)
- Mode (PARTIAL/FULL)
- Tone (professional)
- Length (thorough)
- Specific instructions:
  - Integrate keywords naturally
  - Emphasize relevant experience
  - Don't invent facts
  - Maintain resume's voice
  - Focus on ATS optimization

**5.2 Call OpenAI API:**
- **Model:** GPT-4o-mini
- **Temperature:** 0.3 (balanced creativity/accuracy)
- **Max Tokens:** 8000 (large resumes need space)
- **Response Format:** JSON mode

**5.3 AI Processing (What GPT Does):**
1. Analyzes current resume structure
2. Identifies best places to add keywords
3. Rewrites bullet points to include keywords naturally
4. Emphasizes relevant experience
5. Adjusts tone and length as requested
6. Maintains factual accuracy (doesn't invent)
7. Returns tailored resume + change log

**5.4 Parse Response:**
- Extract tailored resume JSON
- Extract change log (what was modified)
- Validate structure
- If invalid → Attempt repair with jsonrepair

---

#### **STEP 6: Calculate After Score & Generate Diff**

**Location:** `apps/api/services/ai/tailorService.js`

**What Happens:**

**6.1 Calculate New ATS Score:**
- Run ATS analysis on tailored resume
- Get new score (e.g., 82)
- Calculate improvement (82 - 65 = +17 points)

**6.2 Generate Detailed Diff:**
Compare original vs tailored resume and track:

**Change Types:**
- **Added:** New content (e.g., new skill, new bullet point)
- **Modified:** Changed content (e.g., rewritten bullet point)
- **Removed:** Deleted content (rare in tailoring)

**Example Diff:**
```
{
  changes: [
    {
      type: "modified",
      section: "experience[0].bullets[2]",
      oldValue: "Built web applications using modern frameworks",
      newValue: "Built scalable web applications using React and Node.js, implementing Docker containerization for deployment",
      reason: "Added keywords: React, Node.js, Docker"
    },
    {
      type: "added",
      section: "skills.technical",
      newValue: "Kubernetes",
      reason: "Added missing required skill"
    }
  ],
  summary: {
    totalChanges: 12,
    added: 3,
    modified: 9,
    removed: 0,
    keywordsAdded: ["Docker", "Kubernetes", "CI/CD", "React", "Node.js"]
  }
}
```

---

#### **STEP 7: Save Tailored Version (Database)**

**Location:** `apps/api/services/ai/tailorService.js`

**Database Operation:**
```
INSERT INTO tailoredVersions
```

**Data Saved:**
- `id`: UUID
- `baseResumeId`: Original resume reference
- `userId`: Who created this
- `jobDescription`: Job it was tailored for
- `tailoredData`: Modified resume JSON
- `changes`: Detailed diff
- `atsScoreBefore`: 65
- `atsScoreAfter`: 82
- `mode`: "PARTIAL"
- `metadata`: { tone, length, keywordsAdded, processingTime }
- `createdAt`: Timestamp

**Why Save This?**
- User can review changes before applying
- Track tailoring history
- A/B test different versions
- Revert if needed

---

#### **STEP 8: Record AI Usage (Database)**

**Location:** `apps/api/services/ai/usageService.js`

**Database Operation:**
```
INSERT INTO aiRequests
```

**Data Saved:**
- `userId`: Who made the request
- `action`: "TAILOR_PARTIAL" or "TAILOR_FULL"
- `inputTokens`: ~6000 (resume + job + prompt)
- `outputTokens`: ~4000 (tailored resume + changes)
- `cost`: ~$0.015 (GPT-4o-mini pricing)
- `model`: "gpt-4o-mini"
- `success`: true
- `processingTime`: "8.5s"
- `metadata`: { scoreBefore: 65, scoreAfter: 82, improvement: 17 }

---

#### **STEP 9: Response to Frontend**

**What Backend Sends:**
```
HTTP 200 OK
{
  "success": true,
  "tailoredResume": {
    // Full tailored resume JSON
    contact: { ... },
    summary: "...",
    experience: [ ... ],
    education: [ ... ],
    skills: { ... }
  },
  "changes": [
    {
      type: "modified",
      section: "experience[0].bullets[2]",
      oldValue: "Built web applications",
      newValue: "Built scalable web applications using React and Node.js",
      reason: "Added keywords: React, Node.js"
    },
    // ... more changes
  ],
  "metrics": {
    atsScoreBefore: 65,
    atsScoreAfter: 82,
    improvement: 17,
    targetScore: 80,
    targetReached: true,
    keywordsAdded: ["Docker", "Kubernetes", "CI/CD", "React", "Node.js"],
    totalChanges: 12
  },
  "tailoredVersionId": "tailored-uuid-123",
  "processingTime": "8.5s"
}
```

---

#### **STEP 10: Frontend Shows Results (NOT Auto-Applied)**

**Location:** `apps/web/src/components/features/ResumeEditor/DiffHighlightBanner.tsx`

**What Happens:**

**10.1 Display Results Panel:**
```
┌─────────────────────────────────────────┐
│ Tailoring Complete! ✅                  │
├─────────────────────────────────────────┤
│ ATS Score: 65 → 82 (+17 points)        │
│ Target: 80 ✅ Reached!                  │
├─────────────────────────────────────────┤
│ Changes Made (12):                      │
│                                         │
│ ✏️ Modified (9):                        │
│ • Experience bullet #3                  │
│   "Built web applications"              │
│   → "Built scalable web applications    │
│      using React and Node.js"           │
│                                         │
│ ➕ Added (3):                           │
│ • Skill: Kubernetes                     │
│ • Skill: Docker                         │
│ • Skill: CI/CD                          │
├─────────────────────────────────────────┤
│ [Apply Changes] [Discard]               │
└─────────────────────────────────────────┘
```

**10.2 User Reviews Changes:**
- User can see each change individually
- Old value shown with strikethrough (red)
- New value shown in green
- Reason for change explained

**10.3 User Decides:**
- **Apply Changes:** Tailored resume replaces editor content
- **Discard:** Keep original resume, discard tailored version

**IMPORTANT:** Changes are NOT automatically applied to the editor. User must explicitly click "Apply Changes".

---

#### **STEP 11: User Applies Changes (Optional)**

**Location:** `apps/web/src/app/dashboard/hooks/useDashboardHandlers.ts`

**If User Clicks "Apply Changes":**

1. Tailored resume data loaded into editor
2. `setResumeData(tailoredResume)` called
3. Auto-save triggered → Saves to working draft
4. Changes banner hidden
5. Success toast shown
6. User can now edit further or save to base resume

**If User Clicks "Discard":**

1. Tailored version discarded
2. Original resume remains in editor
3. Changes banner hidden
4. Tailored version still saved in DB (for history)

---

### Key Logic: Intelligent Keyword Integration

**How AI Integrates Keywords Naturally:**

**Bad (Keyword Stuffing):**
```
"Experienced with Python, React, Docker, Kubernetes, CI/CD, AWS, Git, Jenkins"
```

**Good (Natural Integration):**
```
"Built scalable microservices using Python and Docker, deployed on Kubernetes clusters with CI/CD pipelines (Jenkins), reducing deployment time by 60%"
```

**AI Instructions:**
- Integrate keywords into existing bullet points
- Add context and metrics
- Maintain natural language flow
- Don't create keyword lists
- Emphasize achievements, not just technologies

---

### Key Logic: Mode Differences

**PARTIAL Mode (Conservative):**
- Target: +15 points (aim for 80+)
- Keyword limit: 3-8 keywords
- Changes: Minimal, focused on high-impact areas
- Risk: Low (maintains resume's voice)
- Use case: Already decent score, minor optimization

**FULL Mode (Aggressive):**
- Target: +20 points (aim for 85+)
- Keyword limit: 5-15 keywords
- Changes: Significant, comprehensive rewrite
- Risk: Medium (may change resume's voice)
- Use case: Low score, major optimization needed

---

### Performance Optimization

**1. Parallel Analysis (Stage 1):**
- Sequential: 9 seconds (3 + 3 + 3)
- Parallel: 3 seconds (max of 3)
- **Speed improvement:** 3x faster

**2. Intelligent Keyword Limits:**
- Without: AI might add 20+ keywords (stuffing)
- With: AI adds 5-8 keywords (natural)
- **Quality improvement:** Higher ATS scores, better readability

**3. Two-Stage Process:**
- Stage 1 (Analysis): 3 seconds
- Stage 2 (Generation): 5 seconds
- Total: 8 seconds (acceptable for quality)

**4. Caching Job Analysis:**
- Same job checked by multiple users
- Cache job skill extraction (30-day TTL)
- **Cost savings:** ~40% on popular jobs

---

## Supporting System: Working Draft

### What It Does
Provides auto-save functionality without overwriting the base resume. All edits are saved to a temporary draft that can be committed or discarded.

---

### How It Works

**Concept:**
- **Base Resume:** Permanent, saved version
- **Working Draft:** Temporary, auto-saved changes
- **AI Features:** Transparently use draft if exists

**Workflow:**

**1. User Edits Resume:**
- User types in editor
- After 2 seconds of inactivity → Auto-save triggered
- Draft saved to `workingDrafts` table
- Base resume untouched

**2. AI Features (Draft-Aware):**
- ATS Check: Uses draft data if exists, else base
- Tailoring: Uses draft data if exists, else base
- User sees results based on current state (including unsaved changes)

**3. User Commits Changes:**
- Clicks "Save to Base Resume"
- Draft data copied to base resume
- Draft deleted
- Base resume updated

**4. User Discards Changes:**
- Clicks "Discard"
- Draft deleted
- Editor reloaded with base resume data
- All changes lost

---

### Database Schema

**baseResumes table:**
```
id              UUID PRIMARY KEY
userId          UUID FOREIGN KEY → users.id
slotNumber      INTEGER (1-5)
fileName        TEXT
data            JSONB (resume content)
formatting      JSONB
metadata        JSONB
isActive        BOOLEAN
createdAt       TIMESTAMP
updatedAt       TIMESTAMP
```

**workingDrafts table:**
```
id              UUID PRIMARY KEY
baseResumeId    UUID FOREIGN KEY → baseResumes.id (UNIQUE)
data            JSONB (modified resume content)
formatting      JSONB
metadata        JSONB
createdAt       TIMESTAMP
updatedAt       TIMESTAMP
```

**Relationship:** One base resume can have zero or one working draft.

---

### Auto-Save Logic

**Frontend:**
```
User types in editor
  ↓
hasChanges = true
  ↓
Wait 2 seconds (debounce)
  ↓
POST /api/working-drafts/:resumeId
  ↓
Draft saved to database
  ↓
UI shows: "Working on draft" (blue dot)
```

**Backend:**
```
Receive draft data
  ↓
Check if draft exists for this base resume
  ↓
If exists: UPDATE working draft
If not: INSERT new working draft
  ↓
Return success
```

**UI Indicators:**
- **No changes:** Gray dot, "No changes"
- **Saving:** Spinner, "Auto-saving draft..."
- **Saved:** Blue dot, "Working on draft"
- **Committed:** Green checkmark, "Draft saved"

---

## Features In Development

The following features are currently in development and not production-ready:

### 1. Content Generation (🚧 In Development)
**Status:** 60% complete  
**What It Does:** AI-powered rewriting of individual resume sections  
**Blockers:** 
- Hallucination prevention needs improvement
- Context awareness needs refinement
- User testing required

### 2. Cover Letter Generation (🚧 In Development)
**Status:** 40% complete  
**What It Does:** Generate tailored cover letters from resume + job description  
**Blockers:**
- Template system needs design
- Tone matching needs improvement
- User customization options needed

### 3. Portfolio Generation (🚧 In Development)
**Status:** 30% complete  
**What It Does:** Generate professional portfolio content from resume  
**Blockers:**
- Output format undefined
- Integration with portfolio platforms needed
- User testing required

### 4. Interview Preparation (🚧 Planned)
**Status:** 10% complete  
**What It Does:** Generate interview questions based on resume + job  
**Blockers:**
- Feature design in progress
- AI prompts not finalized
- UI/UX not designed

---

## Database Schema

### Core Tables

**users**
```
id              UUID PRIMARY KEY
email           TEXT UNIQUE
passwordHash    TEXT
name            TEXT
subscriptionTier TEXT (free, pro, enterprise)
createdAt       TIMESTAMP
updatedAt       TIMESTAMP
```

**baseResumes**
```
id              UUID PRIMARY KEY
userId          UUID → users.id
slotNumber      INTEGER (1-5)
fileName        TEXT
data            JSONB (structured resume)
formatting      JSONB
metadata        JSONB (parseMethod, confidence)
isActive        BOOLEAN
createdAt       TIMESTAMP
updatedAt       TIMESTAMP

UNIQUE(userId, slotNumber)
INDEX(userId, isActive)
```

**workingDrafts**
```
id              UUID PRIMARY KEY
baseResumeId    UUID → baseResumes.id (UNIQUE)
data            JSONB (modified resume)
formatting      JSONB
metadata        JSONB
createdAt       TIMESTAMP
updatedAt       TIMESTAMP

INDEX(baseResumeId)
```

**tailoredVersions**
```
id              UUID PRIMARY KEY
baseResumeId    UUID → baseResumes.id
userId          UUID → users.id
jobDescription  TEXT
tailoredData    JSONB (tailored resume)
changes         JSONB (diff)
atsScoreBefore  INTEGER
atsScoreAfter   INTEGER
mode            TEXT (PARTIAL, FULL)
metadata        JSONB
createdAt       TIMESTAMP

INDEX(baseResumeId)
INDEX(userId, createdAt)
```

**aiRequests**
```
id              UUID PRIMARY KEY
userId          UUID → users.id
action          TEXT (ATS_CHECK, TAILOR_PARTIAL, etc.)
inputTokens     INTEGER
outputTokens    INTEGER
cost            DECIMAL
model           TEXT
success         BOOLEAN
errorMessage    TEXT
metadata        JSONB
createdAt       TIMESTAMP

INDEX(userId, createdAt)
INDEX(action, createdAt)
```

---

## Performance & Optimization

### 1. Caching Strategy

**Multi-Level Cache:**
```
Request
  ↓
L1: Memory Cache (5min TTL)
  ↓ MISS
L2: Redis Cache (30day TTL)
  ↓ MISS
L3: Compute (AI call)
  ↓
Cache result in L2 and L1
```

**Cache Hit Rates:**
- ATS checks: ~70% (same job checked multiple times)
- Job skill extraction: ~80% (popular jobs)
- Resume parsing: 0% (each resume unique)

**Cost Savings:**
- Cached ATS check: $0.000 (free)
- Fresh ATS check: $0.008 (AI costs)
- **Savings:** ~$0.006 per cached request

### 2. Parallel Processing

**Where Used:**
- ATS Analysis: 3 parallel operations
- Tailoring Stage 1: 3 parallel operations

**Speed Improvement:**
- Sequential: 9 seconds
- Parallel: 3 seconds
- **3x faster**

### 3. Intelligent Token Management

**Prompt Compression:**
- Verbose prompt: 3000 tokens
- Compressed prompt: 1500 tokens
- **50% token reduction**

**Smart Truncation:**
- Long resume: 15,000 tokens
- Truncated intelligently: 8,000 tokens
- **47% token reduction**

### 4. Model Selection

**Cost Optimization:**
- GPT-4o-mini: $0.15 per 1M input tokens
- GPT-4o: $2.50 per 1M input tokens
- **94% cost savings on clean resumes**

**Usage Distribution:**
- 85% of resumes use GPT-4o-mini (clean)
- 15% of resumes use GPT-4o (corrupted)
- **Average cost per parse:** $0.003

### 5. Database Optimization

**Indexes:**
- `baseResumes(userId, isActive)` - Fast active resume lookup
- `aiRequests(userId, createdAt)` - Fast usage tracking
- `tailoredVersions(baseResumeId)` - Fast history lookup

**JSONB Benefits:**
- Flexible schema for resume data
- Fast queries with GIN indexes
- No need for complex joins

---

## Summary

### Production-Ready Features (3)

**1. Resume Parsing**
- Hybrid AI model selection (GPT-4o-mini/GPT-4o)
- 94% cost savings on clean resumes
- Handles PDF, DOCX, and corrupted files
- Average processing time: 2-4 seconds

**2. ATS Score Analysis**
- Semantic matching with embeddings
- 70% cache hit rate (fast repeat checks)
- Parallel processing (3x faster)
- Detailed breakdown and suggestions

**3. Resume Tailoring**
- Intelligent keyword integration
- Two modes: PARTIAL (conservative), FULL (aggressive)
- Before/after ATS scores
- Detailed change tracking
- User approval required before applying

### Key Architectural Principles

1. **Draft-Aware AI:** All features use working draft transparently
2. **Hybrid Models:** Smart selection between GPT-4o-mini and GPT-4o
3. **Parallel Processing:** Independent operations run concurrently
4. **Multi-Level Caching:** Memory → Redis → Compute
5. **Optimistic UI:** Instant feedback, background sync
6. **Cost Optimization:** Intelligent token management

### Performance Metrics

- **Resume Parsing:** 2-4 seconds (94% use cheap model)
- **ATS Analysis:** 3-5 seconds (70% cached)
- **Resume Tailoring:** 8-10 seconds (parallel processing)
- **Cache Hit Rate:** 70% (ATS), 80% (job skills)
- **Cost per Operation:** $0.003 (parse), $0.008 (ATS), $0.015 (tailor)

---

**Document Status:** ✅ Production Ready  
**Next Review Date:** December 14, 2024

---

*This document is maintained by the RoleReady engineering team. For questions or updates, please contact the team lead.*
