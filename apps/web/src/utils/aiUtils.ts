// AI-related utility functions
import { ResumeData } from '../types/resume';

export interface AIContext {
  section: string;
  prompt: string;
  tone: string;
  length: string;
  jobDescription?: string;
  isTailoring?: boolean;
  experienceData?: any[];
  skillsData?: string[];
  projectData?: any[];
  educationData?: any[];
}

/**
 * Detect input type (job description, prompt, or auto)
 */
export const detectInputType = (text: string): 'auto' | 'prompt' | 'job' => {
  if (!text.trim()) return 'auto';
  
  const lowerText = text.toLowerCase();
  const jobDescriptionKeywords = [
    'job description', 'requirements', 'qualifications', 'responsibilities',
    'experience required', 'skills required', 'education required', 'bachelor',
    'master', 'degree', 'years of experience', 'proficient in', 'knowledge of',
    'ability to', 'must have', 'should have', 'preferred', 'benefits', 'salary',
    'location', 'remote', 'hybrid', 'full-time', 'part-time', 'contract'
  ];
  
  const promptKeywords = [
    'generate', 'create', 'write', 'make', 'build', 'develop', 'design',
    'i want', 'i need', 'help me', 'can you', 'please', 'for my', 'about my'
  ];
  
  const jobScore = jobDescriptionKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const promptScore = promptKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  // If text is long and contains job-related keywords, it's likely a job description
  if (text.length > 200 && jobScore > 2) return 'job';
  if (promptScore > 0 && jobScore === 0) return 'prompt';
  if (jobScore > promptScore) return 'job';
  
  return 'auto';
};

/**
 * Generate content for different resume sections
 */
export const generateSectionContent = (context: AIContext): string => {
  const { section, prompt, tone, length, isTailoring, jobDescription } = context;
  
  switch (section) {
    case 'summary':
      return generateSummaryContent(context);
    case 'experience':
      return generateExperienceContent(context);
    case 'skills':
      return generateSkillsContent(context);
    case 'projects':
      return generateProjectsContent(context);
    case 'education':
      return generateEducationContent(context);
    default:
      return generateGenericContent(context);
  }
};

/**
 * Generate professional summary content
 */
export const generateSummaryContent = (context: AIContext): string => {
  const { prompt, tone, length, isTailoring, jobDescription, experienceData } = context;
  const experience = experienceData?.[0];
  
  if (isTailoring && jobDescription) {
    // Generate tailored summary based on job description
    const jdKeywords = jobDescription.toLowerCase();
    const roleMatch = jdKeywords.includes('engineer') ? 'Engineer' : 
                     jdKeywords.includes('manager') ? 'Manager' : 
                     jdKeywords.includes('developer') ? 'Developer' : 'Professional';
    
    const experienceYears = experience?.period ? 
      new Date().getFullYear() - parseInt(experience.period.split(' ')[1]) : 3;
    
    return `Results-driven ${roleMatch} with ${experienceYears}+ years of experience delivering innovative solutions and driving business growth. Proven track record of leading cross-functional teams and implementing scalable systems that improve operational efficiency. Strong expertise in modern technologies and methodologies with a passion for continuous learning and professional development.`;
  }
  
  // Generate based on prompt
  const tonePrefix = tone === 'professional' ? 'Results-driven' : 
                    tone === 'technical' ? 'Technically skilled' : 
                    tone === 'creative' ? 'Innovative' : 'Accomplished';
  
  const lengthSuffix = length === 'concise' ? 'Proven track record of success.' :
                      length === 'medium' ? 'Demonstrated ability to deliver high-quality results in fast-paced environments.' :
                      'Comprehensive experience in leading projects from conception to completion, with strong analytical skills and attention to detail.';
  
  return `${tonePrefix} professional with extensive experience in ${prompt || 'various industries'}. ${lengthSuffix}`;
};

/**
 * Generate experience content
 */
export const generateExperienceContent = (context: AIContext): string => {
  const { prompt, tone, length, isTailoring, jobDescription } = context;
  
  if (isTailoring && jobDescription) {
    const jdKeywords = jobDescription.toLowerCase();
    const technologies = extractTechnologiesFromJD(jobDescription);
    
    return `• Led development of ${technologies[0] || 'web applications'} serving ${Math.floor(Math.random() * 1000) + 100} users
• Implemented ${technologies[1] || 'scalable solutions'} resulting in ${Math.floor(Math.random() * 50) + 20}% performance improvement
• Collaborated with cross-functional teams to deliver ${Math.floor(Math.random() * 20) + 5} successful projects
• Mentored ${Math.floor(Math.random() * 5) + 2} junior developers and conducted code reviews
• Optimized ${technologies[2] || 'database queries'} reducing response time by ${Math.floor(Math.random() * 40) + 30}%`;
  }
  
  const bulletCount = length === 'concise' ? 3 : length === 'medium' ? 4 : 5;
  const bullets = [];
  
  for (let i = 0; i < bulletCount; i++) {
    bullets.push(generateExperienceBullet(prompt, tone, i));
  }
  
  return bullets.join('\n');
};

/**
 * Generate skills content
 */
export const generateSkillsContent = (context: AIContext): string => {
  const { prompt, isTailoring, jobDescription } = context;
  
  if (isTailoring && jobDescription) {
    const technologies = extractTechnologiesFromJD(jobDescription);
    return technologies.join(', ');
  }
  
  // Generate skills based on prompt
  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'];
  const promptSkills = extractSkillsFromPrompt(prompt);
  
  return [...promptSkills, ...commonSkills.slice(0, 8 - promptSkills.length)].join(', ');
};

/**
 * Generate projects content
 */
export const generateProjectsContent = (context: AIContext): string => {
  const { prompt, tone, length } = context;
  
  const projectCount = length === 'concise' ? 2 : length === 'medium' ? 3 : 4;
  const projects = [];
  
  for (let i = 0; i < projectCount; i++) {
    projects.push(generateProjectDescription(prompt, tone, i));
  }
  
  return projects.join('\n\n');
};

/**
 * Generate education content
 */
export const generateEducationContent = (context: AIContext): string => {
  const { prompt, tone } = context;
  
  const degrees = ['Bachelor of Science in Computer Science', 'Master of Science in Software Engineering', 'Bachelor of Engineering'];
  const universities = ['University of Technology', 'State University', 'Technical Institute'];
  
  const degree = degrees[Math.floor(Math.random() * degrees.length)];
  const university = universities[Math.floor(Math.random() * universities.length)];
  const year = new Date().getFullYear() - Math.floor(Math.random() * 10) - 2;
  
  return `${degree}\n${university} | ${year}`;
};

/**
 * Generate generic content
 */
export const generateGenericContent = (context: AIContext): string => {
  const { prompt, tone, length } = context;
  
  const contentLength = length === 'concise' ? 50 : length === 'medium' ? 100 : 150;
  const toneWords = tone === 'professional' ? ['accomplished', 'proven', 'demonstrated'] :
                    tone === 'technical' ? ['implemented', 'optimized', 'architected'] :
                    tone === 'creative' ? ['innovative', 'dynamic', 'inspiring'] : ['experienced', 'skilled', 'dedicated'];
  
  const toneWord = toneWords[Math.floor(Math.random() * toneWords.length)];
  
  return `Experienced professional with ${toneWord} expertise in ${prompt || 'various domains'}. Demonstrated ability to deliver high-quality results and drive innovation in fast-paced environments.`;
};

// Helper functions
const extractTechnologiesFromJD = (jobDescription: string): string[] => {
  const techKeywords = ['javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql'];
  return techKeywords.filter(tech => jobDescription.toLowerCase().includes(tech));
};

const extractSkillsFromPrompt = (prompt: string): string[] => {
  const skills = [];
  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'];
  
  commonSkills.forEach(skill => {
    if (prompt.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  });
  
  return skills;
};

const generateExperienceBullet = (prompt: string, tone: string, index: number): string => {
  const actions = tone === 'professional' ? ['Led', 'Managed', 'Delivered', 'Implemented'] :
                 tone === 'technical' ? ['Developed', 'Optimized', 'Architected', 'Deployed'] :
                 tone === 'creative' ? ['Designed', 'Created', 'Innovated', 'Transformed'] :
                 ['Executed', 'Coordinated', 'Facilitated', 'Achieved'];
  
  const action = actions[index % actions.length];
  const metrics = ['20%', '30%', '40%', '50%'];
  const metric = metrics[index % metrics.length];
  
  return `• ${action} ${prompt || 'key initiatives'} resulting in ${metric} improvement in efficiency and performance`;
};

const generateProjectDescription = (prompt: string, tone: string, index: number): string => {
  const projectTypes = ['Web Application', 'Mobile App', 'Data Pipeline', 'API Service'];
  const projectType = projectTypes[index % projectTypes.length];
  
  return `${projectType} - ${prompt || 'Innovative solution'} built with modern technologies. Delivered on time and within budget, achieving significant user adoption and positive feedback.`;
};

/**
 * Analyze job description and extract key requirements
 */
export const analyzeJobDescription = (jobDescription: string) => {
  const jd = jobDescription.toLowerCase();
  
  const requirements = {
    skills: extractTechnologiesFromJD(jobDescription),
    experience: extractExperienceRequirement(jd),
    education: extractEducationRequirement(jd),
    location: extractLocation(jd),
    type: extractJobType(jd)
  };
  
  return requirements;
};

const extractExperienceRequirement = (jd: string): string => {
  const experienceMatch = jd.match(/(\d+)\+?\s*years?\s*of\s*experience/i);
  return experienceMatch ? experienceMatch[1] : '3';
};

const extractEducationRequirement = (jd: string): string => {
  if (jd.includes('master') || jd.includes('mba')) return 'Master\'s Degree';
  if (jd.includes('bachelor') || jd.includes('degree')) return 'Bachelor\'s Degree';
  return 'High School Diploma';
};

const extractLocation = (jd: string): string => {
  if (jd.includes('remote')) return 'Remote';
  if (jd.includes('hybrid')) return 'Hybrid';
  if (jd.includes('on-site') || jd.includes('onsite')) return 'On-site';
  return 'Not specified';
};

const extractJobType = (jd: string): string => {
  if (jd.includes('full-time') || jd.includes('fulltime')) return 'Full-time';
  if (jd.includes('part-time') || jd.includes('parttime')) return 'Part-time';
  if (jd.includes('contract')) return 'Contract';
  return 'Not specified';
};
