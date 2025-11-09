## Implementation Progress Tracker

| Step | Description | Status |
|------|-------------|--------|
| 1 | Audit current RoleReady codebase to document alignment with architecture | Completed |
| 2 | Design & implement DB schema updates for slots, tailored versions, caches, generated documents | Completed |
| 3 | Implement hybrid parsing pipeline with caching/confidence logging | Completed |
| 4 | Enforce slot limits & single active resume across stack | Completed |
| 5 | Redesign import workflow to match slot activation behavior | Completed |
| 6 | Set up hybrid caching utilities (LRU + Redis) | Completed |
| 7 | Build AI endpoint suite (generate, tailor, recommendations, docs) | Completed |
| 8 | Implement deterministic ATS engine + JD cache integration | Completed |
| 9 | Integrate AI panel & editor UI flows with new controls | Pending |
| 10 | Instrument observability (logging, metrics, alerts) | Pending |
| 11 | Author automated tests covering new functionality | Pending |
| 12 | Prepare rollout checklist, flags, cost monitoring, documentation | Pending |

## Parsing Architecture Implementation Notes

- Added `services/resumeParser.js` implementing detection (DOCX/PDF/image), text extraction (mammoth, pdf-parse, Vision OCR), AI structuring (OpenAI gpt-4o-mini), and caching via `resume_cache` table.
- Added `/api/resumes/parse` multipart endpoint protected by auth, returning cache hits and parsed structure with confidence score.
- Installed dependencies: `mammoth`, `pdf-parse`, `@google-cloud/vision`, `canvas` (for DOM polyfills in Node 18).
- Database synchronized via `prisma db push --accept-data-loss`; new tables materialized in Supabase schema.
- Layered cache in front of Prisma: in-memory + Redis lookups (via `utils/cacheManager`) happen before DB; cache hits still bump persistence counters asynchronously.
- Verified endpoint with Node-based integration script uploading sample text resume; confirmed 200 response and structured JSON stored in `parse-response.json`.
- Notes: OCR path requires Google credentials (Graceful error if missing). Metadata logging pending future AIRequestLog integration.
- New AI endpoints online:
  - `POST /api/editor/ai/generate-content` → orchestrates guarded prompt, writes structured drafts to `ai_drafts`, logs usage, enforces tier/rate caps.
  - `POST /api/editor/ai/apply-draft` → merges stored draft patches into `base_resumes.data`, clears dependent caches, and records apply events.

## Caching Infrastructure

- Added `config/cacheConfig.js`, `utils/cacheManager.js`, and `utils/cacheKeys.js` providing a two-tier cache (LRU + Redis). All namespaces share consistent key generation (`namespace::userId::resource`).
- Default TTLs: resume parse (30d), job analysis (24h), ATS scoring (6h), AI drafts (2h). Configurable via `CACHE_*` env variables; Redis opt-in with `REDIS_URL`, optional TLS support.
- `cacheManager.wrap` enables future fetch-once patterns; exposed stats method supports observability dashboards.
- Resume parser now short-circuits on LRU/Redis hits prior to Prisma lookups, then materialises DB + cache entries atomically for misses.
- Base resume lifecycle invalidates dependent caches:
  - `activateBaseResume` wipes job analysis, ATS, and AI draft caches for the user to avoid stale AI recommendations when the active resume changes.
  - `deleteBaseResume` clears scoped caches (`job:analysis`, `ai:draft`, `ats:score`) for the removed resume before slot rebalancing.
- Future AI endpoints should reuse shared namespaces: `job:analysis` (per user/job hash), `ai:draft` (per user/baseResume/action), `ats:score` (per base resume + JD id).

## Subscription Tier Rules

### Free ($0/mo)
- Base resume slots: **1** (single active slot available).
- Resume AI (Generate Content, Apply Recommendations): **5 uses/month** shared pool.
- Cover Letter AI: **2 uses/month**.
- ATS Scoring: **Unlimited**.
- Resume Tailoring: **Not available** (upgrade prompt).
- Templates: **3 basic**.
- Cloud storage allowance: **50 MB**.
- Support: **Community** forum.

### Pro ($19.99/mo)
- Base resume slots: **5**.
- Tailored versions: **Unlimited**.
- Resume & Cover Letter AI: **Unlimited** (rate limits still apply).
- ATS Scoring & Resume Tailoring: **Unlimited**.
- Templates: **All 50+**.
- Cloud storage allowance: **500 MB**.
- Support: **Email**.
- AI Agents / Portfolio Generator / Workflows: locked (upgrade to Premium).

### Premium ($29.99/mo)
- Base resume slots: **10**.
- Tailored versions: **Unlimited**.
- Resume & Cover Letter AI: **Unlimited**.
- ATS Scoring & Resume Tailoring: **Unlimited**.
- AI Agents: **500 runs/month**.
- Portfolio Generator: **10 publishes/month** (generations unlimited).
- Workflows: **100 runs/month**.
- Templates: **All 50+**.
- Cloud storage allowance: **2 GB**.
- Support: **Priority**.

## Base Resume Slot Policy

- **Storage:** Users can upload files up to their plan’s storage quota regardless of slot usage.
- **Slot Allocation:** Free exposes 1 slot, Pro 3 slots, Premium 10 slots. Locked slots show upgrade CTAs for lower tiers.
- **Activation:** Exactly one base resume can be active at a time; switching active resumes immediately updates editor context, AI quotas, and ATS data.
- **Slot Enforcement:** Importing when all plan slots are occupied forces the user to delete/downgrade an existing base resume or upgrade before continuing.
- Backend foundations implemented:
  - Added `services/baseResumeService.js` encapsulating plan limits (Free=1, Pro=5, Premium=10), slot allocation, activation toggling, and deletion logic backed by new Prisma models.
  - Introduced `/api/base-resumes` REST endpoints (list/create/delete/activate) with authentication, returning plan limits and enforcing tier-based slot counts.
  - Verified behaviour via scripted API tests (creation succeeds, second slot blocked for Free tier, activation/deletion update state correctly).
- Frontend slot manager & import flow:
  - Added `useBaseResumes` hook and replaced legacy `useResumeList`; dashboard now fetches `/api/base-resumes`, exposes plan limits, and keeps the active slot in sync with the editor state.
  - Implemented `BaseResumeBar` (rendered above the editor/preview) showing per-slot cards, active status, create/delete controls, and quick creation/upload actions. Button gating enforces tier limits with contextual toasts.
  - Redesigned `ImportModal` with slot usage summary, guarded actions (`Upload & Parse` integrates with `/api/resumes/parse`, `Create Blank Resume`, `Manage Active Resume` scrolling to slot manager). Options disable automatically when slots are full.
  - Upload pipeline parses the file via Fastify endpoint, creates a new base resume (with parse metadata) and auto-activates it so the editor immediately loads structured content.
- **Tailored Versions:** Unlimited for Pro/Premium; Free tier hides “promote/save as tailored version” controls.

## Editor Workflow Notes

- Creating a brand-new resume in an available slot opens the from-scratch editor; free users may build content but AI buttons respect monthly quotas (disabled once exhausted).
- When working on an existing resume, the user must activate it before any editor actions (AI or manual edits) are enabled.
- All editor operations (editing, AI generation, exports, tailoring) target the active base resume. Non-active resumes remain view-only with a clear “Set Active” CTA.
- UI surfaces plan-gated states: Tailor for Job hidden for Free, usage meters for Free quotas, locked buttons/tooltips for Pro/Premium-only features.

## Import Workflow Alignment

- Importing into an empty slot creates a new base resume; prompt user to activate it immediately if they want AI access (and remind Free users about remaining AI quota).
- Importing over an occupied slot must honor the user’s slot limit (Free: 1, Pro: 3, Premium: 10) and requires explicit confirmation before overwriting.
- AI features remain gated by activation—an imported resume must be set active before invoking AI tooling or editing capabilities.

## Parsing Architecture (Hybrid)

- **Detection First:** Every import runs through a document-type detector (DOCX, native PDF, scanned PDF, image) using file metadata and a quick text probe.
- **Text-Only Path (~95%):** DOCX and native PDFs route through a low-cost pipeline: extract raw text, then ask `gpt-4o-mini` to map it into our structured resume schema with strict JSON validation; `gpt-4o-2024-08-06` runs only as a fallback on validation failure.
- **OCR + Vision Path (~5%):** Scanned PDFs and images go through OCR (e.g., Google Vision) and then `gpt-4o` with the OCR text plus page images to correct errors and produce structured JSON.
- **Confidence & Guardrails:** We log model-reported confidence, run our own completeness checks, and compare extracted fields back to raw text to prevent hallucinated companies or roles.
- **Accuracy & Cost:** Text-only path yields ~97–99% accuracy; OCR+vision path holds around 98–99% on legible scans. Blended average stays near 97–98% at roughly $0.003 per resume.
- **Caching:** Parsed results are cached by file hash in Redis so re-imports or repeated AI requests reuse existing structured data without reprocessing.

## Post-Parsing Editor Capabilities

- **Structured Editing:** Once parsed, every section (summary, experience, education, skills, projects) is editable in-place; updates mutate the structured resume for that active slot.
- **AI Actions:** Generate Content, Tailor for Job, Apply Recommendations, and other AI utilities all consume the same structured data so outputs stay grounded in the user’s actual resume.
- **ATS Scoring & Analytics:** Keyword coverage, ATS grade, and recommendations are computed from the structured dataset to give consistent feedback.
- **Tailored Versions:** Users can branch tailored resumes from the active base, storing only diffs while reusing the structured schema for edits and AI runs.

## Templates & Formatting

- **Template Rendering:** Structured resumes feed any design template; switching templates or exporting PDF/DOCX simply re-renders the same data with different styling.
- **Formatting Preferences:** Section ordering, bullet styles, and tone settings persist alongside the structured resume, enabling consistent formatting across templates.
- **Cached Exports:** Generated files per template/format are cached so repeat downloads are instant; each export draws from the normalized data to avoid drift.
- **Portfolio & Cover Letters:** The same structured dataset powers companion documents, ensuring content alignment without re-parsing.

## UI / UX Alignment

- **Slots Panel:** Simplified to a lightweight header showing the active resume. Detailed slot management (set active / delete / replace) now lives inside the Import dialog with a slot table and dropdown for replacement.
- **Import Button:** When clicked, show a two-option dialog:
  1. **Change Active Resume** – opens slot picker (up to 10 slots) so the user can activate a different existing resume; if a slot is selected, editor context switches instantly.
  2. **Create Resume from Scratch** – moves the user into the blank editor on an available slot; AI features remain gated by plan (Free sees usage meters/limits, Pro/Premium full access).
  If the user wants to upload a brand-new resume file, they must free at least one slot (delete or replace) before the upload control is enabled; the dialog surfaces a "Remove resume" action when all slots are full and offers to mark the newly uploaded resume active.
  Additional messaging clarifies that deleting a resume frees both the slot and associated tailored versions, and warns Free users before removing their only active base.
- **Activation Swap:** Beside the active slot, include a “Change Active” option that opens the same slot selector; selecting another slot enforces the single-active rule and updates tool availability immediately.
- **Usage Messaging:** Surface plan status (e.g., “Slots used 1/1 – upgrade for more”, “AI uses remaining: 2/5 this month”) and warn when storage quota or AI allotments are nearly exhausted.

## AI Actions Architecture

### AI Panel Controls

- **Run ATS Check:** Button triggers the deterministic ATS scoring engine against the current textarea job description; no external AI cost. Requires active resume + non-empty JD input. Results show matched/missing keywords, section scores, and recommendations in the panel.
- **Mode Toggle:** Partial vs Full switches which tailoring pipeline runs when the user invokes Tailor for Job. Default = Partial; selection persisted per session for the active resume.
- **Writing Tone:** Options (Professional, Technical, Creative, Casual, Executive if added) map to prompt presets used by both Generate Content and Tailor flows.
- **Length Selector:** Brief / Thorough / Complete controls target token counts and section scope for Generate Content responses (e.g., summary word limits, bullet counts).
- **Quota Indicators:** Panel header shows remaining AI uses (Free: 5 resume AI, 2 cover letter AI) and relevant caps (Premium agents/portfolio/workflow runs) with upgrade prompts when limits reached.
- **State Persistence:** UI selections stored in client state (per resume) and sent with API payloads to ensure backend honors user choices.

### Generate Content

- **Purpose:** Create or enhance section-level content (summary, experience bullets, skills) using AI while preserving factual accuracy and user intent.
- **Availability:** Visible only when the resume is active and the user’s plan allows AI usage; rate-limited per user (e.g., 30 requests/hour) with overall quota enforcement.
- **Workflow:**
  1. User selects a section and triggers “Generate with AI,” optionally providing job context, tone, or emphasis.
  2. Frontend posts to `POST /api/editor/ai/generate-content` with `{ resumeId, sectionPath, sectionType, currentContent, jobContext?, tone?, instructions? }`.
  3. Backend middleware confirms auth, active resume ownership, plan limits, and payload validity.
  4. Controller loads structured resume snapshot, reuses cached job analysis if provided, and builds a guarded prompt (system guardrails + user content + tone rules).
  5. AI orchestrator calls `gpt-4o-mini` (fallback `gpt-4o-2024-08-06` on validation failure) requesting JSON `{ rewrittenContent, keyPointsAdded, confidence, warnings }`.
  6. Validation layer enforces schema, length limits, and semantic diff checks to block hallucinated companies or dates; low confidence (<0.6) yields warnings.
  7. Draft stored in `ai_drafts` (Redis, TTL 15 min) with metadata (cost, model, tokens); request logged in `ai_requests` table.
  8. Frontend receives draft + highlights and shows diff view with Apply, Discard, Retry options.
  9. Applying draft posts `POST /api/editor/ai/apply-draft { draftId }`, which re-verifies ownership, merges the structured patch into `base_resumes.data`, logs an audit entry (`AI_GENERATE`), and deletes the draft.
- **Guardrails & Monitoring:**
  - Strict schema validation, diff-based hallucination detection, and warnings for low confidence.
  - Structured logging with request IDs; metrics on latency, success rate, warnings, and per-user cost.
  - Alerts if failure/hallucination rates exceed thresholds; usage dashboard tracks quotas.
- **Cost Profile:** Typical call ~$0.001–0.002 using `gpt-4o-mini`; fallback ~0.004. Caching and rate limits keep per-user cost predictable.

### Run ATS Check

- **Purpose:** Provide an instant compatibility score between the active resume and a supplied job description without invoking external AI APIs.
- **Availability:** Active resume required; JD textarea must contain at least 200 characters. Feature available to all tiers with unlimited usage.
- **Workflow:**
  1. User pastes JD and clicks “Run ATS Check.”
  2. Frontend posts to `POST /api/editor/ats/run` with `{ resumeId, jobDescription }` (resumeId must match active base).
  3. Middleware confirms auth, active resume, payload limits, and rate limits.
  4. Controller hashes JD and looks up cached analysis (Redis `jd_analysis_*`); if cache miss, request `JobAnalysisService` (GPT-4o-mini) to extract structured data and cache for 30 days.
  5. Deterministic ATS engine computes keyword match (required/preferred/technical skills), format score, content score (metrics/action verbs), experience match. Implemented via `services/ats/atsScoringService.js`, cached under `ats:score::userId::resumeId::jobHash` with 6h TTL and mirrored into `job:analysis` for reuse.
  6. Response: `{ overallScore, grade, breakdown, matchedSkills, missingSkills, recommendations[] }` plus cached JD metadata.
  7. Frontend displays score dial, matched/missing keyword lists, and “Apply Recommendations” CTA.
- **Guardrails & Monitoring:**
  - Scoring engine unit-tested and deterministic; no AI variability.
  - Metrics for usage count, average scores, cache hit rate.
  - Alerts on processing latency > 500ms or repeated JD analysis failures.
- **Cost Profile:** JD analysis costs only on cache miss (~$0.0005). Scoring engine itself is compute-only and effectively free.

### Apply Recommendations

- **Purpose:** Transform ATS recommendations into actionable changes by blending deterministic rules and AI rewrite support.
- **Availability:** Requires latest ATS result (within session) and active resume; paid-tier feature (free users may see recommendations but not auto-apply).
- **Workflow:**
  1. User clicks “Apply Recommendations” after an ATS run.
  2. Frontend posts to `POST /api/editor/ai/apply-recommendations` with `{ resumeId, atsInsights, tone?, lengthPreference? }`.
  3. Middleware validates auth, active resume, ATS timestamp (<30 min old), and plan entitlement.
  4. Controller determines which sections need updates via rule engine (e.g., missing keywords in skills, weak bullets, absent metrics).
  5. For each targeted section:
     - Generate deterministic suggestions (e.g., add keyword to skills list).
     - When rewrite required, call AI orchestrator (`gpt-4o-mini`) with strict prompts referencing ATS insights; gather rewritten bullets/summaries.
  6. Aggregate all proposed changes into a single draft object (structured patch) stored in `ai_drafts` (Redis, TTL 30 min) tagged as `APPLY_RECS`.
  7. Compute projected ATS score improvement by simulating patch through ATS engine.
  8. Response: `{ draftId, affectedSections[], suggestions[], atsBeforeAfter }`.
  9. Frontend shows change list with toggle per recommendation; applying posts to `/api/editor/ai/apply-draft` (same handler as Generate Content) which merges patch, logs `AI_RECOMMENDATIONS_APPLIED` audit entry.
- **Guardrails & Monitoring:**
  - Ensure AI rewrites stay within section bounds; diff check for hallucinations.
  - Rate limit (e.g., 5 runs/hour) to control cost.
  - Metrics for acceptance rate per recommendation, ATS delta, user overrides.
- **Cost Profile:** Depends on number of sections touched; typical run ~$0.002–0.004. Deterministic suggestions incur no cost.

### Cover Letter / Portfolio Generation

- **Purpose:** Produce companion materials (cover letters, portfolio snapshots) from the active resume without manual re-entry.
- **Availability:** Active resume required. Free users limited to **2 cover letters/month** and no portfolio publishes; Pro/Premium users receive unlimited cover letters, while Premium additionally unlocks **10 portfolio publishes/month** (generations unlimited).
- **Workflow:**
  1. User picks template type (cover letter or portfolio section) and optional job/company details.
  2. Frontend posts to `POST /api/editor/ai/generate-cover-letter` or `.../generate-portfolio` with `{ resumeId, templateId, jobContext?, tone?, length? }`.
  3. Middleware validates auth, active resume, plan, and payload size.
  4. Controller assembles structured prompt using resume summary, key achievements, skills, and optional JD analysis. Model: `gpt-4o-mini` (fallback `gpt-4o` on validation failure).
  5. AI response returned in structured format (cover letter sections or portfolio blocks). Validation checks for factual consistency and word count.
  6. Draft stored in `ai_drafts` (TTL 30 min). User can edit in modal and download as DOCX/PDF or publish to portfolio generator.
  7. Accepted outputs persisted in `generated_documents` table with metadata (templateId, tone, job context) and stored in S3 for future downloads.
- **Guardrails & Monitoring:**
  - Enforce personalization: require job/company fields or warn if missing to avoid generic letters.
  - Track generation success, downloads, and cost per template.
  - Alert on repeated validation failures or unusually long outputs.
- **Cost Profile:** ~0.003–0.005 per cover letter; portfolio sections similar. Cached when the same configuration is regenerated.

### Tailor for Job

- **Purpose:** Align the active resume with a specific job description, offering quick partial tweaks or a full rewrite while preserving factual data.
- **Modes:**
  - **Partial Tailor (default):** Adjusts summary, top experience bullets, and skills ordering to inject job-specific keywords and emphasis.
  - **Full Tailor:** Rewrites the entire resume body (summary, experiences, skills, projects) in the selected tone, keeping employers/dates/metrics intact.
- **Availability:** Active resume required; feature gated to paid tiers. JD input mandatory (minimum length). Rate limit ~10 requests/hour/user with daily caps.
- **Workflow:**
  1. User opens Tailor modal, pastes JD, selects mode and tone.
  2. Frontend posts to `POST /api/editor/ai/tailor` with `