const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CHECKING DATABASE TABLES');
    console.log('='.repeat(80) + '\n');

    // Check for all tables with relevant names
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%template%' OR table_name LIKE '%share%' OR table_name LIKE '%analytic%' OR table_name LIKE '%document%')
      ORDER BY table_name
    `;
    
    console.log('All related tables found:');
    allTables.forEach(t => console.log('  -', t.table_name));
    console.log('');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('resume_templates', 'resume_share_links', 'resume_analytics', 'generated_documents')
      ORDER BY table_name
    `;
    
    console.log('Existing tables:');
    if (tables.length === 0) {
      console.log('❌ No target tables found - migrations need to be run\n');
    } else {
      tables.forEach(t => console.log('✅', t.table_name));
      console.log(`\n✅ Found ${tables.length}/4 target tables\n`);
    }

    // Check for templates
    if (tables.some(t => t.table_name === 'resume_templates')) {
      const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "resume_templates"`;
      console.log(`📋 Templates in database: ${count[0].count}\n`);
    }

    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();

