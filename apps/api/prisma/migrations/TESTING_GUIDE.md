# Migration Testing Guide

## Overview
This guide explains how to verify that all migrations are safe and will work correctly.

## ✅ What Has Been Done

1. **Code Fixes**: All 11 migrations have been updated with safety checks
2. **Documentation**: Created fix summaries and checklists
3. **Static Analysis**: Migrations use safe patterns

## 🧪 Testing Options

### Option 1: Static Validation (Safest - No DB Changes)
```bash
cd apps/api
node prisma/migrations/test-migrations.js
```

This checks:
- ✅ Migration files exist
- ✅ SQL syntax is valid
- ✅ Safety patterns are used
- ✅ Migration order is correct

### Option 2: Dry Run Migration Test
```bash
cd apps/api
npx prisma migrate dev --create-only --name test_validation
```

This will:
- ✅ Try to create a shadow database
- ✅ Apply all migrations in order
- ✅ Validate SQL syntax
- ⚠️  Requires database connection but won't modify production

### Option 3: Check Migration Status
```bash
cd apps/api
npx prisma migrate status
```

This shows:
- ✅ Which migrations are applied
- ✅ Which are pending
- ✅ Database schema sync status

### Option 4: Full Test on Development Database (Recommended for CI/CD)
```bash
cd apps/api
# Create test database first
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma generate
```

**⚠️ Warning**: This resets the database. Only use on development/test databases.

## 📋 Test Checklist

- [ ] Run static migration test: `node prisma/migrations/test-migrations.js`
- [ ] Check migration status: `npx prisma migrate status`
- [ ] Verify database schema matches Prisma schema: `npx prisma db push --accept-data-loss` (check output only)
- [ ] Test shadow database creation (if possible)
- [ ] Verify all tables referenced in migrations exist or are created

## 🎯 Current Status

**Migrations Fixed**: ✅ All 11 migrations have safety checks
**Tests Run**: ❌ No automated tests executed yet
**Manual Verification**: ❌ Not verified on actual database

## 🚀 Recommended Next Steps

1. **Run Static Tests** (Safe, no database required):
   ```bash
   cd apps/api
   node prisma/migrations/test-migrations.js
   ```

2. **Check Current State** (Safe, read-only):
   ```bash
   npx prisma migrate status
   ```

3. **If Using Development Database** (⚠️ Will reset DB):
   ```bash
   npx prisma migrate reset --force
   ```

4. **For Production**: Verify migrations work on staging first

## ⚠️ Important Notes

- **Shadow Database**: Prisma creates shadow databases for validation. Some migrations may fail there if dependencies don't exist, but they're still safe for your actual database (which has all tables).
- **Migration Order**: Migrations run in timestamp order. Ensure timestamps are sequential.
- **Idempotency**: All migrations should be safe to run multiple times (idempotent).

## 🔍 Verification Commands Summary

```bash
# 1. Static tests (no database needed)
node prisma/migrations/test-migrations.js

# 2. Check what's applied (read-only)
npx prisma migrate status

# 3. Validate schema sync (read-only check)
npx prisma db pull
npx prisma validate

# 4. Generate Prisma client (safe)
npx prisma generate
```

## ✅ Success Criteria

A migration is considered "tested" when:
1. ✅ Static validation passes
2. ✅ Migration status shows "in sync"
3. ✅ Prisma schema validates without errors
4. ✅ Shadow database can be created (if possible)

