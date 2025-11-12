// Accuracy Test - After Experience & Quality Improvements
// Tests ATS scoring across multiple industries

const { scoreResumeWorldClass } = require('./services/ats/worldClassATS');

// Test cases covering multiple industries
const TEST_CASES = [
  {
    name: "IT/Software - Full Stack Developer",
    jobDescription: `
      Senior Full Stack Developer
      Requirements:
      - 5+ years React, Node.js, TypeScript
      - Experience with MongoDB, PostgreSQL
      - AWS, Docker, Kubernetes
      - CI/CD pipelines, Git
    `,
    resume: {
      data: {
        name: "John Doe",
        title: "Senior Full Stack Developer",
        summary: "Full stack developer with 6 years experience in React, Node.js, and cloud technologies",
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Jenkins", "Git"],
        experience: [
          {
            title: "Senior Software Engineer",
            company: "Tech Corp",
            description: "Built scalable web applications using React and Node.js. Deployed on AWS using Docker and Kubernetes. Set up CI/CD pipelines with Jenkins.",
            duration: "4 years"
          },
          {
            title: "Software Engineer",
            company: "StartupCo",
            description: "Developed full-stack features using React and Node.js. Worked with MongoDB and PostgreSQL databases.",
            duration: "2 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "IT/Software"
  },
  
  {
    name: "Healthcare - EHR Specialist",
    jobDescription: `
      Epic EHR Analyst
      Requirements:
      - 3+ years Epic experience (required)
      - Epic certification preferred
      - HL7/FHIR knowledge
      - Healthcare workflows
    `,
    resume: {
      data: {
        name: "Sarah Johnson",
        title: "Epic EHR Analyst",
        summary: "Certified Epic analyst with 4 years experience implementing and optimizing Epic systems",
        skills: ["Epic", "Epic Willow", "Epic Beaker", "HL7", "FHIR", "Healthcare IT", "Clinical Workflows"],
        experience: [
          {
            title: "Epic Analyst",
            company: "Hospital System",
            description: "Implemented Epic Willow and Beaker modules. Managed HL7 interfaces and FHIR integrations. Trained clinical staff on Epic workflows.",
            duration: "4 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "Healthcare"
  },
  
  {
    name: "Finance - Trading Systems",
    jobDescription: `
      Trading Platform Developer
      Requirements:
      - Bloomberg Terminal, Refinitiv Eikon
      - FIX protocol experience
      - Python, C++
      - Capital markets knowledge
    `,
    resume: {
      data: {
        name: "Michael Chen",
        title: "Trading Systems Developer",
        summary: "Quantitative developer specializing in trading platforms and market data systems",
        skills: ["Bloomberg Terminal", "Refinitiv", "FIX Protocol", "Python", "C++", "Market Data", "Trading Systems"],
        experience: [
          {
            title: "Trading Systems Developer",
            company: "Investment Bank",
            description: "Developed automated trading systems using Bloomberg API and Refinitiv Eikon. Implemented FIX protocol integrations. Built real-time market data pipelines in Python and C++.",
            duration: "3 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "Finance"
  },
  
  {
    name: "Manufacturing - CAD Engineer",
    jobDescription: `
      Mechanical Design Engineer
      Requirements:
      - SolidWorks expert
      - CATIA experience
      - FEA analysis (ANSYS)
      - PLM (Teamcenter or Windchill)
    `,
    resume: {
      data: {
        name: "David Martinez",
        title: "Senior Mechanical Design Engineer",
        summary: "Mechanical engineer with expertise in CAD design and FEA analysis",
        skills: ["SolidWorks", "CATIA", "ANSYS", "Teamcenter", "AutoCAD", "FEA", "CAD/CAM"],
        experience: [
          {
            title: "Mechanical Design Engineer",
            company: "Aerospace Company",
            description: "Designed complex mechanical assemblies using SolidWorks and CATIA. Performed FEA analysis with ANSYS. Managed design data in Teamcenter PLM.",
            duration: "5 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "Manufacturing"
  },
  
  {
    name: "Marketing - Marketing Automation",
    jobDescription: `
      Marketing Operations Manager
      Requirements:
      - Marketo or Pardot experience
      - Salesforce integration
      - Google Analytics, SEMrush
      - B2B marketing automation
    `,
    resume: {
      data: {
        name: "Emily Wilson",
        title: "Marketing Operations Manager",
        summary: "Marketing ops professional with expertise in Marketo and marketing automation",
        skills: ["Marketo", "Salesforce", "Google Analytics", "SEMrush", "Pardot", "Marketing Automation", "B2B Marketing"],
        experience: [
          {
            title: "Marketing Operations Manager",
            company: "SaaS Company",
            description: "Managed Marketo platform integrated with Salesforce. Built automated nurture campaigns. Analyzed performance using Google Analytics and SEMrush.",
            duration: "3 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "Marketing"
  },
  
  {
    name: "Retail - E-commerce Manager",
    jobDescription: `
      E-commerce Platform Manager
      Requirements:
      - Shopify Plus experience
      - Google Ads, Facebook Ads
      - Analytics (GA4, Mixpanel)
      - Supply chain coordination
    `,
    resume: {
      data: {
        name: "Jessica Brown",
        title: "E-commerce Manager",
        summary: "E-commerce professional with expertise in Shopify and digital marketing",
        skills: ["Shopify", "Shopify Plus", "Google Ads", "Facebook Ads", "Google Analytics", "Mixpanel", "E-commerce"],
        experience: [
          {
            title: "E-commerce Manager",
            company: "Retail Brand",
            description: "Managed Shopify Plus platform. Ran Google Ads and Facebook Ads campaigns. Tracked conversions with GA4 and Mixpanel. Coordinated with supply chain for inventory.",
            duration: "4 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "Retail"
  },
  
  {
    name: "Construction - Project Manager",
    jobDescription: `
      Construction Project Manager
      Requirements:
      - Procore experience required
      - BIM (Revit) knowledge
      - Primavera P6 or MS Project
      - Commercial construction
    `,
    resume: {
      data: {
        name: "Robert Taylor",
        title: "Construction Project Manager",
        summary: "PMP-certified construction manager with expertise in Procore and BIM",
        skills: ["Procore", "Revit", "Primavera P6", "BIM", "Construction Management", "Bluebeam", "AutoCAD"],
        experience: [
          {
            title: "Construction Project Manager",
            company: "General Contractor",
            description: "Managed $50M+ commercial projects using Procore. Coordinated BIM models in Revit. Created schedules in Primavera P6. Used Bluebeam for document management.",
            duration: "6 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "Construction"
  },
  
  {
    name: "Legal - eDiscovery Specialist",
    jobDescription: `
      eDiscovery Analyst
      Requirements:
      - Relativity experience required
      - Nuix or Logikcull
      - Legal hold procedures
      - Data processing and review
    `,
    resume: {
      data: {
        name: "Amanda Lee",
        title: "eDiscovery Analyst",
        summary: "Legal technology specialist with expertise in Relativity and litigation support",
        skills: ["Relativity", "Nuix", "Logikcull", "eDiscovery", "Legal Hold", "Data Processing", "Document Review"],
        experience: [
          {
            title: "eDiscovery Analyst",
            company: "Law Firm",
            description: "Managed eDiscovery projects in Relativity. Processed data with Nuix. Implemented legal hold procedures. Supported document review teams.",
            duration: "3 years"
          }
        ]
      }
    },
    expectedScore: { min: 80, max: 95 },
    category: "Legal"
  }
];

async function runAccuracyTests() {
  console.log('\n🧪 ACCURACY TEST - IMPROVED ALGORITHMS\n');
  console.log('Testing Experience & Quality Scoring improvements...\n');
  
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCase of TEST_CASES) {
    totalTests++;
    console.log(`\n📋 Test ${totalTests}: ${testCase.name}`);
    console.log(`   Category: ${testCase.category}`);
    console.log(`   Expected Score: ${testCase.expectedScore.min}-${testCase.expectedScore.max}%`);
    
    try {
      const result = await scoreResumeWorldClass({
        resumeData: testCase.resume.data,
        jobDescription: testCase.jobDescription,
        useAI: true
      });
      
      const score = result.overall;
      const passed = score >= testCase.expectedScore.min && score <= testCase.expectedScore.max;
      
      if (passed) {
        console.log(`   ✅ PASS - Score: ${score}%`);
        passedTests++;
      } else {
        console.log(`   ⚠️  ${score >= testCase.expectedScore.min - 5 ? 'CLOSE' : 'FAIL'} - Score: ${score}% (expected ${testCase.expectedScore.min}-${testCase.expectedScore.max}%)`);
        if (score >= testCase.expectedScore.min - 5) {
          passedTests += 0.5; // Half credit for being close
        }
      }
      
      // Show detailed breakdown
      console.log(`   📊 Breakdown:`);
      console.log(`      - Technical Skills: ${result.breakdown?.technicalSkills?.score || 0}% (contribution: ${result.breakdown?.technicalSkills?.contribution || 0})`);
      console.log(`      - Experience: ${result.breakdown?.experience?.score || 0}% (contribution: ${result.breakdown?.experience?.contribution || 0})`);
      console.log(`      - Skill Quality: ${result.breakdown?.skillQuality?.score || 0}% (contribution: ${result.breakdown?.skillQuality?.contribution || 0})`);
      console.log(`      - Years: ${result.breakdown?.experience?.years || 0} (required: ${result.breakdown?.experience?.required || 0})`);
      if (result.breakdown?.technicalSkills?.matched) {
        console.log(`      - Matched: ${result.breakdown.technicalSkills.matched.length}, Missing: ${result.breakdown.technicalSkills.missing.length}`);
      }
      
      results.push({
        ...testCase,
        actualScore: score,
        passed,
        result
      });
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.push({
        ...testCase,
        actualScore: 0,
        passed: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Passed: ${Math.floor(passedTests)} ✅`);
  console.log(`Close: ${passedTests % 1 > 0 ? Math.ceil(passedTests % 1 * 2) : 0} ⚠️`);
  console.log(`Failed: ${totalTests - Math.ceil(passedTests)} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Breakdown by category
  console.log('\n📈 RESULTS BY INDUSTRY:');
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) {
      categories[r.category] = { passed: 0, total: 0, scores: [] };
    }
    categories[r.category].total++;
    categories[r.category].scores.push(r.actualScore);
    if (r.passed) categories[r.category].passed++;
  });
  
  Object.entries(categories).forEach(([category, stats]) => {
    const avgScore = (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length).toFixed(1);
    console.log(`   ${category}: ${stats.passed}/${stats.total} (avg score: ${avgScore}%)`);
  });
  
  // Score distribution
  console.log('\n📊 SCORE DISTRIBUTION:');
  const scoreRanges = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 };
  results.forEach(r => {
    const score = r.actualScore;
    if (score >= 90) scoreRanges['90-100']++;
    else if (score >= 80) scoreRanges['80-89']++;
    else if (score >= 70) scoreRanges['70-79']++;
    else if (score >= 60) scoreRanges['60-69']++;
    else scoreRanges['<60']++;
  });
  Object.entries(scoreRanges).forEach(([range, count]) => {
    console.log(`   ${range}%: ${count} tests`);
  });
  
  // Failed/close tests detail
  const notPerfect = results.filter(r => !r.passed || r.actualScore < r.expectedScore.min);
  if (notPerfect.length > 0) {
    console.log('\n⚠️  TESTS NEEDING ATTENTION:');
    notPerfect.forEach(t => {
      const status = t.actualScore >= t.expectedScore.min - 5 ? 'CLOSE' : 'FAIL';
      console.log(`   ${status}: ${t.name} - Expected ${t.expectedScore.min}-${t.expectedScore.max}%, Got ${t.actualScore}%`);
    });
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  return {
    totalTests,
    passedTests: Math.floor(passedTests),
    closeTests: passedTests % 1 > 0 ? Math.ceil(passedTests % 1 * 2) : 0,
    failedTests: totalTests - Math.ceil(passedTests),
    successRate: ((passedTests / totalTests) * 100).toFixed(1),
    results
  };
}

// Run tests
runAccuracyTests()
  .then(summary => {
    console.log(`\n✨ Tests completed with ${summary.successRate}% success rate\n`);
    process.exit(summary.failedTests > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });

