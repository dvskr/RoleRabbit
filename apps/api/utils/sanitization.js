/**
 * Input Sanitization Utility
 * 
 * Sanitizes user input to prevent XSS, injection attacks, and other security issues.
 * Uses DOMPurify for HTML sanitization.
 */

const createDOMPurify = require('isomorphic-dompurify');
const DOMPurify = createDOMPurify();

/**
 * Sanitization Configuration
 */
const SANITIZE_CONFIG = {
  // Allowed tags for rich text (summary, bullets)
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span',
    'ul', 'ol', 'li', 'a'
  ],
  
  // Allowed attributes
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  
  // Forbidden tags (always strip)
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed', 'form',
    'input', 'button', 'textarea', 'select', 'style',
    'link', 'meta', 'base'
  ],
  
  // Forbidden attributes
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'onmouseover',
    'onfocus', 'onblur', 'onchange', 'onsubmit'
  ]
};

/**
 * Sanitize HTML content
 * Removes dangerous tags and attributes
 */
function sanitizeHTML(input, options = {}) {
  if (!input || typeof input !== 'string') {
    return input;
  }

  const config = {
    ALLOWED_TAGS: options.allowedTags || SANITIZE_CONFIG.ALLOWED_TAGS,
    ALLOWED_ATTR: options.allowedAttr || SANITIZE_CONFIG.ALLOWED_ATTR,
    FORBID_TAGS: SANITIZE_CONFIG.FORBID_TAGS,
    FORBID_ATTR: SANITIZE_CONFIG.FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true
  };

  return DOMPurify.sanitize(input, config);
}

/**
 * Sanitize plain text (no HTML allowed)
 * Strips all HTML tags
 */
function sanitizePlainText(input) {
  if (!input || typeof input !== 'string') {
    return input;
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

/**
 * Sanitize URL
 * Ensures URL is safe and uses allowed protocols
 */
function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Remove whitespace
  url = url.trim();

  // Check for allowed protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  try {
    const parsed = new URL(url);
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`Blocked URL with disallowed protocol: ${parsed.protocol}`);
      return '';
    }
    return url;
  } catch (error) {
    // Invalid URL
    console.warn('Invalid URL:', url);
    return '';
  }
}

/**
 * Sanitize email address
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return email;
  }

  email = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }

  return email;
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except +, -, (, ), and spaces
 */
function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  // Allow only digits, +, -, (, ), and spaces
  return phone.replace(/[^0-9+\-() ]/g, '').trim();
}

/**
 * Sanitize resume data
 * Applies appropriate sanitization to all fields
 */
function sanitizeResumeData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };

  // Sanitize contact information
  if (sanitized.contact) {
    sanitized.contact = {
      ...sanitized.contact,
      name: sanitizePlainText(sanitized.contact.name),
      title: sanitizePlainText(sanitized.contact.title),
      email: sanitizeEmail(sanitized.contact.email),
      phone: sanitizePhone(sanitized.contact.phone),
      location: sanitizePlainText(sanitized.contact.location),
      linkedin: sanitizeURL(sanitized.contact.linkedin),
      github: sanitizeURL(sanitized.contact.github),
      website: sanitizeURL(sanitized.contact.website)
    };

    // Sanitize links array
    if (Array.isArray(sanitized.contact.links)) {
      sanitized.contact.links = sanitized.contact.links.map(link => ({
        type: sanitizePlainText(link.type),
        url: sanitizeURL(link.url),
        label: sanitizePlainText(link.label)
      }));
    }
  }

  // Sanitize summary (allow basic HTML)
  if (sanitized.summary) {
    sanitized.summary = sanitizeHTML(sanitized.summary);
  }

  // Sanitize experience
  if (Array.isArray(sanitized.experience)) {
    sanitized.experience = sanitized.experience.map(exp => ({
      ...exp,
      company: sanitizePlainText(exp.company),
      role: sanitizePlainText(exp.role),
      location: sanitizePlainText(exp.location),
      environment: sanitizePlainText(exp.environment),
      bullets: Array.isArray(exp.bullets)
        ? exp.bullets.map(bullet => sanitizeHTML(bullet))
        : []
    }));
  }

  // Sanitize education
  if (Array.isArray(sanitized.education)) {
    sanitized.education = sanitized.education.map(edu => ({
      ...edu,
      institution: sanitizePlainText(edu.institution),
      degree: sanitizePlainText(edu.degree),
      field: sanitizePlainText(edu.field),
      gpa: sanitizePlainText(edu.gpa),
      honors: Array.isArray(edu.honors)
        ? edu.honors.map(honor => sanitizePlainText(honor))
        : []
    }));
  }

  // Sanitize projects
  if (Array.isArray(sanitized.projects)) {
    sanitized.projects = sanitized.projects.map(proj => ({
      ...proj,
      name: sanitizePlainText(proj.name),
      summary: sanitizeHTML(proj.summary),
      link: sanitizeURL(proj.link),
      bullets: Array.isArray(proj.bullets)
        ? proj.bullets.map(bullet => sanitizeHTML(bullet))
        : [],
      technologies: Array.isArray(proj.technologies)
        ? proj.technologies.map(tech => sanitizePlainText(tech))
        : []
    }));
  }

  // Sanitize certifications
  if (Array.isArray(sanitized.certifications)) {
    sanitized.certifications = sanitized.certifications.map(cert => ({
      ...cert,
      name: sanitizePlainText(cert.name),
      issuer: sanitizePlainText(cert.issuer),
      link: sanitizeURL(cert.link),
      skills: Array.isArray(cert.skills)
        ? cert.skills.map(skill => sanitizePlainText(skill))
        : []
    }));
  }

  // Sanitize skills
  if (sanitized.skills) {
    sanitized.skills = {
      technical: Array.isArray(sanitized.skills.technical)
        ? sanitized.skills.technical.map(skill => sanitizePlainText(skill))
        : [],
      tools: Array.isArray(sanitized.skills.tools)
        ? sanitized.skills.tools.map(tool => sanitizePlainText(tool))
        : [],
      soft: Array.isArray(sanitized.skills.soft)
        ? sanitized.skills.soft.map(skill => sanitizePlainText(skill))
        : [],
      languages: Array.isArray(sanitized.skills.languages)
        ? sanitized.skills.languages.map(lang => sanitizePlainText(lang))
        : []
    };
  }

  // Sanitize custom sections
  if (Array.isArray(sanitized.customSections)) {
    sanitized.customSections = sanitized.customSections.map(section => ({
      ...section,
      name: sanitizePlainText(section.name),
      content: sanitizeHTML(section.content)
    }));
  }

  return sanitized;
}

/**
 * Sanitization middleware
 * Automatically sanitizes request body
 */
function sanitizationMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    // Sanitize resume data if present
    if (req.body.data) {
      req.body.data = sanitizeResumeData(req.body.data);
    }

    // Sanitize name field
    if (req.body.name) {
      req.body.name = sanitizePlainText(req.body.name);
    }

    // Sanitize job description
    if (req.body.jobDescription) {
      req.body.jobDescription = sanitizeHTML(req.body.jobDescription);
    }
  }

  next();
}

/**
 * Check for suspicious patterns
 * Returns true if input contains suspicious content
 */
function hasSuspiciousContent(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,  // Event handlers
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
    /vbscript:/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Log suspicious input attempts
 */
function logSuspiciousInput(userId, input, context) {
  console.warn('⚠️  SUSPICIOUS INPUT DETECTED', {
    userId,
    context,
    inputLength: input.length,
    timestamp: new Date().toISOString(),
    preview: input.substring(0, 100)
  });
  
  // TODO: Store in audit log table
}

module.exports = {
  sanitizeHTML,
  sanitizePlainText,
  sanitizeURL,
  sanitizeEmail,
  sanitizePhone,
  sanitizeResumeData,
  sanitizationMiddleware,
  hasSuspiciousContent,
  logSuspiciousInput
};

