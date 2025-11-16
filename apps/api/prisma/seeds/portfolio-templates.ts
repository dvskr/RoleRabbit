/**
 * Portfolio Templates Seed Data
 * Adds sample templates for users to choose from
 */

export const portfolioTemplates = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Minimal Professional',
    description: 'A clean, minimalist portfolio perfect for professionals. Features a simple layout with focus on content.',
    thumbnail: '/templates/minimal-professional.png',
    category: 'Professional',
    isPublic: true,
    rating: 4.8,
    downloads: 1250,
    structure: {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Hero Section',
          settings: {
            layout: 'centered',
            showImage: true,
            showCTA: true,
          },
        },
        {
          id: 'about',
          type: 'about',
          title: 'About Me',
          settings: {
            layout: 'split',
            showImage: true,
          },
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Work Experience',
          settings: {
            layout: 'timeline',
            showCompanyLogos: true,
          },
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          settings: {
            layout: 'grid',
            showProficiency: true,
          },
        },
        {
          id: 'contact',
          type: 'contact',
          title: 'Get in Touch',
          settings: {
            layout: 'form',
            showSocial: true,
          },
        },
      ],
    },
    styles: {
      colors: {
        primary: '#1a202c',
        secondary: '#2d3748',
        accent: '#4299e1',
        background: '#ffffff',
        text: '#2d3748',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: {
          base: '16px',
          heading: '2.5rem',
        },
      },
      spacing: {
        sectionPadding: '4rem',
        containerWidth: '1200px',
      },
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Creative Studio',
    description: 'Bold and vibrant template for creative professionals. Showcase your work with stunning visuals.',
    thumbnail: '/templates/creative-studio.png',
    category: 'Creative',
    isPublic: true,
    rating: 4.9,
    downloads: 980,
    structure: {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Hero Section',
          settings: {
            layout: 'fullscreen',
            showVideo: true,
            showCTA: true,
          },
        },
        {
          id: 'projects',
          type: 'projects',
          title: 'Featured Projects',
          settings: {
            layout: 'masonry',
            showFilters: true,
          },
        },
        {
          id: 'about',
          type: 'about',
          title: 'About',
          settings: {
            layout: 'centered',
            showImage: true,
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          title: 'Client Testimonials',
          settings: {
            layout: 'carousel',
            showRatings: true,
          },
        },
        {
          id: 'contact',
          type: 'contact',
          title: 'Let\'s Work Together',
          settings: {
            layout: 'split',
            showSocial: true,
          },
        },
      ],
    },
    styles: {
      colors: {
        primary: '#6b46c1',
        secondary: '#9f7aea',
        accent: '#ed64a6',
        background: '#1a202c',
        text: '#e2e8f0',
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Open Sans',
        fontSize: {
          base: '18px',
          heading: '3rem',
        },
      },
      spacing: {
        sectionPadding: '5rem',
        containerWidth: '1400px',
      },
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Developer Portfolio',
    description: 'Technical and modern portfolio for developers. Perfect for showcasing code projects and technical skills.',
    thumbnail: '/templates/developer-portfolio.png',
    category: 'Developer',
    isPublic: true,
    rating: 4.7,
    downloads: 1580,
    structure: {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Hero Section',
          settings: {
            layout: 'terminal',
            showAnimation: true,
            showCTA: true,
          },
        },
        {
          id: 'projects',
          type: 'projects',
          title: 'Projects',
          settings: {
            layout: 'grid',
            showGithubStats: true,
            showLiveDemo: true,
          },
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Tech Stack',
          settings: {
            layout: 'cards',
            showProficiency: true,
            groupByCategory: true,
          },
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Experience',
          settings: {
            layout: 'list',
            showCompanyLogos: true,
          },
        },
        {
          id: 'blog',
          type: 'blog',
          title: 'Blog Posts',
          settings: {
            layout: 'grid',
            showExcerpt: true,
          },
        },
        {
          id: 'contact',
          type: 'contact',
          title: 'Contact',
          settings: {
            layout: 'simple',
            showSocial: true,
            showGithub: true,
          },
        },
      ],
    },
    styles: {
      colors: {
        primary: '#0d1117',
        secondary: '#161b22',
        accent: '#58a6ff',
        background: '#0d1117',
        text: '#c9d1d9',
      },
      typography: {
        headingFont: 'Fira Code',
        bodyFont: 'Roboto',
        fontSize: {
          base: '16px',
          heading: '2.25rem',
        },
      },
      spacing: {
        sectionPadding: '3rem',
        containerWidth: '1280px',
      },
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Business Executive',
    description: 'Professional and elegant portfolio for executives and business leaders.',
    thumbnail: '/templates/business-executive.png',
    category: 'Business',
    isPublic: true,
    rating: 4.6,
    downloads: 720,
    structure: {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Hero Section',
          settings: {
            layout: 'split',
            showImage: true,
            showCredentials: true,
          },
        },
        {
          id: 'about',
          type: 'about',
          title: 'Professional Summary',
          settings: {
            layout: 'full',
            showAchievements: true,
          },
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Career Highlights',
          settings: {
            layout: 'detailed',
            showCompanyLogos: true,
            showMetrics: true,
          },
        },
        {
          id: 'awards',
          type: 'awards',
          title: 'Awards & Recognition',
          settings: {
            layout: 'grid',
            showYear: true,
          },
        },
        {
          id: 'contact',
          type: 'contact',
          title: 'Connect',
          settings: {
            layout: 'professional',
            showLinkedIn: true,
          },
        },
      ],
    },
    styles: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        accent: '#f59e0b',
        background: '#f9fafb',
        text: '#111827',
      },
      typography: {
        headingFont: 'Merriweather',
        bodyFont: 'Lato',
        fontSize: {
          base: '17px',
          heading: '2.75rem',
        },
      },
      spacing: {
        sectionPadding: '4.5rem',
        containerWidth: '1100px',
      },
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Freelancer Showcase',
    description: 'Versatile template for freelancers to showcase their services and past work.',
    thumbnail: '/templates/freelancer-showcase.png',
    category: 'Freelance',
    isPublic: true,
    rating: 4.8,
    downloads: 1100,
    structure: {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Hero Section',
          settings: {
            layout: 'centered',
            showTagline: true,
            showCTA: true,
          },
        },
        {
          id: 'services',
          type: 'services',
          title: 'Services',
          settings: {
            layout: 'cards',
            showPricing: true,
          },
        },
        {
          id: 'portfolio',
          type: 'portfolio',
          title: 'Portfolio',
          settings: {
            layout: 'grid',
            showCategories: true,
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          title: 'Client Reviews',
          settings: {
            layout: 'cards',
            showRatings: true,
          },
        },
        {
          id: 'process',
          type: 'process',
          title: 'How I Work',
          settings: {
            layout: 'steps',
            showIcons: true,
          },
        },
        {
          id: 'contact',
          type: 'contact',
          title: 'Hire Me',
          settings: {
            layout: 'form',
            showAvailability: true,
          },
        },
      ],
    },
    styles: {
      colors: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937',
      },
      typography: {
        headingFont: 'Montserrat',
        bodyFont: 'Nunito',
        fontSize: {
          base: '16px',
          heading: '2.5rem',
        },
      },
      spacing: {
        sectionPadding: '4rem',
        containerWidth: '1200px',
      },
    },
  },
];

