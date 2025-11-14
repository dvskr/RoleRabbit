/**
 * Validation utilities for job tracker data
 * @module utils/jobValidation
 */

const { validateEmail, validateURL, validateTextLength, validateRequired, validateArray } = require('./validation');

// Valid enum values
const VALID_JOB_STATUSES = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];
const VALID_JOB_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const VALID_INTERVIEW_TYPES = ['phone', 'technical', 'behavioral', 'final', 'other'];
const VALID_SALARY_STATUSES = ['initial', 'countered', 'accepted', 'rejected'];
const VALID_INSIGHT_TYPES = ['culture', 'benefits', 'growth', 'reviews', 'news', 'other'];
const VALID_NOTE_CATEGORIES = ['research', 'application', 'interview', 'offer', 'other'];
const VALID_REMINDER_TYPES = ['follow-up', 'deadline', 'interview', 'application', 'other'];
const VALID_ATTACHMENT_TYPES = ['resume', 'cover_letter', 'portfolio', 'other'];

/**
 * Validate date in YYYY-MM-DD format
 * @param {string} date - Date string to validate
 * @param {string} [fieldName='Date'] - Field name for error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateDateYYYYMMDD(date, fieldName = 'Date') {
  if (!date) return { valid: true }; // Optional field

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      valid: false,
      error: `${fieldName} must be in YYYY-MM-DD format`
    };
  }

  // Validate it's a real date
  const parts = date.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (month < 1 || month > 12) {
    return {
      valid: false,
      error: `${fieldName} has invalid month (must be 01-12)`
    };
  }

  if (day < 1 || day > 31) {
    return {
      valid: false,
      error: `${fieldName} has invalid day`
    };
  }

  if (year < 1900 || year > new Date().getFullYear() + 10) {
    return {
      valid: false,
      error: `${fieldName} has invalid year`
    };
  }

  return { valid: true };
}

/**
 * Validate enum value
 * @param {string} value - Value to validate
 * @param {string[]} validValues - Array of valid enum values
 * @param {string} fieldName - Field name for error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateEnum(value, validValues, fieldName) {
  if (!value) return { valid: true }; // Optional field

  if (!validValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${validValues.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validate rating (1-5)
 * @param {number} rating - Rating to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateRating(rating) {
  if (!rating) return { valid: true }; // Optional field

  if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return {
      valid: false,
      error: 'Rating must be an integer between 1 and 5'
    };
  }

  return { valid: true };
}

/**
 * Validate contact object
 * @param {Object} contact - Contact object to validate
 * @returns {{valid: boolean, errors: Object}} Validation result with errors object
 */
function validateContact(contact) {
  const errors = {};

  if (!contact) return { valid: true, errors }; // Optional field

  if (typeof contact !== 'object') {
    errors.contact = 'Contact must be an object';
    return { valid: false, errors };
  }

  if (contact.email) {
    const emailValidation = validateEmail(contact.email);
    if (!emailValidation.valid) {
      errors['contact.email'] = emailValidation.error;
    }
  }

  if (contact.name) {
    const nameValidation = validateTextLength(contact.name, 200, 'Contact name');
    if (!nameValidation.valid) {
      errors['contact.name'] = nameValidation.error;
    }
  }

  if (contact.phone) {
    const phoneValidation = validateTextLength(contact.phone, 50, 'Contact phone');
    if (!phoneValidation.valid) {
      errors['contact.phone'] = phoneValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate job data object
 * @param {Object} data - Job data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result with errors object
 */
function validateJobData(data) {
  const errors = {};

  // Required fields
  const titleValidation = validateRequired(data.title, 'Title');
  if (!titleValidation.valid) errors.title = titleValidation.error;

  const companyValidation = validateRequired(data.company, 'Company');
  if (!companyValidation.valid) errors.company = companyValidation.error;

  const locationValidation = validateRequired(data.location, 'Location');
  if (!locationValidation.valid) errors.location = locationValidation.error;

  const appliedDateValidation = validateRequired(data.appliedDate, 'Applied date');
  if (!appliedDateValidation.valid) errors.appliedDate = appliedDateValidation.error;

  // Text length validations
  if (data.title) {
    const titleLengthValidation = validateTextLength(data.title, 200, 'Title');
    if (!titleLengthValidation.valid) errors.title = titleLengthValidation.error;
  }

  if (data.company) {
    const companyLengthValidation = validateTextLength(data.company, 200, 'Company');
    if (!companyLengthValidation.valid) errors.company = companyLengthValidation.error;
  }

  if (data.location) {
    const locationLengthValidation = validateTextLength(data.location, 200, 'Location');
    if (!locationLengthValidation.valid) errors.location = locationLengthValidation.error;
  }

  if (data.salary) {
    const salaryValidation = validateTextLength(data.salary, 100, 'Salary');
    if (!salaryValidation.valid) errors.salary = salaryValidation.error;
  }

  if (data.description) {
    const descValidation = validateTextLength(data.description, 50000, 'Description');
    if (!descValidation.valid) errors.description = descValidation.error;
  }

  if (data.notes) {
    const notesValidation = validateTextLength(data.notes, 50000, 'Notes');
    if (!notesValidation.valid) errors.notes = notesValidation.error;
  }

  if (data.nextStep) {
    const nextStepValidation = validateTextLength(data.nextStep, 500, 'Next step');
    if (!nextStepValidation.valid) errors.nextStep = nextStepValidation.error;
  }

  if (data.companySize) {
    const companySizeValidation = validateTextLength(data.companySize, 100, 'Company size');
    if (!companySizeValidation.valid) errors.companySize = companySizeValidation.error;
  }

  if (data.industry) {
    const industryValidation = validateTextLength(data.industry, 100, 'Industry');
    if (!industryValidation.valid) errors.industry = industryValidation.error;
  }

  // URL validation
  if (data.url) {
    const urlValidation = validateURL(data.url, 'Job URL');
    if (!urlValidation.valid) errors.url = urlValidation.error;
  }

  // Date validations
  if (data.appliedDate) {
    const dateValidation = validateDateYYYYMMDD(data.appliedDate, 'Applied date');
    if (!dateValidation.valid) errors.appliedDate = dateValidation.error;
  }

  if (data.nextStepDate) {
    const nextStepDateValidation = validateDateYYYYMMDD(data.nextStepDate, 'Next step date');
    if (!nextStepDateValidation.valid) errors.nextStepDate = nextStepDateValidation.error;
  }

  // Enum validations
  if (data.status) {
    const statusValidation = validateEnum(data.status, VALID_JOB_STATUSES, 'Status');
    if (!statusValidation.valid) errors.status = statusValidation.error;
  }

  if (data.priority) {
    const priorityValidation = validateEnum(data.priority, VALID_JOB_PRIORITIES, 'Priority');
    if (!priorityValidation.valid) errors.priority = priorityValidation.error;
  }

  // Array validations
  if (data.requirements !== undefined) {
    const reqValidation = validateArray(data.requirements, 'Requirements', { maxLength: 100 });
    if (!reqValidation.valid) errors.requirements = reqValidation.error;
  }

  if (data.benefits !== undefined) {
    const benefitsValidation = validateArray(data.benefits, 'Benefits', { maxLength: 100 });
    if (!benefitsValidation.valid) errors.benefits = benefitsValidation.error;
  }

  // Contact validation
  if (data.contact) {
    const contactValidation = validateContact(data.contact);
    if (!contactValidation.valid) {
      Object.assign(errors, contactValidation.errors);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate interview note data
 * @param {Object} data - Interview note data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateInterviewNoteData(data) {
  const errors = {};

  // Required fields
  const typeValidation = validateRequired(data.type, 'Type');
  if (!typeValidation.valid) errors.type = typeValidation.error;

  const dateValidation = validateRequired(data.date, 'Date');
  if (!dateValidation.valid) errors.date = dateValidation.error;

  const notesValidation = validateRequired(data.notes, 'Notes');
  if (!notesValidation.valid) errors.notes = notesValidation.error;

  // Type validation
  if (data.type) {
    const typeEnumValidation = validateEnum(data.type, VALID_INTERVIEW_TYPES, 'Type');
    if (!typeEnumValidation.valid) errors.type = typeEnumValidation.error;
  }

  // Date format validation
  if (data.date) {
    const dateFormatValidation = validateDateYYYYMMDD(data.date, 'Date');
    if (!dateFormatValidation.valid) errors.date = dateFormatValidation.error;
  }

  // Text length validations
  if (data.interviewer) {
    const interviewerValidation = validateTextLength(data.interviewer, 200, 'Interviewer');
    if (!interviewerValidation.valid) errors.interviewer = interviewerValidation.error;
  }

  if (data.notes) {
    const notesLengthValidation = validateTextLength(data.notes, 50000, 'Notes');
    if (!notesLengthValidation.valid) errors.notes = notesLengthValidation.error;
  }

  if (data.feedback) {
    const feedbackValidation = validateTextLength(data.feedback, 50000, 'Feedback');
    if (!feedbackValidation.valid) errors.feedback = feedbackValidation.error;
  }

  // Array validation
  if (data.questions !== undefined) {
    const questionsValidation = validateArray(data.questions, 'Questions', { maxLength: 100 });
    if (!questionsValidation.valid) errors.questions = questionsValidation.error;
  }

  // Rating validation
  if (data.rating !== undefined && data.rating !== null) {
    const ratingValidation = validateRating(data.rating);
    if (!ratingValidation.valid) errors.rating = ratingValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate salary offer data
 * @param {Object} data - Salary offer data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateSalaryOfferData(data) {
  const errors = {};

  // Required fields
  const amountValidation = validateRequired(data.amount, 'Amount');
  if (!amountValidation.valid) errors.amount = amountValidation.error;

  const dateValidation = validateRequired(data.date, 'Date');
  if (!dateValidation.valid) errors.date = dateValidation.error;

  // Amount validation
  if (data.amount !== undefined && data.amount !== null) {
    if (typeof data.amount !== 'number' || data.amount < 0) {
      errors.amount = 'Amount must be a positive number';
    }
  }

  // Date format validation
  if (data.date) {
    const dateFormatValidation = validateDateYYYYMMDD(data.date, 'Date');
    if (!dateFormatValidation.valid) errors.date = dateFormatValidation.error;
  }

  // Text length validations
  if (data.currency) {
    const currencyValidation = validateTextLength(data.currency, 10, 'Currency');
    if (!currencyValidation.valid) errors.currency = currencyValidation.error;
  }

  if (data.equity) {
    const equityValidation = validateTextLength(data.equity, 500, 'Equity');
    if (!equityValidation.valid) errors.equity = equityValidation.error;
  }

  if (data.notes) {
    const notesValidation = validateTextLength(data.notes, 50000, 'Notes');
    if (!notesValidation.valid) errors.notes = notesValidation.error;
  }

  // Status validation
  if (data.status) {
    const statusValidation = validateEnum(data.status, VALID_SALARY_STATUSES, 'Status');
    if (!statusValidation.valid) errors.status = statusValidation.error;
  }

  // Array validation
  if (data.benefits !== undefined) {
    const benefitsValidation = validateArray(data.benefits, 'Benefits', { maxLength: 100 });
    if (!benefitsValidation.valid) errors.benefits = benefitsValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate company insight data
 * @param {Object} data - Company insight data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateCompanyInsightData(data) {
  const errors = {};

  // Required fields
  const typeValidation = validateRequired(data.type, 'Type');
  if (!typeValidation.valid) errors.type = typeValidation.error;

  const titleValidation = validateRequired(data.title, 'Title');
  if (!titleValidation.valid) errors.title = titleValidation.error;

  const contentValidation = validateRequired(data.content, 'Content');
  if (!contentValidation.valid) errors.content = contentValidation.error;

  const dateValidation = validateRequired(data.date, 'Date');
  if (!dateValidation.valid) errors.date = dateValidation.error;

  // Type validation
  if (data.type) {
    const typeEnumValidation = validateEnum(data.type, VALID_INSIGHT_TYPES, 'Type');
    if (!typeEnumValidation.valid) errors.type = typeEnumValidation.error;
  }

  // Text length validations
  if (data.title) {
    const titleLengthValidation = validateTextLength(data.title, 200, 'Title');
    if (!titleLengthValidation.valid) errors.title = titleLengthValidation.error;
  }

  if (data.content) {
    const contentLengthValidation = validateTextLength(data.content, 50000, 'Content');
    if (!contentLengthValidation.valid) errors.content = contentLengthValidation.error;
  }

  if (data.source) {
    const sourceValidation = validateTextLength(data.source, 500, 'Source');
    if (!sourceValidation.valid) errors.source = sourceValidation.error;
  }

  // Date format validation
  if (data.date) {
    const dateFormatValidation = validateDateYYYYMMDD(data.date, 'Date');
    if (!dateFormatValidation.valid) errors.date = dateFormatValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate referral contact data
 * @param {Object} data - Referral contact data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateReferralContactData(data) {
  const errors = {};

  // Required fields
  const nameValidation = validateRequired(data.name, 'Name');
  if (!nameValidation.valid) errors.name = nameValidation.error;

  const positionValidation = validateRequired(data.position, 'Position');
  if (!positionValidation.valid) errors.position = positionValidation.error;

  const relationshipValidation = validateRequired(data.relationship, 'Relationship');
  if (!relationshipValidation.valid) errors.relationship = relationshipValidation.error;

  const dateValidation = validateRequired(data.date, 'Date');
  if (!dateValidation.valid) errors.date = dateValidation.error;

  // Text length validations
  if (data.name) {
    const nameLengthValidation = validateTextLength(data.name, 200, 'Name');
    if (!nameLengthValidation.valid) errors.name = nameLengthValidation.error;
  }

  if (data.position) {
    const positionLengthValidation = validateTextLength(data.position, 200, 'Position');
    if (!positionLengthValidation.valid) errors.position = positionLengthValidation.error;
  }

  if (data.relationship) {
    const relationshipLengthValidation = validateTextLength(data.relationship, 200, 'Relationship');
    if (!relationshipLengthValidation.valid) errors.relationship = relationshipLengthValidation.error;
  }

  if (data.notes) {
    const notesValidation = validateTextLength(data.notes, 50000, 'Notes');
    if (!notesValidation.valid) errors.notes = notesValidation.error;
  }

  // Date format validation
  if (data.date) {
    const dateFormatValidation = validateDateYYYYMMDD(data.date, 'Date');
    if (!dateFormatValidation.valid) errors.date = dateFormatValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate job note data
 * @param {Object} data - Job note data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateJobNoteData(data) {
  const errors = {};

  // Required fields
  const titleValidation = validateRequired(data.title, 'Title');
  if (!titleValidation.valid) errors.title = titleValidation.error;

  const contentValidation = validateRequired(data.content, 'Content');
  if (!contentValidation.valid) errors.content = contentValidation.error;

  const dateValidation = validateRequired(data.date, 'Date');
  if (!dateValidation.valid) errors.date = dateValidation.error;

  // Text length validations
  if (data.title) {
    const titleLengthValidation = validateTextLength(data.title, 200, 'Title');
    if (!titleLengthValidation.valid) errors.title = titleLengthValidation.error;
  }

  if (data.content) {
    const contentLengthValidation = validateTextLength(data.content, 50000, 'Content');
    if (!contentLengthValidation.valid) errors.content = contentLengthValidation.error;
  }

  // Date format validation
  if (data.date) {
    const dateFormatValidation = validateDateYYYYMMDD(data.date, 'Date');
    if (!dateFormatValidation.valid) errors.date = dateFormatValidation.error;
  }

  // Category validation
  if (data.category) {
    const categoryValidation = validateEnum(data.category, VALID_NOTE_CATEGORIES, 'Category');
    if (!categoryValidation.valid) errors.category = categoryValidation.error;
  }

  // Array validation
  if (data.tags !== undefined) {
    const tagsValidation = validateArray(data.tags, 'Tags', { maxLength: 50 });
    if (!tagsValidation.valid) errors.tags = tagsValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate job reminder data
 * @param {Object} data - Job reminder data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateJobReminderData(data) {
  const errors = {};

  // Required fields
  const titleValidation = validateRequired(data.title, 'Title');
  if (!titleValidation.valid) errors.title = titleValidation.error;

  const descriptionValidation = validateRequired(data.description, 'Description');
  if (!descriptionValidation.valid) errors.description = descriptionValidation.error;

  const dueDateValidation = validateRequired(data.dueDate, 'Due date');
  if (!dueDateValidation.valid) errors.dueDate = dueDateValidation.error;

  // Text length validations
  if (data.title) {
    const titleLengthValidation = validateTextLength(data.title, 200, 'Title');
    if (!titleLengthValidation.valid) errors.title = titleLengthValidation.error;
  }

  if (data.description) {
    const descLengthValidation = validateTextLength(data.description, 50000, 'Description');
    if (!descLengthValidation.valid) errors.description = descLengthValidation.error;
  }

  // Date format validation
  if (data.dueDate) {
    const dateFormatValidation = validateDateYYYYMMDD(data.dueDate, 'Due date');
    if (!dateFormatValidation.valid) errors.dueDate = dateFormatValidation.error;
  }

  // Priority validation
  if (data.priority) {
    const priorityValidation = validateEnum(data.priority, VALID_JOB_PRIORITIES, 'Priority');
    if (!priorityValidation.valid) errors.priority = priorityValidation.error;
  }

  // Type validation
  if (data.type) {
    const typeValidation = validateEnum(data.type, VALID_REMINDER_TYPES, 'Type');
    if (!typeValidation.valid) errors.type = typeValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate saved view data
 * @param {Object} data - Saved view data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateSavedViewData(data) {
  const errors = {};

  // Required fields
  const nameValidation = validateRequired(data.name, 'Name');
  if (!nameValidation.valid) errors.name = nameValidation.error;

  const filtersValidation = validateRequired(data.filters, 'Filters');
  if (!filtersValidation.valid) errors.filters = filtersValidation.error;

  // Text length validation
  if (data.name) {
    const nameLengthValidation = validateTextLength(data.name, 200, 'Name');
    if (!nameLengthValidation.valid) errors.name = nameLengthValidation.error;
  }

  // Filters must be an object
  if (data.filters && typeof data.filters !== 'object') {
    errors.filters = 'Filters must be an object';
  }

  // Array validation
  if (data.columns !== undefined) {
    const columnsValidation = validateArray(data.columns, 'Columns', { maxLength: 50 });
    if (!columnsValidation.valid) errors.columns = columnsValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate job attachment data
 * @param {Object} data - Job attachment data to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateJobAttachmentData(data) {
  const errors = {};

  // Required fields
  const fileIdValidation = validateRequired(data.fileId, 'File ID');
  if (!fileIdValidation.valid) errors.fileId = fileIdValidation.error;

  // Attachment type validation
  if (data.attachmentType) {
    const typeValidation = validateEnum(data.attachmentType, VALID_ATTACHMENT_TYPES, 'Attachment type');
    if (!typeValidation.valid) errors.attachmentType = typeValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateJobData,
  validateInterviewNoteData,
  validateSalaryOfferData,
  validateCompanyInsightData,
  validateReferralContactData,
  validateJobNoteData,
  validateJobReminderData,
  validateSavedViewData,
  validateJobAttachmentData,
  validateDateYYYYMMDD,
  validateEnum,
  validateRating,
  validateContact,
  // Export constants for use in route handlers
  VALID_JOB_STATUSES,
  VALID_JOB_PRIORITIES,
  VALID_INTERVIEW_TYPES,
  VALID_SALARY_STATUSES,
  VALID_INSIGHT_TYPES,
  VALID_NOTE_CATEGORIES,
  VALID_REMINDER_TYPES,
  VALID_ATTACHMENT_TYPES
};
