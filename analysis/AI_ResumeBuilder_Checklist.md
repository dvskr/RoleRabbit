## AI Resume Builder Fix Checklist

### Apply Changes Flow

- [x] Audit current tailoring ➔ saving flow (`tailorResult`, `setHasChanges`, `saveResume`).
- [x] Add handler in `useDashboardHandlers` that commits tailored results via `saveResume()` and clears `tailorResult` on success/failure.
- [x] Extend `AIPanel` props with `onConfirmTailorChanges` and saving state; wire Apply Changes button to call handler with loading/error UI.
- [x] Re-run ATS analysis after a successful commit so the panel reflects updated scores.
- [x] Add component + integration coverage for the Apply Changes flow.

### API Validation (Zod)

- [x] Install/configure `zod` in the API package (share types with web app if helpful).
- [x] Define schemas for AI endpoints (`generate-content`, `apply-draft`, `ats-check`, `tailor`, `apply-recommendations`).
- [x] Replace manual validation in `editorAI.routes.js` with schema `safeParse`.
- [x] Reuse schema-derived types on the frontend `apiService` requests.
- [x] Add tests for valid/invalid payloads (unit + integration); ensure 400 responses are consistent.

### Data Normalization & Ordering

- [x] Document canonical resume shape (arrays, contact fields, section order).
- [x] Centralize normalization utility reused by backend and frontend.
- [x] Ensure AI outputs are normalized before merge/save (preserve URLs, metadata, section order).
- [x] Expand tests covering nested arrays, contact links, custom sections, metadata round-tripping.

### AI Reliability & Telemetry

- [x] Verify `trackAIUsage` logging fix with a smoke test (stub tracker, assert call count).
- [x] Improve OpenAI error messaging (quota, timeout, invalid key) and surface in UI.
- [x] Optionally expose `tailorResult.diff` in UI before applying changes.


