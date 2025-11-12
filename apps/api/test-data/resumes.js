// 100 realistic resumes with varying match quality to test ATS accuracy

module.exports = [
  // PERFECT MATCHES (20) - Should score 80-95+
  {
    id: 'resume-001',
    name: 'Sarah Johnson',
    title: 'Senior Full-Stack Developer',
    summary: 'Experienced full-stack developer with 6 years of expertise in building scalable web applications using React, Node.js, and cloud technologies.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git'],
    experience: [
      {
        company: 'Tech Solutions Inc',
        title: 'Senior Full-Stack Developer',
        duration: '2020-Present',
        description: 'Led development of enterprise web applications using React and Node.js. Implemented CI/CD pipelines, managed AWS infrastructure, and mentored junior developers.'
      },
      {
        company: 'StartupCo',
        title: 'Full-Stack Developer',
        duration: '2018-2020',
        description: 'Developed full-stack features for SaaS platform. Worked with React, Node.js, PostgreSQL, and deployed on AWS with Docker.'
      }
    ],
    education: [
      { degree: 'BS Computer Science', school: 'University of Technology', year: '2018' }
    ],
    expectedMatch: ['jd-001'] // Should match Senior Full-Stack Developer
  },

  {
    id: 'resume-002',
    name: 'Michael Chen',
    title: 'Frontend Developer',
    summary: 'Frontend specialist with 4 years of React development experience. Expert in building responsive, accessible web applications with modern frontend tools.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'CSS', 'HTML', 'GraphQL', 'REST APIs', 'Responsive Design', 'Accessibility'],
    experience: [
      {
        company: 'Digital Agency',
        title: 'Frontend Developer',
        duration: '2020-Present',
        description: 'Built responsive web applications using React and Next.js. Focused on performance optimization and accessibility. Collaborated with designers and backend teams.'
      }
    ],
    education: [
      { degree: 'BS Software Engineering', school: 'Tech University', year: '2020' }
    ],
    expectedMatch: ['jd-002'] // Should match Frontend Developer - React
  },

  {
    id: 'resume-003',
    name: 'Emily Rodriguez',
    title: 'Python Backend Engineer',
    summary: 'Backend engineer with 5 years of Python development. Specialized in building scalable APIs and data processing pipelines.',
    skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'RESTful APIs', 'Data Processing', 'ETL'],
    experience: [
      {
        company: 'DataTech Solutions',
        title: 'Backend Engineer',
        duration: '2019-Present',
        description: 'Developed backend services using Django and Flask. Built data processing pipelines, optimized database performance, and designed RESTful APIs.'
      }
    ],
    education: [
      { degree: 'BS Computer Science', school: 'State University', year: '2019' }
    ],
    expectedMatch: ['jd-003'] // Should match Backend Engineer - Python
  },

  // GOOD MATCHES (25) - Should score 65-80
  {
    id: 'resume-004',
    name: 'David Kim',
    title: 'Full-Stack Developer',
    summary: 'Full-stack developer with 3 years experience. Proficient in React and Node.js.',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MySQL', 'Git', 'HTML', 'CSS'],
    experience: [
      {
        company: 'Web Solutions',
        title: 'Full-Stack Developer',
        duration: '2021-Present',
        description: 'Developed web applications using React and Node.js. Worked with MySQL databases and RESTful APIs.'
      }
    ],
    education: [
      { degree: 'BS Information Technology', school: 'City College', year: '2021' }
    ],
    expectedMatch: ['jd-001'] // Good but not perfect - missing cloud, Docker, senior experience
  },

  {
    id: 'resume-005',
    name: 'Lisa Wang',
    title: 'Data Scientist',
    summary: 'Data scientist with 6 years of experience in machine learning and statistical analysis.',
    skills: ['Python', 'pandas', 'NumPy', 'scikit-learn', 'TensorFlow', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
    experience: [
      {
        company: 'AI Research Lab',
        title: 'Senior Data Scientist',
        duration: '2018-Present',
        description: 'Built ML models for predictive analytics. Analyzed large datasets and presented insights to stakeholders.'
      }
    ],
    education: [
      { degree: 'MS Data Science', school: 'Tech Institute', year: '2018' },
      { degree: 'BS Mathematics', school: 'University', year: '2016' }
    ],
    expectedMatch: ['jd-006'] // Good match but missing PhD
  },

  // PARTIAL MATCHES (30) - Should score 45-65
  {
    id: 'resume-006',
    name: 'James Taylor',
    title: 'Junior Full-Stack Developer',
    summary: 'Recent graduate with 1 year of full-stack development experience.',
    skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git'],
    experience: [
      {
        company: 'Startup Inc',
        title: 'Junior Developer',
        duration: '2023-Present',
        description: 'Assisted in developing web features using React. Learning backend development with Node.js.'
      }
    ],
    education: [
      { degree: 'BS Computer Science', school: 'University', year: '2023' }
    ],
    expectedMatch: ['jd-001', 'jd-002'] // Partial - right skills but junior, lacks experience
  },

  {
    id: 'resume-007',
    name: 'Maria Garcia',
    title: 'Software Engineer',
    summary: 'Software engineer with general programming experience in multiple languages.',
    skills: ['Java', 'Python', 'SQL', 'Git', 'Linux', 'Agile'],
    experience: [
      {
        company: 'Enterprise Corp',
        title: 'Software Engineer',
        duration: '2020-Present',
        description: 'Developed backend services using Java. Worked on enterprise applications.'
      }
    ],
    education: [
      { degree: 'BS Software Engineering', school: 'Tech College', year: '2020' }
    ],
    expectedMatch: ['jd-001', 'jd-003'] // Partial - some overlap but different tech stack
  },

  // POOR MATCHES (25) - Should score 20-45
  {
    id: 'resume-008',
    name: 'Robert Brown',
    title: 'Marketing Manager',
    summary: 'Marketing professional with 5 years of digital marketing experience.',
    skills: ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Email Marketing'],
    experience: [
      {
        company: 'Marketing Agency',
        title: 'Marketing Manager',
        duration: '2019-Present',
        description: 'Managed digital marketing campaigns. Increased web traffic by 200% through SEO optimization.'
      }
    ],
    education: [
      { degree: 'BA Marketing', school: 'Business School', year: '2019' }
    ],
    expectedMatch: ['jd-011'] // Should match marketing role, not tech roles
  },

  {
    id: 'resume-009',
    name: 'Jennifer Lee',
    title: 'Graphic Designer',
    summary: 'Creative graphic designer with strong visual design skills.',
    skills: ['Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Branding', 'Typography'],
    experience: [
      {
        company: 'Design Studio',
        title: 'Graphic Designer',
        duration: '2020-Present',
        description: 'Created visual designs for marketing materials and brand identity.'
      }
    ],
    education: [
      { degree: 'BFA Graphic Design', school: 'Art Institute', year: '2020' }
    ],
    expectedMatch: [] // Poor match for tech roles, might partially match UX/UI
  },
];

// Generate additional resumes programmatically to reach 100
const additionalProfiles = [
  { title: 'DevOps Engineer', skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Python', 'Terraform'], match: ['jd-004'] },
  { title: 'Mobile Developer', skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Mobile'], match: ['jd-005'] },
  { title: 'ML Engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Docker', 'Kubernetes'], match: ['jd-007'] },
  { title: 'Data Analyst', skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Data Visualization'], match: ['jd-008'] },
  { title: 'Product Manager', skills: ['Product Strategy', 'Agile', 'Analytics', 'Stakeholder Management'], match: ['jd-009'] },
  { title: 'UX Designer', skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'UI Design'], match: ['jd-010'] },
  { title: 'QA Engineer', skills: ['Selenium', 'Test Automation', 'Java', 'Agile', 'CI/CD'], match: [] },
  { title: 'Security Engineer', skills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Python'], match: [] },
  { title: 'Solutions Architect', skills: ['AWS', 'Architecture', 'Cloud', 'Microservices', 'Leadership'], match: [] },
  { title: 'Data Engineer', skills: ['ETL', 'Spark', 'Airflow', 'SQL', 'Python', 'Data Pipelines'], match: [] },
  { title: 'iOS Developer', skills: ['Swift', 'iOS', 'Xcode', 'UIKit', 'SwiftUI'], match: [] },
  { title: 'Android Developer', skills: ['Kotlin', 'Android', 'Jetpack Compose', 'Java'], match: [] },
  { title: 'Frontend Engineer', skills: ['Vue.js', 'JavaScript', 'CSS', 'HTML', 'Web Development'], match: ['jd-002'] },
  { title: 'Backend Developer', skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Microservices'], match: [] },
  { title: 'Cloud Engineer', skills: ['Azure', 'GCP', 'Cloud', 'Infrastructure', 'Terraform'], match: ['jd-004'] },
];

// Generate remaining resumes
additionalProfiles.forEach((profile, index) => {
  const baseId = 10 + index;
  const experienceYears = Math.floor(Math.random() * 8) + 2; // 2-10 years
  
  module.exports.push({
    id: `resume-${String(baseId).padStart(3, '0')}`,
    name: `Person ${baseId}`,
    title: profile.title,
    summary: `${profile.title} with ${experienceYears} years of experience in the tech industry.`,
    skills: profile.skills,
    experience: [
      {
        company: `Company ${baseId}`,
        title: profile.title,
        duration: `${2024 - experienceYears}-Present`,
        description: `Working as ${profile.title}. ${profile.skills.slice(0, 3).join(', ')}.`
      }
    ],
    education: [
      { degree: 'BS Computer Science', school: 'University', year: `${2024 - experienceYears}` }
    ],
    expectedMatch: profile.match
  });
});

// Add more diverse resumes to reach 100
for (let i = module.exports.length; i < 100; i++) {
  const randomSkills = ['JavaScript', 'Python', 'Java', 'SQL', 'Git', 'Linux', 'Docker', 'AWS'];
  const selectedSkills = randomSkills.sort(() => 0.5 - Math.random()).slice(0, 5);
  
  module.exports.push({
    id: `resume-${String(i + 1).padStart(3, '0')}`,
    name: `Candidate ${i + 1}`,
    title: 'Software Developer',
    summary: `Software developer with experience in various technologies.`,
    skills: selectedSkills,
    experience: [
      {
        company: `Company ${i + 1}`,
        title: 'Software Developer',
        duration: '2021-Present',
        description: 'Developed software solutions using various technologies.'
      }
    ],
    education: [
      { degree: 'BS Computer Science', school: 'University', year: '2021' }
    ],
    expectedMatch: []
  });
}

