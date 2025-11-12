// ============================================================
// TASK 2.1: Install pgvector Extension
// ============================================================
// This script installs and verifies the pgvector extension

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function installPgvector() {
  console.log('\n================================================');
  console.log('  TASK 2.1: Installing pgvector Extension');
  console.log('================================================\n');

  try {
    // Step 1: Check if pgvector is already installed
    console.log('Step 1: Checking if pgvector is already installed...');
    const existing = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector'
    `;

    if (existing.length > 0) {
      console.log('✅ pgvector is already installed!');
      console.log('   Version:', existing[0].extversion || 'unknown');
    } else {
      console.log('⚠️  pgvector not installed. Installing now...');
      
      // Step 2: Install pgvector extension
      console.log('\nStep 2: Installing pgvector extension...');
      try {
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
        console.log('✅ pgvector extension installed successfully!');
      } catch (error) {
        if (error.message.includes('could not open extension control file')) {
          console.error('\n❌ ERROR: pgvector extension not available on this database.');
          console.error('\n📋 SUPABASE USERS:');
          console.error('   1. Go to https://supabase.com/dashboard');
          console.error('   2. Select your project');
          console.error('   3. Go to Database → Extensions');
          console.error('   4. Search for "vector" and enable it');
          console.error('   5. Re-run this script\n');
          process.exit(1);
        }
        throw error;
      }
    }

    // Step 3: Verify installation
    console.log('\nStep 3: Verifying pgvector installation...');
    const installed = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector'
    `;

    if (installed.length === 0) {
      throw new Error('pgvector installation failed!');
    }

    console.log('✅ pgvector verified: Installed and active');

    // Step 4: Test vector functionality
    console.log('\nStep 4: Testing vector functionality...');
    
    // Create test table
    await prisma.$executeRaw`
      CREATE TEMP TABLE vector_test (
        id SERIAL PRIMARY KEY,
        embedding vector(1536)
      )
    `;
    console.log('✅ Test table created with vector(1536) column');

    // Insert test vector
    const testVector = Array(1536).fill(0.1);
    await prisma.$executeRaw`
      INSERT INTO vector_test (embedding) 
      VALUES (${testVector}::vector)
    `;
    console.log('✅ Test vector inserted successfully');

    // Test cosine similarity query
    const similarityTest = await prisma.$queryRaw`
      SELECT 
        id, 
        embedding <=> ${testVector}::vector AS distance 
      FROM vector_test
    `;
    console.log('✅ Cosine similarity query works! Distance:', similarityTest[0].distance);

    // Test dot product (for different similarity measures)
    const dotProductTest = await prisma.$queryRaw`
      SELECT 
        id, 
        embedding <#> ${testVector}::vector AS negative_dot_product 
      FROM vector_test
    `;
    console.log('✅ Dot product query works! Value:', dotProductTest[0].negative_dot_product);

    // Clean up test table
    await prisma.$executeRaw`DROP TABLE vector_test`;
    console.log('✅ Test cleanup complete');

    // Step 5: Check database version
    console.log('\nStep 5: Checking PostgreSQL version...');
    const versionResult = await prisma.$queryRaw`SELECT version()`;
    const version = versionResult[0].version;
    const versionMatch = version.match(/PostgreSQL (\d+\.\d+)/);
    const pgVersion = versionMatch ? parseFloat(versionMatch[1]) : 0;

    if (pgVersion < 12) {
      console.error('⚠️  WARNING: PostgreSQL version is', pgVersion);
      console.error('   pgvector works best with PostgreSQL 12+');
    } else {
      console.log('✅ PostgreSQL version:', pgVersion, '(compatible)');
    }

    // Success summary
    console.log('\n================================================');
    console.log('  ✅ TASK 2.1 COMPLETE: pgvector Ready!');
    console.log('================================================');
    console.log('\nWhat you can do now:');
    console.log('  • Store vector embeddings (1536 dimensions)');
    console.log('  • Perform similarity searches (cosine, dot product, L2)');
    console.log('  • Create vector indexes (IVFFlat, HNSW)');
    console.log('\nNext: Task 2.2 - Create migration files\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

installPgvector();

