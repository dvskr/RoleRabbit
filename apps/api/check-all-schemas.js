/**
 * Check all schemas for tables
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllSchemas() {
  console.log('\n=== Checking All Schemas ===\n');
  
  // Check roleready schema
  console.log('Tables in "roleready" schema:');
  const rolereadyTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'roleready' 
    ORDER BY table_name;
  `);
  rolereadyTables.forEach(row => {
    console.log(`  - ${row.table_name}`);
  });
  
  // Check public schema
  console.log('\nTables in "public" schema:');
  const publicTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  
  if (publicTables.length > 0) {
    publicTables.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // List tables to drop from public schema
    const tablesToDrop = [
      'resumes', 'jobs', 'cover_letters', 'emails', 'portfolios',
      'cloud_files', 'cloud_folders', 'file_shares', 'credentials',
      'analytics', 'discussion_posts', 'discussion_comments',
      'ai_agents', 'ai_agent_tasks', 'audit_logs', 'job_descriptions',
      'analytics_snapshots', 'ai_usage', 'notifications'
    ];
    
    console.log('\n=== Dropping from public schema ===\n');
    for (const table of tablesToDrop) {
      const exists = publicTables.find(t => t.table_name === table);
      if (exists) {
        try {
          await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."${table}" CASCADE;`);
          console.log(`✅ Dropped from public: ${table}`);
        } catch (error) {
          console.log(`❌ Error dropping ${table}:`, error.message);
        }
      }
    }
  } else {
    console.log('  (no tables found)');
  }
  
  // List all schemas
  console.log('\n=== All Schemas ===');
  const schemas = await prisma.$queryRawUnsafe(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY schema_name;
  `);
  schemas.forEach(row => {
    console.log(`  - ${row.schema_name}`);
  });
  
  await prisma.$disconnect();
}

checkAllSchemas().catch(console.error);

