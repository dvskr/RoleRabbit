/**
 * List all tables with their column counts
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listTables() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT COUNT(*) 
         FROM information_schema.columns 
         WHERE table_schema = 'roleready' 
         AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'roleready' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `;
    
    console.log('\n📋 Normalized Database Tables:\n');
    console.table(tables);
    
    console.log('\n✅ All normalized tables are ready!');
    console.log('   You can now see them in PostgreSQL/Supabase.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listTables();

