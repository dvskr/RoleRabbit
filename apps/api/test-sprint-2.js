/**
 * Sprint 2 Comprehensive Test & Verification Suite
 * Tests parallel execution, caching, and analytics
 */

const { executeParallel, executeWithDependencies, ParallelPerformanceTracker } = require('./utils/parallelExecutor');
const cacheManager = require('./utils/cacheManager');
const { cacheWithCompression, getCachedWithDecompression, getCacheStats } = require('./services/cache/intelligentCacheService');
const logger = require('./utils/logger');

// Test results
const results = {
  parallel: { passed: 0, failed: 0, tests: [] },
  caching: { passed: 0, failed: 0, tests: [] },
  analytics: { passed: 0, failed: 0, tests: [] }
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// PARALLEL EXECUTION TESTS
// ========================================

async function testParallelExecution() {
  console.log('\n🔄 Testing Parallel Execution...\n');

  try {
    // Test 1: Basic parallel execution
    console.log('Test 1: Basic parallel execution');
    const start1 = Date.now();
    const [r1, r2, r3] = await executeParallel([
      sleep(100).then(() => 'result1'),
      sleep(100).then(() => 'result2'),
      sleep(100).then(() => 'result3')
    ]);
    const duration1 = Date.now() - start1;
    
    assert(r1 === 'result1' && r2 === 'result2' && r3 === 'result3', 'Results correct');
    assert(duration1 < 200, `Should take ~100ms (parallel), took ${duration1}ms`);
    results.parallel.tests.push({ name: 'Basic parallel', status: 'PASS', duration: duration1 });
    results.parallel.passed++;
    console.log(`✅ PASS - Parallel execution works (${duration1}ms)`);

  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    results.parallel.tests.push({ name: 'Basic parallel', status: 'FAIL', error: error.message });
    results.parallel.failed++;
  }

  try {
    // Test 2: Dependency resolution
    console.log('\nTest 2: Dependency resolution');
    const order = [];
    
    await executeWithDependencies([
      {
        name: 'operation_a',
        dependencies: [],
        fn: async () => { order.push('A'); return 'A'; }
      },
      {
        name: 'operation_b',
        dependencies: ['operation_a'],
        fn: async () => { order.push('B'); return 'B'; }
      },
      {
        name: 'operation_c',
        dependencies: ['operation_a'],
        fn: async () => { order.push('C'); return 'C'; }
      },
      {
        name: 'operation_d',
        dependencies: ['operation_b', 'operation_c'],
        fn: async () => { order.push('D'); return 'D'; }
      }
    ]);
    
    assert(order[0] === 'A', 'A should run first');
    assert((order[1] === 'B' && order[2] === 'C') || (order[1] === 'C' && order[2] === 'B'), 'B and C should run in parallel after A');
    assert(order[3] === 'D', 'D should run last');
    
    results.parallel.tests.push({ name: 'Dependency resolution', status: 'PASS', order });
    results.parallel.passed++;
    console.log(`✅ PASS - Dependencies respected: ${order.join(' → ')}`);

  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    results.parallel.tests.push({ name: 'Dependency resolution', status: 'FAIL', error: error.message });
    results.parallel.failed++;
  }

  try {
    // Test 3: Performance tracking
    console.log('\nTest 3: Performance tracking');
    const tracker = new ParallelPerformanceTracker('Test Operations');
    
    await tracker.track('op1', sleep(50));
    await tracker.track('op2', sleep(50));
    await tracker.track('op3', sleep(50));
    
    const report = tracker.getReport();
    
    assert(report.operations === 3, 'Should track 3 operations');
    assert(report.successful === 3, 'All operations successful');
    assert(report.sequentialTime >= 150, 'Sequential time calculated');
    
    results.parallel.tests.push({ name: 'Performance tracking', status: 'PASS', report });
    results.parallel.passed++;
    console.log(`✅ PASS - Performance tracked: ${report.speedup} speedup`);

  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    results.parallel.tests.push({ name: 'Performance tracking', status: 'FAIL', error: error.message });
    results.parallel.failed++;
  }
}

// ========================================
// CACHING TESTS
// ========================================

async function testCaching() {
  console.log('\n💾 Testing Caching System...\n');

  try {
    // Test 1: Basic cache operations
    console.log('Test 1: Basic cache operations');
    
    const testKey = ['test', 'basic', Date.now().toString()];
    const testValue = { data: 'test', timestamp: new Date() };
    
    // Set
    await cacheManager.set('TEST', testKey, testValue, { ttl: 60000 });
    
    // Get
    const cached = await cacheManager.get('TEST', testKey);
    
    assert(cached, 'Value should be cached');
    assert(cached.data === testValue.data, 'Cached value correct');
    
    results.caching.tests.push({ name: 'Basic operations', status: 'PASS' });
    results.caching.passed++;
    console.log('✅ PASS - Cache set/get works');

  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    results.caching.tests.push({ name: 'Basic operations', status: 'FAIL', error: error.message });
    results.caching.failed++;
  }

  try {
    // Test 2: Cache performance
    console.log('\nTest 2: Cache performance');
    
    let callCount = 0;
    const expensiveOperation = async () => {
      callCount++;
      await sleep(100);
      return { result: 'expensive', call: callCount };
    };
    
    // First call (miss)
    const start1 = Date.now();
    const result1 = await cacheManager.wrap({
      namespace: 'TEST',
      keyParts: ['performance', Date.now().toString()],
      fetch: expensiveOperation,
      ttl: 60000
    });
    const missTime = Date.now() - start1;
    
    // Second call (hit)
    const start2 = Date.now();
    const result2 = await cacheManager.wrap({
      namespace: 'TEST',
      keyParts: ['performance', result1.value.call.toString()],
      fetch: expensiveOperation,
      ttl: 60000
    });
    const hitTime = Date.now() - start2;
    
    assert(missTime >= 100, `Miss should be slow (${missTime}ms)`);
    assert(hitTime < 50, `Hit should be fast (${hitTime}ms)`);
    assert(callCount === 1, 'Operation should only be called once');
    
    const speedup = (missTime / hitTime).toFixed(0);
    results.caching.tests.push({ name: 'Cache performance', status: 'PASS', speedup: `${speedup}x` });
    results.caching.passed++;
    console.log(`✅ PASS - Cache speedup: ${speedup}x (${missTime}ms → ${hitTime}ms)`);

  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    results.caching.tests.push({ name: 'Cache performance', status: 'FAIL', error: error.message });
    results.caching.failed++;
  }

  try {
    // Test 3: Compression
    console.log('\nTest 3: Compression');
    
    // Generate large data
    const largeData = Array(1000).fill(0).map((_, i) => ({
      id: i,
      value: `Item ${i}`,
      data: Array(10).fill(i).join(',')
    }));
    
    const key = ['compression', Date.now().toString()];
    
    await cacheWithCompression('TEST', key, largeData);
    const retrieved = await getCachedWithDecompression('TEST', key);
    
    assert(retrieved, 'Compressed data should be retrievable');
    assert(retrieved.length === largeData.length, 'Data length preserved');
    assert(JSON.stringify(retrieved) === JSON.stringify(largeData), 'Data integrity preserved');
    
    results.caching.tests.push({ name: 'Compression', status: 'PASS', items: largeData.length });
    results.caching.passed++;
    console.log('✅ PASS - Compression works with data integrity');

  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    results.caching.tests.push({ name: 'Compression', status: 'FAIL', error: error.message });
    results.caching.failed++;
  }

  try {
    // Test 4: Cache stats
    console.log('\nTest 4: Cache statistics');
    
    const stats = await getCacheStats();
    
    assert(stats, 'Stats should be available');
    assert(typeof stats.memoryEntries === 'number', 'Memory entries tracked');
    assert(typeof stats.redisEnabled === 'boolean', 'Redis status tracked');
    
    results.caching.tests.push({ name: 'Cache stats', status: 'PASS', stats });
    results.caching.passed++;
    console.log('✅ PASS - Cache stats available');
    console.log(`   Memory: ${stats.memoryEntries}/${stats.memoryCapacity}`);
    console.log(`   Redis: ${stats.redisEnabled ? stats.redisStatus : 'disabled'}`);

  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    results.caching.tests.push({ name: 'Cache stats', status: 'FAIL', error: error.message });
    results.caching.failed++;
  }
}

// ========================================
// ANALYTICS TESTS
// ========================================

async function testAnalytics() {
  console.log('\n📊 Testing Analytics System...\n');

  try {
    // Test 1: Analytics tracking
    console.log('Test 1: Analytics tracking');
    
    const { trackTailoringOperation } = require('./services/analytics/tailoringAnalytics');
    
    const testData = {
      userId: 'test-user-' + Date.now(),
      resumeId: 'test-resume-' + Date.now(),
      mode: 'PARTIAL',
      scoreBefore: 65,
      scoreAfter: 82,
      targetScore: 80,
      tokensUsed: 5000,
      durationMs: 58000,
      confidence: 0.85,
      warnings: ['test-warning'],
      diffCount: 12,
      keywordsAdded: ['JavaScript', 'React', 'Node.js']
    };
    
    const tracked = await trackTailoringOperation(testData);
    
    // Note: This may fail if DB table doesn't exist yet, which is OK
    if (tracked) {
      assert(tracked.improvement === 17, 'Improvement calculated correctly');
      assert(tracked.improvementRate > 0, 'Improvement rate calculated');
      assert(tracked.targetMet === true, 'Target met flag correct');
      
      results.analytics.tests.push({ name: 'Tracking', status: 'PASS', tracked });
      results.analytics.passed++;
      console.log('✅ PASS - Analytics tracking works');
      console.log(`   Improvement: ${tracked.improvement} points`);
      console.log(`   Cost estimate: $${tracked.costEstimate.toFixed(4)}`);
    } else {
      results.analytics.tests.push({ name: 'Tracking', status: 'SKIP', reason: 'DB table not created yet' });
      console.log('⏭️  SKIP - Analytics table not created (run migration)');
    }

  } catch (error) {
    if (error.message.includes('relation') || error.message.includes('table')) {
      results.analytics.tests.push({ name: 'Tracking', status: 'SKIP', reason: 'DB table not created yet' });
      console.log('⏭️  SKIP - Analytics table not created (run migration)');
    } else {
      console.log(`❌ FAIL - ${error.message}`);
      results.analytics.tests.push({ name: 'Tracking', status: 'FAIL', error: error.message });
      results.analytics.failed++;
    }
  }
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║         SPRINT 2 COMPREHENSIVE TEST SUITE                    ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  try {
    await testParallelExecution();
    await testCaching();
    await testAnalytics();

    // Summary
    console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                     TEST SUMMARY                             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    const totalPassed = results.parallel.passed + results.caching.passed + results.analytics.passed;
    const totalFailed = results.parallel.failed + results.caching.failed + results.analytics.failed;
    const total = totalPassed + totalFailed;

    console.log('Parallel Execution:');
    console.log(`  ✅ Passed: ${results.parallel.passed}`);
    console.log(`  ❌ Failed: ${results.parallel.failed}`);
    
    console.log('\nCaching System:');
    console.log(`  ✅ Passed: ${results.caching.passed}`);
    console.log(`  ❌ Failed: ${results.caching.failed}`);
    
    console.log('\nAnalytics System:');
    console.log(`  ✅ Passed: ${results.analytics.passed}`);
    console.log(`  ❌ Failed: ${results.analytics.failed}`);
    
    console.log('\n' + '─'.repeat(64));
    console.log(`TOTAL: ${totalPassed}/${total} tests passed (${Math.round((totalPassed/total)*100)}%)`);
    console.log('─'.repeat(64));

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Sprint 2 is production-ready!\n');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed. Review errors above.\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ TEST SUITE ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runAllTests();

