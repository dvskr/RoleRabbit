/**
 * Check all tables in all schemas
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllTables() {
  try {
    // Check all schemas
    const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `;
    
    console.log('\n📋 Available Schemas:');
    console.table(schemas);
    
    // Check tables in each schema
    for (const schema of schemas) {
      const schemaName = schema.schema_name;
      const tables = await prisma.$queryRawUnsafe(`
        SELECT table_name, 
               (SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = $1 
                AND table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
      `, schemaName);
      
      if (tables.length > 0) {
        console.log(`\n📊 Tables in schema "${schemaName}":`);
        console.table(tables);
      }
    }
    
    // Expected tables for normalized schema
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
    
    // Get all tables in roleready schema
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'roleready' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `;
    
    const tableNames = allTables.map(t => t.table_name);
    const unexpected = tableNames.filter(t => !expectedTables.includes(t));
    const missing = expectedTables.filter(t => !tableNames.includes(t));
    
    console.log('\n🔍 Analysis:');
    console.log(`   Expected tables: ${expectedTables.length}`);
    console.log(`   Found tables: ${tableNames.length}`);
    
    if (unexpected.length > 0) {
      console.log(`\n⚠️  Unexpected tables (can be removed):`);
      console.table(unexpected.map(t => ({ table_name: t })));
    }
    
    if (missing.length > 0) {
      console.log(`\n❌ Missing expected tables:`);
      console.table(missing.map(t => ({ table_name: t })));
    }
    
    if (unexpected.length === 0 && missing.length === 0) {
      console.log('\n✅ All tables match expected schema!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables();

