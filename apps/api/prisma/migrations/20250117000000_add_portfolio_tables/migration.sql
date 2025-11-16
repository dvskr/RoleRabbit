-- CreateEnum for Portfolio Status
DO $$ BEGIN
 CREATE TYPE "roleready"."PortfolioStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Portfolio Visibility
DO $$ BEGIN
 CREATE TYPE "roleready"."PortfolioVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Deployment Status
DO $$ BEGIN
 CREATE TYPE "roleready"."DeploymentStatus" AS ENUM ('PENDING', 'BUILDING', 'DEPLOYED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Abuse Reason
DO $$ BEGIN
 CREATE TYPE "roleready"."AbuseReason" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'COPYRIGHT_VIOLATION', 'MALWARE', 'PHISHING', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Report Status
DO $$ BEGIN
 CREATE TYPE "roleready"."ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Review Status
DO $$ BEGIN
 CREATE TYPE "roleready"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CHANGES');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Review Priority
DO $$ BEGIN
 CREATE TYPE "roleready"."ReviewPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Deletion Status
DO $$ BEGIN
 CREATE TYPE "roleready"."DeletionStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable Portfolio
CREATE TABLE IF NOT EXISTS "roleready"."Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "templateId" TEXT,
    "theme" JSONB,
    "seoSettings" JSONB,
    "status" "roleready"."PortfolioStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "roleready"."PortfolioVisibility" NOT NULL DEFAULT 'PRIVATE',
    "publishedAt" TIMESTAMP(3),
    "customDomain" TEXT,
    "subdomain" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable PortfolioTemplate
CREATE TABLE IF NOT EXISTS "roleready"."PortfolioTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "category" TEXT,
    "structure" JSONB NOT NULL,
    "styles" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable PortfolioVersion
CREATE TABLE IF NOT EXISTS "roleready"."PortfolioVersion" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "changeLog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable PortfolioShare
CREATE TABLE IF NOT EXISTS "roleready"."PortfolioShare" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxViews" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable PortfolioAnalytics
CREATE TABLE IF NOT EXISTS "roleready"."PortfolioAnalytics" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "referrer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,

    CONSTRAINT "PortfolioAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable PortfolioDeployment
CREATE TABLE IF NOT EXISTS "roleready"."PortfolioDeployment" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "roleready"."DeploymentStatus" NOT NULL,
    "deployedAt" TIMESTAMP(3),
    "buildLog" TEXT,
    "errorLog" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable CustomDomain
CREATE TABLE IF NOT EXISTS "roleready"."CustomDomain" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sslEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dnsRecords" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable PortfolioMedia
CREATE TABLE IF NOT EXISTS "roleready"."PortfolioMedia" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "thumbnail" TEXT,
    "metadata" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable AbuseReport
CREATE TABLE IF NOT EXISTS "roleready"."AbuseReport" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" "roleready"."AbuseReason" NOT NULL,
    "description" TEXT,
    "status" "roleready"."ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "AbuseReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable ReviewQueue
CREATE TABLE IF NOT EXISTS "roleready"."ReviewQueue" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "priority" "roleready"."ReviewPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "roleready"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderationResult" JSONB,
    "assignedTo" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog
CREATE TABLE IF NOT EXISTS "roleready"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable DeletionRequest
CREATE TABLE IF NOT EXISTS "roleready"."DeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "roleready"."DeletionStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Portfolio_slug_key" ON "roleready"."Portfolio"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Portfolio_customDomain_key" ON "roleready"."Portfolio"("customDomain");
CREATE UNIQUE INDEX IF NOT EXISTS "Portfolio_subdomain_key" ON "roleready"."Portfolio"("subdomain");
CREATE INDEX IF NOT EXISTS "Portfolio_userId_idx" ON "roleready"."Portfolio"("userId");
CREATE INDEX IF NOT EXISTS "Portfolio_slug_idx" ON "roleready"."Portfolio"("slug");
CREATE INDEX IF NOT EXISTS "Portfolio_status_idx" ON "roleready"."Portfolio"("status");
CREATE INDEX IF NOT EXISTS "Portfolio_publishedAt_idx" ON "roleready"."Portfolio"("publishedAt");
CREATE INDEX IF NOT EXISTS "Portfolio_userId_status_idx" ON "roleready"."Portfolio"("userId", "status");
CREATE INDEX IF NOT EXISTS "Portfolio_userId_updatedAt_idx" ON "roleready"."Portfolio"("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "PortfolioTemplate_category_idx" ON "roleready"."PortfolioTemplate"("category");
CREATE INDEX IF NOT EXISTS "PortfolioTemplate_isPublic_idx" ON "roleready"."PortfolioTemplate"("isPublic");
CREATE INDEX IF NOT EXISTS "PortfolioTemplate_rating_idx" ON "roleready"."PortfolioTemplate"("rating");
CREATE INDEX IF NOT EXISTS "PortfolioTemplate_downloads_idx" ON "roleready"."PortfolioTemplate"("downloads");

CREATE UNIQUE INDEX IF NOT EXISTS "PortfolioVersion_portfolioId_version_key" ON "roleready"."PortfolioVersion"("portfolioId", "version");
CREATE INDEX IF NOT EXISTS "PortfolioVersion_portfolioId_idx" ON "roleready"."PortfolioVersion"("portfolioId");
CREATE INDEX IF NOT EXISTS "PortfolioVersion_createdBy_idx" ON "roleready"."PortfolioVersion"("createdBy");
CREATE INDEX IF NOT EXISTS "PortfolioVersion_createdAt_idx" ON "roleready"."PortfolioVersion"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "PortfolioShare_token_key" ON "roleready"."PortfolioShare"("token");
CREATE INDEX IF NOT EXISTS "PortfolioShare_token_idx" ON "roleready"."PortfolioShare"("token");
CREATE INDEX IF NOT EXISTS "PortfolioShare_portfolioId_idx" ON "roleready"."PortfolioShare"("portfolioId");
CREATE INDEX IF NOT EXISTS "PortfolioShare_isActive_idx" ON "roleready"."PortfolioShare"("isActive");
CREATE INDEX IF NOT EXISTS "PortfolioShare_expiresAt_idx" ON "roleready"."PortfolioShare"("expiresAt");

CREATE INDEX IF NOT EXISTS "PortfolioAnalytics_portfolioId_date_idx" ON "roleready"."PortfolioAnalytics"("portfolioId", "date");
CREATE INDEX IF NOT EXISTS "PortfolioAnalytics_date_idx" ON "roleready"."PortfolioAnalytics"("date");
CREATE INDEX IF NOT EXISTS "PortfolioAnalytics_country_idx" ON "roleready"."PortfolioAnalytics"("country");

CREATE INDEX IF NOT EXISTS "PortfolioDeployment_portfolioId_idx" ON "roleready"."PortfolioDeployment"("portfolioId");
CREATE INDEX IF NOT EXISTS "PortfolioDeployment_status_idx" ON "roleready"."PortfolioDeployment"("status");
CREATE INDEX IF NOT EXISTS "PortfolioDeployment_createdAt_idx" ON "roleready"."PortfolioDeployment"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "CustomDomain_domain_key" ON "roleready"."CustomDomain"("domain");
CREATE INDEX IF NOT EXISTS "CustomDomain_domain_idx" ON "roleready"."CustomDomain"("domain");
CREATE INDEX IF NOT EXISTS "CustomDomain_portfolioId_idx" ON "roleready"."CustomDomain"("portfolioId");
CREATE INDEX IF NOT EXISTS "CustomDomain_isVerified_idx" ON "roleready"."CustomDomain"("isVerified");

CREATE INDEX IF NOT EXISTS "PortfolioMedia_portfolioId_idx" ON "roleready"."PortfolioMedia"("portfolioId");
CREATE INDEX IF NOT EXISTS "PortfolioMedia_type_idx" ON "roleready"."PortfolioMedia"("type");

CREATE INDEX IF NOT EXISTS "AbuseReport_portfolioId_idx" ON "roleready"."AbuseReport"("portfolioId");
CREATE INDEX IF NOT EXISTS "AbuseReport_status_idx" ON "roleready"."AbuseReport"("status");
CREATE INDEX IF NOT EXISTS "AbuseReport_reportedBy_idx" ON "roleready"."AbuseReport"("reportedBy");
CREATE INDEX IF NOT EXISTS "AbuseReport_createdAt_idx" ON "roleready"."AbuseReport"("createdAt");

CREATE INDEX IF NOT EXISTS "ReviewQueue_portfolioId_idx" ON "roleready"."ReviewQueue"("portfolioId");
CREATE INDEX IF NOT EXISTS "ReviewQueue_status_idx" ON "roleready"."ReviewQueue"("status");
CREATE INDEX IF NOT EXISTS "ReviewQueue_priority_idx" ON "roleready"."ReviewQueue"("priority");
CREATE INDEX IF NOT EXISTS "ReviewQueue_assignedTo_idx" ON "roleready"."ReviewQueue"("assignedTo");
CREATE INDEX IF NOT EXISTS "ReviewQueue_createdAt_idx" ON "roleready"."ReviewQueue"("createdAt");

CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "roleready"."AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "roleready"."AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_resource_idx" ON "roleready"."AuditLog"("resource");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "roleready"."AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "roleready"."AuditLog"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "DeletionRequest_userId_idx" ON "roleready"."DeletionRequest"("userId");
CREATE INDEX IF NOT EXISTS "DeletionRequest_status_idx" ON "roleready"."DeletionRequest"("status");
CREATE INDEX IF NOT EXISTS "DeletionRequest_scheduledFor_idx" ON "roleready"."DeletionRequest"("scheduledFor");

-- AddForeignKey
ALTER TABLE "roleready"."Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "roleready"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roleready"."Portfolio" ADD CONSTRAINT "Portfolio_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "roleready"."PortfolioTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "roleready"."PortfolioVersion" ADD CONSTRAINT "PortfolioVersion_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "roleready"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roleready"."PortfolioVersion" ADD CONSTRAINT "PortfolioVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "roleready"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roleready"."PortfolioShare" ADD CONSTRAINT "PortfolioShare_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "roleready"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roleready"."PortfolioAnalytics" ADD CONSTRAINT "PortfolioAnalytics_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "roleready"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roleready"."PortfolioDeployment" ADD CONSTRAINT "PortfolioDeployment_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "roleready"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roleready"."CustomDomain" ADD CONSTRAINT "CustomDomain_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "roleready"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roleready"."PortfolioMedia" ADD CONSTRAINT "PortfolioMedia_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "roleready"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roleready"."AbuseReport" ADD CONSTRAINT "AbuseReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "roleready"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roleready"."AbuseReport" ADD CONSTRAINT "AbuseReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "roleready"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "roleready"."ReviewQueue" ADD CONSTRAINT "ReviewQueue_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "roleready"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "roleready"."ReviewQueue" ADD CONSTRAINT "ReviewQueue_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "roleready"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "roleready"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "roleready"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roleready"."DeletionRequest" ADD CONSTRAINT "DeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "roleready"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

