// Apply vector embeddings migration
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('\n=== Applying Migration: add_vector_embeddings ===\n');
  
  try {
    const migrationPath = path.join(__dirname, 'prisma/migrations/20251111135153_add_vector_embeddings/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Reading migration file...');
    console.log(`File size: ${sql.length} characters\n`);
    
    console.log('Executing migration SQL...');
    
    // Split the SQL file into individual statements
    // PostgreSQL can't execute multiple statements in one $executeRawUnsafe call
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
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
            console.log(`✅ [${executed}/${statements.length}] Created table`);
          } else if (statement.includes('CREATE INDEX')) {
            console.log(`✅ [${executed}/${statements.length}] Created index`);
          } else if (statement.includes('CREATE FUNCTION')) {
            console.log(`✅ [${executed}/${statements.length}] Created function`);
          } else if (statement.includes('CREATE TRIGGER')) {
            console.log(`✅ [${executed}/${statements.length}] Created trigger`);
          } else if (statement.includes('CREATE VIEW')) {
            console.log(`✅ [${executed}/${statements.length}] Created view`);
          } else if (statement.includes('COMMENT ON')) {
            // Silent for comments
          } else {
            console.log(`✅ [${executed}/${statements.length}] Executed statement`);
          }
        } catch (error) {
          // If error is "already exists", it's okay (idempotent)
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            console.log(`⚠️  [${executed}/${statements.length}] Skipped (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log(`\n✅ Migration completed successfully! (${executed} statements executed)\n`);
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

