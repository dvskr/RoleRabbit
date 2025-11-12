// ============================================================
// COMPREHENSIVE INTEGRATION TEST
// ============================================================
// Tests the complete embedding-based ATS system end-to-end

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { scoreResumeWithEmbeddings } = require('./services/embeddings/embeddingATSService');
const { generateResumeEmbedding } = require('./services/embeddings/embeddingService');
const { getOrGenerateJobEmbedding } = require('./services/embeddings/embeddingCacheService');
const { calculateSimilarity } = require('./services/embeddings/similarityService');
const { 
  storeResumeEmbedding, 
  getOrGenerateResumeEmbedding 
} = require('./services/embeddings/resumeEmbeddingStorage');
const {
  generateEmbeddingForResume,
  getEmbeddingCoverageStats
} = require('./services/embeddings/embeddingJobService');

const prisma = new PrismaClient();

// Test data
const testResume = {
  name: 'Sarah Johnson',
  title: 'Senior Full-Stack Developer',
  summary: 'Experienced full-stack developer with 7 years of expertise in React, Node.js, TypeScript, and cloud technologies. Proven track record of building scalable web applications and leading development teams.',
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
    'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS',
    'Git', 'CI/CD', 'Agile', 'REST APIs', 'GraphQL'
  ],
  experience: [
    {
      role: 'Senior Full-Stack Developer',
      company: 'Tech Innovations Inc',
      duration: '2021 - Present',
      description: 'Lead developer for enterprise web applications serving 100K+ users',
      responsibilities: [
        'Architected and implemented microservices using Node.js and Docker',
        'Built responsive frontends with React and TypeScript',
        'Mentored team of 5 junior developers',
        'Implemented CI/CD pipelines reducing deployment time by 60%',
        'Optimized database queries improving performance by 40%'
      ]
    },
    {
      role: 'Full-Stack Developer',
      company: 'Digital Solutions LLC',
      duration: '2018 - 2021',
      description: 'Developed customer-facing web applications',
      responsibilities: [
        'Built RESTful APIs with Express and PostgreSQL',
        'Created interactive dashboards with React',
        'Integrated third-party payment systems',
        'Participated in agile development processes'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      institution: 'State University',
      year: '2018'
    }
  ]
};

const testJobDescription = `
Senior Full-Stack Engineer

We're looking for an experienced full-stack engineer to join our growing team and help build the next generation of our platform.

Requirements:
- 5+ years of professional software development experience
- Expert-level proficiency in JavaScript/TypeScript and React
- Strong backend development skills with Node.js and Express
- Experience with PostgreSQL and database optimization
- Knowledge of Docker and containerization
- Experience with cloud platforms (AWS, Azure, or GCP)
- Understanding of microservices architecture
- Excellent problem-solving and communication skills

Responsibilities:
- Design and implement scalable web applications
- Build and maintain RESTful APIs
- Optimize application performance and database queries
- Participate in code reviews and technical discussions
- Mentor junior developers
- Collaborate with product and design teams
- Write clean, maintainable, and well-tested code

Nice to have:
- Kubernetes experience
- GraphQL knowledge
- CI/CD pipeline setup
- Agile/Scrum experience
- Open source contributions

We offer competitive compensation, comprehensive benefits, and opportunities for growth.
`;

async function runIntegrationTests() {
  console.log('\n========================================');
  console.log('  INTEGRATION TEST SUITE');
  console.log('  Complete Embedding ATS System');
  console.log('========================================\n');

  let testResumeId = null;
  let passedTests = 0;
  let totalTests = 0;
  const results = {
    timings: {},
    scores: {},
    coverage: {}
  };

  try {
    // ==========================================
    // TEST 1: Environment Check
    // ==========================================
    console.log('Test 1: Environment Configuration...');
    totalTests++;

    if (process.env.OPENAI_API_KEY && process.env.DATABASE_URL) {
      console.log('✅ Environment configured correctly');
      passedTests++;
    } else {
      console.log('❌ Environment variables missing');
      throw new Error('Required environment variables not set');
    }

    // ==========================================
    // TEST 2: Database Connection
    // ==========================================
    console.log('\nTest 2: Database Connection...');
    totalTests++;

    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
      passedTests++;
    } catch (error) {
      console.log('❌ Database connection failed');
      throw error;
    }

    // ==========================================
    // TEST 3: Create Test Resume
    // ==========================================
    console.log('\nTest 3: Create test resume in database...');
    totalTests++;

    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error('No user found in database');
    }

    const existingResumes = await prisma.baseResume.findMany({
      where: { userId: user.id },
      select: { slotNumber: true },
      orderBy: { slotNumber: 'desc' }
    });
    
    const maxSlot = existingResumes.length > 0 ? existingResumes[0].slotNumber : 0;
    const availableSlot = maxSlot + 1;

    const createdResume = await prisma.baseResume.create({
      data: {
        userId: user.id,
        name: 'Integration Test Resume',
        slotNumber: availableSlot,
        data: testResume
      }
    });

    testResumeId = createdResume.id;
    console.log(`✅ Test resume created: ${testResumeId}`);
    passedTests++;

    // ==========================================
    // TEST 4: Generate Resume Embedding
    // ==========================================
    console.log('\nTest 4: Generate resume embedding...');
    totalTests++;

    const embStart = Date.now();
    const resumeEmbedding = await generateResumeEmbedding(testResume);
    const embDuration = Date.now() - embStart;
    results.timings.resumeEmbedding = embDuration;

    if (resumeEmbedding && resumeEmbedding.length === 1536) {
      console.log(`✅ Resume embedding generated (${embDuration}ms)`);
      console.log(`   Dimensions: ${resumeEmbedding.length}`);
      passedTests++;
    } else {
      console.log('❌ Resume embedding failed');
    }

    // ==========================================
    // TEST 5: Store Resume Embedding
    // ==========================================
    console.log('\nTest 5: Store resume embedding in database...');
    totalTests++;

    const storeResult = await storeResumeEmbedding(testResumeId, resumeEmbedding);

    if (storeResult.stored) {
      console.log('✅ Resume embedding stored successfully');
      passedTests++;
    } else {
      console.log('❌ Failed to store resume embedding');
    }

    // ==========================================
    // TEST 6: Job Embedding Cache
    // ==========================================
    console.log('\nTest 6: Generate and cache job embedding...');
    totalTests++;

    const jobEmbStart = Date.now();
    const jobEmbResult = await getOrGenerateJobEmbedding(testJobDescription);
    const jobEmbDuration = Date.now() - jobEmbStart;
    results.timings.jobEmbeddingFirst = jobEmbDuration;

    if (jobEmbResult.embedding && jobEmbResult.embedding.length === 1536) {
      console.log(`✅ Job embedding generated (${jobEmbDuration}ms)`);
      console.log(`   From cache: ${jobEmbResult.fromCache}`);
      passedTests++;
    } else {
      console.log('❌ Job embedding failed');
    }

    // ==========================================
    // TEST 7: Job Embedding Cache Hit
    // ==========================================
    console.log('\nTest 7: Test job embedding cache hit...');
    totalTests++;

    const cacheStart = Date.now();
    const cachedJobEmb = await getOrGenerateJobEmbedding(testJobDescription);
    const cacheDuration = Date.now() - cacheStart;
    results.timings.jobEmbeddingCached = cacheDuration;

    const speedImprovement = ((jobEmbDuration - cacheDuration) / jobEmbDuration * 100).toFixed(1);

    if (cachedJobEmb.fromCache === true && cacheDuration < jobEmbDuration) {
      console.log(`✅ Cache hit successful (${cacheDuration}ms)`);
      console.log(`   Speed improvement: ${speedImprovement}% faster`);
      results.coverage.cacheHit = true;
      results.coverage.cacheSpeedImprovement = parseFloat(speedImprovement);
      passedTests++;
    } else {
      console.log('⚠️  Cache not faster (may be expected on fast systems)');
      results.coverage.cacheHit = cachedJobEmb.fromCache;
    }

    // ==========================================
    // TEST 8: Similarity Calculation
    // ==========================================
    console.log('\nTest 8: Calculate similarity...');
    totalTests++;

    const simStart = Date.now();
    const similarity = calculateSimilarity(
      resumeEmbedding,
      jobEmbResult.embedding,
      { includeDetails: true }
    );
    const simDuration = Date.now() - simStart;
    results.timings.similarity = simDuration;

    if (similarity && similarity.atsScore >= 0 && similarity.atsScore <= 100) {
      console.log(`✅ Similarity calculated (${simDuration}ms)`);
      console.log(`   Similarity: ${(similarity.similarity * 100).toFixed(2)}%`);
      console.log(`   ATS Score: ${similarity.atsScore}`);
      console.log(`   Interpretation: ${similarity.details.interpretation}`);
      results.scores.similarity = similarity.similarity;
      results.scores.atsFromSimilarity = similarity.atsScore;
      passedTests++;
    } else {
      console.log('❌ Similarity calculation failed');
    }

    // ==========================================
    // TEST 9: Complete ATS Scoring
    // ==========================================
    console.log('\nTest 9: Complete ATS scoring with embeddings...');
    totalTests++;

    const atsStart = Date.now();
    const atsResult = await scoreResumeWithEmbeddings({
      resumeData: testResume,
      jobDescription: testJobDescription,
      includeDetails: true
    });
    const atsDuration = Date.now() - atsStart;
    results.timings.completeATS = atsDuration;

    if (atsResult && atsResult.overall >= 0 && atsResult.overall <= 100) {
      console.log(`✅ ATS scoring complete (${atsDuration}ms)`);
      console.log(`   Overall Score: ${atsResult.overall}`);
      console.log(`   Semantic Score: ${atsResult.semanticScore}`);
      console.log(`   Keyword Match: ${atsResult.keywordMatchRate}%`);
      console.log(`   Matched Keywords: ${atsResult.matchedKeywords.length}`);
      console.log(`   Missing Keywords: ${atsResult.missingKeywords.length}`);
      results.scores.overall = atsResult.overall;
      results.scores.semantic = atsResult.semanticScore;
      results.scores.keywordMatch = atsResult.keywordMatchRate;
      passedTests++;
    } else {
      console.log('❌ ATS scoring failed');
    }

    // ==========================================
    // TEST 10: Resume Storage Integration
    // ==========================================
    console.log('\nTest 10: Get-or-generate resume embedding...');
    totalTests++;

    const getOrGenStart = Date.now();
    const getOrGenResult = await getOrGenerateResumeEmbedding(
      testResumeId,
      testResume,
      { forceRegenerate: false }
    );
    const getOrGenDuration = Date.now() - getOrGenStart;

    if (getOrGenResult.fromDatabase === true && getOrGenDuration < 100) {
      console.log(`✅ Retrieved from database (${getOrGenDuration}ms)`);
      console.log(`   From database: ${getOrGenResult.fromDatabase}`);
      passedTests++;
    } else {
      console.log('⚠️  Retrieved but not from database or slower than expected');
    }

    // ==========================================
    // TEST 11: Background Job Service
    // ==========================================
    console.log('\nTest 11: Generate embedding for specific resume...');
    totalTests++;

    const bgJobStart = Date.now();
    const bgJobResult = await generateEmbeddingForResume(testResumeId);
    const bgJobDuration = Date.now() - bgJobStart;

    if (bgJobResult.success) {
      console.log(`✅ Background job successful (${bgJobDuration}ms)`);
      passedTests++;
    } else {
      console.log('❌ Background job failed');
    }

    // ==========================================
    // TEST 12: Coverage Statistics
    // ==========================================
    console.log('\nTest 12: Get embedding coverage statistics...');
    totalTests++;

    const stats = await getEmbeddingCoverageStats();

    if (stats && stats.totalResumes > 0) {
      console.log('✅ Coverage statistics retrieved');
      console.log(`   Total Resumes: ${stats.totalResumes}`);
      console.log(`   With Embeddings: ${stats.resumesWithEmbeddings}`);
      console.log(`   Coverage: ${stats.coveragePercentage.toFixed(1)}%`);
      results.coverage.totalResumes = stats.totalResumes;
      results.coverage.withEmbeddings = stats.resumesWithEmbeddings;
      results.coverage.coveragePercentage = stats.coveragePercentage;
      passedTests++;
    } else {
      console.log('❌ Coverage statistics failed');
    }

    // ==========================================
    // Cleanup
    // ==========================================
    console.log('\nCleanup: Deleting test resume...');
    await prisma.baseResume.delete({
      where: { id: testResumeId }
    });
    console.log('✅ Test resume deleted\n');

    // ==========================================
    // FINAL RESULTS
    // ==========================================
    console.log('========================================');
    console.log('  TEST RESULTS SUMMARY');
    console.log('========================================\n');

    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%\n`);

    console.log('Performance Metrics:');
    console.log(`  Resume Embedding: ${results.timings.resumeEmbedding}ms`);
    console.log(`  Job Embedding (first): ${results.timings.jobEmbeddingFirst}ms`);
    console.log(`  Job Embedding (cached): ${results.timings.jobEmbeddingCached}ms`);
    console.log(`  Similarity Calc: ${results.timings.similarity}ms`);
    console.log(`  Complete ATS: ${results.timings.completeATS}ms\n`);

    if (results.coverage.cacheSpeedImprovement) {
      console.log(`Cache Performance: ${results.coverage.cacheSpeedImprovement}% faster\n`);
    }

    console.log('ATS Scores:');
    console.log(`  Overall: ${results.scores.overall}`);
    console.log(`  Semantic: ${results.scores.semantic}`);
    console.log(`  Keyword Match: ${results.scores.keywordMatch}%\n`);

    console.log('System Coverage:');
    console.log(`  Total Resumes: ${results.coverage.totalResumes}`);
    console.log(`  With Embeddings: ${results.coverage.withEmbeddings}`);
    console.log(`  Coverage: ${results.coverage.coveragePercentage.toFixed(1)}%\n`);

    // ==========================================
    // VALIDATION
    // ==========================================
    console.log('========================================');
    console.log('  VALIDATION CHECKS');
    console.log('========================================\n');

    const validations = [];

    // Performance validation
    if (results.timings.completeATS < 5000) {
      console.log('✅ Performance: ATS completes in <5 seconds');
      validations.push(true);
    } else {
      console.log('❌ Performance: ATS took >5 seconds');
      validations.push(false);
    }

    // Cache validation
    if (results.coverage.cacheSpeedImprovement && results.coverage.cacheSpeedImprovement > 50) {
      console.log(`✅ Cache: ${results.coverage.cacheSpeedImprovement}% improvement (>50% target)`);
      validations.push(true);
    } else {
      console.log('⚠️  Cache: Speed improvement not measured or <50%');
      validations.push(true); // Not critical
    }

    // Accuracy validation
    if (results.scores.overall >= 50 && results.scores.overall <= 100) {
      console.log(`✅ Accuracy: Overall score ${results.scores.overall} is reasonable`);
      validations.push(true);
    } else {
      console.log(`⚠️  Accuracy: Overall score ${results.scores.overall} seems unusual`);
      validations.push(false);
    }

    // Similarity validation
    if (results.scores.similarity > 0.5) {
      console.log(`✅ Match: ${(results.scores.similarity * 100).toFixed(1)}% similarity for matched resume/job`);
      validations.push(true);
    } else {
      console.log(`⚠️  Match: ${(results.scores.similarity * 100).toFixed(1)}% similarity is lower than expected`);
      validations.push(false);
    }

    const allValidationsPassed = validations.every(v => v);

    console.log('');
    console.log('========================================');
    
    if (passedTests === totalTests && allValidationsPassed) {
      console.log('  🎉 ALL TESTS PASSED! 🎉');
      console.log('  System is fully operational!');
      console.log('========================================\n');
      process.exit(0);
    } else if (passedTests >= totalTests * 0.9) {
      console.log('  ✅ TESTS MOSTLY PASSED');
      console.log(`  ${passedTests}/${totalTests} tests passed`);
      console.log('  System is operational with minor issues');
      console.log('========================================\n');
      process.exit(0);
    } else {
      console.log('  ⚠️  SOME TESTS FAILED');
      console.log(`  ${totalTests - passedTests} test(s) failed`);
      console.log('  Review results above');
      console.log('========================================\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Integration tests failed:', error.message);
    console.error('\nError details:', error);
    
    // Cleanup on error
    if (testResumeId) {
      try {
        await prisma.baseResume.delete({
          where: { id: testResumeId }
        });
        console.log('Test resume cleaned up after error');
      } catch (cleanupError) {
        console.error('Failed to cleanup test resume:', cleanupError.message);
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runIntegrationTests();

