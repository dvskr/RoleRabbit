// Comprehensive Phase 2 Testing
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPhase2() {
  console.log('\n========================================');
  console.log('  PHASE 2: COMPREHENSIVE TESTING');
  console.log('========================================\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  try {
    // Test 1: Can insert and query vectors in base_resumes?
    console.log('Test 1: Insert vector into base_resumes...');
    totalTests++;
    
    const testVector = Array(1536).fill(0.1);
    
    // Find a test resume or create one
    let testResume = await prisma.baseResume.findFirst();
    
    if (!testResume) {
      console.log('⚠️  No test resume found, creating temporary one...');
      testResume = await prisma.baseResume.create({
        data: {
          userId: 'test-user-' + Date.now(),
          slotNumber: 999,
          name: 'Test Resume for Embedding',
          data: { test: true },
          isActive: false
        }
      });
    }
    
    // Update with embedding using raw SQL
    await prisma.$executeRawUnsafe(
      `UPDATE "base_resumes" SET embedding = $1::vector WHERE id = $2`,
      `[${testVector.join(',')}]`,
      testResume.id
    );
    
    console.log('✅ Vector inserted successfully');
    passedTests++;
    
    // Test 2: Can query vectors?
    console.log('\nTest 2: Query vector from base_resumes...');
    totalTests++;
    
    const retrieved = await prisma.$queryRaw`
      SELECT id, embedding::text, embedding_updated_at 
      FROM "base_resumes" 
      WHERE id = ${testResume.id}
    `;
    
    if (retrieved.length > 0 && retrieved[0].embedding) {
      console.log('✅ Vector retrieved successfully');
      console.log(`   - embedding_updated_at: ${retrieved[0].embedding_updated_at ? 'Set ✅' : 'Not set'}`);
      passedTests++;
    } else {
      console.log('❌ Vector retrieval failed');
    }
    
    // Test 3: Does trigger work?
    console.log('\nTest 3: Test embedding timestamp trigger...');
    totalTests++;
    
    const beforeUpdate = retrieved[0].embedding_updated_at;
    
    // Wait a second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update embedding
    const newVector = Array(1536).fill(0.2);
    await prisma.$executeRawUnsafe(
      `UPDATE "base_resumes" SET embedding = $1::vector WHERE id = $2`,
      `[${newVector.join(',')}]`,
      testResume.id
    );
    
    const afterUpdate = await prisma.$queryRaw`
      SELECT embedding_updated_at 
      FROM "base_resumes" 
      WHERE id = ${testResume.id}
    `;
    
    if (afterUpdate[0].embedding_updated_at > beforeUpdate) {
      console.log('✅ Trigger working: timestamp updated automatically');
      passedTests++;
    } else {
      console.log('⚠️  Trigger may not be working (timestamp not updated)');
    }
    
    // Test 4: Can insert into job_embeddings?
    console.log('\nTest 4: Insert into job_embeddings table...');
    totalTests++;
    
    const jobHash = 'test-job-hash-' + Date.now();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "job_embeddings" (job_hash, job_description, embedding) 
       VALUES ($1, $2, $3::vector)`,
      jobHash,
      'Test job description',
      `[${testVector.join(',')}]`
    );
    
    console.log('✅ Job embedding inserted successfully');
    passedTests++;
    
    // Test 5: Can query job_embeddings?
    console.log('\nTest 5: Query job_embeddings...');
    totalTests++;
    
    const jobEmbedding = await prisma.$queryRaw`
      SELECT id, job_hash, job_description, embedding::text as embedding, metadata, hit_count, created_at, last_used_at, expires_at 
      FROM "job_embeddings" WHERE job_hash = ${jobHash}
    `;
    
    if (jobEmbedding.length > 0) {
      console.log('✅ Job embedding retrieved successfully');
      console.log(`   - job_hash: ${jobEmbedding[0].job_hash}`);
      console.log(`   - hit_count: ${jobEmbedding[0].hit_count}`);
      console.log(`   - expires_at: ${jobEmbedding[0].expires_at}`);
      passedTests++;
    } else {
      console.log('❌ Job embedding retrieval failed');
    }
    
    // Test 6: Can update hit_count?
    console.log('\nTest 6: Update hit_count (cache hit simulation)...');
    totalTests++;
    
    await prisma.$executeRawUnsafe(
      `UPDATE "job_embeddings" 
       SET hit_count = hit_count + 1, last_used_at = NOW() 
       WHERE job_hash = $1`,
      jobHash
    );
    
    const updated = await prisma.$queryRaw`
      SELECT hit_count FROM "job_embeddings" WHERE job_hash = ${jobHash}
    `;
    
    if (updated[0].hit_count === 1) {
      console.log('✅ Hit count updated successfully');
      passedTests++;
    } else {
      console.log('❌ Hit count update failed');
    }
    
    // Test 7: Can calculate cosine similarity?
    console.log('\nTest 7: Test cosine similarity calculation...');
    totalTests++;
    
    const similarity = await prisma.$queryRaw`
      SELECT cosine_similarity(
        ${`[${testVector.join(',')}]`}::vector,
        ${`[${testVector.join(',')}]`}::vector
      ) AS similarity
    `;
    
    if (Math.abs(similarity[0].similarity - 1.0) < 0.001) {
      console.log('✅ Cosine similarity working (identical vectors = 1.0)');
      console.log(`   - Result: ${similarity[0].similarity}`);
      passedTests++;
    } else {
      console.log('⚠️  Cosine similarity unexpected result:', similarity[0].similarity);
    }
    
    // Test 8: Can perform similarity search?
    console.log('\nTest 8: Test vector similarity search...');
    totalTests++;
    
    const searchVector = Array(1536).fill(0.15);
    const similarResumes = await prisma.$queryRaw`
      SELECT 
        id,
        embedding <=> ${`[${searchVector.join(',')}]`}::vector AS distance,
        1 - (embedding <=> ${`[${searchVector.join(',')}]`}::vector) AS similarity
      FROM "base_resumes"
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${`[${searchVector.join(',')}]`}::vector
      LIMIT 5
    `;
    
    if (similarResumes.length > 0) {
      console.log(`✅ Similarity search working (found ${similarResumes.length} resumes)`);
      console.log(`   - Top match similarity: ${similarResumes[0].similarity.toFixed(4)}`);
      console.log(`   - Top match distance: ${similarResumes[0].distance.toFixed(4)}`);
      passedTests++;
    } else {
      console.log('❌ Similarity search failed');
    }
    
    // Test 9: Check monitoring views
    console.log('\nTest 9: Query monitoring views...');
    totalTests++;
    
    const coverageStats = await prisma.$queryRaw`
      SELECT total_resumes, resumes_with_embeddings, resumes_without_embeddings, 
             coverage_percentage, last_embedding_generated, first_embedding_generated 
      FROM embedding_coverage_stats
    `;
    const cacheStats = await prisma.$queryRaw`
      SELECT total_cached_jobs, total_cache_hits, avg_hits_per_job, 
             expired_entries, active_entries, most_recent_use, oldest_entry 
      FROM job_embedding_cache_stats
    `;
    
    if (coverageStats.length > 0 && cacheStats.length > 0) {
      console.log('✅ Monitoring views working');
      console.log('   Coverage Stats:');
      console.log(`     - Total resumes: ${coverageStats[0].total_resumes}`);
      console.log(`     - With embeddings: ${coverageStats[0].resumes_with_embeddings}`);
      console.log(`     - Coverage: ${coverageStats[0].coverage_percentage}%`);
      console.log('   Cache Stats:');
      console.log(`     - Cached jobs: ${cacheStats[0].total_cached_jobs}`);
      console.log(`     - Total hits: ${cacheStats[0].total_cache_hits}`);
      passedTests++;
    } else {
      console.log('❌ Monitoring views failed');
    }
    
    // Test 10: Test cleanup function
    console.log('\nTest 10: Test cleanup function...');
    totalTests++;
    
    // Create an expired entry
    const expiredHash = 'expired-job-' + Date.now();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "job_embeddings" (job_hash, job_description, embedding, expires_at) 
       VALUES ($1, $2, $3::vector, NOW() - INTERVAL '1 hour')`,
      expiredHash,
      'Expired job',
      `[${testVector.join(',')}]`
    );
    
    // Run cleanup
    const cleanupResult = await prisma.$queryRaw`SELECT cleanup_expired_job_embeddings() AS deleted`;
    
    if (cleanupResult[0].deleted >= 1) {
      console.log(`✅ Cleanup function working (deleted ${cleanupResult[0].deleted} expired entries)`);
      passedTests++;
    } else {
      console.log('⚠️  Cleanup function may not be working (no entries deleted)');
    }
    
    // Cleanup test data
    console.log('\nCleaning up test data...');
    if (testResume.name === 'Test Resume for Embedding') {
      await prisma.baseResume.delete({ where: { id: testResume.id } });
      console.log('✅ Test resume deleted');
    }
    await prisma.$executeRawUnsafe(`DELETE FROM "job_embeddings" WHERE job_hash = $1`, jobHash);
    console.log('✅ Test job embeddings deleted');
    
    // Final summary
    console.log('\n========================================');
    console.log('  TEST SUMMARY');
    console.log('========================================');
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%\n`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Phase 2 is ready! 🎉\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Review above for details.\n`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Testing failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPhase2();

