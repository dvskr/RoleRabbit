# RoleRabbit Quick Start Checklist

Use this checklist to activate all features step-by-step.

## Prerequisites ✅

- [ ] Node.js 18.17+ installed
- [ ] PostgreSQL 14+ running (or Supabase account)
- [ ] Git repository cloned
- [ ] Code editor (VS Code recommended)

---

## Automated Setup (Recommended)

### Option A: Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- ✅ Install all dependencies
- ✅ Set up Git hooks
- ✅ Generate secure environment variables
- ✅ Run database migrations
- ✅ Create admin user

**Then jump to Step 7** ⬇️

---

## Manual Setup

### Step 1: Install Dependencies

```bash
npm install
cd apps/web
npm install bcryptjs isomorphic-dompurify zod
npm install --save-dev @types/bcryptjs husky lint-staged @commitlint/cli @commitlint/config-conventional
cd ../..
npx husky install
```

- [ ] Dependencies installed
- [ ] No errors in console

### Step 2: Configure Environment

```bash
cd apps/web
cp .env.example .env.local
```

Generate secrets:

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Edit `apps/web/.env.local`:

- [ ] `DATABASE_URL` set
- [ ] `JWT_SECRET` set (generated above)
- [ ] `ENCRYPTION_KEY` set (generated above)
- [ ] `NEXTAUTH_SECRET` set (generated above)
- [ ] Optional: `REDIS_URL` for rate limiting
- [ ] Optional: SMTP settings for emails

### Step 3: Database Setup

```bash
# Option 1: Using Supabase
# - Create project at https://app.supabase.com
# - Copy Database URL from Settings → Database
# - Add to .env.local

# Option 2: Local PostgreSQL
createdb rolerabbit
psql rolerabbit -c "SELECT 1;"  # Test connection
```

- [ ] Database created and accessible
- [ ] Connection string in `.env.local`

### Step 4: Run Migrations

```bash
psql $DATABASE_URL -f apps/web/src/database/migrations/018_create_audit_and_privacy_tables.sql
psql $DATABASE_URL -f apps/web/src/database/migrations/019_create_moderation_and_security_tables.sql
```

Verify:

```bash
psql $DATABASE_URL -c "\dt"
```

Should show:
- [ ] `audit_logs` table
- [ ] `deletion_requests` table
- [ ] `review_queue` table
- [ ] `abuse_reports` table
- [ ] `security_logs` table

### Step 5: Create Admin User

```bash
psql $DATABASE_URL <<EOF
INSERT INTO auth.users (id, email, encrypted_password, role, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@rolerabbit.com',
  crypt('ChangeThisPassword123!', gen_salt('bf')),
  'admin',
  NOW(),
  NOW(),
  NOW()
);
EOF
```

- [ ] Admin user created
- [ ] Remember credentials: `admin@rolerabbit.com` / `ChangeThisPassword123!`

### Step 6: Build Application

```bash
npm run build
```

- [ ] Build completed successfully
- [ ] No TypeScript errors

---

## Step 7: Start Development Server

```bash
npm run dev
```

Server should start at `http://localhost:3000`

- [ ] Server running
- [ ] No errors in console

---

## Step 8: Verify Installation

### Test Health Endpoint

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

- [ ] Health check returns OK

### Test API Documentation

Open in browser: `http://localhost:3000/api-docs`

- [ ] Swagger UI loads
- [ ] All endpoints visible

### Run Automated Tests

```bash
chmod +x scripts/test-apis.sh
./scripts/test-apis.sh
```

- [ ] Public endpoint tests pass

---

## Step 9: Test Authentication

### Login as Admin

```bash
# Adjust endpoint based on your auth implementation
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rolerabbit.com","password":"ChangeThisPassword123!"}'
```

- [ ] Login successful
- [ ] Received JWT token

### Test Authenticated Endpoints

```bash
# Save token from login response
export TOKEN="your-jwt-token-here"

# Run authenticated tests
./scripts/test-apis.sh
```

- [ ] All authenticated tests pass

---

## Step 10: Test Key Features

### Abuse Reporting

```bash
curl -X POST http://localhost:3000/api/abuse/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "portfolioId": "test-uuid",
    "reason": "spam",
    "description": "Test report"
  }'
```

- [ ] Report submitted successfully
- [ ] Rate limiting works (try 11 times)

### Data Export (GDPR)

```bash
curl http://localhost:3000/api/user/export-data \
  -H "Authorization: Bearer $TOKEN" \
  > my-data.json

cat my-data.json
```

- [ ] Data exported successfully
- [ ] JSON contains user data

### Review Queue

```bash
curl http://localhost:3000/api/admin/review-queue \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Queue accessible
- [ ] Returns queue items

---

## Step 11: Configure Git Hooks

```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Test hooks
git add .
git commit -m "test: verify hooks work"
```

- [ ] Pre-commit runs linting
- [ ] Commit message validated
- [ ] No errors

---

## Step 12: Add Cookie Consent (Optional)

Edit your main layout file:

```typescript
// app/layout.tsx
import { CookieConsent } from '@/components/CookieConsent';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
```

- [ ] Cookie consent banner appears on first visit
- [ ] Preferences saved

---

## Step 13: Set Up Cron Jobs (Production)

### Option A: Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-deletions",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-logs",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

### Option B: System Crontab

```bash
crontab -e

# Add:
0 2 * * * cd /path/to/RoleRabbit && npx ts-node scripts/process-deletions.ts
0 3 * * 0 cd /path/to/RoleRabbit && npx ts-node scripts/cleanup-audit-logs.ts
```

- [ ] Scheduled deletions configured
- [ ] Log cleanup configured

---

## Step 14: Create Frontend Components (Optional)

### Abuse Report Button

```typescript
// components/AbuseReportButton.tsx
import { submitAbuseReport } from '@/lib/api/moderation';

export function AbuseReportButton({ portfolioId }: Props) {
  const handleReport = async () => {
    await submitAbuseReport(portfolioId, 'spam', 'Test');
  };

  return <button onClick={handleReport}>Report</button>;
}
```

- [ ] Component created
- [ ] Reports submitted from UI

### Admin Dashboard

```typescript
// app/admin/page.tsx
import { getReviewQueue } from '@/lib/api/moderation';

export default async function AdminPage() {
  const queue = await getReviewQueue('pending');
  return <div>Review Queue: {queue.length} items</div>;
}
```

- [ ] Admin page created
- [ ] Queue visible to admins

---

## Step 15: Production Deployment

### Vercel Deployment

```bash
npm install -g vercel
vercel login
vercel --prod
```

Set environment variables in Vercel dashboard:
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `ENCRYPTION_KEY`
- [ ] `NEXTAUTH_SECRET`
- [ ] Other secrets

### Railway Deployment

```bash
npm install -g @railway/cli
railway login
railway up
```

- [ ] Deployed to production
- [ ] Environment variables set
- [ ] Migrations run on production DB

### Post-Deployment

- [ ] Test production endpoints
- [ ] Verify HTTPS enabled
- [ ] Check monitoring (Sentry)
- [ ] Test email notifications
- [ ] Verify cron jobs running

---

## Verification Checklist

Go through this checklist to ensure everything works:

### Authentication & Authorization
- [ ] Users can register
- [ ] Users can login
- [ ] JWT tokens generated
- [ ] Admins have admin permissions
- [ ] Moderators have moderator permissions
- [ ] Regular users have limited permissions

### Abuse Reporting
- [ ] Users can report portfolios
- [ ] Duplicate reports prevented
- [ ] Rate limiting works (max 10/day)
- [ ] Auto-unpublish after 3 reports
- [ ] Moderators can view reports
- [ ] Moderators can resolve reports

### Content Moderation
- [ ] Content auto-scanned on publish
- [ ] Flagged content goes to review queue
- [ ] Moderators can approve/reject
- [ ] Admins can ban users
- [ ] Audit logs created for all actions

### Privacy & GDPR
- [ ] Users can export data
- [ ] Users can schedule deletion
- [ ] 30-day grace period enforced
- [ ] Deletion can be cancelled
- [ ] Accounts deleted after 30 days
- [ ] Cookie consent banner works
- [ ] Analytics can be opted out

### Rate Limiting
- [ ] API rate limits enforced
- [ ] Headers show rate limit status
- [ ] 429 errors when exceeded
- [ ] Redis caching works (if configured)

### Security
- [ ] HTTPS enforced in production
- [ ] CSP headers set
- [ ] Input sanitization works
- [ ] SQL injection prevented
- [ ] XSS prevention works
- [ ] Passwords hashed with bcrypt

### Monitoring & Logging
- [ ] Audit logs created
- [ ] Security events logged
- [ ] Errors sent to Sentry
- [ ] API metrics tracked
- [ ] Old logs cleaned up

### Documentation
- [ ] API docs accessible at /api-docs
- [ ] Swagger UI interactive
- [ ] All endpoints documented
- [ ] Error responses documented

---

## Troubleshooting

If anything fails, check:

1. **Database connection**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **Environment variables**
   ```bash
   cat apps/web/.env.local
   ```

3. **Server logs**
   ```bash
   npm run dev
   # Check console output
   ```

4. **Migration status**
   ```bash
   psql $DATABASE_URL -c "\dt"
   ```

5. See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed help

---

## Support & Resources

- 📖 **Detailed Guide**: [ACTIVATION_GUIDE.md](ACTIVATION_GUIDE.md)
- 🛠️ **Development**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 🚀 **Deployment**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- ❓ **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- 📚 **User Guide**: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- 🔧 **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Next Steps

Once everything is working:

1. **Customize moderation rules** in `content-scanner.ts`
2. **Set up monitoring alerts** in Sentry/Datadog
3. **Train moderators** using RUNBOOKS.md
4. **Create user documentation** for your users
5. **Set up email templates** for notifications
6. **Configure backup strategy**
7. **Plan incident response** procedures

---

**🎉 Congratulations! Your RoleRabbit platform is fully activated!**

All security, moderation, privacy, and compliance features are now live and ready to use.
