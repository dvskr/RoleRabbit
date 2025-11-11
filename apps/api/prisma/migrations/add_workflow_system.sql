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

-- Workflow (Main workflow definition)
CREATE TABLE "workflows" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "color" TEXT,

  -- Trigger configuration
  "triggerType" "WorkflowTriggerType" NOT NULL DEFAULT 'MANUAL',
  "triggerConfig" JSONB,

  -- Workflow definition (nodes and connections)
  "nodes" JSONB NOT NULL DEFAULT '[]'::JSONB,
  "connections" JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Status
  "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "isTemplate" BOOLEAN NOT NULL DEFAULT FALSE,
  "templateCategory" TEXT,

  -- Execution settings
  "maxConcurrentExecutions" INTEGER DEFAULT 1,
  "timeoutSeconds" INTEGER DEFAULT 300,
  "retryOnFailure" BOOLEAN DEFAULT TRUE,
  "maxRetries" INTEGER DEFAULT 3,

  -- Statistics
  "totalExecutions" INTEGER DEFAULT 0,
  "successfulExecutions" INTEGER DEFAULT 0,
  "failedExecutions" INTEGER DEFAULT 0,
  "lastExecutedAt" TIMESTAMP,

  -- Metadata
  "tags" TEXT[],
  "metadata" JSONB,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "workflows_user_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- WorkflowExecution (Execution history)
CREATE TABLE "workflow_executions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "workflowId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  -- Execution details
  "status" "WorkflowExecutionStatus" NOT NULL DEFAULT 'QUEUED',
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "duration" INTEGER, -- milliseconds

  -- Input/Output
  "input" JSONB,
  "output" JSONB,
  "error" JSONB,

  -- Node execution tracking
  "currentNodeId" TEXT,
  "completedNodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "failedNodes" TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  "triggeredBy" TEXT, -- 'manual', 'schedule', 'webhook', 'event'
  "metadata" JSONB,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "workflow_executions_workflow_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE,
  CONSTRAINT "workflow_executions_user_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- WorkflowExecutionLog (Detailed execution logs)
CREATE TABLE "workflow_execution_logs" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "executionId" TEXT NOT NULL,
  "nodeId" TEXT NOT NULL,
  "nodeName" TEXT,
  "nodeType" "WorkflowNodeType" NOT NULL,

  -- Log details
  "level" TEXT NOT NULL DEFAULT 'info', -- info, warn, error, debug
  "message" TEXT NOT NULL,
  "data" JSONB,

  -- Timing
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "duration" INTEGER, -- milliseconds

  -- Status
  "success" BOOLEAN,
  "error" JSONB,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "workflow_execution_logs_execution_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_executions"("id") ON DELETE CASCADE
);

-- WorkflowSchedule (For scheduled workflows)
CREATE TABLE "workflow_schedules" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "workflowId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  -- Schedule configuration
  "cronExpression" TEXT NOT NULL,
  "timezone" TEXT DEFAULT 'UTC',
  "enabled" BOOLEAN DEFAULT TRUE,

  -- Next execution
  "nextRunAt" TIMESTAMP,
  "lastRunAt" TIMESTAMP,

  -- Limits
  "maxRuns" INTEGER, -- NULL = unlimited
  "runsCompleted" INTEGER DEFAULT 0,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "workflow_schedules_workflow_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE,
  CONSTRAINT "workflow_schedules_user_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- WorkflowWebhook (For webhook-triggered workflows)
CREATE TABLE "workflow_webhooks" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "workflowId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  -- Webhook config
  "webhookUrl" TEXT NOT NULL UNIQUE,
  "secret" TEXT NOT NULL,
  "enabled" BOOLEAN DEFAULT TRUE,

  -- Security
  "allowedIps" TEXT[],
  "requiresAuth" BOOLEAN DEFAULT FALSE,

  -- Statistics
  "totalCalls" INTEGER DEFAULT 0,
  "lastCalledAt" TIMESTAMP,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "workflow_webhooks_workflow_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE,
  CONSTRAINT "workflow_webhooks_user_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Indexes
CREATE INDEX "workflows_userId_idx" ON "workflows"("userId");
CREATE INDEX "workflows_status_idx" ON "workflows"("status");
CREATE INDEX "workflows_isTemplate_idx" ON "workflows"("isTemplate");
CREATE INDEX "workflows_userId_status_idx" ON "workflows"("userId", "status");

CREATE INDEX "workflow_executions_workflowId_idx" ON "workflow_executions"("workflowId");
CREATE INDEX "workflow_executions_userId_idx" ON "workflow_executions"("userId");
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");
CREATE INDEX "workflow_executions_createdAt_idx" ON "workflow_executions"("createdAt" DESC);
CREATE INDEX "workflow_executions_workflowId_status_idx" ON "workflow_executions"("workflowId", "status");

CREATE INDEX "workflow_execution_logs_executionId_idx" ON "workflow_execution_logs"("executionId");
CREATE INDEX "workflow_execution_logs_createdAt_idx" ON "workflow_execution_logs"("createdAt");

CREATE INDEX "workflow_schedules_workflowId_idx" ON "workflow_schedules"("workflowId");
CREATE INDEX "workflow_schedules_nextRunAt_idx" ON "workflow_schedules"("nextRunAt");
CREATE INDEX "workflow_schedules_enabled_idx" ON "workflow_schedules"("enabled");

CREATE INDEX "workflow_webhooks_workflowId_idx" ON "workflow_webhooks"("workflowId");
CREATE INDEX "workflow_webhooks_enabled_idx" ON "workflow_webhooks"("enabled");
