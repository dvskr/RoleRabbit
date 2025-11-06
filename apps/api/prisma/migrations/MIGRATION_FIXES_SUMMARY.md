# Migration Fixes Summary

## Overview
All migrations have been updated to handle edge cases and prevent failures when:
- Tables don't exist in shadow databases
- Columns already exist
- Foreign key constraints already exist
- Tables are referenced before they're created

## Fixed Migrations

### 1. `20250101000000_move_projects_to_profile_and_remove_achievements`
**Fixed Issues:**
- ✅ Creates `projects` table if it doesn't exist
- ✅ Checks for `workExperienceId` column before using it
- ✅ Checks for `user_profiles` table before creating foreign keys
- ✅ Handles both new and existing `projects` tables
- ✅ Uses conditional logic for all ALTER TABLE operations

### 2. `20250101000002_add_portfolio_column`
**Fixed Issues:**
- ✅ Checks if `user_profiles` table exists before adding column
- ✅ Checks if column already exists before adding

### 3. `20251102041236_add_billing_models`
**Fixed Issues:**
- ✅ Uses `CREATE TABLE IF NOT EXISTS` for all tables
- ✅ Uses `CREATE INDEX IF NOT EXISTS` for all indexes
- ✅ Checks if `users` table exists before creating foreign keys
- ✅ Checks if constraints already exist before adding

### 4. `20251103224002_add_language_model`
**Fixed Issues:**
- ✅ Creates `languages` table if it doesn't exist
- ✅ Checks if `user_profiles` table exists before creating foreign key
- ✅ Handles nullable `profileId` initially, sets NOT NULL only if table has data

### 5. `20251104090000_add_user_languages`
**Fixed Issues:**
- ✅ Same fixes as language model migration above
- ✅ Handles duplicate migration scenarios

### 6. `20251104123000_update_education_schema`
**Fixed Issues:**
- ✅ Checks if `education` table exists before modifying
- ✅ Checks if columns exist before renaming/adding
- ✅ Handles all column operations conditionally

### 7. `20251104131500_add_professional_bio_to_user_profiles`
**Fixed Issues:**
- ✅ Checks if `user_profiles` table exists before adding column
- ✅ Handles both camelCase and snake_case column name possibilities
- ✅ Checks if column already exists before adding

### 8. `20250102120000_remove_storage_tags`
**Status:** ✅ Already safe (uses `DROP COLUMN IF EXISTS`)

### 9. `20250101000001_remove_unused_profile_models`
**Status:** ✅ Already safe (uses `DROP TABLE IF EXISTS` and `DROP CONSTRAINT IF EXISTS`)

### 10. `20250101000003_move_projects_to_work_experience_removed`
**Status:** ✅ No-op migration (marked as applied, won't cause issues)

## Best Practices Applied

1. **Table Existence Checks**: All migrations check if tables exist before referencing them
2. **Column Existence Checks**: All migrations check if columns exist before adding/modifying
3. **Constraint Existence Checks**: All foreign keys check if constraints already exist
4. **Conditional Operations**: All ALTER TABLE operations are wrapped in DO blocks with IF checks
5. **CREATE IF NOT EXISTS**: All CREATE statements use IF NOT EXISTS
6. **DROP IF EXISTS**: All DROP statements use IF EXISTS

## Future Migration Guidelines

When creating new migrations, always:
1. Use `CREATE TABLE IF NOT EXISTS` or check table existence first
2. Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` or check column existence
3. Check foreign key target tables exist before creating constraints
4. Wrap complex operations in DO blocks with existence checks
5. Use `CREATE INDEX IF NOT EXISTS` for indexes
6. Use `DROP TABLE/COLUMN/CONSTRAINT IF EXISTS` for removals

## Testing Shadow Database

All migrations are now safe for Prisma's shadow database creation:
- Migrations can be applied in any order without errors
- Missing tables won't cause failures
- Duplicate columns/constraints won't cause errors
- Migrations are idempotent (can be run multiple times safely)

