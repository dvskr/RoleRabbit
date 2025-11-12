-- Create tailoring analytics table
CREATE TABLE IF NOT EXISTS "tailoring_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "scoreBefore" DOUBLE PRECISION NOT NULL,
    "scoreAfter" DOUBLE PRECISION NOT NULL,
    "improvement" DOUBLE PRECISION NOT NULL,
    "improvementRate" DOUBLE PRECISION NOT NULL,
    "targetScore" DOUBLE PRECISION NOT NULL,
    "targetMet" BOOLEAN NOT NULL,
    "tokensUsed" INTEGER,
    "durationMs" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION DEFAULT 0,
    "warningCount" INTEGER DEFAULT 0,
    "changeCount" INTEGER DEFAULT 0,
    "keywordsAddedCount" INTEGER DEFAULT 0,
    "costEstimate" DOUBLE PRECISION DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tailoring_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tailoring_analytics_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "base_resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "tailoring_analytics_userId_idx" ON "tailoring_analytics"("userId");
CREATE INDEX IF NOT EXISTS "tailoring_analytics_timestamp_idx" ON "tailoring_analytics"("timestamp");
CREATE INDEX IF NOT EXISTS "tailoring_analytics_mode_idx" ON "tailoring_analytics"("mode");
CREATE INDEX IF NOT EXISTS "tailoring_analytics_userId_timestamp_idx" ON "tailoring_analytics"("userId", "timestamp");

