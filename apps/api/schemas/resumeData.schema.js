/**
 * Resume Data Schema Validation
 * Comprehensive Zod schemas for validating resume data structure
 */

const { z } = require('zod');

// ============================================
// BASIC TYPES
// ============================================

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Date must be in YYYY-MM or YYYY-MM-DD format').nullable();

const URLSchema = z.string().url('Must be a valid URL').max(500).nullable();

const EmailSchema = z.string().email('Must be a valid email').max(254);

const PhoneSchema = z.string().max(20).nullable();

// ============================================
// CONTACT INFORMATION
// ============================================

const ContactLinkSchema = z.object({
  type: z.enum(['linkedin', 'github', 'website', 'portfolio', 'twitter', 'other']),
  url: URLSchema,
  label: z.string().max(50).optional()
});

const ContactInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().max(100).optional(),
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  location: z.string().max(100).optional(),
  links: z.array(ContactLinkSchema).max(10).optional()
});

// ============================================
// EXPERIENCE
// ============================================

const ExperienceItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company name is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  location: z.string().max(100).optional(),
  startDate: DateStringSchema.optional(),
  endDate: DateStringSchema.optional(),
  isCurrent: z.boolean().optional(),
  bullets: z.array(z.string().max(500)).max(20).optional(),
  description: z.string().max(2000).optional(),
  skills: z.array(z.string().max(50)).max(30).optional(),
  customFields: z.array(z.object({
    key: z.string().max(50),
    value: z.string().max(200)
  })).max(5).optional()
}).refine(
  (data) => {
    // If both dates exist, startDate should be before endDate
    if (data.startDate && data.endDate && !data.isCurrent) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'Start date must be before end date' }
);

// ============================================
// EDUCATION
// ============================================

const EducationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required').max(100),
  degree: z.string().max(100).optional(),
  field: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  startDate: DateStringSchema.optional(),
  endDate: DateStringSchema.optional(),
  gpa: z.string().max(20).optional(),
  bullets: z.array(z.string().max(500)).max(10).optional(),
  honors: z.array(z.string().max(100)).max(10).optional(),
  customFields: z.array(z.object({
    key: z.string().max(50),
    value: z.string().max(200)
  })).max(5).optional()
});

// ============================================
// SKILLS
// ============================================

const SkillsSchema = z.object({
  technical: z.array(z.string().max(50)).max(100).optional(),
  tools: z.array(z.string().max(50)).max(100).optional(),
  soft: z.array(z.string().max(50)).max(50).optional(),
  languages: z.array(z.object({
    name: z.string().max(50),
    proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic']).optional()
  })).max(20).optional(),
  categories: z.array(z.object({
    name: z.string().max(50),
    skills: z.array(z.string().max(50)).max(50)
  })).max(10).optional()
});

// ============================================
// PROJECTS
// ============================================

const ProjectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required').max(100),
  title: z.string().max(100).optional(), // Alias for name
  summary: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  url: URLSchema.optional(),
  github: URLSchema.optional(),
  startDate: DateStringSchema.optional(),
  endDate: DateStringSchema.optional(),
  bullets: z.array(z.string().max(500)).max(10).optional(),
  technologies: z.array(z.string().max(50)).max(30).optional(),
  skills: z.array(z.string().max(50)).max(30).optional(), // Alias for technologies
  customFields: z.array(z.object({
    key: z.string().max(50),
    value: z.string().max(200)
  })).max(5).optional()
});

// ============================================
// CERTIFICATIONS
// ============================================

const CertificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required').max(100),
  issuer: z.string().max(100).optional(),
  issueDate: DateStringSchema.optional(),
  expirationDate: DateStringSchema.optional(),
  credentialId: z.string().max(100).optional(),
  url: URLSchema.optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  customFields: z.array(z.object({
    key: z.string().max(50),
    value: z.string().max(200)
  })).max(5).optional()
});

// ============================================
// AWARDS & HONORS
// ============================================

const AwardItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Award title is required').max(100),
  issuer: z.string().max(100).optional(),
  date: DateStringSchema.optional(),
  description: z.string().max(500).optional()
});

// ============================================
// PUBLICATIONS
// ============================================

const PublicationItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Publication title is required').max(200),
  publisher: z.string().max(100).optional(),
  date: DateStringSchema.optional(),
  url: URLSchema.optional(),
  description: z.string().max(500).optional()
});

// ============================================
// VOLUNTEER WORK
// ============================================

const VolunteerItemSchema = z.object({
  id: z.string().optional(),
  organization: z.string().min(1, 'Organization is required').max(100),
  role: z.string().max(100).optional(),
  startDate: DateStringSchema.optional(),
  endDate: DateStringSchema.optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  bullets: z.array(z.string().max(500)).max(10).optional()
});

// ============================================
// CUSTOM SECTIONS
// ============================================

const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required').max(50),
  content: z.string().max(5000).optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    title: z.string().max(100).optional(),
    subtitle: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    bullets: z.array(z.string().max(500)).max(10).optional()
  })).max(20).optional()
});

// ============================================
// MAIN RESUME DATA SCHEMA
// ============================================

const ResumeDataSchema = z.object({
  // Contact Information
  contact: ContactInfoSchema.optional(),
  
  // Professional Summary
  summary: z.string().max(2000).optional(),
  objective: z.string().max(1000).optional(), // Alternative to summary
  
  // Work Experience
  experience: z.array(ExperienceItemSchema).max(50).optional(),
  
  // Education
  education: z.array(EducationItemSchema).max(20).optional(),
  
  // Skills
  skills: SkillsSchema.optional(),
  
  // Projects
  projects: z.array(ProjectItemSchema).max(30).optional(),
  
  // Certifications
  certifications: z.array(CertificationItemSchema).max(30).optional(),
  
  // Awards & Honors
  awards: z.array(AwardItemSchema).max(20).optional(),
  
  // Publications
  publications: z.array(PublicationItemSchema).max(20).optional(),
  
  // Volunteer Work
  volunteer: z.array(VolunteerItemSchema).max(20).optional(),
  
  // Custom Sections
  customSections: z.array(CustomSectionSchema).max(10).optional()
}).strict(); // Reject unknown properties

// ============================================
// FORMATTING SCHEMA
// ============================================

const FormattingSchema = z.object({
  fontFamily: z.enum(['Inter', 'Roboto', 'Arial', 'Times New Roman', 'Georgia', 'Helvetica']).optional(),
  fontSize: z.number().min(8).max(18).optional(),
  lineSpacing: z.number().min(1.0).max(2.5).optional(),
  margins: z.object({
    top: z.number().min(0.25).max(2).optional(),
    right: z.number().min(0.25).max(2).optional(),
    bottom: z.number().min(0.25).max(2).optional(),
    left: z.number().min(0.25).max(2).optional()
  }).optional(),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional()
  }).optional()
}).optional();

// ============================================
// METADATA SCHEMA
// ============================================

const MetadataSchema = z.object({
  templateId: z.string().max(50).optional(),
  version: z.number().optional(),
  lastModified: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  notes: z.string().max(1000).optional()
}).optional();

// ============================================
// COMPLETE RESUME SCHEMA (for validation)
// ============================================

const CompleteResumeSchema = z.object({
  name: z.string().min(1, 'Resume name is required').max(100),
  data: ResumeDataSchema,
  formatting: FormattingSchema,
  metadata: MetadataSchema
});

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate resume data and return errors
 * @param {Object} data - Resume data to validate
 * @returns {Object} { success: boolean, errors: Array, data: Object }
 */
function validateResumeData(data) {
  try {
    const validated = ResumeDataSchema.parse(data);
    return {
      success: true,
      errors: [],
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        data: null
      };
    }
    throw error;
  }
}

/**
 * Validate complete resume (name + data + formatting + metadata)
 * @param {Object} resume - Complete resume object
 * @returns {Object} { success: boolean, errors: Array, data: Object }
 */
function validateCompleteResume(resume) {
  try {
    const validated = CompleteResumeSchema.parse(resume);
    return {
      success: true,
      errors: [],
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        data: null
      };
    }
    throw error;
  }
}

/**
 * Validate formatting object
 * @param {Object} formatting - Formatting object
 * @returns {Object} { success: boolean, errors: Array, data: Object }
 */
function validateFormatting(formatting) {
  try {
    const validated = FormattingSchema.parse(formatting);
    return {
      success: true,
      errors: [],
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        data: null
      };
    }
    throw error;
  }
}

/**
 * Sanitize and validate resume data (removes unknown fields, validates structure)
 * @param {Object} data - Resume data
 * @returns {Object} Sanitized and validated data
 */
function sanitizeResumeData(data) {
  const result = validateResumeData(data);
  if (!result.success) {
    const error = new Error('Resume data validation failed');
    error.validationErrors = result.errors;
    throw error;
  }
  return result.data;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Schemas
  ResumeDataSchema,
  FormattingSchema,
  MetadataSchema,
  CompleteResumeSchema,
  ContactInfoSchema,
  ExperienceItemSchema,
  EducationItemSchema,
  SkillsSchema,
  ProjectItemSchema,
  CertificationItemSchema,
  AwardItemSchema,
  PublicationItemSchema,
  VolunteerItemSchema,
  CustomSectionSchema,
  
  // Validation functions
  validateResumeData,
  validateCompleteResume,
  validateFormatting,
  sanitizeResumeData
};
