// Test Resume Embedding Storage Service
require('dotenv').config();
const {
  storeResumeEmbedding,
  getResumeEmbedding,
  getOrGenerateResumeEmbedding,
  getEmbeddingStatistics
} = require('./services/embeddings/resumeEmbeddingStorage');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testResumeEmbeddingStorage() {
  console.log('\n========================================');
  console.log('  TESTING RESUME EMBEDDING STORAGE');
  console.log('========================================\n');

  let passedTests = 0;
  let totalTests = 0;
  let testResumeId = null;

  try {
    // Create a test resume
    console.log('Setup: Creating test resume...');
    
    // Find a user to associate with
    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error('No user found in database. Please create a user first.');
    }

    // Find an available slot number
    const existingResumes = await prisma.baseResume.findMany({
      where: { userId: user.id },
      select: { slotNumber: true },
      orderBy: { slotNumber: 'desc' }
    });
    
    const maxSlot = existingResumes.length > 0 ? existingResumes[0].slotNumber : 0;
    const availableSlot = maxSlot + 1;

    const testResume = await prisma.baseResume.create({
      data: {
        userId: user.id,
        name: 'Test Storage Resume',
        slotNumber: availableSlot,
        data: {
          name: 'Test Storage Resume',
          title: 'Test Developer',
          summary: 'This is a test resume for storage testing',
          skills: ['JavaScript', 'Testing'],
          experience: [],
          education: []
        }
      }
    });

    testResumeId = testResume.id;
    console.log(`✅ Test resume created: ${testResumeId}\n`);

    // Test 1: Store embedding
    console.log('Test 1: Store embedding in database...');
    totalTests++;

    const testEmbedding = new Array(1536).fill(0).map(() => Math.random());
    
    const storeResult = await storeResumeEmbedding(testResumeId, testEmbedding);

    if (storeResult.stored === true) {
      console.log('✅ Embedding stored successfully');
      passedTests++;
    } else {
      console.log('❌ Failed to store embedding');
    }

    // Test 2: Retrieve embedding
    console.log('\nTest 2: Retrieve embedding from database...');
    totalTests++;

    const retrieveResult = await getResumeEmbedding(testResumeId);

    if (retrieveResult.embedding &&
        retrieveResult.embedding.length === 1536 &&
        retrieveResult.updatedAt) {
      console.log('✅ Embedding retrieved successfully');
      console.log(`   Dimensions: ${retrieveResult.embedding.length}`);
      console.log(`   Updated at: ${retrieveResult.updatedAt}`);
      passedTests++;
    } else {
      console.log('❌ Failed to retrieve embedding');
      console.log('Result:', retrieveResult);
    }

    // Test 3: Verify embedding content
    console.log('\nTest 3: Verify embedding content matches...');
    totalTests++;

    const firstFiveStored = testEmbedding.slice(0, 5).map(n => n.toFixed(6));
    const firstFiveRetrieved = retrieveResult.embedding.slice(0, 5).map(n => parseFloat(n).toFixed(6));

    if (JSON.stringify(firstFiveStored) === JSON.stringify(firstFiveRetrieved)) {
      console.log('✅ Embedding content matches');
      console.log(`   First 5 values: ${firstFiveRetrieved.join(', ')}`);
      passedTests++;
    } else {
      console.log('❌ Embedding content mismatch');
      console.log('Stored:', firstFiveStored);
      console.log('Retrieved:', firstFiveRetrieved);
    }

    // Test 4: Get or generate (should use database)
    console.log('\nTest 4: Get or generate (should use database)...');
    totalTests++;

    const start = Date.now();
    const getOrGenResult = await getOrGenerateResumeEmbedding(
      testResumeId,
      testResume.data,
      { forceRegenerate: false }
    );
    const duration = Date.now() - start;

    if (getOrGenResult.fromDatabase === true &&
        getOrGenResult.embedding.length === 1536) {
      console.log('✅ Retrieved from database successfully');
      console.log(`   Duration: ${duration}ms (fast!)`);
      console.log(`   From database: ${getOrGenResult.fromDatabase}`);
      passedTests++;
    } else {
      console.log('❌ Did not retrieve from database');
      console.log('Result:', getOrGenResult);
    }

    // Test 5: Force regenerate
    console.log('\nTest 5: Force regenerate embedding...');
    totalTests++;

    const start2 = Date.now();
    const forceGenResult = await getOrGenerateResumeEmbedding(
      testResumeId,
      testResume.data,
      { forceRegenerate: true }
    );
    const duration2 = Date.now() - start2;

    if (forceGenResult.fromDatabase === false &&
        forceGenResult.embedding.length === 1536) {
      console.log('✅ Embedding regenerated successfully');
      console.log(`   Duration: ${duration2}ms (slower, called OpenAI)`);
      console.log(`   From database: ${forceGenResult.fromDatabase}`);
      passedTests++;
    } else {
      console.log('❌ Failed to regenerate');
      console.log('Result:', forceGenResult);
    }

    // Test 6: Get statistics
    console.log('\nTest 6: Get embedding statistics...');
    totalTests++;

    const stats = await getEmbeddingStatistics();

    if (stats.totalResumes > 0 &&
        stats.resumesWithEmbeddings > 0) {
      console.log('✅ Statistics retrieved');
      console.log(`   Total resumes: ${stats.totalResumes}`);
      console.log(`   With embeddings: ${stats.resumesWithEmbeddings}`);
      console.log(`   Without embeddings: ${stats.resumesWithoutEmbeddings}`);
      console.log(`   Coverage: ${stats.coveragePercentage.toFixed(1)}%`);
      passedTests++;
    } else {
      console.log('❌ Statistics failed');
      console.log('Stats:', stats);
    }

    // Cleanup
    console.log('\nCleanup: Deleting test resume...');
    await prisma.baseResume.delete({
      where: { id: testResumeId }
    });
    console.log('✅ Test resume deleted\n');

    // Final summary
    console.log('========================================');
    console.log('  TEST SUMMARY');
    console.log('========================================');
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%\n`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Resume embedding storage is working! 🎉\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Review above for details.\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Testing failed:', error.message);
    console.error('\nFull error:', error);
    
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

testResumeEmbeddingStorage();

