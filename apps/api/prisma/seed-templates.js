// Seed template data into database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Map frontend enum values to Prisma enum values
const categoryMap = {
  'ats': 'ATS',
  'creative': 'CREATIVE',
  'modern': 'MODERN',
  'classic': 'CLASSIC',
  'executive': 'EXECUTIVE',
  'minimal': 'MINIMAL',
  'academic': 'ACADEMIC',
  'technical': 'TECHNICAL',
  'startup': 'STARTUP',
  'freelance': 'FREELANCE'
};

const difficultyMap = {
  'beginner': 'BEGINNER',
  'intermediate': 'INTERMEDIATE',
  'advanced': 'ADVANCED'
};

const layoutMap = {
  'single-column': 'SINGLE_COLUMN',
  'two-column': 'TWO_COLUMN',
  'hybrid': 'HYBRID'
};

const colorSchemeMap = {
  'monochrome': 'MONOCHROME',
  'blue': 'BLUE',
  'green': 'GREEN',
  'purple': 'PURPLE',
  'red': 'RED',
  'orange': 'ORANGE',
  'custom': 'CUSTOM'
};

const templates = [
  // ATS-Friendly Templates (3)
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    category: 'ats',
    description: 'Clean, ATS-optimized template perfect for corporate environments',
    preview: '/templates/ats-classic-preview.png',
    features: ['ATS Optimized', 'Clean Layout', 'Professional', 'Easy to Read'],
    difficulty: 'beginner',
    industry: ['Corporate', 'Finance', 'Healthcare', 'Education'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.8,
    downloads: 15420,
    author: 'RoleReady Team',
    tags: ['ats', 'corporate', 'professional', 'clean']
  },
  {
    id: 'ats-modern',
    name: 'ATS Modern',
    category: 'ats',
    description: 'Modern ATS-friendly design with subtle styling',
    preview: '/templates/ats-modern-preview.png',
    features: ['ATS Optimized', 'Modern Design', 'Subtle Colors', 'Professional'],
    difficulty: 'beginner',
    industry: ['Technology', 'Marketing', 'Sales', 'Consulting'],
    layout: 'single-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.7,
    downloads: 12850,
    author: 'RoleReady Team',
    tags: ['ats', 'modern', 'technology', 'professional']
  },
  {
    id: 'ats-executive',
    name: 'ATS Executive',
    category: 'ats',
    description: 'Executive-level ATS template with sophisticated layout',
    preview: '/templates/ats-executive-preview.png',
    features: ['ATS Optimized', 'Executive Level', 'Sophisticated', 'High Impact'],
    difficulty: 'intermediate',
    industry: ['Executive', 'Management', 'Finance', 'Consulting'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.9,
    downloads: 8750,
    author: 'RoleReady Team',
    tags: ['ats', 'executive', 'management', 'sophisticated']
  },

  // Creative Templates (6)
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    category: 'creative',
    description: 'Bold, creative design perfect for designers and artists',
    preview: '/templates/creative-portfolio-preview.png',
    features: ['Creative Design', 'Portfolio Integration', 'Bold Colors', 'Visual Impact'],
    difficulty: 'advanced',
    industry: ['Design', 'Art', 'Creative', 'Marketing'],
    layout: 'two-column',
    colorScheme: 'purple',
    isPremium: true,
    rating: 4.6,
    downloads: 12300,
    author: 'RoleReady Team',
    tags: ['creative', 'design', 'portfolio', 'bold']
  },
  {
    id: 'creative-minimal',
    name: 'Creative Minimal',
    category: 'creative',
    description: 'Minimalist creative template with elegant typography',
    preview: '/templates/creative-minimal-preview.png',
    features: ['Minimalist', 'Elegant Typography', 'Clean Design', 'Creative'],
    difficulty: 'intermediate',
    industry: ['Design', 'Writing', 'Photography', 'Art'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.5,
    downloads: 9800,
    author: 'RoleReady Team',
    tags: ['creative', 'minimal', 'elegant', 'typography']
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    category: 'creative',
    description: 'Bold, attention-grabbing design for creative professionals',
    preview: '/templates/creative-bold-preview.png',
    features: ['Bold Design', 'High Impact', 'Creative Layout', 'Eye-catching'],
    difficulty: 'advanced',
    industry: ['Design', 'Advertising', 'Marketing', 'Creative'],
    layout: 'hybrid',
    colorScheme: 'orange',
    isPremium: true,
    rating: 4.4,
    downloads: 7600,
    author: 'RoleReady Team',
    tags: ['creative', 'bold', 'advertising', 'marketing']
  },
  {
    id: 'creative-artist',
    name: 'Creative Artist',
    category: 'creative',
    description: 'Artistic template perfect for visual artists and designers',
    preview: '/templates/creative-artist-preview.png',
    features: ['Artistic Design', 'Visual Impact', 'Portfolio Integration', 'Creative'],
    difficulty: 'advanced',
    industry: ['Art', 'Design', 'Photography', 'Visual Arts'],
    layout: 'two-column',
    colorScheme: 'custom',
    isPremium: true,
    rating: 4.6,
    downloads: 6400,
    author: 'RoleReady Team',
    tags: ['creative', 'artist', 'visual', 'portfolio']
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    category: 'creative',
    description: 'Writer-focused template with publications and portfolio sections',
    preview: '/templates/creative-writer-preview.png',
    features: ['Writer-focused', 'Publications Section', 'Portfolio Integration', 'Creative'],
    difficulty: 'intermediate',
    industry: ['Writing', 'Journalism', 'Content', 'Publishing'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.5,
    downloads: 8800,
    author: 'RoleReady Team',
    tags: ['creative', 'writer', 'publications', 'content']
  },
  {
    id: 'premium-creative',
    name: 'Premium Creative',
    category: 'creative',
    description: 'Premium creative template with advanced design elements',
    preview: '/templates/premium-creative-preview.png',
    features: ['Premium Creative', 'Advanced Design', 'High Impact', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Design', 'Creative', 'Advertising', 'Marketing'],
    layout: 'hybrid',
    colorScheme: 'custom',
    isPremium: true,
    rating: 4.9,
    downloads: 5800,
    author: 'RoleReady Team',
    tags: ['premium', 'creative', 'advanced', 'exclusive']
  },

  // Modern Templates (5)
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    category: 'modern',
    description: 'Sleek, modern design perfect for tech professionals',
    preview: '/templates/modern-tech-preview.png',
    features: ['Modern Design', 'Tech-focused', 'Clean Layout', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Technology', 'Software', 'Engineering', 'IT'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.7,
    downloads: 18900,
    author: 'RoleReady Team',
    tags: ['modern', 'tech', 'software', 'engineering']
  },
  {
    id: 'modern-startup',
    name: 'Modern Startup',
    category: 'modern',
    description: 'Dynamic, startup-friendly design with modern aesthetics',
    preview: '/templates/modern-startup-preview.png',
    features: ['Startup-friendly', 'Dynamic Design', 'Modern Aesthetics', 'Innovative'],
    difficulty: 'intermediate',
    industry: ['Startup', 'Technology', 'Innovation', 'Entrepreneurship'],
    layout: 'hybrid',
    colorScheme: 'green',
    isPremium: false,
    rating: 4.6,
    downloads: 11200,
    author: 'RoleReady Team',
    tags: ['modern', 'startup', 'innovation', 'dynamic']
  },
  {
    id: 'modern-executive',
    name: 'Modern Executive',
    category: 'modern',
    description: 'Contemporary executive template with sophisticated design',
    preview: '/templates/modern-executive-preview.png',
    features: ['Executive Level', 'Contemporary', 'Sophisticated', 'Professional'],
    difficulty: 'advanced',
    industry: ['Executive', 'Management', 'Leadership', 'Consulting'],
    layout: 'single-column',
    colorScheme: 'blue',
    isPremium: true,
    rating: 4.8,
    downloads: 9200,
    author: 'RoleReady Team',
    tags: ['modern', 'executive', 'leadership', 'sophisticated']
  },
  {
    id: 'modern-product',
    name: 'Modern Product',
    category: 'modern',
    description: 'Product management template with metrics and strategy sections',
    preview: '/templates/modern-product-preview.png',
    features: ['Product-focused', 'Metrics Display', 'Strategy Sections', 'Modern'],
    difficulty: 'intermediate',
    industry: ['Product Management', 'Technology', 'Strategy', 'Innovation'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.7,
    downloads: 9800,
    author: 'RoleReady Team',
    tags: ['modern', 'product', 'strategy', 'metrics']
  },
  {
    id: 'modern-ux',
    name: 'Modern UX',
    category: 'modern',
    description: 'UX/UI designer template with portfolio and process sections',
    preview: '/templates/modern-ux-preview.png',
    features: ['UX/UI Focused', 'Portfolio Integration', 'Process Sections', 'Modern'],
    difficulty: 'intermediate',
    industry: ['UX/UI Design', 'Product Design', 'User Experience', 'Design'],
    layout: 'hybrid',
    colorScheme: 'purple',
    isPremium: true,
    rating: 4.8,
    downloads: 11200,
    author: 'RoleReady Team',
    tags: ['modern', 'ux', 'ui', 'design']
  },

  // Classic Templates (4)
  {
    id: 'classic-traditional',
    name: 'Classic Traditional',
    category: 'classic',
    description: 'Traditional, timeless design for conservative industries',
    preview: '/templates/classic-traditional-preview.png',
    features: ['Traditional', 'Timeless', 'Conservative', 'Professional'],
    difficulty: 'beginner',
    industry: ['Finance', 'Law', 'Healthcare', 'Education'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.5,
    downloads: 15600,
    author: 'RoleReady Team',
    tags: ['classic', 'traditional', 'conservative', 'timeless']
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    category: 'classic',
    description: 'Elegant, refined design with sophisticated typography',
    preview: '/templates/classic-elegant-preview.png',
    features: ['Elegant', 'Refined', 'Sophisticated Typography', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Finance', 'Consulting', 'Management', 'Professional Services'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.7,
    downloads: 10800,
    author: 'RoleReady Team',
    tags: ['classic', 'elegant', 'refined', 'sophisticated']
  },
  {
    id: 'classic-law',
    name: 'Classic Law',
    category: 'classic',
    description: 'Legal profession template with traditional, conservative design',
    preview: '/templates/classic-law-preview.png',
    features: ['Legal-focused', 'Traditional Design', 'Conservative', 'Professional'],
    difficulty: 'beginner',
    industry: ['Law', 'Legal', 'Compliance', 'Government'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.6,
    downloads: 8400,
    author: 'RoleReady Team',
    tags: ['classic', 'law', 'legal', 'traditional']
  },
  {
    id: 'classic-government',
    name: 'Classic Government',
    category: 'classic',
    description: 'Government and public sector template with formal design',
    preview: '/templates/classic-government-preview.png',
    features: ['Government-focused', 'Formal Design', 'Public Sector', 'Professional'],
    difficulty: 'beginner',
    industry: ['Government', 'Public Sector', 'Policy', 'Administration'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.5,
    downloads: 7200,
    author: 'RoleReady Team',
    tags: ['classic', 'government', 'public', 'formal']
  },

  // Executive Templates (5)
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    category: 'executive',
    description: 'Premium executive template with luxury design elements',
    preview: '/templates/executive-premium-preview.png',
    features: ['Premium Design', 'Luxury Elements', 'Executive Level', 'High Impact'],
    difficulty: 'advanced',
    industry: ['Executive', 'C-Suite', 'Board Level', 'Senior Management'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.9,
    downloads: 6800,
    author: 'RoleReady Team',
    tags: ['executive', 'premium', 'luxury', 'c-suite']
  },
  {
    id: 'executive-modern',
    name: 'Executive Modern',
    category: 'executive',
    description: 'Modern executive template with contemporary styling',
    preview: '/templates/executive-modern-preview.png',
    features: ['Modern Executive', 'Contemporary', 'Professional', 'Sophisticated'],
    difficulty: 'advanced',
    industry: ['Executive', 'Management', 'Leadership', 'Consulting'],
    layout: 'hybrid',
    colorScheme: 'blue',
    isPremium: true,
    rating: 4.8,
    downloads: 8400,
    author: 'RoleReady Team',
    tags: ['executive', 'modern', 'leadership', 'contemporary']
  },
  {
    id: 'premium-luxury',
    name: 'Premium Luxury',
    category: 'executive',
    description: 'Ultra-premium luxury template for high-level executives',
    preview: '/templates/premium-luxury-preview.png',
    features: ['Ultra-premium', 'Luxury Design', 'Executive Level', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Executive', 'C-Suite', 'Board Level', 'Senior Leadership'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 5.0,
    downloads: 4200,
    author: 'RoleReady Team',
    tags: ['premium', 'luxury', 'executive', 'exclusive']
  },
  {
    id: 'finance-executive',
    name: 'Finance Executive',
    category: 'executive',
    description: 'Finance industry executive template with sophisticated design',
    preview: '/templates/finance-executive-preview.png',
    features: ['Finance-focused', 'Executive Level', 'Sophisticated', 'Professional'],
    difficulty: 'advanced',
    industry: ['Finance', 'Banking', 'Investment', 'Executive'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.8,
    downloads: 6800,
    author: 'RoleReady Team',
    tags: ['finance', 'executive', 'banking', 'investment']
  },
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    category: 'executive',
    description: 'Sales-focused executive template with performance metrics',
    preview: '/templates/sales-executive-preview.png',
    features: ['Sales-focused', 'Performance Metrics', 'Executive Level', 'Professional'],
    difficulty: 'advanced',
    industry: ['Sales', 'Business Development', 'Executive', 'Management'],
    layout: 'hybrid',
    colorScheme: 'blue',
    isPremium: true,
    rating: 4.8,
    downloads: 7600,
    author: 'RoleReady Team',
    tags: ['sales', 'executive', 'performance', 'business']
  },

  // Minimal Templates (4)
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    category: 'minimal',
    description: 'Ultra-clean, minimal design focusing on content',
    preview: '/templates/minimal-clean-preview.png',
    features: ['Ultra-clean', 'Minimal Design', 'Content-focused', 'Simple'],
    difficulty: 'beginner',
    industry: ['Design', 'Writing', 'Consulting', 'Freelance'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.6,
    downloads: 13200,
    author: 'RoleReady Team',
    tags: ['minimal', 'clean', 'simple', 'content-focused']
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    category: 'minimal',
    description: 'Elegant minimal design with subtle sophistication',
    preview: '/templates/minimal-elegant-preview.png',
    features: ['Elegant Minimal', 'Subtle Sophistication', 'Clean', 'Refined'],
    difficulty: 'intermediate',
    industry: ['Design', 'Consulting', 'Professional Services', 'Creative'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.7,
    downloads: 9600,
    author: 'RoleReady Team',
    tags: ['minimal', 'elegant', 'sophisticated', 'refined']
  },
  {
    id: 'minimal-tech',
    name: 'Minimal Tech',
    category: 'minimal',
    description: 'Minimal tech template focusing on skills and experience',
    preview: '/templates/minimal-tech-preview.png',
    features: ['Minimal Tech', 'Skills-focused', 'Clean Design', 'Simple'],
    difficulty: 'beginner',
    industry: ['Technology', 'Software', 'Engineering', 'IT'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.6,
    downloads: 10200,
    author: 'RoleReady Team',
    tags: ['minimal', 'tech', 'skills', 'clean']
  },
  {
    id: 'minimal-consultant',
    name: 'Minimal Consultant',
    category: 'minimal',
    description: 'Minimal consultant template with clean, professional design',
    preview: '/templates/minimal-consultant-preview.png',
    features: ['Minimal Consultant', 'Clean Design', 'Professional', 'Simple'],
    difficulty: 'intermediate',
    industry: ['Consulting', 'Professional Services', 'Advisory', 'Expert'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.7,
    downloads: 6800,
    author: 'RoleReady Team',
    tags: ['minimal', 'consultant', 'professional', 'clean']
  },

  // Academic Templates (4)
  {
    id: 'academic-research',
    name: 'Academic Research',
    category: 'academic',
    description: 'Academic template designed for researchers and scholars',
    preview: '/templates/academic-research-preview.png',
    features: ['Academic Focus', 'Research-oriented', 'Publications Section', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Research', 'Academia', 'Education', 'Science'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.5,
    downloads: 7800,
    author: 'RoleReady Team',
    tags: ['academic', 'research', 'education', 'publications']
  },
  {
    id: 'academic-modern',
    name: 'Academic Modern',
    category: 'academic',
    description: 'Modern academic template with contemporary design',
    preview: '/templates/academic-modern-preview.png',
    features: ['Modern Academic', 'Contemporary Design', 'Research-focused', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Academia', 'Research', 'Education', 'Science'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: true,
    rating: 4.6,
    downloads: 6200,
    author: 'RoleReady Team',
    tags: ['academic', 'modern', 'research', 'contemporary']
  },
  {
    id: 'academic-phd',
    name: 'Academic PhD',
    category: 'academic',
    description: 'PhD-level academic template with extensive research sections',
    preview: '/templates/academic-phd-preview.png',
    features: ['PhD-level', 'Research-heavy', 'Publications', 'Academic'],
    difficulty: 'advanced',
    industry: ['Academia', 'Research', 'PhD', 'Higher Education'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.8,
    downloads: 4800,
    author: 'RoleReady Team',
    tags: ['academic', 'phd', 'research', 'publications']
  },
  {
    id: 'academic-student',
    name: 'Academic Student',
    category: 'academic',
    description: 'Student-focused academic template with education emphasis',
    preview: '/templates/academic-student-preview.png',
    features: ['Student-focused', 'Education Emphasis', 'Academic', 'Professional'],
    difficulty: 'beginner',
    industry: ['Student', 'Education', 'Academic', 'Graduate'],
    layout: 'single-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.4,
    downloads: 13600,
    author: 'RoleReady Team',
    tags: ['academic', 'student', 'education', 'graduate']
  },

  // Technical Templates (5)
  {
    id: 'technical-engineer',
    name: 'Technical Engineer',
    category: 'technical',
    description: 'Technical template designed for engineers and developers',
    preview: '/templates/technical-engineer-preview.png',
    features: ['Technical Focus', 'Skills-heavy', 'Project-oriented', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Engineering', 'Software', 'Technology', 'Development'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.7,
    downloads: 14500,
    author: 'RoleReady Team',
    tags: ['technical', 'engineering', 'software', 'development']
  },
  {
    id: 'technical-data',
    name: 'Technical Data',
    category: 'technical',
    description: 'Data-focused template for data scientists and analysts',
    preview: '/templates/technical-data-preview.png',
    features: ['Data-focused', 'Analytics Section', 'Technical Skills', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Data Science', 'Analytics', 'Research', 'Technology'],
    layout: 'two-column',
    colorScheme: 'green',
    isPremium: true,
    rating: 4.6,
    downloads: 8900,
    author: 'RoleReady Team',
    tags: ['technical', 'data', 'analytics', 'science']
  },
  {
    id: 'technical-devops',
    name: 'Technical DevOps',
    category: 'technical',
    description: 'DevOps-focused template with technical skills and certifications',
    preview: '/templates/technical-devops-preview.png',
    features: ['DevOps-focused', 'Technical Skills', 'Certifications', 'Professional'],
    difficulty: 'intermediate',
    industry: ['DevOps', 'Technology', 'Infrastructure', 'Cloud'],
    layout: 'two-column',
    colorScheme: 'green',
    isPremium: true,
    rating: 4.7,
    downloads: 7200,
    author: 'RoleReady Team',
    tags: ['technical', 'devops', 'infrastructure', 'cloud']
  },
  {
    id: 'technical-cyber',
    name: 'Technical Cyber',
    category: 'technical',
    description: 'Cybersecurity-focused template with security certifications',
    preview: '/templates/technical-cyber-preview.png',
    features: ['Cybersecurity-focused', 'Security Certifications', 'Technical Skills', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Cybersecurity', 'Information Security', 'Technology', 'IT'],
    layout: 'two-column',
    colorScheme: 'red',
    isPremium: true,
    rating: 4.6,
    downloads: 5600,
    author: 'RoleReady Team',
    tags: ['technical', 'cybersecurity', 'security', 'certifications']
  },
  {
    id: 'premium-tech-lead',
    name: 'Premium Tech Lead',
    category: 'technical',
    description: 'Premium technical leadership template with advanced features',
    preview: '/templates/premium-tech-lead-preview.png',
    features: ['Tech Leadership', 'Advanced Features', 'Premium Design', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Technology', 'Engineering', 'Leadership', 'Management'],
    layout: 'hybrid',
    colorScheme: 'blue',
    isPremium: true,
    rating: 4.8,
    downloads: 5600,
    author: 'RoleReady Team',
    tags: ['premium', 'tech', 'leadership', 'exclusive']
  },

  // Startup Templates (4)
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    category: 'startup',
    description: 'Dynamic template perfect for startup founders and entrepreneurs',
    preview: '/templates/startup-founder-preview.png',
    features: ['Startup-focused', 'Entrepreneurial', 'Dynamic Design', 'Innovative'],
    difficulty: 'advanced',
    industry: ['Startup', 'Entrepreneurship', 'Innovation', 'Technology'],
    layout: 'hybrid',
    colorScheme: 'orange',
    isPremium: true,
    rating: 4.8,
    downloads: 7200,
    author: 'RoleReady Team',
    tags: ['startup', 'founder', 'entrepreneur', 'innovation']
  },
  {
    id: 'startup-tech',
    name: 'Startup Tech',
    category: 'startup',
    description: 'Tech startup template with modern, innovative design',
    preview: '/templates/startup-tech-preview.png',
    features: ['Tech Startup', 'Innovative Design', 'Modern', 'Dynamic'],
    difficulty: 'intermediate',
    industry: ['Startup', 'Technology', 'Innovation', 'Software'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.7,
    downloads: 10300,
    author: 'RoleReady Team',
    tags: ['startup', 'tech', 'innovation', 'modern']
  },
  {
    id: 'startup-nonprofit',
    name: 'Startup Nonprofit',
    category: 'startup',
    description: 'Nonprofit startup template with mission and impact focus',
    preview: '/templates/startup-nonprofit-preview.png',
    features: ['Nonprofit-focused', 'Mission-driven', 'Impact Sections', 'Startup'],
    difficulty: 'intermediate',
    industry: ['Nonprofit', 'Social Impact', 'Startup', 'Mission-driven'],
    layout: 'hybrid',
    colorScheme: 'green',
    isPremium: false,
    rating: 4.5,
    downloads: 6400,
    author: 'RoleReady Team',
    tags: ['startup', 'nonprofit', 'social', 'impact']
  },
  {
    id: 'startup-social',
    name: 'Startup Social',
    category: 'startup',
    description: 'Social impact startup template with community focus',
    preview: '/templates/startup-social-preview.png',
    features: ['Social Impact', 'Community Focus', 'Startup', 'Innovative'],
    difficulty: 'intermediate',
    industry: ['Social Impact', 'Community', 'Startup', 'Innovation'],
    layout: 'hybrid',
    colorScheme: 'green',
    isPremium: true,
    rating: 4.6,
    downloads: 5200,
    author: 'RoleReady Team',
    tags: ['startup', 'social', 'community', 'impact']
  },

  // Freelance Templates (5)
  {
    id: 'freelance-creative',
    name: 'Freelance Creative',
    category: 'freelance',
    description: 'Creative freelance template showcasing portfolio and skills',
    preview: '/templates/freelance-creative-preview.png',
    features: ['Freelance-focused', 'Portfolio Integration', 'Creative', 'Skills Showcase'],
    difficulty: 'intermediate',
    industry: ['Freelance', 'Creative', 'Design', 'Consulting'],
    layout: 'two-column',
    colorScheme: 'purple',
    isPremium: false,
    rating: 4.5,
    downloads: 11600,
    author: 'RoleReady Team',
    tags: ['freelance', 'creative', 'portfolio', 'skills']
  },
  {
    id: 'freelance-professional',
    name: 'Freelance Professional',
    category: 'freelance',
    description: 'Professional freelance template for consultants and experts',
    preview: '/templates/freelance-professional-preview.png',
    features: ['Professional Freelance', 'Consultant-focused', 'Expertise Showcase', 'Clean'],
    difficulty: 'intermediate',
    industry: ['Freelance', 'Consulting', 'Professional Services', 'Expert'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.6,
    downloads: 8400,
    author: 'RoleReady Team',
    tags: ['freelance', 'professional', 'consulting', 'expert']
  },
  {
    id: 'freelance-tech',
    name: 'Freelance Tech',
    category: 'freelance',
    description: 'Tech freelance template with project showcase and skills',
    preview: '/templates/freelance-tech-preview.png',
    features: ['Tech Freelance', 'Project Showcase', 'Skills Display', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Freelance', 'Technology', 'Software', 'Development'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.6,
    downloads: 9200,
    author: 'RoleReady Team',
    tags: ['freelance', 'tech', 'projects', 'skills']
  },
  {
    id: 'freelance-marketing',
    name: 'Freelance Marketing',
    category: 'freelance',
    description: 'Marketing freelance template with campaign and results sections',
    preview: '/templates/freelance-marketing-preview.png',
    features: ['Marketing Freelance', 'Campaign Sections', 'Results Display', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Freelance', 'Marketing', 'Digital', 'Advertising'],
    layout: 'two-column',
    colorScheme: 'purple',
    isPremium: true,
    rating: 4.7,
    downloads: 7600,
    author: 'RoleReady Team',
    tags: ['freelance', 'marketing', 'campaigns', 'results']
  },
  {
    id: 'premium-freelance-expert',
    name: 'Premium Freelance Expert',
    category: 'freelance',
    description: 'Premium freelance expert template with expertise showcase',
    preview: '/templates/premium-freelance-expert-preview.png',
    features: ['Freelance Expert', 'Expertise Showcase', 'Premium Design', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Freelance', 'Expert', 'Consulting', 'Professional Services'],
    layout: 'hybrid',
    colorScheme: 'custom',
    isPremium: true,
    rating: 4.7,
    downloads: 4400,
    author: 'RoleReady Team',
    tags: ['premium', 'freelance', 'expert', 'consulting']
  },

  // Additional Industry-specific Templates (5)
  {
    id: 'healthcare-professional',
    name: 'Healthcare Professional',
    category: 'ats',
    description: 'Healthcare-focused ATS template with medical sections',
    preview: '/templates/healthcare-professional-preview.png',
    features: ['Healthcare-focused', 'Medical Sections', 'ATS Optimized', 'Professional'],
    difficulty: 'beginner',
    industry: ['Healthcare', 'Medical', 'Nursing', 'Pharmacy'],
    layout: 'single-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.6,
    downloads: 9200,
    author: 'RoleReady Team',
    tags: ['healthcare', 'medical', 'ats', 'professional']
  },
  {
    id: 'education-teacher',
    name: 'Education Teacher',
    category: 'ats',
    description: 'Education-focused template for teachers and educators',
    preview: '/templates/education-teacher-preview.png',
    features: ['Education-focused', 'Teaching Sections', 'ATS Optimized', 'Professional'],
    difficulty: 'beginner',
    industry: ['Education', 'Teaching', 'Academic', 'Training'],
    layout: 'single-column',
    colorScheme: 'green',
    isPremium: false,
    rating: 4.5,
    downloads: 10800,
    author: 'RoleReady Team',
    tags: ['education', 'teaching', 'academic', 'ats']
  },
  {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    category: 'modern',
    description: 'Marketing-focused template with campaign and metrics sections',
    preview: '/templates/marketing-manager-preview.png',
    features: ['Marketing-focused', 'Campaign Sections', 'Metrics Display', 'Modern'],
    difficulty: 'intermediate',
    industry: ['Marketing', 'Advertising', 'Digital', 'Brand Management'],
    layout: 'two-column',
    colorScheme: 'purple',
    isPremium: false,
    rating: 4.7,
    downloads: 12400,
    author: 'RoleReady Team',
    tags: ['marketing', 'advertising', 'digital', 'campaigns']
  },
  {
    id: 'premium-executive',
    name: 'Premium Executive',
    category: 'executive',
    description: 'Ultimate premium executive template with luxury design',
    preview: '/templates/premium-executive-preview.png',
    features: ['Ultimate Premium', 'Luxury Design', 'Executive Level', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Executive', 'C-Suite', 'Board Level', 'Senior Leadership'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 5.0,
    downloads: 3200,
    author: 'RoleReady Team',
    tags: ['premium', 'executive', 'luxury', 'exclusive']
  },
  {
    id: 'premium-creative-pro',
    name: 'Premium Creative Pro',
    category: 'creative',
    description: 'Professional creative template with advanced design elements',
    preview: '/templates/premium-creative-pro-preview.png',
    features: ['Creative Pro', 'Advanced Design', 'High Impact', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Design', 'Creative', 'Advertising', 'Marketing'],
    layout: 'hybrid',
    colorScheme: 'custom',
    isPremium: true,
    rating: 4.9,
    downloads: 4800,
    author: 'RoleReady Team',
    tags: ['premium', 'creative', 'pro', 'exclusive']
  },
  {
    id: 'premium-startup-ceo',
    name: 'Premium Startup CEO',
    category: 'startup',
    description: 'Ultimate startup CEO template with entrepreneurial focus',
    preview: '/templates/premium-startup-ceo-preview.png',
    features: ['Startup CEO', 'Entrepreneurial', 'Premium Design', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Startup', 'CEO', 'Entrepreneurship', 'Leadership'],
    layout: 'hybrid',
    colorScheme: 'orange',
    isPremium: true,
    rating: 4.9,
    downloads: 4200,
    author: 'RoleReady Team',
    tags: ['premium', 'startup', 'ceo', 'entrepreneur']
  },
  {
    id: 'premium-academic-prof',
    name: 'Premium Academic Prof',
    category: 'academic',
    description: 'Premium academic professor template with research excellence',
    preview: '/templates/premium-academic-prof-preview.png',
    features: ['Academic Professor', 'Research Excellence', 'Premium Design', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Academia', 'Professor', 'Research', 'Higher Education'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.8,
    downloads: 3600,
    author: 'RoleReady Team',
    tags: ['premium', 'academic', 'professor', 'research']
  }
];

async function seedTemplates() {
  console.log('\n=== Seeding Template Data ===\n');

  try {
    // Count existing templates
    const existingCount = await prisma.resumeTemplate.count();
    console.log(`Found ${existingCount} existing templates in database`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const template of templates) {
      try {
        // Transform the template data to match Prisma schema
        const prismaTemplate = {
          id: template.id,
          name: template.name,
          category: categoryMap[template.category],
          description: template.description,
          preview: template.preview,
          features: template.features,
          difficulty: difficultyMap[template.difficulty],
          industry: template.industry,
          layout: layoutMap[template.layout],
          colorScheme: colorSchemeMap[template.colorScheme],
          isPremium: template.isPremium,
          rating: template.rating,
          downloads: template.downloads,
          author: template.author,
          tags: template.tags,
          isActive: true,
          isApproved: true,
          updatedAt: new Date()
        };

        // Use upsert to create or update
        await prisma.resumeTemplate.upsert({
          where: { id: template.id },
          update: prismaTemplate,
          create: prismaTemplate,
        });

        if (existingCount === 0) {
          created++;
          console.log(`✅ Created: ${template.name} (${template.category})`);
        } else {
          updated++;
          console.log(`🔄 Updated: ${template.name} (${template.category})`);
        }
      } catch (error) {
        skipped++;
        console.error(`❌ Error processing ${template.name}:`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total templates: ${templates.length}`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`\n✅ Template seeding completed!\n`);

    // Show breakdown by category
    const counts = await prisma.resumeTemplate.groupBy({
      by: ['category'],
      _count: true
    });

    console.log('📋 Templates by category:');
    counts.forEach(({ category, _count }) => {
      console.log(`   ${category}: ${_count}`);
    });

    // Show premium vs free breakdown
    const premiumCount = await prisma.resumeTemplate.count({ where: { isPremium: true } });
    const freeCount = await prisma.resumeTemplate.count({ where: { isPremium: false } });
    console.log(`\n💎 Premium templates: ${premiumCount}`);
    console.log(`🆓 Free templates: ${freeCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTemplates();
