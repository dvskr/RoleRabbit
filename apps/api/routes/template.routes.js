/**
 * Resume Template Routes
 * 
 * Handles resume template operations
 */

const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const { prisma } = require('../utils/db');

// Hardcoded templates (will be moved to database later)
const BUILTIN_TEMPLATES = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    category: 'professional',
    description: 'Clean and modern design perfect for tech and corporate roles',
    isPremium: false,
    colorScheme: 'blue',
    preview: '/templates/modern-professional.png',
    features: ['ATS-friendly', 'Single column', 'Bold headers'],
    tags: ['modern', 'professional', 'ats']
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    category: 'traditional',
    description: 'Timeless design suitable for traditional industries',
    isPremium: false,
    colorScheme: 'black',
    preview: '/templates/classic-elegant.png',
    features: ['Traditional layout', 'Serif fonts', 'Conservative'],
    tags: ['classic', 'elegant', 'traditional']
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    category: 'creative',
    description: 'Stand out with this creative and colorful design',
    isPremium: true,
    colorScheme: 'purple',
    preview: '/templates/creative-bold.png',
    features: ['Two-column', 'Colorful', 'Creative'],
    tags: ['creative', 'bold', 'colorful']
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    category: 'minimalist',
    description: 'Less is more with this ultra-clean design',
    isPremium: false,
    colorScheme: 'gray',
    preview: '/templates/minimalist-clean.png',
    features: ['Minimal design', 'Lots of whitespace', 'Easy to read'],
    tags: ['minimalist', 'clean', 'simple']
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    category: 'executive',
    description: 'Premium design for senior-level positions',
    isPremium: true,
    colorScheme: 'navy',
    preview: '/templates/executive-premium.png',
    features: ['Executive style', 'Professional', 'Premium'],
    tags: ['executive', 'premium', 'senior']
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    category: 'tech',
    description: 'Perfect for software engineers and tech professionals',
    isPremium: false,
    colorScheme: 'teal',
    preview: '/templates/tech-modern.png',
    features: ['Tech-focused', 'Modern', 'Code-friendly'],
    tags: ['tech', 'software', 'engineering']
  },
  {
    id: 'ats-optimized',
    name: 'ATS Optimized',
    category: 'ats',
    description: 'Maximum ATS compatibility with proven format',
    isPremium: false,
    colorScheme: 'blue',
    preview: '/templates/ats-optimized.png',
    features: ['ATS-optimized', 'Simple format', 'High pass rate'],
    tags: ['ats', 'optimized', 'simple']
  },
  {
    id: 'two-column-pro',
    name: 'Two Column Pro',
    category: 'professional',
    description: 'Professional two-column layout for maximum content',
    isPremium: true,
    colorScheme: 'blue',
    preview: '/templates/two-column-pro.png',
    features: ['Two columns', 'Space efficient', 'Professional'],
    tags: ['two-column', 'professional', 'efficient']
  }
];

module.exports = async function templateRoutes(fastify) {
  /**
   * Get all resume templates
   * GET /api/resume-templates
   */
  fastify.get('/api/resume-templates', async (request, reply) => {
    try {
      const { 
        category, 
        isPremium, 
        search,
        limit = 50,
        offset = 0
      } = request.query;
      
      logger.info('📋 Fetching resume templates', { category, isPremium, search });
      
      // Try to get templates from database first
      let dbTemplates = [];
      try {
        const where = {};
        if (category) where.category = category;
        if (isPremium !== undefined) where.isPremium = isPremium === 'true';
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search.toLowerCase() } }
          ];
        }
        
        dbTemplates = await prisma.resumeTemplate.findMany({
          where,
          take: parseInt(limit),
          skip: parseInt(offset),
          orderBy: [
            { isPremium: 'asc' }, // Free first
            { name: 'asc' }
          ]
        });
      } catch (error) {
        if (error.code === 'P2021' || error.message?.includes('resumeTemplate')) {
          logger.info('ResumeTemplate table does not exist yet, using built-in templates');
        } else {
          throw error;
        }
      }
      
      // Use database templates if available, otherwise use built-in
      let templates = dbTemplates.length > 0 ? dbTemplates : BUILTIN_TEMPLATES;
      
      // Apply filters to built-in templates if no database
      if (dbTemplates.length === 0) {
        if (category) {
          templates = templates.filter(t => t.category === category);
        }
        if (isPremium !== undefined) {
          const premiumFilter = isPremium === 'true';
          templates = templates.filter(t => t.isPremium === premiumFilter);
        }
        if (search) {
          const searchLower = search.toLowerCase();
          templates = templates.filter(t => 
            t.name.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower) ||
            t.tags.some(tag => tag.includes(searchLower))
          );
        }
        
        // Apply pagination
        const start = parseInt(offset);
        const end = start + parseInt(limit);
        templates = templates.slice(start, end);
      }
      
      // Format response
      const formattedTemplates = templates.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        isPremium: t.isPremium,
        colorScheme: t.colorScheme,
        preview: t.preview,
        features: t.features || [],
        tags: t.tags || [],
        createdAt: t.createdAt?.toISOString() || null,
        updatedAt: t.updatedAt?.toISOString() || null
      }));
      
      logger.info('✅ Resume templates fetched', {
        count: formattedTemplates.length,
        source: dbTemplates.length > 0 ? 'database' : 'built-in'
      });
      
      return reply.send({
        success: true,
        templates: formattedTemplates,
        count: formattedTemplates.length,
        source: dbTemplates.length > 0 ? 'database' : 'built-in',
        categories: ['professional', 'traditional', 'creative', 'minimalist', 'executive', 'tech', 'ats']
      });
      
    } catch (error) {
      logger.error('❌ Failed to fetch resume templates', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch resume templates'
      });
    }
  });

  /**
   * Get single template by ID
   * GET /api/resume-templates/:id
   */
  fastify.get('/api/resume-templates/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      logger.info('📄 Fetching template', { id });
      
      // Try database first
      let template = null;
      try {
        template = await prisma.resumeTemplate.findUnique({
          where: { id }
        });
      } catch (error) {
        if (error.code !== 'P2021' && !error.message?.includes('resumeTemplate')) {
          throw error;
        }
      }
      
      // Fall back to built-in
      if (!template) {
        template = BUILTIN_TEMPLATES.find(t => t.id === id);
      }
      
      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Template not found'
        });
      }
      
      const formattedTemplate = {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        isPremium: template.isPremium,
        colorScheme: template.colorScheme,
        preview: template.preview,
        features: template.features || [],
        tags: template.tags || [],
        createdAt: template.createdAt?.toISOString() || null,
        updatedAt: template.updatedAt?.toISOString() || null
      };
      
      logger.info('✅ Template fetched', { id, name: template.name });
      
      return reply.send({
        success: true,
        template: formattedTemplate
      });
      
    } catch (error) {
      logger.error('❌ Failed to fetch template', {
        error: error.message,
        stack: error.stack
      });
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch template'
      });
    }
  });

  /**
   * Create custom template (admin only)
   * POST /api/resume-templates
   */
  fastify.post('/api/resume-templates', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const {
        name,
        category,
        description,
        isPremium = false,
        colorScheme,
        preview,
        features = [],
        tags = []
      } = request.body;
      
      logger.info('➕ Creating template', { userId, name });
      
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      if (user?.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          error: 'Only administrators can create templates'
        });
      }
      
      // Validate required fields
      if (!name || !category || !description) {
        return reply.status(400).send({
          success: false,
          error: 'Missing required fields: name, category, description'
        });
      }
      
      // Create template
      const template = await prisma.resumeTemplate.create({
        data: {
          name,
          category,
          description,
          isPremium,
          colorScheme: colorScheme || 'blue',
          preview: preview || '/templates/default.png',
          features,
          tags
        }
      });
      
      logger.info('✅ Template created', { templateId: template.id, name });
      
      return reply.status(201).send({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
          description: template.description,
          isPremium: template.isPremium,
          colorScheme: template.colorScheme,
          preview: template.preview,
          features: template.features,
          tags: template.tags,
          createdAt: template.createdAt.toISOString()
        },
        message: 'Template created successfully'
      });
      
    } catch (error) {
      logger.error('❌ Failed to create template', {
        error: error.message,
        stack: error.stack
      });
      
      if (error.code === 'P2021' || error.message?.includes('resumeTemplate')) {
        return reply.status(501).send({
          success: false,
          error: 'Template creation is not yet available. Database table needs to be created.',
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to create template'
      });
    }
  });
};

