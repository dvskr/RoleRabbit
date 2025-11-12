-- CreateEnum
CREATE TYPE "JobBoardPlatform" AS ENUM ('LINKEDIN', 'INDEED', 'GLASSDOOR', 'ZIPRECRUITER', 'MONSTER', 'DICE', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VIEWED', 'IN_REVIEW', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "job_board_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "JobBoardPlatform" NOT NULL,
    "email" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVerified" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastConnectedAt" TIMESTAMP(3),
    "connectionError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_board_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT,
    "aiAgentTaskId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobUrl" TEXT,
    "jobDescription" TEXT,
    "location" TEXT,
    "salary" TEXT,
    "jobType" TEXT,
    "platform" "JobBoardPlatform" NOT NULL,
    "externalJobId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "appliedAt" TIMESTAMP(3),
    "lastStatusUpdate" TIMESTAMP(3),
    "resumeFileId" TEXT,
    "coverLetterFileId" TEXT,
    "resumeData" JSONB,
    "coverLetterData" JSONB,
    "atsScore" INTEGER,
    "atsBreakdown" JSONB,
    "isAutoApplied" BOOLEAN NOT NULL DEFAULT false,
    "applicationMethod" TEXT,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_history" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_board_credentials_userId_idx" ON "job_board_credentials"("userId");

-- CreateIndex
CREATE INDEX "job_board_credentials_platform_idx" ON "job_board_credentials"("platform");

-- CreateIndex
CREATE INDEX "job_board_credentials_isActive_idx" ON "job_board_credentials"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "job_board_credentials_userId_platform_email_key" ON "job_board_credentials"("userId", "platform", "email");

-- CreateIndex
CREATE INDEX "job_applications_userId_status_idx" ON "job_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "job_applications_userId_createdAt_idx" ON "job_applications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE INDEX "job_applications_platform_idx" ON "job_applications"("platform");

-- CreateIndex
CREATE INDEX "job_applications_credentialId_idx" ON "job_applications"("credentialId");

-- CreateIndex
CREATE INDEX "job_applications_aiAgentTaskId_idx" ON "job_applications"("aiAgentTaskId");

-- CreateIndex
CREATE INDEX "job_applications_appliedAt_idx" ON "job_applications"("appliedAt");

-- CreateIndex
CREATE INDEX "application_status_history_applicationId_idx" ON "application_status_history"("applicationId");

-- CreateIndex
CREATE INDEX "application_status_history_createdAt_idx" ON "application_status_history"("createdAt");

-- AddForeignKey
ALTER TABLE "job_board_credentials" ADD CONSTRAINT "job_board_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "job_board_credentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_aiAgentTaskId_fkey" FOREIGN KEY ("aiAgentTaskId") REFERENCES "ai_agent_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_resumeFileId_fkey" FOREIGN KEY ("resumeFileId") REFERENCES "storage_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_coverLetterFileId_fkey" FOREIGN KEY ("coverLetterFileId") REFERENCES "storage_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
