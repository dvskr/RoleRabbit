/*
  Warnings:

  - You are about to drop the column `type` on the `ai_agent_tasks` table. All the data in the column will be lost.
  - Added the required column `taskType` to the `ai_agent_tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "details" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "job_descriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "company" TEXT,
    "position" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ai_agent_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "parameters" TEXT,
    "description" TEXT,
    "result" TEXT,
    "error" TEXT,
    "startedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ai_agent_tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ai_agent_tasks" ("agentId", "completedAt", "createdAt", "description", "error", "id", "result", "status", "userId") SELECT "agentId", "completedAt", "createdAt", "description", "error", "id", "result", "status", "userId" FROM "ai_agent_tasks";
DROP TABLE "ai_agent_tasks";
ALTER TABLE "new_ai_agent_tasks" RENAME TO "ai_agent_tasks";
CREATE INDEX "ai_agent_tasks_agentId_idx" ON "ai_agent_tasks"("agentId");
CREATE INDEX "ai_agent_tasks_userId_idx" ON "ai_agent_tasks"("userId");
CREATE INDEX "ai_agent_tasks_status_idx" ON "ai_agent_tasks"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "job_descriptions_userId_idx" ON "job_descriptions"("userId");

-- CreateIndex
CREATE INDEX "job_descriptions_jobId_idx" ON "job_descriptions"("jobId");

-- CreateIndex
CREATE INDEX "analytics_snapshots_userId_idx" ON "analytics_snapshots"("userId");

-- CreateIndex
CREATE INDEX "analytics_snapshots_type_idx" ON "analytics_snapshots"("type");

-- CreateIndex
CREATE INDEX "analytics_snapshots_period_idx" ON "analytics_snapshots"("period");
