// Verify migration status
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('\n=== Verifying Migration Status ===\n');
  
  try {
    // Check 1: Does base_resumes have embedding column?
    console.log('Check 1: BaseResume embedding columns...');
    const baseResumeColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'base_resumes' 
      AND column_name IN ('embedding', 'embedding_updated_at')
    `;
    
    if (baseResumeColumns.length === 2) {
      console.log('✅ base_resumes has embedding columns');
      baseResumeColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else if (baseResumeColumns.length === 0) {
      console.log('❌ base_resumes missing embedding columns');
    } else {
      console.log('⚠️  base_resumes has partial embedding columns:', baseResumeColumns.length);
    }
    
    // Check 2: Does job_embeddings table exist?
    console.log('\nCheck 2: job_embeddings table...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'job_embeddings'
      )
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ job_embeddings table exists');
      
      // Get column count
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'job_embeddings'
      `;
      console.log(`   Columns: ${columns.length}`);
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ job_embeddings table does NOT exist');
    }
    
    // Check 3: Are indexes created?
    console.log('\nCheck 3: Vector indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('base_resumes', 'job_embeddings')
      AND indexname LIKE '%embedding%'
    `;
    
    if (indexes.length > 0) {
      console.log(`✅ Found ${indexes.length} embedding-related indexes:`);
      indexes.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    } else {
      console.log('⚠️  No embedding-related indexes found');
    }
    
    // Check 4: Are functions/triggers created?
    console.log('\nCheck 4: Functions and triggers...');
    const functions = await prisma.$queryRaw`
      SELECT proname 
      FROM pg_proc 
      WHERE proname IN ('update_embedding_timestamp', 'cleanup_expired_job_embeddings', 'cosine_similarity')
    `;
    
    if (functions.length > 0) {
      console.log(`✅ Found ${functions.length} functions:`);
      functions.forEach(fn => {
        console.log(`   - ${fn.proname}()`);
      });
    } else {
      console.log('⚠️  No migration functions found');
    }
    
    // Check 5: Are views created?
    console.log('\nCheck 5: Monitoring views...');
    const views = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_name IN ('embedding_coverage_stats', 'job_embedding_cache_stats')
    `;
    
    if (views.length > 0) {
      console.log(`✅ Found ${views.length} views:`);
      views.forEach(view => {
        console.log(`   - ${view.table_name}`);
      });
    } else {
      console.log('⚠️  No monitoring views found');
    }
    
    // Summary
    console.log('\n=== Migration Status Summary ===');
    const hasEmbeddingColumns = baseResumeColumns.length === 2;
    const hasJobTable = tableExists[0].exists;
    const hasIndexes = indexes.length > 0;
    const hasFunctions = functions.length > 0;
    const hasViews = views.length > 0;
    
    const completionPercentage = [
      hasEmbeddingColumns,
      hasJobTable,
      hasIndexes,
      hasFunctions,
      hasViews
    ].filter(Boolean).length / 5 * 100;
    
    console.log(`\nCompletion: ${completionPercentage}%`);
    console.log(`- BaseResume columns: ${hasEmbeddingColumns ? '✅' : '❌'}`);
    console.log(`- job_embeddings table: ${hasJobTable ? '✅' : '❌'}`);
    console.log(`- Indexes: ${hasIndexes ? '✅' : '❌'}`);
    console.log(`- Functions: ${hasFunctions ? '✅' : '❌'}`);
    console.log(`- Views: ${hasViews ? '✅' : '❌'}`);
    
    if (completionPercentage === 100) {
      console.log('\n✅ Migration is COMPLETE!\n');
    } else if (completionPercentage > 0) {
      console.log(`\n⚠️  Migration is PARTIAL (${completionPercentage}%)\n`);
    } else {
      console.log('\n❌ Migration has NOT been applied\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();

