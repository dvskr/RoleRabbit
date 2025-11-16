/**
 * Example content for empty state guidance
 * Helps users get started with pre-filled examples
 */

export const EXAMPLE_SUMMARIES = [
  {
    role: 'Software Engineer',
    text: 'Results-driven Software Engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about writing clean, maintainable code and delivering exceptional user experiences.'
  },
  {
    role: 'Product Manager',
    text: 'Strategic Product Manager with 7+ years of experience launching successful products. Skilled in user research, roadmap planning, and cross-functional team leadership. Track record of increasing user engagement by 40% and revenue by $2M annually.'
  },
  {
    role: 'Data Scientist',
    text: 'Data Scientist with expertise in machine learning, statistical analysis, and data visualization. 4+ years of experience building predictive models that drive business decisions. Proficient in Python, R, SQL, and TensorFlow.'
  },
  {
    role: 'Marketing Manager',
    text: 'Creative Marketing Manager with 6+ years of experience developing and executing integrated marketing campaigns. Proven track record of increasing brand awareness by 60% and generating 150% ROI on marketing spend.'
  },
  {
    role: 'General',
    text: 'Dedicated professional with strong analytical and problem-solving skills. Proven ability to work effectively in fast-paced environments and deliver results. Excellent communication skills and a track record of exceeding expectations.'
  }
];

export const EXAMPLE_EXPERIENCE = {
  company: 'Tech Company Inc.',
  position: 'Senior Software Engineer',
  period: '2020',
  endPeriod: 'Present',
  location: 'San Francisco, CA',
  bullets: [
    'Led development of microservices architecture serving 1M+ daily active users',
    'Reduced API response time by 40% through optimization and caching strategies',
    'Mentored team of 5 junior developers and conducted code reviews',
    'Implemented CI/CD pipeline reducing deployment time from hours to minutes'
  ],
  environment: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']
};

export const POPULAR_SKILLS_BY_ROLE: Record<string, string[]> = {
  'Software Engineer': [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'TypeScript',
    'Git',
    'AWS',
    'Docker',
    'MongoDB',
    'REST APIs',
    'Agile',
    'CI/CD'
  ],
  'Product Manager': [
    'Product Strategy',
    'Roadmap Planning',
    'User Research',
    'A/B Testing',
    'Data Analysis',
    'Agile/Scrum',
    'Stakeholder Management',
    'Wireframing',
    'SQL',
    'Jira',
    'Product Analytics',
    'Go-to-Market'
  ],
  'Data Scientist': [
    'Python',
    'Machine Learning',
    'TensorFlow',
    'PyTorch',
    'SQL',
    'R',
    'Data Visualization',
    'Statistical Analysis',
    'Pandas',
    'NumPy',
    'Scikit-learn',
    'Deep Learning'
  ],
  'Marketing Manager': [
    'Digital Marketing',
    'SEO/SEM',
    'Content Strategy',
    'Social Media',
    'Google Analytics',
    'Marketing Automation',
    'Campaign Management',
    'Brand Strategy',
    'Email Marketing',
    'A/B Testing',
    'CRM',
    'Budget Management'
  ],
  'Designer': [
    'Figma',
    'Adobe Creative Suite',
    'UI/UX Design',
    'Prototyping',
    'User Research',
    'Wireframing',
    'Design Systems',
    'Responsive Design',
    'Typography',
    'Color Theory',
    'Sketch',
    'InVision'
  ],
  'General': [
    'Communication',
    'Problem Solving',
    'Leadership',
    'Time Management',
    'Teamwork',
    'Critical Thinking',
    'Project Management',
    'Microsoft Office',
    'Adaptability',
    'Attention to Detail',
    'Organization',
    'Customer Service'
  ]
};

export const EXAMPLE_PROJECT = {
  name: 'E-Commerce Platform Redesign',
  description: 'Led complete redesign of e-commerce platform, improving conversion rate by 25% and reducing cart abandonment by 30%. Implemented modern UI/UX best practices and mobile-first design.',
  period: '2023',
  endPeriod: '',
  technologies: ['React', 'Next.js', 'Stripe', 'Tailwind CSS'],
  bullets: [
    'Designed and implemented responsive UI components',
    'Integrated payment processing with Stripe API',
    'Optimized page load time from 3s to under 1s',
    'Increased mobile conversion rate by 40%'
  ]
};

/**
 * Get popular skills for a specific role
 * @param jobTitle - The job title from resume
 * @returns Array of popular skills for that role
 */
export function getPopularSkillsForRole(jobTitle: string): string[] {
  // Try to match role keywords
  const titleLower = jobTitle.toLowerCase();
  
  if (titleLower.includes('engineer') || titleLower.includes('developer')) {
    return POPULAR_SKILLS_BY_ROLE['Software Engineer'];
  }
  if (titleLower.includes('product') && titleLower.includes('manager')) {
    return POPULAR_SKILLS_BY_ROLE['Product Manager'];
  }
  if (titleLower.includes('data') && (titleLower.includes('scientist') || titleLower.includes('analyst'))) {
    return POPULAR_SKILLS_BY_ROLE['Data Scientist'];
  }
  if (titleLower.includes('marketing')) {
    return POPULAR_SKILLS_BY_ROLE['Marketing Manager'];
  }
  if (titleLower.includes('design')) {
    return POPULAR_SKILLS_BY_ROLE['Designer'];
  }
  
  // Default to general skills
  return POPULAR_SKILLS_BY_ROLE['General'];
}

/**
 * Get example summary for a specific role
 * @param jobTitle - The job title from resume
 * @returns Example summary text
 */
export function getExampleSummaryForRole(jobTitle: string): string {
  const titleLower = jobTitle.toLowerCase();
  
  const match = EXAMPLE_SUMMARIES.find(example => 
    titleLower.includes(example.role.toLowerCase())
  );
  
  return match?.text || EXAMPLE_SUMMARIES[EXAMPLE_SUMMARIES.length - 1].text;
}

