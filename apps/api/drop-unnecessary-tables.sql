-- Drop unnecessary tables (keep only profile-related tables)
-- Run this script to clean up the database

-- Drop tables not related to profile feature
DROP TABLE IF EXISTS "roleready"."resumes" CASCADE;
DROP TABLE IF EXISTS "roleready"."jobs" CASCADE;
DROP TABLE IF EXISTS "roleready"."cover_letters" CASCADE;
DROP TABLE IF EXISTS "roleready"."emails" CASCADE;
DROP TABLE IF EXISTS "roleready"."portfolios" CASCADE;
DROP TABLE IF EXISTS "roleready"."cloud_files" CASCADE;
DROP TABLE IF EXISTS "roleready"."cloud_folders" CASCADE;
DROP TABLE IF EXISTS "roleready"."file_shares" CASCADE;
DROP TABLE IF EXISTS "roleready"."credentials" CASCADE;
DROP TABLE IF EXISTS "roleready"."analytics" CASCADE;
DROP TABLE IF EXISTS "roleready"."discussion_posts" CASCADE;
DROP TABLE IF EXISTS "roleready"."discussion_comments" CASCADE;
DROP TABLE IF EXISTS "roleready"."ai_agents" CASCADE;
DROP TABLE IF EXISTS "roleready"."ai_agent_tasks" CASCADE;
DROP TABLE IF EXISTS "roleready"."audit_logs" CASCADE;
DROP TABLE IF EXISTS "roleready"."job_descriptions" CASCADE;
DROP TABLE IF EXISTS "roleready"."analytics_snapshots" CASCADE;
DROP TABLE IF EXISTS "roleready"."ai_usage" CASCADE;
DROP TABLE IF EXISTS "roleready"."notifications" CASCADE;

-- Keep these tables (profile-related):
-- - users (profile data)
-- - sessions (authentication)
-- - refresh_tokens (authentication)
-- - password_reset_tokens (security)

