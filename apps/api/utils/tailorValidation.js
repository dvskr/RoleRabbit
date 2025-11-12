/**
 * Validation utilities for resume tailoring
 * 
 * Prevents wasted API calls by validating input before processing
 */

const logger = require('./logger');

/**
 * Validation error class with user-friendly messages
 */
class TailorValidationError extends Error {
  constructor(message, field, suggestedAction) {
    super(message);
    this.name = 'TailorValidationError';
    this.field = field;
    this.suggestedAction = suggestedAction;
    this.userFriendly = true;
  }
}

/**
 * Validate job description for tailoring
 */
function validateJobDescription(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new TailorValidationError(
      'Job description is required',
      'jobDescription',
      'Please paste the job description before tailoring your resume.'
    );
  }

  const trimmed = jobDescription.trim();
  
  // Minimum length check
  if (trimmed.length < 100) {
    throw new TailorValidationError(
      'Job description is too short',
      'jobDescription',
      'Please provide a more complete job description (at least 100 characters). Include job requirements, responsibilities, and qualifications for best results.'
    );
  }

  // Maximum length check (prevent excessive API costs)
  if (trimmed.length > 15000) {
    throw new TailorValidationError(
      'Job description is too long',
      'jobDescription',
      'Please shorten the job description to under 15,000 characters. Focus on the key requirements and responsibilities.'
    );
  }

  // Check for actual content (not just whitespace/formatting)
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < 20) {
    throw new TailorValidationError(
      'Job description lacks sufficient content',
      'jobDescription',
      'Please provide a more detailed job description with at least 20 words.'
    );
  }

  // Check if it looks like a real job description (has some key indicators)
  const hasKeyTerms = /(?:responsibilities|requirements|qualifications|experience|skills|about|company|role|position)/i.test(trimmed);
  if (!hasKeyTerms) {
    logger.warn('Job description validation: Missing typical job posting terms', {
      length: trimmed.length,
      wordCount,
      preview: trimmed.substring(0, 100)
    });
    // Don't throw error, just log warning - might be a valid but unusual format
  }

  return {
    valid: true,
    length: trimmed.length,
    wordCount,
    trimmed
  };
}

/**
 * Validate resume data for tailoring
 */
function validateResumeData(resumeData) {
  if (!resumeData || typeof resumeData !== 'object') {
    throw new TailorValidationError(
      'Resume data is invalid',
      'resumeData',
      'Please ensure your resume is loaded before tailoring.'
    );
  }

  const issues = [];
  const suggestions = [];

  // Check for essential sections
  if (!resumeData.summary && !resumeData.objective) {
    issues.push('Missing professional summary or objective');
    suggestions.push('Add a professional summary to improve tailoring results');
  }

  if (!resumeData.experience || !Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
    issues.push('Missing work experience');
    suggestions.push('Add your work experience for better job matching');
  }

  if (!resumeData.skills || (Array.isArray(resumeData.skills) && resumeData.skills.length === 0) || 
      (typeof resumeData.skills === 'object' && Object.keys(resumeData.skills).length === 0)) {
    issues.push('Missing skills section');
    suggestions.push('Add your skills to optimize keyword matching');
  }

  // Check for minimum content in experience
  if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    const hasDetailedExperience = resumeData.experience.some(exp => {
      const hasBullets = Array.isArray(exp.bullets) && exp.bullets.length > 0;
      const hasDescription = exp.description && exp.description.length > 50;
      return hasBullets || hasDescription;
    });

    if (!hasDetailedExperience) {
      issues.push('Experience section lacks detail');
      suggestions.push('Add bullet points or descriptions to your experience for better results');
    }
  }

  // Log quality assessment
  const qualityScore = 100 - (issues.length * 20);
  logger.info('Resume quality assessment', {
    qualityScore,
    issues: issues.length,
    sections: {
      hasSummary: !!(resumeData.summary || resumeData.objective),
      hasExperience: !!(resumeData.experience && resumeData.experience.length > 0),
      hasSkills: !!(resumeData.skills && (Array.isArray(resumeData.skills) ? resumeData.skills.length > 0 : Object.keys(resumeData.skills).length > 0)),
      hasEducation: !!(resumeData.education && resumeData.education.length > 0)
    }
  });

  // If too many critical issues, throw error
  if (issues.length >= 3) {
    throw new TailorValidationError(
      'Resume is incomplete and cannot be tailored effectively',
      'resumeData',
      `Please complete your resume first:\n${suggestions.slice(0, 3).map(s => `• ${s}`).join('\n')}`
    );
  }

  return {
    valid: true,
    qualityScore,
    issues,
    suggestions
  };
}

/**
 * Validate tailoring options
 */
function validateTailorOptions({ mode, tone, length }) {
  const validModes = ['PARTIAL', 'FULL'];
  const validTones = ['professional', 'friendly', 'bold'];
  const validLengths = ['concise', 'thorough'];

  if (mode && !validModes.includes(mode)) {
    throw new TailorValidationError(
      `Invalid tailoring mode: ${mode}`,
      'mode',
      `Please select a valid mode: ${validModes.join(', ')}`
    );
  }

  if (tone && !validTones.includes(tone)) {
    throw new TailorValidationError(
      `Invalid tone: ${tone}`,
      'tone',
      `Please select a valid tone: ${validTones.join(', ')}`
    );
  }

  if (length && !validLengths.includes(length)) {
    throw new TailorValidationError(
      `Invalid length: ${length}`,
      'length',
      `Please select a valid length: ${validLengths.join(', ')}`
    );
  }

  return { valid: true };
}

/**
 * Comprehensive validation for tailoring request
 */
function validateTailorRequest({ resumeData, jobDescription, mode, tone, length }) {
  try {
    // Validate all inputs
    const jdValidation = validateJobDescription(jobDescription);
    const resumeValidation = validateResumeData(resumeData);
    const optionsValidation = validateTailorOptions({ mode, tone, length });

    // Return validation results with suggestions
    return {
      valid: true,
      jobDescription: jdValidation,
      resume: resumeValidation,
      options: optionsValidation,
      suggestions: resumeValidation.suggestions,
      warnings: resumeValidation.issues
    };
  } catch (error) {
    if (error instanceof TailorValidationError) {
      throw error;
    }
    // Wrap unexpected errors
    throw new TailorValidationError(
      'Validation failed',
      'unknown',
      'An unexpected error occurred during validation. Please try again.'
    );
  }
}

/**
 * Estimate API cost for this tailoring request
 */
function estimateCost({ jobDescription, resumeData, mode }) {
  // Rough token estimation
  const jdTokens = Math.ceil(jobDescription.length / 4);
  const resumeTokens = Math.ceil(JSON.stringify(resumeData).length / 4);
  const inputTokens = jdTokens + resumeTokens + 500; // +500 for prompt template
  
  const outputTokens = mode === 'FULL' ? 2500 : 2000;
  const totalTokens = inputTokens + outputTokens;

  // Cost estimation (GPT-4o-mini pricing: $0.150 per 1M input, $0.600 per 1M output)
  const inputCost = (inputTokens / 1000000) * 0.150;
  const outputCost = (outputTokens / 1000000) * 0.600;
  const totalCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCost: totalCost,
    formattedCost: `$${totalCost.toFixed(4)}`
  };
}

module.exports = {
  TailorValidationError,
  validateJobDescription,
  validateResumeData,
  validateTailorOptions,
  validateTailorRequest,
  estimateCost
};

