#!/usr/bin/env node

/**
 * Load Test: Concurrent Resume Saves
 * 
 * Tests the system's ability to handle multiple simultaneous resume save operations.
 * 
 * Usage:
 *   node apps/api/tests/load/concurrent-saves.test.js
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const NUM_CONCURRENT_USERS = 100;
const NUM_SAVES_PER_USER = 5;

// Test user credentials (should exist in dev database)
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

const logger = {
  info: (...args) => console.log('ℹ️', ...args),
  success: (...args) => console.log('✅', ...args),
  error: (...args) => console.error('❌', ...args),
  warn: (...args) => console.warn('⚠️', ...args),
};

// Authenticate and get token
async function authenticate() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, TEST_USER);
    return response.data.token;
  } catch (error) {
    logger.error('Authentication failed:', error.message);
    throw error;
  }
}

// Create a test resume
async function createTestResume(token) {
  try {
    const response = await axios.post(
      `${API_URL}/api/base-resumes`,
      {
        name: `Load Test Resume ${Date.now()}`,
        data: {
          contact: {
            name: 'Test User',
            email: 'test@example.com',
          },
          summary: 'Test summary',
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.resume.id;
  } catch (error) {
    logger.error('Failed to create test resume:', error.message);
    throw error;
  }
}

// Simulate a user saving a resume
async function saveResume(token, resumeId, iteration) {
  const startTime = performance.now();
  
  try {
    await axios.patch(
      `${API_URL}/api/base-resumes/${resumeId}`,
      {
        data: {
          contact: {
            name: `Test User ${iteration}`,
            email: 'test@example.com',
          },
          summary: `Updated summary ${iteration} at ${Date.now()}`,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      success: true,
      duration,
      statusCode: 200,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      success: false,
      duration,
      statusCode: error.response?.status || 0,
      error: error.message,
    };
  }
}

// Simulate a single user's save operations
async function simulateUser(userId, token, resumeId) {
  const results = [];
  
  for (let i = 0; i < NUM_SAVES_PER_USER; i++) {
    const result = await saveResume(token, resumeId, i);
    results.push(result);
    
    // Small delay between saves (100ms)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Calculate statistics
function calculateStats(results) {
  const durations = results.map(r => r.duration);
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  
  durations.sort((a, b) => a - b);
  
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];
  
  return {
    total: results.length,
    successCount,
    errorCount,
    successRate: (successCount / results.length) * 100,
    errorRate: (errorCount / results.length) * 100,
    durations: {
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      p50: p50.toFixed(2),
      p95: p95.toFixed(2),
      p99: p99.toFixed(2),
    },
  };
}

// Main load test
async function runLoadTest() {
  logger.info('🚀 Starting Concurrent Resume Saves Load Test\n');
  
  logger.info('Configuration:');
  logger.info(`  API URL: ${API_URL}`);
  logger.info(`  Concurrent Users: ${NUM_CONCURRENT_USERS}`);
  logger.info(`  Saves per User: ${NUM_SAVES_PER_USER}`);
  logger.info(`  Total Operations: ${NUM_CONCURRENT_USERS * NUM_SAVES_PER_USER}\n`);
  
  try {
    // Step 1: Authenticate
    logger.info('Step 1: Authenticating...');
    const token = await authenticate();
    logger.success('Authentication successful\n');
    
    // Step 2: Create test resume
    logger.info('Step 2: Creating test resume...');
    const resumeId = await createTestResume(token);
    logger.success(`Test resume created: ${resumeId}\n`);
    
    // Step 3: Run concurrent saves
    logger.info('Step 3: Running concurrent save operations...');
    const testStartTime = performance.now();
    
    const userPromises = [];
    for (let i = 0; i < NUM_CONCURRENT_USERS; i++) {
      userPromises.push(simulateUser(i, token, resumeId));
    }
    
    const allResults = await Promise.all(userPromises);
    const flatResults = allResults.flat();
    
    const testEndTime = performance.now();
    const totalDuration = ((testEndTime - testStartTime) / 1000).toFixed(2);
    
    logger.success(`Load test completed in ${totalDuration}s\n`);
    
    // Step 4: Calculate and display statistics
    logger.info('📊 Results:\n');
    
    const stats = calculateStats(flatResults);
    
    logger.info('Success Metrics:');
    logger.info(`  Total Requests: ${stats.total}`);
    logger.info(`  Successful: ${stats.successCount} (${stats.successRate.toFixed(2)}%)`);
    logger.info(`  Failed: ${stats.errorCount} (${stats.errorRate.toFixed(2)}%)`);
    logger.info('');
    
    logger.info('Response Time (ms):');
    logger.info(`  Min: ${stats.durations.min}ms`);
    logger.info(`  Avg: ${stats.durations.avg}ms`);
    logger.info(`  P50: ${stats.durations.p50}ms`);
    logger.info(`  P95: ${stats.durations.p95}ms`);
    logger.info(`  P99: ${stats.durations.p99}ms`);
    logger.info(`  Max: ${stats.durations.max}ms`);
    logger.info('');
    
    logger.info('Throughput:');
    const throughput = (stats.total / parseFloat(totalDuration)).toFixed(2);
    logger.info(`  ${throughput} requests/second`);
    logger.info('');
    
    // Step 5: Evaluate results
    logger.info('🎯 Evaluation:\n');
    
    const targets = {
      successRate: 99.5,
      p95ResponseTime: 500,
      errorRate: 0.5,
    };
    
    const passed = {
      successRate: stats.successRate >= targets.successRate,
      p95ResponseTime: parseFloat(stats.durations.p95) <= targets.p95ResponseTime,
      errorRate: stats.errorRate <= targets.errorRate,
    };
    
    logger.info('Target vs Actual:');
    logger.info(`  Success Rate: ${stats.successRate.toFixed(2)}% ${passed.successRate ? '✅' : '❌'} (target: >${targets.successRate}%)`);
    logger.info(`  P95 Response Time: ${stats.durations.p95}ms ${passed.p95ResponseTime ? '✅' : '❌'} (target: <${targets.p95ResponseTime}ms)`);
    logger.info(`  Error Rate: ${stats.errorRate.toFixed(2)}% ${passed.errorRate ? '✅' : '❌'} (target: <${targets.errorRate}%)`);
    logger.info('');
    
    const allPassed = Object.values(passed).every(p => p);
    
    if (allPassed) {
      logger.success('🎉 Load test PASSED! System meets all performance targets.\n');
      process.exit(0);
    } else {
      logger.warn('⚠️  Load test FAILED. System does not meet all performance targets.\n');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('Load test failed:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runLoadTest();
}

module.exports = { runLoadTest };
