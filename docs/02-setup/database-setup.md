# Database Setup

## Overview

RoleReady uses Prisma ORM with PostgreSQL database (via Supabase or self-hosted).

---

## Current Setup: PostgreSQL (Supabase)

### Configuration

**File:** `apps/api/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 1: Get Your Supabase Connection String

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Under "Connection string" → **URI** tab
5. Copy the connection string

### Step 2: Configure Environment

**File:** `apps/api/.env`

```env
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Authentication
JWT_SECRET=your-jwt-secret

# Email (Resend)
EMAIL_FROM=onboarding@resend.dev

# Supabase (for storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_BUCKET=resumes
```

### Step 3: Initialize Database

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or create migration
npx prisma migrate dev --name init

# Optional: Open Prisma Studio (GUI)
npx prisma studio
```

---

## Alternative: Self-Hosted PostgreSQL

For local development without Supabase:

### Installation

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-15
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Configuration

```env
# apps/api/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/roleready_db"
```

Then run:
```bash
cd apps/api
npx prisma migrate dev --name init
```

---

## Database Models

### Core Models

**User & Auth:**
- `User` - User accounts
- `RefreshToken` - JWT refresh tokens
- `Session` - Active sessions
- `PasswordResetToken` - Password resets

**Content:**
- `Resume` - User resumes
- `Job` - Job applications
- `CoverLetter` - Cover letters
- `Email` - Email templates and history

**Storage:**
- `CloudFile` - Cloud storage files
- `Portfolio` - Portfolio websites

**AI & Analytics:**
- `AIAgent` - AI agents
- `AIAgentTask` - Agent tasks
- `Analytics` - User analytics
- `AIUsage` - AI usage tracking

**System:**
- `DiscussionPost` - Forum posts
- `DiscussionComment` - Post comments
- `AuditLog` - Audit trail
- `Notification` - User notifications

---

## Database Management

### Prisma Studio (GUI)

```bash
cd apps/api
npx prisma studio
```

Access at: http://localhost:5555

### Manual Query

```bash
cd apps/api

# SQLite
sqlite3 prisma/dev.db

# PostgreSQL
psql -U roleready_user -d roleready_db
```

### Backup & Restore

**SQLite:**
```bash
# Backup
cp apps/api/prisma/dev.db apps/api/prisma/dev.db.backup

# Restore
cp apps/api/prisma/dev.db.backup apps/api/prisma/dev.db
```

**PostgreSQL:**
```bash
# Backup
pg_dump -U roleready_user roleready_db > backup.sql

# Restore
psql -U roleready_user -d roleready_db < backup.sql
```

---

## Seeding Data

```bash
cd apps/api

# Run seeder
npm run seed
```

**File:** `apps/api/utils/seeder.js`

---

## Migrations

### Create Migration

```bash
npx prisma migrate dev --name add_new_field
```

### Apply Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Reset Database

```bash
# ⚠️ WARNING: Deletes all data
npx prisma migrate reset
```

---

## Performance Optimization

### Indexes

Already configured in schema for:
- `user` lookups
- `userId` foreign keys
- `status` fields
- `createdAt` timestamps

### Connection Pooling

**PostgreSQL** (recommended):
- PgBouncer for connection pooling
- Max 20 connections per service

### Query Optimization

- Use `select` to limit fields
- Add `where` clauses for filtering
- Use `include` wisely (avoid N+1)
- Paginate large result sets

---

## Docker Database

**File:** `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: roleready
      POSTGRES_PASSWORD: roleready_password
      POSTGRES_DB: roleready_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Start:**
```bash
docker-compose up -d postgres
```

---

## Monitoring

### Query Performance

```bash
# Enable query logging in Prisma
# Add to .env
DEBUG=* npx prisma
```

### Database Stats

```bash
# SQLite
sqlite3 prisma/dev.db ".stats"

# PostgreSQL
psql -U roleready_user -d roleready_db -c "SELECT pg_size_pretty(pg_database_size('roleready_db'));"
```

---

## Troubleshooting

### "Migration failed"

```bash
# Reset and retry
npx prisma migrate reset
npx prisma migrate dev
```

### "Database locked"

- Close Prisma Studio
- Check for hanging connections
- Restart database service

### "Connection refused"

```bash
# Check PostgreSQL is running
# Mac
brew services list | grep postgresql

# Linux
systemctl status postgresql

# Windows
Get-Service postgresql*
```

---

## Next Steps

- [Backend Setup](backend-setup.md)
- [API Reference](../03-api/api-reference.md)
- [Deployment Guide](../06-deployment/deployment-guide.md)

