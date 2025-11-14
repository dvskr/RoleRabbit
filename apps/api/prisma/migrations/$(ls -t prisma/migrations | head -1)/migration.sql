-- Add Template Enums
CREATE TYPE "TemplateCategory" AS ENUM ('ATS', 'CREATIVE', 'MODERN', 'CLASSIC', 'EXECUTIVE', 'MINIMAL', 'ACADEMIC', 'TECHNICAL', 'STARTUP', 'FREELANCE');
CREATE TYPE "TemplateDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "TemplateLayout" AS ENUM ('SINGLE_COLUMN', 'TWO_COLUMN', 'HYBRID');
CREATE TYPE "TemplateColorScheme" AS ENUM ('MONOCHROME', 'BLUE', 'GREEN', 'PURPLE', 'RED', 'ORANGE', 'CUSTOM');
CREATE TYPE "TemplateUsageAction" AS ENUM ('PREVIEW', 'DOWNLOAD', 'USE', 'FAVORITE', 'SHARE');

-- CreateTable: ResumeTemplate
CREATE TABLE "resume_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "features" TEXT[],
    "difficulty" "TemplateDifficulty" NOT NULL,
    "industry" TEXT[],
    "layout" "TemplateLayout" NOT NULL,
    "colorScheme" "TemplateColorScheme" NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "author" TEXT NOT NULL DEFAULT 'RoleReady Team',
    "tags" TEXT[],
    "templateData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserTemplateFavorite
CREATE TABLE "user_template_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_template_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserTemplatePreferences
CREATE TABLE "user_template_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filterSettings" JSONB NOT NULL DEFAULT '{}',
    "sortPreference" TEXT NOT NULL DEFAULT 'popular',
    "viewMode" TEXT NOT NULL DEFAULT 'grid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_template_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TemplateUsageHistory
CREATE TABLE "template_usage_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "action" "TemplateUsageAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_usage_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_templates_category_idx" ON "resume_templates"("category");
CREATE INDEX "resume_templates_difficulty_idx" ON "resume_templates"("difficulty");
CREATE INDEX "resume_templates_isPremium_idx" ON "resume_templates"("isPremium");
CREATE INDEX "resume_templates_isActive_idx" ON "resume_templates"("isActive");
CREATE INDEX "resume_templates_rating_idx" ON "resume_templates"("rating");
CREATE INDEX "resume_templates_downloads_idx" ON "resume_templates"("downloads");

CREATE UNIQUE INDEX "user_template_favorites_userId_templateId_key" ON "user_template_favorites"("userId", "templateId");
CREATE INDEX "user_template_favorites_userId_idx" ON "user_template_favorites"("userId");
CREATE INDEX "user_template_favorites_templateId_idx" ON "user_template_favorites"("templateId");

CREATE UNIQUE INDEX "user_template_preferences_userId_key" ON "user_template_preferences"("userId");
CREATE INDEX "user_template_preferences_userId_idx" ON "user_template_preferences"("userId");

CREATE INDEX "template_usage_history_userId_idx" ON "template_usage_history"("userId");
CREATE INDEX "template_usage_history_templateId_idx" ON "template_usage_history"("templateId");
CREATE INDEX "template_usage_history_action_idx" ON "template_usage_history"("action");
CREATE INDEX "template_usage_history_userId_createdAt_idx" ON "template_usage_history"("userId", "createdAt");
CREATE INDEX "template_usage_history_templateId_createdAt_idx" ON "template_usage_history"("templateId", "createdAt");

-- Update generated_documents table to add templateId index
CREATE INDEX "generated_documents_templateId_idx" ON "generated_documents"("templateId");

-- AddForeignKey
ALTER TABLE "user_template_favorites" ADD CONSTRAINT "user_template_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_template_favorites" ADD CONSTRAINT "user_template_favorites_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "resume_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_template_preferences" ADD CONSTRAINT "user_template_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "template_usage_history" ADD CONSTRAINT "template_usage_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "template_usage_history" ADD CONSTRAINT "template_usage_history_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "resume_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "resume_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
