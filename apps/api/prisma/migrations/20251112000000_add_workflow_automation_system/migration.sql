-- CreateEnum
CREATE TYPE "WorkflowTriggerType" AS ENUM (
  'MANUAL',
  'SCHEDULE',
  'WEBHOOK',
  'EVENT'
);

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "WorkflowExecutionStatus" AS ENUM (
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
);

-- CreateEnum
CREATE TYPE "WorkflowNodeType" AS ENUM (
  'TRIGGER_MANUAL',
  'TRIGGER_SCHEDULE',
  'TRIGGER_WEBHOOK',
  'TRIGGER_EVENT',
  'AI_AGENT_ANALYZE',
  'AI_AGENT_CHAT',
  'AUTO_APPLY_SINGLE',
  'AUTO_APPLY_BULK',
  'RESUME_GENERATE',
  'RESUME_TAILOR',
  'COVER_LETTER_GENERATE',
  'JOB_TRACKER_ADD',
  'JOB_TRACKER_UPDATE',
  'JOB_SEARCH',
  'COMPANY_RESEARCH',
  'EMAIL_SEND',
  'NOTIFICATION_SEND',
  'WEBHOOK_CALL',
  'HTTP_REQUEST',
  'CONDITION_IF',
  'CONDITION_SWITCH',
  'LOOP_FOR_EACH',
  'WAIT_DELAY',
  'WAIT_UNTIL',
  'MERGE_DATA',
  'SPLIT_DATA',
  'TRANSFORM_DATA',
  'FILTER_DATA',
  'DATABASE_QUERY',
  'FILE_READ',
  'FILE_WRITE'
);

-- CreateTable
CREATE TABLE "workflows" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "color" TEXT,
  "triggerType" "WorkflowTriggerType" NOT NULL DEFAULT 'MANUAL',
  "triggerConfig" JSONB,
  "nodes" JSONB NOT NULL DEFAULT '[]'::JSONB,
  "connections" JSONB NOT NULL DEFAULT '[]'::JSONB,
  "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "isTemplate" BOOLEAN NOT NULL DEFAULT FALSE,
  "templateCategory" TEXT,
  "maxConcurrentExecutions" INTEGER DEFAULT 1,
  "timeoutSeconds" INTEGER DEFAULT 300,
  "retryOnFailure" BOOLEAN DEFAULT TRUE,
  "maxRetries" INTEGER DEFAULT 3,
  "totalExecutions" INTEGER DEFAULT 0,
  "successfulExecutions" INTEGER DEFAULT 0,
  "failedExecutions" INTEGER DEFAULT 0,
  "lastExecutedAt" TIMESTAMP(3),
  "tags" TEXT[],
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "WorkflowExecutionStatus" NOT NULL DEFAULT 'QUEUED',
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "duration" INTEGER,
  "input" JSONB,
  "output" JSONB,
  "error" JSONB,
  "currentNodeId" TEXT,
  "completedNodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "failedNodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "triggeredBy" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_execution_logs" (
  "id" TEXT NOT NULL,
  "executionId" TEXT NOT NULL,
  "nodeId" TEXT NOT NULL,
  "nodeName" TEXT,
  "nodeType" "WorkflowNodeType" NOT NULL,
  "level" TEXT NOT NULL DEFAULT 'info',
  "message" TEXT NOT NULL,
  "data" JSONB,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "duration" INTEGER,
  "success" BOOLEAN,
  "error" JSONB,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "workflow_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_schedules" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "cronExpression" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "input" JSONB,
  "nextRunAt" TIMESTAMP(3),
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "workflow_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_webhooks" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'POST',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "totalTriggers" INTEGER NOT NULL DEFAULT 0,
  "lastTriggeredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "workflow_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflows_userId_idx" ON "workflows"("userId");

-- CreateIndex
CREATE INDEX "workflows_status_idx" ON "workflows"("status");

-- CreateIndex
CREATE INDEX "workflows_isTemplate_idx" ON "workflows"("isTemplate");

-- CreateIndex
CREATE INDEX "workflows_userId_status_idx" ON "workflows"("userId", "status");

-- CreateIndex
CREATE INDEX "workflow_executions_workflowId_idx" ON "workflow_executions"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_executions_userId_idx" ON "workflow_executions"("userId");

-- CreateIndex
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");

-- CreateIndex
CREATE INDEX "workflow_executions_createdAt_idx" ON "workflow_executions"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "workflow_executions_workflowId_status_idx" ON "workflow_executions"("workflowId", "status");

-- CreateIndex
CREATE INDEX "workflow_execution_logs_executionId_idx" ON "workflow_execution_logs"("executionId");

-- CreateIndex
CREATE INDEX "workflow_execution_logs_timestamp_idx" ON "workflow_execution_logs"("timestamp");

-- CreateIndex
CREATE INDEX "workflow_schedules_workflowId_idx" ON "workflow_schedules"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_schedules_nextRunAt_idx" ON "workflow_schedules"("nextRunAt");

-- CreateIndex
CREATE INDEX "workflow_schedules_isActive_idx" ON "workflow_schedules"("isActive");

-- CreateIndex
CREATE INDEX "workflow_webhooks_workflowId_idx" ON "workflow_webhooks"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_webhooks_isActive_idx" ON "workflow_webhooks"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_webhooks_url_key" ON "workflow_webhooks"("url");

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_execution_logs" ADD CONSTRAINT "workflow_execution_logs_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_schedules" ADD CONSTRAINT "workflow_schedules_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_webhooks" ADD CONSTRAINT "workflow_webhooks_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
