-- CreateIndex (Partial Unique Index)
-- Ensures each user can only have ONE active conversation, but unlimited archived ones
-- This allows the service code to efficiently find/update the active conversation
CREATE UNIQUE INDEX "ai_agent_conversations_userId_active_key"
ON "ai_agent_conversations"("userId")
WHERE "isActive" = true;
