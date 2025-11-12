/**
 * Check and drop unnecessary tables from Supabase
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tablesToDrop = [
  'resumes',
  'jobs',
  'cover_letters',
  'emails',
  'portfolios',
  'cloud_files',
  'cloud_folders',
  'file_shares',
  'credentials',
  'analytics',
  'discussion_posts',
  'discussion_comments',
  'ai_agents',
  'ai_agent_tasks',
  'audit_logs',
  'job_descriptions',
  'analytics_snapshots',
  'ai_usage',
  'notifications'
];

async function checkAndDrop() {
  console.log('\n=== Checking Current Tables ===\n');
  
  // Check what tables exist
  const existingTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'roleready' 
    ORDER BY table_name;
  `);
  
  console.log('Current tables in database:');
  existingTables.forEach(row => {
    console.log(`  - ${row.table_name}`);
  });
  
  console.log('\n=== Dropping Unnecessary Tables ===\n');
  
  let droppedCount = 0;
  let errorCount = 0;
  
  for (const table of tablesToDrop) {
    try {
      // Check if table exists first
      const tableExists = await prisma.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'roleready' 
          AND table_name = $1
        );
      `, table);
      
      if (tableExists[0].exists) {
        // Drop the table
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "roleready"."${table}" CASCADE;`);
        console.log(`✅ Dropped: ${table}`);
        droppedCount++;
      } else {
        console.log(`⚠️  Not found: ${table} (already removed or never existed)`);
      }
    } catch (error) {
      console.log(`❌ Error with ${table}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Dropped: ${droppedCount} tables`);
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount}`);
  }
  
  console.log('\n=== Final Verification ===\n');
  
  // Check remaining tables
  const finalTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'roleready' 
    ORDER BY table_name;
  `);
  
  console.log('Remaining tables:');
  finalTables.forEach(row => {
    console.log(`  ✓ ${row.table_name}`);
  });
  
  const expectedTables = ['users', 'sessions', 'refresh_tokens', 'password_reset_tokens'];
  const remainingTableNames = finalTables.map(r => r.table_name);
  const otherTables = remainingTableNames.filter(t => !expectedTables.includes(t) && t !== '_prisma_migrations');
  
  if (otherTables.length > 0) {
    console.log(`\n⚠️  Unexpected tables still present: ${otherTables.join(', ')}`);
  } else {
    console.log('\n✅ Success! Only profile-related tables remain.');
  }
  
  await prisma.$disconnect();
}

checkAndDrop().catch(console.error);

