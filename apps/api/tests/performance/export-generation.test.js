/**
 * Performance Test: Export Generation
 * 
 * Scenario: Generate 100 PDFs concurrently
 * Metrics:
 * - Time per export <10s
 * - No memory leaks
 * 
 * Run with: node apps/api/tests/performance/export-generation.test.js
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const NUM_EXPORTS = 100;
const CONCURRENCY = 10; // Number of concurrent exports
const EXPORT_TIME_THRESHOLD = 10000; // 10s

// Test statistics
const stats = {
  totalExports: 0,
  successfulExports: 0,
  failedExports: 0,
  totalExportTime: 0,
  minExportTime: Infinity,
  maxExportTime: 0,
  exportTimes: [],
  memorySnapshots: [],
};

// Sample resume data for export
const SAMPLE_RESUME = {
  contact: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0100',
    location: 'San Francisco, CA',
    links: [
      { type: 'linkedin', url: 'https://linkedin.com/in/johndoe' },
      { type: 'github', url: 'https://github.com/johndoe' }
    ]
  },
  summary: 'Experienced software engineer with 8+ years of experience in full-stack development, specializing in React, Node.js, and cloud infrastructure. Proven track record of building scalable applications and leading engineering teams.',
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2020-01',
      endDate: null,
      isCurrent: true,
      bullets: [
        'Led development of microservices architecture serving 1M+ users',
        'Improved system performance by 40% through optimization and caching',
        'Mentored 5 junior developers and conducted code reviews',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
        'Designed and built real-time analytics dashboard using React and WebSockets'
      ]
    },
    {
      company: 'Startup Inc',
      role: 'Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2018-06',
      endDate: '2019-12',
      isCurrent: false,
      bullets: [
        'Built MVP for SaaS product from scratch using MERN stack',
        'Integrated payment processing with Stripe',
        'Implemented authentication and authorization using JWT',
        'Developed RESTful APIs serving mobile and web clients'
      ]
    },
    {
      company: 'Digital Agency',
      role: 'Junior Developer',
      location: 'Los Angeles, CA',
      startDate: '2016-01',
      endDate: '2018-05',
      isCurrent: false,
      bullets: [
        'Developed responsive websites for 20+ clients',
        'Collaborated with designers to implement pixel-perfect UIs',
        'Maintained legacy PHP applications'
      ]
    }
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2012-09',
      endDate: '2016-05',
      gpa: '3.8',
      honors: 'Magna Cum Laude'
    }
  ],
  skills: {
    technical: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
      'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes',
      'Git', 'CI/CD', 'REST APIs', 'GraphQL', 'WebSockets'
    ],
    soft: [
      'Leadership', 'Communication', 'Problem Solving',
      'Team Collaboration', 'Agile/Scrum', 'Mentoring'
    ]
  },
  projects: [
    {
      title: 'Open Source Contribution',
      description: 'Core contributor to popular React library with 10k+ stars',
      technologies: ['React', 'TypeScript', 'Jest'],
      link: 'https://github.com/example/project'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022-06'
    }
  ]
};

/**
 * Generate a single export and measure time
 */
async function generateExport(iteration) {
  const startTime = performance.now();
  const memoryBefore = process.memoryUsage();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/base-resumes/export`,
      {
        format: 'pdf',
        data: SAMPLE_RESUME,
        formatting: {
          fontFamily: 'Inter',
          fontSize: 11,
          lineSpacing: 1.2,
          margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-jwt-token',
        },
        timeout: 15000, // 15s timeout
      }
    );

    const endTime = performance.now();
    const exportTime = endTime - startTime;
    const memoryAfter = process.memoryUsage();

    stats.totalExports++;
    stats.successfulExports++;
    stats.totalExportTime += exportTime;
    stats.exportTimes.push(exportTime);
    stats.minExportTime = Math.min(stats.minExportTime, exportTime);
    stats.maxExportTime = Math.max(stats.maxExportTime, exportTime);

    // Track memory usage
    stats.memorySnapshots.push({
      iteration,
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      external: memoryAfter.external - memoryBefore.external,
    });

    // Validate export time
    if (exportTime > EXPORT_TIME_THRESHOLD) {
      console.warn(`⚠️  Slow export (${exportTime.toFixed(0)}ms): iteration ${iteration}`);
    }

    return {
      success: true,
      exportTime,
      fileUrl: response.data.fileUrl,
    };
  } catch (error) {
    const endTime = performance.now();
    const exportTime = endTime - startTime;

    stats.totalExports++;
    stats.failedExports++;

    console.error(`❌ Export failed (iteration ${iteration}):`, error.message);

    return {
      success: false,
      exportTime,
      error: error.message,
    };
  }
}

/**
 * Run exports with controlled concurrency
 */
async function runConcurrentExports(total, concurrency) {
  const results = [];
  let completed = 0;

  for (let i = 0; i < total; i += concurrency) {
    const batch = [];
    const batchSize = Math.min(concurrency, total - i);

    for (let j = 0; j < batchSize; j++) {
      batch.push(generateExport(i + j + 1));
    }

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    completed += batchSize;

    console.log(`  Completed ${completed}/${total} exports...`);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  return results;
}

/**
 * Analyze memory usage for leaks
 */
function analyzeMemoryLeaks() {
  if (stats.memorySnapshots.length < 10) {
    return { hasLeak: false, message: 'Insufficient data' };
  }

  // Compare first 10% vs last 10% of snapshots
  const firstBatch = stats.memorySnapshots.slice(0, Math.floor(stats.memorySnapshots.length * 0.1));
  const lastBatch = stats.memorySnapshots.slice(-Math.floor(stats.memorySnapshots.length * 0.1));

  const avgHeapFirst = firstBatch.reduce((sum, s) => sum + s.heapUsed, 0) / firstBatch.length;
  const avgHeapLast = lastBatch.reduce((sum, s) => sum + s.heapUsed, 0) / lastBatch.length;

  const heapGrowth = avgHeapLast - avgHeapFirst;
  const heapGrowthPercent = (heapGrowth / avgHeapFirst) * 100;

  // If heap grows by more than 50%, potential leak
  const hasLeak = heapGrowthPercent > 50;

  return {
    hasLeak,
    heapGrowth,
    heapGrowthPercent,
    avgHeapFirst,
    avgHeapLast,
    message: hasLeak 
      ? `Potential memory leak detected: ${heapGrowthPercent.toFixed(2)}% growth`
      : `Memory usage stable: ${heapGrowthPercent.toFixed(2)}% growth`
  };
}

/**
 * Run the performance test
 */
async function runPerformanceTest() {
  console.log('========================================');
  console.log('Export Generation Performance Test');
  console.log('========================================\n');

  console.log(`🎯 Target: ${NUM_EXPORTS} exports`);
  console.log(`⚡ Concurrency: ${CONCURRENCY}\n`);

  console.log('Starting export generation...');
  const startTime = performance.now();

  await runConcurrentExports(NUM_EXPORTS, CONCURRENCY);

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  // Calculate statistics
  const avgExportTime = stats.totalExportTime / stats.successfulExports;
  const throughput = (stats.successfulExports / totalTime) * 1000; // exports per second

  // Calculate percentiles
  stats.exportTimes.sort((a, b) => a - b);
  const p50 = stats.exportTimes[Math.floor(stats.exportTimes.length * 0.5)];
  const p95 = stats.exportTimes[Math.floor(stats.exportTimes.length * 0.95)];
  const p99 = stats.exportTimes[Math.floor(stats.exportTimes.length * 0.99)];

  // Analyze memory
  const memoryAnalysis = analyzeMemoryLeaks();

  // Print results
  console.log('\n========================================');
  console.log('Test Results');
  console.log('========================================\n');

  console.log('📊 Export Statistics:');
  console.log(`  Total exports:      ${stats.totalExports}`);
  console.log(`  Successful:         ${stats.successfulExports}`);
  console.log(`  Failed:             ${stats.failedExports}`);
  console.log(`  Success rate:       ${((stats.successfulExports / stats.totalExports) * 100).toFixed(2)}%`);
  console.log(`  Total time:         ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`  Throughput:         ${throughput.toFixed(2)} exports/sec\n`);

  console.log('⏱️  Export Time Statistics:');
  console.log(`  Average:            ${avgExportTime.toFixed(0)}ms`);
  console.log(`  Minimum:            ${stats.minExportTime.toFixed(0)}ms`);
  console.log(`  Maximum:            ${stats.maxExportTime.toFixed(0)}ms`);
  console.log(`  Median (p50):       ${p50.toFixed(0)}ms`);
  console.log(`  p95:                ${p95.toFixed(0)}ms`);
  console.log(`  p99:                ${p99.toFixed(0)}ms\n`);

  console.log('💾 Memory Analysis:');
  console.log(`  Status:             ${memoryAnalysis.hasLeak ? '❌ Potential leak' : '✅ Stable'}`);
  console.log(`  Heap growth:        ${(memoryAnalysis.heapGrowth / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Growth percent:     ${memoryAnalysis.heapGrowthPercent.toFixed(2)}%`);
  console.log(`  Avg heap (first):   ${(memoryAnalysis.avgHeapFirst / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Avg heap (last):    ${(memoryAnalysis.avgHeapLast / 1024 / 1024).toFixed(2)} MB\n`);

  // Validate results
  console.log('========================================');
  console.log('Validation');
  console.log('========================================\n');

  let allPassed = true;

  // Check export time
  if (p95 < EXPORT_TIME_THRESHOLD) {
    console.log(`✅ Export time p95 < ${EXPORT_TIME_THRESHOLD / 1000}s:`, `${p95.toFixed(0)}ms`);
  } else {
    console.log(`❌ Export time p95 >= ${EXPORT_TIME_THRESHOLD / 1000}s:`, `${p95.toFixed(0)}ms`);
    allPassed = false;
  }

  // Check memory leaks
  if (!memoryAnalysis.hasLeak) {
    console.log('✅ No memory leaks detected');
  } else {
    console.log('❌ Potential memory leak detected');
    allPassed = false;
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

 * Performance Test: Export Generation
 * 
 * Scenario: Generate 100 PDFs concurrently
 * Metrics:
 * - Time per export <10s
 * - No memory leaks
 * 
 * Run with: node apps/api/tests/performance/export-generation.test.js
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const NUM_EXPORTS = 100;
const CONCURRENCY = 10; // Number of concurrent exports
const EXPORT_TIME_THRESHOLD = 10000; // 10s

// Test statistics
const stats = {
  totalExports: 0,
  successfulExports: 0,
  failedExports: 0,
  totalExportTime: 0,
  minExportTime: Infinity,
  maxExportTime: 0,
  exportTimes: [],
  memorySnapshots: [],
};

// Sample resume data for export
const SAMPLE_RESUME = {
  contact: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0100',
    location: 'San Francisco, CA',
    links: [
      { type: 'linkedin', url: 'https://linkedin.com/in/johndoe' },
      { type: 'github', url: 'https://github.com/johndoe' }
    ]
  },
  summary: 'Experienced software engineer with 8+ years of experience in full-stack development, specializing in React, Node.js, and cloud infrastructure. Proven track record of building scalable applications and leading engineering teams.',
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2020-01',
      endDate: null,
      isCurrent: true,
      bullets: [
        'Led development of microservices architecture serving 1M+ users',
        'Improved system performance by 40% through optimization and caching',
        'Mentored 5 junior developers and conducted code reviews',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
        'Designed and built real-time analytics dashboard using React and WebSockets'
      ]
    },
    {
      company: 'Startup Inc',
      role: 'Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2018-06',
      endDate: '2019-12',
      isCurrent: false,
      bullets: [
        'Built MVP for SaaS product from scratch using MERN stack',
        'Integrated payment processing with Stripe',
        'Implemented authentication and authorization using JWT',
        'Developed RESTful APIs serving mobile and web clients'
      ]
    },
    {
      company: 'Digital Agency',
      role: 'Junior Developer',
      location: 'Los Angeles, CA',
      startDate: '2016-01',
      endDate: '2018-05',
      isCurrent: false,
      bullets: [
        'Developed responsive websites for 20+ clients',
        'Collaborated with designers to implement pixel-perfect UIs',
        'Maintained legacy PHP applications'
      ]
    }
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2012-09',
      endDate: '2016-05',
      gpa: '3.8',
      honors: 'Magna Cum Laude'
    }
  ],
  skills: {
    technical: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
      'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes',
      'Git', 'CI/CD', 'REST APIs', 'GraphQL', 'WebSockets'
    ],
    soft: [
      'Leadership', 'Communication', 'Problem Solving',
      'Team Collaboration', 'Agile/Scrum', 'Mentoring'
    ]
  },
  projects: [
    {
      title: 'Open Source Contribution',
      description: 'Core contributor to popular React library with 10k+ stars',
      technologies: ['React', 'TypeScript', 'Jest'],
      link: 'https://github.com/example/project'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022-06'
    }
  ]
};

/**
 * Generate a single export and measure time
 */
async function generateExport(iteration) {
  const startTime = performance.now();
  const memoryBefore = process.memoryUsage();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/base-resumes/export`,
      {
        format: 'pdf',
        data: SAMPLE_RESUME,
        formatting: {
          fontFamily: 'Inter',
          fontSize: 11,
          lineSpacing: 1.2,
          margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-jwt-token',
        },
        timeout: 15000, // 15s timeout
      }
    );

    const endTime = performance.now();
    const exportTime = endTime - startTime;
    const memoryAfter = process.memoryUsage();

    stats.totalExports++;
    stats.successfulExports++;
    stats.totalExportTime += exportTime;
    stats.exportTimes.push(exportTime);
    stats.minExportTime = Math.min(stats.minExportTime, exportTime);
    stats.maxExportTime = Math.max(stats.maxExportTime, exportTime);

    // Track memory usage
    stats.memorySnapshots.push({
      iteration,
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      external: memoryAfter.external - memoryBefore.external,
    });

    // Validate export time
    if (exportTime > EXPORT_TIME_THRESHOLD) {
      console.warn(`⚠️  Slow export (${exportTime.toFixed(0)}ms): iteration ${iteration}`);
    }

    return {
      success: true,
      exportTime,
      fileUrl: response.data.fileUrl,
    };
  } catch (error) {
    const endTime = performance.now();
    const exportTime = endTime - startTime;

    stats.totalExports++;
    stats.failedExports++;

    console.error(`❌ Export failed (iteration ${iteration}):`, error.message);

    return {
      success: false,
      exportTime,
      error: error.message,
    };
  }
}

/**
 * Run exports with controlled concurrency
 */
async function runConcurrentExports(total, concurrency) {
  const results = [];
  let completed = 0;

  for (let i = 0; i < total; i += concurrency) {
    const batch = [];
    const batchSize = Math.min(concurrency, total - i);

    for (let j = 0; j < batchSize; j++) {
      batch.push(generateExport(i + j + 1));
    }

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    completed += batchSize;

    console.log(`  Completed ${completed}/${total} exports...`);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  return results;
}

/**
 * Analyze memory usage for leaks
 */
function analyzeMemoryLeaks() {
  if (stats.memorySnapshots.length < 10) {
    return { hasLeak: false, message: 'Insufficient data' };
  }

  // Compare first 10% vs last 10% of snapshots
  const firstBatch = stats.memorySnapshots.slice(0, Math.floor(stats.memorySnapshots.length * 0.1));
  const lastBatch = stats.memorySnapshots.slice(-Math.floor(stats.memorySnapshots.length * 0.1));

  const avgHeapFirst = firstBatch.reduce((sum, s) => sum + s.heapUsed, 0) / firstBatch.length;
  const avgHeapLast = lastBatch.reduce((sum, s) => sum + s.heapUsed, 0) / lastBatch.length;

  const heapGrowth = avgHeapLast - avgHeapFirst;
  const heapGrowthPercent = (heapGrowth / avgHeapFirst) * 100;

  // If heap grows by more than 50%, potential leak
  const hasLeak = heapGrowthPercent > 50;

  return {
    hasLeak,
    heapGrowth,
    heapGrowthPercent,
    avgHeapFirst,
    avgHeapLast,
    message: hasLeak 
      ? `Potential memory leak detected: ${heapGrowthPercent.toFixed(2)}% growth`
      : `Memory usage stable: ${heapGrowthPercent.toFixed(2)}% growth`
  };
}

/**
 * Run the performance test
 */
async function runPerformanceTest() {
  console.log('========================================');
  console.log('Export Generation Performance Test');
  console.log('========================================\n');

  console.log(`🎯 Target: ${NUM_EXPORTS} exports`);
  console.log(`⚡ Concurrency: ${CONCURRENCY}\n`);

  console.log('Starting export generation...');
  const startTime = performance.now();

  await runConcurrentExports(NUM_EXPORTS, CONCURRENCY);

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  // Calculate statistics
  const avgExportTime = stats.totalExportTime / stats.successfulExports;
  const throughput = (stats.successfulExports / totalTime) * 1000; // exports per second

  // Calculate percentiles
  stats.exportTimes.sort((a, b) => a - b);
  const p50 = stats.exportTimes[Math.floor(stats.exportTimes.length * 0.5)];
  const p95 = stats.exportTimes[Math.floor(stats.exportTimes.length * 0.95)];
  const p99 = stats.exportTimes[Math.floor(stats.exportTimes.length * 0.99)];

  // Analyze memory
  const memoryAnalysis = analyzeMemoryLeaks();

  // Print results
  console.log('\n========================================');
  console.log('Test Results');
  console.log('========================================\n');

  console.log('📊 Export Statistics:');
  console.log(`  Total exports:      ${stats.totalExports}`);
  console.log(`  Successful:         ${stats.successfulExports}`);
  console.log(`  Failed:             ${stats.failedExports}`);
  console.log(`  Success rate:       ${((stats.successfulExports / stats.totalExports) * 100).toFixed(2)}%`);
  console.log(`  Total time:         ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`  Throughput:         ${throughput.toFixed(2)} exports/sec\n`);

  console.log('⏱️  Export Time Statistics:');
  console.log(`  Average:            ${avgExportTime.toFixed(0)}ms`);
  console.log(`  Minimum:            ${stats.minExportTime.toFixed(0)}ms`);
  console.log(`  Maximum:            ${stats.maxExportTime.toFixed(0)}ms`);
  console.log(`  Median (p50):       ${p50.toFixed(0)}ms`);
  console.log(`  p95:                ${p95.toFixed(0)}ms`);
  console.log(`  p99:                ${p99.toFixed(0)}ms\n`);

  console.log('💾 Memory Analysis:');
  console.log(`  Status:             ${memoryAnalysis.hasLeak ? '❌ Potential leak' : '✅ Stable'}`);
  console.log(`  Heap growth:        ${(memoryAnalysis.heapGrowth / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Growth percent:     ${memoryAnalysis.heapGrowthPercent.toFixed(2)}%`);
  console.log(`  Avg heap (first):   ${(memoryAnalysis.avgHeapFirst / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Avg heap (last):    ${(memoryAnalysis.avgHeapLast / 1024 / 1024).toFixed(2)} MB\n`);

  // Validate results
  console.log('========================================');
  console.log('Validation');
  console.log('========================================\n');

  let allPassed = true;

  // Check export time
  if (p95 < EXPORT_TIME_THRESHOLD) {
    console.log(`✅ Export time p95 < ${EXPORT_TIME_THRESHOLD / 1000}s:`, `${p95.toFixed(0)}ms`);
  } else {
    console.log(`❌ Export time p95 >= ${EXPORT_TIME_THRESHOLD / 1000}s:`, `${p95.toFixed(0)}ms`);
    allPassed = false;
  }

  // Check memory leaks
  if (!memoryAnalysis.hasLeak) {
    console.log('✅ No memory leaks detected');
  } else {
    console.log('❌ Potential memory leak detected');
    allPassed = false;
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

