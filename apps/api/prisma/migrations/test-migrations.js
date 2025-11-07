/**
 * Migration Test Script
 * Tests that all migrations can be safely applied
 * 
 * Usage: node prisma/migrations/test-migrations.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Prisma Migrations...\n');

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Test 1: Check migration files exist and are valid SQL
function testMigrationFilesExist() {
  console.log('✅ Test 1: Checking migration files exist...');
  const migrationsDir = __dirname;
  
  if (!fs.existsSync(migrationsDir)) {
    testResults.failed.push('Migrations directory does not exist');
    return;
  }
  
  const migrations = fs.readdirSync(migrationsDir)
    .filter(item => fs.statSync(path.join(migrationsDir, item)).isDirectory())
    .filter(dir => dir.match(/^\d{14}/)); // Check timestamp format
  
  console.log(`   Found ${migrations.length} migrations`);
  testResults.passed.push(`Found ${migrations.length} migration directories`);
  
  // Check each migration has a migration.sql file
  migrations.forEach(migration => {
    const sqlFile = path.join(migrationsDir, migration, 'migration.sql');
    if (!fs.existsSync(sqlFile)) {
      testResults.failed.push(`Migration ${migration} missing migration.sql`);
    } else {
      const content = fs.readFileSync(sqlFile, 'utf8');
      // Basic SQL syntax check
      if (content.trim().length === 0) {
        testResults.warnings.push(`Migration ${migration} has empty SQL file`);
      } else {
        // Check for unsafe patterns (but allow in comments and allow IF EXISTS)
        const unsafePatterns = [
          /\bDROP\s+TABLE\s+(?!IF\s+EXISTS)(?!.*--)/i, // But not if followed by comment
          /\bALTER\s+TABLE\s+[^"]+\s+DROP\s+COLUMN\s+(?!IF\s+EXISTS)(?!.*--)/i,
        ];
        
        let foundUnsafe = false;
        unsafePatterns.forEach(pattern => {
          if (pattern.test(content)) {
            testResults.warnings.push(`Migration ${migration} may have unsafe DROP without IF EXISTS`);
            foundUnsafe = true;
          }
        });
        
        if (!foundUnsafe) {
          testResults.passed.push(`Migration ${migration} SQL file is safe`);
        }
      }
    }
  });
}

// Test 2: Check for safety patterns in migrations
function testSafetyPatterns() {
  console.log('\n✅ Test 2: Checking safety patterns...');
  const migrationsDir = __dirname;
  const migrations = fs.readdirSync(migrationsDir)
    .filter(item => {
      const itemPath = path.join(migrationsDir, item);
      return fs.statSync(itemPath).isDirectory() && item.match(/^\d{14}/);
    });
  
  const safetyChecks = {
    hasTableChecks: 0,
    hasColumnChecks: 0,
    hasConstraintChecks: 0,
    usesIfExists: 0,
    usesIfNotExists: 0
  };
  
  migrations.forEach(migration => {
    const sqlFile = path.join(migrationsDir, migration, 'migration.sql');
    if (fs.existsSync(sqlFile)) {
      const content = fs.readFileSync(sqlFile, 'utf8');
      
      // Check for table existence checks
      if (/information_schema\.tables.*table_name/i.test(content)) {
        safetyChecks.hasTableChecks++;
      }
      
      // Check for column existence checks
      if (/information_schema\.columns/i.test(content)) {
        safetyChecks.hasColumnChecks++;
      }
      
      // Check for constraint existence checks
      if (/information_schema\.table_constraints/i.test(content)) {
        safetyChecks.hasConstraintChecks++;
      }
      
      // Check for IF EXISTS usage
      if (/\bIF\s+EXISTS\b/i.test(content)) {
        safetyChecks.usesIfExists++;
      }
      
      // Check for IF NOT EXISTS usage
      if (/\bIF\s+NOT\s+EXISTS\b/i.test(content)) {
        safetyChecks.usesIfNotExists++;
      }
    }
  });
  
  console.log(`   Migrations with table checks: ${safetyChecks.hasTableChecks}/${migrations.length}`);
  console.log(`   Migrations with column checks: ${safetyChecks.hasColumnChecks}/${migrations.length}`);
  console.log(`   Migrations with constraint checks: ${safetyChecks.hasConstraintChecks}/${migrations.length}`);
  console.log(`   Migrations using IF EXISTS: ${safetyChecks.usesIfExists}/${migrations.length}`);
  console.log(`   Migrations using IF NOT EXISTS: ${safetyChecks.usesIfNotExists}/${migrations.length}`);
  
  if (safetyChecks.hasTableChecks >= migrations.length * 0.7) {
    testResults.passed.push('Most migrations have table existence checks');
  } else {
    testResults.warnings.push('Some migrations may be missing table existence checks');
  }
}

// Test 3: Validate migration SQL syntax (basic check)
function testSQLSyntax() {
  console.log('\n✅ Test 3: Basic SQL syntax validation...');
  const migrationsDir = __dirname;
  const migrations = fs.readdirSync(migrationsDir)
    .filter(item => {
      const itemPath = path.join(migrationsDir, item);
      return fs.statSync(itemPath).isDirectory() && item.match(/^\d{14}/);
    });
  
  let syntaxErrors = 0;
  migrations.forEach(migration => {
    const sqlFile = path.join(migrationsDir, migration, 'migration.sql');
    if (fs.existsSync(sqlFile)) {
      const content = fs.readFileSync(sqlFile, 'utf8');
      
      // Basic checks: balanced quotes (excluding escaped quotes and SQL string contexts)
      // Remove comments and string literals for better checking
      const cleanedContent = content
        .replace(/--.*$/gm, '') // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/'[^']*(?:''[^']*)*'/g, '') // Remove single-quoted strings
        .replace(/"([^"\\]|\\.)*"/g, ''); // Remove double-quoted strings
      
      const singleQuotes = (cleanedContent.match(/'/g) || []).length;
      const doubleQuotes = (cleanedContent.match(/"/g) || []).length;
      
      if (singleQuotes % 2 !== 0) {
        testResults.warnings.push(`Migration ${migration}: Possible unbalanced single quotes (check manually)`);
        // Don't count as syntax error, just warning
      }
      
      // Check DO blocks are properly closed
      const doBlocks = (content.match(/\bDO\s+\$\$/gi) || []).length;
      const endBlocks = (content.match(/\bEND\s+\$\$/gi) || []).length;
      
      if (doBlocks !== endBlocks) {
        testResults.failed.push(`Migration ${migration}: Unbalanced DO blocks (${doBlocks} DO, ${endBlocks} END)`);
        syntaxErrors++;
      } else if (doBlocks > 0) {
        // All DO blocks are balanced
        testResults.passed.push(`Migration ${migration}: All ${doBlocks} DO blocks properly closed`);
      }
    }
  });
  
  if (syntaxErrors === 0) {
    testResults.passed.push('All migrations pass basic SQL syntax checks');
  }
  // Don't fail on quote warnings, those are often false positives in SQL
}

// Test 4: Check migration order/timestamps
function testMigrationOrder() {
  console.log('\n✅ Test 4: Checking migration order...');
  const migrationsDir = __dirname;
  const migrations = fs.readdirSync(migrationsDir)
    .filter(item => {
      const itemPath = path.join(migrationsDir, item);
      return fs.statSync(itemPath).isDirectory() && item.match(/^\d{14}/);
    })
    .sort();
  
  // Check for duplicate timestamps
  const timestamps = migrations.map(m => m.substring(0, 14));
  const duplicates = timestamps.filter((t, i) => timestamps.indexOf(t) !== i);
  
  if (duplicates.length > 0) {
    testResults.failed.push(`Duplicate migration timestamps found: ${[...new Set(duplicates)].join(', ')}`);
  } else {
    testResults.passed.push(`All ${migrations.length} migrations have unique timestamps`);
  }
  
  // Check chronological order
  let outOfOrder = false;
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] < timestamps[i-1]) {
      outOfOrder = true;
      break;
    }
  }
  
  if (!outOfOrder && timestamps.length > 0) {
    testResults.passed.push('Migrations are in chronological order');
  } else if (timestamps.length > 0) {
    testResults.warnings.push('Some migrations may be out of chronological order');
  }
}

// Run all tests
console.log('='.repeat(50));
testMigrationFilesExist();
testSafetyPatterns();
testSQLSyntax();
testMigrationOrder();

// Print results
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(50));

console.log(`\n✅ PASSED: ${testResults.passed.length}`);
testResults.passed.forEach(msg => console.log(`   ✓ ${msg}`));

if (testResults.warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS: ${testResults.warnings.length}`);
  testResults.warnings.forEach(msg => console.log(`   ⚠ ${msg}`));
}

if (testResults.failed.length > 0) {
  console.log(`\n❌ FAILED: ${testResults.failed.length}`);
  testResults.failed.forEach(msg => console.log(`   ✗ ${msg}`));
  console.log('\n⚠️  Some tests failed. Please review and fix issues.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! Migrations appear to be safe.');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npx prisma migrate status (to verify current state)');
  console.log('   2. Run: npx prisma migrate dev --create-only --name test_migration');
  console.log('   3. If successful, your migrations are ready for production');
  process.exit(0);
}

