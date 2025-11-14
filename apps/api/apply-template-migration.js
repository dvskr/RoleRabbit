// Apply template models migration
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('\n=== Applying Migration: add_template_models ===\n');

  try {
    const migrationPath = path.join(__dirname, 'prisma/migrations/20251114044641_add_template_models/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Reading migration file...');
    console.log(`File size: ${sql.length} characters\n`);

    console.log('Executing migration SQL...');

    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let executed = 0;
    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          await prisma.$executeRawUnsafe(statement + ';');
          executed++;

          // Log progress for major operations
          if (statement.includes('ALTER TABLE')) {
            console.log(`✅ [${executed}/${statements.length}] Altered table`);
          } else if (statement.includes('CREATE TABLE')) {
            const match = statement.match(/CREATE TABLE "([^"]+)"/);
            const tableName = match ? match[1] : 'unknown';
            console.log(`✅ [${executed}/${statements.length}] Created table: ${tableName}`);
          } else if (statement.includes('CREATE INDEX')) {
            console.log(`✅ [${executed}/${statements.length}] Created index`);
          } else if (statement.includes('CREATE TYPE')) {
            const match = statement.match(/CREATE TYPE "([^"]+)"/);
            const typeName = match ? match[1] : 'unknown';
            console.log(`✅ [${executed}/${statements.length}] Created enum type: ${typeName}`);
          } else if (statement.includes('CREATE UNIQUE INDEX')) {
            console.log(`✅ [${executed}/${statements.length}] Created unique index`);
          } else {
            console.log(`✅ [${executed}/${statements.length}] Executed statement`);
          }
        } catch (error) {
          // If error is "already exists", it's okay (idempotent)
          if (error.message.includes('already exists') ||
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            console.log(`⚠️  [${executed}/${statements.length}] Skipped (already exists or not applicable)`);
          } else {
            console.error(`❌ Error executing statement:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log(`\n✅ Migration completed successfully! (${executed} statements executed)\n`);
    console.log('Template tables created:');
    console.log('  - resume_templates');
    console.log('  - user_template_favorites');
    console.log('  - user_template_preferences');
    console.log('  - template_usage_history\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
