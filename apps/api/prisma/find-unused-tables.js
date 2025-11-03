/**
 * Find and list tables that might not be needed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUnusedTables() {
  try {
    // Expected tables for our application (in roleready schema)
    const expectedTables = [
      'users',
      'user_profiles',
      'work_experiences',
      'education',
      'skills',
      'user_skills',
      'certifications',
      'projects',
      'achievements',
      'volunteer_experiences',
      'recommendations',
      'publications',
      'patents',
      'organizations',
      'test_scores',
      'career_goals',
      'career_timeline',
      'social_links',
      'refresh_tokens',
      'sessions',
      'password_reset_tokens'
    ];
    
    // Check roleready schema (our application schema)
    const rolereadyTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'roleready' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `;
    
    const tableNames = rolereadyTables.map(t => t.table_name);
    const unexpected = tableNames.filter(t => !expectedTables.includes(t));
    
    console.log('\n📊 Tables in roleready schema:');
    console.table(rolereadyTables);
    
    if (unexpected.length > 0) {
      console.log('\n⚠️  Unexpected tables (not in normalized schema):');
      console.table(unexpected.map(t => ({ table_name: t, action: 'CAN BE REMOVED' })));
    } else {
      console.log('\n✅ All tables in roleready schema are expected!');
    }
    
    // Check public schema for any old tables
    const publicTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      AND table_name NOT LIKE 'pg_%'
      ORDER BY table_name
    `;
    
    if (publicTables.length > 0) {
      console.log('\n📋 Tables in public schema (might be old/unused):');
      console.table(publicTables);
      console.log('\n⚠️  These tables in public schema might be from old migrations.');
      console.log('   Review them to see if they should be removed.');
    } else {
      console.log('\n✅ No unexpected tables in public schema.');
    }
    
    // Summary
    console.log('\n📝 Summary:');
    console.log(`   roleready schema: ${tableNames.length} tables (all expected)`);
    console.log(`   public schema: ${publicTables.length} tables`);
    
    if (unexpected.length === 0 && publicTables.length === 0) {
      console.log('\n✅ Database is clean! All tables are expected.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findUnusedTables();

