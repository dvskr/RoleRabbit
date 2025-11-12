-- DropForeignKey
ALTER TABLE "workflow_webhooks" DROP CONSTRAINT IF EXISTS "workflow_webhooks_userId_fkey";
ALTER TABLE "workflow_webhooks" DROP CONSTRAINT IF EXISTS "workflow_webhooks_workflowId_fkey";
ALTER TABLE "workflow_schedules" DROP CONSTRAINT IF EXISTS "workflow_schedules_userId_fkey";
ALTER TABLE "workflow_schedules" DROP CONSTRAINT IF EXISTS "workflow_schedules_workflowId_fkey";
ALTER TABLE "workflow_execution_logs" DROP CONSTRAINT IF EXISTS "workflow_execution_logs_executionId_fkey";
ALTER TABLE "workflow_executions" DROP CONSTRAINT IF EXISTS "workflow_executions_userId_fkey";
ALTER TABLE "workflow_executions" DROP CONSTRAINT IF EXISTS "workflow_executions_workflowId_fkey";
ALTER TABLE "workflows" DROP CONSTRAINT IF EXISTS "workflows_userId_fkey";
ALTER TABLE "application_status_history" DROP CONSTRAINT IF EXISTS "application_status_history_applicationId_fkey";
ALTER TABLE "job_applications" DROP CONSTRAINT IF EXISTS "job_applications_aiAgentTaskId_fkey";
ALTER TABLE "job_applications" DROP CONSTRAINT IF EXISTS "job_applications_coverLetterFileId_fkey";
ALTER TABLE "job_applications" DROP CONSTRAINT IF EXISTS "job_applications_credentialId_fkey";
ALTER TABLE "job_applications" DROP CONSTRAINT IF EXISTS "job_applications_resumeFileId_fkey";
ALTER TABLE "job_applications" DROP CONSTRAINT IF EXISTS "job_applications_userId_fkey";
ALTER TABLE "job_board_credentials" DROP CONSTRAINT IF EXISTS "job_board_credentials_userId_fkey";
ALTER TABLE "ai_agent_metrics" DROP CONSTRAINT IF EXISTS "ai_agent_metrics_userId_fkey";
ALTER TABLE "ai_agent_conversations" DROP CONSTRAINT IF EXISTS "ai_agent_conversations_userId_fkey";
ALTER TABLE "ai_agent_history" DROP CONSTRAINT IF EXISTS "ai_agent_history_userId_fkey";
ALTER TABLE "ai_agent_settings" DROP CONSTRAINT IF EXISTS "ai_agent_settings_userId_fkey";
ALTER TABLE "ai_agent_tasks" DROP CONSTRAINT IF EXISTS "ai_agent_tasks_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "workflow_webhooks";
DROP TABLE IF EXISTS "workflow_schedules";
DROP TABLE IF EXISTS "workflow_execution_logs";
DROP TABLE IF EXISTS "workflow_executions";
DROP TABLE IF EXISTS "workflows";
DROP TABLE IF EXISTS "application_status_history";
DROP TABLE IF EXISTS "job_applications";
DROP TABLE IF EXISTS "job_board_credentials";
DROP TABLE IF EXISTS "job_board_sessions";
DROP TABLE IF EXISTS "ai_agent_metrics";
DROP TABLE IF EXISTS "ai_agent_conversations";
DROP TABLE IF EXISTS "ai_agent_history";
DROP TABLE IF EXISTS "ai_agent_settings";
DROP TABLE IF EXISTS "ai_agent_tasks";

-- AlterTable - Remove columns from users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "aiAgentsRunsCount";
ALTER TABLE "users" DROP COLUMN IF EXISTS "aiAgentsRunsResetAt";
ALTER TABLE "users" DROP COLUMN IF EXISTS "workflowsRunsCount";
ALTER TABLE "users" DROP COLUMN IF EXISTS "workflowsRunsResetAt";

-- DropEnum
DROP TYPE IF EXISTS "WorkflowNodeType";
DROP TYPE IF EXISTS "WorkflowExecutionStatus";
DROP TYPE IF EXISTS "WorkflowStatus";
DROP TYPE IF EXISTS "WorkflowTriggerType";
DROP TYPE IF EXISTS "ApplicationStatus";
DROP TYPE IF EXISTS "JobBoardPlatform";
DROP TYPE IF EXISTS "AIAgentTaskStatus";
DROP TYPE IF EXISTS "AIAgentTaskType";
