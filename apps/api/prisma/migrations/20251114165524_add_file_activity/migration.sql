-- CreateTable
CREATE TABLE "file_activities" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_activities_fileId_idx" ON "file_activities"("fileId");

-- CreateIndex
CREATE INDEX "file_activities_userId_idx" ON "file_activities"("userId");

-- CreateIndex
CREATE INDEX "file_activities_action_idx" ON "file_activities"("action");

-- CreateIndex
CREATE INDEX "file_activities_createdAt_idx" ON "file_activities"("createdAt");

-- AddForeignKey
ALTER TABLE "file_activities" ADD CONSTRAINT "file_activities_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "storage_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_activities" ADD CONSTRAINT "file_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
