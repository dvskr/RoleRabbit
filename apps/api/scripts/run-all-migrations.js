/**
 * Run All Migrations Script
 * 
 * Executes all SQL migrations in order:
 * 1. Missing tables (ResumeTemplate, ResumeShareLink, etc.)
 * 2. RBAC (user roles, share permissions)
 * 3. PII Encryption (pgcrypto extension)
 * 4. Security Features (2FA, session management, etc.)
 */

const { prisma } = require('../utils/db');
const fs = require('fs');
const path = require('path');

// Use console for logging to avoid circular dependencies
const logger = {
  info: (msg, data) => console.log(msg, data || ''),
  warn: (msg, data) => console.warn(msg, data || ''),
  error: (msg, data) => console.error(msg, data || '')
};

const MIGRATIONS = [
  {
    name: '20251115_add_missing_tables',
    file: '20251115_add_missing_tables.sql',
    description: 'Add ResumeTemplate, ResumeShareLink, ResumeAnalytics, GeneratedDocument tables'
  },
  {
    name: 'add_rbac',
    file: 'add_rbac.sql',
    description: 'Add RBAC (user roles and share permissions)'
  },
  {
    name: 'add_pii_encryption',
    file: 'add_pii_encryption.sql',
    description: 'Enable PII encryption with pgcrypto'
  },
  {
    name: 'add_security_features',
    file: 'add_security_features.sql',
    description: 'Add 2FA, session management, and security features'
  }
];

async function runMigration(migration) {
  const migrationPath = path.join(__dirname, '../prisma/migrations', migration.file);
  
  logger.info(`\n📦 Running migration: ${migration.name}`);
  logger.info(`   Description: ${migration.description}`);
  
  // Check if file exists
  if (!fs.existsSync(migrationPath)) {
    logger.warn(`   ⚠️  Migration file not found: ${migration.file}`);
    return { success: false, error: 'File not found' };
  }
  
  // Read SQL file
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  try {
    // Split SQL into individual statements
    // Remove comments and split by semicolon
    const statements = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove SQL comments
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*')); // Remove empty and block comments
    
    // Execute each statement separately
    for (const statement of statements) {
      if (statement.trim()) {
        await prisma.$executeRawUnsafe(statement);
      }
    }
    
    logger.info(`   ✅ Migration completed successfully`);
    return { success: true };
  } catch (error) {
    // Check if error is due to already existing objects
    if (
      error.message?.includes('already exists') ||
      error.message?.includes('duplicate key') ||
      error.code === '42P07' || // relation already exists
      error.code === '42710' || // object already exists
      error.code === '23505'    // unique violation
    ) {
      logger.info(`   ℹ️  Migration already applied (objects exist)`);
      return { success: true, alreadyApplied: true };
    }
    
    logger.error(`   ❌ Migration failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 RUNNING ALL MIGRATIONS');
  console.log('='.repeat(80));
  
  const results = [];
  
  for (const migration of MIGRATIONS) {
    const result = await runMigration(migration);
    results.push({
      ...migration,
      ...result
    });
    
    // If migration failed and it's not already applied, stop
    if (!result.success && !result.alreadyApplied) {
      logger.error(`\n❌ Migration failed: ${migration.name}`);
      logger.error(`   Stopping migration process`);
      break;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const alreadyApplied = results.filter(r => r.alreadyApplied).length;
  
  results.forEach(r => {
    const status = r.success 
      ? (r.alreadyApplied ? '✓ (already applied)' : '✓') 
      : '✗';
    console.log(`${status} ${r.name}`);
    if (!r.success && r.error) {
      console.log(`   Error: ${r.error}`);
    }
  });
  
  console.log('\n' + '-'.repeat(80));
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Already Applied: ${alreadyApplied}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(80) + '\n');
  
  if (failed > 0) {
    process.exit(1);
  }
  
  logger.info('✅ All migrations completed successfully!');
  process.exit(0);
}

// Run migrations
main()
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

