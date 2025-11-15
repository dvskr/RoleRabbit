/**
 * Test Fixtures: Users (Section 5.5)
 *
 * Complete user profile data for integration/E2E tests
 */

export const testUsers = {
  johnDoe: {
    id: 'user-john-doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Full Stack Developer',
    summary: `Experienced software engineer with 8+ years of building scalable web applications.
              Specialized in React, Node.js, and cloud infrastructure. Passionate about clean code
              and mentoring junior developers.`,
    website: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    skills: [
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Express',
      'PostgreSQL',
      'MongoDB',
      'AWS',
      'Docker',
      'Kubernetes',
      'Git',
    ],
    experience: [
      {
        company: 'Tech Innovations Inc',
        position: 'Senior Full Stack Developer',
        startDate: '2021-01',
        endDate: null,
        current: true,
        description: `Leading development of microservices architecture serving 1M+ users.
                     Mentor team of 5 junior developers. Reduced API response time by 40%.`,
        location: 'San Francisco, CA',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      },
      {
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        startDate: '2018-06',
        endDate: '2020-12',
        current: false,
        description: `Built customer-facing web application from scratch. Implemented CI/CD pipeline.
                     Grew user base from 0 to 50K in first year.`,
        location: 'Remote',
        technologies: ['Vue.js', 'Express', 'MongoDB', 'Docker'],
      },
      {
        company: 'Enterprise Solutions Ltd',
        position: 'Junior Developer',
        startDate: '2016-01',
        endDate: '2018-05',
        current: false,
        description: `Developed internal tools and maintained legacy systems.
                     Participated in Agile sprints and code reviews.`,
        location: 'New York, NY',
        technologies: ['jQuery', 'PHP', 'MySQL'],
      },
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        field: 'Computer Science',
        startDate: '2012-09',
        endDate: '2016-05',
        gpa: '3.8',
        description: 'Focus on algorithms, data structures, and distributed systems',
      },
    ],
    projects: [
      {
        name: 'TaskMaster Pro',
        description: 'A productivity app for managing tasks and projects with AI-powered suggestions',
        url: 'https://taskmasterpro.com',
        github: 'https://github.com/johndoe/taskmaster',
        image: 'https://example.com/taskmaster.png',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'OpenAI'],
        featured: true,
      },
      {
        name: 'Weather Dashboard',
        description: 'Real-time weather monitoring with beautiful visualizations',
        url: 'https://weather-dash.dev',
        github: 'https://github.com/johndoe/weather-dash',
        image: 'https://example.com/weather.png',
        technologies: ['Next.js', 'D3.js', 'Tailwind CSS'],
        featured: true,
      },
      {
        name: 'Open Source Contribution',
        description: 'Contributor to React Testing Library and Jest',
        github: 'https://github.com/testing-library/react-testing-library',
        technologies: ['JavaScript', 'Testing', 'Open Source'],
        featured: false,
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2022-03',
        url: 'https://aws.amazon.com/certification/',
      },
      {
        name: 'Professional Scrum Master I',
        issuer: 'Scrum.org',
        date: '2020-11',
        url: 'https://scrum.org/',
      },
    ],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },

  janeDeveloper: {
    id: 'user-jane-dev',
    email: 'jane.dev@example.com',
    firstName: 'Jane',
    lastName: 'Developer',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    title: 'Frontend Engineer & UI/UX Designer',
    summary: `Creative frontend developer with a passion for pixel-perfect designs and smooth animations.
              5 years of experience building beautiful, accessible web applications.`,
    website: 'https://janedev.design',
    linkedin: 'https://linkedin.com/in/janedev',
    github: 'https://github.com/janedev',
    dribbble: 'https://dribbble.com/janedev',
    skills: [
      'HTML/CSS',
      'JavaScript',
      'React',
      'Vue.js',
      'Tailwind CSS',
      'Figma',
      'Adobe XD',
      'Animation',
      'Accessibility',
      'Responsive Design',
    ],
    experience: [
      {
        company: 'Design Studio Co',
        position: 'Senior Frontend Engineer',
        startDate: '2022-03',
        endDate: null,
        current: true,
        description: 'Leading frontend development and design system creation',
        location: 'Austin, TX',
        technologies: ['React', 'Tailwind CSS', 'Figma'],
      },
      {
        company: 'Creative Agency',
        position: 'Frontend Developer',
        startDate: '2019-06',
        endDate: '2022-02',
        current: false,
        description: 'Built award-winning websites for Fortune 500 clients',
        location: 'Remote',
        technologies: ['Vue.js', 'GSAP', 'SCSS'],
      },
    ],
    education: [
      {
        institution: 'Rhode Island School of Design',
        degree: 'Bachelor of Fine Arts',
        field: 'Digital Media',
        startDate: '2015-09',
        endDate: '2019-05',
      },
    ],
    projects: [
      {
        name: 'Design System Library',
        description: 'Comprehensive component library for rapid prototyping',
        url: 'https://designsystem.janedev.design',
        technologies: ['React', 'Storybook', 'TypeScript'],
        featured: true,
      },
    ],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString(),
  },

  alexBackend: {
    id: 'user-alex-backend',
    email: 'alex.backend@example.com',
    firstName: 'Alex',
    lastName: 'Backend',
    location: 'Seattle, WA',
    title: 'Backend Engineer & DevOps Specialist',
    summary: 'Infrastructure and backend systems expert. Building scalable APIs and cloud architectures.',
    github: 'https://github.com/alexbackend',
    linkedin: 'https://linkedin.com/in/alexbackend',
    skills: [
      'Python',
      'Go',
      'Rust',
      'PostgreSQL',
      'Redis',
      'Kubernetes',
      'AWS',
      'Terraform',
      'CI/CD',
    ],
    experience: [
      {
        company: 'Cloud Infrastructure Corp',
        position: 'Senior Backend Engineer',
        startDate: '2020-01',
        endDate: null,
        current: true,
        description: 'Managing infrastructure for services handling 10M+ requests/day',
        technologies: ['Go', 'Kubernetes', 'PostgreSQL'],
      },
    ],
    education: [
      {
        institution: 'MIT',
        degree: 'Master of Science',
        field: 'Computer Science',
        startDate: '2017-09',
        endDate: '2019-05',
      },
    ],
    projects: [
      {
        name: 'Distributed Cache System',
        description: 'High-performance caching layer built with Rust',
        github: 'https://github.com/alexbackend/cache',
        technologies: ['Rust', 'Redis Protocol'],
        featured: true,
      },
    ],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
  },
};

export const getTestUser = (name: keyof typeof testUsers) => testUsers[name];
export const getAllTestUsers = () => Object.values(testUsers);
