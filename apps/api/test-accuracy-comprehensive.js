#!/usr/bin/env node
// Comprehensive accuracy test for embedding-based ATS system
// Tests 100 JDs x 100 Resumes = 10,000 combinations

require('dotenv').config();
const jobDescriptions = require('./test-data/job-descriptions');
const resumes = require('./test-data/resumes');
const { scoreResumeWithEmbeddings } = require('./services/embeddings/embeddingATSService');

console.log('\n================================================================');
console.log('  COMPREHENSIVE ATS ACCURACY TEST');
console.log('================================================================\n');

console.log(`📊 Test Scale:`);
console.log(`   Job Descriptions: ${jobDescriptions.length}`);
console.log(`   Resumes: ${resumes.length}`);
console.log(`   Total Combinations: ${jobDescriptions.length * resumes.length}`);
console.log(`\n⏱️  Estimated Time: ~${Math.round((jobDescriptions.length * resumes.length) / 60)} minutes\n`);

async function runAccuracyTest() {
  const results = {
    totalTests: 0,
    perfectMatches: [], // Expected 80-95+ scores
    goodMatches: [],    // Expected 65-80 scores
    partialMatches: [], // Expected 45-65 scores
    poorMatches: [],    // Expected 20-45 scores
    errors: [],
    timings: [],
    scores: []
  };

  console.log('Starting comprehensive test...\n');
  console.log('Progress:');
  
  const startTime = Date.now();
  let completed = 0;
  const total = jobDescriptions.length * resumes.length;

  // Test strategic sample: Top 10 JDs x Top 50 resumes for speed
  // For full test, remove slice()
  const testJDs = jobDescriptions.slice(0, 10);
  const testResumes = resumes.slice(0, 50);
  
  console.log(`\n⚡ Running optimized test: ${testJDs.length} JDs x ${testResumes.length} resumes = ${testJDs.length * testResumes.length} combinations\n`);

  for (const jd of testJDs) {
    console.log(`\n📄 Testing JD: ${jd.title} (${jd.id})`);
    
    for (const resume of testResumes) {
      const testStart = Date.now();
      
      try {
        // Prepare resume data in expected format
        const resumeData = {
          name: resume.name,
          title: resume.title,
          summary: resume.summary,
          skills: resume.skills,
          experience: resume.experience,
          education: resume.education
        };

        // Run ATS check
        const result = await scoreResumeWithEmbeddings({
          resumeData,
          jobDescription: jd.description,
          includeDetails: true
        });

        const testDuration = Date.now() - testStart;
        results.timings.push(testDuration);
        results.scores.push(result.overall);

        // Categorize result
        const testCase = {
          jdId: jd.id,
          jdTitle: jd.title,
          resumeId: resume.id,
          resumeName: resume.name,
          resumeTitle: resume.title,
          score: result.overall,
          semanticScore: result.semanticScore,
          similarity: result.similarity,
          keywordMatchRate: result.keywordMatchRate,
          duration: testDuration,
          isExpectedMatch: resume.expectedMatch && resume.expectedMatch.includes(jd.id)
        };

        if (result.overall >= 80) {
          results.perfectMatches.push(testCase);
        } else if (result.overall >= 65) {
          results.goodMatches.push(testCase);
        } else if (result.overall >= 45) {
          results.partialMatches.push(testCase);
        } else {
          results.poorMatches.push(testCase);
        }

        results.totalTests++;
        completed++;

        // Progress indicator
        if (completed % 10 === 0) {
          const progress = ((completed / (testJDs.length * testResumes.length)) * 100).toFixed(1);
          const avgTime = results.timings.reduce((a, b) => a + b, 0) / results.timings.length;
          process.stdout.write(`\r  Progress: ${completed}/${testJDs.length * testResumes.length} (${progress}%) | Avg: ${Math.round(avgTime)}ms`);
        }

      } catch (error) {
        results.errors.push({
          jdId: jd.id,
          resumeId: resume.id,
          error: error.message
        });
        completed++;
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  
  console.log(`\n\n================================================================`);
  console.log(`  TEST COMPLETE!`);
  console.log(`================================================================\n`);

  // Calculate statistics
  const avgScore = results.scores.reduce((a, b) => a + b, 0) / results.scores.length;
  const avgTime = results.timings.reduce((a, b) => a + b, 0) / results.timings.length;
  const maxTime = Math.max(...results.timings);
  const minTime = Math.min(...results.timings);

  console.log(`📊 OVERALL STATISTICS:\n`);
  console.log(`   Total Tests: ${results.totalTests}`);
  console.log(`   Errors: ${results.errors.length}`);
  console.log(`   Success Rate: ${((1 - results.errors.length / results.totalTests) * 100).toFixed(2)}%`);
  console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`   Avg Time per Test: ${Math.round(avgTime)}ms`);
  console.log(`   Min Time: ${minTime}ms`);
  console.log(`   Max Time: ${maxTime}ms\n`);

  console.log(`📈 SCORE DISTRIBUTION:\n`);
  console.log(`   Perfect Matches (80-100): ${results.perfectMatches.length} (${((results.perfectMatches.length / results.totalTests) * 100).toFixed(1)}%)`);
  console.log(`   Good Matches (65-79): ${results.goodMatches.length} (${((results.goodMatches.length / results.totalTests) * 100).toFixed(1)}%)`);
  console.log(`   Partial Matches (45-64): ${results.partialMatches.length} (${((results.partialMatches.length / results.totalTests) * 100).toFixed(1)}%)`);
  console.log(`   Poor Matches (0-44): ${results.poorMatches.length} (${((results.poorMatches.length / results.totalTests) * 100).toFixed(1)}%)`);
  console.log(`   Average Score: ${avgScore.toFixed(2)}\n`);

  // Show top matches
  console.log(`🏆 TOP 10 MATCHES:\n`);
  const topMatches = [...results.perfectMatches, ...results.goodMatches]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  topMatches.forEach((match, index) => {
    const matchType = match.isExpectedMatch ? '✅ Expected' : '  ';
    console.log(`${index + 1}. ${matchType} Score: ${match.score}`);
    console.log(`   Resume: ${match.resumeName} (${match.resumeTitle})`);
    console.log(`   JD: ${match.jdTitle}`);
    console.log(`   Semantic: ${match.semanticScore} | Keywords: ${match.keywordMatchRate}% | ${match.duration}ms\n`);
  });

  // Show expected matches accuracy
  const expectedMatches = [...results.perfectMatches, ...results.goodMatches, ...results.partialMatches]
    .filter(m => m.isExpectedMatch);
  
  const expectedMatchesHighScore = expectedMatches.filter(m => m.score >= 70).length;
  
  console.log(`\n🎯 EXPECTED MATCH ACCURACY:\n`);
  console.log(`   Total Expected Matches: ${expectedMatches.length}`);
  console.log(`   High Scores (>=70): ${expectedMatchesHighScore}`);
  console.log(`   Accuracy: ${expectedMatches.length > 0 ? ((expectedMatchesHighScore / expectedMatches.length) * 100).toFixed(1) : 0}%\n`);

  // Show score ranges
  const scoreRanges = {
    '90-100': 0,
    '80-89': 0,
    '70-79': 0,
    '60-69': 0,
    '50-59': 0,
    '40-49': 0,
    '30-39': 0,
    '20-29': 0,
    '10-19': 0,
    '0-9': 0
  };

  results.scores.forEach(score => {
    if (score >= 90) scoreRanges['90-100']++;
    else if (score >= 80) scoreRanges['80-89']++;
    else if (score >= 70) scoreRanges['70-79']++;
    else if (score >= 60) scoreRanges['60-69']++;
    else if (score >= 50) scoreRanges['50-59']++;
    else if (score >= 40) scoreRanges['40-49']++;
    else if (score >= 30) scoreRanges['30-39']++;
    else if (score >= 20) scoreRanges['20-29']++;
    else if (score >= 10) scoreRanges['10-19']++;
    else scoreRanges['0-9']++;
  });

  console.log(`📊 SCORE RANGES:\n`);
  Object.entries(scoreRanges).forEach(([range, count]) => {
    const percentage = ((count / results.totalTests) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(percentage / 2));
    console.log(`   ${range}: ${bar} ${count} (${percentage}%)`);
  });

  // Performance metrics
  console.log(`\n⚡ PERFORMANCE METRICS:\n`);
  console.log(`   Tests per Second: ${(results.totalTests / (totalDuration / 1000)).toFixed(2)}`);
  console.log(`   Avg Response Time: ${Math.round(avgTime)}ms`);
  console.log(`   Fastest Test: ${minTime}ms`);
  console.log(`   Slowest Test: ${maxTime}ms`);
  
  const percentile95 = results.timings.sort((a, b) => a - b)[Math.floor(results.timings.length * 0.95)];
  console.log(`   95th Percentile: ${percentile95}ms`);

  // Cost estimation
  const avgTokens = 1500; // Estimated average tokens per request
  const costPer1K = 0.00002; // text-embedding-3-small cost
  const totalCost = (results.totalTests * avgTokens / 1000) * costPer1K;
  
  console.log(`\n💰 COST ESTIMATION:\n`);
  console.log(`   Total Tests: ${results.totalTests}`);
  console.log(`   Est. Tokens: ${(results.totalTests * avgTokens).toLocaleString()}`);
  console.log(`   Cost: $${totalCost.toFixed(4)}\n`);

  if (results.errors.length > 0) {
    console.log(`\n❌ ERRORS (${results.errors.length}):\n`);
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. JD: ${error.jdId} | Resume: ${error.resumeId}`);
      console.log(`   Error: ${error.error}\n`);
    });
  }

  console.log(`\n================================================================`);
  console.log(`  SYSTEM ASSESSMENT`);
  console.log(`================================================================\n`);

  const successRate = ((1 - results.errors.length / results.totalTests) * 100);
  const avgResponseTime = avgTime;
  const highScoreAccuracy = expectedMatches.length > 0 ? (expectedMatchesHighScore / expectedMatches.length * 100) : 0;

  console.log(`✅ Success Rate: ${successRate.toFixed(2)}% ${successRate >= 99 ? '✓ EXCELLENT' : successRate >= 95 ? '✓ GOOD' : '⚠ NEEDS IMPROVEMENT'}`);
  console.log(`⚡ Avg Response: ${Math.round(avgResponseTime)}ms ${avgResponseTime < 2000 ? '✓ FAST' : avgResponseTime < 5000 ? '✓ ACCEPTABLE' : '⚠ SLOW'}`);
  console.log(`🎯 Match Accuracy: ${highScoreAccuracy.toFixed(1)}% ${highScoreAccuracy >= 80 ? '✓ EXCELLENT' : highScoreAccuracy >= 70 ? '✓ GOOD' : '⚠ NEEDS IMPROVEMENT'}`);
  console.log(`📊 Score Distribution: ${avgScore.toFixed(2)} avg ${avgScore >= 50 && avgScore <= 70 ? '✓ BALANCED' : '⚠ REVIEW'}`);

  const overallRating = (successRate >= 99 ? 1 : 0) + 
                        (avgResponseTime < 2000 ? 1 : 0) + 
                        (highScoreAccuracy >= 80 ? 1 : 0) + 
                        (avgScore >= 50 && avgScore <= 70 ? 1 : 0);

  console.log(`\n🏆 Overall Rating: ${overallRating}/4`);
  
  if (overallRating === 4) {
    console.log(`   ⭐⭐⭐⭐ EXCELLENT - Production ready!`);
  } else if (overallRating === 3) {
    console.log(`   ⭐⭐⭐ GOOD - Minor improvements recommended`);
  } else if (overallRating === 2) {
    console.log(`   ⭐⭐ FAIR - Some improvements needed`);
  } else {
    console.log(`   ⭐ NEEDS WORK - Significant improvements required`);
  }

  console.log(`\n================================================================\n`);

  return results;
}

// Run the test
runAccuracyTest()
  .then(() => {
    console.log('✅ Accuracy test completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  });

