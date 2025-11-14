-- Performance Indexes Migration
-- Run this SQL directly on your database or use: npx prisma migrate dev

-- BaseResume indexes
CREATE INDEX IF NOT EXISTS "base_resumes_userId_updatedAt_idx" ON "base_resumes"("userId", "updatedAt");

-- TailoredVersion indexes  
CREATE INDEX IF NOT EXISTS "tailored_versions_userId_createdAt_idx" ON "tailored_versions"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "tailored_versions_baseResumeId_createdAt_idx" ON "tailored_versions"("baseResumeId", "createdAt");

-- AIRequestLog indexes
CREATE INDEX IF NOT EXISTS "ai_request_logs_userId_createdAt_idx" ON "ai_request_logs"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ai_request_logs_action_createdAt_idx" ON "ai_request_logs"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "ai_request_logs_userId_action_createdAt_idx" ON "ai_request_logs"("userId", "action", "createdAt");

-- Verify indexes were created
SELECT 
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'roleready'
    AND tablename IN ('base_resumes', 'tailored_versions', 'ai_request_logs')
ORDER BY 
    tablename, indexname;

