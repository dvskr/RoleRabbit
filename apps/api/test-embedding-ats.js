// Test Embedding-based ATS Service
require('dotenv').config();
const {
  scoreResumeWithEmbeddings,
  extractKeywords,
  analyzeKeywords
} = require('./services/embeddings/embeddingATSService');

async function testEmbeddingATS() {
  console.log('\n========================================');
  console.log('  TESTING EMBEDDING-BASED ATS SERVICE');
  console.log('========================================\n');

  let passedTests = 0;
  let totalTests = 0;

  try {
    // Mock resume data
    const resumeData = {
      name: 'Jane Smith',
      title: 'Senior Full-Stack Developer',
      summary: 'Experienced full-stack developer with 6 years of experience in React, Node.js, and PostgreSQL',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript', 'MongoDB'],
      experience: [
        {
          role: 'Senior Software Engineer',
          company: 'Tech Solutions Inc',
          description: 'Led development of scalable web applications using React and Node.js. Implemented microservices architecture with Docker and Kubernetes.',
          responsibilities: [
            'Designed and implemented RESTful APIs',
            'Mentored junior developers',
            'Conducted code reviews',
            'Optimized database queries for performance'
          ]
        },
        {
          role: 'Full-Stack Developer',
          company: 'Startup XYZ',
          description: 'Built full-stack applications using modern JavaScript frameworks'
        }
      ],
      education: [
        {
          degree: 'BS Computer Science',
          field: 'Computer Science',
          institution: 'University of Technology'
        }
      ]
    };

    // Job description
    const jobDescription = `
      Senior Full-Stack Developer

      We are seeking an experienced full-stack developer to join our growing team.

      Requirements:
      - 5+ years of experience in full-stack development
      - Strong proficiency in JavaScript, React, and Node.js
      - Experience with PostgreSQL and database optimization
      - Knowledge of Docker and containerization
      - Experience with microservices architecture
      - Strong problem-solving and communication skills

      Responsibilities:
      - Design and implement scalable web applications
      - Lead technical discussions and architecture decisions
      - Mentor junior developers
      - Conduct code reviews and maintain code quality
      - Collaborate with cross-functional teams

      Nice to have:
      - TypeScript experience
      - Kubernetes knowledge
      - CI/CD pipeline experience
    `;

    // Test 1: Keyword extraction
    console.log('Test 1: Extract keywords from job description...');
    totalTests++;

    const keywords = extractKeywords(jobDescription);

    if (keywords.length > 0 &&
        keywords.includes('javascript') &&
        keywords.includes('react')) {
      console.log('✅ Keyword extraction working');
      console.log(`   Extracted ${keywords.length} keywords`);
      console.log(`   Sample: ${keywords.slice(0, 10).join(', ')}...`);
      passedTests++;
    } else {
      console.log('❌ Keyword extraction failed');
    }

    // Test 2: Keyword analysis
    console.log('\nTest 2: Analyze keywords (matched/missing)...');
    totalTests++;

    const keywordAnalysis = analyzeKeywords(resumeData, jobDescription);

    if (keywordAnalysis.matched.length > 0 &&
        keywordAnalysis.matched.includes('javascript') &&
        keywordAnalysis.matched.includes('react')) {
      console.log('✅ Keyword analysis working');
      console.log(`   Total keywords: ${keywordAnalysis.totalKeywords}`);
      console.log(`   Matched: ${keywordAnalysis.matched.length}`);
      console.log(`   Missing: ${keywordAnalysis.missing.length}`);
      console.log(`   Match rate: ${(keywordAnalysis.matched.length / keywordAnalysis.totalKeywords * 100).toFixed(1)}%`);
      passedTests++;
    } else {
      console.log('❌ Keyword analysis failed');
    }

    // Test 3: Full ATS scoring
    console.log('\nTest 3: Complete ATS scoring with embeddings...');
    totalTests++;

    const start = Date.now();
    const atsResult = await scoreResumeWithEmbeddings({
      resumeData,
      jobDescription,
      includeDetails: true
    });
    const duration = Date.now() - start;

    if (atsResult.overall >= 0 &&
        atsResult.overall <= 100 &&
        atsResult.semanticScore >= 0 &&
        atsResult.matchedKeywords.length > 0) {
      console.log('✅ ATS scoring working');
      console.log(`   Overall score: ${atsResult.overall}`);
      console.log(`   Semantic score: ${atsResult.semanticScore}`);
      console.log(`   Keyword match rate: ${atsResult.keywordMatchRate}%`);
      console.log(`   Similarity: ${(atsResult.similarity * 100).toFixed(2)}%`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   From cache: ${atsResult.performance.fromCache}`);
      console.log(`   Matched keywords (${atsResult.matchedKeywords.length}): ${atsResult.matchedKeywords.slice(0, 5).join(', ')}...`);
      console.log(`   Missing keywords (${atsResult.missingKeywords.length}): ${atsResult.missingKeywords.slice(0, 5).join(', ')}...`);
      passedTests++;
    } else {
      console.log('❌ ATS scoring failed');
      console.log('Result:', atsResult);
    }

    // Test 4: Verify score interpretation
    console.log('\nTest 4: Check detailed analysis...');
    totalTests++;

    if (atsResult.details &&
        atsResult.details.interpretation &&
        atsResult.details.recommendations &&
        atsResult.details.recommendations.length > 0) {
      console.log('✅ Detailed analysis working');
      console.log(`   Interpretation: ${atsResult.details.interpretation}`);
      console.log(`   Confidence: ${atsResult.details.confidence}`);
      console.log(`   Percentile: ${atsResult.details.scorePercentile}th`);
      console.log(`   Recommendations:`);
      atsResult.details.recommendations.forEach((rec, i) => {
        console.log(`     ${i + 1}. ${rec}`);
      });
      passedTests++;
    } else {
      console.log('❌ Detailed analysis failed');
    }

    // Test 5: Verify scoring breakdown
    console.log('\nTest 5: Verify scoring breakdown...');
    totalTests++;

    if (atsResult.details &&
        atsResult.details.scoring &&
        atsResult.details.scoring.semanticWeight === 0.8 &&
        atsResult.details.scoring.keywordWeight === 0.2) {
      console.log('✅ Scoring breakdown correct');
      console.log(`   Semantic contribution: ${atsResult.details.scoring.semanticContribution}`);
      console.log(`   Keyword contribution: ${atsResult.details.scoring.keywordContribution}`);
      console.log(`   Total: ${atsResult.details.scoring.semanticContribution + atsResult.details.scoring.keywordContribution}`);
      passedTests++;
    } else {
      console.log('❌ Scoring breakdown incorrect');
    }

    // Test 6: Test cache performance (second run)
    console.log('\nTest 6: Test cache performance (second run)...');
    totalTests++;

    const start2 = Date.now();
    const atsResult2 = await scoreResumeWithEmbeddings({
      resumeData,
      jobDescription,
      includeDetails: false
    });
    const duration2 = Date.now() - start2;

    if (atsResult2.overall === atsResult.overall &&
        atsResult2.performance.fromCache === true &&
        duration2 < duration) {
      console.log('✅ Cache performance verified');
      console.log(`   Duration: ${duration2}ms (vs ${duration}ms first run)`);
      console.log(`   Speed improvement: ${((duration - duration2) / duration * 100).toFixed(1)}% faster`);
      console.log(`   From cache: ${atsResult2.performance.fromCache}`);
      passedTests++;
    } else {
      console.log('⚠️  Cache not used or slower (may be expected)');
      console.log(`   Duration: ${duration2}ms vs ${duration}ms`);
    }

    // Final summary
    console.log('\n========================================');
    console.log('  TEST SUMMARY');
    console.log('========================================');
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%\n`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Embedding ATS is ready! 🎉');
      console.log('\n📊 FINAL ATS SCORE: ' + atsResult.overall + '/100');
      console.log(`   Interpretation: ${atsResult.details.interpretation}`);
      console.log('\n✅ The embedding-based ATS system is fully operational!\n');
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

testEmbeddingATS();

