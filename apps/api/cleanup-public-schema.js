/**
 * Remove duplicate tables from public schema
 * Keep only roleready schema active
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupPublic() {
  console.log('\n=== Cleaning Public Schema ===\n');
  
  // Tables that should only exist in roleready schema
  const tablesToRemove = [
    'users',
    'sessions', 
    'refresh_tokens',
    'password_reset_tokens'
  ];
  
  console.log('Removing duplicates from public schema...\n');
  
  for (const table of tablesToRemove) {
    try {
      // Check if exists in public
      const exists = await prisma.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, table);
      
      if (exists[0].exists) {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."${table}" CASCADE;`);
        console.log(`✅ Removed duplicate: ${table}`);
      }
    } catch (error) {
      console.log(`⚠️  ${table}:`, error.message);
    }
  }
  
  console.log('\n=== Final State ===\n');
  
  // Check public schema
  const publicTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  
  console.log('Tables in "public" schema:');
  if (publicTables.length === 0) {
    console.log('  (empty - all cleaned!)');
  } else {
    publicTables.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
  }
  
  // Check roleready schema
  const rolereadyTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'roleready' 
    ORDER BY table_name;
  `);
  
  console.log('\n✅ Tables in "roleready" schema (active):');
  rolereadyTables.forEach(row => {
    console.log(`  ✓ ${row.table_name}`);
  });
  
  console.log('\n✅ Cleanup complete! Only roleready schema has tables now.\n');
  
  await prisma.$disconnect();
}

cleanupPublic().catch(console.error);

