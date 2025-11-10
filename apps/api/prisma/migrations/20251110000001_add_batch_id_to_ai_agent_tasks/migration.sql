-- AlterTable
ALTER TABLE "ai_agent_tasks" ADD COLUMN "batchId" TEXT;

-- CreateIndex
CREATE INDEX "ai_agent_tasks_batchId_idx" ON "ai_agent_tasks"("batchId");
