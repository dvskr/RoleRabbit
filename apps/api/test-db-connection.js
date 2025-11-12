// Test database connection
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database connected successfully');
    console.log('PostgreSQL version:', result[0].version);
    
    // Check if pgvector is installed
    const extensions = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'vector'`;
    if (extensions.length > 0) {
      console.log('✅ pgvector extension: INSTALLED');
    } else {
      console.log('⚠️  pgvector extension: NOT INSTALLED (will install in Phase 2)');
    }
    
    // Test Prisma schema
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BaseResume'`;
    if (tables.length > 0) {
      console.log('✅ BaseResume table: EXISTS');
      
      // Count resumes
      const count = await prisma.baseResume.count();
      console.log(`✅ Found ${count} resumes in database`);
    } else {
      console.log('❌ BaseResume table: NOT FOUND');
    }
    
    console.log('\n✅ Database verification COMPLETE');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

