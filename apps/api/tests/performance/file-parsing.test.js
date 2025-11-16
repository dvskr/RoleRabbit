/**
 * Performance Test: File Parsing
 * 
 * Scenario: Upload 100 different PDFs
 * Metrics: 
 * - Parsing time <5s per file
 * - Cache hit rate >80% for repeated uploads
 * 
 * Run with: node apps/api/tests/performance/file-parsing.test.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_DATA_DIR = path.join(__dirname, '../../test-data/sample-uploads');
const NUM_UPLOADS = 100;
const CACHE_HIT_THRESHOLD = 0.8; // 80%

// Test statistics
const stats = {
  totalUploads: 0,
  successfulUploads: 0,
  failedUploads: 0,
  totalParseTime: 0,
  minParseTime: Infinity,
  maxParseTime: 0,
  parseTimes: [],
  cacheHits: 0,
  cacheMisses: 0,
};

/**
 * Upload a file and measure parsing time
 */
async function uploadFile(filePath, iteration) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('userId', 'test-user-performance');

  const startTime = performance.now();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/resumes/parse`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Bearer test-jwt-token',
        },
        timeout: 10000, // 10s timeout
      }
    );

    const endTime = performance.now();
    const parseTime = endTime - startTime;

    stats.totalUploads++;
    stats.successfulUploads++;
    stats.totalParseTime += parseTime;
    stats.parseTimes.push(parseTime);
    stats.minParseTime = Math.min(stats.minParseTime, parseTime);
    stats.maxParseTime = Math.max(stats.maxParseTime, parseTime);

    // Check if response indicates cache hit
    if (response.data.cached || response.data.cacheHit) {
      stats.cacheHits++;
    } else {
      stats.cacheMisses++;
    }

    // Validate parsing time
    if (parseTime > 5000) {
      console.warn(`⚠️  Slow parse (${parseTime.toFixed(0)}ms): ${path.basename(filePath)} (iteration ${iteration})`);
    }

    return {
      success: true,
      parseTime,
      cached: response.data.cached || response.data.cacheHit,
    };
  } catch (error) {
    const endTime = performance.now();
    const parseTime = endTime - startTime;

    stats.totalUploads++;
    stats.failedUploads++;

    console.error(`❌ Upload failed: ${path.basename(filePath)} (iteration ${iteration})`, error.message);

    return {
      success: false,
      parseTime,
      error: error.message,
    };
  }
}

/**
 * Run the performance test
 */
async function runPerformanceTest() {
  console.log('========================================');
  console.log('File Parsing Performance Test');
  console.log('========================================\n');

  // Get all test files
  const testFiles = fs.readdirSync(TEST_DATA_DIR)
    .filter(file => file.endsWith('.pdf') || file.endsWith('.docx'))
    .map(file => path.join(TEST_DATA_DIR, file));

  if (testFiles.length === 0) {
    console.error('❌ No test files found in', TEST_DATA_DIR);
    process.exit(1);
  }

  console.log(`📁 Found ${testFiles.length} test files`);
  console.log(`🎯 Target: ${NUM_UPLOADS} uploads\n`);

  // Phase 1: Initial uploads (cache misses expected)
  console.log('Phase 1: Initial uploads (cache misses)...');
  const phase1Uploads = Math.min(testFiles.length, NUM_UPLOADS);
  
  for (let i = 0; i < phase1Uploads; i++) {
    const file = testFiles[i % testFiles.length];
    await uploadFile(file, i + 1);
    
    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`  Uploaded ${i + 1}/${phase1Uploads} files...`);
    }
  }

  console.log('✅ Phase 1 complete\n');

  // Phase 2: Repeat uploads (cache hits expected)
  if (NUM_UPLOADS > testFiles.length) {
    console.log('Phase 2: Repeat uploads (cache hits expected)...');
    const phase2Uploads = NUM_UPLOADS - phase1Uploads;
    
    for (let i = 0; i < phase2Uploads; i++) {
      const file = testFiles[i % testFiles.length];
      await uploadFile(file, phase1Uploads + i + 1);
      
      if ((i + 1) % 10 === 0) {
        console.log(`  Uploaded ${i + 1}/${phase2Uploads} files...`);
      }
    }

    console.log('✅ Phase 2 complete\n');
  }

  // Calculate statistics
  const avgParseTime = stats.totalParseTime / stats.successfulUploads;
  const cacheHitRate = stats.cacheHits / stats.totalUploads;
  
  // Calculate percentiles
  stats.parseTimes.sort((a, b) => a - b);
  const p50 = stats.parseTimes[Math.floor(stats.parseTimes.length * 0.5)];
  const p95 = stats.parseTimes[Math.floor(stats.parseTimes.length * 0.95)];
  const p99 = stats.parseTimes[Math.floor(stats.parseTimes.length * 0.99)];

  // Print results
  console.log('========================================');
  console.log('Test Results');
  console.log('========================================\n');

  console.log('📊 Upload Statistics:');
  console.log(`  Total uploads:      ${stats.totalUploads}`);
  console.log(`  Successful:         ${stats.successfulUploads}`);
  console.log(`  Failed:             ${stats.failedUploads}`);
  console.log(`  Success rate:       ${((stats.successfulUploads / stats.totalUploads) * 100).toFixed(2)}%\n`);

  console.log('⏱️  Parse Time Statistics:');
  console.log(`  Average:            ${avgParseTime.toFixed(0)}ms`);
  console.log(`  Minimum:            ${stats.minParseTime.toFixed(0)}ms`);
  console.log(`  Maximum:            ${stats.maxParseTime.toFixed(0)}ms`);
  console.log(`  Median (p50):       ${p50.toFixed(0)}ms`);
  console.log(`  p95:                ${p95.toFixed(0)}ms`);
  console.log(`  p99:                ${p99.toFixed(0)}ms\n`);

  console.log('💾 Cache Statistics:');
  console.log(`  Cache hits:         ${stats.cacheHits}`);
  console.log(`  Cache misses:       ${stats.cacheMisses}`);
  console.log(`  Cache hit rate:     ${(cacheHitRate * 100).toFixed(2)}%\n`);

  // Validate results
  console.log('========================================');
  console.log('Validation');
  console.log('========================================\n');

  let allPassed = true;

  // Check parse time
  if (p95 < 5000) {
    console.log('✅ Parse time p95 < 5s:', `${p95.toFixed(0)}ms`);
  } else {
    console.log('❌ Parse time p95 >= 5s:', `${p95.toFixed(0)}ms`);
    allPassed = false;
  }

  // Check cache hit rate (only for repeat uploads)
  if (NUM_UPLOADS > testFiles.length) {
    if (cacheHitRate >= CACHE_HIT_THRESHOLD) {
      console.log(`✅ Cache hit rate >= ${CACHE_HIT_THRESHOLD * 100}%:`, `${(cacheHitRate * 100).toFixed(2)}%`);
    } else {
      console.log(`❌ Cache hit rate < ${CACHE_HIT_THRESHOLD * 100}%:`, `${(cacheHitRate * 100).toFixed(2)}%`);
      allPassed = false;
    }
  } else {
    console.log(`⚠️  Cache hit rate not validated (need more uploads)`);
  }

  console.log('\n========================================');
  if (allPassed) {
    console.log('✅ All performance tests PASSED');
  } else {
    console.log('❌ Some performance tests FAILED');
  }
  console.log('========================================\n');

  process.exit(allPassed ? 0 : 1);
}

// Run the test
runPerformanceTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});

 * Performance Test: File Parsing
 * 
 * Scenario: Upload 100 different PDFs
 * Metrics: 
 * - Parsing time <5s per file
 * - Cache hit rate >80% for repeated uploads
 * 
 * Run with: node apps/api/tests/performance/file-parsing.test.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_DATA_DIR = path.join(__dirname, '../../test-data/sample-uploads');
const NUM_UPLOADS = 100;
const CACHE_HIT_THRESHOLD = 0.8; // 80%

// Test statistics
const stats = {
  totalUploads: 0,
  successfulUploads: 0,
  failedUploads: 0,
  totalParseTime: 0,
  minParseTime: Infinity,
  maxParseTime: 0,
  parseTimes: [],
  cacheHits: 0,
  cacheMisses: 0,
};

/**
 * Upload a file and measure parsing time
 */
async function uploadFile(filePath, iteration) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('userId', 'test-user-performance');

  const startTime = performance.now();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/resumes/parse`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Bearer test-jwt-token',
        },
        timeout: 10000, // 10s timeout
      }
    );

    const endTime = performance.now();
    const parseTime = endTime - startTime;

    stats.totalUploads++;
    stats.successfulUploads++;
    stats.totalParseTime += parseTime;
    stats.parseTimes.push(parseTime);
    stats.minParseTime = Math.min(stats.minParseTime, parseTime);
    stats.maxParseTime = Math.max(stats.maxParseTime, parseTime);

    // Check if response indicates cache hit
    if (response.data.cached || response.data.cacheHit) {
      stats.cacheHits++;
    } else {
      stats.cacheMisses++;
    }

    // Validate parsing time
    if (parseTime > 5000) {
      console.warn(`⚠️  Slow parse (${parseTime.toFixed(0)}ms): ${path.basename(filePath)} (iteration ${iteration})`);
    }

    return {
      success: true,
      parseTime,
      cached: response.data.cached || response.data.cacheHit,
    };
  } catch (error) {
    const endTime = performance.now();
    const parseTime = endTime - startTime;

    stats.totalUploads++;
    stats.failedUploads++;

    console.error(`❌ Upload failed: ${path.basename(filePath)} (iteration ${iteration})`, error.message);

    return {
      success: false,
      parseTime,
      error: error.message,
    };
  }
}

/**
 * Run the performance test
 */
async function runPerformanceTest() {
  console.log('========================================');
  console.log('File Parsing Performance Test');
  console.log('========================================\n');

  // Get all test files
  const testFiles = fs.readdirSync(TEST_DATA_DIR)
    .filter(file => file.endsWith('.pdf') || file.endsWith('.docx'))
    .map(file => path.join(TEST_DATA_DIR, file));

  if (testFiles.length === 0) {
    console.error('❌ No test files found in', TEST_DATA_DIR);
    process.exit(1);
  }

  console.log(`📁 Found ${testFiles.length} test files`);
  console.log(`🎯 Target: ${NUM_UPLOADS} uploads\n`);

  // Phase 1: Initial uploads (cache misses expected)
  console.log('Phase 1: Initial uploads (cache misses)...');
  const phase1Uploads = Math.min(testFiles.length, NUM_UPLOADS);
  
  for (let i = 0; i < phase1Uploads; i++) {
    const file = testFiles[i % testFiles.length];
    await uploadFile(file, i + 1);
    
    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`  Uploaded ${i + 1}/${phase1Uploads} files...`);
    }
  }

  console.log('✅ Phase 1 complete\n');

  // Phase 2: Repeat uploads (cache hits expected)
  if (NUM_UPLOADS > testFiles.length) {
    console.log('Phase 2: Repeat uploads (cache hits expected)...');
    const phase2Uploads = NUM_UPLOADS - phase1Uploads;
    
    for (let i = 0; i < phase2Uploads; i++) {
      const file = testFiles[i % testFiles.length];
      await uploadFile(file, phase1Uploads + i + 1);
      
      if ((i + 1) % 10 === 0) {
        console.log(`  Uploaded ${i + 1}/${phase2Uploads} files...`);
      }
    }

    console.log('✅ Phase 2 complete\n');
  }

  // Calculate statistics
  const avgParseTime = stats.totalParseTime / stats.successfulUploads;
  const cacheHitRate = stats.cacheHits / stats.totalUploads;
  
  // Calculate percentiles
  stats.parseTimes.sort((a, b) => a - b);
  const p50 = stats.parseTimes[Math.floor(stats.parseTimes.length * 0.5)];
  const p95 = stats.parseTimes[Math.floor(stats.parseTimes.length * 0.95)];
  const p99 = stats.parseTimes[Math.floor(stats.parseTimes.length * 0.99)];

  // Print results
  console.log('========================================');
  console.log('Test Results');
  console.log('========================================\n');

  console.log('📊 Upload Statistics:');
  console.log(`  Total uploads:      ${stats.totalUploads}`);
  console.log(`  Successful:         ${stats.successfulUploads}`);
  console.log(`  Failed:             ${stats.failedUploads}`);
  console.log(`  Success rate:       ${((stats.successfulUploads / stats.totalUploads) * 100).toFixed(2)}%\n`);

  console.log('⏱️  Parse Time Statistics:');
  console.log(`  Average:            ${avgParseTime.toFixed(0)}ms`);
  console.log(`  Minimum:            ${stats.minParseTime.toFixed(0)}ms`);
  console.log(`  Maximum:            ${stats.maxParseTime.toFixed(0)}ms`);
  console.log(`  Median (p50):       ${p50.toFixed(0)}ms`);
  console.log(`  p95:                ${p95.toFixed(0)}ms`);
  console.log(`  p99:                ${p99.toFixed(0)}ms\n`);

  console.log('💾 Cache Statistics:');
  console.log(`  Cache hits:         ${stats.cacheHits}`);
  console.log(`  Cache misses:       ${stats.cacheMisses}`);
  console.log(`  Cache hit rate:     ${(cacheHitRate * 100).toFixed(2)}%\n`);

  // Validate results
  console.log('========================================');
  console.log('Validation');
  console.log('========================================\n');

  let allPassed = true;

  // Check parse time
  if (p95 < 5000) {
    console.log('✅ Parse time p95 < 5s:', `${p95.toFixed(0)}ms`);
  } else {
    console.log('❌ Parse time p95 >= 5s:', `${p95.toFixed(0)}ms`);
    allPassed = false;
  }

  // Check cache hit rate (only for repeat uploads)
  if (NUM_UPLOADS > testFiles.length) {
    if (cacheHitRate >= CACHE_HIT_THRESHOLD) {
      console.log(`✅ Cache hit rate >= ${CACHE_HIT_THRESHOLD * 100}%:`, `${(cacheHitRate * 100).toFixed(2)}%`);
    } else {
      console.log(`❌ Cache hit rate < ${CACHE_HIT_THRESHOLD * 100}%:`, `${(cacheHitRate * 100).toFixed(2)}%`);
      allPassed = false;
    }
  } else {
    console.log(`⚠️  Cache hit rate not validated (need more uploads)`);
  }

  console.log('\n========================================');
  if (allPassed) {
    console.log('✅ All performance tests PASSED');
  } else {
    console.log('❌ Some performance tests FAILED');
  }
  console.log('========================================\n');

  process.exit(allPassed ? 0 : 1);
}

// Run the test
runPerformanceTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});

