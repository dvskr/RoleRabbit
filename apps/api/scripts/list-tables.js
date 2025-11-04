const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listTables() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\n📊 Tables in PostgreSQL database:\n');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    console.log(`\nTotal: ${tables.length} tables\n`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error listing tables:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

listTables();

