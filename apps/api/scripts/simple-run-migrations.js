/**
 * Simple Migration Runner
 * Runs SQL migrations directly using Prisma's $queryRawUnsafe
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 RUNNING DATABASE MIGRATIONS');
  console.log('='.repeat(80) + '\n');

  try {
    // Migration 1: Add missing tables
    console.log('📦 Creating resume_templates table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "resume_templates" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "is_premium" BOOLEAN NOT NULL DEFAULT false,
        "color_scheme" TEXT NOT NULL DEFAULT 'blue',
        "preview" TEXT,
        "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ resume_templates table created\n');

    console.log('📦 Creating resume_share_links table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "resume_share_links" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        "base_resume_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires_at" TIMESTAMP(3),
        "password_hash" TEXT,
        "allow_download" BOOLEAN NOT NULL DEFAULT true,
        "view_count" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_accessed_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ resume_share_links table created\n');

    console.log('📦 Creating resume_analytics table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "resume_analytics" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        "resume_id" TEXT NOT NULL UNIQUE,
        "view_count" INTEGER NOT NULL DEFAULT 0,
        "export_count" INTEGER NOT NULL DEFAULT 0,
        "tailor_count" INTEGER NOT NULL DEFAULT 0,
        "share_count" INTEGER NOT NULL DEFAULT 0,
        "last_viewed_at" TIMESTAMP(3),
        "last_exported_at" TIMESTAMP(3),
        "last_shared_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ resume_analytics table created\n');

    console.log('📦 Creating generated_documents table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "generated_documents" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "base_resume_id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "template_id" TEXT,
        "data" JSONB NOT NULL DEFAULT '{}',
        "storage_path" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ generated_documents table created\n');

    console.log('📦 Creating indexes...');
    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_resume_templates_category" ON "resume_templates"("category")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_resume_templates_is_premium" ON "resume_templates"("is_premium")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_resume_share_links_token" ON "resume_share_links"("token")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_resume_share_links_base_resume_id" ON "resume_share_links"("base_resume_id")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_resume_analytics_resume_id" ON "resume_analytics"("resume_id")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_generated_documents_user_id" ON "generated_documents"("user_id")`);
      console.log('✅ Indexes created\n');
    } catch (indexError) {
      console.log('⚠️  Some indexes may already exist or failed to create - continuing...\n');
    }

    console.log('📦 Inserting default templates...');
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "resume_templates" ("id", "name", "category", "description", "is_premium", "color_scheme", "preview", "features", "tags")
        VALUES
          ('modern-professional', 'Modern Professional', 'professional', 'Clean and modern design perfect for tech and corporate roles', false, 'blue', '/templates/modern-professional.png', ARRAY['ATS-friendly', 'Single column', 'Bold headers'], ARRAY['modern', 'professional', 'ats']),
          ('classic-elegant', 'Classic Elegant', 'traditional', 'Timeless design suitable for traditional industries', false, 'black', '/templates/classic-elegant.png', ARRAY['Traditional layout', 'Serif fonts', 'Conservative'], ARRAY['classic', 'elegant', 'traditional']),
          ('minimalist-clean', 'Minimalist Clean', 'minimalist', 'Less is more with this ultra-clean design', false, 'gray', '/templates/minimalist-clean.png', ARRAY['Minimal design', 'Lots of whitespace', 'Easy to read'], ARRAY['minimalist', 'clean', 'simple']),
          ('tech-modern', 'Tech Modern', 'tech', 'Perfect for software engineers and tech professionals', false, 'teal', '/templates/tech-modern.png', ARRAY['Tech-focused', 'Modern', 'Code-friendly'], ARRAY['tech', 'software', 'engineering']),
          ('ats-optimized', 'ATS Optimized', 'ats', 'Maximum ATS compatibility with proven format', false, 'blue', '/templates/ats-optimized.png', ARRAY['ATS-optimized', 'Simple format', 'High pass rate'], ARRAY['ats', 'optimized', 'simple'])
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('✅ Default templates inserted\n');
    } catch (insertError) {
      console.log('⚠️  Templates may already exist or failed to insert - continuing...\n');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    // Check if error is because objects already exist
    if (error.message?.includes('already exists') || error.code === '42P07') {
      console.log('ℹ️  Tables already exist - skipping creation\n');
      console.log('✅ Migration check completed\n');
      process.exit(0);
    }

    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

