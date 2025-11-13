/**
 * NUCLEAR OPTION: Clear ALL caches everywhere
 */

const cacheManager = require('./utils/cacheManager');
const { CACHE_NAMESPACES } = require('./utils/cacheKeys');

async function nuclearCacheClear() {
  console.log('\n🚨 NUCLEAR CACHE CLEAR - Clearing EVERYTHING\n');
  
  try {
    // 1. Clear ATS scores
    console.log('1. Clearing ATS scores cache...');
    await cacheManager.invalidateNamespace(CACHE_NAMESPACES.ATS_SCORE);
    console.log('   ✅ ATS scores cleared');
    
    // 2. Clear job analysis
    console.log('2. Clearing job analysis cache...');
    await cacheManager.invalidateNamespace(CACHE_NAMESPACES.JOB_ANALYSIS);
    console.log('   ✅ Job analysis cleared');
    
    // 3. Clear resume parse
    console.log('3. Clearing resume parse cache...');
    await cacheManager.invalidateNamespace(CACHE_NAMESPACES.RESUME_PARSE);
    console.log('   ✅ Resume parse cleared');
    
    // 4. Clear AI drafts
    console.log('4. Clearing AI drafts cache...');
    await cacheManager.invalidateNamespace(CACHE_NAMESPACES.AI_DRAFT);
    console.log('   ✅ AI drafts cleared');
    
    // 5. Get cache stats
    console.log('\n5. Checking cache stats...');
    const stats = cacheManager.getStats();
    console.log('   Cache stats:', JSON.stringify(stats, null, 2));
    
    // 6. If Redis is enabled, try to flush it
    if (stats.redisEnabled && stats.redisStatus === 'connected') {
      console.log('\n6. Redis is enabled - attempting FLUSHDB...');
      const redis = cacheManager.getRedisClient();
      if (redis) {
        await redis.flushdb();
        console.log('   ✅ Redis database flushed');
      }
    } else {
      console.log('\n6. Redis not enabled or not connected');
    }
    
    console.log('\n✅ ALL CACHES CLEARED SUCCESSFULLY!\n');
    console.log('⚠️  NOW DO THIS:');
    console.log('   1. Restart your API server (Ctrl+C then npm run dev)');
    console.log('   2. Hard refresh your browser (Ctrl+Shift+R)');
    console.log('   3. Try ATS check again\n');
    
  } catch (error) {
    console.error('\n❌ Error clearing caches:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
}

nuclearCacheClear();

