/**
 * Test Fixtures: Portfolios (Section 5.5)
 *
 * Complete portfolio data with all sections populated
 */

export const testPortfolios = {
  fullStackDeveloper: {
    id: 'portfolio-fullstack-1',
    userId: 'user-john-doe',
    templateId: 'template-modern-1',
    title: 'John Doe',
    subtitle: 'Senior Full Stack Developer',
    description: 'Building scalable web applications with modern technologies',
    subdomain: 'johndoe',
    customDomain: null,
    isPublished: true,
    settings: {
      theme: 'dark',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter',
      animation: true,
      showContactForm: true,
    },
    seo: {
      title: 'John Doe - Full Stack Developer Portfolio',
      description: 'Experienced full stack developer specializing in React, Node.js, and cloud infrastructure',
      keywords: ['full stack developer', 'react', 'node.js', 'aws', 'portfolio'],
      ogImage: 'https://example.com/og-john-doe.png',
    },
    sections: [
      {
        type: 'hero',
        order: 0,
        content: {
          title: 'Hi, I\'m John Doe',
          subtitle: 'Senior Full Stack Developer',
          tagline: 'Building the future, one line of code at a time',
          backgroundImage: 'https://example.com/hero-bg.jpg',
          ctaText: 'View My Work',
          ctaLink: '#projects',
        },
      },
      {
        type: 'about',
        order: 1,
        content: {
          title: 'About Me',
          text: `I'm a passionate full stack developer with 8+ years of experience building scalable web applications.
                 I specialize in React, Node.js, and cloud infrastructure. When I'm not coding, you'll find me
                 contributing to open source or mentoring aspiring developers.`,
          image: 'https://example.com/profile.jpg',
          highlights: [
            '8+ years of experience',
            '1M+ users served',
            'Open source contributor',
            'Tech mentor',
          ],
        },
      },
      {
        type: 'skills',
        order: 2,
        content: {
          title: 'Skills & Technologies',
          categories: [
            {
              name: 'Frontend',
              skills: [
                { name: 'React', level: 90 },
                { name: 'TypeScript', level: 85 },
                { name: 'Next.js', level: 80 },
                { name: 'Tailwind CSS', level: 85 },
              ],
            },
            {
              name: 'Backend',
              skills: [
                { name: 'Node.js', level: 90 },
                { name: 'Express', level: 85 },
                { name: 'PostgreSQL', level: 80 },
                { name: 'MongoDB', level: 75 },
              ],
            },
            {
              name: 'DevOps',
              skills: [
                { name: 'AWS', level: 80 },
                { name: 'Docker', level: 85 },
                { name: 'Kubernetes', level: 70 },
                { name: 'CI/CD', level: 80 },
              ],
            },
          ],
        },
      },
      {
        type: 'experience',
        order: 3,
        content: {
          title: 'Work Experience',
          items: [
            {
              company: 'Tech Innovations Inc',
              position: 'Senior Full Stack Developer',
              location: 'San Francisco, CA',
              startDate: '2021-01',
              endDate: null,
              current: true,
              description: `Leading development of microservices architecture serving 1M+ users.
                           Reduced API response time by 40% through optimization.
                           Mentoring team of 5 junior developers.`,
              technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
              achievements: [
                'Led migration to microservices architecture',
                'Improved API performance by 40%',
                'Mentored 5 junior developers',
              ],
            },
            {
              company: 'StartupXYZ',
              position: 'Full Stack Developer',
              location: 'Remote',
              startDate: '2018-06',
              endDate: '2020-12',
              current: false,
              description: 'Built customer-facing web application from scratch',
              technologies: ['Vue.js', 'Express', 'MongoDB'],
              achievements: [
                'Grew user base from 0 to 50K',
                'Implemented CI/CD pipeline',
              ],
            },
          ],
        },
      },
      {
        type: 'projects',
        order: 4,
        content: {
          title: 'Featured Projects',
          items: [
            {
              name: 'TaskMaster Pro',
              description: 'A productivity app with AI-powered task suggestions and collaboration features',
              longDescription: `TaskMaster Pro is a comprehensive productivity platform that helps teams
                               manage tasks efficiently. Features include AI-powered suggestions, real-time
                               collaboration, and advanced analytics.`,
              image: 'https://example.com/taskmaster.png',
              url: 'https://taskmasterpro.com',
              github: 'https://github.com/johndoe/taskmaster',
              technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'OpenAI'],
              features: [
                'AI-powered task suggestions',
                'Real-time collaboration',
                'Advanced analytics dashboard',
                'Mobile apps (iOS/Android)',
              ],
              metrics: {
                users: '10,000+',
                rating: '4.8/5',
                downloads: '50,000+',
              },
            },
            {
              name: 'Weather Dashboard',
              description: 'Real-time weather monitoring with beautiful data visualizations',
              image: 'https://example.com/weather.png',
              url: 'https://weather-dash.dev',
              github: 'https://github.com/johndoe/weather-dash',
              technologies: ['Next.js', 'D3.js', 'Tailwind CSS'],
              features: [
                'Real-time weather data',
                'Interactive charts',
                'Location-based forecasts',
              ],
            },
          ],
        },
      },
      {
        type: 'education',
        order: 5,
        content: {
          title: 'Education & Certifications',
          degrees: [
            {
              institution: 'University of California, Berkeley',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startDate: '2012-09',
              endDate: '2016-05',
              gpa: '3.8',
            },
          ],
          certifications: [
            {
              name: 'AWS Certified Solutions Architect',
              issuer: 'Amazon Web Services',
              date: '2022-03',
              credentialId: 'AWS-12345',
            },
            {
              name: 'Professional Scrum Master I',
              issuer: 'Scrum.org',
              date: '2020-11',
            },
          ],
        },
      },
      {
        type: 'contact',
        order: 6,
        content: {
          title: 'Get In Touch',
          subtitle: 'Have a project in mind? Let\'s talk!',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          socialLinks: {
            linkedin: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe',
            twitter: 'https://twitter.com/johndoe',
          },
          showContactForm: true,
        },
      },
    ],
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    deletedAt: null,
  },

  minimalDesigner: {
    id: 'portfolio-designer-1',
    userId: 'user-jane-dev',
    templateId: 'template-minimal-1',
    title: 'Jane Developer',
    subtitle: 'Frontend Engineer & Designer',
    description: 'Crafting beautiful user experiences',
    subdomain: 'janedev',
    customDomain: 'portfolio.janedev.design',
    isPublished: true,
    settings: {
      theme: 'light',
      primaryColor: '#EC4899',
      secondaryColor: '#8B5CF6',
      fontFamily: 'Poppins',
      animation: true,
      showContactForm: false,
    },
    seo: {
      title: 'Jane Developer - Frontend Engineer & Designer',
      description: 'Creative frontend developer building beautiful, accessible web experiences',
      keywords: ['frontend', 'designer', 'react', 'ux', 'ui'],
      ogImage: 'https://example.com/og-jane.png',
    },
    sections: [
      {
        type: 'hero',
        order: 0,
        content: {
          title: 'Jane Developer',
          subtitle: 'Frontend Engineer & Designer',
          tagline: 'Creating delightful digital experiences',
        },
      },
      {
        type: 'projects',
        order: 1,
        content: {
          title: 'Selected Work',
          items: [
            {
              name: 'Design System',
              description: 'Comprehensive component library',
              image: 'https://example.com/design-system.png',
              url: 'https://designsystem.janedev.design',
              technologies: ['React', 'Storybook', 'TypeScript'],
            },
          ],
        },
      },
      {
        type: 'contact',
        order: 2,
        content: {
          title: 'Let\'s Connect',
          email: 'jane.dev@example.com',
          socialLinks: {
            linkedin: 'https://linkedin.com/in/janedev',
            dribbble: 'https://dribbble.com/janedev',
          },
        },
      },
    ],
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
    deletedAt: null,
  },

  draftPortfolio: {
    id: 'portfolio-draft-1',
    userId: 'user-alex-backend',
    templateId: 'template-modern-1',
    title: 'Alex Backend - Draft',
    subtitle: 'Backend Engineer',
    description: '',
    subdomain: null,
    customDomain: null,
    isPublished: false,
    settings: {
      theme: 'dark',
      primaryColor: '#3B82F6',
      fontFamily: 'Inter',
    },
    seo: null,
    sections: [
      {
        type: 'hero',
        order: 0,
        content: {
          title: 'Alex Backend',
          subtitle: 'Backend Engineer',
        },
      },
    ],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString(),
    deletedAt: null,
  },
};

export const getTestPortfolio = (name: keyof typeof testPortfolios) => testPortfolios[name];
export const getAllTestPortfolios = () => Object.values(testPortfolios);
