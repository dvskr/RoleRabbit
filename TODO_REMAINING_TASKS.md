# ✅ TODO: Remaining Tasks for RoleReady Resume Builder

**Status:** 19 tasks remaining (94.5% complete)  
**Estimated Time:** 63.5 hours (~3 weeks)  
**Last Updated:** November 15, 2025

---

## 🔴 HIGH PRIORITY (Week 1) - 29 hours

### Backend Endpoints (27 hours)

#### ☐ 1. Export Endpoint (4 hours)
**Priority:** 🔴 CRITICAL  
**Endpoint:** `POST /api/base-resumes/:id/export`

**Tasks:**
- [ ] Create `apps/api/routes/export.routes.js`
- [ ] Implement export handler
  - [ ] Accept format: pdf, docx, txt, json
  - [ ] Accept optional templateId
  - [ ] Integrate with `resumeExporter.js`
  - [ ] Generate file
  - [ ] Upload to storage (S3 or local)
  - [ ] Return download URL
  - [ ] Set expiration (1 hour)
- [ ] Add route to `server.js`: `fastify.register(exportRoutes)`
- [ ] Add ownership check middleware
- [ ] Test with Postman/curl
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Can export resume as PDF
- ✅ Can export resume as DOCX
- ✅ Can export resume as TXT
- ✅ Can export resume as JSON
- ✅ Returns valid download URL
- ✅ File expires after 1 hour

---

#### ☐ 2. Duplicate Endpoint (2 hours)
**Priority:** 🔴 CRITICAL  
**Endpoint:** `POST /api/base-resumes/:id/duplicate`

**Tasks:**
- [ ] Add route to `apps/api/routes/baseResume.routes.js`
- [ ] Implement duplicate handler
  - [ ] Verify user owns source resume
  - [ ] Check slot limit not exceeded
  - [ ] Copy all fields from source
  - [ ] Increment slot number
  - [ ] Append "(Copy)" to name
  - [ ] Do NOT duplicate working draft
  - [ ] Return new resume
- [ ] Test duplication
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Creates exact copy of resume
- ✅ Name has "(Copy)" suffix
- ✅ New slot number assigned
- ✅ Working draft NOT copied
- ✅ Respects slot limits

---

#### ☐ 3. History Endpoint (3 hours)
**Priority:** 🔴 CRITICAL  
**Endpoint:** `GET /api/base-resumes/:id/history`

**Tasks:**
- [ ] Add route to `apps/api/routes/baseResume.routes.js`
- [ ] Implement history handler
  - [ ] Query `TailoredVersion` table
  - [ ] Filter by baseResumeId
  - [ ] Order by createdAt DESC
  - [ ] Include: id, type, createdAt, jobTitle, atsScore
  - [ ] Return formatted list
- [ ] Test with multiple versions
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Returns all tailored versions
- ✅ Ordered by date (newest first)
- ✅ Includes ATS scores
- ✅ Includes job titles

---

#### ☐ 4. Tailored Version Fetch Endpoint (2 hours)
**Priority:** 🔴 CRITICAL  
**Endpoint:** `GET /api/tailored-versions/:id`

**Tasks:**
- [ ] Create `apps/api/routes/tailoredVersion.routes.js`
- [ ] Implement fetch handler
  - [ ] Verify user owns version
  - [ ] Fetch from database
  - [ ] Include: id, data, diff, atsScoreBefore, atsScoreAfter
  - [ ] Return formatted response
- [ ] Add route to `server.js`
- [ ] Test retrieval
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Returns complete version data
- ✅ Includes diff object
- ✅ Includes before/after ATS scores
- ✅ Ownership verified

---

#### ☐ 5. Restore Endpoint (3 hours)
**Priority:** 🔴 CRITICAL  
**Endpoint:** `POST /api/base-resumes/:id/restore/:versionId`

**Tasks:**
- [ ] Add route to `apps/api/routes/baseResume.routes.js`
- [ ] Implement restore handler
  - [ ] Verify user owns both resume and version
  - [ ] Fetch tailored version data
  - [ ] Copy data to base resume
  - [ ] Update base resume
  - [ ] Create new history entry
  - [ ] Return updated resume
- [ ] Test restore process
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Base resume updated with version data
- ✅ History entry created
- ✅ Original version preserved
- ✅ Ownership verified

---

#### ☐ 6. Share Endpoint (4 hours)
**Priority:** 🟠 MEDIUM  
**Endpoint:** `POST /api/base-resumes/:id/share`

**Tasks:**
- [ ] Add route to `apps/api/routes/baseResume.routes.js`
- [ ] Implement share handler
  - [ ] Verify user owns resume
  - [ ] Generate unique share token (UUID)
  - [ ] Create `ResumeShareLink` record
  - [ ] Set expiration date (default: 30 days)
  - [ ] Return share URL: `https://roleready.com/shared/{token}`
- [ ] Create public share view endpoint: `GET /shared/:token`
  - [ ] Verify token valid and not expired
  - [ ] Increment view count
  - [ ] Return resume data (read-only)
- [ ] Test sharing flow
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Generates unique share link
- ✅ Link expires after set time
- ✅ Public can view without login
- ✅ View count tracked
- ✅ Cannot edit shared resume

---

#### ☐ 7. Analytics Endpoint (3 hours)
**Priority:** 🟠 MEDIUM  
**Endpoint:** `GET /api/base-resumes/:id/analytics`

**Tasks:**
- [ ] Add route to `apps/api/routes/baseResume.routes.js`
- [ ] Implement analytics handler
  - [ ] Verify user owns resume
  - [ ] Query `ResumeAnalytics` table
  - [ ] Return: viewCount, exportCount, tailorCount, shareCount, lastViewed
- [ ] Create analytics tracking functions
  - [ ] `trackResumeView(resumeId)`
  - [ ] `trackResumeExport(resumeId)`
  - [ ] `trackResumeTailor(resumeId)`
  - [ ] `trackResumeShare(resumeId)`
- [ ] Integrate tracking into existing endpoints
- [ ] Test analytics tracking
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Returns accurate analytics
- ✅ Tracking works across all operations
- ✅ Timestamps updated correctly

---

#### ☐ 8. Template List Endpoint (6 hours)
**Priority:** 🟢 LOW  
**Endpoint:** `GET /api/resume-templates`

**Tasks:**
- [ ] Create database migration
  - [ ] Add `ResumeTemplate` table (if not exists)
  - [ ] Migrate hardcoded templates from `apps/web/src/data/templates.ts`
  - [ ] Run migration
- [ ] Create `apps/api/routes/template.routes.js`
- [ ] Implement list handler
  - [ ] Query all templates
  - [ ] Support filters: ?category=ats&isPremium=false
  - [ ] Support sorting: ?sort=popular|newest|rating
  - [ ] Return formatted list
- [ ] Implement single template fetch: `GET /api/resume-templates/:id`
- [ ] Add routes to `server.js`
- [ ] Update frontend to use API instead of hardcoded data
- [ ] Test template fetching
- [ ] Write integration test

**Acceptance Criteria:**
- ✅ Templates stored in database
- ✅ Can filter by category
- ✅ Can filter by premium status
- ✅ Can sort by popularity/date/rating
- ✅ Frontend uses API

---

### Security Integration (2 hours)

#### ☐ 9. Integrate Safe Logging (4 hours)
**Priority:** 🔴 CRITICAL  
**Files:** All route files

**Tasks:**
- [ ] Import `safeLog` from `apps/api/utils/safeLogging.js`
- [ ] Replace all `logger.info()` calls with `safeLog('info', ...)`
- [ ] Replace all `logger.error()` calls with `safeLog('error', ...)`
- [ ] Replace all `logger.warn()` calls with `safeLog('warn', ...)`
- [ ] Replace all `logger.debug()` calls with `safeLog('debug', ...)`
- [ ] Test PII masking
  - [ ] Verify emails masked: `j***n@example.com`
  - [ ] Verify phones masked: `***-***-1234`
  - [ ] Verify secrets redacted: `[REDACTED]`
- [ ] Run log scanner: `node apps/api/utils/safeLogging.js scanLogsForSecrets logs/combined.log`
- [ ] Fix any leaked secrets found

**Files to Update:**
- [ ] `apps/api/routes/auth.routes.js`
- [ ] `apps/api/routes/baseResume.routes.js`
- [ ] `apps/api/routes/resume.routes.js`
- [ ] `apps/api/routes/editorAI.routes.js`
- [ ] `apps/api/routes/storage.routes.js`
- [ ] `apps/api/routes/workingDraft.routes.js`
- [ ] `apps/api/services/*.js` (all service files)

**Acceptance Criteria:**
- ✅ No PII in logs
- ✅ No secrets in logs
- ✅ Emails masked
- ✅ Tokens redacted
- ✅ Log scanner shows 0 findings

---

---

## 🟠 MEDIUM PRIORITY (Week 2) - 16 hours

### Security Integration (16 hours)

#### ☐ 10. Run Database Migrations (30 minutes)
**Priority:** 🔴 CRITICAL  

**Tasks:**
- [ ] Set environment variables
  ```bash
  # Generate keys
  node -e "
  const crypto = require('crypto');
  console.log('PII_ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
  console.log('TWO_FACTOR_ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
  console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
  console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(32).toString('hex'));
  "
  
  # Add to .env file
  ```
- [ ] Run RBAC migration
  ```bash
  psql $DATABASE_URL < apps/api/prisma/migrations/add_rbac.sql
  ```
- [ ] Run PII encryption migration
  ```bash
  psql $DATABASE_URL < apps/api/prisma/migrations/add_pii_encryption.sql
  ```
- [ ] Run security features migration
  ```bash
  psql $DATABASE_URL < apps/api/prisma/migrations/add_security_features.sql
  ```
- [ ] Verify tables created
  ```bash
  psql $DATABASE_URL -c "\dt" | grep -E "resume_share|encryption|two_factor|user_sessions|suspicious"
  ```

**Acceptance Criteria:**
- ✅ All migrations run successfully
- ✅ New tables exist
- ✅ Environment variables set
- ✅ No migration errors

---

#### ☐ 11. Integrate RBAC Middleware (2 hours)
**Priority:** 🟠 MEDIUM  
**Files:** `apps/api/routes/*.js`

**Tasks:**
- [ ] Import RBAC middleware
  ```javascript
  const { requireRole, requirePermission } = require('../middleware/rbac');
  ```
- [ ] Apply to admin routes
  ```javascript
  router.get('/api/admin/resumes', requireRole('admin'), handler);
  router.get('/api/admin/users', requireRole('admin'), handler);
  ```
- [ ] Apply to resume routes
  ```javascript
  router.get('/api/base-resumes/:id', requirePermission('viewer'), handler);
  router.patch('/api/base-resumes/:id', requirePermission('editor'), handler);
  router.delete('/api/base-resumes/:id', requirePermission('owner'), handler);
  ```
- [ ] Test role enforcement
  - [ ] Admin can access all resumes
  - [ ] User can only access own resumes
  - [ ] Viewer can read but not edit
  - [ ] Editor can edit but not delete
  - [ ] Owner has full access
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ Admin role enforced
- ✅ Permission levels enforced
- ✅ Unauthorized access blocked
- ✅ Tests passing

---

#### ☐ 12. Integrate PII Encryption (6 hours)
**Priority:** 🔴 CRITICAL  
**Files:** `apps/api/services/userService.js`, `apps/api/services/baseResumeService.js`

**Tasks:**
- [ ] Import encryption utilities
  ```javascript
  const { encrypt, decrypt } = require('../utils/piiEncryption');
  ```
- [ ] Update user service
  - [ ] Encrypt email before save
  - [ ] Encrypt phone before save
  - [ ] Decrypt email on read
  - [ ] Decrypt phone on read
- [ ] Update resume service
  - [ ] Encrypt contact info before save
  - [ ] Decrypt contact info on read
- [ ] Create migration script to encrypt existing data
  ```javascript
  // apps/api/scripts/encrypt-existing-pii.js
  ```
- [ ] Run encryption script on existing data
- [ ] Test encryption/decryption
  - [ ] Save user with email
  - [ ] Verify encrypted in database
  - [ ] Retrieve user
  - [ ] Verify decrypted correctly
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ PII encrypted at rest
- ✅ PII decrypted on read
- ✅ Existing data encrypted
- ✅ No plaintext PII in database
- ✅ Tests passing

---

#### ☐ 13. Integrate Session Management (4 hours)
**Priority:** 🟠 MEDIUM  
**Files:** `apps/api/routes/auth.routes.js`

**Tasks:**
- [ ] Import session utilities
  ```javascript
  const { generateTokens, verifyAccessToken, verifyRefreshToken } = require('../middleware/sessionManagement');
  ```
- [ ] Update login endpoint
  - [ ] Generate access + refresh tokens
  - [ ] Store refresh token in database
  - [ ] Return both tokens
  - [ ] Set access token expiry: 15 minutes
  - [ ] Set refresh token expiry: 7 days
- [ ] Create token refresh endpoint
  ```javascript
  POST /api/auth/refresh-token
  ```
  - [ ] Verify refresh token
  - [ ] Generate new access token
  - [ ] Return new access token
- [ ] Update auth middleware
  - [ ] Verify access token
  - [ ] Check expiration
  - [ ] Return 401 if expired
- [ ] Create logout endpoint
  ```javascript
  POST /api/auth/logout
  ```
  - [ ] Invalidate refresh token
  - [ ] Clear session
- [ ] Test session flow
  - [ ] Login returns tokens
  - [ ] Access token expires after 15 min
  - [ ] Refresh token works
  - [ ] Logout invalidates tokens
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ Access tokens expire after 15 min
- ✅ Refresh tokens expire after 7 days
- ✅ Token refresh works
- ✅ Logout invalidates tokens
- ✅ Tests passing

---

#### ☐ 14. Integrate Suspicious Activity Detection (2 hours)
**Priority:** 🟢 LOW  
**Files:** `apps/api/routes/auth.routes.js`, `apps/api/middleware/auth.js`

**Tasks:**
- [ ] Import detection utilities
  ```javascript
  const { detectNewCountryLogin, detectRapidRequests, detectMultipleIps } = require('../utils/suspiciousActivityDetection');
  ```
- [ ] Add to login endpoint
  - [ ] Get user's IP and country (use geoip-lite)
  - [ ] Call `detectNewCountryLogin(userId, ip, country)`
  - [ ] Log suspicious activity
  - [ ] Send email alert if suspicious
- [ ] Add to API middleware
  - [ ] Track request count per user
  - [ ] Call `detectRapidRequests(userId, count, timeWindow)`
  - [ ] Log suspicious activity
- [ ] Test detection
  - [ ] Login from new country triggers alert
  - [ ] Rapid requests trigger alert
  - [ ] Multiple IPs trigger alert
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ New country login detected
- ✅ Rapid requests detected
- ✅ Multiple IPs detected
- ✅ Alerts sent
- ✅ Tests passing

---

---

## 🟢 LOW PRIORITY (Week 3) - 18 hours

### API Documentation (18 hours)

#### ☐ 15. Create OpenAPI/Swagger Spec (8 hours)
**Priority:** 🟢 LOW  
**File:** `apps/api/swagger.yaml`

**Tasks:**
- [ ] Install dependencies
  ```bash
  npm install @fastify/swagger @fastify/swagger-ui
  ```
- [ ] Create OpenAPI 3.0 spec
  - [ ] Document all endpoints
  - [ ] Add request schemas
  - [ ] Add response schemas
  - [ ] Add authentication
  - [ ] Add error responses
- [ ] Document endpoints:
  - [ ] Auth endpoints (login, register, logout, refresh)
  - [ ] Base resume endpoints (CRUD, activate, deactivate)
  - [ ] Working draft endpoints (get, update, commit, discard)
  - [ ] Tailored version endpoints (create, list, fetch)
  - [ ] AI endpoints (ATS, tailor, generate)
  - [ ] Export endpoints (PDF, DOCX, TXT, JSON)
  - [ ] Template endpoints (list, fetch)
  - [ ] Storage endpoints (upload, download, list)
  - [ ] Share endpoints (create, view)
  - [ ] Analytics endpoints (get)
- [ ] Add examples for each endpoint
- [ ] Validate spec with Swagger Editor

**Acceptance Criteria:**
- ✅ All endpoints documented
- ✅ Request/response schemas defined
- ✅ Examples provided
- ✅ Spec validates

---

#### ☐ 16. Set Up Swagger UI (4 hours)
**Priority:** 🟢 LOW  
**File:** `apps/api/server.js`

**Tasks:**
- [ ] Configure Swagger plugin
  ```javascript
  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      info: {
        title: 'RoleReady Resume Builder API',
        description: 'API for resume building, AI operations, and more',
        version: '1.0.0'
      },
      servers: [
        { url: 'http://localhost:3001', description: 'Development' },
        { url: 'https://api.roleready.com', description: 'Production' }
      ]
    }
  });
  
  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    }
  });
  ```
- [ ] Test Swagger UI
  - [ ] Visit `http://localhost:3001/api/docs`
  - [ ] Verify all endpoints listed
  - [ ] Test "Try it out" feature
- [ ] Add authentication to Swagger UI
  - [ ] Configure JWT bearer auth
  - [ ] Test authenticated requests
- [ ] Deploy Swagger UI to production

**Acceptance Criteria:**
- ✅ Swagger UI accessible
- ✅ All endpoints visible
- ✅ "Try it out" works
- ✅ Authentication works

---

#### ☐ 17. Write API Changelog (2 hours)
**Priority:** 🟢 LOW  
**File:** `apps/api/CHANGELOG.md`

**Tasks:**
- [ ] Create changelog file
- [ ] Document version 1.0.0
  - [ ] All implemented features
  - [ ] Breaking changes (none for v1.0)
  - [ ] Deprecations (none for v1.0)
- [ ] Add versioning strategy
  - [ ] Semantic versioning (MAJOR.MINOR.PATCH)
  - [ ] API version in URL: `/api/v1/...`
  - [ ] Deprecation policy (6 months notice)
- [ ] Document future versions
  - [ ] v1.1.0: Planned features
  - [ ] v2.0.0: Breaking changes

**Acceptance Criteria:**
- ✅ Changelog created
- ✅ v1.0.0 documented
- ✅ Versioning strategy defined

---

#### ☐ 18. Add Code Examples (4 hours)
**Priority:** 🟢 LOW  
**File:** `apps/api/docs/examples/`

**Tasks:**
- [ ] Create examples directory
- [ ] Write JavaScript/TypeScript examples
  - [ ] Authentication
  - [ ] Create resume
  - [ ] Update resume
  - [ ] Export resume
  - [ ] AI operations
- [ ] Write Python examples
  - [ ] Authentication
  - [ ] Create resume
  - [ ] Update resume
  - [ ] Export resume
  - [ ] AI operations
- [ ] Write cURL examples
  - [ ] Authentication
  - [ ] Create resume
  - [ ] Update resume
  - [ ] Export resume
  - [ ] AI operations
- [ ] Add to Swagger UI documentation
- [ ] Test all examples

**Example Structure:**
```
apps/api/docs/examples/
├── javascript/
│   ├── auth.js
│   ├── resume-crud.js
│   ├── export.js
│   └── ai-operations.js
├── python/
│   ├── auth.py
│   ├── resume_crud.py
│   ├── export.py
│   └── ai_operations.py
└── curl/
    ├── auth.sh
    ├── resume-crud.sh
    ├── export.sh
    └── ai-operations.sh
```

**Acceptance Criteria:**
- ✅ Examples for all major operations
- ✅ 3 languages covered (JS, Python, cURL)
- ✅ Examples tested and working
- ✅ Integrated into docs

---

---

## 📊 Progress Tracking

### Summary
- **Total Tasks:** 19
- **High Priority:** 10 tasks (29 hours)
- **Medium Priority:** 6 tasks (16 hours)
- **Low Priority:** 4 tasks (18 hours)
- **Total Time:** 63.5 hours (~3 weeks)

### By Week
| Week | Tasks | Hours | Priority |
|------|-------|-------|----------|
| Week 1 | 9 | 29 | 🔴 HIGH |
| Week 2 | 6 | 16 | 🟠 MEDIUM |
| Week 3 | 4 | 18 | 🟢 LOW |

### Completion Checklist
- [ ] Week 1: All endpoints implemented (9/9)
- [ ] Week 2: All security integrated (6/6)
- [ ] Week 3: All docs complete (4/4)
- [ ] All tests passing (177+ tests)
- [ ] No linter errors
- [ ] Security scan clean
- [ ] Ready for production

---

## 🎯 Success Criteria

### Week 1 Complete When:
- ✅ All 8 endpoints working
- ✅ Safe logging integrated
- ✅ Can export resumes
- ✅ Can duplicate resumes
- ✅ Can view history
- ✅ Can share resumes
- ✅ Analytics tracking works

### Week 2 Complete When:
- ✅ All migrations run
- ✅ RBAC enforced
- ✅ PII encrypted
- ✅ Sessions managed
- ✅ Activity detected
- ✅ All security tests passing

### Week 3 Complete When:
- ✅ OpenAPI spec complete
- ✅ Swagger UI working
- ✅ Changelog written
- ✅ Code examples provided
- ✅ Documentation published

### Production Ready When:
- ✅ All 19 tasks complete
- ✅ All 177+ tests passing
- ✅ No critical issues
- ✅ Security verified
- ✅ Performance benchmarked
- ✅ Documentation complete

---

## 📝 Notes

- **Parallel Work:** Tasks 1-8 can be done in parallel by multiple developers
- **Dependencies:** Task 10 must be done before tasks 11-14
- **Testing:** Write tests for each task as you complete it
- **Code Review:** Get review before merging to main
- **Deployment:** Deploy after Week 1 and Week 2 for early feedback

---

**Last Updated:** November 15, 2025  
**Status:** Ready to start  
**Next Action:** Begin Week 1 tasks

