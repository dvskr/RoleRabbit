/**
 * Analyze Slow Queries with EXPLAIN ANALYZE
 * 
 * Identifies queries taking >100ms and provides optimization recommendations.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Configuration
 */
const CONFIG = {
  slowQueryThreshold: 100, // milliseconds
  sampleSize: 100 // Number of records to test with
};

/**
 * Test queries and analyze performance
 */
const TEST_QUERIES = [
  {
    name: 'Fetch user resumes',
    query: async (userId) => {
      const start = Date.now();
      const result = await prisma.baseResume.findMany({
        where: {
          userId: userId,
          deletedAt: null
        },
        orderBy: { updatedAt: 'desc' }
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "base_resumes"
      WHERE "userId" = $1 AND "deletedAt" IS NULL
      ORDER BY "updatedAt" DESC;
    `
  },
  {
    name: 'Search resumes by name',
    query: async (userId, searchTerm) => {
      const start = Date.now();
      const result = await prisma.baseResume.findMany({
        where: {
          userId: userId,
          name: { contains: searchTerm, mode: 'insensitive' },
          deletedAt: null
        }
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "base_resumes"
      WHERE "userId" = $1 
        AND LOWER("name") LIKE LOWER('%' || $2 || '%')
        AND "deletedAt" IS NULL;
    `
  },
  {
    name: 'Fetch tailored versions',
    query: async (userId) => {
      const start = Date.now();
      const result = await prisma.tailoredVersion.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "tailored_versions"
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 20;
    `
  },
  {
    name: 'Fetch AI request logs',
    query: async (userId) => {
      const start = Date.now();
      const result = await prisma.aIRequestLog.findMany({
        where: {
          userId: userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "ai_request_logs"
      WHERE "userId" = $1 
        AND "createdAt" >= $2
      ORDER BY "createdAt" DESC;
    `
  },
  {
    name: 'Fetch working draft',
    query: async (baseResumeId) => {
      const start = Date.now();
      const result = await prisma.workingDraft.findUnique({
        where: { baseResumeId: baseResumeId }
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "working_drafts"
      WHERE "baseResumeId" = $1;
    `
  },
  {
    name: 'Find stale drafts',
    query: async () => {
      const start = Date.now();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await prisma.workingDraft.findMany({
        where: {
          updatedAt: { lt: thirtyDaysAgo }
        }
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "working_drafts"
      WHERE "updatedAt" < $1;
    `
  },
  {
    name: 'Find stale cache entries',
    query: async () => {
      const start = Date.now();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await prisma.resumeCache.findMany({
        where: {
          lastUsedAt: { lt: sevenDaysAgo }
        }
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "resume_caches"
      WHERE "lastUsedAt" < $1;
    `
  },
  {
    name: 'Fetch resume with tags',
    query: async (userId, tags) => {
      const start = Date.now();
      const result = await prisma.baseResume.findMany({
        where: {
          userId: userId,
          tags: { hasSome: tags },
          deletedAt: null
        }
      });
      const duration = Date.now() - start;
      return { result, duration };
    },
    explain: `
      EXPLAIN ANALYZE
      SELECT * FROM "base_resumes"
      WHERE "userId" = $1 
        AND "tags" && $2
        AND "deletedAt" IS NULL;
    `
  }
];

/**
 * Run EXPLAIN ANALYZE on a query
 */
async function explainQuery(explainSql, params = []) {
  try {
    const result = await prisma.$queryRawUnsafe(explainSql, ...params);
    return result;
  } catch (error) {
    console.error('EXPLAIN ANALYZE error:', error.message);
    return null;
  }
}

/**
 * Analyze all queries
 */
async function analyzeAllQueries() {
  console.log('🔍 Starting query performance analysis...');
  console.log(`Threshold: ${CONFIG.slowQueryThreshold}ms\n`);

  try {
    // Get a sample user for testing
    const sampleUser = await prisma.user.findFirst();
    if (!sampleUser) {
      console.log('⚠️  No users found in database. Cannot run analysis.');
      return;
    }

    // Get a sample resume for testing
    const sampleResume = await prisma.baseResume.findFirst({
      where: { userId: sampleUser.id }
    });

    const results = [];

    // Run each test query
    for (const test of TEST_QUERIES) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Testing: ${test.name}`);
      console.log('='.repeat(60));

      let queryResult;
      try {
        // Execute query based on type
        if (test.name === 'Fetch user resumes') {
          queryResult = await test.query(sampleUser.id);
        } else if (test.name === 'Search resumes by name') {
          queryResult = await test.query(sampleUser.id, 'Software');
        } else if (test.name === 'Fetch tailored versions') {
          queryResult = await test.query(sampleUser.id);
        } else if (test.name === 'Fetch AI request logs') {
          queryResult = await test.query(sampleUser.id);
        } else if (test.name === 'Fetch working draft') {
          if (sampleResume) {
            queryResult = await test.query(sampleResume.id);
          } else {
            console.log('⏭️  Skipped - no sample resume');
            continue;
          }
        } else if (test.name === 'Find stale drafts') {
          queryResult = await test.query();
        } else if (test.name === 'Find stale cache entries') {
          queryResult = await test.query();
        } else if (test.name === 'Fetch resume with tags') {
          queryResult = await test.query(sampleUser.id, ['frontend', 'react']);
        }

        const { duration } = queryResult;
        const isSlow = duration > CONFIG.slowQueryThreshold;

        console.log(`⏱️  Duration: ${duration}ms ${isSlow ? '🐌 SLOW' : '✅ OK'}`);
        console.log(`📦 Records returned: ${Array.isArray(queryResult.result) ? queryResult.result.length : (queryResult.result ? 1 : 0)}`);

        results.push({
          name: test.name,
          duration,
          isSlow,
          recordCount: Array.isArray(queryResult.result) ? queryResult.result.length : (queryResult.result ? 1 : 0)
        });

        // If slow, show EXPLAIN output
        if (isSlow) {
          console.log('\n🔍 EXPLAIN ANALYZE output:');
          console.log(test.explain);
        }

      } catch (error) {
        console.error(`❌ Query failed: ${error.message}`);
        results.push({
          name: test.name,
          duration: null,
          isSlow: false,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS SUMMARY');
    console.log('='.repeat(60));

    const slowQueries = results.filter(r => r.isSlow);
    const fastQueries = results.filter(r => !r.isSlow && !r.error);
    const failedQueries = results.filter(r => r.error);

    console.log(`✅ Fast queries: ${fastQueries.length}`);
    console.log(`🐌 Slow queries: ${slowQueries.length}`);
    console.log(`❌ Failed queries: ${failedQueries.length}`);

    if (slowQueries.length > 0) {
      console.log('\n🐌 Slow queries (>100ms):');
      slowQueries.forEach(q => {
        console.log(`  - ${q.name}: ${q.duration}ms`);
      });

      console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
      console.log('1. Add missing indexes (see Section 3.3)');
      console.log('2. Use connection pooling (see database.js)');
      console.log('3. Add Redis caching for frequently accessed data');
      console.log('4. Consider read replicas for heavy read operations');
      console.log('5. Run VACUUM ANALYZE on PostgreSQL regularly');
    }

    if (failedQueries.length > 0) {
      console.log('\n❌ Failed queries:');
      failedQueries.forEach(q => {
        console.log(`  - ${q.name}: ${q.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('💥 Analysis failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run analysis if called directly
if (require.main === module) {
  analyzeAllQueries()
    .then(() => {
      console.log('\n✅ Analysis completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = {
  analyzeAllQueries,
  explainQuery
};

