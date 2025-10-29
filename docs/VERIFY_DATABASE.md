# How to Verify Database Tables

## Method 1: Prisma Studio (Visual Browser) ✅ EASIEST

Run this command:
```bash
cd apps/api
npx prisma studio
```

This opens a web browser at http://localhost:5555 where you can:
- See all tables
- View data
- Add/edit/delete records
- Visual database browser

## Method 2: Docker PostgreSQL Shell

Connect directly to PostgreSQL:
```bash
docker exec -it roleready-postgres psql -U postgres -d roleready
```

Then run SQL commands:
```sql
-- List all tables
\dt

-- Describe a table
\d users

-- Count records
SELECT COUNT(*) FROM users;

-- Exit
\q
```

## Method 3: VS Code Extension

1. Install "Prisma" extension in VS Code
2. Right-click on `schema.prisma`
3. Select "Prisma: Open in Prisma Studio"

## Method 4: Check Tables via Node

Create a test script:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$queryRaw\`SELECT tablename FROM pg_tables WHERE schemaname = 'public'\`.then(console.log);"
```

## Expected Tables

After running the migration, you should see these tables:

1. ✅ users
2. ✅ resumes
3. ✅ jobs
4. ✅ cover_letters
5. ✅ emails
6. ✅ portfolios
7. ✅ cloud_files
8. ✅ analytics
9. ✅ discussion_posts
10. ✅ discussion_comments
11. ✅ ai_agents
12. ✅ ai_agent_tasks
13. ✅ refresh_tokens
14. ✅ sessions
15. ✅ password_reset_tokens
16. ✅ audit_logs
17. ✅ job_descriptions
18. ✅ analytics_snapshots
19. ✅ **ai_usage** (NEW - for AI tracking)
20. ✅ **notifications** (NEW - for in-app notifications)

## Quick Verification Command

```bash
cd apps/api
npx prisma db execute --stdin << EOF
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
EOF
```

This lists all tables in your database.

