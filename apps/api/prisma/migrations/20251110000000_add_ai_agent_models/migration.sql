-- CreateEnum
CREATE TYPE "AIAgentTaskType" AS ENUM ('RESUME_GENERATION', 'COVER_LETTER_GENERATION', 'JOB_APPLICATION', 'COMPANY_RESEARCH', 'INTERVIEW_PREP', 'BULK_PROCESSING', 'JOB_TRACKER_UPDATE', 'COLD_EMAIL');

-- CreateEnum
CREATE TYPE "AIAgentTaskStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ai_agent_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AIAgentTaskType" NOT NULL,
    "status" "AIAgentTaskStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "totalSteps" INTEGER,
    "completedStep" INTEGER,
    "jobTitle" TEXT,
    "company" TEXT,
    "jobUrl" TEXT,
    "jobDescription" TEXT,
    "baseResumeId" TEXT,
    "tone" TEXT DEFAULT 'professional',
    "length" TEXT DEFAULT 'medium',
    "resultData" JSONB,
    "atsScore" INTEGER,
    "atsBreakdown" JSONB,
    "outputFiles" JSONB,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agent_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoFillEnabled" BOOLEAN NOT NULL DEFAULT true,
    "multiResumeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bulkProcessingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "jobTrackerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "coldEmailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "interviewPrepEnabled" BOOLEAN NOT NULL DEFAULT true,
    "companyResearchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultTone" TEXT NOT NULL DEFAULT 'professional',
    "defaultLength" TEXT NOT NULL DEFAULT 'medium',
    "maxConcurrentTasks" INTEGER NOT NULL DEFAULT 3,
    "autoAddToJobTracker" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnTaskComplete" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnTaskFail" BOOLEAN NOT NULL DEFAULT true,
    "atsScoreThreshold" INTEGER NOT NULL DEFAULT 80,
    "autoRetryFailedTasks" BOOLEAN NOT NULL DEFAULT true,
    "saveAllGeneratedResumes" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agent_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agent_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskType" "AIAgentTaskType" NOT NULL,
    "taskIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_agent_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agent_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agent_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agent_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "resumesGenerated" INTEGER NOT NULL DEFAULT 0,
    "coverLettersCreated" INTEGER NOT NULL DEFAULT 0,
    "applicationsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "companiesResearched" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "interviewPrepsCreated" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksFailed" INTEGER NOT NULL DEFAULT 0,
    "averageAtsScore" DOUBLE PRECISION,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "aiCostUsd" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agent_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_agent_tasks_userId_status_idx" ON "ai_agent_tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "ai_agent_tasks_userId_createdAt_idx" ON "ai_agent_tasks"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_agent_tasks_status_idx" ON "ai_agent_tasks"("status");

-- CreateIndex
CREATE INDEX "ai_agent_tasks_type_idx" ON "ai_agent_tasks"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agent_settings_userId_key" ON "ai_agent_settings"("userId");

-- CreateIndex
CREATE INDEX "ai_agent_settings_userId_idx" ON "ai_agent_settings"("userId");

-- CreateIndex
CREATE INDEX "ai_agent_history_userId_completedAt_idx" ON "ai_agent_history"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "ai_agent_history_taskType_idx" ON "ai_agent_history"("taskType");

-- CreateIndex
CREATE INDEX "ai_agent_conversations_userId_isActive_idx" ON "ai_agent_conversations"("userId", "isActive");

-- CreateIndex
CREATE INDEX "ai_agent_conversations_updatedAt_idx" ON "ai_agent_conversations"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agent_metrics_userId_date_key" ON "ai_agent_metrics"("userId", "date");

-- CreateIndex
CREATE INDEX "ai_agent_metrics_userId_date_idx" ON "ai_agent_metrics"("userId", "date");

-- AddForeignKey
ALTER TABLE "ai_agent_tasks" ADD CONSTRAINT "ai_agent_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agent_settings" ADD CONSTRAINT "ai_agent_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agent_history" ADD CONSTRAINT "ai_agent_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agent_conversations" ADD CONSTRAINT "ai_agent_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agent_metrics" ADD CONSTRAINT "ai_agent_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
