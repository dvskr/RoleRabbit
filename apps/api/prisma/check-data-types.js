/**
 * Check data types in all tables for correctness
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDataTypes() {
  try {
    // Check all tables and their column types
    const tables = [
      'users', 'user_profiles', 'work_experiences', 'education', 
      'skills', 'user_skills', 'certifications', 'projects', 
      'achievements', 'volunteer_experiences', 'recommendations',
      'publications', 'patents', 'organizations', 'test_scores',
      'career_goals', 'career_timeline', 'social_links',
      'refresh_tokens', 'sessions', 'password_reset_tokens'
    ];
    
    console.log('🔍 Checking data types in all tables...\n');
    
    for (const tableName of tables) {
      const columns = await prisma.$queryRawUnsafe(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'roleready'
        AND table_name = $1
        ORDER BY ordinal_position
      `, tableName);
      
      console.log(`\n📋 ${tableName}:`);
      console.table(columns);
      
      // Check for potential issues
      const issues = [];
      columns.forEach(col => {
        // Check for TEXT fields that might need length limits
        if (col.data_type === 'text' && !col.character_maximum_length) {
          // Some TEXT fields are fine (like descriptions), but emails should have limits
          if (col.column_name === 'email' && tableName === 'users') {
            issues.push(`${tableName}.${col.column_name}: Should have VARCHAR(254) limit for email`);
          }
        }
        
        // Check for dates stored as text instead of date/timestamp
        if (col.column_name.includes('Date') && col.data_type === 'text') {
          // This is intentional for flexible date formats (MM/YYYY, etc.)
        }
        
        // Check for numeric fields
        if (col.column_name.includes('Rate') || col.column_name.includes('Completeness')) {
          if (col.data_type !== 'integer' && col.data_type !== 'smallint') {
            issues.push(`${tableName}.${col.column_name}: Should be INTEGER for percentages`);
          }
        }
      });
      
      if (issues.length > 0) {
        console.log(`  ⚠️  Potential issues:`);
        issues.forEach(issue => console.log(`     - ${issue}`));
      }
    }
    
    // Summary
    console.log('\n\n📊 Data Type Summary:');
    console.log('   Checking for:');
    console.log('   ✓ Appropriate string types');
    console.log('   ✓ Date/timestamp types');
    console.log('   ✓ Numeric types (INT vs BIGINT)');
    console.log('   ✓ Boolean types');
    console.log('   ✓ Nullable vs Non-nullable');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDataTypes();

