#!/usr/bin/env node
// QUALITATIVE ACCURACY TEST
// Tests if the system truly understands: keywords, semantics, and context

require('dotenv').config();
const { scoreResumeWithIntelligentATS } = require('./services/embeddings/embeddingATSService');

console.log('\n================================================================');
console.log('  QUALITATIVE ACCURACY TEST');
console.log('  Testing: Keywords, Semantics, Context Understanding');
console.log('================================================================\n');

// Test cases designed to validate specific accuracy aspects
const testCases = [
  {
    name: 'Test 1: Perfect Match - All Keywords Present',
    description: 'Resume has ALL required keywords from JD',
    jobDescription: `Senior Full-Stack Developer

Requirements:
- 5+ years JavaScript experience
- React and Node.js expertise
- PostgreSQL database knowledge
- AWS cloud experience
- Docker containerization
- CI/CD pipelines
- Git version control`,
    resume: {
      name: 'John Doe',
      title: 'Senior Full-Stack Developer',
      summary: 'Full-stack developer with 6 years of JavaScript experience',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD', 'Git'],
      experience: [{
        company: 'Tech Co',
        title: 'Senior Developer',
        duration: '2018-Present',
        description: 'Built applications using React and Node.js. Managed PostgreSQL databases. Deployed on AWS using Docker containers. Implemented CI/CD pipelines with Git.'
      }],
      education: [{ degree: 'BS Computer Science', school: 'University', year: '2018' }]
    },
    expectedOutcome: {
      scoreRange: '85-95',
      keywordMatch: '90%+',
      semanticScore: '85+',
      missingKeywords: 'Few or none',
      reasoning: 'Has all required keywords explicitly'
    }
  },

  {
    name: 'Test 2: Semantic Match - Synonyms & Related Terms',
    description: 'Resume uses different words but same meaning',
    jobDescription: `DevOps Engineer

Requirements:
- Container orchestration
- Cloud infrastructure
- Continuous integration
- Infrastructure as code
- Monitoring and logging`,
    resume: {
      name: 'Jane Smith',
      title: 'DevOps Engineer',
      summary: 'DevOps specialist with cloud expertise',
      skills: ['Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Prometheus', 'ELK Stack'],
      experience: [{
        company: 'Cloud Co',
        title: 'DevOps Engineer',
        duration: '2020-Present',
        description: 'Managed Kubernetes clusters for container management. Built AWS infrastructure using Terraform for infrastructure automation. Implemented Jenkins pipelines for automated builds. Setup Prometheus and ELK for system monitoring and log aggregation.'
      }],
      education: [{ degree: 'BS IT', school: 'Tech University', year: '2020' }]
    },
    expectedOutcome: {
      scoreRange: '75-85',
      keywordMatch: '0-20% (different words)',
      semanticScore: '75+',
      missingKeywords: 'Should recognize: Kubernetes=orchestration, Terraform=IaC, Jenkins=CI',
      reasoning: 'Should score HIGH despite keyword mismatch due to semantic understanding'
    }
  },

  {
    name: 'Test 3: Missing Critical Skills',
    description: 'Resume lacks key requirements',
    jobDescription: `Machine Learning Engineer

Requirements:
- Deep learning frameworks (TensorFlow, PyTorch)
- Python programming
- Model deployment
- MLOps experience
- Statistical analysis`,
    resume: {
      name: 'Bob Johnson',
      title: 'Software Developer',
      summary: 'General software developer',
      skills: ['Java', 'Spring Boot', 'MySQL', 'HTML', 'CSS'],
      experience: [{
        company: 'Web Co',
        title: 'Java Developer',
        duration: '2021-Present',
        description: 'Developed web applications using Java Spring Boot. Worked with MySQL databases.'
      }],
      education: [{ degree: 'BS Computer Science', school: 'University', year: '2021' }]
    },
    expectedOutcome: {
      scoreRange: '10-25',
      keywordMatch: '0-5%',
      semanticScore: '10-20',
      missingKeywords: 'All major requirements: TensorFlow, PyTorch, Python, ML, MLOps',
      reasoning: 'Should score LOW - completely different domain'
    }
  },

  {
    name: 'Test 4: Context Understanding - Right Domain, Wrong Level',
    description: 'Junior applying for senior role',
    jobDescription: `Senior React Developer

Requirements:
- 7+ years React development
- Team leadership experience
- Architecture design
- Mentoring developers
- Performance optimization`,
    resume: {
      name: 'Alice Williams',
      title: 'Junior React Developer',
      summary: 'Recent graduate with 1 year React experience',
      skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
      experience: [{
        company: 'Startup Inc',
        title: 'Junior Developer',
        duration: '2023-Present',
        description: 'Learning React development. Building basic UI components. Working on small features.'
      }],
      education: [{ degree: 'BS Computer Science', school: 'University', year: '2023' }]
    },
    expectedOutcome: {
      scoreRange: '35-50',
      keywordMatch: '20-30% (has React)',
      semanticScore: '30-45',
      missingKeywords: 'Leadership, architecture, mentoring, senior-level experience',
      reasoning: 'Should score MEDIUM - has basic skills but wrong seniority level'
    }
  },

  {
    name: 'Test 5: Transferable Skills - Adjacent Domain',
    description: 'Similar but not exact match',
    jobDescription: `Backend Node.js Developer

Requirements:
- Node.js and Express
- REST API design
- Database management
- Server-side programming`,
    resume: {
      name: 'Chris Brown',
      title: 'Full-Stack Developer',
      summary: 'Full-stack developer with backend focus',
      skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Microservices'],
      experience: [{
        company: 'Tech Startup',
        title: 'Full-Stack Developer',
        duration: '2020-Present',
        description: 'Built backend services using Node.js and Express. Designed RESTful APIs. Managed MongoDB databases. Implemented microservices architecture.'
      }],
      education: [{ degree: 'BS Software Engineering', school: 'University', year: '2020' }]
    },
    expectedOutcome: {
      scoreRange: '80-90',
      keywordMatch: '80%+',
      semanticScore: '80+',
      missingKeywords: 'None major - great match',
      reasoning: 'Should score HIGH - perfect skill match with actual experience'
    }
  },

  {
    name: 'Test 6: Keyword Stuffing vs Real Experience',
    description: 'All keywords but shallow experience',
    jobDescription: `Senior Data Scientist

Requirements:
- Machine learning expertise
- Python, TensorFlow, PyTorch
- Statistical modeling
- Big data processing
- Model deployment`,
    resume: {
      name: 'Dan Lee',
      title: 'Data Scientist',
      summary: 'Data scientist with various skills',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Statistics', 'Big Data', 'Model Deployment'],
      experience: [{
        company: 'Data Corp',
        title: 'Data Scientist',
        duration: '2023-Present (6 months)',
        description: 'Completed online courses in machine learning. Working on tutorial projects.'
      }],
      education: [{ degree: 'BS Mathematics', school: 'University', year: '2023' }]
    },
    expectedOutcome: {
      scoreRange: '55-70',
      keywordMatch: '80%+ (all keywords present)',
      semanticScore: '50-65',
      missingKeywords: 'Keywords present but lacks depth',
      reasoning: 'Should score MEDIUM - has keywords but context shows junior level, not senior'
    }
  },

  {
    name: 'Test 7: Industry-Specific Context',
    description: 'Same tech, different industry context',
    jobDescription: `Healthcare Software Engineer

Requirements:
- Python programming
- Healthcare/Medical domain knowledge
- HIPAA compliance understanding
- Electronic Health Records (EHR)
- Patient data security`,
    resume: {
      name: 'Emma Davis',
      title: 'Python Developer',
      summary: 'Python developer with e-commerce background',
      skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'AWS'],
      experience: [{
        company: 'E-Commerce Co',
        title: 'Python Developer',
        duration: '2019-Present',
        description: 'Built e-commerce platforms using Python and Django. Handled customer data and transactions. Implemented payment processing systems.'
      }],
      education: [{ degree: 'BS Computer Science', school: 'University', year: '2019' }]
    },
    expectedOutcome: {
      scoreRange: '40-55',
      keywordMatch: '20% (Python only)',
      semanticScore: '35-50',
      missingKeywords: 'Healthcare, HIPAA, EHR, medical domain knowledge',
      reasoning: 'Should score MEDIUM-LOW - has tech skills but wrong domain context'
    }
  },

  {
    name: 'Test 8: Related Technologies & Learning Ability',
    description: 'Similar stack with learning capacity',
    jobDescription: `React Developer

Requirements:
- React experience
- Modern JavaScript
- Component design`,
    resume: {
      name: 'Frank Miller',
      title: 'Vue.js Developer',
      summary: 'Frontend developer specializing in Vue.js',
      skills: ['Vue.js', 'JavaScript', 'TypeScript', 'Component Architecture', 'State Management', 'Vuex'],
      experience: [{
        company: 'Frontend Inc',
        title: 'Vue Developer',
        duration: '2020-Present',
        description: 'Built complex SPAs using Vue.js. Designed reusable component systems. Managed state with Vuex. Strong understanding of modern JavaScript frameworks and component-based architecture.'
      }],
      education: [{ degree: 'BS Web Development', school: 'University', year: '2020' }]
    },
    expectedOutcome: {
      scoreRange: '60-75',
      keywordMatch: '30-40% (JavaScript, components)',
      semanticScore: '65-75',
      missingKeywords: 'React specific, but has equivalent Vue.js',
      reasoning: 'Should score GOOD - different framework but highly transferable skills'
    }
  }
];

async function runQualitativeTest() {
  console.log('Running qualitative accuracy tests...\n');
  console.log('═'.repeat(80) + '\n');

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`${test.name}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`\n📋 DESCRIPTION: ${test.description}\n`);

    try {
      const result = await scoreResumeWithIntelligentATS({
        resumeData: test.resume,
        jobDescription: test.jobDescription,
        includeDetails: true
      });

      // Analyze result
      const analysis = {
        testName: test.name,
        actualScore: result.overall,
        expectedRange: test.expectedOutcome.scoreRange,
        actualSemantic: result.semanticScore,
        actualKeywordMatch: result.keywordMatchRate,
        expectedKeywordMatch: test.expectedOutcome.keywordMatch,
        missingKeywords: result.missingKeywords || [],
        matchedKeywords: result.matchedKeywords || [],
        similarity: result.similarity,
        passed: false,
        reasoning: ''
      };

      // Check if score is in expected range
      const [minExpected, maxExpected] = test.expectedOutcome.scoreRange.split('-').map(s => parseInt(s));
      const scoreInRange = result.overall >= minExpected && result.overall <= maxExpected;

      console.log(`✅ EXPECTED OUTCOME:`);
      console.log(`   Score Range: ${test.expectedOutcome.scoreRange}`);
      console.log(`   Keyword Match: ${test.expectedOutcome.keywordMatch}`);
      console.log(`   Semantic Score: ${test.expectedOutcome.semanticScore}`);
      console.log(`   Missing: ${test.expectedOutcome.missingKeywords}`);
      console.log(`   Reasoning: ${test.expectedOutcome.reasoning}\n`);

      console.log(`📊 ACTUAL RESULT:`);
      console.log(`   Overall Score: ${result.overall}${scoreInRange ? ' ✅' : ' ⚠️'}`);
      console.log(`   Semantic Score: ${result.semanticScore}`);
      console.log(`   Keyword Match: ${result.keywordMatchRate}%`);
      console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
      console.log(`   Response Time: ${result.duration}ms\n`);

      console.log(`🔍 MATCHED KEYWORDS (${result.matchedKeywords?.length || 0}):`);
      if (result.matchedKeywords && result.matchedKeywords.length > 0) {
        console.log(`   ${result.matchedKeywords.slice(0, 10).join(', ')}${result.matchedKeywords.length > 10 ? '...' : ''}\n`);
      } else {
        console.log(`   None\n`);
      }

      console.log(`❌ MISSING KEYWORDS (${result.missingKeywords?.length || 0}):`);
      if (result.missingKeywords && result.missingKeywords.length > 0) {
        console.log(`   ${result.missingKeywords.slice(0, 10).join(', ')}${result.missingKeywords.length > 10 ? '...' : ''}\n`);
      } else {
        console.log(`   None\n`);
      }

      // Determine if test passed
      if (scoreInRange) {
        analysis.passed = true;
        analysis.reasoning = '✅ Score within expected range';
        console.log(`\n✅ TEST PASSED: Score within expected range`);
      } else {
        analysis.reasoning = `⚠️ Score ${result.overall} outside expected range ${test.expectedOutcome.scoreRange}`;
        console.log(`\n⚠️ TEST NEEDS REVIEW: ${analysis.reasoning}`);
      }

      // Contextual analysis
      console.log(`\n💡 CONTEXTUAL ANALYSIS:`);
      if (test.name.includes('Semantic Match')) {
        const goodSemantic = result.semanticScore >= 70;
        console.log(`   ${goodSemantic ? '✅' : '⚠️'} Semantic understanding: ${goodSemantic ? 'GOOD - Recognized synonyms' : 'NEEDS WORK - May be too keyword-focused'}`);
      }
      
      if (test.name.includes('Missing Critical')) {
        const properlyLow = result.overall < 30;
        console.log(`   ${properlyLow ? '✅' : '⚠️'} Rejection accuracy: ${properlyLow ? 'GOOD - Correctly identified poor match' : 'CONCERN - May be scoring too generously'}`);
      }

      if (test.name.includes('Context Understanding')) {
        const recognizedLevel = result.overall < 55;
        console.log(`   ${recognizedLevel ? '✅' : '⚠️'} Seniority detection: ${recognizedLevel ? 'GOOD - Recognized junior level' : 'NEEDS WORK - Not detecting experience level'}`);
      }

      if (test.name.includes('Keyword Stuffing')) {
        const notFooled = result.overall < 75;
        console.log(`   ${notFooled ? '✅' : '⚠️'} Depth analysis: ${notFooled ? 'GOOD - Not fooled by keywords alone' : 'CONCERN - May reward keyword stuffing'}`);
      }

      results.push(analysis);

    } catch (error) {
      console.error(`\n❌ TEST FAILED: ${error.message}\n`);
      results.push({
        testName: test.name,
        error: error.message,
        passed: false
      });
    }
  }

  // Final Summary
  console.log(`\n\n${'═'.repeat(80)}`);
  console.log(`  QUALITATIVE ACCURACY SUMMARY`);
  console.log(`${'═'.repeat(80)}\n`);

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`📊 TEST RESULTS:\n`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Needs Review: ${totalTests - passedTests}`);
  console.log(`   Pass Rate: ${passRate}%\n`);

  console.log(`🎯 ACCURACY ASSESSMENT:\n`);

  // Keyword Accuracy
  const keywordTests = results.filter(r => r.testName.includes('Perfect Match') || r.testName.includes('Missing Critical'));
  const keywordPassed = keywordTests.filter(r => r.passed).length;
  console.log(`   Keyword Detection: ${keywordPassed}/${keywordTests.length} ${keywordPassed === keywordTests.length ? '✅' : '⚠️'}`);

  // Semantic Accuracy
  const semanticTests = results.filter(r => r.testName.includes('Semantic') || r.testName.includes('Transferable'));
  const semanticPassed = semanticTests.filter(r => r.passed).length;
  console.log(`   Semantic Understanding: ${semanticPassed}/${semanticTests.length} ${semanticPassed === semanticTests.length ? '✅' : '⚠️'}`);

  // Context Accuracy
  const contextTests = results.filter(r => r.testName.includes('Context') || r.testName.includes('Industry'));
  const contextPassed = contextTests.filter(r => r.passed).length;
  console.log(`   Context Awareness: ${contextPassed}/${contextTests.length} ${contextPassed === contextTests.length ? '✅' : '⚠️'}`);

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`  OVERALL RATING`);
  console.log(`${'═'.repeat(80)}\n`);

  if (passRate >= 90) {
    console.log(`   ⭐⭐⭐⭐⭐ EXCELLENT (${passRate}%)`);
    console.log(`   System demonstrates strong accuracy across all dimensions\n`);
  } else if (passRate >= 75) {
    console.log(`   ⭐⭐⭐⭐ VERY GOOD (${passRate}%)`);
    console.log(`   System is reliable with minor improvements possible\n`);
  } else if (passRate >= 60) {
    console.log(`   ⭐⭐⭐ GOOD (${passRate}%)`);
    console.log(`   System works but needs some refinements\n`);
  } else {
    console.log(`   ⭐⭐ NEEDS IMPROVEMENT (${passRate}%)`);
    console.log(`   System requires tuning for better accuracy\n`);
  }

  console.log(`${'═'.repeat(80)}\n`);

  return results;
}

// Run the test
runQualitativeTest()
  .then(() => {
    console.log('✅ Qualitative accuracy test completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  });

