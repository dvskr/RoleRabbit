/**
 * Drop unnecessary tables from database
 * Keeps only: users, sessions, refresh_tokens, password_reset_tokens
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

async function dropTables() {
  console.log('\n=== Dropping Unnecessary Tables ===\n');
  
  for (const table of tablesToDrop) {
    try {
      // Use raw SQL to drop table
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "roleready"."${table}" CASCADE;`);
      console.log(`✅ Dropped: ${table}`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`⚠️  Already removed: ${table}`);
      } else {
        console.log(`❌ Error dropping ${table}:`, error.message);
      }
    }
  }
  
  console.log('\n=== Verification ===\n');
  
  // Check remaining tables
  const result = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'roleready' 
    ORDER BY table_name;
  `);
  
  console.log('Remaining tables:');
  result.forEach(row => {
    console.log(`  ✓ ${row.table_name}`);
  });
  
  const expectedTables = ['users', 'sessions', 'refresh_tokens', 'password_reset_tokens'];
  const remainingTableNames = result.map(r => r.table_name);
  const allPresent = expectedTables.every(t => remainingTableNames.includes(t));
  
  if (allPresent && remainingTableNames.length === expectedTables.length) {
    console.log('\n✅ Success! Only profile-related tables remain.');
  } else {
    console.log('\n⚠️  Expected tables:', expectedTables.join(', '));
    console.log('Found tables:', remainingTableNames.join(', '));
  }
  
  await prisma.$disconnect();
}

dropTables().catch(console.error);

