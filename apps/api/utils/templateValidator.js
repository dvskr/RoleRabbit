/**
 * Template Validation Utilities
 * Validates template IDs and ensures templates exist
 */

const logger = require('./logger');
const { NotFoundError, ValidationError } = require('./errorHandler');

// ============================================
// HARDCODED TEMPLATES (until moved to database)
// ============================================

const AVAILABLE_TEMPLATES = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    category: 'professional',
    description: 'Clean and modern design perfect for tech and corporate roles',
    isPremium: false,
    colorScheme: 'blue',
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
    features: ['Traditional layout', 'Serif fonts', 'Conservative'],
    tags: ['classic', 'elegant', 'traditional']
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    category: 'minimalist',
    description: 'Less is more with this ultra-clean design',
    isPremium: false,
    colorScheme: 'gray',
    features: ['Minimal design', 'Lots of whitespace', 'Easy to read'],
    tags: ['minimalist', 'clean', 'simple']
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    category: 'tech',
    description: 'Perfect for software engineers and tech professionals',
    isPremium: false,
    colorScheme: 'teal',
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
    features: ['ATS-optimized', 'Simple format', 'High pass rate'],
    tags: ['ats', 'optimized', 'simple']
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    category: 'creative',
    description: 'Stand out with bold colors and unique layout',
    isPremium: true,
    colorScheme: 'purple',
    features: ['Eye-catching', 'Creative layout', 'Color accents'],
    tags: ['creative', 'bold', 'unique']
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    category: 'executive',
    description: 'Premium design for senior-level positions',
    isPremium: true,
    colorScheme: 'navy',
    features: ['Executive style', 'Premium look', 'Leadership focus'],
    tags: ['executive', 'premium', 'senior']
  }
];

const DEFAULT_TEMPLATE_ID = 'modern-professional';

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if template ID exists
 * @param {string} templateId - Template ID to check
 * @returns {boolean} True if template exists
 */
function templateExists(templateId) {
  if (!templateId) return false;
  return AVAILABLE_TEMPLATES.some(t => t.id === templateId);
}

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @returns {Object|null} Template object or null if not found
 */
function getTemplateById(templateId) {
  if (!templateId) return null;
  return AVAILABLE_TEMPLATES.find(t => t.id === templateId) || null;
}

/**
 * Get default template
 * @returns {Object} Default template object
 */
function getDefaultTemplate() {
  return AVAILABLE_TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID);
}

/**
 * Validate template ID and return template or throw error
 * @param {string} templateId - Template ID to validate
 * @param {boolean} allowNull - Whether null/undefined is allowed
 * @returns {Object|null} Template object or null if allowNull is true
 * @throws {NotFoundError} If template not found
 */
function validateTemplateId(templateId, allowNull = true) {
  // Allow null/undefined if specified
  if (!templateId) {
    if (allowNull) {
      return null;
    }
    throw new ValidationError('Template ID is required');
  }

  // Check if template exists
  const template = getTemplateById(templateId);
  if (!template) {
    logger.warn('Invalid template ID requested', { templateId });
    throw new NotFoundError('Template', { templateId });
  }

  return template;
}

/**
 * Validate and sanitize template ID (returns default if invalid)
 * @param {string} templateId - Template ID to validate
 * @returns {string} Valid template ID (or default if invalid)
 */
function sanitizeTemplateId(templateId) {
  if (!templateId || !templateExists(templateId)) {
    logger.info('Invalid or missing template ID, using default', {
      requestedId: templateId,
      defaultId: DEFAULT_TEMPLATE_ID
    });
    return DEFAULT_TEMPLATE_ID;
  }
  return templateId;
}

/**
 * Get all available templates
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {boolean} filters.isPremium - Filter by premium status
 * @param {string[]} filters.tags - Filter by tags (any match)
 * @returns {Array} Array of template objects
 */
function getAllTemplates(filters = {}) {
  let templates = [...AVAILABLE_TEMPLATES];

  // Filter by category
  if (filters.category) {
    templates = templates.filter(t => t.category === filters.category);
  }

  // Filter by premium status
  if (typeof filters.isPremium === 'boolean') {
    templates = templates.filter(t => t.isPremium === filters.isPremium);
  }

  // Filter by tags
  if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
    templates = templates.filter(t => 
      t.tags.some(tag => filters.tags.includes(tag))
    );
  }

  return templates;
}

/**
 * Get template categories
 * @returns {Array} Array of unique categories
 */
function getTemplateCategories() {
  return [...new Set(AVAILABLE_TEMPLATES.map(t => t.category))];
}

/**
 * Check if user has access to template (premium check)
 * @param {string} templateId - Template ID
 * @param {Object} user - User object with plan information
 * @returns {boolean} True if user has access
 */
function userHasAccessToTemplate(templateId, user) {
  const template = getTemplateById(templateId);
  if (!template) return false;

  // Free templates are accessible to everyone
  if (!template.isPremium) return true;

  // Premium templates require premium plan
  return user?.plan === 'premium' || user?.plan === 'enterprise';
}

/**
 * Validate template access for user
 * @param {string} templateId - Template ID
 * @param {Object} user - User object
 * @throws {ForbiddenError} If user doesn't have access
 */
function validateTemplateAccess(templateId, user) {
  const template = validateTemplateId(templateId, false);
  
  if (template.isPremium && !userHasAccessToTemplate(templateId, user)) {
    const { ForbiddenError } = require('./errorHandler');
    throw new ForbiddenError('This template requires a premium plan', {
      templateId,
      templateName: template.name,
      requiredPlan: 'premium',
      currentPlan: user?.plan || 'free'
    });
  }

  return template;
}

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Middleware to validate template ID in request
 * @param {string} paramName - Name of parameter containing template ID (default: 'templateId')
 * @param {boolean} required - Whether template ID is required
 */
function validateTemplateMiddleware(paramName = 'templateId', required = false) {
  return async (request, reply) => {
    const templateId = request.body?.[paramName] || 
                      request.params?.[paramName] || 
                      request.query?.[paramName];

    if (!templateId && !required) {
      // Template ID not provided but not required
      return;
    }

    try {
      const template = validateTemplateId(templateId, !required);
      
      // Attach template to request for use in route handler
      request.template = template;
    } catch (error) {
      // Error will be caught by global error handler
      throw error;
    }
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Constants
  AVAILABLE_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  
  // Validation functions
  templateExists,
  getTemplateById,
  getDefaultTemplate,
  validateTemplateId,
  sanitizeTemplateId,
  getAllTemplates,
  getTemplateCategories,
  userHasAccessToTemplate,
  validateTemplateAccess,
  
  // Middleware
  validateTemplateMiddleware
};



