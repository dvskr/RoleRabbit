# PostgreSQL Setup Guide

## ✅ Schema Updated
The Prisma schema has been updated to use PostgreSQL instead of SQLite.

## Setup PostgreSQL Database

### Option 1: Local PostgreSQL Installation
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a new database:
```sql
CREATE DATABASE roleready_dev;
```

### Option 2: Cloud PostgreSQL (Recommended)
Use one of these free services:

#### Supabase (Recommended)
1. Go to https://supabase.com
2. Create a new project
3. Get your connection string from Settings > Database
4. Add to `.env`:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### Neon (Free Tier)
1. Go to https://neon.tech
2. Create a new project
3. Get your connection string
4. Add to `.env`:
```
DATABASE_URL="postgresql://[user]:[password]@[hostname]/[database]"
```

#### Railway (Free Tier)
1. Go to https://railway.app
2. Create PostgreSQL database
3. Get connection string
4. Add to `.env`

### Option 3: Docker PostgreSQL
```bash
docker run --name roleready-postgres \
  -e POSTGRES_PASSWORD=roleready_dev \
  -e POSTGRES_DB=roleready \
  -p 5432:5432 \
  -d postgres:15
```

Then use:
```
DATABASE_URL="postgresql://postgres:roleready_dev@localhost:5432/roleready"
```

## Add to .env File

Create `apps/api/.env` with:
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# Resend Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# JWT
JWT_SECRET=your-secret-key-here

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Run Migration

Once DATABASE_URL is set:
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

This will:
1. Create all tables in PostgreSQL
2. Generate Prisma client
3. Set up the complete database schema

## Verify Setup

```bash
npx prisma studio
```

This opens a visual database browser to verify tables were created.

## Next Steps

After migration completes, I'll continue with:
- AI usage tracking integration
- Email service testing
- Resume export functionality
- And more...

