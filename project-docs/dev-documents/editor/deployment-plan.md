## RoleRabbit Editor Deployment Plan

### 1. Pre-Deployment Checklist
- [ ] Database schema synced (`prisma migrate deploy` or `db push`) and verified on staging.
- [ ] Redis (optional) reachable; `REDIS_URL` configured for production metrics + cache.
- [ ] OpenAI and Google Vision credentials present in secret manager and mapped to runtime env.
- [ ] Supabase storage bucket policies confirmed for resume uploads and generated documents.
- [ ] Prometheus `/metrics` endpoint reachable from monitoring stack; scrape job added.
- [ ] All Jest suites green (`npm run test`, `npm run test -- --projects apps/api apps/web`).
- [ ] Manual smoke on staging (parse DOCX/PDF, run ATS, tailor, cover letter, portfolio).

### 2. Feature Flags & Environment Toggles
| Flag/Env | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `AI_FEATURES_ENABLED` | Gate AI endpoints | `true` (prod) | Set `false` to short-circuit editor AI routes. |
| `AI_MODEL_OVERRIDE` | Swap LLM model | unset | e.g. `gpt-4o` for all actions if fallback needed. |
| `CACHE_DISABLE_REDIS` | Disable Redis layer | `false` | Prefer to leave `false`; set `true` if Redis outage. |
| `OBS_EXPORT_METRICS` | Enable `/metrics` | `true` | Allow scraping; disable to block exposure. |
| `EDITOR_TAILOR_FULL_ENABLED` | Control Full Tailor | `true` for paid tiers | Set `false` to hide full rewrite mode. |

### 3. Rollout Steps
1. **Stage**
   - Deploy API + Web to staging with feature flags defaulted on.
   - Run smoke checklist, confirm metrics populated.
2. **Shadow**
   - Route limited QA traffic (<5% users) through new editor if behind reverse-proxy toggle.
   - Monitor ATS/AI latency dashboards for anomalies.
3. **Gradual Production Release**
   - Flip feature flag for internal accounts first.
   - Expand to Free tier (generation limited) -> Pro -> Premium once stable.
   - Set up PagerDuty alert for `rolerabbit_ai_action_duration_seconds` p95 > 8s.
4. **Post-Launch**
   - Review cost dashboards after 24h (OpenAI, storage, Redis).
   - Capture user feedback, triage issues.

### 4. Monitoring & Alerts
- **Metrics**: `rolerabbit_*` Prometheus series (latency, counts, ATS score gauge).
- **Dashboards**:
  - AI action latency histogram with breakdown per model.
  - Resume parsing success vs failure counter.
  - ATS score distribution gauge to spot outliers.
- **Alerts**:
  - Resume parse failures > 5 in 5 minutes.
  - AI action latency p95 > 10s for >10 minutes.
  - ATS score gauge returning `0` for >100 users (data regression).

### 5. Cost Monitoring
- Enable OpenAI usage export via vendor dashboard.
- Track `AIRequestLog` table aggregates daily for action volumes.
- Monitor S3/Supabase storage consumption for generated docs; set lifecycle policy to purge stale drafts after 30 days.
- Alert when monthly AI cost > 80% of budget (hook via cost monitoring service or manual spreadsheet).

### 6. Documentation & Handoff
- Update onboarding docs for support to explain slot/AI behavior.
- Record Loom walkthrough covering editor flows + admin toggles.
- Create FAQ entry for common AI errors (rate limit exceeded, inactive resume, credentials missing).
- Schedule retro one week post-launch.
