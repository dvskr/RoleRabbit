#!/usr/bin/env node

/**
 * Load Test: Concurrent LLM Operations
 * 
 * Tests the system's ability to handle multiple simultaneous AI operations
 * (ATS checks, tailoring, content generation).
 * 
 * Usage:
 *   node apps/api/tests/load/llm-operations.test.js
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const NUM_CONCURRENT_OPERATIONS = 50;

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

const SAMPLE_JOB_DESCRIPTION = `
Senior Software Engineer

We are seeking an experienced Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript, TypeScript, React, Node.js
- Experience with cloud platforms (AWS, Azure, GCP)
- Excellent problem-solving skills
- Strong communication and teamwork abilities

Responsibilities:
- Design and implement scalable web applications
- Lead technical discussions and code reviews
- Mentor junior developers
- Collaborate with product team on feature development
`;

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
            name: 'John Doe',
            email: 'john@example.com',
          },
          summary: 'Experienced software engineer with 5+ years of expertise in full-stack development.',
          experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Software Engineer',
              startDate: '2020-01',
              endDate: '2023-12',
              bullets: [
                'Led development of microservices architecture',
                'Improved application performance by 40%',
                'Mentored team of 5 developers',
              ],
            },
          ],
          skills: {
            technical: ['JavaScript', 'React', 'Node.js', 'AWS'],
          },
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

// Perform ATS check
async function performATSCheck(token, resumeId, operationId) {
  const startTime = performance.now();
  
  try {
    const response = await axios.post(
      `${API_URL}/api/editor-ai/ats-check`,
      {
        resumeId,
        jobDescription: SAMPLE_JOB_DESCRIPTION,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 120000, // 2 minute timeout
      }
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      operationId,
      type: 'ATS_CHECK',
      success: true,
      duration,
      statusCode: response.status,
      score: response.data.score,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      operationId,
      type: 'ATS_CHECK',
      success: false,
      duration,
      statusCode: error.response?.status || 0,
      error: error.message,
      isTimeout: error.code === 'ECONNABORTED',
    };
  }
}

// Calculate statistics
function calculateStats(results) {
  const durations = results.map(r => r.duration);
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  const timeoutCount = results.filter(r => r.isTimeout).length;
  
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
    timeoutCount,
    successRate: (successCount / results.length) * 100,
    errorRate: (errorCount / results.length) * 100,
    timeoutRate: (timeoutCount / results.length) * 100,
    durations: {
      min: (min / 1000).toFixed(2),
      max: (max / 1000).toFixed(2),
      avg: (avg / 1000).toFixed(2),
      p50: (p50 / 1000).toFixed(2),
      p95: (p95 / 1000).toFixed(2),
      p99: (p99 / 1000).toFixed(2),
    },
  };
}

// Main load test
async function runLoadTest() {
  logger.info('🚀 Starting Concurrent LLM Operations Load Test\n');
  
  logger.info('Configuration:');
  logger.info(`  API URL: ${API_URL}`);
  logger.info(`  Concurrent Operations: ${NUM_CONCURRENT_OPERATIONS}`);
  logger.info(`  Operation Type: ATS Check`);
  logger.info(`  Timeout: 120 seconds\n`);
  
  try {
    // Step 1: Authenticate
    logger.info('Step 1: Authenticating...');
    const token = await authenticate();
    logger.success('Authentication successful\n');
    
    // Step 2: Create test resume
    logger.info('Step 2: Creating test resume...');
    const resumeId = await createTestResume(token);
    logger.success(`Test resume created: ${resumeId}\n`);
    
    // Step 3: Run concurrent LLM operations
    logger.info('Step 3: Running concurrent LLM operations...');
    logger.warn('⚠️  This may take several minutes...\n');
    
    const testStartTime = performance.now();
    
    const operationPromises = [];
    for (let i = 0; i < NUM_CONCURRENT_OPERATIONS; i++) {
      operationPromises.push(performATSCheck(token, resumeId, i));
      
      // Log progress every 10 operations
      if ((i + 1) % 10 === 0) {
        logger.info(`  Started ${i + 1}/${NUM_CONCURRENT_OPERATIONS} operations...`);
      }
    }
    
    const results = await Promise.all(operationPromises);
    
    const testEndTime = performance.now();
    const totalDuration = ((testEndTime - testStartTime) / 1000).toFixed(2);
    
    logger.success(`\nLoad test completed in ${totalDuration}s\n`);
    
    // Step 4: Calculate and display statistics
    logger.info('📊 Results:\n');
    
    const stats = calculateStats(results);
    
    logger.info('Success Metrics:');
    logger.info(`  Total Requests: ${stats.total}`);
    logger.info(`  Successful: ${stats.successCount} (${stats.successRate.toFixed(2)}%)`);
    logger.info(`  Failed: ${stats.errorCount} (${stats.errorRate.toFixed(2)}%)`);
    logger.info(`  Timeouts: ${stats.timeoutCount} (${stats.timeoutRate.toFixed(2)}%)`);
    logger.info('');
    
    logger.info('Response Time (seconds):');
    logger.info(`  Min: ${stats.durations.min}s`);
    logger.info(`  Avg: ${stats.durations.avg}s`);
    logger.info(`  P50: ${stats.durations.p50}s`);
    logger.info(`  P95: ${stats.durations.p95}s`);
    logger.info(`  P99: ${stats.durations.p99}s`);
    logger.info(`  Max: ${stats.durations.max}s`);
    logger.info('');
    
    logger.info('Throughput:');
    const throughput = (stats.total / parseFloat(totalDuration)).toFixed(2);
    logger.info(`  ${throughput} operations/second`);
    logger.info('');
    
    // Step 5: Evaluate results
    logger.info('🎯 Evaluation:\n');
    
    const targets = {
      successRate: 95,
      p95ResponseTime: 60, // 60 seconds
      timeoutRate: 5,
    };
    
    const passed = {
      successRate: stats.successRate >= targets.successRate,
      p95ResponseTime: parseFloat(stats.durations.p95) <= targets.p95ResponseTime,
      timeoutRate: stats.timeoutRate <= targets.timeoutRate,
    };
    
    logger.info('Target vs Actual:');
    logger.info(`  Success Rate: ${stats.successRate.toFixed(2)}% ${passed.successRate ? '✅' : '❌'} (target: >${targets.successRate}%)`);
    logger.info(`  P95 Response Time: ${stats.durations.p95}s ${passed.p95ResponseTime ? '✅' : '❌'} (target: <${targets.p95ResponseTime}s)`);
    logger.info(`  Timeout Rate: ${stats.timeoutRate.toFixed(2)}% ${passed.timeoutRate ? '✅' : '❌'} (target: <${targets.timeoutRate}%)`);
    logger.info('');
    
    const allPassed = Object.values(passed).every(p => p);
    
    if (allPassed) {
      logger.success('🎉 Load test PASSED! System handles concurrent LLM operations well.\n');
      process.exit(0);
    } else {
      logger.warn('⚠️  Load test FAILED. System may need optimization for concurrent LLM operations.\n');
      
      if (!passed.successRate) {
        logger.warn('💡 Consider: Implementing request queuing or rate limiting');
      }
      if (!passed.p95ResponseTime) {
        logger.warn('💡 Consider: Optimizing LLM prompts or using faster models');
      }
      if (!passed.timeoutRate) {
        logger.warn('💡 Consider: Increasing timeout or implementing retry logic');
      }
      
      logger.info('');
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

