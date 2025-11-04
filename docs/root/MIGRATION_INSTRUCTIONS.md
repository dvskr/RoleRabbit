# Migration Instructions: Move Projects to Work Experience & Remove Achievements

## Overview
This migration:
1. Removes the `achievements` table
2. Moves `projects` from being linked to `user_profiles` to being linked to `work_experiences`
3. Updates the database schema accordingly

## Pre-Migration Steps

### 1. Backup Your Database
```bash
# Create a backup before migration
pg_dump -h localhost -U your_user -d your_database > backup_before_migration.sql
```

### 2. Run Data Migration Script (if you have existing projects)
If you have existing projects in the database, run the migration script first:

```bash
cd apps/api
node scripts/migrate-projects-to-work-experience.js
```

This script will:
- Find all projects linked to profiles
- Link them to the most recent work experience for each profile
- Handle cases where no work experience exists

## Migration Steps

### Option 1: Using Prisma Migrate (Recommended)

```bash
cd apps/api

# 1. Generate the migration
npx prisma migrate dev --name move_projects_to_work_experience_and_remove_achievements

# 2. Apply the migration
npx prisma migrate deploy
```

### Option 2: Manual Migration

If you prefer to run the SQL manually:

```bash
cd apps/api

# 1. Generate Prisma client (to verify schema)
npx prisma generate

# 2. Run the migration SQL file
psql -h localhost -U your_user -d your_database -f prisma/migrations/20250101000000_move_projects_to_work_experience_and_remove_achievements/migration.sql
```

## Post-Migration Steps

### 1. Verify Migration
```bash
# Check that achievements table is gone
psql -h localhost -U your_user -d your_database -c "\d achievements"

# Check that projects table has workExperienceId
psql -h localhost -U your_user -d your_database -c "\d projects"
```

### 2. Update API Routes
Update your API routes to handle projects under work experiences:

- When creating/updating work experience, you can now include projects
- When fetching work experience, include projects relation
- Update project CRUD operations to use `workExperienceId` instead of `profileId`

### 3. Update Frontend
Update frontend components to:
- Display projects within work experience entries
- Allow adding/editing projects when editing work experience
- Update API calls to use new structure

## Rollback (if needed)

If you need to rollback:

```bash
# Restore from backup
psql -h localhost -U your_user -d your_database < backup_before_migration.sql

# Or manually revert:
# 1. Restore achievements table structure
# 2. Change projects.workExperienceId back to profileId
# 3. Restore foreign key constraints
```

## Schema Changes Summary

### Removed:
- ❌ `achievements` table (entirely removed)

### Modified:
- ✅ `projects` table:
  - Removed: `profileId` column
  - Added: `workExperienceId` column (required)
  - Added: `media` column (optional, JSON array)

### Relations:
- ✅ `WorkExperience` now has `projects Project[]` relation
- ✅ `Project` now belongs to `WorkExperience` instead of `UserProfile`

## Testing Checklist

After migration, verify:
- [ ] Achievements table is removed
- [ ] Projects are linked to work experiences
- [ ] Can create new project under work experience
- [ ] Can fetch work experience with projects
- [ ] Can update/delete projects
- [ ] Existing projects are properly linked (if you ran data migration)

