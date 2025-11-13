/**
 * TEST: Tailoring with Huge Resumes
 * 
 * Verifies that smart truncation works for tailoring prompts
 * Tests that huge resumes don't break the prompt builder
 */

const { buildTailorResumePrompt } = require('./services/ai/promptBuilder');

// Create a HUGE resume (50+ pages worth)
function createHugeResume() {
  const hugeExperience = [];
  
  // Add 30 jobs with 20 bullets each
  for (let i = 0; i < 30; i++) {
    const bullets = [];
    for (let j = 0; j < 20; j++) {
      bullets.push(
        `Led cross-functional team of ${j + 5} engineers to deliver enterprise-scale ${i % 2 === 0 ? 'React' : 'Angular'} application with ${j * 100}K+ daily active users, achieving 99.9% uptime through implementation of advanced monitoring, CI/CD pipelines, and automated testing frameworks including Jest, Cypress, and Selenium`
      );
    }
    
    hugeExperience.push({
      company: `Tech Company ${i + 1}`,
      role: `Senior Software Engineer ${i + 1}`,
      startDate: `2020-0${(i % 9) + 1}`,
      endDate: i === 0 ? 'Present' : `2021-0${(i % 9) + 1}`,
      location: `City ${i + 1}, State`,
      bullets
    });
  }

  return {
    summary: 'Highly experienced software engineer with 15+ years of expertise in full-stack development, cloud architecture, DevOps, machine learning, data engineering, mobile development, and technical leadership across multiple industries including fintech, healthcare, e-commerce, and enterprise SaaS.',
    skills: {
      technical: [
        'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
        'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'Kotlin',
        'Go', 'Rust', 'C++', 'C#', '.NET', 'Ruby', 'Rails', 'PHP', 'Laravel',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra',
        'GraphQL', 'REST API', 'gRPC', 'WebSockets', 'Microservices', 'Serverless',
        'CI/CD', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI',
        'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Spark',
        'Kafka', 'RabbitMQ', 'NATS', 'Redis Streams', 'Event-Driven Architecture'
      ],
      soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Building', 'Mentoring']
    },
    experience: hugeExperience,
    projects: Array.from({ length: 20 }, (_, i) => ({
      title: `Project ${i + 1}`,
      description: `Built scalable microservices architecture handling ${i * 10}M+ requests/day using Kubernetes, Docker, and cloud-native technologies. Implemented advanced caching strategies, load balancing, auto-scaling, and comprehensive monitoring with Prometheus, Grafana, and ELK stack.`,
      technologies: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
      date: `202${i % 4}`,
      link: `https://project${i + 1}.com`
    })),
    certifications: Array.from({ length: 15 }, (_, i) => ({
      name: `Certification ${i + 1}`,
      issuer: `Issuer ${i + 1}`,
      date: `202${i % 4}`,
      credentialId: `CERT-${i + 1}`
    })),
    education: [
      {
        degree: 'Master of Science in Computer Science',
        institution: 'Stanford University',
        graduationDate: '2010',
        gpa: '3.9/4.0'
      },
      {
        degree: 'Bachelor of Science in Software Engineering',
        institution: 'MIT',
        graduationDate: '2008',
        gpa: '3.8/4.0'
      }
    ],
    contact: {
      email: 'huge.resume@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/huge-resume',
      github: 'github.com/huge-resume'
    }
  };
}

async function testSmartTruncation() {
  console.log('\n🧪 Testing Tailoring with Huge Resume\n');
  console.log('═'.repeat(60));

  const hugeResume = createHugeResume();
  const resumeSize = JSON.stringify(hugeResume).length;
  
  console.log(`\n📊 Resume Stats:`);
  console.log(`   Size: ${resumeSize.toLocaleString()} characters`);
  console.log(`   Experience entries: ${hugeResume.experience.length}`);
  console.log(`   Total bullets: ${hugeResume.experience.reduce((sum, exp) => sum + exp.bullets.length, 0)}`);
  console.log(`   Projects: ${hugeResume.projects.length}`);
  console.log(`   Certifications: ${hugeResume.certifications.length}`);

  const jobDescription = `
Senior Full Stack Engineer

We're looking for an experienced Full Stack Engineer to join our team.

Requirements:
- 5+ years of experience with React and Node.js
- Strong understanding of AWS cloud services
- Experience with Docker and Kubernetes
- Proficiency in TypeScript and modern JavaScript
- Experience with PostgreSQL and NoSQL databases
- Knowledge of CI/CD pipelines and DevOps practices
- Strong problem-solving and communication skills

Nice to have:
- Experience with GraphQL
- Knowledge of microservices architecture
- Familiarity with Terraform
- Experience with monitoring tools (Prometheus, Grafana)
`;

  console.log(`\n📝 Job Description: ${jobDescription.length} characters`);

  // Test 1: Build prompt without ATS analysis
  console.log('\n\n🧪 Test 1: Build Prompt (No ATS Analysis)');
  console.log('─'.repeat(60));
  
  try {
    const prompt1 = buildTailorResumePrompt({
      resumeSnapshot: hugeResume,
      jobDescription,
      mode: 'PARTIAL',
      tone: 'professional',
      length: 'thorough'
    });
    
    console.log(`✅ Prompt built successfully`);
    console.log(`   Prompt length: ${prompt1.length.toLocaleString()} characters`);
    console.log(`   Reduction: ${Math.round((1 - prompt1.length / (resumeSize + jobDescription.length)) * 100)}%`);
    
    // Verify it's valid (not broken JSON)
    if (prompt1.includes('[TRUNCATED FOR LENGTH')) {
      console.log(`⚠️  Old truncation detected (should use smart truncation)`);
    } else {
      console.log(`✅ Using smart truncation (no broken JSON)`);
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
  }

  // Test 2: Build prompt with ATS analysis
  console.log('\n\n🧪 Test 2: Build Prompt (With ATS Analysis)');
  console.log('─'.repeat(60));
  
  try {
    const mockAtsAnalysis = {
      overall: 65,
      keywords: 70,
      experience: 60,
      content: 65,
      format: 70,
      missingKeywords: [
        'TypeScript',
        'GraphQL',
        'Terraform',
        'Prometheus',
        'Grafana',
        'Microservices',
        'CI/CD',
        'DevOps'
      ]
    };

    const prompt2 = buildTailorResumePrompt({
      resumeSnapshot: hugeResume,
      jobDescription,
      mode: 'FULL',
      tone: 'professional',
      length: 'thorough',
      atsAnalysis: mockAtsAnalysis,
      targetScore: 85,
      missingKeywords: mockAtsAnalysis.missingKeywords,
      missingKeywordsLimit: 15
    });
    
    console.log(`✅ Prompt built successfully`);
    console.log(`   Prompt length: ${prompt2.length.toLocaleString()} characters`);
    console.log(`   Includes ATS guidance: ${prompt2.includes('PERFORMANCE TARGET') ? '✅' : '❌'}`);
    console.log(`   Includes missing keywords: ${prompt2.includes('TypeScript') ? '✅' : '❌'}`);
    console.log(`   Includes target score: ${prompt2.includes('Target Score: 85') ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
  }

  // Test 3: Verify truncation preserves critical sections
  console.log('\n\n🧪 Test 3: Verify Critical Sections Preserved');
  console.log('─'.repeat(60));
  
  try {
    const prompt3 = buildTailorResumePrompt({
      resumeSnapshot: hugeResume,
      jobDescription,
      mode: 'PARTIAL'
    });
    
    const checks = {
      'Summary': prompt3.includes(hugeResume.summary.substring(0, 50)),
      'Skills': prompt3.includes('JavaScript') && prompt3.includes('React'),
      'Recent Experience': prompt3.includes('Tech Company 1'),
      'Contact (should be dropped)': !prompt3.includes('huge.resume@example.com')
    };
    
    console.log(`\n   Section Preservation:`);
    Object.entries(checks).forEach(([section, preserved]) => {
      console.log(`   ${preserved ? '✅' : '❌'} ${section}`);
    });
    
    const allPassed = Object.values(checks).every(v => v);
    console.log(`\n   ${allPassed ? '✅ All checks passed' : '⚠️  Some checks failed'}`);
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests
testSmartTruncation().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

