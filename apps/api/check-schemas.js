/**
 * Check all schemas and identify which ones can be safely removed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchemas() {
  console.log('\n=== All Schemas in Database ===\n');
  
  // Get all schemas
  const schemas = await prisma.$queryRawUnsafe(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
    ORDER BY schema_name;
  `);
  
  // Supabase system schemas (DO NOT DROP)
  const systemSchemas = [
    'auth',
    'extensions', 
    'graphql',
    'graphql_public',
    'pgbouncer',
    'realtime',
    'storage',
    'vault'
  ];
  
  console.log('Schema Analysis:\n');
  
  const toKeep = [];
  const toRemove = [];
  
  for (const row of schemas) {
    const schemaName = row.schema_name;
    const isSystem = systemSchemas.includes(schemaName);
    const isEmpty = await isSchemaEmpty(schemaName);
    
    if (schemaName === 'roleready') {
      console.log(`✅ KEEP: ${schemaName} (our active schema)`);
      toKeep.push(schemaName);
    } else if (isSystem) {
      console.log(`🔒 KEEP: ${schemaName} (Supabase system schema)`);
      toKeep.push(schemaName);
    } else if (schemaName === 'public') {
      if (isEmpty) {
        console.log(`🗑️  REMOVE: ${schemaName} (empty, not needed)`);
        toRemove.push(schemaName);
      } else {
        console.log(`⚠️  CHECK: ${schemaName} (has tables - may need review)`);
        toKeep.push(schemaName);
      }
    } else {
      if (isEmpty) {
        console.log(`🗑️  REMOVE: ${schemaName} (empty, custom schema)`);
        toRemove.push(schemaName);
      } else {
        console.log(`⚠️  CHECK: ${schemaName} (has tables - may need review)`);
        const tables = await getTablesInSchema(schemaName);
        console.log(`    Tables: ${tables.join(', ') || '(none)'}`);
        toKeep.push(schemaName);
      }
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Keep: ${toKeep.length} schemas`);
  console.log(`Remove: ${toRemove.length} schemas`);
  
  if (toRemove.length > 0) {
    console.log(`\nSchemas to remove: ${toRemove.join(', ')}`);
  }
  
  await prisma.$disconnect();
}

async function isSchemaEmpty(schemaName) {
  const result = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count
    FROM information_schema.tables 
    WHERE table_schema = $1
    AND table_type = 'BASE TABLE';
  `, schemaName);
  return parseInt(result[0].count) === 0;
}

async function getTablesInSchema(schemaName) {
  const result = await prisma.$queryRawUnsafe(`
    SELECT table_name
    FROM information_schema.tables 
    WHERE table_schema = $1
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `, schemaName);
  return result.map(r => r.table_name);
}

checkSchemas().catch(console.error);

