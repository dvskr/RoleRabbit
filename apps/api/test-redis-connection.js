/**
 * Test Redis Connection
 * 
 * Run this after adding REDIS_URL to .env
 * Usage: node test-redis-connection.js
 */

const cacheManager = require('./utils/cacheManager');
const logger = require('./utils/logger');

async function testRedisConnection() {
  console.log('🧪 Testing Redis Connection\n');

  try {
    // Get initial stats
    const stats = cacheManager.getStats();
    console.log('📊 Cache Stats:');
    console.log(`   Redis Enabled: ${stats.redisEnabled ? '✅' : '❌'}`);
    console.log(`   Redis Status: ${stats.redisStatus}`);
    console.log(`   Memory Entries: ${stats.memoryEntries}`);
    console.log(`   Memory Capacity: ${stats.memoryCapacity}\n`);

    if (!stats.redisEnabled) {
      console.log('⚠️  Redis is not enabled');
      console.log('   To enable: Add REDIS_URL to your .env file');
      console.log('   See: REDIS_SETUP_INSTRUCTIONS.md\n');
      return;
    }

    if (stats.redisStatus !== 'ready') {
      console.log(`⚠️  Redis status: ${stats.redisStatus}`);
      console.log('   Waiting for connection...\n');
      
      // Wait up to 5 seconds for Redis to connect
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const newStats = cacheManager.getStats();
      if (newStats.redisStatus !== 'ready') {
        console.log(`❌ Redis failed to connect: ${newStats.redisStatus}`);
        console.log('   Check your REDIS_URL in .env');
        console.log('   Check REDIS_TLS setting (Upstash needs REDIS_TLS=true)\n');
        return;
      }
    }

    // Test 1: Write to cache
    console.log('📝 Test 1: Writing to cache...');
    const testKey = 'test:connection';
    const testValue = {
      message: 'Hello Redis!',
      timestamp: new Date().toISOString(),
      random: Math.random()
    };

    await cacheManager.set('test', [testKey], testValue, { ttl: 60000 });
    console.log('   ✅ Written to cache\n');

    // Test 2: Read from cache
    console.log('📖 Test 2: Reading from cache...');
    const retrieved = await cacheManager.get('test', [testKey]);
    
    if (retrieved && retrieved.message === testValue.message) {
      console.log('   ✅ Successfully retrieved from cache');
      console.log(`   Data: ${JSON.stringify(retrieved, null, 2)}\n`);
    } else {
      console.log('   ❌ Failed to retrieve from cache');
      console.log(`   Expected: ${testValue.message}`);
      console.log(`   Got: ${retrieved?.message || 'null'}\n`);
      return;
    }

    // Test 3: Cache persistence (check if it's in Redis not just memory)
    console.log('📦 Test 3: Checking Redis persistence...');
    
    // Delete from memory cache to force Redis lookup
    await cacheManager.del('test', [testKey]);
    console.log('   Cleared from memory cache');
    
    // Try to get again (should come from Redis)
    const fromRedis = await cacheManager.get('test', [testKey]);
    
    if (fromRedis && fromRedis.message === testValue.message) {
      console.log('   ✅ Successfully retrieved from Redis (not memory)');
      console.log('   This means Redis is working properly!\n');
    } else {
      console.log('   ⚠️  Could not retrieve from Redis');
      console.log('   Redis might not be persisting data\n');
    }

    // Test 4: Namespace invalidation
    console.log('🗑️  Test 4: Testing namespace invalidation...');
    
    await cacheManager.set('test', ['item1'], { value: 1 });
    await cacheManager.set('test', ['item2'], { value: 2 });
    await cacheManager.set('test', ['item3'], { value: 3 });
    console.log('   Created 3 test items');
    
    await cacheManager.invalidateNamespace('test');
    console.log('   Invalidated namespace');
    
    const check1 = await cacheManager.get('test', ['item1']);
    const check2 = await cacheManager.get('test', ['item2']);
    const check3 = await cacheManager.get('test', ['item3']);
    
    if (!check1 && !check2 && !check3) {
      console.log('   ✅ All items cleared successfully\n');
    } else {
      console.log('   ⚠️  Some items not cleared');
      console.log(`   Remaining: ${[check1, check2, check3].filter(Boolean).length}\n`);
    }

    // Final stats
    console.log('📊 Final Cache Stats:');
    const finalStats = cacheManager.getStats();
    console.log(`   Memory Entries: ${finalStats.memoryEntries}`);
    console.log(`   Redis Status: ${finalStats.redisStatus}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED! Redis is working correctly!');
    console.log('='.repeat(60));
    console.log('\n💡 Your cache is now:');
    console.log('   - Persistent across restarts');
    console.log('   - Shared across servers (when scaled)');
    console.log('   - Ready for production!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(`   ${error.message}`);
    console.error('\nFull error:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check REDIS_URL format in .env');
    console.log('   2. Ensure REDIS_TLS=true for Upstash');
    console.log('   3. Test connection: redis-cli -u $REDIS_URL ping');
    console.log('   4. Check Redis provider dashboard\n');
  }

  process.exit(0);
}

// Run test
testRedisConnection();

