import { ResumeCategory, RESUME_CATEGORY_INFO, ResumeCategoryInfo, Industry } from './categories';

/**
 * Resume Template Interface
 *
 * Defines the complete schema for a resume template in the RoleRabbit system.
 * This interface ensures consistent template data structure across the application.
 *
 * @interface ResumeTemplate
 *
 * @property {string} id - Unique identifier for the template
 *   - **Required**: Yes
 *   - **Format**: Lowercase, kebab-case (e.g., 'ats-classic', 'creative-modern')
 *   - **Constraints**: Must be unique across all templates, no spaces or special chars
 *   - **Example**: 'ats-classic', 'executive-blue', 'creative-portfolio'
 *
 * @property {string} name - Display name of the template
 *   - **Required**: Yes
 *   - **Format**: Title case, human-readable
 *   - **Constraints**: 3-50 characters, should be descriptive
 *   - **Example**: 'ATS Classic', 'Modern Executive', 'Creative Portfolio'
 *
 * @property {ResumeCategory} category - Template category classification
 *   - **Required**: Yes
 *   - **Valid Values**: 'ats' | 'creative' | 'modern' | 'classic' | 'executive' | 'minimal' | 'academic' | 'technical' | 'startup' | 'freelance'
 *   - **Purpose**: Used for filtering and organization
 *   - **Example**: 'ats', 'creative', 'executive'
 *
 * @property {string} description - Brief description of the template
 *   - **Required**: Yes
 *   - **Format**: Sentence case, concise explanation
 *   - **Constraints**: 20-200 characters, should explain unique value
 *   - **Example**: 'Clean, ATS-optimized template perfect for corporate environments'
 *
 * @property {string} preview - URL path to preview image (DEPRECATED - not currently used)
 *   - **Required**: No (field exists but unused)
 *   - **Format**: Path string (e.g., '/templates/ats-classic-preview.png')
 *   - **Note**: System currently uses CSS-generated previews instead
 *   - **Example**: '/templates/ats-classic-preview.png'
 *
 * @property {string[]} features - List of key template features/selling points
 *   - **Required**: Yes
 *   - **Format**: Array of short feature descriptions
 *   - **Constraints**: 3-6 features, each 2-30 characters
 *   - **Example**: ['ATS Optimized', 'Clean Layout', 'Professional', 'Easy to Read']
 *
 * @property {'beginner' | 'intermediate' | 'advanced'} difficulty - Template complexity level
 *   - **Required**: Yes
 *   - **Valid Values**:
 *     * 'beginner': Simple, straightforward templates (green badge)
 *     * 'intermediate': Moderate complexity (yellow badge)
 *     * 'advanced': Complex layouts with advanced features (red badge)
 *   - **Purpose**: Helps users choose templates matching their skill level
 *   - **Example**: 'beginner'
 *
 * @property {Industry[]} industry - Target industries for this template
 *   - **Required**: Yes
 *   - **Format**: Array of validated Industry strings
 *   - **Constraints**: 1-8 industries, must match Industry type from categories
 *   - **Valid Industries**: 'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', etc.
 *   - **Example**: ['Professional Services', 'Finance', 'Healthcare', 'Education']
 *
 * @property {'single-column' | 'two-column' | 'hybrid'} layout - Template layout structure
 *   - **Required**: Yes
 *   - **Valid Values**:
 *     * 'single-column': Full-width, vertical flow (best for ATS)
 *     * 'two-column': Sidebar + main content (modern, visual)
 *     * 'hybrid': Combination of both layouts (flexible)
 *   - **Purpose**: Affects HTML generation in getTemplateDownloadHTML()
 *   - **Example**: 'single-column'
 *
 * @property {'monochrome' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'custom'} colorScheme - Template color palette
 *   - **Required**: Yes
 *   - **Valid Values**: 'monochrome', 'blue', 'green', 'purple', 'red', 'orange', 'custom'
 *   - **Purpose**: Determines colors in mini preview and downloaded HTML
 *   - **Color Mappings** (see TemplateCard.tsx getColorPalette()):
 *     * blue: Primary #2563eb, Accent #3b82f6, Light #dbeafe
 *     * green: Primary #059669, Accent #10b981, Light #d1fae5
 *     * purple: Primary #7c3aed, Accent #8b5cf6, Light #ede9fe
 *     * red: Primary #dc2626, Accent #ef4444, Light #fee2e2
 *     * orange: Primary #ea580c, Accent #f97316, Light #fed7aa
 *     * monochrome: Primary #1f2937, Accent #374151, Light #f3f4f6
 *     * custom: Gradient purple to pink
 *   - **Example**: 'blue'
 *
 * @property {boolean} isPremium - Whether template requires premium subscription
 *   - **Required**: Yes
 *   - **Format**: Boolean true/false
 *   - **Purpose**: Used for filtering and access control (not currently enforced)
 *   - **Note**: Premium gating not implemented yet (Issue #4)
 *   - **Example**: false (free) or true (premium)
 *
 * @property {number} rating - User rating of the template
 *   - **Required**: Yes
 *   - **Format**: Decimal number
 *   - **Constraints**: 0.0 to 5.0, typically 1 decimal place
 *   - **Purpose**: Used for sorting and display
 *   - **Example**: 4.8, 4.5, 5.0
 *
 * @property {number} downloads - Number of times template has been downloaded
 *   - **Required**: Yes
 *   - **Format**: Integer
 *   - **Constraints**: >= 0
 *   - **Purpose**: Used for 'popular' sorting and social proof
 *   - **Example**: 15420, 12340, 8950
 *
 * @property {string} createdAt - Template creation date
 *   - **Required**: Yes
 *   - **Format**: ISO date string 'YYYY-MM-DD'
 *   - **Constraints**: Valid date, not in future
 *   - **Purpose**: Used for 'newest' sorting
 *   - **Example**: '2024-01-15', '2024-02-20'
 *
 * @property {string} updatedAt - Last template update date
 *   - **Required**: Yes
 *   - **Format**: ISO date string 'YYYY-MM-DD'
 *   - **Constraints**: Valid date, >= createdAt
 *   - **Purpose**: Track template modifications
 *   - **Example**: '2024-01-20', '2024-03-15'
 *
 * @property {string} author - Template creator/author name
 *   - **Required**: Yes
 *   - **Format**: String, typically 'RoleReady Team' for official templates
 *   - **Constraints**: 2-50 characters
 *   - **Example**: 'RoleReady Team', 'Community Contributor'
 *
 * @property {string[]} tags - Searchable tags for the template
 *   - **Required**: Yes
 *   - **Format**: Array of lowercase strings
 *   - **Constraints**: 3-10 tags, each 2-20 characters, lowercase, no spaces
 *   - **Purpose**: Enhanced search functionality
 *   - **Example**: ['ats', 'corporate', 'professional', 'clean']
 *
 * @example
 * ```typescript
 * const template: ResumeTemplate = {
 *   id: 'ats-classic',
 *   name: 'ATS Classic',
 *   category: 'ats',
 *   description: 'Clean, ATS-optimized template perfect for corporate environments',
 *   preview: '/templates/ats-classic-preview.png',
 *   features: ['ATS Optimized', 'Clean Layout', 'Professional', 'Easy to Read'],
 *   difficulty: 'beginner',
 *   industry: ['Professional Services', 'Finance', 'Healthcare', 'Education'],
 *   layout: 'single-column',
 *   colorScheme: 'monochrome',
 *   isPremium: false,
 *   rating: 4.8,
 *   downloads: 15420,
 *   createdAt: '2024-01-15',
 *   updatedAt: '2024-01-20',
 *   author: 'RoleReady Team',
 *   tags: ['ats', 'corporate', 'professional', 'clean']
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Creative template example
 * const creativeTemplate: ResumeTemplate = {
 *   id: 'creative-portfolio',
 *   name: 'Creative Portfolio',
 *   category: 'creative',
 *   description: 'Bold, visual design for creative professionals',
 *   preview: '/templates/creative-portfolio-preview.png',
 *   features: ['Visual Impact', 'Portfolio Showcase', 'Modern Design', 'Unique Layout'],
 *   difficulty: 'advanced',
 *   industry: ['Design', 'Marketing', 'Media', 'Arts'],
 *   layout: 'two-column',
 *   colorScheme: 'purple',
 *   isPremium: true,
 *   rating: 4.9,
 *   downloads: 8950,
 *   createdAt: '2024-02-10',
 *   updatedAt: '2024-02-15',
 *   author: 'RoleReady Team',
 *   tags: ['creative', 'portfolio', 'design', 'visual', 'modern']
 * };
 * ```
 *
 * @remarks
 * **Validation Guidelines:**
 * - All required fields must be present
 * - IDs must be unique across the entire resumeTemplates array
 * - Categories must match ResumeCategory type
 * - Industries must match Industry type from categories.ts
 * - Difficulty must be one of three valid values
 * - Layout must be one of three valid values
 * - Color scheme must be one of seven valid values
 * - Rating must be 0-5 (typically 1 decimal place)
 * - Downloads must be non-negative integer
 * - Dates must be valid ISO date strings
 * - Tags should be lowercase for consistency
 *
 * **Usage Notes:**
 * - The preview field exists but is not currently used (CSS previews used instead)
 * - Premium gating (isPremium) is not enforced yet (see Issue #4)
 * - Templates are stored in resumeTemplates array (hardcoded, no database yet)
 * - Template data is used for filtering, sorting, search, and display
 * - Color scheme affects both mini preview cards and downloaded HTML
 */
export interface ResumeTemplate {
  id: string;
  name: string;
  category: ResumeCategory;
  description: string;
  preview: string; // Base64 or URL to preview image
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  industry: Industry[]; // Validated industry list (was string[])
  layout: 'single-column' | 'two-column' | 'hybrid';
  colorScheme: 'monochrome' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'custom';
  isPremium: boolean;
  rating: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
}

export const resumeTemplates: ResumeTemplate[] = [
  // ATS-Friendly Templates
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    category: 'ats',
    description: 'Clean, ATS-optimized template perfect for corporate environments',
    preview: '/templates/ats-classic-preview.png',
    features: ['ATS Optimized', 'Clean Layout', 'Professional', 'Easy to Read'],
    difficulty: 'beginner',
    industry: ['Professional Services', 'Finance', 'Healthcare', 'Education'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: false,
    rating: 4.8,
    downloads: 15420,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
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
    createdAt: '2024-01-18',
    updatedAt: '2024-01-25',
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
    createdAt: '2024-01-20',
    updatedAt: '2024-01-28',
    author: 'RoleReady Team',
    tags: ['ats', 'executive', 'management', 'sophisticated']
  },

  // Creative Templates
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
    createdAt: '2024-01-22',
    updatedAt: '2024-01-30',
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
    createdAt: '2024-01-25',
    updatedAt: '2024-02-01',
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
    createdAt: '2024-01-28',
    updatedAt: '2024-02-05',
    author: 'RoleReady Team',
    tags: ['creative', 'bold', 'advertising', 'marketing']
  },

  // Modern Templates
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
    createdAt: '2024-02-01',
    updatedAt: '2024-02-08',
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
    createdAt: '2024-02-03',
    updatedAt: '2024-02-10',
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
    createdAt: '2024-02-05',
    updatedAt: '2024-02-12',
    author: 'RoleReady Team',
    tags: ['modern', 'executive', 'leadership', 'sophisticated']
  },

  // Classic Templates
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
    createdAt: '2024-02-08',
    updatedAt: '2024-02-15',
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
    createdAt: '2024-02-10',
    updatedAt: '2024-02-18',
    author: 'RoleReady Team',
    tags: ['classic', 'elegant', 'refined', 'sophisticated']
  },

  // Executive Templates
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    category: 'executive',
    description: 'Premium executive template with luxury design elements',
    preview: '/templates/executive-premium-preview.png',
    features: ['Premium Design', 'Luxury Elements', 'Executive Level', 'High Impact'],
    difficulty: 'advanced',
    industry: ['Executive', 'C-Suite', 'Senior Management'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.9,
    downloads: 6800,
    createdAt: '2024-02-12',
    updatedAt: '2024-02-20',
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
    createdAt: '2024-02-15',
    updatedAt: '2024-02-22',
    author: 'RoleReady Team',
    tags: ['executive', 'modern', 'leadership', 'contemporary']
  },

  // Minimal Templates
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
    createdAt: '2024-02-18',
    updatedAt: '2024-02-25',
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
    createdAt: '2024-02-20',
    updatedAt: '2024-02-28',
    author: 'RoleReady Team',
    tags: ['minimal', 'elegant', 'sophisticated', 'refined']
  },

  // Academic Templates
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
    createdAt: '2024-02-22',
    updatedAt: '2024-03-01',
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
    createdAt: '2024-02-25',
    updatedAt: '2024-03-03',
    author: 'RoleReady Team',
    tags: ['academic', 'modern', 'research', 'contemporary']
  },

  // Technical Templates
  {
    id: 'technical-engineer',
    name: 'Technical Engineer',
    category: 'technical',
    description: 'Technical template designed for engineers and developers',
    preview: '/templates/technical-engineer-preview.png',
    features: ['Technical Focus', 'Skills-heavy', 'Project-oriented', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Engineering', 'Software', 'Technology', 'Software'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.7,
    downloads: 14500,
    createdAt: '2024-02-28',
    updatedAt: '2024-03-05',
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
    createdAt: '2024-03-01',
    updatedAt: '2024-03-08',
    author: 'RoleReady Team',
    tags: ['technical', 'data', 'analytics', 'science']
  },

  // Startup Templates
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
    createdAt: '2024-03-03',
    updatedAt: '2024-03-10',
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
    createdAt: '2024-03-05',
    updatedAt: '2024-03-12',
    author: 'RoleReady Team',
    tags: ['startup', 'tech', 'innovation', 'modern']
  },

  // Freelance Templates
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
    createdAt: '2024-03-08',
    updatedAt: '2024-03-15',
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
    industry: ['Freelance', 'Consulting', 'Professional Services', 'Consulting'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.6,
    downloads: 8400,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-18',
    author: 'RoleReady Team',
    tags: ['freelance', 'professional', 'consulting', 'expert']
  },

  // Additional Premium Templates
  {
    id: 'premium-luxury',
    name: 'Premium Luxury',
    category: 'executive',
    description: 'Ultra-premium luxury template for high-level executives',
    preview: '/templates/premium-luxury-preview.png',
    features: ['Ultra-premium', 'Luxury Design', 'Executive Level', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Executive', 'C-Suite', 'Senior Management'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 5.0,
    downloads: 4200,
    createdAt: '2024-03-12',
    updatedAt: '2024-03-20',
    author: 'RoleReady Team',
    tags: ['premium', 'luxury', 'executive', 'exclusive']
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
    createdAt: '2024-03-15',
    updatedAt: '2024-03-22',
    author: 'RoleReady Team',
    tags: ['premium', 'creative', 'advanced', 'exclusive']
  },

  // Industry-Specific Templates
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
    createdAt: '2024-03-18',
    updatedAt: '2024-03-25',
    author: 'RoleReady Team',
    tags: ['healthcare', 'medical', 'ats', 'professional']
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
    createdAt: '2024-03-20',
    updatedAt: '2024-03-28',
    author: 'RoleReady Team',
    tags: ['finance', 'executive', 'banking', 'investment']
  },
  {
    id: 'education-teacher',
    name: 'Education Teacher',
    category: 'ats',
    description: 'Education-focused template for teachers and educators',
    preview: '/templates/education-teacher-preview.png',
    features: ['Education-focused', 'Teaching Sections', 'ATS Optimized', 'Professional'],
    difficulty: 'beginner',
    industry: ['Education', 'Teaching', 'Academia', 'Training'],
    layout: 'single-column',
    colorScheme: 'green',
    isPremium: false,
    rating: 4.5,
    downloads: 10800,
    createdAt: '2024-03-22',
    updatedAt: '2024-03-30',
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
    industry: ['Marketing', 'Advertising', 'Digital Marketing', 'Brand Management'],
    layout: 'two-column',
    colorScheme: 'purple',
    isPremium: false,
    rating: 4.7,
    downloads: 12400,
    createdAt: '2024-03-25',
    updatedAt: '2024-04-01',
    author: 'RoleReady Team',
    tags: ['marketing', 'advertising', 'digital', 'campaigns']
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
    createdAt: '2024-03-28',
    updatedAt: '2024-04-03',
    author: 'RoleReady Team',
    tags: ['sales', 'executive', 'performance', 'business']
  },

  // Additional Creative Templates
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
    createdAt: '2024-03-30',
    updatedAt: '2024-04-05',
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
    createdAt: '2024-04-01',
    updatedAt: '2024-04-08',
    author: 'RoleReady Team',
    tags: ['creative', 'writer', 'publications', 'content']
  },

  // Additional Technical Templates
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
    createdAt: '2024-04-03',
    updatedAt: '2024-04-10',
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
    createdAt: '2024-04-05',
    updatedAt: '2024-04-12',
    author: 'RoleReady Team',
    tags: ['technical', 'cybersecurity', 'security', 'certifications']
  },

  // Additional Modern Templates
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
    createdAt: '2024-04-08',
    updatedAt: '2024-04-15',
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
    industry: ['UX Design', 'Product Design', 'User Experience', 'Design'],
    layout: 'hybrid',
    colorScheme: 'purple',
    isPremium: true,
    rating: 4.8,
    downloads: 11200,
    createdAt: '2024-04-10',
    updatedAt: '2024-04-18',
    author: 'RoleReady Team',
    tags: ['modern', 'ux', 'ui', 'design']
  },

  // Additional Classic Templates
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
    createdAt: '2024-04-12',
    updatedAt: '2024-04-20',
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
    createdAt: '2024-04-15',
    updatedAt: '2024-04-22',
    author: 'RoleReady Team',
    tags: ['classic', 'government', 'public', 'formal']
  },

  // Additional Minimal Templates
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
    createdAt: '2024-04-18',
    updatedAt: '2024-04-25',
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
    industry: ['Consulting', 'Professional Services', 'Advisory', 'Consulting'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.7,
    downloads: 6800,
    createdAt: '2024-04-20',
    updatedAt: '2024-04-28',
    author: 'RoleReady Team',
    tags: ['minimal', 'consultant', 'professional', 'clean']
  },

  // Additional Academic Templates
  {
    id: 'academic-phd',
    name: 'Academic PhD',
    category: 'academic',
    description: 'PhD-level academic template with extensive research sections',
    preview: '/templates/academic-phd-preview.png',
    features: ['PhD-level', 'Research-heavy', 'Publications', 'Academia'],
    difficulty: 'advanced',
    industry: ['Academia', 'Research', 'Research', 'Higher Education'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.8,
    downloads: 4800,
    createdAt: '2024-04-22',
    updatedAt: '2024-04-30',
    author: 'RoleReady Team',
    tags: ['academic', 'phd', 'research', 'publications']
  },
  {
    id: 'academic-student',
    name: 'Academic Student',
    category: 'academic',
    description: 'Student-focused academic template with education emphasis',
    preview: '/templates/academic-student-preview.png',
    features: ['Student-focused', 'Education Emphasis', 'Academia', 'Professional'],
    difficulty: 'beginner',
    industry: ['Student', 'Education', 'Academia', 'Graduate'],
    layout: 'single-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.4,
    downloads: 13600,
    createdAt: '2024-04-25',
    updatedAt: '2024-05-02',
    author: 'RoleReady Team',
    tags: ['academic', 'student', 'education', 'graduate']
  },

  // Additional Freelance Templates
  {
    id: 'freelance-tech',
    name: 'Freelance Tech',
    category: 'freelance',
    description: 'Tech freelance template with project showcase and skills',
    preview: '/templates/freelance-tech-preview.png',
    features: ['Tech Freelance', 'Project Showcase', 'Skills Display', 'Professional'],
    difficulty: 'intermediate',
    industry: ['Freelance', 'Technology', 'Software', 'Software'],
    layout: 'two-column',
    colorScheme: 'blue',
    isPremium: false,
    rating: 4.6,
    downloads: 9200,
    createdAt: '2024-04-28',
    updatedAt: '2024-05-05',
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
    industry: ['Freelance', 'Marketing', 'Digital Marketing', 'Advertising'],
    layout: 'two-column',
    colorScheme: 'purple',
    isPremium: true,
    rating: 4.7,
    downloads: 7600,
    createdAt: '2024-04-30',
    updatedAt: '2024-05-08',
    author: 'RoleReady Team',
    tags: ['freelance', 'marketing', 'campaigns', 'results']
  },

  // Additional Startup Templates
  {
    id: 'startup-nonprofit',
    name: 'Startup Nonprofit',
    category: 'startup',
    description: 'Nonprofit startup template with mission and impact focus',
    preview: '/templates/startup-nonprofit-preview.png',
    features: ['Nonprofit-focused', 'Social Impact', 'Impact Sections', 'Startup'],
    difficulty: 'intermediate',
    industry: ['Nonprofit', 'Social Impact', 'Startup', 'Social Impact'],
    layout: 'hybrid',
    colorScheme: 'green',
    isPremium: false,
    rating: 4.5,
    downloads: 6400,
    createdAt: '2024-05-02',
    updatedAt: '2024-05-10',
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
    createdAt: '2024-05-05',
    updatedAt: '2024-05-12',
    author: 'RoleReady Team',
    tags: ['startup', 'social', 'community', 'impact']
  },

  // Final Premium Templates
  {
    id: 'premium-executive',
    name: 'Premium Executive',
    category: 'executive',
    description: 'Ultimate premium executive template with luxury design',
    preview: '/templates/premium-executive-preview.png',
    features: ['Ultimate Premium', 'Luxury Design', 'Executive Level', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Executive', 'C-Suite', 'Senior Management'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 5.0,
    downloads: 3200,
    createdAt: '2024-05-08',
    updatedAt: '2024-05-15',
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
    createdAt: '2024-05-10',
    updatedAt: '2024-05-18',
    author: 'RoleReady Team',
    tags: ['premium', 'creative', 'pro', 'exclusive']
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
    createdAt: '2024-05-12',
    updatedAt: '2024-05-20',
    author: 'RoleReady Team',
    tags: ['premium', 'tech', 'leadership', 'exclusive']
  },
  {
    id: 'premium-startup-ceo',
    name: 'Premium Startup CEO',
    category: 'startup',
    description: 'Ultimate startup CEO template with entrepreneurial focus',
    preview: '/templates/premium-startup-ceo-preview.png',
    features: ['Startup CEO', 'Entrepreneurial', 'Premium Design', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Startup', 'Executive', 'Entrepreneurship', 'Leadership'],
    layout: 'hybrid',
    colorScheme: 'orange',
    isPremium: true,
    rating: 4.9,
    downloads: 4200,
    createdAt: '2024-05-15',
    updatedAt: '2024-05-22',
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
    industry: ['Academia', 'Higher Education', 'Research', 'Higher Education'],
    layout: 'single-column',
    colorScheme: 'monochrome',
    isPremium: true,
    rating: 4.8,
    downloads: 3600,
    createdAt: '2024-05-18',
    updatedAt: '2024-05-25',
    author: 'RoleReady Team',
    tags: ['premium', 'academic', 'professor', 'research']
  },
  {
    id: 'premium-freelance-expert',
    name: 'Premium Freelance Expert',
    category: 'freelance',
    description: 'Premium freelance expert template with expertise showcase',
    preview: '/templates/premium-freelance-expert-preview.png',
    features: ['Freelance Expert', 'Expertise Showcase', 'Premium Design', 'Exclusive'],
    difficulty: 'advanced',
    industry: ['Freelance', 'Consulting', 'Consulting', 'Professional Services'],
    layout: 'hybrid',
    colorScheme: 'custom',
    isPremium: true,
    rating: 4.7,
    downloads: 4400,
    createdAt: '2024-05-20',
    updatedAt: '2024-05-28',
    author: 'RoleReady Team',
    tags: ['premium', 'freelance', 'expert', 'consulting']
  }
];

/**
 * Get template categories with dynamic counts
 * Uses centralized category definitions from categories.ts
 */
export const templateCategories: ResumeCategoryInfo[] = RESUME_CATEGORY_INFO.map(categoryInfo => ({
  ...categoryInfo,
  count: resumeTemplates.filter(t => t.category === categoryInfo.id).length,
}));

export const getTemplatesByCategory = (category: string) => {
  return resumeTemplates.filter(template => template.category === category);
};

export const getTemplatesByIndustry = (industry: string) => {
  return resumeTemplates.filter(template => 
    template.industry.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
  );
};

export const getPremiumTemplates = () => {
  return resumeTemplates.filter(template => template.isPremium);
};

export const getFreeTemplates = () => {
  return resumeTemplates.filter(template => !template.isPremium);
};

export const getTemplatesByDifficulty = (difficulty: string) => {
  return resumeTemplates.filter(template => template.difficulty === difficulty);
};

export const searchTemplates = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return resumeTemplates.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.industry.some(ind => ind.toLowerCase().includes(lowercaseQuery))
  );
};

// Validate all templates on module load (development only)
if (process.env.NODE_ENV === 'development') {
  import('../utils/templateValidator').then(({ validateAndFilterTemplates }) => {
    const validCount = validateAndFilterTemplates(resumeTemplates).length;
    if (validCount !== resumeTemplates.length) {
      console.warn(`⚠️ Template validation: ${resumeTemplates.length - validCount} templates failed validation`);
    } else {
      console.log(`✅ All ${resumeTemplates.length} templates validated successfully`);
    }
  }).catch(err => {
    console.error('Failed to load template validator:', err);
  });
}
