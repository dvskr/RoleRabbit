/**
 * COMPREHENSIVE ATS TESTING SUITE
 * 
 * Tests the world-class ATS system with various job descriptions across:
 * - Different roles (Data Engineer, Frontend, Backend, Full Stack, AI/ML)
 * - Different seniority levels (Junior, Mid, Senior)
 * - Different skill types (common, emerging, niche)
 * - Edge cases (new technologies, acronyms, variations)
 */

const { scoreResumeWorldClass } = require('./services/ats/worldClassATS');
const { atsCache } = require('./services/ats/atsCache');

// Mock resume data for testing
const mockResumes = {
  dataEngineer: {
    personalInfo: {
      name: 'John Smith',
      email: 'john@example.com'
    },
    summary: 'Senior Data Engineer with 6 years of experience building scalable data pipelines and infrastructure. Expert in Python, Spark, and cloud platforms.',
    skills: {
      technical: [
        'Python', 'PySpark', 'SQL', 'PostgreSQL', 'AWS', 'AWS Glue', 
        'Amazon S3', 'Lambda', 'Airflow', 'Databricks', 'Kafka',
        'Docker', 'Terraform', 'Git'
      ],
      soft: ['Leadership', 'Communication', 'Problem Solving']
    },
    experience: [
      {
        title: 'Senior Data Engineer',
        company: 'Tech Corp',
        startDate: '2020-01',
        endDate: '2024-12',
        description: 'Led team of 5 engineers building data pipelines',
        bullets: [
          'Built Python data pipelines processing 10TB daily using PySpark',
          'Designed ETL workflows with Apache Airflow reducing processing time by 50%',
          'Implemented real-time streaming with Kafka handling 1M+ events/second',
          'Architected data lake on AWS S3 with Glue for automated cataloging',
          'Led migration to Databricks improving query performance by 3x'
        ]
      },
      {
        title: 'Data Engineer',
        company: 'Data Inc',
        startDate: '2018-01',
        endDate: '2020-01',
        description: 'Built and maintained data infrastructure',
        bullets: [
          'Developed ETL pipelines using Python and SQL',
          'Optimized database queries reducing runtime by 60%',
          'Implemented CI/CD with Docker and Terraform'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'State University',
        graduationDate: '2017-05'
      }
    ]
  },
  
  frontendDeveloper: {
    personalInfo: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com'
    },
    summary: 'Frontend Developer with 4 years building modern web applications using React, TypeScript, and Next.js.',
    skills: {
      technical: [
        'React', 'JavaScript', 'TypeScript', 'Next.js', 'Redux',
        'HTML5', 'CSS3', 'Tailwind CSS', 'Node.js', 'REST APIs',
        'Jest', 'Cypress', 'Git', 'Webpack', 'Figma'
      ],
      soft: ['Teamwork', 'Creativity', 'Attention to Detail']
    },
    experience: [
      {
        title: 'Frontend Developer',
        company: 'Web Solutions',
        startDate: '2020-03',
        endDate: '2024-12',
        description: 'Built responsive web applications',
        bullets: [
          'Developed React applications serving 500K+ monthly users',
          'Implemented server-side rendering with Next.js improving SEO',
          'Built reusable component library using TypeScript and Storybook',
          'Optimized bundle size by 40% using code splitting and lazy loading',
          'Integrated REST APIs with Redux for state management'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Arts',
        field: 'Design',
        institution: 'Art College',
        graduationDate: '2019-05'
      }
    ]
  },
  
  aiEngineer: {
    personalInfo: {
      name: 'Alex Chen',
      email: 'alex@example.com'
    },
    summary: 'AI/ML Engineer specializing in large language models, retrieval systems, and production ML infrastructure.',
    skills: {
      technical: [
        'Python', 'PyTorch', 'TensorFlow', 'Transformers', 'LangChain',
        'OpenAI API', 'Pinecone', 'ChromaDB', 'FastAPI', 'Docker',
        'Kubernetes', 'AWS', 'PostgreSQL', 'Redis'
      ],
      soft: ['Research', 'Innovation', 'Communication']
    },
    experience: [
      {
        title: 'AI Engineer',
        company: 'AI Startup',
        startDate: '2022-01',
        endDate: '2024-12',
        description: 'Built production AI systems',
        bullets: [
          'Built retrieval augmented generation (RAG) system for document search using LangChain and Pinecone',
          'Implemented semantic search with embedding models achieving 95% accuracy',
          'Developed chatbot using OpenAI GPT-4 handling 10K+ conversations daily',
          'Optimized LLM inference reducing latency from 5s to 500ms',
          'Deployed ML models with FastAPI and Docker on Kubernetes'
        ]
      }
    ],
    education: [
      {
        degree: 'Master of Science',
        field: 'Artificial Intelligence',
        institution: 'Tech University',
        graduationDate: '2021-05'
      }
    ]
  }
};

// Test job descriptions
const testJobs = [
  {
    name: 'Data Engineer - Senior',
    description: `
Data Engineer Job Description

Overview: We are seeking a highly skilled and motivated Data Engineer to join our innovative team. As a Data Engineer, you will be responsible for designing, building, and maintaining scalable data pipelines and infrastructure to support our data-driven initiatives.

Responsibilities:
• Design and implement end-to-end data pipelines for ingesting, processing, and transforming large volumes of data
• Develop robust ETL processes using Python and PySpark
• Implement data validation and quality checks
• Build real-time streaming solutions with Kafka
• Optimize data storage and retrieval using SQL databases
• Work with cloud platforms (AWS, Azure, or GCP)

Requirements:
• Bachelor's degree in Computer Science, Engineering, or related field
• 5+ years of experience in data engineering
• Strong proficiency in Python and Spark
• Experience with ETL tools (SSIS, Databricks, Azure Data Factory, or AWS Glue)
• Knowledge of SQL databases (PostgreSQL, MySQL)
• Experience with big data technologies (Hadoop, Kafka, Airflow)
• Familiarity with cloud platforms (AWS preferred)
• Excellent problem-solving skills
    `,
    expectedResume: 'dataEngineer',
    expectedScore: { min: 85, max: 100 },
    criticalSkills: ['Python', 'Spark', 'SQL', 'ETL', 'Kafka', 'AWS']
  },
  
  {
    name: 'Frontend Developer - React',
    description: `
Frontend Developer - React & TypeScript

About the Role:
We're looking for a talented Frontend Developer to join our product team. You'll build beautiful, responsive web applications that our users love.

Key Responsibilities:
• Build modern web applications using React and TypeScript
• Implement responsive designs with CSS/Tailwind
• Integrate with REST APIs and manage state with Redux
• Write tests using Jest and Cypress
• Optimize performance and bundle size
• Collaborate with designers using Figma

Requirements:
• 3+ years of frontend development experience
• Expert-level knowledge of React and JavaScript
• Strong proficiency in TypeScript
• Experience with Next.js or similar frameworks
• Deep understanding of HTML5 and CSS3
• Experience with state management (Redux, MobX, or Context API)
• Knowledge of build tools (Webpack, Vite)
• Passion for clean code and user experience

Nice to Have:
• Experience with Node.js
• Knowledge of GraphQL
• Contributions to open source
    `,
    expectedResume: 'frontendDeveloper',
    expectedScore: { min: 80, max: 95 },
    criticalSkills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS']
  },
  
  {
    name: 'AI Engineer - LLM & RAG',
    description: `
AI/ML Engineer - Large Language Models

We're seeking an exceptional AI Engineer to build cutting-edge LLM applications.

What You'll Do:
• Build production RAG (Retrieval Augmented Generation) systems
• Implement semantic search using vector databases (Pinecone, Weaviate, or ChromaDB)
• Develop LLM applications with LangChain or similar frameworks
• Fine-tune and optimize language models
• Deploy ML models at scale using Kubernetes
• Work with OpenAI, Anthropic, or open-source LLMs

Required Skills:
• 3+ years of ML/AI experience
• Strong Python programming skills
• Experience with PyTorch or TensorFlow
• Hands-on experience with LLMs and prompt engineering
• Knowledge of vector databases and embeddings
• Experience with RAG architectures
• Proficiency in building REST APIs (FastAPI preferred)
• Docker and Kubernetes experience

Preferred:
• Experience with LangChain, LlamaIndex, or similar
• Knowledge of transformer architectures
• Experience with distributed training
• Contributions to ML research
    `,
    expectedResume: 'aiEngineer',
    expectedScore: { min: 90, max: 100 },
    criticalSkills: ['Python', 'RAG', 'LangChain', 'LLM', 'Vector Database', 'PyTorch']
  },
  
  {
    name: 'Full Stack Developer - Modern Stack',
    description: `
Full Stack Developer

Join our team to build modern web applications from front to back!

Tech Stack:
• Frontend: React, Next.js, TypeScript, Tailwind CSS
• Backend: Node.js, Express, GraphQL
• Database: PostgreSQL, Redis
• Infrastructure: Docker, AWS, Terraform
• Testing: Jest, Cypress, Playwright

Responsibilities:
• Build full-stack features end-to-end
• Design and implement RESTful and GraphQL APIs
• Create responsive, accessible user interfaces
• Write clean, maintainable, tested code
• Deploy and monitor production applications
• Collaborate with product and design teams

Requirements:
• 4+ years of full-stack development experience
• Strong JavaScript/TypeScript skills
• React and Node.js proficiency
• SQL database experience (PostgreSQL preferred)
• REST API design and implementation
• Git version control
• Experience with cloud platforms (AWS, GCP, or Azure)

Bonus:
• Next.js or other SSR frameworks
• GraphQL experience
• DevOps/CI-CD knowledge
• Open source contributions
    `,
    expectedResume: 'frontendDeveloper', // Closest match
    expectedScore: { min: 65, max: 80 }, // Lower since no backend experience
    criticalSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API']
  },
  
  {
    name: 'DevOps Engineer - Cloud Infrastructure',
    description: `
DevOps Engineer - AWS & Kubernetes

Build and maintain world-class cloud infrastructure!

Core Responsibilities:
• Design and maintain AWS infrastructure using Terraform
• Manage Kubernetes clusters for containerized applications
• Implement CI/CD pipelines with GitHub Actions
• Monitor systems with Prometheus and Grafana
• Automate everything with Python and Bash scripts
• Ensure security and compliance

Required:
• 5+ years of DevOps/SRE experience
• Expert-level AWS knowledge (EC2, S3, Lambda, RDS, ECS/EKS)
• Strong Kubernetes and Docker skills
• Infrastructure as Code (Terraform or CloudFormation)
• CI/CD tools (Jenkins, GitHub Actions, GitLab CI)
• Scripting (Python, Bash, or Go)
• Monitoring and logging (Prometheus, Grafana, ELK)

Preferred:
• AWS certifications
• Service mesh experience (Istio, Linkerd)
• GitOps tools (ArgoCD, Flux)
• Security best practices
    `,
    expectedResume: 'dataEngineer', // Has some DevOps skills
    expectedScore: { min: 40, max: 60 }, // Lower - different specialization
    criticalSkills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD']
  }
];

// Test runner
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 WORLD-CLASS ATS - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(80) + '\n');
  
  const results = [];
  
  for (let i = 0; i < testJobs.length; i++) {
    const job = testJobs[i];
    const resume = mockResumes[job.expectedResume];
    
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📋 TEST ${i + 1}/${testJobs.length}: ${job.name}`);
    console.log(`${'─'.repeat(80)}\n`);
    
    console.log(`Resume: ${resume.personalInfo.name} (${job.expectedResume})`);
    console.log(`Expected Score: ${job.expectedScore.min}-${job.expectedScore.max}`);
    console.log(`Critical Skills: ${job.criticalSkills.join(', ')}\n`);
    
    try {
      const startTime = Date.now();
      
      // Run ATS analysis
      const analysis = await scoreResumeWorldClass({
        resumeData: resume,
        jobDescription: job.description,
        useAI: true
      });
      
      const duration = Date.now() - startTime;
      
      // Extract results
      const score = analysis.overall;
      const matchedSkills = analysis.matchedKeywords || [];
      const missingSkills = analysis.missingKeywords || [];
      const method = analysis.meta?.analysis_method || 'unknown';
      const cost = analysis.meta?.cost || '$0.00';
      const fromCache = analysis.meta?.from_cache || false;
      
      // Check critical skills
      const criticalMatched = job.criticalSkills.filter(skill => 
        matchedSkills.some(m => m.toLowerCase().includes(skill.toLowerCase()))
      );
      const criticalMissed = job.criticalSkills.filter(skill => 
        !criticalMatched.includes(skill)
      );
      
      // Determine if test passed
      const scoreInRange = score >= job.expectedScore.min && score <= job.expectedScore.max;
      const criticalCoverage = criticalMatched.length / job.criticalSkills.length;
      const passed = scoreInRange && criticalCoverage >= 0.7;
      
      // Display results
      console.log(`✅ SCORE: ${score}/100 ${scoreInRange ? '✅' : '⚠️  (out of range)'}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`💰 Cost: ${cost} ${fromCache ? '(cached)' : ''}`);
      console.log(`🔧 Method: ${method}\n`);
      
      console.log(`📊 SKILL MATCHING:`);
      console.log(`   Critical Matched: ${criticalMatched.length}/${job.criticalSkills.length} (${Math.round(criticalCoverage * 100)}%)`);
      console.log(`   ✅ ${criticalMatched.join(', ') || 'None'}`);
      if (criticalMissed.length > 0) {
        console.log(`   ❌ Missed: ${criticalMissed.join(', ')}`);
      }
      console.log(`   Total Matched: ${matchedSkills.length}`);
      console.log(`   Total Missing: ${missingSkills.length}\n`);
      
      if (analysis.strengths?.length > 0) {
        console.log(`💪 STRENGTHS:`);
        analysis.strengths.forEach(s => console.log(`   ${s}`));
        console.log('');
      }
      
      if (analysis.improvements?.length > 0) {
        console.log(`📈 IMPROVEMENTS:`);
        analysis.improvements.slice(0, 3).forEach(i => console.log(`   ${i}`));
        console.log('');
      }
      
      if (analysis.actionable_tips?.length > 0) {
        console.log(`💡 ACTIONABLE TIPS:`);
        analysis.actionable_tips.slice(0, 2).forEach(tip => {
          console.log(`   [${tip.priority?.toUpperCase() || 'MED'}] ${tip.action}`);
          console.log(`   Impact: ${tip.impact || 'N/A'}\n`);
        });
      }
      
      console.log(`${passed ? '✅ TEST PASSED' : '⚠️  TEST FAILED'}\n`);
      
      results.push({
        test: job.name,
        passed,
        score,
        expectedRange: job.expectedScore,
        duration,
        criticalCoverage,
        method,
        cost
      });
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      console.log(`Stack: ${error.stack}\n`);
      
      results.push({
        test: job.name,
        passed: false,
        error: error.message
      });
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const passRate = Math.round((passed / results.length) * 100);
  
  results.forEach((result, idx) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${idx + 1}: ${result.test}`);
    if (!result.error) {
      console.log(`   Score: ${result.score} (expected ${result.expectedRange.min}-${result.expectedRange.max})`);
      console.log(`   Critical Coverage: ${Math.round(result.criticalCoverage * 100)}%`);
      console.log(`   Duration: ${result.duration}ms | Cost: ${result.cost}\n`);
    } else {
      console.log(`   Error: ${result.error}\n`);
    }
  });
  
  console.log(`${'─'.repeat(80)}`);
  console.log(`TOTAL: ${passed}/${results.length} passed (${passRate}%)`);
  console.log(`${'─'.repeat(80)}\n`);
  
  // Cache stats
  const cacheStats = atsCache.getStats();
  console.log('💾 CACHE STATISTICS:');
  console.log(`   Hit Rate: ${cacheStats.hit_rate}`);
  console.log(`   Total Requests: ${cacheStats.total_requests}`);
  console.log(`   Cache Size: ${cacheStats.cache_size}/${cacheStats.max_size}`);
  console.log(`   Cost Saved: ${cacheStats.estimated_cost_saved}\n`);
  
  if (passRate === 100) {
    console.log('🎉 ALL TESTS PASSED! ATS IS 100% ACCURATE! 🏆\n');
  } else if (passRate >= 80) {
    console.log('✅ Good! Most tests passed. Minor adjustments needed.\n');
  } else {
    console.log(`⚠️  Needs improvement. Review failed tests (${failed}).\n`);
  }
  
  return results;
}

// Run tests if called directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('✅ Test suite completed\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests, testJobs, mockResumes };

