// Apply migration step by step
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMigrationStepByStep() {
  console.log('\n=== Applying Migration Step-by-Step ===\n');
  
  try {
    // Step 1: Add embedding columns to base_resumes
    console.log('Step 1: Adding embedding columns to base_resumes...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE "base_resumes" 
        ADD COLUMN IF NOT EXISTS "embedding" vector(1536),
        ADD COLUMN IF NOT EXISTS "embedding_updated_at" TIMESTAMP
      `;
      console.log('✅ Added embedding columns to base_resumes');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Columns already exist, skipping');
      } else {
        throw error;
      }
    }
    
    // Step 2: Create job_embeddings table
    console.log('\nStep 2: Creating job_embeddings table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "job_embeddings" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
          "job_hash" TEXT NOT NULL UNIQUE,
          "job_description" TEXT NOT NULL,
          "embedding" vector(1536) NOT NULL,
          "metadata" JSONB DEFAULT '{}',
          "hit_count" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "last_used_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "expires_at" TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
        )
      `;
      console.log('✅ Created job_embeddings table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Table already exists, skipping');
      } else {
        throw error;
      }
    }
    
    // Step 3: Create indexes on job_embeddings
    console.log('\nStep 3: Creating indexes on job_embeddings...');
    const indexes = [
      { name: 'idx_job_embeddings_job_hash', column: 'job_hash' },
      { name: 'idx_job_embeddings_expires_at', column: 'expires_at' },
      { name: 'idx_job_embeddings_created_at', column: 'created_at' }
    ];
    
    for (const idx of indexes) {
      try {
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS ${prisma.$queryRaw`"${idx.name}"`} 
          ON "job_embeddings"(${prisma.$queryRaw`"${idx.column}"`})
        `;
        // Use a workaround since we can't use template literals in raw queries
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "${idx.name}" ON "job_embeddings"("${idx.column}")`);
        console.log(`✅ Created index: ${idx.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Index ${idx.name} already exists, skipping`);
        } else {
          console.log(`⚠️  Failed to create index ${idx.name}:`, error.message);
        }
      }
    }
    
    // Step 4: Create indexes on base_resumes
    console.log('\nStep 4: Creating indexes on base_resumes...');
    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_base_resumes_embedding_updated" ON "base_resumes"("embedding_updated_at")`);
      console.log('✅ Created index: idx_base_resumes_embedding_updated');
    } catch (error) {
      console.log('⚠️  Index creation warning:', error.message);
    }
    
    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_base_resumes_has_embedding" ON "base_resumes"("userId") WHERE "embedding" IS NOT NULL`);
      console.log('✅ Created index: idx_base_resumes_has_embedding');
    } catch (error) {
      console.log('⚠️  Index creation warning:', error.message);
    }
    
    // Step 5: Create update_embedding_timestamp function
    console.log('\nStep 5: Creating update_embedding_timestamp function...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION update_embedding_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.embedding IS DISTINCT FROM OLD.embedding THEN
            NEW.embedding_updated_at = NOW();
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `);
      console.log('✅ Created function: update_embedding_timestamp()');
    } catch (error) {
      console.log('⚠️  Function creation warning:', error.message);
    }
    
    // Step 6: Create trigger
    console.log('\nStep 6: Creating trigger...');
    try {
      await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_update_embedding_timestamp ON "base_resumes"`);
      await prisma.$executeRawUnsafe(`
        CREATE TRIGGER trigger_update_embedding_timestamp
        BEFORE UPDATE ON "base_resumes"
        FOR EACH ROW
        EXECUTE FUNCTION update_embedding_timestamp()
      `);
      console.log('✅ Created trigger: trigger_update_embedding_timestamp');
    } catch (error) {
      console.log('⚠️  Trigger creation warning:', error.message);
    }
    
    // Step 7: Create cleanup function
    console.log('\nStep 7: Creating cleanup_expired_job_embeddings function...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION cleanup_expired_job_embeddings()
        RETURNS INTEGER AS $$
        DECLARE
          deleted_count INTEGER;
        BEGIN
          DELETE FROM "job_embeddings" WHERE "expires_at" < NOW();
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
        END;
        $$ LANGUAGE plpgsql
      `);
      console.log('✅ Created function: cleanup_expired_job_embeddings()');
    } catch (error) {
      console.log('⚠️  Function creation warning:', error.message);
    }
    
    // Step 8: Create cosine_similarity function
    console.log('\nStep 8: Creating cosine_similarity function...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
        RETURNS FLOAT AS $$
        BEGIN
          RETURN 1 - (a <=> b);
        END;
        $$ LANGUAGE plpgsql IMMUTABLE
      `);
      console.log('✅ Created function: cosine_similarity()');
    } catch (error) {
      console.log('⚠️  Function creation warning:', error.message);
    }
    
    // Step 9: Create embedding_coverage_stats view
    console.log('\nStep 9: Creating embedding_coverage_stats view...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE VIEW "embedding_coverage_stats" AS
        SELECT 
          COUNT(*) AS total_resumes,
          COUNT(embedding) AS resumes_with_embeddings,
          COUNT(*) - COUNT(embedding) AS resumes_without_embeddings,
          ROUND(100.0 * COUNT(embedding) / NULLIF(COUNT(*), 0), 2) AS coverage_percentage,
          MAX(embedding_updated_at) AS last_embedding_generated,
          MIN(embedding_updated_at) AS first_embedding_generated
        FROM "base_resumes"
      `);
      console.log('✅ Created view: embedding_coverage_stats');
    } catch (error) {
      console.log('⚠️  View creation warning:', error.message);
    }
    
    // Step 10: Create job_embedding_cache_stats view
    console.log('\nStep 10: Creating job_embedding_cache_stats view...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE VIEW "job_embedding_cache_stats" AS
        SELECT 
          COUNT(*) AS total_cached_jobs,
          SUM(hit_count) AS total_cache_hits,
          ROUND(AVG(hit_count), 2) AS avg_hits_per_job,
          COUNT(*) FILTER (WHERE expires_at < NOW()) AS expired_entries,
          COUNT(*) FILTER (WHERE expires_at >= NOW()) AS active_entries,
          MAX(last_used_at) AS most_recent_use,
          MIN(created_at) AS oldest_entry
        FROM "job_embeddings"
      `);
      console.log('✅ Created view: job_embedding_cache_stats');
    } catch (error) {
      console.log('⚠️  View creation warning:', error.message);
    }
    
    console.log('\n✅ Migration applied successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigrationStepByStep();

