-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'APPLIED',
    "priority" "JobPriority" DEFAULT 'MEDIUM',
    "appliedDate" TEXT NOT NULL,
    "salary" TEXT,
    "description" TEXT,
    "url" TEXT,
    "notes" TEXT,
    "nextStep" TEXT,
    "nextStepDate" TEXT,
    "contact" JSONB,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "companySize" TEXT,
    "industry" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_notes" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "interviewer" TEXT,
    "notes" TEXT NOT NULL,
    "questions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "feedback" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_offers" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "equity" TEXT,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'initial',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_insights" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_contacts" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "date" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_notes" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_reminders" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
    "type" TEXT NOT NULL DEFAULT 'other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_views" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "columns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_attachments" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "attachmentType" TEXT NOT NULL DEFAULT 'other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_userId_idx" ON "jobs"("userId");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_priority_idx" ON "jobs"("priority");

-- CreateIndex
CREATE INDEX "jobs_company_idx" ON "jobs"("company");

-- CreateIndex
CREATE INDEX "jobs_appliedDate_idx" ON "jobs"("appliedDate");

-- CreateIndex
CREATE INDEX "jobs_deletedAt_idx" ON "jobs"("deletedAt");

-- CreateIndex
CREATE INDEX "jobs_isFavorite_idx" ON "jobs"("isFavorite");

-- CreateIndex
CREATE INDEX "interview_notes_jobId_idx" ON "interview_notes"("jobId");

-- CreateIndex
CREATE INDEX "interview_notes_userId_idx" ON "interview_notes"("userId");

-- CreateIndex
CREATE INDEX "interview_notes_date_idx" ON "interview_notes"("date");

-- CreateIndex
CREATE INDEX "salary_offers_jobId_idx" ON "salary_offers"("jobId");

-- CreateIndex
CREATE INDEX "salary_offers_userId_idx" ON "salary_offers"("userId");

-- CreateIndex
CREATE INDEX "salary_offers_status_idx" ON "salary_offers"("status");

-- CreateIndex
CREATE INDEX "company_insights_jobId_idx" ON "company_insights"("jobId");

-- CreateIndex
CREATE INDEX "company_insights_userId_idx" ON "company_insights"("userId");

-- CreateIndex
CREATE INDEX "company_insights_type_idx" ON "company_insights"("type");

-- CreateIndex
CREATE INDEX "referral_contacts_jobId_idx" ON "referral_contacts"("jobId");

-- CreateIndex
CREATE INDEX "referral_contacts_userId_idx" ON "referral_contacts"("userId");

-- CreateIndex
CREATE INDEX "referral_contacts_contacted_idx" ON "referral_contacts"("contacted");

-- CreateIndex
CREATE INDEX "job_notes_jobId_idx" ON "job_notes"("jobId");

-- CreateIndex
CREATE INDEX "job_notes_userId_idx" ON "job_notes"("userId");

-- CreateIndex
CREATE INDEX "job_notes_category_idx" ON "job_notes"("category");

-- CreateIndex
CREATE INDEX "job_reminders_jobId_idx" ON "job_reminders"("jobId");

-- CreateIndex
CREATE INDEX "job_reminders_userId_idx" ON "job_reminders"("userId");

-- CreateIndex
CREATE INDEX "job_reminders_dueDate_idx" ON "job_reminders"("dueDate");

-- CreateIndex
CREATE INDEX "job_reminders_completed_idx" ON "job_reminders"("completed");

-- CreateIndex
CREATE INDEX "saved_views_userId_idx" ON "saved_views"("userId");

-- CreateIndex
CREATE INDEX "job_attachments_jobId_idx" ON "job_attachments"("jobId");

-- CreateIndex
CREATE INDEX "job_attachments_userId_idx" ON "job_attachments"("userId");

-- CreateIndex
CREATE INDEX "job_attachments_fileId_idx" ON "job_attachments"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "job_attachments_jobId_fileId_key" ON "job_attachments"("jobId", "fileId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_notes" ADD CONSTRAINT "interview_notes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_notes" ADD CONSTRAINT "interview_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_offers" ADD CONSTRAINT "salary_offers_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_offers" ADD CONSTRAINT "salary_offers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_insights" ADD CONSTRAINT "company_insights_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_insights" ADD CONSTRAINT "company_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_contacts" ADD CONSTRAINT "referral_contacts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_contacts" ADD CONSTRAINT "referral_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_notes" ADD CONSTRAINT "job_notes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_notes" ADD CONSTRAINT "job_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_reminders" ADD CONSTRAINT "job_reminders_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_reminders" ADD CONSTRAINT "job_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_views" ADD CONSTRAINT "saved_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_attachments" ADD CONSTRAINT "job_attachments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_attachments" ADD CONSTRAINT "job_attachments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_attachments" ADD CONSTRAINT "job_attachments_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "storage_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
