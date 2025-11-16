# 🚀 Run Database Migrations

## Overview

This guide will help you run all pending database migrations for the Resume Builder.

## Migrations Included

1. **20251115_add_missing_tables.sql**
   - Creates `resume_templates` table
   - Creates `resume_share_links` table
   - Creates `resume_analytics` table
   - Creates `generated_documents` table
   - Inserts default templates

2. **add_rbac.sql**
   - Adds `role` column to `users` table
   - Adds `permission` column to `share_links` table
   - Creates indexes for performance

3. **add_pii_encryption.sql**
   - Enables `pgcrypto` extension
   - Prepares for PII encryption (if needed)

4. **add_security_features.sql**
   - Adds 2FA columns (`twoFactorSecret`, `twoFactorEnabled`)
   - Adds security tracking (`lastLoginIp`, `lastLoginCountry`)
   - Adds consent flags (`consentAiProcessing`, `consentAnalytics`)

## Prerequisites

✅ PostgreSQL database running  
✅ Database connection configured in `.env`  
✅ Node.js and npm installed  
✅ Prisma client generated

## Option 1: Automated Script (Recommended)

Run all migrations automatically:

```bash
cd apps/api
node scripts/run-all-migrations.js
```

This will:
- Run all migrations in order
- Skip already-applied migrations
- Show detailed progress
- Provide a summary at the end

### Expected Output

```
================================================================================
🚀 RUNNING ALL MIGRATIONS
================================================================================

📦 Running migration: 20251115_add_missing_tables
   Description: Add ResumeTemplate, ResumeShareLink, ResumeAnalytics, GeneratedDocument tables
   ✅ Migration completed successfully

📦 Running migration: add_rbac
   Description: Add RBAC (user roles and share permissions)
   ✅ Migration completed successfully

📦 Running migration: add_pii_encryption
   Description: Enable PII encryption with pgcrypto
   ✅ Migration completed successfully

📦 Running migration: add_security_features
   Description: Add 2FA, session management, and security features
   ✅ Migration completed successfully

================================================================================
📊 MIGRATION SUMMARY
================================================================================
✓ 20251115_add_missing_tables
✓ add_rbac
✓ add_pii_encryption
✓ add_security_features

--------------------------------------------------------------------------------
Total: 4
Successful: 4
Already Applied: 0
Failed: 0
================================================================================

✅ All migrations completed successfully!
```

## Option 2: Manual Execution

Run migrations manually using `psql`:

```bash
# Connect to your database
psql -U your_username -d your_database

# Run each migration
\i apps/api/prisma/migrations/20251115_add_missing_tables.sql
\i apps/api/prisma/migrations/add_rbac.sql
\i apps/api/prisma/migrations/add_pii_encryption.sql
\i apps/api/prisma/migrations/add_security_features.sql
```

## Option 3: Using Prisma Migrate

If you prefer Prisma's migration system:

```bash
cd apps/api
npx prisma migrate dev --name add_all_features
```

**Note**: This will create a new migration based on your schema.prisma file.

## Verification

After running migrations, verify the tables exist:

```sql
-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'resume_templates',
    'resume_share_links', 
    'resume_analytics',
    'generated_documents'
  );

-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('role', 'two_factor_secret', 'two_factor_enabled');

-- Check default templates
SELECT id, name, category, is_premium 
FROM resume_templates;
```

Expected results:
- 4 new tables created
- 5+ new columns in `users` table
- 5 default templates inserted

## Rollback (if needed)

If you need to rollback migrations:

```sql
-- Drop new tables
DROP TABLE IF EXISTS "generated_documents" CASCADE;
DROP TABLE IF EXISTS "resume_analytics" CASCADE;
DROP TABLE IF EXISTS "resume_share_links" CASCADE;
DROP TABLE IF EXISTS "resume_templates" CASCADE;

-- Remove new columns from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
ALTER TABLE "users" DROP COLUMN IF EXISTS "two_factor_secret";
ALTER TABLE "users" DROP COLUMN IF EXISTS "two_factor_enabled";
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_login_ip";
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_login_country";
ALTER TABLE "users" DROP COLUMN IF EXISTS "consent_ai_processing";
ALTER TABLE "users" DROP COLUMN IF EXISTS "consent_analytics";
ALTER TABLE "users" DROP COLUMN IF EXISTS "consent_marketing";
```

## Troubleshooting

### Error: "relation already exists"
**Solution**: Migration already applied. This is safe to ignore.

### Error: "permission denied"
**Solution**: Ensure your database user has CREATE privileges:
```sql
GRANT CREATE ON SCHEMA public TO your_username;
```

### Error: "extension pgcrypto does not exist"
**Solution**: Install the extension manually:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Error: "column already exists"
**Solution**: Column was added in a previous migration. Safe to ignore.

## Post-Migration Steps

After successful migration:

1. **Regenerate Prisma Client**
   ```bash
   cd apps/api
   npx prisma generate
   ```

2. **Restart API Server**
   ```bash
   npm run dev
   ```

3. **Test New Endpoints**
   - Export: `POST /api/base-resumes/:id/export`
   - Share: `POST /api/base-resumes/:id/share`
   - Templates: `GET /api/resume-templates`
   - Analytics: `GET /api/base-resumes/:id/analytics`

4. **Verify RBAC**
   ```bash
   # Check user roles
   curl http://localhost:3001/api/users/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Migration Status Tracking

Create a migrations tracking table (optional):

```sql
CREATE TABLE IF NOT EXISTS "_migrations_log" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Log migrations
INSERT INTO "_migrations_log" (name, success) 
VALUES 
  ('20251115_add_missing_tables', true),
  ('add_rbac', true),
  ('add_pii_encryption', true),
  ('add_security_features', true)
ON CONFLICT (name) DO NOTHING;
```

## Next Steps

After migrations are complete:

1. ✅ **Task 10 Complete** - Database migrations run
2. ➡️ **Task 11** - Integrate RBAC middleware
3. ➡️ **Task 12** - Integrate PII encryption
4. ➡️ **Task 13** - Integrate session management
5. ➡️ **Task 14** - Integrate suspicious activity detection

## Support

If you encounter issues:

1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql.log`
2. Verify database connection: `psql -U username -d database -c "SELECT 1"`
3. Check migration files exist: `ls -la apps/api/prisma/migrations/`
4. Review error messages in the script output

## Summary

✅ 4 migrations ready to run  
✅ Automated script provided  
✅ Manual options available  
✅ Verification queries included  
✅ Rollback instructions provided  

**Run the migrations now to enable all new features!**

```bash
cd apps/api && node scripts/run-all-migrations.js
```

