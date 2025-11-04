-- Migration: Remove unused profile models
-- This migration removes models that are not used in the profile tabs:
-- CareerTimeline, VolunteerExperience, Recommendation, Publication, Patent, Organization, TestScore

-- Step 1: Drop foreign key constraints first
ALTER TABLE IF EXISTS career_timeline DROP CONSTRAINT IF EXISTS career_timeline_profileId_fkey;
ALTER TABLE IF EXISTS volunteer_experiences DROP CONSTRAINT IF EXISTS volunteer_experiences_profileId_fkey;
ALTER TABLE IF EXISTS recommendations DROP CONSTRAINT IF EXISTS recommendations_profileId_fkey;
ALTER TABLE IF EXISTS publications DROP CONSTRAINT IF EXISTS publications_profileId_fkey;
ALTER TABLE IF EXISTS patents DROP CONSTRAINT IF EXISTS patents_profileId_fkey;
ALTER TABLE IF EXISTS organizations DROP CONSTRAINT IF EXISTS organizations_profileId_fkey;
ALTER TABLE IF EXISTS test_scores DROP CONSTRAINT IF EXISTS test_scores_profileId_fkey;

-- Step 2: Drop indexes
DROP INDEX IF EXISTS career_timeline_profileId_idx;
DROP INDEX IF EXISTS volunteer_experiences_profileId_idx;
DROP INDEX IF EXISTS recommendations_profileId_idx;
DROP INDEX IF EXISTS publications_profileId_idx;
DROP INDEX IF EXISTS patents_profileId_idx;
DROP INDEX IF EXISTS organizations_profileId_idx;
DROP INDEX IF EXISTS test_scores_profileId_idx;

-- Step 3: Drop tables
DROP TABLE IF EXISTS career_timeline CASCADE;
DROP TABLE IF EXISTS volunteer_experiences CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS patents CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS test_scores CASCADE;

