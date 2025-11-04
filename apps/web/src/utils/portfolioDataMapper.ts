import { Section } from '../types/portfolio';
import { UserData } from '../components/profile/types/profile';

/**
 * Generate portfolio sections from user profile data
 */
export function generateSectionsFromProfile(userData: UserData): Section[] {
  const sections: Section[] = [];

  // Hero Section
  sections.push({
    id: 'hero',
    type: 'hero',
    title: 'Hero',
    order: 1,
    enabled: true,
    config: {
      headline: `I'm ${userData.firstName} ${userData.lastName}`,
      subheading: userData.professionalBio || userData.bio || userData.currentRole || 'Building amazing things',
      ctaText: 'Contact Me',
      secondaryCta: 'View Resume'
    }
  });

  // About Section
  sections.push({
    id: 'about',
    type: 'about',
    title: 'About',
    order: 2,
    enabled: true,
    config: {
      title: 'About Me',
      description: userData.professionalBio || userData.bio || userData.professionalSummary?.overview || 'Passionate professional.'
    }
  });

  // Experience Section - Use timeline or create from basic info
  if (userData.currentRole && userData.currentCompany) {
    sections.push({
      id: 'experience',
      type: 'experience',
      title: 'Experience',
      order: 3,
      enabled: true,
      config: {
        title: 'Work Experience',
        items: [
          {
            position: userData.currentRole,
            company: userData.currentCompany,
            date: userData.experience || 'Present',
            location: userData.location || '',
            description: userData.professionalSummary?.currentFocus || ''
          },
          // Add more from timeline if available
          ...(userData.careerTimeline || [])
            .filter(event => event.type === 'Work')
            .slice(0, 3)
            .map((event, idx) => ({
              position: event.title,
              company: event.description.split(' at ')[1] || event.description,
              date: event.date,
              location: '',
              description: event.description
            }))
        ]
      }
    });
  }

  // Projects Section
  if (userData.projects && userData.projects.length > 0) {
    sections.push({
      id: 'projects',
      type: 'projects',
      title: 'Projects',
      order: 4,
      enabled: true,
      config: {
        title: 'Featured Projects',
        items: userData.projects.slice(0, 6).map(project => ({
          name: project.title,
          description: project.description,
          url: project.link || project.github || ''
        }))
      }
    });
  }

  // Skills Section
  if (userData.skills && userData.skills.length > 0) {
    sections.push({
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      order: 5,
      enabled: true,
      config: {
        title: 'Technical Skills',
        items: userData.skills.map(skill => skill.name)
      }
    });
  }

  // Education Section
  if (userData.education && userData.education.length > 0) {
    sections.push({
      id: 'education',
      type: 'education',
      title: 'Education',
      order: 6,
      enabled: true,
      config: {
        title: 'Education',
        items: userData.education.map(edu => ({
          degree: `${edu.degree} in ${edu.field}`,
          institution: edu.institution,
          year: edu.endDate || edu.startDate
        }))
      }
    });
  }

  // Contact Section
  sections.push({
    id: 'contact',
    type: 'contact',
    title: 'Contact',
    order: 7,
    enabled: true,
    config: {
      title: 'Get In Touch',
      email: userData.email,
      socialLinks: [
        { label: 'LinkedIn', url: userData.linkedin },
        { label: 'GitHub', url: userData.github },
        ...(userData.socialLinks || []).map(link => ({
          label: link.platform,
          url: link.url
        }))
      ]
    }
  });

  return sections;
}

/**
 * Initialize sections with default empty sections if no profile data
 */
export function generateDefaultSections(): Section[] {
  return [
    {
      id: 'hero',
      type: 'hero',
      title: 'Hero',
      order: 1,
      enabled: true,
      config: {
        headline: 'Welcome to My Portfolio',
        subheading: 'Your professional introduction',
        ctaText: 'Contact Me',
        secondaryCta: 'View Resume'
      }
    },
    {
      id: 'about',
      type: 'about',
      title: 'About',
      order: 2,
      enabled: true,
      config: {
        title: 'About Me',
        description: 'Tell your story...'
      }
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Experience',
      order: 3,
      enabled: true,
      config: {
        title: 'Work Experience',
        items: []
      }
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'Projects',
      order: 4,
      enabled: true,
      config: {
        title: 'Featured Projects',
        items: []
      }
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      order: 5,
      enabled: true,
      config: {
        title: 'Technical Skills',
        items: []
      }
    },
    {
      id: 'education',
      type: 'education',
      title: 'Education',
      order: 6,
      enabled: true,
      config: {
        title: 'Education',
        items: []
      }
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact',
      order: 7,
      enabled: true,
      config: {
        title: 'Get In Touch',
        email: '',
        socialLinks: []
      }
    }
  ];
}

