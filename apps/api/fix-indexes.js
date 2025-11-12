// Fix remaining indexes
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixIndexes() {
  console.log('\nFixing remaining indexes...\n');
  
  try {
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_job_embeddings_job_hash ON job_embeddings(job_hash)');
    console.log('✅ Created index: idx_job_embeddings_job_hash');
    
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_job_embeddings_expires_at ON job_embeddings(expires_at)');
    console.log('✅ Created index: idx_job_embeddings_expires_at');
    
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_job_embeddings_created_at ON job_embeddings(created_at)');
    console.log('✅ Created index: idx_job_embeddings_created_at');
    
    console.log('\n✅ All indexes created successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixIndexes();

