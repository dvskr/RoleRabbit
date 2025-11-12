// Test Embedding Cache Service
require('dotenv').config();
const {
  generateJobHash,
  getOrGenerateJobEmbedding,
  getCacheStats,
  cleanupExpiredCache,
  invalidateCacheEntry
} = require('./services/embeddings/embeddingCacheService');

async function testEmbeddingCache() {
  console.log('\n========================================');
  console.log('  TESTING EMBEDDING CACHE SERVICE');
  console.log('========================================\n');

  let passedTests = 0;
  let totalTests = 0;

  try {
    // Test job description
    const jobDescription = `
      Senior Full-Stack Developer
      
      We are seeking an experienced full-stack developer with:
      - 5+ years of JavaScript experience
      - Strong React and Node.js skills
      - Experience with PostgreSQL and MongoDB
      - Knowledge of Docker and Kubernetes
      
      Responsibilities:
      - Design and implement scalable web applications
      - Lead technical discussions and code reviews
      - Mentor junior developers
    `;

    // Test 1: Hash generation
    console.log('Test 1: Generate job hash...');
    totalTests++;
    
    const hash1 = generateJobHash(jobDescription);
    const hash2 = generateJobHash(jobDescription);
    const hash3 = generateJobHash(jobDescription + ' extra text');
    
    if (hash1 === hash2 && hash1 !== hash3 && hash1.length === 64) {
      console.log('✅ Job hash generation working');
      console.log(`   Hash: ${hash1.substring(0, 16)}...`);
      passedTests++;
    } else {
      console.log('❌ Job hash generation failed');
    }

    // Test 2: First call - should generate and cache
    console.log('\nTest 2: First call (cache miss, generate new)...');
    totalTests++;
    
    const start1 = Date.now();
    const result1 = await getOrGenerateJobEmbedding(jobDescription);
    const duration1 = Date.now() - start1;
    
    if (result1.embedding && 
        result1.embedding.length === 1536 &&
        result1.fromCache === false) {
      console.log('✅ First call generated embedding');
      console.log(`   Duration: ${duration1}ms`);
      console.log(`   From cache: ${result1.fromCache}`);
      console.log(`   Dimensions: ${result1.embedding.length}`);
      passedTests++;
    } else {
      console.log('❌ First call failed');
    }

    // Test 3: Second call - should use cache
    console.log('\nTest 3: Second call (cache hit)...');
    totalTests++;
    
    const start2 = Date.now();
    const result2 = await getOrGenerateJobEmbedding(jobDescription);
    const duration2 = Date.now() - start2;
    
    if (result2.embedding && 
        result2.embedding.length === 1536 &&
        result2.fromCache === true &&
        duration2 < duration1) {
      console.log('✅ Second call used cache');
      console.log(`   Duration: ${duration2}ms (${(duration2/duration1*100).toFixed(1)}% of first call)`);
      console.log(`   From cache: ${result2.fromCache}`);
      console.log(`   Speed improvement: ${((duration1-duration2)/duration1*100).toFixed(1)}% faster`);
      passedTests++;
    } else {
      console.log('❌ Second call failed to use cache');
      console.log(`   From cache: ${result2.fromCache}`);
    }

    // Test 4: Verify embeddings are identical
    console.log('\nTest 4: Verify cached embedding matches original...');
    totalTests++;
    
    const areIdentical = result1.embedding.every((val, i) => val === result2.embedding[i]);
    
    if (areIdentical) {
      console.log('✅ Cached embedding matches original');
      passedTests++;
    } else {
      console.log('❌ Cached embedding differs from original');
    }

    // Test 5: Cache statistics
    console.log('\nTest 5: Get cache statistics...');
    totalTests++;
    
    const stats = await getCacheStats();
    
    if (stats.totalCachedJobs >= 1 && 
        stats.totalCacheHits >= 1 &&
        stats.activeEntries >= 1) {
      console.log('✅ Cache statistics working');
      console.log(`   Total cached jobs: ${stats.totalCachedJobs}`);
      console.log(`   Total cache hits: ${stats.totalCacheHits}`);
      console.log(`   Average hits per job: ${stats.avgHitsPerJob.toFixed(2)}`);
      console.log(`   Active entries: ${stats.activeEntries}`);
      console.log(`   Expired entries: ${stats.expiredEntries}`);
      console.log(`   Hit rate: ${stats.hitRate}%`);
      passedTests++;
    } else {
      console.log('❌ Cache statistics failed');
      console.log('Stats:', stats);
    }

    // Test 6: Force refresh
    console.log('\nTest 6: Force refresh (bypass cache)...');
    totalTests++;
    
    const start3 = Date.now();
    const result3 = await getOrGenerateJobEmbedding(jobDescription, { forceRefresh: true });
    const duration3 = Date.now() - start3;
    
    if (result3.embedding && 
        result3.fromCache === false &&
        duration3 > duration2) {
      console.log('✅ Force refresh working');
      console.log(`   Duration: ${duration3}ms (bypassed cache)`);
      console.log(`   From cache: ${result3.fromCache}`);
      passedTests++;
    } else {
      console.log('❌ Force refresh failed');
    }

    // Test 7: Cache invalidation
    console.log('\nTest 7: Cache invalidation...');
    totalTests++;
    
    const invalidated = await invalidateCacheEntry(jobDescription);
    
    if (invalidated.deleted) {
      console.log('✅ Cache invalidation working');
      
      // Verify it's really gone
      const result4 = await getOrGenerateJobEmbedding(jobDescription);
      if (result4.fromCache === false) {
        console.log('✅ Entry was successfully removed from cache');
      } else {
        console.log('⚠️  Entry might still be in cache');
      }
      passedTests++;
    } else {
      console.log('❌ Cache invalidation failed');
    }

    // Test 8: Cleanup expired entries
    console.log('\nTest 8: Cleanup expired entries...');
    totalTests++;
    
    const cleanup = await cleanupExpiredCache();
    
    if (typeof cleanup.deleted === 'number') {
      console.log('✅ Cleanup function working');
      console.log(`   Deleted: ${cleanup.deleted} expired entries`);
      passedTests++;
    } else {
      console.log('❌ Cleanup function failed');
    }

    // Final summary
    console.log('\n========================================');
    console.log('  TEST SUMMARY');
    console.log('========================================');
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%\n`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Cache service is ready! 🎉\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Review above for details.\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Testing failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testEmbeddingCache();

