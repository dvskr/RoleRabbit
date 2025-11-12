-- CreateTable
CREATE TABLE "job_board_sessions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "sessionData" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_board_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_board_sessions_userId_idx" ON "job_board_sessions"("userId");

-- CreateIndex
CREATE INDEX "job_board_sessions_platform_idx" ON "job_board_sessions"("platform");

-- CreateIndex
CREATE INDEX "job_board_sessions_expiresAt_idx" ON "job_board_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "job_board_sessions_userId_platform_key" ON "job_board_sessions"("userId", "platform");
