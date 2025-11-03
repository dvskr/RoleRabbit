/**
 * Remove unused schemas (only empty public schema)
 * WARNING: public schema is PostgreSQL default - dropping may cause issues
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeSchemas() {
  console.log('\n=== Removing Unused Schemas ===\n');
  
  // Check public schema dependencies
  console.log('Checking "public" schema...\n');
  
  // Check for any objects in public schema
  const tables = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  `);
  
  const views = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count
    FROM information_schema.views 
    WHERE table_schema = 'public';
  `);
  
  const functions = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count
    FROM information_schema.routines 
    WHERE routine_schema = 'public';
  `);
  
  const sequences = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public';
  `);
  
  const totalObjects = 
    parseInt(tables[0].count) + 
    parseInt(views[0].count) + 
    parseInt(functions[0].count) + 
    parseInt(sequences[0].count);
  
  console.log(`Tables: ${tables[0].count}`);
  console.log(`Views: ${views[0].count}`);
  console.log(`Functions: ${functions[0].count}`);
  console.log(`Sequences: ${sequences[0].count}`);
  console.log(`Total objects: ${totalObjects}\n`);
  
  if (totalObjects === 0) {
    console.log('⚠️  WARNING: Dropping "public" schema may affect Supabase/PostgreSQL defaults.');
    console.log('⚠️  PostgreSQL expects "public" schema to exist.');
    console.log('⚠️  However, since it\'s empty, we can safely drop it.\n');
    
    try {
      // Try to drop the schema
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "public" CASCADE;`);
      console.log('✅ Dropped "public" schema');
      
      // Recreate it empty (PostgreSQL best practice)
      await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "public";`);
      console.log('✅ Recreated empty "public" schema (for compatibility)');
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('\n💡 Schema may be protected or in use. Keeping it empty is fine.');
    }
  } else {
    console.log('⚠️  "public" schema has objects. Not removing.');
  }
  
  console.log('\n=== Final Schema List ===\n');
  
  const schemas = await prisma.$queryRawUnsafe(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
    ORDER BY schema_name;
  `);
  
  schemas.forEach(row => {
    const name = row.schema_name;
    if (name === 'roleready') {
      console.log(`✅ ${name} (active - our tables)`);
    } else if (['auth', 'extensions', 'graphql', 'graphql_public', 'pgbouncer', 'realtime', 'storage', 'vault'].includes(name)) {
      console.log(`🔒 ${name} (Supabase system)`);
    } else {
      console.log(`📋 ${name}`);
    }
  });
  
  console.log('\n✅ Schema cleanup complete!\n');
  console.log('Note: Supabase system schemas are kept for platform functionality.');
  console.log('Only "roleready" schema contains your application data.\n');
  
  await prisma.$disconnect();
}

removeSchemas().catch(console.error);

