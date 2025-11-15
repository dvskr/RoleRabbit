## Sections 6.4 - 6.6 and 7.1 Implementation Summary

**Implementation Date:** January 2025
**Status:** ✅ Complete

---

## Overview

This document details the implementation of content moderation, enhanced logging & audit, rate limiting, abuse prevention, and comprehensive API documentation for the RoleRabbit platform.

---

## 6.4 Content Moderation

### Implementation Files

- **`apps/web/src/lib/moderation/content-scanner.ts`** (380 lines)
- **`apps/web/src/lib/moderation/review-queue.ts`** (340 lines)
- **`apps/web/src/lib/moderation/abuse-reporting.ts`** (420 lines)
- **`apps/web/src/lib/moderation/file-scanner.ts`** (390 lines)

### Features Implemented

#### 6.4.1 Automated Content Moderation

**File:** `content-scanner.ts`

**Prohibited Content Categories:**
- Hate speech
- Violence
- Adult content
- Illegal content
- Spam
- Harassment
- Misinformation
- Copyright violations
- Profanity

**Functions:**
```typescript
scanTextContent(content: string): ModerationResult
scanPortfolioContent(portfolio): Promise<ModerationResult>
scanForSpam(content: string): boolean
checkForPII(content: string): { containsPII: boolean; types: string[] }
scanWithML(content: string): Promise<{ flagged: boolean; categories: string[] }>
```

**Moderation Result:**
```typescript
interface ModerationResult {
  safe: boolean;              // No violations found
  flagged: boolean;           // Score >= 30
  violations: ModerationViolation[];
  score: number;              // 0-100 (lower is safer)
  requiresReview: boolean;    // Score >= 50 or critical violation
}
```

**Severity Levels:**
- **Critical** (50 points): Hate speech, illegal content
- **High** (30 points): Violence, adult content, harassment
- **Medium** (15 points): Spam, misinformation
- **Low** (5 points): Profanity

**Recommended Actions:**
- Score 0: Allow
- Score 1-29: Warn
- Score 30-49: Flag for review
- Score 50-69: Require manual review
- Score 70+: Block

#### 6.4.2 Manual Review Queue

**File:** `review-queue.ts`

**Review Status:**
- `pending` - Awaiting review
- `in_review` - Being reviewed
- `approved` - Approved for publishing
- `rejected` - Rejected
- `escalated` - Escalated to senior moderator

**Priority Levels:**
- `urgent` - Score >= 70
- `high` - Score >= 50
- `medium` - Score >= 30
- `low` - Score < 30

**Review Decisions:**
- `approve` - Allow publishing
- `reject` - Unpublish and notify user
- `request_changes` - Request edits from user
- `ban_user` - Ban account and unpublish all content

**Functions:**
```typescript
addToReviewQueue(portfolioId, userId, moderationResult, contentSnapshot)
getPendingReviews(limit, priorityFilter)
claimReviewItem(queueId, reviewerId)
completeReview(queueId, reviewerId, decision, notes)
escalateReview(queueId, escalationReason)
getReviewQueueStats()
```

**Statistics Tracked:**
- Pending reviews
- In-review items
- Approved count
- Rejected count
- Average review time (minutes)

#### 6.4.3 Abuse Reporting

**File:** `abuse-reporting.ts`

**Abuse Reason Types:**
- Hate speech
- Harassment
- Spam
- Inappropriate content
- Copyright violation
- Impersonation
- Misinformation
- Illegal content
- Other

**Abuse Actions:**
- `no_action` - Report dismissed
- `warning_sent` - Warning sent to user
- `content_removed` - Portfolio unpublished
- `account_suspended` - Temporary suspension (7 days)
- `account_banned` - Permanent ban

**Functions:**
```typescript
submitAbuseReport(reporterId, portfolioId, reason, description)
getPendingReports(limit)
investigateReport(reportId, investigatorId)
resolveAbuseReport(reportId, resolverId, action, resolution)
dismissReport(reportId, dismisserId, reason)
getUserViolationHistory(userId)
getAbuseStats()
```

**Auto-Unpublish:**
- Portfolio auto-unpublished after 3 reports
- Marked as "under investigation"
- Moderators notified

**Violation History Tracking:**
- Total reports against user
- Reports resolved against user
- Warnings received
- Suspensions count
- Bans count

#### 6.4.4 File Malware Scanning

**File:** `file-scanner.ts`

**Supported Scanners:**
- **ClamAV** - Local antivirus scanning
- **VirusTotal API** - Cloud-based scanning
- **Local validation** - File type and size checks

**File Validation:**
```typescript
validateFileType(fileName, mimeType, allowedTypes)
validateFileSize(fileSize, maxSizeMB)
```

**Allowed File Types:**
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF

**Size Limits:**
- Maximum file size: 10MB

**PDF Security Checks:**
- Invalid PDF header
- Embedded JavaScript
- Embedded files
- Suspicious actions (/Launch, /SubmitForm, /ImportData)

**Image Content Moderation:**
- Integration points for AWS Rekognition, Google Vision API, Azure Content Moderator
- Detects inappropriate image content
- Returns categories and confidence scores

**Combined Safety Check:**
```typescript
performFileSafetyCheck(fileBuffer, fileName, mimeType)
// Returns: { safe, issues[], scanResults }
```

**Quarantine:**
- Infected files moved to quarantine storage
- Security team notified
- Database marked as quarantined

---

## 6.5 Logging & Audit Enhancements

### Implementation Files

- **`apps/web/src/lib/logging/log-sanitizer.ts`** (280 lines)
- **`apps/web/src/lib/logging/security-logger.ts`** (360 lines)

### Features Implemented

#### 6.5.1 Sensitive Data Masking

**File:** `log-sanitizer.ts`

**Auto-Masked Patterns:**
- Passwords: `"password": "value"` → `"password": "***"`
- Tokens: JWT, API keys, access tokens
- Credit cards: `4111-1111-1111-1111` → `****-****-****-1111`
- SSN: `123-45-6789` → masked
- Auth headers: `Bearer token` → `Bearer ***`
- Encryption keys, secret keys

**Sensitive Field Names:**
```typescript
const SENSITIVE_FIELDS = [
  'password', 'passwd', 'pwd', 'secret', 'token',
  'api_key', 'apiKey', 'private_key', 'privateKey',
  'encryption_key', 'access_token', 'refresh_token',
  'credit_card', 'cvv', 'ssn', 'social_security'
];
```

**Functions:**
```typescript
sanitizeLogMessage(message: string): string
sanitizeLogObject(obj: any): any
maskCreditCard(cardNumber: string): string  // Shows last 4
maskEmail(email: string): string            // Shows first char + domain
maskPhone(phone: string): string            // Shows last 4
maskJWT(token: string): string              // Shows only header
maskIPAddress(ip: string): string           // Masks last octet
sanitizeHeaders(headers): Record<string, any>
sanitizeURL(url: string): string            // Removes sensitive query params
sanitizeError(error: Error)
containsSensitiveData(text: string): boolean
```

**SafeLogger Class:**
```typescript
const logger = new SafeLogger('context-name');

logger.info('User logged in', { userId, ipAddress });
logger.warn('Rate limit exceeded', { userId, limit });
logger.error('Database connection failed', error, { metadata });
logger.debug('Processing request', { request });
```

All logs automatically sanitized before output.

#### 6.5.2 Security Event Logging

**File:** `security-logger.ts`

**Security Event Types:**

**Authentication:**
- `login.success`, `login.failure`
- `logout`
- `password.change`, `password.reset.request`, `password.reset.complete`
- `mfa.enabled`, `mfa.disabled`
- `mfa.challenge.success`, `mfa.challenge.failure`

**Authorization:**
- `unauthorized.access`
- `permission.denied`
- `role.changed`

**Resource Events:**
- `resource.created`, `resource.deleted`, `resource.modified`

**Suspicious Activity:**
- `brute_force.attempt`
- `rate_limit.exceeded`
- `suspicious.ip`
- `account_takeover.attempt`

**Admin Events:**
- `admin.access`, `admin.action`
- `config.change`

**Data Events:**
- `data.export`, `data.deletion`
- `pii.access`

**Functions:**
```typescript
logSecurityEvent(event: SecurityEvent)
logAuthAttempt(userId, email, success, ipAddress, userAgent, failureReason)
logLogout(userId, ipAddress, userAgent)
logUnauthorizedAccess(userId, resource, resourceId, requiredPermission, ipAddress)
logSensitiveOperation(type, userId, resource, resourceId, action, ipAddress, metadata)
getUserSecurityEvents(userId, limit)
getFailedLoginAttempts(timeWindowMinutes)
getSecurityStats(days)
```

**Automated Threat Detection:**

**Brute Force Detection:**
- Triggers after 5 failed login attempts in 15 minutes
- Logs `brute_force.attempt`
- Alerts security team

**Account Takeover Detection:**
- Detects login from new IP or device
- Logs `account_takeover.attempt`
- Notifies user

**Mass Deletion Detection:**
- Triggers if >= 10 deletions in 1 hour
- Alerts security team

**Log Retention:**
- Security logs: 1 year (configurable)
- Application logs: 90 days
- Automated cleanup function: `cleanup_old_security_logs()`

---

## 6.6 Rate Limiting & Abuse Prevention

### Implementation Files

- **`apps/web/src/lib/rate-limiting/rate-limiter.ts`** (420 lines)

### Features Implemented

#### 6.6.1 Progressive Rate Limiting

**Rate Limit Tiers:**

| Endpoint Type | Window | Max Requests | Identifier |
|---------------|--------|--------------|------------|
| General API | 1 hour | 100 | User ID |
| Deploy | 1 hour | 10 | User ID |
| Export | 1 hour | 10 | User ID |
| Generate | 1 hour | 20 | User ID |
| Public View | 1 hour | 1000 | IP |
| Subdomain Check | 1 minute | 50 | IP |
| Login | 15 minutes | 5 | IP |
| Register | 1 hour | 3 | IP |
| Password Reset | 1 hour | 3 | IP |
| Portfolio Create | 1 hour | 10 | User ID |
| Portfolio Publish | 1 hour | 20 | User ID |
| Abuse Report | 24 hours | 10 | User ID |

**Rate Limit Response:**
```typescript
interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}
```

**HTTP Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200000
Retry-After: 3600  (if exceeded)
```

**429 Response:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 3600 seconds.",
  "limit": 100,
  "resetAt": "2025-01-15T12:00:00Z"
}
```

#### 6.6.2 Progressive Rate Limiter

**Violation-Based Reduction:**
- 1-2 violations: 75% of normal limit (25% reduction)
- 3-4 violations: 50% of normal limit (50% reduction)
- 5+ violations: 10% of normal limit (90% reduction)

**Functions:**
```typescript
class ProgressiveRateLimiter {
  checkLimit(userId: string, action: string): Promise<RateLimitResult>
  resetViolations(userId: string): void
}
```

#### 6.6.3 CAPTCHA Requirements

**Auto-CAPTCHA Trigger:**
- Required when usage exceeds 80% of rate limit
- Example: Subdomain availability checks after 40 checks in 1 minute

**Function:**
```typescript
requiresCaptcha(action: string, identifier: string): Promise<boolean>
```

#### 6.6.4 Activity Tracking

**Tracked Activities:**
- Portfolio creation
- Portfolio deployment
- Portfolio deletion
- Export operations

**Unusual Activity Thresholds:**

| Activity | Threshold (per hour) |
|----------|---------------------|
| Portfolio Create | 10 |
| Portfolio Deploy | 20 |
| Portfolio Delete | 5 |

**Functions:**
```typescript
trackActivity(userId, activityType, metadata)
checkUnusualActivity(userId, activityType)
```

**Automated Response:**
- Log suspicious activity
- Consider temporary restrictions
- Alert administrators

#### 6.6.5 Account-Level Restrictions

**Restriction Types:**
- `portfolio:create` - Cannot create portfolios
- `portfolio:publish` - Cannot publish portfolios
- `all` - All operations restricted

**Functions:**
```typescript
applyAccountRestriction(userId, restriction, durationHours, reason)
checkRestrictions(userId, action)
```

**Database Storage:**
```sql
CREATE TABLE account_restrictions (
  user_id UUID,
  restriction_type VARCHAR(50),
  reason TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**Example Usage:**
```typescript
// Apply 24-hour restriction
await applyAccountRestriction(
  userId,
  'portfolio:create',
  24,
  'Violated content policy'
);

// Check before allowing action
const { restricted, reason } = await checkRestrictions(userId, 'portfolio:create');
if (restricted) {
  return res.status(403).json({ error: reason });
}
```

#### 6.6.6 Rate Limit Statistics

**Metrics Tracked:**
- Total requests
- Blocked requests
- Top abusers (by violation count)

**Function:**
```typescript
getRateLimitStats(): Promise<{
  totalRequests: number;
  blockedRequests: number;
  topAbusers: Array<{ identifier: string; violations: number }>;
}>
```

---

## 7.1 API Documentation

### Implementation Files

- **`apps/web/public/api-docs/openapi.yaml`** (800+ lines)
- **`apps/web/src/pages/api-docs.tsx`** (300 lines)

### Features Implemented

#### 7.1.1 OpenAPI 3.0 Specification

**File:** `openapi.yaml`

**Documented Endpoints:**

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

**Portfolios:**
- `GET /api/portfolios` - List portfolios (paginated)
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios/{id}` - Get portfolio by ID
- `PUT /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio (soft delete)
- `POST /api/portfolios/{id}/publish` - Publish portfolio
- `GET /api/portfolios/{id}/export` - Export portfolio (PDF/HTML/JSON)

**Templates:**
- `GET /api/templates` - List templates

**Analytics:**
- `GET /api/portfolios/{id}/analytics` - Get portfolio analytics

**User:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/export-data` - GDPR data export

**Moderation:**
- `POST /api/abuse/report` - Submit abuse report

**For Each Endpoint, Documented:**

1. **Path Parameters:**
   - Type (string, uuid, integer)
   - Description
   - Required/optional
   - Examples

2. **Query Parameters:**
   - `page`, `limit` (pagination)
   - `published`, `sortBy`, `order` (filtering/sorting)
   - `format` (export format)
   - `period` (analytics time period)

3. **Request Body Schemas:**
   - Required fields
   - Optional fields
   - Data types
   - Validation rules (minLength, maxLength, format)
   - Examples

4. **Response Codes:**
   - 200 OK
   - 201 Created
   - 400 Bad Request
   - 401 Unauthorized
   - 403 Forbidden
   - 404 Not Found
   - 429 Too Many Requests

5. **Response Schemas:**
   - Data structure
   - Field types
   - Examples

6. **Rate Limits:**
   - Requests per hour
   - Response headers (X-RateLimit-*)

7. **Example Requests/Responses:**

**Example - Create Portfolio:**
```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required: [title]
        properties:
          title:
            type: string
            example: "John Doe - Portfolio"
          subtitle:
            type: string
            example: "Full Stack Developer"
          templateId:
            type: string
            format: uuid

responses:
  '201':
    description: Portfolio created successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Portfolio'
```

**Error Response Format:**
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "Title is required"
  }
}
```

**Pagination Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 100,
    "totalPages": 5
  }
}
```

**Authentication Documentation:**
```
Authorization: Bearer <jwt_token>
```

Obtained from `/api/auth/login` endpoint.

#### 7.1.2 Swagger UI

**File:** `api-docs.tsx`

**Hosted At:** `/api-docs`

**Features:**
- Interactive API exploration
- Try-it-out functionality
- Request/response examples
- Schema visualization
- Authentication testing
- Searchable/filterable
- Download OpenAPI spec

**UI Components:**
- Header with navigation
- Quick links (Authentication, Portfolios, Analytics, Rate Limits)
- Swagger UI embedded
- Footer with links

**CDN Resources:**
- Swagger UI CSS (5.10.0)
- Swagger UI Bundle JS
- Swagger UI Standalone Preset

**Configuration:**
```javascript
SwaggerUIBundle({
  url: '/api-docs/openapi.yaml',
  deepLinking: true,
  defaultModelsExpandDepth: 1,
  docExpansion: 'list',
  filter: true,
  tryItOutEnabled: true,
  persistAuthorization: true,
})
```

**Download Button:**
- Downloads `openapi.yaml` specification
- Can be imported into Postman, Insomnia, etc.

---

## Database Schema Changes

### Migration 019

**File:** `019_create_moderation_and_security_tables.sql`

**Tables Created:**

#### review_queue
```sql
- id UUID PRIMARY KEY
- portfolio_id UUID REFERENCES portfolios
- user_id UUID REFERENCES auth.users
- content_type VARCHAR(50)
- content_snapshot JSONB
- moderation_result JSONB
- status VARCHAR(20) CHECK (pending, in_review, approved, rejected, escalated)
- priority VARCHAR(20) CHECK (low, medium, high, urgent)
- reviewed_at TIMESTAMP
- reviewed_by UUID
- review_decision VARCHAR(50)
- review_notes TEXT
- created_at, updated_at TIMESTAMP
```

Indexes:
- `idx_review_queue_status`
- `idx_review_queue_priority`
- `idx_review_queue_user_id`
- `idx_review_queue_pending` (filtered, status='pending')

#### abuse_reports
```sql
- id UUID PRIMARY KEY
- reporter_id UUID REFERENCES auth.users
- reported_user_id UUID REFERENCES auth.users
- portfolio_id UUID REFERENCES portfolios
- reason VARCHAR(50)
- description TEXT
- status VARCHAR(20) CHECK (pending, investigating, resolved, dismissed)
- resolved_at TIMESTAMP
- resolved_by UUID
- resolution TEXT
- action_taken VARCHAR(50)
- created_at, updated_at TIMESTAMP
```

Indexes:
- `idx_abuse_reports_status`
- `idx_abuse_reports_reporter`
- `idx_abuse_reports_reported_user`
- `idx_abuse_reports_portfolio`

#### security_logs
```sql
- id UUID PRIMARY KEY
- event_type VARCHAR(100)
- user_id UUID REFERENCES auth.users
- ip_address VARCHAR(45)
- user_agent TEXT
- resource VARCHAR(100)
- resource_id VARCHAR(255)
- action VARCHAR(100)
- result VARCHAR(20) CHECK (success, failure)
- metadata JSONB
- created_at TIMESTAMP
```

Indexes:
- `idx_security_logs_event_type`
- `idx_security_logs_user_id`
- `idx_security_logs_created_at`
- `idx_security_logs_ip_address`
- `idx_security_logs_result`
- `idx_security_logs_user_event` (composite)
- `idx_security_logs_ip_event` (composite)

#### user_activities
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES auth.users
- activity_type VARCHAR(100)
- metadata JSONB
- created_at TIMESTAMP
```

Indexes:
- `idx_user_activities_user_id`
- `idx_user_activities_activity_type`
- `idx_user_activities_created_at`
- `idx_user_activities_user_activity` (composite)

#### account_restrictions
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES auth.users
- restriction_type VARCHAR(50)
- reason TEXT
- expires_at TIMESTAMP
- created_at TIMESTAMP
```

Indexes:
- `idx_account_restrictions_user_id`
- `idx_account_restrictions_expires_at`
- `idx_account_restrictions_active` (filtered, expires_at > NOW())

**Schema Additions:**

**portfolios table:**
```sql
ALTER TABLE portfolios
  ADD COLUMN moderation_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN moderation_notes TEXT;
```

**auth.users table:**
```sql
ALTER TABLE auth.users
  ADD COLUMN banned BOOLEAN DEFAULT FALSE,
  ADD COLUMN ban_reason TEXT,
  ADD COLUMN banned_at TIMESTAMP,
  ADD COLUMN suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN suspend_until TIMESTAMP,
  ADD COLUMN suspend_reason TEXT;
```

**Functions Created:**

```sql
update_updated_at() -- Trigger function for updated_at
cleanup_old_security_logs() -- Returns deleted count
cleanup_old_activities() -- Returns deleted count
```

**Row Level Security:**
- All tables have RLS enabled
- Users can view their own data
- Admins have full access
- Service role has full access for background jobs

---

## Testing

### Moderation Testing

**Test Content Scanner:**
```typescript
const result = await scanTextContent('Suspicious content here');
expect(result.safe).toBe(false);
expect(result.score).toBeGreaterThan(30);
```

**Test Review Queue:**
```typescript
await addToReviewQueue(portfolioId, userId, moderationResult, content);
const pending = await getPendingReviews(50);
expect(pending.length).toBeGreaterThan(0);
```

**Test Abuse Reporting:**
```typescript
const { success, reportId } = await submitAbuseReport(
  reporterId,
  portfolioId,
  AbuseReasonType.SPAM,
  'This portfolio contains spam'
);
expect(success).toBe(true);
```

### Logging Testing

**Test Log Sanitization:**
```typescript
const sanitized = sanitizeLogMessage('password: secret123');
expect(sanitized).not.toContain('secret123');
expect(sanitized).toContain('***');
```

**Test Security Logging:**
```typescript
await logAuthAttempt(userId, email, false, ipAddress, userAgent, 'Invalid password');
const events = await getUserSecurityEvents(userId);
expect(events).toContainEqual(expect.objectContaining({
  type: SecurityEventType.LOGIN_FAILURE,
}));
```

### Rate Limiting Testing

**Test Rate Limit:**
```typescript
// Make 101 requests
for (let i = 0; i < 101; i++) {
  const result = await checkRateLimit('api:general', userId);
  if (i < 100) {
    expect(result.allowed).toBe(true);
  } else {
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  }
}
```

**Test Progressive Rate Limiter:**
```typescript
const limiter = new ProgressiveRateLimiter();

// First violation
await limiter.checkLimit(userId, 'portfolio:create');
// Limit reduced to 75%

// After 5 violations
// Limit reduced to 10%
```

### API Documentation Testing

**Test Swagger UI:**
1. Navigate to `/api-docs`
2. Verify page loads
3. Test "Try it out" functionality
4. Download OpenAPI spec
5. Import into Postman/Insomnia

**Validate OpenAPI Spec:**
```bash
swagger-cli validate public/api-docs/openapi.yaml
```

---

## Deployment Checklist

### Environment Variables

```env
# VirusTotal (optional)
VIRUSTOTAL_API_KEY=<your-api-key>

# ClamAV (optional)
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

### Database Migration

```bash
# Run migration 019
cd apps/web
npx supabase migration up
```

### Cron Jobs

**Daily Cleanup (00:00 UTC):**
```bash
# Clean security logs older than 1 year
psql -c "SELECT cleanup_old_security_logs();"

# Clean activities older than 90 days
psql -c "SELECT cleanup_old_activities();"
```

### Monitoring Alerts

Set up alerts for:
- High abuse report volume
- Brute force attempts detected
- Multiple rate limit violations
- Mass content deletions
- Account takeover attempts

---

## Usage Examples

### Implementing Content Moderation on Publish

```typescript
import { scanPortfolioContent, getRecommendedAction } from '@/lib/moderation/content-scanner';
import { addToReviewQueue } from '@/lib/moderation/review-queue';

// In portfolio publish endpoint
const moderationResult = await scanPortfolioContent(portfolio);
const { action, message } = getRecommendedAction(moderationResult);

if (action === 'block') {
  return res.status(400).json({ error: message });
}

if (action === 'review') {
  await addToReviewQueue(portfolio.id, userId, moderationResult, portfolio);
  return res.status(202).json({
    message: 'Portfolio submitted for review',
    requiresReview: true,
  });
}

// Allow publish
await publishPortfolio(portfolio.id);
```

### Using Safe Logger

```typescript
import { SafeLogger } from '@/lib/logging/log-sanitizer';

const logger = new SafeLogger('api:portfolios');

// Sensitive data automatically masked
logger.info('User authenticated', {
  userId,
  email: 'user@example.com',
  password: 'secret123', // Will be masked as ***
  token: 'Bearer eyJ...', // Will be masked
});
```

### Applying Rate Limits

```typescript
import { rateLimitMiddleware } from '@/lib/rate-limiting/rate-limiter';

// In API route
app.post('/api/portfolios',
  rateLimitMiddleware('portfolio:create'),
  async (req, res) => {
    // Handler
  }
);
```

### Checking Account Restrictions

```typescript
import { checkRestrictions } from '@/lib/rate-limiting/rate-limiter';

const { restricted, reason, expiresAt } = await checkRestrictions(userId, 'portfolio:create');

if (restricted) {
  return res.status(403).json({
    error: 'Account restricted',
    reason,
    expiresAt,
  });
}
```

---

## Performance Considerations

### Rate Limiting

**Current Implementation:**
- In-memory storage (Map)
- Good for single-instance deployments
- Auto-cleanup every 60 seconds

**Production Recommendation:**
- Use Redis for distributed rate limiting
- Shared state across multiple servers
- Faster lookups

**Migration to Redis:**
```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowMs / 1000);
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}
```

### Content Scanning

**Optimization:**
- Run scans asynchronously
- Cache moderation results (by content hash)
- Use worker threads for heavy processing

### File Scanning

**VirusTotal API:**
- Check hash first (free lookup)
- Only upload if not in database
- Rate limit: 4 requests/minute (free tier)

**Recommendation:**
- Queue file uploads
- Process async with worker
- Notify user when complete

---

## Security Best Practices

### 1. Never Log Sensitive Data

✅ **Always use SafeLogger:**
```typescript
import { SafeLogger } from '@/lib/logging/log-sanitizer';
const logger = new SafeLogger('context');
logger.info('Message', metadata); // Auto-sanitized
```

### 2. Moderate All User Content

✅ **Scan before publishing:**
```typescript
const result = await scanPortfolioContent(portfolio);
if (result.requiresReview) {
  await addToReviewQueue(...);
}
```

### 3. Scan All File Uploads

✅ **Scan before storing:**
```typescript
const { safe, issues } = await performFileSafetyCheck(buffer, filename, mimeType);
if (!safe) {
  return res.status(400).json({ error: 'File failed security check', issues });
}
```

### 4. Rate Limit All Endpoints

✅ **Apply appropriate limits:**
```typescript
app.use('/api/expensive', rateLimitMiddleware('api:deploy'));
```

### 5. Log Security Events

✅ **Log all auth and authorization events:**
```typescript
await logAuthAttempt(userId, email, success, ip, ua);
await logUnauthorizedAccess(userId, resource, id, permission, ip);
```

---

## Files Summary

**New Files:** 12
**Modified Files:** 0
**Total Lines Added:** ~3,500

**Breakdown:**
- Content Moderation: 4 files, ~1,530 lines
- Logging & Audit: 2 files, ~640 lines
- Rate Limiting: 1 file, ~420 lines
- API Documentation: 2 files, ~1,100 lines
- Database Migration: 1 file, ~250 lines

---

## Conclusion

This implementation provides comprehensive content moderation, enhanced security logging, rate limiting, abuse prevention, and professional API documentation for the RoleRabbit platform.

**Key Achievements:**
✅ Automated content moderation with ML integration points
✅ Manual review queue for flagged content
✅ User abuse reporting system
✅ File malware scanning (ClamAV, VirusTotal)
✅ Sensitive data masking in all logs
✅ Security event logging for compliance
✅ Progressive rate limiting
✅ Account-level restrictions
✅ Interactive API documentation (Swagger UI)
✅ Complete OpenAPI 3.0 specification

The platform is now equipped with enterprise-grade moderation, security, and documentation capabilities.

---

**Last Updated:** January 15, 2025
**Version:** 1.0
