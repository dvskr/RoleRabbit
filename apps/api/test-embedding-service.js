// Test Embedding Service
require('dotenv').config();
const { 
  generateResumeEmbedding, 
  generateJobEmbedding,
  normalizeText,
  extractResumeText
} = require('./services/embeddings/embeddingService');

async function testEmbeddingService() {
  console.log('\n========================================');
  console.log('  TESTING EMBEDDING SERVICE');
  console.log('========================================\n');

  let passedTests = 0;
  let totalTests = 0;

  try {
    // Test 1: Text normalization
    console.log('Test 1: Text normalization...');
    totalTests++;
    
    const messyText = 'This  has   multiple    spaces\n\n\nand\n\n\nnewlines';
    const normalized = normalizeText(messyText);
    
    if (normalized === 'This has multiple spaces\nand\nnewlines') {
      console.log('✅ Text normalization working');
      passedTests++;
    } else {
      console.log('❌ Text normalization failed');
      console.log('Expected:', 'This has multiple spaces\\nand\\nnewlines');
      console.log('Got:', normalized);
    }

    // Test 2: Resume text extraction
    console.log('\nTest 2: Resume text extraction...');
    totalTests++;
    
    const mockResume = {
      name: 'John Doe',
      title: 'Software Engineer',
      summary: 'Experienced developer with 5 years in full-stack development',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      experience: [
        {
          role: 'Senior Developer',
          company: 'Tech Corp',
          description: 'Led development of microservices architecture',
          responsibilities: ['Code review', 'Mentoring junior developers']
        }
      ],
      education: [
        {
          degree: 'BS Computer Science',
          field: 'Computer Science',
          institution: 'Tech University'
        }
      ]
    };
    
    const resumeText = extractResumeText(mockResume);
    
    if (resumeText.length > 0 && 
        resumeText.includes('John Doe') && 
        resumeText.includes('JavaScript') &&
        resumeText.includes('Senior Developer')) {
      console.log('✅ Resume text extraction working');
      console.log(`   Extracted ${resumeText.length} characters`);
      passedTests++;
    } else {
      console.log('❌ Resume text extraction failed');
      console.log('Text:', resumeText);
    }

    // Test 3: Generate job embedding
    console.log('\nTest 3: Generate job embedding (OpenAI API call)...');
    totalTests++;
    
    const jobDescription = `
      Senior Software Engineer
      
      Requirements:
      - 5+ years of experience in full-stack development
      - Strong knowledge of JavaScript, React, and Node.js
      - Experience with microservices architecture
      - Excellent problem-solving skills
      
      Responsibilities:
      - Design and implement scalable web applications
      - Lead technical discussions
      - Mentor junior developers
    `;
    
    const startTime = Date.now();
    const jobEmbedding = await generateJobEmbedding(jobDescription);
    const duration = Date.now() - startTime;
    
    if (Array.isArray(jobEmbedding) && 
        jobEmbedding.length === 1536 &&
        jobEmbedding.every(v => typeof v === 'number')) {
      console.log('✅ Job embedding generated successfully');
      console.log(`   Dimensions: ${jobEmbedding.length}`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Sample values: [${jobEmbedding.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`);
      passedTests++;
    } else {
      console.log('❌ Job embedding generation failed');
      console.log('Type:', typeof jobEmbedding);
      console.log('Length:', jobEmbedding?.length);
    }

    // Test 4: Generate resume embedding
    console.log('\nTest 4: Generate resume embedding (OpenAI API call)...');
    totalTests++;
    
    const startTime2 = Date.now();
    const resumeEmbedding = await generateResumeEmbedding(mockResume);
    const duration2 = Date.now() - startTime2;
    
    if (Array.isArray(resumeEmbedding) && 
        resumeEmbedding.length === 1536 &&
        resumeEmbedding.every(v => typeof v === 'number')) {
      console.log('✅ Resume embedding generated successfully');
      console.log(`   Dimensions: ${resumeEmbedding.length}`);
      console.log(`   Duration: ${duration2}ms`);
      console.log(`   Sample values: [${resumeEmbedding.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`);
      passedTests++;
    } else {
      console.log('❌ Resume embedding generation failed');
    }

    // Test 5: Calculate similarity (basic cosine similarity)
    console.log('\nTest 5: Calculate similarity between embeddings...');
    totalTests++;
    
    // Cosine similarity formula
    const dotProduct = jobEmbedding.reduce((sum, val, i) => sum + val * resumeEmbedding[i], 0);
    const magJob = Math.sqrt(jobEmbedding.reduce((sum, val) => sum + val * val, 0));
    const magResume = Math.sqrt(resumeEmbedding.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (magJob * magResume);
    
    if (similarity >= 0 && similarity <= 1) {
      console.log('✅ Similarity calculation working');
      console.log(`   Similarity score: ${(similarity * 100).toFixed(2)}%`);
      passedTests++;
    } else {
      console.log('❌ Similarity calculation failed');
      console.log('Similarity:', similarity);
    }

    // Test 6: Error handling - empty text
    console.log('\nTest 6: Error handling - empty text...');
    totalTests++;
    
    try {
      await generateJobEmbedding('');
      console.log('❌ Should have thrown error for empty text');
    } catch (error) {
      if (error.message.includes('empty') || error.message.includes('invalid')) {
        console.log('✅ Error handling working for empty text');
        passedTests++;
      } else {
        console.log('⚠️  Got error but unexpected message:', error.message);
      }
    }

    // Final summary
    console.log('\n========================================');
    console.log('  TEST SUMMARY');
    console.log('========================================');
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%\n`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Embedding service is ready! 🎉\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Review above for details.\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Testing failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testEmbeddingService();

