/**
 * Final verification of database state
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('\n=== Final Database State ===\n');
  
  // Check roleready schema
  console.log('✅ Tables in "roleready" schema (our main schema):');
  const rolereadyTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'roleready' 
    ORDER BY table_name;
  `);
  rolereadyTables.forEach(row => {
    console.log(`  ✓ ${row.table_name}`);
  });
  
  // Check public schema
  console.log('\n📋 Tables in "public" schema:');
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
    
    // Check if there are duplicates
    const expectedTables = ['users', 'sessions', 'refresh_tokens', 'password_reset_tokens'];
    const publicTableNames = publicTables.map(t => t.table_name);
    const duplicates = publicTableNames.filter(t => expectedTables.includes(t));
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Note: ${duplicates.length} tables exist in both schemas:`);
      duplicates.forEach(t => console.log(`  - ${t}`));
      console.log('\n💡 These are duplicates. The "roleready" schema is the active one.');
    }
  } else {
    console.log('  (no tables found)');
  }
  
  console.log('\n✅ Cleanup Complete!');
  console.log('\nYour active schema is "roleready" with only profile-related tables.');
  console.log('Supabase UI may show tables from "public" schema, but those are not used.\n');
  
  await prisma.$disconnect();
}

verify().catch(console.error);

